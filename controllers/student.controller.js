import Student from '../models/student.model.js';
import jwt from 'jsonwebtoken';
import { getPaginationParams, formatPaginatedResponse } from '../utils/pagination.js';

// Student Login
export const studentLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const student = await Student.findOne({ email });
        if (!student) {
            return res.status(400).json({ success: false, message: 'Invalid email or password.' });
        }
        const isMatch = await student.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const token = jwt.sign({ id: student._id, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '2d' });

        // Update login status without triggering full validation
        await Student.findByIdAndUpdate(
            student._id,
            {
                isLoggedIn: true,
                isOnline: true,
                lastLoggedIn: Date.now()
            },
            { new: true }
        );

        const studentData = student.toObject();
        delete studentData.password;
        res.status(200).json({ success: true, message: "Login successful", data: { token, student: studentData } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}

// Student Logout
export const studentLogout = async (req, res) => {
    const { studentId } = req.params;
    try {
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }
        student.isLoggedIn = false;
        student.isOnline = false;
        await student.save();
        res.status(200).json({ success: true, message: 'Logout successful.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}

//Create Student Profile
export const addStudent = async (req, res) => {
    const { firstName, lastName, email, password, gender, grade, guardian, classLevel } = req.body;

    if (!firstName || !lastName || !email || !password || !gender || !grade || !guardian || !classLevel) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        const student = await Student.findOne({ email });
        const avatar = req.files?.student_avatar?.[0]?.path || null;
        if (student) {
            return res.status(409).json({ success: false, message: 'Student with this email already exists.' });
        }
        const newStudent = new Student({ firstName, lastName, email, password, gender, grade, guardian, classLevel, student_avatar: avatar });
        await newStudent.save();
        res.status(201).json({ success: true, message: 'Student registered successfully.', data: newStudent });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}

// Get all students
export const getAllStudents = async (req, res) => {
    try {
        const student = await Student.find().select('-password');
        if (student.length === 0) {
            return res.status(404).json({ success: false, message: 'No students found.' });
        }
        res.status(200).json({ success: true, total: student.length, message: 'Students retrieved successfully.', data: student });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });    
    }
}

// Get single student by ID
export const getStudentById = async (req, res) => {
    const { studentId } = req.params;
    try {
        const student = await Student.findById(studentId).select('-password');
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }
        res.status(200).json({ success: true, message: 'Student retrieved successfully.', data: student });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}

// Update student profile
export const updateStudent = async (req, res) => {
    const { studentId } = req.params;
    try {
        const updateData = { ...req.body };
        
        // Handle avatar upload if file exists
        if (req.files?.student_avatar?.[0]?.path) {
            updateData.student_avatar = req.files.student_avatar[0].path;
        }
        
        const student = await Student.findByIdAndUpdate(studentId, updateData, { new: true }).select('-password');
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }
        res.status(200).json({ success: true, message: 'Student updated successfully.', data: student });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });    
    }
}

// Delete student profile
export const deleteStudent = async (req, res) => {
    const { studentId } = req.params;
    try {
        const student = await Student.findByIdAndDelete(studentId);
        if (!student) {
            return res.status(400).json({ success: false, message: "No teacher found." });
        }
        res.status(200).json({ success: true, message: 'Student deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message })
    }
}