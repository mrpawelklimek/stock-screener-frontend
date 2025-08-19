async function fetchStocks() {
  try {
    const response = await fetch("https://stock-screener-backend.onrender.com/api/stocks");
    const stocks = await response.json();
    renderTable(stocks);
  } catch (error) {
    console.error("Error fetching stocks:", error);
  }
}

function renderTable(stocks) {
  const tbody = document.querySelector("#stocks-table tbody");
  tbody.innerHTML = "";

  const t5min = document.getElementById("threshold-5min").value;
  const tDaily = document.getElementById("threshold-daily").value;
  const tWeekly = document.getElementById("threshold-weekly").value;
  const tMonthly = document.getElementById("threshold-monthly").value;

  stocks.forEach(stock => {
    const row = document.createElement("tr");

    // Color logic based on thresholds
    let cls = "";
    if (stock.dailyChange > tDaily || stock.change5min > t5min || stock.weeklyChange > tWeekly || stock.monthlyChange > tMonthly) {
      cls = "green";
    } else if (stock.dailyChange > 0 || stock.change5min > 0 || stock.weeklyChange > 0 || stock.monthlyChange > 0) {
      cls = "yellow";
    } else {
      cls = "red";
    }
    row.className = cls;

    row.innerHTML = `
      <td>${stock.symbol}</td>
      <td>${stock.name}</td>
      <td>${stock.price}</td>
      <td>${stock.change5min}%</td>
      <td>${stock.dailyChange}%</td>
      <td>${stock.weeklyChange}%</td>
      <td>${stock.monthlyChange}%</td>
      <td>${stock.quarterlyChange}%</td>
      <td>${stock.halfYearChange}%</td>
      <td>${stock.yearlyChange}%</td>
      <td><canvas class="sparkline" width="100" height="30"></canvas></td>
      <td><canvas class="sparkline" width="100" height="30"></canvas></td>
    `;
    tbody.appendChild(row);
  });
}

document.querySelectorAll("#sliders input").forEach(input => {
  input.addEventListener("input", fetchStocks);
});

setInterval(fetchStocks, 10000);
fetchStocks();
