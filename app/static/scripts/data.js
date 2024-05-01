$(document).ready(function() {
    const table = $('#example').DataTable({
        ajax: {
            url: 'https://sm-aho-f408a-default-rtdb.asia-southeast1.firebasedatabase.app/mesin.json',
            dataSrc: function(data) {
                let result = [];
                for (let date in data) {
                    for (let shift in data[date]) {
                        let shiftData = data[date][shift];
                        let shiftName = shift === 'shift1' ? 'pertama' : 'kedua';
                        result.push({
                            'Tanggal': date,
                            'Shift': shiftName,
                            'Id Mesin': shiftData['id_mesin'],
                            'Status': 'aktif',
                            'Produksi': shiftData['produksi']
                        });
                    }
                }
                return result;
            }
        },
        columns: [
            { data: 'Tanggal' },
            { data: 'Shift' },
            { data: 'Id Mesin' },
            { data: 'Status' },
            { data: 'Produksi'}
        ],
        createdRow: function(row, data, dataIndex) {
            var uniqueId = data['Tanggal'] + '-' + data['Shift'] + '-' + data['Id Mesin'];
            row.id = uniqueId;
        },
        initComplete: function (settings, json) {
            updateDataWebsocket(table);
        }
    });
});

function updateDataWebsocket(table){
const socket = io.connect('http://' + document.domain + ':' + location.port);

socket.on('stream_update_shift1', function(data) {
    console.log(data.produksi);
    uniqueId = "02-05-2024-pertama-1a"
    let id = table.row('[id='+uniqueId+']').index();
    table.cell({row:id, column:4}).data(data.produksi).invalidate().draw(false);
});

socket.on('stream_update_shift2', function(data) {
    console.log(data.produksi);
    uniqueId = "02-05-2024-kedua-1a"
    let id = table.row('[id='+uniqueId+']').index();
    table.cell({row:id, column:4}).data(data.produksi).invalidate().draw(false);
});

}



