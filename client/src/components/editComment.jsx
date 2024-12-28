import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { DataContext } from './dataContext.jsx';
import { AppContext } from './appContext.jsx';
import { ViewContext } from './viewContext.jsx';

import { ErrorContext } from './errorContext.jsx';

import '../stylesheets/main.css';

function isValidComment(content, setContentError) {
    if (content.trim() === "") {
        setContentError(true);
        return false;
    }
    setContentError(false);
    return true;
}

const EditComment = () => {
    const dataContext = useContext(DataContext);
    const viewContext = useContext(ViewContext);
    const appContext = useContext(AppContext);

    const errorContext = useContext(ErrorContext);

    const [contentError, setContentError] = useState(false);
    const [content, setContent] = useState('');

    const comment = dataContext.comments.find(
        (comment) => comment._id === appContext.editID
    );

    useEffect(() => {
        if (comment) {
            setContent(comment.content);
        }
    }, [comment]);

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        if (isValidComment(content, setContentError)) {
            try {
                const response = await axios.post('http://localhost:8000/api/comment/edit', {
                    commentID: comment._id,
                    content: content.trim(),
                });

                console.log('Comment updated:', response.data);

                viewContext.setCurrentView(viewContext.previousView);
            } catch (error) {

                errorContext.setErrorCall(true);
                viewContext.setPreviousView(viewContext.currentView);
                viewContext.setCurrentView("errorView");

                console.error('Error editing comment:', error);
            }
        }
    };

    const deleteComment = async () => {
        try {
            const response = await axios.post('http://localhost:8000/api/comment/delete', {
                commentID: comment._id,
            });

            console.log('Comment deleted:', response.data);

            viewContext.setCurrentView(viewContext.previousView);
        } catch (error) {

            errorContext.setErrorCall(true);
            viewContext.setPreviousView(viewContext.currentView);
            viewContext.setCurrentView("errorView");

            console.error('Error deleting comment:', error);
        }
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
                        placeholder="Edit your comment"
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
                    <button type="submit" id="replySubmit">Edit Comment</button>
                    <button
                        type="button"
                        id="deleteComment"
                        onClick={deleteComment}
                        style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}
                    >
                        Delete Comment
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditComment;
