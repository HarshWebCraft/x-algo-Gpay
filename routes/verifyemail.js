const User = require("../models/users");
const crypto = require("crypto");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config(); // Load environment variables from .env file
}

const secretKey = process.env.SECRET_KEY;
const encryptMethod = "AES-256-CBC";

function decrypt(encryptedData, secret, iv) {
  try {
    const decipher = crypto.createDecipheriv(
      encryptMethod,
      secret,
      Buffer.from(iv, "base64")
    );
    let decrypted = decipher.update(encryptedData, "base64", "utf-8");
    decrypted += decipher.final("utf-8");
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error.message);
    throw error;
  }
}

const verifyUser = async (req, res) => {
  // For handling data from query params (URL) and body if sent through JSON
  const encryptedEmail = req.body.urlEmail;
  const iv = req.body.iv;

  console.log("Encrypted Email:", encryptedEmail);
  console.log("IV:", iv);

  if (!encryptedEmail || !iv) {
    console.error("urlEmail or iv is missing in the request");
    return res.status(400).json({ message: "Invalid request data" });
  }

  if (!secretKey) {
    console.error("Secret key is not defined in environment variables");
    return res.status(500).json({ message: "Server configuration error" });
  }

  try {
    // Decrypt the email using the provided IV and secret key
    const decryptedEmail = decrypt(encryptedEmail, secretKey, iv);
    console.log("Decrypted Email:", decryptedEmail);

    // Look for the user in the database by decrypted email
    const user = await User.findOne({ Email: decryptedEmail });
    if (user) {
      // Update user's info as requested
      const update = await User.updateOne(
        { Email: decryptedEmail },
        {
          $set: {
            Verification: true,
            Name: req.body.name,
            Password: req.body.password,
            MobileNo: "+91 8849439366",
          },
        }
      );
      console.log("Update Result:", update);
      return res.json({ message: "Password is set and verification complete" });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Decryption or database error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = verifyUser;
