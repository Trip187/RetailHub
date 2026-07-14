var express = require("express");
var path = require("path");
var session = require("express-session");
var app = express();

var usersRouter = require("./routes/users/registration");
var aboutUsRouter = require("./routes/aboutUs/aboutUs");
var loginRouter = require("./routes/users/users");
var cartRouter = require("./routes/cart/addtoCart");
var shopRouter = require("./routes/shop/shop");
var adminProdAddRouter = require("./routes/admin/prodAdd");
var mpesaRouter = require("./routes/cart/mpesa");
var isAdmin = require("./routes/users/middleware/isAdmin");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// session before all routes
app.use(
  session({
    secret: "retail_shop_secret",
    resave: false,
    saveUninitialized: false,
  }),
);

//r session
app.use("/", shopRouter);
app.use("/shop", shopRouter);
app.use("/search", shopRouter);
app.use("/register", usersRouter);
app.use("/login", loginRouter);
app.use("/about-us", aboutUsRouter);
app.use("/cart", cartRouter);
app.use("/prodAdd", isAdmin, adminProdAddRouter); //isAdmin guard
app.use("/mpesa", mpesaRouter);

app.listen(3000, function () {
  console.log("Server running on port 3000");
});

module.exports = app;
