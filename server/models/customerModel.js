const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const customerSchema = new Schema({
  id: Number,
  name: String,
  phone: String,
  address: String,
  email: String,
  password: String,
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
