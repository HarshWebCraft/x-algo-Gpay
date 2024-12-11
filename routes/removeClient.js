const User = require("../models/users");

const removeClient = async (req, res) => {
  try {
    const clientId = req.body.clientId;
    const email = req.body.Email;
    console.log("clinet id is", clientId);
    // Find the user by email
    const user = await User.findOne({ Email: email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.DeltaBrokerSchema = user.DeltaBrokerSchema.filter(
      (broker) => broker.deltaBrokerId !== clientId
    );

    user.AngelBrokerData = user.AngelBrokerData.filter(
      (broker) => broker.AngelId !== clientId
    );

    user.BrokerIds = user.BrokerIds.filter((id) => id !== clientId);
    user.BrokerCount = Math.max(0, user.BrokerCount - 1);
    await user.save();

    res.json({
      success: true,
      message: "Client removed successfully",
      updatedUser: user,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while removing the client" });
  }
};

module.exports = removeClient;

//   console.log(req.body.index);
//   if (req.body.index !== -1) {
//     checking.AngelBrokerData.splice(req.body.index, 1);
//     await checking.save();
//   }
//   await User.findOneAndUpdate(
//     { Email: req.body.Email },
//     { $inc: { BrokerCount: -1 } }
//   );
