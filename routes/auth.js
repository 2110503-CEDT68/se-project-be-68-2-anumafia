const express = require('express');
const { register, login, getMe, logout, updatePassword,banUser,unbanUser,giveYellowCard,updateMe, deleteMe } = require('../controllers/auth');
const { protect,authorize }= require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout',logout);
router.put('/updatepassword', protect,updatePassword);
router.route('/me')
    .get(protect, getMe)
    .put(protect, authorize("admin", "user"), updateMe)
    .delete(protect, authorize("admin", "user"), deleteMe);
module.exports = router;
