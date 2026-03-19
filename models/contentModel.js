const mongoose = require('mongoose');

const contentSchema = mongoose.Schema({
    page: { type: String, required: true, unique: true }, // e.g., 'home', 'about'
    sections: [{
        key: { type: String, required: true }, // e.g., 'mission_statement'
        content: { type: String, required: true }, // The text content
        image: { type: String } // Optional image URL
    }]
}, {
    timestamps: true,
});

const Content = mongoose.model('Content', contentSchema);
module.exports = Content;
