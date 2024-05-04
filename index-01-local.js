const Jimp = require('jimp');

async function watermarkImage() {
    // Load the images
    const image = await Jimp.read("./img/t-shirt.jpeg");
    const watermark = await Jimp.read('./logo/logo-vido-black.png');

    // Resize the image to width of 1024 and auto height
    image.resize(1024, Jimp.AUTO);

    // Resize the watermark to be 1/6 of the image's width
    const watermarkResize = watermark.resize(image.bitmap.width / 6, Jimp.AUTO);

    // Make the watermark transparent
    watermarkResize.opacity(0.75);

    // Calculate the position to place the watermark (bottom-right, but higher and more to the left)
    const x = image.bitmap.width - watermarkResize.bitmap.width - (image.bitmap.width * 0.05); // 5% from the right
    const y = image.bitmap.height - watermarkResize.bitmap.height - (image.bitmap.height * 0.05); // 5% from the bottom

    // Composite the watermark onto the image
    image.composite(watermarkResize, x, y, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacityDest: 1,
        opacitySource: 0.75
    });

    // Save the image
    await image.writeAsync("./img/t-shirt-watermarked.jpeg");
}

watermarkImage().catch(console.error);