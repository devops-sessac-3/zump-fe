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

  // ✅ 좌석 예매 함수 추가
  const bookSeats = async (seatNumbers) => {
    if (!selectedConcert) {
      toast.error('공연이 선택되지 않았습니다.');
      return { success: false };
    }

    try {
      console.log('🎫 좌석 예매 API 호출 시작:', {
        concert: selectedConcert.concert_name,
        concertId: selectedConcert.concert_se,
        seats: seatNumbers
      });

      // 각 좌석에 대해 개별 API 호출
      const bookingPromises = seatNumbers.map(seatNumber => 
        bookConcertSeat(1, selectedConcert.concert_se, seatNumber) // userSe는 임시로 1
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

      // ✅ 예매 성공 시 상태 업데이트
      setBookedSeats(prev => {
        const newBookedSeats = new Set(prev);
        seatNumbers.forEach(seat => newBookedSeats.add(seat));
        return newBookedSeats;
      });

      // 세션 스토리지에 예매 완료 플래그 저장
      sessionStorage.setItem('bookingCompleted', JSON.stringify({
        concertId: selectedConcert.concert_se,
        bookedSeats: seatNumbers,
        timestamp: new Date().toISOString()
      }));

      toast.success(`🎉 ${seatNumbers.join(', ')} 좌석 예매 완료!`);
      
      return { success: true, data: results };
      
    } catch (error) {
      console.error('❌ 예매 중 오류:', error);
      toast.error('예매 중 오류가 발생했습니다.');
      return { success: false };
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
      bookSeats // ✅ 예매 함수 추가
    }}>
      {children}
    </BookingContext.Provider>
  );
};


