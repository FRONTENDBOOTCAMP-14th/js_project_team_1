import { getCurrentWeather, getForecastWeather } from "../service/openWeatherMap";

export async function getWeatherData(lat, lon) {
  try {
    // Promise.all()을 통해 비동기API함수 동시 호출
    const [currentWeather, forecastWeather] = await Promise.all([
      getCurrentWeather(lat, lon),
      getForecastWeather(lat, lon),
    ]);

    // 날씨 정보 데이터 반환
    return { currentWeather, forecastWeather };
  } catch (error) {
    alert("날씨정보를 가져오지 못했습니다. 잠시후 다시 시도해주세요..");
    console.error("데이터 로딩 실패..", error);
  }
}
