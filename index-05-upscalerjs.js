// This is not working yet. Need node 16

const tf = require("@tensorflow/tfjs-node");
const fs = require('fs');
const Upscaler = require("upscaler/node"); // this is important!

async function upscaleImage() {
  const upscaler = new Upscaler();
  const image = tf.node.decodeImage(fs.readFileSync("/path/to/image.png"), 3);
  const tensor = await upscaler.upscale(image);
  const upscaledTensor = await tf.node.encodePng(tensor);
  fs.writeFileSync("./logo-yamr.png", upscaledTensor);

  // dispose the tensors!
  image.dispose();
  tensor.dispose();
  upscaledTensor.dispose();
}

upscaleImage();