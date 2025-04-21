import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import Exercise from './Exercise';

const Workout = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { workout_id } = useParams();

    useEffect(() => {
        const getWorkoutData = async () => {
            try {
                // First get the workout info to show workout details
                const { data: workoutData, error: workoutError } = await supabase
                    .from('workout')
                    .select(`
                        *,
                        day:day_id(name)
                    `)
                    .eq('id', workout_id)
                    .single();
                
                if (workoutError) throw workoutError;
                
                // Then get all exercises for this day
                const { data: exercisesData, error: exercisesError } = await supabase
                    .from('exercise')
                    .select('*')
                    .eq('day_id', workoutData.day_id)
                    .order('id');
                
                if (exercisesError) throw exercisesError;
                
                if (exercisesData) {
                    setExercises(exercisesData);
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        getWorkoutData();
    }, [workout_id]);

    return (
        <div className="Session">
            <div className="create-form-container">
                <h2>Workout Session</h2>
                {loading ? (
                    <p>Loading workout details...</p>
                ) : error ? (
                    <p className="create-form-error">{error}</p>
                ) : exercises.length === 0 ? (
                    <p>No exercises found for this workout.</p>
                ) : (
                    exercises.map((exercise) => (
                        <Exercise
                            key={exercise.id}
                            name={exercise.name}
                            sets={exercise.sets}
                            reps={exercise.reps}
                            workoutId={workout_id}
                            exerciseId={exercise.id}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default Workout;