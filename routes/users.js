const express = require('express');
const {banUser,unbanUser,giveYellowCard } = require('../controllers/users');
const { protect,authorize }= require('../middleware/auth');

const router = express.Router();


router.put('/ban/:id',protect,authorize('admin'),banUser);
router.put('/unban/:id', protect,authorize('admin'),unbanUser);
router.put('/yellowcard/:id',protect,authorize('admin'),giveYellowCard);

module.exports = router;
