const { set } = require('mongoose');
const User = require('../models/users')
const crypto = require("crypto")
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const verifypayment = async(req,res) =>{
    const Email = req.body.Email
    const Amount = req.body.amount
    const index = req.body.index

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    console.log(req.body)
    const hmac = crypto.createHmac('sha256', process.env.KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated_signature = hmac.digest('hex');
    console.log("verify the payment")
     if (generated_signature === razorpay_signature) {

        const user = await User.findOne({Email:Email})

        let NewBalance = parseFloat(user.Balance) + parseFloat(req.body.amount)
        const result = await User.findOneAndUpdate(
            { Email: Email },
            {
              $set: { Balance: NewBalance }, 
              $push: { Transaction: {payment_type:"Deposit", amount:req.body.amount, date: Date.now(),razorpay_payment_id:razorpay_payment_id,razorpay_order_id:razorpay_order_id } },
            },
            { new: true }
          );
        
        

        return res.json({message:"payment successfull",amount:user.amount})
    } else {
       return res.json({message:"payment failed",amount:user.amount})
    }

}
module.exports=verifypayment
                