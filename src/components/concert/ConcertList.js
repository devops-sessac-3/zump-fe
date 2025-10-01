import React, { useEffect, useState } from 'react';
import { useConcerts } from '../../data/concertAPI';
import ConcertCard from './ConcertCard';
import Loading from '../common/Loading';

function ConcertList() {
  const { concerts, loading, error, usingMockData } = useConcerts();
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    console.log('ConcertList - concerts 데이터:', concerts);
    console.log('각 공연의 상세 정보:', concerts.map(c => ({
      id: c.id,
      concert_se: c.concert_se,
      name: c.name || c.concert_name,
      image: c.image,
      venue: c.venue || c.concert_venue,
      price: c.price || c.concert_price
    })));
  }, [concerts]);

  // 재시도 함수 (페이지 새로고침으로 대체)
  const handleRetry = () => {
    setIsRetrying(true);
    window.location.reload();
  };

  // 백엔드 스키마와 호환되는 공연 데이터 유효성 검사
  const isValidConcert = (concert) => {
    const hasValidId = concert && (
      (concert.id && typeof concert.id === 'number') ||
      (concert.concert_se && typeof concert.concert_se === 'number')
    );
    
    const hasValidTitle = concert && (
      (concert.name && typeof concert.name === 'string') ||
      (concert.concert_name && typeof concert.concert_name === 'string') ||
      (concert.title && typeof concert.title === 'string')
    );

    const isValid = hasValidId && hasValidTitle;
    
    if (!isValid) {
      console.warn('유효하지 않은 공연 데이터:', {
        concert,
        hasValidId,
        hasValidTitle
      });
    }
    
    return isValid;
  };

  // 유효한 공연만 필터링
  const validConcerts = Array.isArray(concerts) 
    ? concerts.filter(concert => isValidConcert(concert))
    : [];

  console.log('유효성 검사 결과:', {
    totalConcerts: concerts?.length || 0,
    validConcerts: validConcerts.length,
    usingMockData
  });

  if (loading && !isRetrying) {
    return (
      <div className="concert-list-container">
        <h1 className="page-title">공연 목록</h1>
        {usingMockData && (
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffeaa7',
            padding: '10px',
            margin: '10px 0',
            borderRadius: '4px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#856404'
          }}>
            트래픽 급증으로 인해 대기 시간이 지연되었습니다. 기다려주신 고객 여러분께 진심으로 사과드립니다.
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
          <Loading size="large" text="공연 목록을 불러오는 중..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="concert-list-container">
        <h1 className="page-title">공연 목록</h1>
        <div className="error-message">
          <p>{error}</p>
          <button 
            onClick={handleRetry} 
            disabled={isRetrying}
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isRetrying ? 'not-allowed' : 'pointer',
              opacity: isRetrying ? 0.7 : 1
            }}
          >
            {isRetrying ? '재시도 중...' : '다시 시도'}
          </button>
        </div>
      </div>
    );
  }

  if (!Array.isArray(concerts)) {
    return (
      <div className="concert-list-container">
        <h1 className="page-title">공연 목록</h1>
        <div className="error-message">
          <p>공연 데이터를 불러오는 중 오류가 발생했습니다.</p>
          <p>데이터 형식이 올바르지 않습니다.</p>
          <button onClick={handleRetry} disabled={isRetrying}>
            {isRetrying ? '재시도 중...' : '다시 시도'}
          </button>
        </div>
      </div>
    );
  }

  if (validConcerts.length === 0) {
    return (
      <div className="concert-list-container">
        <h1 className="page-title">공연 목록</h1>
        
        {/* 디버깅 정보 */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ 
            margin: '10px 0', 
            padding: '15px', 
            backgroundColor: '#f8f9fa', 
            fontSize: '12px',
            borderRadius: '5px',
            border: '1px solid #dee2e6'
          }}>
            <h4>디버깅 정보:</h4>
            <p>전체 concerts 배열 길이: {concerts?.length || 0}</p>
            <p>유효한 공연 수: {validConcerts.length}</p>
            <p>목 데이터 사용 중: {usingMockData ? 'Yes' : 'No'}</p>
            {concerts?.length > 0 && (
              <details>
                <summary>첫 번째 concert 객체 구조</summary>
                <pre>{JSON.stringify(concerts[0], null, 2)}</pre>
              </details>
            )}
          </div>
        )}
        
        <div className="error-message">
          <p>등록된 공연이 없습니다.</p>
          <p>나중에 다시 확인해주세요.</p>
          <button onClick={handleRetry} disabled={isRetrying}>
            {isRetrying ? '새로고침 중...' : '새로고침'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="concert-list-container">
      <h1 className="page-title">공연 목록</h1>
      
      {/* 목 데이터 사용 알림 */}
      {usingMockData && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          padding: '10px',
          margin: '10px 0',
          borderRadius: '4px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#856404'
        }}>
          트래픽 급증으로 인해 대기 시간이 지연되었습니다. 기다려주신 고객 여러분께 진심으로 사과드립니다.
        </div>
      )}
      
      <div className="concert-grid">
        {validConcerts.map((concert) => (
          <ConcertCard 
            key={concert.id || concert.concert_se} 
            concert={concert} 
          />
        ))}
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button 
          onClick={handleRetry} 
          disabled={isRetrying}
          style={{
            padding: '12px 24px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isRetrying ? 'not-allowed' : 'pointer',
            opacity: isRetrying ? 0.7 : 1,
            fontSize: '14px'
          }}
        >
          {isRetrying ? '새로고침 중...' : '목록 새로고침'}
        </button>
      </div>
    </div>
  );
}

export default ConcertList;