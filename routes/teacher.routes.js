import express from 'express';
import { createTeacher, getAllTeachers, getSingleTeacher, loginTeacher, updateTeacher, logoutTeacher, deleteTeacher } from '../controllers/teacher.controller.js';
import uploadMiddleware from '../utils/upload.js';
import { authorize, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route to register a new teacher
router.post('/create',protect, authorize('admin'), uploadMiddleware, createTeacher);
//Route to login teacher
router.post('/login', loginTeacher);
// Route to get all teachers
router.get('/', getAllTeachers);
//Route to get single teacher
router.get('/:teacherId', getSingleTeacher);
//Route to update teacher details
router.put('/:teacherId', protect, authorize('admin'), uploadMiddleware, updateTeacher);
//route to logout teacher
router.post('/logout/:teacherId', protect, logoutTeacher);
//route to delete teacher
router.delete('/:teacherId', protect, authorize('admin'), deleteTeacher);

export default router;  