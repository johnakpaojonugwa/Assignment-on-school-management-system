import multer from 'multer';
import dotenv from 'dotenv';
import  { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

// cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

// cloudinary storage config
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        const folder = file.fieldname === 'avatar'
        ? 'teacher-avatar'
        : file.fieldname === 'backCover'
        ? 'course-avatar'
        : file.fieldname === 'student_avatar'
        ? 'student-avatar'
        : 'default';

        const allowedFormats = file.mimetype.startsWith('video/')
        ? ['mp4', 'mov', 'avi']
        : ['jpg', 'jpeg', 'png', 'gif', 'webp']

        return {
            folder: folder,
            allowed_formats: allowedFormats,
            resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image'
        }
    }
})

// multer config
const upload = multer({
    storage,
    limit: {fileSize: 1024 * 1024 * 5}, 
    fileFilter(req, file, cb) {
        console.log("file details: ", file)
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/mov', 'video/avi']

        if (!allowedTypes.includes(file.mimetype)) {
            const error = new Error('invalid file type')
            error.code = 'LIMITED_FILE_TYPE';
            return cb(error)
        }
        cb(null, true);
    },

}).fields([
    {name: 'avatar'},
    {name: 'backCover'},
    {name: 'student_avatar'},
    {name: 'course_avatar'},
    {name: 'teacher_avatar'},
    {name: 'images'},
])

// Middleware to handle file upload
const uploadMiddleware = (req, res, next) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.log('Multer error: ', err);
            return res.status(400).json({ message: "File upload error", error: err.message })
        }
        if (err) {
            console.error('Unknown upload error: ', err);
            res.status(400).json({ message: "File upload error", error: err.message || 'Unknown error'})
        }
        // No error, continue or debug if there is
        next()
    })
}
export default uploadMiddleware;