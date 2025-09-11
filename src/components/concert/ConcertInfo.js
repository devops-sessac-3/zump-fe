// src/components/concert/ConcertInfo.js
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

  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR');
  };

  return (
    <div className="concert-info">
      <div className="concert-image-large">
        <img 
          src={concert.imageUrl} 
          alt={concert.title}
          className="concert-detail-image"
          onError={(e) => {
            e.target.style.display = 'none';
            // e.target.parentElement.classList.add('concert-image-fallback');
            e.target.parentElement.innerHTML = `
              <div class="concert-image-text-large">
                ${concert.title}
              </div>
            `;
          }}
          loading="lazy"
        />
      </div>
      
      <h2 className="concert-title-large">{concert.title}</h2>
      
      <div className="concert-details-large">
        <div className="detail-item">
          <span className="detail-label">📅 공연일</span>
          <span className="detail-value">{formatDate(concert.date)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">🕐 시간</span>
          <span className="detail-value">{concert.time}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">📍 장소</span>
          <span className="detail-value">{concert.venue}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">💰 가격</span>
          <span className="detail-value">{formatPrice(concert.price)}원</span>
        </div>
      </div>
      
      <div className="concert-description">
        <h4>공연 소개</h4>
        <p>{concert.description}</p>
      </div>
    </div>
  );
}

export default ConcertInfo;