const { default: mongoose } = require("mongoose");

const User = require("../db/Schema/User");
const { Resto, Category } = require("../db/Schema/Restaurant");
const session = require("express-session");
const generateToken = require("../config/generateToken");
const asyncHandler = require("express-async-handler");
const handlenewresto = asyncHandler(async function (req, res, next) {
  console.log("id:" + req.query.id);
  const userId = req.query.id;
  const file = req.file;
  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }

  const resto = new Resto(req.body);

  resto.avatar = req.file.path;
  resto.owner = userId;
  console.log(resto);

  try {
    await resto.save();
    const newRestoId = resto._id;
    User.findByIdAndUpdate(
      userId,
      { $push: { Restos: newRestoId } },
      { new: true }
    )
      .then((user) => {
        console.log(`Successfully updated user ${user._id}`);
      })
      .catch((err) => {
        console.error(`Error updating user: ${err.message}`);
      });
    res.send(resto);
  } catch (error) {
    res.status(500).send(error);
  }
});

const handleupdateresto = asyncHandler(async function (req, res, next) {
  console.log("id:" + req.query.id);
  const restoId = req.query.id;

  if (!req.query) {
    res.status(500).send("no id send");
    console.log("no id");
  }
  if (!req.file) {
    console.log("no data");
  }
  if (req.file) {
    const photo = req.file.path;
    console.log(photo);
    try {
      const update = await Resto.findByIdAndUpdate(
        restoId,
        { $push: { photos: photo } },
        { new: true }
      );
      console.log("ok");
      console.log(update.photos);

      res.json(update);
    } catch (error) {
      res.status(500).send(error);
    }
  }
  /*if (req.body) {
    const resto = req.body;
    console.log(resto);
    try {
      const update = await Resto.findOneAndUpdate(
        restoId,
        { resto },
        { new: true }
      );
    } catch (error) {
      res.status(500).send(error);
    }
  }*/
});

const handlefindresto = asyncHandler(async (req, response) => {
  const keyword = req.query.restoName
    ? {
        $or: [
          { name: { $regex: req.query.restoName, $options: "i" } },
          //  { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const restos = await Resto.find(keyword);

  try {
    response.json(restos);
  } catch (error) {
    response.status(500).send(error);
  }
});
const handlegetresto = asyncHandler(async (req, response) => {
  const id = req.query.id;

  const restos = await Resto.findById(id);

  try {
    response.json(restos);
  } catch (error) {
    response.status(500).send(error);
  }
});

const handledeleteteresto = asyncHandler(async (req, res) => {
  console.log("id:" + req.query.id);
  const restoId = req.query.idR;
  const userId = req.query.idU;
  try {
    const deleteresto = await Resto.findOneAndDelete({ _id: restoId });
    if (deleteresto) {
      User.updateOne(
        { _id: userId },
        { $pull: { Restos: { _id: restoId } } },
        (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("Message removed successfully");
          }
        }
      );
    }
    console.log(`resto ${restoId} delete successfully: ${deleteresto}`);
    res.json({ message: "Profile delete successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.error(`Error updating resto ${restoId}: ${err}`);
  }
});

const follow = asyncHandler(async (req, res) => {
  const idU = req.query.idU;
  const idR = req.query.idR;
  try {
    // Find the restaurant by ID
    const restaurant = await Resto.findById(id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Find the user by ID
    const user = await User.findById(followerId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add the user to the restaurant's followers array
    restaurant.followers.push(idU);

    // Save the restaurant
    await restaurant.save();
    user.followings.push(idR);
    await user.save();

    res.status(200).json({ message: "Follower added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = {
  follow,
  handlefindresto,
  handlenewresto,
  handledeleteteresto,
  handleupdateresto,
  handlegetresto,
};
