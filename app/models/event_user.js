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

  static bookmark(user_id, event_id, callback){
    this.find_and_update(user_id, event_id, {bookmarked: true}, callback);
  }

  static confirm(user_id, event_id, callback){
    this.find_and_update(user_id, event_id, {confirmed: true}, callback);
  }

  // if existing row found, update, otherwise create.
  static find_and_update(user_id, event_id, new_attrs, callback) {
    var table = this.tableName();
    var query = {user_id: user_id, event_id: event_id};
    r.table(table).filter(query).orderBy(r.desc('created_at')).run(dbConn, (err, result) => {
        if (err) throw err;

        if(result.length == 0){
          var attrs = Object.assign(query, new_attrs);
          this.create(attrs, model => {
            callback(model);
          });
        }else{
          var attrs = result[0];
          this.update(attrs.id, new_attrs, model =>{
            callback(model);
          });
        }
    });
  }
}

module.exports = EventUser;
