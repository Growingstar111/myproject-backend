const {
  createPaymentMethod,
  createPaymentIntent,
  listPayment,
  
} = require("../commonModule/stripe");
const { Payment } = require("../models/payment");
const { default: mongoose } = require("mongoose");

//api for payment method getting token from frontend
async function creatingPaymentMethodAPI(req, res) {
  try {
    const { tokenId } = req.body;
    console.log(req.user, "request body of post Token");

    const customerID = req.user.customerId;

    console.log(customerID, "idddddddd");

    const paymentMethod = await createPaymentMethod(tokenId, customerID);
    console.log("saving methos", paymentMethod);

    const savePaymethod = await Payment.create({
      paymentMethodId: paymentMethod,
      userId: req.userId,
    });
    console.log(req.userId);

    const payment = await savePaymethod.save();
    res.status(200).json({
      message: "Payment MEthod created Successfully",
      data: payment,
    });
  } catch (error) {
    console.log("error---", error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};


//api for listing paymethod 
async function listPaymentMethods(req, res) {
  
 try {
  const customerId = req.user.customerId;
  if (!customerId) {
    return res.status(400).json({
      statusCode: 400,
      message: "Customer ID is required",
    });
  }


  const paymentMethods = await listPayment(customerId)
  if (!paymentMethods) {
       return res.status(200).json({
        statusCode:200,
        message:"their is no payment methods of yours"
       })
  }
   return res.status(200).json({
    statusCode:200,
    message:"Here is your Payment Methods",
   data:paymentMethods
   })

 } catch (error) {
  console.log("error---", error);
  return res.status(500).json({
    statusCode:500,
    message:"Something went Wrong"
  })
  
 }
  

}


//api for payment intent from frontend
async function creatingPaymentIntentApi(req, res) {
  try {
    const { amount, currency, paymentMethodId , accountId} = req.body;
    console.log(req.body, "req.body of payment intent");
    console.log(amount, "req.body of amountt");
    if (!amount || !currency) {
      return res.status(400).json({
        statusCode: 400,
        message: "Amount and currency are required.",
      });
    }

    const customerId = req.user.customerId;
    // console.log(customerId, "customer id from middleware");

   
    // console.log(
    //   paymentMethodId,
    //   " paymentmethodid from createPaymentmehtod() "
    // );
    if (!paymentMethodId) {
      return res.status(400).json({
        statusCode: 400,
        message: "Failed to create payment method.",
      });
    }
    const payment = await createPaymentIntent(
      amount,
      currency,
      customerId,
      paymentMethodId,
      accountId
    );
    // console.log(payment, "payment intent function");
    if (!payment) {
      return res.status(400).json({
        statusCode: 400,
        message: "Failed to create payment intent.",
      });
    }
    return res.status(200).json({
      statusCode: 200,
      message: "Payment is created Successfully",
      data: payment,
    });
  } catch (error) {
    console.log("error---", error);
    return res.status(500).json({
      message: "Somthing went Wrong",
    });
  }
}

//api for fund transfering
// async function createFundTransfer(req, res) {
//   const userid = req.userId
//     const payIntent = await createPaymentIntent()
//     console.log(payIntent);
//     console.log(userid);
    
//     const retrivePaymentIntent = await fundTransfer(payIntent)
//      return res.status(200).json({
//       data: retrivePaymentIntent
//      })
// }


module.exports = { creatingPaymentMethodAPI, creatingPaymentIntentApi, listPaymentMethods };
