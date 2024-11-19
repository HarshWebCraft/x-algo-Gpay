// websocket.js

const WebSocket = require("ws");

// WebSocket setup function
function setupWebSocket(symbol, handlePriceUpdate) {
  const WS_URL = "wss://socket.india.delta.exchange";
  const ws = new WebSocket(WS_URL);

  ws.on("open", () => {
    console.log(`Connected to WebSocket for symbol: ${symbol}`);
    // Send a subscription message for the specific symbol
    const subscribeMessage = JSON.stringify({
      type: "subscribe",
      payload: {
        channels: [{ name: "candlestick_1m", symbols: [symbol] }],
      },
    });
    ws.send(subscribeMessage);
  });

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      if (data.symbol === symbol && data.close) {
        const spotPrice = parseFloat(data.close);
        handlePriceUpdate(symbol, spotPrice, () => ws.close());
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

module.exports = setupWebSocket;
