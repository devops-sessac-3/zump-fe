import React from 'react';
import Header from '../common/Header';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../common/Loading';
import '../../styles/components/Layout.css';

function Layout({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="layout-loading">
        <Loading size="large" text="앱을 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="layout">
      <Header />
      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;