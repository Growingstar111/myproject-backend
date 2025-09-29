const { users } = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const { reasons } = require("../models/reasonSchema");
const { default: mongoose } = require("mongoose");
const { Category } = require("../models/category");
const { products } = require("../models/product");

async function viewUserList(req, res) {
  try {
    let page = parseInt(req.query.page) || 1;
    let pageLimit = parseInt(req.query.pageLimit) || 5;

    const viewAllUsers = await users.aggregate([
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $facet: {
          data: [{ $skip: pageLimit * (page - 1) }, { $limit: pageLimit }],
          count: [{ $count: "count" }],
        },
      },
    ]);
    if (viewAllUsers) {
      return res.status(200).json({
        message: "Succesfully finded All users",
        totalCount: viewAllUsers[0].count[0].count,
        count: viewAllUsers[0].data.length,
        data: viewAllUsers[0].data,
      });
    } else {
      return res.status(400).json({
        statusCode: 400,
        message: "users not find",
      });
    }
  } catch (error) {
    console.log("error-----", error);

    res.status(500).json("Request Failed Please try again !!!");
  }
}

// async function deleteUser(req, res) {
//   try {
//     const { id } = req.params;
//     await users.findByIdAndDelete({ _id: id });

//     res.status(200).json({
//       message: "User Deleted SuccessFully",
//     });
//   } catch (error) {
//     console.log("error-----", error);

//     res.status(500).json("Request Failed Please try again !!!");
//   }
// }

async function addNewUser(req, res) {
  try {
    const { firstname, lastname, email, role, password } = req.body;

    const userExist = await users.findOne({ email });

    if (userExist) {
      return res.status(400).json({
        message: "User is Already Exist !!!",
      });
    }
    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new users({
      firstname,
      lastname,
      email,
      role,
      password: hashPassword,
    });

    const saveUser = newUser.save();

    res.status(200).json({
      message: "New User is Added Succesfully !!!!",
      data: saveUser,
    });
  } catch (error) {
    console.log("error------", error);
    res.status(500).json({
      message: "Request Failed Please Check your Request",
    });
  }
}

// async function updateUser(req, res) {
//   try {
//     const id = req.userId;
//     const user = await users.findByIdAndUpdate(id, req.body);

//     if (!user) {
//       res.status(404).json({
//         message: "User Not Found . Please Provide a Valid Id",
//       });
//     }

//     res.status(200).json({
//       message: "User Updated Successflly !!!",
//       data: user,
//     });
//   } catch (error) {
//     console.log("error------", error);
//     res.status(500).json({
//       message: "Request Failed Please Check your Request",
//     });
//   }
// }
async function viewUser(req, res) {
  const { id } = req.params;
  const findUser = await users.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: "reasons",
        localField: "reasonId",
        foreignField: "_id",
        as: "reason",
      },
    },
  ]);

  if (!findUser) {
    return res.status(200).json({
      message: "user not found . Please Provide Valid id",
    });
  }

  res.status(200).json({
    statusCode: 200,
    message: "User Found Successfully",
    data: findUser[0],
  });
}

async function viewDeletedUser(req, res) {
  try {
    const { id } = req.params;
    const findDeltedUser = await users.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },

      {
        $lookup: {
          from: "reasons",
          localField: "reasonId",
          foreignField: "_id",
          as: "reason",
        },
      },
      {
        $unwind: {
          path: "$reason",
        },
      },
      {
        $project: {
          reason: { _id: 1, createdBy: 1, reason: 1 },
          firstname: 1,
          lastname: 1,
          status: 1,
          isVarified: 1,
          profileCompleted: 1,
        },
      },
    ]);
    if (!findDeltedUser) {
      return res.status(200).json({
        statusCode: 400,
        message: "user not found . Please Provide Valid id",
      });
    }

    res.status(200).json({
      statusCode: 200,
      message: "Deleted User find Succesfully",
      data: findDeltedUser[0],
    });
  } catch (error) {
    console.log("error----", error);
    res.status(500).json({
      statusCode: 500,
      message: "Internal Server Issue",
    });
  }
}
async function addReason(req, res) {
  try {
    const { reason } = req.body;
    console.log(reason);

    const adminId = req.userId;

    const newReason = new reasons({
      reason,
      createdBy: adminId,
    });

    const saveReason = newReason.save();

    return res.status(200).json({
      message: "Reason Added succesfully!!!",
      data: saveReason,
    });
  } catch (error) {
    console.log("error-----", error);
    res.json({ message: "Internal Server Issue" });
  }
}

async function banUser(req, res) {
  try {
    const { id } = req.params;

    // const findStatus = await users.findById({_id : id})
    // if (findStatus) {
    //     findStatus.status == "Deleted"
    //    return res.status(200).json({
    //       statusCode:400,
    //       message:"User Acoount is Deleted"
    //     })
    // }
    const newState = await users.findByIdAndUpdate(
      { _id: id },
      { $set: { status: "InActive" } }
    );

    return res.status(200).json({
      message: "User Is Banned !!!",
      data: newState,
    });
  } catch (error) {
    console.log("error----", error);
    res.status(500).json({
      message: "Internal Sever error",
    });
  }
}

async function unBanUser(req, res) {
  try {
    const { id } = req.params;

    const chnagestate = await users.findByIdAndUpdate(
      { _id: id },
      { $set: { status: "Active" } },
      { new: true }
    );
    res.status(200).json({
      statusCode: 200,
      message: "User status is changed Successfully",
      data: chnagestate,
    });
  } catch (error) {
    console.log("error----", error),
      res.status(500).json({
        message: "Internal Sever error",
      });
  }
}

async function addCategory(req, res) {
  try {
    const { category } = req.body;
    if(category == ""){
      return res.status(400).json({
        message:"Category can not be empty "
      })
    }
    const existedCategory = await Category.findOne({
      category: req.body.category,
    });
    if (existedCategory) {
      return res.status(200).json({
        statusCode: 400,
        message: "Category is already exist. Please try other category.",
      });
    }

    const adminId = req.userId;
    console.log(adminId);

    const newCategory = new Category({
      category,
      createdBy: adminId,
    });
    const saveCategory = newCategory.save();

    return res.status(200).json({
      statusCode: 200,
      message: "Category Added Succesfully",
      data: saveCategory,
    });
  } catch (error) {
    console.log("error----", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal Server error",
    });
  }
}

// api for viewing products based on status
async function viewProductsByStatus(req, res) {
 
  try {

    const status = req.query.status;

    const findproduct = await products.aggregate([
      {
        $match: { status: status },
      },
      {
        $project:{
        
          productName:'$name',
          productStatus: '$status'
          
        }
      }
    ]);
    if (!findproduct) {
      res.status(200).json({
        statusCode: 400,
        message: "Invalid status",
      });
    }
    return res.status(200).json({
      statusCode: 200,
      message: "Products find succesfully",
      data: findproduct,
    });
  } catch (error) {
    console.log(error, "--------error");
  }
}

module.exports = {
  viewUserList,
  // deleteUser,
  addNewUser,
  // updateUser,
  viewUser,
  addReason,
  banUser,
  unBanUser,
  viewDeletedUser,
  addCategory,
  viewProductsByStatus,
};
