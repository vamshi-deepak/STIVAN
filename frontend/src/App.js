import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import Home from './Pages/Home';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  // optional: sync with localStorage
  useEffect(() => {
    const handleStorageChange = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={token ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/login" 
          element={token ? <Navigate to="/home" replace /> : <Login setToken={setToken} />} 
        />
        <Route 
          path="/signup" 
          element={token ? <Navigate to="/home" replace /> : <Signup setToken={setToken} />} 
        />
        <Route 
          path="/home" 
          element={token ? <Home setToken={setToken} /> : <Navigate to="/login" replace />} 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
