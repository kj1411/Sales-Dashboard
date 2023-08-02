
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const userAuth = async (req,res,next)=>{
    try{
        // get the token from cookies
        const token = req.cookies.token;
        if(!token){
            res.status(401);
            throw new Error("Not authorized, Please Login");
        }

        // decodes the jwt token with the secret key to get verify the signature and returns the data encrypted
        const decodedData = jwt.verify(token,process.env.JWT_SECRET);

        const user = await User.findById(decodedData.id).select("-password");


        if(!user){
            res.status(401);
            throw new Error("User not found");
        }
        // saves the user with req variale to further access in other functions
        req.user = user;
        next();
    }
    catch(err){
        next(err);
    }
}