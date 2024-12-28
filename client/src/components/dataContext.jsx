// import React, { createContext, useState } from 'react';
// import Model from '../models/model.js'; // Import the Model class

// export const DataContext = createContext();

// export const DataProvider = ({ children }) => {
//   const model = new Model();

//   const [data, setData] = useState(model.data);

//   return (
//     <DataContext.Provider value={{ data, setData }}>
//       {children}
//     </DataContext.Provider>
//   );
// };

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
    // State for each data type
    const [linkFlairs, setLinkFlairs] = useState([]);
    const [posts, setPosts] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch function for each data type
    const fetchData = async () => {
        setLoading(true);
        try {
            const [linkFlairRes, postRes, communityRes, commentRes] = await Promise.all([
                axios.get('http://localhost:8000/api/linkflairs'),
                axios.get('http://localhost:8000/api/posts'),
                axios.get('http://localhost:8000/api/communities'),
                axios.get('http://localhost:8000/api/comments')
            ]);

            // Set each state with the fetched data
            setLinkFlairs(linkFlairRes.data);
            setPosts(postRes.data);
            setCommunities(communityRes.data);
            setComments(commentRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <DataContext.Provider value={{
            linkFlairs,
            posts,
            communities,
            comments,
            loading,
            setCommunities,
            fetchData
        }}>
            {children}
        </DataContext.Provider>
    );
};
