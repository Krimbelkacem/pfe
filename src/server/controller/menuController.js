const User = require("../db/Schema/User");
const { Resto, Category } = require("../db/Schema/Restaurant");
const session = require("express-session");
const generateToken = require("../config/generateToken");
const asyncHandler = require("express-async-handler");

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

const handleaddcategory = asyncHandler(async function (req, res, next) {
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
  */
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
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = {
  addmenuitem,
  handleaddmenu,
  handleaddcategory,
  handlereadcategory,
  handleadditem,
};
