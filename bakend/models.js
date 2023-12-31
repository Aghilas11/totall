const mongoose = require("mongoose");

const imgSchema = new mongoose.Schema({
  title: String,
  description: String,
  img: {
    data: Buffer,
    contentType: String,
  },
  kilometerage: Number,
  year: Number,
  price: Number,
  fuel: String,
});

module.exports = ImageModel = mongoose.model("Image", imgSchema);
