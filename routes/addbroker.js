var axios = require('axios');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
const speakeasy = require('speakeasy');
// const secretKey = 'UUGDXH753M4H5FS5HJVIGBSSSU';
// const secretKey = 'V4LKTGHGDDI75CKQXIBFO2HWJI';
// EOD4KRBA7FV3KOBYPTIVFEJI3Q  J52233047
// V4LKTGHGDDI75CKQXIBFO2HWJI H54303926
// const secretKey = speakeasy.generateSecret({ length: 20 }).base32;
// const speakeasy = require('speakeasy');
// I6DWYH727T55JZEQVBJ3MRXC6E A1501341 2308


const User = require('../models/users')



// R51644670
const addbroker = async (req, res) => {
    try {
        console.log("Fisrt value from frontend " + req.body.First)

        if (req.body.First) {

            const email = req.body.email;
            const angelId = req.body.id;
            const angelpass = req.body.pass;
            const secretKey = req.body.secretKey;
            const ApiKey = req.body.ApiKey;
            // const brokerCount = req.body.userSchema.BrokerCount;
            console.log('addbroker ma email , id , password and secretkey' + email + angelId + angelpass + secretKey)
            const totpCode = speakeasy.totp({
                secret: secretKey,
                encoding: 'base32',
            });



            var data = JSON.stringify({

                "clientcode": `${angelId}`,
                "password": `${angelpass}`,
                "totp": `${totpCode}`
            });

            var config = {
                method: 'post',
                url: 'https://apiconnect.angelbroking.com//rest/auth/angelbroking/user/v1/loginByPassword',

                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-UserType': 'USER',
                    'X-SourceID': 'WEB',
                    'X-ClientLocalIP': '192.168.157.1',
                    'X-ClientPublicIP': '106.193.147.98',
                    'X-MACAddress': 'fe80::87f:98ff:fe5a:f5cb',
                    'X-PrivateKey': 'xL9TyAO8'
                },
                data: data
            };

            const response = await axios(config);

            const jsonObject = JSON.parse(JSON.stringify(response.data));
            console.log(response.data.message)
            console.log(response.data)

            if (response.data.status) {


                


                jwtToken = jsonObject.data.jwtToken;

                try {
                    const updatedUser = await User.findOneAndUpdate({ Email: email }, { $inc: { BrokerCount: 1 }, Broker: true, $push: { BrokerData: { AngelId: angelId, AngelPass: angelpass, SecretKey: secretKey ,ApiKey:ApiKey} } });
                    console.log('User updated with AngelOne credentials:', updatedUser);

                    // Move the second try block inside the first one
                    const newUser = new User({

                        Userdata: [{
                            AngleID1: 'Broker123',
                            Capital2: '10000'
                        }]
                    });

                    try {
                        const savedUser = await newUser.save();
                        console.log('User saved successfully:', savedUser);
                    } catch (err) {
                        console.error('Error saving new user:', err);
                    }
                } catch (error) {
                    console.error('Error updating user with AngelOne credentials:', error);
                }


                var rmsconfig = {
                    method: 'get',
                    url: 'https://apiconnect.angelbroking.com/rest/secure/angelbroking/user/v1/getRMS',

                    headers: {
                        'Authorization': 'Bearer ' + jwtToken + '',
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-UserType': 'USER',
                        'X-SourceID': 'WEB',
                        'X-ClientLocalIP': '192.168.187.1',
                        'X-ClientPublicIP': '106.193.147.98',
                        'X-MACAddress': 'fe80::87f:98ff:fe5a:f5cb',
                        'X-PrivateKey': 'xL9TyAO8'
                    }
                };



                const rmsresponce = await axios(rmsconfig)
                const a = rmsresponce.data
                console.log(a)
                res.json(a);

            }
            else {
                res.json(false)
            }
        }
        else {

            const checking = await User.findOne({ Email: req.body.Email });

            const Email = req.body.Email
            console.log(checking)
            const responseData = [];

            for (const schema of checking.BrokerData) {

               

                console.log('first loop')
                const angelId = checking.UserData2
                const angelpass = checking.Angelpass
                const secretKey = checking.SecretKey

                const brokerCount = req.body.userSchema.BrokerCount
                console.log('addbroker ma email , id , password and secretkey' + Email + schema.AngelId + schema.AngelPass)

                console.log('after if and else')
                const totpCode = speakeasy.totp({
                    secret: `${schema.SecretKey}`,
                    encoding: 'base32',

                });

                

                var data = JSON.stringify({

                    "clientcode": `${schema.AngelId}`,
                    "password": `${schema.AngelPass}`,
                    "totp": `${totpCode}`
                });

                var config = {
                    method: 'post',
                    url: 'https://apiconnect.angelbroking.com//rest/auth/angelbroking/user/v1/loginByPassword',

                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-UserType': 'USER',
                        'X-SourceID': 'WEB',
                        'X-ClientLocalIP': '192.168.157.1',
                        'X-ClientPublicIP': '106.193.147.98',
                        'X-MACAddress': 'fe80::87f:98ff:fe5a:f5cb',
                        'X-PrivateKey': 'xL9TyAO8'
                    },
                    data: data
                };

                const response = await axios(config);

                const jsonObject = JSON.parse(JSON.stringify(response.data));
                console.log(response.data.message)
                console.log(response.data)
                setTimeout(function() {
                    console.log("Pause for 1 or 2 seconds");
                }, 1000);

                if (response.data.status) {




                    

                    
                   
                    console.log(response.data.data.jwtToken)
                    jwtToken=response.data.data.jwtToken
                    var rmsconfig = {
                        method: 'get',
                        url: 'https://apiconnect.angelbroking.com/rest/secure/angelbroking/user/v1/getRMS',

                        headers: {
                            'Authorization': 'Bearer '+jwtToken,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-UserType': 'USER',
                            'X-SourceID': 'WEB',
                            'X-ClientLocalIP': '192.168.187.1',
                            'X-ClientPublicIP': '106.193.147.98',
                            'X-MACAddress': 'fe80::87f:98ff:fe5a:f5cb',
                            'X-PrivateKey': 'xL9TyAO8'
                        }
                    };



                    const rmsresponce = await axios(rmsconfig)
                    
                    const userData = rmsresponce.data
                    console.log(userData)
                    responseData.push({
                        userData: userData,
                    });

                    console.log("a",responseData[0].userData.data.net)


                }
                else {
                    // res.json(false)
                }
            }
            
            console.log('line 240 hello')
            
            res.json(responseData);
        }

    } catch (e) {
        // console.log(e);
    }

};

module.exports = addbroker