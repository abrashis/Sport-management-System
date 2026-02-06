import cron from 'node-cron';
import pool from '../config/db.js';
import { sendPushNotification } from './notificationService.js';

// Run every minute
cron.schedule('* * * * *', async () => {
    try {
        // Find notifications that are due but not sent
        const [notifications] = await pool.execute(
            'SELECT * FROM notifications WHERE scheduled_for <= NOW() AND sent = 0'
        );

        for (const n of notifications) {
            // Send Push
            await sendPushNotification(n.user_id, n.title, n.message);

            // Mark as sent in DB
            await pool.execute('UPDATE notifications SET sent = 1 WHERE id = ?', [n.id]);
        }
    } catch (err) {
        console.error("Scheduler Error:", err);
    }
});

console.log("Notification Scheduler started");
