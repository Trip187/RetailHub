var express = require("express");
var router = express.Router();
var mpesa = require("../../lib/mpesa");
var db = require("../../lib/connection");

// ❌ removed: const { data } = require("jquery") — jQuery can't run in Node

router.post("/pay", function (req, res) {
  // ❌ was: if (!req.session && !req.session.user) — wrong operator, crashes when session exists but user doesn't
  // ✅ use || so either missing condition redirects to login
  if (!req.session || !req.session.user) {
    res.writeHead(302, { Location: "/login" });
    return res.end();
  }

  var phone = req.body.phone;
  var amount = req.body.amount;
  // ❌ was: JSON.parse(req.body.cartData) — fetch sends JSON body directly, no need to parse
  var cartData = req.body.cartData;
  // ❌ was: req.body.user.id — user is on the session not req.body
  var custID = req.session.user.id;

  var completed = 0;
  var total = cartData.length;

  // ❌ was: cartData.forEach(function (res, err)) — forEach gives (item, index), not (res, err)
  // also was using res inside forEach which shadows the outer res
  cartData.forEach(function (item) {
    var sql =
      "INSERT INTO torder (ProductName, price, OrderQty, tCust_CustID, tProduct_ProductId, Orderdate) " +
      "VALUES (?, ?, ?, ?, ?, NOW())";

    db.query(
      sql,
      // ❌ was: item.tproduct_ProductId — cart stores it as item.productId
      [item.name, item.price, item.qty, custID, item.productId],
      function (err) {
        if (err) console.error(err);
        completed++;
        if (completed === total) {
          // ❌ was: stkpush — wrong casing, function is mpesa.stkPush
          // ❌ was: function(err, res, req) — stkPush only calls back with (err, data)
          mpesa.stkPush(phone, amount, custID, function (err, data) {
            if (err) {
              res.writeHead(500, { "content-type": "application/json" });
              return res.end(
                JSON.stringify({ error: "STK push failed", details: err }),
              );
            }
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ success: true, data: data }));
          });
        }
      },
    );
  });
});

router.post("/callback", function (req, res) {
  var body = req.body;
  console.log("M-Pesa callback:", JSON.stringify(body, null, 2));

  // ❌ was: req.body.stkCallback.resultCode — missing Body wrapper
  var resultCode = body.Body.stkCallback.ResultCode;

  if (resultCode === 0) {
    console.log("Payment successful");
  } else {
    console.log("Payment failed:", body.Body.stkCallback.ResultDesc);
  }

  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify({ ResultCode: 0, ResultDesc: "Success" }));
});

module.exports = router;
