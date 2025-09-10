export function generateJWT(user) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const payload = {
    user: user,
    exp: Date.now() + 3600000, // 1시간
    iat: Date.now()
  };

  // 실제로는 서버에서 서명하지만, 데모용으로 간단히 구현
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = btoa(`signature_${user.id}_${Date.now()}`);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function validateJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));
    
    // 토큰 만료 확인
    if (payload.exp < Date.now()) {
      return null;
    }

    return payload.user;
  } catch (error) {
    return null;
  }
}