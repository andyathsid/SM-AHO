$(document).ready(function() {
  const monthNames = [
      'January', 'February', 'March', 'April', 'Mei', 'Juni',
      'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Kamis', 'Friday', 'Sabtu'
  ];

  const table = $('#example').DataTable({
      ajax: {
          url: 'https://sm-aho-f408a-default-rtdb.asia-southeast1.firebasedatabase.app/mesin.json',
          dataSrc: function(data) {
              let result = [];
              for (let date in data) {
                  const [day, month, year] = date.split('-');
                  const monthName = monthNames[parseInt(month) - 1];
                  const dateObj = new Date(`${year}-${month}-${day}`);
                  const dayName = dayNames[dateObj.getDay()]; 

                  for (let shift in data[date]) {
                      let shiftData = data[date][shift];
                      let shiftName = shift === 'shift1' ? 'pertama' : 'kedua';

                      for (let mesinId in shiftData) {
                          result.push({
                              'Tanggal': date,
                              'Hari': dayName, 
                              'Bulan': monthName,
                              'Tahun': year,
                              'Shift': shiftName,
                              'Id Mesin': mesinId,
                              'Status': 'aktif',
                              'Produksi': shiftData[mesinId]['produksi']
                          });
                      }
                  }
              }
              return result;
          }
      },
      columns: [
          { data: 'Tanggal' },
          { data: 'Hari' },
          { data: 'Bulan' },
          { data: 'Tahun' },
          { data: 'Shift' },
          { data: 'Id Mesin' },
          { data: 'Status' },
          { data: 'Produksi', searchPanes: { show: false } }
      ],
    createdRow: function(row, data, dataIndex) {           
          var uniqueId = data['Tanggal'] + '-' + data['Shift'] + '-' + data['Id Mesin'];           
          row.id = uniqueId;       
      },       
      initComplete: function(settings, json) {
          updateDataWebsocket(table);
          table.columns([1, 2, 3]).visible(false);
      },
      layout: {
          top1: {
              searchPanes: {
                  show: false,
              },
          }
      }
  });
});


function updateDataWebsocket(table){
  const socket = io.connect('http://' + document.domain + ':' + location.port);

  socket.on('stream_update_shift1_1a', function(data) {
    console.log(data.produksi);
    uniqueId = "2-5-2024-pertama-1a"
    let id = table.row('[id='+uniqueId+']').index();
    table.cell({row:id, column:7}).data(data.produksi).invalidate().draw(false);
  });

  
  socket.on('stream_update_shift2_1a', function(data) {
    console.log(data.produksi);
    uniqueId = "2-5-2024-kedua-1a"
    let id = table.row('[id='+uniqueId+']').index();
    table.cell({row:id, column:7}).data(data.produksi).invalidate().draw(false);
  });

  socket.on('stream_update_shift1_1b', function(data) {
    console.log(data.produksi);
    uniqueId = "2-5-2024-pertama-1b"
    let id = table.row('[id='+uniqueId+']').index();
    table.cell({row:id, column:7}).data(data.produksi).invalidate().draw(false);
  });
  
  socket.on('stream_update_shift2_1b', function(data) {
    console.log(data.produksi);
    uniqueId = "2-5-2024-pertama-1b"
    let id = table.row('[id='+uniqueId+']').index();
    table.cell({row:id, column:7}).data(data.produksi).invalidate().draw(false);
  });
}