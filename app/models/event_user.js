var BaseModel = require('./base_model');
var r = require('rethinkdb');

class EventUser extends BaseModel {
  static tableName() { return "event_users"; }
}

module.exports = Event;
