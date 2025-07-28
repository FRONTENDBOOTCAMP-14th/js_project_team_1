function getArrowSvg(direction, size) {
  const arrow =
    direction === "left"
      ? `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#20232a"/>
       <path d="M${size * 0.63} ${size * 0.78}L${size * 0.375} ${size / 2}L${size * 0.63} ${
          size * 0.22
        }"
             stroke="white" stroke-width="${
               size / 11
             }" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#20232a"/>
       <path d="M${size * 0.375} ${size * 0.78}L${size * 0.63} ${size / 2}L${size * 0.375} ${
          size * 0.22
        }"
             stroke="white" stroke-width="${
               size / 11
             }" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none"
           xmlns="http://www.w3.org/2000/svg">${arrow}</svg>`;
}

function updateArrows() {
  let size = 60;
  if (window.innerWidth <= 600) size = 28;
  else if (window.innerWidth <= 900) size = 38;
  else if (window.innerWidth <= 1400) size = 56;

  document.querySelector(".carousel-arrow.left .arrow-svg").innerHTML = getArrowSvg("left", size);
  document.querySelector(".carousel-arrow.right .arrow-svg").innerHTML = getArrowSvg("right", size);

  const outer = document.getElementById("carouselOuter");
  const rect = outer.getBoundingClientRect();
  const buttonLeft = document.getElementById("arrowLeft");
  const buttonRight = document.getElementById("arrowRight");
  const y = rect.top + rect.height / 2 + window.scrollY;
  buttonLeft.style.top = `${y}px`;
  buttonRight.style.top = `${y}px`;
  buttonLeft.style.transform = "translateY(-50%)";
  buttonRight.style.transform = "translateY(-50%)";
}
updateArrows();
window.addEventListener("resize", updateArrows);
window.addEventListener("scroll", updateArrows);
window.addEventListener("DOMContentLoaded", updateArrows);

const carousel = document.getElementById("carousel");
const card = document.querySelector(".place-card");

function getCardWidth() {
  return card.offsetWidth + 8;
}
let currentIndex = 0;
const totalCards = document.querySelectorAll(".place-card").length;
const visibleCount = () => {
  if (window.innerWidth <= 600) return 1;
  if (window.innerWidth <= 900) return 2;
  if (window.innerWidth <= 1400) return 3;
  return 4;
};

function scrollToIndex(idx) {
  const scrollX = idx * getCardWidth();
  carousel.parentNode.scrollTo({
    left: scrollX,
    behavior: "smooth",
  });
}
document.getElementById("arrowLeft").onclick = function () {
  if (currentIndex === 0) {
    currentIndex = totalCards - visibleCount();
  } else {
    currentIndex = Math.max(currentIndex - 1, 0);
  }
  scrollToIndex(currentIndex);
};
document.getElementById("arrowRight").onclick = function () {
  if (currentIndex >= totalCards - visibleCount()) {
    currentIndex = 0;
  } else {
    currentIndex = Math.min(currentIndex + 1, totalCards - visibleCount());
  }
  scrollToIndex(currentIndex);
};
window.addEventListener("resize", () => {
  currentIndex = Math.min(currentIndex, totalCards - visibleCount());
  scrollToIndex(currentIndex);
});
window.addEventListener("DOMContentLoaded", () => {
  currentIndex = 0;
  scrollToIndex(0);
});
