const User = require('../models/users');

const crypto = require('crypto');
require('dotenv').config(); // Load environment variables from .env file

const secretKey = process.env.SECRET_KEY;
const encryptMethod = 'AES-256-CBC';

function decrypt(encryptedData, secret, iv) {
  const decipher = crypto.createDecipheriv(encryptMethod, secret, Buffer.from(iv, 'base64'));

  let decrypted = decipher.update(encryptedData, 'base64', 'utf-8');
  decrypted += decipher.final('utf-8');

  return decrypted;
}



const verifyUser = async (req, res) => {
    const decryptedData = decrypt(req.body.urlEmail, secretKey, req.body.iv);
    console.log('Decrypted:', decryptedData);
    console.log(req.body.urlEmail) 
    
    const user = await User.findOne( {Email:decryptedData} )
    // console.log(user) 
    if (user) {
        const update = await User.updateOne({ Email: decryptedData }, { $set: { Verification: true ,Name: req.body.name ,Password: req.body.password , MobileNo:req.body.mobileNumber }});
        console.log(update);
        return res.json({message:"password is set"})
    } else {
        return res.json({message:"password is not set"})
    }
};

module.exports = verifyUser;