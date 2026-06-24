var plates = require("plates");
var fs = require("fs");

var template = {
  layout: fs.readFileSync(__dirname + "/layout.html", "utf-8"),
  alert: fs.readFileSync(__dirname + "/alert.html", "utf-8"),
};

module.exports = function (main, title, options) {
  if (!options) {
    options = {};
  }

  var data = {
    "main-body": main,
    title: title,
    message: "",
  };

  ["error", "info"].forEach(function (messageType) {
    if (options[messageType]) {
      data.message += plates.bind(template.alert, {
        message: options[messageType],
      });
    }
  });

  return plates.bind(template.layout, data);
};
