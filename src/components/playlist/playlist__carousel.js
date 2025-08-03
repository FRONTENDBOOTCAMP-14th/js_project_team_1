import { updateArrows } from "../../js/utils";

const playlist = document.querySelector(".playlist");
const playlistInner = playlist.querySelector(".playlist__inner");
const prevButton = playlist.querySelector(".playlist__arrow--prev");
const nextButton = playlist.querySelector(".playlist__arrow--next");

updateArrows();

playlist.addEventListener("click", (evt) => {
  if (evt.target.closest("button") === nextButton) {
    playlistInner.scrollLeft += 300;
  } else if (evt.target.closest("button") === prevButton) {
    playlistInner.scrollLeft -= 300;
  }
});
