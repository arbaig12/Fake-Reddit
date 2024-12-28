import '../stylesheets/main.css'; 
import { React, useContext, useState } from 'react';  
import axios from 'axios';
import { DataContext } from './dataContext.jsx';
import { ViewContext } from './viewContext.jsx';
import { AuthContext } from './authContext.jsx';

import { ErrorContext } from './errorContext.jsx';


import * as phreddit from './phreddit.js';

function checkPostFormError(communityName, setCommunityError, postTitle, setTitleError, flair1, flair2, setFlairError, postContent, setContentError){
    let isValid = true;

    if (communityName === '') {
        setCommunityError(true);
        isValid = false;
    } else {
        setCommunityError(false);
    }

    if (postTitle === '') {
        setTitleError(true);
        isValid = false;
    } else {
        setTitleError(false);
    }

    if(flair1 !== '' && flair2.trim() !== ''){
        setFlairError(true);
        isValid = false;
    } else {
        setFlairError(false);
    }

    if (postContent === '') {
        setContentError(true);
        isValid = false;
    } else {
        setContentError(false);
    }

    return isValid;
}

function createNewPost(communityName, postTitle, flair1, flair2, postContent, username, data){
    const postCommunityID = data.communities.find((community) =>
        community.name === communityName)._id;

    if (postCommunityID) {
        if (flair1 === '' && flair2.trim() !== '') {
            const newFlair = {
                content: flair2.trim(),
            };

            const newPost = {
                title: postTitle.trim(),
                content: postContent.trim(),
                postedBy: username.trim(),
                postedDate: new Date(),
                commentIDs: [],
                views: 0,
                communityID: postCommunityID
            }

            return [newPost, newFlair];
        }else{
            const newPost = {
                title: postTitle.trim(),
                content: postContent.trim(),
                linkFlairID: phreddit.getLinkFlairIdByContent(flair1, data.linkFlairs),
                postedBy: username.trim(),
                postedDate: new Date(),
                commentIDs: [],
                views: 0,
                communityID: postCommunityID
            }

            return [newPost, null];
        }
    }
    return null;
}

