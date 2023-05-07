const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel");
const Customer = require("../models/customerModel");
const Cart = require("../models/cartModel");
const Marble = require("../models/marbleModel");

const getCustomerById = function (customerId) {
  return Customer.find({ id: customerId }).then((res) => {
    return res[0];
  });
};

const getQuantityById = async function (id) {
  const quantity = await Marble.find({ _id: id }, { quantity: 1 });
  return quantity[0].quantity;
};

router.put("/marble/:id", async function (req, res) {
  let { id } = req.params;
  let { quantity } = req.body;
  quantity = parseInt(quantity);
  const updatedQuantity = await getQuantityById(id);
  const newQuantity = updatedQuantity - quantity;
  if (newQuantity > 0) {
    Marble.findOneAndUpdate(
      { _id: id },
      { quantity: newQuantity },
      { new: true }
    )
      .then((updatedMarble) => {
        if (updatedMarble) {
          res.send(updatedMarble);
        } else {
          res.status(404).send({ message: "Marble not found" });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send({ message: "Internal server error" });
      });
  } else {
    let orderedQuantity = newQuantity * -1 + 100;
    Marble.findOneAndUpdate(
      { _id: id },
      { quantity: orderedQuantity },
      { new: true }
    )
      .then((updatedMarble) => {
        if (updatedMarble) {
          res.send(updatedMarble);
        } else {
          res.status(404).send({ message: "Marble not found" });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send({ message: "Internal server error" });
      });
  }
});

const getOrderNumber = function () {
  return Order.find({})
    .sort({ orderNumber: -1 })
    .limit(1)
    .then((order) => {
      if (order.length > 0) return order[0].orderNumber + 1;
      return 1;
    });
};

const getPurchaseTimes = function (marbleId) {
  return Cart.findOne({ marble: marbleId })
    .sort({ purchaseTimes: -1 })
    .limit(1)
    .then((cart) => {
      if (cart === null) return 1;
      return cart.purchaseTimes + 1;
    });
};

router.post("/cart/addToCart", async function (req, res) {
  const date = new Date();
  let cartArray = [];
  let marbles = req.body.marble;
  for (const m of marbles) {
    let purchase = await getPurchaseTimes(m.marble[0]._id);
    cartArray.push(
      new Cart({
        marble: m.marble,
        quantity: m.quantity,
        purchaseTimes: purchase,
      })
    );
  }
  for (const cart of cartArray) {
    await cart.save();
  }
  const customer = await getCustomerById(req.body.customerId);
  const orderNum = await getOrderNumber();
  let c1 = new Order({
    orderNumber: orderNum,
    orderDate: date,
    customerId: customer,
    cart: cartArray,
  });
  c1.save();
});

router.get("/marblesAddedToCart", async function (req, res) {
  await Order.find({}).then((cart) => {
    res.send(cart);
  });
});

router.get("/getCustomer/:id", async function (req, res) {
  try {
    let { id } = req.params;
    const customer = await Customer.findOne({ _id: id });
    if (!customer) {
      res.status(404).send("Customer not found");
    } else {
      res.send(customer);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.get("/getCustomerOrder/:orderNumber", async function (req, res) {
  let { orderNumber } = req.params;
  Order.find({ orderNumber })
    .populate({
      path: "cart",
      populate: {
        path: "marble",
        model: "Marble",
      },
    })
    .then((order) => {
      res.send(order);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("Internal Server Error");
    });
});

router.get("/getSpecificCustomerOrder/:customerId", async function (req, res) {
  let { customerId } = req.params;
  const user = await getCustomerById(customerId);
  console.log(user);
  Order.find({ customerId: user._id })
    .populate({
      path: "cart",
      populate: {
        path: "marble",
        model: "Marble",
      },
    })
    .then((order) => {
      res.send(order);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("Internal Server Error");
    });
});

module.exports = router;
