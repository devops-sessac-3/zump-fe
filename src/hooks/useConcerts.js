import { useState, useEffect } from 'react';
import { concertService } from '../services/concertService';
import toast from 'react-hot-toast';

export function useConcerts() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConcerts();
  }, []);

  const fetchConcerts = async () => {
    try {
      setLoading(true);
      const data = await concertService.getConcerts();
      setConcerts(data);
    } catch (err) {
      setError(err.message);
      toast.error('공연 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getConcertById = (id) => {
    return concerts.find(concert => concert.id === parseInt(id));
  };

  const updateConcertSeats = (concertId, seatNumber) => {
    setConcerts(prevConcerts => 
      prevConcerts.map(concert => 
        concert.id === concertId 
          ? {
              ...concert,
              seats: {
                ...concert.seats,
                [seatNumber]: 'occupied'
              }
            }
          : concert
      )
    );
  };

  return {
    concerts,
    loading,
    error,
    getConcertById,
    updateConcertSeats,
    refetch: fetchConcerts,
  };
}