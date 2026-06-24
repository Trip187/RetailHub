var express = require("express");
var router = express.Router();
var fs = require("fs");
var db = require("../../lib/connection");

var templates = {
  login: fs.readFileSync(__dirname + "/login.html", "utf8"),
  logged_in: fs.readFileSync(__dirname + "/logged_in.html", "utf8"),
};

router.get("/", function (req, res) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(templates["login"]);
});

router.post("/", function (req, res) {
  var user = req.body;

  if (!user.EmailAddress || !user.Password) {
    res.writeHead(302, {
      Location: "/login?error=Email+and+password+are+required",
    });
    return res.end();
  }

  var sql = "SELECT * FROM tcust WHERE EmailAddress = ? AND Password = ?";
  db.query(sql, [user.EmailAddress, user.Password], function (err, results) {
    if (err) {
      res.writeHead(302, {
        Location: "/login?error=" + encodeURIComponent(err.message),
      });
      return res.end();
    }

    if (results.length === 0) {
      res.writeHead(302, {
        Location: "/login?error=Invalid+email+or+password",
      });
      return res.end();
    }

    // Save session
    req.session.user = {
      id: results[0].CustID,
      email: results[0].EmailAddress,
      isAdmin: results[0].isAdmin,
    };

    // Redirect based on role
    if (results[0].isAdmin === 1) {
      res.writeHead(302, { Location: "/prodAdd" });
    } else {
      res.writeHead(302, { Location: "/" });
    }
    res.end();
  });
});

module.exports = router;
