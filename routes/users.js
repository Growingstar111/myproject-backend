var express = require("express");
var router = express.Router();

const {
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
  viewUserProfile,
  
} = require("../controllers/users");
const auth = require("../middleware/auth");
const multer = require("multer");
const { accountLink } = require("../commonModule/stripe");

/*************  Done  **************/

//upload api
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const uploadStorage = multer({ storage: storage });

// Single file
router.post("/upload/single", uploadStorage.single("file"), (req, res) => {
  console.log(req.file);
  return res.send("Single file");
});

/********** FIND USER  ***********/

router.get("/users", handleGetAllUsers);

/*********** POST USER  ***************/
router.post("/register", handlePostUser);

/*********** GET USER BY ID **********/

router.get("/getuser/:id", handleGetUserById);

router.get('/viewuser-profile',auth,viewUserProfile)

/***********  UPDATE USER ***********/
router.put("/edit/:id", handleEditUserById);

/***********  DELETE USER *************/
router.delete("/delete/:id", handleDeleteUser);

/***********  LOGIN USER ***********/

router.post("/login", handleUserLogin);

/**********  LOGIN USER ************/
router.post("/verifyuser", handleVerifyOtp);

router.post("/forgetpassword", handleForgetPassword);

router.put("/setpassword", handleSetNewPassword);

// console.log(auth)

router.post("/change-password", auth, handleChangePassword);

router.get("/viewprofile", auth, fetchingProfile);

router.delete("/logout", auth, handleLogoutUser);

router.post("/update-profile", auth, updateProfileById);

router.delete("/delete-account", auth, deleteUserAccount);

router.post('/add-address',auth, addAddress)

router.get('/get-addersses',auth, getUserAdresses)

router.put('/delete-address', auth, deleteAddresses)

router.post('/link-account', auth, accountLink)


module.exports = router;
