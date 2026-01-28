import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';

import Header from './components/Header.jsx';
import Login from './components/Login.jsx';
import ProgramSelect from './components/ProgramSelect.jsx';
import PrivateRoute from './routes/PrivateRoute.jsx';

import './App.css';
import BlockSelect from './components/BlockSelect.jsx';
import Day from './components/Day.jsx';
import DaySelect from './components/DaySelect.jsx';
import Workout from './components/Workout.jsx';
import WorkoutSelect from './components/WorkoutSelect.jsx';

function App() {
  return (
    <div className='App'>
        <AuthProvider>
            <Router>
                <Header />
                <div className="content-container">
                    <Routes>
                        <Route path="/" element= {<Navigate to="/programs" replace />} />
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/programs"
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
                            path="/workout/:workout_id"
                            element={
                                <PrivateRoute>
                                    <Workout />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/workouts"
                            element={
                                <PrivateRoute>
                                    <WorkoutSelect />
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    </div>
  );
}

export default App;
