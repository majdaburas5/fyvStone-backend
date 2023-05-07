const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  orderNumber: Number,
  orderDate: String,
  customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
  cart: [{ type: Schema.Types.ObjectId, ref: "Cart" }],
  quantity: Number,
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
