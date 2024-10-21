const request = require("request");
require('dotenv').config();

const accessToken = (req, res, next) => {
    try {
        const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
        const auth = new Buffer.from(`${process.env.SAFARICOM_CONSUMER_KEY}:${process.env.SAFARICOM_CONSUMER_SECRET}`).toString('base64');

        request(
            {
                url: url,
                headers: {
                    "Authorization": "Basic " + auth
                }
            },
            (error, response, body) => {
                if (error) {
                    res.status(401).send({
                        "message": 'Something went wrong when trying to process your payment',
                        "error": error.message
                    });
                } else {
                    try {
                        const parsedBody = JSON.parse(body);
                        if (parsedBody.access_token) {
                            req.safaricom_access_token = parsedBody.access_token;
                            next();
                        } else {
                            throw new Error("Access token not found in response");
                        }
                    } catch (parseError) {
                        console.error("Error parsing JSON response: ", parseError);
                        console.error("Response body: ", body);
                        res.status(401).send({
                            "message": 'Invalid response from Safaricom API',
                            "error": parseError.message
                        });
                    }
                }
            }
        );
    } catch (error) {
        console.error("Access token error ", error);
        res.status(401).send({
            "message": 'Something went wrong when trying to process your payment',
            "error": error.message
        });
    }
};

module.exports = { accessToken };