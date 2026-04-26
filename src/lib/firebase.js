import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCs3IOVklCu4OzETkeLuihIY1f6BApYMOo",
  authDomain: "workspace-app-fa6fb.firebaseapp.com",
  projectId: "workspace-app-fa6fb",
  storageBucket: "workspace-app-fa6fb.firebasestorage.app",
  messagingSenderId: "1086351164327",
  appId: "1:1086351164327:web:d35ffc3032a379aed16c82"
};

// 🔥 prevent re-initialization crash (VERY IMPORTANT for Vercel)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// ✅ EXPORT BOTH
export const db = getFirestore(app);
export const auth = getAuth(app);