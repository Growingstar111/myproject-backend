const { users } = require("../models/userSchema");
const { reasons } = require("../models/reasonSchema");
const bcrypt = require("bcryptjs");
const { CONST } = require("../commonModule/constant");
const jwt = require("jsonwebtoken");
const { generateOTPcode } = require("../commonModule/commonFuntion");
const { token } = require("morgan");
const { sendEmail, sendSMS } = require("../utils/sendOtp");
const { cart } = require("../models/cart");
const { default: mongoose, mongo } = require("mongoose");
const { createCustomer, createAccount } = require("../commonModule/stripe");
const { address } = require("../models/address");

async function handleGetAllUsers(req, res) {
  let pageNo = req.query.pageNo || 1;
  let pageLimit = req.query.pageLimit || 6;

  const allusers = await users.aggregate([
    {
      $sort: {
        _id: -1,
      },
    },
    {
      $facet: {
        data: [{ $skip: pageLimit * (pageNo - 1) }, { $limit: pageLimit }],
        count: [{ $count: "count" }],
      },
    },
  ]);
  if (allusers) {
    return res.status(200).json({
      statusCode: 200,
      totalCount: allusers[0].count[0].count,
      data: allusers[0].data,
      message: "successfully",
    });
  } else {
    return res.status(400).json({
      statusCode: 400,
      message: "users not find",
    });
  }
}

async function handleGetUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await users.findById(id);
    res.status(200).json(user);
  } catch (errors) {
    res.status(500).json({ message: errors.message });
  }
  /********************** GET USER BY ID ***********************/
}
async function viewUserProfile(req,  res) {

   const user = req.user
  return res.status(200).json({
    message:"User find successfully",
    data:{name: user.name, phone: user.phone , email:user.email}
  })
}

async function handleEditUserById(req, res) {
  try {
    const userId = req.params.id;

    const findOldUser = await users.findById(userId);

    if (!findOldUser) {
      return res.status(404).json({ message: "User  not found" });
    }

    const updatedUser = await users.findByIdAndUpdate(userId, req.body);
    return res.status(200).json(updatedUser);
  } catch (errors) {
    res.status(400).json({ message: "user not found" });
  }
}

async function handleDeleteUser(req, res) {
  {
    const { id } = req.params;
    const user = await users.findByIdAndDelete(id, req.body);

    res.status(200).json(user);
  }
}

// api for User Registration
async function handlePostUser(req, res) {
  try {
    const { email, name, phone, password, role } = req.body;

    const emaiExist = await users.findOne({ email: req.body.email });
    console.log(emaiExist);

    if (emaiExist) {
      return res.status(400).json({
        statusCode: 400,
        message: "Email Is Already Exist",
      });
    }

    const hashPassword = bcrypt.hashSync(password, 10);
    console.log(hashPassword);

    let roleValue;
    switch (role) {
      case "admin":
        roleValue = CONST.admin;
        break;
      case "user":
        roleValue = CONST.user;
        break;
      case "company":
        roleValue = CONST.company;
        break;
      default:
        roleValue = CONST.user;
    }

    const verificationCode = generateOTPcode;

    const subject = "Welcome to Tech Haven Service !";
    const text = `Hello User,  Thank you for registering! This is your Verifcation Code ${verificationCode}`;

    // const body = `Hello User, Tech Heaven this side. Thank you for regestring! This is your Verifcation Code ${verificationCode}`;
    // const phoneNumber = phone;
    // console.log(phoneNumber);
    // console.log(body);

    const newUser = new users({
      name,
      phone,
      email,
      password: hashPassword,
      role: roleValue,
      verificationCode,
    });
    if (req.body.role == "user") {
      const customer = await createCustomer(name, email);
      newUser.customerId = customer;
    } else if (req.body.role == "company") {
      const account = await createAccount(email);
      newUser.accountId = account?.id;
    }
    const saveUser = await newUser.save();
    console.log(phone);
    res.status(200).json({
      statusCode: 200,
      data: saveUser,
      message: "User  Registered  SuccesFully!",
      email: saveUser.email,
    });
    sendEmail(email, subject, text);

    // sendSMS(body, phoneNumber);
  } catch (errors) {
    console.log(errors);

    res.status(400).json({ mess: "user not found" });
  }
}

