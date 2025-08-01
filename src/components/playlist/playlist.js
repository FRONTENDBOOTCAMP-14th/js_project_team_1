import { getPlaylistTracks, getSpotifyAccessToken } from "../../service/spotify";

const PLAYLIST_BY_WEATHER = {
  "01d": "5bXCeNizWSMuLryalD7eOt", // 맑은 낮
  "01n": "2oxqCm5CDh0FLzRPnhnitw", // 맑은 밤
  "02d": "3KrQbbb1QPkhm2GTAUMtd0", // 약간 구름 낮
  "02n": "5tSTpzKrrpZmtPfId6Sc0f", // 약간 구름 밤
  "03d": "5tSTpzKrrpZmtPfId6Sc0f", // 구름조금 낮
  "03n": "5tSTpzKrrpZmtPfId6Sc0f", // 구름조금 밤
  "04d": "6YeQxqNmJQzp9Fxtmx0KI4", //온흐림
  "04n": "0x4Tzcvz7hGYeM6q71bVJP", //온흐림
  "09d": "3W0nONHewUQeLyWjWCsNkL", // 소나기 낮
  "09n": "1oHApva4PBHMd0WOpBpzK2", // 소나기 밤
  "10d": "5FT9sItEm2GtAPaahBtIJS", // 비 낮
  "10n": "5oKWX70uCr0CfN3GpMbMfz", // 비 밤
  "11d": "1foqOwvaUk9sETtRygI81n", // 천둥 낮
  "11n": "1foqOwvaUk9sETtRygI81n", // 천둥 밤
  "13d": "2ZR0pxvv1jJVfNDwt1jr9e", // 눈 낮
  "13n": "0JjojMDknTWLFvpQEb15bt", // 눈 밤
  "50d": "5ogG193sybzunbhKIMne2w", // 안개 낮
  "50n": "2i3fDHxnwufFok3QhQyqWo", // 안개 밤
};

export async function updatePlaylist(currentUserWeather) {
  console.log("updateplalist 실행");

  //플레이리스트 섹션 앨범 커버 부분 초기화

  if (!currentUserWeather) {
    console.warn("날씨 데이터 없음");
    return;
  }

  //update section title
  updateDescibe(currentUserWeather);

  // 플레이리스트 아이디 받아오기
  const PLAYLIST_ID = getPlayListID(currentUserWeather);

  //토큰발급 빛 플레이리스트 가져오기
  await main(PLAYLIST_ID);
}

//섹션 타이틀 변경
function updateDescibe(currentUserWeather) {
  let nowtWeather = currentUserWeather.weather[0].description;

  console.log("현재 날씨 : " + nowtWeather);

  const playlist = document.querySelector(".playlist");
  const playlistDescribe = playlist.querySelector(".playlist__describe");
  playlistDescribe.textContent = `🎧 현재 날씨 ${nowtWeather}, 이런 노래 어떠세요? `;
  console.log("타이틀 이름 변경");
}

//플레이리스트 아이디 가져오기
function getPlayListID(currentUserWeather) {
  let weatherCode = currentUserWeather.weather[0].icon;
  const PLAYLIST_ID = PLAYLIST_BY_WEATHER[weatherCode];
  console.log("플레이리스트아이디 반환: " + weatherCode + ":" + PLAYLIST_ID);
  return PLAYLIST_ID;
}

//playlist HTML 앨범 커버 업데이트 함수
function updateTrackInfo(track, PLAYLIST_ID) {
  const playlistInner = document.querySelector(".playlist__inner");
  const trackContainer = document.createElement("li");
  trackContainer.classList.add("playlist__track-container");

  let albumCoverUrl = track.album.images[0].url;
  trackContainer.innerHTML = `
  <a href="https://open.spotify.com/playlist/${PLAYLIST_ID}" target="_blank" rel="noopenner noreferrer">
    <div class="playlist__cover" style="background-image: url('${albumCoverUrl}');"></div>
      <div class="playlist__title">${track.name}</div>
      <div class="playlist__singer">${track.artists.map((a) => a.name).join(", ")}</div>
  </a>
  `;
  console.log("앨범커버업데이트");
  playlistInner.appendChild(trackContainer);
}

// API 관련 함수들(토큰발급, 플레이리스트아이디조회)
async function main(PLAYLIST_ID) {
  const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

  // 1) 토큰 발급
  const token = await getSpotifyAccessToken(CLIENT_ID, CLIENT_SECRET);
  if (!token) {
    console.error("토큰 발급 실패해서 종료");
    return;
  }

  // 2) 플레이리스트 트랙 불러오기
  const tracks = await getPlaylistTracks(PLAYLIST_ID, token);
  if (!tracks) {
    console.error("트랙 불러오기 실패해서 종료");
    return;
  }

  //HTML 동적 추가 전 inner 비우기
  const playlistInner = document.querySelector(".playlist__inner");
  playlistInner.innerHTML = "";
  console.log("inner 삭제");

  // 3) HTML 에 동적 추가
  tracks.forEach((item) => {
    const track = item.track;
    updateTrackInfo(track, PLAYLIST_ID);
  });

  console.log("메인함수끝");
}
