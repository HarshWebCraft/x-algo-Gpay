const User = require("../models/users");
const axios = require("axios");
const speakeasy = require("speakeasy");
const createDeltaClient = require("./DeltaClient");

const userInfo = async (req, res) => {
  const responseData = []; // Initialize response data array

  try {
    console.log("userinfo" + req.body.Email);

    // Fetch user data
    const checking = await User.findOne({ Email: req.body.Email });
    console.log("userinfo route");
    console.log("userinfo" + checking);

    // Iterate over AngelBrokerData
    for (const item of checking.AngelBrokerData) {
      try {
        const totpCode = speakeasy.totp({
          secret: `${item.SecretKey}`,
          encoding: "base32",
        });

        const data = JSON.stringify({
          clientcode: `${item.AngelId}`,
          password: `${item.AngelPass}`,
          totp: `${totpCode}`,
        });

        const config = {
          method: "post",
          url: "https://apiconnect.angelbroking.com//rest/auth/angelbroking/user/v1/loginByPassword",
          headers: {
            /* Headers omitted for brevity */
          },
          data: data,
        };

        const response = await axios(config);
        const jwtToken = response.data.data.jwtToken;

        const profileConfig = {
          method: "get",
          url: "https://apiconnect.angelbroking.com/rest/secure/angelbroking/user/v1/getProfile",
          headers: { Authorization: "Bearer " + jwtToken },
        };

        const profileResponse = await axios(profileConfig);
        responseData.push({ userData: profileResponse.data });
      } catch (error) {
        console.error(
          `Error processing AngelBrokerData for ID: ${item.AngelId}`,
          error.message
        );
        responseData.push({
          AngelId: item.AngelId,
          error: error.message, // Include error in the response data
        });
      }
    }

    // Iterate over DeltaBrokerSchema
    for (const schema of checking.DeltaBrokerSchema) {
      try {
        const { deltaApiKey, deltaSecretKey } = schema;

        const client = await createDeltaClient(deltaApiKey, deltaSecretKey);
        const userDetails = await client.apis.Account.getUser();
        const response = await client.apis.Wallet.getBalances();

        responseData.push({
          deltaApiKey,
          deltaSecretKey,
          userDetails: userDetails.body, // Adjust based on the actual API response structure
          balances: response.body,
        });
      } catch (error) {
        console.error(
          `Error fetching details for Delta account ${schema.deltaApiKey}:`,
          error.message
        );
        responseData.push({
          deltaApiKey: schema.deltaApiKey,
          deltaSecretKey: schema.deltaSecretKey,
          error: error.message, // Include error in the response data
        });
      }
    }
  } catch (error) {
    console.error("Unexpected error in userInfo function:", error.message);
    responseData.push({
      error: "An unexpected error occurred during user processing.",
      details: error.message,
    });
  } finally {
    // Ensure the response is always sent
    console.log(responseData);
    res.json(responseData);
  }
};

module.exports = userInfo;
