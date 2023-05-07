const express = require("express");
const router = express.Router();
const Marble = require("../models/marbleModel");
const Manager = require("../models/managerModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const secretKey = "my_secret_key";

router.post("/addManager", function (req, res) {
  const id = req.body.id;
  const name = req.body.name;
  const phone = req.body.phone;
  const city = req.body.city;
  const pic = req.body.pic;
  const email = req.body.email;
  const password = req.body.password;

  let m1 = new Manager({
    id: id,
    name: name,
    phone: phone,
    city: city,
    pic: pic,
    email: email,
    password: password,
  });
  m1.save();
});

router.get("/getManagers", function (req, res) {
  Manager.find({}).then((manager) => {
    res.send(manager);
  });
});

router.delete("/deleteMarble/:id", function (req, res) {
  let { id } = req.params;
  Marble.findOneAndDelete({ _id: id }).then((deleteMarble) =>
    res.send(deleteMarble)
  );
});

router.post("/loginManager", (req, res) => {
  const { email, password } = req.body;
  const user = authenticateUser(email, password);
  user.then((user) => {
    if (!user) {
      console.log(user);

      return res.status(401).send({ message: "Invalid username or password" });
    }
    const accessToken = generateAccessToken(user);
    res.send({ accessToken });
  });
});

async function authenticateUser(email, password) {
  return Manager.find({}).then((users, err) => {
    const managersArray = getManagersUsers(users);
    const user = managersArray.find((u) => u.email === email);
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

router.put("/updateMarble/:id", function (req, res) {
  const { id } = req.params;
  const { price, quantity } = req.body;

  Marble.findOneAndUpdate({ _id: id }, { price, quantity }, { new: true })
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
});

const getManagersUsers = function (users) {
  const usersArray = users.map((user) => user.toObject());
  return usersArray;
};

router.post("/managerUser", (req, res) => {
  console.log(req.body);
  const manager = new Manager(req.body);
  console.log(manager);
  Manager.find({}).then((users, err) => {
    if (err) {
      res.status(500).send(err);
    } else {
      const managersArray = getManagersUsers(users);
      if (existUser(managersArray, manager.email) || manager.email === "") {
        return res.status(401).send(`invalid username '${manager.email}'`);
      } else {
        const hashedPassword = bcrypt.hashSync(manager.password, salt);
        manager.password = hashedPassword;
        const savedUser = manager.save();
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

router.post("/addMarble", function (req, res) {
  const code = req.body.code;
  const type = req.body.type;
  const price = req.body.price;
  const quantity = req.body.quantity;
  const style = req.body.style;
  const name = req.body.name;
  const img = req.body.img;
  const color = req.body.color;

  let m1 = new Marble({
    code: code,
    type: type,
    price: price,
    quantity: quantity,
    style: style,
    name: name,
    img: img,
    color: color,
  });
  m1.save();
});

module.exports = router;
