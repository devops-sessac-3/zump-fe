import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { validateJWT } from '../utils/jwt';

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
    const token = localStorage.getItem('token');
    if (token) {
      const user = validateJWT(token);
      if (user) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token }
        });
      } else {
        localStorage.removeItem('token');
        dispatch({ type: AUTH_ACTIONS.TOKEN_INVALID });
      }
    } else {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  // 로그인
  const login = (user, token) => {
    localStorage.setItem('token', token);
    dispatch({
      type: AUTH_ACTIONS.LOGIN_SUCCESS,
      payload: { user, token }
    });
  };

  // 로그아웃
  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // 토큰 갱신
  const refreshToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const user = validateJWT(token);
      if (!user) {
        logout();
      }
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