const express = require('express');
const { register, login, getMe, logout, updatePassword,banUser,unbanUser } = require('../controllers/auth');
const { protect,authorize }= require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect,getMe);
router.get('/logout',logout);
router.put('/updatepassword', protect,updatePassword);
router.put('/ban/:id',protect,authorize('admin'),banUser);
router.put('/unban/:id', protect,authorize('admin'),unbanUser);

module.exports = router;
