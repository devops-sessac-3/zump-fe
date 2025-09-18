import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/components/Concert.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function AccessWaitingPage() {
  console.log('=== AccessWaitingPage SSE 버전 렌더링 시작! ===');
  
  const { id } = useParams();
  const navigate = useNavigate();
  
  // SSE 관련 상태
  const [rank, setRank] = useState(null);
  const [total, setTotal] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  // eslint-disable-next-line
  const [lastUpdate, setLastUpdate] = useState(null);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(null);
  const [isEnqueued, setIsEnqueued] = useState(false);
  
  // EventSource 참조
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  // 설정
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 2000;

  console.log('AccessWaitingPage - 공연 ID:', id);

  // 사용자 정보 가져오기
  const getUserSe = useCallback(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      let userSe = user?.id || user?.user_se || user?.userId || 1;
      
      if (typeof userSe === 'string') {
        const parsed = parseInt(userSe);
        if (!isNaN(parsed)) {
          userSe = parsed;
        } else {
          // 이메일 등 숫자가 아닌 경우 해시값 사용
          userSe = Math.abs(userSe.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0)) || 1;
        }
      }
      
      console.log('사용자 SE:', userSe, typeof userSe);
      return Math.max(1, parseInt(userSe));
    } catch (error) {
      console.error('사용자 정보 파싱 오류:', error);
      return 1;
    }
  }, []);

  // 콘서트 디테일로 이동
  const navigateToConcert = useCallback(() => {
    console.log('대기열 완료! 공연 디테일로 이동:', `/concerts/${id}`);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    navigate(`/concerts/${id}`, { replace: true });
  }, [id, navigate]);

  // 대기 시간 추정
  const calculateEstimatedWaitTime = useCallback((currentRank, totalUsers) => {
    if (!currentRank || currentRank <= 0) return 0;
    // 1분당 10명 처리 (백엔드 설정: DEQUEUE_PER_SEC: 10)
    const processingRate = 10 * 60; // 10명/초 * 60초 = 600명/분
    const estimatedMinutes = Math.ceil(currentRank / processingRate);
    return Math.max(1, estimatedMinutes);
  }, []);

  // 대기열 등록
  const enqueueUser = useCallback(async () => {
    try {
      const userSe = getUserSe();
      console.log('대기열 등록 시작:', { concert_se: id, user_se: userSe });

      const response = await fetch(`${API_BASE_URL}/queue/enqueue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          concert_se: id,
          user_se: userSe
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '대기열 등록에 실패했습니다.');
      }

      const result = await response.json();
      console.log('대기열 등록 완료:', result);
      
      setRank(result.rank);
      setTotal(result.total);
      setIsEnqueued(true);
      
      return result;
    } catch (error) {
      console.error('대기열 등록 오류:', error);
      setConnectionStatus('error');
      throw error;
    }
  }, [id, getUserSe]);

  // SSE 연결 함수
  const connectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const userSe = getUserSe();
    const url = new URL(`${API_BASE_URL}/queue/stream`);
    url.searchParams.set('concert_se', id);
    url.searchParams.set('user_se', userSe.toString());

    console.log('SSE 연결 시작:', url.toString());
    setConnectionStatus('connecting');

    const eventSource = new EventSource(url.toString());
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('open', () => {
      console.log('SSE 연결 성공');
      setConnectionStatus('connected');
      setReconnectAttempts(0);
    });

    eventSource.addEventListener('snapshot', (event) => {
      console.log('SSE snapshot 이벤트:', event.data);
      try {
        const data = JSON.parse(event.data);
        setRank(data.rank);
        setTotal(data.total);
        setLastUpdate(data.ts);
        
        const waitTime = calculateEstimatedWaitTime(data.rank, data.total);
        setEstimatedWaitTime(waitTime);
        
        // 순번이 1이면 곧 입장 (또는 -1이면 대기열에서 제외됨)
        if (data.rank === 1 || data.rank === -1) {
          console.log('대기열 완료! 순번:', data.rank);
          setTimeout(() => {
            navigateToConcert();
          }, 2000);
        }
      } catch (error) {
        console.error('snapshot 데이터 파싱 오류:', error);
      }
    });

    eventSource.addEventListener('update', (event) => {
      console.log('SSE update 이벤트:', event.data);
      try {
        const data = JSON.parse(event.data);
        setRank(data.rank);
        setTotal(data.total);
        setLastUpdate(data.ts);
        
        const waitTime = calculateEstimatedWaitTime(data.rank, data.total);
        setEstimatedWaitTime(waitTime);
        
        // 순번이 1이면 곧 입장 (또는 -1이면 대기열에서 제외됨)
        if (data.rank === 1 || data.rank === -1) {
          console.log('대기열 완료! 순번:', data.rank);
          setTimeout(() => {
            navigateToConcert();
          }, 2000);
        }
      } catch (error) {
        console.error('update 데이터 파싱 오류:', error);
      }
    });

    eventSource.addEventListener('error', (event) => {
      console.error('SSE 연결 오류:', event);
      setConnectionStatus('error');
      
      setReconnectAttempts(prevAttempts => {
        if (prevAttempts < MAX_RECONNECT_ATTEMPTS) {
          console.log(`재연결 시도 ${prevAttempts + 1}/${MAX_RECONNECT_ATTEMPTS}`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            eventSource.close();
            connectSSE();
          }, RECONNECT_DELAY);
          
          return prevAttempts + 1;
        } else {
          console.error('최대 재연결 시도 횟수 초과');
          setConnectionStatus('closed');
          return prevAttempts;
        }
      });
    });

    return eventSource;
  }, [id, getUserSe, calculateEstimatedWaitTime, navigateToConcert]);

  // 진행률 계산
  const getProgress = () => {
    if (!rank || !total || rank <= 0 || total <= 0) return 0;
    return Math.max(0, Math.min(100, ((total - rank + 1) / total) * 100));
  };

  // 시간 포맷팅
  // const formatWaitTime = (minutes) => {
  //   if (!minutes || minutes <= 0) return '곧 입장';
  //   if (minutes < 60) return `약 ${minutes}분`;
  //   const hours = Math.floor(minutes / 60);
  //   const remainingMinutes = minutes % 60;
  //   return `약 ${hours}시간 ${remainingMinutes}분`;
  // };

  // 연결 상태 텍스트
  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connecting':
        return '대기열에 연결 중...';
      case 'connected':
        return '대기열에 연결됨';
      case 'error':
        return '연결 오류 - 재연결 시도 중...';
      case 'closed':
        return '연결 실패 - 페이지를 새로고침해주세요';
      default:
        return '연결 상태 확인 중...';
    }
  };

  // 컴포넌트 마운트 시 대기열 등록 및 SSE 연결
  useEffect(() => {
    const initQueue = async () => {
      try {
        console.log('대기열 초기화 시작');
        
        // 1. 대기열 등록
        await enqueueUser();
        
        // 2. SSE 연결 시작
        connectSSE();
        
      } catch (error) {
        console.error('대기열 초기화 실패:', error);
        setConnectionStatus('error');
      }
    };

    initQueue();

    // 컴포넌트 언마운트 시 정리
    return () => {
      console.log('AccessWaitingPage 언마운트 - 연결 정리');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [enqueueUser, connectSSE]);

  console.log('현재 상태:', { rank, total, connectionStatus, estimatedWaitTime, isEnqueued });

  return (
    <div className="access-waiting-page">
      <div className="waiting-container">
        <div className="waiting-header">
          <h1>🎭 공연 접속 대기열</h1>
          <p>많은 분들이 동시에 접속하여 대기열에 진입하셨습니다.</p>
          <div className={`connection-status ${connectionStatus}`}>
            {getConnectionStatusText()}
          </div>
        </div>

        <div className="waiting-stats">
          <div className="stat-item">
            <div className="stat-label">현재 대기 순번</div>
            <div className="stat-value">
              {rank === null ? '확인 중...' : rank === -1 ? '처리 완료' : `${rank}번`}
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">총 대기 인원</div>
            <div className="stat-value">{total === null ? '확인 중...' : `${total}명`}</div>
          </div>
          {/* <div className="stat-item">
            <div className="stat-label">예상 대기시간</div>
            <div className="stat-value">
              {estimatedWaitTime === null ? '계산 중...' : formatWaitTime(estimatedWaitTime)}
            </div>
          </div> */}
          {/* {lastUpdate && (
            <div className="stat-item">
              <div className="stat-label">마지막 업데이트</div>
              <div className="stat-value">{new Date(lastUpdate).toLocaleTimeString()}</div>
            </div>
          )} */}
        </div>

        {/* 진행률 바 */}
        {rank !== null && total !== null && rank > 0 && (
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${getProgress()}%` }} 
              />
            </div>
            <span className="progress-text">
              {Math.round(getProgress())}% 완료
            </span>
          </div>
        )}

        <div className="waiting-tips">
          <h3>💡 대기 중 안내사항</h3>
          <ul>
            <li>이 창을 새로고림하거나 닫지 마세요</li>
            <li>대기열을 벗어나면 처음부터 다시 대기해야 합니다</li>
            <li>실시간으로 순번이 업데이트됩니다</li>
            <li>순번이 가까워지면 자동으로 입장됩니다</li>
          </ul>
        </div>

        {/* 상태별 메시지 */}
        {rank === 1 && (
          <div className="completion-notice">
            <p>✅ 곧 입장됩니다...</p>
          </div>
        )}

        {rank !== null && rank <= 5 && rank > 1 && (
          <div className="near-completion-notice">
            <p>🔥 곧 차례입니다! 준비해주세요</p>
          </div>
        )}

        {connectionStatus === 'error' && reconnectAttempts > 0 && (
          <div className="error-notice">
            <p>⚠️ 연결에 문제가 발생했습니다. 자동으로 재연결을 시도하고 있습니다.</p>
            <p>재연결 시도: {reconnectAttempts}/{MAX_RECONNECT_ATTEMPTS}</p>
          </div>
        )}

        {connectionStatus === 'closed' && (
          <div className="error-notice">
            <p>❌ 연결이 실패했습니다. 페이지를 새로고침해주세요.</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.reload()}
              style={{ marginTop: '10px' }}
            >
              새로고침
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccessWaitingPage;
