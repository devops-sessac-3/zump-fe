// export const useConcerts = () => {
//   const [concerts, setConcerts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [usingMockData, setUsingMockData] = useState(false);

//   useEffect(() => {
//     const fetchConcerts = async () => {
//       try {
//         setLoading(true);
        
//         // 실제 API 호출 시도
//         const response = await fetch('/api/concerts');
        
//         if (response.status === 422) {
//           console.warn('백엔드 422 에러 발생 - 목 데이터로 대체');
//           setConcerts(mockConcerts);
//           setUsingMockData(true);
//           setError(null);
//         } else if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         } else {
//           const data = await response.json();
          
//           // 백엔드 데이터 정규화 (DB 필드명 기준)
//           const normalizedData = data.map(concert => ({
//             ...concert,
//             // DB 필드명을 프론트엔드에서 사용하는 필드명으로 매핑
//             id: concert.concert_se || concert.id,
//             title: concert.concert_name || concert.title || '제목 없음',
//             date: concert.concert_date || concert.date || '날짜 미정',
//             time: concert.concert_time || concert.time || '시간 미정',
//             venue: concert.concert_venue || concert.venue || '장소 미정',
//             price: concert.concert_price ? `${concert.concert_price.toLocaleString()}원` : (concert.price || '가격 미정'),
//             description: concert.concert_description || concert.description || '',
//             image: concert.image || concert.poster_url || concert.image_url || concert.imageUrl,
//             seats: concert.seats || concert.seat_layout || concert.seating || []
//           }));
          
//           setConcerts(normalizedData);
//           setUsingMockData(false);
//           setError(null);
//         }
//       } catch (err) {
//         console.error('API 호출 실패 - 목 데이터로 대체:', err);
//         setConcerts(mockConcerts);
//         setUsingMockData(true);
//         setError(null); // 목 데이터가 있으므로 에러를 null로 설정
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchConcerts();
//   }, []);

//   const getConcertById = useCallback((id) => {
//     const concertId = parseInt(id) || id;
//     return concerts.find(concert => 
//       concert.id === concertId || 
//       concert.id === parseInt(concertId) ||
//       concert.id === String(concertId)
//     );
//   }, [concerts]);

//   const getConcertSeats = useCallback((concertId) => {
//     const concert = getConcertById(concertId);
//     return concert?.seats || concert?.seat_layout || [];
//   }, [getConcertById]);

//   return {
//     concerts,
//     loading,
//     error,
//     usingMockData,
//     getConcertById,
//     getConcertSeats
//   };
// };

// // 개별 좌석 정보 가져오기 (백엔드 API와 호환)
// export const getSeatInfo = async (concertId, seatNumber) => {
//   try {
//     const response = await fetch(`/api/concerts/${concertId}/seats/${seatNumber}`);
    
//     if (response.status === 422 || !response.ok) {
//       // 목 데이터에서 좌석 정보 찾기
//       const concert = mockConcerts.find(c => c.id === parseInt(concertId));
//       const seat = concert?.seats.find(s => s.seat_number === seatNumber);
//       return seat || null;
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('좌석 정보 조회 실패:', error);
//     // 목 데이터에서 찾기
//     const concert = mockConcerts.find(c => c.id === parseInt(concertId));
//     const seat = concert?.seats.find(s => s.seat_number === seatNumber);
//     return seat || null;
//   }
// };

// // 좌석 예약 함수 (백엔드 API와 호환)
// export const bookSeat = async (concertId, seatNumber) => {
//   try {
//     const response = await fetch(`/api/concerts/${concertId}/seats/${seatNumber}/book`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       }
//     });
    
//     if (response.status === 422 || !response.ok) {
//       // 목 데이터에서 좌석 상태 업데이트 (메모리에서만)
//       console.warn('좌석 예약 API 실패 - 목 데이터에서 시뮬레이션');
//       return { success: true, message: '좌석이 예약되었습니다 (목 데이터)' };
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('좌석 예약 실패:', error);
//     return { success: false, message: '좌석 예약에 실패했습니다.' };
//   }
// };

// import { generateSeats } from '../utils/helpers';

// export const mockConcerts = [
//   {
//     id: 1,
//     title: "Aespa – “Cosmic Symphony”",
//     date: "2025-10-15",
//     time: "19:30",
//     venue: "Seoul Olympic Park KSPO Dome",
//     price: 90000,
//     description: "가상과 현실을 넘나드는 aespa의 세계관을 담은 듯한 우주적인 콘셉트",
//     imageUrl: "/images/concerts/aespa.jpeg",
//     seats: generateSeats()
//   },
//     {
//     id: 2,
//     title: "Chungha – “Radiant Pulse”",
//     date: "2025-10-25",
//     time: "19:00",
//     venue: "Incheon Songdo Convensia",
//     price: 80000,
//     description: "세련되고 도심적인 분위기, 춤과 퍼포먼스를 빛낼 무대",
//     imageUrl: "/images/concerts/chungha.jpeg",
//     seats: generateSeats()
//   },
//   {
//     id: 3,
//     title: "Band – “Amplified Dreams”",
//     date: "2025-10-20",
//     time: "20:00",
//     venue: "Busan BEXCO Auditorium, Busan",
//     price: 65000,
//     description: "최고의 밴드 뮤지션들의 라이브 감성을 담은 즉흥 연주",
//     imageUrl: "/images/concerts/band.jpeg",
//     seats: generateSeats()
//   },
//   {
//     id: 4,
//     title: "NJZ – “Future Motion”",
//     date: "2025-11-01",
//     time: "15:00",
//     venue: "Tokyo Dome, Tokyo",
//     price: 120000,
//     description: "돌아온 차세대 아이콘들의 컴백 무대",
//     imageUrl: "/images/concerts/NJZ.jpeg",
//     seats: generateSeats()
//   },
//   {
//     id: 5,
//     title: "Kai Matthiesen – “Echoes of Infinity”",
//     date: "2025-11-05",
//     time: "19:30",
//     venue: "Mercedes-Benz Arena, Berlin",
//     price: 105000,
//     description: "월드뮤지션 감성, 무한히 울려 퍼지는 음악의 울림",
//     imageUrl: "/images/concerts/Kai_Matthiesen.jpeg",

//     seats: generateSeats()
//   },
//   {
//     id: 6,
//     title: "RIIZE – “Beyond the Horizon”",
//     date: "2025-11-10",
//     time: "18:00",
//     venue: "The Kia Forum, Los Angeles",
//     price: 45000,
//     description: "더 큰 무대를 향해 나아가는 성장 스토리의 시작",
//     imageUrl: "/images/concerts/RIIZE.jpeg",
//     seats: generateSeats()
//   }
// ];