const { google } = require("googleapis");
const fs = require("fs");
const User = require("../models/users");

class PaperTrade {
  constructor(order) {
    this.symbol = order.symbol;
    this.size = order.size; // Number of contracts
    this.quantity = order.size || 0; // Quantity for the trade
    this.side = order.side; // 'buy' or 'sell'
    this.orderType = order.order_type; // 'limit_order' or 'market_order'
    this.entryPrice =
      this.orderType === "market_order" ? null : parseFloat(order.limit_price); // Set later if market order
    this.takeProfitPoint = order.take_profit_point;
    this.stopLossPoint = order.stop_loss_point;
    this.entryBuffer = order.entry_buffer || 0; // Buffer range for limit orders
    this.isPlaced = false; // Status of order placement
    this.isOpen = true; // Status of the trade (open/closed)
    this.runningPnL = 0; // Real-time profit and loss
    this.exitPrice = null; // Price at which the trade is exited
    this.tradeNumber = 1; // Increment this for each trade
    this.entryTime = null; // Timestamp for entry
    this.exitTime = null; // Timestamp for exit
    this.strategy = order.strategy;
  }

  getISTTime() {
    const date = new Date();
    const offset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
    const istDate = new Date(date.getTime() + offset);
    return istDate.toISOString().slice(0, 19).replace("T", " "); // Format as 'YYYY-MM-DD HH:MM:SS'
  }

  checkEntryCondition(currentPrice) {
    if (this.orderType === "market_order" && !this.isPlaced) {
      this.entryPrice = currentPrice;
      this.entryTime = this.getISTTime();
      this.setExitConditions();
      this.isPlaced = true;
      console.log(
        `Market order placed for ${this.side} at entry price: ${this.entryPrice}`
      );
    } else if (this.orderType === "limit_order" && !this.isPlaced) {
      if (
        this.side === "buy" &&
        currentPrice >= this.entryPrice - this.entryBuffer &&
        currentPrice <= this.entryPrice
      ) {
        this.isPlaced = true;
        this.entryTime = this.getISTTime();
        this.setExitConditions();
        console.log(
          `Buy limit order placed at entry price: ${this.entryPrice} within buffer of ${this.entryBuffer}`
        );
      } else if (
        this.side === "sell" &&
        currentPrice <= this.entryPrice + this.entryBuffer &&
        currentPrice >= this.entryPrice
      ) {
        this.isPlaced = true;
        this.entryTime = this.getISTTime();
        this.setExitConditions();
        console.log(
          `Sell limit order placed at entry price: ${this.entryPrice} within buffer of ${this.entryBuffer}`
        );
      }
    }
  }

  setExitConditions() {
    if (this.side === "buy") {
      this.takeProfit =
        parseFloat(this.entryPrice) + parseFloat(this.takeProfitPoint);
      this.stopLoss =
        parseFloat(this.entryPrice) - parseFloat(this.stopLossPoint);
    } else {
      this.takeProfit =
        parseFloat(this.entryPrice) - parseFloat(this.takeProfitPoint);
      this.stopLoss =
        parseFloat(this.entryPrice) + parseFloat(this.stopLossPoint);
    }
  }

  calculatePnL(currentPrice) {
    if (this.isPlaced) {
      const priceDifference =
        this.side === "buy"
          ? currentPrice - this.entryPrice
          : this.entryPrice - currentPrice;
      const btcEquivalent = this.size / 1000;
      this.runningPnL = priceDifference * btcEquivalent;
    }
  }

  checkExitConditions(currentPrice, closeWebsocket) {
    if (this.isPlaced) {
      if (
        this.side === "buy" &&
        (currentPrice >= this.takeProfit || currentPrice <= this.stopLoss)
      ) {
        this.closeTrade(currentPrice, closeWebsocket);
      } else if (
        this.side === "sell" &&
        (currentPrice <= this.takeProfit || currentPrice >= this.stopLoss)
      ) {
        this.closeTrade(currentPrice, closeWebsocket);
      }
    }
  }

  async closeTrade(exitPrice, closeWebsocket) {
    this.isOpen = false;
    this.exitPrice = exitPrice;
    this.exitTime = this.getISTTime(); // Timestamp for exit
    console.log(
      `Trade closed at exit price: ${this.exitPrice}. Final P&L: ${this.runningPnL} $`
    );

    // Save trade data to Google Sheets
    await this.saveToGoogleSheet();

    if (closeWebsocket) {
      closeWebsocket(); // Optional: Close WebSocket if applicable
    }
  }

  async saveToGoogleSheet() {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const users = await User.find();
    const strategyId = new mongoose.Types.ObjectId(this.strategy);

    const tradeData = [
      this.tradeNumber++,
      this.symbol,
      this.side,
      this.entryTime,
      this.exitTime,
      this.entryPrice,
      this.exitPrice,
      this.quantity,
      this.runningPnL,
    ];

    try {
      // Append the trade data to the sheet
      // const response = await sheets.spreadsheets.values.append({
      //   spreadsheetId,
      //   range,
      //   valueInputOption: "RAW",
      //   resource: {
      //     values: [tradeData],
      //   },
      // });

      // console.log(
      //   "Trade data saved to Google Sheets:",
      //   response.data.updates.updatedRange
      // );

      await appendDataToSpreadsheets(users, strategyId, [tradeData]);
    } catch (error) {
      console.error("Error saving trade data to Google Sheets:", error);
    }
  }
}

const appendDataToSpreadsheets = async (users, strategyId, data) => {
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  const appendToSpreadsheet = async (spreadsheetId, userEmail) => {
    try {
      const range = "Sheet1!A2"; // Start from row 2 to avoid the header row
      const values = data; // Only the trade data, no header

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: "RAW",
        resource: { values },
      });

      console.log(`Data appended successfully to spreadsheet for ${userEmail}`);
    } catch (error) {
      console.error(
        `Error appending data to ${userEmail}'s spreadsheet:`,
        error
      );
    }
  };

  const appendPromises = users
    .filter((user) => user.DeployedStrategies.includes(strategyId))
    .map((user) =>
      user.Spreadsheets.forEach((spreadsheet) =>
        appendToSpreadsheet(spreadsheet.spreadsheetId, user.Email)
      )
    );

  await Promise.all(appendPromises);
  console.log("Data appended to all relevant spreadsheets!");
};

module.exports = PaperTrade;
