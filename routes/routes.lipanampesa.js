const express = require('express');
const router = express.Router();
const { initiateSTKPush, stkPushCallback, confirmPayment } = require("../controllers/contollers.lipanampesa.js");
const { accessToken } = require("../middleware/middlewares.generateAccessToken.js");

router.route('/stkPush').post(accessToken, initiateSTKPush);
router.route('/stkPushCallback/:Order_ID').post(stkPushCallback);
router.route('/confirmPayment').post(accessToken, confirmPayment);

module.exports = router;