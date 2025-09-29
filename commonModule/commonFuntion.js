
const generateOtp = require("otp-generator");
const multer = require("multer");


// otp genrator function 
const generateOTPcode = generateOtp.generate(4, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
 

  // common funtion for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const uploadStorage = multer({ storage: storage });

 

  module.exports = {generateOTPcode , uploadStorage}