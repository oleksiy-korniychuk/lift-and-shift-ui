import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import SelectLine from './SelectLine';
import './SelectList.css';

const WorkoutSelect = () => {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWorkouts = async () => {
            try {
                const { data: workoutData, error } = await supabase
                    .from('workout')
                    .select(`
                        *,
                        program:program_id(name),
                        day:day_id(name)
                    `)
                    .eq('user_id', user.id)
                    .order('workout_date', { ascending: false });
                
                if (error) throw error;
                
                setWorkouts(workoutData);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkouts();
    }, [user]);

    const selectWorkout = (workout_id) => {
        navigate(`/workout/${workout_id}`);
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className='list'> 
            <h2>Workouts</h2>
            <p>select a workout</p>
            {loading ? 'loading' : (error ? 'error' : 
                workouts.map((workout) => (
                    <SelectLine
                        key={workout.id}
                        id={workout.id}
                        name={`${formatDate(workout.workout_date)} - ${workout.day.name}`}
                        description={workout.notes || `${workout.program.name}`}
                        clickHandler={selectWorkout}
                    />
                ))
            )}
        </div>
    );
};

export default WorkoutSelect;