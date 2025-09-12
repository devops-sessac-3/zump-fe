import React from 'react';
import { useNavigate } from 'react-router-dom';

function ConcertCard({ concert }) {
  const navigate = useNavigate();

  const handleClick = () => {
    console.log('공연 클릭! ID:', concert.id);
    console.log('이동할 URL:', `/waiting/${concert.id}`);
    
    // selectConcert 호출 없이 바로 navigate만 실행
    navigate(`/waiting/${concert.id}`);
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

  const availableSeats = Object.values(concert.seats).filter(
    seat => seat === 'available'
  ).length;

  return (
    <div 
      className="concert-card"
      onClick={handleClick}
    >
      <div className="concert-image">
        <img 
          src={concert.imageUrl} 
          alt={concert.title}
          className="concert-image-img"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.classList.add('concert-image-fallback');
            e.target.parentElement.innerHTML = `
              <div class="concert-image-text">
                ${concert.title}
              </div>
            `;
          }}
          loading="lazy"
        />
        <div className="concert-image-overlay">
          <span className="concert-overlay-title">{concert.title}</span>
        </div>
      </div>
      
      <div className="concert-card-content">
        <h3 className="concert-title">{concert.title}</h3>
        
        <div className="concert-details">
          <div className="concert-meta">
            <span className="meta-icon">📅</span>
            <span>{formatDate(concert.date)}</span>
          </div>
          <div className="concert-meta">
            <span className="meta-icon">🕐</span>
            <span>{concert.time}</span>
          </div>
          <div className="concert-meta">
            <span className="meta-icon">📍</span>
            <span>{concert.venue}</span>
          </div>
          <div className="concert-meta concert-seats">
            <span className="meta-icon">💺</span>
            <span>잔여 좌석: {availableSeats}/40</span>
          </div>
        </div>
        
        <div className="concert-card-footer">
          <span className="view-details">자세히 보기 →</span>
        </div>
      </div>
    </div>
  );
}

export default ConcertCard;