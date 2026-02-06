import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import { sendOTPEmail } from '../services/emailService.js';
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

        // Create user
        const [result] = await pool.execute(
            'INSERT INTO users (full_name, email, password_hash, role, verified) VALUES (?, ?, ?, "participant", 0)',
            [full_name, email, hashedPassword]
        );
        const userId = result.insertId;

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpHashed = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        await pool.execute(
            'INSERT INTO otps (user_id, otp_hash, expires_at) VALUES (?, ?, ?)',
            [userId, otpHashed, expiresAt]
        );

        // Send Email
        console.log("============================================");
        console.log(`[DEV MODE] Signup OTP for ${email}: ${otp}`);
        console.log("============================================");

        try {
            await sendOTPEmail(email, otp);
        } catch (emailErr) {
            console.error("Failed to send email:", emailErr.message);
        }

        res.status(201).json({ message: 'Signup successful, please verify your email via OTP', email });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ errors: err.errors });
        res.status(500).json({ message: err.message });
    }
};

// Request Login OTP (For participants)
export const requestLoginOTP = async (req, res) => {
    const { email } = req.body;
    if (!email.endsWith('@bicnepal.edu.np')) {
        return res.status(403).json({ message: 'Only @bicnepal.edu.np emails are allowed for participants' });
    }

    try {
        const [users] = await pool.execute('SELECT id, role FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];
        if (user.role === 'admin') return res.status(400).json({ message: 'Admins must use password login' });

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpHashed = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await pool.execute(
            'INSERT INTO otps (user_id, otp_hash, expires_at) VALUES (?, ?, ?)',
            [user.id, otpHashed, expiresAt]
        );

        console.log("============================================");
        console.log(`[DEV MODE] Login OTP for ${email}: ${otp}`);
        console.log("============================================");

        try {
            await sendOTPEmail(email, otp);
        } catch (emailErr) {
            console.error("Failed to send email:", emailErr.message);
        }
        res.json({ message: 'OTP generated. Check console for code.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const login = async (req, res) => {
    const { email, password, otp } = req.body;
    try {
        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

        const user = users[0];

        if (user.role === 'admin') {
            // Admin: Password Login
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        } else {
            // Participant: Password or OTP Login
            if (password) {
                // Password Login
                const isMatch = await bcrypt.compare(password, user.password_hash);
                if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

                if (!user.verified) {
                    return res.status(403).json({
                        message: 'Email not verified. Please verify your email via OTP.',
                        notVerified: true
                    });
                }
            } else if (otp) {
                // OTP Login
                const [otps] = await pool.execute(
                    'SELECT * FROM otps WHERE user_id = ? AND used = 0 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
                    [user.id]
                );

                if (otps.length === 0) return res.status(400).json({ message: 'Invalid or expired OTP' });

                const isMatch = await bcrypt.compare(otp, otps[0].otp_hash);
                if (!isMatch) return res.status(400).json({ message: 'Incorrect OTP' });

                // Mark OTP as used and ensure user is verified
                await pool.execute('UPDATE otps SET used = 1 WHERE id = ?', [otps[0].id]);
                if (!user.verified) await pool.execute('UPDATE users SET verified = 1 WHERE id = ?', [user.id]);
            } else {
                return res.status(400).json({ message: 'Password or OTP is required for login' });
            }
        }

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

export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const [users] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ message: 'User not found' });
        const userId = users[0].id;

        const [otps] = await pool.execute(
            'SELECT * FROM otps WHERE user_id = ? AND used = 0 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [userId]
        );

        if (otps.length === 0) return res.status(400).json({ message: 'Invalid or expired OTP' });

        const otpRecord = otps[0];

        // Check max attempts
        if (otpRecord.attempts && otpRecord.attempts >= 5) {
            return res.status(429).json({ message: 'Too many failed attempts. Please request a new OTP.' });
        }

        const isMatch = await bcrypt.compare(otp, otpRecord.otp_hash);
        if (!isMatch) {
            // Increment attempts
            await pool.execute('UPDATE otps SET attempts = attempts + 1 WHERE id = ?', [otpRecord.id]);
            const attemptsLeft = 5 - (otpRecord.attempts + 1);
            return res.status(400).json({ message: `Incorrect OTP. ${attemptsLeft} attempts remaining.` });
        }

        // Update user and OTP
        await pool.execute('UPDATE users SET verified = 1 WHERE id = ?', [userId]);
        await pool.execute('UPDATE otps SET used = 1 WHERE id = ?', [otpRecord.id]);

        res.json({ message: 'Email verified successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

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
