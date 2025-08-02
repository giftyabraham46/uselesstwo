import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  return (
    <header className="App-header">
      <h1>🌳 Tree Calculator</h1>
      <p>AI-powered tree dimension and foliage analysis</p>
      <nav className="nav-links">
        <Link 
          to="/" 
          className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
        >
          Upload Images
        </Link>
        <Link 
          to="/sessions" 
          className={`nav-link ${location.pathname === '/sessions' ? 'active' : ''}`}
        >
          My Sessions
        </Link>
      </nav>
    </header>
  );
};

export default Header;
