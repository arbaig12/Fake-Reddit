import '../stylesheets/banner.css';
import '../stylesheets/nav.css';
import '../stylesheets/main.css';
import Banner from './banner.jsx'
import Nav from './navbar.jsx'
import Main from './main.jsx'
import MainRouter from './mainRouter.jsx';
import { DataProvider } from './dataContext.jsx';
import { AppProvider } from './appContext.jsx';
import { ViewProvider } from './viewContext.jsx';
import { AuthProvider } from './authContext.jsx';
import { ErrorProvider } from './errorContext.jsx';


export function processDate(submissionDate){
  const now = new Date();
  const diffInSeconds = Math.floor((now - submissionDate) / 1000);

  if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds === 1 ? '' : 's'} ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
}

export function getCommentPost(comment, postsArray, commentsArray){
  let commentID = comment._id;
  for (const comment of commentsArray){
    if (comment.commentIDs.includes(commentID)){
      return getCommentPost(comment, postsArray, commentsArray);
    }
  }

  for (const post of postsArray){
    if (post.commentIDs.includes(commentID)){
      return post;
    }
  }
}

export function getNestedComments(item, commentsArray){
  let postComments = [];

  commentsArray.forEach(comment => {
    for (const commentID of item.commentIDs){
        if (commentID === comment._id){
          postComments.push(comment)
      }
    }
  })
  return postComments;
}

export function getAllPostComments(post, commentsArray){
  let postComments = [];

  function getComments(item){
      commentsArray.forEach(comment => {
        for (const commentID of item.commentIDs){
            if (commentID === comment._id){
              postComments.push(comment)
              
              if (comment.commentIDs.length > 0){
                  getComments(comment);
              }
          }
        }
      })
  };

  getComments(post);
  return postComments;
}

export function getPostCommunity(post, communitiesArray){
  for (const community of communitiesArray) {
    for (const comPost of community.postIDs){
      if (comPost === post._id){
        return community;
      }
    }
  }
  return null;
}

export function getUserFeed(data, userCommunities, currentSort, currentSearchTerm, currentCommunity){
  let userFeed = [];
  let userCommunitiesObjects = data.communities.filter(community => userCommunities.includes(community._id));

  for (const community of userCommunitiesObjects){
    userFeed.push((data.posts.filter(post => community.postIDs.includes(post._id))));
  }

  userFeed = userFeed.flat();
  let userSortedPosts = sortPosts(userFeed, data.comments, currentSort);

  // then filter the posts.
  let userFilteredPosts = filterPosts(userSortedPosts, data.comments, data.communities, currentSearchTerm, currentCommunity)

  return userFilteredPosts;
}

export function getOtherFeed(data, userCommunities, currentSort, currentSearchTerm, currentCommunity){
  let otherFeed = [];
  let otherCommunities = data.communities.filter(community => !userCommunities.includes(community._id));

  for (const otherCommunity of otherCommunities){
    otherFeed = otherFeed.concat(data.posts.filter(post => otherCommunity.postIDs.includes(post._id)));
  }

  otherFeed = otherFeed.flat();
  let otherSortedPosts = sortPosts(otherFeed, data.comments, currentSort);

  // then filter the posts.
  let otherFilteredPosts = filterPosts(otherSortedPosts, data.comments, data.communities, currentSearchTerm, currentCommunity)

  return otherFilteredPosts;
}

export function getLinkFlair(post, linkFlairsArray){
  for (const flair of linkFlairsArray) {
      if (flair._id === (post.linkFlairID)) {
          return flair.content;
      }
  }
  return '';
}

export function getLinkFlairIdByContent(content, linkFlairsArray){
  for (const flair of linkFlairsArray) {
    if (flair.content === (content)) {
        return flair._id;
    }
  }
  return null;
}

