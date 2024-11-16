const User = require("../models/users");

const addDeployed = async (req, res) => {
  const id = req.body.strategyId;
  const index = req.body.Index;
  const quantity = req.body.Quaninty;
  const email = req.body.Email;
  const account = req.body.Account;
  const date = new Date();
  console.log(email);
  const applyDate =
    date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear();

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
    { new: true, upsert: false }
  );
  console.log("thsi is updated" + updatedUser);
  res.json(updatedUser);
};

module.exports = addDeployed;
