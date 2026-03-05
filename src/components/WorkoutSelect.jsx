import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useDeleteConfirmation from '../hooks/useDeleteConfirmation.jsx';
import { supabase } from '../supabase';
import SelectLine from './SelectLine.jsx';
import './SelectList.css';

const WorkoutSelect = () => {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchWorkouts = useCallback(async () => {
        try {
            setLoading(true);
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
            setError(null);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchWorkouts();
    }, [fetchWorkouts]);

    const selectWorkout = (workout_id) => {
        navigate(`/workout/${workout_id}`);
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const createAdhocWorkout = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('workout')
                .insert({
                    workout_date: new Date().toISOString(),
                    user_id: user.id,
                    notes: 'Adhoc Workout'
                })
                .select()
                .single();
            
            if (error) throw error;
            
            if (data) {
                navigate(`/workout/${data.id}`);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const WorkoutRow = ({ workout }) => {
        // Handle adhoc workouts (no day_id) vs planned workouts
        const isAdhoc = !workout.day_id;
        const formattedName = isAdhoc 
            ? `${formatDate(workout.workout_date)} - Adhoc Workout`
            : `${formatDate(workout.workout_date)} - ${workout.day?.name || 'Unknown Day'}`;
        
        const description = workout.notes || (isAdhoc ? 'Quick workout' : (workout.program?.name || ''));

        const deleteWorkout = async (workoutId) => {
            try {
                await supabase
                    .from('log')
                    .delete()
                    .eq('workout_id', workoutId)
                    .eq('user_id', user.id);
                await supabase
                    .from('workout')
                    .delete()
                    .eq('id', workoutId)
                    .eq('user_id', user.id);
                await fetchWorkouts();
            } catch (err) {
                setError(err.message);
            }
        };

        const { handleDeleteClick, DeleteConfirmationModal } = useDeleteConfirmation(
            deleteWorkout,
            workout.id,
            formattedName
        );

        return (
            <>
                <SelectLine
                    key={workout.id}
                    id={workout.id}
                    name={formattedName}
                    description={description}
                    clickHandler={selectWorkout}
                    onDelete={editMode ? () => handleDeleteClick() : undefined}
                />
                <DeleteConfirmationModal />
            </>
        );
    };

    return (
        <div className='list'> 
            <div className="list-header">
                <h2>Workouts</h2>
                <button
                    className="edit-toggle-button"
                    onClick={() => setEditMode((v) => !v)}
                >
                    {editMode ? 'Done' : 'Edit'}
                </button>
            </div>
            
            {/* Adhoc Workout Button */}
            <button 
                className="add-button" 
                onClick={createAdhocWorkout}
                disabled={loading}
                style={{ marginBottom: '20px', backgroundColor: 'var(--accent-color)' }}
            >
                <span className="add-button-icon">+</span>
                Start Adhoc Workout
            </button>
            
            <p>select a workout</p>
            {loading ? 'loading' : (error ? 'error' : 
                workouts.map((workout) => (
                    <WorkoutRow key={workout.id} workout={workout} />
                ))
            )}
        </div>
    );
};

export default WorkoutSelect;
