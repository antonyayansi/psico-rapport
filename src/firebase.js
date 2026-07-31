import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB2KfAZV_isC0sNZA94CeMkGlKWVzB3jR4",
  authDomain: "uwuia-9f371.firebaseapp.com",
  projectId: "uwuia-9f371",
  storageBucket: "uwuia-9f371.firebasestorage.app",
  messagingSenderId: "339102139400",
  appId: "1:339102139400:web:763f3ff4493fa001d4fdbd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// El módulo de messaging se inicializa de forma lazy en useFCM.js
// para evitar race conditions con isSupported() async.

export { app, auth, db, googleProvider };
