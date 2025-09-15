/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingContext } from '../../context/BookingContext';
import toast from 'react-hot-toast';
import '../../styles/components/Concert.css';

function WaitingPage() {
  const navigate = useNavigate();
  const [localCount, setLocalCount] = useState(3);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingProgress, setBookingProgress] = useState(0);
  const [currentSeat, setCurrentSeat] = useState('');
  
  // 한 번만 실행되도록 ref 사용
  const hasStartedProcessing = useRef(false);
  const isNavigating = useRef(false);
  const processingComplete = useRef(false);
  
  const { 
    bookingStep, 
    selectedConcert,
    selectedSeats,
    completeBooking,
  } = useBookingContext();

  // 초기 좌석 정보를 즉시 저장
  const [bookedSeats] = useState(() => {
    if (selectedSeats && selectedSeats.length > 0) {
      console.log('WaitingPage 초기화 - 예약할 좌석들 저장:', selectedSeats);
      return selectedSeats;
    }
    return [];
  });

  // 예매 처리 함수 - useCallback으로 메모이제이션
  const handleBookingProcess = useCallback(async () => {
    if (isNavigating.current || processingComplete.current) return;
    
    const seatsToBook = selectedSeats?.length > 0 ? selectedSeats : bookedSeats;
    
    if (!selectedConcert || !seatsToBook || seatsToBook.length === 0) {
      toast.error('예매 정보가 없습니다.');
      isNavigating.current = true;
      navigate('/concerts');
      return;
    }

    setIsProcessing(true);
    const totalSeats = seatsToBook.length;

    console.log('예매 처리 시작:', { concert: selectedConcert, seats: seatsToBook });

    try {
      // 각 좌석별로 진행률 업데이트
      for (let i = 0; i < seatsToBook.length; i++) {
        const seat = seatsToBook[i];
        const seatNumber = seat.seat_number || seat.id;
        setCurrentSeat(seatNumber);
        
        // 진행률 업데이트
        const progress = Math.round(((i + 1) / totalSeats) * 100);
        setBookingProgress(progress);
        
        // 시뮬레이션을 위한 딜레이
        if (i < seatsToBook.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }

      // 실제 API 호출
      console.log('실제 예매 API 호출 시작');
      await completeBooking();
      
      console.log('예매 API 호출 완료');
      
    } catch (error) {
      console.error('예매 처리 오류:', error);
      toast.error('예매 처리 중 오류가 발생했습니다.');
      
      // 오류 발생 시에도 상세 페이지로 이동
      setTimeout(() => {
        if (!isNavigating.current && selectedConcert) {
          const concertId = selectedConcert.id || selectedConcert.concert_se;
          isNavigating.current = true;
          navigate(`/concerts/${concertId}`, { replace: true });
        }
      }, 2000);
    }
  }, [selectedConcert, selectedSeats, bookedSeats, completeBooking, navigate]);

  // 예매 데이터 검증 - 의존성 수정
  useEffect(() => {
    if (isNavigating.current) return;
    
    const currentSeats = selectedSeats?.length > 0 ? selectedSeats : bookedSeats;
    
    // 예매 중이거나 완료된 상태가 아니면서 좌석이 없으면 리다이렉트
    if ((bookingStep !== 'waiting' && bookingStep !== 'complete') || 
        (!currentSeats || currentSeats.length === 0)) {
      console.log('예매 데이터 없음, 공연 목록으로 이동');
      isNavigating.current = true;
      toast.error('예매 정보를 찾을 수 없습니다.');
      navigate('/concerts');
      return;
    }
  }, [bookingStep, selectedSeats?.length, bookedSeats?.length, navigate]); // 의존성 추가

  // 카운트다운 로직 - 의존성 수정
  useEffect(() => {
    if (isNavigating.current || processingComplete.current) return;
    
    // waiting 상태일 때만 카운트다운
    if (bookingStep === 'waiting' && localCount > 0 && !isProcessing) {
      const timer = setTimeout(() => {
        setLocalCount(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    // 카운트다운 완료 후 예매 처리 시작 (한 번만)
    if (bookingStep === 'waiting' && localCount === 0 && !isProcessing && !hasStartedProcessing.current) {
      hasStartedProcessing.current = true;
      handleBookingProcess();
    }
  }, [localCount, isProcessing, bookingStep, handleBookingProcess]); // handleBookingProcess 의존성 추가

  // 예매 완료 감지 및 리다이렉트
  useEffect(() => {
    if (bookingStep === 'complete' && !processingComplete.current && !isNavigating.current) {
      processingComplete.current = true;
      console.log('예매 완료 감지, 상세 페이지로 이동 준비');
      
      setTimeout(() => {
        if (!isNavigating.current && selectedConcert) {
          const concertId = selectedConcert.id || selectedConcert.concert_se;
          
          // 예매 완료 플래그 설정 (세션 스토리지에 저장)
          sessionStorage.setItem('bookingCompleted', JSON.stringify({
            concertId: concertId,
            bookedSeats: bookedSeats.map(seat => seat.seat_number || seat.id),
            timestamp: Date.now()
          }));
          
          console.log('예매 완료 플래그 설정 완료, 상세 페이지로 이동:', `/concerts/${concertId}`);
          isNavigating.current = true;
          navigate(`/concerts/${concertId}`, { replace: true });
        }
      }, 2000);
    }
  }, [bookingStep, selectedConcert, navigate, bookedSeats]);

  // 렌더링 조건 체크
  if (isNavigating.current) {
    return null;
  }

  // 예매 진행 상태가 아니면 null 반환
  if (bookingStep !== 'waiting' && bookingStep !== 'complete') {
    return null;
  }

  const seatsToDisplay = selectedSeats?.length > 0 ? selectedSeats : bookedSeats;
  const concertToDisplay = selectedConcert;

  if (!concertToDisplay || !seatsToDisplay?.length) {
    return null;
  }

  return (
    <div className="access-waiting-page">
      <div className="waiting-container">
        <div className="waiting-header">
          <h1>🎫 예매 처리중...</h1>
          <p>선택하신 좌석의 예매를 진행하고 있습니다.</p>
        </div>
        
        <div className="waiting-stats">
          <div className="stat-item">
            <span className="stat-label">공연명</span>
            <span className="stat-value">{concertToDisplay.name || concertToDisplay.concert_name || '공연명 없음'}</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">선택 좌석</span>
            <span className="stat-value">
              {seatsToDisplay.map(seat => seat.seat_number || seat.id).join(', ')} 
              ({seatsToDisplay.length}석)
            </span>
          </div>

          <div className="stat-item">
            <span className="stat-label">총 금액</span>
            <span className="stat-value">
              {seatsToDisplay.reduce((sum, seat) => sum + (seat.price || 0), 0).toLocaleString()}원
            </span>
          </div>
        </div>

        {bookingStep === 'waiting' && !isProcessing ? (
          // 카운트다운 중
          <div className="waiting-countdown">
            <div className="countdown-number">{localCount}</div>
            <p>곧 예매 처리를 시작합니다...</p>
          </div>
        ) : (
          // 예매 처리 중 또는 완료
          <div className="booking-process">
            {currentSeat && (
              <div className="process-info">
                <p>현재 처리 중인 좌석: <strong>{currentSeat}</strong></p>
              </div>
            )}
            
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${bookingProgress}%` }}
                />
              </div>
              <span className="progress-text">{bookingProgress}% 완료</span>
            </div>
          </div>
        )}
        
        <div className="waiting-tips">
          <h3>💡 예매 진행 안내</h3>
          <ul>
            <li>결제 처리가 진행 중입니다</li>
            <li>이 창을 닫지 마시고 잠시만 기다려주세요</li>
            <li>예매 완료 후 자동으로 상세 페이지로 이동됩니다</li>
            {isProcessing && <li>선택하신 모든 좌석을 순차적으로 예매 중입니다</li>}
          </ul>
        </div>
        
        {(bookingProgress === 100 || bookingStep === 'complete') && (
          <div className="completion-notice">
            <p>✅ 예매 처리가 완료되었습니다!</p>
            <p>잠시 후 상세 페이지로 이동합니다...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WaitingPage;

