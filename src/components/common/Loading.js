import React from 'react';

function Loading({ size = 'medium', text = '로딩 중...' }) {
  const sizeClass = `loading-${size}`;

  return (
    <div className="loading-container">
      <div className={`loading-spinner ${sizeClass}`}>
        <div className="spinner"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}

export default Loading;