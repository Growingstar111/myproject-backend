var couponCode = require('coupon-code');
const { default: mongoose } = require("mongoose");
const {discountCoupen} = require("../models/discount");
const { schduleTask } = require('../cronJob');


async function createCoupen(req, res) {
    const userId = req.userId
 const coupenCode=  couponCode.generate({ partLen: 4, parts: 2});
    console.log(coupenCode,"CoupenCode");
    const expireAt = new Date(Date.now() + 1 * 60 * 1000);
   

    const createNewCoupen = await discountCoupen.create({
        coupenCode:coupenCode,
        discountPercentage:10,
        createdAt: Date.now(),
        expireAt: expireAt
    })
     await schduleTask(expireAt, coupenCode)
    const saveCoupen = await createNewCoupen.save()
    return res.status(200).json({
        message:"coupen is created ",
        data: saveCoupen
    })
    
}

module.exports = {createCoupen}


