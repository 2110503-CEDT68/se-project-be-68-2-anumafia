const express = require('express');
const router = express.Router();
const { getCompanies, getCompany, createCompany, updateCompany, deleteCompany } = require('../controllers/companies');
const { protect, authorize } = require('../middleware/auth');

// Include other resource routers
const interviewsRouter = require('./interviews');

// Re-route into other resource routers
router.use('/:companyid/interviews/', interviewsRouter);

router.route('/').get(getCompanies)
    .post(protect, authorize('admin'), createCompany);
router.route('/:id').get(getCompany)
    .put(protect, authorize('admin'), updateCompany)
    .delete(protect, authorize('company','admin'), deleteCompany);

module.exports = router;
