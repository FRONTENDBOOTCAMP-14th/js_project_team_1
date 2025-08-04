import axios from "axios";

class MapLocationApp {
  constructor() {
    this.CONFIG = {
      DEFAULT_MAP_LEVEL: 3,
      PLACE_SEARCH_RADIUS: 50,
      CORS_PROXY_URL: "https://corsproxy.io/?",
      KAKAO_CATEGORY_CODE: "AT4",
      MAP_INITIALIZATION_DELAY: 100,
      MAP_RELAYOUT_DELAY: 200,
      WEATHER_API_LANGUAGE: "kr",
      WEATHER_API_UNITS: "metric",
      KAKAO_MAP_API_KEY: import.meta.env.VITE_KAKAO_MAP_JS_API_KEY,
      OPENWEATHER_API_KEY: import.meta.env.VITE_OPENWEATHERMAP_API_KEY,
      KAKAO_MAP_SCROLLWHEEL: false,
      KAKAO_MAP_DRAGGABLE: false,
    };

    this.state = {
      kakaoMap: null,
      mapMarker: null,
      currentPlace: {
        name: "서울식물원",
        address: "서울 강서구 마곡동로 161 서울식물원",
        image: "./서울식물원.jpg",
        latitude: 37.5683,
        longitude: 126.8346,
      },
    };

    this.domElements = {};
    this.initialize();
  }

  async initialize() {
    this.cacheDomElements();
    this.bindEventListeners();

    // 카카오 맵 API를 동적으로 로드
    await this.loadKakaoMapsAPI();
    await this.loadPlaceFromUrl();

    setTimeout(() => {
      this.initializeKakaoMap();
      this.updatePlaceInformation();
    }, this.CONFIG.MAP_INITIALIZATION_DELAY);
  }

  cacheDomElements() {
    this.domElements = {
      mapContainer: document.getElementById("map-container"),
      placeName: document.getElementById("place-name"),
      placeAddress: document.getElementById("place-address"),
      placeImage: document.getElementById("place-image"),
      placeTemperature: document.getElementById("place-temp"),
      weatherDescription: document.getElementById("weather-description"),
      weatherDetails: document.getElementById("weather-details"),
      copyButton: document.getElementById("copy-btn"),
    };
  }

  bindEventListeners() {
    this.domElements.copyButton?.addEventListener("click", (event) => {
      this.handleAddressCopy(event);
    });
  }

