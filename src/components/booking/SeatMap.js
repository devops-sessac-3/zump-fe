import React from 'react';
import SeatButton from './SeatButton';
import BookingButton from './BookingButton';
import { useBooking } from '../../hooks/useBooking';
import '../../styles/components/Booking.css';

function SeatMap({ concert }) {
  const { selectedSeat, selectSeat, clearSeat } = useBooking();

  const handleSeatClick = (seatNumber) => {
    if (concert.seats[seatNumber] === 'occupied') {
      return;
    }
    
    if (selectedSeat === seatNumber) {
      clearSeat();
    } else {
      selectSeat(seatNumber);
    }
  };

  const renderSeats = () => {
    const seats = [];
    for (let i = 1; i <= 40; i++) {
      seats.push(
        <SeatButton
          key={i}
          seatNumber={i}
          status={concert.seats[i]}
          isSelected={selectedSeat === i}
          onClick={() => handleSeatClick(i)}
        />
      );
    }
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