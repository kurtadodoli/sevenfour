const express = require('express');
const router = express.Router();
const salesReportController = require('../../controllers/salesReportController');

// GET /api/sales-report
router.get('/', salesReportController.getSalesReport);

module.exports = router;
