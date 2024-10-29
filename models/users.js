<<<<<<< HEAD
const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const BrokerSchema = new Schema({
  AngelId: String,
  AngelPass: String,
  SecretKey: String,
  ApiKey: String,
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
  DeployedData: [DeployedSchema],
  SubscribedStrategies: [{ type: Types.ObjectId, ref: "MarketPlace" }],
});

const User = mongoose.model("UserData", userSchema);

module.exports = userSchema;
module.exports = BrokerSchema;
module.exports = transaction;
module.exports = User;
=======
const mongoose =require('mongoose');
const  { Schema } = mongoose;
const BrokerSchema=new Schema({
    AngelId:String,
    AngelPass:String,
    SecretKey:String,
    ApiKey:String
})
const DeployedSchema=new Schema({
    Strategy:Number,
    Index:String,
    Quantity:String,
    Account:String,
    AppliedDate:String
})
const transaction = new Schema({
        payment_type:{
            type:String,
            require:true
        },
        amount:{
            type:Number
        },
        date:{
            type:String,
            require:true
        },
        razorpay_payment_id:{
            type:String,
            require:true
        },
        razorpay_order_id:{
            type:String,
            require:true
        },
})

const userSchema= new Schema({
    Name:String,
    Email:String,
    Password:String,
    MobileNo:String,
    Balance : { type:Number,default:0},
    Transaction:[transaction],
    Profile_Img: String,
    Broker:Boolean,
    BrokerCount:Number,
    Verification:Boolean,
    Tour:Boolean,
    MyStartegies: [Number],
    BrokerData:[BrokerSchema],
    DeployedData:[DeployedSchema]
});

const User=new mongoose.model('AWT',userSchema);
module.exports=userSchema
module.exports=BrokerSchema
module.exports=transaction
module.exports=User;
>>>>>>> 526c9003fb88f2d329a5a856bf31b4867227a7d9
