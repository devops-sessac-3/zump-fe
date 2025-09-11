import { mockConcerts } from '../data/mockData';

export const concertService = {
  // 공연 목록 조회
  async getConcerts() {
    return new Promise((resolve) => {
      // 지연 시간을 줄이거나 제거
      setTimeout(() => {
        resolve(mockConcerts);
      }, 0); // 100ms 또는 0으로 변경
    });
  },

  // 특정 공연 조회
  async getConcertById(id) {
    return new Promise((resolve, reject) => {
      // 지연 시간을 줄이거나 제거
      setTimeout(() => {
        const concert = mockConcerts.find(c => c.id === parseInt(id));
        if (concert) {
          resolve(concert);
        } else {
          reject(new Error('공연을 찾을 수 없습니다.'));
        }
      }, 0); // 50ms 또는 0으로 변경
    });
  }
};