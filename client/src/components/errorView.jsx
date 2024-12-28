
import React, { useContext } from 'react';
import { DataContext } from './dataContext.jsx';
import { AppContext } from './appContext.jsx';
import { ViewContext } from './viewContext.jsx';
import { AuthContext } from './authContext.jsx';
import { ErrorContext } from './errorContext.jsx';


import '../stylesheets/main.css'; 

const ErrorView = () => {
    const dataContext = useContext(DataContext);
    const authContext = useContext(AuthContext);    
    const viewContext = useContext(ViewContext);
    const errorContext = useContext(ErrorContext);


    const returnPreviousButton = () => {
        errorContext.setErrorCall(false);
        viewContext.setCurrentView(viewContext.previousView);
        viewContext.setPreviousView('errorView');
        console.log('Returning to the previous page');
    };

    const returnWelcomeButton = () => {
        errorContext.setErrorCall(false);
        viewContext.setPreviousView('errorView');
        authContext.logout();
        console.log('Returning to the home page');
    };

    return (
        <div className="error-page">
            <h1>Sorry, we encountered an error</h1>
            <div className="buttons-container">
                <p>What would you like to do?</p>
                <button
                    className="button back-button"
                    onClick={returnPreviousButton}
                >
                    Return to Previous Page
                </button>
                <button
                    className="button home-button"
                    onClick={returnWelcomeButton}
                >
                    Return Home
                </button>
            </div>
        </div>
    );
};

export default ErrorView;
