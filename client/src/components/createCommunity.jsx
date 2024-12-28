import React, { useState, useContext } from 'react';
import axios from 'axios';
import { DataContext } from './dataContext.jsx';
import { ViewContext } from './viewContext.jsx';
import { AuthContext } from './authContext.jsx';

import { ErrorContext } from './errorContext.jsx';


import '../stylesheets/main.css';

function isValidCom(communityName, description, setNameError, setDescriptionError) {
    let isValid = true;
    if (communityName.trim() === "") {
        setNameError(true);
        isValid = false;
    } else {
        setNameError(false);
    }

    if (description.trim() === "") {
        setDescriptionError(true);
        isValid = false;
    } else {
        setDescriptionError(false);
    }

    return isValid;
}

const CommunityForm = () => {
    const viewContext = useContext(ViewContext);
    const dataContext = useContext(DataContext);
    const authContext = useContext(AuthContext);

    const errorContext = useContext(ErrorContext);

    let user = authContext.authState.user;

    const [communityName, setCommunityName] = useState('');
    const [description, setDescription] = useState('');
    // const [username, setUsername] = useState('');

    const [nameError, setNameError] = useState(false);
    const [duplicateError, setDuplicateError] = useState(false);
    const [descriptionError, setDescriptionError] = useState(false);
    // const [usernameError, setUsernameError] = useState(false);

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        console.log(dataContext.communities);


        if (isValidCom(communityName, description, setNameError, setDescriptionError)) {
            if (dataContext.communities.some((community) => community.name === communityName.trim())) {
                setDuplicateError(true);
                return;
            }
            else{
                setDuplicateError(false);
            }

            const newCommunity = {
                name: communityName.trim(),
                description: description.trim(),
                members: [user.username.trim()],
                startDate: new Date(),
                createdBy: user.username.trim(),
            };

            try {
                const response = await axios.post('http://localhost:8000/api/communities', newCommunity);
                const createdCommunityID = response.data._id;
                await axios.post('http://localhost:8000/api/joinCommunity', { username: user.username, communityID: createdCommunityID });

                dataContext.fetchData();
          
                // Reset form fields
                setCommunityName('');
                setDescription('');
                // setUsername('');

                // Change view context to go back to home or show the new community
                viewContext.setCurrentView("homeView");
            } catch (error) {
                errorContext.setErrorCall(true);
                viewContext.setPreviousView(viewContext.currentView);
                viewContext.setCurrentView("errorView");
                console.error("Error creating community:", error);
            }
        }
    };

    return (
        <div className="main">
            <div id="form1" className="view">
                <form id="commyForm" onSubmit={handleFormSubmit}>
                    <label htmlFor="name">*Community Name:</label>
                    <br />
                    <input
                        type="text"
                        id="fname"
                        placeholder="Name"
                        value={communityName}
                        onChange={(e) => setCommunityName(e.target.value)}
                        maxLength="100"
                    />
                    <br />
                    {nameError && (
                        <span id="nameError" className="error-message" style={{ color: 'red' }}>
                            Community name cannot be empty.
                        </span>
                    )}
                    {duplicateError && (
                        <span id="nameError" className="error-message" style={{ color: 'red' }}>
                            Community name already used.
                        </span>
                    )}

                    <br />

                    <label htmlFor="description">*Community Description:</label>
                    <br />
                    <textarea
                        id="description"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        maxLength="500"
                        style={{ width: '500px', height: '150px' }}
                    />
                    <br />
                    {descriptionError && (
                        <span id="descriptionError" className="error-message" style={{ color: 'red' }}>
                            Description cannot be empty.
                        </span>
                    )}
                    <br />

                    <button type="submit" id="clicky">
                        Engender Community
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CommunityForm;