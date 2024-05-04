const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const express = require('express');
const app = express();

// Load the service account key JSON file.
const serviceAccount = require("./app-spaces-guntar-2024-a9477f694db8.json"); // replace with path to your service account key file

// Configure the Google Drive client with the service account credentials.
const jwtClient = new google.auth.JWT(
  serviceAccount.client_email,
  null,
  serviceAccount.private_key,
  ['https://www.googleapis.com/auth/drive'],
  null
);

const drive = google.drive({
  version: 'v3',
  auth: jwtClient,
});

// Specify the directory you want to read files from
const directoryPath = path.join(__dirname, './img/');

// Read all files from the directory
fs.readdir(directoryPath, function(err, files) {
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  }

  // Upload each file to Google Drive
  files.forEach(function(file) {
    const filePath = path.join(directoryPath, file);
    const fileStream = fs.createReadStream(filePath);

    drive.files.create(
      {
        requestBody: {
          name: file,
          parents: ["1NuP83rBhbIgL_EOXQRCnYfV392Vuj_mw"], // Replace with the ID of the folder you want to upload to
        },
        media: {
          mimeType: "application/octet-stream", // Use the correct MIME type for your files
          body: fileStream,
        },
      },
      function (err, res) {
        if (err) {
          console.log("Error uploading file:", err);
        } else {
          console.log("File uploaded:", res.data);
        }
      }
    );
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});