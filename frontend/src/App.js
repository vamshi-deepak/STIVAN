import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import Home from './Pages/Home';
import History from './Pages/History';
import Profile from './Pages/Profile';
import AboutUs from './Pages/AboutUs';
import Chat from './Pages/Chat';
import Landing from './Pages/Landing';
import ForgotPassword from './Pages/ForgotPassword';
import CommunityFeed from './Pages/CommunityFeed';
import VisionAnalysis from './Pages/VisionAnalysis';
import Settings from './Pages/Settings';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import FloatingToggleButton from './components/FloatingChat/FloatingToggleButton';
import FloatingChatModal from './components/FloatingChat/FloatingChatModal';
import GooeyNav from './components/GooeyNav/GooeyNav';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const chatModalRef = React.useRef(null);

  useEffect(() => {
    const handleStorageChange = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleToggleChat = () => {
    setChatModalOpen(!chatModalOpen);
    if (!chatModalOpen) {
      document.body.classList.add('floating-chat-open');
    } else {
      document.body.classList.remove('floating-chat-open');
    }
  };

  const handleCloseChat = () => {
    setChatModalOpen(false);
    document.body.classList.remove('floating-chat-open');
  };

  // This component wraps our protected pages to provide the layout
  const ProtectedLayout = () => (
    <>
      <Header setToken={setToken} onChatOpen={handleToggleChat} />
      <main className="main-content">
        <Outlet /> {/* This will render the actual page component */}
      </main>
      <Footer />
      
      {/* Global Floating Chat Components (Only visible when logged in) */}
      <FloatingToggleButton 
        isOpen={chatModalOpen}
        onClick={handleToggleChat}
        unreadCount={0}
      />
      <FloatingChatModal 
        ref={chatModalRef}
        isOpen={chatModalOpen}
        onClose={handleCloseChat}
      />
      
      {/* Gooey Nav - Mobile/Tablet Bottom Navigation */}
      <GooeyNav />
    </>
  );

  return (
    <ErrorBoundary>
      <Router>
        <div className="app-wrapper">
          <Routes>
            {/* Public routes have no layout */}
            <Route path="/login" element={!token ? <Login setToken={setToken} /> : <Navigate to="/home" />} />
            <Route path="/signup" element={!token ? <Signup /> : <Navigate to="/home" />} />
            <Route path="/forgot-password" element={!token ? <ForgotPassword /> : <Navigate to="/home" />} />

            {/* Protected routes are nested inside the layout */}
            <Route element={token ? <ProtectedLayout /> : <Navigate to="/login" />}>
              <Route path="/home" element={<Home />} />
              <Route path="/history" element={<History />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/community" element={<CommunityFeed />} />
              <Route path="/vision" element={<VisionAnalysis />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Root: show Landing intro for everyone; users can click through to the validator */}
            <Route path="/" element={<Landing />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;