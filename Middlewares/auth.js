// const jwt = require("jsonwebtoken");

// const auth = (req, res, next) => {
//   try {
//     console.log("secreta key =====>", process.env.SCRATEKEY);
//     let token = req.headers.authorization;
//     console.log(" outside token ====>", token);
//     if (token) {
//       console.log("insidetoken ======>", token);
//       token = token.split(" ")[1];
//       const user = jwt.verify(token, process.env.SCRATEKEY);
//       console.log("user inn auth  ====> ", user);
//       if (user) {
//         console.log("user inside  auth=================>", user);
//         req.user = user;
//       } else {
//         return res.status(404).json({
//           status: "failed",
//           message: "User not found",
//         });
//       }
//     }
//     next();
//   } catch (err) {
//     return res.status(500).json({
//       status: "error",
//       message: err.message,
//     });
//   }
// };

// module.exports = auth;

const jwt = require("jsonwebtoken");
const auth = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    console.log("token ====>", token);
    if (token) {
      token = token.split(" ")[1];
      const user = jwt.verify(token, process.env.SCRATEKEY);
      // console.log("user ====> ", user);
      if (user) {
        // req.userId = user.id;
        req.user = user;
      }
    } else {
      //   console.log("errorrrrr");
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }
    next();
  } catch (err) {
    console.log("err:", err);
    return res.status(404).json({
      status: "failed",
      message: err.message,
    });
  }
};

module.exports = auth;

// module.exports = auth;
