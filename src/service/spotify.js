import axios from "axios";
import { errorModal } from "../js/utils";

// spotify Access Token 발급 함수
export async function getSpotifyAccessToken(clientId, clientSecret) {
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
    const message = "스포티파이 토큰 발급에 실패 하였습니다.";
    errorModal(message);
    console.error("스포티파이 토큰 발급 실패:", error.response?.data || error.message);
  }
}

//플레이리스트 트랙 가져오는 함수
export async function getPlaylistTracks(playlistId, accessToken) {
  try {
    const res = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=10`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return res.data.items;
  } catch (error) {
    const message = "플레이리스트 트랙 조회 실패 하였습니다.";
    errorModal(message);
    console.error(
      "플레이리스트 트랙 조회 실패 다시 시도해주세요:",
      error.response?.data || error.message
    );
  }
}
