import { iconMap } from "../../js/main.js";

// 메인 함수 (main.js에서 forecast Data 받아옴)
export function renderWeeklyForecast(forecastWeatherList) {
  // console.log("주간예보 렌더 시작!");

  const dailyArray = groupByDate(forecastWeatherList.list);

  const items = document.querySelectorAll(".weekly-forecast-item");
  for (let i = 0; i < items.length && i < dailyArray.length; i++) {
    renderDayForecast(items[i], dailyArray[i]);
  }
}

// (1) 데이터 받아오기 (lat, lon 파라미터로 받음)
// async function fetchForecast(lat, lon) {
//   const forecastWeather = await getForecastWeather(lat, lon);
//   console.log("예보데이터", forecastWeather);
//   return forecastWeather.list;
// }

// (2) 날짜별로 묶기
function groupByDate(forecastList) {
  const dailyMap = {};

  // console.log(forecastList);
  forecastList.forEach((data) => {
    const dateStr = getDateStr(data.dt);
    if (!dailyMap[dateStr]) dailyMap[dateStr] = [];
    dailyMap[dateStr].push(data);
  });
  return Object.values(dailyMap);
}

// (3) "YYYY-MM-DD" 문자열로 변환
function getDateStr(dt) {
  const dateObj = new Date(dt * 1000);
  dateObj.setHours(dateObj.getHours() + 9); // 한국 시간대 보정
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// (4) 각 요일 박스 렌더링
function renderDayForecast(item, dayDataArr) {
  // 대표 시간(오전 9시, 없으면 첫 데이터)
  let rep =
    dayDataArr.find((d) => {
      const hour = getKoreanHour(d.dt);
      return hour === 9;
    }) || dayDataArr[0];

  // 날짜, 요일
  const dateObj = new Date(rep.dt * 1000);
  dateObj.setHours(dateObj.getHours() + 9); // 한국 시간 보정
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  const formattedDate = `${month}.${day}`;
  const dayIndex = dateObj.getDay();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const dayLabel = weekdays[dayIndex] + "요일";

  // 최저/최고기온
  const minTemp = Math.round(Math.min(...dayDataArr.map((d) => d.main.temp_min)));
  const maxTemp = Math.round(Math.max(...dayDataArr.map((d) => d.main.temp_max)));

  // 텍스트 넣기
  item.querySelector(".forecast-label").textContent = dayLabel;
  item.querySelector(".forecast-date").textContent = formattedDate;
  item.querySelector(".min-temp").textContent = `${minTemp}°`;
  item.querySelector(".max-temp").textContent = `${maxTemp}°`;

  // 오전/오후 날씨 아이콘 넣기
  const cells = item.querySelectorAll(".day-weather-cell");

  // 오전 데이터
  if (cells.length >= 1 && dayDataArr.length >= 1) {
    let morning = dayDataArr.find((d) => getKoreanHour(d.dt) === 9) || dayDataArr[0];
    const iconCode = iconMap[morning.weather[0].icon];

    let img = cells[0].querySelector("img");
    if (!img) {
      img = document.createElement("img");
      cells[0].appendChild(img);
    }

    img.src = `/assets/weatherIcon/${iconCode}.svg`;
    img.alt = morning.weather[0].description;
  }

  // 오후 데이터
  if (cells.length >= 2 && dayDataArr.length >= 1) {
    let afternoon =
      dayDataArr.find((d) => getKoreanHour(d.dt) === 15) || dayDataArr[dayDataArr.length - 1];

    const iconCode = iconMap[afternoon.weather[0].icon];

    let img = cells[1].querySelector("img");
    if (!img) {
      img = document.createElement("img");
      cells[1].appendChild(img);
    }

    img.src = `/assets/weatherIcon/${iconCode}.svg`;
    img.alt = afternoon.weather[0].description;
  }
}

// (5) dt값 → 한국 기준 시간(hour) 추출 함수
function getKoreanHour(dt) {
  const date = new Date(dt * 1000);
  date.setHours(date.getHours() + 9); // KST 보정
  return date.getHours();
}

// export { renderWeeklyForecast };
