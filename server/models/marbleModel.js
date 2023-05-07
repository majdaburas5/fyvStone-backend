const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const marbleSchema = new Schema({
  code: Number,
  type: String,
  price: Number,
  quantity: Number,
  style: String,
  name: String,
  img: String,
  color: Number,
});

const Marble = mongoose.model("Marble", marbleSchema);

module.exports = Marble;
