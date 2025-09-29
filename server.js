const express = require("express");
const mongoose = require("mongoose");
mongoose.set("debug", true);
// const { connectMongoDb } = require("./connection");
const { seedAdmin } = require("./seeder/admin-seeder");
const cors = require("cors");
const path = require("path");

const userRouter = require("./routes/users");
const adminRouter = require("./routes/adminRoutes");
const productRouter = require("./routes/product");
const paymentRouter = require('./routes/payments')
const orderRouter = require('./routes/order')
require('dotenv').config();
const app = express() ;

const PORT = 5000;


const connectMongoDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
  }
};



app.use(express.urlencoded({ extended: false }));

app.use(cors());
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json());

app.use("/api", userRouter);

app.use("/api/admin", adminRouter);

app.use("/api/product", productRouter);

app.use('/api/payment', paymentRouter);

app.use('/api/order', orderRouter)

seedAdmin();
connectMongoDb();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
