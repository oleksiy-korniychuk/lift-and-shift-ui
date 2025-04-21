import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProgramCreate from './ProgramCreate';
import SelectLine from './SelectLine';

import { supabase } from '../supabase';
import './SelectList.css';

const ProgramSelect = () => {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchPrograms = useCallback(async () => {
        try {
            setLoading(true);
            const { data: programs, error } = await supabase
                .from('program')
                .select('*')
                .eq('user_id', user.id);
            if (error) throw error;
            setPrograms(programs);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchPrograms();
    }, [fetchPrograms]);

    const selectProgram = (program_id) => {
        navigate(`/blocks/${program_id}`);
    }

    const goToWorkoutHistory = () => {
        navigate('/workouts');
    }

    return (
        <div className='list'> 
            <h2>Programs</h2>
            <p>select a program</p>
            {loading ? 'loading' : (error ? 'error' : 
            programs.map((program) => (
                <SelectLine
                    key={program.id}
                    id={program.id}
                    name={program.name}
                    description={program.description}
                    clickHandler={selectProgram}
                />
            )))}

            <ProgramCreate onProgramCreated={fetchPrograms} />

            <button 
                className="workout-history-btn" 
                onClick={goToWorkoutHistory}
            >
                View Workout History
            </button>
        </div>
    )
}

export default ProgramSelect