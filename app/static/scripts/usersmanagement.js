

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getDatabase, ref, child, onValue, get, set} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";

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
  
