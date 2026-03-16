import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, doc, setDoc, deleteDoc, query, orderBy, where } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyAq7h6YaMNJSOVuTBm4XVf7C2PLaChXhE0",
    authDomain: "projectbloom-fd117.firebaseapp.com",
    projectId: "projectbloom-fd117",
    storageBucket: "projectbloom-fd117.firebasestorage.app",
    messagingSenderId: "418754952506",
    appId: "1:418754952506:web:87a4585b9118ae12a86403",
    measurementId: "G-KSLXP14P88"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

export { auth, db, storage, provider, signInWithPopup, signOut, onAuthStateChanged, collection, addDoc, getDocs, onSnapshot, doc, setDoc, deleteDoc, query, orderBy, where, ref, uploadBytesResumable, getDownloadURL };
