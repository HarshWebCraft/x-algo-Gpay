const User = require("../models/users");

const updateUserTour = async (req, res) => {
  try {
    const userEmail = req.body.userEmail;
    const user = await User.findOne({ Email: userEmail });
    if (user.Tour) {
      await User.updateOne({ Email: userEmail }, { $set: { Tour: true } });
      res.json({ tour: true, message: "Tour updated successfully" });
    } else {
      res.json({ tour: false, message: "Tour alread y updated" });
    }
  } catch (error) {
    console.error("Error updating tour:", error);
    res.json({ error: "Internal Server Error" });
  }
};

module.exports = updateUserTour;
