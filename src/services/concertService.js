// API 기본 URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// 인증 헤더 생성
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const concertService = {
  // 공연 목록 조회 - 실제 백엔드 API 호출
  async getConcerts() {
    try {
      const response = await fetch(`${API_BASE_URL}/concerts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('공연 목록을 가져올 수 없습니다.');
      }

      const concerts = await response.json();
      
      // 백엔드 응답을 프론트엔드 형식으로 변환
      return concerts.map(concert => ({
        id: concert.concert_se,
        name: concert.concert_name,
        date: concert.concert_date,
        time: concert.concert_time,
        price: concert.concert_price,
        description: concert.concert_description,
        venue: concert.concert_venue,
        image: getConcertImage(concert.concert_name), // 이미지 매핑
        // 좌석 정보는 상세 페이지에서 로드
        seats: null,
        availableSeats: 40 // 기본값, 상세에서 실제 계산
      }));
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      }
      throw error;
    }
  },

  // 특정 공연 조회 - 실제 백엔드 API 호출
  async getConcertById(id, isRetry = false) {
    // ID 유효성 검사
    if (!id || id === 'undefined' || id === 'null') {
      throw new Error('유효하지 않은 공연 ID입니다.');
    }

    // 숫자로 변환 시도
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      throw new Error('공연 ID는 숫자여야 합니다.');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/concerts/${numericId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('공연을 찾을 수 없습니다.');
        }
        if (response.status === 422) {
          // 422 오류의 경우 더 자세한 정보 표시
          try {
            const errorData = await response.json();
            console.error(`422 오류 상세:`, errorData);
            
            // 임시 해결: 백엔드 오류시 목 데이터 반환
            console.warn(`백엔드 422 오류로 인해 임시 목 데이터를 사용합니다.`);
            return this.getMockConcertData(numericId);
            
          } catch (parseError) {
            const errorText = await response.text();
            console.error(`422 오류 텍스트:`, errorText);
            throw new Error(`공연 ID ${numericId}이(가) 존재하지 않거나 처리할 수 없습니다.`);
          }
        }
        throw new Error('공연 정보를 가져올 수 없습니다.');
      }

      const concert = await response.json();
      
      if (!concert) {
        throw new Error('공연 정보가 없습니다.');
      }

      // 좌석 정보 처리 (JSON 문자열일 수 있음)
      let seats = {};
      let seatInitializationNeeded = false;
      
      if (concert.seats) {
        try {
          const seatsList = typeof concert.seats === 'string' 
            ? JSON.parse(concert.seats) 
            : concert.seats;
          
          if (Array.isArray(seatsList) && seatsList.length > 0) {
            // 좌석 배열을 객체로 변환
            seatsList.forEach(seat => {
              if (seat && seat.seat_number) {
                seats[seat.seat_number] = seat.is_booked ? 'occupied' : 'available';
              }
            });
          } else {
            seatInitializationNeeded = true;
          }
        } catch (e) {
          console.error('좌석 정보 파싱 오류:', e);
          seatInitializationNeeded = true;
        }
      } else {
        seatInitializationNeeded = true;
      }

      // 좌석이 없는 경우 초기화 호출
      if (seatInitializationNeeded || Object.keys(seats).length === 0) {
        console.log(`공연 ${numericId}의 좌석을 초기화합니다.`);
        await this.initializeSeats(numericId);
        // 재귀 호출 방지를 위해 플래그 추가
        if (!isRetry) {
          return this.getConcertById(id, true);
        }
      }

      // 안전한 데이터 변환
      return {
        id: concert?.concert_se || numericId,
        name: concert?.concert_name || '제목 없음',
        date: concert?.concert_date || null,
        time: concert?.concert_time || null,
        price: typeof concert?.concert_price === 'number' ? concert.concert_price : null,
        description: concert?.concert_description || null,
        venue: concert?.concert_venue || '장소 미정',
        image: getConcertImage(concert?.concert_name),
        seats: seats,
        availableSeats: Object.keys(seats).length > 0 
          ? Object.values(seats).filter(status => status === 'available').length 
          : 40
      };
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      }
      throw error;
    }
  },

  // 임시 목 데이터 생성 - 개선된 버전
  getMockConcertData(id) {
    console.log(`목 데이터 생성 시작 - ID: ${id}`);
    
    const mockConcerts = {
      1: { 
        name: 'Aespa – "Cosmic Symphony"', 
        date: '2025-10-15', 
        time: '19:30:00', 
        price: 90000, 
        venue: 'SeoulDome',
        description: '가상과 현실을 넘나드는 aespa의 세계관을 담은 듯한 우주적인 콘셉트'
      },
      2: { 
        name: 'Chungha – "Radiant Pulse"', 
        date: '2025-10-25', 
        time: '19:00:00', 
        price: 80000, 
        venue: 'SongdoCon',
        description: '세련되고 도심적인 분위기, 춤과 퍼포먼스를 빛낼 무대'
      },
      3: { 
        name: 'Band – "Amplified Dreams"', 
        date: '2025-10-20', 
        time: '20:00:00', 
        price: 65000, 
        venue: 'BEXCOAud',
        description: '최고의 밴드 뮤지션들의 라이브 감성을 담은 즉흥 연주'
      },
      4: { 
        name: 'NJZ – "Future Motion"', 
        date: '2025-11-01', 
        time: '15:00:00', 
        price: 120000, 
        venue: 'TokyoDome',
        description: '돌아온 차세대 아이콘들의 컴백 무대'
      },
      5: { 
        name: 'Kai Matthiesen – "Echoes of Infinity"', 
        date: '2025-11-05', 
        time: '19:30:00', 
        price: 105000, 
        venue: 'MercedesA',
        description: '월드뮤지션 감성, 무한히 울려 퍼지는 음악의 울림'
      },
      6: { 
        name: 'RIIZE – "Beyond the Horizon"', 
        date: '2025-11-10', 
        time: '18:00:00', 
        price: 45000, 
        venue: 'KiaForum',
        description: '더 큰 무대를 향해 나아가는 성장 스토리의 시작'
      }
    };

    const numericId = parseInt(id);
    const mockData = mockConcerts[numericId];
    
    if (!mockData) {
      console.error(`목 데이터를 찾을 수 없습니다. ID: ${id}`);
      throw new Error('공연을 찾을 수 없습니다.');
    }

    console.log(`목 데이터 찾음:`, mockData);

    // 40개 좌석 생성 (A1-E8) - 배열 형태
    const seats = [];
    const rows = ['A', 'B', 'C', 'D', 'E'];
    let seatId = 1;
    
    rows.forEach(row => {
      for (let i = 1; i <= 8; i++) {
        seats.push({
          seat_se: seatId++,
          seat_number: `${row}${i}`,
          is_booked: false,
          status: 'available'
        });
      }
    });

    const result = {
      id: numericId,
      name: mockData.name,
      date: mockData.date,
      time: mockData.time,
      price: mockData.price,
      description: mockData.description,
      venue: mockData.venue,
      image: getConcertImage(mockData.name),
      seats: seats, // 배열 형태
      availableSeats: 40
    };

    console.log('최종 목 데이터 반환:', result);
    return result;
  },

  // 좌석 초기화 - 새로 추가된 API 호출
  async initializeSeats(concertId) {
    try {
      const response = await fetch(`${API_BASE_URL}/concerts/${concertId}/initialize-seats`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('로그인이 필요합니다.');
        }
        throw new Error('좌석 초기화에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('좌석 초기화 오류:', error);
      // 초기화 실패는 치명적이지 않으므로 에러를 던지지 않음
      return { message: '좌석 초기화에 실패했습니다.' };
    }
  }
};

// 예매 서비스
export const bookingService = {
  // 좌석 예매 - 실제 백엔드 API 호출
  async bookSeat(concertId, seatNumber) {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      const response = await fetch(`${API_BASE_URL}/concerts-booking`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          user_se: parseInt(user.id) || 1, // 사용자 ID (임시로 1 사용)
          concert_se: parseInt(concertId),
          seat_number: seatNumber
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          throw new Error('로그인이 필요합니다.');
        }
        if (response.status === 400) {
          throw new Error(errorData.detail || '이미 예약된 좌석이거나 예약할 수 없습니다.');
        }
        throw new Error(errorData.detail || '예매 처리 중 오류가 발생했습니다.');
      }

      const result = await response.json();
      
      return {
        bookingId: Date.now(), // 임시 예매 ID
        concertId: parseInt(concertId),
        seatNumber: seatNumber,
        status: 'confirmed',
        seatInfo: result
      };
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('서버에 연결할 수 없습니다.');
      }
      throw error;
    }
  },

  // 예매 취소 (향후 구현)
  async cancelBooking(bookingId) {
    // 현재 백엔드에 취소 API가 없으므로 시뮬레이션
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  }
};

// 공연 이미지 매핑 함수
function getConcertImage(concertName) {
  const imageMap = {
    'Aespa – "Cosmic Symphony"': '/images/concerts/aespa.jpeg',
    'Chungha – "Radiant Pulse"': '/images/concerts/chungha.jpeg',
    'Band – "Amplified Dreams"': '/images/concerts/band.jpeg',
    'NJZ – "Future Motion"': '/images/concerts/NJZ.jpeg',
    'Kai Matthiesen – "Echoes of Infinity"': '/images/concerts/Kai_Matthiesen.jpeg',
    'RIIZE – "Beyond the Horizon"': '/images/concerts/RIIZE.jpeg'
  };

  return imageMap[concertName] || '/images/concerts/band.jpeg'; // 기본 이미지
}

