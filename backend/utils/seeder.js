const products=require('../data/products.json');
const Product= require('../models/productModel');
const dotenv=require('dotenv');
const connectDatabase=require('../config/database');

dotenv.config({path:'backend/config/config.env'});
connectDatabase();


const seedProducts = async ()=>{
    try{
        await Product.deleteMany();
        console.log("deleted successfully");
        await Product.insertMany(products);
        console.log("inserted successfully");
    }
    catch (err){
        console.log(err.message);
    }
    process.exit();
}

seedProducts();