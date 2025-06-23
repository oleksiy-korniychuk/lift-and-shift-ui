import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { supabase } from '../supabase';

const DayCreate = ({ onDayCreated, editMode = false, dayId = null, initialName = '', initialDescription = '', onCancelEdit }) => {
    const [dayName, setDayName] = useState('');
    const [dayDescription, setDayDescription] = useState('');
    const [error, setError] = useState(null);

    const { block_id } = useParams();
    const { user } = useAuth();

    useEffect(() => {
        if (editMode) {
            setDayName(initialName);
            setDayDescription(initialDescription);
        }
    }, [editMode, initialName, initialDescription]);

    const saveDay = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                // Update existing day
                const { error } = await supabase
                    .from('day')
                    .update({
                        name: dayName,
                        description: dayDescription
                    })
                    .eq('id', dayId)
                    .eq('user_id', user.id);

                if (error) throw error;
                
                // Exit edit mode
                if (onCancelEdit) {
                    onCancelEdit();
                }
            } else {
                // Create new day
                const { error } = await supabase
                    .from('day')
                    .insert([
                        {
                            block_id: block_id,
                            user_id: user.id,
                            name: dayName,
                            description: dayDescription
                        }
                    ])
                    .select();

                if (error) throw error;
                // clear form
                setDayName('');
                setDayDescription('');
            }

            // Notify parent component to refresh the list
            if (onDayCreated) {
                onDayCreated();
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
        <div>
            <form onSubmit={saveDay} className="create-form">
                <div className="form-field">
                    <label>Day Name:</label>
                    <input
                        type="text"
                        value={dayName}
                        onChange={(e) => setDayName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-field">
                    <label>Description:</label>
                    <input
                        type="text"
                        value={dayDescription}
                        onChange={(e) => setDayDescription(e.target.value)}
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
                </div>
            </form>
            {error && <p className="create-form-error">{error}</p>}
        </div>
    )
}

export default DayCreate