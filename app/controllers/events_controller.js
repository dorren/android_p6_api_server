var Event = require("../models/event");
var User = require("../models/user");

EventsController = {
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
    Event.find(req.params.event_id, event => {
      res.json(event.attrs);
    });
  },

  create: function(req, res, next) {
    var attrs = req.body;
    Event.create(attrs, event => {
      res.json(event.attrs);
    });
  },

  update: function(req, res, next) {
    Event.update(req.params.event_id, req.body, event => {
      res.json(event.attrs);
    })
  },

  remove: function(req, res, next) {

  }
}

module.exports = EventsController;
