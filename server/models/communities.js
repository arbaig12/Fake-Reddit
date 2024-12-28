// Community Document Schema
const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    postIDs: { type: Array, required: false },
    startDate: { type: Date, required: true },
    members: { type: Array, required: true },
    createdBy: { type: String, required: true },
});

communitySchema.virtual('url').get(function () {
    return `/communities/${this._id}`;
});

communitySchema.set('toJSON', { virtuals: true });
communitySchema.set('toObject', { virtuals: true });

// Create the model based on the schema
const CommunityModel = mongoose.model('Community', communitySchema);

module.exports = CommunityModel;
