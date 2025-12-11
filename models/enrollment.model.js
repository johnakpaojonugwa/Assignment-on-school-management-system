import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
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
    enrollmentDate: { 
        type: Date, 
        default: Date.now 
    },
    status: { 
        type: String, 
        enum: ['Active', 'Completed', 'Dropped'], 
        default: 'Active' 
    },
    grade: { 
        type: String, 
        enum: ['A', 'B', 'C', 'D', 'F', null],
        default: null 
    },
    marks: { 
        type: Number, 
        min: 0, 
        max: 100 
    },
    attendance: { 
        type: Number, 
        min: 0, 
        max: 100,
        default: 0 
    }
}, { timestamps: true });

// Ensure a student can't enroll in the same course twice
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;