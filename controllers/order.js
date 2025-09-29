const { default: mongoose } = require("mongoose");
const { order } = require("../models/order");

//api for creating order
async function createOrder(req, res) {
  try {
    const { addressId, paymentMethodId, products, totalPrice } = req.body;
    console.log(
      products,
      "req body of order<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
    );

    if (!addressId || !paymentMethodId || !products || !totalPrice) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const transformedProducts = products.map((product) => ({
      productID: product.products ? new mongoose.Types.ObjectId(product.productId) : new mongoose.Types.ObjectId(product._id),
      quantity: product.quantity || 1,
      price: product.products ? product.products.price : product.price,
      companyID: new mongoose.Types.ObjectId(product.createdBy),
    }));
    console.log(products.productId);
    

    const newOrder = await order.create({
      createdBy: new mongoose.Types.ObjectId(req.userId),
      addressId: new mongoose.Types.ObjectId(addressId),
      paymentMethodId: paymentMethodId,
      products: transformedProducts,
      totalPrice: totalPrice,
    });

    const saveOrder = await newOrder.save();

    return res.status(200).json({
      statusCode: 200,
      message: "Order is created successfully..",
      data: saveOrder,
    });
  } catch (error) {
    console.log(error, "error---");
    return res.status(500).json({
      message: "Somthing went wrong",
    });
  }
}

//api for listing ordder
async function listingOrder(req, res) {
  // const adminId = req.userId;
  // const role = req.user.role
  // if (role == "1") {
    const orders = await order.aggregate([
      {
        $lookup: {
          from: "users",
          let: { user: "$createdBy" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$user", "$_id"],
                },
              },
            },
          ],
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
        },
      },
      {
        $lookup: {
          from: "addresses",
          let: { id: "$addressId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$id", "$_id"],
                },
              },
            },
          ],
          as: "address",
        },
      },
      {
        $unwind: {
          path: "$address",
        },
      },
    
      {
        $lookup: {
          from: "products",
          let: {
            productIDs: {
              $map: {
                input: "$products",
                as: "products_data",
                // in: { $toObjectId: "$$products_data.productID" } 
                in: "$$products_data.productID",
              },
            },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$productIDs"],
                },
              },
            },
          ],
          as: "productDetails",
        },
      },
   
     
    
      {
        $project: {
          address: {
            name: 1,
            phone: 1,
            street: 1,
            city: 1,
            state: 1,
            pincode: 1,
          },
          user: {
            name: 1,
            email: 1,
          },
          totalPrice: 1,
          products: "$productDetails", 
          product:"$products",
          status: 1,
          createdAt: 1,
        },
      },
   
      

       // {
      //   $unwind: {
      //     path: "$productDetails",
      //   },
      // },
      // {
      //   $group: {
      //     _id: "$_id",
      //     productDetails: {
      //       $push: "$productDetails",
      //     },
      //   },
      // },
    
    ]);

  return res.status(200).json({
    message: "here is orders",
    data: orders,
  });
  // }
  // else{
  //     return res.status(400).json({
  //         message:"you are not admin"
  //     })
  // }
}

module.exports = { createOrder, listingOrder };
