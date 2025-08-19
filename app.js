const API_URL = "https://stock-screener-backend.onrender.com/api/stocks";

async function fetchStocks() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        populateTable(data);
    } catch (err) {
        console.error('Error fetching stocks:', err);
    }
}

function populateTable(stocks) {
    const tbody = document.querySelector('#stock-table tbody');
    tbody.innerHTML = '';

    stocks.forEach(stock => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${stock.symbol}</td>
            <td>${stock.companyName}</td>
            <td>${stock.price}</td>
            <td>${stock.change5min}</td>
            <td>${stock.changeDaily}</td>
            <td>${stock.changeWeekly}</td>
            <td>${stock.changeMonthly}</td>
            <td>${stock.changeQuarterly}</td>
            <td>${stock.changeHalfYear}</td>
            <td>${stock.changeYear}</td>
            <td><canvas class="sparkline" id="intraday-${stock.symbol}"></canvas></td>
            <td><canvas class="sparkline" id="weekly-${stock.symbol}"></canvas></td>
        `;
        tbody.appendChild(tr);

        createChart(`intraday-${stock.symbol}`, stock.intraday);
        createChart(`weekly-${stock.symbol}`, stock.weekly);

        colorRow(tr, stock);
    });
}

function createChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: { labels: data.map((_, i) => i), datasets: [{ data, borderColor: 'blue', fill: false, tension: 0.3 }] },
        options: { plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false }
    });
}

function colorRow(tr, stock) {
    const thresholds = { change5min: 10, changeDaily: 25, changeWeekly: 20 };
    ['change5min','changeDaily','changeWeekly'].forEach(key => {
        const td = tr.querySelector(`td:nth-child(${getColumnIndex(key)+1})`);
        const val = parseFloat(stock[key]);
        if(val > thresholds[key]) td.classList.add('green');
        else if(val > 0) td.classList.add('yellow');
        else td.classList.add('red');
    });
}

function getColumnIndex(key) {
    switch(key) {
        case 'change5min': return 3;
        case 'changeDaily': return 4;
        case 'changeWeekly': return 5;
        default: return 0;
    }
}

// Auto-refresh every 10 seconds
fetchStocks();
setInterval(fetchStocks, 10000);
