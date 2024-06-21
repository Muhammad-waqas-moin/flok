const express = require("express");
const auth = require("../Middlewares/auth");
const {
  friendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
} = require("../Controllar/FriendsRequestControllar");
const Router = express.Router();
Router.post("/friend-request", auth, friendRequest);
Router.post("/accept-friend-request", auth, acceptFriendRequest);
Router.post("/reject-friend-request", auth, rejectFriendRequest);
module.exports = Router;
