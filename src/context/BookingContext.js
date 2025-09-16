// eslint-disable-next-line
import React, { createContext, useContext, useState, useCallback } from 'react';
import { bookConcertSeat } from '../data/concertAPI';
import toast from 'react-hot-toast';

const BookingContext = createContext();

export const useBookingContext = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [selectedConcert, setSelectedConcert] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState(new Set());

  const selectConcert = (concert) => {
    setSelectedConcert(concert);
  };

  const resetBooking = () => {
    setSelectedSeats([]);
    setBookedSeats(new Set());
  };

  // 예매 완료 후 즉시 실행할 이벤트 발생 함수
  const triggerBookingSuccessEvents = useCallback((concertId, bookedSeatNumbers) => {
    console.log('🚀 예매 완료 이벤트 발생 시작:', { concertId, bookedSeatNumbers });

    // 1. sessionStorage 플래그 설정
    const bookingCompletedData = {
      concertId: concertId,
      bookedSeats: bookedSeatNumbers,
      timestamp: Date.now(),
      success: true
    };
    
    sessionStorage.setItem('bookingCompleted', JSON.stringify(bookingCompletedData));
    console.log('📝 sessionStorage 플래그 설정 완료');

    // 2. 실시간 예매 완료 이벤트 발생 (ConcertDetail이 감지)
    window.dispatchEvent(new CustomEvent('realTimeBookingSuccess', {
      detail: {
        concertId: concertId,
        bookedSeats: bookedSeatNumbers,
        timestamp: Date.now()
      }
    }));

    // 3. 좌석 업데이트 이벤트도 발생
    window.dispatchEvent(new CustomEvent('seatsUpdated', {
      detail: {
        concertId: concertId,
        timestamp: Date.now()
      }
    }));

    // 4. 일반 예매 완료 이벤트
    window.dispatchEvent(new CustomEvent('bookingCompleted', {
      detail: {
        concertId: concertId,
        bookedSeats: bookedSeatNumbers,
        timestamp: Date.now()
      }
    }));

    console.log('📡 모든 실시간 이벤트 발생 완료');

    // 5. 글로벌 강제 새로고침 함수 호출
    if (typeof window.forceConcertDetailRefresh === 'function') {
      console.log('🔧 글로벌 강제 새로고침 실행');
      setTimeout(() => {
        window.forceConcertDetailRefresh();
      }, 200); // 약간의 지연으로 안정성 확보
    }
  }, []);

  // 좌석 예매 함수
  const bookSeats = async (seatNumbers) => {
    if (!selectedConcert) {
      toast.error('공연이 선택되지 않았습니다.');
      return { success: false };
    }

    try {
      console.log('🎫 좌석 예매 API 호출 시작:', {
        concert: selectedConcert.concert_name || selectedConcert.name,
        concertId: selectedConcert.concert_se || selectedConcert.id,
        seats: seatNumbers
      });

      // 각 좌석에 대해 개별 API 호출
      const bookingPromises = seatNumbers.map(seatNumber => 
        bookConcertSeat(1, selectedConcert.concert_se || selectedConcert.id, seatNumber) // userSe는 임시로 1
      );

      const results = await Promise.all(bookingPromises);
      
      console.log('📡 API 응답 결과:', results);

      // 실패한 예매 확인
      const failedBookings = results.filter(result => !result.success);
      
      if (failedBookings.length > 0) {
        console.error('❌ 예매 실패:', failedBookings);
        toast.error('일부 좌석 예매에 실패했습니다.');
        return { success: false };
      }

      // 예매 성공 시 상태 업데이트
      setBookedSeats(prev => {
        const newBookedSeats = new Set(prev);
        seatNumbers.forEach(seat => newBookedSeats.add(seat));
        return newBookedSeats;
      });

      const concertId = selectedConcert.concert_se || selectedConcert.id;

      // 예매 완료 후 즉시 모든 이벤트 발생
      triggerBookingSuccessEvents(concertId, seatNumbers);

      // 성공 토스트 메시지
      toast.success(`🎉 ${seatNumbers.join(', ')} 좌석 예매 완료!`);
      
      return { success: true, data: results, bookedSeats: seatNumbers };
      
    } catch (error) {
      console.error('❌ 예매 중 오류:', error);
      toast.error('예매 중 오류가 발생했습니다.');
      return { success: false, error: error.message };
    }
  };

  return (
    <BookingContext.Provider value={{
      selectedConcert,
      selectedSeats,
      bookedSeats,
      selectConcert,
      setSelectedSeats,
      resetBooking,
      bookSeats,
      triggerBookingSuccessEvents // 외부에서도 호출 가능하도록 export
    }}>
      {children}
    </BookingContext.Provider>
  );
};



