var r = require('rethinkdb');
var BaseModel = require('./base_model');
var Event = require('./event');
var User = require('./user');

class EventUser extends BaseModel {
  static tableName() { return "events_users"; }

  event(callback) {
    Event.find(this.attrs.event_id, event =>{
      callback(event);
    });
  }

  user(callback) {
    User.find(this.attrs.user_id, user =>{
      callback(user);
    });
  }
}

module.exports = EventUser;
