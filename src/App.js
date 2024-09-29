import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import Hello from './components/Hello';
import Login from './components/Login';
import ProgramSelect from './components/ProgramSelect';
import PrivateRoute from './routes/PrivateRoute';

import './App.css';
import BlockSelect from './components/BlockSelect';
import Day from './components/Day';
import DaySelect from './components/DaySelect';
import Workout from './components/Workout';

function App() {
  return (
    <div className='App'>
        <Router>
            <Routes>
                <Route path="/hello" element={<Hello />} />
                <Route path="/login" element={<Login />} />
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <ProgramSelect />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/blocks/:program_id"
                    element={
                        <PrivateRoute>
                            <BlockSelect />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/days/:block_id"
                    element={
                        <PrivateRoute>
                            <DaySelect />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/day/:day_id"
                    element={
                        <PrivateRoute>
                            <Day />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/workout/:day_id"
                    element={
                        <PrivateRoute>
                            <Workout />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </Router>
    </div>
  );
}

export default App;
