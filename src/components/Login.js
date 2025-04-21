import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await signIn(email, password);
      navigate('/programs');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="content-container">
      <div className="create-form-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin} className="create-form">
          <div className="form-field">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="create-form-button">Login</button>
        </form>
        {error && <p className="create-form-error">{error}</p>}
      </div>
    </div>
  );
}

export default Login;