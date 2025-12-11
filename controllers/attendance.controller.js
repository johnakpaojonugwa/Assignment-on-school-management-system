import Attendance from '../models/attendance.model.js';
import Student from '../models/student.model.js';
import Course from '../models/course.model.js';
import Enrollment from '../models/enrollment.model.js';
import Teacher from '../models/teacher.model.js';

// Mark attendance
export const markAttendance = async (req, res) => {
    const { studentId, courseId, enrollmentId, attendanceDate, status, remarks, recordedBy } = req.body;

    if (!studentId || !courseId || !enrollmentId || !attendanceDate || !status || !recordedBy) {
        return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
    }

    if (!['Present', 'Absent', 'Late', 'Excused'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status. Use: Present, Absent, Late, or Excused.' });
    }

    try {
        // Validate all references exist
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }

        const enrollment = await Enrollment.findById(enrollmentId);
        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Enrollment not found.' });
        }

        const teacher = await Teacher.findById(recordedBy);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found.' });
        }

        // Check if attendance record already exists for this date
        const existingAttendance = await Attendance.findOne({ studentId, courseId, attendanceDate });
        if (existingAttendance) {
            return res.status(409).json({ success: false, message: 'Attendance already marked for this student on this date.' });
        }

        const newAttendance = new Attendance({
            studentId,
            courseId,
            enrollmentId,
            attendanceDate,
            status,
            remarks,
            recordedBy
        });

        await newAttendance.save();
        res.status(201).json({ success: true, message: 'Attendance marked successfully.', data: newAttendance });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}

// Get attendance by student and course
export const getAttendanceByStudentCourse = async (req, res) => {
    const { studentId, courseId } = req.params;
    try {
        const attendance = await Attendance.find({ studentId, courseId })
            .populate('studentId', 'firstName lastName email')
            .populate('courseId', 'courseTitle courseCode')
            .populate('enrollmentId')
            .populate('recordedBy', 'firstName lastName email');

        if (attendance.length === 0) {
            return res.status(404).json({ success: false, message: 'No attendance records found.' });
        }

        res.status(200).json({ success: true, total: attendance.length, message: 'Attendance retrieved successfully.', data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}

// Get attendance by date
export const getAttendanceByDate = async (req, res) => {
    const { attendanceDate } = req.params;
    try {
        const attendance = await Attendance.find({ attendanceDate })
            .populate('studentId', 'firstName lastName email')
            .populate('courseId', 'courseTitle courseCode')
            .populate('enrollmentId')
            .populate('recordedBy', 'firstName lastName email');

        if (attendance.length === 0) {
            return res.status(404).json({ success: false, message: 'No attendance records found for this date.' });
        }

        res.status(200).json({ success: true, total: attendance.length, message: 'Attendance retrieved successfully.', data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}

// Get attendance by course
export const getAttendanceByCourse = async (req, res) => {
    const { courseId } = req.params;
    try {
        const attendance = await Attendance.find({ courseId })
            .populate('studentId', 'firstName lastName email')
            .populate('courseId', 'courseTitle courseCode')
            .populate('enrollmentId')
            .populate('recordedBy', 'firstName lastName email');

        if (attendance.length === 0) {
            return res.status(404).json({ success: false, message: 'No attendance records found for this course.' });
        }

        res.status(200).json({ success: true, total: attendance.length, message: 'Attendance retrieved successfully.', data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}

// Get attendance by student
export const getAttendanceByStudent = async (req, res) => {
    const { studentId } = req.params;
    try {
        const attendance = await Attendance.find({ studentId })
            .populate('studentId', 'firstName lastName email')
            .populate('courseId', 'courseTitle courseCode')
            .populate('enrollmentId')
            .populate('recordedBy', 'firstName lastName email');

        if (attendance.length === 0) {
            return res.status(404).json({ success: false, message: 'No attendance records found for this student.' });
        }

        res.status(200).json({ success: true, total: attendance.length, message: 'Attendance retrieved successfully.', data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}

// Update attendance
export const updateAttendance = async (req, res) => {
    const { attendanceId } = req.params;
    const { status, remarks } = req.body;

    if (!status && !remarks) {
        return res.status(400).json({ success: false, message: 'At least one field must be provided to update.' });
    }

    if (status && !['Present', 'Absent', 'Late', 'Excused'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    try {
        const attendance = await Attendance.findByIdAndUpdate(
            attendanceId,
            { status, remarks },
            { new: true }
        ).populate('studentId', 'firstName lastName email')
         .populate('courseId', 'courseTitle courseCode')
         .populate('recordedBy', 'firstName lastName email');

        if (!attendance) {
            return res.status(404).json({ success: false, message: 'Attendance record not found.' });
        }

        res.status(200).json({ success: true, message: 'Attendance updated successfully.', data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}

// Delete attendance
export const deleteAttendance = async (req, res) => {
    const { attendanceId } = req.params;
    try {
        const attendance = await Attendance.findByIdAndDelete(attendanceId);
        if (!attendance) {
            return res.status(404).json({ success: false, message: 'Attendance record not found.' });
        }
        res.status(200).json({ success: true, message: 'Attendance deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}

// Get attendance statistics for a student in a course
export const getAttendanceStats = async (req, res) => {
    const { studentId, courseId } = req.params;
    try {
        const attendanceRecords = await Attendance.find({ studentId, courseId });

        if (attendanceRecords.length === 0) {
            return res.status(404).json({ success: false, message: 'No attendance records found.' });
        }

        const total = attendanceRecords.length;
        const present = attendanceRecords.filter(a => a.status === 'Present').length;
        const absent = attendanceRecords.filter(a => a.status === 'Absent').length;
        const late = attendanceRecords.filter(a => a.status === 'Late').length;
        const excused = attendanceRecords.filter(a => a.status === 'Excused').length;
        const attendancePercentage = ((present + late) / total * 100).toFixed(2);

        res.status(200).json({
            success: true,
            message: 'Attendance statistics retrieved successfully.',
            data: {
                total,
                present,
                absent,
                late,
                excused,
                attendancePercentage: `${attendancePercentage}%`
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}