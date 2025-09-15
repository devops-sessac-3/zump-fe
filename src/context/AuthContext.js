import React, { createContext, useContext, useReducer, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { validateJWT } from '../utils/jwt';
import { authService } from '../services/authService';

const AuthContext = createContext();

// 초기 상태
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
};

// 액션 타입
const AUTH_ACTIONS = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  TOKEN_INVALID: 'TOKEN_INVALID',
};

// 리듀서
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    
    case AUTH_ACTIONS.TOKEN_INVALID:
      return {
        ...initialState,
        loading: false,
      };
    
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 토큰 검증 및 자동 로그인
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          // 토큰 유효성 검증
          const isValid = await authService.validateToken(token);
          
          if (isValid) {
            const user = JSON.parse(userStr);
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: { user, token }
            });
          } else {
            // 토큰이 유효하지 않으면 로컬 스토리지 정리
            authService.logout();
            dispatch({ type: AUTH_ACTIONS.TOKEN_INVALID });
          }
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('인증 초기화 오류:', error);
        authService.logout();
        dispatch({ type: AUTH_ACTIONS.TOKEN_INVALID });
      }
    };

    initAuth();
  }, []);

  // 로그인
  const login = (user, token) => {
    // authService에서 이미 localStorage에 저장했으므로 여기서는 상태만 업데이트
    dispatch({
      type: AUTH_ACTIONS.LOGIN_SUCCESS,
      payload: { user, token }
    });
  };

  // 로그아웃
  const logout = () => {
    authService.logout(); // localStorage 정리
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // 토큰 갱신 (현재는 클라이언트 사이드 검증만)
  const refreshToken = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const isValid = await authService.validateToken(token);
        if (!isValid) {
          logout();
        }
      } else {
        logout();
      }
    } catch (error) {
      console.error('토큰 갱신 오류:', error);
      logout();
    }
  };

  const value = {
    ...state,
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

