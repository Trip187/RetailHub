var express = require("express");
var router = express.Router();
var fs = require("fs");
var db = require("../../lib/connection");
var Plates = require("plates");
var layout = require("../../templates/layout");

var templates = {
  new: fs.readFileSync(__dirname + "/new.html", "utf8"),
  logged_in: fs.readFileSync(__dirname + "/logged_in.html", "utf8"),
};

function insert(doc, callback) {
  var sql =
    "INSERT INTO tcust (EmailAddress, Password, FirstName, LastName) VALUES (?, ?, ?, ?)";
  var values = [doc.EmailAddress, doc.Password, doc.FirstName, doc.LastName];
  console.log(values);
  db.query(sql, values, function (err, result) {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        err.status_code = 409;
      }
      return callback(err);
    }
    callback(null, result);
  });
}

function render(user) {
  var map = Plates.Map();
  map.where("id").is("FirstName").use("FirstName").as("value");
  map.where("id").is("LastName").use("LastName").as("value");
  map.where("id").is("email").use("EmailAddress").as("value");
  map.where("id").is("password").use("Password").as("value");
  return Plates.bind(templates["new"], user || {}, map);
}

router.get("/", function (req, res) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(layout(render(), "Register"));
});

router.post("/", function (req, res) {
  var user = req.body;

  if (
    !user.EmailAddress ||
    !user.Password ||
    !user.FirstName ||
    !user.LastName
  ) {
    res.writeHead(400, { "Content-Type": "text/html" });
    return res.end(
      layout(templates["new"], "Register", {
        error: "Email, Password, First Name and Last Name are required fields.",
      }),
    );
  }

  insert(user, function (err) {
    if (err) {
      if (err.status_code === 409) {
        res.writeHead(409, { "Content-Type": "text/html" });
        return res.end("User already exists.");
      }
      console.error(err);
      res.writeHead(500, { "Content-Type": "text/html" });
      return res.end(err.message);
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(layout(templates["logged_in"], "Registration successful"));
  });
});

module.exports = router;
