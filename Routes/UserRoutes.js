const express = require("express");
const upload = require("../Middlewares/multer");

const {
  requestAccount,
  verifyOTP,
  signUp,
  login,
  editProfile,
  addContacts,
  getAllFriends,
  // logout,
  verifyOTPLogin,
  friends,
} = require("../Controllar/UserControllar");
const auth = require("../Middlewares/auth");
const Router = express.Router();

// //Routes
Router.post("/request-account", requestAccount);
Router.post("/verify-OTP", verifyOTP);
Router.post("/sign-up", signUp);
Router.post("/edit-profile", upload.single("image"), auth, editProfile);
// Router.post("/logout", auth, logout);
Router.post("/user/login", login);
Router.post("/verify-otp-login", verifyOTPLogin);
Router.get("/users/friends/:id", auth, friends);
Router.get("/users/friends", auth, getAllFriends);
Router.post("/users/add-contacts", auth, addContacts);

module.exports = Router;
