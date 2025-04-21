import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import ExerciseCreate from './ExerciseCreate';
import SelectLine from './SelectLine';
import './SelectList.css';

const Day = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dayName, setDayName] = useState('');

    const { user } = useAuth();
    const { day_id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                // Fetch exercises related to the day_id
                const { data: exercisesData, error: exercisesError } = await supabase
                    .from('exercise')
                    .select('*, day:day_id(*)')
                    .eq('day_id', day_id);
                
                if (exercisesError) throw exercisesError;
                
                if (exercisesData && exercisesData.length > 0) {
                    setExercises(exercisesData);
                    setDayName(exercisesData[0].day.name);
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchExercises();
    }, [day_id]);

    const startWorkout = async () => {
        // create workout and pass new id to worlout page
        let workout_id;
        try {
            const { data: dayData, error: dayError } = await supabase
            .from('day')
            .select('id, block_id, block:block_id(program_id)')
            .eq('id', day_id)
            .single();

            if (dayError) throw dayError;
            const { block_id, block: { program_id } } = dayData;

            const { data: workoutData, error: workoutError } = await supabase
                .from('workout')
                .insert([
                    {
                        program_id: program_id,
                        block_id: block_id,
                        day_id: day_id,
                        workout_date: new Date(),
                        user_id: user.id
                    }
                ])
                .select();

            if (workoutError) throw workoutError;
            workout_id = workoutData[0].id;

            exercises.forEach(async exercise => {
                const { error: logError } = await supabase
                .from('log')
                .insert([
                    {
                        workout_id: parseInt(workout_id),
                        user_id: user.id,
                        exercise_id: exercise.id,
                        set_number: 1,
                        reps: 0,
                        weight: 0
                    }
                ]);
                
                if (logError) throw logError;
            });
        }
        catch (error) {
            setError(error.message);
        }

        navigate(`/workout/${workout_id}`);
    }

    return (
        <div className="Session">
            <div className="create-form-container">
                <h2>{dayName}</h2>
                {loading ? (
                    <p>Loading exercises...</p>
                ) : error ? (
                    <p className="create-form-error">{error}</p>
                ) : exercises.length === 0 ? (
                    <p>No exercises found for this day.</p>
                ) : (
                    <>
                        <p>Exercise list</p>
                        {exercises.map((exercise) => (
                            <SelectLine
                                key={exercise.id}
                                id={exercise.id}
                                name={exercise.name}
                                description={`${exercise.sets} sets × ${exercise.reps} reps${exercise.notes ? ` • ${exercise.notes}` : ''}`}
                                clickHandler={() => {}}
                            />
                        ))}
                        <button className="create-form-button" onClick={startWorkout}>Start Workout</button>
                    </>
                )}
            </div>
            <ExerciseCreate />
        </div>
    );
}

export default Day