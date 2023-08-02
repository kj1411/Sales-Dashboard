import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import Token from "../models/Token.js";

// generates jwt token
const generateToken = (id) =>{
    return jwt.sign({
        id
    },
    process.env.JWT_SECRET,
    {
        expiresIn:"1d"
    });
}


// register User controller
export const registerUser = async (req,res,next)=>{
    try{
        const {email,name,password,phone} = req.body;
        // validation
        // if(!email || !name || !password){
        //     res.status(400);
        //     throw new Error("PLease Fill in all required fields");
        // }
        // if(password.length < 6){
        //     res.status(400);
        //     throw new Error("Password must be atleast 6 characters");
        // }
        const userExists = await User.findOne({email})

        if(userExists) {
            res.status(400);
            throw new Error("Email has already been registered");
        }

        const user = await User.create({
            name,email,password,phone
        });

        const token = generateToken(user._id);

        // send the token as cookie
        res.cookie("token",token,{
            path:"/",
            httpOnly: false,
            expires : new Date(Date.now() + 1000 * 86400),
            // secure:true,
        });

        if(user){
            const {_id,name,email,photo,phone,bio} = user;
            res.status(200).json({
                _id,name,email,photo,bio,token
            });
        }
        // else{
        //     res.status(400);
        //     throw new Error("Invalid user Data");
        // }

    }
    catch(err){
        next(err);
    }
}

// login in user
export const loginUser = async (req,res,next)=>{
    try{
        const {email,password} = req.body;
        if(!email || !password){
            res.status(400);
            throw new Error("Please add email and password");
        }

        const user = await User.findOne({email:email});

        if(!user){
            res.status(400);
            throw new Error("email not registered. Please Sign up first");
        }

        const passwordIsCorrect = await bcrypt.compare(password,user.password);

        if(user && passwordIsCorrect){
            const token = generateToken(user._id);

            // send the token as cookie
            res.cookie("token",token,{
                path:"/",
                httpOnly: false,
                expires : new Date(Date.now() + 1000 * 86400),
                // secure:true,
            });
            const {_id,name,email,photo,bio,phone} = user;
            res.status(200).json({
                _id,name,email,photo,bio,phone,token
            });
        }
        else{
            res.status(400);
            throw new Error("Invalid credentials");
        }
    }
    catch(err){
        next(err);
    }
}

// logout user
export const logoutUser = async(req,res,next)=>{
    try{
        res.cookie("token",null,{
            path:"/",
            httpOnly: false,
            expires : new Date(0),
        });
        res.status(200).json({message:"Successfully Logged out"});
    }
    catch(err){
        next(err);
    }
}

// get user data protected route
export const getUser = async(req,res,next)=>{
    try{
        const user = req.user;
        if(!user){
            res.status(400);
            throw new Error("User not Found");
        }
        const {_id,name,email,photo,phone,bio} = user;
        res.status(200).json({
            _id,name,email,photo,bio,phone
        });
    }
    catch(err){
        next(err);
    }
}

//get login status of user
export const loginStatus = async (req,res) =>{
    const token = req.cookies.token;
    if(!token){
        return res.json(false);
    }

    const decodedData = jwt.verify(token,process.env.JWT_SECRET);
    if(decodedData){
        return res.json(true);
    }
    return res.json(false);
}

export const updateUser = async (req,res,next)=>{
    try{
        let _id,email,name,photo,phone,bio;
        ({
            name,
            phone,
            bio,
        } = req.body);

        let fileData=null;

        let updatedUserData = {
            name,phone,bio
        }
        console.log(req.file)
        if(req.file){
            fileData = {
                fileName:req.file.originalname,
                filePath:`${process.env.BACKEND_URL}/${req.file.path}`,
                fileType:req.file.mimetype,
                fileSize:formatFileSize(req.file.size,2),
            }
            
            updatedUserData={
                name,phone,bio,photo:fileData.filePath
            }
            console.log(updatedUserData)
        }


        const user = await User.findOneAndUpdate(
            {_id:req.user._id},
            updatedUserData,
            {
                new:true
            }
        );
    
        await user.save();
        console.log(user);
        ({_id,name,email,photo,phone,bio} = user);
        res.status(200).json({
            _id,name,email,photo,bio,phone
        });
    }
    catch(err){
        next(err);
    }
}

export const changePassword = async (req,res,next)=>{
    try{
        const user = await User.findById(req.user._id);
        const {oldPassword,newPassword} = req.body;
        if(!oldPassword || !newPassword){
            res.status(400);
            throw new Error("Please add old password and new password");
        }
        const isPasswordCorrect = await bcrypt.compare(oldPassword,user.password);

        if(!isPasswordCorrect){
            res.status(401);
            throw new Error("Old password is incorrect");
        }

        user.password = newPassword;
        await user.save();
        res.status(200).json("Password Changed successfully");
    }
    catch(err){
        next(err);
    }
}

// controller to send the resetPassword link not a protected route
export const forgotPassword = async (req,res,next)=>{
    try{
        const {email} = req.body;
        const user = await User.findOne({email});

        // user not found 
        if(!user){
            res.status(400);
            throw new Error("Email not found");
        }

        // look for previous existing tokens
        const token = await Token.findOne({userId:user._id});

        // previous token exists then delete it
        if(token){
            await token.deleteOne();
        }

        // create a random unique token
        // try to write this function in Token model
        // adding user._id in end makes it unique
        let resetToken = crypto.randomBytes(32).toString('hex') + user._id;

        // hashing this unique token before storing in database
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        // creating new token and storing the hashed token
        await new Token({
            userId:user._id,
            token: hashedToken,
            createdAt: Date.now(),
            expiresAt: Date.now() + 30 * (60 * 1000), // expiry time is 30 minutes
        }).save();
        
        // resetUrl to access reset the passowrd page
        const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

        // message to displayed in email
        const message = `
            <h2> Hello ${user.name}</h2>
            <p> Please use the url below to reset your password </p>
            <p> This reset link is link valid for only 30 minutes. </p>

            <a href='${resetUrl}' clicktracking=off>${resetUrl}</a>

            <p> Thank You... </p>
            <p> Developer Team Sales Management </p>
        `
        // options to send the email
        const subject = "Password Reset Request";
        const from = process.env.USER;
        const to = user.email;

        // send the email
        const result = await sendEmail(from,to,subject,message);

        if(!result.success){
            res.status(400);
            throw new Error(result.message);    
        }
        else{
            res.status(200).json(result);
        }
    }
    catch(err){
        next(err);
    }
}

export const resetPassword = async(req,res,next)=>{
    try{
        const {password} = req.body;
        const {resetToken} = req.params;

        // hash the userToken and then compare with the hashed version token in database
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        // get the token from the database
        const userToken = await Token.findOne({
            token:hashedToken,
            expiresAt:{$gt: Date.now()},
        });

        if(!userToken){
            res.status(400);
            throw new Error("Invalid Or Expired Token");
        }

        // get the user 
        const user = await User.findById(userToken.userId);

        // update the password
        user.password = password;
        await user.save();
        
        // delete this token
        await userToken.deleteOne();

        res.status(200).json({
            success:true,
            message:"Password Reset Successfully."
        });
    }
    catch(err){
        err.success=false;
        next(err);
    }
}