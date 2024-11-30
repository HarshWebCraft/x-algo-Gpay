const { google } = require("googleapis");
const fs = require("fs");
const User = require("../models/users");
const { gmail } = require("googleapis/build/src/apis/gmail");

// Load Google API credentials
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
  ],
});
const sheets = google.sheets({ version: "v4", auth });
const drive = google.drive({ version: "v3", auth });

const addDeployed = async (req, res) => {
  try {
    const id = req.body.selectedStrategyId; // Strategy ID
    const index = req.body.Index;
    const quantity = req.body.Quaninty;
    const email = req.body.Email;
    const account = req.body.Account;
    const date = new Date();
    const applyDate =
      date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();

    // Find and update the user
    const updatedUser = await User.findOneAndUpdate(
      { Email: email },
      {
        $push: {
          DeployedData: {
            Strategy: id,
            Index: index,
            Quantity: quantity,
            Account: account,
            AppliedDate: applyDate,
          },
          DeployedStrategies: id,
        },
      },
      { new: true, upsert: false }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    console.log("User updated successfully:", updatedUser);

    // Check if a spreadsheet exists for the user and strategy
    const existingSpreadsheet = updatedUser.Spreadsheets.find(
      (spreadsheet) => spreadsheet.strategyId.toString() === id
    );

    let spreadsheetId;
    if (!existingSpreadsheet) {
      // Create a new spreadsheet
      const resource = {
        properties: {
          title: `${email}_${id}_StrategyData`,
        },
      };
      const response = await sheets.spreadsheets.create({
        resource,
        fields: "spreadsheetId",
      });

      spreadsheetId = response.data.spreadsheetId;

      // Add the new spreadsheet metadata to the user's document
      updatedUser.Spreadsheets.push({
        strategyId: id,
        spreadsheetId,
      });

      await updatedUser.save();

      console.log("Spreadsheet created and added to user:", spreadsheetId);
    } else {
      spreadsheetId = existingSpreadsheet.spreadsheetId;
      console.log("Spreadsheet already exists:", spreadsheetId);
    }
    const emails = [
      "harshdvadhavana26@gmail.com",
      "ayushsantoki1462004@gmail.com",
    ];

    for (const email of emails) {
      await drive.permissions.create({
        fileId: spreadsheetId,
        requestBody: {
          role: "writer", // Grant "edit" access
          type: "user", // Share with a specific user
          emailAddress: email, // Current user's email
        },
      });
    }

    // Append the deployed data to the spreadsheet
    const values = [
      [
        "NO",
        "Symbol",
        "Entry Type",
        "Entry Time",
        "Exit Time",
        "Entry Price",
        "Exit Price",
        "Qty",
        "P&L",
      ],
    ];
    const range = "Sheet1!A1"; // Adjust the range as needed
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      resource: { values },
    });

    console.log("Data appended to spreadsheet.");

    res.json(updatedUser);
  } catch (error) {
    console.error("Error in addDeployed:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deploying the strategy." });
  }
};

module.exports = addDeployed;
