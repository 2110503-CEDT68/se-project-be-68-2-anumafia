const User = require("../models/User");

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, tel, email, password, role } = req.body;

    //Create user
    const user = await User.create({
      name,
      tel,
      email,
      password,
      role,
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors)
        .map((val) => val.message)
        .join(", ");
      return res.status(400).json({
        success: false,
        message: message,
      });
    }

    res.status(400).json({
      success: false,
    });
    console.log(err.stack);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Please provide an email and password",
      });
    }

    //Check for user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "Invalid credentials",
      });
    }

    //Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        msg: "Invalid credentials",
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    return res.status(401).json({
      success: false,
      msg: "Cannot convert email or password to string",
    });
  }
};

//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  //Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};

// @desc    Get current Logged in user
// @route   POST /api/vl/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
};

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    data: {},
  });
};

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        msg: "Please provide current and new password",
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        msg: "Current password is incorrect",
      });
    }

    user.password = newPassword;

    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.log(err.stack);

    if (err.name === "ValidationError") {
      const meessage = Object.values(err.errors)
        .map((val) => val.message)
        .join(", ");
      return res.status(400).json({
        success: false,
        msg: meessage,
      });
    }

    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
};

// @desc    Ban user by ID for a duration
// @route   PUT /api/v1/auth/ban/:id
// @access  Private (admin only)
exports.banUser = async (req, res, next) => {
  try {
    const { duration, unit, reason } = req.body;
    // duration: number, unit: 'minutes' | 'hours' | 'days' | 'permanent'

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        msg: "Cannot ban an admin user",
      });
    }

    if (user.ban.isBanned) {
      return res.status(400).json({
        success: false,
        msg: "User is already banned",
      });
    }

    // Calculate bannedUntil
    let bannedUntil = null;

    if (unit === "permanent") {
      bannedUntil = null; // null = permanent
    } else {
      if (!duration || !unit) {
        return res.status(400).json({
          success: false,
          msg: "Please provide duration and unit (minutes, hours, days) or use permanent",
        });
      }

      const ms = {
        minutes: 60 * 1000,
        hours: 60 * 60 * 1000,
        days: 24 * 60 * 60 * 1000,
      };
      if (!ms[unit]) {
        return res.status(400).json({
          success: false,
          msg: "Unit must be minutes, hours, days, or permanent",
        });
      }

      bannedUntil = new Date(Date.now() + duration * ms[unit]);
    }

     await User.findByIdAndUpdate(req.params.id, {
            ban: {
                isBanned: true,
                bannedUntil,
                reason: reason || null
            }
        });

    res.status(200).json({
      success: true,
      msg: `User ${user.name} has been banned`,
      data: {
        bannedUntil: bannedUntil ?? "permanent",
        reason: user.ban.reason,
      },
    });
  } catch (err) {
    console.log(err.stack);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// @desc    Unban user by ID
// @route   PUT /api/v1/auth/unban/:id
// @access  Private (admin only)
exports.unbanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    if (!user.ban.isBanned) {
      return res.status(400).json({
        success: false,
        msg: "User is not banned",
      });
    }

    await User.findByIdAndUpdate(req.user.id, {
    ban: { isBanned: false, bannedUntil: null, reason: null }
});

    res.status(200).json({
      success: true,
      msg: `User ${user.name} has been unbanned`,
    });
  } catch (err) {
    console.log(err.stack);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};
