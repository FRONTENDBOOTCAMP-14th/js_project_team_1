import axios from "axios";
import { iconMap, renderView } from "../../js/main";
import { debounce, highLight, updateHighlight } from "../../js/utils";

/* 요소 선택 */
const searchInput = document.querySelector(".search-input");
const searchLists = document.querySelector(".search-lists");
const weatherSearchForm = document.querySelector(".weather-search-form");
const weatherInfo = document.querySelector(".weather-info");
const weatherHourly = document.querySelector(".weather-hourly");
const inputResetButton = document.querySelector(".input-reset-button");
const searchWrapper = document.querySelector(".search-wrapper");

/* 유틸 상수 */
// UTC 시간을 한국시간으로 바꾸기위한 상수
const TIMEZONE = 9 * 60 * 60 * 1000;

/* 상태 변수 */
let cities = [];
let currentIndex = -1;
let currentSearch = "";

// .search-wrapper를 제외한 다른 영역 클릭시 목록 hidden처리되는 함수 실행
outsideClick();
// city 데이터 가져오는 함수 실행
citiesData();

/* 이벤트 리스너 */
// 디바운스 유틸 함수를 사용하여 핸들러 함수 생성
const debounceInputHandler = debounce((e) => {
  const search = e.target.value.trim();
  if (search === currentSearch) return;
  currentSearch = search;
  currentIndex = -1;
  typeAhead(search);
});
// input 이벤트 등록
searchInput.addEventListener("input", debounceInputHandler);
// 키보드 조작으로 자동완성 포커스
searchWrapper.addEventListener("keydown", (e) => {
  // .searchLists에서 li태그 모두 가져옴
  const items = searchLists.querySelectorAll("li");
  // items길이의 -1로 계산하여 인덱스를 저장
  const itemsIndex = items.length - 1;

  // .searchLists가 hidden이거나
  //  자동완성 목록이 없거나
  // 겁색결과 없는 목록 출력시
  // 빠른 반환
  if (searchLists.hidden || items.length === 0 || items[0].classList.contains("no-search")) return;

  // 화살표 아래방향키 입력시
  if (e.key === "ArrowDown") {
    // 브라우저 기본동작 막음
    e.preventDefault();
    // items 목록에서 순환하기 위한 로직
    currentIndex = currentIndex >= itemsIndex ? 0 : currentIndex + 1;
    updateHighlight(items, currentIndex);
  }
  // 화살표 윗방향키 입력시
  if (e.key === "ArrowUp") {
    e.preventDefault();
    // items 목록에서 순환하기 위한 로직
    currentIndex = currentIndex <= 0 ? itemsIndex : currentIndex - 1;
    updateHighlight(items, currentIndex);
  }

  // 엔터 입력시
  if (e.key === "Enter" && currentIndex >= 0) {
    e.preventDefault(); // 브라우저 기본동작 막음
    // 하이라이트된 목록의 textContent를 인붓 값에 넣어줌
    searchInput.value = items[currentIndex].textContent;
    // 자동완성 목록 숨김처리 함수 실행
    hideLists();
    // 자동완성 목록 아이템에서 Enter누를시 강제 Submit
    weatherSearchForm.requestSubmit();
  }
});
// 자동완성 리스트 이벤트 등록
searchLists.addEventListener("click", (e) => {
  // 사용자가 클릭한 실제 요소가 li가 아닐시 빠른 반환
  if (!e.target.closest("button")) return;

  // 사용자가 클릭한 실제 요소가 li일시
  // li 태그안의 textContent를 가져와 .input-search 값으로 할당
  searchInput.value = e.target.closest("button").textContent;

  // 자동완성 목록 숨김처리 함수 실행
  hideLists();
});

// input reset button 이벤트 등록
inputResetButton.addEventListener("click", () => {
  // button 클릭시 인풋값 없앰
  searchInput.value = "";
  // 자동완성 리스트 숨김 함수 실행
  hideLists();
  // reset button에 disabled 속성 추가
  inputResetButton.setAttribute("disabled", "true");
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
  hideLists();
});

/* 메인 함수 */

// 도시정보, 현재위치 정보 가져오는 함수
export async function citiesData() {
  // try..catch 문으로 비동기 함수 성공, 에러 처리
  try {
    // axios.get을 이용해 데이터를 가져오고 {data}로 구조분해 할당
    const { data } = await axios.get("/data/kr-50cities.json");
    // cities 변수안에 data 할당
    cities = data;

    return cities;
  } catch (error) {
    console.error("데이터 로딩 실패..", error);
  }
}

