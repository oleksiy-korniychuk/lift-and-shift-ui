import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../constants';
import Exercise from './Exercise';

const Workout = () => {
    const [exercises, setExercises] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { day_id } = useParams();

    useEffect(() => {
        const fetchText = async () => {
        try {
            const response = await fetch(API_URL + '/exercise?day_id=' + day_id, {
                method: 'GET',
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setExercises(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

        fetchText();
    }, [day_id]);

    return (
        <div className='Session'>
            {loading ? 'loading' : (error ? 'error' : 
            exercises.map((exercise, index) => (
                <Exercise
                    key={index}
                    name={exercise.name}
                    sets={exercise.sets}
                    reps={exercise.reps}
                />
            )))}
        </div>
    )
}

export default Workout