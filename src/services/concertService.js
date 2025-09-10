import { mockConcerts } from '../data/mockData';

export const concertService = {
  // 공연 목록 조회
  async getConcerts() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockConcerts);
      }, 500);
    });
  },

  // 특정 공연 조회
  async getConcertById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const concert = mockConcerts.find(c => c.id === parseInt(id));
        if (concert) {
          resolve(concert);
        } else {
          reject(new Error('공연을 찾을 수 없습니다.'));
        }
      }, 300);
    });
  }
};