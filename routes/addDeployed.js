<<<<<<< HEAD
const User = require("../models/users");

const addDeployed = async (req, res) => {
  const id = req.body.id;
  const index = req.body.Index;
  const quantity = req.body.Quaninty;
  const email = req.body.Email;
  const account = req.body.Account;
  const date = new Date();
  const applyDate =
    date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear();
  // const checking = await User.findOne({ Email: email});
  const updatedUser = await User.findOneAndUpdate(
    { Email: email },
    {
      $push: {
        DeployedData: {
          Strategy: id,
          Index: index,
          Quantity: quantity,
          Account: account,
          AppliedDate: applyDate,
        },
      },
    },
    { new: true }
  );
  console.log(updatedUser);
  res.json(updatedUser);
};

module.exports = addDeployed;
=======
const User = require('../models/users')

const addDeployed= async(req,res)=>{


    const id=req.body.id;
    const index=req.body.Index;
    const quantity=req.body.Quaninty;
    const email=req.body.Email;
    const account=req.body.Account;
    const date=new Date();
    const applyDate=date.getDate()+"-"+date.getMonth()+"-"+date.getFullYear();
    // const checking = await User.findOne({ Email: email});
    const updatedUser = await User.findOneAndUpdate({ Email: email }, { $push: { DeployedData: { Strategy: id, Index: index, Quantity: quantity ,Account:account,AppliedDate:applyDate} } },{ new: true });
    console.log(updatedUser)
    res.json(updatedUser)
}


module.exports=addDeployed
>>>>>>> 526c9003fb88f2d329a5a856bf31b4867227a7d9
