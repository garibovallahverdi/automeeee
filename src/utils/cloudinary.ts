// import { v2 as cloudinary } from 'cloudinary';
// import dotenv from 'dotenv'
// import { CloudinaryStorage } from 'multer-storage-cloudinary';
// import multer from 'multer';
// dotenv.config()
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key:  process.env.CLOUDINARY_API_KEY,
//   api_secret:  process.env.CLOUDINARY_API_SECRET
// })

// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//       folder: 'your-folder-name',
//       allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
//     },
//   });
  
//   // Multer'ı Cloudinary ile yapılandırın
//   const upload = multer({ storage });
  
//   export default upload;