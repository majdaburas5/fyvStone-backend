const express = require("express");
const app = express();
var cors = require("cors");
const marble = require("./server/routes/marble");
const order = require("./server/routes/orders");
const customer = require("./server/routes/customer");
const manager = require("./server/routes/manager");
const path = require("path");
const port = 3001;
const mongoose = require("mongoose");
const marbleDB = "mongodb://127.0.0.1:27017/marbleDB";
const atlas_database =
  "mongodb+srv://salemgode:vlCKJ94Xqwra4p9n@cluster0.vv6m4tp.mongodb.net/?retryWrites=true&w=majority";
mongoose
  .connect(atlas_database ? atlas_database : marbleDB, {
    useNewUrlParser: true,
  })
  .then(() => console.log("conneted to DB"))
  .catch((err) => console.log(err));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );
  next();
});
app.use(cors());
app.use(express.static(path.join(__dirname, "node_modules")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", marble);
app.use("/", manager);
app.use("/", customer);
app.use("/", order);

app.listen(port, function () {
  console.log(`Running on port ${port}`);
});
