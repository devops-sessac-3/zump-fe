import { validateJWT } from '../utils/jwt';

// API 기본 URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const authService = {
  // 로그인 - 기존 백엔드 API 구조에 맞춤
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: email,
          user_password: password,
          user_name: "" // 백엔드 스키마에 필요하지만 로그인시에는 빈값
        }),
      });

      if (!response.ok) {
        let errorMessage = '로그인에 실패했습니다.';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (parseError) {
          errorMessage = `서버 오류 (${response.status})`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // 백엔드 응답 구조: {access_token: "토큰값"}
      if (!data.access_token) {
        throw new Error('토큰을 받을 수 없습니다.');
      }

      // JWT 토큰에서 사용자 정보 추출
      // eslint-disable-next-line no-unused-vars
      const tokenData = validateJWT(data.access_token);
      const user = {
        id: email,
        email: email,
        name: email.split('@')[0], // 이메일에서 사용자명 추출
        token: data.access_token
      };

      // 토큰 저장
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(user));

      return { 
        user,
        token: data.access_token 
      };
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      }
      throw error;
    }
  },

  // 회원가입 - 기존 백엔드 API 구조에 맞춤
  async signup(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: userData.email,
          user_password: userData.password,
          user_name: userData.name
        }),
      });

      if (!response.ok) {
        let errorMessage = '회원가입에 실패했습니다.';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (parseError) {
          if (response.status === 400) {
            errorMessage = '잘못된 요청입니다. 입력 정보를 확인해주세요.';
          } else if (response.status === 409) {
            errorMessage = '이미 등록된 이메일입니다.';
          } else {
            errorMessage = `서버 오류 (${response.status})`;
          }
        }
        
        throw new Error(errorMessage);
      }

      // 회원가입 성공 (201 Created)
      return { success: true };
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      }
      throw error;
    }
  },

  // 현재 사용자 정보 조회 (로컬 스토리지에서)
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('사용자 정보 파싱 오류:', error);
      return null;
    }
  },

  // 토큰 유효성 검증
  async validateToken(token) {
    try {
      // 클라이언트 사이드 검증
      const tokenData = validateJWT(token);
      return tokenData !== null;
    } catch (error) {
      return false;
    }
  },

  // 로그아웃
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // 인증 상태 확인
  isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) return false;
    
    // 토큰 만료 확인
    return this.validateToken(token);
  },

  // 토큰 갱신 (향후 구현을 위해 준비)
  async refreshToken(refreshToken) {
    throw new Error('토큰 갱신 기능이 구현되지 않았습니다.');
  }
};

