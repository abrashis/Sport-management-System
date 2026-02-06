import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Auto-migration for attempts column
(async () => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query("SHOW COLUMNS FROM otps LIKE 'attempts'");
        if (rows.length === 0) {
            await connection.query("ALTER TABLE otps ADD COLUMN attempts INT DEFAULT 0");
            console.log("Migration: Added 'attempts' column to otps table");
        }
        connection.release();
    } catch (err) {
        // Ignore if valid connection issues for now, main app will log it
    }
})();

export default pool;
