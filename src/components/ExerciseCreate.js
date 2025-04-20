import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { supabase } from '../supabase';

const ExerciseCreate = () => {
    const [name, setName] = useState('');
    const [isMain, setIsMain] = useState(false);
    const [sets, setSets] = useState(0);
    const [reps, setReps] = useState(0);
    const [notes, setNotes] = useState('');
    const [error, setError] = useState(null);

    const { day_id } = useParams();
    const { user } = useAuth();

    const saveBlock = async (e) => {
        e.preventDefault();
        try {
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
                        notes: notes
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

        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div>
            <h2>Create Exercise</h2>
            <form onSubmit={saveBlock}>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Main Exercise:</label>
                    <input
                        type="checkbox"
                        value={isMain}
                        onChange={(e) => setIsMain(e.target.checked)}
                    />
                </div>
                <div>
                    <label>Sets:</label>
                    <input
                        type="number"
                        value={sets}
                        onChange={(e) => setSets(parseInt(e.target.value))}
                        required
                    />
                </div>
                <div>
                    <label>Reps:</label>
                    <input
                        type="number"
                        value={reps}
                        onChange={(e) => setReps(parseInt(e.target.value))}
                    />
                </div>
                <div>
                    <label>Notes:</label>
                    <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>
                <button type="submit">Create</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    )
}

export default ExerciseCreate