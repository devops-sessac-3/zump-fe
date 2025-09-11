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
      // 예매 시작만 처리 - 카운트다운은 WaitingPage에서 처리
      bookingContext.startBooking();
      return { success: true };
    } catch (error) {
      toast.error(error.message || '예매에 실패했습니다.');
      bookingContext.setBookingStep('selection');
      return { success: false, error: error.message };
    }
  };

  const completeBooking = async (seatToBook = null) => {
    console.log('=== completeBooking 시작 ===');
    
    try {
      const { selectedConcert, selectedSeat } = bookingContext;
      const targetSeat = seatToBook || selectedSeat; // 파라미터가 있으면 우선 사용
      
      console.log('선택된 공연:', selectedConcert);
      console.log('원래 선택된 좌석:', selectedSeat);
      console.log('예약할 좌석:', targetSeat);
      console.log('updateConcertSeats 함수:', updateConcertSeats);
      
      if (!targetSeat) {
        console.error('예약할 좌석이 없습니다!');
        return { success: false };
      }

      // 서버에 예매 요청
      console.log('서버 예매 요청 시작...');
      await bookingService.bookSeat(selectedConcert.id, targetSeat);
      console.log('서버 예매 요청 완료');
      
      // 로컬 상태 업데이트
      console.log('로컬 상태 업데이트 시작...');
      updateConcertSeats(selectedConcert.id, targetSeat);
      console.log('로컬 상태 업데이트 완료');
      
      bookingContext.completeBooking();
      
      toast.success('예약이 완료되었습니다!');
      return { success: true };
    } catch (error) {
      console.error('completeBooking 에러:', error);
      toast.error('예매 처리 중 오류가 발생했습니다.');
      bookingContext.setBookingStep('selection');
      return { success: false };
    }
  };

  return {
    ...bookingContext,
    bookSeat,
    completeBooking,
  };
}