import { useState, useEffect, useCallback } from 'react';

// API 기본 URL 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// 이미지 매핑 함수 (백엔드 concert_name에 맞춤)
const getImageForConcert = (concertName) => {
  if (!concertName) return '/images/concerts/default.jpeg';
  
  const imageMap = {
    'Aespa – "Cosmic Symphony"': '/images/concerts/aespa.jpeg',
    'Chungha – "Radiant Pulse"': '/images/concerts/chungha.jpeg', 
    'Band – "Amplified Dreams"': '/images/concerts/band.jpeg',
    'NJZ – "Future Motion"': '/images/concerts/NJZ.jpeg',
    'Kai Matthiesen – "Echoes of Infinity"': '/images/concerts/Kai_Matthiesen.jpeg',
    'RIIZE – "Beyond the Horizon"': '/images/concerts/RIIZE.jpeg'
  };
  
  // 정확한 매칭 우선
  if (imageMap[concertName]) {
    return imageMap[concertName];
  }
  
  // 부분 매칭 시도
  for (const [key, imagePath] of Object.entries(imageMap)) {
    if (concertName.toLowerCase().includes(key.toLowerCase().split(' ')[0])) {
      return imagePath;
    }
  }
  
  return '/images/concerts/default.jpeg';
};

// 백엔드 데이터를 프론트엔드 형식으로 변환
const transformConcertData = (backendConcert) => {
  return {
    // 백엔드 스키마 유지
    concert_se: backendConcert.concert_se,
    concert_name: backendConcert.concert_name,
    concert_date: backendConcert.concert_date,
    concert_time: backendConcert.concert_time,
    concert_price: backendConcert.concert_price,
    concert_description: backendConcert.concert_description,
    concert_venue: backendConcert.concert_venue,
    
    // 프론트엔드 호환성 필드
    id: backendConcert.concert_se,
    name: backendConcert.concert_name,
    title: backendConcert.concert_name,
    date: backendConcert.concert_date,
    time: backendConcert.concert_time,
    venue: backendConcert.concert_venue,
    price: backendConcert.concert_price, // 숫자로 유지
    description: backendConcert.concert_description || '',
    image: getImageForConcert(backendConcert.concert_name),
    seats: backendConcert.seats || []
  };
};

