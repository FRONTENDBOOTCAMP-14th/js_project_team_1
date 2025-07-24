"use strict";
import axios from "axios";
import { getCurrentWeather, getForecastWeather } from "../../service/openWeatherMap";
import { getCurrentLocation } from "../../service/kakaoMap";

/* 요소 선택 */
const currentTime = document.querySelector(".current-time");
const searchInput = document.querySelector(".search-input");
const searchLists = document.querySelector(".search-lists");
const weatherSearchForm = document.querySelector(".weather-search-form");
const weatherInfo = document.querySelector(".weather-info");
const weatherHourly = document.querySelector(".weather-hourly");
const inputResetButton = document.querySelector(".input-reset-button");

/* 유틸 상수 */

// API에서 밭은 icon 코드변환의 목적으로 만든 상수
const iconMap = {
  "01d": "01",
  "01n": "01",
  "02d": "02",
  "02n": "02",
  "03d": "03",
  "03n": "03",
  "04d": "04",
  "04n": "04",
  "09d": "09",
  "09n": "09",
  "10d": "10",
  "10n": "10",
  "11d": "11",
  "11n": "11",
  "13d": "13",
  "13n": "13",
  "50d": "50",
  "50n": "50",
};
// UTC 시간을 한국시간으로 바꾸기위한 상수
const TIMEZONE = 9 * 60 * 60 * 1000;
// 기본 서울 위치 데이터
const SEOUL = {
  lat: 37.5665,
  lon: 126.978,
  city: "서울특별시",
};

/* 상태 변수 */
let cities = [];

/* 초기 실행 */
// 현재 시간 가져옴
getDateRender();
//setInterval()를 이용하여 초단위로 현재시간을 재생성
setInterval(getDateRender, 1000);
// 50개의 도시정보와 현재 위치 정보를 가져오기위한 함수
initCitiesAndLocation();
// .search-wrapper를 제외한 다른 영역 클릭시 목록 hidden처리되는 함수 실행
outsideClick();
// 브라우저 렌더링시 날씨 랜더함수 실행
renderView();

/* 이벤트 리스너 */
// .search-input에 디바운스 유틸 함수를 사용하여 이벤트 등록
searchInput.addEventListener("input", debounce(typeAhead));
// 키보드 조작으로 자동완성 포커스
searchInput.addEventListener("keydown", (e) => {
  // 아랫키 입력시
  if (e.key === "ArrowDown") {
    // 브라우저 기본 동작 막음
    e.preventDefault();
    // .search-lists의 버튼가져옴
    const firstFocus = searchLists.querySelector("button");
    // 없으면 빠른 반환
    if (!firstFocus) return;
    // 처음 버튼 포커스
    firstFocus.focus();
  }
});
// 키보드 조작으로 자동완성 포커스
searchLists.addEventListener("keydown", (e) => {
  // .search-lists의 모든 버튼을 가져와 Nodelist가 아닌 Array로 가져옴
  const focusButtons = Array.from(searchLists.querySelectorAll("button"));
  // 현재 문서에 포커스 되어있는 요소를 가져와 index number를 가져옴
  const index = focusButtons.indexOf(document.activeElement);

  // 아랫키 입력시
  if (e.key === "ArrowDown") {
    // 브라우저 기본 동작 막음
    e.preventDefault();
    // index가 버튼배열의 길이 - 1보다 작을때
    if (index < focusButtons.length - 1) {
      // 다음 리스트아이템으로 포커스
      const nextItem = focusButtons[index + 1];
      nextItem.focus();
    } else {
      // 위 조건이 참이 아닐시
      // 입력창으로 다시 포커스
      searchInput.focus();
    }
  }

  // 윗키 입력시
  if (e.key === "ArrowUp") {
    // 브라우저 기본 동작 막음
    e.preventDefault();
    // index가 0이상 일때
    if (index) {
      // 이전 리스트아이템으로 포커스
      const prevItem = focusButtons[index - 1];
      prevItem.focus();
    } else {
      // index가 0일시 입력창으로 다시 포커스
      searchInput.focus();
    }
  }
});
// 자동완성 리스트 이벤트 등록
searchLists.addEventListener("click", (e) => {
  // 사용자가 클릭한 실제 요소가 li가 아닐시 빠른 반환
  if (!e.target.closest("button")) return;

  // 사용자가 클릭한 실제 요소가 li일시
  // li 태그안의 textContent를 가져와 .input-search 값으로 할당
  searchInput.value = e.target.closest("button").textContent;

  // 이후 자동완성 리스트 목록 hidden으로 감춤
  e.currentTarget.setAttribute("hidden", "true");
  // .search-input 보더 style class 제거
  searchInput.classList.remove("remove-border");
});
// submit 이벤트 등록
weatherSearchForm.addEventListener("submit", (e) => {
  e.preventDefault(); // 브라우저 기본동작 제어

  // name='search-input'인 input을 찾아 값을 가져옴
  const city = weatherSearchForm["search-input"].value.trim();

  // city data의 name_kr과 일치하는 값을 find()메서드를 통해 가져옴
  const matchCity = cities.find(({ name_kr }) => name_kr === city);

  // 일치하는 city가 없으면 브라우저 경고창과 함께 빠른 반환
  if (!matchCity) {
    alert("일치하는 도시가 없습니다.");
    return;
  }

  // 일치하는 city가 있으면 위도,경도,이름을 구조분해 할당
  const { lat, lon, name_kr } = matchCity;

  // 랜더함수에 matchCity에서 구조분해 할당한 값을 파라미터로 전달
  renderView(lat, lon, name_kr);
});
// input reset button 이벤트 등록
inputResetButton.addEventListener("click", () => {
  // button 클릭시 인풋값 없앰
  searchInput.value = "";
  // .searech-lists 숨김
  searchLists.setAttribute("hidden", "true");
  // .search-input 클래스 삭제 (보더 스타일 관련)
  searchInput.classList.remove("remove-border");
  // reset button에 disabled 속성 추가
  inputResetButton.setAttribute("disabled", "true");
});

