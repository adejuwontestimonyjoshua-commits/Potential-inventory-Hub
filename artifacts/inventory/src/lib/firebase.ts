import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDEElYSGtnrpkVhuH1MS1M5dNa-FT-TlKQ",
  authDomain: "potential-hub-inventory.firebaseapp.com",
  projectId: "potential-hub-inventory",
  storageBucket: "potential-hub-inventory.firebasestorage.app",
  messagingSenderId: "187477771116",
  appId: "1:187477771116:web:72b33a94e0388d9e2c6949",
  measurementId: "G-H81KSBQ7FW"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
