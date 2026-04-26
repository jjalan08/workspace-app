import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCs3IOVklCu4OzETkeLuihIY1f6BApYMOo",
  authDomain: "workspace-app-fa6fb.firebaseapp.com",
  projectId: "workspace-app-fa6fb",
  storageBucket: "workspace-app-fa6fb.firebasestorage.app",
  messagingSenderId: "1086351164327",
  appId: "1:1086351164327:web:d35ffc3032a379aed16c82"
};

const app = initializeApp(firebaseConfig);

// 👇 NEW LINE (important)
export const db = getFirestore(app);

export default app;