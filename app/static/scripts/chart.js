import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getDatabase, ref, child, onValue, set } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";

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

  onValue(productionRef, (snapshot) => {
    const data = [];
    let totalAktif = 0;
    let totalProduksi = 0;
    const shiftProduksiCounts = {
      shift1: 0,
      shift2: 0,
    };

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
          data.push([date, dayName, monthName, year, shiftName, idPerangkat, status, produksi, rowId]);
        });
      });
    });

    updateCharts(data);
  });

  function updateCharts(data) {
    const yearlyProduction = getYearlyProduction(data);
    const monthlyProductionData = getMonthlyProductionForYear(data);
    const weeklyProductionData = getWeeklyProductionForMonthYear(data);
    const dailyProductionData = getDailyProductionForMonthYear(data);

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
        chartTitle = 'Laporan Produksi Tahun (Bagan Batang)';
        break;
      case 'bar-monthly':
        chartData = Object.entries(monthlyData).flatMap(([year, monthData]) =>
          Object.entries(monthData).map(([month, production]) => ({
            name: `${month} ${year}`,
            y: production,
          }))
        );
        chartTitle = 'Laporan Produksi Bulan (Bagan Batang)';
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
        chartTitle = 'Laporan Produksi Mingguan(Bagan Batang)';
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
        chartTitle = 'Laporan Produksi Harian (Bagan Batang)';
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
        chartTitle = 'Laporan Produksi Tahuan (Bagan Area)';
        break;
      case 'area-monthly':
        chartData = Object.entries(monthlyData).flatMap(([year, monthData]) =>
          Object.entries(monthData).map(([month, production]) => ({
            name: `${month} ${year}`,
            y: production,
          }))
        );
        chartTitle = 'Laporan Produksi Bulanan (Bagan Area)';
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
        chartTitle = 'Laporan Produksi Mingguan (Bagan Area)';
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
        chartTitle = 'Laporan Produksi Harian (Bagan Area)';
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
          text: 'Produksi',
        },
      },
      series: [
        {
          name: 'Produksi',
          data: chartData,
        },
      ],
    });
  }

  function getYearlyProduction(data) {
    const yearlyProduction = {};
    data.forEach((value) => {
      const [date, day, month, year, shift, deviceId, status, production] = value;
      const numericProduction = parseFloat(production);
  
      if (!yearlyProduction[year]) {
        yearlyProduction[year] = 0;
      }
  
      yearlyProduction[year] += numericProduction;
    });
  

    return Object.fromEntries(Object.entries(yearlyProduction).filter(([_, value]) => value > 0));
  }
  
  function getMonthlyProductionForYear(data) {
    const monthlyProduction = {};
    data.forEach((value) => {
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
  

    for (const year in monthlyProduction) {
      monthlyProduction[year] = Object.fromEntries(
        Object.entries(monthlyProduction[year]).filter(([_, value]) => value > 0)
      );
    }
  
    return monthlyProduction;
  }

  function getWeeklyProductionForMonthYear(data) {
    const weeklyProduction = {};
    data.forEach((value) => {
      const [date, dayName, monthName, year, shift, deviceId, status, production] = value;
      const numericProduction = parseFloat(production);
      const dateObj = new Date(`${year}-${monthNames.indexOf(monthName) + 1}-${date.split('-')[0]}`);
      const weekNumber = Math.ceil((dateObj.getDate() + 1 - dateObj.getDay()) / 7)+1;
  
      if (!weeklyProduction[year]) {
        weeklyProduction[year] = {};
      }
  
      if (!weeklyProduction[year][monthName]) {
        weeklyProduction[year][monthName] = {};
      }
  
      if (!weeklyProduction[year][monthName][`Minggu ${weekNumber}`]) {
        weeklyProduction[year][monthName][`Minggu ${weekNumber}`] = 0;
      }
  
      weeklyProduction[year][monthName][`Minggu ${weekNumber}`] += numericProduction;
    });

    for (const year in weeklyProduction) {
      for (const month in weeklyProduction[year]) {
        weeklyProduction[year][month] = Object.fromEntries(
          Object.entries(weeklyProduction[year][month]).filter(([_, value]) => value > 0)
        );
      }
    }
  
    return weeklyProduction;
  }
  
  function getDailyProductionForMonthYear(data) {
    const dailyProduction = {};
    data.forEach((value) => {
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
  
    for (const year in dailyProduction) {
      for (const month in dailyProduction[year]) {
        dailyProduction[year][month] = Object.fromEntries(
          Object.entries(dailyProduction[year][month]).filter(([_, value]) => value > 0)
        );
      }
    }
  
    return dailyProduction;
  }
});
