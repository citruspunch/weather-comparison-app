const API_KEY = "d5f6c8aa6c798ad4be98bb73e7041a87";

let temperatureChart = null;

async function getWeather() {
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
          beginAtZero: false,
        },
      },
    },
  });
}
