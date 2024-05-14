const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const { v4: uuidv4 } = require("uuid");
const { format } = require("date-fns");
const Jimp = require("jimp");
const axios = require("axios");
const express = require("express");
const app = express();

// Load the service account key JSON file.
const serviceAccount = require("./app-spaces-guntar-2024-a9477f694db8.json");

// Configure the Google Drive client with the service account credentials.
const jwtClient = new google.auth.JWT(
  serviceAccount.client_email,
  null,
  serviceAccount.private_key,
  ["https://www.googleapis.com/auth/drive"],
  null
);

const drive = google.drive({
  version: "v3",
  auth: jwtClient,
});

async function watermarkImage(imagePath, watermarkPath, outputImagePath) {
  // Load the images
  const image = await Jimp.read(imagePath);
  const watermark = await Jimp.read(watermarkPath);

  // Resize the image to width of 1024 and auto height
  image.resize(1024, Jimp.AUTO);

  // Resize the watermark to be 1/6 of the image's width
  const watermarkResize = watermark.resize(image.bitmap.width / 6, Jimp.AUTO);

  // Make the watermark transparent
  watermarkResize.opacity(0.75);

  // Calculate the position to place the watermark (bottom-right, but higher and more to the left)
  const x = image.bitmap.width - watermarkResize.bitmap.width - image.bitmap.width * 0.05; // 5% from the right
  const y = image.bitmap.height - watermarkResize.bitmap.height - image.bitmap.height * 0.05; // 5% from the bottom

  // Composite the watermark onto the image
  image.composite(watermarkResize, x, y, {
    mode: Jimp.BLEND_SOURCE_OVER,
    opacityDest: 1,
    opacitySource: 0.75,
  });

  // Save the image
  await image.writeAsync(outputImagePath);
}

async function downloadImage_ori(fileId, destinationPath) {
  const response = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" }
  );

  const writer = fs.createWriteStream(destinationPath);

  return new Promise((resolve, reject) => {
    response.data
      .on("end", () => {
        resolve(destinationPath);
      })
      .on("error", reject)
      .pipe(writer);
  });
}

const downloadImage = async (url, destinationPath) => {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream',
  });

  const writer = fs.createWriteStream(destinationPath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

async function uploadImage(filePath, fileName, parentId) {
  const fileStream = fs.createReadStream(filePath);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [parentId],
    },
    media: {
      mimeType: "image/jpeg",
      body: fileStream,
    },
  });

  return response.data;
}

async function makeFilePublic(fileId) {
  await drive.permissions.create({
    fileId: fileId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });
}

async function processImage() {
  const imageUrl =
    "https://www.seragamharmas.com/wp-content/uploads/2020/11/KK-012-Kemeja-Abu-01.jpg"; // Replace with the URL of the image you want to download
  const parentId = "1NuP83rBhbIgL_EOXQRCnYfV392Vuj_mw"; // Replace with the ID of the folder you want to upload to
  const downloadPath = "./img/temporary-image.jpeg";
  const watermarkPath = "./logo/logo-vido-black.png";
  
// Generate a unique file name with a timestamp and a UUID
const datePrefix = format(new Date(), 'yyyy-MM-dd');
const uniqueId = uuidv4();
const outputImagePath = `./img/${datePrefix}-${uniqueId}.jpeg`;


// Download the image from Google Drive
//   await downloadImage(fileId, downloadPath);
// Watermark the image
// await watermarkImage(downloadPath, watermarkPath, outputImagePath);

// Download the image from the URL
// await downloadImage(imageUrl, outputImagePath);
// Watermark the image
await watermarkImage(outputImagePath, watermarkPath, outputImagePath);


  // Upload the watermarked image to Google Drive
  const uploadedFile = await uploadImage(
    outputImagePath,
    path.basename(outputImagePath),
    parentId
  );

  // Make the file public
  await makeFilePublic(uploadedFile.id);

  // Get the shareable URL
  const shareableUrl = `https://drive.google.com/file/d/${uploadedFile.id}/view?usp=sharing`;

  console.log("File uploaded:", uploadedFile);
  console.log("Shareable URL:", shareableUrl);

  // Construct the direct link
    const directLink = `https://drive.google.com/uc?export=view&id=${uploadedFile.id}`;
    console.log("Direct link:", directLink);
}

processImage().catch(console.error);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});