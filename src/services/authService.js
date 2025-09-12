import { validateJWT } from '../utils/jwt';

// API 기본 URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const authService = {
  // 로그인
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
          // user_name은 로그인에서 필요 없지만 백엔드 스키마가 같아서 빈 값 전송
          user_name: ""
        }),
      });

      if (!response.ok) {
        // HTTP 에러 상태 처리
        let errorMessage = '로그인에 실패했습니다.';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (parseError) {
          // JSON 파싱 실패 시 기본 메시지 사용
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
      const tokenData = validateJWT(data.access_token);
      const user = tokenData ? {
        id: tokenData.user_id,
        email: tokenData.user_id,
        name: tokenData.user_id ? tokenData.user_id.split('@')[0] : 'User'
      } : {
        id: email,
        email: email,
        name: email.split('@')[0]
      };

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

  // 회원가입
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

  // 토큰 유효성 검증 (현재 백엔드에 verify 엔드포인트가 없으므로 클라이언트 사이드에서만)
  async validateToken(token) {
    try {
      // 클라이언트 사이드 검증만
      const tokenData = validateJWT(token);
      return tokenData !== null;
    } catch (error) {
      return false;
    }
  },

  // 토큰 갱신 (향후 구현을 위해 준비 - 현재 백엔드에는 없음)
  async refreshToken(refreshToken) {
    // 현재 백엔드에 refresh 엔드포인트가 없으므로 에러 반환
    throw new Error('토큰 갱신 기능이 구현되지 않았습니다.');
  }
};