import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const teacherSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    avatar: String,
    password: { type: String, required: true, minlength: 6, trim: true },
    role: { type: String, enum: ['admin', 'teacher'], default: 'teacher' },
    isLoggedIn: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    dob: { type: Date, default: Date.now },
    gender: { type: String, enum: ['male', 'female'], required: true },
    lastLoggedIn: { type: Date, default: Date.now },
    subjects: [{ type: String }]
}, { timestamps: true });

//Hashing the password before saving the teacher document
teacherSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcryptjs.hash(this.password, 10);
});

teacherSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcryptjs.compare(candidatePassword, this.password);
}

const Teacher = mongoose.model("Teacher", teacherSchema);

export default Teacher;