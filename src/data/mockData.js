import { generateSeats } from '../utils/helpers';

export const mockConcerts = [
  {
    id: 1,
    title: "클래식 오케스트라 콘서트",
    date: "2025-10-15",
    time: "19:30",
    venue: "세종문화회관 대극장",
    price: 80000,
    description: "세계적인 지휘자와 오케스트라가 선사하는 클래식의 향연",
    imageUrl: "/images/concerts/aespa.jpeg",
    seats: generateSeats()
  },
  {
    id: 2,
    title: "재즈 페스티벌",
    date: "2025-10-20",
    time: "20:00",
    venue: "블루노트 서울",
    price: 65000,
    description: "최고의 재즈 뮤지션들의 즉흥 연주",
    imageUrl: "/images/concerts/chungha.jpeg",
    seats: generateSeats()
  },
  {
    id: 3,
    title: "록 밴드 라이브",
    date: "2025-10-25",
    time: "19:00",
    venue: "올림픽공원 체조경기장",
    price: 90000,
    description: "열정적인 록 사운드로 가득한 밤",
    imageUrl: "/images/concerts/band.jpeg",
    seats: generateSeats()
  },
  {
    id: 4,
    title: "뮤지컬 갈라쇼",
    date: "2025-11-01",
    time: "15:00",
    venue: "충무아트센터",
    price: 120000,
    description: "브로드웨이 뮤지컬의 명곡들을 한자리에서",
    imageUrl: "/images/concerts/NJZ.jpeg",
    seats: generateSeats()
  },
  {
    id: 5,
    title: "팝 콘서트",
    date: "2025-11-05",
    time: "19:30",
    venue: "잠실실내체육관",
    price: 110000,
    description: "최신 히트곡과 함께하는 팝 콘서트",
    imageUrl: "/images/concerts/Kai_Matthiesen.jpeg",

    seats: generateSeats()
  },
  {
    id: 6,
    title: "국악 공연",
    date: "2025-11-10",
    time: "18:00",
    venue: "국립국악원",
    price: 45000,
    description: "전통과 현대가 만나는 국악의 새로운 해석",
    imageUrl: "/images/concerts/RIIZE.jpeg",
    seats: generateSeats()
  }
];