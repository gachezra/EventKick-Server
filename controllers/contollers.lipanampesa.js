const request = require("request");
require('dotenv').config();
const { getTimestamp } = require("../utils/utils.timestamp.js");

// @desc initiate stk push
// @method POST
// @route /stkPush
// @access public
module.exports.initiateSTKPush = async(req, res) => {
    try {
        const { amount, phone, Order_ID } = req.body;
        const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
        const auth = "Bearer " + req.safaricom_access_token;

        const timestamp = getTimestamp();
        const password = Buffer.from(process.env.BUSINESS_SHORT_CODE + process.env.PASS_KEY + timestamp).toString('base64');
        const callback_url = `${process.env.APP_URL}/api/stkPushCallback/${Order_ID}`;

        console.log("callback ", callback_url);
        console.log("Amount being sent to API: ", amount);
        console.log("Phone number being sent to API: ", phone);
        console.log("OderId being sent to API: ", Order_ID);
        request({
            url: url,
            method: "POST",
            headers: {
                "Authorization": auth
            },
            json: {
                "BusinessShortCode": process.env.BUSINESS_SHORT_CODE,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": amount,
                "PartyA": phone,
                "PartyB": process.env.BUSINESS_SHORT_CODE,
                "PhoneNumber": phone,
                "CallBackURL": callback_url,
                "AccountReference": `Event Ticket worth ${amount}`,
                "TransactionDesc": `Paid for ${Order_ID}`
            }
        }, function (e, response, body) {
            if (e) {
                console.error(e);
                res.status(503).send({
                    message: "Error with the stk push",
                    error: e
                });
            } else {
                res.status(200).json(body);
            }
        });
    } catch (e) {
        console.error("Error while trying to create LipaNaMpesa details", e);
        res.status(503).send({
            message: "Something went wrong while trying to create LipaNaMpesa details. Contact admin",
            error: e
        });
    }
};

// @desc callback route Safaricom will post transaction status
// @method POST
// @route /stkPushCallback/:Order_ID
// @access public
module.exports.stkPushCallback = async(req, res) => {
    try {
        const { Order_ID } = req.params;
        const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = req.body.Body.stkCallback;
        const meta = Object.values(await CallbackMetadata.Item);
        const PhoneNumber = meta.find(o => o.Name === 'PhoneNumber').Value.toString();
        const Amount = meta.find(o => o.Name === 'Amount').Value.toString();
        const MpesaReceiptNumber = meta.find(o => o.Name === 'MpesaReceiptNumber').Value.toString();
        const TransactionDate = meta.find(o => o.Name === 'TransactionDate').Value.toString();

        console.log("-".repeat(20), " OUTPUT IN THE CALLBACK ", "-".repeat(20));
        console.log(`
            Order_ID : ${Order_ID},
            MerchantRequestID : ${MerchantRequestID},
            CheckoutRequestID: ${CheckoutRequestID},
            ResultCode: ${ResultCode},
            ResultDesc: ${ResultDesc},
            PhoneNumber : ${PhoneNumber},
            Amount: ${Amount}, 
            MpesaReceiptNumber: ${MpesaReceiptNumber},
            TransactionDate : ${TransactionDate}
        `);

        res.json({
            success: ResultCode === 0, // Check if the transaction was successful
            Order_ID,
            CheckoutRequestID,
            Amount,
            MpesaReceiptNumber,
          });
    } catch (e) {
        console.error("Error while trying to update LipaNaMpesa details from the callback", e);
        res.status(503).send({
            message: "Something went wrong with the callback",
            error: e.message
        });
    }
};

// @desc Check from safaricom servers the status of a transaction
// @method GET
// @route /confirmPayment/:CheckoutRequestID
// @access public
module.exports.confirmPayment = async (req, res) => {
    try {

      const { CheckoutRequestID } = req.body;
      const originalCheckoutRequestID = CheckoutRequestID.replace(/^___/, ''); // Remove leading underscores

      console.log("CheckoutRequestID being sent to API: ", originalCheckoutRequestID);

      const url = "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query";
      const auth = "Bearer " + req.safaricom_access_token; // Ensure this token is set correctly
      const timestamp = getTimestamp();
      const password = Buffer.from(process.env.BUSINESS_SHORT_CODE + process.env.PASS_KEY + timestamp).toString('base64');
  
      request({ 
        url: url,
        method: "POST",
        headers: {
          "Authorization": auth
        },
        json: {
          "BusinessShortCode": process.env.BUSINESS_SHORT_CODE,
          "Password": password,
          "Timestamp": timestamp,
          "CheckoutRequestID": originalCheckoutRequestID,
        }
      }, function (error, response, body) {
        if (error) {
          console.log(error);
          res.status(503).json({
            success: false,
            message: "Something went wrong while trying to confirm payment. Contact admin",
            error: error
          });
        } else {
          const resultCode = body.ResultCode;
          const resultDesc = body.ResultDesc;
  
          if (resultCode == 0) {
            res.status(200).json({ success: true, resultDesc });
          } else if (resultCode != 0) {
            res.status(200).json({ success: false, resultDesc });
          }
        }
      });
    }  catch (e) {
      console.error("Error while trying to confirm payment", e);
      res.status(503).send({
      message: "Something went wrong while trying to confirm payment. Contact admin",
      error: e
    });
  }
};