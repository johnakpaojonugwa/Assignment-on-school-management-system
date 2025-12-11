import express from 'express';
import {
    createEnrollment,
    getEnrollmentsByStudent,
    getEnrollmentsByCourse,
    getEnrollmentById,
    updateEnrollment,
    deleteEnrollment,
    getCourseEnrollmentStats,
    getStudentGradeReport
} from '../controllers/enrollment.controller.js';
import { authorize, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Create enrollment (enroll student in course)
router.post('/', protect, authorize('admin'), createEnrollment);

// Get enrollments by student
router.get('/student/:studentId', getEnrollmentsByStudent);

// Get student grade report
router.get('/student/:studentId/grades', getStudentGradeReport);

// Get enrollments by course
router.get('/course/:courseId', getEnrollmentsByCourse);

// Get course enrollment statistics
router.get('/course/:courseId/stats', getCourseEnrollmentStats);

// Get single enrollment
router.get('/:enrollmentId', getEnrollmentById);

// Update enrollment
router.put('/:enrollmentId', protect, authorize('admin'), updateEnrollment);

// Delete enrollment
router.delete('/:enrollmentId', protect, authorize('admin'), deleteEnrollment);

export default router;
