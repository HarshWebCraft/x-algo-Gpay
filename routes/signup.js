const User = require('../models/users')
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
var db = mongoose.connection;

const crypto = require('crypto');
require('dotenv').config();

const signup = async (req, res) => {
  try {

    const data = {
      Name: "",
      Email: req.body.email,
      Password: "",
      MobileNo: "",
      Profile_Img: "",
      Broker: false,
      Verification: false,
      BrokerCount: 0,
      MyStartegies: [],
      Tour: false,
      BrokerSchema: []
    }

    const checking = await User.findOne({ Email: req.body.email });

    if (checking) {
      console.log("User details already exist");
      res.json({ signup: false });
    }
    else {
      console.log(data)

      db.collection('awts').insertOne(data, (err, res) => {
        if (err) console.log(err);
        console.log("inserted new user to database")
      })

      const secretKey = process.env.SECRET_KEY;
      const encryptMethod = 'AES-256-CBC';

      function encrypt(text, secret) {
        const iv = crypto.randomBytes(16); // Generate a random IV for each encryption
        const cipher = crypto.createCipheriv(encryptMethod, secret, iv);

        let encrypted = cipher.update(text, 'utf-8', 'base64');
        encrypted += cipher.final('base64');

        return {
          iv: iv.toString('base64'),
          encryptedData: encrypted,
        };
      }

      const encryptedData = encrypt(`${req.body.email}`, secretKey);
      console.log("asdasd")

      const verificationLink = `http://localhost:3000/verify-email?email=${(encryptedData.encryptedData)}&iv=${encryptedData.iv}`;


      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: 'harshdvadhavana26@gmail.com',
          pass: 'sfai mxlq yera mfmh'
        }
      });


      const mailOptions = {
        from: 'ayushsantoki1462004@gmail.com',
        to: `${req.body.email}`,
        subject: 'HTML Email Example',
        html: `<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
        <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
            style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
            <tr>
                <td>
                    <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                        align="center" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="height:80px;">&nbsp;</td>
                        </tr>
    
                        <tr>
                            <td style="height:20px;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td>
                                <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                    style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                    <tr>
                                        <td style="height:40px;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td style="padding:0 35px;">
                                            <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Verify Email</h1>
                                            <span
                                                style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                            <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                              Creating a strong password is crucial for ensuring the security of your account on our website. To create a robust password, consider using a combination of uppercase and lowercase letters, numbers, and special characters. Avoid using easily guessable information such as your name, birthdate, or common words. Aim for a password that is at least 8-12 characters long to enhance its strength. Additionally, we recommend not using the same password across multiple platforms to minimize the risk of unauthorized access. Regularly updating your password and keeping it confidential are also important practices to safeguard your account.
                                            </p>
                                            <a href="${verificationLink}"
                                                style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Verify Email</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="height:40px;">&nbsp;</td>
                                    </tr>
                                </table>
                            </td>
                        <tr>
                            <td style="height:20px;">&nbsp;</td>
                        </tr>
    
                        <tr>
                            <td style="height:80px;">&nbsp;</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        
    </body>`


      };

      // Send email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error occurred:', error);
        } else {
          console.log('Email sent:', info.response);
          return res.json({ email: data.email })
        }
      });

      console.log('Successfully Signup ')
      return res.json({ signup: true, userChema: checking, Verification: false })
    }
  }
  catch (e) {
    console.log("error is " + e)
  }
}

module.exports = signup;