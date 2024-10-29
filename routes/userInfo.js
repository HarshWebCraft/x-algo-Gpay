const User = require("../models/users");
const axios = require("axios");
const speakeasy = require("speakeasy");

const userInfo = async (req, res) => {
  console.log("userinfo" + req.body.Email);

  const checking = await User.findOne({ Email: req.body.Email });
  console.log("userinfo route");
  console.log("userinfo" + checking);
  const responseData = [];
  for (const item of checking.BrokerData) {
    try {
      const angelId = item.AngelId;
      const angelpass = item.AngelPass;
      const secretKey = item.SecretKey;

      // console.log('addbroker ma email , id , password and secretkey' + Email + item.AngelId + item.AngelPass)

      console.log("after if and else");

      const totpCode = speakeasy.totp({
        secret: `${item.SecretKey}`,
        encoding: "base32",
      });

      console.log("check");

      var data = JSON.stringify({
        clientcode: `${item.AngelId}`,
        password: `${item.AngelPass}`,
        totp: `${totpCode}`,
      });

      var config = {
        method: "post",
        url: "https://apiconnect.angelbroking.com//rest/auth/angelbroking/user/v1/loginByPassword",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-UserType": "USER",
          "X-SourceID": "WEB",
          "X-ClientLocalIP": "192.168.157.1",
          "X-ClientPublicIP": "106.193.147.98",
          "X-MACAddress": "fe80::87f:98ff:fe5a:f5cb",
          "X-PrivateKey": "xL9TyAO8",
        },
        data: data,
      };

      const response = await axios(config);

      const jsonObject = JSON.parse(JSON.stringify(response.data));
      console.log(response.data.message);
      console.log(response.data);

      jwtToken = response.data.data.jwtToken;

      const profileConfig = {
        method: "get",
        url: "https://apiconnect.angelbroking.com/rest/secure/angelbroking/user/v1/getProfile",
        headers: {
          Authorization: "Bearer " + jwtToken,
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-UserType": "USER",
          "X-SourceID": "WEB",
          "X-ClientLocalIP": "192.168.157.1",
          "X-ClientPublicIP": "106.193.147.98",
          "X-MACAddress": "fe80::87f:98ff:fe5a:f5cb",
          "X-PrivateKey": "xL9TyAO8",
        },
      };

      const profileResponse = await axios(profileConfig);
      const profileData = profileResponse.data;
      console.log(profileData);
      responseData.push({
        userData: profileData,
      });
    } catch (error) {
      console.log(error);
    }
  }
  console.log(responseData);
  res.json(responseData);
};

module.exports = userInfo;
