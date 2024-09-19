const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const verifyToken = require('../middleware/authMiddleware')

router.post('/transactions', verifyToken, transactionController.saveTransaction);
router.get('/transactions/:userId', verifyToken, transactionController.getTransaction);

module.exports = router;