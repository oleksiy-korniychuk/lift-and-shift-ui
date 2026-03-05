import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useDeleteConfirmation from '../hooks/useDeleteConfirmation.jsx';

import { supabase } from '../supabase';

const ExerciseCreate = ({ onExerciseCreated, editMode = false, exerciseId = null, initialName = '', initialIsMain = false, initialSets = 0, initialReps = 0, initialNotes = '', onCancelEdit, onDelete }) => {
    const [name, setName] = useState('');
    const [isMain, setIsMain] = useState(false);
    const [sets, setSets] = useState(0);
    const [reps, setReps] = useState(0);
    const [notes, setNotes] = useState('');
    const [error, setError] = useState(null);

    const { day_id } = useParams();
    const { user } = useAuth();

    const { handleDeleteClick, DeleteConfirmationModal } = useDeleteConfirmation(
        onDelete,
        exerciseId,
        name
    );

    useEffect(() => {
        if (editMode) {
            setName(initialName);
            setIsMain(initialIsMain);
            setSets(initialSets);
            setReps(initialReps);
            setNotes(initialNotes);
        }
    }, [editMode, initialName, initialIsMain, initialSets, initialReps, initialNotes]);

    const saveExercise = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                // Update existing exercise
                const { error } = await supabase
                    .from('exercise')
                    .update({
                        name: name,
                        is_main: isMain,
                        sets: sets,
                        reps: reps,
                        notes: notes
                    })
                    .eq('id', exerciseId)
                    .eq('user_id', user.id);

                if (error) throw error;
                
                // Exit edit mode
                if (onCancelEdit) {
                    onCancelEdit();
                }
            } else {
                // Get the next order number for new exercise
                const { data: maxOrderData, error: maxOrderError } = await supabase
                    .from('exercise')
                    .select('order')
                    .eq('day_id', day_id)
                    .eq('user_id', user.id)
                    .order('order', { ascending: false })
                    .limit(1);

                if (maxOrderError) throw maxOrderError;

                const nextOrder = maxOrderData && maxOrderData.length > 0 
                    ? (maxOrderData[0].order || 0) + 1 
                    : 1;

                // Create new exercise
                const { error } = await supabase
                    .from('exercise')
                    .insert([
                        {
                            day_id: day_id,
                            user_id: user.id,
                            name: name,
                            is_main: isMain,
                            sets: sets,
                            reps: reps,
                            notes: notes,
                            order: nextOrder
                        }
                    ])
                    .select();

                if (error) throw error;
                // clear form
                setName('');
                setIsMain(false);
                setSets(0);
                setReps(0);
                setNotes('');
            }

            // Notify parent component to refresh the list
            if (onExerciseCreated) {
                onExerciseCreated();
            }

        } catch (error) {
            setError(error.message);
        }
    };

    const handleCancel = () => {
        if (onCancelEdit) {
            onCancelEdit();
        }
    };

    return (
        <>
            <div>
                <form onSubmit={saveExercise} className="create-form">
                    <div className="form-field">
                        <label>Name:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="checkbox-field">
                        <input
                            type="checkbox"
                            id="isMain"
                            checked={isMain}
                            onChange={(e) => setIsMain(e.target.checked)}
                        />
                        <label htmlFor="isMain">Main Exercise</label>
                    </div>
                    <div className="form-field">
                        <label>Sets:</label>
                        <input
                            type="number"
                            min={1}
                            value={sets === 0 ? '' : sets}
                            placeholder="ex. 3"
                            onChange={(e) => setSets(parseInt(e.target.value) || 0)}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            required
                        />
                    </div>
                    <div className="form-field">
                        <label>Reps:</label>
                        <input
                            type="number"
                            min={1}
                            value={reps === 0 ? '' : reps}
                            placeholder="ex. 10"
                            onChange={(e) => setReps(parseInt(e.target.value) || 0)}
                            inputMode="numeric"
                            pattern="[0-9]*"
                        />
                    </div>
                    
                    <div className="form-field">
                        <label>Notes:</label>
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                    <div className="form-buttons">
                        <button type="submit" className="create-form-button">
                            {editMode ? 'Save' : 'Create'}
                        </button>
                        {editMode && (
                            <button type="button" className="cancel-button" onClick={handleCancel}>
                                Cancel
                            </button>
                        )}
                        {editMode && onDelete && (
                            <button type="button" className="delete-button" onClick={handleDeleteClick}>
                                Delete
                            </button>
                        )}
                    </div>
                </form>
                {error && <p className="create-form-error">{error}</p>}
            </div>

            <DeleteConfirmationModal />
        </>
    )
}

export default ExerciseCreate
