const mongoose = require('mongoose');
const Post = require('./models/posts');
const Comment = require('./models/comments');
const { deleteCommentsRecursively } = require('./server'); // Ensure you export this utility function if needed

beforeAll(async () => {
    // Connect to MongoDB test database
    await mongoose.connect('mongodb://127.0.0.1:27017/phreddit_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterAll(async () => {
    // Disconnect from MongoDB
    await mongoose.connection.close();
});

describe('Post Deletion Test', () => {
    let postID;
    let commentIDs = [];

    beforeEach(async () => {
        // Set up a test post with comments and nested replies
        const reply1 = await Comment.create({
            content: 'Reply 1', 
            commentIDs: [], 
            commentedDate: new Date(Date.now()), 
            commentedBy: 'Test User'
        });
        const reply2 = await Comment.create({ 
            content: 'Reply 2', 
            commentIDs: [], 
            commentedDate: new Date(Date.now()), 
            commentedBy: 'Test User' 
        });
        const nestedComment = await Comment.create({
            content: 'Nested Comment',
            commentIDs: [reply1._id, reply2._id],
            commentedDate: new Date(Date.now()),
            commentedBy: 'Test User',
        });
        const mainComment = await Comment.create({
            content: 'Main Comment',
            commentIDs: [nestedComment._id],
            commentedDate: new Date(Date.now()),
            commentedBy: 'Test User',
        });
        const post = await Post.create({
            title: 'Test Post',
            content: 'This is a test post',
            commentIDs: [mainComment._id],
            views: 0,
            postedDate: new Date(Date.now()),
            postedBy: 'Test User',
        });

        postID = post._id;
        commentIDs = [mainComment._id, nestedComment._id, reply1._id, reply2._id];
    });

    afterEach(async () => {
        // Clean up the test data
        await Post.deleteMany({});
        await Comment.deleteMany({});
    });

    test('Deletes post and all associated comments', async () => {
        // Ensure initial data exists
        const initialPost = await Post.findById(postID);
        const initialComments = await Comment.find({ _id: { $in: commentIDs } });
        expect(initialPost).not.toBeNull();
        expect(initialComments.length).toBe(commentIDs.length);

        // Run the deletion operation
        if (initialPost.commentIDs && initialPost.commentIDs.length > 0) {
            await deleteCommentsRecursively(initialPost.commentIDs);
        }
        await Post.findByIdAndDelete(postID);

        // Verify post is deleted
        const deletedPost = await Post.findById(postID);
        expect(deletedPost).toBeNull();

        // Verify comments are deleted
        const remainingComments = await Comment.find({ _id: { $in: commentIDs } });
        expect(remainingComments.length).toBe(0);
    });
});
