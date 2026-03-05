import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import Exercise from './Exercise.jsx';
import './SelectList.css';

const Workout = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdhoc, setIsAdhoc] = useState(false);
    const [showAddExercise, setShowAddExercise] = useState(false);
    const [newExerciseName, setNewExerciseName] = useState('');
    const [newExerciseSets, setNewExerciseSets] = useState(3);
    const [newExerciseReps, setNewExerciseReps] = useState(10);
    const [addingExercise, setAddingExercise] = useState(false);

    const { workout_id } = useParams();
    const { user } = useAuth();

    useEffect(() => {
        const getWorkoutData = async () => {
            try {
                setLoading(true);
                
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
                
                // Check if this is an adhoc workout (no day_id)
                const adhoc = !workoutData.day_id;
                setIsAdhoc(adhoc);
                
                if (adhoc) {
                    // For adhoc workouts, get exercises from the log table
                    // by finding unique exercise_ids and getting their names
                    const { data: logData, error: logError } = await supabase
                        .from('log')
                        .select('exercise_id, exercise:exercise_id(name, sets, reps)')
                        .eq('workout_id', workout_id)
                        .order('id');
                    
                    if (logError) throw logError;
                    
                    // Get unique exercises
                    const exerciseMap = new Map();
                    logData.forEach(log => {
                        if (log.exercise_id && !exerciseMap.has(log.exercise_id)) {
                            exerciseMap.set(log.exercise_id, {
                                id: log.exercise_id,
                                name: log.exercise?.name || 'Unknown',
                                sets: log.exercise?.sets || 3,
                                reps: log.exercise?.reps || 10
                            });
                        }
                    });
                    
                    setExercises(Array.from(exerciseMap.values()));
                } else {
                    // Then get all exercises for this day
                    const { data: exercisesData, error: exercisesError } = await supabase
                        .from('exercise')
                        .select('*')
                        .eq('day_id', workoutData.day_id)
                        .order('order', { ascending: true })
                        .order('id');
                    
                    if (exercisesError) throw exercisesError;
                    
                    if (exercisesData) {
                        const sorted = [...exercisesData].sort((a, b) => {
                            const ao = a.order ?? Number.MAX_SAFE_INTEGER;
                            const bo = b.order ?? Number.MAX_SAFE_INTEGER;
                            if (ao !== bo) return ao - bo;
                            return (a.id ?? 0) - (b.id ?? 0);
                        });
                        setExercises(sorted);
                    }
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        getWorkoutData();
    }, [workout_id]);

    const addAdhocExercise = async () => {
        if (!newExerciseName.trim()) return;
        if (newExerciseSets < 1 || newExerciseReps < 1) {
            setError('Sets and reps must be at least 1');
            return;
        }
        
        try {
            setAddingExercise(true);
            setError(null);
            
            // Create the exercise (with null day_id for adhoc)
            const { data: exerciseData, error: exerciseError } = await supabase
                .from('exercise')
                .insert({
                    name: newExerciseName.trim(),
                    day_id: null, // adhoc exercise
                    user_id: user.id,
                    sets: newExerciseSets,
                    reps: newExerciseReps,
                    is_main: false,
                    order: exercises.length + 1
                })
                .select()
                .single();
            
            if (exerciseError) throw exerciseError;
            
            // Create initial log entry for this exercise
            const { error: logError } = await supabase
                .from('log')
                .insert({
                    workout_id: workout_id,
                    exercise_id: exerciseData.id,
                    set_number: 1,
                    user_id: user.id,
                    weight: 0,
                    reps: 0
                });
            
            if (logError) {
                // Roll back exercise creation if log insert fails.
                await supabase
                    .from('exercise')
                    .delete()
                    .eq('id', exerciseData.id)
                    .eq('user_id', user.id);
                throw logError;
            }
            
            // Add to local state
            setExercises(prev => [...prev, {
                id: exerciseData.id,
                name: exerciseData.name,
                sets: exerciseData.sets,
                reps: exerciseData.reps
            }]);
            
            // Reset form
            setNewExerciseName('');
            setNewExerciseSets(3);
            setNewExerciseReps(10);
            setShowAddExercise(false);
        } catch (error) {
            setError(error.message);
        } finally {
            setAddingExercise(false);
        }
    };

    return (
        <div className="Session">
            <div className="create-form-container">
                <h2>Workout Session</h2>
                {isAdhoc && (
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>
                        Adhoc Workout - add exercises as you go
                    </p>
                )}
                
                {loading ? (
                    <p>Loading workout details...</p>
                ) : error ? (
                    <p className="create-form-error">{error}</p>
                ) : exercises.length === 0 ? (
                    <div>
                        <p>No exercises yet.</p>
                    </div>
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
                
                {/* Add Exercise Form for Adhoc Workouts */}
                {isAdhoc && (
                    <>
                        {!showAddExercise ? (
                            <button 
                                className="add-button" 
                                onClick={() => setShowAddExercise(true)}
                                style={{ marginTop: '20px' }}
                            >
                                <span className="add-button-icon">+</span>
                                Add Exercise
                            </button>
                        ) : (
                            <div className="create-form" style={{ marginTop: '20px', padding: '15px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                <h3>Add Exercise</h3>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>
                                        Exercise Name
                                    </label>
                                    <input
                                        type="text"
                                        value={newExerciseName}
                                        onChange={(e) => setNewExerciseName(e.target.value)}
                                        placeholder="e.g., Bench Press"
                                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>
                                            Sets
                                        </label>
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            min={1}
                                            value={newExerciseSets}
                                            onChange={(e) => setNewExerciseSets(parseInt(e.target.value) || 0)}
                                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>
                                            Reps
                                        </label>
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            min={1}
                                            value={newExerciseReps}
                                            onChange={(e) => setNewExerciseReps(parseInt(e.target.value) || 0)}
                                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                        />
                                    </div>
                                </div>
                                <div className="form-buttons">
                                    <button 
                                        className="cancel-button" 
                                        onClick={() => setShowAddExercise(false)}
                                        disabled={addingExercise}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className="create-form-button" 
                                        onClick={addAdhocExercise}
                                        disabled={addingExercise || !newExerciseName.trim()}
                                    >
                                        {addingExercise ? 'Adding...' : 'Add Exercise'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Workout;
