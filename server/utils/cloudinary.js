const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: 'dposu9c4n',
  api_key: '985894414217349',
  api_secret: 'XxtR4BBctMIrza_7hNlAJANQBKw'
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'live-streams',
    resource_type: 'video',
    allowedFormats: ['mp4', 'mov'],
  }
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };
