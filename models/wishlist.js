const { default: mongoose } = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "products",
    },
  },
  {
    timestamps: true,
  }
);

const wishlist = mongoose.model("wishlist", wishlistSchema);
module.exports = wishlist;
