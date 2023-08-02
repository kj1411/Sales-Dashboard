import express from "express";

import {changePassword, forgotPassword, getUser, loginStatus, loginUser, logoutUser, registerUser, resetPassword, updateUser } from "../controllers/userController.js";
import { userAuth } from "../middlewares/auth.js";
import { uploader } from "../utils/fileUpload.js";

const router = express.Router();

router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/logout",logoutUser);
router.get("/loggedin",loginStatus);
router.get("/getuser",userAuth,getUser);

router.patch("/updateuser",userAuth,uploader.single('photo'),updateUser)
router.patch("/changepassword",userAuth,changePassword);
router.post("/forgotpassword",forgotPassword);
router.put("/resetpassword/:resetToken",resetPassword);

export default router;