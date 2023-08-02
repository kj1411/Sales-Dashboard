import mongoose from "mongoose";

const productSchema = mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref : "User",
    },
    name:{
        type:String,
        requried:[true,"Please add a name"],
        trim:true,
    },
    name:{
        type:String,
        requried:[true,"Please add a name"],
        trim:true,
    },
    sku:{
        type:String,
        required:true,
        default:"SKU",
        trim:true,
    },
    category:{
        type:String,
        required:[true,"Please add a category"],
        trim:true,
    },
    quantity:{
        type:String,
        requried:[true,"Please add quantity"],
        trim:true,
    },
    price:{
        type:String,
        requried:[true,"Please add price"],
        trim:true,
    },
    description:{
        type:String,
        requried:[true,"Please add description"],
        trim:true,
    },
    image:{
        type:Object,
        default:{}
    },
},{
    timestamps:true,
});

const Product = mongoose.model("Product",productSchema);

export default Product;