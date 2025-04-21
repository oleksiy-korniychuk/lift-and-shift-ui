import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import DayCreate from './DayCreate';
import SelectLine from './SelectLine';
import './SelectList.css';

const DaySelect = () => {
    const [days, setDays] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { block_id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchDays = useCallback(async () => {
        try {
            setLoading(true);
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
    }, [block_id, user]);

    useEffect(() => {
        fetchDays();
    }, [fetchDays]);

    const selectDay = (day_id) => {
        navigate(`/day/${day_id}`);
    }

    return (
        <div className="Session">
            <div className="create-form-container">
                <h2>Days</h2>
                {loading ? (
                    <p>Loading days...</p>
                ) : error ? (
                    <p className="create-form-error">{error}</p>
                ) : (
                    <>
                        <p>Select a day</p>
                        {days.map((day) => (
                            <SelectLine
                                key={day.id}
                                id={day.id}
                                name={day.name}
                                description={day.description}
                                clickHandler={selectDay}
                            />
                        ))}
                    </>
                )}
            </div>
            <DayCreate onDayCreated={fetchDays}/>
        </div>
    )
}

export default DaySelect