import express from 'express';
import {
    markAttendance,
    getAttendanceByStudentCourse,
    getAttendanceByDate,
    getAttendanceByCourse,
    getAttendanceByStudent,
    updateAttendance,
    deleteAttendance,
    getAttendanceStats
} from '../controllers/attendance.controller.js';
import { authorize, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Mark attendance
router.post('/', protect, authorize('admin'), markAttendance);

// Get attendance by student and course
router.get('/student-course/:studentId/:courseId', getAttendanceByStudentCourse);

// Get attendance by date
router.get('/date/:attendanceDate', getAttendanceByDate);

// Get attendance by course
router.get('/course/:courseId', getAttendanceByCourse);

// Get attendance by student
router.get('/student/:studentId', getAttendanceByStudent);

// Get attendance statistics
router.get('/stats/:studentId/:courseId', getAttendanceStats);

// Update attendance
router.put('/:attendanceId', protect, authorize('admin'), updateAttendance);

// Delete attendance
router.delete('/:attendanceId', protect, authorize('admin'), deleteAttendance);

export default router;