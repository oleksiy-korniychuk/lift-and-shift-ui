import React, { useState } from 'react';
import { API_URL } from '../constants';

const Hello = () => {
    const [helloText, setHelloText] = useState('');
    const [tokenValid, setTokenValid] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState('');

    const fetchHello = async () => {
        try {
            const response = await fetch(API_URL + '/hello', {
                method: 'GET'
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.text();
            setHelloText(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const validate = async () => {
        try {
            const response = await fetch(API_URL + '/auth/validate', {
                method: 'GET',
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setTokenValid(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='Hello'>
            <button onClick={fetchHello}>Hello?</button>
            {error && <p>{error}</p>}
            {loading ? <p>Loading...</p> : <p>{helloText}</p>}
            <button onClick={validate}>Validate</button>
            {loading ? <p>Loading...</p> : <p>tokenValid: {tokenValid.toString()}</p>} 
        </div>
    )
}

export default Hello