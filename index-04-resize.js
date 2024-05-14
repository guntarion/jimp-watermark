const Jimp = require("jimp");

async function resizeImage() {
  try {
    // Load the image
    const image = await Jimp.read("./img/t-shirt.jpeg");

    // Resize the image
    const resizedImage = image.resize(2048, 2048); // Double the size as an example

    // Save the resized image
    await resizedImage.writeAsync("./img/resized-t-shirt.jpeg");
    console.log("Resized image saved.");

    // For a higher resolution appropriate for t-shirt printing (approximation)
    const forPrinting = image.resize(3600, 3600); // Adjusting to 3600x3600
    await forPrinting.writeAsync("./img/t-shirt-for-printing.jpeg");
    console.log("Image resized for printing saved.");
  } catch (error) {
    console.error("Error processing image:", error);
  }
}

resizeImage();
