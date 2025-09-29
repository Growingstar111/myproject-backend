const nodemailer = require("nodemailer");
require('dotenv').config();

// Load environment variables from .env file


// Create a transporter for nodemailer using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.Email, // Use the email from .env
    pass: process.env.Email_Password // Use an environment variable for the password
  },
});

// Function to send an email
const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.Email, // Use the email from .env
    to: to,
    subject: subject,
    text: text
  };

  return transporter.sendMail(mailOptions)
    .then(info => {
      console.log('Email sent: ' + info.response);
    })
    .catch(error => {
      console.error('Error sending email: ', error);
    });
};

// Function to send an SMS
const sendSMS = (body, phoneNumber) => {
  const accountSid = process.env.Account_Sid; // Corrected spelling
  const authToken = process.env.Auth_Token_Twilio;
  const client = require("twilio")(accountSid, authToken);

  client.messages
    .create({
      body: body,
      from: process.env.Number,
      to: phoneNumber,
    })
    .then((message) => console.log('SMS sent: ' + message.sid))
    .catch(error => {
      console.error('Error sending SMS: ', error);
    });
};

module.exports = { sendEmail, sendSMS };