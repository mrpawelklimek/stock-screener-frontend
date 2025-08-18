
// app.js - frontend Stock Screener

// ============================
// Konfiguracja API
// ============================
const API_URL = "https://twoj-backend.onrender.com/api/stocks";

// Funkcja pobierająca dane z backendu
async function fetchStockData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Błąd pobierania danych:", error);
        return [];
    }
}

// ============================
// Inicjalizacja tabeli, suwaki, kolorowanie wierszy
// ============================
const tableBody = document.getElementById('stock-table-body');
const refreshInterval = 10000; // 10 sekund

// Funkcja do tworzenia wierszy tabeli
function renderTable(data) {
    tableBody.innerHTML = '';
    data.forEach(stock => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${stock.symbol}</td>
            <td>${stock.companyName}</td>
            <td>${stock.price.toFixed(2)}</td>
            <td>${stock.change5min.toFixed(2)}%</td>
            <td>${stock.changeDaily.toFixed(2)}%</td>
            <td>${stock.changeWeekly.toFixed(2)}%</td>
            <td><canvas id='sparkline-monthly-${stock.symbol}'></canvas></td>
            <td>${stock.changeQuarterly.toFixed(2)}%</td>
            <td>${stock.changeHalfYear.toFixed(2)}</td>
            <td>${stock.changeYear.toFixed(2)}</td>
            <td><canvas id='sparkline-intraday-${stock.symbol}'></canvas></td>
            <td><canvas id='sparkline-weekly-${stock.symbol}'></canvas></td>
        `;

        // TODO: kolorowanie wierszy na podstawie wartości i progów
        tableBody.appendChild(row);

        // TODO: render miniwykresów za pomocą Chart.js
    });
}

// Funkcja odświeżania danych co 10 sekund
async function refreshData() {
    const data = await fetchStockData();
    renderTable(data);
}

// Start
refreshData();
setInterval(refreshData, refreshInterval);
