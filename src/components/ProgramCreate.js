import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';

const ProgramCreate = ({ onProgramCreated }) => {
    const [programName, setProgramName] = useState('');
    const [programDescription, setProgramDescription] = useState('');
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const saveProgram = async (e) => {
        e.preventDefault();
        try {
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

            // Notify parent component to refresh the list
            if (onProgramCreated) {
                onProgramCreated();
            }

        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="create-form-container">
            <h2>Create Program</h2>
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
                <button type="submit" className="create-form-button">Create</button>
            </form>
            {error && <p className="create-form-error">{error}</p>}
        </div>
    )
}

export default ProgramCreate