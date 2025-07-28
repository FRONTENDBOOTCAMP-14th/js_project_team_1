"use strict";

import axios from "axios";
import { getSpotifyAccessToken, getPlaylistTracks } from "../../service/spotify";

// const WEATHER_PLAYLIST_MAP = {};

let userWeather = null;

export async function updatePlaylist(currentUserWeather) {
  const playlist = document.querySelector(".playlist");
  const playlistDescribe = playlist.querySelector(".playlist__describe");

  let nowtWeather = currentUserWeather.weather[0].description;

  if (!currentUserWeather) {
    console.warn("날씨 데이터 없음");
    return;
  }

  playlistDescribe.textContent = `🎧 현재 날씨 ${nowtWeather}, 이런 노래 어떠세요? `;

  userWeather = currentUserWeather;
}

//playlist HTML 앨범 커버 업데이트 함수
function updateTrackInfo(track) {
  const playlistInner = document.querySelector(".playlist__inner");
  const trackContainer = document.createElement("li");
  trackContainer.classList.add("playlist__track-container");

  let albumCoverUrl = track.album.images[0].url;
  trackContainer.innerHTML = `
  <div class="playlist__cover" style="background-image: url('${albumCoverUrl}');"></div>
    <div class="playlist__title">${track.name}</div>
    <div class="playlist__singer">${track.artists.map((a) => a.name).join(", ")}</div>
  `;

  playlistInner.appendChild(trackContainer);
}

// 실행
async function main() {
  const CLIENT_ID = "bc6c563254204f2ebfd697ab17cb810e";
  const CLIENT_SECRET = "98e4060962fd47e88e2eb8fb89d60d62";
  const PLAYLIST_ID = "3cEYpjA9oz9GiPac4AsH4n"; // weekly recommendation

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

  // 3) HTML 에 동적 추가
  tracks.forEach((item) => {
    const track = item.track;
    updateTrackInfo(track);
  });
}

main();
