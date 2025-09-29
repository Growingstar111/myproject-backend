const { Payment } = require("../models/payment");
const { users } = require("../models/userSchema");
require("dotenv").config();

const stripe = require("stripe")(
   process.env.Stripe_Secret_key
);

//api for creating customer
async function createCustomer(name, email, res) {
  try {
    const customer = await stripe.customers.create({
      name: name,
      email: email,
    });
    console.log(customer.id, "rrrrrrrrrrrrrrrrrrrrrrrr");
    // const  customerId = customer.id

    return customer.id;
  } catch (error) {
    console.log(error, "error----");
    res.status(500).json({
      message: "Somthing went Wrong",
    });
  }
}

// api for creating account
async function createAccount(email) {
  try {
    const account = await stripe.accounts.create({
      country: "US",
      email: email,
      controller: {
        fees: {
          payer: "application",
        },
        losses: {
          payments: "application",
        },
        stripe_dashboard: {
          type: "express",
        },
      },
    });
    return account;
  } catch (error) {
    console.log(error, "error---");
    throw error;
  }
}

async function retriveAccount(req, res) {
  try {
    const account = await stripe.accounts.retrieve(req.user.accountId);

    if (
      account?.requirements?.currently_due !=  "" &&

      account?.requirements?.past_due != "" &&

      account?.requirements?.eventually_due != "" &&

      account?.requirements?.disabled_reason != null
    ) {
      return res?.status(200).json({
        statusCode: 400,
        message:
          "Acoount is currently  restricted.",
        requirements: account?.requirements,
        Onboard_status:3
      });
    }
    if (account?.requirements?.eventually_due  !=  "" ) {
      return res?.status(200).json({
        statusCode: 400,
        message:
          "Acocunt Onboarding is Pending",
          // There are some personal information  to be fullfilled. 
        requirements: account?.requirements?.eventually_due,
        Onboard_status:2
      });
    }

    res.status(200).json({
      statusCode: 200,
      message: "Account Onboarding is complete ",
      data: account?.requirements,
      Onboard_status:1
    });
  } catch (error) {
    console.log(error, "error---");
    res.status(500).json({
      message: "Something went wrong.",
    });
  }
}
async function accountLink(req, res) {
  try {
    const accountId = req.user.accountId;
    if (!accountId) {
      return res.status(400).json({
        message: "Cannot Get the Account Id",
      });
    }
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: "http://localhost:5173/home",
      return_url: "http://localhost:5173/home",
      type: "account_onboarding",
    });

    return res.status(200).json({
      statusCode: 200,
      message: "Here is your Requested URL",
      data: accountLink,
    });
  } catch (error) {
    console.log(error, "error");
    res.status(500).json({
      statusCode: 500,
      message: "Somthing went wrong",
    });
  }
}

//api  for creating payment method
async function createPaymentMethod(token, customerID) {
  try {
    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        token: token,
      },
    });
    // console.log(paymentMethod,"method");
    // console.log(token,"tokenenenenn");

    const customerId = customerID;
    console.log(customerId, "cus iddddddd");

    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: customerId,
    });

    // const payment_method_id = paymentMethod.id;
    console.log(paymentMethod.id);

    return paymentMethod.id;
  } catch (error) {
    console.log(error, "catched  error----");
    throw error;
  }
}

//api for listing payment mehtod
async function listPayment(customerId) {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      type: "card",
      limit: 10,
      customer: customerId,
    });
    return paymentMethods;
  } catch (error) {
    console.log("error---", error);
    throw error;
  }
}

// api for creating payment  intent
async function createPaymentIntent(
  amount,
  currency,
  customerId,
  paymentMethodId,
  accountId
) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      customer: customerId,
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
      },
      transfer_data: {
        destination: accountId,
        amount: (amount * 90) / 100,
      },
      return_url: `http://localhost:5173/home`,
    });
    console.log(paymentIntent.status, "intent id");
    console.log(paymentIntent.id, "intent id");

    return paymentIntent;
  } catch (error) {
    console.log(error, "catched  error----");
    throw error;
  }
}

// api for create card
// async function createCard(req, res) {
//   const customerSource = await stripe.customers.createSource(
//     "cus_9s6XGDTHzA66Po", //customer id
//     {
//       source: "tok_visa", //token
//     }
//   );

//   return customerSource;
// }

//api for deleting card
// async function deleteCard(req , res) {

// api for deleting card
// const customerSource = await stripe.customers.deleteSource(
//   'acct_1032D82eZvKYlo2C', // customer Id ???? account Id??
//   'card_1NGTaT2eZvKYlo2CZWSctn5n' // card Id ???
// );

//api for fund transfer
// async function fundTransfer(payIntent) {
//   try {

//       const paymentIntent = await stripe.paymentIntents.retrieve(payIntent);

//       if (paymentIntent.status === 'succeeded') {

//           const amountToTransfer = Math.floor(paymentIntent.amount_received * 0.98);

//           const transfer = await stripe.transfers.create({
//               amount: amountToTransfer,
//               currency: 'usd',
//               destination: "acct_1Qea1XR7ljlYjpNn",
//               description: 'Transfer of 98% of payment received',
//           });

//           return {
//               success: true,
//               transfer,
//           };
//       } else {
//           return {
//               success: false,
//               error: 'Payment intent not successful',
//           };
//       }
//   } catch (error) {
//       throw error

//   }
// }

module.exports = {
  createCustomer,
  createPaymentMethod,
  createPaymentIntent,
  listPayment,
  createAccount,
  accountLink,
  retriveAccount,
};