/* 메인 함수 (비동기) */

// 도시정보, 현재위치 정보 가져오는 함수
async function initCitiesAndLocation() {
  // try..catch 문으로 비동기 함수 성공, 에러 처리
  try {
    // axios.get을 이용해 데이터를 가져오고 {data}로 구조분해 할당
    const { data } = await axios.get("/data/kr-50cities.json");
    // cities 변수안에 data 할당
    cities = data;
    // 현재 위치의 위도와 경도를 가져오는 브라우저 기본 API
    // 수락시 success 콜백함수 , 거절시 error 콜백함수를 실행
    navigator.geolocation.getCurrentPosition(successLocation, errorLocation);
  } catch (error) {
    console.error("데이터 로딩 실패..", error);
  }
}
// 브라우저 렌더링 함수
// 초기 브라우저 로딩시 기본 서울의 날씨 정보를 사용(현재위치 정보 제공 거절시)
async function renderView(lat = SEOUL.lat, lon = SEOUL.lon, city = SEOUL.city) {
  // try..catch 문으로 비동기 함수 성공, 에러 처리
  try {
    // Promise.all()을 통해 비동기API함수 동시 호출
    const [currentWeather, forecastWeather] = await Promise.all([
      getCurrentWeather(lat, lon),
      getForecastWeather(lat, lon),
    ]);

    // DOM 요소 생성 함수에 data, city 파라미터로 전달
    createTemplate(currentWeather, city);
    // ICON 이미지 생성 함수에 data 파라미터로 전달
    createIcon(currentWeather);
    // hourly 생성 함수에 list 파라미터로 전달
    forecastData(forecastWeather.list);
  } catch (error) {
    console.error("데이터 로딩 실패..", error);
  }
}
// 현재 위치 정보 수락시 실행될 함수, position을 파라미터로 받음
async function successLocation(position) {
  // 위도, 경도 정보를 구조분해할당으로 가져옴
  const { latitude, longitude } = position.coords;

  // 소수점 정리
  const lat = latitude.toFixed(4); // 위도
  const lon = longitude.toFixed(4); // 경도

  // try..catch 문으로 비동기 함수 성공, 에러 처리
  try {
    // service폴더 내에 카카오맵 API를 사용하여 행구역 데이터를 가져옴
    const data = await getCurrentLocation(lat, lon);

    // 데이터 없을때 경고창
    if (!data) {
      console.error("잠시후 다시 시도해 주세요..");
      alert("위치 정보를 가져오지 못했습니다. 잠시후 다시 시도해주세요..");
      return;
    }

    const region1 = data.documents.at(0).region_1depth_name; // 서울시, 경기도 등
    const region2 = data.documents.at(0).region_2depth_name; // 시흥시, 안산시 등

    let cityName;

    // 만약 region1 상수에 특별시 또는 광역시가 포함되어있으면 그대로 사용
    if (region1.includes("특별시") || region1.includes("광역시")) {
      cityName = region1;
    } else {
      // region2 상수 이름이 시로 끝났을때 그대로 사용
      if (region2.endsWith("시")) {
        cityName = region2;
      } else {
        // region2의 이름이 시로 끝나지 않았을때 (용인시 처인구 등)
        // '시' 앞부분만 잘라와 '시'를 붙여서 이름 전달
        // 예) region2 = '용인시 처인구' => '용인' + '시'
        cityName = region2.split("시")[0] + "시";
      }
    }

    // 브라우저 렌더함수에 위도,경도,도시이름 전달
    renderView(lat, lon, cityName);
  } catch (error) {
    console.error("위치 정보를 가져오지 못했습니다..", error);
  }
}
// 현재 위치 정보 거절시 실행될 함수
function errorLocation() {
  console.log("현재 위치 검색을 거절 하여, 서울 날씨 데이터를 보여줍니다.");
}

