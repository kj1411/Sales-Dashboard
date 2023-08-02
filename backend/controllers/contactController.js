import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";


export const contactUs = async (req,res,next)=>{
    try{
        const {subject,message} = req.body;
        const user = User.findById(req.user._id);

        if(!user){
            res.status(404);
            throw new Error("User not found, Please SignUP");
        }

        if(!subject || !message){
            res.status(400);
            throw new Error("Please add a subject and message");
        }

        const from = process.env.USER;
        const to = process.env.USER;
        const reply = user.email;
        
        const result = await sendEmail(from,to,subject,message,reply);

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

