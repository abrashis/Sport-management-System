import admin from 'firebase-admin';
import pool from '../config/db.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Initialize Firebase Admin (Only if service account exists)
try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (serviceAccountPath) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccountPath)
        });
        console.log("Firebase Admin initialized");
    }
} catch (error) {
    console.error("Firebase Admin initialization failed:", error.message);
}

export const createMatchNotifications = async (matchId, userIds, matchDatetime) => {
    try {
        const matchTime = new Date(matchDatetime);
        const reminderTime = new Date(matchTime.getTime() - 24 * 60 * 60 * 1000); // 1 day before

        for (const userId of userIds) {
            // 1. Immediate Notification (Scheduled for now)
            await pool.execute(
                'INSERT INTO notifications (user_id, title, message, match_id, scheduled_for, sent) VALUES (?, ?, ?, ?, NOW(), 0)',
                [userId, 'Match Scheduled', `Your match is scheduled for ${matchTime.toLocaleString()}`, matchId]
            );

            // 2. Reminder Notification (Scheduled for 24h before)
            await pool.execute(
                'INSERT INTO notifications (user_id, title, message, match_id, scheduled_for, sent) VALUES (?, ?, ?, ?, ?, 0)',
                [userId, 'Match Reminder', `Your match starts in 24 hours at ${matchTime.toLocaleString()}`, matchId, reminderTime]
            );
        }
    } catch (err) {
        console.error("Error creating notifications:", err);
    }
};

export const sendPushNotification = async (userId, title, body) => {
    try {
        // Get user's FCM tokens
        const [tokens] = await pool.execute('SELECT token FROM fcm_tokens WHERE user_id = ?', [userId]);

        if (tokens.length === 0) return;

        const tokenList = tokens.map(t => t.token);

        const message = {
            notification: { title, body },
            tokens: tokenList
        };

        const response = await admin.messaging().sendEachForMulticast(message);

        // Handle failed tokens (cleanup)
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(tokenList[idx]);
                }
            });
            if (failedTokens.length > 0) {
                // Remove expired tokens
                await pool.execute(`DELETE FROM fcm_tokens WHERE token IN (${failedTokens.map(() => '?').join(',')})`, failedTokens);
            }
        }
    } catch (err) {
        console.error("FCM Push Error:", err);
    }
};
