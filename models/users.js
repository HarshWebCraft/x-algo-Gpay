const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const BrokerSchema = new Schema({
  AngelId: String,
  AngelPass: String,
  SecretKey: String,
  ApiKey: String,
});

const deltaBrokerSchema = new Schema({
  deltaSecretKey: String,
  deltaApiKey: String,
});

const DeployedSchema = new Schema({
  Strategy: Number,
  Index: String,
  Quantity: String,
  Account: String,
  AppliedDate: String,
});

const transaction = new Schema({
  payment_type: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
  },
  date: {
    type: String,
    required: true,
  },
  razorpay_payment_id: {
    type: String,
    required: true,
  },
  razorpay_order_id: {
    type: String,
    required: true,
  },
});

const userSchema = new Schema({
  Name: String,
  Email: String,
  Password: String,
  MobileNo: String,
  Balance: { type: Number, default: 0 },
  Transaction: [transaction],
  Profile_Img: String,
  Broker: Boolean,
  BrokerCount: Number,
  Verification: Boolean,
  Tour: Boolean,
  MyStartegies: [Number],
  BrokerData: [BrokerSchema],
  DeltaBrokerSchema: [deltaBrokerSchema],
  DeployedData: [DeployedSchema],
  SubscribedStrategies: [{ type: Types.ObjectId, ref: "MarketPlace" }],
});

const User = mongoose.model("UserData", userSchema);

module.exports = userSchema;
module.exports = BrokerSchema;
module.exports = deltaBrokerSchema;
module.exports = transaction;

module.exports = User;
