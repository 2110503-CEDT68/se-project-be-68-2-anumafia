const Interview = require("../models/Interview");
const Review = require("../models/Review");
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

    if (role !== "company") sendTokenResponse(user, 200, res);

    return user;
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

// @desc    Update current user's name, tel, email
// @route   PUT /api/v1/auth/me
// @access  Private
exports.updateMe = async (req, res, next) => {
    try {
        const allowedFields = {};
        if (req.body.name  !== undefined) allowedFields.name  = req.body.name;
        if (req.body.tel   !== undefined) allowedFields.tel   = req.body.tel;
        if (req.body.email !== undefined) allowedFields.email = req.body.email;

        if (Object.keys(allowedFields).length === 0) {
            return res.status(400).json({
                success: false,
                msg: 'Please provide at least one field to update (name, tel, email)'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            allowedFields,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (err) {
        if (err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(val => val.message).join(', ');
            return res.status(400).json({ success: false, msg: message });
        }
        res.status(500).json({ success: false, msg: 'Server error' });
    }
};

// @desc    Delete current user
// @route   DELETE /api/v1/auth/me
// @access  Private
exports.deleteMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'User not found'
            });
        }

        await Review.deleteMany({ user: req.user.id });
        await Interview.deleteMany({ user: req.user.id });
        await User.deleteOne({ _id: req.user.id });

        res.status(200).json({
            success: true,
            data: {}
        });
    }
    catch (err) {
        res.status(500).json({ success: false, msg: 'Server error' });
    }
};