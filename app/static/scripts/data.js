import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getDatabase,
  ref,
  child,
  onValue,
  get,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";

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
const productionRef = ref(database, "mesin");

$(document).ready(function () {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "Mei",
    "Juni",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Kamis",
    "Friday",
    "Sabtu",
  ];

  onValue(productionRef, (snapshot) => {
    const data = [];
    snapshot.forEach((dateSnapshot) => {
      const date = dateSnapshot.key;
      const [day, month, year] = date.split("-");
      const monthName = monthNames[parseInt(month) - 1];
      const dateObj = new Date(`${year}-${month}-${day}`);
      const dayName = dayNames[dateObj.getDay()];
      Object.entries(dateSnapshot.val()).forEach(([shift, shiftData]) => {
        const shiftName = shift === "shift1" ? "pertama" : "kedua";
        Object.entries(shiftData).forEach(([idPerangkat, statusData]) => {
          const produksi = statusData.produksi;
          data.push([
            date,
            dayName,
            monthName,
            year,
            shiftName,
            idPerangkat,
            "Status",
            produksi,
          ]);
        });
      });
    });

    const table = $("#example").DataTable({
      data: data,
      columns: [
        { title: "Tanggal" },
        { title: "Hari", visible: false },
        { title: "Bulan", visible: false },
        { title: "Tahun", visible: false },
        { title: "Shift" },
        { title: "ID Perangkat" },
        { title: "Status" },
        { title: "Produksi" },
      ],
      layout: {
        top1: {
          searchPanes: {
            show: false,
          },
        },
      },
    });
  });
});