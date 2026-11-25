import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// NOTA PARA INDECOPI: valores de configuración omitidos en el depósito
// (credenciales de servicio). El código de inicialización es el original.
const firebaseConfig = {
  apiKey: "[OMITIDO_EN_DEPOSITO]",
  authDomain: "[OMITIDO_EN_DEPOSITO]",
  projectId: "[OMITIDO_EN_DEPOSITO]",
  storageBucket: "[OMITIDO_EN_DEPOSITO]",
  messagingSenderId: "[OMITIDO_EN_DEPOSITO]",
  appId: "[OMITIDO_EN_DEPOSITO]"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
