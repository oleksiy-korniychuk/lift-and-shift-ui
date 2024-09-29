import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../constants';
import SelectLine from './SelectLine';
import './SelectList.css';

const ProgramSelect = () => {
    const [programs, setPrograms] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchText = async () => {
            try {
                //TODO: Add app state to store and retrieve user_id after signin
                const response = await fetch(API_URL + '/program?user_id=1', {
                    method: 'GET',
                    credentials: 'include'
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setPrograms(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchText();
    }, []); // Empty dependency array means this effect runs once on component mount

    const selectProgram = (program_id) => {
        navigate(`/blocks/${program_id}`);
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
        </div>
    )
}

export default ProgramSelect