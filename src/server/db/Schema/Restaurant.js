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

  cuisines: [
    {
      image: { type: String },
      name: { type: String },
    },
  ],

  phone: { type: String },

  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  price_average: { type: Number, default: 0.0 },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  reservations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reserve" }],
  openingHours: { type: String },
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      comment: String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Resto = mongoose.model("Resto", RestoSchema);

module.exports = Resto;
