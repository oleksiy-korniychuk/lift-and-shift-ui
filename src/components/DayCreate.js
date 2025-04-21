import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { supabase } from '../supabase';

const DayCreate = () => {
    const [dayName, setDayName] = useState('');
    const [dayDescription, setDayDescription] = useState('');
    const [error, setError] = useState(null);

    const { block_id } = useParams();
    const { user } = useAuth();

    const saveBlock = async (e) => {
        e.preventDefault();
        try {
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

        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="create-form-container">
            <h2>Create Day</h2>
            <form onSubmit={saveBlock} className="create-form">
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
                <button type="submit" className="create-form-button">Create</button>
            </form>
            {error && <p className="create-form-error">{error}</p>}
        </div>
    )
}

export default DayCreate