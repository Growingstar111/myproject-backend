const { default: mongoose } = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    brand: {
      type: String,
    },
    image: {
      type: String,
    },
    price: {
      type: Number,
    },
    description: {
      type: String,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
    },
    features: {
      type: String,
    },
    stock: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "deleted"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);

const products = mongoose.model("products", productSchema);
module.exports.products = products;
