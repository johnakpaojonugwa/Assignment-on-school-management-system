import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    studentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Student', 
        required: true 
    },
    courseId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course', 
        required: true 
    },
    enrollmentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Enrollment', 
        required: true 
    },
    attendanceDate: { 
        type: Date, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Present', 'Absent', 'Late', 'Excused'],
        required: true 
    },
    remarks: { 
        type: String 
    },
    recordedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Teacher',
        required: true 
    }
}, { timestamps: true });

// Ensure one attendance record per student per course per day
attendanceSchema.index({ studentId: 1, courseId: 1, attendanceDate: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;