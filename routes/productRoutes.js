import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { admin, auth } from '../middleware/authMiddleware.js';
import Product from '../models/ProductModel.js';
import User from '../models/UserModel.js';

const productRoute = express.Router();

// Get All Product
productRoute.get("/", expressAsyncHandler(async (req, res) => {
    console.log("Get All Product Filter by Page");
    const pageSize = 12;
    console.log(req.query.pageNumber);
    const page = Number(req.query.pageNumber) || 1;
    const keyword = req.query.keyword ?
        {
            name: {
                $regex: req.query.keyword,
                $options: "i"
            },
        } :
        {};
    const count = await Product.countDocuments({ ...keyword });
    const products = await Product.find({ ...keyword }).limit(pageSize).skip(pageSize * (page - 1)).sort({ _id: -1 });
    res.status(200).json({ status: 200, msg: { products, page, page: Math.ceil(count / pageSize) } });
}));

// Admin GET All Product without search and pagination
productRoute.get("/all", auth, expressAsyncHandler(async (req, res) => {
    console.log("Get All Product");
    try {
        const products = await Product.find({}).sort({ _id: -1 });
        res.status(200).json({ status: 200, msg: { products } });
    } catch (error) {
        res.status(404).json({ status: 404, msg: error.message });
        throw new Error(error.message);
    }
}));

//Get Single Product
productRoute.get("/:id", expressAsyncHandler(async (req, res) => {
    console.log("GET SINGLE PRODUCT BY ID");
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.status(200).json({ status: 200, msg: { product } });
        } else {
            res.status(404).json({ status: 404, msg: "Product not found" });
            throw new Error("Product not found");
        }
    } catch (error) {
        res.status(404).json({ status: 404, msg: "Product not found" });
        throw new Error("Product not found");
    }
}));

// Product Review
productRoute.post("/:id/review", auth, expressAsyncHandler(async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            const alreadyReviewed = await product.review.find((review) => review.user.toString() === req.user._id.toString());
            if (alreadyReviewed) {
                res.status(400).json({ status: 400, msg: "Product already reviewed" });
                throw new Error("Product already reviewed");
            }
            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment,
                user: req.user._id
            }
            await product.review.push(review);
            product.numReviews = product.review.length;
            product.rating = product.review.reduce((acc, item) => item.rating + acc, 0) / product.review.length;
            await product.save();
            res.status(201).json({ status: 201, msg: "Reviewed added" })
        } else {
            res.status(404).json({ status: 404, msg: "Product not found" });
            throw new Error("Product not found");
        }
    } catch (error) {
        res.status(404).json({ status: 404, msg: "Product not found" });
        throw new Error("Product not found");
    }
}));

// product delete
productRoute.delete("/:id", auth, admin, expressAsyncHandler(async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.remove();
            res.status(200).json({ status: 200, msg: "Product deleted" });
        } else {
            res.status(404).json({ status: 404, msg: "Product not found" });
            throw new Error("Product not found");
        }
    } catch (error) {
        res.status(404).json({ status: 404, msg: "Product not found" });
        throw new Error("Product not found");
    }
}));

// create product
productRoute.post("/", auth, admin, expressAsyncHandler(async (req, res) => {
    try {
        const { name, image, description, price, countInStock } = req.body;
        const productExit = await Product.findOne({ name: req.body.name });
        if (productExit) {
            res.status(400).json({ status: 400, msg: "Product name already exist" });
            throw new Error("Product name already exist");
        } else {
            const product = new Product({
                name,
                image,
                price,
                description,
                price,
                countInStock,
                user: req.user._id
            });
            if (product) {
                const createProduct = await product.save();
                res.status(201).json({ status: 201, msg: { createProduct } });
            } else {
                res.status(400).json({ status: 400, msg: "Invalid product data" });
                throw new Error("Invalid product data");
            }
        }
    } catch (error) {
        res.status(400).json({ status: 400, msg: "Invalid product data" });
        throw new Error("Invalid product data");
    }
}));

// update product
productRoute.put("/:id", auth, admin, expressAsyncHandler(async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            product.name = req.body.name || product.name;
            product.price = req.body.price || product.price;
            product.description = req.body.description || product.description;
            product.image = req.body.image || product.image;
            product.countInStock = req.body.countInStock || product.countInStock;

            const updatedProduct = await product.save();
            res.status(200).json({ status: 200, msg: { updatedProduct } });
        } else {
            res.status(400).json({ status: 400, msg: "Product not found" });
            throw new Error("Product not found");
        }
    } catch (error) {
        res.status(400).json({ status: 400, msg: "Product not found" });
        throw new Error("Product not found");
    }
}));

export default productRoute;