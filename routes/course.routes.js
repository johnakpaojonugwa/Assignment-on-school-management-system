import express from 'express';
import { createCourse, getAllCourses, getCourseById, getCoursesByLevel, updateCourse, deleteCourse } from '../controllers/course.controller.js';
import { authorize, protect } from '../middlewares/authMiddleware.js';
import uploadMiddleware from '../utils/upload.js';

const router = express.Router();

// Routes to create a new course
router.post('/create', protect, authorize('admin'), createCourse);
// Routes to get all courses
router.get('/', getAllCourses);
// Routes to get course by level
router.get('/level/:classLevel', getCoursesByLevel);
// Routes to get course by ID
router.get('/:courseId', getCourseById);
// Routes to update course
router.put('/:courseId', protect, authorize('admin'), uploadMiddleware, updateCourse);
// Routes to delete course
router.delete('/:courseId', protect, authorize('admin'), deleteCourse);

export default router;




