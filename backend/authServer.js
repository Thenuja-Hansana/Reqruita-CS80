const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

console.log("Starting Auth Server...");

require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/reqruita";
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key_here";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log(" Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error(" MongoDB Connection Error:", err.message);
    if (err.message.includes("querySrv ECONNREFUSED")) {
      console.error(
        " [Troubleshooting Tip]: This is likely a DNS issue. Try restarting your router, switching to Google DNS (8.8.8.8), or checking if your IP is whitelisted in Atlas.",
      );
    } else if (
      err.message.includes("IP not whitelisted") ||
      err.message.includes("Authentication failed")
    ) {
      console.error(
        " [Troubleshooting Tip]: Please ensure your current IP is whitelisted in MongoDB Atlas 'Network Access' tab.",
      );
    }
  });

// --- User Model ---
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    phoneNumber: { type: String, trim: true, default: "" },
    companyName: { type: String, trim: true, default: "" },
    industry: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    role: {
      type: String,
      enum: ["admin", "interviewer", "recruiter", "hr manager", "candidate"],
      required: true,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

// --- Routes ---

// 1. Registration Route - Handles creating new Admin accounts from the web dashboard signup
app.post("/api/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phoneNumber,
      companyName,
      industry,
      country,
      address,
    } = req.body;

    // Basic field validation
    if (!firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json({
          message: "First name, last name, email, and password are required.",
        });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters." });
    }

    // Check for existing account
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "An account with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber: phoneNumber || "",
      companyName: companyName || "",
      industry: industry || "",
      country: country || "",
      address: address || "",
      role: "admin",
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.status(201).json({
      message: "Account created successfully!",
      token,
      user: {
        id: newUser._id,
        fullName: `${newUser.firstName} ${newUser.lastName}`,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Login Route - Verifies credentials and provides a secure session token
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user in the database by their email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare the provided plain-text password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Create a JSON Web Token (JWT) containing the user's ID and role
    // This token is used by the frontend to prove the user is authenticated
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token)
    return res
      .status(401)
      .json({ message: "Access Denied: No Token Provided" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid Token" });
    req.user = user;
    next();
  });
};

// --- Dashboard Routes ---
const usersAndRolesRouter = require("./dashboard/usersAndRoles")(
  User,
  authenticateToken,
);
app.use("/api/dashboard/users", usersAndRolesRouter);

// 4. Get current user - Returns the authenticated user's profile
app.get("/api/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      user: {
        id: user._id,
        fullName: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        industry: user.industry,
        country: user.country,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Start Server ---
const PORT = 3003;
app.listen(PORT, () => {
  console.log(`🚀 Auth Server is running on http://localhost:${PORT}`);
});
