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

  // ✅ 예매 완료 버튼 핸들러
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
        setSelectedSeats([]); // 선택 초기화
        // 페이지 새로고침은 BookingContext에서 처리
      }
    } catch (error) {
      console.error('예매 처리 중 오류:', error);
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
    <div className="seats-section"> {/* 기존 CSS 클래스 */}
      <h3>좌석 선택</h3>
      
      {/* 좌석 범례 - 기존 CSS 스타일 */}
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

      {/* 무대 - 기존 CSS 스타일 */}
      <div className="stage">STAGE</div>

      {/* 좌석 맵 - 기존 CSS 스타일 */}
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

      {/* 선택된 좌석 정보 */}
      {selectedSeats.length > 0 && (
        <div className="selected-seats-info">
          <h4>선택된 좌석: {selectedSeats.join(', ')}</h4>
          <p>총 금액: {(selectedSeats.length * (concert.price || concert.concert_price || 0)).toLocaleString()}원</p>
        </div>
      )}

      {/* ✅ 예매 완료 버튼 */}
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

