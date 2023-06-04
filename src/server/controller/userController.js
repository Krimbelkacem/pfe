const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../db/Schema/User");
const Resto = require("../db/Schema/Restaurant");
const Reserve = require("../db/Schema/Reservation");
const session = require("express-session");
const { generateToken, decodeToken } = require("../config/generateToken");
const asyncHandler = require("express-async-handler");

const { google } = require("googleapis");
const nodemailer = require("nodemailer");

// Create a OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  "892646659673-n1js42ik7h7h1hne8a0psth1nj4r684l.apps.googleusercontent.com",
  "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",
  "http://localhost:5000/red"
);

// Set the refresh token (generated using the OAuth 2.0 Playground or other methods)
oAuth2Client.setCredentials({
  refresh_token: "YOUR_REFRESH_TOKEN",
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: "YOUR_EMAIL_ADDRESS",
    clientId:
      "892646659673-n1js42ik7h7h1hne8a0psth1nj4r684l.apps.googleusercontent.com",
    clientSecret: "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",
    refreshToken: "YOUR_REFRESH_TOKEN",
    accessToken: oAuth2Client.getAccessToken(),
  },
});

const handleNewUser = async (req, res) => {
  const name = req.body.name;
  const passe = req.body.passe;
  const email = req.body.email;
  const file = req.file;
  console.log(email);

  if (!passe || !email)
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  /*
  const duplicate = await User.findOne({ email: email }).exec();
  if (duplicate) return res.sendStatus(409);
*/
  try {
    const verificationToken = generateToken();

    let result;

    if (file) {
      result = await User.create({
        username: name,
        password: passe,
        email: email,
        picture: file.filename,
        verificationToken: verificationToken,
      });
    } else {
      result = await User.create({
        username: name,
        password: passe,
        email: email,
        verificationToken: verificationToken,
      });
    }
    console.log("User created");

    res.status(201).json({ success: `New user ${name} created!` });
    const verificationLink = generateVerificationLink(verificationToken);

    console.log("Sending verification email...");

    await sendVerificationEmail(email, passe, verificationLink);

    console.log("Verification email sent");
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: err.message });
  }
};

const sendVerificationEmail = async (email, password, verificationLink) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "elmida605@gmail.com",
      pass: "elmidakhlifa",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: "elmida605@gmail.com",
    to: email,
    subject: "Email Verification",
    text: `Welcome to our platform!\n\nPlease click the following link to verify your email: ${verificationLink}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const generateVerificationLink = (verificationToken) => {
  return `https://example.com/verify?token=${verificationToken}`;
};

///////////////////////////////////////////////////////

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
  console.log("auth user          000000000000000000000");
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
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérification du mot de passe actuel
    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Mot de passe actuel incorrect" });
    }

    // Mise à jour du mot de passe de l'utilisateur
    user.password = newPassword;
    await user.save();

    res.json({ message: "Mot de passe mis à jour avec succès" });
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
