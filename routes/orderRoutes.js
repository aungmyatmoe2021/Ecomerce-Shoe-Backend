import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { admin, auth } from '../middleware/authMiddleware.js';
import Order from './../models/OrderModel.js';

const orderRoute = express.Router();

// crate order
orderRoute.post("/", auth, expressAsyncHandler(async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;
    try {
        if (orderItems && orderItems.length === 0) {
            res.status(400).json({ status: 400, msg: "No order items" });
            throw new Error("No order items");
            return;
        } else {
            const order = new Order({
                user: req.user._id,
                orderItems,
                shippingAddress,
                paymentMethod,
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice
            });

            const createOrder = await order.save();
            res.status(201).json({ status: 201, msg: { createOrder } });
        }
    } catch (error) {
        req.status(400).json({ status: 400, msg: error.message });
        throw new Error(error.message);
    }
}));

// admin get all order
orderRoute.get("/all", auth, admin, expressAsyncHandler(async (req, res) => {
    console.log("Start using Order All API")
    try {
        const order = await Order.find({}).sort({ _id: -1 }).populate("User", "id name email");
        res.status(200).json({ status: 200, msg: { order } });
    } catch (error) {
        req.status(400).json({ status: 400, msg: error.message });
        throw new Error(error.message);
    }
}));

// user order
orderRoute.get("/", auth, expressAsyncHandler(async (req, res) => {
    try {
        const order = await Order.find({ user: req.user._id }).sort({ _id: -1 });
        res.status(200).json({ status: 200, msg: { order } });
    } catch (error) {
        req.status(400).json({ status: 400, msg: error.message });
        throw new Error(error.message);
    }
}));

// get order by ID
orderRoute.get("/:id", auth, expressAsyncHandler(async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("User", "name email");
        if (order) {
            res.status(200).json({ status: 200, msg: { order } });
        } else {
            res.status(404).json({ status: 404, msg: "Order Not Found" });
            throw new Error("Order Not Found");
        }
    } catch (error) {
        req.status(400).json({ status: 400, msg: error.message });
        throw new Error(error.message);
    }
}));

// order is paid
orderRoute.put("/:id/pay", auth, expressAsyncHandler(async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: req.body.id,
                status: req.body.status,
                update_time: req.body.update_time,
                email_address: req.body.email_address
            };

            const updatedOrder = await order.save();
            res.status(200).json({ status: 200, msg: { updatedOrder } });
        }
    } catch (error) {
        req.status(400).json({ status: 400, msg: error.message });
        throw new Error(error.message);
    }
}));

// order is delivered
orderRoute.put("/:id/delivered", auth, expressAsyncHandler(async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.isDelivered = true;
            order.deliveredAt = Date.now();

            const updatedOrder = await order.save();
            res.status(200).json({ status: 200, msg: { updatedOrder } });
        }
    } catch (error) {
        req.status(400).json({ status: 400, msg: error.message });
        throw new Error(error.message);
    }
}));

export default orderRoute;