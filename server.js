
// Load environment variables from .env
require('dotenv').config();

const express = require('express');
// Use the built-in fetch available in Node 18+ (or globalThis.fetch)
const fetch = globalThis.fetch;

const app = express();
const PORT = 3000;

// Serve static frontend files from 'public' folder
app.use(express.static('public'));


// WEATHER API endpoint
app.get('/api/weather', async (req, res) => {
  try {
    // Build URL with API key from .env
    const url = `https://api.openweathermap.org/data/2.5/weather?q=Calgary&units=metric&appid=${process.env.WEATHER_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    // Check for API errors
    if (!data || data.cod !== 200) {
      return res.status(500).json({ error: data.message || 'Weather API error' });
    }

    // Send weather data to frontend
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// CURRENCY API endpoint

app.get('/api/currency', async (req, res) => {
  const { from, to } = req.query;

  // Validate query parameters
  if (!from || !to) {
    return res.status(400).json({ error: 'Missing query parameters' });
  }

  try {
    // Build URL with API key from .env
    const url = `https://v6.exchangerate-api.com/v6/${process.env.CURRENCY_KEY}/latest/${from}`;
    const response = await fetch(url);
    const data = await response.json();

    // Check for API errors
    if (!data || data.result !== 'success') {
      return res.status(500).json({ error: 'Currency API error' });
    }

    // Send conversion rate to frontend
    res.json({ rate: data.conversion_rates[to] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));