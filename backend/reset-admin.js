import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const createAdmin = async () => {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'sports_management_system'
        });

        const adminEmail = 'admin@sports.local';
        const rawPassword = 'Admin@12345';

        console.log(`Hashing password for ${adminEmail}...`);
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // Check if admin exists
        const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [adminEmail]);

        if (rows.length > 0) {
            console.log('Admin user exists. Updating password...');
            await connection.execute(
                'UPDATE users SET password_hash = ?, role = "admin", verified = 1 WHERE email = ?',
                [hashedPassword, adminEmail]
            );
        } else {
            console.log('Creating new admin user...');
            await connection.execute(
                'INSERT INTO users (full_name, email, password_hash, role, verified) VALUES (?, ?, ?, ?, ?)',
                ['System Admin', adminEmail, hashedPassword, 'admin', 1]
            );
        }

        console.log('Admin user setup complete!');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${rawPassword}`);

    } catch (error) {
        console.error('Failed to setup admin user:', error);
    } finally {
        if (connection) await connection.end();
    }
};

createAdmin();
