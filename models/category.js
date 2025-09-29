const { default: mongoose } = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      unique: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
module.exports.Category = Category;
