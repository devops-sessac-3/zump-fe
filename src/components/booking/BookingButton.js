import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../hooks/useBooking';
import toast from 'react-hot-toast';

function BookingButton() {
  const navigate = useNavigate();
  const { selectedSeat, selectedConcert, bookSeat } = useBooking();

  const handleBooking = async () => {
    if (!selectedSeat) {
      toast.error('좌석을 선택해주세요.');
      return;
    }

    if (!selectedConcert) {
      toast.error('공연 정보가 없습니다.');
      return;
    }

    const result = await bookSeat();
    if (result.success) {
      navigate('/waiting');
    }
  };

  const getButtonText = () => {
    if (!selectedSeat) {
      return '좌석을 선택해주세요';
    }
    return `${selectedSeat}번 좌석 예매하기`;
  };

  return (
    <button
      className={`booking-btn ${!selectedSeat ? 'disabled' : ''}`}
      onClick={handleBooking}
      disabled={!selectedSeat}
    >
      {getButtonText()}
    </button>
  );
}

export default BookingButton;