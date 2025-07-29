import axios from "axios";
const API_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;

// axios의 get 메서드를 통해 openWeatherMap API의 날씨데이터를 가져옴
// 위도,경도를 파라미터로 사용

const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;

// 현재날씨 가져오기
export async function getCurrentWeather(lat, lon) {
  const { data } = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
    params: {
      appid: API_KEY, // API_KEY
      lang: "kr",
      units: "metric",
      lat,
      lon,
    },
  });

  return data;
}

// 하루 3시간간격 5일치 날씨정보 가져오기
export async function getForecastWeather(lat, lon) {
  const { data } = await axios.get("https://api.openweathermap.org/data/2.5/forecast", {
    params: {
      appid: API_KEY, // API_KEY
      lang: "kr",
      units: "metric",
      lat,
      lon,
    },
  });

  return data;
}