//api for User Login
async function handleUserLogin(req, res) {
  try {
    const { email, password } = req.body;
    const user = await users.findOne({ email: email });
    console.log(req.body, "req.body");

    console.log(user, "user");

    if (!user) {
      return res.status(400).json({
        statusCode: 400,
        message: "User  not found",
      });
    }
    if (user.status == "Deleted") {
      res.status(400).json({
        message: "User Account Is Deleted . Please Create Another Account",
      });
    }
    if (user.status == "Inactive") {
      res.status(400).json({
        message: "Your Acccount is Banned. Pleases Contact Admin. !!!",
      });
    }

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      console.log(isMatch);

      if (isMatch == false) {
        return res.status(400).json({
          statusCode: 400,
          message: "Password is Incorrect",
        });
      }

      if (isMatch == true) {
        const token = jwt.sign({ userId: user._id }, "__MY_SECRET_KEY__");

        user.token = token;
        await user.save();

        const cartItems = await cart.aggregate([
          {
            $match: { createdBy: user._id },
          },
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "_id",
              as: "userInfo",
            },
          },
          {
            $group: {
              _id: "$createdBy",
              count: { $sum: 1 },
            },
          },
        ]);
        const cartItemsCount = cartItems.length > 0 ? cartItems[0].count : 0;

        return res.json({
          statusCode: 200,
          data: { user, token, cartItemsCount },

          message: "Login Successfully",
        });
      } else {
        res.status(400).json({
          statusCode: 400,
          message: "Invalid Credentials",
        });
      }
    }
  } catch (error) {
    console.log("error---", error);
    res.status(500).json({ message: "Bad Request" });
  }
}

//api for verifying otp
async function handleVerifyOtp(req, res) {
  try {
    const { email, verificationCode } = req.body;

    const user = await users.findOne({
      email,
      verificationCode,
    });

    if (!user) {
      return res.status(400).json({
        message: "Wrong Otp",
        statusCode: 400,
      });
    }
    console.log(user);

    if (user) {
      await users.updateOne({ email }, { $set: { isVarified: true } });
    }

    return res.status(200).json({
      statusCode: 200,
      message: "Verified ",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed Request",
      statusCode: 500,
    });
  }
}

// api for handle Forget Password
async function handleForgetPassword(req, res) {
  try {
    const { email, phone } = req.body;
  
    if (email == "" && phone== "") {
       return res.status(400).json({
        message:"Please Provide your email or Phone Number"
       })
    }
    const setCode = async ()=> {
      const generatedCode = generateOTPcode;
    await users.updateOne(
      { email, phone },
      { $set: { verificationCode: generatedCode } }
    )
    return generatedCode;

  } 
    if (email) {
      const findEmail = await users.findOne({ email });
      if (findEmail) {
        // const generatedCode = generateOTPcode;
        // await users.updateOne(
        //   { email,phone },
        //   { $set: { verificationCode: generatedCode } }
        // );
        const generatedCode = await setCode();
        res.status(200).json({
          statusCode: 200,
          message:
            "Verification Code is Successfully sended to the email. Please Verify",
          data: email,
        });

        const subject = "Welcome to Tech Haven Service !";
        const text = `Hello User,  Thank you for registering! This is your Verifcation Code ${generatedCode}`;
        await sendEmail(email, subject, text);
      }
    } else if (phone) {
      const findPhone = await users.findOne({ phone });
      if (findPhone) {
        // const generatedCode = generateOTPcode;
        // await users.updateOne(
        //   { phone },
        //   { $set: { verificationCode: generatedCode } }
        // );
        const generatedCode = await setCode();
        res.status(200).json({
          statusCode: 200,
          message:
            "Verification Code is successfully Sended TO your Phone Please Verify.",
          data: phone,
        });
        const body = `Hello User, Tech Heaven this side. Thank you for regestring! This is your Verifcation Code ${generatedCode}`;
        sendSMS(body, phone);
      }
    } else {
      res.status(200).json({
        statusCode: 400,
        message: "User Not Found. Please Provide Valid Email Or Phone number",
      });
    }
  } catch (error) {
    console.log("error----", error);
    res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }

  // try {
  //   const { email } = req.body;

  //   const userExist = await users.findOne({ email });
  //   console.log(userExist);

  //   if (userExist) {
  //     const generatedCode = generateOTPcode;

  //     await users.updateOne(
  //       { email },
  //       { $set: { verificationCode: generatedCode } }
  //     );
  //     console.log(generatedCode, email);

  //     return res.status(200).json({
  //       statusCode: 200,
  //       message: "Verification Code send Successfully. Please Verify.",
  //       data: { email, generatedCode },
  //     });
  //   } else {
  //     res.status(400).json({
  //       statusCode: 400,
  //       message: "Email Not Found",
  //     });
  //   }
  // } catch (error) {
  //   res.json({
  //     statusCode: 500,
  //     message: "Request failed",
  //   });
  // }
}

