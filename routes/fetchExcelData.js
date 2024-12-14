// const { google } = require("googleapis");

// const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
// const auth = new google.auth.GoogleAuth({
//   credentials,
//   scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"], // Use read-only access if you don't need to edit the sheet
// });

// // Google Sheets API setup
// const sheets = google.sheets({ version: "v4", auth });

// const fetchSheetData = async (req, res) => {
//   const spreadsheetId = "1vbuZ-VwVzJAN-QYgNBYsVQ10De9B0tz8AQIqxuwkjc4"; // Replace with your Google Sheet ID

//   try {
//     // Request metadata to get the sheet name dynamically
//     const metadataResponse = await sheets.spreadsheets.get({
//       spreadsheetId,
//     });

//     // Find the first sheet name dynamically
//     const sheetName = metadataResponse.data.sheets[0].properties.title;

//     // Fetch all sheet data (excluding headers)
//     const sheetRange = `${sheetName}!A:Z`; // Adjust columns as needed
//     const sheetResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: sheetRange,
//     });

//     let rows = sheetResponse.data.values;
//     if (rows && rows.length) {
//       rows = rows.slice(1); // Exclude header row
//     } else {
//       rows = [];
//     }

//     // Fetch the value of cell K10
//     const cellRange = `${sheetName}!K10`;
//     const cellResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: cellRange,
//     });

//     const cellValue = cellResponse.data.values
//       ? cellResponse.data.values[0][0]
//       : null;

//     // Send both the sheet data and the K10 cell value in the response
//     res.json({
//       sheetData: rows,
//       cellData: { cell: "K10", value: cellValue },
//     });
//   } catch (error) {
//     console.error("Error fetching sheet data:", error);
//     res.status(500).json({ error: "Failed to fetch sheet data." });
//   }
// };

// module.exports = fetchSheetData;

const { google } = require("googleapis");
const User = require("../models/users");

const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"], // Use read-only access if you don't need to edit the sheet
});

// Google Sheets API setup
const sheets = google.sheets({ version: "v4", auth });

const fetchSheetData = async (req, res) => {
  const email = req.body.email;

  // Fetch the user schema by email
  const userSchema = await User.findOne({ Email: email });
  if (!userSchema) {
    return res.status(404).json({ error: "User not found." });
  }

  const Spreadsheets = userSchema.Spreadsheets;
  const DeployedData = userSchema.DeployedData;
  const allSheetData = [];

  try {
    // Loop through each spreadsheet and fetch the corresponding data
    for (let i = 0; i < Spreadsheets.length; i++) {
      if (userSchema.DeployedStrategiesBrokerIds[i] === "Paper Trade") {
        const spreadsheetId = Spreadsheets[i].spreadsheetId;
        const strategyId = Spreadsheets[i].strategyId;
        const UserId = DeployedData[i].Account;

        const DeploedDate = userSchema.DeployedData[i].AppliedDate;
        // Fetch metadata for the sheet (to get the sheet name)
        const metadataResponse = await sheets.spreadsheets.get({
          spreadsheetId,
        });

        const sheetName = metadataResponse.data.sheets[0].properties.title;

        // Fetch all sheet data (excluding headers)
        const sheetRange = `${sheetName}!A:Z`; // Adjust columns as needed
        const sheetResponse = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: sheetRange,
        });

        let rows = sheetResponse.data.values;
        if (rows && rows.length) {
          rows = rows.slice(1); // Exclude header row
        } else {
          rows = [];
        }

        // Fetch the value of cell K10 (or any other cells you need)
        const cellRange = `${sheetName}!K10`;
        const cellResponse = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: cellRange,
        });

        const cellValue = cellResponse.data.values
          ? cellResponse.data.values[0][0]
          : null;

        // Push the sheet data into the allSheetData array
        allSheetData.push({
          strategyId: strategyId,
          strategyName: DeployedData[i].StrategyName, // You can adjust this based on actual strategy names
          sheetData: rows,
          UserId: UserId,
          DeploedDate: DeploedDate,
          cellData: { cell: "K10", value: cellValue },
        });
      }
    }

    // Send the response with all sheet data
    res.json({ allSheetData });
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    res.status(500).json({ error: "Failed to fetch sheet data." });
  }
};

module.exports = fetchSheetData;
