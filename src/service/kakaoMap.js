import axios from "axios";

const API_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY;

// 현재 위치기반(위도,경도)로 행정구역 명칭 가져오기
export async function getCurrentLocation(lat, lon) {
  const { data } = await axios.get("https://dapi.kakao.com/v2/local/geo/coord2regioncode.json", {
    params: {
      y: lat,
      x: lon,
    },
    headers: {
      Authorization: `KakaoAK ${API_KEY}`, // REST API_KEY
    },
  });

  return data;
}
