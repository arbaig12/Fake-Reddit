// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Community = require('./models/communities');
const Post = require('./models/posts');
const Comment = require('./models/comments');
const LinkFlair = require('./models/linkflairs');
const bcrypt = require('bcrypt');
const User = require('./models/users');

const app = express();
app.use(cors());
app.use(express.json());

// Create a function to connect to MongoDB
const connectDB = async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/phreddit');
};

app.get('/', (req, res) => {
    res.status(200).send('Server is running');
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user){
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the password with the stored hash
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch){
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Return token and user details
        res.json({
            user: {
                id: user._id,
                username: user.username,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/register', async (req, res) => {
    const { first, last, email, username, password } = req.body;

    try {
        // Find the user by email
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser){
            return res.status(404).json({ message: 'Email/Username Already Exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        // Create a new user
        const newUser = new User({
            first,
            last,
            email,
            username,
            passwordHash,
            isAdmin: false, // Default isAdmin status
        });

        // Save the new user to the database
        const savedUser = await newUser.save();

        // Return token and user details
        res.status(201).json({
            user: {
                first: savedUser.first,
                last: savedUser.last,
                username: savedUser.username,
                email: savedUser.email,
                reputation: savedUser.reputation,
                isAdmin: savedUser.isAdmin,
            },
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/user', async (req, res) => {
    const { username } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user){
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user: {
                id: user._id,
                first: user.first,
                last: user.last,
                username: user.username,
                email: user.email,
                reputation: user.reputation,
                isAdmin: user.isAdmin,
                createdDate: user.createdDate,
                communities: user.communities,
                posts: user.posts,
                comments: user.comments,
            },
        });
    }
    catch (error) {
        console.error('User error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/getAllUsers', async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

app.post('/api/user/delete', async (req, res) => {
    const { username } = req.body;

    try {
        // Find the user to delete
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userID = user._id;

        // Step 1: Delete all comments associated with the user
        const userComments = await Comment.find({ commentedBy: username });
        for (const comment of userComments) {
            if (comment.commentIDs && comment.commentIDs.length > 0) {
                await deleteCommentsRecursively(comment.commentIDs);
            }
            await Comment.findByIdAndDelete(comment._id);
        }

        console.log(`Deleted comments for user: ${username}`);

        // Step 2: Delete all posts created by the user
        const userPosts = await Post.find({ postedBy: username });
        for (const post of userPosts) {
            if (post.commentIDs && post.commentIDs.length > 0) {
                await deleteCommentsRecursively(post.commentIDs);
            }
            await Post.findByIdAndDelete(post._id);
        }

        console.log(`Deleted posts for user: ${username}`);

        // Step 3: Delete all communities created by the user
        const userCommunities = await Community.find({ createdBy: username });
        for (const community of userCommunities) {
            if (community.postIDs && community.postIDs.length > 0) {
                await deleteAllPosts(community.postIDs);
            }
            await Community.findByIdAndDelete(community._id);
        }

        console.log(`Deleted communities created by user: ${username}`);

        // Step 4: Remove user from all communities' members list
        const allCommunities = await Community.find({ members: username });
        for (const community of allCommunities) {
            await Community.findByIdAndUpdate(
                community._id,
                { $pull: { members: username } },
                { new: true }
            );
        }

        console.log(`Removed user from all community memberships: ${username}`);

        // Step 5: Delete the user record
        await User.findByIdAndDelete(userID);

        res.status(200).json({
            message: `User ${username} and all associated data (comments, posts, communities, and memberships) deleted successfully.`,
        });
    } catch (error) {
        console.error('Error deleting user and associated data:', error);
        res.status(500).json({ message: 'Error deleting user and associated data', error });
    }
});


app.get('/api/communities', async (req, res) => {
    try {
        const communities = await Community.find();
        res.json(communities);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching communities', error });
    }
});

app.post('/api/communities', async (req, res) => {
    const { name, description, members, startDate, createdBy } = req.body;

    try {
        const foundCommunity = await Community.findOne({ name });
        if (foundCommunity) {
            return res.status(400).json({ message: 'Community name already exists' });
        }

        const newCommunity = new Community({
            name,
            description,
            postIDs: [],
            startDate,
            members,
            createdBy,
        });

        const savedCommunity = await newCommunity.save();

        // const user = await User.findOneAndUpdate({ username: createdBy },
        //     { $addToSet: { communities: savedCommunity._id } },
        //     { new: true }
        // );
        // if (!user) {
        //     return res.status(404).json({ message: 'User not found' });
        // }

        res.status(201).json(savedCommunity);
    } catch (error) {
        res.status(500).json({ message: 'Error creating community', error });
    }
});

app.post('/api/communities/edit', async (req, res) => {
    const { communityID, editedName, editedDescription } = req.body;
    try {
        const updatedCommunity = await Community.findByIdAndUpdate(
            communityID,
            { name: editedName, description: editedDescription },
            { new: true }
        );

        if (!updatedCommunity) {
            return res.status(404).json({ message: 'Community not found' });
        }

        res.status(200).json(updatedCommunity);
    }
    catch (error){
        console.error('Error editing community:', error);
        res.status(500).json({ message: 'Error editing community', error });
    }
});

const deleteAllPosts = async (postIDs) => {
    for (const postID of postIDs) {
        const post = await Post.findById(postID);

        if (post) {
            if (post.commentIDs && post.commentIDs.length > 0) {
                await deleteCommentsRecursively(post.commentIDs);
            }

            await Post.findByIdAndDelete(postID);
        }
    }
}

app.post('/api/communities/delete', async (req, res) => {
    const { communityID } = req.body;

    try {
        const community = await Community.findById(communityID);

        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }

        if (community.postIDs && community.postIDs.length > 0) {
            await deleteAllPosts(community.postIDs);
        }

        await Community.findByIdAndDelete(communityID);

        res.status(200).json({ message: 'Community and associated posts deleted successfully' });
    } catch (error) {
        console.error('Error deleting community and posts:', error);
        res.status(500).json({ message: 'Error deleting community and posts', error });
    }
});

app.post('/api/joinCommunity', async (req, res) => {
    const { username, communityID } = req.body;

    try {
        const community = await Community.findById(communityID);
        // const user = await User.findOne({username});

        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }

        await Community.findByIdAndUpdate(
            communityID,
            { $addToSet: { members: username } },
            { new: true }
        )

        // const updatedUser = await User.findByIdAndUpdate(
        //     user._id,
        //     { $addToSet: { communities: community._id } },
        //     { new: true }
        // )

        return res.status(200).json({ message: 'Member added to community', });
    }
    catch (error) {
        console.error('Error updating community members:', error);
        res.status(500).json({ message: 'Server error', error });
    }

});

app.post('/api/joinleavecommunity', async (req, res) => {
    const { username, communityID } = req.body;

    try {
        const community = await Community.findById(communityID);
        // const user = await User.findOne({username});

        if (!community) {
            return res.status(404).json({ message: 'Community/User not found' });
        }

        const isMember = community.members.includes(username);

        if (isMember) {
            const updatedCommunity = await Community.findByIdAndUpdate(
                communityID,
                { $pull: { members: username } },
                { new: true }
            )

            // const updatedUser = await User.findByIdAndUpdate(
            //     user._id,
            //     { $pull: { communities: community._id } },
            //     { new: true }
            // )

            return res.status(200).json({ message: 'Member removed from community', newMembers: updatedCommunity.members /*, communities: updatedUser.communities */});
        }
        else {
            const updatedCommunity = await Community.findByIdAndUpdate(
                communityID,
                { $addToSet: { members: username } },
                { new: true }
            )

            // const updatedUser = await User.findByIdAndUpdate(
            //     user._id,
            //     { $addToSet: { communities: community._id } },
            //     { new: true }
            // )

            return res.status(200).json({ message: 'Member added to community', newMembers: updatedCommunity.members /*, communities: updatedUser.communities */});
        }
    }   
    catch (error){
        console.error('Error updating community members:', error);
        res.status(500).json({ message: 'Server error', error });
    }
    console.log(community);
});

app.post('/api/viewpost', async (req, res) => {
    const {_id} = req.body;
    try {
        const updatedPost = await Post.findByIdAndUpdate(
            _id,
            { $inc: { views: 1 } },
            { new : true }
        );

        if (!updatedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // console.log('Updated post:', updatedPost);
        res.status(201).json(req.body);
    }
    catch (error) {
        res.status(500).json({ message: 'Error viewing post', error });
    }
});

app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find();
        res.json(posts);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error });
    }
});

app.post('/api/posts', async (req, res) => {
    const { title, content, linkFlairID, postedBy, postedDate, commentIDs, views, communityID } = req.body;
    try {
        const newPost = new Post({
            title, 
            content,
            linkFlairID,
            postedBy,
            postedDate,
            commentIDs,
            views,
        });

        const savedPost = await newPost.save();
        
        const updatedCommunity = await Community.findByIdAndUpdate(
            communityID,
            { $push: { postIDs: savedPost._id }},
            { new: true }
        );

        res.status(201).json(savedPost);
    } catch (error) {
        res.status(500).json({ message: 'Error creating post', error });
    }
});

app.post('/api/posts/edit', async (req, res) => {
    const { postID, editedTitle, editedLinkFlairID, editedContent } = req.body;
    try {
        const updatedPost = await Post.findByIdAndUpdate(
            postID,
            { title: editedTitle, linkFlairID: editedLinkFlairID, content: editedContent },
            { new: true }
        );

        if (!updatedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.status(200).json(updatedPost);
    } catch (error) {
        console.error('Error editing post: ', error);
        res.status(500).json({ message: 'Error editing post', error });
    }
});

const deleteCommentsRecursively = async (commentIDs) => {
    for (const commentID of commentIDs) {
        const comment = await Comment.findById(commentID);

        if (comment) {
            if (comment.commentIDs && comment.commentIDs.length > 0) {
                await deleteCommentsRecursively(comment.commentIDs);
            }

            await Comment.findByIdAndDelete(commentID);
        }
    }
};

app.post('/api/posts/delete', async (req, res) => {
    const { postID } = req.body;

    try {
        const post = await Post.findById(postID);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.commentIDs && post.commentIDs.length > 0) {
            await deleteCommentsRecursively(post.commentIDs);
        }

        await Post.findByIdAndDelete(postID);

        res.status(200).json({ message: 'Post and associated comments deleted successfully' });
    } catch (error) {
        console.error('Error deleting post and comments:', error);
        res.status(500).json({ message: 'Error deleting post and comments', error });
    }
});

app.post('/api/vote', async (req, res) => {
    const { postID, opUser, username, voteType } = req.body;
    console.log(req.body);
    try {
        const user = await User.findOne({ username });
        const op = await User.findOne({ username: opUser });
        const opID = op._id;
        const userID = user._id;    
        
        if (user.reputation < 50){
            return res.status(403).json({ message: 'User does not have enough reputation to vote'}); 
        }

        let post = await Post.findById(postID);

        if (!post){
            post = await Comment.findById(postID);
        }

        if (!post) {
            res.status(404).json({ message: 'Post not found' });
        }

        let update = {};

        if (voteType === 'upvote') {
            if (!post.upvoteList.includes(userID)) {
                update = {
                    $addToSet: { upvoteList: userID },
                    $pull: { downvoteList: userID }
                };
                reputationUpdate = {
                    $inc: { reputation: post.downvoteList.includes(userID) ? 15 : 5 }
                };
            } else {
                update = {
                    $pull: { upvoteList: userID }
                };
                reputationUpdate = {
                    $inc: { reputation: -5 }
                };
            }
        } else if (voteType === 'downvote') {
            if (!post.downvoteList.includes(userID)) {
                update = {
                    $addToSet: { downvoteList: userID },
                    $pull: { upvoteList: userID }
                };
                reputationUpdate = {
                    $inc: { reputation: post.upvoteList.includes(userID) ? -15 : -10 }
                };
            } else {
                update = {
                    $pull: { downvoteList: userID }
                };
                reputationUpdate = {
                    $inc: { reputation: 10 }
                };
            }
        }

        const updatedPost = await Post.findByIdAndUpdate(
            postID,
            update,
            { new: true }
        );

        const updatedUser = await User.findByIdAndUpdate(
            opID,
            reputationUpdate,
            { new: true }
        );


        if (updatedPost === null) {
            await Comment.findByIdAndUpdate(
                postID,
                update,
                { new: true }
            );
        }

        return res.status(200).json({ message: `${voteType} successful`, updatedPost: updatedPost });
    } catch (error) {
        console.error('Error updating vote:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

app.get('/api/comments', async (req, res) => {
    try {
        const comments = await Comment.find();
        res.json(comments);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error });
    }
});

app.post('/api/comment', async (req, res) => {
    const { content, commentIDs, commentedBy, commentedDate, postID, communityID} = req.body;

    try {
        const user = await User.findOne({ username: commentedBy });
        const userID = user._id;    

        const newComment = new Comment({
            content,
            commentIDs,
            commentedBy,
            commentedDate,
        });

        const savedComment = await newComment.save();

        await Post.findByIdAndUpdate(
            postID,
            { $push: { commentIDs: savedComment._id } },
            { new: true }
        );

        await Community.findByIdAndUpdate(
            communityID,
            {$addToSet: {members: commentedBy}},
            {new: true}
        )

        res.status(201).json(savedComment);
    } catch (error) {
        res.status(500).json({ message: 'Error creating post', error });
    }
});

app.post('/api/comment/edit', async (req, res) => {
    const { commentID, content } = req.body;

    try {
        const updatedComment = await Comment.findByIdAndUpdate(
            commentID,
            { content },
            { new: true }
        );

        if (!updatedComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        res.status(200).json(updatedComment);
    } catch (error) {
        console.error('Error editing comment:', error);
        res.status(500).json({ message: 'Error editing comment', error });
    }
});

app.post('/api/comment/delete', async (req, res) => {
    const { commentID } = req.body;

    try {
        // Convert the commentID to ObjectId
        const objectId = new mongoose.Types.ObjectId(commentID);

        // Delete the comment
        const deletedComment = await Comment.findByIdAndDelete(objectId);

        if (!deletedComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        console.log('Deleting comment with ID:', objectId);

        // Remove references to the deleted comment in related posts
        const updatedPosts = await Post.updateMany(
            { commentIDs: objectId },
            { $pull: { commentIDs: objectId } }
        );

        console.log('Updated Posts:', updatedPosts);

        // Remove references to the deleted comment in other comments
        const updatedComments = await Comment.updateMany(
            { commentIDs: objectId },
            { $pull: { commentIDs: objectId } }
        );

        console.log('Updated Comments:', updatedComments);

        res.status(200).json({
            message: 'Comment deleted successfully',
            updatedPosts: updatedPosts.modifiedCount,
            updatedComments: updatedComments.modifiedCount,
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Error deleting comment', error });
    }
});

app.post('/api/reply', async (req, res) => {
    const { content, commentIDs, commentedBy, commentedDate, commentID, communityID } = req.body;
    try {
        const newComment = new Comment({
            content,
            commentIDs,
            commentedBy,
            commentedDate
        });

        const savedComment = await newComment.save();

        await Comment.findByIdAndUpdate(
            commentID,
            { $push: { commentIDs: savedComment._id } },
            { new: true }
        );

        await Community.findByIdAndUpdate(
            communityID,
            {$addToSet: {members: commentedBy}},
            {new: true}
        )

        res.status(201).json(savedComment);
    } catch (error) {
        res.status(500).json({ message: 'Error creating post', error });
    }
});

app.get('/api/linkflairs', async (req, res) => {
    try {
        const linkflairs = await LinkFlair.find();
        res.json(linkflairs);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching linkflairs', error });
    }
});

app.post('/api/linkflairs', async (req, res) => {
    const { content } = req.body;

    try {

        const foundLinkFlair = await LinkFlair.findOne({
            content: content,
        });

        if (foundLinkFlair) {
            return res.status(400).json(foundLinkFlair);
        }

        let newLinkFlair = new LinkFlair({
            content: content,
        });

        const savedLinkFlair = await newLinkFlair.save();
        res.status(201).json(savedLinkFlair);
    } catch (error) {
        res.status(500).json({ message: 'Error creating linkflair', error });
    }
});

// Export the app and connectDB
module.exports = { app, connectDB, deleteCommentsRecursively };

// Start the server if not in test mode
if (require.main === module) {
    connectDB()
        .then(() => {
            app.listen(8000, () => {
                console.log("Server listening on port 8000...");
            });
        })
        .catch((err) => console.error("MongoDB connection error:", err));
}