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
