import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://api.example.com', // 기본 API 주소
  timeout: 5000, // 요청 타임아웃 시간
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
