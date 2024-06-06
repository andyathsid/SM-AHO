

// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
// import { getDatabase, ref, child, onValue, get, set} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";

// const firebaseConfig = {
//   apiKey: "AIzaSyDBX7zLkMwAfYtrr0AomEJqjdn8Ol1BAWs",
//   authDomain: "sm-aho-f408a.firebaseapp.com",
//   databaseURL: "https://sm-aho-f408a-default-rtdb.asia-southeast1.firebasedatabase.app",
//   projectId: "sm-aho-f408a",
//   storageBucket: "sm-aho-f408a.appspot.com",
//   messagingSenderId: "41013147936",
//   appId: "1:41013147936:web:418cbfe1395b9aa4a77f45",
// };

// const app = initializeApp(firebaseConfig);
// const database = getDatabase(app);
// const productionRef = ref(database, "mesin");



// $(document).ready(function() {

//   const monthNames = [
//     "Januari", "Februari", "Maret", "April", "Mei", "Juni",
//     "Juli", "Agustus", "September", "Oktober", "November", "Desember",
// ];
// const dayNames = [
//     "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu",
// ];


//   let currentChart;
//   let currentAreaChart;

//   let table;

//   let rowId;
//   const now = new Date();
//   const day = now.getDate();
//   const month = now.getMonth() + 1; 
//   const year = now.getFullYear();
//   let targetDate = `${day}-${month}-${year}`;

//   onValue(child(productionRef, targetDate), (snapshot) => {
//     if (snapshot.exists()) {
//       let totalAktif = 0;
//       let totalProduksi = 0;
//       const shiftProduksiCounts = {
//         shift1: 0,
//         shift2: 0
//       };

//       snapshot.forEach((shiftSnapshot) => {
//         shiftSnapshot.forEach((deviceSnapshot) => {
//           const status = deviceSnapshot.val().status;
//           const produksi = deviceSnapshot.val().produksi;
//           if (status === "aktif") {
//             totalAktif++;
//           }
//           if (shiftSnapshot.key === "shift1") {
//             shiftProduksiCounts.shift1 += produksi;
//           } else if (shiftSnapshot.key === "shift2") {
//             shiftProduksiCounts.shift2 += produksi;
//           }
//           totalProduksi += produksi;
//         });
//       });

//       document.getElementById("total-aktif").innerHTML = `Total Mesin yang Aktif Hari Ini: ${totalAktif}`;
//       document.getElementById("total-produksi").textContent = `Total Produksi Hari Ini: ${totalProduksi}`;
//       document.getElementById("produksi-shift1").textContent = `Produksi Shift Pertama: ${shiftProduksiCounts.shift1}`;
//       document.getElementById("produksi-shift2").textContent = `Produksi Shift Kedua: ${shiftProduksiCounts.shift2}`;
//     } else {
//       document.getElementById("total-aktif").innerHTML = "Data Belum Tersedia.";
//       document.getElementById("total-produksi").innerHTML = "Data Belum Tersedia.";
//       document.getElementById("produksi-shift1").innerHTML = "Data Belum Tersedia.";
//       document.getElementById("produksi-shift2").innerHTML = "Data Belum Tersedia.";
//     }
//   });


//   onValue(productionRef, (snapshot) => {
//     const data = [];
//     let totalAktif = 0;
//     let totalProduksi = 0;
//     const shiftProduksiCounts = {
//       shift1: 0,
//       shift2: 0
//     };
//     snapshot.forEach((dateSnapshot) => {
//       const date = dateSnapshot.key;
//       const [day, month, year] = date.split("-");
//       const monthName = monthNames[parseInt(month) - 1];
//       const dateObj = new Date(`${year}-${month}-${day}`);
//       const dayName = dayNames[dateObj.getDay()];
//       Object.entries(dateSnapshot.val()).forEach(([shift, shiftData]) => {
//         const shiftName = shift === "shift1" ? "pertama" : "kedua";
//         Object.entries(shiftData).forEach(([idPerangkat, statusData]) => {
//           const produksi = statusData.produksi;
//           let status = statusData.status;
//           if (status == null || status === undefined) {
//             status = "aktif"; 
//             const idPerangkatRef = child(productionRef, `${date}/${shift}/${idPerangkat}`);
//             set(child(idPerangkatRef, "status"), "aktif");
//           }
//           if (status === "aktif") {
//             totalAktif++;
//           }
//           shiftProduksiCounts[shift] += produksi;
//           totalProduksi += produksi;
//           rowId = `${date}|${shift}|${idPerangkat}`;
//           data.push([
//             date, dayName, monthName, year, shiftName, idPerangkat, status, produksi, rowId,
//           ]);
//         });
//       });
//     });

