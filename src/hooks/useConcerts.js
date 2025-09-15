import { useState, useEffect } from 'react';
import { concertService } from '../services/concertService';
import toast from 'react-hot-toast';

export const useConcerts = () => {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getConcerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await concertService.getConcerts();
      setConcerts(data);
    } catch (err) {
      console.error('공연 목록 조회 오류:', err);
      setError(err.message);
      toast.error(err.message || '공연 목록을 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getConcertById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      // ID 유효성 검사
      if (!id || id === 'undefined' || id === 'null') {
        throw new Error('유효하지 않은 공연 ID입니다.');
      }
      
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        throw new Error('공연 ID는 숫자여야 합니다.');
      }
      
      // 먼저 로컬 캐시에서 찾기 (좌석 정보가 있는 경우에만)
      const cachedConcert = concerts.find(concert => concert.id === numericId);
      if (cachedConcert && cachedConcert.seats && Object.keys(cachedConcert.seats).length > 0) {
        return cachedConcert;
      }
      
      // API에서 상세 정보 조회
      console.log(`공연 ${numericId} 상세 정보를 API에서 조회합니다.`);
      const concert = await concertService.getConcertById(numericId);
      
      if (!concert || !concert.id) {
        throw new Error('공연 정보가 올바르지 않습니다.');
      }
      
      // 캐시 업데이트
      setConcerts(prevConcerts => {
        const updated = prevConcerts.map(c => 
          c.id === numericId ? { ...c, ...concert } : c
        );
        
        // 새로운 공연인 경우 추가
        if (!updated.find(c => c.id === numericId)) {
          updated.push(concert);
        }
        
        console.log(`공연 ${numericId} 캐시 업데이트 완료`);
        return updated;
      });
      
      return concert;
    } catch (err) {
      console.error('공연 상세 조회 오류:', err);
      setError(err.message);
      toast.error(err.message || '공연 정보를 가져오는데 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateConcertSeats = (concertId, seatNumber, status = 'occupied') => {
    console.log('=== updateConcertSeats 호출 ===');
    console.log('concertId:', concertId, 'seatNumber:', seatNumber, 'status:', status);
    
    setConcerts(prevConcerts => {
      const updated = prevConcerts.map(concert => {
        if (concert.id === parseInt(concertId)) {
          console.log('매칭된 concert 찾음:', concert.id);
          
          if (!concert.seats || !Array.isArray(concert.seats)) {
            console.log('좌석 정보가 없거나 배열이 아님');
            return concert;
          }
          
          // 좌석 배열에서 해당 좌석 업데이트
          const newSeats = concert.seats.map(seat => {
            if (seat.seat_number === seatNumber) {
              console.log('좌석 상태 업데이트:', seat.seat_number, '->', status);
              return {
                ...seat,
                is_booked: status === 'occupied',
                status: status
              };
            }
            return seat;
          });
          
          // 사용 가능한 좌석 수 재계산
          const availableSeats = newSeats.filter(seat => !seat.is_booked).length;
          
          console.log('사용 가능한 좌석:', availableSeats);
          
          return {
            ...concert,
            seats: newSeats,
            availableSeats: availableSeats
          };
        }
        return concert;
      });
      
      return updated;
    });
  };

  // 좌석 초기화
  const initializeSeats = async (concertId) => {
    try {
      await concertService.initializeSeats(concertId);
      
      // 초기화 후 공연 정보 다시 조회
      await getConcertById(concertId);
      
      toast.success('좌석이 초기화되었습니다.');
    } catch (err) {
      console.error('좌석 초기화 오류:', err);
      toast.error('좌석 초기화에 실패했습니다.');
    }
  };

  // 공연 목록 새로고침
  const refreshConcerts = async () => {
    await getConcerts();
  };

  useEffect(() => {
    getConcerts();
  }, []);

  return {
    concerts,
    loading,
    error,
    getConcerts,
    getConcertById,
    updateConcertSeats,
    initializeSeats,
    refreshConcerts
  };
};

