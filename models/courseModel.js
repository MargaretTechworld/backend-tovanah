const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructor: { type: String, required: true },
    duration: { type: String, required: true },
    price: { type: Number, required: true },
    level: { type: String, required: true },
    videoUrl: { type: String },
    image: { type: String }, // URL to image
    mode: {
        type: String,
        required: true,
        enum: ['Online', 'In-person'],
        default: 'Online'
    },
    zoomLink: { type: String }, // Only if mode is Online
    location: { type: String }, // Only if mode is In-person
    outcomes: [{ type: String }],
    requirements: [{ type: String }],
    modules: [{ type: String }],
}, {
    timestamps: true,
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
