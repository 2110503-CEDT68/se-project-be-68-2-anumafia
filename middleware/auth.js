const jwt = require("jsonwebtoken");
const User = require("../models/User");

//Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  //Make sure token exists
  if (!token || token == "null") {
    console.log("this");

    return res
      .status(401)
      .json({ success: false, message: "Not authorize to access this route" });
  }

  try {
    //Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decoded);

    req.user = await User.findById(decoded.id);
    // Check ban status
    if (req.user.ban?.isBanned) {
      const bannedUntil = req.user.ban.bannedUntil;

      // ถ้าหมดเวลาแล้ว ให้ unban อัตโนมัติ
      if (bannedUntil && bannedUntil <= new Date()) {
        req.user.ban = { isBanned: false, bannedUntil: null, reason: null };
        await req.user.save({ validateBeforeSave: false });
      } else {
        return res.status(403).json({
          success: false,
          message: "Your account has been banned",
          bannedUntil: bannedUntil ?? "permanent",
          reason: req.user.ban.reason,
        });
      }
    }

    next();
  } catch (err) {
    console.log(err.stack);
    return res.status(401).json({
      success: false,
      message: "Not authorize to access this route",
    });
  }
};

//Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
