var express = require("express");
var router = express.Router();
const auth = require("../middleware/auth");
const { creatingPaymentMethodAPI, creatingPaymentIntentApi, listPaymentMethods } = require("../controllers/payment");
const {  retriveAccount } = require("../commonModule/stripe");

router.post("/post-token", auth, creatingPaymentMethodAPI);

router.post('/create-payment', auth, creatingPaymentIntentApi);


router.get('/list-payment-methods', auth, listPaymentMethods);

router.get('/retrive-account', auth, retriveAccount)

// router.post('/fund-transfer', auth, fundTransfer)
module.exports = router;
