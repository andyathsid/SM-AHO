const socket = io.connect('http://' + document.domain + ':' + location.port);

socket.on('stream_update', function(data) {
    updateTable(data);
});

function updateTable(data) {
    const tableBody = document.getElementById('table-body');
    const rows = tableBody.getElementsByTagName('tr');
    const rowsData = {};
    let index = 1; 

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        const id = cells[1].textContent;
        rowsData[id] = {
            no_mesin: cells[2].textContent,
            status: cells[3].textContent,
            jumlah: cells[4].textContent
        };
    }

    tableBody.innerHTML = '';

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

        if (rowsData[key]) {
            rowsData[key].jumlah = rowData.jumlah;
        }

        tableBody.appendChild(row);
    });
}