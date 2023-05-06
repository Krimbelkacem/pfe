const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: {
    type: String,
    required: true,
  },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
});

const RestoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: "src/server/uploads/default.png",
  },
  address: { type: String, required: true },
  owner: {
    type: mongoose.SchemaTypes.ObjectID,
    ref: "User",
  },
  menu: {
    name: { type: String },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    items: [itemSchema],
  },

  description: {
    type: String,
    required: true,
  },
  photos: [{ type: String }],
  cuisines: [{ type: String }],

  phone: { type: String },
  rating: {
    type: Number,
  },

  price_average: { type: String },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

//const Item = mongoose.model("Item", itemSchema);
const Resto = mongoose.model("Resto", RestoSchema);

const Category = mongoose.model("Category", categorySchema);

module.exports = { Resto, Category };
