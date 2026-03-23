// WEATHER SECTION
// Handles fetching and displaying Calgary weather
function getWeather() {
  const saved = localStorage.getItem("weatherData");
  const lastFetch = localStorage.getItem("weatherTime");
  const now = Date.now();

  // Use cached weather if recent
  if (saved && lastFetch && now - lastFetch < 10 * 60 * 1000) {
    const data = JSON.parse(saved);
    if (data.main && data.weather) {
      displayWeather(data);
    } else {
      document.getElementById("weatherData").innerHTML =
        `<p style="color:red;">Cached weather data invalid</p>`;
    }
    return;
  }

  // Fetch fresh weather from backend
  fetch('/api/weather')
    .then(res => res.json())
    .then(data => {
      if (!data || !data.main || !data.weather) {
        document.getElementById("weatherData").innerHTML =
          `<p style="color:red;">Error fetching weather</p>`;
        return;
      }

      // Cache new data
      localStorage.setItem("weatherData", JSON.stringify(data));
      localStorage.setItem("weatherTime", now);

      displayWeather(data);
    })
    .catch(err => {
      console.error("Weather fetch error:", err);
      document.getElementById("weatherData").innerHTML =
        `<p style="color:red;">Error fetching weather: ${err}</p>`;
    });
}

// Show weather in the page
function displayWeather(data) {
  const temp = data.main.temp.toFixed(1);
  const desc = data.weather[0].description;
  const time = new Date().toLocaleString();

  document.getElementById("weatherData").innerHTML = `
    <p><strong>Temperature:</strong> ${temp}°C</p>
    <p><strong>Condition:</strong> ${desc}</p>
    <p><strong>Updated:</strong> ${time}</p>
  `;
}

// Run weather on page load
getWeather();

// CURRENCY SECTION
// Handles populating dropdowns and currency conversion
const currencies = ["USD","CAD","EUR","GBP","INR","JPY","AUD","CNY","CHF","NZD"];
const fromSelect = document.getElementById("fromCurrency");
const toSelect = document.getElementById("toCurrency");

// Fill the dropdown menus
currencies.forEach(c => {
  fromSelect.innerHTML += `<option value="${c}">${c}</option>`;
  toSelect.innerHTML += `<option value="${c}">${c}</option>`;
});

// Convert currency on button click
function convertCurrency() {
  const amount = parseFloat(document.getElementById("amount").value);
  const from = fromSelect.value;
  const to = toSelect.value;

  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid amount");
    return;
  }

  const cacheKey = `${from}_${to}`;
  const savedRate = localStorage.getItem(cacheKey);
  const lastFetch = localStorage.getItem(cacheKey + "_time");
  const now = Date.now();

  // Use cached rate if recent
  if (savedRate && lastFetch && now - lastFetch < 10 * 60 * 1000) {
    displayResult(amount, from, to, parseFloat(savedRate));
    return;
  }

  // Fetch fresh rate from backend
  fetch(`/api/currency?from=${from}&to=${to}`)
    .then(res => res.json())
    .then(data => {
      if (!data || !data.rate) {
        document.getElementById("result").innerHTML =
          `<p style="color:red;">Error fetching exchange rate</p>`;
        return;
      }

      // Cache new rate
      localStorage.setItem(cacheKey, data.rate);
      localStorage.setItem(cacheKey + "_time", now);

      displayResult(amount, from, to, data.rate);
    })
    .catch(err => {
      console.error("Currency fetch error:", err);
      document.getElementById("result").innerHTML =
        `<p style="color:red;">Error fetching exchange rate: ${err}</p>`;
    });
}

// Show conversion result
function displayResult(amount, from, to, rate) {
  const result = amount * rate;

  document.getElementById("result").innerHTML = `
    <p><strong>${amount} ${from} = ${result.toFixed(2)} ${to}</strong></p>
    <p>1 ${from} = ${rate.toFixed(4)} ${to}</p>
  `;
}