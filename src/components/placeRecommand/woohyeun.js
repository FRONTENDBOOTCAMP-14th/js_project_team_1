import axios from "axios";
import { iconMap } from "../../js/main";

const placeHeader = document.querySelector(".header-area");

// 날씨 데이터를 받아 브라우저 렌더링하기 위한 함수
export function placeRecommendView(currentWeather) {
  // 파라미터 값이 없으면 빠른 반환
  if (!currentWeather) return;
  // 날씨 설명 가져옴
  const { description } = currentWeather.weather.at(0);
  // 아이콘 코드 가져옴
  const { icon } = currentWeather.weather.at(0);
  // 아이콘 코드 변환
  const iconCode = iconMap[icon];

  // 각함수 파라미터로 전달
  placeHeaderRender(description);
  renderPlaces(iconCode);
}

// header부분 동적으로 변환하기 위함 함수
function placeHeaderRender(description) {
  // 파라미터 값이 없으면 빠른 반환
  if (!description) return;
  // h2 요소 가져옴
  const h2 = placeHeader.querySelector("h2");

  // textContent를 이용하여 동적으로 변환
  h2.textContent = `📍 현재 날씨 ${description}, 놀러 가기 좋은 장소를 추천드릴게요 `;
}

async function renderPlaces(iconCode) {
  // try catch 문으로 성공, 에러처리
  // fetch -> axios로 수정
  try {
    const { data } = await axios.get("/data/place.json");

    const matchedGroups = data.filter((item) => item.weather_code.includes(iconCode));
    const carousel = document.getElementById("carousel");
    carousel.innerHTML = "";

    matchedGroups.forEach((group) => {
      group.place_recommend.forEach((place) => {
        const li = document.createElement("li");
        li.className = "place-card";
        li.innerHTML = `
        <a href="#">
          <div class="place-img-wrap">
            <img src="${place.img_url}" alt="${place.place_name}" style="width:100%; height:100%; object-fit:cover; border-radius:32px;" />
          </div>
          <div class="place-info">
            <div class="place-title">${place.place_name}</div>
            <div class="place-address">${place.address}</div>
            <div class="place-desc">${place.description}</div>
          </div>
        </a>
      `;
        carousel.appendChild(li);
      });
    });

    updateArrows();
    scrollToIndex(0);
  } catch (error) {
    console.error(error);
  }
}

function getCardWidth() {
  const card = document.querySelector(".place-card");
  return card ? card.offsetWidth + 8 : 400;
}

function scrollToIndex(idx) {
  const scrollX = idx * getCardWidth();
  carousel.parentNode.scrollTo({ left: scrollX, behavior: "smooth" });
}

function getArrowSvg(direction, size) {
  const d =
    direction === "left"
      ? `<path d="M${size * 0.63} ${size * 0.78}L${size * 0.375} ${size / 2}L${size * 0.63} ${
          size * 0.22
        }"
         stroke="#222222" stroke-width="${
           size / 11
         }" stroke-linecap="round" stroke-linejoin="round" />`
      : `<path d="M${size * 0.375} ${size * 0.78}L${size * 0.63} ${size / 2}L${size * 0.375} ${
          size * 0.22
        }"
         stroke="#222222" stroke-width="${
           size / 11
         }" stroke-linecap="round" stroke-linejoin="round" />`;

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#ffffff"/>
      ${d}
    </svg>
  `;
}

function updateArrows() {
  let size = 60;
  if (window.innerWidth <= 640) size = 28;

  const left = document.querySelector(".carousel-arrow.left .arrow-svg");
  const right = document.querySelector(".carousel-arrow.right .arrow-svg");

  if (left && right) {
    left.innerHTML = getArrowSvg("left", size);
    right.innerHTML = getArrowSvg("right", size);
  }

  const outer = document.getElementById("carouselOuter");
  const rect = outer.getBoundingClientRect();
  const y = rect.top + rect.height / 2 + window.scrollY;
  document.getElementById("arrowLeft").style.top = `${y}px`;
  document.getElementById("arrowRight").style.top = `${y}px`;
}

let carousel = document.getElementById("carousel");
let currentIndex = 0;

const visibleCount = () => {
  if (window.innerWidth <= 600) return 1;
  if (window.innerWidth <= 900) return 2;
  if (window.innerWidth <= 1400) return 3;
  return 4;
};

document.getElementById("arrowLeft").onclick = () => {
  if (currentIndex === 0) currentIndex = carousel.children.length - visibleCount();
  else currentIndex = Math.max(currentIndex - 1, 0);
  scrollToIndex(currentIndex);
};

document.getElementById("arrowRight").onclick = () => {
  if (currentIndex >= carousel.children.length - visibleCount()) currentIndex = 0;
  else currentIndex = Math.min(currentIndex + 1, carousel.children.length - visibleCount());
  scrollToIndex(currentIndex);
};

window.addEventListener("resize", () => {
  updateArrows();
  currentIndex = Math.min(currentIndex, carousel.children.length - visibleCount());
  scrollToIndex(currentIndex);
});

window.addEventListener("scroll", updateArrows);
