const User = require("../models/User");

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
        reason: reason || null,
      },
    });

    res.status(200).json({
      success: true,
      msg: `User ${user.name} has been banned`,
      data: {
        bannedUntil: bannedUntil ?? "permanent",
        reason: reason,
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

    await User.findByIdAndUpdate(req.params.id, {
      ban: { isBanned: false, bannedUntil: null, reason: null },
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
// @route   PUT /api/v1/auth/yellowcard/:id
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
                    bannedUntil: null,
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