var axios = require("axios");
var CONSUMER_KEY="dOK9POHGlaOOe2kUzxGQwTfhCWP5FAGJuzgTZy2CM6FC606H";
var CONSUMER_SECRET="feqisbqitZbOAtoYvYw3j50fzGlIrlFC1GdCDCMBuNmMaaMzlQAVp6YGEQt7d5WR";
var SHORTCODE="174379";
var PASSKEY="bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
var CALLBACK_URL="https://yourcallbackurl.com/mpesa/callback";

function getAccessToken(callback){
  var auth = Buffer.from(CONSUMER_KEY + ":" + CONSUMER_SECRET).toString("base64");
  axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",{headers={
Authorization : "Base"+ auth
  }})
 .then(function(res){
  callback(null,res.data.access_token);
 })
 .catch(function(err){
  callback(err);
 })
}

function stkpush(phone,amount,orderId,callback){
  getAccessToken(function(err,token){if(err){callback(err);}})
var timestamp = new Date().toISOString().replace(/[-T:.Z]/,"").slice(0,14);
  var password = Buffer.from(SHORTCODE + PASSKEY + timestamp).toString("base64");
  var normalizedPhone = phone.replace(/^0/,"254");

  axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: SHORTCODE,      // your Paybill/Till number
        Password: password,                // the base64 password you just built
        Timestamp: timestamp,              // the timestamp you just built
        TransactionType: "CustomerPayBillOnline", // payment type
        Amount: Math.ceil(amount),         // whole numbers only — no decimals
        PartyA: normalizedPhone,           // customer's phone paying
        PartyB: SHORTCODE,                 // your shortcode receiving
        PhoneNumber: normalizedPhone,      // phone to send STK prompt to
        CallBackURL: CALLBACK_URL,         // where Safaricom sends the result
        AccountReference: "Order" + orderId, // shows on customer's M-Pesa
        TransactionDesc: "Payment for Order " + orderId, // description
      },
      { headers: { Authorization: "Bearer " + token } }
    )
    .then(function (res) {
      callback(null, res.data);
    }).catch(function (err) {
      callback(err.response ? err.response.data : err);
    });
}
