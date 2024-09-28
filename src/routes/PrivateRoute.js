import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { API_URL } from '../constants';

const PrivateRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    const checkAuth = async () => {
        try {
            const response = await fetch(API_URL + '/auth/validate', {
                method: 'GET',
                credentials: 'include'
            });

            if(response.ok) {
                const isValid = await response.json();
                setIsAuthenticated(isValid);
            }
            else {
                setIsAuthenticated(false);
            }
        }
        catch(error) {
            setIsAuthenticated(false);
            console.error('Error checking authentication', error);
        }
    }

    useEffect(() => {
        checkAuth();
    }, []);

    if(isAuthenticated === null) {
        return <div>Loading...</div>
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;