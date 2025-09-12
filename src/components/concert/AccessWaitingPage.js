import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// eslint-disable-next-line
import Loading from '../common/Loading';
import '../../styles/components/Concert.css';

function AccessWaitingPage() {
  console.log('=== AccessWaitingPage 렌더링 시작! ===');
  
  const { id } = useParams();
  const navigate = useNavigate();
  const [waitingTime, setWaitingTime] = useState(10);
  const [queuePosition, setQueuePosition] = useState(Math.floor(Math.random() * 500) + 1);

  console.log('AccessWaitingPage - 공연 ID:', id);

  useEffect(() => {
    console.log('AccessWaitingPage useEffect 실행');
    
    // 웨이팅 타이머
    const timer = setInterval(() => {
      setWaitingTime(prev => {
        console.log('웨이팅 시간:', prev);
        if (prev <= 1) {
          clearInterval(timer);
          console.log('웨이팅 완료! 공연 디테일로 이동:', `/concerts/${id}`);
          navigate(`/concerts/${id}`, { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 대기열 위치 업데이트 (시뮬레이션)
    const queueTimer = setInterval(() => {
      setQueuePosition(prev => Math.max(1, prev - Math.floor(Math.random() * 5) - 1));
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(queueTimer);
    };
  }, [id, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  console.log('AccessWaitingPage 렌더링 진행 중...');

  return (
    <div className="access-waiting-page">
      <div className="waiting-container">
        <div className="waiting-header">
          <h1>🎭 공연 접속 대기열</h1>
          <p>많은 분들이 동시에 접속하여 대기열에 진입하셨습니다.</p>
          {/* <p>공연 ID: {id}</p> */}
        </div>
        
        {/* <div className="waiting-animation">
          <Loading />
        </div> */}
        
        <div className="waiting-stats">
          <div className="stat-item">
            <span className="stat-label">현재 대기 순번</span>
            <span className="stat-value">{queuePosition}번</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">예상 대기시간</span>
            <span className="stat-value">{formatTime(waitingTime)}</span>
          </div>
        </div>
        
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{
                width: `${((10 - waitingTime) / 10) * 100}%`
              }}
            />
          </div>
          <span className="progress-text">
            {Math.round(((10 - waitingTime) / 10) * 100)}% 완료
          </span>
        </div>
        
        <div className="waiting-tips">
          <h3>💡 대기 중 안내사항</h3>
          <ul>
            <li>이 창을 새로고침하거나 닫지 마세요</li>
            <li>대기열을 벗어나면 처음부터 다시 대기해야 합니다</li>
            <li>곧 좌석 선택 페이지로 자동 이동됩니다</li>
          </ul>
        </div>
        
        {waitingTime <= 3 && (
          <div className="completion-notice">
            <p>✅ 곧 입장됩니다...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccessWaitingPage;