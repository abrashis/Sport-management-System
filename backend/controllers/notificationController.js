import pool from '../config/db.js';

export const getNotifications = async (req, res) => {
    const userId = req.session.userId;
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM notifications WHERE user_id = ? AND sent = 1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const saveToken = async (req, res) => {
    const userId = req.session.userId;
    const { token, platform } = req.body;
    try {
        await pool.execute(
            'INSERT INTO fcm_tokens (user_id, token, platform) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE last_seen_at = CURRENT_TIMESTAMP',
            [userId, token, platform || 'web']
        );
        res.json({ message: 'Token saved' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
