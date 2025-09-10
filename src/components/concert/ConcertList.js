import React from 'react';
import ConcertCard from './ConcertCard';
import Loading from '../common/Loading';
import { useConcerts } from '../../hooks/useConcerts';
import '../../styles/components/Concert.css';

function ConcertList() {
  const { concerts, loading, error } = useConcerts();

  if (loading) return <Loading />;
  if (error) return <div className="error-message">공연 목록을 불러오는데 실패했습니다.</div>;

  return (
    <div className="concert-list-container">
      <h1 className="page-title">🎭 공연 목록</h1>
      <div className="concert-grid">
        {concerts.map(concert => (
          <ConcertCard key={concert.id} concert={concert} />
        ))}
      </div>
    </div>
  );
}

export default ConcertList;