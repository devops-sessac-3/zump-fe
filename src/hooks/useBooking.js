import { useBookingContext } from '../context/BookingContext';
import { useConcerts } from './useConcerts';
import { bookingService } from '../services/bookingService';
import toast from 'react-hot-toast';

export function useBooking() {
  const bookingContext = useBookingContext();
  const { updateConcertSeats } = useConcerts();

  const bookSeat = async () => {
    const { selectedConcert, selectedSeat } = bookingContext;
    
    if (!selectedConcert || !selectedSeat) {
      toast.error('공연과 좌석을 선택해주세요.');
      return { success: false };
    }

    // 이미 예약된 좌석인지 확인
    if (selectedConcert.seats[selectedSeat] === 'occupied') {
      toast.error('이미 선택된 좌석입니다.');
      return { success: false };
    }

    try {
      bookingContext.startBooking();
      
      // 대기 시뮬레이션
      const countdownInterval = setInterval(() => {
        bookingContext.setWaitingCount(prevCount => {
          const newCount = prevCount - 1;
          if (newCount <= 0) {
            clearInterval(countdownInterval);
            // 예매 완료 처리
            completeBooking();
          }
          return newCount;
        });
      }, 1000);

      return { success: true };
    } catch (error) {
      toast.error(error.message || '예매에 실패했습니다.');
      bookingContext.setBookingStep('selection');
      return { success: false, error: error.message };
    }
  };

  const completeBooking = async () => {
    try {
      const { selectedConcert, selectedSeat } = bookingContext;
      
      // 서버에 예매 요청
      await bookingService.bookSeat(selectedConcert.id, selectedSeat);
      
      // 로컬 상태 업데이트
      updateConcertSeats(selectedConcert.id, selectedSeat);
      bookingContext.completeBooking();
      
      toast.success('예약이 완료되었습니다!');
    } catch (error) {
      toast.error('예매 처리 중 오류가 발생했습니다.');
      bookingContext.setBookingStep('selection');
    }
  };

  return {
    ...bookingContext,
    bookSeat,
    completeBooking,
  };
}