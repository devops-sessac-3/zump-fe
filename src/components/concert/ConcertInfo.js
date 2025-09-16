// eslint-disable-next-line react-hooks/exhaustive-deps
import React, { useMemo, useEffect, useState } from 'react';

function ConcertInfo({ concert }) {
  // eslint-disable-next-line no-unused-vars
  const [lastSeatsUpdate, setLastSeatsUpdate] = useState(0);

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

  // 개선된 사용 가능한 좌석 수 계산,연속 예약 지원
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const availableSeats = useMemo(() => {
    if (!concert) {
      console.log('ConcertInfo: concert 데이터 없음');
      return 0;
    }

    // 누적 낙관적 업데이트: 모든 미동기화 예약 추적
    let totalOptimisticBookedSeats = 0;
    try {
      const currentConcertId = concert.concert_se || concert.id;
      
      // 현재 예약 (최신)
      const recentBooking = sessionStorage.getItem('bookingCompleted');
      if (recentBooking) {
        const bookingData = JSON.parse(recentBooking);
        if (parseInt(bookingData.concertId) === parseInt(currentConcertId)) {
          totalOptimisticBookedSeats += bookingData.bookedSeats?.length || 0;
        }
      }

      // 누적 예약 추적 (연속 예약 지원)
      const cumulativeBookings = sessionStorage.getItem(`cumulativeBookings_${currentConcertId}`);
      if (cumulativeBookings) {
        const cumulativeData = JSON.parse(cumulativeBookings);
        // 5분 이내의 예약만 유효하다고 가정
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        const validBookings = cumulativeData.filter(booking => booking.timestamp > fiveMinutesAgo);
        
        totalOptimisticBookedSeats = validBookings.reduce((total, booking) => {
          return total + (booking.bookedSeats?.length || 0);
        }, 0);
        
        if (validBookings.length > 0) {
          console.log('🎯 누적 낙관적 업데이트 적용:', {
            totalBookings: validBookings.length,
            totalOptimisticSeats: totalOptimisticBookedSeats,
            bookings: validBookings
          });
        }
      }

    } catch (error) {
      console.error('낙관적 업데이트 처리 오류:', error);
    }

    // 좌석 배열이 있는 경우
    if (concert.seats && Array.isArray(concert.seats)) {
      const backendAvailable = concert.seats.filter(seat => {
        const isBooked = seat.is_booked === true || 
                        seat.isBooked === true || 
                        seat.status === 'booked' || 
                        seat.status === 'occupied';
        return !isBooked;
      }).length;
      
      // 누적 낙관적 업데이트 적용
      const optimisticAvailable = Math.max(0, backendAvailable - totalOptimisticBookedSeats);
      
      console.log('ConcertInfo: 좌석 수 계산 완료 (연속 예약 지원)', {
        totalSeats: concert.seats.length,
        backendAvailableSeats: backendAvailable,
        totalOptimisticBookedSeats: totalOptimisticBookedSeats,
        finalAvailableSeats: optimisticAvailable
      });
      
      return optimisticAvailable;
    }

    // availableSeats 필드가 직접 있는 경우
    if (typeof concert.availableSeats === 'number') {
      const optimisticAvailable = Math.max(0, concert.availableSeats - totalOptimisticBookedSeats);
      console.log('ConcertInfo: availableSeats 필드 사용 (연속 예약):', {
        original: concert.availableSeats,
        optimistic: optimisticAvailable
      });
      return optimisticAvailable;
    }

    // 기본값
    return Math.max(0, 40 - totalOptimisticBookedSeats);
  }, [
    concert,
    //lastSeatsUpdate // 이벤트 기반 업데이트용
  ]);

  // 좌석 데이터 변경 감지 및 로깅 - 연속 예약 지원
  useEffect(() => {
    if (concert?.seats && Array.isArray(concert.seats)) {
      const bookedSeats = concert.seats.filter(seat => seat.is_booked);
      const availableCount = concert.seats.length - bookedSeats.length;
      
      console.log('🎭 ConcertInfo: 좌석 상태 업데이트 감지', {
        concertId: concert.concert_se || concert.id,
        concertName: concert.concert_name || concert.name,
        timestamp: new Date().toLocaleTimeString(),
        totalSeats: concert.seats.length,
        bookedSeats: bookedSeats.length,
        availableSeats: availableCount,
        bookedSeatNumbers: bookedSeats.map(s => s.seat_number).sort()
      });

      // 백엔드 데이터 동기화 시 누적 예약 정리
      const currentConcertId = concert.concert_se || concert.id;
      const cumulativeKey = `cumulativeBookings_${currentConcertId}`;
      
      try {
        const cumulativeBookings = sessionStorage.getItem(cumulativeKey);
        if (cumulativeBookings && bookedSeats.length > 0) {
          const bookingsArray = JSON.parse(cumulativeBookings);
          const actualBookedSeats = bookedSeats.map(s => s.seat_number);
          
          // 백엔드에 반영된 예약들을 누적 리스트에서 제거
          const updatedBookings = bookingsArray.filter(booking => {
            const allSeatsReflected = booking.bookedSeats.every(seat => 
              actualBookedSeats.includes(seat)
            );
            
            if (allSeatsReflected) {
              console.log('✅ 백엔드 동기화 완료된 예약 제거:', booking.bookedSeats);
              return false; // 제거
            }
            return true; // 유지
          });
          
          if (updatedBookings.length !== bookingsArray.length) {
            if (updatedBookings.length === 0) {
              // 모든 예약이 동기화됨 - 누적 데이터 완전 제거
              sessionStorage.removeItem(cumulativeKey);
              sessionStorage.removeItem('bookingCompleted');
              console.log('✅ 모든 누적 예약 동기화 완료, 임시 데이터 정리');
            } else {
              // 일부만 동기화됨 - 남은 예약만 유지
              sessionStorage.setItem(cumulativeKey, JSON.stringify(updatedBookings));
              console.log('⏳ 일부 예약 동기화 완료, 남은 예약:', updatedBookings.length);
            }
          }
        }
      } catch (error) {
        console.error('누적 예약 정리 중 오류:', error);
      }

      // 조건부로만 업데이트 트리거 (무한루프 방지)
      setLastSeatsUpdate(Date.now());
    }
  }, [
    concert?.seats, 
    concert?.concert_se, 
    concert?.id,
    concert?.concert_name,
    concert?.name
  ]);

  // 예매 완료 후 데이터 새로고침 감지
  useEffect(() => {
    const handleBookingUpdate = () => {
      console.log('🔄 ConcertInfo: 예매 완료 이벤트 감지, 좌석 수 재계산');
      // 🔧 직접 setState 대신 setTimeout으로 안전하게 처리
      setTimeout(() => {
        setLastSeatsUpdate(Date.now());
      }, 0);
    };

    // 커스텀 이벤트 리스너 등록
    window.addEventListener('bookingCompleted', handleBookingUpdate);
    window.addEventListener('seatsUpdated', handleBookingUpdate);

    return () => {
      window.removeEventListener('bookingCompleted', handleBookingUpdate);
      window.removeEventListener('seatsUpdated', handleBookingUpdate);
    };
  }, []);

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
          <span 
            className="detail-value concert-seats"
            style={{
              fontWeight: 'bold',
              color: availableSeats > 10 ? '#28a745' : availableSeats > 0 ? '#ffc107' : '#dc3545'
            }}
          >
            {availableSeats}석
            {availableSeats === 0 && ' (매진)'}
          </span>
        </div>
      </div>
      
      {concertDescription && (
        <div className="concert-description">
          <h4>공연 소개</h4>
          <p>{concertDescription}</p>
        </div>
      )}
    </div>
  );
}

export default ConcertInfo;