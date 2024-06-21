// const OTP = require("../Model/OTPSchema");
// const User = require("../Model/UserSchema");

// exports.verifyOtp = async (req, res) => {
//   try {
//     console.log("hitting verify OTP route");
//     const { email, newPassword } = req.body;
//     console.log(
//       "email: " + email + " otp: " + otp + " new password: " + newPassword
//     );
//     return res.send("verify otp");
//   } catch (err) {
//     return res.status(500).json({
//       status: "failed",
//       message: err.message,
//     });
//   }
// };
