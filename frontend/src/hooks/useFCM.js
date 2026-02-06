import { useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import api from '../lib/api';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const useFCM = (userId) => {
    useEffect(() => {
        if (!userId) return;

        const setupFCM = async () => {
            try {
                const app = initializeApp(firebaseConfig);
                const messaging = getMessaging(app);

                // Request permission
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') return;

                // Get Token
                const token = await getToken(messaging, {
                    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
                });

                if (token) {
                    await api.post('/notifications/token', { token, platform: 'web' });
                }

                // Handle foreground messages
                onMessage(messaging, (payload) => {
                    console.log('Message received. ', payload);
                    const { title, body } = payload.notification;
                    alert(`${title}\n${body}`); // In a real app, use a nice toast
                });

            } catch (err) {
                console.error("FCM Setup failed:", err);
            }
        };

        setupFCM();
    }, [userId]);
};
