// JWT 토큰 디코딩 (검증 없이)
function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Base64 URL 디코딩
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch (error) {
    return null;
  }
}

// JWT 토큰 유효성 검사 (현재 백엔드 JWT 구조에 맞춤)
export function validateJWT(token) {
  if (!token) return null;

  try {
    const decoded = decodeJWT(token);
    if (!decoded) return null;

    // 만료시간 확인
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      console.log('Token expired');
      return null; // 토큰 만료됨
    }

    // 백엔드에서 생성하는 JWT 구조에 맞춰 필드 확인
    // 현재 백엔드: data = {"user_id": user_id, "user_pw": security_user_pw}
    if (!decoded.user_id) {
      console.log('No user_id in token');
      return null;
    }

    return {
      user_id: decoded.user_id,
      user_pw: decoded.user_pw,
      exp: decoded.exp,
      iat: decoded.iat
    };
  } catch (error) {
    console.error('JWT validation error:', error);
    return null;
  }
}

// JWT 토큰 생성 (개발/테스트용 - 실제로는 서버에서만 생성해야 함)
export function generateJWT(user) {
  // 주의: 실제 운영에서는 서버에서만 토큰을 생성해야 합니다.
  // 이 함수는 개발/테스트 목적으로만 사용하세요.
  
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const payload = {
    user_id: user.email,
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1시간 후 만료
    iat: Math.floor(Date.now() / 1000)
  };

  // 실제로는 서버의 비밀키로 서명해야 하지만, 
  // 여기서는 개발용으로 간단히 구현
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  return `${encodedHeader}.${encodedPayload}.dev_signature`;
}

// 토큰이 곧 만료되는지 확인 (30분 전)
export function isTokenExpiringSoon(token) {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  const thirtyMinutes = 30 * 60;
  
  return (decoded.exp - currentTime) < thirtyMinutes;
}