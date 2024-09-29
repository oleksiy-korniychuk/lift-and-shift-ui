import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../constants';

const Day = () => {
    const [exercises, setExercises] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { day_id } = useParams();
    const navigate = useNavigate();

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

    const startWorkout = (day_id) => {
        navigate(`/workout/${day_id}`);
    }

    return (
        <div className='list'>
            <h2>Day: {!loading && exercises[1].day.name}</h2>
            <p>select a program</p>
            {loading ? 'loading' : (error ? 'error' : 
            exercises.map((exercise, index) => (
                <div className='line' key={exercise.id}>
                    <h3>{exercise.name}</h3>
                    <p>{exercise.sets} sets of {exercise.reps} reps</p>
                    <p>{exercise.notes}</p>
                </div>
            )))}
            <button onClick={() => startWorkout(day_id)}>Start Workout</button>
        </div>
    )
}

export default Day