  initializeKakaoMap() {
    const { latitude, longitude } = this.state.currentPlace;
    const mapOptions = {
      center: new kakao.maps.LatLng(latitude, longitude),
      level: this.CONFIG.DEFAULT_MAP_LEVEL,
      scrollwheel: this.CONFIG.KAKAO_MAP_SCROLLWHEEL,
      draggable: this.CONFIG.KAKAO_MAP_DRAGGABLE,
    };

    this.state.kakaoMap = new kakao.maps.Map(this.domElements.mapContainer, mapOptions);

    setTimeout(() => {
      this.state.kakaoMap.relayout();
    }, this.CONFIG.MAP_RELAYOUT_DELAY);

    this.state.mapMarker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(latitude, longitude),
      map: this.state.kakaoMap,
    });

    this.attachMapEventListeners();
  }

  attachMapEventListeners() {
    kakao.maps.event.addListener(this.state.kakaoMap, "click", (mouseEvent) => {
      const clickedPosition = mouseEvent.latLng;
      this.handleMapClick(clickedPosition.getLat(), clickedPosition.getLng());
    });
  }

  updatePlaceInformation() {
    const { name, address, image } = this.state.currentPlace;

    if (this.domElements.placeName) {
      this.domElements.placeName.textContent = name;
    }

    if (this.domElements.placeAddress) {
      this.domElements.placeAddress.textContent = address;
    }

    if (this.domElements.placeImage) {
      this.domElements.placeImage.src = image || this.getPlaceholderImageUrl();
    }

    this.fetchAndDisplayWeatherData();
  }

  getPlaceholderImageUrl() {
    return "https://via.placeholder.com/340x180?text=No+Image";
  }

  renderWeatherInformation(weatherData) {
    const {
      temperature = 0,
      description = "정보없음",
      minimumTemperature = 0,
      maximumTemperature = 0,
      feelsLikeTemperature = 0,
      humidity = 0,
      windSpeed = 0,
    } = weatherData;

    if (this.domElements.placeTemperature) {
      this.domElements.placeTemperature.textContent = `${Math.round(temperature)}°C`;
    }

    if (this.domElements.weatherDescription) {
      this.domElements.weatherDescription.innerHTML =
        `<span class="weather-card__main">${description}</span> ` +
        `<span class="weather-card__minmax">최저${Math.round(minimumTemperature)}° 최고${Math.round(
          maximumTemperature
        )}°</span>`;
    }

    if (this.domElements.weatherDetails) {
      this.domElements.weatherDetails.innerHTML = `
        <div class="weather-card__detail-item">체감 ${
          Math.round(feelsLikeTemperature * 10) / 10
        }°</div>
        <div class="weather-card__detail-item">습도 ${humidity}%</div>
        <div class="weather-card__detail-item">풍속 ${windSpeed}m/s</div>
      `;
    }
  }

  async fetchAndDisplayWeatherData() {
    const { latitude, longitude } = this.state.currentPlace;
    const weatherApiUrl = this.buildWeatherApiUrl(latitude, longitude);

    try {
      const response = await fetch(weatherApiUrl);

      if (!response.ok) {
        throw new Error(`Weather API request failed with status: ${response.status}`);
      }

      const weatherResponse = await response.json();
      const parsedWeatherData = this.parseWeatherApiResponse(weatherResponse);
      this.renderWeatherInformation(parsedWeatherData);
    } catch (error) {
      console.warn("날씨 정보를 가져올 수 없습니다:", error);
      this.renderWeatherInformation({});
    }
  }

  buildWeatherApiUrl(latitude, longitude) {
    const urlParams = new URLSearchParams({
      lat: latitude.toString(),
      lon: longitude.toString(),
      appid: this.CONFIG.OPENWEATHER_API_KEY,
      units: this.CONFIG.WEATHER_API_UNITS,
      lang: this.CONFIG.WEATHER_API_LANGUAGE,
    });

    return `https://api.openweathermap.org/data/2.5/weather?${urlParams}`;
  }

  parseWeatherApiResponse(apiResponse) {
    return {
      temperature: apiResponse.main?.temp || 0,
      feelsLikeTemperature: apiResponse.main?.feels_like || 0,
      minimumTemperature: apiResponse.main?.temp_min || 0,
      maximumTemperature: apiResponse.main?.temp_max || 0,
      humidity: apiResponse.main?.humidity || 0,
      windSpeed: apiResponse.wind?.speed || 0,
      description: apiResponse.weather?.[0]?.description || "정보없음",
    };
  }

  updateMapPosition(latitude, longitude) {
    const newPosition = new kakao.maps.LatLng(latitude, longitude);
    this.state.kakaoMap.setCenter(newPosition);
    this.state.mapMarker.setPosition(newPosition);
  }

  async handleMapClick(clickedLatitude, clickedLongitude) {
    try {
      const geocoder = new kakao.maps.services.Geocoder();
      const addressFromCoordinates = await this.getAddressFromCoordinates(
        geocoder,
        clickedLatitude,
        clickedLongitude
      );
      const nearbyPlaceName = await this.findNearbyPlaceName(clickedLatitude, clickedLongitude);

      this.state.currentPlace = {
        ...this.state.currentPlace,
        name: nearbyPlaceName || addressFromCoordinates,
        address: addressFromCoordinates,
        latitude: clickedLatitude,
        longitude: clickedLongitude,
        image: this.getPlaceholderImageUrl(),
      };

      this.updatePlaceInformation();
      this.updateMapPosition(clickedLatitude, clickedLongitude);
    } catch (error) {
      console.warn("위치 정보를 가져올 수 없습니다:", error);
    }
  }

  getAddressFromCoordinates(geocoder, latitude, longitude) {
    return new Promise((resolve, reject) => {
      geocoder.coord2Address(longitude, latitude, (geocodingResult, geocodingStatus) => {
        if (geocodingStatus === kakao.maps.services.Status.OK && geocodingResult.length > 0) {
          const addressInfo = geocodingResult[0];
          const formattedAddress = addressInfo.road_address
            ? addressInfo.road_address.address_name
            : addressInfo.address.address_name;
          resolve(formattedAddress);
        } else {
          reject(new Error("Reverse geocoding failed"));
        }
      });
    });
  }

  findNearbyPlaceName(latitude, longitude) {
    return new Promise((resolve) => {
      const placesService = new kakao.maps.services.Places();
      const searchLocation = new kakao.maps.LatLng(latitude, longitude);

      placesService.categorySearch(
        this.CONFIG.KAKAO_CATEGORY_CODE,
        (searchResults, searchStatus) => {
          if (searchStatus === kakao.maps.services.Status.OK && searchResults.length > 0) {
            resolve(searchResults[0].place_name);
          } else {
            resolve(null);
          }
        },
        {
          location: searchLocation,
          radius: this.CONFIG.PLACE_SEARCH_RADIUS,
        }
      );
    });
  }

  handleAddressCopy(event) {
    event.preventDefault();
    const addressToCopy = this.state.currentPlace.address;
    this.copyTextToClipboard(addressToCopy);
  }

  async copyTextToClipboard(textToCopy) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
        this.displayCopySuccessMessage(textToCopy);
      } else {
        this.fallbackCopyMethod(textToCopy);
      }
    } catch (clipboardError) {
      console.warn("클립보드 복사 실패:", clipboardError);
      this.fallbackCopyMethod(textToCopy);
    }
  }

  fallbackCopyMethod(textToCopy) {
    const temporaryTextArea = document.createElement("textarea");
    temporaryTextArea.value = textToCopy;
    temporaryTextArea.style.cssText = "position:fixed;left:-9999px;top:-9999px;opacity:0;";

    document.body.appendChild(temporaryTextArea);
    temporaryTextArea.focus();
    temporaryTextArea.select();

    try {
      document.execCommand("copy");
      this.displayCopySuccessMessage(textToCopy);
    } catch (commandError) {
      this.displayCopyErrorMessage(textToCopy);
    } finally {
      document.body.removeChild(temporaryTextArea);
    }
  }

  displayCopySuccessMessage(copiedText) {
    alert(`주소가 복사되었습니다!\n${copiedText}`);
  }

  displayCopyErrorMessage(failedText) {
    alert(`복사에 실패했습니다. 주소: ${failedText}`);
  }

  async loadPlaceFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const placeId = urlParams.get("id");

    if (!placeId) {
      return;
    }

    try {
      const response = await axios.get("/data/place.json");
      const placeData = response.data;

      const place = this.findPlaceById(placeData, placeId);

      if (place) {
        const coordinates = await this.getCoordinatesFromAddress(place.address);

        this.state.currentPlace = {
          name: place.place_name,
          address: place.address,
          image: place.img_url,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        };
      }
    } catch (error) {
      console.warn("장소 데이터를 불러올 수 없습니다:", error);
    }
  }

  findPlaceById(placeData, targetId) {
    for (const group of placeData) {
      const place = group.place_recommend.find((place) => place.id === Number(targetId));
      if (place) {
        return place;
      }
    }
    return null;
  }

  async getCoordinatesFromAddress(address) {
    return new Promise((resolve, reject) => {
      const geocoder = new kakao.maps.services.Geocoder();

      geocoder.addressSearch(address, (result, status) => {
        if (status === kakao.maps.services.Status.OK && result.length > 0) {
          resolve({
            latitude: parseFloat(result[0].y),
            longitude: parseFloat(result[0].x),
          });
        } else {
          reject(new Error("주소를 좌표로 변환할 수 없습니다"));
        }
      });
    });
  }

  async loadKakaoMapsAPI() {
    return new Promise((resolve, reject) => {
      // 이미 로드되어 있으면 바로 반환
      if (typeof kakao !== "undefined" && kakao.maps) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${this.CONFIG.KAKAO_MAP_API_KEY}&libraries=services`;
      script.onload = () => {
        kakao.maps.load(() => {
          resolve();
        });
      };
      script.onerror = () => reject(new Error("카카오 맵 API 로딩에 실패했습니다"));

      document.head.appendChild(script);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new MapLocationApp();
});
