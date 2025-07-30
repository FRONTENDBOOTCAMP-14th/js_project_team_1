import { getCurrentLocation } from "../service/kakaoMap";
import { renderView } from "./main";

getCurrentPosition();

function getCurrentPosition() {
  // 현재 위치의 위도와 경도를 가져오는 브라우저 기본 API
  // 수락시 success 콜백함수 , 거절시 error 콜백함수를 실행
  navigator.geolocation.getCurrentPosition(successLocation, errorLocation);
}

// 현재 위치 정보 수락시 실행될 함수, position을 파라미터로 받음
async function successLocation(position) {
  // 위도, 경도 정보를 구조분해할당으로 가져옴
  const { latitude, longitude } = position.coords;

  // 소수점 정리
  const lat = latitude.toFixed(4); // 위도
  const lon = longitude.toFixed(4); // 경도

  // try..catch 문으로 비동기 함수 성공, 에러 처리
  try {
    // service폴더 내에 카카오맵 API를 사용하여 행구역 데이터를 가져옴
    const data = await getCurrentLocation(lat, lon);

    // 데이터 없을때 경고창
    if (!data) {
      console.error("잠시후 다시 시도해 주세요..");
      alert("위치 정보를 가져오지 못했습니다. 잠시후 다시 시도해주세요..");
      return;
    }

    const region1 = data.documents.at(0).region_1depth_name; // 서울시, 경기도 등
    const region2 = data.documents.at(0).region_2depth_name; // 시흥시, 안산시 등

    let cityName;

    // 만약 region1 상수에 특별시 또는 광역시가 포함되어있으면 그대로 사용
    if (region1.includes("특별시") || region1.includes("광역시")) {
      cityName = region1;
    } else {
      // region2 상수 이름이 시로 끝났을때 그대로 사용
      if (region2.endsWith("시")) {
        cityName = region2;
      } else {
        // region2의 이름이 시로 끝나지 않았을때 (용인시 처인구 등)
        // '시' 앞부분만 잘라와 '시'를 붙여서 이름 전달
        // 예) region2 = '용인시 처인구' => '용인' + '시'
        cityName = region2.split("시")[0] + "시";
      }
    }

    // 브라우저 렌더함수에 위도,경도,도시이름 전달
    renderView(lat, lon, cityName);
  } catch (error) {
    console.error("위치 정보를 가져오지 못했습니다..", error);
  }
}

// 현재 위치 정보 거절시 실행될 함수
function errorLocation() {
  alert("현재 위치 검색을 거절 하여, 서울 날씨 데이터를 보여줍니다.");
}
