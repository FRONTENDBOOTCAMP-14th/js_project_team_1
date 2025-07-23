"use strict";

import axios from "axios";

// 1. Spotify Access Token 발급 함수
async function getSpotifyAccessToken(clientId, clientSecret) {
  // btoa 인코딩 문제 방지용 함수
  function utf8ToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  const base64 = utf8ToBase64(`${clientId}:${clientSecret}`);

  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");

  try {
    const res = await axios.post("https://accounts.spotify.com/api/token", params.toString(), {
      headers: {
        Authorization: `Basic ${base64}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return res.data.access_token;
  } catch (error) {
    console.error("토큰 발급 실패:", error.response?.data || error.message);
  }
}

// 2. 플레이리스트 트랙 가져오는 함수
async function getPlaylistTracks(playlistId, accessToken) {
  try {
    const res = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return res.data.items;
  } catch (error) {
    console.error("플레이리스트 트랙 조회 실패:", error.response?.data || error.message);
  }
}

function updateTrackInfo(track) {
  const playlistInner = document.querySelector(".playlist__inner");
  const trackContainer = document.createElement("div");

  let albumCoverUrl = track.album.images[0].url;
  trackContainer.classList.add("playlist__track-container");
  trackContainer.innerHTML = `
  <div class="playlist__cover" style="background-image: url('${albumCoverUrl}');"></div>
    <div class="playlist__title">${track.name}</div>
    <div class="playlist__singer">${track.artists.map((a) => a.name).join(", ")}</div>
  `;

  playlistInner.appendChild(trackContainer);
}

// 3. 실행 예시
async function main() {
  const CLIENT_ID = "bc6c563254204f2ebfd697ab17cb810e";
  const CLIENT_SECRET = "98e4060962fd47e88e2eb8fb89d60d62";
  const PLAYLIST_ID = "3cEYpjA9oz9GiPac4AsH4n"; // weekly recommandation

  // 1) 토큰 발급
  const token = await getSpotifyAccessToken(CLIENT_ID, CLIENT_SECRET);
  if (!token) {
    console.error("토큰 발급 실패해서 종료");
    return;
  }

  // console.log('Access Token:', accessToken);

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
