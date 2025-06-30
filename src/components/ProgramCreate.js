import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useDeleteConfirmation from '../hooks/useDeleteConfirmation';
import { supabase } from '../supabase';

const ProgramCreate = ({ onProgramCreated, editMode = false, programId = null, initialName = '', initialDescription = '', onCancelEdit, onDelete }) => {
    const [programName, setProgramName] = useState('');
    const [programDescription, setProgramDescription] = useState('');
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const { handleDeleteClick, DeleteConfirmationModal } = useDeleteConfirmation(
        onDelete,
        programId,
        programName
    );

    useEffect(() => {
        if (editMode) {
            setProgramName(initialName);
            setProgramDescription(initialDescription);
        }
    }, [editMode, initialName, initialDescription]);

    const saveProgram = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                // Update existing program
                const { error } = await supabase
                    .from('program')
                    .update({
                        name: programName,
                        description: programDescription
                    })
                    .eq('id', programId)
                    .eq('user_id', user.id);

                if (error) throw error;
                
                // Exit edit mode
                if (onCancelEdit) {
                    onCancelEdit();
                }
            } else {
                // Create new program
                const { error } = await supabase
                    .from('program')
                    .insert([
                        {
                            name: programName,
                            description: programDescription,
                            user_id: user.id
                        }
                    ])
                    .select();

                if (error) throw error;
                // clear form
                setProgramName('');
                setProgramDescription('');
            }

            // Notify parent component to refresh the list
            if (onProgramCreated) {
                onProgramCreated();
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
                <form onSubmit={saveProgram} className="create-form">
                    <div className="form-field">
                        <label>Program Name:</label>
                        <input
                            type="text"
                            value={programName}
                            onChange={(e) => setProgramName(e.target.value)}
                            placeholder="ex. Starting Strength"
                            required
                        />
                    </div>
                    <div className="form-field">
                        <label>Description:</label>
                        <input
                            type="text"
                            value={programDescription}
                            onChange={(e) => setProgramDescription(e.target.value)}
                            placeholder="Program description"
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

export default ProgramCreate