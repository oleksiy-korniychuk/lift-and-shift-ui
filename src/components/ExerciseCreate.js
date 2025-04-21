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
        <div className="create-form-container">
            <h2>Create Exercise</h2>
            <form onSubmit={saveBlock} className="create-form">
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
                        value={sets === 0 ? '' : sets}
                        placeholder="ex. 3"
                        onChange={(e) => setSets(parseInt(e.target.value))}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        required
                    />
                </div>
                <div className="form-field">
                    <label>Reps:</label>
                    <input
                        type="number"
                        value={reps === 0 ? '' : reps}
                        placeholder="ex. 10"
                        onChange={(e) => setReps(parseInt(e.target.value))}
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
                <button type="submit" className="create-form-button">Create</button>
            </form>
            {error && <p className="create-form-error">{error}</p>}
        </div>
    )
}

export default ExerciseCreate