import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { createProduct, deleteProduct, getSingleProduct, getUserProducts, updateProduct } from "../controllers/productController.js";
import { uploader } from "../utils/fileUpload.js";

const router = express.Router();

// create a product
router.post("/",userAuth,uploader.single('image'),createProduct);
router.get("/",userAuth,getUserProducts);

router.get("/:id",userAuth,getSingleProduct);
router.delete("/:id",userAuth,deleteProduct);

router.patch("/:id",userAuth,updateProduct);


export default router;
