import Course from '../models/course.model.js';
import Teacher from '../models/teacher.model.js';

// Create a new course
export const createCourse = async (req, res) => {
    const { courseTitle, courseCode, description, credits, classLevel, teacherId, semester, maxStudents, schedule } = req.body;

    if (!courseTitle || !courseCode || !credits || !classLevel || !teacherId || !semester || !maxStudents) {
        return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
    }

    try {
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found. Please provide a valid teacherId.' });
        }

        const existingCourse = await Course.findOne({ courseCode });
        if (existingCourse) {
            return res.status(409).json({ success: false, message: 'Course with this code already exists.' });
        }

        const newCourse = new Course({ courseTitle, courseCode, description, credits, classLevel, teacherId, semester, maxStudents, schedule });
        await newCourse.save();
        res.status(201).json({ success: true, message: 'Course created successfully.', data: newCourse });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}

// Get all courses
export const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate('teacherId', 'firstName lastName email');
        if (courses.length === 0) {
            return res.status(404).json({ success: false, message: 'No courses found.' });
        }
        res.status(200).json({ success: true, total: courses.length, message: 'Courses retrieved successfully.', data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}

// Get single course by ID
export const getCourseById = async (req, res) => {
    const { courseId } = req.params;
    try {
        const course = await Course.findById(courseId).populate('teacherId', 'firstName lastName email');
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }
        res.status(200).json({ success: true, message: 'Course retrieved successfully.', data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}

// Get courses by class level
export const getCoursesByLevel = async (req, res) => {
    const { classLevel } = req.params;
    try {
        const courses = await Course.find({ classLevel }).populate('teacherId', 'firstName lastName email');
        if (courses.length === 0) {
            return res.status(404).json({ success: false, message: `No courses found for ${classLevel} level.` });
        }
        res.status(200).json({ success: true, total: courses.length, message: 'Courses retrieved successfully.', data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}

// Update course
export const updateCourse = async (req, res) => {
    const { courseId } = req.params;
    const { courseCode, teacherId, ...otherUpdates } = req.body;

    try {
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }

        // Check if courseCode is being changed to a duplicate
        if (courseCode && courseCode !== course.courseCode) {
            const existingCourse = await Course.findOne({ courseCode });
            if (existingCourse) {
                return res.status(409).json({ success: false, message: 'Course with this code already exists.' });
            }
        }

        // Check if teacher exists
        if (teacherId) {
            const teacher = await Teacher.findById(teacherId);
            if (!teacher) {
                return res.status(404).json({ success: false, message: 'Teacher not found. Please provide a valid teacherId.' });
            }
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            courseId, 
            { courseCode, teacherId, ...otherUpdates }, 
            { new: true }
        ).populate('teacherId', 'firstName lastName email');

        res.status(200).json({ success: true, message: 'Course updated successfully.', data: updatedCourse });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}

// Delete course
export const deleteCourse = async (req, res) => {
    const { courseId } = req.params;
    try {
        const course = await Course.findByIdAndDelete(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }
        res.status(200).json({ success: true, message: 'Course deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}