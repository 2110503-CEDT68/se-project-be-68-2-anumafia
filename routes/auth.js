const express = require('express');
const { register, login, getMe, logout, updatePassword,banUser,unbanUser,giveYellowCard,updateMe, deleteMe } = require('../controllers/auth');
const { protect,authorize }= require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect,getMe);
router.get('/logout',logout);
router.put('/updatepassword', protect,updatePassword);
router.route('/me')
    .put(protect,updateMe)
    .delete(protect, deleteMe);
module.exports = router;
