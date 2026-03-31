const Application = require('../models/Application');

// @desc    Submit a new course application
// @route   POST /api/applications
// @access  Private
const submitApplication = async (req, res) => {
  try {
    const application = new Application({
      user: req.user._id,
      course: req.body.course,
      ...req.body
    });

    const createdApplication = await application.save();
    res.status(201).json(createdApplication);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Invalid application data' });
  }
};

// @desc    Get logged in user applications
// @route   GET /api/applications/mine
// @access  Private
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user._id })
      .populate('course', 'title price image')
      .sort({ createdAt: -1 });

    // Filter out applications for courses that have been deleted
    const validApplications = applications.filter(app => app.course !== null);
    res.json(validApplications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private/Admin
const getApplications = async (req, res) => {
  try {
    const applications = await Application.find({})
      .populate('user', 'name email')
      .populate('course', 'title price')
      .sort({ createdAt: -1 });

    // Filter out applications for courses that have been deleted
    const validApplications = applications.filter(app => app.course !== null);
    res.json(validApplications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get application by ID
// @route   GET /api/applications/:id
// @access  Private/Admin
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('user', 'name email')
      .populate('course', 'title price');

    if (application) {
      res.json(application);
    } else {
      res.status(404).json({ message: 'Application not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id
// @access  Private/Admin
const updateApplicationStatus = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (application) {
      application.status = req.body.status || application.status;
      application.adminFields = {
        reviewedBy: req.user._id,
        remarks: req.body.remarks || application.adminFields?.remarks,
        dateReviewed: Date.now()
      };

      const updatedApplication = await application.save();
      res.json(updatedApplication);
    } else {
      res.status(404).json({ message: 'Application not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete an application
// @route   DELETE /api/applications/:id
// @access  Private
const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if the user owns this application
    if (application.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this application' });
    }

    // Optional: Only allow deletion if not already processed in a completed order
    // (A simple check for now since we don't have isPaid on Application yet)
    if (application.status === 'Approved' && req.body.confirmedDelete !== true) {
      // If approved, maybe ask for extra confirmation in frontend or just allow it
    }

    await application.deleteOne();
    res.json({ message: 'Application removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = {
  submitApplication,
  getMyApplications,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication
};
