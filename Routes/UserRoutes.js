const express = require("express");
const upload = require("../Middlewares/multer");

const {
  requestAccount,
  verifyOTP,
  signUp,
  login,
  editProfile,
  // friends,
  addContacts,
  getAllFriends,
} = require("../Controllar/UserControllar");
const auth = require("../Middlewares/auth");
const Router = express.Router();

// //Routes
Router.post("/request-account", requestAccount);
Router.post("/verify-OTP", verifyOTP);
Router.post("/sign-up", signUp);
Router.post("/edit-profile", upload.single("image"), auth, editProfile);
// Router.get("/users/:id/friends", auth, friends);
Router.get("/users/friends", auth, getAllFriends);
Router.post("/users/add-contacts", auth, addContacts);
// Router.put("/users/:id/add-friend", auth, addFrinds);
// Router.post("/login", login);
// Router.get("/users", auth, getAllUsers);
// Router.post("/login", login);
// Router.delete("/users/:id", auth, deleteUser);
// Router.get("/users/:id", auth, getSingleUser);
// Router.post("/users/changePassword", auth, changePassword);
// Router.post("/users/forgot-password", forgetPassword);
// Router.post("/verify-otp-forgotPassword", verfiyOTPForgetPass);
// Router.post("/reset-password", resetPassword);
module.exports = Router;
