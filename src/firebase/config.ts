import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBHU9h7coY5ngxokaKscg_apXvWUzQ-AzQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "site-igreja-bbf0f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "site-igreja-bbf0f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "site-igreja-bbf0f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "992289208519",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:992289208519:web:8b9a0a55aaa9f62aeda6e2"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
