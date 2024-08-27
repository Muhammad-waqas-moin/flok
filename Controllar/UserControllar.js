const User = require("../Model/UserSchema");
const OTPSchema = require("../Model/OTPSchema");
const randomstring = require("randomstring");
const mongoose = require("mongoose");
// const twilio = require("twilio");
const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
// const upload = require("../Middlewares/multer");
const fs = require("fs").promises;
const path = require("path");
// const { accountSid, authToken, fromPhone } = require("../Config/twilio");
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const fromPhone = process.env.TWILIO_PHONE_NUMBER;
// const client = require("twilio")(accountSid, authToken);

// generate OTP
const GenerateOTP = () => {
  const newOtp = randomstring.generate({
    length: 4,
    charset: "numeric",
  });
  return newOtp;
};

// request account
exports.requestAuthenticationOtp = async (req, res) => {
  try {
    console.log("request account hits");
    let { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).send({
        success:false,
        message: "phone number is missing",
      });
    }

    // Format the phone number for Twilio
    // if (!phoneNumber.startsWith("+")) {
    //   phoneNumber = `+92${phoneNumber}`;
    // }

    console.log("phone number", phoneNumber);
    const user = await User.findOne({ phoneNumber });
    // console.log("user ====>", user);
    // if (user) {
    //   return res
    //     .status(400)
    //     .json({ message: "User with this number already exists" });
    // }
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
exports.verifyAuthOtp = async (req, res) => {
  try {
    const { otp, phoneNumber } = req.body;
    const otpExists = await OTPSchema.findOne({ otp:otp,identity:phoneNumber });
    if (!otpExists) {
      return res.status(404).json({
        success: false,
        message: "Invalid otp code",
      });
    }
    const isUserRegistered = await User.findOne({
      phoneNumber: otpExists.identity,
    });
    console.log("User there",isUserRegistered,otpExists.identity);
    await OTPSchema.findByIdAndDelete(otpExists._id);

    if(isUserRegistered) {
      const token = jwt.sign({ id: isUserRegistered._id }, process.env.SCRATEKEY, {
        expiresIn: "2h",
      });
      res.status(200).json({
        success:true,
        token:token,
        data:isUserRegistered
      });
    } else {
     
      const newUser = new User({
        phoneNumber:phoneNumber
      });
      const token = jwt.sign({ id: newUser._id }, process.env.SCRATEKEY, {
        expiresIn: "2h",
      });
      await newUser.save();
      res.status(200).json({
        success:true,
        data:newUser,
        token:token,
        isNewUser:true
      });
    }
   
  } catch (err) {
    console.log(err)
    res.status(400).json({
      success:false,
      message:"Something went wrong try again",
      e:err
    });
  }
};


exports._setupProfile = async(req,res) => {
  try {
    const userId = req.user.id;
    const userExists = await User.findById(userId);
    if(!userExists) {
      return res.status(400).json({
        success:false,
        message:"Un Authorized"
      });
    }
    const {fullname,profile} = req.body;
    if(!profile || !fullname) {
      return res.status(400).json({
        success:false,
        message:"Please provide profile picture"
      });
    }
    if(!fullname) {
      return res.status(400).json({
        success:false,
        message:"Please provide full name"
      });
    }

    const updatedUser = await User.findByIdAndUpdate(userId,{
      fullname:fullname,
      profile:profile
    },{new:true});

    res.status(200).json({
      success:true,
      data:updatedUser
    });
  }
  catch(e) {
    res.status(400).json({
      success:false,
      message:"Something went wrong try again later",
      e:e
    });
  }
}


exports._getMyProfile = async(req,res) => {
  try {
    const userId = req.user.id;
    const userExists = await User.findById(userId);
    if(!userExists) {
      return res.status(400).json({
        success:false,
        message:"Un Authorized"
      });
    }

    res.status(200).json({
      success:true,
      data:userExists
    });
  }
  catch(e) {
    res.status(400).json({
      success:false,
      message:"Something went wrong try again later",
      e:e
    });
  }
}
