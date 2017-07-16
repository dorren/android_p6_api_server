var Event = require("../models/event");
var User = require("../models/user");

var EventsController = {
  index: (req, res, next) => {
    Event.findAll(events => {
      var events_arr = events.map(x => x.attrs);
      res.json(events_arr);
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
    var attrs = {event_id: event_id, user_id: user_id};

    EventUser.create(attrs, eventUser =>{
      eventUser.event(event => {
        res.json(event.attrs);
      })
    });
  },

  unbookmark: (req, res, next) => {
  },

  confirm: (req, res, next) => {
  }
}

module.exports = EventsController;
