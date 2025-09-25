
import userModel from "../models/user.model.js";
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import { errorHandler } from "../middleware/errorHandler.js";
import { generateToken } from "../utils/utils.js";

dotenv.config();

export const signUp = async (req, res, next) => {
    const { username, email, password } = req.body;

    try {
        if (!username || !password || !email || username === '' || email === '' || password === '') {
            return next(errorHandler(400, 'All field are required'));
        }

        const userName = await userModel.findOne({ username });

        if (userName) {
            return next(errorHandler(400, 'Username already exists'));
        }

        const userEmail = await userModel.findOne({ email });

        if (userEmail) {
            return next(errorHandler(400, 'Email already exists'));
        }

        const hasPassword = await bcryptjs.hash(password, 10)

        const newUser = new userModel({
            username,
            email,
            password: hasPassword
        });

        await newUser.save()

        res.status(201).json({
            status: 'success',
            message: 'Sign up successful'
        });
    } catch (error) {
        console.log("Error in signup controller", error.message);
        return next(errorHandler(500, 'Internal Server Error'));
    }

};

export const signIn = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password || email === '' || password === '') {
        return next(errorHandler(400, "All fields are required"));
    };

    try {
        const validUser = await userModel.findOne({ email });

        if (!validUser) {
            return next(errorHandler(404), 'User not found');
        };

        const validPassword = bcryptjs.compareSync(password, validUser.password);

        if (!validPassword) {
            return next(errorHandler(400, "Invalid credetials"))
        };

        generateToken(validUser._id, validUser.isAdmin, res)

        const { password: pass, ...rest } = validUser._doc

        res.status(200).json({
            status: 'success',
            message: 'Sign In Successfull',
            user: rest
        })

    } catch (error) {
        console.log("Sign in error :-", error)
        return next(errorHandler(500, "Internal server error"));
    }
};