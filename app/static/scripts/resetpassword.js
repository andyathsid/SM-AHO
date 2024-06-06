

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getDatabase, ref, child, onValue, get, set} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
const firebaseConfig = {
  apiKey: "AIzaSyDBX7zLkMwAfYtrr0AomEJqjdn8Ol1BAWs",
  authDomain: "sm-aho-f408a.firebaseapp.com",
  databaseURL: "https://sm-aho-f408a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sm-aho-f408a",
  storageBucket: "sm-aho-f408a.appspot.com",
  messagingSenderId: "41013147936",
  appId: "1:41013147936:web:418cbfe1395b9aa4a77f45",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const productionRef = ref(database, "mesin");
const dbref = ref(database, "users")

$(document).ready(function() {
    let ForgotPassword = ()=> {
        sendPasswordResetEmail(auth, EmailInpt.value)
        .then(()=>{
            alert("Link reset password telah dikirim ke email Anda.");
        })
    }

    ForgotPasswordLabel.addEventListener('click', ForgotPassword);
});