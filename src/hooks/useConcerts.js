import { useState, useEffect } from 'react';
import { concertService } from '../services/concertService';

export const useConcerts = () => {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getConcerts = async () => {
    try {
      setLoading(true);
      const data = await concertService.getConcerts();
      setConcerts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getConcertById = (id) => {
    return concerts.find(concert => concert.id === parseInt(id));
  };

  const updateConcertSeats = (concertId, seatNumber) => {
    console.log('=== updateConcertSeats 호출 ===');
    console.log('concertId:', concertId);
    console.log('seatNumber:', seatNumber);
    console.log('seatNumber 타입:', typeof seatNumber);
    
    setConcerts(prevConcerts => {
      console.log('이전 concerts:', prevConcerts);
      
      const updated = prevConcerts.map(concert => {
        if (concert.id === parseInt(concertId)) {
          console.log('매칭된 concert 찾음:', concert.id);
          console.log('이전 seats:', concert.seats);
          
          const newSeats = {
            ...concert.seats,
            [seatNumber]: 'occupied'
          };
          
          console.log('새로운 seats:', newSeats);
          
          return {
            ...concert,
            seats: newSeats
          };
        }
        return concert;
      });
      
      console.log('업데이트된 concerts:', updated);
      return updated;
    });
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
    updateConcertSeats
  };
};