import React, { createContext, useState } from 'react';

export const CurrentContext = createContext();

export const CurrentProvider = ({ children }) => {
  const [currentCommunity, setCurrentCommunity] = useState(null);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [currentSort, setCurrentSort] = useState('newest');
  const [currentPost, setCurrentPost] = useState(null);
  const [currentComment, setCurrentComment] = useState(null);
  const [numFiltered, setNumFiltered] = useState(0);

  return (
    <CurrentContext.Provider value={{ 
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
      setNumFiltered
    }}>
      {children}
    </CurrentContext.Provider>
  );
};