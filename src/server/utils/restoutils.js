const { default: mongoose } = require("mongoose");

const User = require("../db/Schema/User");
const { Resto, Category } = require("../db/Schema/Restaurant");
const session = require("express-session");
const generateToken = require("../config/generateToken");
const asyncHandler = require("express-async-handler");

const addcategory = async (id) => {};
const findcategory = async (name) => {
  return await Category.findOne({ name }, (err, category) => {
    if (err) {
      console.error(err);
      return;
    }
  });
};

const additem = async (id) => {};
const finditem = async (id) => {};

export default [addcategory, findcategory, additem, finditem];
