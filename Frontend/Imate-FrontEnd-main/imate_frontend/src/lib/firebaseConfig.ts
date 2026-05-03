import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
// ...existing code...

const firebaseConfig = {
    // Thông tin cấu hình bạn đã cung cấp
  apiKey: "AIzaSyA6CoZ-u2ucQXknbS5ToQ-X0O6-Tn8-_2Y",
  authDomain: "imate-80f8e.firebaseapp.com",
  projectId: "imate-80f8e",
  storageBucket: "imate-80f8e.firebasestorage.app",
  messagingSenderId: "1034424827677",
  appId: "1:1034424827677:web:907b83d4ad52fd12e3ebf4",
  measurementId: "G-FJZ5D060HF"
};

const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);

const auth: Auth = getAuth(firebaseApp);
export { auth, firebaseApp };
