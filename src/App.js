import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import Layout from './components/layout/Layout';
import AuthContainer from './components/auth/AuthContainer';
import ConcertList from './components/concert/ConcertList';
import AccessWaitingPage from './components/concert/AccessWaitingPage';
import ConcertDetail from './components/concert/ConcertDetail';
import WaitingPage from './components/booking/WaitingPage'; // 예매용 WaitingPage
import { useAuth } from './hooks/useAuth';
import './styles/global.css';

// Protected Route 컴포넌트 //
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

// Public Route 컴포넌트 (인증된 사용자는 접근 불가)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/concerts" />;
};

function AppContent() {
  return (
    <Router>
      <BookingProvider>
        <Layout>
          <Routes>
            {/* 인증 관련 라우트 */}
            <Route 
              path="/auth" 
              element={
                <PublicRoute>
                  <AuthContainer />
                </PublicRoute>
              } 
            />
            
            {/* 공연 목록 */}
            <Route 
              path="/concerts" 
              element={
                <ProtectedRoute>
                  <ConcertList />
                </ProtectedRoute>
              } 
            />
            
            {/* 공연 접속용 웨이팅 페이지 - AccessWaitingPage 사용 */}
            <Route 
              path="/waiting/:id" 
              element={
                <ProtectedRoute>
                  <AccessWaitingPage />
                </ProtectedRoute>
              } 
            />
            
            {/* 공연 상세 페이지 */}
            <Route 
              path="/concerts/:id" 
              element={
                <ProtectedRoute>
                  <ConcertDetail />
                </ProtectedRoute>
              } 
            />
            
            {/* 예매 완료용 웨이팅 페이지 - 새로운 WaitingPage 사용 */}
            <Route 
              path="/waiting" 
              element={
                <ProtectedRoute>
                  <WaitingPage />
                </ProtectedRoute>
              } 
            />
            
            {/* 기본 라우트 */}
            <Route path="/" element={<Navigate to="/concerts" />} />
            
            {/* 404 처리 */}
            <Route path="*" element={
              <div className="not-found-container">
                <h2>페이지를 찾을 수 없습니다</h2>
                <p>요청하신 페이지가 존재하지 않습니다.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => window.location.href = '/concerts'}
                  style={{
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  공연 목록으로 돌아가기
                </button>
              </div>
            } />
          </Routes>
          
          {/* 전역 토스트 알림 설정 */}
          <Toaster 
            position="top-center"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              // 기본 설정
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                maxWidth: '500px',
              },
              
              // 성공 토스트
              success: {
                duration: 5000,
                style: {
                  background: '#10B981',
                  color: '#fff',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#10B981',
                },
              },
              
              // 에러 토스트
              error: {
                duration: 6000,
                style: {
                  background: '#EF4444',
                  color: '#fff',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#EF4444',
                },
              },
              
              // 로딩 토스트
              loading: {
                style: {
                  background: '#3B82F6',
                  color: '#fff',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#3B82F6',
                },
              },
            }}
          />
        </Layout>
      </BookingProvider>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
