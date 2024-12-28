import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // The authorization state, contains if loggedin, if a guest, and a full user object representing the user that is logged in.
    const [authState, setAuthState] = useState({
        isLoggedIn: false,
        isGuest: false,
        user: null,
    });

    const [user, setUser] = useState(null);

    // this uses the local state to see if the user was logged in as a guest or user in the past.
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const storedGuest = JSON.parse(localStorage.getItem('guest'));

        if (storedGuest) {
            setAuthState({
                isLoggedIn: false,
                isGuest: true,
                user: null,
            });
        } else if (storedUser) {
            setAuthState({
                isLoggedIn: true,
                isGuest: false,
                user: storedUser,
            });
        }
    }, []);

    // function to login using the login api. returns the user obect if successfully logged in.
    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:8000/api/login', { email, password });
            const { user } = response.data;

            setAuthState({
                isLoggedIn: true,
                isGuest: false,
                user,
            });
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.removeItem('guest');
        } catch (error) {
            console.error('Login failed:', error.response?.data || error.message);
            throw error;
        }
    };

    // function to logout. essentially removes the auth state.
    const logout = () => {
        setAuthState({
            isLoggedIn: false,
            isGuest: false,
        });
        localStorage.removeItem('user');
        localStorage.removeItem('guest');
    };

    // continue as a guest by changing the isguest boolean. 
    const continueAsGuest = () => {
        setAuthState({
            isLoggedIn: false,
            isGuest: true,
            user: null,
        });
        localStorage.setItem('guest', JSON.stringify(true));
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ authState, user, setUser, login, logout, continueAsGuest }}>
            {children}
        </AuthContext.Provider>
    );
};
