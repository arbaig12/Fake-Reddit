import React, { createContext, useState } from 'react';

export const ErrorContext = createContext();


export const ErrorProvider = ({ children }) => {
    const [errorCall, setErrorCall] = useState(false);

    return (
        <ErrorContext.Provider value={{ errorCall, setErrorCall }}>
            {children}
        </ErrorContext.Provider>
    );
};
