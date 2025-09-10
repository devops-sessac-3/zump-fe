import React from 'react';

function SeatButton({ seatNumber, status, isSelected, onClick }) {
  const getSeatClass = () => {
    let className = 'seat';
    
    if (status === 'occupied') {
      className += ' occupied';
    } else if (isSelected) {
      className += ' selected';
    } else {
      className += ' available';
    }
    
    return className;
  };

  const isDisabled = status === 'occupied';

  return (
    <button
      className={getSeatClass()}
      onClick={onClick}
      disabled={isDisabled}
      title={`좌석 ${seatNumber}번${isDisabled ? ' (예약불가)' : ''}`}
    >
      {seatNumber}
    </button>
  );
}

export default SeatButton;