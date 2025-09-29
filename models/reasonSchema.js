const { default: mongoose } = require("mongoose");

const reasonSchema = new mongoose.Schema({
  reason: {
    type: String,
    required: true,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
});

const reasons = mongoose.model("reasons", reasonSchema);

module.exports.reasons = reasons;
