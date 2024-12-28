/* server/init.JSON
** You must write a script that will create documents in your database according
** to the datamodel you have defined for the application.  Remember that you 
** must at least initialize an admin user account whose credentials are derived
** from command-line arguments passed to this script. But, you should also add
** some communities, posts, comments, and link-flairs to fill your application
** some initial content.  You can use the initializeDB.js script as inspiration, 
** but you cannot just copy and paste it--you script has to do more to handle
** users.
*/
const mongoose = require('mongoose');
const CommunityModel = require('./models/communities');
const PostModel = require('./models/posts');
const CommentModel = require('./models/comments');
const LinkFlairModel = require('./models/linkflairs');
const UserModel = require('./models/users');
const bcrypt = require('bcrypt');

let userArgs = process.argv.slice(2);

if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return;
}

let mongoDB = userArgs[0];
mongoose.connect(mongoDB);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

async function createUser(userObj) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userObj.password, salt);

    let newUserDoc = new UserModel({
        first : userObj.first,
        last: userObj.last,
        email: userObj.email,
        username: userObj.username,
        passwordHash: hashedPassword,
        reputation: userObj.reputation,
        isAdmin: userObj.isAdmin,
    });
    return newUserDoc.save();
}

async function createLinkFlair(linkFlairObj) {
    let newLinkFlairDoc = new LinkFlairModel({
        content: linkFlairObj.content,
    });
    return newLinkFlairDoc.save();
}

async function createComment(commentObj) {
    let newCommentDoc = new CommentModel({
        content: commentObj.content,
        commentedBy: commentObj.commentedBy,
        commentedDate: commentObj.commentedDate,
        commentIDs: commentObj.commentIDs,
        upvoteList: commentObj.upvoteList || [],
        downvoteList: commentObj.downvoteList || [],
    });
    return newCommentDoc.save();
}

async function createPost(postObj) {
    let newPostDoc = new PostModel({
        title: postObj.title,
        content: postObj.content,
        postedBy: postObj.postedBy,
        postedDate: postObj.postedDate,
        views: postObj.views,
        linkFlairID: postObj.linkFlairID,
        commentIDs: postObj.commentIDs,
        community: postObj.community,
        upvoteList: postObj.upvoteList || [],
        downvoteList: postObj.downvoteList || [],
    });
    return newPostDoc.save();
}

async function createCommunity(communityObj) {
    let newCommunityDoc = new CommunityModel({
        name: communityObj.name,
        description: communityObj.description,
        postIDs: communityObj.postIDs,
        startDate: communityObj.startDate,
        members: communityObj.members,
        createdBy: communityObj.createdBy,
    });
    return newCommunityDoc.save();
}

async function initializeDB() {
    // Create admin user from command-line arguments
    const adminUser = {
        first: 'Admin',
        last: 'Admin',
        email: userArgs[1],
        username: 'admin',
        password: userArgs[2],
        reputation: 1000,
        isAdmin: true,
    };
    let adminRef = await createUser(adminUser);

    // Create link flairs
    const linkFlair1 = { content: 'The jerkstore called...' };
    const linkFlairRef1 = await createLinkFlair(linkFlair1);

    // Create comments
    const comment1 = {
        content: 'Great post!',
        commentedBy: adminRef.username,
        commentedDate: new Date(),
        commentIDs: [],

        upvoteList: [], 

        upvoteList: [adminRef._id], 

    };
    const commentRef1 = await createComment(comment1);
    // adminRef.comments.push(commentRef1._id);
    // await adminRef.save();

    // Create posts
    const post1 = {
        title: 'Welcome to the community',
        content: 'This is the first post!',
        postedBy: adminRef.username,
        postedDate: new Date(),
        views: 100,
        linkFlairID: linkFlairRef1._id,
        commentIDs: [commentRef1._id],

        upvoteList: [], 

        upvoteList: [adminRef._id], 

    };
    const postRef1 = await createPost(post1);
    // adminRef.posts.push(postRef1._id);
    // await adminRef.save();

    // Create communities
    const community1 = {
        name: 'General Discussion',
        description: 'A place for general discussion.',
        postIDs: [postRef1._id],
        startDate: new Date(),
        members: [adminRef.username],
        createdBy: adminRef.username,
    };
    const communityRef1 = await createCommunity(community1);

    // Update admin user with the joined community
    // adminRef.communities.push(communityRef1._id);
    // await adminRef.save();

    if (db) {
        db.close();
    }
    console.log('Database initialized successfully');
}

initializeDB()
    .catch((err) => {
        console.log('ERROR: ' + err);
        console.trace();
        if (db) {
            db.close();
        }
    });

console.log('Processing...');
