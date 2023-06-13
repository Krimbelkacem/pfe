const { default: mongoose } = require("mongoose");

const User = require("../db/Schema/User");
const Resto = require("../db/Schema/Restaurant");
const session = require("express-session");
const generateToken = require("../config/generateToken");
const asyncHandler = require("express-async-handler");

// Méthode du contrôleur pour récupérer les restaurants en fonction de l'utilisateur
const homeLogique = async (req, res) => {
  try {
    const userId = req.query.iduser; // Récupérer l'ID de l'utilisateur connecté depuis la requête

    if (!userId) {
      // Si l'utilisateur n'est pas connecté
      const randomRestaurants = await Resto.aggregate([
        { $sample: { size: 5 } },
      ]);
      return res.json(randomRestaurants);
    }

    const user = await User.findById(userId).populate("followings"); // Récupérer les informations de l'utilisateur connecté et ses restaurants abonnés

    let restaurants = [];

    if (user.followings.length < 5) {
      // Si l'utilisateur est abonné à moins de 5 restaurants
      restaurants = user.followings; // Récupérer les restaurants auxquels l'utilisateur est abonné

      // Compléter la liste jusqu'à 5 restaurants aléatoires
      const remainingRestaurantsCount = 5 - user.followings.length;
      const additionalRestaurants = await Resto.aggregate([
        { $match: { _id: { $nin: user.followings } } }, // Exclure les restaurants auxquels l'utilisateur est déjà abonné
        { $sample: { size: remainingRestaurantsCount } }, // Récupérer les restaurants aléatoires restants
      ]);

      restaurants = restaurants.concat(additionalRestaurants);
    } else {
      // Si l'utilisateur est abonné à 5 restaurants ou plus, récupérer uniquement 5 restaurants parmi ceux auxquels il est abonné
      const randomIndexes = getRandomIndexes(user.followings.length, 5); // Obtenir 5 index aléatoires
      restaurants = randomIndexes.map((index) => user.followings[index]); // Récupérer les restaurants correspondants aux index aléatoires
    }
    console.log("la récupération des restaurants.", restaurants.length);
    res.json(restaurants);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la récupération des restaurants.",
    });
  }
};

// Fonction pour obtenir des index aléatoires
function getRandomIndexes(length, count) {
  const indexes = [];

  while (indexes.length < count) {
    const randomIndex = Math.floor(Math.random() * length);

    if (!indexes.includes(randomIndex)) {
      indexes.push(randomIndex);
    }
  }

  return indexes;
}
module.exports = homeLogique;
