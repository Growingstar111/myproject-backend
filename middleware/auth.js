var jwt = require("jsonwebtoken");
const { users } = require("../models/userSchema");

const auth = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      let token = req.headers.authorization;

      const data = jwt.verify(token, "__MY_SECRET_KEY__");
      if (data) {
        const userRecord = await users.findOne({ _id: data.userId });
        if (!userRecord) {
          res.status(400).json({
            message: "user not found ",
          });
        }
        req.userId = data.userId;
        req.user = userRecord
      
        return next();
      }
    } else {
      res.status(400).json({
        message: "Provide the authorization token.",
      });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Fail",
    });
  }
};

module.exports = auth;