// 브라우저 렌더링 함수
export function currentWeatherView(currentData, forecastData, city) {
  // DOM 요소 생성 함수에 data, city 파라미터로 전달
  createTemplate(currentData, city);
  // ICON 이미지 생성 함수에 data 파라미터로 전달
  createIcon(currentData);
  // hourly 생성 함수에 list 파라미터로 전달
  hourlyTemplate(forecastData.list);
}

/* 함수 (일반)*/
// 자동완성기능 함수
function typeAhead(value) {
  // input의 value를 search 상수에 할당
  const search = value.trim();

  // search값이 없을때 빠른 반환
  if (!search) {
    hideLists();
    // reset button에 disabled 속성 추가
    inputResetButton.setAttribute("disabled", "true");
    return;
  }

  // search 값이 있으면 reset button 추가
  inputResetButton.removeAttribute("disabled");
  // filter()메서드를 이용하여 search값으로 시작하는 도시 이름 필터링
  const searchList = cities.filter(({ name_kr }) => name_kr.startsWith(search));

  // 만약 필터링된 배열이 존재하지 않을때
  if (searchList.length === 0) {
    // 자동완성 리스트목록을 보여주어야 하기 때문에 hidden 속성 제거
    searchLists.removeAttribute("hidden");
    // .search-input 보더 style class 추가
    searchInput.classList.add("remove-border");

    // .search-lists에 HTML 삽입
    searchLists.innerHTML = `
      <li role="option" class="no-search">검색 결과가 없습니다.</li>
    `;
    return;
  }

  // reduce()메서드를 이용하여 li태그 반환
  const listTemplate = searchList.reduce((acc, cur) => {
    // li태그 생성
    const li = document.createElement("li");
    // 속성 추가
    li.setAttribute("role", "option");
    // li태그에 부분강조 함수를 이용하여 내부 컨텐츠 삽입
    li.innerHTML = `<button type="submit" tabindex="-1">${highLight(cur.name_kr, search)}</button>`;
    // 콜백의 반환값을 누적시킨 acc에 push()메서드를 사용하여 li태그 추가
    acc.push(li);
    // acc 반환
    return acc;
  }, []);
  // .searchlists 초기화
  searchLists.innerHTML = "";
  // .searchLists에 innerHTML을 이용하여 DOM요소 추가
  searchLists.append(...listTemplate);
  // 자동완성 리스트목록을 보여주어야 하기 때문에 hidden 속성 제거
  searchLists.removeAttribute("hidden");
  // .search-input 보더 style class 추가
  searchInput.classList.add("remove-border");
}
// .search-wrapper를 제외한 다른 영역 클릭시 목록 hidden처리되는 함수
function outsideClick() {
  // 문서에 이벤트 핸들러 등록
  document.addEventListener("click", (e) => {
    // 사용자가 실제 클릭한 요소로부터 위로 .search-wrapper를 찾고
    // 만약 .search-wrapper가 있으면 빠른반환
    if (e.target.closest(".search-wrapper")) return;
    // .search-wrapper가 없으면 자동완성 목록 숨김 + input 보더 클래스 속성 삭제
    hideLists();
  });
}
// Main DOM 요소 생성 함수
function createTemplate(data, city) {
  // .weather-info안에 .weather-summary 요소 선택
  const template = weatherInfo.querySelector(".weather-summary");
  // innerHTML를 이용하여 DOM 작성
  template.innerHTML = `
    <h3 class="weather-location">
    ${city}<span class="data-time"><time>(${new Date(
    data.dt * 1000
  ).toLocaleTimeString()}기준)</time>
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
function hourlyTemplate(list) {
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

  // 많은 데이터를 가져와 화면에 보여줄때는 9개만 잘라 보여주기위해
  // slice로 리스트항목 재설정
  const slicedList = filterList.slice(0, 9);

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
// 자동완성 목록 숨김 함수
function hideLists() {
  // .searech-lists 숨김
  searchLists.setAttribute("hidden", "true");
  // .search-input 클래스 삭제 (보더 스타일 관련)
  searchInput.classList.remove("remove-border");
}
