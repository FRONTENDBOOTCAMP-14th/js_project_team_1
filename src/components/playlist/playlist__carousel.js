import { updateArrows } from "../../js/utils";

const playlist = document.querySelector(".playlist");
const playlistInner = playlist.querySelector(".playlist__inner");
const prevButton = playlist.querySelector(".playlist__arrow--prev");
const nextButton = playlist.querySelector(".playlist__arrow--next");

updateArrows();

playlist.addEventListener("click", (evt) => {
  console.log("click");
  if (evt.target.closest("button") === nextButton) {
    console.log("nxt 버튼 클릭");
    playlistInner.scrollLeft += 300;
  } else if (evt.target.closest("button") === prevButton) {
    console.log("prev button click");
    playlistInner.scrollLeft -= 300;
  }
});
