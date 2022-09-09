import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import products from './data/products.js';
import users from './data/users.js';
import Product from './models/ProductModel.js';
import User from './models/UserModel.js';

const ImportData = express.Router();

ImportData.post("/users", expressAsyncHandler(async (req, res) => {
    await User.remove({});
    const importUsers = await User.insertMany(users);
    res.send({ importUsers });
}));

ImportData.post("/products", expressAsyncHandler(async (req, res) => {
    await Product.remove({});
    const importProducts = await Product.insertMany(products);
    res.send({ importProducts });
}));

ImportData.post("/importalldata", expressAsyncHandler(async (req, res) => {
    console.log("--Removing User Schema ---");
    await User.remove({});
    console.log("--Removing Product Schema ---");
    await Product.remove({});
    console.log("--Adding User Schema ---");
    await User.insertMany(users);
    console.log("--Adding Product Schema ---");
    await Product.insertMany(products);
    res.send({ status: 200, msg: "Successful" });
}));

export default ImportData;