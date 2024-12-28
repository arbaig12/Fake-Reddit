import React, { useState, useContext } from 'react';
import axios from 'axios';
import { DataContext } from './dataContext.jsx';
import { AppContext } from './appContext.jsx';
import { ViewContext } from './viewContext.jsx';
import { AuthContext } from './authContext.jsx';
import { ErrorContext } from './errorContext.jsx';

import '../stylesheets/main.css';
import * as phreddit from './phreddit.js';


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


const AddComment = () => {
    const data = useContext(DataContext);
    const viewContext = useContext(ViewContext);
    const {currentPost, setCurrentPost} = useContext(AppContext);
    const authContext = useContext(AuthContext);

    const errorContext = useContext(ErrorContext);


    const post = data.posts.find((post) =>
        post._id === currentPost._id);

    const postID = post._id;

    let username = authContext.authState.user.username;
    let communityID = phreddit.getPostCommunity(post,data.communities)?._id || null;
    const [content, setContent] = useState('');
    // const [username, setUsername] = useState('');

    const [contentError, setContentError] = useState(false);
    // const [usernameError, setUsernameError] = useState(false);

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        if (isValidComment(content, setContentError)) {
            const newComment = {
                content: content.trim(),
                commentIDs: [],
                commentedBy: username.trim(),
                commentedDate: new Date(),
                postID: postID,
                communityID: communityID,
                upvotes: 0,
                upvoteList:[],
                downvoteList:[],
            };
            // update comments
            try {
                const response = await axios.post('http://localhost:8000/api/comment', newComment);
                const createdComment = response.data; // This should have the new comment with an ID
                await axios.post('http://localhost:8000/api/joinCommunity', { username: username, communityID: communityID });


                // Update currentPost with the new comment ID
                const updatedPost = {
                    ...currentPost,
                    commentIDs: [...currentPost.commentIDs, createdComment._id] // Add the new comment ID
                };

                console.log(updatedPost);

                setCurrentPost(updatedPost);
                viewContext.setCurrentView("postView");
                data.fetchData();
                // Update views
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

export default AddComment;