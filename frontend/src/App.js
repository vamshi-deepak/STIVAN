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
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const handleStorageChange = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // This component wraps our protected pages to provide the layout
  const ProtectedLayout = () => (
    <>
      <Header setToken={setToken} />
      <main className="main-content">
        <Outlet /> {/* This will render the actual page component */}
      </main>
      <Footer />
    </>
  );

  return (
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
          </Route>

          {/* Root: show Landing intro for everyone; users can click through to the validator */}
          <Route path="/" element={<Landing />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;