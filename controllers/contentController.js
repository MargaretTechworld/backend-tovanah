const Content = require('../models/contentModel');

// @desc    Get content for a specific page
// @route   GET /api/content/:page
// @access  Public
const getContentByPage = async (req, res) => {
    try {
        const content = await Content.findOne({ page: req.params.page });
        if (content) {
            res.json(content);
        } else {
            // Return empty structure if not found, or 404
            res.json({ page: req.params.page, sections: [] });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update/Create content for a page
// @route   POST /api/content
// @access  Private/Admin
const updateContent = async (req, res) => {
    const { page, sections } = req.body;

    try {
        let content = await Content.findOne({ page });

        if (content) {
            content.sections = sections;
            const updatedContent = await content.save();
            res.json(updatedContent);
        } else {
            const newContent = new Content({
                page,
                sections,
            });
            const createdContent = await newContent.save();
            res.status(201).json(createdContent);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all content pages (for admin list)
// @route   GET /api/content
// @access  Private/Admin
const getAllContent = async (req, res) => {
    try {
        const content = await Content.find({});
        res.json(content);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getContentByPage,
    updateContent,
    getAllContent,
};
