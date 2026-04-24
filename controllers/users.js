const User = require("../models/User");

// @desc    Ban user by ID
// @route   PUT /api/v1/users/ban/:id
// @access  Private (admin only)
exports.banUser = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ success: false, msg: 'Cannot ban an admin user' });
        }

        if (user.ban?.isBanned) {
            return res.status(400).json({ success: false, msg: 'User is already banned' });
        }

        await User.findByIdAndUpdate(req.params.id, {
            ban: {
                isBanned: true,
                reason: reason || null
            }
        });

        res.status(200).json({
            success: true,
            msg: `User ${user.name} has been permanently banned`,
            data: { reason: reason || null }
        });
    }
    catch (err) {
        console.log(err.stack);
        res.status(500).json({ success: false, msg: 'Server error' });
    }
};

// @desc    Unban user by ID
// @route   PUT /api/v1/users/unban/:id
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

    await User.findByIdAndUpdate(req.params.id, {
      ban: { isBanned: false, reason: null },
      yellowCards: {
          count: 0,
          records: []
      },
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

// @desc    Give yellow card to user
// @route   PUT /api/v1/users/yellowcard/:id
// @access  Private (admin only)
exports.giveYellowCard = async (req, res, next) => {
    try {
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                msg: 'Please provide a reason for the yellow card'
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'User not found'
            });
        }

        if (user.role === 'admin') {
            return res.status(400).json({
                success: false,
                msg: 'Cannot give yellow card to an admin'
            });
        }

        if (user.ban.isBanned) {
            return res.status(400).json({
                success: false,
                msg: 'User is already banned'
            });
        }

        // เพิ่ม yellow card
        user.yellowCards.records.push({ reason });
        user.yellowCards.count += 1;

        // ถ้าครบ 3 ใบ → ban ถาวรอัตโนมัติ
        if (user.yellowCards.count >= 3) {
            await User.findByIdAndUpdate(req.params.id, {
                yellowCards: {
                    count: user.yellowCards.count,
                    records: user.yellowCards.records
                },
                ban: {
                    isBanned: true,
                    reason: 'Accumulation of 3 yellow cards'
                }
            });

            return res.status(200).json({
                success: true,
                msg: `User ${user.name} has received 3 yellow cards and has been permanently banned`,
                data: {
                    yellowCardCount: user.yellowCards.count,
                    latestReason: reason
                }
            });
        }

        await User.findByIdAndUpdate(req.params.id, {
            yellowCards: {
                count: user.yellowCards.count,
                records: user.yellowCards.records
            }
        });

        res.status(200).json({
            success: true,
            msg: `User ${user.name} has been given a yellow card (${user.yellowCards.count}/3)`,
            data: {
                yellowCardCount: user.yellowCards.count,
                latestReason: reason,
                records: user.yellowCards.records
            }
        });
    }
    catch (err) {
        console.log(err.stack);
        res.status(500).json({ success: false, msg: 'Server error' });
    }
};

// @desc    get list of all user
// @route   GET /api/v1/users
// @access  Private
exports.getUsers = async (req, res, next) => {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over remove fields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, $lt, $lte, $in)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    const parsedQuery = JSON.parse(queryStr);

    if (parsedQuery.name) {
        parsedQuery.name = { $regex: parsedQuery.name, $options: 'i' };
    }

    // Finding resource
    query = User.find(parsedQuery);

    // Select Fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createAt'); 
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;

    try {
        // Count total documents for pagination
        const total = await User.countDocuments(parsedQuery);
        
        query = query.skip(startIndex).limit(limit);

        // Executing query
        const users = await query;

        res.status(200).json({
            success: true,
            totalItems: total,
            totalPages: Math.ceil(total / limit),
            itemCount: users.length,
            currentPage: page,
            data: users
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};