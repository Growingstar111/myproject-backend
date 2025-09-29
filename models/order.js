const { default: mongoose } = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "addresses",
    },
    paymentMethodId: {
      type: String,
    },
    products: [
      {
        productID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
        },
        quantity: {
          type: Number,
          default: 1,
        },
        price: {
          type: Number,
        },
        companyID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
        },
      },
    ],
    status: {
      type: String,
      enum: [
        "Pending",
        "Ready for Shipping",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },
    totalPrice: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const order = mongoose.model("order", orderSchema);
module.exports.order = order;
