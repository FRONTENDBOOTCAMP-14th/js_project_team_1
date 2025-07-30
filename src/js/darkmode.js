const toggleButton = document.getElementById("theme-toggle");
const buttonBg = toggleButton.querySelector(".btn-bg");
const buttontext = toggleButton.querySelector(".btn-text");
const html = document.documentElement;
// 다크모드 함수 실행
loadDarkMode();

// 다크모드 토글 버튼 이벤트 등록
toggleButton.addEventListener("click", () => {
  // html의 data-theme 속성을 가져옴
  const currentMode = html.getAttribute("data-theme");
  // data-theme의 속성이 "dark"이면 "light" 거짓이면 "dark"
  const nextMode = currentMode === "dark" ? "light" : "dark";
  //모드 설정 함수에 전달
  setTheme(nextMode);
});

// 모드 설정 함수
function setTheme(mode) {
  // mode가 "dark"일시 불리언값 상수에 설정
  const isDark = mode === "dark";

  // HTML 속성과 localStorage 설정
  html.setAttribute("data-theme", mode);
  window.localStorage.setItem("data-theme", mode);

  // UI 텍스트 및 배경 설정
  buttontext.textContent = isDark ? "라이트 모드" : "다크 모드";

  if (isDark) {
    // 조건이 참 일시 .button-bg의 배경이미지를 변경
    buttonBg.style.setProperty("background-image", 'url("/src/assets/weatherIcon/01.svg")');
  } else {
    // 조건이 거짓 일시 .button-bg의 기본 image로 변경
    buttonBg.style.removeProperty("background-image");
  }
}

// 페이지 로드시 저장된 테마 적용
function loadDarkMode() {
  // 토글버튼 없을시 빠른 반환
  if (!toggleButton) return;

  // localstorage에서 data-theme 데이터를 가져오고
  // 없으면 light
  const savedMode = window.localStorage.getItem("data-theme") || "light";
  // 모드 설정 함수에 전달
  setTheme(savedMode);
}
