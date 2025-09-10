export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
};

export const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? '오후' : '오전';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${ampm} ${displayHour}:${minutes}`;
};

export const generateSeats = () => {
  const seats = {};
  for (let i = 1; i <= 40; i++) {
    // 30% 확률로 이미 예약된 상태로 설정
    seats[i] = Math.random() > 0.7 ? 'occupied' : 'available';
  }
  return seats;
};

export const getAvailableSeatCount = (seats) => {
  return Object.values(seats).filter(seat => seat === 'available').length;
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};