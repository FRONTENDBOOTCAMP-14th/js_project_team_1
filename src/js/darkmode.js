const toggleButton = document.querySelector(".darkmode-toggle-button");

// 다크모드 함수 실행
loadDarkMode();

// 다크모드, 라이트모드 토글 버튼 이벤트 등록
toggleButton.addEventListener("click", () => {
  // body class에 toggle 메서드 추가
  document.body.classList.toggle("dark");
  // body에 dark클래스 포함시 dark 제거, localstorage에 dark 추가
  // 아닐시 dark 추가, localstorage에 dark 제거
  if (document.body.classList.contains("dark")) {
    window.localStorage.setItem("theme", "dark");
    toggleButton.classList.add("dark");
  } else {
    window.localStorage.removeItem("theme");
    toggleButton.classList.remove("dark");
  }
});

// 다크모드 실행 함수
function loadDarkMode() {
  // localstorage에 key값이 theme인 value를 가져옴
  const darkMode = window.localStorage.getItem("theme");

  // key값이 theme인 value값이 없거나 다크모드 버튼이 없을시 빠른 반환
  if (!darkMode || !toggleButton) return;

  // theme값이 있으면(dark) 다크모드 클래스 추가
  if (darkMode === "dark") {
    document.body.classList.add("dark");
    toggleButton.classList.add("dark");
  }
}
