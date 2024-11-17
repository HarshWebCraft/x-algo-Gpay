// index.js

const PaperTrade = require("./PaperTrade");
const setupWebSocket = require("./websocket");

let openTrades = [];

// Function to open a new trade using the order object
const placeOrder = (order) => {
  // Accept `order` as a parameter
  const trade = new PaperTrade(order);
  openTrades.push(trade);
  console.log(
    `Open order created for ${order.side} ${order.symbol} with entry price ${
      order.limit_price || "market price"
    }`
  );

  // Start WebSocket for the specific symbol of the trade
  setupWebSocket(order.symbol, handlePriceUpdate);

  return trade;
};

// Function to handle price updates and update all trades
function handlePriceUpdate(symbol, spotPrice, closeWebsocket) {
  console.log(`Latest Spot Price for ${symbol}: ${spotPrice} $`);

  openTrades.forEach((trade) => {
    if (trade.symbol === symbol && trade.isOpen) {
      // Check if the trade's entry condition is met
      trade.checkEntryCondition(spotPrice);

      // If the order is placed, calculate P&L and check for exit conditions
      if (trade.isPlaced) {
        trade.calculatePnL(spotPrice);
        console.log(
          `Running P&L for ${trade.side} trade: ${trade.runningPnL} $`
        );
        trade.checkExitConditions(spotPrice, closeWebsocket);

        // Remove closed trades from openTrades

        openTrades = openTrades.filter((t) => t.isOpen);
      }
    }
  });
}

// Export the placeOrder function so it can be used in other files
module.exports = { placeOrder };
