import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getDatabase, ref, child, onValue, get, } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";

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
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const dayNames = [
    "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"
  ];

  let currentChart;
  let currentAreaChart;

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
            date, dayName, monthName, year, shiftName, idPerangkat, "aktif", produksi,
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
          searchPanes: { initCollapsed: true },
        },
      },
    });

    const yearlyProduction = getYearlyProduction(table);
    const monthlyProductionData = getMonthlyProductionForYear(table);
    const weeklyProductionData= getWeeklyProductionForMonthYear(table);
    const dailyProductionData = getDailyProductionForMonthYear(table);

    $('#bar-report-select').on('change', function() {
      const selectedOption = $(this).val();
      updateChart(selectedOption, yearlyProduction, monthlyProductionData, weeklyProductionData, dailyProductionData);
    });

    $('#area-report-select').on('change', function() {
      const selectedOption = $(this).val();
      updateAreaChart(selectedOption, yearlyProduction, monthlyProductionData, weeklyProductionData, dailyProductionData);
    });
    
    


    updateChart('bar-yearly', yearlyProduction);
    updateAreaChart('area-yearly', yearlyProduction);
  });

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