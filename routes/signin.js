const User = require("../models/users");
const axios = require("axios");
const nodemailer = require("nodemailer");

const getLocationFromIP = async (ip) => {
  const response = await axios.get(`http://ip-api.com/json/${ip}`);
  return response.data;
};

const signin = async (req, res) => {
  const checking = await User.findOne({ Email: req.body.email });
  const userIp = req.clientIp;
  console.log(">>>>>>>>>>>", userIp);

  if (checking) {
    if (checking.Verification) {
      if (checking.Password == req.body.pass) {
        console.log("signin successfully");

        const location = await getLocationFromIP(userIp);

        // Email content with location
        const emailContent = `
          <p>A login was detected from the following details:</p>
          <ul>
            <li>IP Address: ${userIp}</li>
            <li>City: ${location.city}</li>
            <li>Region: ${location.regionName}</li>
            <li>Country: ${location.country}</li>
          </ul>
        `;

        sendEmail(req.body.email, emailContent);

        res.json({
          email: true,
          password: true,
          userSchema: checking,
          verification: true,
        });
      } else {
        res.json({ email: true, password: false, verification: true });
      }
    } else {
      res.json({ email: true, verification: false });
    }
  } else {
    res.json({ email: false });
  }
};

const sendEmail = async (userEmail, ipAddress) => {
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
    from: "X-Algos<team@xalgos.in>",
    to: `${userEmail}`,
    subject: "Login Alert",
    text: `A login was detected from the following IP address: ${ipAddress}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = signin;
