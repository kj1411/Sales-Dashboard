import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { contactUs } from "../controllers/contactController.js";

const router = express.Router();

router.post("/",userAuth,contactUs);

export default router;