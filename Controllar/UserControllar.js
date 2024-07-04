const User = require("../Model/UserSchema");
const OTPSchema = require("../Model/OTPSchema");
const randomstring = require("randomstring");
const twilio = require("twilio");
const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
const upload = require("../Middlewares/multer");
// const { accountSid, authToken, fromPhone } = require("../Config/twilio");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;
const client = require("twilio")(accountSid, authToken);

// generate OTP
const GenerateOTP = () => {
  const newOtp = randomstring.generate({
    length: 4,
    charset: "numeric",
  });
  return newOtp;
};

// request account
exports.requestAccount = async (req, res) => {
  try {
    console.log("request account hits");
    const { phoneNumber } = req.body;
    // Format the phone number for Twilio
    if (!phoneNumber.startsWith("+")) {
      phoneNumber = `+92${phoneNumber.slice(1)}`;
    }

    console.log("phone number", phoneNumber);
    const user = await User.findOne({ phoneNumber });
    console.log("user ====>", user);
    if (user) {
      return res
        .status(400)
        .json({ message: "User with this number already exists" });
    }
    const otpExists = await OTPSchema.findOne({ identity: phoneNumber });
    console.log("exists otp ======>", otpExists);
    if (otpExists) {
      await OTPSchema.findByIdAndDelete(otpExists._id);
    }
    const otp = GenerateOTP();
    const newOTP = new OTPSchema({
      identity: phoneNumber,
      otp: otp,
    });
    console.log("newOTP====>", newOTP);
    await newOTP.save();

    //  twilio confgeration,
    // const { accountSid, authToken, fromPhone } = require("../Config/twilio");
    // const client = new twilio(accountSid, authToken);

    // await client.messages.create({
    //   body: `Your OTP is ${newOTP.otp}`,
    //   from: fromPhone,
    //   to: phoneNumber,
    // });

    return res.status(200).json({
      status: "success",
      message: "OTP has been sent to this phone successfully",
      otp: newOTP.otp,
    });
  } catch (err) {
    console.log("error====>", err);
    res.status(500).json({ message: err.message });
  }
};

//verfy OTP and Create Account
exports.verifyOTP = async (req, res) => {
  console.log("verifyOTP route hits");
  try {
    const { otp, phoneNumber } = req.body;
    const otpExists = await OTPSchema.findOne({ otp });
    console.log("otp exists =============>", otpExists);
    if (!otpExists) {
      return res.status(404).json({
        success: false,
        message: "Invalid otp code",
      });
    }
    const isUserRegistered = await User.findOne({
      phoneNumber: otpExists.identity,
    });
    console.log("user ===============>", isUserRegistered);
    if (isUserRegistered) {
      return res.status(404).json({
        status: "failed",
        message: "User already registered with this phone number",
      });
    }
    await OTPSchema.findByIdAndDelete(otpExists._id);
    return res.status(201).json({
      status: "success",
      message: "OTP veirfied ",
    });
    // const user = await User
  } catch (err) {
    console.log("error====>", err);
    return res.status(500).json({
      status: "failed",
      message: err,
    });
  }
};

// signUp
exports.signUp = async (req, res) => {
  try {
    const { fullname, phoneNumber } = req.body;
    const isUserRegistered = await User.findOne({
      phoneNumber: phoneNumber,
    });
    console.log("user ===============>", isUserRegistered);
    if (isUserRegistered) {
      return res.status(404).json({
        status: "failed",
        message: "User already registered with this phone number",
      });
    }
    // const hashPassword = await bcrypt.hash(password, 10);
    // console.log("hashPassword: ", hashPassword);
    // const newUser = await User.create({ ...req.body, password: hashPassword });
    const newUser = await User.create(req.body);
    await newUser.save();
    console.log("new user =========================>", newUser);
    // // create jwt token
    // const token = jwt.sign(
    //   { id: newUser._id, phoneNumber: newUser.phoneNumber },
    //   process.env.SCRATEKEY,
    //   {
    //     expiresIn: "365d",
    //   }
    // );

    return res.status(200).json({
      status: "success",
      message: "created successfully",
      data: {
        user: newUser,
        // token: token,
      },
    });
  } catch (err) {
    console.log("error====>", err);
    return res.status(500).json({
      status: "failed",
      message: err,
    });
  }
};

