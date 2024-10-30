const speakeasy = require("speakeasy");
const axios = require("axios");
const WebSocket = require("ws");
const http = require("http");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
let web_socket; // Declare the WebSocket instance globally
let wss; // Declare the WebSocket server instance globally

const secretKey = "UUGDXH753M4H5FS5HJVIGBSSSU";
const clientcode = "R51644670";
const password = "3250";
const apiKey = "xL9TyAO8";
const privateKey = "xL9TyAO8";
const server = http.createServer(app);

const getPreviousData = async () => {
  const totpCode = speakeasy.totp({
    secret: secretKey,
    encoding: "base32",
  });

  const data = JSON.stringify({
    clientcode: clientcode,
    password: password,
    totp: `${totpCode}`,
  });

  const config = {
    method: "post",
    url: "https://apiconnect.angelbroking.com//rest/auth/angelbroking/user/v1/loginByPassword",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-UserType": "USER",
      "X-SourceID": "WEB",
      "X-ClientLocalIP": "192.168.43.238",
      "X-ClientPublicIP": "106.193.147.98",
      "X-MACAddress": "fe80::87f:98ff:fe5a:f5cb",
      "X-PrivateKey": privateKey,
    },
    data: data,
  };

  try {
    const response = await axios(config);
    const responseData = response.data;
    const jwtToken = responseData.data.jwtToken;
    const feedToken = responseData.data.feedToken;

    const fromDate = getPreviousDayFormattedDate();
    const toDate = fromDate;

    console.log("FromDate ", fromDate);
    console.log("ToDate ", toDate);

    const data2 = JSON.stringify({
      exchange: "NSE",
      symboltoken: "99926000",
      interval: "ONE_DAY",
      fromdate: fromDate,
      todate: toDate,
    });

    const config2 = {
      method: "post",
      url: "https://apiconnect.angelbroking.com/rest/secure/angelbroking/historical/v1/getCandleData",
      headers: {
        "X-PrivateKey": privateKey,
        Accept: "application/json",
        "X-SourceID": "WEB",
        "X-ClientLocalIP": "192.168.43.238",
        "X-ClientPublicIP": "106.193.147.98",
        "X-MACAddress": "fe80::87f:98ff:fe5a:f5cb",
        "X-UserType": "USER",
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
      data: data2,
    };

    const ceresponse = await axios(config2);
    const jsonData = ceresponse.data;
    console.log(jsonData);
    const formattedData = jsonData.data.map(
      ([timestamp, open, high, low, close, volume]) => ({
        timestamp,
        open,
        high,
        low,
        close,
        volume,
      })
    );

    const close = formattedData[0].close;
    const target = close * 1.01;
    const negativeTarget = close * 9.9;

    startWebSocket(close, target, jwtToken, feedToken, negativeTarget);
  } catch (error) {
    console.log("Error fetching data:", error);
  }
};

// Function to start WebSocket server and connect
const startWebSocket = (close, target, jwtToken, feedToken, negativeTarget) => {
  const { WebSocketV2 } = require("smartapi-javascript");

  const fetchDataAndConnectWebSocket = async () => {
    try {
      console.log("Previous day close", close);
      console.log("Target for positive ", target);
      console.log("Target for nagative ", negativeTarget);

      web_socket = new WebSocketV2({
        jwttoken: jwtToken,
        apikey: apiKey,
        clientcode: clientcode,
        feedtype: feedToken,
      });

      await web_socket.connect();
      const json_req = {
        correlationID: "abcde12345",
        action: 1,
        mode: 1,
        exchangeType: 1,
        tokens: [`26000`],
      };

      web_socket.fetchData(json_req);
      web_socket.on("tick", receiveTick);

      function receiveTick(data) {
        console.log(
          data.last_traded_price / 100,
          " Target ",
          target,
          " NegativeTarget ",
          negativeTarget / 10
        );

        if (
          data.last_traded_price / 100 > target ||
          data.last_traded_price / 100 < negativeTarget / 10
        ) {
          sendEmail();
          web_socket.close();
        }

        if (wss) {
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(data));
            }
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  wss = new WebSocket.Server({ server });

  wss.on("close", () => {
    console.log("WebSocket Server Closed");
  });

  fetchDataAndConnectWebSocket();
};

// Function to get the previous day's date formatted
const getPreviousDayFormattedDate = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  yesterday.setHours(15, 29, 0, 0);

  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, "0");
  const day = String(yesterday.getDate()).padStart(2, "0");
  const hours = String(yesterday.getHours()).padStart(2, "0");
  const minutes = String(yesterday.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// Function to send email alert
const sendEmail = () => {
  console.log(
    "Sending email to user: Market price exceeded +5% of previous day's close."
  );

  const nodemailer = require("nodemailer");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "harshdvadhavana26@gmail.com",
      pass: "cjlt acjg ymwe apzn",
    },
  });

  const mailOptions = {
    from: "harshdvadhavana26@gmail.com",
    to: "harshkumar.vadhavana120072@marwadiuniversity.ac.in",
    subject: "Market Price Alert",
    text: "Market price exceeded +5% of previous day's close.",
    html: "<b>Market price exceeded +5% of previous day's close.</b>",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log("Error while sending email: ", error);
    }
    console.log("Email sent: " + info.response);
  });
};

module.exports = getPreviousData;
