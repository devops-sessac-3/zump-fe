import React, { useState } from 'react';
import { useBookingContext } from '../../context/BookingContext';
import toast from 'react-hot-toast';

const SeatMap = ({ concert, seats = [] }) => {
  const { bookedSeats, bookSeats } = useBookingContext();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isBooking, setIsBooking] = useState(false);

  // 좌석 클릭 핸들러
  const handleSeatClick = (seat) => {
    // 이미 예약된 좌석이면 클릭 불가
    if (seat.is_booked || bookedSeats.has(seat.seat_number)) {
      toast.error('이미 예약된 좌석입니다.');
      return;
    }

    // 선택된 좌석 토글
    setSelectedSeats(prev => {
      if (prev.includes(seat.seat_number)) {
        return prev.filter(s => s !== seat.seat_number);
      } else {
        return [...prev, seat.seat_number];
      }
    });
  };

  // 예매 완료 버튼 핸들러 
  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      toast.error('좌석을 선택해주세요.');
      return;
    }

    setIsBooking(true);
    console.log('🎫 예매 시작 - 선택된 좌석:', selectedSeats);

    try {
      const result = await bookSeats(selectedSeats);
      
      if (result.success) {
        console.log(' SeatMap: 예매 성공 처리 시작');
        
        // 선택된 좌석 즉시 초기화
        setSelectedSeats([]);
        
        // 추가 성공 처리 (BookingContext에서 이미 이벤트를 발생시키므로 여기서는 로컬 처리만)
        console.log('SeatMap: 예매 완료, 로컬 상태 정리 완료');
        
      } else {
        console.error('❌ SeatMap: 예매 실패:', result.error);
        toast.error(result.error || '예매 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('❌ SeatMap: 예매 처리 중 오류:', error);
      toast.error('예매 처리 중 오류가 발생했습니다.');
    } finally {
      setIsBooking(false);
    }
  };

  // 좌석 상태 결정 (기존 CSS 클래스 사용)
  const getSeatClass = (seat) => {
    if (seat.is_booked || bookedSeats.has(seat.seat_number)) {
      return 'seat occupied'; // 기존 CSS 클래스
    }
    if (selectedSeats.includes(seat.seat_number)) {
      return 'seat selected'; // 기존 CSS 클래스  
    }
    return 'seat available'; // 기존 CSS 클래스
  };

  return (
    <div className="seats-section"> 
      <h3>좌석 선택</h3>
      
      <div className="seat-legend">
        <div className="legend-item">
          <div className="legend-color available"></div>
          <span>예약 가능</span>
        </div>
        <div className="legend-item">
          <div className="legend-color selected"></div>
          <span>선택됨</span>
        </div>
        <div className="legend-item">
          <div className="legend-color occupied"></div>
          <span>예약됨</span>
        </div>
      </div>

      <div className="stage">STAGE</div>

      <div className="seats-grid">
        {seats.map((seat) => (
          <div
            key={seat.seat_se || seat.seat_number}
            className={getSeatClass(seat)} // 기존 CSS 클래스 사용
            onClick={() => handleSeatClick(seat)}
          >
            {seat.seat_number}
          </div>
        ))}
      </div>

      {selectedSeats.length > 0 && (
        <div className="selected-seats-info">
          <h4>선택된 좌석: {selectedSeats.join(', ')}</h4>
          <p>총 금액: {(selectedSeats.length * (concert.price || concert.concert_price || 0)).toLocaleString()}원</p>
        </div>
      )}

      <div className="booking-actions">
        <button
          className="btn btn-primary"
          onClick={handleBooking}
          disabled={selectedSeats.length === 0 || isBooking}
        >
          {isBooking ? '예매 처리 중...' : `${selectedSeats.length}개 좌석 예매하기`}
        </button>
      </div>
    </div>
  );
};

export default SeatMap;