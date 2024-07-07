const config = require('./configs/keys');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const BrokerSchema = require('./models/users')
const signup = require('./routes/signup');
const signin = require('./routes/signin');
const addbroker = require('./routes/addbroker')
const checkBroker = require('./routes/checkBroker')
const deleteBroker = require('./routes/deleteBroker');
const userInfo = require('./routes/userInfo');
const dbschema = require('./routes/dbschema');
const removeClient = require('./routes/removeClient');
const verifyemail = require('./routes/verifyemail')
const wbSocket = require('./websocket/wbLiveData');
const getSymbole = require('./websocket/getSymbol');
const saveUserData=require('./saveUserData')
const axios=require('axios');
const { WebSocket } = require('ws');
const strategy_1 = require('./routes/strategy_1');
const addExcelData = require('./createExcel/createExcel');
const resetPassword = require('./routes/resetPassword')
const forgetPassword = require('./routes/forgetPassword')
const tour = require('./routes/tour');
const addMyStra = require('./routes/addMyStra');
const removeMyStra = require('./routes/removeMyStra');
const addDeployed = require('./routes/addDeployed');
const removeDeployed = require('./routes/removeDeployed');
const checkLink = require('./routes/checkLink');
const mobileno = require('./routes/mobileno')
const profile = require('./routes/profile')
const updateprofile = require('./routes/updateprofile')
const navbar = require('./routes/navbar') 
const mystartegies = require("./routes/mystartegies")
const verifypayment = require('./routes/verifypayment')


require('./models/users');
app.use(cors());
app.get('/server/test', (req, res) => {
    res.json('hello world 2 '+Date.now());
  });
app.use(bodyParser.json());

mongoose.connect(`${config.MongoUrl}`)
    .then(() => {

        console.log('Mongoose Connected');
    })
    .catch((e) => {
        console.log('Error is ' + e)
    });



const port = process.env.port || 5000;


app.post('/signup', signup);
app.post('/signin', signin);
app.post('/addbroker', addbroker);
app.post('/checkBroker', checkBroker);
app.post('/deleteBroker', deleteBroker)
app.post('/userinfo', userInfo)
app.post('/dbschema', dbschema)
app.post('/removeClient', removeClient)
app.post('/verify-email', verifyemail)
app.post('/wbSocket', wbSocket)
app.post('/getSymbol', getSymbole)
app.post('/verifyemail', verifyemail)
app.post('/add-excel-data', addExcelData)
app.post('/resetPassword', resetPassword)
app.post('/forgetPassword', forgetPassword)
app.post('/tour', tour)
app.post('/addmystra', addMyStra)
app.post('/removeMyStra', removeMyStra)
app.post('/addDeployed', addDeployed)
app.post('/removeDeployed', removeDeployed)
app.post('/checkLink', checkLink)
app.post('/mobileno', mobileno)
app.post('/profile',profile)
app.post('/updateprofile',updateprofile)
app.post('/navbar',navbar)
app.post('/mystartegies',mystartegies)
app.post('/verify-payment',verifypayment)
app.post('/start',async()=>{
    const a=await saveUserData()
    const response2 = await axios.post('http://localhost:5000/getSymbol');

    console.log(response2.data)
    const ceToken=response2.data.ceToken
    const peToken=response2.data.peToken
    const ceHigh=response2.data.cehigh
    const peHigh=response2.data.pehigh
    strategy_1({ceToken,peToken,ceHigh,peHigh})
})

app.listen(port, () => {
    console.log('http://localhost:5000');
})



const now = new Date();
const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()+5); // 09:59:59
console.log(targetTime)
let timeUntilTarget = targetTime - now;

if (timeUntilTarget < 0) {
    targetTime.setDate(targetTime.getDate() + 1);
    timeUntilTarget = targetTime - now;
}



// const timerId = setTimeout(async () => {

//     // const a=await saveUserData()
//     const response2 = await axios.post('http://localhost:5000/getSymbol');

//     console.log(response2.data)
//     const ceToken=response2.data.ceToken
//     const peToken=response2.data.peToken
//     const ceHigh=response2.data.cehigh
//     const peHigh=response2.data.pehigh
//     strategy_1({ceToken,peToken,ceHigh,peHigh})
    
// }, timeUntilTarget);