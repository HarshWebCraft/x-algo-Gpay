const User = require("../models/users");
const crypto = require("crypto");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const secretKey = crypto
  .createHash("sha256")
  .update(process.env.SECRET_KEY)
  .digest("base64")
  .substr(0, 32);
const encryptMethod = "AES-256-CBC";

function decrypt(encryptedData, secret, iv) {
  const decipher = crypto.createDecipheriv(
    encryptMethod,
    Buffer.from(secret, "utf-8"),
    Buffer.from(iv, "base64")
  );

  let decrypted = decipher.update(encryptedData, "base64", "utf-8");
  decrypted += decipher.final("utf-8");

  return decrypted;
}

const verifyUser = async (req, res) => {
  const encryptedEmail = req.body.urlEmail;
  const iv = req.body.iv;

  console.log("Encrypted Email:", encryptedEmail);
  console.log("IV:", iv);

  if (!encryptedEmail || !iv) {
    console.error("urlEmail or iv is missing in the request");
    return res.status(400).json({ message: "Invalid request data" });
  }

  try {
    const decryptedEmail = decrypt(encryptedEmail, secretKey, iv);
    console.log("Decrypted Email:", decryptedEmail);

    const user = await User.findOne({ Email: decryptedEmail });
    if (user) {
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
