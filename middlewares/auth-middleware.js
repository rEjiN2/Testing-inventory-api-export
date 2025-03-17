const jwt = require("jsonwebtoken");

const { User } = require("../models/Users");
const configJs = require("../config.js");

const authMiddleware = async (req, res, next) => {
  try {
    // Allow public routes to pass through
    // if (configJs.passUrl.includes(req.path)) {
    //   return next();
    // }

    const token = req.headers["x-access-token"] || "";

    if (!token) {
      return res.status(401).json({
        status: false,
        message: "No token, authorization denied",
      });
    }

    // Verify access token (not refresh token)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(JSON.stringify(decoded));
       // Extract email or phone from decoded payload
       let userQuery = {};
       if (decoded.email) {
         userQuery.email = decoded.email;
       } else if (decoded.phone) {
         userQuery.phone = decoded.phone;
       } else if (decoded.$or) {
         userQuery = { $or: decoded.$or }; // Use the provided $or condition
       }
   
       // Fetch user from the database
       const user = await User.findOne(userQuery);
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: false,
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: false,
        message: "Token expired",
      });
    }

    res.status(500).json({
      status: false,
      message: "Server error during authentication",
    });
  }
};

module.exports = authMiddleware;