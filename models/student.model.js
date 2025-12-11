import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const studentSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    student_avatar: String,
    gender: { type: String, enum: ['male', 'female'], required: true },
    role: { type: String, enum: ['student', 'prefect'], default: 'student' },
    dob: { type: Date, default: Date.now },
    password: { type: String, required: true, minlength: 6, trim: true },
    classLevel: { type: String, enum: ['Primary', 'Secondary'], required: true },
    grade: { type: String, required: true, trim: true },
    guardian: {
        name: { type: String, required: true, trim: true },
        contactNumber: { type: Number, required: true }
    },
    isLoggedIn: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    lastLoggedIn: { type: Date, default: Date.now }

}, { timestamps: true });

// Hashing the password before saving the student document
studentSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcryptjs.hash(this.password, 10);
});

studentSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcryptjs.compare(candidatePassword, this.password);
}

const Student = mongoose.model("Student", studentSchema);

export default Student;