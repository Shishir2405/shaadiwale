import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAzhOeItnBJalrD2gIaGHoDnxeepDuD6vQ",
  authDomain: "mgs-matrimony.firebaseapp.com",
  projectId: "mgs-matrimony",
  storageBucket: "mgs-matrimony.firebasestorage.app",
  messagingSenderId: "75088699441",
  appId: "1:75088699441:web:fc03e1e16a47e81b663510",
  measurementId: "G-RJFSS7GLTN",
};

// Initialize Firebase with error handling
let app;
let storage;
let auth;
let db;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  
  // Initialize Firebase services
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// Export initialized services
export { app, auth, db, storage };