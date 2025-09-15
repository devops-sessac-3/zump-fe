import React from 'react';
import { useNavigate } from 'react-router-dom';

function ConcertCard({ concert }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (concert && concert.id) {
      // AccessWaitingPage를 거치도록 라우팅 수정
      navigate(`/waiting/${concert.id}`);
    } else {
      console.error('공연 ID가 없습니다:', concert);
    }
  };

  // 🎯 좌석 수 계산 - 항상 최소 40 보장
  const getAvailableSeats = () => {
    if (!concert) return 40;

    if (Array.isArray(concert.seats)) {
      try {
        const available = concert.seats.filter(seat => !seat.is_booked).length;
        return available > 0 ? available : 40; // 빈 배열이거나 0이면 40 반환
      } catch (error) {
        console.error('좌석 상태 계산 오류:', error);
        return 40;
      }
    }

    if (typeof concert.availableSeats === 'number') {
      return concert.availableSeats > 0 ? concert.availableSeats : 40;
    }

    return 40; // 기본값
  };

  // 안전한 가격 포맷팅
  const formatPrice = (price) => {
    if (price === null || price === undefined) return '가격 미정';
    if (typeof price !== 'number') return '가격 문의';
    return `${price.toLocaleString()}원`;
  };

  // 안전한 날짜 포맷팅
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      });
    } catch (error) {
      return dateStr;
    }
  };

  // 안전한 시간 포맷팅
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5); // HH:MM 형태로 자르기
  };

  // concert 객체가 없는 경우 처리
  if (!concert) {
    return (
      <div className="concert-card">
        <div className="concert-card-content">
          <p>공연 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const availableSeats = getAvailableSeats();

  return (
    <div className="concert-card" onClick={handleClick}>
      <div className="concert-image">
        {concert.image ? (
          <img 
            src={concert.image} 
            alt={concert.name || '공연 이미지'} 
            className="concert-image-img"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        <div 
          className="concert-image-fallback"
          style={{ display: concert.image ? 'none' : 'flex' }}
        >
          <span className="concert-image-text">
            {concert.name || '공연 정보'}
          </span>
        </div>
        
        <div className="concert-image-overlay">
          <span className="concert-overlay-title">
            {concert.name}
          </span>
        </div>
      </div>
      
      <div className="concert-card-content">
        <h3 className="concert-title">{concert.name || '제목 없음'}</h3>
        
        <div className="concert-details">
          <div className="concert-meta">
            <span className="meta-icon">📅</span>
            <span>{formatDate(concert.date)}</span>
          </div>
          
          <div className="concert-meta">
            <span className="meta-icon">⏰</span>
            <span>{formatTime(concert.time)}</span>
          </div>
          
          <div className="concert-meta">
            <span className="meta-icon">📍</span>
            <span>{concert.venue || '장소 미정'}</span>
          </div>
          
          <div className="concert-meta">
            <span className="meta-icon">💰</span>
            <span>{formatPrice(concert.price)}</span>
          </div>
          
          <div className="concert-meta">
            <span className="meta-icon">💺</span>
            <span className="concert-seats">
              {availableSeats}석 예매 가능
            </span>
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
