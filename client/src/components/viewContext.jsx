import React, { createContext, useState } from 'react';

export const ViewContext = createContext();

export const ViewProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('homeView');
  const [userToView, setUserToView] = useState(null);
  const [previousView, setPreviousView] = useState(null);

  return (
    <ViewContext.Provider value={{ 
        currentView,
        setCurrentView,
        userToView,
        setUserToView,
        previousView,
        setPreviousView
    }}>
      {children}
    </ViewContext.Provider>
  );
};