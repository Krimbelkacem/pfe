const { default: mongoose } = require("mongoose");

const User = require("../db/Schema/User");
const Resto = require("../db/Schema/Restaurant");
const session = require("express-session");
const generateToken = require("../config/generateToken");
const asyncHandler = require("express-async-handler");
const homeLogique = async (req, res) => {
  try {
    const userId = req.query.iduser; // Retrieve the ID of the logged-in user from the request

    if (!userId) {
      // If the user is not logged in
      const randomRestaurants = await Resto.aggregate([
        { $match: { isConfirmed: true } }, // Add the condition to filter confirmed restaurants
        { $sample: { size: 5 } },
      ]);
      return res.json(randomRestaurants);
    }

    const user = await User.findById(userId).populate("followings"); // Retrieve information of the logged-in user and their followed restaurants

    let restaurants = [];

    if (user.followings.length < 5) {
      // If the user is following less than 5 restaurants
      restaurants = user.followings; // Retrieve the restaurants the user is following

      // Complete the list with random restaurants until it reaches 5
      const remainingRestaurantsCount = 5 - user.followings.length;
      const additionalRestaurants = await Resto.aggregate([
        { $match: { _id: { $nin: user.followings }, isConfirmed: true } }, // Add the condition to filter confirmed restaurants
        { $sample: { size: remainingRestaurantsCount } }, // Retrieve the remaining random restaurants
      ]);

      restaurants = restaurants.concat(additionalRestaurants);
    } else {
      // If the user is following 5 or more restaurants, retrieve only 5 random restaurants from their followed list
      const randomIndexes = getRandomIndexes(user.followings.length, 5); // Get 5 random indexes
      restaurants = randomIndexes.map((index) => user.followings[index]); // Retrieve the corresponding restaurants based on the random indexes
    }

    console.log("Restaurant retrieval:", restaurants.length);
    res.json(restaurants);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while retrieving restaurants.",
    });
  }
};

// Function to get random indexes
function getRandomIndexes(length, count) {
  const indexes = [];

  while (indexes.length < count) {
    const randomIndex = Math.floor(Math.random() * length);

    if (!indexes.includes(randomIndex)) {
      indexes.push(randomIndex);
    }
  }

  return indexes;
}

module.exports = homeLogique;
