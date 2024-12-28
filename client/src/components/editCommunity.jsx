import React, { useState, useContext } from 'react';
import axios from 'axios';
import { DataContext } from './dataContext.jsx';
import { ViewContext } from './viewContext.jsx';
import { AuthContext } from './authContext.jsx';
import { AppContext } from './appContext.jsx';

import { ErrorContext } from './errorContext.jsx';


import { useEffect } from 'react';
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

const EditCommunity = () => {
    const viewContext = useContext(ViewContext);
    const dataContext = useContext(DataContext);
    const authContext = useContext(AuthContext);
    const appContext = useContext(AppContext);

    const errorContext = useContext(ErrorContext);

    let user = authContext.authState.user;

    const [communityName, setCommunityName] = useState('');
    const [description, setDescription] = useState('');

    const [nameError, setNameError] = useState(false);
    const [duplicateError, setDuplicateError] = useState(false);
    const [descriptionError, setDescriptionError] = useState(false);

    const community = dataContext.communities.find(
        (community) => community._id === appContext.editID
    );

    useEffect(() => {
        if (community) {
            setCommunityName(community.name);
            setDescription(community.description);
        }
    }, [community]);

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        if (isValidCom(communityName, description, setNameError, setDescriptionError)) {

            if (dataContext.communities.some((community) => community.name === communityName.trim() && community._id !== appContext.editID)) {
                setDuplicateError(true);
                return;
            }
            else{
                setDuplicateError(false);
            }

            try {
                const response = await axios.post('http://localhost:8000/api/communities/edit',{
                    communityID: community._id,
                    editedName: communityName.trim(),
                    editedDescription: description.trim()
                });

                dataContext.fetchData();
                setCommunityName('');
                setDescription('');

                // Change view context to go back to home or show the new community
                viewContext.setCurrentView(viewContext.previousView);
            } catch (error) {

                errorContext.setErrorCall(true);
                viewContext.setPreviousView(viewContext.currentView);
                viewContext.setCurrentView("errorView");

                console.error("Error creating community:", error);
            }
        }
    };

    const deleteCommunity = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this community?");
        if (!confirmed) {
            return;
        }

        try{
            const response = await axios.post('http://localhost:8000/api/communities/delete', {
                communityID: community._id
            });

            dataContext.fetchData();
            viewContext.setCurrentView(viewContext.previousView);
        }
        catch (error){

            errorContext.setErrorCall(true);
            viewContext.setPreviousView(viewContext.currentView);
            viewContext.setCurrentView("errorView");

            console.error("Error deleting community:", error);
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
                        Edit Community
                    </button>

                    <button
                        type="button"
                        id="deleteCommunity"
                        onClick={deleteCommunity}
                        style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}
                    >
                        Delete Community
                    </button>

                </form>
            </div>
        </div>
    );
};

export default EditCommunity;