var fs = require("fs");
var layout = require("../../templates/layout");
var express = require("express");
var router = express.Router();
var Plates = require("plates");
var db = require("../../lib/connection");

var templates = {
  index: fs.readFileSync(__dirname + "/../../templates/layout.html", "utf-8"),
};

function retrieveCategories(callback) {
  db.query(
    "SELECT CategoryId, CategoryName FROM tcategory",
    function (err, results) {
      if (err) return callback(err);
      callback(null, results);
    },
  );
}

function renderCategories(categories) {
  var html = "";
  categories.forEach(function (cat) {
    html += `<a href="/shop?category=${cat.CategoryId}" 
      class="list-group-item list-group-item-action">
      ${cat.CategoryName}
    </a>`;
  });
  return html;
}

function retrieveProducts(categoryId, callback) {
  var sql;
  var params = [];

  if (categoryId) {
    sql =
      "SELECT ProductId, ProductName, price, image FROM tproduct WHERE CategoryId = ?";
    params.push(categoryId);
  } else {
    sql = "SELECT ProductId, ProductName, price, image FROM tproduct";
  }

  db.query(sql, params, function (err, results) {
    if (err) return callback(err);
    callback(null, results);
  });
}

function renderProducts(products) {
  var html = "";
  products.forEach(function (product) {
    html += `
      <div class="card">
        <img src="${product.image.startsWith("/") ? product.image : "/images/" + product.image}" 
          alt="${product.ProductName}" class="card-img-top product-img"
          onerror="this.onerror=null; this.style.display='none'">
        <div class="card-body d-flex flex-column">
          <h6 class="card-subtitle mb-1 text-body-secondary">${product.ProductName}</h6>
          <p class="card-text mb-3">KSh ${parseFloat(product.price).toFixed(2)}</p>
          <button 
            class="btn btn-primary add-to-cart-btn mt-auto"
            data-product-id="${product.ProductId}"
            data-name="${product.ProductName}"
            data-price="${product.price}"
            data-image="${product.image}">
            Add to Cart
          </button>
        </div>
      </div>`;
  });
  return html;
}

router.get("/search", function (req, res) {
  var query = req.query.q;

  if (!query || query.trim() === "") {
    return res.redirect("/shop");
  }

  var sql =
    "SELECT ProductId, ProductName, price, image FROM tproduct WHERE ProductName LIKE ?";
  db.query(sql, ["%" + query + "%"], function (err, results) {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/html" });
      return res.end(err.message);
    }

    var productHtml =
      results.length > 0
        ? renderProducts(results)
        : "<p class='text-muted'>No products found for <strong>" +
          query +
          "</strong></p>";

    var html = templates["index"]
      .replace("<!--PRODUCTS-->", productHtml)
      .replace(
        'placeholder="Search"',
        'placeholder="Search" value="' + query + '"',
      );

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  });
});

router.get("/", function (req, res) {
  var categoryId = req.query.category;

  retrieveCategories(function (err, categories) {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/html" });
      return res.end(err.message);
    }

    retrieveProducts(categoryId, function (err, products) {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/html" });
        return res.end(err.message);
      }

      var categoryHtml = renderCategories(categories);
      var productHtml = renderProducts(products);

      var html = templates["index"]
        .replace("<!--CATEGORIES-->", categoryHtml)
        .replace("<!--PRODUCTS-->", productHtml);

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(html);
    });
  });
});

module.exports = router;
