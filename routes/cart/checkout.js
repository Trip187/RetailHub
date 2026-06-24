var fs = require("fs");
layout = require("../../templates/layout");
db = require("../../lib/connection");
Plates = require("plates");
express = require("express");
router = express.Router();

var templates = {
  cart: fs.readFileSync(__dirname + "/routes/cart/cart.html", "utf-8"),
  success: fs.readFileSync(__dirname + "/routes/cart/success.html", "utf-8"),
};

function retrieve() {
  var sql =
    "selecto.OrderDate,o.OrderQty,p.ProductID,p.ProductName,p.price,p.image from torder o join tproduct p on o.ProductID = p.productID where o.tCustID__CustID = ?";
  db.query(sql, function (err, results) {
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
}

function render(cart) {
  var map = Plates.Map();
  map.where("id").is("name").use("ProductName").as("value");
  map.where("id").is("price").use("price").as("value");
  map.where("id").is("image").use("image").as("src");
  map.where("id").is("quantity").use("OrderQty").as("value");
  return Plates.bind(templates["cart"], cart || {}, map);
}
function insert(doc, callback) {
  var sql =
    "insert into torder(ProductName, price, image, OrderQty) values(?, ?, ?, ?)";
  var values = [doc.ProductName, doc.price, doc.image, doc.OrderQty];
  console.log(values);

  db.query(sql, values, function (err, result) {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
}

router.get("/cart", function (req, res) {
  retrieve(function (err, cart) {
    if (err) {
      res.writeHead(500, { "content-type": "text/html" });
      return res.end(err.message);
    }
    res.writeHead(200, { "content-type": "text/html" });
    res.end(layout(render(cart), "Your Cart"));
  });
});
router.post("/checkout", function (req, res) {
  var order = {
    ProductName: req.body.name,
    price: req.body.price,
    image: req.body.image,
    OrderQty: req.body.quantity,
  };
  insert(order, function (err) {
    if (err) {
      res.writeHead(500, { "content-type": "text/html" });
      return res.end(err.message);
    }
    res.writeHead(200, { "content-type": "text/html" });
    res.end(layout(templates["success"], "Order Placed"));
  });
});
module.exports = router;
