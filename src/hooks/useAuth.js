import { useAuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export function useAuth() {
  const { login: contextLogin, logout: contextLogout, ...authState } = useAuthContext();

  const login = async (email, password) => {
    try {
      const { user, token } = await authService.login(email, password);
      contextLogin(user, token);
      toast.success('로그인 성공!');
      return { success: true };
    } catch (error) {
      toast.error(error.message || '로그인에 실패했습니다.');
      return { success: false, error: error.message };
    }
  };

  const signup = async (userData) => {
    try {
      await authService.signup(userData);
      toast.success('회원가입이 완료되었습니다. 로그인해주세요.');
      return { success: true };
    } catch (error) {
      toast.error(error.message || '회원가입에 실패했습니다.');
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    contextLogout();
    toast.success('로그아웃되었습니다.');
  };

  return {
    ...authState,
    login,
    signup,
    logout,
  };
}
