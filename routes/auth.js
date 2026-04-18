const express = require('express');
const { register, login, getMe, logout, updatePassword,banUser,unbanUser,giveYellowCard,updateMe } = require('../controllers/auth');
const { protect,authorize }= require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect,getMe);
router.get('/logout',logout);
router.put('/updatepassword', protect,updatePassword);
router.put('/me',protect,updateMe);
module.exports = router;
