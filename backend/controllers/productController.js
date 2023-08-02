import Product from "../models/Product.js";
import { formatFileSize } from "../utils/fileUpload.js";

export const createProduct = async (req,res,next)=>{
    try{
        const {name,sku,category,quantity,price,description} = req.body;

        // handle image till here image must has to be stored in /uploads
        let fileData={};

        if(req.file){
            fileData = {
                fileName:req.file.originalname,
                filePath:req.file.path,
                fileType:req.file.mimetype,
                fileSize:formatFileSize(req.file.size,2),
            }
        }


        // create product
        const product = await Product.create({
            user:req.user._id,
            name,
            sku,
            category,
            quantity,
            price,
            description,
            image:fileData,
        });

        res.status(201).json(product);
    }
    catch(err){
        next(err);
    }
};

export const getUserProducts = async (req,res,next)=>{
    try{
        const products = await Product.find({user:req.user._id}).sort("-createdAt");
        res.status(200).json(products);
    }
    catch(err){
        next(err);
    }
};

export const getSingleProduct = async (req,res,next)=>{
    try{
        const product = await Product.findById(req.params.id);

        // id is invalid 
        if(!product){
            res.status(404);
            throw new Error("Product not found!");
        }

        // not a product created by user
        // console.log(product.user,req.user._id,typeof(product.user),typeof(req.user._id));
        if(product.user.toString() !== req.user._id.toString()){
            res.status(401);
            throw new Error("User not authorized");
        }

        // send the product
        res.status(200).json(product);
    }
    catch(err){
        next(err);
    }
}

export const deleteProduct = async (req,res,next)=>{
    try{
        const product=await Product.deleteOne({
            _id:req.params.id,
            user:req.user._id
        })
        console.log(product);
        res.status(200).json(product);
    }
    catch(err){
        next(err);
    }
}

export const updateProduct = async (req,res,next)=>{
    try{
        const {name,category,quantity,price,description} = req.body;
        const {id} = req.params;

        const product = await Product.findById(req.params.id);

        // id is invalid 
        if(!product){
            res.status(404);
            throw new Error("Product not found!");
        }

        // not a product created by user
        // console.log(product.user,req.user._id,typeof(product.user),typeof(req.user._id));
        if(product.user.toString() !== req.user._id.toString()){
            res.status(401);
            throw new Error("User not authorized");
        }


        // handle image till here image must has to be stored in /uploads
        let fileData=product.image;

        if(req.file){
            fileData = {
                fileName:req.file.originalname,
                filePath:req.file.path,
                fileType:req.file.mimetype,
                fileSize:formatFileSize(req.file.size,2),
            }
        }


        // create product
        const updatedProduct = await Product.findOneAndUpdate({_id:id},{
            name,
            category,
            quantity,
            price,
            description,
            image:fileData,
        },{
            new:true
        });

        res.status(200).json(updatedProduct);
    }
    catch(err){
        next(err);
    }
};
