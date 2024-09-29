import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../constants';
import SelectLine from './SelectLine';
import './SelectList.css';

const Day = () => {
    const [days, setDays] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { block_id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchText = async () => {
        try {
            const response = await fetch(API_URL + '/day?block_id=' + block_id, {
                method: 'GET',
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setDays(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

        fetchText();
    }, [block_id]);

    const selectDay = (day_id) => {
        navigate(`/day/${day_id}`);
    }

    return (
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
    )
}

export default Day