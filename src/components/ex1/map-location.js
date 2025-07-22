// map-location.js

// 기본 장소 정보
let currentPlace = {
  name: '서울식물원',
  address: '서울 강서구 마곡동로 161 서울식물원',
  image: 'https://www.seoul.go.kr/upload/plant/2021/10/20211018101112_1.jpg',
  lat: 37.5683,
  lng: 126.8346
};

// 지도 및 마커 초기화
let map, marker;
function initMap(place) {
  var mapContainer = document.getElementById('map-container');
  var mapOption = {
    center: new kakao.maps.LatLng(place.lat, place.lng),
    level: 3
  };
  map = new kakao.maps.Map(mapContainer, mapOption);
  marker = new kakao.maps.Marker({
    position: new kakao.maps.LatLng(place.lat, place.lng),
    map: map
  });
}

// 장소 정보 업데이트
function updatePlaceInfo(place) {
  document.getElementById('place-name').innerHTML = place.name;
  document.getElementById('place-address').textContent = place.address;
  document.getElementById('place-image').src = place.image || 'https://via.placeholder.com/340x180?text=No+Image';
}

// 카카오 장소 검색 + og:image fetch
function fetchOgImage(url, callback) {
  fetch('https://corsproxy.io/?' + encodeURIComponent(url))
    .then(res => res.text())
    .then(html => {
      const ogImageMatch = html.match(/<meta property=\"og:image\" content=\"([^\"]+)\"/);
      if (ogImageMatch && ogImageMatch[1]) {
        callback(ogImageMatch[1]);
      } else {
        callback(null);
      }
    })
    .catch(() => callback(null));
}

function searchPlace(query) {
  var ps = new kakao.maps.services.Places();
  ps.keywordSearch(query, function(data, status) {
    if (status === kakao.maps.services.Status.OK) {
      var first = data[0];
      let image = 'https://via.placeholder.com/340x180?text=No+Image';
      fetchOgImage(first.place_url, function(ogImg) {
        if (ogImg) image = ogImg;
        const place = {
          name: first.place_name,
          address: first.road_address_name || first.address_name,
          image: image,
          lat: parseFloat(first.y),
          lng: parseFloat(first.x)
        };
        updatePlaceInfo(place);
        map.setCenter(new kakao.maps.LatLng(place.lat, place.lng));
        marker.setPosition(new kakao.maps.LatLng(place.lat, place.lng));
        currentPlace = place;
      });
    } else {
      alert('검색 결과가 없습니다.');
    }
  });
}

// 지도/정보 초기화
window.addEventListener('DOMContentLoaded', function() {
  initMap(currentPlace);
  updatePlaceInfo(currentPlace);
  // 검색 버튼 클릭/엔터
  document.getElementById('search-btn').addEventListener('click', function(e) {
    e.preventDefault();
    searchPlace(document.getElementById('search-input').value);
  });
  document.getElementById('search-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchPlace(this.value);
    }
  });
  // 주소 복사 버튼
  document.getElementById('copy-btn').addEventListener('click', function(e) {
    e.preventDefault();
    navigator.clipboard.writeText(currentPlace.address);
    alert('주소가 복사되었습니다!');
  });
}); 