/* 함수 (일반)*/

// 자동완성기능 함수
function typeAhead(e) {
  // input의 value를 search 상수에 할당
  const search = e.target.value.trim();

  // 포커스 인덱스 변수 => -1은 어떠한 포커스에도 잡히지않았다는 의미
  let focusedIndex = -1;

  // .search-lists안 모든 버튼을 가져와 Nodelist가 아닌 Array로 만듬
  const buttons = Array.from(searchLists.querySelectorAll("button"));

  // 문서에 포커스가 되어있는 요소 가져옴
  const activeEl = document.activeElement;
  // 포커스가 되어있는 요소의 버튼을 버튼배열에서 인덱스로 번호를 찾아
  // 변수에 할당
  focusedIndex = buttons.indexOf(activeEl);

  // .search-lists에 DOM이 무제한 추가되는 현상 방지 (초기화)
  searchLists.innerHTML = "";

  // search값이 없을때 빠른 반환
  if (!search) {
    // .searech-lists 숨김
    searchLists.setAttribute("hidden", "true");
    // .search-input 클래스 삭제 (보더 스타일 관련)
    searchInput.classList.remove("remove-border");
    // reset button에 disabled 속성 추가
    inputResetButton.setAttribute("disabled", "true");
    return;
  }

  // search 값이 있으면 reset button 추가
  inputResetButton.removeAttribute("disabled");
  // filter()메서드를 이용하여 search값으로 시작하는 도시 이름 필터링
  const searchList = cities.filter(({ name_kr }) => name_kr.startsWith(search));

  // 만약 필터링된 배열이 존재하지 않을때 빠른 반환
  if (searchList.length === 0) {
    searchLists.setAttribute("hidden", "true");
    searchInput.classList.remove("remove-border");
    return;
  }

  // reduce()메서드를 이용하여 li태그 반환
  const listTemplate = searchList.reduce((acc, cur) => {
    // li태그 생성
    const li = document.createElement("li");
    li.setAttribute("role", "option");
    // li태그에 부분강조 함수를 이용하여 내부 컨텐츠 삽입
    li.innerHTML = `<button type="submit">${highLight(cur.name_kr, search)}</button>`;
    // 콜백의 반환값을 누적시킨 acc에 push()메서드를 사용하여 li태그 추가
    acc.push(li);
    // acc 반환
    return acc;
  }, []);
  // .searchLists에 append()메서드를 이용하여 DOM요소(listTemplate[]) 추가
  searchLists.append(...listTemplate);
  // 자동완성 리스트목록을 보여주어야 하기 때문에 hidden 속성 제거
  searchLists.removeAttribute("hidden");
  // .search-input 보더 style class 추가
  searchInput.classList.add("remove-border");

  // .search-lists에 생성된 li>button 요소 모두 가져와 배열로 만듬
  const newButtons = Array.from(searchLists.querySelectorAll("button"));
  // focusedIndex가 -1이면 포커스 복원 X
  // 0이상이면 버튼에 포커스 복원
  if (focusedIndex >= 0 && focusedIndex < newButtons.length) {
    newButtons[focusedIndex].focus();
  }
}
// .search-wrapper를 제외한 다른 영역 클릭시 목록 hidden처리되는 함수
function outsideClick() {
  // 문서에 이벤트 핸들러 등록
  document.addEventListener("click", (e) => {
    // 사용자가 실제 클릭한 요소로부터 위로 .search-wrapper를 찾고
    // 만약 .search-wrapper가 있으면 빠른반환
    if (e.target.closest(".search-wrapper")) return;
    // .search-wrapper가 없으면 자동완성 목록 숨김 + input 보더 클래스 속성 삭제
    searchLists.setAttribute("hidden", "true");
    searchInput.classList.remove("remove-border");
  });
}
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
  // .current-weather-time DOM요소에 포맷된 문자열 삽입
  currentTime.textContent = getDay;
}
// Main DOM 요소 생성 함수
function createTemplate(data, city) {
  // .weather-info안에 .weather-summary 요소 선택
  const template = weatherInfo.querySelector(".weather-summary");
  // innerHTML를 이용하여 DOM 작성
  template.innerHTML = `
    <h3 class="weather-location">
    ${city}<span class="data-time"><time>(${
    new Date(data.dt * 1000).toLocaleTimeString() /* UnixTime 변환 */
  }기준)</time>
    </span>
    </h3>
    <p class="weather-temp">${data.main.temp.toFixed(1) /*소수점 한자리 */}°C</p>
    <div class="weather-detail">
      <span>${data.weather.at(0).description}</span>
      <div class="weather-temp">
        <span>최저 ${data.main.temp_min.toFixed(1)}°C</span>
        <span>최고 ${data.main.temp_max.toFixed(1)}°C</span>
      </div>
    </div>
    <div class="weather-detail-sub">
      <span>체감 ${data.main.feels_like.toFixed(1)}°C</span>
      <span>습도 ${data.main.humidity}%</span>
      <span>풍속 ${data.wind.speed}m/s</span>
    </div>
  `;
  // 요소 반환
  return template;
}
// 날씨 상태에 따른 아이콘 이미지 렌더 함수
function createIcon(data) {
  // .weather-icon 요소를 가져옴
  const template = weatherInfo.querySelector(".weather-icon");
  // data내의 weather배열 데이터에서 첫번째 인덱스를 가져와
  // 구조분해할당을 이용해 icon 코드값만 가져옴
  const { icon } = data.weather.at(0);
  // Object[key]를 이용해 변형한 code값을 가져옴
  const iconCode = iconMap[icon];
  // innerHTML를 이용하여 DOM 작성
  template.innerHTML = `
    <img
      src="/src/assets/weatherIcon/${iconCode}.svg"
      alt="날씨 아이콘"
      aria-hidden="true"
    />
  `;
  // 요소 반환
  return template;
}
// hourly 날씨 정보 생성 함수
function forecastData(list) {
  // 현재 날짜를 가져옴
  const currentDate = new Date();

  // 현재 날짜와 시간을 getTime()메서드를 통해 ms 초단위로 변경후
  // TIMEZONE(9시간)을 더해 한국 현재 시간으로 맞춘후 slice로 년,월,일만 가져옴
  // (예 2025-07-23)
  // toISOString()를 사용하면 UTC시간 기준이기때문에 한국시간보다 9시간 늦은 데이터를 반환
  const formatCurrentDate = new Date(currentDate.getTime() + TIMEZONE).toISOString().slice(0, 10);

  // 현재 날짜를 가져옴
  let tomorrowDate = new Date();
  // getDate()메서드를 사용하여 금일 일수에서 +1을 하여 다음날 일수로 바꿔줌
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  // 시간을 00:00:00로 변경
  tomorrowDate.setHours(0, 0, 0, 0);

  // 원하는 데이터 형식으로 포맷
  const formatTomorrowDate = new Date(tomorrowDate.getTime() + TIMEZONE).toISOString().slice(0, 10);

  // 3hour/5days API로 받아온 데이터 리스트를 필터링
  const filterList = list.filter((item) => {
    // dt데이터가 ms 단위로 보여 주기 때문에 1000을 곱하여 현재 시각으로 변경
    const data_dt = new Date(item.dt * 1000);
    // 현재 날짜와 같은 데이터 와 현재 날짜의 시간과 같거나 큰 데이터 값을
    // 연산자를 이용하여 boolean 값을 상수에 할당
    const isToday =
      new Date(data_dt.getTime() + TIMEZONE).toISOString().startsWith(formatCurrentDate) &&
      data_dt.getHours() >= currentDate.getHours();

    // 다음날 날짜를 포맷한 값과 동일한 데이터값을 가져오기 위한 boolean 값
    const isTomorrow = new Date(data_dt.getTime() + TIMEZONE)
      .toISOString()
      .startsWith(formatTomorrowDate);

    // true인것을 모두 가져와 새로운 배열로 변환
    return isToday || isTomorrow;
  });

  // 많은 데이터를 가져와 화면에 보여줄때는 8개만 잘라 보여주기위해
  // slice로 리스트항목 재설정
  const slicedList = filterList.slice(0, 8);

  // .hourly-lists 요소 가져옴
  const hourlyLists = weatherHourly.querySelector(".hourly-lists");

  // 데이터 리스트 배열을 map()을 이용하여 요소를 만듬
  const template = slicedList
    .map((data) => {
      // new Date()의 시간을 가져와 두자릿수로 만듬 (7 => 07)
      const hours = new Date(data.dt * 1000).getHours();
      const formatHours = String(hours).padStart(2, "0");

      // data내의 weather배열 데이터에서 첫번째 인덱스를 가져와
      // 구조분해할당을 이용해 icon 코드값만 가져옴
      const { icon } = data.weather.at(0);

      // Object[key]를 이용해 변형한 code값을 가져옴
      const iconCode = iconMap[icon];

      // 요소 반환
      // map 사용시 배열안에 문자열이 들어있는 배열이 만들어지므로
      // join("")을 사용해 하나의 문자열로 합친다
      return `
      <li class="hourly-item">
        <time class="hourly-time">${formatHours}시</time>
        <span class="hourly-icon">
          <span class="sr-only">${data.weather.at(0).description}</span>
          <img
            src="/src/assets/weatherIcon/${iconCode}.svg"
            alt="날씨 아이콘"
            aria-hidden="true"
          />
        </span>
        <span class="hourly-temp">${data.main.temp.toFixed(1)}℃</span>
      </li>
    `;
    })
    .join("");

  // innerHTML에 요소 삽입
  hourlyLists.innerHTML = template;
}

