// LinkFlair Document Schema
const mongoose = require('mongoose');

const linkFlairSchema = new mongoose.Schema({
    content: { type: String, required: true },
    url: { type: String, required: false }
});

// Create the model based on the schema
const LinkFlairModel = mongoose.model('LinkFlair', linkFlairSchema);

module.exports = LinkFlairModel;