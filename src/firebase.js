// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA8janNIpYhug3P7Dk52foFAkJoO8MQlMo",
  authDomain: "messmate-24df3.firebaseapp.com",
  projectId: "messmate-24df3",
  storageBucket: "messmate-24df3.firebasestorage.app",
  messagingSenderId: "860359572836",
  appId: "1:860359572836:web:1de0f3173759abb7250e71",
  measurementId: "G-8VG9BFT2V6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

export { auth, db };
export default app;
