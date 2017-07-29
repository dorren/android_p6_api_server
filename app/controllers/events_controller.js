var Event = require("../models/event");
var User = require("../models/user");
var EventUser = require("../models/event_user");

var EventsController = {
  index: (req, res, next) => {
    Event.findAll({orderBy: {index: "time_from"}}, events => {
      var events_arr = events.map(x => x.attrs);
      res.json({events: events_arr});
    });
  },

  show: (req, res, next) => {
    Event.findFull(req.params.event_id, event => {
      res.json(event);
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

  },

  bookmark: (req, res, next) => {
    var event_id = req.params.event_id;
    var user_id = req.body.user_id;

    EventUser.bookmark(user_id, event_id, eventUser =>{
      res.json(eventUser);
    });
  },

  unbookmark: (req, res, next) => {
  },

  confirm: (req, res, next) => {
    var event_id = req.params.event_id;
    var user_id = req.body.user_id;

    EventUser.confirm(user_id, event_id, eventUser =>{
      res.json(eventUser);
    });
  },

  by_user: (req, res, next) => {
    var user_id = req.query.user_id;
    var options = {orderBy: {index: "time_from"}};

    Event.by_user(user_id, events => {
      var events_arr = events.map(x => x.attrs);
      res.json({events: events_arr});
    });
  }
}

module.exports = EventsController;
