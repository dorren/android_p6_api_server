var r = require('rethinkdb');
var BaseModel = require('./base_model');
var EventUser = require('./event_user');

class User extends BaseModel {
  static tableName() { return "users"; }

  constructor(attrs){
    super();
    this.attrs = this.cleanAttrs(attrs);
  }

  cleanAttrs(attrs) {
    var result = Object.assign({}, attrs);
    delete result['password'];

    return result;
  }

  static by_email(email, callback) {
    var table = this.tableName();
    r.table(table).getAll(email, {index: 'email'}).
      run(dbConn, function(err, cursor) {
          if (err) throw err;

          cursor.toArray(function(err, result) {
              if (err) throw err;

              var users = result.map( x => {
                return new User(x);
              });
              callback(users);
          });
      });
  }

  // check for unique email before saving.
  static create(attrs, callback){
    this.by_email(attrs.email, users => {
      if(users.length == 0){
        super.create(attrs, callback);
      }else{
        var e = {};
        e[this.errKey()]= "duplicate user " + attrs.email + " found.";

        var model = new this(e);
        callback(model);
      }
    })
  }

  static authenticate(email, password, callback) {
    var table = this.tableName();
    r.table(table).filter(r.row('email').eq(email).and(r.row('password').eq(password))).
      run(dbConn, function(err, cursor) {
          if (err) throw err;

          cursor.toArray(function(err, result) {
              if (err) throw err;

              var users = result.map( x => {
                return new User(x);
              });
              callback(users[0]);
          });
      });
  }

  bookmark(event_id, callback) {
    EventUser.bookmark(this.attrs.id, event_id, callback);
  }

  confirm(event_id, callback) {
    EventUser.confirm(this.attrs.id, event_id, callback);
  }
}

module.exports = User;
