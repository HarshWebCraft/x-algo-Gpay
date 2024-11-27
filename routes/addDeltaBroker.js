const dns = require("dns");
const SwaggerClient = require("swagger-client");
const R = require("ramda");
const crypto = require("crypto");
const url = require("url");
const { response } = require("express");

// Set DNS order for IPv4-first resolution
dns.setDefaultResultOrder("ipv4first");

const SWAGGER_URL = "https://docs.delta.exchange/api/swagger_v2.json";

class DeltaAPIKeyAuthorization {
  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  apply(obj) {
    const timestamp = Math.floor(new Date().getTime() / 1000);
    const parsedURL = url.parse(obj.url);
    const path = parsedURL.pathname + (parsedURL.search || "");
    const signature = this.sign(
      obj.method.toUpperCase(),
      path,
      timestamp,
      obj.body
    );
    obj.headers["api-key"] = this.apiKey;
    obj.headers["signature"] = signature;
    obj.headers["timestamp"] = timestamp;
    return true;
  }

  sign(verb, url, timestamp, data) {
    if (!data || R.isEmpty(data)) data = "";
    else if (R.is(Object, data)) data = JSON.stringify(data);

    const message = verb + timestamp + url + data;
    return crypto
      .createHmac("sha256", this.apiSecret)
      .update(message)
      .digest("hex");
  }
}

const DeltaRestClient = function (apiKey, apiSecret) {
  const authorization = new DeltaAPIKeyAuthorization(apiKey, apiSecret);

  return new SwaggerClient({
    url: SWAGGER_URL,
    requestInterceptor(req) {
      if (!req.method) {
        req.method = "GET";
      }

      req.url = req.url.replace(
        "https://api.delta.exchange",
        "https://api.india.delta.exchange"
      );

      if (typeof authorization !== "undefined") {
        authorization.apply(req);
      }
    },
  })
    .then((client) => {
      return Promise.resolve(client);
    })
    .catch(function (e) {
      console.error("Unable to connect: ", e);
      return Promise.reject(e);
    });
};

// Exporting a function that processes API key and secret
const getUserBalance = async (req, res) => {
  try {
    const client = await DeltaRestClient(req.body.apiKey, req.body.apiSecret);
    const response = await client.apis.Wallet.getBalances();
    res.JSON(response);
  } catch (error) {
    res.JSON(response);
    // throw new Error("Error fetching balance: " + error.message);
  }
};

module.exports = getUserBalance;
