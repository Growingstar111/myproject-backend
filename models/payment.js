const { default: mongoose } = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    paymentMethodId: {
      type: String,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);
module.exports.Payment = Payment;
