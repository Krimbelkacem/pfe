const { default: mongoose } = require("mongoose");

const User = require("../db/Schema/User");
const Resto = require("../db/Schema/Restaurant");
const session = require("express-session");
const generateToken = require("../config/generateToken");
const asyncHandler = require("express-async-handler");

const handleSearch = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword;
  try {
    ////////////////////////////////////////////////
    Resto.find(
      {
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { address: { $regex: keyword, $options: "i" } },
          { "menu.name": { $regex: keyword, $options: "i" } },
          { "menu.categories.name": { $regex: keyword, $options: "i" } },
          { "menu.categories.items.name": { $regex: keyword, $options: "i" } },
          {
            "menu.categories.items.description": {
              $regex: keyword,
              $options: "i",
            },
          },
          { description: { $regex: keyword, $options: "i" } },

          { "cuisines.name": { $regex: keyword, $options: "i" } },
        ],
      },
      "_id name menu avatar cuisines  price_average address",
      (err, results) => {
        // Filtrer les résultats par type
        const restoResults = results.filter(
          (result) =>
            result.name.toLowerCase().includes(keyword.toLowerCase()) ||
            result.address.toLowerCase().includes(keyword.toLowerCase()) ||
            result.description.toLowerCase().includes(keyword.toLowerCase())
        );

        const lowPriceResto = [];
        const mediumPriceResto = [];
        const highPriceResto = [];

        restoResults.forEach((result) => {
          if (result.price_average >= 0 && result.price_average <= 100) {
            lowPriceResto.push(result);
          } else if (
            result.price_average > 100 &&
            result.price_average <= 1000
          ) {
            mediumPriceResto.push(result);
          } else if (result.price_average > 1000) {
            highPriceResto.push(result);
          }
        });
        /*
        const categoryResults = results.reduce((categories, result) => {
          const matchingCategories = result.menu.categories.filter((category) =>
            category.name.toLowerCase().includes(keyword.toLowerCase())
          );
          return categories.concat(
            matchingCategories.map((category) => category.name)
          );
        }, []);*/

        const categoryResults = results.reduce((categories, result) => {
          const matchingCategories = result.menu.categories.filter((category) =>
            category.name.toLowerCase().includes(keyword.toLowerCase())
          );
          const categoriesWithRestoInfo = matchingCategories.map(
            (category) => ({
              categoryId: category._id,
              name: category.name,
              restaurantId: result._id,
              restoAvatar: result.avatar,
              restoName: result.name,
              items: category.items,
            })
          );
          return categories.concat(categoriesWithRestoInfo);
        }, []);

        const itemResults = results.reduce((items, result) => {
          const matchingItems = result.menu.categories.reduce(
            (items, category) => {
              const matchingCategoryItems = category.items.filter((item) =>
                item.name.toLowerCase().includes(keyword.toLowerCase())
              );
              return items.concat(
                matchingCategoryItems.map((item) => ({
                  itemId: item._id,
                  itemImage: item.image,
                  itemPrice: item.price,
                  itemDescription: item.description,
                  itemName: item.name,
                  restaurantId: result._id,
                  restoAvatar: result.avatar,
                  restoName: result.name,
                }))
              );
            },
            []
          );
          return items.concat(matchingItems);
        }, []);

        /* const itemResults = results.reduce((items, result) => {
        const matchingItems = result.menu.categories.reduce(
          (items, category) => {
            const matchingCategoryItems = category.items.filter((item) =>
              item.name.toLowerCase().includes(keyword.toLowerCase())
            );
            return items.concat(matchingCategoryItems);
          },
          []
        );
        return items.concat(matchingItems);
      }, []);*/
        console.log(results);

        const cuisineResults = results.reduce((cuisines, result) => {
          const matchingCuisines = result.cuisines.filter((cuisine) =>
            cuisine.name.toLowerCase().includes(keyword.toLowerCase())
          );
          return cuisines.concat(
            matchingCuisines.map((cuisine) => ({
              cuisineImage: cuisine.image,
              cuisineName: cuisine.name,
              restaurantId: result._id,
              restoAvatar: result.avatar,
              restoName: result.name,
            }))
          );
        }, []);

        console.log(itemResults);
        console.log(categoryResults);
        console.log(cuisineResults);
        res.send({
          itemResults: itemResults,
          restoResults: restoResults,
          categoryResults: categoryResults,
          cuisineResults: cuisineResults,

          lowPriceResto: lowPriceResto,
          mediumPriceResto: mediumPriceResto,
          highPriceResto: highPriceResto,
        });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
  // Vérifier le type de résultats correspondants
  /* if (restoResults.length > 0) {
          res.send(restoResults);
        } else if (categoryResults.length > 0) {
          res.send(categoryResults[0].menu.categories);
        } else if (itemResults.length > 0) {
          res.send(
            itemResults[0].menu.categories.flatMap((category) =>
              category.items.filter((item) =>
                item.name.toLowerCase().includes(keyword.toLowerCase())
              )
            )
          );
        } else {
          res.send([]);
        }*/
});
module.exports = handleSearch;
