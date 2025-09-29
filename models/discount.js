const { default: mongoose } = require("mongoose");

const discountSchema = new mongoose.Schema(
  {
    coupenCode: {
      type: String,
    },
    discountPercentage: {
      type: Number,
    },
    createdAt: {
      type: Date,
    },

    expireAt: {
      type: Date,
    },

    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
// discountSchema.index({createdAt: 1},{expireAfterSeconds: 30});

const discountCoupen = mongoose.model("discountCoupen", discountSchema);
module.exports.discountCoupen = discountCoupen;
