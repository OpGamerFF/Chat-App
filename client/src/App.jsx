import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Messenger from './pages/Messenger';
import Feed from './pages/Feed';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }) => {
  const { user, accessToken, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-900 transition-colors">
      <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin"></div>
    </div>
  );
  
  if (!accessToken) return <Navigate to="/login" />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { accessToken, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-900 transition-colors">
      <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin"></div>
    </div>
  );
  
  if (accessToken) return <Navigate to="/" />;
  return children;
};

import MainLayout from './components/MainLayout';

import Reels from './pages/Reels';
import Profile from './pages/Profile';

import Archive from './pages/Archive';

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Routes>
                      <Route index element={<Home />} />
                      <Route path="/messages" element={<Messenger />} />
                      <Route path="/feed" element={<Feed />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/reels" element={<Reels />} />
                      <Route path="/profile/:id" element={<Profile />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/archive" element={<Archive />} />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
