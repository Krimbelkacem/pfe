const { default: mongoose } = require("mongoose");

const User = require("../db/Schema/User");
const Resto = require("../db/Schema/Restaurant");
const session = require("express-session");
const generateToken = require("../config/generateToken");
const asyncHandler = require("express-async-handler");

const handleSearch = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword;

  // Recherche des restaurants, items et catégories qui correspondent à la requête de recherche
  Resto.find(
    {
      $or: [
        { name: { $regex: keyword, $options: "i" } }, // Recherche de restaurants
        { "menu.categories.name": { $regex: keyword, $options: "i" } }, // Recherche de catégories
        {
          "menu.categories.items.name": { $regex: keyword, $options: "i" },
        }, // Recherche d'items
      ],
    },
    "_id name menu avatar",
    (err, results) => {
      // Filtrer les résultats par type
      const restoResults = results.filter((result) =>
        result.name.toLowerCase().includes(keyword.toLowerCase())
      );

      const categoryResults = results.reduce((categories, result) => {
        const matchingCategories = result.menu.categories.filter((category) =>
          category.name.toLowerCase().includes(keyword.toLowerCase())
        );
        return categories.concat(
          matchingCategories.map((category) => category.name)
        );
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
      console.log(itemResults);
      console.log(categoryResults);
      res.send({
        itemResults: itemResults,
        restoResults: restoResults,
        categoryResults: categoryResults,
      });
    }
  );

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