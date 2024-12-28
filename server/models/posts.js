// Post Document Schema
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    linkFlairID: { type: mongoose.Schema.Types.ObjectId, ref: 'LinkFlair', required: false }, // Reference to LinkFlair
    postedBy: { type: String, required: true },
    postedDate: { type: Date, required: true },
    commentIDs: { type: Array, required: false },
    views: { type: Number, required: true },
    upvoteList: { type: Array , required: false },
    downvoteList: { type: Array , required: false },
});

// Define a virtual URL property
postSchema.virtual('url').get(function () {
    return `/posts/${this._id}`;
});

postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

// Create the model based on the schema
const PostModel = mongoose.model('Post', postSchema);

module.exports = PostModel;
