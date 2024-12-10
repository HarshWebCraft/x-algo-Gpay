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

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "harshdvadhavana26@gmail.com",
        pass: "sfai mxlq yera mfmh",
      },
    });

    const mailOptions = {
      from: "ayushsantoki1462004@gmail.com",
      to: `${req.body.email}`,
      subject: "HTML Email Example",
      html: `<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
        <!-- Your existing email HTML content -->
        <a href="${verificationLink}" style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Verify Email</a>
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
