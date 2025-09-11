import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../hooks/useBooking';
import Loading from '../common/Loading';
import '../../styles/components/Booking.css';

function WaitingPage() {
  const navigate = useNavigate();
  const [localCount, setLocalCount] = useState(3); // 로컬 상태로 카운트 관리
  const { 
    bookingStep, 
    selectedConcert,
    completeBooking 
  } = useBooking();

  console.log('WaitingPage - localCount:', localCount, 'bookingStep:', bookingStep);

  useEffect(() => {
    if (bookingStep !== 'waiting') {
      navigate('/concerts');
      return;
    }

    if (localCount > 0) {
      const timer = setTimeout(() => {
        setLocalCount(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (localCount === 0) {
      const completeTimer = setTimeout(async () => {
        await completeBooking();
        navigate(`/concerts/${selectedConcert?.id}`, { replace: true });
      }, 1500);
      return () => clearTimeout(completeTimer);
    }
  }, [localCount, bookingStep, navigate, completeBooking, selectedConcert]);

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
          <span className="counter-label">대기 인원: </span>
          <span className="counter-number">{localCount}</span>
          <span className="counter-unit">명</span>
        </div>
        
        {localCount === 0 && (
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