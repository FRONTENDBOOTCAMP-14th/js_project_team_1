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
  return card ? card.offsetWidth + 32 : 400 + 32; // gap 포함
}

function scrollToIndex(idx) {
  const carousel = document.getElementById("carousel");
  const scrollX = idx * getCardWidth();
  carousel.parentNode.scrollTo({ left: scrollX, behavior: "smooth" });
}

function getArrowSvg(direction, size = 60) {
  const arrow =
    direction === "left"
      ? `<polyline points="50,25 30,40.5 50,56" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<polyline points="30,25 50,40.5 30,56" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 80 81" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40.5" r="40" fill="black"/>
      ${arrow}
    </svg>
  `;
}

function updateArrows() {
  let size = 60;
  if (window.innerWidth <= 1000) size = 38;
  if (window.innerWidth <= 640) size = 28;
  const left = document.querySelector(".carousel-arrow.left .arrow-svg");
  const right = document.querySelector(".carousel-arrow.right .arrow-svg");
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

document.getElementById("arrowLeft").onclick = () => {
  const carousel = document.getElementById("carousel");
  if (currentIndex === 0) currentIndex = carousel.children.length - visibleCount();
  else currentIndex = Math.max(currentIndex - 1, 0);
  scrollToIndex(currentIndex);
};

document.getElementById("arrowRight").onclick = () => {
  const carousel = document.getElementById("carousel");
  if (currentIndex >= carousel.children.length - visibleCount()) currentIndex = 0;
  else currentIndex = Math.min(currentIndex + 1, carousel.children.length - visibleCount());
  scrollToIndex(currentIndex);
};

window.addEventListener("resize", () => {
  updateArrows();
  const carousel = document.getElementById("carousel");
  currentIndex = Math.min(currentIndex, carousel.children.length - visibleCount());
  scrollToIndex(currentIndex);
});
updateArrows();
