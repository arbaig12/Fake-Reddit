import { useContext, useEffect } from 'react';
import { AuthContext } from './authContext.jsx';
import { DataContext } from './dataContext.jsx';
import { AppContext } from './appContext.jsx';
import { ViewContext } from './viewContext.jsx';

import { ErrorContext } from './errorContext.jsx';


import { useState } from 'react';
import * as phreddit from './phreddit.js';
import '../stylesheets/profileView.css';
import axios from 'axios';

function CreatePostLi({ post, communityName, username, timeStamp, title, linkFlair, content, viewCount, commentCount, upvoteCount }) {
    const appContext = useContext(AppContext);
    const viewContext = useContext(ViewContext);
    console.log(post);
    const openPost = async () => {
      appContext.setEditID(post._id);
      viewContext.setPreviousView("adminView");
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
      viewContext.setPreviousView("adminView");
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
      viewContext.setPreviousView("adminView");
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

function CreateUserLi({ user, onDelete }) {
    const viewContext = useContext(ViewContext);
    const dataContext = useContext(DataContext);

    const handleUserClick = () => {
        viewContext.setUserToView(user);
        dataContext.fetchData();

        viewContext.setPreviousView("adminView");

        viewContext.setCurrentView("profileView");
    };

    const handleDeleteUser = async (event) => {
        event.stopPropagation(); // Prevent the click event from bubbling up
        await onDelete(user.username); // Call the passed deletion handler
        dataContext.fetchData(); // Fetch the updated data
    };

    return (
        <li onClick={handleUserClick} className="user-list-item">
            <div className="user-info">
                <span className="user-display-name">{user.username}</span>
                <span className="user-email">{user.email}</span>
                <span className="user-reputation">Reputation: {user.reputation}</span>
            </div>
            <button onClick={handleDeleteUser} className="delete-user-button">Delete</button>
        </li>
    );
}

function ProfilePosts(){
    const dataContext = useContext(DataContext);
    const authContext = useContext(AuthContext);
    const user = authContext.authState.user;  
    let posts = phreddit.sortNewest(dataContext.posts.filter((post) => post.postedBy === user.username));
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

function ProfileComments(){
    const dataContext = useContext(DataContext);
    const authContext = useContext(AuthContext);
    const user = authContext.authState.user;  
    let comments = phreddit.sortNewestComments(dataContext.comments.filter((comment) => comment.commentedBy === user.username));

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

function ProfileCommunities(){
    const dataContext = useContext(DataContext);
    const authContext = useContext(AuthContext);
  
    let createdCommunities = dataContext.communities.filter((community) =>
        community.createdBy === authContext.authState.user.username)
  
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

function ProfileUsers() {

    const errorContext = useContext(ErrorContext);
    const viewContext = useContext(ViewContext);

    let [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch users initially
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/getAllUsers');
            setUsers(response.data);
            setLoading(false);
        } catch (error) {

            errorContext.setErrorCall(true);
            viewContext.setPreviousView(viewContext.currentView);
            viewContext.setCurrentView("errorView");

            setError('Error fetching users');
            setLoading(false);
        }
    };

    const handleDeleteUser = async (username) => {
        const confirmed = window.confirm("Are you sure you want to delete this user?");
        if (!confirmed) {
            return;
        }

        try {
            await axios.post('http://localhost:8000/api/user/delete', { username });
            setUsers((prevUsers) => prevUsers.filter((user) => user.username !== username)); // Update the users state
        } catch (error) {

            errorContext.setErrorCall(true);
            viewContext.setPreviousView(viewContext.currentView);
            viewContext.setCurrentView("errorView");

            console.error('Error deleting user:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    users = users.filter((user) => !user.isAdmin); // Filter out admin users

    if (users.length === 0) {
        return <p>No nonadmin users found</p>;
    }

    return (
        <div id="users">
            <ul id="adminUsersList">
                {users.map((user) => (
                    <CreateUserLi
                        key={user._id}
                        user={user}
                        onDelete={handleDeleteUser} // Pass down the deletion handler
                    />
                ))}
            </ul>
        </div>
    );
}

function UserListing(){
    const [showUsers, setShowUsers] = useState(true);
    const [showCommunities, setShowCommunities] = useState(false);
    const [showPosts, setShowPosts] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const dataContext = useContext(DataContext);

    const handleUsersBtn = () => {
        dataContext.fetchData();
        setShowUsers(true);
        setShowPosts(false);
        setShowComments(false);
        setShowCommunities(false);
    };

    const handleCommunitiesBtn = () => {
        dataContext.fetchData();
        setShowUsers(false);
        setShowPosts(false);
        setShowComments(false);
        setShowCommunities(true);
    }

    const handlePostsBtn = () => {
        dataContext.fetchData();
        setShowUsers(false);
        setShowPosts(true);
        setShowComments(false);
        setShowCommunities(false);
    }

    const handleCommentsBtn = () => {
        dataContext.fetchData();
        setShowUsers(false);
        setShowPosts(false);
        setShowComments(true);
        setShowCommunities(false);
    }

    return (
        <div className="userListing">
            <div className="listingButtons">
                <button onClick={handleUsersBtn}>Users</button>
                <button onClick={handleCommunitiesBtn}>Communities</button>
                <button onClick={handlePostsBtn}>Posts</button>
                <button onClick={handleCommentsBtn}>Comments</button>
            </div>
            {showUsers && <ProfileUsers />}
            {showCommunities && <ProfileCommunities />}
            {showPosts && <ProfilePosts />}
            {showComments && <ProfileComments />}
        </div>
    )
}

export default function AdminView(){
    const authContext = useContext(AuthContext);
    const dataContext = useContext(DataContext);

    const errorContext = useContext(ErrorContext);
    const viewContext = useContext(ViewContext);

    const user = authContext.user;

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
          </div>
            <UserListing />
        </div>
    );
}