// Comment Document Schema
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: { type: String, required: true },
    commentIDs: { type: Array , required: false },
    commentedBy: { type: String, required: true },
    commentedDate: { type: Date, required: true },
    upvoteList: { type: Array , required: false },
    downvoteList: { type: Array , required: false },
    url: { type: String, required: false }
});

// Create the model based on the schema
const CommentModel = mongoose.model('Comment', commentSchema);

module.exports = CommentModel;