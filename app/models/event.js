var BaseModel = require('./base_model');
var r = require('rethinkdb');

class Event extends BaseModel {
  static tableName() { return "events"; }
}

module.exports = Event;
