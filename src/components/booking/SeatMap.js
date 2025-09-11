import React from 'react';
import SeatButton from './SeatButton';
import BookingButton from './BookingButton';
import { useBooking } from '../../hooks/useBooking';
import '../../styles/components/Booking.css';

function SeatMap({ concert }) {
  const { selectedSeat, selectSeat, clearSeat } = useBooking();

  // 컴포넌트가 렌더링될 때마다 concert.seats 확인
  console.log('=== SeatMap 렌더링 ===');
  console.log('전체 concert 객체:', concert);
  console.log('concert.seats:', concert.seats);
  console.log('concert.seats 타입:', typeof concert.seats);
  console.log('selectedSeat:', selectedSeat);

  const handleSeatClick = (seatNumber) => {
    console.log('좌석 클릭:', seatNumber);
    console.log('해당 좌석 상태:', concert.seats[seatNumber]);
    
    if (concert.seats[seatNumber] === 'occupied') {
      console.log('이미 점유된 좌석');
      return;
    }
    
    if (selectedSeat === seatNumber) {
      console.log('선택 해제');
      clearSeat();
    } else {
      console.log('좌석 선택');
      selectSeat(seatNumber);
    }
  };

  const renderSeats = () => {
    const seats = [];
    console.log('=== renderSeats 시작 ===');
    
    for (let i = 1; i <= 40; i++) {
      const seatNumber = i;
      const seatStatus = concert.seats[seatNumber];
      
      console.log(`좌석 ${seatNumber}: 상태=${seatStatus}, 선택됨=${selectedSeat === seatNumber}`);
      
      seats.push(
        <SeatButton
          key={i}
          seatNumber={seatNumber}
          status={seatStatus}
          isSelected={selectedSeat === seatNumber}
          onClick={() => handleSeatClick(seatNumber)}
        />
      );
    }
    
    console.log('=== renderSeats 완료 ===');
    return seats;
  };

  return (
    <div className="seats-section">
      <h3>좌석 선택</h3>
      
      <div className="stage">
        🎵 STAGE 🎵
      </div>
      
      <div className="seat-legend">
        <div className="legend-item">
          <div className="legend-color available"></div>
          <span>선택 가능</span>
        </div>
        <div className="legend-item">
          <div className="legend-color occupied"></div>
          <span>선택 불가</span>
        </div>
        <div className="legend-item">
          <div className="legend-color selected"></div>
          <span>선택됨</span>
        </div>
      </div>
      
      <div className="seats-grid">
        {renderSeats()}
      </div>
      
      <BookingButton />
    </div>
  );
}

export default SeatMap;