/* 유틸 함수 */

// 부분강조 함수
function highLight(name, keyword) {
  // name문자열의 앞에서부터 keword의 길이만큼 잘라냄
  const toBold = name.substring(0, keyword.length);
  // keyword 길이 뒤부터 끝까지 잘라냄
  const restName = name.substring(keyword.length);
  // 강조해야할 부분은 <strong>태그로 감싸 반환
  return `<strong>${toBold}</strong>${restName}`;
}
// 디바운스 함수
// callback : 실제로 실행할 함수
// delay : 연속 호출 중 마지막 호출 후에 delay값 만큼 실행할지 (기본값 300ms)
function debounce(callback, delay = 300) {
  // setTimeout()함수의 ID를 저장할 변수. (clearTimeout을 위해)
  let cleanup;

  // 새로운 익명의 함수를 반환
  // 이후 반환된 함수가 callback으로 등록됨
  // ...args => 모든 인자를 그대로 받는다 (event 등)
  return (...args) => {
    // 사용자가 input에 값을 입력할때마다 clearTimeout 함수를 실행
    // 즉 이전 setTimeout()를 취소
    clearTimeout(cleanup);
    // 변수에 setTimeout()의 ID를 저장
    // delay시간 만큼 callback 함수를 실행
    cleanup = setTimeout(() => {
      // callback함수의 모든 인자를 받아 실행
      callback(...args);
    }, delay);
  };
}
