import '../stylesheets/searchView.css';
import '../stylesheets/posts.css';
import React, { useContext, useEffect } from 'react';
import { DataContext } from './dataContext.jsx';
import { AppContext } from './appContext.jsx';
import { ViewContext } from './viewContext.jsx';
import { AuthContext } from './authContext.jsx';

import { ErrorContext } from './errorContext.jsx';


import * as phreddit from './phreddit.js';
import axios from 'axios';


function CreatePostLi({ post, communityName, username, timeStamp, title, linkFlair, content, viewCount, commentCount, upvoteCount }) {
    const appContext = useContext(AppContext);
    const viewContext = useContext(ViewContext);
    const errorContext = useContext(ErrorContext);
    const data = useContext(DataContext);

    const openPost = async () => {
      const updatedPost = {...post,  views: post.views+1};
  
      try {
        const response = await axios.post('http://localhost:8000/api/viewpost', updatedPost);
  
        const createdPost = response.data;
        appContext.setCurrentPost(createdPost);
        data.fetchData();
  
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
            <div className="postCommunityName">
              <label>{communityName}</label>
            </div>
  
            &nbsp;&nbsp;•&nbsp;&nbsp;
  
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
  
    if (dataContext.loading === true) {
      return <p>Loading posts...</p>;
    }

    let posts = phreddit.processPosts(dataContext, appContext.currentSort, appContext.currentSearchTerm, appContext.currentCommunity);

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

function RenderUserPosts() {
  const dataContext = useContext(DataContext);
  const appContext = useContext(AppContext);
  const authContext = useContext(AuthContext);

  if (dataContext.loading === true) {
    return <p>Loading posts...</p>;
  }

  let userCommunities = dataContext.communities
  .filter((community) => community.members.includes(authContext.authState.user.username))
  .map((community) => community._id);

  let posts = phreddit.getUserFeed(
    dataContext,
    userCommunities,
    appContext.currentSort,
    appContext.currentSearchTerm,
    appContext.currentCommunity
  );

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

function RenderOtherPosts() {
  const dataContext = useContext(DataContext);
  const appContext = useContext(AppContext);
  const authContext = useContext(AuthContext);

  if (dataContext.loading) {
    return <p>Loading posts...</p>;
  }

  let userCommunities = dataContext.communities
  .filter((community) => community.members.includes(authContext.authState.user.username))
  .map((community) => community._id);

  const posts = phreddit.getOtherFeed(
    dataContext,
    userCommunities,
    appContext.currentSort,
    appContext.currentSearchTerm,
    appContext.currentCommunity
  );

  return (
    <>
      {posts.length > 0 && <div className='otherIndicator'>--Posts from other communities--</div>}
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
            upvoteCount={post.upvoteList.length - post.downvoteList.length}
          />
        ))}
    </>
  );
}

function SearchHeader() {
    const dataContext = useContext(DataContext);
    const appContext = useContext(AppContext);
    let posts = phreddit.processPosts(dataContext, appContext.currentSort, appContext.currentSearchTerm, appContext.currentCommunity);
    let resultText = posts.length <= 0 ? "No results found for: " : "Results for: ";
    return (
      <div id="searchHeader" className="search-header">
        <div className="headerContainer">
          <label>{resultText}{appContext.currentSearchTerm}</label>
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

function SearchPostArea(){
  const dataContext = useContext(DataContext);
  const appContext = useContext(AppContext);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    let posts = phreddit.processPosts(dataContext, appContext.currentSort, appContext.currentSearchTerm, appContext.currentCommunity);
    appContext.setNumFiltered(posts.length);
  }, [dataContext, appContext, appContext.currentSort, appContext.currentSearchTerm, appContext.currentCommunity]);

  return (
    <div id="postsView">
      <div id="searchPostCount">
        {appContext.numFiltered} posts
      </div>

      <div id="searchPostDiv" className="postDiv">
        <ul className="postList">
          {authContext.authState.user && !authContext.authState.isGuest ? // if user is present and isGuest is false then show user home. otherwise guest home
          <>
            <RenderUserPosts/>
            <RenderOtherPosts/>
          </>
            : <RenderPosts/>
          }
        </ul>

      </div>
    </div>
  );
}
  
function SearchView(){
  return (
    <div id="searchView" className="view">
      <SearchHeader/>
      <SearchPostArea/>
    </div>
  )

}
  
export default SearchView;