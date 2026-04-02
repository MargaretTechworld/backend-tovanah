const Application = require('../models/Application');
const sendEmail = require('../utils/sendEmail');
const Course = require('../models/courseModel');

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
    
    // Send confirmation email to student
    try {
      const course = await Course.findById(req.body.course);
      await sendEmail({
        email: req.body.personalInfo.email,
        subject: `Enrollment Received: ${course.title}`,
        message: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #3b82f6;">Thank You for Your Application!</h2>
            <p>Dear ${req.body.personalInfo.fullName},</p>
            <p>We've received your enrollment request for <strong>${course.title}</strong> at Tovanah Consulting.</p>
            <p>Our admissions team is currently reviewing your application. You can track your status anytime in your <a href="https://tovaah-frontend.onrender.com/portal">Student Portal</a>.</p>
            <div style="margin: 20px 0; padding: 15px; background-color: #f8fafc; border-radius: 8px;">
               <strong>Application ID:</strong> ${createdApplication._id}<br/>
               <strong>Status:</strong> Pending Review
            </div>
            <p>Best Regards,<br/><strong>Tovanah Consulting Team</strong></p>
          </div>
        `
      });
    } catch (emailErr) {
      console.error('Email notification failed:', emailErr);
    }

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
      
      // Send status update email to student
      try {
        const fullApp = await Application.findById(updatedApplication._id).populate('course', 'title');
        await sendEmail({
          email: fullApp.personalInfo.email,
          subject: `Status Update: ${fullApp.course.title}`,
          message: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: ${updatedApplication.status === 'Approved' ? '#10b981' : '#ef4444'};">Your Application was ${updatedApplication.status}</h2>
              <p>Dear ${fullApp.personalInfo.fullName},</p>
              <p>The review for your enrollment in <strong>${fullApp.course.title}</strong> is complete.</p>
              <div style="margin: 20px 0; padding: 15px; background-color: ${updatedApplication.status === 'Approved' ? '#f0fdf4' : '#fef2f2'}; border-radius: 8px;">
                 <strong>Status:</strong> ${updatedApplication.status}<br/>
                 ${req.body.remarks ? `<strong>Admissions Remarks:</strong> ${req.body.remarks}` : ''}
              </div>
              ${updatedApplication.status === 'Approved' 
                ? '<p>Please log in to your <a href="https://tovaah-frontend.onrender.com/portal">Student Portal</a> to complete your payment and begin your learning journey.</p>' 
                : '<p>If you have any questions regarding this decision, please contact our support team.</p>'}
              <p>Best Regards,<br/><strong>Tovanah Consulting Team</strong></p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error('Status email failed:', emailErr);
      }

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

// @desc    Get the latest application for the logged in user (for pre-filling)
// @route   GET /api/applications/mine/latest
// @access  Private
const getLatestApplication = async (req, res) => {
  try {
    const application = await Application.findOne({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(application || {});
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitApplication,
  getMyApplications,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
  getLatestApplication,
};
