import '../stylesheets/postView.css';
import React, { useContext } from 'react';
import * as phreddit from './phreddit.js';
import PostComments from './postComments.jsx';
import { DataContext } from './dataContext.jsx';
import { AppContext } from './appContext.jsx';
import { ViewContext } from './viewContext.jsx';

import { ErrorContext } from './errorContext.jsx';

import { AuthContext } from './authContext.jsx';
import axios from 'axios';


function CreateVoteButton() {
    const dataContext = useContext(DataContext);
    const appContext = useContext(AppContext);
    const authContext = useContext(AuthContext);

    const viewContext = useContext(ViewContext);
    const errorContext = useContext(ErrorContext);



    if (authContext.authState.isGuest) {
        return (
            <div className="fullPostViewComment">
                <label>{appContext.currentPost.views} views</label>
                &nbsp;&nbsp;&#x2022;&nbsp;&nbsp;
                <label>{phreddit.getAllPostComments(appContext.currentPost, dataContext.comments).length} comments</label>
                &nbsp;&nbsp;&#x2022;&nbsp;&nbsp;
                <label>{appContext.currentPost.upvoteList.length - appContext.currentPost.downvoteList.length} upvotes</label>
            </div>
        );
    }

    const handleDownvote = async () => {
        try{
            const postID =  appContext.currentPost._id;
            const opUser = appContext.currentPost.postedBy;
            const username = authContext.authState.user.username;
            const voteType = 'downvote';
            const resp = await axios.post('http://localhost:8000/api/vote', {postID, opUser, username, voteType});
            console.log(resp);
            dataContext.fetchData();
            appContext.setCurrentPost(resp.data.updatedPost);
        }
        catch (error){

            errorContext.setErrorCall(true);
            viewContext.setPreviousView(viewContext.currentView);
            viewContext.setCurrentView("errorView");

            console.error("Error downvoting post:", error);
        }
    }

    const handleUpvote = async () => {
        try{
            const postID =  appContext.currentPost._id;
            const opUser = appContext.currentPost.postedBy;
            const username = authContext.authState.user.username;
            const voteType = 'upvote';
            const resp = await axios.post('http://localhost:8000/api/vote', {postID, opUser, username, voteType});
            dataContext.fetchData();
            appContext.setCurrentPost(resp.data.updatedPost);
        }
        catch (error){

            errorContext.setErrorCall(true);
            viewContext.setPreviousView(viewContext.currentView);
            viewContext.setCurrentView("errorView");

            console.error("Error upvoting post:", error);
        }
        
    };

    return (
        <div className="fullPostViewComment">
            <label>{appContext.currentPost.views} views</label>

            &nbsp;&nbsp;&#x2022;&nbsp;&nbsp;
            
            <label>{phreddit.getAllPostComments(appContext.currentPost, dataContext.comments).length} comments</label>
            &nbsp;&nbsp;&#x2022;&nbsp;&nbsp;

            <label>{appContext.currentPost.upvoteList.length - appContext.currentPost.downvoteList.length} upvotes</label>

            &nbsp;&nbsp;&nbsp;&nbsp;

            <button className="upvoteButton" 
            onClick={handleUpvote}
            >⬆</button>

            &nbsp;&nbsp;&nbsp;&nbsp;

            <button className="downvoteButton" 
            onClick={handleDownvote}
            >⬇</button>
        </div>
    );
}


function CreateCommentButton(){
    const viewContext = useContext(ViewContext);
    const authContext = useContext(AuthContext);
    if (authContext.authState.isGuest){
        return;
    }

    const handleCommentButton = () => {
        viewContext.setCurrentView('commentForm');
    };

    return (
        <div className="fullPostAddComment">
            <button onClick={() => handleCommentButton()}
                >Add a comment</button>
        </div>
    )
}

function PostView(){
    const dataContext = useContext(DataContext);
    const appContext = useContext(AppContext);

    return (
        <div id="postView" className="view">
            <div className="fullPost">
                <div className="fullPostCommunityTime">
                    <label>{phreddit.getPostCommunity(appContext.currentPost, dataContext.communities).name}</label>
                    &nbsp;&nbsp;&#x2022;&nbsp;&nbsp;
                    <label>{phreddit.processDate(Date.parse(appContext.currentPost.postedDate))}</label>
                    </div>

                    <div className="fullPostUser">
                    {appContext.currentPost.postedBy}
                    </div>

                    <div className="fullPostTitle">
                    {appContext.currentPost.title}
                    </div>

                    <div className="fullPostLinkFlair">
                    {phreddit.getLinkFlair(appContext.currentPost, dataContext.linkFlairs)}
                    </div>

                    <div className="fullPostContent">
                    {appContext.currentPost.content}
                    </div>

                    <CreateVoteButton />
                    <CreateCommentButton />
            </div>

            <PostComments />
        </div>
    )
}

export default PostView;