const CreatePostForm = () => {
    const viewContext = useContext(ViewContext);
    const dataContext = useContext(DataContext);
    const authContext = useContext(AuthContext);

    const errorContext = useContext(ErrorContext);

    
    let user = authContext.authState.user;

    const [communityName, setCommunityName] = useState('');
    const [postTitle, setPostTitle] = useState('');
    const [flair1, setFlair1] = useState('');
    const [flair2, setFlair2] = useState('');
    const [postContent, setPostContent] = useState('');

    
    const [communityError, setCommunityError] = useState(false);
    const [titleError, setTitleError] = useState(false);
    const [flairError, setFlairError] = useState(false);
    const [contentError, setContentError] = useState(false);

    const handleSubmitClick = async (e) => {
        e.preventDefault();  

        if (checkPostFormError(communityName, setCommunityError, postTitle, setTitleError, flair1, flair2,
             setFlairError, postContent, setContentError)) {
            
            const [newPost, newFlair] = createNewPost(communityName, postTitle, flair1, flair2, postContent, user.username, dataContext)  

            if (newFlair !== null){
                try {
                    const response = await axios.post('http://localhost:8000/api/linkflairs', newFlair);
                    newPost.linkFlairID = response.data._id;
                    // errorContext.setErrorCall(true);
                    // viewContext.setPreviousView(viewContext.currentView);
                    // viewContext.setCurrentView("errorView");  Test code to see if error page works
                }
                catch (error) {
                    errorContext.setErrorCall(true);
                    viewContext.setPreviousView(viewContext.currentView);
                    viewContext.setCurrentView("errorView");
                    console.error("Error creating community:", error);
                }
            }

            try {
                const response = await axios.post('http://localhost:8000/api/posts', newPost);
                const createdPost = response.data;

                // Update the local state directly
                const updatedCommunities = dataContext.communities.map(community => {
                    if (community.name === communityName) {
                        return {
                            ...community,
                            postIDs: [...community.postIDs, createdPost._id]
                        };
                    }
                    return community;
                });
                dataContext.setCommunities(updatedCommunities);

                let communityID = phreddit.getPostCommunity(createdPost, updatedCommunities)._id;
                await axios.post('http://localhost:8000/api/joinCommunity', { username: user.username, communityID: communityID });
                dataContext.fetchData();                

            } catch (error) {

                errorContext.setErrorCall(true);
                viewContext.setPreviousView(viewContext.currentView);
                viewContext.setCurrentView("errorView");

                console.error("Error creating post:", error);
            }

            dataContext.fetchData();

            viewContext.setCurrentView("homeView");
        }
    };

  // Filter communities based on the user's communities
  let sortedCommunities = dataContext.communities;

  if (authContext.authState.user) {
    let userCommunities = dataContext.communities.filter((community) => 
      community.members.includes(authContext.authState.user.username)
    )

    let otherCommunities = dataContext.communities.filter((community) => 
      !community.members.includes(authContext.authState.user.username)
    )

      sortedCommunities = [...userCommunities, ...otherCommunities];
  }


    return (
        <div className="main">
            <div id="form2" className="view">
                <form id="postForm" onSubmit={handleSubmitClick}>
                    <label htmlFor="communitySelect"> *Community: </label>
                    <br />
                    <select 
                        name="Comm" 
                        id="communitySelect" 
                        value={communityName} 
                        onChange={(e) => setCommunityName(e.target.value)} 
                        title="Select a community"
                    >
                        <option value="">Select a community</option>
                        {sortedCommunities.map((community, index) => (
                            <option key={index} value={community.communityID}>
                                {community.name}
                            </option>
                        ))}
                    </select>
                    <br />
                    {communityError && (
                        <span id="communitySelectError" className="error-message" style={{ color: 'red' }}>
                            Must Choose Community
                        </span>
                    )}
                    <br />

                    <label htmlFor="title"> *Post Title: </label>
                    <br />
                    <input 
                        type="text" 
                        name="postTitle" 
                        id="postTitle" 
                        value={postTitle} 
                        onChange={(e) => setPostTitle(e.target.value)} 
                        placeholder="Title" 
                        maxLength="100" 
                    />
                    <br />
                    {titleError && (
                        <span id="titleError" className="error-message" style={{ color: 'red' }}>
                            Input cannot be empty
                        </span>
                    )}
                    <br />

                    <label htmlFor="selectFlair"> LinkFlair: </label>
                    <br />
                    <select 
                        name="selectFlair" 
                        id="selectFlair" 
                        value={flair1} 
                        onChange={(e) => setFlair1(e.target.value)} 
                        title="Select a LinkFlair"
                    >
                        <option value="">Select a LinkFlair</option>
                        {dataContext.linkFlairs.map((linkFlair, index) => (
                            <option key={index} value={linkFlair.linkFlairID}>
                                {linkFlair.content}
                            </option>
                        ))}
                    </select>
                    <br />or<br />
                    <input 
                        type="text" 
                        id="flairBox" 
                        value={flair2} 
                        onChange={(e) => setFlair2(e.target.value)} 
                        placeholder="Type your linkflair..." 
                        maxLength="30" 
                    />
                    <br />
                    {flairError && (
                        <span id="flairError" className="error-message" style={{ color: 'red' }}>
                            Cannot Select Custom & Pre-Existing
                        </span>
                    )}
                    <br />

                    <label htmlFor="postContent"> *Post Content: </label>
                    <br />
                    <textarea 
                        name="description" 
                        id="pcontent" 
                        value={postContent} 
                        onChange={(e) => setPostContent(e.target.value)} 
                        placeholder="Post Content" 
                        style={{ width: '200px', height: '100px' }}
                    ></textarea>
                    <br />
                    {contentError && (
                        <span id="contentError" className="error-message" style={{ color: 'red' }}>
                            Input cannot be empty
                        </span>
                    )}
                    <br />
                    <button type="submit" id="pfbutton">Submit Post</button>
                </form>
            </div>
        </div>
    );
};

export default CreatePostForm;