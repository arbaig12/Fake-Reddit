import React, { createContext, useState } from 'react';

// Create a context
export const AppContext = createContext();

// Create a provider component
export const AppProvider = ({ children }) => {
  // Initialize your state variables
  const [currentCommunity, setCurrentCommunity] = useState(null);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [currentSort, setCurrentSort] = useState('newest'); // Default value is 'newest'
  const [currentPost, setCurrentPost] = useState(null);
  const [currentComment, setCurrentComment] = useState(null);
  const [numFiltered, setNumFiltered] = useState(0);
  const [editID, setEditID] = useState(null);

  return (
    <AppContext.Provider value={{ 
      currentCommunity, 
      setCurrentCommunity, 
      currentSearchTerm, 
      setCurrentSearchTerm, 
      currentSort, 
      setCurrentSort,
      currentPost,
      setCurrentPost,
      currentComment, 
      setCurrentComment,
      numFiltered,
      setNumFiltered,
      editID,
      setEditID
    }}>
      {children}
    </AppContext.Provider>
  );
};