const playlist = document.querySelector(".playlist");
const playlistInner = playlist.querySelector(".playlist__inner");
const prevButton = playlist.querySelector(".playlist__arrow--prev");
const nextButton = playlist.querySelector(".playlist__arrow--next");

function getArrowSvg(direction, size = 60) {
  const arrow =
    direction === "left"
      ? `<polyline points="50,25 30,40.5 50,56" fill="none" stroke="black" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<polyline points="30,25 50,40.5 30,56" fill="none" stroke="black" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 80 81" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="40" cy="40.5" r="40" fill="#ffffff"/>
      ${arrow}
    </svg>
  `;
}

function updateArrows() {
  let size = 60;
  if (window.innerWidth <= 1000) size = 38;
  if (window.innerWidth <= 640) size = 28;

  const nextArrow = document.createElement("span");
  nextArrow.classList.add("arrow-svg");
  nextArrow.innerHTML = getArrowSvg("right", size);

  const prevArrow = document.createElement("span");
  prevArrow.classList.add("arrow-svg");
  prevArrow.innerHTML = getArrowSvg("left", size);

  nextButton.appendChild(nextArrow);
  prevButton.appendChild(prevArrow);
}

updateArrows();

playlist.addEventListener("click", (evt) => {
  console.log("click");
  if (evt.target.closest("button") === nextButton) {
    playlistInner.scrollLeft += 300;
  } else if (evt.target.closest("button") === prevButton) {
    playlistInner.scrollLeft -= 300;
  }
});
