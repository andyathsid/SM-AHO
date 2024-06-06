
// const socket = io.connect('http://' + document.domain + ':' + location.port);

// socket.on('stream_update', function(data) {
//     const table = $('#example').DataTable();
  
//     for (const date in data) {
//       for (const shift in data[date]) {
//         const shiftData = data[date][shift];
//         const shiftName = shift === 'shift1' ? 'pertama' : 'kedua';
//         const rowId = `${date}-${shiftName}-${shiftData.id_mesin}`;
//         console.log(rowId);
//         const row = table.row('#' + rowId);
//         console.log(row);
  
//         if (row.data()) {
//             console.log("found");
//             row.data().Produksi = shiftData.produksi;
//             console.log(row.data().Produksi);
//             let id = table.row('[id='+rowId+']').index();
//             console.log(id);
//             table.cell({row:id, column: 4}).data(row.data().Produksi).invalidate().draw();
//         }
//     }
//     }
// });