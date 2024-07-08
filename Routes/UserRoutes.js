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
  getFriend,
  verifyOTPLogin,
  // friends,
  updateUserProfileImage,
} = require("../Controllar/UserControllar");
const auth = require("../Middlewares/auth");
const Router = express.Router();

// //Routes
Router.post("/request-account", requestAccount);
Router.post("/verify-OTP", verifyOTP);
Router.post("/sign-up", signUp);
Router.put("/edit-profile", auth, editProfile);
// Router.post("/logout", auth, logout);
Router.post("/user/login", login);
Router.post("/verify-otp-login", verifyOTPLogin);
Router.get("/users/friends/:id", auth, getFriend);
Router.get("/users/friends", auth, getAllFriends);
Router.post("/users/add-contacts", auth, addContacts);
Router.put(
  "/update-profile-image",
  auth,
  upload.single("image"),
  updateUserProfileImage
);

module.exports = Router;
