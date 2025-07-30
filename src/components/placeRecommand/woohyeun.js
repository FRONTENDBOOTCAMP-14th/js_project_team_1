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

const apiKey = "b654127afd92273778b454675873b1ca";

async function getWeatherIconCode() {
  const lat = 37.5665;
  const lon = 126.978;
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
  );
  const data = await res.json();
  const { icon } = data.weather.at(0);
  return iconMap[icon];
}

async function renderPlaces(iconCode) {
  const res = await fetch("./place.json");

  const data = await res.json();

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

window.addEventListener("DOMContentLoaded", async () => {
  const iconCode = await getWeatherIconCode();
  await renderPlaces(iconCode);
});
