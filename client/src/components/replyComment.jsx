import React, { useState, useContext } from 'react';
import { DataContext } from './dataContext.jsx';
import { AppContext } from './appContext.jsx';
import { ViewContext } from './viewContext.jsx';
import { AuthContext } from './authContext.jsx'

import { ErrorContext } from './errorContext.jsx';


import '../stylesheets/main.css';
import axios from 'axios';
import { getPostCommunity } from './phreddit.js';


function isValidComment(content, setContentError) {
    let isValid = true;

    if (content.trim() === "") {
        setContentError(true);
        isValid = false;
    } else {
        setContentError(false);
    }

    return isValid;
}

const AddReply = () => {
    const data = useContext(DataContext);
    const viewContext = useContext(ViewContext);
    const authContext = useContext(AuthContext);

    const errorContext = useContext(ErrorContext);

    const {currentComment} = useContext(AppContext);
    const {currentPost, setCurrentPost} = useContext(AppContext);

    const commentID = data.comments.find((comment) =>
        comment._id === currentComment._id)._id;

    const post = data.posts.find((post) =>
        post._id === currentPost._id);

    let communityID = getPostCommunity(post,data.communities)?._id || null;
    let username = authContext.authState.user.username;

    const [content, setContent] = useState('');

    const [contentError, setContentError] = useState(false);

    const handleFormSubmit = async (event) => {
        event.preventDefault();
       
        if (isValidComment(content, setContentError)) {
            const newComment = {
                content: content.trim(),
                commentIDs: [],
                commentedBy: username.trim(),
                commentedDate: new Date(),
                commentID: commentID,
                communityID: communityID,
                upvotes:0,
                upvoteList:[],
                downvoteList:[],
            };

            try {
                const response = await axios.post('http://localhost:8000/api/reply', newComment);
                await axios.post('http://localhost:8000/api/joinCommunity', { username: username, communityID: communityID });

                // Update views
                data.fetchData();
                viewContext.setCurrentView("postView");
            }
            catch (error) {
                errorContext.setErrorCall(true);
                viewContext.setPreviousView(viewContext.currentView);
                viewContext.setCurrentView("errorView");
                console.error("Error creating comment:", error);
            }
            
            setContent('');     
            // setUsername('');

        };
    };

    return (
        <div>
            <div id="form3" className="view">
                <form id="commentForm" onSubmit={handleFormSubmit}>
                    <label htmlFor="commentContent">*Content:</label>
                    <br />
                    <textarea
                        name="description"
                        id="commentContent"
                        placeholder="Post Content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{ width: '300px', height: '100px' }}
                        maxLength="500"
                    />
                    <br />
                    {contentError && (
                        <span id="contError" className="error-message" style={{ color: 'red' }}>
                            Content cannot be empty.
                        </span>
                    )}
                    <br />

                    <button type="submit" id="replySubmit">Submit Comment</button>
                </form>
            </div>
        </div>
    );
};

export default AddReply;