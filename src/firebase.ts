import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDEElYSGtnrpkVhuH1MS1M5dNa-FT-TlKQ",
  authDomain: "potential-hub-inventory.firebaseapp.com",
  projectId: "potential-hub-inventory",
  storageBucket: "potential-hub-inventory.firebasestorage.app",
  messagingSenderId: "187477771116",
  appId: "1:187477771116:web:72b33a94e0388d9e2c6949",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export default app;
