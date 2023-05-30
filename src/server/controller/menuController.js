const User = require("../db/Schema/User");
const Resto = require("../db/Schema/Restaurant");
const session = require("express-session");
const generateToken = require("../config/generateToken");
const asyncHandler = require("express-async-handler");
const { response } = require("../api/router");

const handleaddmenu = asyncHandler(async function (req, res, next) {
  console.log("id:" + req.query.id);
  const restoId = req.query.id;

  if (!req.query) {
    res.status(500).send("no id send");
    console.log("no id");
  }
  if (!req.body) {
    console.log("no data");
  }
  if (req.body) {
    console.log(req.body.name);
    const menuname = req.body.name;
    console.log(menuname);
    try {
      const update = await Resto.findOneAndUpdate(
        { _id: restoId },
        { menu: { name: menuname } },
        { new: true }
      );
      res.json(update.menu);
    } catch (error) {
      console.error(error);
    }
  }
});

/*const handleaddcategory = asyncHandler(async function (req, res, next) {
  console.log("id:" + req.query.id);
  const restoId = req.query.id;
  const catname = req.body.catname;
  console.log(catname);
  if (!req.query) {
    res.status(500).send("no id send");
    console.log("no id");
  }
  if (!req.body) {
    console.log("no data");
  }
  if (req.body) {
    const cat = { name: catname };
    console.log(cat);

    console.log("ok");
    try {
      const update = await Resto.findByIdAndUpdate(
        restoId,
        { $push: { "menu.categories": cat } },
        { new: true }
      );

      console.log(cat);

      res.json(cat);
    } catch (error) {
      res.status(500).send(error);
    }
  }
});*/
const handleaddcategory = asyncHandler(async (req, res) => {
  const { id: restoId } = req.query;
  const { catname } = req.body;

  if (!restoId) {
    return res.status(400).send("Missing 'id' parameter.");
  }

  if (!catname) {
    return res.status(400).send("Missing 'catname' field.");
  }

  try {
    const update = await Resto.findByIdAndUpdate(
      restoId,
      { $push: { "menu.categories": { name: catname } } },
      { new: true }
    );

    if (!update) {
      return res.status(404).send("Restaurant not found.");
    }

    const newCategory =
      update.menu.categories[update.menu.categories.length - 1];
    return res.json(newCategory);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error.");
  }
});
const handlereadcategory = asyncHandler(async function (req, res, next) {
  console.log("id resto:" + req.query.id);
  const restoId = req.query.id;

  if (!req.query) {
    res.status(500).send("no id send");
    console.log("no id");
  }

  try {
    const update = await Resto.findById(restoId)
      .populate("menu.categories")
      .exec();
    if (update) {
      const cat = update.menu.categories;
      console.log(cat);
      res.json(cat);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id, categoryId } = req.params;

  try {
    const resto = await Resto.findById(id);
    if (!resto) {
      return res.status(404).json({ message: "Resto not found" });
    }

    const categoryIndex = resto.menu.categories.findIndex(
      (category) => category._id.toString() === categoryId
    );
    if (categoryIndex === -1) {
      return res.status(404).json({ message: "Category not found" });
    }

    resto.menu.categories.splice(categoryIndex, 1);
    await resto.save();

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete category" });
  }
});

const addmenuitem = async (req, res) => {
  const { name, price, description } = req.body;
  const imagefile = req.file;
  const image = req.file.filename;
  console.log(req.file.path);
  console.log(imagefile);
  const { id } = req.query;
  const idC = req.query.idC;
  console.log("id resto :" + id);
  console.log("id category: " + idC);
  try {
    const resto = await Resto.findById(id);
    if (!resto) {
      console.log("resto not founnd");
      return res.status(404).json({ message: "Restaurant not found" });
    }
    /*
    const categoryIndex = resto.menu.categories.findIndex(
      (category) => console.log(category._id),
      category._id === idC
    );
    
    if (categoryIndex === -1) {
      return res.status(400).json({ message: "Category not found" });
    }

    const newItem = { name, price, description };
    resto.menu.categories[categoryIndex].items.push(newItem);

    await resto.save();
    return res
      .status(201)
      .json({ message: "Item added to menu", item: newItem });*/
    const newItem = { name, image, price, description };
    const updatedResto = await Resto.findOneAndUpdate(
      { _id: id, "menu.categories._id": idC },
      { $push: { "menu.categories.$.items": newItem } },
      { new: true }
    );
    console.log("ok");
    return res
      .status(201)
      .json({ message: "Item added to menu", item: newItem });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
/*
const handleadditem = asyncHandler(async function (req, res, next) {
  if (!req.query || !req.body) {
    res.status(500).send("no id send");
    console.log("no id");
  }
  console.log("id resto:" + req.query.id);
  console.log("new item");
  const restoId = req.query.id;
  console.log(req.body.category);
  /*
  if(req.body.name){ descriptio}
  if(req.body.price){}
  if(req.body.description){}
  
  const category = req.body.category;
  const newItem = {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
  };
  console.log(req.body.category);
  try {
    const update = await Resto.findByIdAndUpdate(
      restoId,
      { $push: { "menu.items": newItem } },
      { new: true }
    );
    res.json("ok");
    calculateAndUpdatePriceAverage(restoId);
  } catch (error) {
    res.status(500).send(error);
  }
});*/
const calculateAndUpdatePriceAverage = async (restoId) => {
  try {
    const restaurant = await Resto.findById(restoId).populate(
      "menu.categories.items"
    );

    // Calculate price average
    const menuItems = restaurant.menu.categories.flatMap(
      (category) => category.items
    );
    const totalItems = menuItems.length;
    const totalPrice = menuItems.reduce((total, item) => total + item.price, 0);
    const priceAverage = totalPrice / totalItems;

    restaurant.price_average = priceAverage.toFixed(2); // Update price_average field

    await restaurant.save(); // Save the updated restaurant
  } catch (error) {
    // Handle the error
    console.error(error);
  }
};

const handleadditem = asyncHandler(async function (req, res, next) {
  if (!req.query || !req.body) {
    res.status(500).send("no id sent");
    console.log("no id");
    return;
  }

  console.log("id resto: " + req.query.id);
  console.log("new item");
  const restoId = req.query.id;
  console.log(req.body.category);

  const newItem = {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
  };
  console.log(req.body.category);

  try {
    const update = await Resto.findByIdAndUpdate(
      restoId,
      { $push: { "menu.categories.$[category].items": newItem } },
      { new: true, arrayFilters: [{ "category._id": req.body.category }] }
    );

    await calculateAndUpdatePriceAverage(restoId);
    console.log(res.price_average);
    res.json("ok");
  } catch (error) {
    res.status(500).send(error);
  }
});

const handleRemoveItem = asyncHandler(async function (req, res, next) {
  const { id, itemId } = req.query;

  try {
    const update = await Resto.findByIdAndUpdate(
      id,
      { $pull: { "menu.items": { _id: itemId } } },
      { new: true }
    );
    res.json(update);
  } catch (error) {
    res.status(500).send(error);
  }
});

const deleteitems = async (req, res) => {
  try {
    const { itemIds } = req.body; // Array of item IDs to delete

    // Delete the items using the itemIds
    const result = await Resto.updateMany(
      { "menu.categories.items._id": { $in: itemIds } },
      { $pull: { "menu.categories.$[].items": { _id: { $in: itemIds } } } },
      { multi: true }
    );

    // Check the result to determine if the items were deleted successfully
    if (result.nModified > 0) {
      res.status(200).json({ message: "Items deleted successfully" });
    } else {
      res.status(404).json({ message: "Items not found or already deleted" });
    }
  } catch (error) {
    console.error("Error deleting items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  deleteitems,
  addmenuitem,
  handleaddmenu,
  handleaddcategory,
  handlereadcategory,
  deleteCategory,
  handleadditem,
  handleRemoveItem,
};
