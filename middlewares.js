const environment = process.env.NODE_ENV;

module.exports = function (error, req, res, next) {
  if (error.status) {
    res.status(error.status);
  } else {
    res.status(500);
  }
  res.json({
    message: error.message,
    stack: environment === "production" ? "🐸" : error.stack,
  });
};
