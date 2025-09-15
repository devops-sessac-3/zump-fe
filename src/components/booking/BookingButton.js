import React, { useState } from 'react';
import { useBooking } from '../../hooks/useBooking';
import toast from 'react-hot-toast';

function BookingButton({ selectedSeats = [], concert }) {
  const { updateConcertSeats, clearSeat } = useBooking();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      toast.error('좌석을 선택해주세요.');
      return;
    }

    try {
      setIsProcessing(true);

      // 프론트에서만 좌석 예약 처리
      selectedSeats.forEach((seat) => {
        updateConcertSeats(concert.id, seat, 'occupied'); // 상태 변경
      });

      // 예약 완료 후 선택 초기화
      clearSeat();

      toast.success(`${selectedSeats.length}석 예매 완료!`);

      // 공연 상세 페이지에 그대로 남아있음 (리다이렉트 없음)
    } catch (error) {
      console.error('예매 처리 오류:', error);
      toast.error('예매 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <button 
        style={{
          backgroundColor: selectedSeats.length === 0 ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: selectedSeats.length === 0 ? 'not-allowed' : 'pointer'
        }}
        onClick={handleBooking}
        disabled={isProcessing || selectedSeats.length === 0}
      >
        {isProcessing ? '🔄 예매 처리 중...' : `🎫 예매하기 (${selectedSeats.length}석)`}
      </button>

      {selectedSeats.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <p>선택 좌석: {selectedSeats.map(seat => seat.seat_number).join(', ')}</p>
          <p>총 금액: {getTotalPrice().toLocaleString()}원</p>
        </div>
      )}
    </div>
  );
}

export default BookingButton;