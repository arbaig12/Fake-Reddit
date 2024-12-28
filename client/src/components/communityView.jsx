import '../stylesheets/communityView.css';
import '../stylesheets/posts.css';
import React, { useContext, useEffect } from 'react';
import { DataContext } from './dataContext.jsx';
import { AppContext } from './appContext.jsx';
import { ViewContext } from './viewContext.jsx';
import { AuthContext } from './authContext.jsx';

import { ErrorContext } from './errorContext.jsx';


import * as phreddit from './phreddit.js';
import axios from 'axios';


function CreatePostLi({ post, username, timeStamp, title, linkFlair, content, viewCount, commentCount, upvoteCount }) {
  const appContext = useContext(AppContext);
  const viewContext = useContext(ViewContext);
  const dataContext  = useContext(DataContext);
  const errorContext = useContext(ErrorContext);

  const openPost = async () => {
    const updatedPost = {...post,  views: post.views+1};

    try {
      const response = await axios.post('http://localhost:8000/api/viewpost', updatedPost);

      const createdPost = response.data;
      appContext.setCurrentPost(createdPost);
      dataContext.fetchData();

      viewContext.setCurrentView('postView');

    } catch (error) {
      errorContext.setErrorCall(true);
      viewContext.setPreviousView(viewContext.currentView);
      viewContext.setCurrentView("errorView");
      console.error("Error viewing post:", error);
    }
  };

  return (
    <li onClick={openPost}>
      <div className="post">
        <div className="postHeader">
          <div className="postUser">
            <label>{username}</label>
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

          <div className="postContentPreview">
            <label>{content}</label>
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

function RenderPosts() {
  const dataContext = useContext(DataContext);
  const appContext = useContext(AppContext);
  let posts = phreddit.processPosts(dataContext, appContext.currentSort, '', appContext.currentCommunity);
  
  if (dataContext.loading === true) {
    return <p>Loading posts...</p>;
  }

  return posts.map((post, index) => (
    <CreatePostLi
      key={index}
      postID = {post.id_}
      post = {post}
      communityName={phreddit.getPostCommunity(post, dataContext.communities).name}
      username={post.postedBy}
      timeStamp={phreddit.processDate(Date.parse(post.postedDate))}
      title={post.title}
      linkFlair={phreddit.getLinkFlair(post, dataContext.linkFlairs)}
      content={post.content.slice(0,80)}
      viewCount={post.views}
      commentCount={phreddit.getAllPostComments(post, dataContext.comments).length}
      upvoteCount={post.upvoteList.length - post.downvoteList.length}
    />
  ));
}

function CreateJoinButton() {
  const appContext = useContext(AppContext);
  const dataContext = useContext(DataContext);
  const authContext = useContext(AuthContext);

  const errorContext = useContext(ErrorContext);
  const viewContext = useContext(ViewContext);


  if(authContext.authState.isGuest){
    return ;
  }
  console.log(appContext.currentCommunity.members);
  let isMember = appContext.currentCommunity.members.includes(authContext.authState.user.username);

  const handleJoinClick = async () => {
    try{
      const username = authContext.authState.user.username;
      const communityID = appContext.currentCommunity._id;
      let resp = await axios.post('http://localhost:8000/api/joinleavecommunity', {username, communityID});
      let newMembers = resp.data.newMembers;

      dataContext.fetchData();
      appContext.setCurrentCommunity({...appContext.currentCommunity, members: newMembers});

    }
    catch (error){

      errorContext.setErrorCall(true);
      viewContext.setPreviousView(viewContext.currentView);
      viewContext.setCurrentView("errorView");

      console.error('Error updating community:', error);
    }
  };

  return (
    <button onClick={handleJoinClick} className="joinCommunityButton">
      {isMember ? 'Leave Community' : 'Join Community'}
    </button>
  );
}

function CommunityHeader() {
  const appContext = useContext(AppContext);
  return (
    <div id="communityHeader" className="community-header">
      <div className="headerContainer">
        <label>{appContext.currentCommunity.name}</label>
      </div>

      <div className="headerButtons">
        <div className="headerContainer">
          <button 
            className={`newestButton ${appContext.currentSort === 'newest' ? 'active' : ''}`}
            onClick={() => appContext.setCurrentSort('newest')} // Set sorting to newest
          >
            Newest
          </button>
        </div>

        <div className="headerContainer">
          <button 
            className={`oldestButton ${appContext.currentSort === 'oldest' ? 'active' : ''}`}
            onClick={() => appContext.setCurrentSort('oldest')} // Set sorting to oldest
          >
            Oldest
          </button>
        </div>

        <div className="headerContainer">
          <button 
            className={`activeButton ${appContext.currentSort === 'active' ? 'active' : ''}`}
            onClick={() => appContext.setCurrentSort('active')} // Set sorting to active
          >
            Active
          </button>
        </div>
      </div>
    </div>
  );
}

function CommunityPostArea(){
  const appContext = useContext(AppContext); // Access the data from context
  return (
    <div id="postsView">

      <div>
        <label id="communityDesc">{appContext.currentCommunity.description}</label>
      </div>
      <div>
      <label id="communityAge">
          Created {phreddit.processDate(Date.parse(appContext.currentCommunity.startDate))} 
          &nbsp;by: {appContext.currentCommunity.createdBy}
        </label>
      </div>
      
      <div id="communityInfo">
        <div id="communityCounts">
          <label>{appContext.currentCommunity.postIDs.length} posts</label>
          <label>{appContext.currentCommunity.members.length} members</label>
        </div>

        <div id="joinCommunity">
          <CreateJoinButton />
        </div>
      </div>

      <div id="communityPostDiv" className="postDiv">
        <ul className="postList">
            <RenderPosts/>
        </ul>
      </div>
    </div>
  );
}

function CommunityView(){
  return (
    <div id="communityView" className="view">
      <CommunityHeader/>
      <CommunityPostArea/>
    </div>
  )

}

export default CommunityView;