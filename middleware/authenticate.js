var jwt = require("jsonwebtoken");
const { users } = require("../models/userSchema");

const authentication = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      let token = req.headers.authorization;

      const data = jwt.verify(token, "__MY_SECRET_KEY__");

      if (data) {
        const userRecord = await users.find({ _id: data.userId });

        if (!userRecord) {
          return res.status(400).json({
            statusCode: 400,
            message: "user not found",
          });
        }

        req.userId = data.userId;

        return next();
      }
    } else {
     return next();
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Fail",
    });
  }
};
module.exports = authentication