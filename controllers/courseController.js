const Course = require('../models/courseModel');

// @desc    Fetch all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find({});
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single course
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (course) {
            res.json(course);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (course) {
            await course.deleteOne();
            res.json({ message: 'Course removed' });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = async (req, res) => {
    try {
        const {
            title,
            description,
            instructor,
            duration,
            price,
            level,
            mode,
            zoomLink,
            location,
            videoUrl,
            image,
            outcomes,
            requirements,
            modules,
        } = req.body;

        const course = new Course({
            title: title || 'New Course',
            description: description || 'Course description',
            instructor: instructor || 'Instructor Name',
            duration: duration || 'TBD',
            price: price || 0,
            level: level || 'Beginner',
            mode: mode || 'Online',
            videoUrl: videoUrl || '',
            image: image || '/images/sample.jpg',
            zoomLink: zoomLink || '',
            location: location || '',
            outcomes: outcomes || [],
            requirements: requirements || [],
            modules: modules || [],
            user: req.user._id,
        });

        const createdCourse = await course.save();
        res.status(201).json(createdCourse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = async (req, res) => {
    try {
        const {
            title,
            description,
            instructor,
            duration,
            price,
            level,
            mode,
            zoomLink,
            location,
            outcomes,
            requirements,
            modules,
            videoUrl,
        } = req.body;

        const course = await Course.findById(req.params.id);

        if (course) {
            course.title = title || course.title;
            course.description = description || course.description;
            course.instructor = instructor || course.instructor;
            course.duration = duration || course.duration;
            course.price = price !== undefined ? price : course.price;
            course.level = level || course.level;
            course.mode = mode || course.mode;
            course.zoomLink = zoomLink || course.zoomLink;
            course.location = location || course.location;
            course.outcomes = outcomes || course.outcomes;
            course.requirements = requirements || course.requirements;
            course.modules = modules || course.modules;
            course.videoUrl = videoUrl || course.videoUrl;

            const updatedCourse = await course.save();
            res.json(updatedCourse);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCourses,
    getCourseById,
    deleteCourse,
    createCourse,
    updateCourse,
};
