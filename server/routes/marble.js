const express = require("express");
const router = express.Router();
const Marble = require("../models/marbleModel");
const Cart = require("../models/cartModel");
const jwt = require("jsonwebtoken");
const secretKey = "my_secret_key";

router.get("/getMarbles", async function (req, res) {
  try {
    Marble.find({}).then((marble) => {
      res.send(marble);
    });
  } catch (error) {
    console.log(error);
    res.status(401).send({ message: "Invalid token" });
  }
});

router.get("/getProducts", authenticateToken, async function (req, res) {
  try {
    Marble.find({}).then((marble) => {
      res.send(marble);
    });
  } catch (error) {
    console.log(error);
    res.status(401).send({ message: "Invalid token" });
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.sendStatus(401);
    }

    req.user = decoded;

    next();
  });
}

router.get("/showMarbleByColor/:color", function (req, res) {
  let color = req.params.color;
  Marble.find({ color: color }).then((marbleByColor) => {
    res.send(marbleByColor);
  });
});

router.get("/marble/:id", function (req, res) {
  let id = req.params.id;
  Marble.find({ _id: id }).then((marble) => {
    res.send(marble);
  });
});

router.delete("/deleteMarble/:id", function (req, res) {
  let id = req.params.id;
  Marble.findOneAndDelete({ _id: id }).then((deleteMarble) =>
    res.send(deleteMarble)
  );
});

router.post("/marbles/filter", function (req, res) {
  let object = req.body;
  Marble.find(object.filterObj)
    .sort(object.sortObject)
    .then((marbles) => {
      res.send(marbles);
    });
});

router.get("/marbles/:filter", function (req, res) {
  let filter = req.params.filter;
  Marble.distinct(filter).then((filtered) => {
    res.send(filtered);
  });
});

router.get("/top5marbles", async function (req, res) {
  let top5Marbles = await Cart.aggregate([
    { $unwind: "$marble" },
    {
      $group: {
        _id: "$marble",
        maxPurchaseTime: { $max: "$purchaseTime" },
      },
    },
    { $sort: { maxPurchaseTime: -1 } },
    { $project: { _id: 1 } },
    { $limit: 5 },
  ]);
  let marbleIds = top5Marbles.map((marble) => marble._id);
  let marbles = await Marble.find({ _id: { $in: marbleIds } });
  if (!marbles) {
    res.status(401).send({ message: "there is a problem" });
  }
  res.status(200).send(marbles);
});

module.exports = router;
