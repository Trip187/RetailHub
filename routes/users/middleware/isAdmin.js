module.exports = function (req, res, next) {
  if (req.session.user && req.session.user.isAdmin) {
    return next();
  }
  res.writeHead(403, { "content-type": "text/html" });
  res.end("Access Denied : Admins Only!!");
};
