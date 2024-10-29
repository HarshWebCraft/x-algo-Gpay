const MarketPlace = require("../models/marketPlace");
const User = require("../models/users");

const getMarketPlace = async (req, res) => {
  try {
    const allData = await MarketPlace.find({});
    console.log(allData);

    const checking = await User.findOne({ Email: req.body.email });
    const SubscribedStrategies = checking.SubscribedStrategies;
    res.json({ allData, SubscribedStrategies });
  } catch (e) {
    console.log(e);
  }
};

module.exports = getMarketPlace;
