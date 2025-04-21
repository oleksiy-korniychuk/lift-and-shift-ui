import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { supabase } from '../supabase';

const BlockCreate = ({ onBlockCreated }) => {
    const [blockNumber, setBlockNumber] = useState(0);
    const [blockDescription, setBlockDescription] = useState('');
    const [error, setError] = useState(null);

    const { program_id } = useParams();
    const { user } = useAuth();

    const saveBlock = async (e) => {
        e.preventDefault();
        try {
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
            
            // Notify parent component to refresh the list
            if (onBlockCreated) {
                onBlockCreated();
            }

        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="create-form-container">
            <h2>Create Block</h2>
            <form onSubmit={saveBlock} className="create-form">
                <div className="form-field">
                    <label>Block Number:</label>
                    <input
                        type="number"
                        value={blockNumber === 0 ? '' : blockNumber}
                        placeholder="ex. 1"
                        onChange={(e) => setBlockNumber(parseInt(e.target.value))}
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
                    />
                </div>
                <button type="submit" className="create-form-button">Create</button>
            </form>
            {error && <p className="create-form-error">{error}</p>}
        </div>
    )
}

export default BlockCreate