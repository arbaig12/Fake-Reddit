import React, { useState, useContext } from 'react';
import { AuthContext } from './authContext';
import { ViewContext } from './viewContext';

import { ErrorContext } from './errorContext.jsx';


import '../stylesheets/welcome.css';

function Register({ setUserRegister }) {
    const viewContext = useContext(ViewContext);
    const errorContext = useContext(ErrorContext);

    const [first, setFirst] = useState('');
    const [last, setLast] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    // Helper function to validate email format
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Helper function to validate password rules
    const isPasswordValid = (password, first, last, username, email) => {
        const emailId = email.split('@')[0]; // Extract email ID (before @)
        const lowerPassword = password.toLowerCase();

        return (
            !lowerPassword.includes(first.toLowerCase()) &&
            !lowerPassword.includes(last.toLowerCase()) &&
            !lowerPassword.includes(username.toLowerCase()) &&
            !lowerPassword.includes(emailId.toLowerCase())
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // validation
        if (password !== confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        if (!isValidEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        if (!isPasswordValid(password, first, last, username, email)) {
            setError(
                'Password must not contain your first name, last name, username, or email ID.'
            );
            return;
        }

        // Send data to the server
        try {
            const response = await fetch('http://localhost:8000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ first, last, email, username, password }),
            });

            if (response.ok) {
                setUserRegister(false);
            } else {
                const data = await response.json();
                setError(data.message || 'Error creating account');
            }
        } catch (err) {
            errorContext.setErrorCall(true);
            viewContext.setPreviousView(viewContext.currentView);
            viewContext.setCurrentView("errorView");
            setError('Error creating account. Please try again later.');
        }
    };

    return (
        <div id="registerDiv">
            {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
            <form onSubmit={handleSubmit} className="auth-form">
                <input
                    type="text"
                    placeholder="First Name"
                    value={first}
                    onChange={(e) => setFirst(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={last}
                    onChange={(e) => setLast(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <button type="submit">Create Account</button>
            </form>
        </div>
    );
}

function Login(){
    const viewContext = useContext(ViewContext);

    const errorContext = useContext(ErrorContext);

    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await login(email, password);
            viewContext.setCurrentView('homeView');
        } catch (err) {
            errorContext.setErrorCall(true);
            viewContext.setPreviousView(viewContext.currentView);
            viewContext.setCurrentView("errorView");
            setError('Invalid email or password!');
        }
    }

    return(
        <div id="loginDiv">
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">
                        Login
                    </button>
                </form>
        </div>
    )
}

function Options({showLogin, showRegister}){
    const { continueAsGuest } = useContext(AuthContext);
    return (
        <div className='button-container'>
            <button onClick={showLogin} >Login</button>
            <button onClick={showRegister}> Register</button>
            <button onClick={continueAsGuest}>Continue As Guest</button>
        </div>
    )
}

export default function Welcome(){
    const [userLogin, setUserLogin] = useState('');
    const [userRegister, setUserRegister] = useState('');

    const showLogin = () => {
        setUserLogin(true);
        setUserRegister(false);
    }

    const showRegister = () => {
        setUserLogin(false);
        setUserRegister(true);
    }

    const cancel = () => {
        setUserLogin(false);
        setUserRegister(false);
    }

    function Back(){
        return (
            <button onClick={cancel}>Back</button>
        )
    }

    return(
        <>
        <div className="welcome-background">
            <div className="welcome-container">
                <h1 id="welcomeText">Welcome to Phreddit!</h1>
                <div className="button-container">
                    {(!userRegister && !userLogin) && <Options showLogin={showLogin} showRegister={showRegister} />}
                    {(userRegister || userLogin) && <Back />}
                    {userRegister && <Register setUserRegister={setUserRegister}/>}
                    {userLogin && <Login />}
                </div>
            </div>
        </div>
        </>
    )
}