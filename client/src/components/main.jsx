import React from 'react';
import { useContext } from 'react';
import { ViewContext } from './viewContext.jsx';
import { AuthContext } from './authContext.jsx';

import { ErrorContext } from './errorContext.jsx';


import ProfileView from './profileView.jsx';
import HomeView from './homeView.jsx';
import PostView from './postView.jsx'
import SearchView from './searchView.jsx';
import CommunityView from './communityView.jsx';
import ErrorView from './errorView.jsx';
import CommunityForm from './createCommunity.jsx';
import CreatePostForm from './createPost.jsx';
import AddComment from './addComment.jsx';
import AddReply from './replyComment.jsx';
import Banner from './banner.jsx'
import Nav from './navbar.jsx'
import EditCommunity from './editCommunity.jsx'
import EditPost from './editPost.jsx'
import EditComment from './editComment.jsx'
import AdminView from './adminView.jsx'

import '../stylesheets/banner.css';
import '../stylesheets/nav.css';
import '../stylesheets/main.css';

function MainView(){
    const viewContext = useContext(ViewContext);
    let currentView = viewContext.currentView;
    let authContext = useContext(AuthContext);
    let currentUser = authContext.user;
    let userToView = viewContext.userToView ?  viewContext.userToView : currentUser;

    return (
        <div id="main" className="main">
            {currentView === "homeView" && <HomeView />}
            {currentView === "postView" && <PostView />}
            {currentView === "searchView" && <SearchView />}
            {currentView === "communityView" && <CommunityView />}
            {currentView === "communityForm" && <CommunityForm />}
            {currentView === "postForm" && <CreatePostForm />}
            {currentView === "commentForm" && <AddComment />}
            {currentView === "replyForm" && <AddReply />}
            {currentView === "profileView" && <ProfileView user={userToView}/>}
            {currentView === "editCommunity" && <EditCommunity />}
            {currentView === "editPost" && <EditPost />}
            {currentView === "editComment" && <EditComment />}
            {currentView === "adminView" && <AdminView user={currentUser}/>}

            {currentView === "errorView" && <ErrorView />}

        </div>
    )
};

function Main(){
    return(
        <>
            <Banner />
            <Nav />
            <MainView/>
        </>
    )
}

export default Main;