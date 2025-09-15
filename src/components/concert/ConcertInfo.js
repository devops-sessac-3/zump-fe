import React from 'react';

function ConcertInfo({ concert }) {
  // 안전한 가격 포맷팅
  const formatPrice = (price) => {
    if (price === null || price === undefined) {
      return '가격 미정';
    }
    if (typeof price !== 'number') {
      return '가격 문의';
    }
    try {
      return `${price.toLocaleString()}원`;
    } catch (error) {
      console.error('가격 포맷팅 오류:', error);
      return '가격 문의';
    }
  };

  // 안전한 날짜 포맷팅
  const formatDate = (dateStr) => {
    if (!dateStr) return '날짜 미정';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      });
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return dateStr;
    }
  };

  // 안전한 시간 포맷팅
  const formatTime = (timeStr) => {
    if (!timeStr) return '시간 미정';
    try {
      return timeStr.substring(0, 5); // HH:MM 형태
    } catch (error) {
      return timeStr;
    }
  };

  // concert가 없는 경우 로딩 표시
  if (!concert) {
    return (
      <div className="concert-info">
        <div className="concert-image-large">
          <div className="concert-image-text-large">
            공연 정보를 불러오는 중...
          </div>
        </div>
      </div>
    );
  }

  // 백엔드 스키마와 호환되도록 데이터 추출
  const concertName = concert.name || concert.concert_name || concert.title || '제목 없음';
  const concertDate = concert.date || concert.concert_date;
  const concertTime = concert.time || concert.concert_time;
  const concertVenue = concert.venue || concert.concert_venue || '장소 미정';
  const concertPrice = concert.price || concert.concert_price;
  const concertDescription = concert.description || concert.concert_description;
  const concertImage = concert.image;

  // 사용 가능한 좌석 수 계산
  const calculateAvailableSeats = () => {
    if (concert.seats && Array.isArray(concert.seats)) {
      return concert.seats.filter(seat => !seat.is_booked).length;
    }
    if (typeof concert.availableSeats === 'number') {
      return concert.availableSeats;
    }
    return 40; // 기본값
  };

  const availableSeats = calculateAvailableSeats();

  return (
    <div className="concert-info">
      <div className="concert-image-large">
        {concertImage ? (
          <img 
            src={concertImage} 
            alt={concertName} 
            className="concert-detail-image"
            onError={(e) => {
              console.log(`이미지 로드 실패: ${concertImage}`);
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        <div 
          className="concert-image-text-large"
          style={{ display: concertImage ? 'none' : 'flex' }}
        >
          {concertName}
        </div>
      </div>
      
      <h1 className="concert-title-large">
        {concertName}
      </h1>
      
      <div className="concert-details-large">
        <div className="detail-item">
          <span className="detail-label">공연 날짜</span>
          <span className="detail-value">{formatDate(concertDate)}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">공연 시간</span>
          <span className="detail-value">{formatTime(concertTime)}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">공연 장소</span>
          <span className="detail-value">{concertVenue}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">관람료</span>
          <span className="detail-value">{formatPrice(concertPrice)}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">예매 가능 좌석</span>
          <span className="detail-value concert-seats">
            {availableSeats}석
          </span>
        </div>
      </div>
      
      {concertDescription && (
        <div className="concert-description">
          <h4>공연 소개</h4>
          <p>{concertDescription}</p>
        </div>
      )}

      {/* 개발 모드 디버깅 정보 */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          margin: '20px 0', 
          padding: '10px', 
          background: '#f0f0f0', 
          fontSize: '12px',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}>
          <details>
            <summary>🎭 공연 정보 디버깅</summary>
            <pre>{JSON.stringify({
              concert_se: concert.concert_se,
              concert_name: concert.concert_name,
              image: concert.image,
              seats_count: concert.seats?.length || 0,
              available_seats: availableSeats
            }, null, 2)}</pre>
          </details>
        </div>
      )} */}
    </div>
  );
}

export default ConcertInfo;
