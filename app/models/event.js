import r from 'rethinkdb'
import BaseModel from './base_model'
import User from './user'
import EventUser from './event_user'

class Event extends BaseModel {
  static tableName() { return "events"; }

  /**
   *  return event attributes along with its associations as js hash.
   *
   *     {
   *       "detail": "blah blah"
   *       "id":  "b6711224-c995-4e47-bcfc-dcd6554ad242" ,
   *       "time_from": Sat Jul 08 2017 08:00:00 GMT-05:00 ,
   *       "time_to": Sat Jul 08 2017 16:00:00 GMT-05:00 ,
   *       "title":  "Hiking in Bear Mountain",
   *
   *       "bookmarked_users": [
   *          {
   *          "email": steven@gmail.com,
   *          "name":  "Steven" ,
   *          "user_id":  "d51776ac-6d60-45b9-a54a-0ee71e258d1a"
   *          }
   *        ],
   *        "confirmed_users": [
   *          {
   *          "email": dorrenchen@gmail.com,
   *          "name":  "Dorren" ,
   *          "user_id":  "3ac987fd-7cfd-4bc2-a0dd-74db5a44d929"
   *          }
   *        ]
   *     }
   */
  static findFull(event_id, callback) {
    var table = this.tableName();

    r.table(table).get(event_id).
      merge(function(event){
        return {
          'bookmarked_users':
            r.table('events_users').
              filter({event_id: event_id, bookmarked: true}).
              eqJoin('user_id', r.table('users')).
              without({"left": {"id": true, "created_at": true}}).
              zip().coerceTo('array'),
          'confirmed_users':
            r.table('events_users').
              filter({event_id: event_id, confirmed: true}).
              eqJoin('user_id', r.table('users')).
              without({"left": {"id": true, "created_at": true}}).
              zip().coerceTo('array')
        };
      }).run(dbConn, (err, result) => {
        if (err) throw err;

        var bookmarked_arr = result.bookmarked_users;
        var confirmed_arr = result.confirmed_users;

        delete result.bookmarked_users;
        delete result.confirmed_users;
        var event = Object.assign({}, result);

        event.bookmarked_users = bookmarked_arr.map( x => this._buildUser(x));
        event.confirmed_users  = confirmed_arr.map( x => this._buildUser(x));

        callback(event);
    });
  }

  static _buildUser(userAttrs) {
    var attrs = Object.assign({}, userAttrs);
    attrs.id = attrs.user_id;
    delete attrs.user_id;
    delete attrs.bookmarked;
    delete attrs.confirmed;
    delete attrs.event_id;

    return attrs;
  }
}

module.exports = Event;
