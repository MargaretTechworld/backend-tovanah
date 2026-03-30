const path = require('path');
const express = require('express');
const multer = require('multer');
const { protect, admin } = require('../middleware/authMiddleware');

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage Selection Logic
let storage;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    console.log('[Upload] Using Cloudinary Storage');
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'tovanah_uploads',
            allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
        },
    });
} else {
    console.warn('[Upload] Cloudinary keys missing, using local disk storage (non-persistent on Render)');
    storage = multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            cb(
                null,
                `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
            );
        },
    });
}

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype) || file.mimetype.includes('pdf') || file.mimetype.includes('document') || file.mimetype.includes('msword');

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images and Documents only!');
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Increased to 10MB limit for docs
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

router.post('/', protect, (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.error(`[MulterError] ${err.message}`);
            return res.status(400).json({ message: `Multer upload error: ${err.message}` });
        } else if (err) {
            // An unknown error occurred when uploading.
            console.error(`[UploadError] ${err}`);
            return res.status(400).json({ message: err });
        }

        // Everything went fine.
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log(`[FileUploaded] ${req.file.path}`);
        res.send(`/${req.file.path.replace(/\\/g, '/')}`);
    });
});

module.exports = router;
