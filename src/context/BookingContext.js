// src/context/BookingContext.js
import React, { createContext, useContext, useReducer } from 'react';

const BookingContext = createContext();

// 초기 상태
const initialState = {
  selectedConcert: null,
  selectedSeat: null,
  bookingStep: 'selection', // selection, waiting, completed
  waitingCount: 0,
  isBooking: false,
};

// 액션 타입
const BOOKING_ACTIONS = {
  SELECT_CONCERT: 'SELECT_CONCERT',
  SELECT_SEAT: 'SELECT_SEAT',
  CLEAR_SEAT: 'CLEAR_SEAT',
  START_BOOKING: 'START_BOOKING',
  SET_WAITING_COUNT: 'SET_WAITING_COUNT',
  COMPLETE_BOOKING: 'COMPLETE_BOOKING',
  RESET_BOOKING: 'RESET_BOOKING',
  SET_BOOKING_STEP: 'SET_BOOKING_STEP',
};

// 리듀서
function bookingReducer(state, action) {
  switch (action.type) {
    case BOOKING_ACTIONS.SELECT_CONCERT:
      return {
        ...state,
        selectedConcert: action.payload,
        selectedSeat: null,
        bookingStep: 'selection',
      };
    
    case BOOKING_ACTIONS.SELECT_SEAT:
      return {
        ...state,
        selectedSeat: action.payload,
      };
    
    case BOOKING_ACTIONS.CLEAR_SEAT:
      return {
        ...state,
        selectedSeat: null,
      };
    
    case BOOKING_ACTIONS.START_BOOKING:
      return {
        ...state,
        isBooking: true,
        bookingStep: 'waiting',
        waitingCount: 3,
      };
    
    case BOOKING_ACTIONS.SET_WAITING_COUNT:
      return {
        ...state,
        waitingCount: action.payload,
      };
    
    case BOOKING_ACTIONS.COMPLETE_BOOKING:
      return {
        ...state,
        isBooking: false,
        bookingStep: 'completed',
        selectedSeat: null,
      };
    
    case BOOKING_ACTIONS.RESET_BOOKING:
      return {
        ...initialState,
      };
    
    case BOOKING_ACTIONS.SET_BOOKING_STEP:
      return {
        ...state,
        bookingStep: action.payload,
      };
    
    default:
      return state;
  }
}

export function BookingProvider({ children }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  // 공연 선택
  const selectConcert = (concert) => {
    dispatch({
      type: BOOKING_ACTIONS.SELECT_CONCERT,
      payload: concert
    });
  };

  // 좌석 선택
  const selectSeat = (seatNumber) => {
    dispatch({
      type: BOOKING_ACTIONS.SELECT_SEAT,
      payload: seatNumber
    });
  };

  // 좌석 선택 취소
  const clearSeat = () => {
    dispatch({ type: BOOKING_ACTIONS.CLEAR_SEAT });
  };

  // 예매 시작
  const startBooking = () => {
    dispatch({ type: BOOKING_ACTIONS.START_BOOKING });
  };

  // 대기 인원 수 설정
  const setWaitingCount = (count) => {
    dispatch({
      type: BOOKING_ACTIONS.SET_WAITING_COUNT,
      payload: count
    });
  };

  // 예매 완료
  const completeBooking = () => {
    dispatch({ type: BOOKING_ACTIONS.COMPLETE_BOOKING });
  };

  // 예매 초기화
  const resetBooking = () => {
    dispatch({ type: BOOKING_ACTIONS.RESET_BOOKING });
  };

  // 예매 단계 설정
  const setBookingStep = (step) => {
    dispatch({
      type: BOOKING_ACTIONS.SET_BOOKING_STEP,
      payload: step
    });
  };

  const value = {
    ...state,
    selectConcert,
    selectSeat,
    clearSeat,
    startBooking,
    setWaitingCount,
    completeBooking,
    resetBooking,
    setBookingStep,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBookingContext() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return context;
}