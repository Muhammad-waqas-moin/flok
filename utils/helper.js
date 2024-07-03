const User = require("../Model/UserSchema");

exports.checkUserExists = async (email, phoneNumber) => {
  try {
    const isUser = await User.findOne({
      $or: [{ email: email }, { phoneNumber: phoneNumber }],
    });
    if (isUser) {
      // console.log("isUser====>", isUser);
      return true;
    }
    // console.log("isUser====>", isUser);
    return false;
  } catch (err) {
    throw err;
  }
};

// update user location
exports.updateLocation = async (userId, latitude, longitude) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { latitude: latitude, longitude: longitude } },
      { new: true }
    );
    if (!updatedUser) {
      throw new Error("User not found or could not update location");
    }
    console.log(`User location updated: ${updatedUser}`);
    return updatedUser;
  } catch (err) {
    console.error("Error updating user location:", error.message);
    throw err;
  }
};