//     if (!table) {
//       table = $("#datatable").DataTable({
//         processing: true,
//         data: data,
//         columns: [
//           { title: "Tanggal" },
//           { title: "Hari" },
//           { title: "Bulan" },
//           { title: "Tahun" },
//           { title: "Shift" },
//           { title: "ID Perangkat" },
//           {
//             title: "Status",
//             render: function (data, type, row) {
//               return (
//                 data + '    <span class="dropdown"><i class="bi bi-chevron-down"></i></span>' 
//               );
//             },
//           },
//           { title: "Produksi" },
//           { title: "ID Baris" },
//         ],
//         columnDefs: [
//           { targets: [1, 2, 3, 8], visible: false },
//         ],

//         layout: {
//           topStart: {
//             buttons:  ['excel', 'pdf', 'print']
//         },
//           top1: {
//             searchPanes: { initCollapsed: true },
//           },
//         },
//         createdRow: function (row, data, dataIndex) {
//           $(row).attr("id", data[8]);
//         },
//       });
//     } else {
//       table.clear();
//       table.rows.add(data).draw();
//     }

//     table.MakeCellsEditable({
//       "onUpdate": myCallbackFunction,
//       "inputCss":'my-input-class',
//       "columns": [6],
//       "confirmationButton": { 
//         "confirmCss": 'my-confirm-class',
//         "cancelCss": 'my-cancel-class'
//       },
//       "inputTypes":[{
//         "column":6,
//         "type":"list",
//         "options":[
//           { "value": "aktif", "display": "  aktif" },
//           { "value": "tidak aktif", "display": "tidak aktif" }
//       ]
//       }]
//     });

//     updateCharts(table);
// });


// function myCallbackFunction(updatedCell, updatedRow, oldValue, attempt = 1) {
//   let selectedValue = updatedCell.data();

  
//   if (selectedValue === oldValue) {
   
//     selectedValue = oldValue === "aktif" ? "Tidak aktif" : "Aktif";
//     updatedCell.data(selectedValue);
    
//     if (attempt < 3) {
//       myCallbackFunction(updatedCell, updatedRow, oldValue, attempt + 1);
//       return;
//     }
//   }

//   const [date, shift, idPerangkat] = updatedRow.data()[8].split('|');
//   const statusRef = ref(database, `mesin/${date}/${shift}/${idPerangkat}/status`);
//   set(statusRef, selectedValue)
// }

//   function updateCharts(table) {
//     const yearlyProduction = getYearlyProduction(table);
//     const monthlyProductionData = getMonthlyProductionForYear(table);
//     const weeklyProductionData = getWeeklyProductionForMonthYear(table);
//     const dailyProductionData = getDailyProductionForMonthYear(table);

//     updateChart('bar-yearly', yearlyProduction);
//     updateAreaChart('area-yearly', yearlyProduction);

//     $('#bar-report-select').off('change').on('change', function() {
//       const selectedOption = $(this).val();
//       updateChart(selectedOption, yearlyProduction, monthlyProductionData, weeklyProductionData, dailyProductionData);
//     });

//     $('#area-report-select').off('change').on('change', function() {
//       const selectedOption = $(this).val();
//       updateAreaChart(selectedOption, yearlyProduction, monthlyProductionData, weeklyProductionData, dailyProductionData);
//     });
//   }

