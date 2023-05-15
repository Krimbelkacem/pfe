const { default: mongoose } = require("mongoose");

const Resto = require("../db/Schema/Restaurant");
const User = require("../db/Schema/User");
const Reserve = require("../db/Schema/Reservation");
const asyncHandler = require("express-async-handler");

const newReservation = asyncHandler(async (req, res) => {
  console.log(req.body.hours);
  console.log(req.query.userId);
  console.log(req.body.dateR);
  console.log(req.body.guests);
  console.log(req.query.restoId);
  const userId = req.query.userId;
  const restoId = req.query.restoId;
  try {
    // Create a new reservation document
    const reserve = await Reserve.create({
      date: req.body.dateR,
      time: req.body.hours + "heure" + req.body.minutes + "min",
      guests: req.body.guests,
      user: req.query.userId,
      Resto: req.query.restoId,
    });

    // Add the reservation to the user's reservations array
    const user = await User.findByIdAndUpdate(userId, {
      $addToSet: { reservations: reserve._id },
    });

    // Add the reservation to the restaurant's reservations array
    const resto = await Resto.findByIdAndUpdate(restoId, {
      $addToSet: { reservations: reserve._id },
    });

    // Return the newly created reservation document
    res.status(201).json(reserve);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

const getRestoReservation = asyncHandler(async (req, res) => {
  const restoId = req.query.restoId;

  console.log(restoId);
  try {
    // Verify the token
    const decodedToken = decodeToken(token);
    console.log(decodedToken);

    // Find the user with the decoded ID
    const Reservation = await Reserve.find()
      .populate("Restos")
      .populate("followings")
      .populate("reservations")
      .exec();

    // If the user doesn't exist, return an error
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    console.log(user.reservations.time);
    // Return the user object as a response
    res.json(user);
    console.log(user);
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Unauthorized" });
  }
});

const removeReservation = asyncHandler(async (req, res) => {
  const { id } = req.query;

  try {
    // Find the reservation document by ID and remove it
    const reservation = await Reserve.findByIdAndRemove(id);

    // Remove the reservation from the user's reservations array
    const user = await User.findByIdAndUpdate(reservation.user, {
      $pull: { reservations: id },
    });

    // Remove the reservation from the restaurant's reservations array
    const resto = await Resto.findByIdAndUpdate(reservation.resto, {
      $pull: { reservations: id },
    });

    // Return a success message
    res.status(200).json({ message: "Reservation deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Define a new endpoint to handle accepting a reservation
const acceptReservation = asyncHandler(async (req, res) => {
  try {
    // Find the reservation document by ID
    const reservation = await Reserve.findById(req.query.id);

    // Update the reservation state to "accepted"
    reservation.state = "accepted";
    await reservation.save();

    // Return the updated reservation document as a response
    res.json(reservation);
  } catch (error) {
    // Handle errors by returning an error response with the error message
    res.status(500).json({ message: error.message });
  }
});
const rejectReservation = asyncHandler(async (req, res) => {
  try {
    // Find the reservation document by ID
    const reservation = await Reserve.findById(req.query.id);

    // Update the reservation state to "accepted"
    reservation.state = "rejected";
    await reservation.save();

    // Return the updated reservation document as a response
    res.json(reservation);
  } catch (error) {
    // Handle errors by returning an error response with the error message
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  rejectReservation,
  newReservation,
  removeReservation,
  acceptReservation,
};