//louput
// exports.logout = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const user = await User.findById(userId);
//     if (!user) {
//       return res
//         .status(404)
//         .json({ status: "failed", message: "User not found" });
//     }
//     user.token = null;
//     await user.save();
//     return res
//       .status(200)
//       .json({ status: "success", message: "User logged out successfully" });
//   } catch (err) {
//     return res.status(500).json({ status: "failed", message: err.message });
//   }
// };

// //login user
exports.login = async (req, res) => {
  try {
    console.log("login route hit", req);
    const { phoneNumber } = req.body;
    console.log("phoneNumber: " + phoneNumber);
    const user = await User.findOne({ phoneNumber: phoneNumber });
    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }
    console.log("user ========>", user);
    const otpExists = await OTPSchema.findOne({ identity: phoneNumber });
    console.log("exists otp ======>", otpExists);
    if (otpExists) {
      await OTPSchema.findByIdAndDelete(otpExists._id);
    }
    const otp = GenerateOTP();
    const newOTP = new OTPSchema({
      identity: phoneNumber,
      otp: otp,
    });
    console.log("newOTP====>", newOTP);
    await newOTP.save();

    // //  twilio confgeration,
    // const { accountSid, authToken, fromPhone } = require("../Config/twilio");
    // const client = new twilio(accountSid, authToken);
    // await client.messages.create({
    //   body: `Your OTP is ${newOTP.otp}`,
    //   from: fromPhone,
    //   to: phoneNumber,
    // });
    return res.status(200).json({
      status: "success",
      message: `OTP has been sent to this phone number ${phoneNumber} successfully`,
      otp: newOTP.otp,
    });
    // const token = jwt.sign(
    //   { id: user._id, phoneNumber: user.phoneNumber },
    //   process.env.SCRATEKEY,
    //   {
    //     expiresIn: "2h",
    //   }
    // );
    // return res.status(200).json({
    //   status: "success",
    //   message: "login successfully",
    //   data: {
    //     user: user,
    //     // token: token,
    //   },
    // });
  } catch (err) {
    console.log("error", err);
    return res.status(500).json({
      status: "failed",
      message: err,
    });
  }
};

//OTP verification for login
exports.verifyOTPLogin = async (req, res) => {
  console.log("verifyOTP route hits");
  try {
    const { otp, phoneNumber, latitude, longitude } = req.body;
    const otpExists = await OTPSchema.findOne({ otp });
    console.log("otp exists =============>", otpExists);
    if (!otpExists) {
      return res.status(404).json({
        success: false,
        message: "Invalid otp code",
      });
    }
    const user = await User.findOne({
      phoneNumber: otpExists.identity,
    });
    console.log("user ===============>", user);
    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not registered with this phone number",
      });
    }
    //loaction
    user.location = {
      latitude: latitude,
      longitude: longitude,
      lastUpdated: Date.now(),
    };
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.SCRATEKEY, {
      expiresIn: "2h",
    });
    console.log("token ===============>", token);
    await OTPSchema.findByIdAndDelete(otpExists._id);
    return res.status(201).json({
      status: "success",
      message: "OTP veirfied ",
      token: token,
      user: user,
    });
  } catch (err) {
    console.log("error====>", err);
    return res.status(500).json({
      status: "failed",
      message: err,
    });
  }
};

//editProfile
exports.editProfile = async (req, res) => {
  console.log("this route hits?");
  try {
    const userID = req.user.id;
    const { fullname, phoneNumber } = req.body;
    const profileImage = req.file ? req.file.filename : undefined;
    const updateData = {};
    if (fullname) updateData.fullname = fullname;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (profileImage) updateData.profileImage = profileImage;
    const updatedUser = await User.findByIdAndUpdate(userID, updateData, {
      new: true,
    });
    console.log("Updated User:", updatedUser);
    return res.status(200).json({
      status: "success",
      data: updatedUser,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "failed",
      message: err.message,
    });
  }
};

// add contact
exports.addContacts = async (req, res) => {
  try {
    const { contacts } = req.body;
    console.log("contacts========>", contacts);
    console.log("user ====>", req.user);
    const user = await User.findOne({ _id: req.user.id });
    console.log("user ===>", user);
    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }
    user.contacts = [];
    user.contacts.push(...contacts);
    await user.save();
    return res.status(200).json({
      status: "success",
      message: "Contacts added successfully",
      data: {
        user,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "failed",
      message: err.message,
    });
  }
};