//   function initStatus(productionRef, monthNames, dayNames) {
//     get(productionRef).then((snapshot) => {
//       if (snapshot.exists()) {
//         snapshot.forEach((dateSnapshot) => {
//           const date = dateSnapshot.key;
//           const [day, month, year] = date.split("-");
//           const monthName = monthNames[parseInt(month) - 1];
//           const dateObj = new Date(`${year}-${month}-${day}`);
//           const dayName = dayNames[dateObj.getDay()];
//           Object.entries(dateSnapshot.val()).forEach(([shift, shiftData]) => {
//             const shiftName = shift === "shift1" ? "pertama" : "kedua";
//             Object.entries(shiftData).forEach(([idPerangkat, statusData]) => {
//               const idPerangkatRef = child(productionRef, `${date}/${shift}/${idPerangkat}`);
//               get(child(idPerangkatRef, "status")).then((statusSnapshot) => {
//                 if (!statusSnapshot.exists()) {
//                   set(child(idPerangkatRef, "status"), "aktif");
//                 }
//               });
//             });
//           });
//         });
//       } else {
//         console.log("No data available");
//       }
//     }).catch((error) => {
//       console.error(error);
//     });
//   }
  

//   function updateChart(option, yearlyData, monthlyData, weeklyData, dailyData) {
//     if (currentChart) {
//       currentChart.destroy(); 
//     }

//     let chartData, chartTitle;

//     switch (option) {
//       case 'bar-yearly':
//         chartData = Object.entries(yearlyData).map(([year, production]) => ({
//           name: year,
//           y: production,
//         }));
//         chartTitle = 'Yearly Production Report';
//         break;
//       case 'bar-monthly':
//         chartData = Object.entries(monthlyData).flatMap(([year, monthData]) =>
//           Object.entries(monthData).map(([month, production]) => ({
//             name: `${month} ${year}`,
//             y: production,
//           }))
//         );
//         chartTitle = 'Monthly Production Report';
//         break;
//         case 'bar-weekly':
//           chartData = Object.entries(weeklyData).flatMap(([year, yearData]) =>
//             Object.entries(yearData).flatMap(([month, monthData]) =>
//               Object.entries(monthData).map(([week, production]) => ({
//                 name: `${week} ${month} ${year}`,
//                 y: production,
//               }))
//             )
//           );
//           chartTitle = 'Weekly Production Report';
//           break;
//       case 'bar-daily':
//         chartData = Object.entries(dailyData).flatMap(([year, yearData]) =>
//           Object.entries(yearData).flatMap(([month, monthData]) =>
//             Object.entries(monthData).map(([day, production]) => ({
//               name: `${day} ${month} ${year}`,
//               y: production,
//             }))
//           )
//         );
//         chartTitle = 'Daily Production Report';
//         break;
//       default:
//         return;
//     }

//     currentChart = Highcharts.chart('bar-chart', {
//       chart: {
//         type: 'column',
//         backgroundColor: 'transparent',
//       },
//       title: {
//         text: chartTitle,
//       },
//       xAxis: {
//         type: 'category',
//       },
//       yAxis: {
//         title: {
//           text: 'Production',
//         },
//       },
//       series: [
//         {
//           name: 'Production',
//           data: chartData,
//         },
//       ],
//     });
//   }

//   function updateAreaChart(option, yearlyData, monthlyData, weeklyData, dailyData) {
//     if (currentAreaChart) {
//       currentAreaChart.destroy();
//     }
  
//     let chartData, chartTitle;
  
//     switch (option) {
//       case 'area-yearly':
//         chartData = Object.entries(yearlyData).map(([year, production]) => ({
//           name: year,
//           y: production,
//         }));
//         chartTitle = 'Yearly Production Report (Area Chart)';
//         break;
//       case 'area-monthly':
//         chartData = Object.entries(monthlyData).flatMap(([year, monthData]) =>
//           Object.entries(monthData).map(([month, production]) => ({
//             name: `${month} ${year}`,
//             y: production,
//           }))
//         );
//         chartTitle = 'Monthly Production Report (Area Chart)';
//         break;
//       case 'area-weekly':
//         chartData = Object.entries(weeklyData).flatMap(([year, yearData]) =>
//           Object.entries(yearData).flatMap(([month, monthData]) =>
//             Object.entries(monthData).map(([week, production]) => ({
//               name: `${week} ${month} ${year}`,
//               y: production,
//             }))
//           )
//         );
//         chartTitle = 'Weekly Production Report (Area Chart)';
//         break;
//       case 'area-daily':
//         chartData = Object.entries(dailyData).flatMap(([year, yearData]) =>
//           Object.entries(yearData).flatMap(([month, monthData]) =>
//             Object.entries(monthData).map(([day, production]) => ({
//               name: `${day} ${month} ${year}`,
//               y: production,
//             }))
//           )
//         );
//         chartTitle = 'Daily Production Report (Area Chart)';
//         break;
//       default:
//         return;
//     }
  
