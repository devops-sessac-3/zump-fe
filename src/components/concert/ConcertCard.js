import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../hooks/useBooking';

function ConcertCard({ concert }) {
  const navigate = useNavigate();
  const { selectConcert } = useBooking();

  const handleClick = () => {
    selectConcert(concert);
    navigate(`/concerts/${concert.id}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  // 예매 가능한 좌석 수 계산
  const availableSeats = Object.values(concert.seats).filter(
    seat => seat === 'available'
  ).length;

  return (
    <div className="concert-card" onClick={handleClick}>
      <div className="concert-image">
        <span className="concert-image-text">{concert.title}</span>
      </div>
      <div className="concert-card-content">
        <h3 className="concert-title">{concert.title}</h3>
        <div className="concert-details">
          <p className="concert-date">
            📅 {formatDate(concert.date)}
          </p>
          <p className="concert-time">
            🕐 {concert.time}
          </p>
          <p className="concert-seats">
            💺 잔여 좌석: {availableSeats}/40
          </p>
        </div>
        <div className="concert-card-footer">
          <span className="view-details">자세히 보기 →</span>
        </div>
      </div>
    </div>
  );
}

export default ConcertCard;