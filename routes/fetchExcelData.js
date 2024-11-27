const { google } = require("googleapis");
const path = require("path");

const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"], // Use read-only access if you don't need to edit the sheet
});

// Google Sheets API setup
const sheets = google.sheets({ version: "v4", auth });

const fetchSheetData = async (req, res) => {
  const spreadsheetId = "1vbuZ-VwVzJAN-QYgNBYsVQ10De9B0tz8AQIqxuwkjc4"; // Replace with your Google Sheet ID

  try {
    // Request metadata to get the sheet name dynamically
    const metadataResponse = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    // Find the first sheet name dynamically
    const sheetName = metadataResponse.data.sheets[0].properties.title;

    // Use the sheet name to request all data from that sheet
    const range = `${sheetName}!A:Z`; // Adjust columns as needed (A:Z is just an example)

    // Fetch the data from the specified range
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (rows && rows.length) {
      console.log("Sheet data:", rows);
    } else {
      console.log("No data found.");
    }
    res.json(rows);
  } catch (error) {
    console.error("Error fetching sheet data:", error);
  }
};

module.exports = fetchSheetData;
