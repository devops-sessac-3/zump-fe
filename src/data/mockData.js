import { generateSeats } from '../utils/helpers';

export const mockConcerts = [
  {
    id: 1,
    title: "Aespa – “Cosmic Symphony”",
    date: "2025-10-15",
    time: "19:30",
    venue: "Seoul Olympic Park KSPO Dome",
    price: 90000,
    description: "가상과 현실을 넘나드는 aespa의 세계관을 담은 듯한 우주적인 콘셉트",
    imageUrl: "/images/concerts/aespa.jpeg",
    seats: generateSeats()
  },
    {
    id: 2,
    title: "Chungha – “Radiant Pulse”",
    date: "2025-10-25",
    time: "19:00",
    venue: "Incheon Songdo Convensia",
    price: 80000,
    description: "세련되고 도심적인 분위기, 춤과 퍼포먼스를 빛낼 무대",
    imageUrl: "/images/concerts/chungha.jpeg",
    seats: generateSeats()
  },
  {
    id: 3,
    title: "Band – “Amplified Dreams”",
    date: "2025-10-20",
    time: "20:00",
    venue: "Busan BEXCO Auditorium, Busan",
    price: 65000,
    description: "최고의 밴드 뮤지션들의 라이브 감성을 담은 즉흥 연주",
    imageUrl: "/images/concerts/band.jpeg",
    seats: generateSeats()
  },
  {
    id: 4,
    title: "NJZ – “Future Motion”",
    date: "2025-11-01",
    time: "15:00",
    venue: "Tokyo Dome, Tokyo",
    price: 120000,
    description: "돌아온 차세대 아이콘들의 컴백 무대",
    imageUrl: "/images/concerts/NJZ.jpeg",
    seats: generateSeats()
  },
  {
    id: 5,
    title: "Kai Matthiesen – “Echoes of Infinity”",
    date: "2025-11-05",
    time: "19:30",
    venue: "Mercedes-Benz Arena, Berlin",
    price: 105000,
    description: "월드뮤지션 감성, 무한히 울려 퍼지는 음악의 울림",
    imageUrl: "/images/concerts/Kai_Matthiesen.jpeg",

    seats: generateSeats()
  },
  {
    id: 6,
    title: "RIIZE – “Beyond the Horizon”",
    date: "2025-11-10",
    time: "18:00",
    venue: "The Kia Forum, Los Angeles",
    price: 45000,
    description: "더 큰 무대를 향해 나아가는 성장 스토리의 시작",
    imageUrl: "/images/concerts/RIIZE.jpeg",
    seats: generateSeats()
  }
];