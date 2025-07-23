'use strict';
import axios from 'axios';
import { getCurrentWeather } from '../../service/openWeatherMap';

const currentTime = document.querySelector('.current-weather-time');
const searchInput = document.querySelector('.search-input');
const searchLists = document.querySelector('.search-lists');
const weatherSearchForm = document.querySelector('.weather-search-form');
const weatherInfo = document.querySelector('.weather-info');

// cities 변수를 외부에 선언
let cities = [];

// 현재 시간 가져옴
getDateRender();
//setInterval()를 이용하여 초단위로 현재시간을 재생성
setInterval(getDateRender, 1000);

// 비동기 함수 실행
get50Cities();
// .search-wrapper를 제외한 다른 영역 클릭시 목록 hidden처리되는 함수 실행
outsideClick();
// 브라우저 렌더링시 날씨 랜더함수 실행
renderView();

/* 자동완성 기능 */
/* 
public 폴더 안에있는 데이터를 fetch, axios등을 사용하여 가져오는게 아닌
import로 가져오려 하였으나 build시에 문제가 생길수도 있다는 vite의 경고문구 때문에
비동기 함수처리함
*/

// public 폴더 안에있는 한국 50개 도시 정보 데이터 가져오는 함수 (비동기)
async function get50Cities() {
  // axios.get을 이용해 데이터를 가져오고 {data}로 구조분해 할당
  const { data } = await axios.get('/cities-data/kr-50cities.json');

  // cities 변수안에 data 할당
  cities = data;
}

// .search-input에 디바운스 함수를 사용하여 이벤트 등록
searchInput.addEventListener('input', debounce(typeAhead));

// 자동완성 리스트 이벤트 등록
searchLists.addEventListener('click', (e) => {
  // 사용자가 클릭한 실제 요소가 li가 아닐시 빠른 반환
  if (!e.target.closest('li')) return;
  // 사용자가 클릭한 실제 요소가 li일시
  // li 태그안의 textContent를 가져와 .input-search 값으로 할당
  searchInput.value = e.target.closest('li').textContent;
  // 이후 자동완성 리스트 목록 hidden으로 감춤
  e.currentTarget.setAttribute('hidden', 'true');
  // .search-input 보더 style class 제거
  searchInput.classList.remove('remove-border');
});

// 자동완성기능 함수
function typeAhead(e) {
  // input의 value를 search 상수에 할당
  const search = e.target.value.trim();

  // .search-lists에 DOM이 무제한 추가되는 현상 방지 (초기화)
  searchLists.innerHTML = '';

  // search값이 없을때 빠른 반환
  if (!search) {
    // .searech-lists 숨김
    searchLists.setAttribute('hidden', 'true');
    // .search-input 클래스 삭제 (보더 스타일 관련)
    searchInput.classList.remove('remove-border');
    return;
  }

  // filter()메서드를 이용하여 search값으로 시작하는 도시 이름 필터링
  const searchList = cities.filter(({ name_kr }) => name_kr.startsWith(search));

  // 만약 필터링된 배열이 존재하지 않을때 빠른 반환
  if (searchList.length === 0) {
    searchLists.setAttribute('hidden', 'true');
    searchInput.classList.remove('remove-border');
    return;
  }

  // reduce()메서드를 이용하여 li태그 반환
  const listTemplate = searchList.reduce((acc, cur) => {
    // li태그 생성
    const li = document.createElement('li');
    // li태그에 부분강조 함수를 이용하여 내부 컨텐츠 삽입
    li.innerHTML = highLight(cur.name_kr, search);

    // 콜백의 반환값을 누적시킨 acc에 push()메서드를 사용하여 li태그 추가
    acc.push(li);

    // acc 반환
    return acc;
  }, []);

  // .searchLists에 append()메서드를 이용하여 DOM요소(listTemplate[]) 추가
  searchLists.append(...listTemplate);
  // 자동완성 리스트목록을 보여주어야 하기 때문에 hidden 속성 제거
  searchLists.removeAttribute('hidden');
  // .search-input 보더 style class 추가
  searchInput.classList.add('remove-border');
}

// 부분강조 함수
function highLight(name, keyword) {
  // name문자열의 앞에서부터 keword의 길이만큼 잘라냄
  const toBold = name.substring(0, keyword.length);
  // keyword 길이 뒤부터 끝까지 잘라냄
  const restName = name.substring(keyword.length);

  // 강조해야할 부분은 <strong>태그로 감싸 반환
  return `<strong>${toBold}</strong>${restName}`;
}

// .search-wrapper를 제외한 다른 영역 클릭시 목록 hidden처리되는 함수
function outsideClick() {
  // 문서에 이벤트 핸들러 등록
  document.addEventListener('click', (e) => {
    // 사용자가 실제 클릭한 요소로부터 위로 .search-wrapper를 찾고
    // 만약 .search-wrapper가 있으면 빠른반환
    if (e.target.closest('.search-wrapper')) return;

    // .search-wrapper가 없으면 자동완성 목록 숨김 + input 보더 클래스 속성 삭제
    searchLists.setAttribute('hidden', 'true');
    searchInput.classList.remove('remove-border');
  });
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

/* 현재 날짜, 시간 */
function getDateRender() {
  // 현재 날짜와 시간을 생성
  const time = new Date();

  // 지정한 옵션에 따라 포맷된 문자열 생성
  const getDay = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // 24시간제로 표기
  }).format(time);

  // .current-weather-time DOM요소에 포맷된 문자열 삽입
  currentTime.textContent = getDay;
}

/* openWeatherMap API */

// submit 이벤트 등록
weatherSearchForm.addEventListener('submit', (e) => {
  // 브라우저 기본동작 제어
  e.preventDefault();

  // name='search-input'인 input을 찾아 값을 가져옴
  const city = weatherSearchForm['search-input'].value.trim();

  // city data의 name_kr과 일치하는 값을 find()메서드를 통해 가져옴
  const matchCity = cities.find(({ name_kr }) => name_kr === city);

  // 일치하는 city가 없으면 브라우저 경고창과 함께 빠른 반환
  if (!matchCity) {
    alert('일치하는 도시가 없습니다.');
    return;
  }

  // 일치하는 city가 있으면 위도,경도,이름을 구조분해 할당
  const { lat, lon, name_kr } = matchCity;

  // 랜더함수에 matchCity에서 구조분해 할당한 값을 파라미터로 전달
  renderView(lat, lon, name_kr);
});

// 브라우저 렌더링 함수
// 초기 브라우저 로딩시 기본 서울의 날씨 정보를 사용 => 현재위치기반으로 수정예정
async function renderView(lat = 37.5665, lon = 126.978, city = '서울') {
  // service 폴더내에 모듈화한 함수를 호출하여 data를 가져옴
  const data = await getCurrentWeather(lat, lon);

  // DOM 요소 생성 함수에 data, city 파라미터로 전달
  createTemplate(data, city);
}

// DOM 요소 생성 함수
function createTemplate(data, city) {
  // .weather-info안에 .weather-summary 요소 선택
  const template = weatherInfo.querySelector('.weather-summary');
  // innerHTML를 이용하여 DOM 작성
  template.innerHTML = `
    <h3 class="weather-location">
    ${city}<span class="data-time"><time>(${new Date(
    data.dt * 1000
  ).toLocaleTimeString()}기준)</time>
    </span>
    </h3>
    <p class="weather-temp">${data.main.temp.toFixed(1)}°C</p>
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
