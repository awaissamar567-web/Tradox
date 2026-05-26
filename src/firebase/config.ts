import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if config has been set with real values
const isFirebaseConfigured = 
  !!firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'your_api_key_here' && 
  firebaseConfig.apiKey !== '""' &&
  firebaseConfig.apiKey.trim() !== '';

let app;
let auth: any = null;
let db: any = null;
let googleProvider: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    console.log("⚡ EDGELOG: Firebase successfully initialized and active.");
  } catch (error) {
    console.warn("⚠️ EDGELOG: Failed to initialize Firebase SDK, falling back to LOCAL MOCK MODE.", error);
  }
} else {
  console.log("📦 EDGELOG: Running in high-fidelity LOCAL MOCK MODE (Firebase credentials not configured).");
}

export { auth, db, googleProvider, isFirebaseConfigured };
export default app;
