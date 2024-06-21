const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    console.log("secreta key =====>", process.env.SCRATEKEY);
    let token = req.headers.authorization;
    console.log(" outside token ====>", token);

    if (token) {
      console.log("insidetoken ======>", token);
      token = token.split(" ")[1];
      const user = jwt.verify(token, process.env.SCRATEKEY);
      console.log("user inn auth  ====> ", user);
      if (user) {
        req.user = user;
      } else {
        return res.status(404).json({
          status: "failed",
          message: "User not found",
        });
      }
    }
    next();
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

module.exports = auth;