// api for Setting New Password
async function handleSetNewPassword(req, res) {
  try {
    const { password, email } = req.body;
   
    if (email) {
      const hashPassword = bcrypt.hashSync(password, 10);
      console.log(password);
      console.log(hashPassword);

      await users.updateOne({ email }, { $set: { password: hashPassword } });

      return res.json({
        statusCode: 200,
        message: "Your Password is Changed",
      });
    }
    console.log("Your Password is Changed");
    if (!email) {
      res.json({
        statusCode: 400,
        message: "Email does Not Exist",
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: "Bad Request",
    });
  }
}

// api for Logout
async function handleLogoutUser(req, res) {
  console.log(">>>>>>>>>>>>>", req.userId);

  try {
    await users.updateOne({ _id: req.userId }, { $set: { token: "" } });
    console.log("logout");

    res.status(200).json({
      message: "Logout Successfully",
    });
  } catch (error) {
    console.log(error);

    return res.json({
      statusCode: 500,
      message: "Request Failed",
    });
  }
}

// api for Chnage Password
async function handleChangePassword(req, res) {
  console.log("request recives", req.userId);

  try {
    const { password, newpassword } = req.body;
    console.log(req.body);

    const user = await users.findOne({ _id: req.userId });

    console.log(user);
    console.log(req.userId);

    if (!user) {
      return res.json({
        statusCode: 404,
        message: "USer Not Found",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    console.log(password, newpassword);
    if (isMatch == false) {
      res.json({
        statusCode: 400,
        message: "Incorrect Password",
      });
    }
    console.log(isMatch);
    if (isMatch == true) {
      let hashPassword = await bcrypt.hash(newpassword, 10);
      user.password = hashPassword;
    }
    await user.save();

    return res.json({
      statusCode: 200,
      message: "Password changed successfully",
      data: user._id,
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: "Request Failed",
    });
  }
}

//api for fetching profile
async function fetchingProfile(req, res) {
  console.log("request recives", req.userId);
  try {
    const viewProfile = await users.findOne({ _id: req.userId });
    if (viewProfile) {
      res.status(200).json({
        data: viewProfile,
      });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "server errror",
    });
  }
}

// api for update profile
async function updateProfileById(req, res) {
  console.log("useridddd", req.userId);

  const id = req.userId;
  console.log(id);

  const findUser = await users.findOne(id);

  if (!findUser) {
    res.status(400).json({
      message: "User Not Found!!! Provide a valid Token",
    });
  }
  const user = await users.findByIdAndUpdate(id, req.body);
  // console.log("idddddddddd", user);

  if (!user) {
    res.status(400).json({
      message: "Please Provide a valid Token",
    });
  }

  res.status(200).json({
    message: "Profile is Updated successfully",
    data: user,
  });
}

// api for delete account
async function deleteUserAccount(req, res) {
  try {
    const _id = req.userId;
    const user = await users.findById(_id);
    //  console.log(userId);
    console.log(user);

    const { reasonId, discription } = req.body; //???????
    console.log(reasonId);
    const reason = await reasons.findById({ _id: reasonId });
    console.log(reason);

    const newState = await users.updateOne(
      { _id },
      {
        $set: {
          status: "Deleted",
          deletionReason: discription,
          reasonId: reasonId,
        },
      }
    );
    return res.status(200).json({
      message: "Account is Deleted Succesfully",
      data: (reason, newState),
    });
  } catch (error) {
    console.log("error---", error);
  }
}

//api for storing address
async function addAddress(req, res) {
  try {
    const { name, phone, street, city, state, pincode } = req.body;
    const userId = req.userId;
    const createAddress = await address.create({
      name,
      phone,
      street,
      city,
      state,
      pincode,
      createdBy: userId,
    });

    const saveAddress = await createAddress.save();

    return res.status(200).json({
      statusCode: 200,
      message: "Your adddress is added successfully",
      saveAddress,
    });
  } catch (error) {
    console.log("error---", error);
    return res.status(500).json({
      message: "Somthing went Wrong",
    });
  }
}

//api for getting user addresses
async function getUserAdresses(req, res) {
  try {
    const findAddress = await address.aggregate([
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(req.userId),
        },
      },
    ]);
    if (!findAddress) {
      return res.status(200).json({
        message: "User does not have any addresses",
      });
    }
    return res.status(200).json({
      statusCode: 200,
      message: "User addresses found successfully...",
      findAddress,
    });
  } catch (error) {
    console.log("error---", error);
    return res.status(500).json({
      message: "Something went Wrong",
    });
  }
}

// api for deleting addresses
async function deleteAddresses(req, res) {
  try {
    const userId = req.userId;
    // const addressId = req.body;

    const findAddress = await address.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.body.addressId),
          createdBy: new mongoose.Types.ObjectId(userId),
        },
      },
    ]);
    if (!findAddress) {
      return res.status(400).json({
        statusCode: 400,
        message: "address not found",
      });
    }
    await address.deleteOne({
      _id: new mongoose.Types.ObjectId(req.body.addressId),
    });

    res.status(200).json({
      statusCode: 200,
      message: "address deleted succesfully",
      data: findAddress,
    });
  } catch (error) {
    console.log("error--", error);
    res.status(500).json({
      message: "Somthing went Wrong",
      statusCode: 500,
    });
  }
}

module.exports = {
  handleGetAllUsers,
  handlePostUser,
  handleGetUserById,
  handleEditUserById,
  handleDeleteUser,
  handleUserLogin,
  handleVerifyOtp,
  handleForgetPassword,
  handleSetNewPassword,
  handleChangePassword,
  handleLogoutUser,
  fetchingProfile,
  updateProfileById,
  deleteUserAccount,
  addAddress,
  getUserAdresses,
  deleteAddresses,
  viewUserProfile
};
