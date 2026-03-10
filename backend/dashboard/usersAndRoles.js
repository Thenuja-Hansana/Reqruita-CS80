const express = require('express');
const bcrypt = require('bcryptjs');

module.exports = (User, authenticateToken) => {
    const router = express.Router();

    // Get all users - Admins only
    router.get('/', authenticateToken, async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: "Access Denied: Requires Admin Role" });
            }

            // Exclude hashed password for security, but we will return visiblePassword for the dashboard as requested
            const users = await User.find({}, '-password').sort({ createdAt: -1 });
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Add New User Route - Admins only
    router.post('/add-user', authenticateToken, async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: "Access Denied: Requires Admin Role" });
            }

            const { email, password, role } = req.body;

            // Validate role
            const validRoles = ['admin', 'interviewer', 'recruiter', 'hr manager', 'candidate'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ message: "Invalid role selected" });
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "Email already registered" });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create new user, optionally capitalising the default Full Name based on role
            const fullName = role.charAt(0).toUpperCase() + role.slice(1);

            const newUser = new User({
                fullName,
                email,
                password: hashedPassword,
                visiblePassword: password, // For dashboard viewing as requested
                role
            });

            await newUser.save();
            res.status(201).json({ message: "User added successfully!", user: { id: newUser._id, email: newUser.email, role: newUser.role, visiblePassword: newUser.visiblePassword } });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};
