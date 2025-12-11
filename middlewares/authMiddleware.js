import jwt from 'jsonwebtoken';
import Student from '../models/student.model.js';
import Teacher from '../models/teacher.model.js';

export const protect = async(req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Not authorized, no token provided' })
        }

        const token = authHeader.split(' ') [1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        let user = await Teacher.findById(decoded.id).select('-password');
        if (user) {
            req.user = user;
            req.userType = 'teacher';
            req.userRole = user.role;
            return next()
        }
        user = await Student.findById(decoded.id).select('-password');
        if (user) {
            req.user = user;
            req.userType = 'student';
            req.userRole = user.role || 'student'
            return next()
        }
        return res.status(401).json({ success: false, message: 'User not found, token failed' });
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expected token, please login again' });
    }
}

export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.userRole)) {
            return res.status(403).json({ success: false, message: `Access denied. This resource is restricted to: ${allowedRoles.join(", ")} only.`})
        }
        next();
    }
}