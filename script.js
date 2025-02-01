const API_KEY = "d5f6c8aa6c798ad4be98bb73e7041a87";

async function getWeather() {
  let city = document.getElementById("cityInput").value.trim();
  if (!city) {
    alert("Please enter a city name.");
    return;
  }

  try {
    let response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error("City not found.");
    }

    let data = await response.json();
    displayWeather(data);
  } catch (error) {
    console.error("Error fetching weather:", error);
    document.getElementById(
      "weatherDetails"
    ).innerHTML = `<p class="text-danger">${error.message}</p>`;
  }
}

function displayWeather(data) {
  document.getElementById("weatherDetails").innerHTML = `
        <div class="card">
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
