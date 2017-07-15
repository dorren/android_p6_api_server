var User = require("../models/user");

UsersController = {
  index: (req, res, next) => {
    var email = req.query.email;
    if(email) {
      User.by_email(email, users => {
        var users_arr = users.map(x => x.attrs);
        res.json(users_arr);
      });
    }else{
      res.json([]);
    }
  },

  show: (req, res, next) => {
    User.find(req.params.user_id, user => {
      res.json(user.attrs);
    });
  },

  create: function(req, res, next) {
    var email    = req.body.email;
    var name     = req.body.name;
    var password = req.body.password;
    console.log(email + ", " + name + ", " + password);

    var attrs = {name: name, email: email, password: password};
    User.create(attrs, user => {
      res.json(user.attrs);
    });
  },

  update: function(req, res, next) {
    User.update(req.params.user_id, req.body, user => {
      res.json(user.attrs);
    })
  },

  remove: function(req, res, next) {

  },

  /**
   * return user's bookmarked and confirmed events.
   */
  events: function(req, res, next) {
    var user_id = req.params.user_id;
  }
}

module.exports = UsersController;
