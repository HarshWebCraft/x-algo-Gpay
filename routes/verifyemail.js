const User = require("../models/users");

const crypto = require("crypto");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
} // Load environment variables from .env file

const secretKey = process.env.SECRET_KEY;
const encryptMethod = "AES-256-CBC";

function decrypt(encryptedData, secret, iv) {
  const decipher = crypto.createDecipheriv(
    encryptMethod,
    secret,
    Buffer.from(iv, "base64")
  );

  let decrypted = decipher.update(encryptedData, "base64", "utf-8");
  decrypted += decipher.final("utf-8");

  return decrypted;
}
const verifyUser = async (req, res) => {
  console.log("Request Body:", req.body);

  if (!req.body.urlEmail || !req.body.iv) {
    console.error("urlEmail or iv is missing in the request body");
    return res.status(400).json({ message: "Invalid request data" });
  }

  if (!secretKey) {
    console.error("Secret key is not defined in environment variables");
    return res.status(500).json({ message: "Server configuration error" });
  }

  try {
    const decryptedData = decrypt(req.body.urlEmail, secretKey, req.body.iv);
    console.log("Decrypted:", decryptedData);

    const user = await User.findOne({ Email: decryptedData });
    if (user) {
      const update = await User.updateOne(
        { Email: decryptedData },
        {
          $set: {
            Verification: true,
            Name: req.body.name,
            Password: req.body.password,
            MobileNo: req.body.mobileNumber,
          },
        }
      );
      console.log(update);
      return res.json({ message: "password is set" });
    } else {
      return res.json({ message: "password is not set" });
    }
  } catch (error) {
    console.error("Decryption or database error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = verifyUser;
