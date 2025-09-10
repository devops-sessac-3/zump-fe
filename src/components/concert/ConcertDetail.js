import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ConcertInfo from './ConcertInfo';
import SeatMap from '../booking/SeatMap';
import { useConcerts } from '../../hooks/useConcerts';
import { useBooking } from '../../hooks/useBooking';
import '../../styles/components/Concert.css';

function ConcertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getConcertById } = useConcerts();
  const { selectConcert, selectedConcert } = useBooking();

  const concert = getConcertById(id);

  useEffect(() => {
    if (concert && (!selectedConcert || selectedConcert.id !== concert.id)) {
      selectConcert(concert);
    }
  }, [concert, selectConcert, selectedConcert]);

  if (!concert) {
    return (
      <div className="concert-detail-container">
        <div className="error-message">
          공연을 찾을 수 없습니다.
          <button 
            className="back-btn"
            onClick={() => navigate('/concerts')}
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="concert-detail-container">
      <button 
        className="back-btn"
        onClick={() => navigate('/concerts')}
      >
        ← 목록으로 돌아가기
      </button>
      
      <div className="detail-content">
        <ConcertInfo concert={concert} />
        <SeatMap concert={concert} />
      </div>
    </div>
  );
}

export default ConcertDetail;