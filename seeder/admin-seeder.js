const mongoose = require("mongoose");

const { users } = require("../models/userSchema");
const { CONST } = require("../commonModule/constant");
const bcrypt = require("bcryptjs");

async function seedAdmin() {
  const existingAdmin = await users.findOne({ role: CONST.admin });
  if (existingAdmin) {
    console.log("Admin is already Existed");
  } else {
       const hashPassword = bcrypt.hashSync("Admin@0001", 10);
        console.log(hashPassword);

    const adminCredentials = {
      
      name: "Amdin",
      email: "Admin@yahoo.in",
      password: hashPassword,
      role: CONST.admin,
      isVarified: true,
    };

    
    await users.create(adminCredentials);
  
    console.log("Admin Created Successfully");
  }
}
module.exports = { seedAdmin };
