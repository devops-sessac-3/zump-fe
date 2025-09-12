import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../hooks/useBooking';
// eslint-disable-next-line
import Loading from '../common/Loading';
import '../../styles/components/Concert.css';

function WaitingPage() {
  const navigate = useNavigate();
  const [localCount, setLocalCount] = useState(3);
  const { 
    bookingStep, 
    selectedConcert,
    selectedSeat,
    completeBooking 
  } = useBooking();

  // 초기 좌석 정보 저장
  const [bookedSeat, setBookedSeat] = useState(null);
  
  useEffect(() => {
    // WaitingPage 진입 시 선택된 좌석 저장
    if (bookingStep === 'waiting' && selectedSeat && !bookedSeat) {
      setBookedSeat(selectedSeat);
      console.log('예약할 좌석 저장:', selectedSeat);
    }
  }, [bookingStep, selectedSeat, bookedSeat]);

  console.log('WaitingPage - localCount:', localCount, 'bookingStep:', bookingStep);
  console.log('저장된 좌석:', bookedSeat, '현재 선택된 좌석:', selectedSeat);

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
    <div className="access-waiting-page"> {/* AccessWaitingPage와 동일한 클래스 */}
      <div className="waiting-container">
        <div className="waiting-header">
          <h1>💳 예매 처리중...</h1>
          <p>선택하신 좌석의 예매를 진행하고 있습니다.</p>
        </div>
        
        {/* <div className="waiting-animation">
          <Loading />
        </div> */}
        
        <div className="waiting-stats">
          <div className="stat-item">
            <span className="stat-label">선택한 좌석</span>
            <span className="stat-value">{selectedSeat || bookedSeat}번</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">결제 대기 인원</span>
            <span className="stat-value">{localCount}명</span>
          </div>
        </div>
        
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{
                width: `${((3 - localCount) / 3) * 100}%`
              }}
            />
          </div>
          <span className="progress-text">
            {Math.round(((3 - localCount) / 3) * 100)}% 완료
          </span>
        </div>
        
        <div className="waiting-tips">
          <h3>💡 예매 진행 안내</h3>
          <ul>
            <li>결제 처리가 진행 중입니다</li>
            <li>이 창을 닫지 마시고 잠시만 기다려주세요</li>
            <li>예매 완료 후 자동으로 상세 페이지로 이동됩니다</li>
          </ul>
        </div>
        
        {localCount === 0 && (
          <div className="completion-notice">
            <p>✅ 예매가 완료되었습니다!</p>
            <p>잠시 후 상세 페이지로 이동합니다...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WaitingPage;