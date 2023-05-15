const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  image: { type: String },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: {
    type: String,
    required: true,
  },
});

const RestoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: "default.png",
  },
  address: { type: String },
  owner: {
    type: mongoose.SchemaTypes.ObjectID,
    ref: "User",
  },
  menu: {
    name: { type: String },
    categories: [{ name: { type: String }, items: [itemSchema] }],
  },

  description: {
    type: String,
  },
  photos: [{ type: String }],
  cuisines: [{ type: String }],

  phone: { type: String },
  rating: {
    type: Number,
  },

  price_average: { type: String },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  reservations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reserve" }],
});

const Resto = mongoose.model("Resto", RestoSchema);

module.exports = Resto;
