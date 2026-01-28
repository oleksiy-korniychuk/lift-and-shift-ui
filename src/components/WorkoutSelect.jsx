import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
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

    const WorkoutRow = ({ workout }) => {
        const formattedName = `${formatDate(workout.workout_date)} - ${workout.day.name}`;

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
                    description={workout.notes || `${workout.program.name}`}
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
