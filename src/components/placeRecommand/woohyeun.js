const total = 10; // ← 카드 개수
const cardDetails = [
  { title: "1번카드 제목", desc: "1번카드 내용" },
  { title: "2번카드 제목", desc: "2번카드 내용" },
  { title: "3번카드 제목", desc: "3번카드 내용" },
  { title: "4번카드 제목", desc: "4번카드 내용" },
  { title: "5번카드 제목", desc: "5번카드 내용" },
  { title: "6번카드 제목", desc: "6번카드 내용" },
  { title: "7번카드 제목", desc: "7번카드 내용" },
  { title: "8번카드 제목", desc: "8번카드 내용" },
  { title: "9번카드 제목", desc: "9번카드 내용" },
  { title: "10번카드 제목", desc: "10번카드 내용" },
];

let centerIdx = 2;
const VISIBLE = 5;
const mid = Math.floor(VISIBLE / 2);
const track = document.getElementById("track");
const detailArea = document.getElementById("detail-area");
let moving = false;
let cardElems = [];

function renderCards() {
  if (cardElems.length === 0) {
    for (let i = 0; i < total; i++) {
      const card = document.createElement("div");
      card.className = "card";
      card.textContent = i + 1;
      card.tabIndex = -1;
      card.addEventListener("click", () => {
        if (!moving)
          move(
            (i - centerIdx + total) % total <= total / 2 ? i - centerIdx : i - centerIdx - total
          );
      });
      track.appendChild(card);
      cardElems.push(card);
    }
  }
  updateCards();
}

function updateCards() {
  for (let i = 0; i < total; i++) {
    const card = cardElems[i];
    let diff = (i - centerIdx + total) % total;
    if (diff > total / 2) diff -= total;

    if (Math.abs(diff) > mid) {
      card.style.opacity = 0;
      card.style.pointerEvents = "none";
      card.style.zIndex = 0;
      card.style.transform = `translateX(0px) scale(0.5)`;
      card.classList.remove("visible", "center");
    } else {
      const baseX = diff * 230;
      card.style.transform = `translateX(${baseX}px) scale(${diff === 0 ? 1.16 : 0.78})`;
      card.style.opacity = diff === 0 ? 1 : 0.68;
      card.style.zIndex = diff === 0 ? 10 : 2;
      card.classList.toggle("center", diff === 0);
      card.classList.toggle("visible", diff !== 0);
      card.style.pointerEvents = "auto";
    }
  }
}

function showDetail(idx) {
  const data = cardDetails[idx];
  detailArea.innerHTML = `
    <div class="detail-title">${data.title}</div>
    <div class="detail-desc">${data.desc}</div>
  `;
  detailArea.style.animation = "none";
  void detailArea.offsetWidth;
  detailArea.style.animation = "";
}

function move(dir) {
  if (moving) return;
  moving = true;
  centerIdx = (centerIdx + dir + total) % total;
  updateCards();
  showDetail(centerIdx);
  setTimeout(() => {
    moving = false;
  }, 480);
}

renderCards();
showDetail(centerIdx);

window.addEventListener("resize", updateCards);

window.move = move;
