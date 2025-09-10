// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import Layout from './components/layout/Layout';
import AuthContainer from './components/auth/AuthContainer';
import ConcertList from './components/concert/ConcertList';
import ConcertDetail from './components/concert/ConcertDetail';
import WaitingPage from './components/booking/WaitingPage';
import { useAuth } from './hooks/useAuth';
import './styles/global.css';

// Protected Route 컴포넌트
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
            <Route 
              path="/auth" 
              element={
                <PublicRoute>
                  <AuthContainer />
                </PublicRoute>
              } 
            />
            <Route 
              path="/concerts" 
              element={
                <ProtectedRoute>
                  <ConcertList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/concerts/:id" 
              element={
                <ProtectedRoute>
                  <ConcertDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/waiting" 
              element={
                <ProtectedRoute>
                  <WaitingPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/concerts" />} />
          </Routes>
          <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
        </Layout>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
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