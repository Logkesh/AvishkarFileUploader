// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBi_vjZ215vwlstlBnopaJ6ZLzK3q6yby4",
  authDomain: "fileuploader-2e1f4.firebaseapp.com",
  projectId: "fileuploader-2e1f4",
  storageBucket: "fileuploader-2e1f4.appspot.com",
  messagingSenderId: "547093440433",
  appId: "1:547093440433:web:a8adbad44aeb082943bf90",
  measurementId: "G-GSH1J5NBYJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export {storage}