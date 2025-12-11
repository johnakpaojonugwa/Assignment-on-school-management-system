import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { validateEnv } from './config/validateEnv.js';
import { corsOptions } from './middlewares/cors.js';
import { errorHandler } from './middlewares/errorHandler.js';
import teacherRoutes from './routes/teacher.routes.js';
import studentRoutes from './routes/student.routes.js';
import courseRoutes from './routes/course.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import enrollmentRoutes from './routes/enrollment.routes.js';
import Teacher from './models/teacher.model.js';  
import Student from './models/student.model.js';  
import Course from './models/course.model.js';
import Attendance from './models/attendance.model.js';
import Enrollment from './models/enrollment.model.js';

dotenv.config();

// Validate environment variables
validateEnv();

const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDB();

// Routes
app.use('/api/v1/teachers', teacherRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/attendance', attendanceRoutes);

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});