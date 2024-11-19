const axios = require("axios");
const fs = require("fs");
const WebSocket = require("ws");
const { placeOrder } = require("../paper trade/placeOrder.js");

const quantity = 10;

const strategy_2 = () => {
  function toUnixTimestamp(dateStr, format = "%Y-%m-%d %H:%M:%S") {
    const date = new Date(dateStr);
    return Math.floor(date.getTime() / 1000);
  }

  // Function to convert Unix timestamp to normal date and time, adjusted for local time zone
  function fromUnixTimestamp(unixTimestamp, offsetHours = 0) {
    const utcDate = new Date(unixTimestamp * 1000);
    const localDate = new Date(
      utcDate.getTime() + offsetHours * 60 * 60 * 1000
    );
    return localDate.toISOString().replace("T", " ").slice(0, 19);
  }

  // Define start and end time (normal date format)
  const startTime = "2024-11-16 12:30:00";
  const endTime = "2024-11-16 20:30:00";

  // Convert normal date and time to Unix timestamp
  const startUnix = toUnixTimestamp(startTime);
  const endUnix = toUnixTimestamp(endTime);

  // Define the headers for the API request
  const headers = {
    Accept: "application/json",
  };

  // Send the GET request to the Delta Exchange API
  axios
    .get("https://api.india.delta.exchange/v2/history/candles", {
      params: {
        resolution: "5m", // 15-minute interval
        symbol: "BTCUSD",
        start: startUnix,
        end: endUnix,
      },
      headers: headers,
    })
    .then((response) => {
      const data = response.data;

      // Define the local time zone offset (e.g., UTC+5:30 for IST)
      const localTimeOffset = 5.5; // Example for IST

      // Create a list to store OHLC data
      const ohlcData = [];

      // Convert response timestamps to normal date and time, adjusting for local time zone
      if (data.result) {
        data.result.forEach((candle) => {
          const openPrice = parseFloat(candle.open);
          const highPrice = parseFloat(candle.high);
          const lowPrice = parseFloat(candle.low);
          const closePrice = parseFloat(candle.close);
          const time = fromUnixTimestamp(candle.time, localTimeOffset); // Adjust time to local time zone

          // Append OHLC data with timestamp to the list
          ohlcData.push({
            time: time,
            open: openPrice,
            high: highPrice,
            low: lowPrice,
            close: closePrice,
          });
        });
      }

      // Write the OHLC data to a JSON file
      fs.writeFileSync(
        "./Stra_2/ohlc_data.json",
        JSON.stringify(ohlcData, null, 4)
      );

      console.log("OHLC data has been saved to ohlc_data.json.");

      // Initialize variables for the highest high and lowest low
      let highestHigh = Number.MIN_VALUE;
      let lowestLow = Number.MAX_VALUE;

      // Iterate through the OHLC data to find the highest high and lowest low
      ohlcData.forEach((candle) => {
        if (candle.high > highestHigh) {
          highestHigh = candle.high;
        }
        if (candle.low < lowestLow) {
          lowestLow = candle.low;
        }
      });

      // Output the results
      console.log(`Highest High: ${highestHigh}`);
      console.log(`Lowest Low: ${lowestLow}`);

      EntryAlert("BTCUSD", highestHigh, lowestLow);
    })
    .catch((error) => {
      console.error("Error fetching data from API:", error.message);
    });
};

function EntryAlert(symbol, buyEntry, sellEntry) {
  const WS_URL = "wss://socket.india.delta.exchange";

  const subscribeMessage = JSON.stringify({
    type: "subscribe",
    payload: {
      channels: [{ name: "candlestick_1m", symbols: [symbol] }],
    },
  });

  const ws = new WebSocket(WS_URL);

  // Event listener: Triggered when the WebSocket connection is opened
  ws.on("open", () => {
    console.log("Connected to WebSocket.");
    // Send the subscription message after connection is established
    ws.send(subscribeMessage);
  });

  // Event listener: Triggered whenever a message is received from the WebSocket
  ws.on("message", (message) => {
    try {
      // Parse the incoming message as JSON
      const data = JSON.parse(message);
      // console.log(data);
      // Extract 'symbol' and 'spot_price' if available
      const symbol = data.symbol;
      const spotPrice = data.close;

      // Print 'symbol' and 'spot_price' if they exist
      if (symbol && spotPrice) {
        console.log(`${symbol} : ${spotPrice}`);

        if (buyEntry < spotPrice) {
          console.log("------ buy alert ------");
          placeOrder({
            symbol: symbol,
            size: quantity,
            side: "buy",
            order_type: "market_order",
            // "limit_price": "59000",
            take_profit_point: buyEntry * 0.01,
            stop_loss_point: buyEntry * 0.005,
          });
          ws.close();
        }
        if (sellEntry > spotPrice) {
          console.log("------ sell alert ------");
          ws.close();
          placeOrder({
            symbol: symbol,
            size: quantity,
            side: "sell",
            order_type: "market_order",
            // "limit_price": "59000",
            take_profit_point: sellEntry * 0.01,
            stop_loss_point: sellEntry * 0.005,
          });
        }
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });

  // Event listener: Handles WebSocket errors
  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  // Event listener: Triggered when the WebSocket connection is closed
  ws.on("close", () => {
    console.log("WebSocket connection closed.");
  });
}

module.exports = strategy_2;

// const ohlcData = JSON.parse(fs.readFileSync("ohlc_data.json", "utf8"));

// 1. 20:40 fetch london session OHLC and buy_entry = highestHigh sell_entry = lowestLow
// 2. 20:46 fetch OHLC of 20:30 - 20:44 15m candle
// 3. tp = 1% of high of 20:30 candle and sl = 0.5%
// 4. websocket to check entry
