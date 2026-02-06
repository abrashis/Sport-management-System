import bcrypt from 'bcrypt';
import pool from '../config/db.js';
// import { sendOTPEmail } from '../services/emailService.js'; // Unused
import { z } from 'zod';

const signupSchema = z.object({
    full_name: z.string().min(2),
    email: z.string().email().refine(email => email.endsWith('@bicnepal.edu.np'), {
        message: "Only @bicnepal.edu.np emails are allowed"
    }),
    password: z.string().min(6),
    confirm_password: z.string()
}).refine(data => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"]
});

export const signup = async (req, res) => {
    try {
        const validated = signupSchema.parse(req.body);
        const { full_name, email, password } = validated;

        // Check if user exists
        const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ message: 'Email already registered' });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user (verified = 1 since we trust the domain check)
        const [result] = await pool.execute(
            'INSERT INTO users (full_name, email, password_hash, role, verified) VALUES (?, ?, ?, "participant", 1)',
            [full_name, email, hashedPassword]
        );
        const userId = result.insertId;

        // Send Email (Welcome email optional, removed OTP)
        console.log("============================================");
        console.log(`[DEV MODE] User Signup: ${email}`);
        console.log("============================================");

        res.status(201).json({ message: 'Signup successful, please login', email });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ errors: err.errors });
        res.status(500).json({ message: err.message });
    }
};

// OTP functions removed as per requirement

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

        const user = users[0];

        // Password Login
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Set session
        req.session.userId = user.id;
        req.session.role = user.role;

        res.json({
            user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* 
// Removed OTP verification functions
export const verifyOTP = async (req, res) => { ... }
export const requestLoginOTP = async (req, res) => { ... }
*/

export const logout = (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ message: 'Could not log out' });
        res.clearCookie('sports_sid');
        res.json({ message: 'Logged out' });
    });
};

export const getMe = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: 'Not authenticated' });
    try {
        const [users] = await pool.execute('SELECT id, full_name, email, role FROM users WHERE id = ?', [req.session.userId]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ user: users[0] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
