const mongoose = require('mongoose');

const applicationSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  course: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Course' },
  status: { type: String, required: true, default: 'Pending', enum: ['Pending', 'Approved', 'Rejected'] },
  
  personalInfo: {
    fullName: { type: String, required: true },
    gender: { type: String, required: true },
    dob: { type: Date, required: true },
    nationality: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
  },

  educationalBackground: {
    highestLevel: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    institution: { type: String, required: true },
    graduationYear: { type: String, required: true },
    certifications: { type: String },
  },

  professionalInfo: {
    employmentStatus: { type: String },
    jobTitle: { type: String },
    organization: { type: String },
    yearsOfExperience: { type: String },
    industry: { type: String },
  },

  courseDetails: {
    courseApplyingFor: { type: String, required: true },
    courseCategory: { type: String, required: true },
    preferredMode: { type: String, required: true },
    preferredStartDate: { type: String },
    hearAboutUs: { type: String },
  },

  technicalInfo: {
    hasComputer: { type: Boolean, required: true },
    hasInternet: { type: Boolean, required: true },
    deviceType: { type: String, required: true },
    digitalSkillLevel: { type: String, required: true },
  },

  motivation: {
    interestReason: { type: String, required: true },
    goals: { type: String, required: true },
    priorKnowledge: { type: String },
  },

  documents: {
    idCard: { type: String },
    academicCertificates: { type: String },
    resume: { type: String },
    passportPhoto: { type: String },
  },

  declaration: {
    confirmed: { type: Boolean, required: true },
    signature: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
  },

  adminFields: {
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    remarks: { type: String },
    dateReviewed: { type: Date },
  }
}, { timestamps: true });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
