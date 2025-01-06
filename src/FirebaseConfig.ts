// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc, getDoc, updateDoc, deleteDoc, doc, query, where, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB__bfwpbOV11SaL4ehzYrgHWg9SVTSRMw",
  authDomain: "dee-leifer-kiosk-w6x7us.firebaseapp.com",
  projectId: "dee-leifer-kiosk-w6x7us",
  storageBucket: "dee-leifer-kiosk-w6x7us.firebasestorage.app",
    messagingSenderId: "565275860350",
  appId: "1:565275860350:web:54ecc558aa062364f6a72f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Authentication
const db = getFirestore(app); // Firestore Database
const storage = getStorage(app); // Storage

export { auth, db, storage, signInWithEmailAndPassword, createUserWithEmailAndPassword, collection, addDoc, getDoc, updateDoc, deleteDoc, doc, query, where, getDocs, ref, uploadBytes, getDownloadURL };
