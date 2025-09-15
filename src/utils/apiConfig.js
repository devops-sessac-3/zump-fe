// API 기본 설정
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// 콘서트 이미지 매핑 (DB concert_name 기준)
const imageMap = {
  "Aespa – “Cosmic Symphony”": "/images/concerts/aespa.jpeg",
  "Chungha – “Radiant Pulse”": "/images/concerts/chungha.jpeg",
  "Band – “Amplified Dreams”": "/images/concerts/band.jpeg",
  "NJZ – “Future Motion”": "/images/concerts/NJZ.jpeg",
  "Kai Matthiesen – “Echoes of Infinity”": "/images/concerts/Kai_Matthiesen.jpeg",
  "RIIZE – “Beyond the Horizon”": "/images/concerts/RIIZE.jpeg"
};

// API 응답 데이터 변환 함수들
export const transformConcertData = (backendConcert) => {
  return {
    id: backendConcert.concert_se,
    title: backendConcert.concert_name,
    date: backendConcert.concert_date,
    time: backendConcert.concert_time,
    venue: backendConcert.concert_venue ?? '미정',
    price: backendConcert.concert_price
      ? `${backendConcert.concert_price.toLocaleString()}원`
      : '미정',
    description: backendConcert.concert_description ?? '',
    imageUrl: imageMap[backendConcert.concert_name] || "/images/concerts/default.jpeg",
    seats: backendConcert.seats 
      ? transformSeatData(backendConcert.seats)
      : {} // 좌석 정보가 없으면 빈 객체
  };
};

export const transformSeatData = (backendSeats) => {
  const seats = {};
  backendSeats.forEach((seat) => {
    seats[seat.seat_number] = seat.is_booked ? "occupied" : "available";
  });
  return seats;
};

// API 요청 공통 헤더
export const getApiHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};
