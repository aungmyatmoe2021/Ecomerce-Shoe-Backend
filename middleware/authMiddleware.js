import jwt from 'jsonwebtoken';
import expressAsyncHandler from 'express-async-handler';
import User from './../models/UserModel.js';

const auth = expressAsyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ status: 401, msg: "Not authorized, token failed" });
            throw new Error("Not authorized, token failed");
        }
    }

    if (!token) {
        res.status(401).json({ status: 401, msg: "Not authorized, no token" });
        throw new Error("Not authorized, no token");
    }
});

const admin = expressAsyncHandler(async (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401).json({ status: 401, msg: "Not authorized as an Admin" });
        throw new Error("Not authorized as an Admin");
    }
});

export { auth, admin };