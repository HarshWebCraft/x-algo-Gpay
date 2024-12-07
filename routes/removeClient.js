const User = require("../models/users");

const removeClient = async (req, res) => {
  const checking = await User.findOne({ Email: req.body.Email });
  console.log(req.body.index);
  if (req.body.index !== -1) {
    checking.AngelBrokerData.splice(req.body.index, 1);
    await checking.save();
  }
  await User.findOneAndUpdate(
    { Email: req.body.Email },
    { $inc: { BrokerCount: -1 } }
  );

  res.json(true);
};

module.exports = removeClient;
