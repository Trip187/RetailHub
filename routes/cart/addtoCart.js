var fs = require("fs");
var express = require("express");
var router = express.Router();
var path = require("path");
var layout = require("../../templates/layout");
var db = require("../../lib/connection");

var templates = {
  success: fs.readFileSync(path.join(__dirname, "./success.html"), "utf-8"),
};

function insert(doc, callback) {
  var sql =
    "INSERT INTO torder (ProductName, price, OrderQty, tCust_CustID, tProduct_ProductId, Orderdate) " +
    "VALUES (?, ?, ?, ?, ?, NOW())";
  var values = [
    doc.ProductName,
    doc.price,
    doc.OrderQty,
    doc.CustID,
    doc.ProductId,
  ];
  console.log(values);
  db.query(sql, values, function (err, result) {
    if (err) return callback(err);
    callback(null, result);
  });
}

router.post("/checkout", function (req, res) {
  var body = req.body;

  // Parse cartData sent from the frontend
  var cartData;
  try {
    cartData = JSON.parse(body.cartData);
  } catch (e) {
    res.writeHead(400, { "content-type": "text/html" });
    return res.end("Invalid cart data.");
  }

  if (!cartData || cartData.length === 0) {
    res.writeHead(400, { "content-type": "text/html" });
    return res.end("Your cart is empty.");
  }

  // Require login
  if (!req.session || !req.session.user) {
    res.writeHead(302, { Location: "/login" });
    return res.end();
  }

  var custID = req.session.user.id;
  var completed = 0;
  var total = cartData.length;
  var hasError = false;

  cartData.forEach(function (item) {
    var doc = {
      ProductName: item.name,
      price: item.price,
      OrderQty: item.qty,
      CustID: custID,
      ProductId: item.productId,
    };
    insert(doc, function (err) {
      if (err && !hasError) {
        hasError = true;
        res.writeHead(500, { "content-type": "text/html" });
        return res.end(err.message);
      }
      completed++;
      if (completed === total && !hasError) {
        res.writeHead(200, { "content-type": "text/html" });
        res.end(layout(templates.success, "Order Placed"));
      }
    });
  });
});

module.exports = router;
