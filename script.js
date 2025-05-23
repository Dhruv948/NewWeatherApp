const apiKey = 'YOUR_API_KEY';  // Replace with your OpenWeatherMap API key

const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const weatherResult = document.getElementById('weatherResult');
const errorMsg = document.getElementById('errorMsg');

searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (!city) {
    errorMsg.textContent = 'Please enter a city name';
    weatherResult.innerHTML = '';
    return;
  }
  errorMsg.textContent = '';
  fetchWeather(city);
});

function fetchWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('City not found');
      }
      return response.json();
    })
    .then(data => {
      displayWeather(data);
    })
    .catch(err => {
      errorMsg.textContent = err.message;
      weatherResult.innerHTML = '';
    });
}

function displayWeather(data) {
  const { name, main, weather, wind } = data;
  weatherResult.innerHTML = `
    <h2>${name}</h2>
    <p><strong>Temperature:</strong> ${main.temp} °C</p>
    <p><strong>Condition:</strong> ${weather[0].description}</p>
    <p><strong>Humidity:</strong> ${main.humidity}%</p>
    <p><strong>Wind Speed:</strong> ${wind.speed} m/s</p>
  `;
}
