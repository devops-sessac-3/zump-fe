/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ConcertInfo from './ConcertInfo';
import SeatMap from '../booking/SeatMap';
import Loading from '../common/Loading';
import { useConcertDetail } from '../../data/concertAPI';
import { useBookingContext } from '../../context/BookingContext';
import toast from 'react-hot-toast';
import '../../styles/components/Concert.css';
import '../../styles/components/Booking.css';

function ConcertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const lastConcertIdRef = useRef(null);
  const hasCheckedBookingFlag = useRef(false);
  
  const { concertDetail, loading, error, usingMockData, refetchConcert } = useConcertDetail(id);
  const { selectConcert, selectedConcert, resetBooking } = useBookingContext();

  // ID가 변경되었을 때만 예매 상태 초기화
  useEffect(() => {
    if (id && id !== lastConcertIdRef.current) {
      console.log('공연 ID 변경, 예매 상태 초기화:', id);
      resetBooking();
      lastConcertIdRef.current = id;
      hasCheckedBookingFlag.current = false; // 플래그 체크 초기화
    }
  }, [id, resetBooking]);

  // 예매 완료 플래그 확인 및 강제 새로고침 - useCallback으로 메모이제이션
  const checkAndHandleBookingFlag = useCallback(() => {
    if (hasCheckedBookingFlag.current || loading || !concertDetail) return;
    
    hasCheckedBookingFlag.current = true;
    
    // 세션 스토리지에서 예매 완료 플래그 확인
    const bookingCompletedData = sessionStorage.getItem('bookingCompleted');
    
    if (bookingCompletedData) {
      try {
        const bookingInfo = JSON.parse(bookingCompletedData);
        const currentConcertId = parseInt(id);
        const bookedConcertId = parseInt(bookingInfo.concertId);
        
        // 현재 공연과 예매한 공연이 같은지 확인
        if (currentConcertId === bookedConcertId) {
          console.log('예매 완료 플래그 감지, 최신 좌석 데이터 가져오기 시작');
          console.log('예매된 좌석:', bookingInfo.bookedSeats);
          
          // 플래그 즉시 제거 (중복 처리 방지)
          sessionStorage.removeItem('bookingCompleted');
          
          // 백엔드 API 상태 확인을 위한 로깅
          console.log('백엔드 확인: POST /concerts-booking API가 실제로 데이터를 업데이트했는지 확인 필요');
          console.log('예매 API 응답 확인:', '성공 응답을 받았는지, 에러가 있었는지 확인');
          
          // 강제 새로고침 실행
          if (refetchConcert) {
            toast.promise(
              refetchConcert(),
              {
                loading: '예매된 좌석 정보를 업데이트하는 중...',
                success: (data) => {
                  console.log('새로고침된 좌석 데이터:', data);
                  
                  // 예매된 좌석이 실제로 업데이트되었는지 확인
                  const updatedSeats = data?.seats || [];
                  const bookedSeatsInData = updatedSeats.filter(seat => seat.is_booked);
                  
                  console.log('백엔드에서 예약된 좌석:', bookedSeatsInData);
                  
                  if (bookedSeatsInData.length === 0) {
                    console.error('❌ 백엔드 문제: 예매했지만 is_booked가 true인 좌석이 없습니다!');
                    console.error('백엔드 팀 확인 필요:', {
                      issue: 'POST /concerts-booking API가 데이터베이스를 업데이트하지 않음',
                      expectedSeats: bookingInfo.bookedSeats,
                      actualBookedSeats: bookedSeatsInData.map(s => s.seat_number)
                    });
                    return `⚠️ 예매는 완료되었지만 좌석 상태 업데이트에 문제가 있습니다. 백엔드 팀에 문의해주세요.`;
                  } else {
                    return `🎉 ${bookingInfo.bookedSeats.join(', ')} 좌석 예매가 완료되었습니다!`;
                  }
                },
                error: '좌석 정보 업데이트에 실패했습니다.'
              }
            );
          } else {
            // refetchConcert가 없는 경우 페이지 새로고침
            toast.success(`🎉 ${bookingInfo.bookedSeats.join(', ')} 좌석 예매가 완료되었습니다!`);
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        } else {
          // 다른 공연의 플래그면 제거
          sessionStorage.removeItem('bookingCompleted');
        }
      } catch (error) {
        console.error('예매 완료 플래그 파싱 오류:', error);
        sessionStorage.removeItem('bookingCompleted');
      }
    }
  }, [id, loading, concertDetail, refetchConcert]);

  // 예매 완료 플래그 확인 - 의존성 수정
  useEffect(() => {
    checkAndHandleBookingFlag();
  }, [checkAndHandleBookingFlag]); // checkAndHandleBookingFlag 의존성 추가

  // 공연 정보를 booking context에 설정 (중복 설정 방지)
  useEffect(() => {
    if (concertDetail) {
      const currentConcertId = selectedConcert?.concert_se || selectedConcert?.id;
      const newConcertId = concertDetail.concert_se || concertDetail.id;
      
      // 같은 공연이 아닐 때만 설정
      if (currentConcertId !== newConcertId) {
        console.log('새로운 공연 정보를 booking context에 설정:', concertDetail.concert_name);
        selectConcert(concertDetail);
      }
    }
  }, [concertDetail?.concert_se, concertDetail?.id, selectedConcert?.concert_se, selectedConcert?.id, selectConcert]);

  // 페이지 포커스 시 데이터 새로고침 - useCallback으로 메모이제이션
  const handleWindowFocus = useCallback(() => {
    if (concertDetail && document.hasFocus() && refetchConcert) {
      console.log('페이지 포커스, 데이터 새로고침');
      refetchConcert();
    }
  }, [concertDetail, refetchConcert]); // concertDetail 의존성 추가

  // 페이지 포커스 이벤트 등록 - 의존성 수정
  useEffect(() => {
    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [handleWindowFocus]); // handleWindowFocus 의존성 추가

  // 수동 새로고침 함수
  const handleRefresh = () => {
    if (refetchConcert) {
      toast.promise(
        refetchConcert(),
        {
          loading: '최신 정보를 가져오는 중...',
          success: (data) => {
            // 새로고침 후 좌석 상태 로깅
            const seats = data?.seats || [];
            const bookedSeats = seats.filter(seat => seat.is_booked);
            console.log('수동 새로고침 - 예약된 좌석:', bookedSeats);
            
            if (bookedSeats.length > 0) {
              return `좌석 정보가 업데이트되었습니다! (예약된 좌석: ${bookedSeats.length}개)`;
            } else {
              return '좌석 정보가 업데이트되었습니다!';
            }
          },
          error: '새로고침에 실패했습니다.'
        }
      );
    } else {
      // refetchConcert가 없는 경우 페이지 새로고침
      window.location.reload();
    }
  };

  if (error) {
    console.error('Concert Detail 에러:', error);
    return (
      <div className="concert-detail-container">
        <div className="error-message">
          <h2>오류가 발생했습니다</h2>
          <p>{error.message || '공연 정보를 불러올 수 없습니다.'}</p>
          <div className="error-actions">
            <button 
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              다시 시도
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/concerts')}
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="concert-detail-container">
        <div className="loading-container">
          <Loading />
          <p>공연 정보를 불러오는 중...</p>
          {usingMockData && (
            <p className="mock-data-notice">* 백엔드 연결 실패 - 목 데이터 사용 중</p>
          )}
        </div>
      </div>
    );
  }

  if (!concertDetail) {
    return (
      <div className="concert-detail-container">
        <div className="error-message">
          <h2>공연을 찾을 수 없습니다</h2>
          <p>요청하신 공연 정보가 존재하지 않습니다. (ID: {id})</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/concerts')}
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 좌석 데이터 처리
  let seatData = [];
  let availableSeatsCount = 0;

  if (Array.isArray(concertDetail.seats)) {
    seatData = concertDetail.seats;
    availableSeatsCount = seatData.filter(seat => !seat.is_booked).length;
    
    // 좌석 상태 디버깅
    const bookedSeats = seatData.filter(seat => seat.is_booked);
    console.log('현재 좌석 데이터 분석:', {
      totalSeats: seatData.length,
      availableSeats: availableSeatsCount,
      bookedSeats: bookedSeats.length,
      bookedSeatNumbers: bookedSeats.map(seat => seat.seat_number)
    });
    
  } else if (concertDetail.seats && typeof concertDetail.seats === 'object') {
    // seats가 객체 형태인 경우 배열로 변환
    seatData = Object.keys(concertDetail.seats).map(seatNumber => ({
      seat_number: seatNumber,
      is_booked: concertDetail.seats[seatNumber] === 'occupied',
      seat_se: Math.random() * 1000,
      price: concertDetail.price || concertDetail.concert_price || 0
    }));
    availableSeatsCount = seatData.filter(seat => !seat.is_booked).length;
  } else {
    availableSeatsCount = concertDetail.availableSeats || 0;
  }

  return (
    <div className="concert-detail-container">
      {usingMockData && (
        <div className="mock-data-banner" style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          padding: '10px',
          margin: '10px 0',
          borderRadius: '4px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#856404'
        }}>
          백엔드 API 연결 실패 - 목 데이터로 시연 중입니다
        </div>
      )}

      {/* 상단 네비게이션 */}
      <div className="concert-header-nav">
        <button 
          className="back-btn"
          onClick={() => navigate('/concerts')}
        >
          ← 목록으로 돌아가기
        </button>
        
        <button 
          className="refresh-btn"
          onClick={handleRefresh}
          style={{
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 좌석 새로고침
        </button>
      </div>
      
      <div className="detail-content">
        {/* 공연 정보 표시 */}
        <div className="concert-info-section">
          <ConcertInfo 
            concert={{
              ...concertDetail,
              availableSeats: availableSeatsCount
            }} 
          />
        </div>
        
        {/* 좌석맵 표시 */}
        <div className="seatmap-section">
          <SeatMap 
            concert={concertDetail} 
            seats={seatData}
            key={`seatmap-${concertDetail.concert_se || concertDetail.id}`}
          />
        </div>
      </div>
    </div>
  );
}

export default ConcertDetail;
