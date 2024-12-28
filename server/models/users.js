const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    first: { type: String, required: true },
    last: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    reputation: { type: Number, default: 100 },
    createdDate: { type: Date, default: Date.now },

    // // References to joined communities
    // communities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }],
    // posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    // comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comments' }],

    isAdmin: { type: Boolean, default: false },
});

userSchema.virtual('profileUrl').get(function () {
    return `/users/${this._id}`;
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
