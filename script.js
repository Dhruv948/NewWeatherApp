// Get your API key from: https://openweathermap.org/api
const API_KEY = 'ecb7c468e1305a4ceec29c020758da15';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const searchInput = document.querySelector('.search-box input');
const locationBtn = document.querySelector('.location-btn');
const cityName = document.querySelector('.city-name');
const date = document.querySelector('.date');
const weatherIcon = document.querySelector('.weather-icon');
const temperature = document.querySelector('.temperature');
const description = document.querySelector('.description');
const feelsLike = document.querySelector('.feels-like');
const windSpeed = document.querySelector('.wind-speed');
const humidity = document.querySelector('.humidity');
const pressure = document.querySelector('.pressure');
const sunrise = document.querySelector('.sunrise');
const sunset = document.querySelector('.sunset');
const minTemp = document.querySelector('.min-temp');
const maxTemp = document.querySelector('.max-temp');
const hourlyContainer = document.querySelector('.hourly-container');
const dailyContainer = document.querySelector('.daily-container');
const mapBtns = document.querySelectorAll('.map-btn');
const weatherMap = document.getElementById('weather-map');

// Event Listeners
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim() !== '') {
        getWeatherData(searchInput.value.trim());
    }
});

locationBtn.addEventListener('click', getCurrentLocation);

// Get current location
function getCurrentLocation() {
    if (navigator.geolocation) {
        locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        navigator.geolocation.getCurrentPosition(
            (position) => {
                getWeatherByCoords(position.coords.latitude, position.coords.longitude);
                locationBtn.innerHTML = '<i class="fas fa-location-dot"></i>';
            },
            (error) => {
                alert('Unable to get your location. Please search manually.');
                locationBtn.innerHTML = '<i class="fas fa-location-dot"></i>';
            }
        );
    } else {
        alert('Geolocation is not supported by your browser');
    }
}

// Get weather data by city name
async function getWeatherData(city) {
    try {
        showLoading();
        const response = await fetch(
            `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
        );
        const data = await response.json();

        if (data.cod === 200) {
            updateWeatherDisplay(data);
            getForecastData(data.coord.lat, data.coord.lon);
            updateMap(data.coord.lat, data.coord.lon);
            localStorage.setItem('lastCity', city);
        } else {
            alert(data.message || 'City not found. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to fetch weather data. Please try again.');
    } finally {
        hideLoading();
    }
}

// Get weather by coordinates
async function getWeatherByCoords(lat, lon) {
    try {
        showLoading();
        const response = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        const data = await response.json();

        if (data.cod === 200) {
            updateWeatherDisplay(data);
            getForecastData(lat, lon);
            updateMap(lat, lon);
            searchInput.value = data.name;
            localStorage.setItem('lastCity', data.name);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to fetch weather data. Please try again.');
    } finally {
        hideLoading();
    }
}

// Get forecast data
async function getForecastData(lat, lon) {
    try {
        const response = await fetch(
            `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        const data = await response.json();

        if (data.cod === '200') {
            updateHourlyForecast(data.list.slice(0, 8));
            updateDailyForecast(data.list);
        }
    } catch (error) {
        console.error('Error fetching forecast:', error);
    }
}

// Update weather display
function updateWeatherDisplay(data) {
    // Update city and date
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    date.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Update weather icon and temperature
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    weatherIcon.alt = data.weather[0].description;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    // Update weather details
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    humidity.textContent = `${data.main.humidity}%`;
    pressure.textContent = `${data.main.pressure} hPa`;

    // Update sunrise and sunset times
    const sunriseTime = new Date(data.sys.sunrise * 1000);
    const sunsetTime = new Date(data.sys.sunset * 1000);
    sunrise.textContent = sunriseTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    sunset.textContent = sunsetTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    // Update min/max temperature
    minTemp.textContent = `${Math.round(data.main.temp_min)}°C`;
    maxTemp.textContent = `${Math.round(data.main.temp_max)}°C`;
}

// Update hourly forecast
function updateHourlyForecast(hourlyData) {
    hourlyContainer.innerHTML = hourlyData.map((item, index) => {
        const time = index === 0 ? 'Now' : new Date(item.dt * 1000).toLocaleTimeString('en-US', {
            hour: '2-digit',
            hour12: true
        });
        return `
            <div class="forecast-card">
                <span class="time">${time}</span>
                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" 
                     alt="${item.weather[0].description}">
                <span class="temp">${Math.round(item.main.temp)}°C</span>
            </div>
        `;
    }).join('');
}

// Update daily forecast
function updateDailyForecast(forecastData) {
    const dailyData = forecastData.filter((item, index) => index % 8 === 0).slice(0, 7);

    dailyContainer.innerHTML = dailyData.map((item, index) => {
        const date = new Date(item.dt * 1000);
        const day = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
        return `
            <div class="forecast-card">
                <span class="day">${day}</span>
                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" 
                     alt="${item.weather[0].description}">
                <div class="temp-range">
                    <span class="max">${Math.round(item.main.temp_max)}°</span>
                    <span class="min">${Math.round(item.main.temp_min)}°</span>
                </div>
            </div>
        `;
    }).join('');
}

// Update weather map
function updateMap(lat, lon) {
    const mapType = document.querySelector('.map-btn.active').dataset.type;
    const mapLayer = mapType === 'temp' ? 'temp_new' :
        mapType === 'precipitation' ? 'precipitation_new' : 'wind_new';

    weatherMap.innerHTML = `
        <iframe
            width="100%"
            height="100%"
            frameborder="0"
            src="https://openweathermap.org/weathermap?basemap=map&cities=false&layer=${mapLayer}&lat=${lat}&lon=${lon}&zoom=10"
        ></iframe>
    `;
}

// Map type buttons
mapBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        mapBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const lastCity = localStorage.getItem('lastCity');
        if (lastCity) {
            getWeatherData(lastCity);
        }
    });
});

// Loading states
function showLoading() {
    document.querySelectorAll('.forecast-card, .weather-info, .weather-details, .info-card').forEach(el => {
        el.style.opacity = '0.6';
    });
}

function hideLoading() {
    document.querySelectorAll('.forecast-card, .weather-info, .weather-details, .info-card').forEach(el => {
        el.style.opacity = '1';
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const lastCity = localStorage.getItem('lastCity') || 'London';
    getWeatherData(lastCity);
}); 