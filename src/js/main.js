import "../components/currentWeather/currentWeather.js";
import { currentWeatherView } from "../components/currentWeather/currentWeather.js";
import "../components/playlist/playlist.js";
import { updatePlaylist } from "../components/playlist/playlist.js";
import "./darkmode.js";
import "./geolocation.js";
import { getWeatherData } from "./getWeatherData.js";

const currentTime = document.querySelector(".current-time");

// 기본 서울 위치 데이터
const SEOUL = {
  lat: 37.5665,
  lon: 126.978,
  city: "서울특별시",
};

/* 초기 실행 */
// 현재 시간 가져옴
getDateRender();
//setInterval()를 이용하여 초단위로 현재시간을 재생성
setInterval(getDateRender, 1000);
// 데이터 렌더 함수 실행
// 초기 브라우저 로딩시 기본 서울의 날씨 정보를 사용(현재위치 정보 제공 거절시)
renderView(SEOUL.lat, SEOUL.lon, SEOUL.city);

// 현재 날짜, 시간 렌더 함수
function getDateRender() {
  // 현재 날짜와 시간을 생성
  const time = new Date();
  // 지정한 옵션에 따라 포맷된 문자열 생성
  const getDay = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // 24시간제로 표기
  }).format(time);

  const toLocaleString = time.toLocaleString();

  const timeTag = currentTime.querySelector("time");
  // .current-weather-time DOM요소에 포맷된 문자열 삽입
  timeTag.textContent = getDay;
  timeTag.setAttribute("datetime", toLocaleString);
}

// 날씨 데이터 렌더 함수
export async function renderView(lat, lon, city) {
  // 비동기함수 getWeatherData()에 위도,경도 정보를 전달하여 데이터를 가져옴
  const { currentWeather, forecastWeather } = await getWeatherData(lat, lon);

  // 데이터를 파람스로 전달하여 현재날씨 렌더링
  currentWeatherView(currentWeather, forecastWeather, city);

  //사용자가 날씨를 검색하면 검색 한 곳의 플레이리스트로 업데이트
  updatePlaylist(currentWeather);
}
