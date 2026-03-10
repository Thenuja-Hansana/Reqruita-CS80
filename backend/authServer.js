const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

console.log("Starting Auth Server...");

require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect(MONGO_URI)
    .then(() => console.log(" Connected to MongoDB Atlas"))
    .catch(err => console.error(" MongoDB Connection Error:", err));

// --- User Model ---
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    visiblePassword: { type: String }, // Stored purely for admin dashboard visibility at creation
    role: { type: String, enum: ['admin', 'interviewer', 'recruiter', 'hr manager', 'candidate'], required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// --- Routes ---

// 1. Registration Route - Handles creating new Admin/Interviewer accounts
app.post('/api/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        const role = 'admin'; // Enforce admin-only registration from the landing page

        // check if a user with this email already exists in MongoDB
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // Encrypt the password using bcrypt for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user object with the hashed password
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            role
        });

        // Save the user to the MongoDB collection
        await newUser.save();

        // Create a JWT Token to auto-login the new user
        const token = jwt.sign(
            { id: newUser._id, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: "Account created successfully!",
            token,
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                role: newUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Login Route - Verifies credentials and provides a secure session token
app.post('/api/login', async (req, res) => {
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
        const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send the token and user details back to the landing page
        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid Token' });
        req.user = user;
        next();
    });
};

// --- Dashboard Routes ---
const usersAndRolesRouter = require('./dashboard/usersAndRoles')(User, authenticateToken);
app.use('/api/dashboard/users', usersAndRolesRouter);

// --- Start Server ---
const PORT = 3003;
app.listen(PORT, () => {
    console.log(`🚀 Auth Server is running on http://localhost:${PORT}`);
});
