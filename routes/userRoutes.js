import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { admin, auth } from '../middleware/authMiddleware.js';
import User from '../models/UserModel.js';
import generateToken from '../utils/generateToken.js';

const userRoute = express.Router();

userRoute.post("/login", expressAsyncHandler(async (req, res) => {
    try {
        console.log("Login API starting");
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.status(200).json({
                status: 200,
                msg: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    token: generateToken(user._id),
                    createdAt: user.createdAt
                }
            });
        } else {
            res.status(401).json({ status: 401, msg: "Invalid Email or Password" });
            throw new Error("Invalid Email or Password");
        }
    } catch (error) {
        res.status(401).json({ status: 401, msg: "Invalid Email or Password" });
        throw new Error("Invalid Email or Password");
    }
}));

userRoute.post("/", expressAsyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExit = await User.findOne({ email });

    if (userExit) {
        res.status(400).json({ status: 400, msg: "User already exists" });
        throw new Error("User already exists");
    }

    const user = await User.create({
        name: name,
        email: email,
        password: password
    });

    if (user) {
        res.status(201).json({
            status: 201,
            msg: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user._id)
            }
        });
    } else {
        res.status(400).json({ status: 400, msg: "Invalid User Data" });
        throw new Error("Invalid User Data")
    }
}));

userRoute.get("/profile", auth, expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.status(200).json({
            status: 200,
            msg: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                createdAt: user.createdAt
            }
        });
    } else {
        res.status(404).json({ status: 404, msg: "User not found" });
        throw new Error("User not found");
    }
}));

userRoute.put("/profile", auth, expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = req.body.password;
        }
        const updatedUser = await user.save();
        res.status(200).json({
            status: 200,
            msg: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                createdAt: updatedUser.createdAt,
                token: generateToken(updatedUser._id)
            }
        });
    } else {
        res.status(404).json({ status: 404, msg: "User not found" });
        throw new Error("User not found");
    }
}));

userRoute.get("/", auth, admin, expressAsyncHandler(async (req, res) => {
    console.log("Get All User");
    const users = await User.find({});
    res.status(200).json({ status: 200, msg: { users } });
}))

export default userRoute;