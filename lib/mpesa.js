var axios = require("axios");
var CONSUMER_KEY = "dOK9POHGlaOOe2kUzxGQwTfhCWP5FAGJuzgTZy2CM6FC606H";
var CONSUMER_SECRET =
  "feqisbqitZbOAtoYvYw3j50fzGlIrlFC1GdCDCMBuNmMaaMzlQAVp6YGEQt7d5WR";
var SHORTCODE = "174379";
var PASSKEY =
  "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
var CALLBACK_URL = "https://yourcallbackurl.com/mpesa/callback";

function getAccessToken(callback) {
  var auth = Buffer.from(CONSUMER_KEY + ":" + CONSUMER_SECRET).toString(
    "base64",
  );
  axios
    .get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: "Basic " + auth } },
    )
    .then(function (res) {
      callback(null, res.data.access_token);
    })
    .catch(function (err) {
      callback(err);
    });
}

function stkPush(phone, amount, orderId, callback) {
  getAccessToken(function (err, token) {
    if (err) return callback(err);

    var timestamp = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .slice(0, 14);
    var password = Buffer.from(SHORTCODE + PASSKEY + timestamp).toString(
      "base64",
    );

    // Normalize phone: 0712345678 → 254712345678
    var normalizedPhone = phone.replace(/^0/, "254");

    axios
      .post(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        {
          BusinessShortCode: SHORTCODE,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: Math.ceil(amount), // M-Pesa requires whole numbers
          PartyA: normalizedPhone,
          PartyB: SHORTCODE,
          PhoneNumber: normalizedPhone,
          CallBackURL: CALLBACK_URL,
          AccountReference: "Order" + orderId,
          TransactionDesc: "Payment for Order " + orderId,
        },
        { headers: { Authorization: "Bearer " + token } },
      )
      .then(function (res) {
        callback(null, res.data);
      })
      .catch(function (err) {
        callback(err.response ? err.response.data : err);
      });
  });
}

module.exports = { stkPush: stkPush };
