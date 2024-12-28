
import '../stylesheets/banner.css';
import React, { useContext } from 'react';
import { AppContext } from './appContext.jsx';
import { ViewContext } from './viewContext.jsx';
import { DataContext } from './dataContext.jsx';
import { AuthContext } from './authContext.jsx';

import { ErrorContext } from './errorContext.jsx';


import axios from 'axios';

function SearchBar(){
  const dataContext = useContext(DataContext);
  const appContext = useContext(AppContext);
  const viewContext = useContext(ViewContext)

  const handleInputChange = (e) => {
    if (e.key === 'Enter' || e.keyCode === 13){
      const value = e.target.value;
      appContext.setCurrentSearchTerm(value);

      if (value.length === 0) {
        viewContext.setCurrentView('homeView');
      } else {
        dataContext.fetchData();
        viewContext.setCurrentView('searchView');
      }
    }
  };

  return (
    <div id="search" className="bannerInput">
      <input type="text" id="searchInput" className="round" placeholder="Search Phreddit..." onKeyDown={handleInputChange}></input>
    </div>
  )
}

function ProfileButton(){
  const viewContext = useContext(ViewContext)
  const authContext = useContext(AuthContext);
  const user = authContext.authState.user
  const dataContext = useContext(DataContext);

  const handleProfileBtn = async () => {
    const response = await axios.post('http://localhost:8000/api/user', { username: authContext.authState.user.username });
    const { user } = response.data;
    authContext.setUser(user);
    viewContext.setUserToView(null);
    dataContext.fetchData();

    if (user.isAdmin){
      viewContext.setCurrentView('adminView');
    }
    else{
      viewContext.setCurrentView('profileView');    
    }
  };

  if (user){
    return (
      <div id="profile" className="bannerBtn">
        <button className="round thin-outline" onClick={handleProfileBtn}>{user.username}</button>
      </div>
    );
  }

  return (
    <div id="profile" className="bannerBtn">
      <button className="round thin-outline">Guest</button>
    </div>
  );
}

function LogoutButton(){
  const authContext = useContext(AuthContext);
  const logout = authContext.logout;
  const isGuest = authContext.authState.isGuest;

  if (isGuest){
    return;
  }

  return (
    <div id="logout" className="bannerBtn">
      <button className="round thin-outline" onClick={logout} >Logout</button>
    </div>
  );
}

function PhredditButton(){
  const viewContext = useContext(ViewContext);
  const dataContext = useContext(DataContext);
  const authContext = useContext(AuthContext);
  const isGuest = authContext.authState.isGuest;
  
  const PhredditHomeClick = () => {
    dataContext.fetchData();
    viewContext.setCurrentView('homeView');
  };

  const PhredditGuestClick = () => {
    authContext.logout();

    dataContext.fetchData();
    viewContext.setCurrentView('homeView');
  };

  if (isGuest){
    return (
      <label className="phreddit-logo" onClick={() => PhredditGuestClick()}>phreddit</label>
    );
  }

  return (
    <label className="phreddit-logo" onClick={() => PhredditHomeClick()}>phreddit</label>
  );
}

function CreatePost(){
  const viewContext = useContext(ViewContext)
  const dataContext = useContext(DataContext);
  const authContext = useContext(AuthContext);
  const user = authContext.authState.user;
  const isGuest = authContext.authState.isGuest;

  const handleNewPostBtn = () => {
    dataContext.fetchData();  
    viewContext.setCurrentView('postForm');     
  };

  if (isGuest) {
    return(  
        <div id="createPost" className="bannerBtn">
          <button className="round thin-outline gaming" style={{backgroundColor: '#AAAAAA', color: 'white'}}>Create Post</button>
        </div>
    );
  }

  let formStyle = {};
  if (viewContext.currentView === 'postForm'){
    formStyle = {backgroundColor: '#ff4500', color: '#fff'};
  }

  return(
    <div id="createPost" className="bannerBtn">
      <button className="round thin-outline gaming"  style={formStyle} onClick={() => handleNewPostBtn()} >Create Post</button>
    </div>
  )
}

const Banner = () => {
  return(
    <div id="banner" className="banner">
      <div id="bannerText" className="bannerText">
        <PhredditButton />
      </div>

      <SearchBar />

      <CreatePost />

      <ProfileButton />
      
      <LogoutButton />
    </div>
  );
};

export default Banner
