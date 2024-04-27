var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'line', // Mengubah tipe chart menjadi line chart
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

$(document).ready(function () {
    $("#toggleSidebar").click(function () {
        $(".sidebar").toggle();
    });
});



    // Ambil elemen span dengan id "real-time"
    const realTimeSpan = document.getElementById('real-time');

    // Fungsi untuk memperbarui waktu setiap detik
    function updateRealTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');

        // Tampilkan waktu dalam format HH:mm:ss
        realTimeSpan.textContent = `${hours}:${minutes}:${seconds}`;
    }

    // Panggil fungsi updateRealTime setiap detik
    setInterval(updateRealTime, 1000);
