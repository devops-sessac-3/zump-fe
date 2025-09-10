import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';

function SignupForm({ onSwitchToLogin }) {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const { signup } = useAuth();
  const watchPassword = watch('password');

  const onSubmit = async (data) => {
    const { confirmPassword, ...userData } = data;
    const result = await signup(userData);
    if (result.success) {
      onSwitchToLogin();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form-content">
      <div className="form-group">
        <label htmlFor="name">이름</label>
        <input
          type="text"
          id="name"
          {...register('name', {
            required: '이름을 입력해주세요.',
            minLength: {
              value: 2,
              message: '이름은 최소 2자 이상이어야 합니다.'
            }
          })}
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <span className="error-message">{errors.name.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="signupEmail">이메일</label>
        <input
          type="email"
          id="signupEmail"
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
        <label htmlFor="signupPassword">비밀번호</label>
        <input
          type="password"
          id="signupPassword"
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

      <div className="form-group">
        <label htmlFor="confirmPassword">비밀번호 확인</label>
        <input
          type="password"
          id="confirmPassword"
          {...register('confirmPassword', {
            required: '비밀번호 확인을 입력해주세요.',
            validate: value =>
              value === watchPassword || '비밀번호가 일치하지 않습니다.'
          })}
          className={errors.confirmPassword ? 'error' : ''}
        />
        {errors.confirmPassword && <span className="error-message">{errors.confirmPassword.message}</span>}
      </div>

      <button
        type="submit"
        className="submit-btn"
        disabled={isSubmitting}
      >
        {isSubmitting ? '회원가입 중...' : '회원가입'}
      </button>
    </form>
  );
}

export default SignupForm;