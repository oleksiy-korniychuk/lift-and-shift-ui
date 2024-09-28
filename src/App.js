import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import Hello from './components/Hello';
import Login from './components/Login';
import Workout from './components/Workout';
import PrivateRoute from './routes/PrivateRoute';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/hello" element={<Hello />} />
        <Route path="/login" element={<Login />} />
        <Route
            path="/"
            element={
                <PrivateRoute>
                    <Workout />
                </PrivateRoute>
            }
        />
      </Routes>
    </Router>
  );
}

export default App;
