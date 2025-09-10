import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../hooks/useBooking';
import Loading from '../common/Loading';
import '../../styles/components/Booking.css';

function WaitingPage() {
  const navigate = useNavigate();
  const { 
    waitingCount, 
    bookingStep, 
    selectedConcert,
    setWaitingCount,
    completeBooking 
  } = useBooking();

  useEffect(() => {
    // 예매 진행 중이 아니면 리다이렉트
    if (bookingStep !== 'waiting') {
      navigate('/concerts');
      return;
    }

    // 대기 시뮬레이션
    if (waitingCount > 0) {
      const timer = setTimeout(() => {
        setWaitingCount(waitingCount - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (waitingCount === 0) {
      // 예매 완료 처리
      const completeTimer = setTimeout(async () => {
        await completeBooking();
        navigate(`/concerts/${selectedConcert?.id}`);
      }, 1000);
      
      return () => clearTimeout(completeTimer);
    }
  }, [waitingCount, bookingStep, navigate, setWaitingCount, completeBooking, selectedConcert]);

  if (bookingStep !== 'waiting') {
    return null;
  }

  return (
    <div className="waiting-page">
      <div className="waiting-container">
        <h2>예매 처리중...</h2>
        
        <div className="waiting-animation">
          <Loading />
        </div>
        
        <div className="skeleton-container">
          <div className="skeleton-box"></div>
          <div className="skeleton-box"></div>
          <div className="skeleton-box"></div>
        </div>
        
        <div className="waiting-counter">
          <span className="counter-label">대기 인원:</span>
          <span className="counter-number">{waitingCount}</span>
          <span className="counter-unit">명</span>
        </div>
        
        {waitingCount === 0 && (
          <div className="completion-message">
            <p>✅ 예약이 완료되었습니다!</p>
            <p>잠시 후 상세 페이지로 이동합니다...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WaitingPage;