import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getDatabase, ref, child, onValue, get, set} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "{{FIREBASE_API_KEY}}",
  authDomain: "{{FIREBASE_AUTH_DOMAIN}}",
  databaseURL: "{{FIREBASE_DATABASE_URL}}",
  projectId: "{{FIREBASE_PROJECT_ID}}",
  storageBucket: "{{FIREBASE_STORAGE_BUCKET}}",
  messagingSenderId: "{{FIREBASE_MESSAGING_SENDER_ID}}",
  appId: "{{FIREBASE_APP_ID}}",
  measurementId: "{{FIREBASE_MEASUREMENT_ID}}"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const productionRef = ref(database, "mesin");

$(document).ready(function() {

    const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    const dayNames = [
        "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu",
    ];


  let currentChart;
  let currentAreaChart;

  let table;

  let rowId;
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1; 
  const year = now.getFullYear();
  // let targetDate = `${day}-${month}-${year}`;
  let targetDate = "12-9-2024";
  const targetDateObj = new Date(targetDate);

  onValue(productionRef, (snapshot) => {
    const data = [];
    let totalAktif = 0;
    let totalProduksi = 0;
    const shiftProduksiCounts = {
        shift1: 0,
        shift2: 0
    };

    snapshot.forEach((dateSnapshot) => {
        const date = dateSnapshot.key;
        const [day, month, year] = date.split("-");
        const dateStr = `${day}-${month}-${year}`;
        const dateObj = new Date(dateStr);

        if (dateObj.getTime() === targetDateObj.getTime()) {
            const monthName = monthNames[parseInt(month) - 1];
            const dayName = dayNames[dateObj.getDay()];

            Object.entries(dateSnapshot.val()).forEach(([shift, shiftData]) => {
                const shiftName = shift === "shift1" ? "pertama" : "kedua";
                Object.entries(shiftData).forEach(([idPerangkat, statusData]) => {
                    const produksi = statusData.produksi;
                    let status = statusData.status;
                    if (status == null || status === undefined) {
                        status = "aktif"; 
                        const idPerangkatRef = child(productionRef, `${date}/${shift}/${idPerangkat}`);
                        set(child(idPerangkatRef, "status"), "aktif");
                    }
                    if (status === "aktif") {
                        totalAktif++;
                    }
                    shiftProduksiCounts[shift] += produksi;
                    totalProduksi += produksi;
                    const rowId = `${date}|${shift}|${idPerangkat}`;
                    data.push([
                        date, dayName, monthName, year, shiftName, idPerangkat, status, produksi, rowId,
                    ]);
                });
            });
        }
    });

    document.getElementById("total-aktif").textContent = `Total Mesin yang Aktif Hari Ini: ${totalAktif}`;
    document.getElementById("total-produksi").textContent = `Total Produksi Hari Ini: ${totalProduksi}`;
    document.getElementById("produksi-shift1").textContent = `Total Produksi Shift 1: ${shiftProduksiCounts.shift1}`;
    document.getElementById("produksi-shift2").textContent = `Total Produksi Shift 2: ${shiftProduksiCounts.shift2}`;

    if (!table) {
      table = $("#datatable-daily").DataTable({
        processing: true,
        data: data,
        columns: [
          { title: "Tanggal" },
          { title: "Hari" },
          { title: "Bulan" },
          { title: "Tahun" },
          { title: "Shift" },
          { title: "ID Perangkat" },
          {
            title: "Status",
            render: function (data, type, row) {
              return (
                data + '    <span class="dropdown"><i class="bi bi-chevron-down"></i></span>' 
              );
            },
          },
          { title: "Produksi" },
          { title: "ID Baris" },
        ],
        columnDefs: [
          { targets: [1, 2, 3, 8], visible: false },
        ],
        layout: {
          topStart: {
            buttons:  ['excel', 'pdf', 'print']
        },
          top1: {
            searchPanes: { initCollapsed: true },
          },
        },
        createdRow: function (row, data, dataIndex) {
          $(row).attr("id", data[8]);
        },
      });
    } else {
      table.clear();
      table.rows.add(data).draw();
    }

    table.MakeCellsEditable({
      "onUpdate": myCallbackFunction,
      "inputCss":'my-input-class',
      "columns": [6],
      "confirmationButton": { 
        "confirmCss": 'my-confirm-class',
        "cancelCss": 'my-cancel-class'
      },
      "inputTypes":[{
        "column":6,
        "type":"list",
        "options":[
          { "value": "aktif", "display": "  aktif" },
          { "value": "tidak aktif", "display": "tidak aktif" }
      ]
      }]
    });

});


function myCallbackFunction(updatedCell, updatedRow, oldValue, attempt = 1) {
  let selectedValue = updatedCell.data();

  
  if (selectedValue === oldValue) {
   
    selectedValue = oldValue === "aktif" ? "Tidak aktif" : "Aktif";
    updatedCell.data(selectedValue);
    
    if (attempt < 3) {
      myCallbackFunction(updatedCell, updatedRow, oldValue, attempt + 1);
      return;
    }
  }

  const [date, shift, idPerangkat] = updatedRow.data()[8].split('|');
  const statusRef = ref(database, `mesin/${date}/${shift}/${idPerangkat}/status`);
  set(statusRef, selectedValue)
}
});
