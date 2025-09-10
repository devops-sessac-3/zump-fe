export const bookingService = {
  // 좌석 예매
  async bookSeat(concertId, seatNumber) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 랜덤하게 성공/실패 시뮬레이션 (90% 성공률)
        if (Math.random() > 0.1) {
          resolve({
            bookingId: Date.now(),
            concertId,
            seatNumber,
            status: 'confirmed'
          });
        } else {
          reject(new Error('예매 처리 중 오류가 발생했습니다.'));
        }
      }, 3000); // 3초 대기
    });
  },

  // 예매 취소
  async cancelBooking(bookingId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  }
};