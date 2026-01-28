import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import './DraggableList.css';
import DraggableList from './DraggableList.jsx';
import './DraggableSelectLine.css';
import DraggableSelectLine from './DraggableSelectLine.jsx';
import ExerciseCreate from './ExerciseCreate.jsx';
import Modal from './Modal.jsx';
import './SelectList.css';

const Day = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dayName, setDayName] = useState('');
    const [editingExercise, setEditingExercise] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReorderMode, setIsReorderMode] = useState(false);

    const { user } = useAuth();
    const { day_id } = useParams();
    const navigate = useNavigate();

    const fetchExercises = useCallback(async () => {
        try {
            // Fetch exercises related to the day_id
            const { data: exercisesData, error: exercisesError } = await supabase
                .from('exercise')
                .select('*, day:day_id(*)')
                .eq('day_id', day_id)
                .order('order', { ascending: true, nullsFirst: false });
            
            if (exercisesError) throw exercisesError;
            
            if (exercisesData && exercisesData.length > 0) {
                setExercises(exercisesData);
                setDayName(exercisesData[0].day.name);
            } else {
                // If no exercises, fetch just the day name
                const { data: dayData, error: dayError } = await supabase
                    .from('day')
                    .select('name')
                    .eq('id', day_id)
                    .single();
                
                if (dayError) throw dayError;
                setDayName(dayData.name);
                setExercises([]);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [day_id]);

    useEffect(() => {
        fetchExercises();
    }, [fetchExercises]);

    const openCreateModal = () => {
        setEditingExercise(null);
        setIsModalOpen(true);
    }

    const editExercise = (id) => {
        const exerciseToEdit = exercises.find(ex => ex.id === id);
        if (exerciseToEdit) {
            setEditingExercise({
                id,
                name: exerciseToEdit.name,
                isMain: exerciseToEdit.is_main,
                sets: exerciseToEdit.sets,
                reps: exerciseToEdit.reps,
                notes: exerciseToEdit.notes
            });
            setIsModalOpen(true);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingExercise(null);
    };

    const handleExerciseSaved = () => {
        fetchExercises();
        closeModal();
    }

    const deleteExercise = async (id) => {
        try {
            const { error } = await supabase
                .from('exercise')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) throw error;
            fetchExercises();
            closeModal();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleExerciseReorder = async (reorderedExercises) => {
        try {
            // Update local state immediately for better UX
            setExercises(reorderedExercises);

            // Update order in database
            const updates = reorderedExercises.map((exercise, index) => ({
                id: exercise.id,
                order: index + 1
            }));

            for (const update of updates) {
                const { error } = await supabase
                    .from('exercise')
                    .update({ order: update.order })
                    .eq('id', update.id)
                    .eq('user_id', user.id);

                if (error) throw error;
            }
        } catch (error) {
            setError(error.message);
            // Revert to original order on error
            fetchExercises();
        }
    };

    const toggleReorderMode = () => {
        setIsReorderMode(!isReorderMode);
    };

    const renderExerciseItem = (exercise) => (
        <DraggableSelectLine
            key={exercise.id}
            id={exercise.id}
            name={exercise.name}
            description={`${exercise.sets} sets × ${exercise.reps} reps${exercise.notes ? ` • ${exercise.notes}` : ''}`}
            clickHandler={() => {}}
            onEdit={editExercise}
        />
    );

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
                        <div className="exercise-list-header">
                            <p>Exercise list</p>
                            <button 
                                className={`reorder-button ${isReorderMode ? 'active' : ''}`}
                                onClick={toggleReorderMode}
                            >
                                {isReorderMode ? (
                                    <>
                                        ✓ Done
                                    </>
                                ) : (
                                    <>
                                        ⋮⋮ Reorder
                                    </>
                                )}
                            </button>
                        </div>
                        <div className={`draggable-container ${isReorderMode ? 'reorder-mode' : ''}`}>
                            <DraggableList
                                items={exercises}
                                onReorder={handleExerciseReorder}
                                renderItem={renderExerciseItem}
                                keyExtractor={(exercise) => exercise.id}
                                isReorderMode={isReorderMode}
                            />
                        </div>
                        <button className="create-form-button" onClick={startWorkout}>Start Workout</button>
                    </>
                )}

                <button className="add-button" onClick={openCreateModal}>
                    <span className="add-button-icon">+</span>
                    Add Exercise
                </button>
            </div>

            <Modal 
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingExercise ? "Edit Exercise" : "Create Exercise"}
            >
                <ExerciseCreate 
                    onExerciseCreated={handleExerciseSaved}
                    editMode={!!editingExercise}
                    exerciseId={editingExercise?.id}
                    initialName={editingExercise?.name || ''}
                    initialIsMain={editingExercise?.isMain || false}
                    initialSets={editingExercise?.sets || 0}
                    initialReps={editingExercise?.reps || 0}
                    initialNotes={editingExercise?.notes || ''}
                    onCancelEdit={closeModal}
                    onDelete={deleteExercise}
                />
            </Modal>
        </div>
    );
}

export default Day;