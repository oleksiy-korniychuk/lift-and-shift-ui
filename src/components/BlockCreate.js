import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { supabase } from '../supabase';

const BlockCreate = () => {
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

        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div>
            <h2>Create Block</h2>
            <form onSubmit={saveBlock}>
                <div>
                <label>Block Number:</label>
                <input
                    type="number"
                    value={blockNumber}
                    onChange={(e) => setBlockNumber(parseInt(e.target.value))}
                    required
                />
                </div>
                <div>
                <label>Description:</label>
                <input
                    type="text"
                    value={blockDescription}
                    onChange={(e) => setBlockDescription(e.target.value)}
                />
                </div>
                <button type="submit">Create</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    )
}

export default BlockCreate