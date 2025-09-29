const express = require("express");

const { connectMongoDb } = require("./connection");
const { seedAdmin } = require("./seeder/admin-seeder");
const cors = require("cors");
const path = require("path");

const userRouter = require("./routes/users");
const adminRouter = require("./routes/adminRoutes");
const productRouter = require("./routes/product");
const paymentRouter = require('./routes/payments')
const orderRouter = require('./routes/order')
const app = express() ;

const PORT = 5000;

connectMongoDb("mongodb+srv://ranusharma14112003_db_user:PBEm21NvuCXhEpay@cluster0.vywi8i9.mongodb.net//ecomer").then(() => {
  console.log("MongoDb is Connected");
});


/***** connecting database using mongoose ******/


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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
