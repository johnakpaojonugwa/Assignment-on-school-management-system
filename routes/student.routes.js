import express from 'express';
import { addStudent, studentLogin, studentLogout, deleteStudent, updateStudent, getStudentById, getAllStudents } from '../controllers/student.controller.js';
import { authorize, protect } from '../middlewares/authMiddleware.js';
import uploadMiddleware from '../utils/upload.js';



const router = express.Router();

// Routes to create a new student
router.post('/add', protect, authorize('admin'), uploadMiddleware, addStudent);
// Routes to get all students
router.get('/', protect, getAllStudents);
// Routes to get a single student
router.get('/:studentId', protect, getStudentById);
// Routes to login student
router.post('/login', studentLogin);
// Routes to logout student
router.post('/logout/:studentId', protect, studentLogout);
// Routes to update student details
router.put('/:studentId', protect, authorize('admin'), uploadMiddleware, updateStudent);
// Routes to delete student
router.delete('/:studentId', protect, authorize('admin'), deleteStudent);

export default router;