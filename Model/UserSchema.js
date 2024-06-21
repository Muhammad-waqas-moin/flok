const mongoose = require("mongoose");
const UserSchema = mongoose.Schema({
  fullname: {
    type: String,
    required: [true, "Fullname is required"],
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
  profileImage: {
    type: String,
    required: false,
    default: "", // Initially empty
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference the same User model
    },
  ],
  contacts: [
    {
      type: String,
      required: true,
    },
  ],
  otp: { type: String, required: false },
  token: { type: String, required: false },
});

module.exports = mongoose.model("User", UserSchema);

///////////////////////////////////////////////////
