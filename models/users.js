const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const angelBrokerSchema = new Schema({
  AngelId: String,
  AngelPass: String,
  SecretKey: String,
  ApiKey: String,
});

const deltaBrokerSchema = new Schema({
  deltaBrokerId: String,
  deltaSecretKey: String,
  deltaApiKey: String,
});

const DeployedSchema = new Schema({
  Strategy: { type: Types.ObjectId },
  StrategyName: String,
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

const SpreadsheetSchema = new Schema({
  strategyId: { type: Types.ObjectId, ref: "MarketPlace", required: true },
  spreadsheetId: { type: String, required: true }, // Google Spreadsheet ID
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
  ActiveStrategys: Number,
  BrokerIds: [String],
  AngelBrokerData: [angelBrokerSchema],
  DeltaBrokerSchema: [deltaBrokerSchema],
  DeployedStrategiesBrokerIds: [String],
  DeployedData: [DeployedSchema],
  SubscribedStrategies: [{ type: Types.ObjectId, ref: "MarketPlace" }],
  DeployedStrategies: [{ type: Types.ObjectId, ref: "MarketPlace" }],
  Spreadsheets: [SpreadsheetSchema],
});

const User = mongoose.model("UserData", userSchema);

module.exports = userSchema;
module.exports = angelBrokerSchema;
module.exports = deltaBrokerSchema;
module.exports = transaction;

module.exports = User;
