const API_KEY = "d5f6c8aa6c798ad4be98bb73e7041a87";

let temperatureChart = null;
var citiesList = [];

document.getElementById("cityInput").addEventListener("input", function () {
  let query = this.value.split(",").pop().trim();
  // Only search if at least 2 characters
  if (query.length < 2) return;

  fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
  )
    .then((response) => response.json())
    .then((data) => {
      let dropdownMenu = document.getElementById("cityDropdown");
      // Clear previous suggestions
      dropdownMenu.innerHTML = "";

      data.forEach((city) => {
        let option = document.createElement("div");
        option.className = "dropdown-item";
        option.textContent = `${city.name}, ${city.country}`;
        option.onclick = () => selectCity(city);
        dropdownMenu.appendChild(option);
      });

      dropdownMenu.style.display = data.length > 0 ? "block" : "none"; // Show only if results exist
    })
    .catch((error) => console.error("Error fetching cities:", error));
});
document.getElementById("clearBtn").addEventListener("click", clearWeatherData);

// Load Lottie animation
lottie.loadAnimation({
  container: document.getElementById("weatherAnimation"), // The div where animation will play
  renderer: "svg",
  loop: true,
  autoplay: true,
  path: "https://assets4.lottiefiles.com/packages/lf20_x62chJ.json" 
});


// Function to select a city and fetch weather
function selectCity(city) {
  let input = document.getElementById("cityInput");
  let cities = input.value.split(","); // Get all cities
  cities[cities.length - 1] = `${city.name}`; // Replace last typed city
  input.value = cities.join(", ");
  input.focus();
  document.getElementById("cityDropdown").style.display = "none"; // Hide dropdown
}

async function getWeather() {
  document.getElementById("cityDropdown").style.display = "none"; // Hide dropdown
  let cities = document.getElementById("cityInput").value.trim();

  if (!cities) {
    alert("Please enter a city name.");
    return;
  }

  let cityList = cities.split(",").map((city) => city.trim());

  const weatherForEachCity = cityList.map((city) =>
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
    )
      .then((response) =>
        response.ok
          ? response.json()
          : Promise.reject(`City ${city} not found!`)
      )
      .catch((error) => ({ city, error }))
  );

  try {
    const weatherData = await Promise.all(weatherForEachCity);
    displayWeather(weatherData);
    updateChart(weatherData);
  } catch (error) {
    console.error("Error fetching weather:", error);
    document.getElementById(
      "weatherDetails"
    ).innerHTML = `<p class="text-danger">${error.message}</p>`;
  }
}

function displayWeather(dataArray) {
  const weatherContainer = document.getElementById("weatherDetails");
  weatherContainer.innerHTML = "";

  dataArray.forEach((data) => {
    if (data.error) {
      weatherContainer.innerHTML += `<p class="text-danger">${data.error}</p>`;
    } else {
      weatherContainer.innerHTML += `
        <div class="card my-2">
            <div class="card-body">
                <h5 class="card-title">${data.name}, ${data.sys.country}</h5>
                <p class="card-text">
                    🌡️ Temperature: ${data.main.temp}°C<br>
                    ☁️ Weather: ${data.weather[0].description}<br>
                    💧 Humidity: ${data.main.humidity}%
                </p>
            </div>
        </div>`;
    }
  });
}

function updateChart(weatherData) {
  const cityNames = weatherData.map((city) =>
    city.error ? city.city + " ❌" : city.name
  );
  const temperaturesList = weatherData.map((city) =>
    city.error ? null : city.main.temp
  );

  const ctx = document.getElementById("temperatureChart").getContext("2d");

  // If a chart instance exists, destroy it before creating a new one
  if (temperatureChart) {
    temperatureChart.destroy();
  }

  temperatureChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: cityNames,
      datasets: [
        {
          label: "Temperature (°C)",
          data: temperaturesList,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function clearWeatherData() {
  citiesList = []; // Clear the stored cities
  document.getElementById("weatherDetails").innerHTML = ""; // Clear the displayed weather
  document.getElementById("cityInput").value = ""; // Reset the input field

  // Destroy the chart if it exists
  if (temperatureChart) {
    temperatureChart.destroy();
    temperatureChart = null;
  }
}
