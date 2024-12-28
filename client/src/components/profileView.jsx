import { useContext, useEffect } from 'react';
import { AuthContext } from './authContext.jsx';
import { DataContext } from './dataContext.jsx';
import { AppContext } from './appContext.jsx';
import { ViewContext } from './viewContext.jsx';

import { ErrorContext } from './errorContext.jsx';


import { useState } from 'react';
import * as phreddit from './phreddit.js';
import '../stylesheets/profileView.css';

function CreatePostLi({ post, communityName, username, timeStamp, title, linkFlair, content, viewCount, commentCount, upvoteCount }) {
    const appContext = useContext(AppContext);
    const viewContext = useContext(ViewContext);
    console.log(post);
    const openPost = async () => {
      appContext.setEditID(post._id);
      viewContext.setPreviousView("profileView");
      viewContext.setCurrentView("editPost");
    };
  
    return (
      <li 
      onClick={openPost}
      >
        <div className="post">
          <div className="postHeader">
            <div className="postCommunityName">
              <label>{communityName}</label>
            </div>
  
            &nbsp;&nbsp;•&nbsp;&nbsp;
              
            <div className="postTimeStamp">
              <label>{timeStamp}</label>
            </div>
          </div>
  
          <div className="postDetails">
            <div className="postTitle">
              <label>{title}</label>
            </div>
  
            <div className="postLinkFlair">
              <label>{linkFlair}</label>
            </div>
          </div>
          
          <div className="postCounts">
            <div className="viewCount">
              <label>{viewCount} views</label>
            </div>
  
            &nbsp;&nbsp;•&nbsp;&nbsp;
  
            <div className="commentCount">
              <label>{commentCount} comments</label>
            </div>
  
            &nbsp;&nbsp;•&nbsp;&nbsp;
  
            <div className="upvoteCount">
              <label>{upvoteCount} upvotes</label>
            </div>
            
          </div>
        </div>
      </li>
    );
}

function CreateCommunityLi({ community }) {  
    const viewContext = useContext(ViewContext);
    const appContext = useContext(AppContext);

    const handleCommunityClick = () => {
      appContext.setEditID(community._id);
      viewContext.setPreviousView("profileView");
      viewContext.setCurrentView("editCommunity");
    };

    return (
        <li className="communityLi" 
        key={community._id}
        onClick={handleCommunityClick}
        >
            <label 
                className="profileCommunityItem" 
            >
                p/{community.name}
            </label>
        </li>
    );
}

function CreateCommentLi({ data, user, date, content, commentID, commentPost }) {
    const viewContext = useContext(ViewContext);
    const dataContext = useContext(DataContext);
    let appContext = useContext(AppContext);

    const handleCommentClick = () => {
      appContext.setEditID(commentID);
      viewContext.setPreviousView("profileView");
      viewContext.setCurrentView("editComment");
    }

    return (
      <li className="commentItem" onClick={handleCommentClick}>
        <div className="commentHeader">
          <div className="commentPostTitle">
            <label>Commented on <b>{commentPost.title}</b> in <b>p/{phreddit.getPostCommunity(commentPost, dataContext.communities).name}</b></label>
          </div>

          &nbsp;&nbsp;•&nbsp;&nbsp;

          <div className="commentUserTime">
            <label>{date}</label>
          </div>
        </div>
  
        <div className="commentContent">
          <label>{content}</label>
        </div>
      </li>
    );
}

function ProfilePosts({username}){
    const dataContext = useContext(DataContext);

    let posts = phreddit.sortNewest(dataContext.posts.filter((post) => post.postedBy === username));
    if (posts.length === 0){
        return (
            <div id="profilePostsDiv">
                <label>No posts found</label>
            </div>
        )
    }

    return (
        <div id="profilePostsDiv">
            <ul id="profilePostsList">
                {posts.map((post, index) => (
                    <CreatePostLi
                        key={index}
                        postID={post._id}
                        post={post}
                        communityName={phreddit.getPostCommunity(post, dataContext.communities).name}
                        username={post.postedBy}
                        timeStamp={phreddit.processDate(Date.parse(post.postedDate))}
                        title={post.title}
                        linkFlair={phreddit.getLinkFlair(post, dataContext.linkFlairs)}
                        content={post.content.slice(0, 80)}
                        viewCount={post.views}
                        commentCount={phreddit.getAllPostComments(post, dataContext.comments).length}
                        upvoteCount={post.upvotes}
                    />
                    ))}
            </ul>
        </div>
    )
}

function ProfileComments({username}){
    const dataContext = useContext(DataContext);

    let comments = phreddit.sortNewestComments(dataContext.comments.filter((comment) => comment.commentedBy === username));

    if (comments.length === 0){
        return (
            <div id="profileCommentsDiv">
                <label>No comments found</label>
            </div>
        )
    }

    return (
        <div id="profileCommentsDiv">
            <ul id="profileCommentsList">
            {comments.map((comment, index) => (
                <CreateCommentLi
                    key={index}
                    user={comment.commentedBy}
                    date={phreddit.processDate(Date.parse(comment.commentedDate))}
                    content={comment.content.slice(0, 20)}
                    commentID={comment._id}
                    commentPost={phreddit.getCommentPost(comment, dataContext.posts, dataContext.comments)}
                />
            ))}
            </ul>
        </div>
    )
}

function ProfileCommunities({username}){
    const dataContext = useContext(DataContext);
  
    let createdCommunities = dataContext.communities.filter((community) =>
        community.createdBy === username)
  
    if (createdCommunities.length === 0){
        return (
            <div id="communities">
                <label>No communities found</label>
            </div>
        )
    }

    return (
        <div id="communities">
            <ul id="profileCommunityList">
                {createdCommunities.map((community) => (
                    <CreateCommunityLi
                        key={community._id}
                        community={community}
                    />
                ))}
            </ul>
        </div>
    )
}

function UserListing({user}){
    const [showCommunities, setShowCommunities] = useState(true);
    const [showPosts, setShowPosts] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const dataContext = useContext(DataContext);
    const username = user.username;

    const handleCommunitiesBtn = () => {
        dataContext.fetchData();
        setShowPosts(false);
        setShowComments(false);
        setShowCommunities(true);
    }

    const handlePostsBtn = () => {
        dataContext.fetchData();
        setShowPosts(true);
        setShowComments(false);
        setShowCommunities(false);
    }

    const handleCommentsBtn = () => {
        dataContext.fetchData();
        setShowPosts(false);
        setShowComments(true);
        setShowCommunities(false);
    }

    return (
        <div className="userListing">
            <div className="listingButtons">
                <button onClick={handleCommunitiesBtn}>Communities</button>
                <button onClick={handlePostsBtn}>Posts</button>
                <button onClick={handleCommentsBtn}>Comments</button>
            </div>
            {showCommunities && <ProfileCommunities username = {username}/>}
            {showPosts && <ProfilePosts username = {username}/>}
            {showComments && <ProfileComments username = {username}/>}
        </div>
    )
}

export default function ProfileView({user}){
    const date = new Date(user.createdDate);
    const dateFormatted = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).format(date);

    return (
        <div id="profileView" className="view">
          <div id="profileHeader">
            <label>{user.username}</label>
            <label>{user.email}</label>
            <label>Member Since: {dateFormatted}</label>
            <label>Reputation: {user.reputation}</label>
          </ div>
            <UserListing user={user}/>
        </div>
    );
}