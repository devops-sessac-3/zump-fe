import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

function LoginForm({ onSwitchToSignup }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate('/concerts');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form-content">
      <div className="form-group">
        <label htmlFor="email">이메일</label>
        <input
          type="email"
          id="email"
          {...register('email', {
            required: '이메일을 입력해주세요.',
            pattern: {
              value: /^\S+@\S+$/i,
              message: '올바른 이메일 형식을 입력해주세요.'
            }
          })}
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <span className="error-message">{errors.email.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="password">비밀번호</label>
        <input
          type="password"
          id="password"
          {...register('password', {
            required: '비밀번호를 입력해주세요.',
            minLength: {
              value: 6,
              message: '비밀번호는 최소 6자 이상이어야 합니다.'
            }
          })}
          className={errors.password ? 'error' : ''}
        />
        {errors.password && <span className="error-message">{errors.password.message}</span>}
      </div>

      <button
        type="submit"
        className="submit-btn"
        disabled={isSubmitting}
      >
        {isSubmitting ? '로그인 중...' : '로그인'}
      </button>
    </form>
  );
}

export default LoginForm;
