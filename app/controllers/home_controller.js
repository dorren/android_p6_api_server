var User = require("../models/user");

var HomeController = {
  index: (req, res, next) => {
    console.log("home");
    var msg = {description: "events api"};
    res.json(msg);
  }
}

module.exports = HomeController;
