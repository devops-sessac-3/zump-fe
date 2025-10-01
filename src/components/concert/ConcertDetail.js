/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useCallback, useState } from 'react';
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
  
  // 🎯 좌석 업데이트 추적을 위한 state
  const [seatsUpdateKey, setSeatsUpdateKey] = useState(0);
  
  const { concertDetail, loading, error, usingMockData, refetchConcert } = useConcertDetail(id);
  const { selectConcert, selectedConcert, resetBooking } = useBookingContext();

  // 🎯 좌석 데이터 업데이트 이벤트 발생 함수
  const triggerSeatsUpdate = useCallback((updatedConcertData = null) => {
    console.log('🔄 좌석 업데이트 이벤트 발생');
    
    // 커스텀 이벤트 발생으로 ConcertInfo에 알림
    window.dispatchEvent(new CustomEvent('seatsUpdated', {
      detail: {
        concertId: id,
        timestamp: Date.now(),
        updatedData: updatedConcertData
      }
    }));
    
    // 강제 리렌더링 트리거
    setSeatsUpdateKey(prev => prev + 1);
  }, [id]);

  // ID가 변경되었을 때만 예매 상태 초기화
  useEffect(() => {
    if (id && id !== lastConcertIdRef.current) {
      console.log('공연 ID 변경, 예매 상태 초기화:', id);
      resetBooking();
      lastConcertIdRef.current = id;
      hasCheckedBookingFlag.current = false; // 플래그 체크 초기화
      setSeatsUpdateKey(0); // 좌석 업데이트 키 초기화
    }
  }, [id, resetBooking]);

  // 🎯 BookingContext의 예매 완료 상태를 실시간 감지
  useEffect(() => {
    const handleBookingSuccess = (event) => {
      const { concertId, bookedSeats } = event.detail;
      
      // 현재 공연과 일치하는지 확인
      if (parseInt(concertId) === parseInt(id)) {
        console.log('🎉 실시간 예매 완료 감지!', { concertId, bookedSeats });
        
        // 🎯 백엔드 DB 업데이트 대기 후 좌석 데이터 새로고침
        if (refetchConcert) {
          console.log('⏰ 백엔드 DB 업데이트 대기 중... (2초 후 refetch)');
          
          setTimeout(() => {
            toast.promise(
              refetchConcert(),
              {
                loading: '예매된 좌석 정보를 업데이트하는 중...',
                success: (data) => {
                  console.log('🔄 지연된 새로고침 완료:', data);
                  
                  // 좌석 업데이트 이벤트 발생
                  triggerSeatsUpdate(data);
                  
                  // 예매된 좌석 확인
                  const updatedSeats = data?.seats || [];
                  const bookedSeatsInData = updatedSeats.filter(seat => seat.is_booked);
                  
                  console.log('✅ 지연 후 백엔드 확인 결과:', {
                    totalSeats: updatedSeats.length,
                    bookedSeats: bookedSeatsInData.length,
                    bookedSeatNumbers: bookedSeatsInData.map(s => s.seat_number),
                    expectedBookedSeats: bookedSeats
                  });
                  
                  if (bookedSeatsInData.length === 0) {
                    console.error('❌ 백엔드 동기화 문제: 2초 후에도 is_booked가 true인 좌석이 없습니다!');
                    console.error('🔧 백엔드 팀 확인 필요: POST API 성공 후 실제 DB 업데이트가 안 됨');
                    
                    // 🎯 추가 재시도 (5초 후 한 번 더)
                    setTimeout(() => {
                      console.log('🔄 최종 재시도 refetch 실행...');
                      refetchConcert().then((retryData) => {
                        triggerSeatsUpdate(retryData);
                        const retryBookedSeats = retryData?.seats?.filter(s => s.is_booked) || [];
                        console.log('🔄 최종 재시도 결과:', retryBookedSeats.length);
                      });
                    }, 3000);
                    
                    return `⚠️ 예매는 완료되었지만 좌석 상태 동기화에 시간이 걸리고 있습니다.`;
                  } else {
                    return `🎉 ${bookedSeats.join(', ')} 좌석 예매가 완료되었습니다! (잔여: ${updatedSeats.length - bookedSeatsInData.length}석)`;
                  }
                },
                error: (err) => {
                  console.error('지연된 좌석 정보 업데이트 실패:', err);
                  return '좌석 정보 업데이트에 실패했습니다.';
                }
              }
            );
          }, 2000); // 2초 지연
        }
      }
    };

    // 실시간 예매 완료 이벤트 리스너 등록
    window.addEventListener('realTimeBookingSuccess', handleBookingSuccess);
    
    return () => {
      window.removeEventListener('realTimeBookingSuccess', handleBookingSuccess);
    };
  }, [id, refetchConcert, triggerSeatsUpdate]);

  // 🎯 예매 완료 플래그 확인 및 강제 새로고침 - 개선된 버전
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
          console.log('🎉 예매 완료 플래그 감지 (sessionStorage), 최신 좌석 데이터 가져오기 시작');
          console.log('예매된 좌석:', bookingInfo.bookedSeats);
          
          // 플래그 즉시 제거 (중복 처리 방지)
          sessionStorage.removeItem('bookingCompleted');
          
          // 예매 완료 이벤트 발생
          window.dispatchEvent(new CustomEvent('bookingCompleted', {
            detail: {
              concertId: id,
              bookedSeats: bookingInfo.bookedSeats,
              timestamp: Date.now()
            }
          }));
          
          // 강제 새로고침 실행
          if (refetchConcert) {
            toast.promise(
              refetchConcert(),
              {
                loading: '예매된 좌석 정보를 업데이트하는 중...',
                success: (data) => {
                  console.log('🔄 새로고침된 좌석 데이터:', data);
                  
                  // 🎯 좌석 업데이트 이벤트 발생
                  triggerSeatsUpdate(data);
                  
                  // 예매된 좌석이 실제로 업데이트되었는지 확인
                  const updatedSeats = data?.seats || [];
                  const bookedSeatsInData = updatedSeats.filter(seat => seat.is_booked);
                  
                  console.log('백엔드에서 예약된 좌석:', bookedSeatsInData);
                  
                  if (bookedSeatsInData.length === 0) {
                    console.error('❌ 백엔드 문제: 예매했지만 is_booked가 true인 좌석이 없습니다!');
                    return `⚠️ 예매는 완료되었지만 좌석 상태 업데이트에 문제가 있습니다.`;
                  } else {
                    return `🎉 ${bookingInfo.bookedSeats.join(', ')} 좌석 예매가 완료되었습니다!`;
                  }
                },
                error: (err) => {
                  console.error('좌석 정보 업데이트 실패:', err);
                  return '좌석 정보 업데이트에 실패했습니다.';
                }
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
  }, [id, loading, concertDetail, refetchConcert, triggerSeatsUpdate]);

  // 예매 완료 플래그 확인
  useEffect(() => {
    checkAndHandleBookingFlag();
  }, [checkAndHandleBookingFlag]);

  // 🎯 강제 주기적 좌석 상태 확인 (폴링) - 예매 완료 감지를 위한 백업
  useEffect(() => {
    if (!concertDetail || !refetchConcert) return;

    let pollInterval = null;
    
    const startPolling = () => {
      console.log('🔄 좌석 상태 폴링 시작 (5초마다)');
      pollInterval = setInterval(async () => {
        try {
          const latestData = await refetchConcert();
          
          if (latestData?.seats && Array.isArray(latestData.seats)) {
            const currentBookedSeats = concertDetail.seats?.filter(s => s.is_booked) || [];
            const latestBookedSeats = latestData.seats.filter(s => s.is_booked);
            
            // 예약된 좌석 수가 변경되었는지 확인
            if (currentBookedSeats.length !== latestBookedSeats.length) {
              console.log('🔥 폴링으로 좌석 상태 변경 감지!', {
                이전예약좌석: currentBookedSeats.length,
                현재예약좌석: latestBookedSeats.length,
                새로예약된좌석: latestBookedSeats.map(s => s.seat_number)
              });
              
              // 좌석 업데이트 이벤트 발생
              triggerSeatsUpdate(latestData);
              
              // 폴링 일시 중단 (과도한 API 호출 방지)
              clearInterval(pollInterval);
              setTimeout(() => {
                if (pollInterval) startPolling();
              }, 10000); // 10초 후 다시 시작
            }
          }
        } catch (error) {
          console.error('폴링 중 오류:', error);
        }
      }, 5000); // 5초마다 확인
    };

    // 페이지가 활성화되어 있을 때만 폴링 실행
    if (document.hasFocus()) {
      startPolling();
    }

    // 페이지 포커스/블러 이벤트 처리
    const handleFocus = () => {
      if (!pollInterval) startPolling();
    };
    
    const handleBlur = () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [concertDetail, refetchConcert, triggerSeatsUpdate]); // 🔧 concertDetail 의존성 명시적 추가

  // 🎯 localStorage/sessionStorage 변경 감지
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'bookingCompleted' && e.newValue) {
        console.log('🔥 Storage 변경 감지 - 예매 완료!', e.newValue);
        
        try {
          const bookingInfo = JSON.parse(e.newValue);
          if (parseInt(bookingInfo.concertId) === parseInt(id)) {
            // 즉시 refetch 실행
            if (refetchConcert) {
              refetchConcert().then((data) => {
                triggerSeatsUpdate(data);
                toast.success(`🎉 ${bookingInfo.bookedSeats?.join(', ')} 좌석 예매 완료!`);
              });
            }
          }
        } catch (error) {
          console.error('Storage 변경 처리 오류:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [id, refetchConcert, triggerSeatsUpdate]);

  // 🎯 수동 트리거 함수 - 예매 완료 후 외부에서 호출 가능
  useEffect(() => {
    // 글로벌 함수로 등록하여 다른 컴포넌트에서 호출 가능
    window.forceConcertDetailRefresh = () => {
      console.log('🔧 외부에서 강제 새로고침 요청');
      if (refetchConcert) {
        refetchConcert().then((data) => {
          triggerSeatsUpdate(data);
          toast.success('좌석 정보가 업데이트되었습니다!');
        });
      }
    };

    return () => {
      delete window.forceConcertDetailRefresh;
    };
  }, [refetchConcert, triggerSeatsUpdate]);

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

  // 🎯 페이지 포커스 시 데이터 새로고침 - 개선된 버전
  const handleWindowFocus = useCallback(() => {
    if (concertDetail && document.hasFocus() && refetchConcert) {
      console.log('📱 페이지 포커스, 데이터 새로고침');
      refetchConcert().then((data) => {
        if (data) {
          triggerSeatsUpdate(data);
        }
      });
    }
  }, [concertDetail, refetchConcert, triggerSeatsUpdate]);

  // 페이지 포커스 이벤트 등록
  useEffect(() => {
    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [handleWindowFocus]);

  // 수동 새로고침 함수 - 개선된 버전
  // eslint-disable-next-line no-unused-vars
  const handleRefresh = () => {
    if (refetchConcert) {
      toast.promise(
        refetchConcert(),
        {
          loading: '최신 정보를 가져오는 중...',
          success: (data) => {
            // 좌석 업데이트 이벤트 발생
            triggerSeatsUpdate(data);
            
            // 새로고침 후 좌석 상태 로깅
            const seats = data?.seats || [];
            const bookedSeats = seats.filter(seat => seat.is_booked);
            const availableSeats = seats.length - bookedSeats.length;
            
            console.log('🔄 수동 새로고침 완료:', {
              totalSeats: seats.length,
              bookedSeats: bookedSeats.length,
              availableSeats: availableSeats,
              bookedSeatNumbers: bookedSeats.map(s => s.seat_number)
            });
            
            if (bookedSeats.length > 0) {
              return `좌석 정보 업데이트 완료! (예약: ${bookedSeats.length}석, 예매 가능: ${availableSeats}석)`;
            } else {
              return `좌석 정보 업데이트 완료! (예매 가능: ${availableSeats}석)`;
            }
          },
          error: (err) => {
            console.error('새로고침 실패:', err);
            return '새로고침에 실패했습니다.';
          }
        }
      );
    } else {
      // refetchConcert가 없는 경우 페이지 새로고침
      window.location.reload();
    }
  };

  // 강제 새로고침 글로벌 함수 등록
  useEffect(() => {
    window.forceConcertDetailRefresh = () => {
      console.log('🔧 글로벌 강제 새로고침 요청');
      if (refetchConcert) {
        refetchConcert().then((data) => {
          triggerSeatsUpdate(data);
          console.log('🔧 글로벌 새로고침 완료');
        });
      }
    };

    return () => {
      delete window.forceConcertDetailRefresh;
    };
  }, [refetchConcert, triggerSeatsUpdate]);

  // 추가 이벤트 감지 (실시간 예매 감지 강화)
  useEffect(() => {
    const handleGenericBookingComplete = (event) => {
      console.log('🔥 일반 예매 완료 이벤트 감지:', event.detail);
      
      if (event.detail?.concertId && parseInt(event.detail.concertId) === parseInt(id)) {
        console.log('🎯 현재 공연의 예매 완료 감지 - 즉시 새로고침');
        
        // 즉시 refetch 실행
        if (refetchConcert) {
          refetchConcert().then((data) => {
            triggerSeatsUpdate(data);
            
            // 성공 메시지 (토스트가 중복되지 않도록 조건부)
            if (!event.detail.toastShown) {
              const bookedSeats = event.detail.bookedSeats || [];
              if (bookedSeats.length > 0) {
                toast.success(`좌석 ${bookedSeats.join(', ')} 예매 완료 - 화면 업데이트됨!`);
              }
            }
          });
        }
      }
    };

    // 추가 이벤트 리스너들
    window.addEventListener('bookingCompleted', handleGenericBookingComplete);
    
    return () => {
      window.removeEventListener('bookingCompleted', handleGenericBookingComplete);
    };
  }, [id, refetchConcert, triggerSeatsUpdate]);

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
            <p className="mock-data-notice">트래픽 급증으로 인해 대기 시간이 지연되었습니다. 기다려주신 고객 여러분께 진심으로 사과드립니다.</p>
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
    console.log('🎭 현재 좌석 데이터 분석:', {
      updateKey: seatsUpdateKey,
      totalSeats: seatData.length,
      availableSeats: availableSeatsCount,
      bookedSeats: bookedSeats.length,
      bookedSeatNumbers: bookedSeats.map(seat => seat.seat_number),
      timestamp: new Date().toLocaleTimeString()
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
        <div className="mock-data-banner" 
        >
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
      </div>
      
      <div className="detail-content">
        {/* 공연 정보 표시 - key prop으로 강제 리렌더링 보장 */}
        <div className="concert-info-section">
          <ConcertInfo 
            concert={{
              ...concertDetail,
              availableSeats: availableSeatsCount
            }}
            key={`concert-info-${concertDetail.concert_se || concertDetail.id}-${seatsUpdateKey}`}
          />
        </div>
        
        {/* 좌석맵 표시 - key prop으로 강제 리렌더링 보장 */}
        <div className="seatmap-section">
          <SeatMap 
            concert={concertDetail} 
            seats={seatData}
            key={`seatmap-${concertDetail.concert_se || concertDetail.id}-${seatsUpdateKey}`}
          />
        </div>
      </div>
    </div>
  );
}

export default ConcertDetail;