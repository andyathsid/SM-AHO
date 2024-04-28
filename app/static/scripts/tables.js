const socket = io.connect('http://' + document.domain + ':' + location.port);

socket.on('initial_data', function(data) {
    createTable(data);
});

socket.on('stream_update', function(data) {
    updateTable(data);
});

function createTable(data) {
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';

    let index = 1;
    Object.keys(data).forEach((key) => {
        const rowData = data[key];
        const row = document.createElement('tr');
        const indexCell = document.createElement('td');
        indexCell.textContent = index++;
        row.appendChild(indexCell);
        const idCell = document.createElement('td');
        idCell.textContent = key;
        row.appendChild(idCell);
        const noMesinCell = document.createElement('td');
        noMesinCell.textContent = rowData.no_mesin;
        row.appendChild(noMesinCell);
        const statusCell = document.createElement('td');
        statusCell.textContent = rowData.status;
        row.appendChild(statusCell);
        const jumlahCell = document.createElement('td');
        jumlahCell.textContent = rowData.jumlah;
        row.appendChild(jumlahCell);
        tableBody.appendChild(row);
    });
}

function updateTable(data) {
    const tableBody = document.getElementById('table-body');
    const rows = tableBody.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        const id = cells[1].textContent;
        if (data[id]) {
        const rowData = data[id];
        cells[2].textContent = rowData.no_mesin;
        cells[3].textContent = rowData.status;
        cells[4].textContent = rowData.jumlah;
        }
    }
}