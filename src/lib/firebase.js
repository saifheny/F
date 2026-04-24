import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const _SH = "Saif.Hany" + "::AURA";

const firebaseConfig = {
  apiKey: "AIzaSyAjE-2q6PONBkCin9ZN22gDp9Q8pAH9ZW8",
  authDomain: "story-97cf7.firebaseapp.com",
  databaseURL: "https://story-97cf7-default-rtdb.firebaseio.com",
  projectId: "story-97cf7",
  storageBucket: "story-97cf7.firebasestorage.app",
  messagingSenderId: "742801388214",
  appId: "1:742801388214:web:32a305a8057b0582c5ec17",
  measurementId: "G-9DPPWX7CF0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
export const __signature = _SH;
export default app;
