const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../db/Schema/User");
const Resto = require("../db/Schema/Restaurant");
const Reserve = require("../db/Schema/Reservation");
const session = require("express-session");
const { generateToken, decodeToken } = require("../config/generateToken");
const asyncHandler = require("express-async-handler");

const handleNewUser = async (req, res) => {
  const name = req.body.name;
  const passe = req.body.passe;
  const email = req.body.email;
  const file = req.file;
  console.log(email);

  if (!passe || !email)
    return res
      .status(400)
      .json({ message: "Username and password are required." }); //si sont vide

  // check for duplicate usernames in the db
  const duplicate = await User.findOne({ email: email }).exec(); // trouver exactement username
  if (duplicate) return res.sendStatus(409); //Conflict

  try {
    //create and store the new user
    if (file) {
      const result = await User.create({
        username: name,
        password: passe,
        email: email,
        picture: file.filename,
      });
    } else {
      const result = await User.create({
        username: name,
        password: passe,
        email: email,
      });
    }
    console.log("user created");

    res.status(201).json({ success: `New user ${name} created!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

async function authAdmin(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  console.log(email);
  if (!password || !email)
    res.status(400).json({ message: "Username and password are required." });
  const user = await User.findOne({ email });
  if (user && user.isAdmin && (await user.matchPassword(password))) {
    const token = generateToken(user._id);
    const idU = user._id;
    console.log("ok");
    res.json({ token, idU });
  } else {
    res.status(403).json({ message: "Access denied." });
  }
}
const authUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log("auth user");
  if (!password || !email)
    res.status(400).json({ message: "Username and password are required." });
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(user._id);
    const idU = user._id;
    console.log("ok");
    res.json({ token, idU });
  } else {
    res.status(400).json("Invalid Email or Password");
    throw new Error("Invalid Email or Password");
  }
});
const handlegetuser = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  console.log(req.headers.authorization);
  try {
    // Verify the token
    const decodedToken = decodeToken(token);
    console.log(decodedToken);

    // Find the user with the decoded ID
    const user = await User.findById(decodedToken.id)
      .populate("Restos")
      .populate("followings")
      .populate({
        path: "reservations",
        populate: {
          path: "Resto",
          select: "name avatar",
        },
      })
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
const handleupdateuser = asyncHandler(async (req, res) => {
  /* try {
    const { name, email } = req.body;
    console.log(name);
    console.log(req.query.id);
    const user = await User.findById(req.query.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.username = name || user.name;
    user.email = email || user.email;

    await user.save();
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }*/

  const { email, name } = req.body;
  const password = req.body.password;

  console.log("id:" + req.query.id);
  const userId = req.query.id;
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { username: name, email: email },
      { new: true }
    );

    console.log(`User ${userId} updated successfully: ${updatedUser}`);
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.error(`Error updating user ${userId}: ${err}`);
  }
});

const handledeleteteuser = asyncHandler(async (req, res) => {
  console.log("id:" + req.query.id);
  const userId = req.query.id;
  try {
    const deleteUser = await User.findOneAndDelete({ _id: userId });
    Resto.deleteMany({ _id: { $in: deleteUser.Restos } }, (err, result) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`Deleted ${result.deletedCount} documents`);
      }
    });

    console.log(`User ${userId} delete successfully: ${deleteUser}`);
    res.json({ message: "Profile delete successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.error(`Error updating user ${userId}: ${err}`);
  }
});

const getAllUsers = async (req, res) => {
  console.log("admin users");
 // const users = await User.find().select();

 



  const users = await User.find({ isAdmin: { $ne: true } });
  res.status(200).json(users);
};



//controller update password
const putPasswordUser = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // Recherche de l'utilisateur par ID
    const user = await User.findById(req.query.id);
      
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérification du mot de passe actuel
    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
    }

  

    // Mise à jour du mot de passe de l'utilisateur
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }  

};



module.exports = {
  handleNewUser,
  authUser,
  handlegetuser,
  handleupdateuser,
  handledeleteteuser,
  authAdmin,
  getAllUsers,
  putPasswordUser,
};
