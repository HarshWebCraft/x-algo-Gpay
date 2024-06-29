const User = require('../models/users')
const crypto = require("crypto")
require('dotenv').config()

const verifypayment = async(req,res) =>{
    const Email = req.body.Email
    const index = req.body.index

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const hmac = crypto.createHmac('sha256', process.env.KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated_signature = hmac.digest('hex');
    console.log("verify the payment")
     if (generated_signature === razorpay_signature) {

        const user = await User.findOne({Email:Email})
        user.MyStartegies.push(index);
        const updatedUser = await user.save();
        return res.json({message:"payment successfull"})
    } else {
       return res.json({message:"payment failed"})
    }

}
module.exports=verifypayment
                