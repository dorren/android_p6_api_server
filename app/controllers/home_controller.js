var User = require("../models/user");

var HomeController = {
  index: (req, res, next) => {
    var msg = {description: "events api"};
    res.json(msg);
  }
}

module.exports = HomeController;
