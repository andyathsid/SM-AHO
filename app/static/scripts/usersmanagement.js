

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getDatabase, ref, child, onValue, get, set} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";

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
const usersRef = ref(database, "users");


$(document).ready(function() {
    const usersTable = $('#datatable-users').DataTable();
  
    onValue(usersRef, (snapshot) => {
      usersTable.clear();
      snapshot.forEach((userSnapshot) => {
        const userId = userSnapshot.key;
        const userData = userSnapshot.val();
  
        const name = userData.name || "Data belum tersedia";
        const email = userData.email || "Data belum tersedia";
        const lastLoggedIn = userData.last_logged_in || "Data belum tersedia";
        const lastLoggedOut = userData.last_logged_out || "Data belum tersedia";
  
        usersTable.row.add([
          name,
          email,
          lastLoggedIn,
          lastLoggedOut,
          `<a href="/usersmanagement/edit/${userId}" class="btn btn-sm btn-primary">Edit</a>
            <a href="/usersmanagement/delete/${userId}" class="btn btn-sm btn-danger delete-user">Delete</a>`
        ]);
      });
      usersTable.draw();
    });

  });
  
