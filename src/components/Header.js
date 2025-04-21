import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show back button on home routes
  const isRootRoute = 
    location.pathname === '/' || 
    location.pathname === '/programs' || 
    location.pathname === '/login';

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <header className="header">
      <div className="header-left">
        {!isRootRoute && (
          <button onClick={handleBack} className="nav-button back-button">
            ← Back
          </button>
        )}
      </div>
      
      <Link to="/" className="header-title">
        Lift and Shift
      </Link>
      
      <div className="header-nav">
        {user ? (
          <>
            <Link to="/workouts" className="nav-button">History</Link>
            <button onClick={signOut} className="nav-button">Logout</button>
          </>
        ) : (
          <Link to="/login" className="nav-button">Login</Link>
        )}
      </div>
    </header>
  );
};

export default Header;