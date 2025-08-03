/* 유틸 함수 */

// 문자 부분강조 함수
export function highLight(name, keyword) {
  // name문자열의 앞에서부터 keword의 길이만큼 잘라냄
  const toBold = name.substring(0, keyword.length);
  // keyword 길이 뒤부터 끝까지 잘라냄
  const restName = name.substring(keyword.length);
  // 강조해야할 부분은 <strong>태그로 감싸 반환
  return `<strong>${toBold}</strong>${restName}`;
}
// 디바운스 함수
// callback : 실제로 실행할 함수
// delay : 연속 호출 중 마지막 호출 후에 delay값 만큼 실행할지 (기본값 300ms)
export function debounce(callback, delay = 300) {
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

// highlight 클래스 추가 함수
export function updateHighlight(items, currentIndex) {
  // items NodeList들을 순회하며
  // index와 currentIndex가 같은 아이템만 클래스 추가
  items.forEach((item, index) => {
    if (index === currentIndex) {
      item.classList.add("highlight");
    } else {
      item.classList.remove("highlight");
    }
  });
}

// 버튼에 이미지 삽입 함수
export function updateArrows() {
  let size;

  // 브라위저 너비에 따라 size 변경
  if (window.innerWidth <= 1000) size = 38;
  if (window.innerWidth <= 640) size = 28;

  // .carousel-arrow 버튼 노드리스트를 불러옴
  const buttons = document.querySelectorAll(".carousel-arrow");
  // 버튼 노드리스트가 없으면 빠른 반환
  if (buttons.length === 0) return;

  // forEach문을 사용하여 버튼 이미지 삽입
  buttons.forEach((button) => {
    if (button.classList.contains("left")) {
      button.innerHTML = getArrowSvg("left", size);
    } else if (button.classList.contains("right")) {
      button.innerHTML = getArrowSvg("right", size);
    }
  });
}

// 화살표 SVG 이미지 생성 함수
function getArrowSvg(direction, size = 60) {
  const arrow =
    direction === "left"
      ? "<polyline points=\"50,25 30,40.5 50,56\" fill=\"none\" stroke=\"black\" stroke-width=\"6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>"
      : "<polyline points=\"30,25 50,40.5 30,56\" fill=\"none\" stroke=\"black\" stroke-width=\"6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>";
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 80 81" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40.5" r="40" fill="#ffffff"/>
      ${arrow}
    </svg>
  `;
}
