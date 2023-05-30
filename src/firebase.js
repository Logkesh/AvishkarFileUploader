import { initializeApp } from "firebase/app";

import {getStorage} from "firebase/storage";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD7UXEkjeWXVo2bg7dCNGZb3aXi-VqllKA",
  authDomain: "uploadingfiles-e8832.firebaseapp.com",
  projectId: "uploadingfiles-e8832",
  storageBucket: "uploadingfiles-e8832.appspot.com",
  messagingSenderId: "262921480254",
  appId: "1:262921480254:web:887e9f7bd7acec9a23c96f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage=getStorage(app)