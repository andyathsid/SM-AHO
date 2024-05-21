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
const productionRef = ref(database, "mesin");

$(document).ready(function() {
  const monthNames = [
    "January", "February", "March", "April", "Mei", "Juni",
    "July", "August", "September", "October", "November", "December",
  ];
  const dayNames = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Kamis", "Friday", "Sabtu",
  ];

  let currentChart;
  let currentAreaChart;

  let table;

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
          const status = statusData.status;
          const rowId = `${date}|${shift}|${idPerangkat}`;
          data.push([
            date, dayName, monthName, year, shiftName, idPerangkat, status, produksi, rowId,
          ]);
        });
      });
    });

    const statusOptions = [
      { value: "aktif", label: "aktif" },
      { value: "tidak aktif", label: "tidak aktif" },
    ];
    
    let editor = new DataTable.Editor({
      fields: [
        {
          label: "Status:",
          name: "status",
          type: "select",
          options: statusOptions,
        },
      ],
      table: "#datatable",
      idSrc: 8
    });

    if (!table) {
      table = $("#datatable").DataTable({
        data: data,
        columns: [
          { title: "Tanggal" },
          { title: "Hari" },
          { title: "Bulan" },
          { title: "Tahun" },
          { title: "Shift" },
          { title: "ID Perangkat" },
          {
            editField: "status",
            className: "editable",
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
        processing: true,
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
    setupEditableCellListener(table, editor);
    updateCharts(table);
});

function setupEditableCellListener(table, editor) {
  table.on("click", "tbody td.editable", function (e) {
    const row = table.row($(this).closest('tr'));
    const rowData = row.data();
    const rowId = rowData[8]; 

    const selectField = editor.field('status');
    selectField.input().on('change', function() {
        const selectedValue = $(this).val();

        const [date, shift, idPerangkat] = rowId.split('|');

        const statusRef = ref(database, `mesin/${date}/${shift}/${idPerangkat}/status`);

        set(statusRef, selectedValue)
            .then(() => {
                console.log('Status updated successfully');
            })
            .catch((error) => {
                console.error('Error updating status:', error);
            });

    });

    editor.inline(this, {
      onBlur: "submit",
    });
  });
}


  function updateCharts(table) {
    const yearlyProduction = getYearlyProduction(table);
    const monthlyProductionData = getMonthlyProductionForYear(table);
    const weeklyProductionData = getWeeklyProductionForMonthYear(table);
    const dailyProductionData = getDailyProductionForMonthYear(table);

    updateChart('bar-yearly', yearlyProduction);
    updateAreaChart('area-yearly', yearlyProduction);

    $('#bar-report-select').off('change').on('change', function() {
      const selectedOption = $(this).val();
      updateChart(selectedOption, yearlyProduction, monthlyProductionData, weeklyProductionData, dailyProductionData);
    });

    $('#area-report-select').off('change').on('change', function() {
      const selectedOption = $(this).val();
      updateAreaChart(selectedOption, yearlyProduction, monthlyProductionData, weeklyProductionData, dailyProductionData);
    });
  }



  function updateChart(option, yearlyData, monthlyData, weeklyData, dailyData) {
    if (currentChart) {
      currentChart.destroy(); 
    }

    let chartData, chartTitle;

    switch (option) {
      case 'bar-yearly':
        chartData = Object.entries(yearlyData).map(([year, production]) => ({
          name: year,
          y: production,
        }));
        chartTitle = 'Yearly Production Report';
        break;
      case 'bar-monthly':
        chartData = Object.entries(monthlyData).flatMap(([year, monthData]) =>
          Object.entries(monthData).map(([month, production]) => ({
            name: `${month} ${year}`,
            y: production,
          }))
        );
        chartTitle = 'Monthly Production Report';
        break;
        case 'bar-weekly':
          chartData = Object.entries(weeklyData).flatMap(([year, yearData]) =>
            Object.entries(yearData).flatMap(([month, monthData]) =>
              Object.entries(monthData).map(([week, production]) => ({
                name: `${week} ${month} ${year}`,
                y: production,
              }))
            )
          );
          chartTitle = 'Weekly Production Report';
          break;
      case 'bar-daily':
        chartData = Object.entries(dailyData).flatMap(([year, yearData]) =>
          Object.entries(yearData).flatMap(([month, monthData]) =>
            Object.entries(monthData).map(([day, production]) => ({
              name: `${day} ${month} ${year}`,
              y: production,
            }))
          )
        );
        chartTitle = 'Daily Production Report';
        break;
      default:
        return;
    }

    currentChart = Highcharts.chart('bar-chart', {
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
      },
      title: {
        text: chartTitle,
      },
      xAxis: {
        type: 'category',
      },
      yAxis: {
        title: {
          text: 'Production',
        },
      },
      series: [
        {
          name: 'Production',
          data: chartData,
        },
      ],
    });
  }

  function updateAreaChart(option, yearlyData, monthlyData, weeklyData, dailyData) {
    if (currentAreaChart) {
      currentAreaChart.destroy();
    }
  
    let chartData, chartTitle;
  
    switch (option) {
      case 'area-yearly':
        chartData = Object.entries(yearlyData).map(([year, production]) => ({
          name: year,
          y: production,
        }));
        chartTitle = 'Yearly Production Report (Area Chart)';
        break;
      case 'area-monthly':
        chartData = Object.entries(monthlyData).flatMap(([year, monthData]) =>
          Object.entries(monthData).map(([month, production]) => ({
            name: `${month} ${year}`,
            y: production,
          }))
        );
        chartTitle = 'Monthly Production Report (Area Chart)';
        break;
      case 'area-weekly':
        chartData = Object.entries(weeklyData).flatMap(([year, yearData]) =>
          Object.entries(yearData).flatMap(([month, monthData]) =>
            Object.entries(monthData).map(([week, production]) => ({
              name: `${week} ${month} ${year}`,
              y: production,
            }))
          )
        );
        chartTitle = 'Weekly Production Report (Area Chart)';
        break;
      case 'area-daily':
        chartData = Object.entries(dailyData).flatMap(([year, yearData]) =>
          Object.entries(yearData).flatMap(([month, monthData]) =>
            Object.entries(monthData).map(([day, production]) => ({
              name: `${day} ${month} ${year}`,
              y: production,
            }))
          )
        );
        chartTitle = 'Daily Production Report (Area Chart)';
        break;
      default:
        return;
    }
  
    currentAreaChart = Highcharts.chart('area-chart', {
      chart: {
        type: 'area',
        backgroundColor: 'transparent',
      },
      title: {
        text: chartTitle,
      },
      xAxis: {
        type: 'category',
      },
      yAxis: {
        title: {
          text: 'Production',
        },
      },
      series: [
        {
          name: 'Production',
          data: chartData,
        },
      ],
    });
  }

  function getYearlyProduction(table) {
    const yearlyProduction = {};
    const rows = table.rows().data();

    rows.each((value, index) => {
      const [date, day, month, year, shift, deviceId, status, production] = value;
      const numericProduction = parseFloat(production);

      if (!yearlyProduction[year]) {
        yearlyProduction[year] = 0;
      }

      yearlyProduction[year] += numericProduction;
    });

    return yearlyProduction;
  }

  function getMonthlyProductionForYear(table) {
    const monthlyProduction = {};
    const rows = table.rows().data();

    rows.each((value, index) => {
      const [date, day, monthName, year, shift, deviceId, status, production] = value;
      const numericProduction = parseFloat(production);

      if (!monthlyProduction[year]) {
        monthlyProduction[year] = {};
      }

      if (!monthlyProduction[year][monthName]) {
        monthlyProduction[year][monthName] = 0;
      }

      monthlyProduction[year][monthName] += numericProduction;
    });

    return monthlyProduction;
  }

  function getWeeklyProductionForMonthYear(table) {
    const weeklyProduction = {};
    const rows = table.rows().data();
  
    rows.each((value, index) => {
      const [date, dayName, monthName, year, shift, deviceId, status, production] = value;
      const numericProduction = parseFloat(production);
      const dateObj = new Date(`${year}-${monthNames.indexOf(monthName) + 1}-${date.split('-')[0]}`);
      const weekNumber = Math.ceil((dateObj.getDate() + 1 - dateObj.getDay()) / 7);
  
      if (!weeklyProduction[year]) {
        weeklyProduction[year] = {};
      }
  
      if (!weeklyProduction[year][monthName]) {
        weeklyProduction[year][monthName] = {};
      }
  
      if (!weeklyProduction[year][monthName][`Week ${weekNumber}`]) {
        weeklyProduction[year][monthName][`Week ${weekNumber}`] = 0;
      }
  
      weeklyProduction[year][monthName][`Week ${weekNumber}`] += numericProduction;
    });
  
    return weeklyProduction;
  }

  function getDailyProductionForMonthYear(table) {
    const dailyProduction = {};
    const rows = table.rows().data();

    rows.each((value, index) => {
      const [date, dayName, monthName, year, shift, deviceId, status, production] = value;
      const numericProduction = parseFloat(production);

      if (!dailyProduction[year]) {
        dailyProduction[year] = {};
      }

      if (!dailyProduction[year][monthName]) {
        dailyProduction[year][monthName] = {};
      }

      if (!dailyProduction[year][monthName][dayName]) {
        dailyProduction[year][monthName][dayName] = 0;
      }

      dailyProduction[year][monthName][dayName] += numericProduction;
    });

    return dailyProduction;
  }
});