//     currentAreaChart = Highcharts.chart('area-chart', {
//       chart: {
//         type: 'area',
//         backgroundColor: 'transparent',
//       },
//       title: {
//         text: chartTitle,
//       },
//       xAxis: {
//         type: 'category',
//       },
//       yAxis: {
//         title: {
//           text: 'Production',
//         },
//       },
//       series: [
//         {
//           name: 'Production',
//           data: chartData,
//         },
//       ],
//     });
//   }

//   function getYearlyProduction(table) {
//     const yearlyProduction = {};
//     const rows = table.rows().data();

//     rows.each((value, index) => {
//       const [date, day, month, year, shift, deviceId, status, production] = value;
//       const numericProduction = parseFloat(production);

//       if (!yearlyProduction[year]) {
//         yearlyProduction[year] = 0;
//       }

//       yearlyProduction[year] += numericProduction;
//     });

//     return yearlyProduction;
//   }

//   function getMonthlyProductionForYear(table) {
//     const monthlyProduction = {};
//     const rows = table.rows().data();

//     rows.each((value, index) => {
//       const [date, day, monthName, year, shift, deviceId, status, production] = value;
//       const numericProduction = parseFloat(production);

//       if (!monthlyProduction[year]) {
//         monthlyProduction[year] = {};
//       }

//       if (!monthlyProduction[year][monthName]) {
//         monthlyProduction[year][monthName] = 0;
//       }

//       monthlyProduction[year][monthName] += numericProduction;
//     });

//     return monthlyProduction;
//   }

//   function getWeeklyProductionForMonthYear(table) {
//     const weeklyProduction = {};
//     const rows = table.rows().data();
  
//     rows.each((value, index) => {
//       const [date, dayName, monthName, year, shift, deviceId, status, production] = value;
//       const numericProduction = parseFloat(production);
//       const dateObj = new Date(`${year}-${monthNames.indexOf(monthName) + 1}-${date.split('-')[0]}`);
//       const weekNumber = Math.ceil((dateObj.getDate() + 1 - dateObj.getDay()) / 7);
  
//       if (!weeklyProduction[year]) {
//         weeklyProduction[year] = {};
//       }
  
//       if (!weeklyProduction[year][monthName]) {
//         weeklyProduction[year][monthName] = {};
//       }
  
//       if (!weeklyProduction[year][monthName][`Week ${weekNumber}`]) {
//         weeklyProduction[year][monthName][`Week ${weekNumber}`] = 0;
//       }
  
//       weeklyProduction[year][monthName][`Week ${weekNumber}`] += numericProduction;
//     });
  
//     return weeklyProduction;
//   }

//   function getDailyProductionForMonthYear(table) {
//     const dailyProduction = {};
//     const rows = table.rows().data();

//     rows.each((value, index) => {
//       const [date, dayName, monthName, year, shift, deviceId, status, production] = value;
//       const numericProduction = parseFloat(production);

//       if (!dailyProduction[year]) {
//         dailyProduction[year] = {};
//       }

//       if (!dailyProduction[year][monthName]) {
//         dailyProduction[year][monthName] = {};
//       }

//       if (!dailyProduction[year][monthName][dayName]) {
//         dailyProduction[year][monthName][dayName] = 0;
//       }

//       dailyProduction[year][monthName][dayName] += numericProduction;
//     });

//     return dailyProduction;
//   }
// });




