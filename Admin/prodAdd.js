var fs = require("fs");
var db = require("../../lib/connection");
var layout = require("../../templates/layout");
var express = require("express");
var multer = require("multer");
var router = express.Router();

var templates = {
  new: fs.readFileSync(__dirname + "/prodAdd.html", "utf-8"),
  success: fs.readFileSync(__dirname + "/success.html", "utf-8"),
};
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
var upload = multer({ storage: storage });
function insert(doc, callback) {
  var sql = "insert into tproduct(ProductName, price, image) values(?, ?, ?)";
  var values = [doc.ProductName, doc.price, doc.image];
  console.log(values);

  db.query(sql, values, function (err, result) {
    if (err) {
      res.writeHead(500, { "content-type": "text/html" });
      return res.end(err.message);
    }
    callback(null, result);
  });
}
router.get("/products", function (req, res) {
  res.writeHead(200, { "content-type": "text/html" });
  res.end(templates.new);
});
router.post("/products", upload.single("image"), function (req, res) {
  var product = req.body;
  product.image = req.file ? req.file.filename : null;
  if (!product.name || !product.price || !product.quantity) {
    res.writeHead(400, { "content-type": "text/html" });
    return res.end(
      layout(templates.new, product, {
        error: "Name, Price, and Quantity are required fields.",
      }),
    );
  }
  insert(product, function (err) {
    if (err) {
      res.writeHead(500, { "content-type": "text/html" });
      return res.end(err.message);
    }
    res.writeHead(200, { "content-type": "text/html" });
    res.end(layout(templates.success, "Product Added Successfully"));
  });
});
module.exports = router;
