import axios from "axios";
import { iconMap } from "../../js/main";

const placeHeader = document.querySelector(".header-area");

export function placeRecommendView(currentWeather) {
  if (!currentWeather) return;
  const { description } = currentWeather.weather.at(0);
  const { icon } = currentWeather.weather.at(0);
  const iconCode = iconMap[icon];
  placeHeaderRender(description);
  renderPlaces(iconCode);
}

function placeHeaderRender(description) {
  if (!description) return;
  const h2 = placeHeader.querySelector("h2");
  h2.textContent = `📍 현재 날씨 ${description}, 놀러 가기 좋은 장소를 추천드릴게요 `;
}

async function renderPlaces(iconCode) {
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
        <a href="/src/components/mapLocation/map-location.html?id=${place.id}">
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
    alert("추천장소 데이터를 불러오는데에 실패했습니다.. 잠시후 다시 시도해주세요");
    console.error(error);
  }
}

function getCardWidth() {
  const card = document.querySelector(".place-card");
  const list = document.querySelector(".place-list");
  if (card && list) {
    const style = getComputedStyle(list);
    const gap = parseInt(style.gap) || 0;
    return card.offsetWidth + gap;
  }
  return 400 + 32;
}

function scrollToIndex(idx) {
  const carousel = document.getElementById("carousel");
  const outer = carousel.parentNode;
  const totalWidth = carousel.scrollWidth;
  const outerWidth = outer.clientWidth;
  const maxScroll = totalWidth - outerWidth;
  let scrollX = idx * getCardWidth();

  const maxIndex = getMaxIndex();
  if (idx >= maxIndex) {
    scrollX = maxScroll;
  } else if (scrollX > maxScroll) {
    scrollX = maxScroll;
  }
  if (scrollX < 0) scrollX = 0;
  outer.scrollTo({ left: scrollX, behavior: "smooth" });
}

function getArrowSvg(direction, size = 60) {
  const arrow =
    direction === "left"
      ? `<polyline points="50,25 30,40.5 50,56" fill="none" stroke="black" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<polyline points="30,25 50,40.5 30,56" fill="none" stroke="black" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 80 81" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40.5" r="40" fill="#ffffff"/>
      ${arrow}
    </svg>
  `;
}

function updateArrows() {
  let size = 60;
  if (window.innerWidth <= 1000) size = 38;
  if (window.innerWidth <= 640) size = 28;
  const outer = document.querySelector(".carousel-outer");
  const left = outer.querySelector(".carousel-arrow.left .arrow-svg");
  const right = outer.querySelector(".carousel-arrow.right .arrow-svg");
  console.log(document.querySelector(".carousel-arrow.left .arrow-svg"));
  if (left && right) {
    left.innerHTML = getArrowSvg("left", size);
    right.innerHTML = getArrowSvg("right", size);
  }
}

let currentIndex = 0;

function visibleCount() {
  if (window.innerWidth <= 600) return 1;
  if (window.innerWidth <= 900) return 2;
  if (window.innerWidth <= 1400) return 3;
  return 4;
}

const MOVE_COUNT = 1;

function getMaxIndex() {
  const carousel = document.getElementById("carousel");
  return Math.max(carousel.children.length - visibleCount(), 0);
}

document.getElementById("arrowLeft").onclick = () => {
  const carousel = document.getElementById("carousel");
  const maxIndex = getMaxIndex();
  if (maxIndex === 0) {
    currentIndex = 0;
  } else if (currentIndex === 0) {
    currentIndex = maxIndex;
  } else {
    currentIndex = Math.max(currentIndex - MOVE_COUNT, 0);
  }
  scrollToIndex(currentIndex);
};

document.getElementById("arrowRight").onclick = () => {
  const carousel = document.getElementById("carousel");
  const maxIndex = getMaxIndex();
  if (maxIndex === 0) {
    currentIndex = 0;
  } else if (currentIndex >= maxIndex) {
    currentIndex = 0;
  } else {
    currentIndex = Math.min(currentIndex + MOVE_COUNT, maxIndex);
  }
  scrollToIndex(currentIndex);
};

window.addEventListener("resize", () => {
  updateArrows();
  const carousel = document.getElementById("carousel");
  const maxIndex = getMaxIndex();
  currentIndex = Math.min(currentIndex, maxIndex);
  scrollToIndex(currentIndex);
});
updateArrows();
