const express = require("express");
const mongoose = require("mongoose");
const router = require("./src/Server/api/router.js");
const bodyParser = require("body-parser");
const app = express();
var cookieParser = require("cookie-parser");

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));

const fs = require("fs");

// Specify the directory path
const directory = "./public";

// Check if the directory exists
if (!fs.existsSync(directory)) {
  // If not, create the directory
  fs.mkdirSync(directory);
}

app.use(express.static("uploads"));
app.use(express.static("public"));
app.use(express.json());
mongoose.set("strictQuery", false);

const mongoDB = "mongodb://localhost:27017/ELMida";

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB).then(() => console.log("db connected"));
}

app.use(router);

app.listen(3000, () => {
  console.log("Server is running at port 3000");
});
