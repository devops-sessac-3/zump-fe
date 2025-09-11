import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="header">
      <div className="header-content">
        <div 
          className="logo"
          onClick={() => navigate('/concerts')}
        >
          🎭 ZumpCON
        </div>
        
        <div className="header-actions">
          <span className="user-info">
            안녕하세요, {user?.name}님!
          </span>
          <button 
            className="logout-btn"
            onClick={handleLogout}
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;