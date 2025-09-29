var express = require("express");
var router = express.Router();
const auth = require("../middleware/auth");

const {createOrder, listingOrder}= require('../controllers/order');
const { createCoupen } = require("../controllers/discount");

router.post ('/create-order', auth, createOrder)

router.get('/view-orders', auth,listingOrder)

router.post ('/create-coupen', createCoupen)
// const { schduleTask } = require('../cronJob');




module.exports = router;