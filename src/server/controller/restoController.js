const { default: mongoose } = require("mongoose");

const User = require("../db/Schema/User");
const Resto = require("../db/Schema/Restaurant");
const session = require("express-session");
const generateToken = require("../config/generateToken");
const asyncHandler = require("express-async-handler");
const handlenewresto = asyncHandler(async function (req, res, next) {
  console.log("id:" + req.query.id);
  const userId = req.query.id.toString();

  const file = req.file;
  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }

  const resto = new Resto();
  console.log(req.body.longitude);
  console.log(req.body.latitude);
  resto.name = req.body.name;
  resto.address = req.body.address;
  resto.avatar = req.file.filename;
  resto.owner = userId;
  resto.latitude = parseFloat(req.body.latitude);
  resto.longitude = parseFloat(req.body.longitude);

  try {
    await resto.save();
    console.log("ok");
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
    const photo = req.file.filename;
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
  console.log(id);
  const restos = await Resto.findById(id)
    .populate("followers")
    .populate("owner")
    .populate({
      path: "reservations",
      populate: {
        path: "user",
        select: "username picture",
      },
    })
    .exec();

  try {
    console.log(
      restos.price_average + "00000000000000000000000000000000000000000"
    );
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
  console.log(idR);
  console.log(idU);
  try {
    // Find the restaurant by ID
    const restaurant = await Resto.findById(idR);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Find the user by ID
    const user = await User.findById(idU);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Check if the user is already following the restaurant
    if (restaurant.followers.includes(idU)) {
      return res
        .status(400)
        .json({ message: "User is already following the restaurant" });
    }

    console.log(restaurant.followers);

    // Save the restaurant
    const updateR = await Resto.findByIdAndUpdate(
      idR,
      { $push: { followers: idU } },
      { new: true }
    );

    if (user.followings.includes(idR)) {
      return res
        .status(400)
        .json({ message: "Restaurant is already in the user's followings" });
    }

    const updateU = await User.findByIdAndUpdate(
      idU,
      { $push: { followings: idR } },
      { new: true }
    );
    console.log(user.followings);
    return res.status(200).json({ message: "Follower added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
const unfollow = asyncHandler(async (req, res) => {
  const idU = req.query.idU;
  const idR = req.query.idR;
  console.log(idU);
  console.log(idR);
  try {
    // Find the restaurant by ID
    const restaurant = await Resto.findById(idR);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Find the user by ID
    const user = await User.findById(idU);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is already following the restaurant
    if (!restaurant.followers.includes(idU)) {
      return res
        .status(400)
        .json({ message: "User is not following the restaurant" });
    }

    // Remove the user's ID from the followers array of the restaurant
    const updateR = await Resto.findByIdAndUpdate(
      idR,
      { $pull: { followers: idU } },
      { new: true }
    );

    // Remove the restaurant's ID from the followings array of the user
    const updateU = await User.findByIdAndUpdate(
      idU,
      { $pull: { followings: idR } },
      { new: true }
    );

    return res.status(200).json({ message: "Follower removed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
async function topRestos(req, res) {
  // Find the top 10 restaurants with the most followers
  const topRestosQuery = Resto.aggregate([
    { $match: { followers: { $exists: true } } }, // Match restaurants that have the 'followers' field
    {
      $project: {
        _id: 1,
        name: 1,
        avatar: 1,
        followerCount: { $size: "$followers" },
      },
    }, // Project the restaurant ID, name, avatar, and follower count
    { $sort: { followerCount: -1 } }, // Sort by follower count in descending order
    { $limit: 10 }, // Limit the result to 10 restaurants
  ]);

  // Execute the query
  topRestosQuery.exec((err, topRestos) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "An error occurred" });
      return;
    }

    res.json(topRestos);
  });
}

const recentsRestos = asyncHandler(async (req, res) => {
  try {
    const recentRestaurants = await Resto.find()
      .sort({ _id: -1 }) // Sort by descending order of _id (assumes _id is an auto-generated timestamp)
      .limit(10); // Limit the result to 10 restaurants

    res.json(recentRestaurants);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});
const randomCuisines = asyncHandler(async (req, res) => {
  try {
    const cuisines = await Resto.aggregate([
      { $unwind: "$cuisines" }, // Unwind the cuisines array
      { $sample: { size: 10 } }, // Randomly sample 10 documents
    ]);

    res.json(cuisines.map((item) => item.cuisines));
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

const getAllRestos = async (req, res) => {
  const restos = await Resto.find();

  res.status(200).json(restos);
};

// Add phone number to a restaurant
const addPhone = async (req, res) => {
  const { restoId, phone } = req.body;

  try {
    const resto = await Resto.findById(restoId);
    if (!resto) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    resto.phone = phone;
    await resto.save();

    res.status(200).json({ message: "Phone number added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete phone number from a restaurant
const deletePhone = async (req, res) => {
  const { restoId } = req.body;

  try {
    const resto = await Resto.findById(restoId);
    if (!resto) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    resto.phone = undefined;
    await resto.save();

    res.status(200).json({ message: "Phone number deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add cuisine to a restaurant
const addCuisine = async (req, res) => {
  const name = req.body.name;
  const image = req.file.filename;
  const restoId = req.query.id;
  console.log(image, name, restoId);
  try {
    const resto = await Resto.findById(restoId);
    if (!resto) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    resto.cuisines.push({ image, name });
    await resto.save();

    res.status(200).json({ message: "Cuisine added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete cuisine from a restaurant
const deleteCuisine = async (req, res) => {
  const { restoId, cuisineId } = req.body;

  try {
    const resto = await Resto.findById(restoId);
    if (!resto) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const cuisineIndex = resto.cuisines.findIndex(
      (cuisine) => cuisine._id.toString() === cuisineId
    );
    if (cuisineIndex === -1) {
      return res.status(404).json({ message: "Cuisine not found" });
    }

    resto.cuisines.splice(cuisineIndex, 1);
    await resto.save();

    res.status(200).json({ message: "Cuisine deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add description to a restaurant
const addDescription = async (req, res) => {
  const { restoId, description } = req.body;

  try {
    const resto = await Resto.findById(restoId);
    if (!resto) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    resto.description = description;
    await resto.save();

    res.status(200).json({ message: "Description added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// Delete description from a restaurant
const deleteDescription = async (req, res) => {
  const { restoId } = req.body;

  try {
    const resto = await Resto.findById(restoId);
    if (!resto) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    resto.description = undefined;
    await resto.save();

    res.status(200).json({ message: "Description deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// ...

// Delete a category from a restaurant's menu
const deleteCategory = async (req, res) => {
  const { restoId, categoryId } = req.body;

  try {
    const updatedResto = await Resto.findByIdAndUpdate(
      restoId,
      { $pull: { "menu.categories": { _id: categoryId } } },
      { new: true }
    );

    if (!updatedResto) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete an item from a category in a restaurant's menu
const deleteItem = async (req, res) => {
  const { restoId, categoryId, itemId } = req.body;

  try {
    const updatedResto = await Resto.findByIdAndUpdate(
      restoId,
      { $pull: { "menu.categories.$[category].items": { _id: itemId } } },
      { new: true, arrayFilters: [{ "category._id": categoryId }] }
    );

    if (!updatedResto) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//recuperer le menu des restos
const getMenuResto = async (req, res) => {
  const restoId = req.query.restoId;
  console.log(restoId);

  try {
    const menuResto = await Resto.findById(restoId);

    if (!menuResto) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Récupération du menu du restaurant

    const menu = menuResto.menu;

    res.status(200).json({ menu });
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).json({ message: "Failed to fetch menu" });
  }
};

//recuperer les detail resto
const getPhotoResto = async (req, res) => {
  const { restoId } = req.params;

  try {
    // Recherche du restaurant par ID
    const resto = await Resto.findById(restoId);

    if (!resto) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Récupération des photos du restaurant
    const photos = resto.photos;

    res.status(200).json({ photos });
  } catch (error) {
    console.error("Error fetching photos:", error);
    res.status(500).json({ message: "Failed to fetch photos" });
  }
};
const updatedetailsResto = async (req, res) => {
  const restoid = req.query.id;

  // Retrieve form data
  const { name, phone, description, openingHours } = req.body;
  const image = req.file;
  console.log("updating resto");
  try {
    // Update restaurant details in the database
    await Resto.findOneAndUpdate(
      { _id: restoid },
      {
        openingHours: openingHours || "",
        name: name || "",
        phone: phone || "",
        description: description || "",
        avatar: image ? image.filename : "",
      }
    );

    res
      .status(200)
      .json({ message: "Restaurant details updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const addcomments = async (req, res) => {
  console.log("0000000000000000");
  console.log(req.query.idR + "0000000000000000000");
  const idR = req.query.idR;
  const { comment } = req.body;
  const userId = req.query.userId;
  console.log(userId, idR, comment);
  // Create a new comment object
  const newComment = {
    user: userId,
    comment: comment,
    date: new Date(),
  };

  // Find the restaurant by ID and update its comments array
  Resto.findByIdAndUpdate(
    idR,
    { $push: { comments: newComment } },
    { new: true }
  )
    .populate("comments.user", "name") // Populate the user field of the comment with only the name
    .then((updatedResto) => {
      res.json(updatedResto);
    })
    .catch((error) => {
      res.status(500).json({ error: "Failed to add comment." });
    });
};

const getcomments = async (req, res) => {
  const id = req.query.idR;

  try {
    const restaurant = await Resto.findById(id).populate({
      path: "comments.user",
      select: "username picture",
    });

    res.json(restaurant.comments);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve comments." });
  }
};
module.exports = {
  getcomments,
  addcomments,
  updatedetailsResto,
  deleteCategory,
  deleteItem,
  addPhone,
  deletePhone,
  addCuisine,
  deleteCuisine,
  addDescription,
  deleteDescription,
  randomCuisines,
  recentsRestos,
  getAllRestos,
  topRestos,
  unfollow,
  follow,
  handlefindresto,
  handlenewresto,
  handledeleteteresto,
  handleupdateresto,
  handlegetresto,
  getMenuResto,
  getPhotoResto,
};
