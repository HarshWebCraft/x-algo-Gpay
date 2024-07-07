const user = require('../models/users')

const newamount = async(req,res) =>{
    const data = await user.findOne({Email:req.body.Email})
    if(data){
        const balance = data.Balance
        return res.json({balance:balance})
    }
    else{
        return res.json({balance:0})
    }
}

module.exports=newamount