const express = require("express");
const router = express.Router();
const Customer = require("../models/customerModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const secretKey = "my_secret_key";

const getCustomerUsers = function (users) {
  const usersArray = users.map((user) => user.toObject());
  return usersArray;
};

router.post("/customerUser", (req, res) => {
  console.log(req.body);
  const customer = new Customer(req.body);
  console.log(customer);
  Customer.find({}).then((users, err) => {
    if (err) {
      res.status(500).send(err);
    } else {
      const customersArray = getCustomerUsers(users);
      if (existUser(customersArray, customer.email) || customer.email === "") {
        return res.status(401).send(`invalid username '${customer.email}'`);
      } else {
        const hashedPassword = bcrypt.hashSync(customer.password, salt);
        customer.password = hashedPassword;
        const savedUser = customer.save();
        return res.status(201).json(savedUser);
      }
    }
  });
});

const existUser = function (usersArray, email) {
  let flag = false;
  const findUser = usersArray.find((user) => {
    if (user.email === email) {
      flag = true;
    }
  });

  return flag;
};

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

async function authenticateUser(email, password) {
  return Customer.find({}).then((users, err) => {
    const customersArray = getCustomerUsers(users);
    const user = customersArray.find((u) => u.email === email);
    if (!user) {
      return null;
    }
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    return { id: user.id, email: user.email };
  });
}

function generateAccessToken(user) {
  return jwt.sign(user, secretKey);
}

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = authenticateUser(email, password);
  user.then((user) => {
    if (!user) {
      return res.status(401).send({ message: "Invalid username or password" });
    }
    const accessToken = generateAccessToken(user);
    res.send({ accessToken });
  });
});

router.post("/logout", (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  res.status(200).send("Logged out successfully");
});

router.get("/user", authenticateToken, (req, res) => {
  res.json({
    user: req.user,
  });
});

router.get("/customers", (req, res) => {
  return Customer.find({}).then((customers) => {
    return res.status(201).json(customers);
  });
});

router.post("/addCustomer", function (req, res) {
  const user = req.body.user;
  let u1 = new Customer({
    id: user.id,
    name: user.name,
    phone: user.phone,
    address: user.address,
    email: user.email,
    password: user.password,
  });
  u1.save();
});
module.exports = router;
