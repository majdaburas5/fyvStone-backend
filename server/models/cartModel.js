const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  marble: [{ type: Schema.Types.ObjectId, ref: "Marble" }],
  quantity: Number,
  purchaseTimes: Number,
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
