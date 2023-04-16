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
    const cat = new Category({ name: catname });
    console.log(cat);
    await cat.save();
    console.log("ok");
    try {
      const savecat = cat;
      console.log("22");
      if (savecat) {
        const update = await Resto.findByIdAndUpdate(
          restoId,
          { $push: { "menu.categories": cat } },
          { new: true }
        );
      }

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
  const newItem = {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
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
  handleaddmenu,
  handleaddcategory,
  handlereadcategory,
  handleadditem,
};
