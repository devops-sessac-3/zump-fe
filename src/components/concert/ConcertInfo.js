import React from 'react';

function ConcertInfo({ concert }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <div className="concert-info">
      <div className="concert-image-large">
        <span className="concert-image-text">{concert.title}</span>
      </div>
      
      <div className="concert-details-large">
        <h2 className="concert-title-large">{concert.title}</h2>
        
        <div className="concert-meta">
          <div className="meta-item">
            <span className="meta-label">📅 공연일</span>
            <span className="meta-value">{formatDate(concert.date)}</span>
          </div>
          
          <div className="meta-item">
            <span className="meta-label">🕐 시간</span>
            <span className="meta-value">{concert.time}</span>
          </div>
          
          <div className="meta-item">
            <span className="meta-label">📍 장소</span>
            <span className="meta-value">콘서트홀</span>
          </div>
          
          <div className="meta-item">
            <span className="meta-label">💰 가격</span>
            <span className="meta-value">50,000원</span>
          </div>
        </div>
        
        <div className="concert-description">
          <h4>공연 소개</h4>
          <p>
            최고의 아티스트들이 선사하는 특별한 무대입니다. 
            잊을 수 없는 감동과 추억을 만들어보세요.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ConcertInfo;