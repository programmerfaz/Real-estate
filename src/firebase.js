// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // <-- add this
import { getFirestore } from "firebase/firestore"; // <-- add this
import { getStorage } from "firebase/storage"; // <-- add this
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC77E43xdQ8VJhtMhb1ZEgEi3Y9i-qEPTQ",
  authDomain: "real-estate-3e8d7.firebaseapp.com",
  projectId: "real-estate-3e8d7",
  storageBucket: "real-estate-3e8d7.appspot.com",  // fix this line (remove extra .firebasestorage.app)
  messagingSenderId: "529792709805",
  appId: "1:529792709805:web:ed69ece5ecfc27960ac224",
  measurementId: "G-C271FQHGMS"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
