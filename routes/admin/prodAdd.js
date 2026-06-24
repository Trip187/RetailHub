var fs = require("fs");
var db = require("../../lib/connection");
var layout = require("../../templates/layout");
var plates = require("plates");
var express = require("express");
var multer = require("multer");
var router = express.Router();

var templates = {
  new: fs.readFileSync(__dirname + "/prodAdd.html", "utf-8"),
  success: fs.readFileSync(__dirname + "/success.html", "utf-8"),
};

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
var upload = multer({ storage: storage });

function insert(doc, callback) {
  var sql = "insert into tproduct(ProductName, price, image) values(?, ?, ?)";
  var values = [doc.name, doc.price, doc.image];
  db.query(sql, values, function (err, result) {
    if (err) return callback(err);
    callback(null, result);
  });
}

function getProducts(callback) {
  db.query(
    "SELECT ProductId, ProductName, price FROM tproduct",
    function (err, results) {
      if (err) return callback(err);
      callback(null, results);
    },
  );
}

function buildProductList(products) {
  if (products.length === 0) {
    return '<p class="text-muted text-center mt-3">No products yet.</p>';
  }
  return products
    .map(function (p) {
      return (
        '<div class="d-flex align-items-center justify-content-between border rounded-3 px-3 py-2 mb-2">' +
        "<div>" +
        '<div class="fw-semibold">' +
        p.ProductName +
        "</div>" +
        '<small class="text-muted">KES ' +
        parseFloat(p.price).toFixed(2) +
        "</small>" +
        "</div>" +
        '<form action="/prodAdd/delete" method="POST">' +
        '<input type="hidden" name="ProductId" value="' +
        p.ProductId +
        '" />' +
        '<button type="submit" class="btn btn-sm btn-danger">Delete</button>' +
        "</form>" +
        "</div>"
      );
    })
    .join("");
}

router.get("/", function (req, res) {
  getProducts(function (err, products) {
    if (err) {
      res.writeHead(500, { "content-type": "text/html" });
      return res.end(err.message);
    }
    var html = plates.bind(templates.new, {
      "product-list": buildProductList(products),
    });
    res.writeHead(200, { "content-type": "text/html" });
    res.end(layout(html, "New Product"));
  });
});

router.post("/", upload.single("image"), function (req, res) {
  var product = req.body;
  product.image = req.file ? req.file.filename : null;

  if (!product.name || !product.price) {
    res.writeHead(400, { "content-type": "text/html" });
    return res.end(
      layout(templates.new, "New Product", {
        error: "Name and Price are required fields.",
      }),
    );
  }

  insert(product, function (err) {
    if (err) {
      res.writeHead(500, { "content-type": "text/html" });
      return res.end(err.message);
    }
    res.writeHead(302, { Location: "/prodAdd" });
    res.end();
  });
});

router.post("/delete", function (req, res) {
  var id = req.body.ProductId;
  db.query("DELETE FROM tproduct WHERE ProductId = ?", [id], function (err) {
    if (err) {
      res.writeHead(500, { "content-type": "text/html" });
      return res.end(err.message);
    }
    res.writeHead(302, { Location: "/prodAdd" });
    res.end();
  });
});

module.exports = router;
