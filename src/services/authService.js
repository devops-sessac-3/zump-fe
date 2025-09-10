import { generateJWT } from '../utils/jwt';

export const authService = {
  // 로그인
  async login(email, password) {
    // 실제 서비스에서는 API 호출
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          const user = {
            id: 1,
            name: email.split('@')[0],
            email: email
          };
          const token = generateJWT(user);
          resolve({ user, token });
        } else {
          reject(new Error('이메일과 비밀번호를 입력해주세요.'));
        }
      }, 1000);
    });
  },

  // 회원가입
  async signup(userData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (userData.name && userData.email && userData.password) {
          resolve({ success: true });
        } else {
          reject(new Error('모든 필드를 입력해주세요.'));
        }
      }, 1000);
    });
  },

  // 토큰 갱신
  async refreshToken(token) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ token });
      }, 500);
    });
  }
};