//get All friends on flok
exports.getAllFriends = async (req, res) => {
  try {
    console.log("user ========>", req.user.id);
    const user = await User.findOne({ _id: req.user.id });
    console.log("user ===>", user);
    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }
    const contacts = user.contacts;
    const friends = await User.find({ phoneNumber: { $in: contacts } });
    console.log("frinds in flok ==============>", friends);
    return res.status(200).json({
      status: "success",
      message: "get all friends successfully",
      data: {
        friends: friends,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: "failed",
      message: err.message,
    });
  }
};

// //friends
exports.friends = async (req, res) => {
  try {
    console.log("user login =====>", req.user);
    const userId = req.params.id;
    console.log("id jo param se aa tahi hai ", req.params.id);
    console.log("login user id ========>", req.user);
    if (req.user.id !== userId) {
      return res.status(403).json({
        status: "failed",
        message: "You do not have permission to access this resource",
      });
    }

    const user = await User.findById(userId).populate("friends");
    if (!user) {
      return res
        .status(404)
        .json({ status: "failed", message: "User not found" });
    }
    const friends = user.friends;
    return res.status(200).json({
      status: "success",
      data: {
        friends: friends,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "failed",
      message: err.message,
    });
  }
};

// //verify otp
// exports.verfiyOTP = async (req, res, next) => {
//   try {
//     const { email, otp, password } = req.body;
//     const otpExists = await OTPSchema.findOne({ otp });
//     if (!otpExists) {
//       return res.status(404).json({
//         success: false,
//         message: "Invalid otp code",
//       });
//     }
//     const isUserRegistered = await User.findOne({ email: email });
//     console.log("is user registered ?", isUserRegistered);
//     if (isUserRegistered) {
//       //   return res.send("user Already exists");
//       return res.status(400).json({
//         status: "failed",
//         message: "User already exists",
//       });
//     }
//     const hashPassword = await bcrypt.hash(req.body.password, 10);
//     console.log("hashPassword: ", hashPassword);
//     const user = await User.create({ ...req.body, password: hashPassword });
//     await OTPSchema.findOneAndDelete({ identity: email });
//     console.log("user ====>", user);
//     return res.status(201).json({
//       status: "success",
//       data: {
//         user: user,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: "failed",
//       message: err,
//     });
//   }
// };

// //forgetPassword
// exports.forgetPassword = async (req, res, next) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({
//         success: "failed",
//         message: "User does not exist",
//       });
//     }
//     // check opt exists and remove first
//     const isOtpExists = await OTPSchema.findOne({ identity: email });
//     console.log("otp exists ======>", isOtpExists);
//     if (isOtpExists) {
//       await OTPSchema.findByIdAndDelete(isOtpExists._id);
//     }

//     //generate new otp
//     const newOtp = randomstring.generate({
//       length: 6,
//       charset: "numeric",
//     });
//     const newOTP = new OTPSchema({
//       identity: email,
//       otp: newOtp,
//     });
//     console.log("newotp====>", newOTP);
//     await newOTP.save();
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       port: 465,
//       secure: true,
//       auth: {
//         user: "engineerwaqas189@gmail.com",
//         pass: "pphx jjse btlh kbqv",
//       },
//     });

//     // Verify the transporter
//     transporter.verify((error, success) => {
//       if (error) {
//         console.error("Error verifying transporter:", error);
//       } else {
//         console.log("Transporter is ready to send emails");
//       }
//     });
//     const htmlTemplate = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//         <style>
//             body {
//                 font-family: Arial, sans-serif;
//                 background: url('https://example.com/background.jpg') no-repeat center center fixed;
//                 background-size: cover;
//                 margin: 0;
//                 padding: 0;
//             }
//             .container {
//                 display: flex;
//                 justify-content: center;
//                 align-items: center;
//                 height: 100vh;
//             }
//             .content {
//                 max-width: 400px;
//                 background-color: rgba(255, 255, 255, 0.8);
//                 padding: 20px;
//                 border-radius: 8px;
//                 text-align: center;
//                 box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//             }
//             .otp {
//                 display: block;
//                 width: 100%;
//                 padding: 10px;
//                 margin: 20px 0;
//                 font-size: 24px;
//                 color: white;
//                 background-color: purple;
//                 border-radius: 4px;
//                 text-decoration: none;
//             }
//         </style>
//     </head>
//     <body>
//         <div class="container">
//             <div class="content">
//                 <h1>FitSocail App</h1>
//                 <p>Hello,</p>
//                 <p>We have received a request to forget password of your Account. Please use the OTP code below to proceed with set new password</p>
//                 <span class="otp">${newOtp}</span>
//                 <p>If you did not request this, please ignore this email.</p>
//                 <p>Best regards,</p>
//                 <p>The FitSocail App Team</p>
//             </div>
//         </div>
//     </body>
//     </html>
// `;
//     const mailOptions = {
//       to: email,
//       from: process.env.EMAIL_USER,
//       subject: "Account Verification",
//       html: htmlTemplate,
//     };
//     await transporter.sendMail(mailOptions);
//     res.status(200).json({
//       success: true,
//       message: "Just send you OTP, plz verify and set your new password",
//       otp: newOTP.otp,
//     });
//   } catch (err) {
//     console.log("error====>", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// //verfiy otp for forget password
// exports.verfiyOTPForgetPass = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     const otpExists = await OTPSchema.findOne({ otp });
//     const isUserRegistered = await User.findOne({ email: email });
//     console.log("is user registered ?", isUserRegistered);
//     if (!isUserRegistered) {
//       return res.status(400).json({
//         status: "failed",
//         message: "User Not found",
//       });
//     }
//     if (!otpExists) {
//       return res.status(404).json({
//         success: false,
//         message: "Invalid OTP",
//       });
//     }
//     return res.status(200).json({
//       status: "success",
//       message: "Otp Verified successfully",
//     });
//   } catch (err) {
//     console.log("error====>", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// //resset password
// exports.resetPassword = async (req, res) => {
//   try {
//     const { email, otp, newPassword } = req.body;
//     console.log(
//       "email: " + email,
//       "otp: " + otp,
//       "new password: " + newPassword
//     );
//     const user = await User.findOne({ email: email });
//     console.log("user=====>", user);
//     const otpExists = await OTPSchema.findOne({ otp: otp });
//     console.log("otpExists====>", otpExists);

//     if (!user) {
//       return res.status(404).json({
//         status: "failed",
//         message: "email not found",
//       });
//     }
//     if (!otpExists) {
//       return res.status(404).json({
//         status: "failed",
//         message: "otp not found",
//       });
//     }
//     const newPass = await bcrypt.hash(newPassword, 10);
//     console.log("new pass =====>", newPass);
//     user.password = newPass;
//     await user.save();
//     await OTPSchema.findByIdAndDelete(otpExists._id);
//     return res.status(200).json({
//       status: "success",
//       messsgae: "Passwords reset successfully",
//     });
//   } catch (err) {
//     console.log("error====>", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// //login user
// exports.login = async (req, res, next) => {
//   console.log("login route hit");
//   try {
//     const { email, password } = req.body;
//     console.log("email: " + email + " password: " + password);
//     const user = await User.findOne({ email: email });
//     if (!user) {
//       return res.status(404).json({
//         status: "failed",
//         message: "User not found",
//       });
//     }
//     console.log("user =======>", user.password);
//     bcrypt.compare(password, user.password, (err, result) => {
//       if (err) {
//         console.log("error=====>", err);
//         return res.status(500).json({
//           status: "failed",
//           message: err.message,
//         });
//       }
//       if (result) {
//         console.log("result ====>", result);
//         const token = jwt.sign(
//           { id: user._id, email: user.email },
//           process.env.SCRATEKEY,
//           {
//             expiresIn: "1h",
//           }
//         );
//         return res.status(200).json({
//           status: "success",
//           message: "login successfully",
//           data: {
//             user: user,
//             token: token,
//           },
//         });
//       } else {
//         return res.status(404).json({
//           status: "failed",
//           message: "passwords do not match",
//         });
//       }
//     });
//     // res.send("this endpoint runs successfully");
//   } catch (err) {
//     res.status(500).json({
//       status: "failed",
//       message: err,
//     });
//   }
// };
// //delete user
// exports.deleteUser = async (req, res, next) => {
//   try {
//     console.log("delete router hit ");
//     const id = req.params.id;
//     console.log("id=====>", id);
//     if (!id) {
//       return res.status(404).json({
//         status: "failed",
//         message: "id not found",
//       });
//     }
//     const deletedUser = await User.deleteOne({ _id: id });
//     console.log("deleteUser=====>", deletedUser);
//     if (deletedUser.deletedCount === 0) {
//       return res.status(404).json({
//         status: "failed",
//         message: "user not found",
//       });
//     }
//     return res.status(200).json({
//       status: "success",
//       message: "successfully deleted user",
//     });
//   } catch (err) {
//     return res.status(500).json({
//       status: "failed",
//       message: err,
//     });
//   }
// };

// //Get all users
// exports.getAllUsers = async (req, res, next) => {
//   try {
//     // console.log("user========>", req.user);
//     // console.log("user email====>", req.user.email);
//     if (!req.user) {
//       return res.status(404).json({
//         status: "failed",
//         message: "unAuthorized user",
//       });
//     }
//     const users = await User.find();
//     if (users.length) {
//       return res.status(200).json({
//         status: "success",
//         message: "successfully get all users",
//         length: users.length,
//         data: {
//           users: users,
//         },
//       });
//     }
//     return res.status(200).json({
//       status: "ok",
//       message: "No user in Database",
//       data: {
//         users: users,
//       },
//     });
//   } catch (err) {
//     console.log("error finding All Users:", err);
//     return res.status(500).json({
//       status: "failed",
//       message: err,
//     });
//   }
// };

// //get single user
// exports.getSingleUser = async (req, res, next) => {
//   try {
//     const id = req.params.id;
//     if (!id) {
//       return res.status(400).json({
//         status: "failed",
//         message: "id not specified",
//       });
//     }
//     const user = await User.findById(id);
//     console.log("user ====> ", user);
//     if (!user) {
//       return res.status(404).json({
//         status: "failed",
//         message: "User not found",
//       });
//     }
//     return res.status(200).json({
//       status: "success",
//       message: "successfully get  user",
//       length: user.length,
//       data: {
//         user: user,
//       },
//     });
//   } catch (err) {
//     console.log("error fatching User:", err);
//     return res.status(500).json({
//       status: "failed",
//       message: err,
//     });
//   }
// };

// //change password
// exports.changePassword = async (req, res, next) => {
//   try {
//     // const loginUser = req.user;

//     const { oldPassword, newPassword } = req.body;
//     let email = req.user.email;
//     console.log("email from req.user ========>", email);
//     let user = await User.findOne({ email: email });
//     if (!user) {
//       return res.status(404).json({
//         status: "failed",
//         message: "invalid email, user not found",
//       });
//     }
//     const passwordMatch = await bcrypt.compare(oldPassword, user.password);
//     if (!passwordMatch) {
//       return res.status(404).json({
//         status: "failed",
//         message: "invalid password, password mismatch",
//       });
//     }
//     user.password = newPassword;
//     user.save();
//     return res.status(200).json({
//       status: "success",
//       message: "password changed successfully",
//       data: {
//         user: user,
//       },
//     });
//   } catch (err) {
//     return res.status(500).json({
//       status: "failed",
//       message: err.message,
//     });
//   }
// };

// exports.requestAccount = async (req, res) => {
//   try {
//     console.log("request account hits");
//     const { phoneNumber } = req.body;

//     console.log("phone number", phoneNumber);
//     const user = await User.findOne({ phoneNumber });
//     console.log("user ====>", user);
//     if (user) {
//       return res
//         .status(400)
//         .json({ message: "User with this number alrady exist" });
//     }
//     const otpExists = await OTPSchema.findOne({ identity: phoneNumber });
//     console.log("exists otp ======>", otpExists);
//     if (otpExists) {
//       await OTPSchema.findByIdAndDelete(otpExists._id);
//     }
//     const otp = GenerateOTP();
//     console.log("new otp ====>", otp);
//     const newOTP = new OTPSchema({
//       identity: phoneNumber,
//       otp: otp,
//     });
//     console.log("newotp====>", newOTP);
//     await newOTP.save();

//     //twilio confgeration
//     // const { accountSid, authToken, fromPhone } = require("../Config/twilio");
//     // const client = new twilio(accountSid, authToken);

//     // await client.messages.create({
//     //   body: `Your OTP is ${newOtp}`,
//     //   from: fromPhone,
//     //   to: "+923103102166",
//     // });

//     return res.status(200).json({
//       status: "success",
//       message: "OTP has been send to this phone successfully",
//       otp: newOTP.otp,
//     });
//   } catch (err) {
//     console.log("error====>", err);
//     res.status(500).json({ message: err.message });
//   }
// };
// const newUser = new User({
//   name: name,
//   phoneNumber: otpExists.identity,
//   otp: otpExists.otp,
// });
// await newUser.save();
