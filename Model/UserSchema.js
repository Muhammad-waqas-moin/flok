const mongoose = require("mongoose");
const UserSchema = mongoose.Schema({
  fullname: {
    type: String,
    // required: [true, "Fullname is required"],
  },
  phoneNumber: {
    type: String,
    required: [true, "Please enter a valid phone number"],
    unique: true,
  },
  // password: {
  //   type: String,
  //   required: [true, "Password is required"],
  //   minLength: [6, "password must be at least 6 characters"],
  // },
  profile: {
    type: String,
    required: false,
    default: "", // Initially empty
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  contacts: [
    {
      type: String,
      required: true,
    },
  ],
  otp: { type: String, required: false },
  location: {
    latitude: { type: Number },
    longitude: {
      type: Number,
    },
    lastUpdated: { type: Date, default: Date.now },
  },
  pokedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  hasPoked: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  sentFriendRequests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  receivedFriendRequests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("User", UserSchema);

///////////////////////////////////////////////////
