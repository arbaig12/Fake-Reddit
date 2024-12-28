import '../stylesheets/postView.css';
import { DataContext } from './dataContext.jsx';
import { AppContext } from './appContext.jsx';
import { ViewContext } from './viewContext.jsx';
import { AuthContext } from './authContext.jsx';

import { ErrorContext } from './errorContext.jsx';


import axios from 'axios';
import React, { useContext } from 'react';
import * as phreddit from './phreddit.js';

function ReplyButton({commentID, upvotes}){
  const viewContext = useContext(ViewContext);
  const appContext = useContext(AppContext);
  const authContext = useContext(AuthContext);

  const errorContext = useContext(ErrorContext);

  const data = useContext(DataContext);

  if (authContext.authState.isGuest){
    return (
      <>
        &nbsp;&nbsp;&#x2022;&nbsp;&nbsp;
        <label>{upvotes} upvotes</label>
      </>
    );
  }

  const handleReplyButton = (commentID) => {
    const foundComment = data.comments.find(
        (comment) =>
          comment._id === commentID   
      );
      appContext.setCurrentComment(foundComment);

    viewContext.setCurrentView('replyForm');
  };

  const handleDownvote = async () => {
    try{
      const postID =  commentID;
      const opUser = appContext.currentPost.postedBy;
      const username = authContext.authState.user.username;
      const voteType = 'downvote';
      const resp = await axios.post('http://localhost:8000/api/vote', {postID, opUser, username, voteType});
      console.log(resp.data);
      data.fetchData();
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
      const postID =  commentID;
      const opUser = appContext.currentPost.postedBy;
      const username = authContext.authState.user.username;
      const voteType = 'upvote';
      const resp = await axios.post('http://localhost:8000/api/vote', {postID, opUser, username, voteType});
      console.log(resp.data);
      data.fetchData();
    }
    catch (error) {
      errorContext.setErrorCall(true);
      viewContext.setPreviousView(viewContext.currentView);
      viewContext.setCurrentView("errorView");
      console.error("Error upvoting post:", error);
    }
  };

// const handleUpvote = async () => {
//   try{
//     const postID =  commentID;
//     const opUser = appContext.currentPost.postedBy;
//     const username = authContext.authState.user.username;
//     const voteType = 'upvote';
//     const resp = await axios.post('http://localhost:8000/api/vote', {postID, opUser, username, voteType});
//     console.log(resp.data);
//     data.fetchData();
//   }
//   catch (error) {
//     console.error("Error upvoting post:", error);
//   }
// };



  return (
      <>
        <button onClick={() => handleReplyButton(commentID)}>Reply</button>
        &nbsp;&nbsp;&#x2022;&nbsp;&nbsp;

        <label>{upvotes} upvotes</label>
        
        &nbsp;&nbsp;&nbsp;&nbsp;

        <button className="upvoteButton" 
        onClick={handleUpvote}
        >⬆</button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <button className="downvoteButton" 
        onClick={handleDownvote}
        >⬇</button>
      </>
  )
}

function CreateCommentLi({ data, user, date, content, commentID, childrenComments, upvotes }) {
    const viewContext = useContext(ViewContext);
    let appContext = useContext(AppContext);

    return (
      <li>
        <div className="commentUserTime">
          <label>{user}</label>
          &nbsp;&nbsp;&#x2022;&nbsp;&nbsp;
          <label>{date}</label>
        </div>
  
        <div className="commentContent">
          <label>{content}</label>
        </div>

        <div className="commentReply">


          <ReplyButton commentID = {commentID} upvotes = {upvotes}/>
        </div>

  
        {/* Recursively render children comments */}
        {childrenComments && childrenComments.length > 0 && (
          <ul className="thread">
            {childrenComments.map((comment, index) => (
              <CreateCommentLi
                data={data}
                key={index}
                user={comment.commentedBy}
                date={phreddit.processDate(Date.parse(comment.commentedDate))}
                content={comment.content}
                commentID={comment._id}
                childrenComments={phreddit.getNestedComments(comment, data.comments)}
                upvotes={comment.upvoteList.length - comment.downvoteList.length}
                />
            ))}
          </ul>
        )}
      </li>
    );
}

function RenderComments({ data, item }) {
  if ( data.loading === true){
    return <p>Loading comments...</p>;
  }
  let sortedComments = phreddit
  .sortNewestComments(data.comments)
  .filter(comment =>
    item.commentIDs.some(commentID => comment._id === commentID)
  );

  return (
      <div className="fullPostComments">
          <ul className="thread">
              {sortedComments.map((comment, index) => (
              <CreateCommentLi
                  key={index}
                  data = {data}
                  user={comment.commentedBy}
                  date={phreddit.processDate(Date.parse(comment.commentedDate))}
                  content={comment.content}
                  commentID={comment._id}
                  childrenComments={phreddit.getNestedComments(comment, data.comments)}
                  upvotes={comment.upvoteList.length - comment.downvoteList.length}
              />
              ))}
          </ul>
      </div>
  );
}

function PostComments(){
    const data = useContext(DataContext);
    const appContext = useContext(AppContext);
    return (
        <RenderComments data={data} item={appContext.currentPost}></RenderComments>
    )
}

export default PostComments;