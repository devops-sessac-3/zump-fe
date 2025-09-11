import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ConcertInfo from './ConcertInfo';
import SeatMap from '../booking/SeatMap';
import Loading from '../common/Loading';
import { useConcerts } from '../../hooks/useConcerts';
import { useBooking } from '../../hooks/useBooking';
import '../../styles/components/Concert.css';

function ConcertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getConcertById, loading, concerts } = useConcerts(); // concerts 추가
  const { selectConcert, selectedConcert } = useBooking();
  const [isLoading, setIsLoading] = useState(true);

  // concerts 상태가 변경될 때마다 최신 concert 가져오기
  const concert = getConcertById(id);

  useEffect(() => {
    if (!loading) {
      setIsLoading(false);
      
      if (concert && (!selectedConcert || selectedConcert.id !== concert.id)) {
        selectConcert(concert);
      }
    }
  }, [id, loading, concert, selectConcert, selectedConcert, concerts]); // concerts 의존성 추가

  if (isLoading || loading) {
    return (
      <div className="concert-detail-container">
        <div className="loading-container">
          <Loading />
          <p>공연 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

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