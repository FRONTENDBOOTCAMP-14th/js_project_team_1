import axios from "axios";
import { getPlaylistTracks } from "../../service/spotify";

const PLAYLIST_BY_WEATHER = {
  "01d": "5bXCeNizWSMuLryalD7eOt", // 맑은 낮
  "01n": "2oxqCm5CDh0FLzRPnhnitw", // 맑은 밤
  "02d": "3KrQbbb1QPkhm2GTAUMtd0", // 약간 구름 낮
  "02n": "5tSTpzKrrpZmtPfId6Sc0f", // 약간 구름 밤
  "03d": "5tSTpzKrrpZmtPfId6Sc0f", // 구름조금 낮
  "03n": "5tSTpzKrrpZmtPfId6Sc0f", // 구름조금 밤
  "04d": "6YeQxqNmJQzp9Fxtmx0KI4", //온흐림
  "04n": "0x4Tzcvz7hGYeM6q71bVJP", //온흐림
  "09d": "1HJY60OjkA50XDErv5w20m", // 소나기 낮
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
  //플레이리스트 섹션 앨범 커버 부분 초기화

  if (!currentUserWeather) {
    alert("날씨 데이터를 불러오지 못했어요");
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

  const playlist = document.querySelector(".playlist");
  const playlistDescribe = playlist.querySelector(".playlist__describe");
  playlistDescribe.textContent = `🎧 현재 날씨 ${nowtWeather}, 이런 노래 어떠세요? `;
}

//플레이리스트 아이디 가져오기
function getPlayListID(currentUserWeather) {
  let weatherCode = currentUserWeather.weather[0].icon;
  const PLAYLIST_ID = PLAYLIST_BY_WEATHER[weatherCode];
  return PLAYLIST_ID;
}

//playlist HTML 앨범 커버 업데이트 함수
function updateTrackInfo(track, PLAYLIST_ID) {
  const playlistInner = document.querySelector(".playlist__inner");
  const trackContainer = document.createElement("li");
  trackContainer.classList.add("playlist__track-container");

  let albumCoverUrl = track.album.images[0]?.url || "";

  trackContainer.innerHTML = `
  <a href="https://open.spotify.com/playlist/${PLAYLIST_ID}" aria-label="${track.name}들으러 가기" target="_blank" rel="noopener noreferrer">
    <div class="playlist__cover" style="background-image: url('${albumCoverUrl}');"></div>
      <div class="playlist__title">${track.name}</div>
      <div class="playlist__singer">${track.artists.map((a) => a.name).join(", ")}</div>
  </a>
  `;
  playlistInner.appendChild(trackContainer);
}

// API 관련 함수들(토큰발급, 플레이리스트아이디조회)
async function main(PLAYLIST_ID) {
  // 서버리스함수에서 토큰 받아오기
  let token;
  try {
    const res = await axios.get("/.netlify/functions/getSpotifyTokens");

    if (res.status !== 200 || !res.data.access_token) {
      throw new Error("스포티파이 인증 실패");
    }
    token = res.data.access_token;
  } catch (error) {
    alert("스포티파이 인증 요청 중 오류가 발생했어요... 페이지를 새로고침 해주세요");
    return;
  }

  // 2) 플레이리스트 트랙 불러오기
  const tracks = await getPlaylistTracks(PLAYLIST_ID, token);
  if (!tracks) {
    alert("트랙을 불러오지 못했어요... 잠시 후 다시 시도해주세요");
    return;
  }

  //HTML 동적 추가 전 inner 비우기
  const playlistInner = document.querySelector(".playlist__inner");
  playlistInner.innerHTML = "";

  // 3) HTML 에 동적 추가
  tracks.forEach((item) => {
    const track = item.track;
    updateTrackInfo(track, PLAYLIST_ID);
  });
}
