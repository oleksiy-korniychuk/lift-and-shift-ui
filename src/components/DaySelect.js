import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import DayCreate from './DayCreate';
import SelectLine from './SelectLine';
import './SelectList.css';

const Day = () => {
    const [days, setDays] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { block_id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchText = async () => {
            try {
                const { data: days, error } = await supabase
                    .from('day')
                    .select('*')
                    .eq('block_id', block_id)
                    .eq('user_id', user.id);
                if (error) throw error;

                setDays(days);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchText();
    }, [block_id, user]);

    const selectDay = (day_id) => {
        navigate(`/day/${day_id}`);
    }

    return (
        <div>
            <div className='list'>
                <h2>Days</h2>
                <p>select a day</p>
                {loading ? 'loading' : (error ? 'error' : 
                days.map((day) => (
                    <SelectLine
                        key={day.id}
                        id={day.id}
                        name={day.name}
                        description={day.description}
                        clickHandler={selectDay}
                    />
                )))}
            </div>
            <DayCreate/>
        </div>
    )
}

export default Day