// 백엔드와 연동하는 useConcerts 훅
export const useConcerts = () => {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchConcerts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiUrl = `${API_BASE_URL}/concerts`;
        console.log('API 호출 시작:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!isMounted) return;

        console.log('응답 상태:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('백엔드 응답 데이터:', data);
          
          // 백엔드 응답 데이터 변환
          const transformedConcerts = Array.isArray(data) ? data.map(transformConcertData) : [];
          
          console.log('변환된 콘서트 데이터:', transformedConcerts);
          setConcerts(transformedConcerts);
          setUsingMockData(false);
          
        } else {
          console.warn('백엔드 에러 - 목 데이터로 대체');
          if (isMounted) {
            setConcerts(getMockConcerts());
            setUsingMockData(true);
          }
        }
        
      } catch (err) {
        console.error('API 호출 실패:', err.message);
        
        if (isMounted) {
          setConcerts(getMockConcerts());
          setUsingMockData(true);
          console.warn('목 데이터로 대체하여 계속 진행합니다.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchConcerts();

    return () => {
      isMounted = false;
    };
  }, []);

  const getConcertById = useCallback((id) => {
    const concertId = parseInt(id);
    return concerts.find(concert => 
      concert.concert_se === concertId || 
      concert.id === concertId
    );
  }, [concerts]);

  return {
    concerts,
    loading,
    error,
    usingMockData,
    getConcertById
  };
};

// 공연 상세 정보 가져오기 (좌석 정보 포함)
export const useConcertDetail = (concertId) => {
  const [concertDetail, setConcertDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchConcertDetail = async () => {
      if (!concertId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // 수정된 경로 사용 (오타 수정됨)
        const apiUrl = `${API_BASE_URL}/concerts/${concertId}`;
        console.log(`공연 상세 API 호출: ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!isMounted) return;

        if (response.ok) {
          const data = await response.json();
          console.log('상세 정보 백엔드 응답:', data);
          
          // 백엔드가 List를 반환할 수 있으므로 처리
          const concertData = Array.isArray(data) ? data[0] : data;
          
          if (!concertData) {
            throw new Error('공연 데이터가 없습니다.');
          }
          
          // 데이터 변환
          const transformedDetail = {
            ...transformConcertData(concertData),
            // 좌석 정보 특별 처리
            seats: Array.isArray(concertData.seats) ? concertData.seats : 
                   (concertData.seats ? [concertData.seats] : [])
          };
          
          setConcertDetail(transformedDetail);
          setUsingMockData(false);
          
        } else {
          console.warn('상세 정보 API 실패 - 목 데이터로 대체');
          if (isMounted) {
            setConcertDetail(getMockConcertDetail(concertId));
            setUsingMockData(true);
          }
        }
        
      } catch (err) {
        console.error('상세 정보 API 호출 실패:', err.message);
        if (isMounted) {
          setConcertDetail(getMockConcertDetail(concertId));
          setUsingMockData(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchConcertDetail();

    return () => {
      isMounted = false;
    };
  }, [concertId]);

  return {
    concertDetail,
    loading,
    error,
    usingMockData
  };
};

// 좌석 예약 API
export const bookConcertSeat = async (userSe, concertSe, seatNumber) => {
  try {
    console.log('좌석 예약 API 호출:', { userSe, concertSe, seatNumber });
    
    const response = await fetch(`${API_BASE_URL}/concerts-booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_se: userSe,
        concert_se: concertSe,
        seat_number: seatNumber
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('예약 성공:', result);
      
      const resultData = Array.isArray(result) ? result[0] : result;
      
      return { success: true, data: resultData };
    } else {
      const errorData = await response.json();
      console.error('예약 실패:', errorData);
      return { success: false, message: errorData.detail || '예약에 실패했습니다.' };
    }
    
  } catch (error) {
    console.error('예약 API 호출 오류:', error);
    return { success: false, message: '네트워크 오류가 발생했습니다.' };
  }
};

// 목 데이터 (백엔드 스키마와 정확히 일치)
const getMockConcerts = () => [
  {
    concert_se: 1,
    concert_name: 'Aespa – "Cosmic Symphony"',
    concert_date: "2025-10-15",
    concert_time: "19:30:00",
    concert_price: 90000,
    concert_description: "가상과 현실을 넘나드는 aespa의 세계관을 담은 듯한 우주적인 콘셉트",
    concert_venue: "SeoulDome",
    id: 1,
    name: 'Aespa – "Cosmic Symphony"',
    title: 'Aespa – "Cosmic Symphony"',
    date: "2025-10-15",
    time: "19:30:00",
    venue: "SeoulDome",
    price: 90000,
    description: "가상과 현실을 넘나드는 aespa의 세계관을 담은 듯한 우주적인 콘셉트",
    image: '/images/concerts/aespa.jpeg',
    seats: []
  },
  {
    concert_se: 2,
    concert_name: 'Chungha – "Radiant Pulse"',
    concert_date: "2025-10-25",
    concert_time: "19:00:00",
    concert_price: 80000,
    concert_description: "세련되고 도심적인 분위기, 춤과 퍼포먼스를 빛낼 무대",
    concert_venue: "SongdoCon",
    id: 2,
    name: 'Chungha – "Radiant Pulse"',
    title: 'Chungha – "Radiant Pulse"',
    date: "2025-10-25",
    time: "19:00:00",
    venue: "SongdoCon",
    price: 80000,
    description: "세련되고 도심적인 분위기, 춤과 퍼포먼스를 빛낼 무대",
    image: '/images/concerts/chungha.jpeg',
    seats: []
  },
  {
    concert_se: 3,
    concert_name: 'Band – "Amplified Dreams"',
    concert_date: "2025-10-20",
    concert_time: "20:00:00",
    concert_price: 65000,
    concert_description: "최고의 밴드 뮤지션들의 라이브 감성을 담은 즉흥 연주",
    concert_venue: "BEXCOAud",
    id: 3,
    name: 'Band – "Amplified Dreams"',
    title: 'Band – "Amplified Dreams"',
    date: "2025-10-20",
    time: "20:00:00",
    venue: "BEXCOAud",
    price: 65000,
    description: "최고의 밴드 뮤지션들의 라이브 감성을 담은 즉흥 연주",
    image: '/images/concerts/band.jpeg',
    seats: []
  },
  {
    concert_se: 4,
    concert_name: 'NJZ – "Future Motion"',
    concert_date: "2025-11-01",
    concert_time: "15:00:00",
    concert_price: 120000,
    concert_description: "돌아온 차세대 아이콘들의 컴백 무대",
    concert_venue: "TokyoDome",
    id: 4,
    name: 'NJZ – "Future Motion"',
    title: 'NJZ – "Future Motion"',
    date: "2025-11-01",
    time: "15:00:00",
    venue: "TokyoDome",
    price: 120000,
    description: "돌아온 차세대 아이콘들의 컴백 무대",
    image: '/images/concerts/NJZ.jpeg',
    seats: []
  },
  {
    concert_se: 5,
    concert_name: 'Kai Matthiesen – "Echoes of Infinity"',
    concert_date: "2025-11-05",
    concert_time: "19:30:00",
    concert_price: 105000,
    concert_description: "월드뮤지션 감성, 무한히 울려 퍼지는 음악의 울림",
    concert_venue: "MercedesA",
    id: 5,
    name: 'Kai Matthiesen – "Echoes of Infinity"',
    title: 'Kai Matthiesen – "Echoes of Infinity"',
    date: "2025-11-05",
    time: "19:30:00",
    venue: "MercedesA",
    price: 105000,
    description: "월드뮤지션 감성, 무한히 울려 퍼지는 음악의 울림",
    image: '/images/concerts/Kai_Matthiesen.jpeg',
    seats: []
  },
  {
    concert_se: 6,
    concert_name: 'RIIZE – "Beyond the Horizon"',
    concert_date: "2025-11-10",
    concert_time: "18:00:00",
    concert_price: 45000,
    concert_description: "더 큰 무대를 향해 나아가는 성장 스토리의 시작",
    concert_venue: "KiaForum",
    id: 6,
    name: 'RIIZE – "Beyond the Horizon"',
    title: 'RIIZE – "Beyond the Horizon"',
    date: "2025-11-10",
    time: "18:00:00",
    venue: "KiaForum",
    price: 45000,
    description: "더 큰 무대를 향해 나아가는 성장 스토리의 시작",
    image: '/images/concerts/RIIZE.jpeg',
    seats: []
  }
];

// 목 상세 데이터 (좌석 정보 포함)
const getMockConcertDetail = (concertId) => {
  const concerts = getMockConcerts();
  const concert = concerts.find(c => c.concert_se === parseInt(concertId));
  
  if (!concert) return null;
  
  // 좌석 생성
  const generateMockSeats = (concertSe) => {
    const seats = [];
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const seatsPerRow = 8;
    let seatSeCounter = concertSe * 100;

    rows.forEach(row => {
      for (let num = 1; num <= seatsPerRow; num++) {
        seats.push({
          seat_se: seatSeCounter++,
          seat_number: `${row}${num}`,
          is_booked: Math.random() < 0.15 // 15% 확률로 예약됨
        });
      }
    });

    return seats;
  };

  return {
    ...concert,
    seats: generateMockSeats(concert.concert_se)
  };
};

