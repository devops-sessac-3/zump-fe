import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import '../../styles/components/Auth.css';

function AuthContainer() {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="auth-tabs">
          <button
            className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            로그인
          </button>
          <button
            className={`tab-button ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => setActiveTab('signup')}
          >
            회원가입
          </button>
        </div>

        {activeTab === 'login' ? (
          <LoginForm onSwitchToSignup={() => setActiveTab('signup')} />
        ) : (
          <SignupForm onSwitchToLogin={() => setActiveTab('login')} />
        )}
      </div>
    </div>
  );
}

export default AuthContainer;