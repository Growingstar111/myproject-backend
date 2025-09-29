const { default: mongoose } = require("mongoose");
const { CONST } = require("../commonModule/constant");
const { reasons } = require("./reasonSchema");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    phone: {
      type: String,
    },

    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },
    isVarified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: [CONST.user, CONST.admin, CONST.company],
      default: "user",
      required: true,
    },
    verificationCode: String,

    token: String,

    profileImage: {
      type: String,
    },

    profileCompleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Deleted"],
      default: "Active",
    },
    deletionReason: {
      type: String,
    },

    reasonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "reasons",
    },

    customerId: {
      type: String,
    },

    accountId: {
      type: String,
    },
  },

  {
    timestamps: true,
  }
);
const users = mongoose.model("user", userSchema);
module.exports.users = users;
