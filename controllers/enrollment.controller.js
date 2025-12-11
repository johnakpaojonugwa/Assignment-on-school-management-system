import Enrollment from '../models/enrollment.model.js';
import Student from '../models/student.model.js';
import Course from '../models/course.model.js';

// Create enrollment (enroll student in course)
export const createEnrollment = async (req, res) => {
    const { studentId, courseId } = req.body;

    if (!studentId || !courseId) {
        return res.status(400).json({ success: false, message: 'studentId and courseId are required.' });
    }

    try {
        // Validate student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }

        // Validate course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }

        // Check if student is already enrolled in this course
        const existingEnrollment = await Enrollment.findOne({ studentId, courseId });
        if (existingEnrollment) {
            return res.status(409).json({ success: false, message: 'Student is already enrolled in this course.' });
        }

        // Check if course is full
        const enrollmentCount = await Enrollment.countDocuments({ courseId, status: 'Active' });
        if (enrollmentCount >= course.maxStudents) {
            return res.status(400).json({ success: false, message: 'Course is full. Cannot enroll more students.' });
        }

        const newEnrollment = new Enrollment({
            studentId,
            courseId,
            status: 'Active'
        });

        await newEnrollment.save();
        res.status(201).json({ success: true, message: 'Student enrolled successfully.', data: newEnrollment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}

// Get enrollments by student
export const getEnrollmentsByStudent = async (req, res) => {
    const { studentId } = req.params;
    try {
        const enrollments = await Enrollment.find({ studentId })
            .populate('studentId', 'firstName lastName email classLevel')
            .populate('courseId', 'courseTitle courseCode credits classLevel semester')
            .sort({ enrollmentDate: -1 });

        if (enrollments.length === 0) {
            return res.status(404).json({ success: false, message: 'No enrollments found for this student.' });
        }

        res.status(200).json({ success: true, total: enrollments.length, message: 'Enrollments retrieved successfully.', data: enrollments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}

// Get enrollments by course
export const getEnrollmentsByCourse = async (req, res) => {
    const { courseId } = req.params;
    try {
        const enrollments = await Enrollment.find({ courseId })
            .populate('studentId', 'firstName lastName email classLevel')
            .populate('courseId', 'courseTitle courseCode credits classLevel')
            .sort({ enrollmentDate: -1 });

        if (enrollments.length === 0) {
            return res.status(404).json({ success: false, message: 'No enrollments found for this course.' });
        }

        res.status(200).json({ success: true, total: enrollments.length, message: 'Enrollments retrieved successfully.', data: enrollments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}

// Get single enrollment
export const getEnrollmentById = async (req, res) => {
    const { enrollmentId } = req.params;
    try {
        const enrollment = await Enrollment.findById(enrollmentId)
            .populate('studentId', 'firstName lastName email classLevel')
            .populate('courseId', 'courseTitle courseCode credits classLevel');

        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Enrollment not found.' });
        }

        res.status(200).json({ success: true, message: 'Enrollment retrieved successfully.', data: enrollment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}

// Update enrollment (status, grade, marks, attendance)
export const updateEnrollment = async (req, res) => {
    const { enrollmentId } = req.params;
    const { status, grade, marks, attendance } = req.body;

    if (!status && !grade && marks === undefined && attendance === undefined) {
        return res.status(400).json({ success: false, message: 'At least one field must be provided to update.' });
    }

    if (status && !['Active', 'Completed', 'Dropped'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status. Use: Active, Completed, or Dropped.' });
    }

    if (marks !== undefined && (marks < 0 || marks > 100)) {
        return res.status(400).json({ success: false, message: 'Marks must be between 0 and 100.' });
    }

    if (attendance !== undefined && (attendance < 0 || attendance > 100)) {
        return res.status(400).json({ success: false, message: 'Attendance must be between 0 and 100.' });
    }

    try {
        const enrollment = await Enrollment.findByIdAndUpdate(
            enrollmentId,
            { status, grade, marks, attendance },
            { new: true }
        ).populate('studentId', 'firstName lastName email')
         .populate('courseId', 'courseTitle courseCode');

        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Enrollment not found.' });
        }

        res.status(200).json({ success: true, message: 'Enrollment updated successfully.', data: enrollment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}

// Delete enrollment (unenroll student from course)
export const deleteEnrollment = async (req, res) => {
    const { enrollmentId } = req.params;
    try {
        const enrollment = await Enrollment.findByIdAndDelete(enrollmentId);
        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Enrollment not found.' });
        }
        res.status(200).json({ success: true, message: 'Enrollment deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}

// Get course statistics
export const getCourseEnrollmentStats = async (req, res) => {
    const { courseId } = req.params;
    try {
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }

        const enrollments = await Enrollment.find({ courseId });
        const activeEnrollments = enrollments.filter(e => e.status === 'Active');
        const completedEnrollments = enrollments.filter(e => e.status === 'Completed');
        const droppedEnrollments = enrollments.filter(e => e.status === 'Dropped');

        const avgMarks = enrollments.length > 0
            ? (enrollments.reduce((sum, e) => sum + (e.marks || 0), 0) / enrollments.length).toFixed(2)
            : 0;

        const avgAttendance = enrollments.length > 0
            ? (enrollments.reduce((sum, e) => sum + (e.attendance || 0), 0) / enrollments.length).toFixed(2)
            : 0;

        res.status(200).json({
            success: true,
            message: 'Course enrollment statistics retrieved successfully.',
            data: {
                courseTitle: course.courseTitle,
                maxCapacity: course.maxStudents,
                totalEnrolled: enrollments.length,
                activeStudents: activeEnrollments.length,
                completedStudents: completedEnrollments.length,
                droppedStudents: droppedEnrollments.length,
                averageMarks: avgMarks,
                averageAttendance: `${avgAttendance}%`,
                occupancyRate: `${((activeEnrollments.length / course.maxStudents) * 100).toFixed(2)}%`
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}

// Get student grade report
export const getStudentGradeReport = async (req, res) => {
    const { studentId } = req.params;
    try {
        const enrollments = await Enrollment.find({ studentId, status: { $in: ['Active', 'Completed'] } })
            .populate('courseId', 'courseTitle courseCode credits classLevel');

        if (enrollments.length === 0) {
            return res.status(404).json({ success: false, message: 'No enrollment records found for this student.' });
        }

        const totalCredits = enrollments.reduce((sum, e) => sum + (e.courseId.credits || 0), 0);
        const avgMarks = enrollments.length > 0
            ? (enrollments.reduce((sum, e) => sum + (e.marks || 0), 0) / enrollments.length).toFixed(2)
            : 0;

        res.status(200).json({
            success: true,
            message: 'Student grade report retrieved successfully.',
            data: {
                studentId,
                totalCourses: enrollments.length,
                totalCredits,
                averageMarks: avgMarks,
                enrollments
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}
