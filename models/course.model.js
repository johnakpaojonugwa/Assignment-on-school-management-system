import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    courseTitle: { type: String, required: true, trim: true },
    courseCode: { type: String, required: true, unique: true },
    description: { type: String },
    credits: { type: Number, required: true, min: 1, max: 6 },
    classLevel: { type: String, enum: ['Primary', 'Secondary'], required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    semester: { type: Number, enum: [1, 2], required: true },
    maxStudents: { type: Number, required: true, min: 1 },
    schedule: { type: String }, // e.g., "MWF 9:00-10:00"
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

export default Course;