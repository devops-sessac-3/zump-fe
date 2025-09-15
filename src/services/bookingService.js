class BookingService {
  constructor() {
    this.selectedSeats = [];
    this.currentConcert = null;
    this.bookingInProgress = false;
  }

  // 좌석 선택/해제
  toggleSeat(seatNumber) {
    const index = this.selectedSeats.indexOf(seatNumber);
    if (index === -1) {
      this.selectedSeats.push(seatNumber);
    } else {
      this.selectedSeats.splice(index, 1);
    }
    return this.selectedSeats;
  }

  // 선택된 좌석 목록 반환
  getSelectedSeats() {
    return [...this.selectedSeats];
  }

  // 좌석 선택 초기화
  clearSelectedSeats() {
    this.selectedSeats = [];
  }

  // 현재 공연 설정
  setCurrentConcert(concert) {
    this.currentConcert = concert;
  }

  // 현재 공연 반환
  getCurrentConcert() {
    return this.currentConcert;
  }

  // 좌석 번호 유효성 검사
  isValidSeatNumber(seatNumber) {
    // A1-A8, B1-B8, C1-C8, D1-D8, E1-E8 형태
    const seatPattern = /^[A-E][1-8]$/;
    return seatPattern.test(seatNumber);
  }

  // 좌석을 그리드 형태로 변환 (5행 8열)
  generateSeatGrid() {
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const seatsPerRow = 8;
    const grid = [];

    rows.forEach(row => {
      const rowSeats = [];
      for (let i = 1; i <= seatsPerRow; i++) {
        rowSeats.push(`${row}${i}`);
      }
      grid.push(rowSeats);
    });

    return grid;
  }

  // 좌석 상태 확인
  getSeatStatus(seatNumber, concertSeats) {
    if (!concertSeats) return 'available';
    
    const seat = concertSeats.find(s => s.number === seatNumber);
    if (!seat) return 'available';
    
    if (seat.isBooked) return 'occupied';
    if (this.selectedSeats.includes(seatNumber)) return 'selected';
    
    return 'available';
  }

  // 총 예매 금액 계산
  calculateTotalPrice(concert) {
    if (!concert || !concert.price) return 0;
    return concert.price * this.selectedSeats.length;
  }

  // 예매 가능 여부 확인
  canProceedBooking() {
    return this.selectedSeats.length > 0 && !this.bookingInProgress && this.currentConcert;
  }

  // 예매 진행 중 상태 설정
  setBookingInProgress(inProgress) {
    this.bookingInProgress = inProgress;
  }

  // 예매 진행 중 상태 확인
  isBookingInProgress() {
    return this.bookingInProgress;
  }

  // 좌석 정보 포맷팅
  formatSeatInfo(seatNumber) {
    const row = seatNumber.charAt(0);
    const number = seatNumber.slice(1);
    const rowNames = {
      'A': 'A구역',
      'B': 'B구역', 
      'C': 'C구역',
      'D': 'D구역',
      'E': 'E구역'
    };
    
    return `${rowNames[row]} ${number}번`;
  }

  // 선택된 좌석들 포맷팅
  formatSelectedSeatsInfo() {
    return this.selectedSeats.map(seat => this.formatSeatInfo(seat)).join(', ');
  }

  // 예매 확인 데이터 생성
  generateBookingConfirmationData() {
    if (!this.currentConcert || this.selectedSeats.length === 0) {
      return null;
    }

    return {
      concert: {
        id: this.currentConcert.id,
        name: this.currentConcert.name,
        date: this.currentConcert.date,
        time: this.currentConcert.time,
        venue: this.currentConcert.venue
      },
      seats: this.selectedSeats.map(seat => ({
        number: seat,
        formatted: this.formatSeatInfo(seat)
      })),
      totalPrice: this.calculateTotalPrice(this.currentConcert),
      seatCount: this.selectedSeats.length
    };
  }

  // 웨이팅 시뮬레이션을 위한 랜덤 대기시간 생성
  generateWaitingTime() {
    // 5초에서 15초 사이의 랜덤 시간
    return Math.floor(Math.random() * 10000) + 5000;
  }

  // 웨이팅 진행률 계산 (시뮬레이션)
  calculateWaitingProgress(elapsedTime, totalTime) {
    if (totalTime <= 0) return 100;
    const progress = (elapsedTime / totalTime) * 100;
    return Math.min(progress, 100);
  }

  // 예매 데이터 초기화
  reset() {
    this.selectedSeats = [];
    this.currentConcert = null;
    this.bookingInProgress = false;
  }

  // 로컬 스토리지에 임시 예매 데이터 저장
  saveTemporaryBookingData() {
    const data = {
      selectedSeats: this.selectedSeats,
      currentConcert: this.currentConcert,
      timestamp: Date.now()
    };
    localStorage.setItem('tempBookingData', JSON.stringify(data));
  }

  // 로컬 스토리지에서 임시 예매 데이터 복원
  restoreTemporaryBookingData() {
    try {
      const dataStr = localStorage.getItem('tempBookingData');
      if (!dataStr) return false;

      const data = JSON.parse(dataStr);
      const currentTime = Date.now();
      const dataAge = currentTime - data.timestamp;
      
      // 30분 이상 된 데이터는 삭제
      if (dataAge > 30 * 60 * 1000) {
        localStorage.removeItem('tempBookingData');
        return false;
      }

      this.selectedSeats = data.selectedSeats || [];
      this.currentConcert = data.currentConcert;
      return true;
    } catch (error) {
      console.error('임시 예매 데이터 복원 오류:', error);
      localStorage.removeItem('tempBookingData');
      return false;
    }
  }

  // 임시 예매 데이터 삭제
  clearTemporaryBookingData() {
    localStorage.removeItem('tempBookingData');
  }
}

// class를 변수에 할당 후 default export
const bookingService = new BookingService();
export default bookingService;
