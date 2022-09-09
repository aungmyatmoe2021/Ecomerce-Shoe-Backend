import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDatabase from './config/MongoDb.js';
import ImportData from './ImportData.js';
import userRoute from './routes/userRoutes.js';
import productRoute from './routes/productRoutes.js';
import orderRoute from './routes/orderRoutes.js';
import { errorHandler, notFound } from './middleware/errors.js';

dotenv.config();
connectDatabase();
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Hello, there is backend API for ECOMMERCE SHOE");
});

app.use("/api/import", ImportData);
app.use("/api/user", userRoute);
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoute);

// for paypal config
app.use("/api/config/paypal", (req, res) => {
    res.send(process.env.PAYPAL_CLIENT_ID)
})

// Error Handler
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`server run in port ${process.env.PORT}`);
});