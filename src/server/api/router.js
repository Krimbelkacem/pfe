const express = require("express");
const Resto = require("../db/Schema/Restaurant");
const User = require("../db/Schema/User");
const upload = require("../middleware/upload");
const jwt = require("jsonwebtoken");
const secretKey = "khlifa";

const {
  handleNewUser,
  handlegetuser,
  handleupdateuser,
  authUser,
  handledeleteteuser,
} = require("../controller/userController");
const {
  handlefindresto,
  handlenewresto,
  handleupdateresto,
  handlegetresto,
} = require("../controller/restoController");
const {
  handleaddmenu,
  handleaddcategory,
  handlereadcategory,
  handleadditem,
  addmenuitem,
} = require("../controller/menuController");
const app = express();
const fs = require("fs");
const multer = require("multer");
app.post("/upload", upload.single("image"), handlenewresto);
app.get("/ProfilResto", handlegetresto);
app.post("/searchResto", handlefindresto);
app.post("/signup", upload.single("image"), handleNewUser);
app.post("/login", authUser);

app.get("/profile", handlegetuser);

app.post("/updateprofil", handleupdateuser);
app.post("/deleteprofil", handledeleteteuser);
app.post("/updateresto", upload.single("photos"), handleupdateresto);

app.post("/addmenu", handleaddmenu);
app.post("/addcategory", handleaddcategory);
app.get("/category", handlereadcategory);

app.post("/additem", upload.single("image"), addmenuitem);
/*
app.post("/addResto", upload.single("avatar"), async (req, response) => {
  const resto = new Resto(req.body);
  console.log(resto);
  if (req.file) {
    resto.avatar = req.file.path;
    console.log(resto.avatar);
  }

  try {
    await resto.save();
    response.send(resto);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.get("/Resto", async (request, response) => {
  const resto = await Resto.find({});

  try {
    response.send(resto);
  } catch (error) {
    response.status(500).send(error);
  }
});*/
module.exports = app;