export function getRecentComment(post, commentsArray){
  let allPostComments = getAllPostComments(post, commentsArray);

 if (allPostComments.length === 0) {
      return null;
  }

  return allPostComments.reduce((mostRecent, currentComment) => {
      return Date.parse(currentComment.commentedDate) > Date.parse(mostRecent.commentedDate) ? currentComment : mostRecent;
  });
}

export function filterPosts(postsArray, commentsArray, communitiesArray, searchTerm, community) {
  // Split the searchTerm into individual words and filter out common, short words like "is"
  const searchWords = searchTerm
    .toLowerCase()
    .split(/\s+/) // Split by any whitespace
    // .filter(word => word.length > 2); // Ignore words with fewer than 3 characters IDK IF THIS SHOULD BE DONE

  let communityFilter = postsArray.filter(post => {
    // Check if the post belongs to the specified community
    if (community && community.name !== getPostCommunity(post, communitiesArray).name) {
      return false;
    }
    return true;
  });

  if (!searchTerm){
    return communityFilter;
  }

  let searchFilter = communityFilter.filter(post => {
    // Check if the post belongs to the specified community
    const postText = (post.title + ' ' + post.content).toLowerCase();
    if (searchWords.some(word => postText.includes(word))) {
      return true;
    }

    // Check if any comment contains any of the search words
    const postComments = getAllPostComments(post, commentsArray);
    return postComments.some(comment => 
      searchWords.some(word => comment.content.toLowerCase().includes(word))
    );
  });

  return searchFilter;
}

export function sortOldest(postsArray){
  const sortByDate = (a, b) => {
    return Date.parse(a.postedDate) - Date.parse(b.postedDate);
  };
  let sortedArray = postsArray.sort(sortByDate)
  return sortedArray;
}

export function sortNewest(postsArray){
  const sortByDate = (a, b) => {
    return Date.parse(b.postedDate) - Date.parse(a.postedDate);
  };
  let sortedArray = postsArray.sort(sortByDate);
  return sortedArray;
}

export function sortActive(postsArray, commentsArray){
  return postsArray.sort((postA, postB) => {
    const recentCommentA = getRecentComment(postA, commentsArray);
    const recentCommentB = getRecentComment(postB, commentsArray);

    // If both posts have no comments, keep them in their original order
    if (!recentCommentA && !recentCommentB) return 0;

    // If postA has no comments, place it after postB
    if (!recentCommentA) return 1;

    // If postB has no comments, place it after postA
    if (!recentCommentB) return -1;

    // Compare the dates of the most recent comments
    return Date.parse(recentCommentB.commentedDate) - Date.parse(recentCommentA.commentedDate);
  });
}

export function sortPosts(postsArray, commentsArray, sortBy){
  let sorted = postsArray;
  switch (sortBy){
    case 'newest':
      sorted = sortNewest(sorted);
      return sorted
    case 'oldest':
      sorted = sortOldest(sorted)
      return sorted
    case 'active':
      sorted = sortActive(sorted, commentsArray)
      return sorted
    default:
      return sorted
  }
}

export function processPosts(data, currentSort, currentSearchTerm, currentCommunity){
  let sortedPosts = sortPosts(data.posts, data.comments, currentSort);

  // then filter the posts.
  let filteredPosts = filterPosts(sortedPosts, data.comments, data.communities, currentSearchTerm, currentCommunity)
  return filteredPosts;
}

export function sortNewestComments(commentsArray){
  const sortByDate = (a, b) => {
    return Date.parse(b.commentedDate) - Date.parse(a.commentedDate);
  };
  let sortedArray = commentsArray.sort(sortByDate)
  return sortedArray;
}

export default function Phreddit() {
  return (
      <DataProvider>
        <ViewProvider>
          <AppProvider>
            <AuthProvider>
              <ErrorProvider>
                <MainRouter />  
              </ErrorProvider> 
            </AuthProvider>
          </AppProvider>
        </ViewProvider>
      </DataProvider>
  );
}