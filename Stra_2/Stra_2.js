const axios = require("axios");
const fs = require("fs");
const WebSocket = require("ws");
const schedule = require("node-schedule"); // Scheduler library
const { placeOrder } = require("../paper trade/placeOrder");

const quantity = 10;

const strategy_2 = () => {
  function toUnixTimestamp(dateStr, format = "%Y-%m-%d %H:%M:%S") {
    const date = new Date(dateStr);
    return Math.floor(date.getTime() / 1000);
  }

  function fromUnixTimestamp(unixTimestamp, offsetHours = 0) {
    const utcDate = new Date(unixTimestamp * 1000);
    const localDate = new Date(
      utcDate.getTime() + offsetHours * 60 * 60 * 1000
    );
    return localDate.toISOString().replace("T", " ").slice(0, 19);
  }

  // Define start and end time dynamically for each execution
  const now = new Date();
  const startTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")} 12:30:00`;
  const endTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")} 20:30:00`;
  console.log(startTime);
  console.log(endTime);

  const startUnix = toUnixTimestamp(startTime);
  const endUnix = toUnixTimestamp(endTime);

  const headers = {
    Accept: "application/json",
  };

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
      const localTimeOffset = 5.5; // Example for IST
      const ohlcData = [];

      if (data.result) {
        data.result.forEach((candle) => {
          const openPrice = parseFloat(candle.open);
          const highPrice = parseFloat(candle.high);
          const lowPrice = parseFloat(candle.low);
          const closePrice = parseFloat(candle.close);
          const time = fromUnixTimestamp(candle.time, localTimeOffset);

          ohlcData.push({
            time: time,
            open: openPrice,
            high: highPrice,
            low: lowPrice,
            close: closePrice,
          });
        });
      }

      fs.writeFileSync("./ohlc_data.json", JSON.stringify(ohlcData, null, 4));

      console.log("OHLC data has been saved to ohlc_data.json.");

      let highestHigh = Number.MIN_VALUE;
      let lowestLow = Number.MAX_VALUE;

      ohlcData.forEach((candle) => {
        if (candle.high > highestHigh) {
          highestHigh = candle.high;
          console.log(highestHigh);
        }
        if (candle.low < lowestLow) {
          lowestLow = candle.low;
        }
      });

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
  let lastCandleStartTime = null;

  const subscribeMessage = JSON.stringify({
    type: "subscribe",
    payload: {
      channels: [{ name: "candlestick_15m", symbols: [symbol] }],
    },
  });

  const ws = new WebSocket(WS_URL);

  ws.on("open", () => {
    console.log("Connected to WebSocket.");
    ws.send(subscribeMessage);
  });

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      const symbol = data.symbol;
      const spotPrice = data.close;

      if (symbol && spotPrice) {
        if (data.candle_start_time !== lastCandleStartTime) {
          lastCandleStartTime = data.candle_start_time;
          console.log(
            `Candle Start Time: ${data.candle_start_time} | Close: ${data.close}  Buy Entry: ${buyEntry} Sell Entry: ${sellEntry}`
          );

          if (data.close > buyEntry) {
            console.log("------ buy alert ------");
            placeOrder({
              symbol: symbol,
              size: quantity,
              side: "buy",
              order_type: "market_order",
              take_profit_point: buyEntry * 0.01,
              stop_loss_point: buyEntry * 0.005,
            });
            ws.close();
          }
          if (data.close < sellEntry) {
            console.log("------ sell alert ------");
            ws.close();
            placeOrder({
              symbol: symbol,
              size: quantity,
              side: "sell",
              order_type: "market_order",
              take_profit_point: sellEntry * 0.01,
              stop_loss_point: sellEntry * 0.005,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed.");
  });
}

schedule.scheduleJob("42 07 * * *", () => {
  console.log("Running strategy at 20:45 PM.");
  strategy_2();
});

module.exports = strategy_2;
