import { useBookingContext } from '../context/BookingContext';
import { bookingService } from '../services/concertService';
import { useConcerts } from './useConcerts';
import toast from 'react-hot-toast';

export const useBooking = () => {
  const {
    selectedConcert,
    selectedSeat,
    bookingStep,
    waitingCount,
    isBooking,
    selectConcert,
    selectSeat,
    clearSeat,
    startBooking,
    setWaitingCount,
    completeBooking,
    resetBooking,
    setBookingStep,
  } = useBookingContext();

  const { updateConcertSeats } = useConcerts();

  // 좌석 예매 실행
  const executeBooking = async () => {
    if (!selectedConcert || !selectedSeat) {
      toast.error('공연과 좌석을 선택해주세요.');
      return { success: false };
    }

    try {
      // 예매 시작
      startBooking();

      // 대기 시뮬레이션
      await simulateWaiting();

      // 실제 예매 API 호출 (mock or backend)
      const result = await bookingService.bookSeat(
        selectedConcert.concert_se,
        selectedSeat
      );

      // 좌석 상태 업데이트 → 예약된 좌석은 다시 클릭 불가
      updateConcertSeats(
        selectedConcert.concert_se,
        selectedSeat,
        'occupied'
      );

      // 예매 완료
      completeBooking();

      toast.success(`좌석 ${selectedSeat} 예매가 완료되었습니다!`);

      return {
        success: true,
        booking: result,
        concertId: selectedConcert.concert_se,
        seatNumber: selectedSeat,
      };
    } catch (error) {
      console.error('예매 실행 오류:', error);

      resetBooking();

      const errorMessage = error.message || '예매 처리 중 오류가 발생했습니다.';
      toast.error(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // 대기 시뮬레이션
  const simulateWaiting = async () => {
    return new Promise((resolve) => {
      let count = 3;
      setWaitingCount(count);

      const interval = setInterval(() => {
        count -= 1;
        setWaitingCount(count);

        if (count <= 0) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);
    });
  };

  // 좌석 선택 with 유효성 검사
  const selectSeatWithValidation = (seatNumber, concertSeats) => {
    if (!concertSeats) {
      toast.error('좌석 정보를 불러오는 중입니다.');
      return false;
    }

    const seatStatus = concertSeats[seatNumber];

    if (seatStatus === 'occupied') {
      toast.error('이미 예약된 좌석입니다.');
      return false;
    }

    if (seatStatus !== 'available') {
      toast.error('선택할 수 없는 좌석입니다.');
      return false;
    }

    selectSeat(seatNumber);
    return true;
  };

  // 예매 취소
  const cancelBooking = async (bookingId) => {
    try {
      await bookingService.cancelBooking(bookingId);
      toast.success('예매가 취소되었습니다.');
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.message || '예매 취소 중 오류가 발생했습니다.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // 예매 데이터 검증
  const validateBookingData = () => {
    if (!selectedConcert) {
      return { valid: false, error: '공연을 선택해주세요.' };
    }

    if (!selectedSeat) {
      return { valid: false, error: '좌석을 선택해주세요.' };
    }

    if (isBooking) {
      return { valid: false, error: '이미 예매 진행 중입니다.' };
    }

    return { valid: true };
  };

  // 예매 정보 포맷팅
  const getBookingInfo = () => {
    if (!selectedConcert || !selectedSeat) {
      return null;
    }

    return {
      concertId: selectedConcert.concert_se,
      concertName: selectedConcert.concert_name,
      concertDate: selectedConcert.concert_date,
      concertTime: selectedConcert.concert_time,
      concertVenue: selectedConcert.concert_venue,
      seatNumber: selectedSeat,
      price: selectedConcert.concert_price,
      totalPrice: selectedConcert.concert_price,
    };
  };

  return {
    // 상태
    selectedConcert,
    selectedSeat,
    bookingStep,
    waitingCount,
    isBooking,

    // 액션
    selectConcert,
    selectSeat: selectSeatWithValidation,
    clearSeat,
    executeBooking,
    cancelBooking,
    resetBooking,
    setBookingStep,

    // 유틸리티
    validateBookingData,
    getBookingInfo,
  };
};

