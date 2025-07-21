export const weather_data = [
  {
    coord: {
      lon: 126.9778, // 경도
      lat: 37.5683, // 위도
    },
    weather: [
      {
        id: 802,
        main: 'Clouds',
        description: '구름조금', // 날씨 설명
        icon: '03n', // 아이콘 id
      },
    ],
    base: 'stations',
    main: {
      temp: 25.76, // 현재 온도 (℃)
      feels_like: 27, // 체감 온도 (℃)
      temp_min: 25.76, // 당일 최저 온도 (℃)
      temp_max: 26.78, // 당일 최고 온도 (℃)
      pressure: 1013, // 대기압 (hPa)
      humidity: 100, // 습도 (%)
      sea_level: 1013, // 해수면 기준 대기압 (hPa)
      grnd_level: 1004, // 지상 기준 대기압 (hPa)
    },
    visibility: 10000, // 가시 거리 (m) -> 10Km는 맑은 상태를 의미하는 최대 기본값
    wind: {
      speed: 1.03, // 바람 풍속 (m/s)
      deg: 250, // 바람 방향 (도, 0=북, 90=동)
    },
    clouds: {
      all: 40, // 구름 양 (%)
    },
    dt: 1753021520, // 데이터 시간 (Unix timestamp)
    sys: {
      type: 1,
      id: 8105,
      country: 'KR', // 국가 코드
      sunrise: 1752956758, // 데이터 시간 (Unix timestamp)
      sunset: 1753008630, // 데이터 시간 (Unix timestamp)
    },
    timezone: 32400,
    id: 1835848,
    name: 'Seoul',
    cod: 200,
  },
];

// console.log(weather_data.at(0).weather.at(0).id);
