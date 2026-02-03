import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDQLVY1QveZvLrrfNpsReRrgK1biNLo1-k",
    authDomain: "primal-note.firebaseapp.com",
    projectId: "primal-note",
    storageBucket: "primal-note.firebasestorage.app",
    messagingSenderId: "599122374884",
    appId: "1:599122374884:web:2edb5c0004675def947cf1",
    measurementId: "G-RBKECV8M0N"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
