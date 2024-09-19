import React, { useEffect, useState } from 'react';
import Exercise from './Exercise';

const Workout = () => {
    const [exercises, setExercises] = useState(''); // State to hold the fetched text
    const [loading, setLoading] = useState(true); // State to track loading status
    const [error, setError] = useState(null); // State to track errors

    useEffect(() => {
        // Define the fetch call inside useEffect
        const fetchText = async () => {
        try {
            const response = await fetch('http://lift-and-shift-env.eba-kekvarn7.us-east-2.elasticbeanstalk.com/exercise/1');
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
    }, []); // Empty dependency array means this effect runs once on component mount

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