import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { supabase } from '../supabase';

const BlockCreate = ({ onBlockCreated, editMode = false, blockId = null, initialBlockNumber = 0, initialDescription = '', onCancelEdit }) => {
    const [blockNumber, setBlockNumber] = useState(0);
    const [blockDescription, setBlockDescription] = useState('');
    const [error, setError] = useState(null);

    const { program_id } = useParams();
    const { user } = useAuth();

    useEffect(() => {
        if (editMode) {
            setBlockNumber(initialBlockNumber);
            setBlockDescription(initialDescription);
        }
    }, [editMode, initialBlockNumber, initialDescription]);

    const saveBlock = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                // Update existing block
                const { error } = await supabase
                    .from('block')
                    .update({
                        block_number: blockNumber,
                        description: blockDescription
                    })
                    .eq('id', blockId)
                    .eq('user_id', user.id);

                if (error) throw error;
                
                // Exit edit mode
                if (onCancelEdit) {
                    onCancelEdit();
                }
            } else {
                // Create new block
                const { error } = await supabase
                    .from('block')
                    .insert([
                        {
                            program_id: program_id,
                            user_id: user.id,
                            block_number: blockNumber,
                            description: blockDescription
                        }
                    ])
                    .select();

                if (error) throw error;
                
                // clear form
                setBlockNumber(0);
                setBlockDescription('');
            }
            
            // Notify parent component to refresh the list
            if (onBlockCreated) {
                onBlockCreated();
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
            <form onSubmit={saveBlock} className="create-form">
                <div className="form-field">
                    <label>Block Number:</label>
                    <input
                        type="number"
                        value={blockNumber === 0 ? '' : blockNumber}
                        placeholder="ex. 1"
                        onChange={(e) => setBlockNumber(parseInt(e.target.value) || 0)}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        required
                    />
                </div>
                <div className="form-field">
                    <label>Description:</label>
                    <input
                        type="text"
                        value={blockDescription}
                        onChange={(e) => setBlockDescription(e.target.value)}
                        placeholder="Block description"
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

export default BlockCreate