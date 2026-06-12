const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'medai-reports',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'tiff', 'bmp'],
    resource_type: 'auto',
    transformation: [{ quality: 'auto' }]
  }
});

module.exports = { cloudinary, storage };
