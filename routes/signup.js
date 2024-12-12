const User = require("../models/users");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const crypto = require("crypto");
var db = mongoose.connection;

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const generateXalgoID = async () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";

  // Generate first 4 letters
  const letterPart = Array(4)
    .fill(null)
    .map(() => letters.charAt(Math.floor(Math.random() * letters.length)))
    .join("");

  // Generate last 3 digits
  const digitPart = Array(3)
    .fill(null)
    .map(() => digits.charAt(Math.floor(Math.random() * digits.length)))
    .join("");

  return letterPart + digitPart;
};

const isXalgoIDUnique = async (XalgoID) => {
  const existingUser = await User.findOne({ XalgoID });
  return !existingUser;
};

const signup = async (req, res) => {
  try {
    const url =
      process.env.NODE_ENV === "production"
        ? "https://xalgos.in"
        : "http://localhost:3000";

    const checking = await User.findOne({ Email: req.body.email });

    if (checking) {
      console.log("User details already exist");
      return res.json({ signup: false });
    }

    let XalgoID;
    do {
      XalgoID = await generateXalgoID();
    } while (!(await isXalgoIDUnique(XalgoID)));

    const data = {
      Name: "",
      Email: req.body.email,
      Password: "",
      MobileNo: "",
      Profile_Img: "",
      Broker: false,
      Verification: false,
      BrokerCount: 0,
      ActiveStrategys: 0,
      MyStartegies: [],
      Tour: false,
      XalgoID: XalgoID, // Add the unique XalgoID
      BrokerIds: ["Paper Trade"],
    };

    console.log(data);

    db.collection("userdatas").insertOne(data, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Inserted new user to database");
      }
    });

    const encrypt = (text) => Buffer.from(text).toString("base64");
    const encryptedEmail = encrypt(req.body.email);

    const verificationLink = `${url}/verify-email?email=${encodeURIComponent(
      encryptedEmail
    )}`;

    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: "harshdvadhavana26@gmail.com",
    //     pass: "sfai mxlq yera mfmh",
    //   },
    // });

    const transporter = nodemailer.createTransport({
      host: "smtpout.secureserver.net", // Replace with smtp.office365.com if using Microsoft 365
      port: 465, // Use 587 for TLS
      secure: true, // true for 465, false for 587
      auth: {
        user: "team@xalgos.in", // Your professional email
        pass: "*@|905@xalgos.in", // Your GoDaddy email password
      },
      logger: true,
      debug: true,
    });

    const mailOptions = {
      from: "XAlgos<team@xalgos.in>",
      to: `${req.body.email}`,
      subject: "Verify Your Email Address for XAlgos",
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
    </body>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error occurred:", error);
      } else {
        console.log("Email sent:", info.response);
        return res.json({ email: data.email });
      }
    });

    console.log("Successfully Signup");
    return res.json({
      signup: true,
      Verification: false,
    });
  } catch (e) {
    console.log("Error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = signup;
