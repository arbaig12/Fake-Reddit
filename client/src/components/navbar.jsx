import '../stylesheets/nav.css';
import React, { useContext, useEffect } from 'react';
import { DataContext } from './dataContext.jsx';
import { ViewContext } from './viewContext.jsx';
import { AppContext } from './appContext.jsx';
import { AuthContext } from './authContext.jsx';
import { ErrorContext } from './errorContext.jsx';


function CreateCommunityBtn(){
    const viewContext = useContext(ViewContext);
    const dataContext = useContext(DataContext);
    const authContext = useContext(AuthContext);

    let user = authContext.authState.user;
    let isGuest = authContext.authState.isGuest;
  
    const handleCommunityBtn = () => {
        dataContext.fetchData();
        viewContext.setCurrentView('communityForm');
    };

    if (user == null || isGuest){
      return (
        <div id="createCommunity">
          <button id="createCommunityBtn" className="navBtn round thin-outline" style={{backgroundColor: '#AAAAAA', color: 'white'}}>
            Create Community
          </button>
        </div>
        );
    }

    return (
        <div id="createCommunity">
            <button id="createCommunityBtn" className="navBtn round thin-outline" onClick={handleCommunityBtn}>Create Community</button>
        </div>
    );
}

const Nav = () => { 
  const dataContext = useContext(DataContext);
  const viewContext = useContext(ViewContext);
  const appContext = useContext(AppContext);
  const authContext = useContext(AuthContext);

  // Filter communities based on the user's communities
  let sortedCommunities = dataContext.communities;

  if (authContext.authState.user) {
    let userCommunities = dataContext.communities.filter((community) => 
      community.members.includes(authContext.authState.user.username)
    )

    let otherCommunities = dataContext.communities.filter((community) => 
      !community.members.includes(authContext.authState.user.username)
    )

      sortedCommunities = [...userCommunities, ...otherCommunities];
  }
  

  const handleCommunityClick = (community) => {
    dataContext.fetchData();
    appContext.setCurrentCommunity(community);
    viewContext.setCurrentView('communityView');
  };

  const handleHomeClick = () => {
    dataContext.fetchData();
    viewContext.setCurrentView('homeView');
  };

  if (viewContext.currentView === 'homeView') {
    return (
      <div id="nav" className="nav">
        <div id="navHome" className="navDiv">
          <label id="homeLink" style={{ backgroundColor: "#ff4500" }} onClick={handleHomeClick}>Home</label>
        </div>
        <div id="communitiesSection">
          <div id="communitiesLabel" className="nav-section-title">
            <label>Communities</label>
          </div>
          <div id="communityContent">
            {/* <div id="createCommunity">
              <button id="createCommunityBtn" className="navBtn round thin-outline" onClick={handleCommunityBtn}>Create Community</button>
            </div> */}
            <CreateCommunityBtn />
            <div id="communities" className="navDiv">
              <ul id="communityList" className="navList">
                {sortedCommunities.map((community) => (
                  <li key={community._id}>
                    <label 
                      className="communityItem" 
                      onClick={() => handleCommunityClick(community)}
                    >
                      p/{community.name}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="nav" className="nav">
      <div id="navHome" className="navDiv">
        <label id="homeLink" onClick={handleHomeClick}>Home</label>
      </div>
      <div id="communitiesSection">
        <div id="communitiesLabel" className="nav-section-title">
          <label>Communities</label>
        </div>
        <div id="communityContent">
          {/* <div id="createCommunity">
            <button id="createCommunityBtn" className="navBtn round thin-outline" onClick={handleCommunityBtn}>Create Community</button>
          </div> */}
          <CreateCommunityBtn />
          <div id="communities" className="navDiv">
            <ul id="communityList" className="navList">
              {sortedCommunities.map((community) => (
                <li key={community._id}>
                  <label 
                    className="communityItem" 
                    onClick={() => handleCommunityClick(community)}
                  >
                    p/{community.name}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nav;
