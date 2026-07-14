var fs = require("fs");
var layout = require("../../templates/layout");
var path = require("path");
var express = require("express");
var router = express.Router();

var templates = {
  aboutUs: fs.readFileSync(path.join(__dirname, "./aboutUs.html"), "utf-8"),
};

router.get("/", function (req, res) {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(layout(templates.aboutUs, "About Us"));
});

module.exports = router;
