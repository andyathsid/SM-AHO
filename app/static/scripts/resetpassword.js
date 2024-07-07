

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getDatabase, ref, child, onValue, get, set} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
const firebaseConfig = {
    apiKey: "AIzaSyC2rjPGKsN8E7npywIvGbhOOb5YWhVaQgc",
    authDomain: "sm-aho.firebaseapp.com",
    databaseURL: "https://sm-aho-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "sm-aho",
    storageBucket: "sm-aho.appspot.com",
    messagingSenderId: "514581075925",
    appId: "1:514581075925:web:1400bb0d1eede78e21cf5c",
    measurementId: "G-KVLPB26502"
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