import r from 'rethinkdb'
import BaseModel from './base_model'
import User from './user'
import EventUser from './event_user'

class Event extends BaseModel {
  static tableName() { return "events"; }

  static create(attrs, callback) {
    attrs.time_from = this.toTime(attrs.time_from);
    attrs.time_to = this.toTime(attrs.time_to);
    super.create(attrs, callback);
  }
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

  // return all events by a user
  // {
  //   "left": {
  //     "bookmarked": true ,
  //     "created_at": Fri Jul 28 2017 23:49:09 GMT+00:00 ,
  //     "event_id":  "f3f6375e-533d-4f43-b946-fec74b6faf36" ,
  //     "id":  "d74df45e-233a-4579-858a-a47af4820023" ,
  //     "user_id":  "9539080d-9251-40a2-9311-90c5addaa734"
  //   } ,
  //   "right": {
  //     "created_at": Thu Jul 27 2017 15:58:42 GMT+00:00 ,
  //     "detail": "We will leave car pool at the parking lot at the Sheraton Hotel. Be there 8am sharp. Bring your own lunch and enough water. See you then." ,
  //     "id":  "f3f6375e-533d-4f43-b946-fec74b6faf36" ,
  //     "image_url": https://s3.amazonaws.com/eventhubapp/hiking.jpg, »
  //     "location":  "3020 Seven Lakes Drive, Tomkins Cove, NY 10986" ,
  //     "organizer_id":  "4e71988e-97c6-476e-a2c0-097e35db1a49" ,
  //     "time_from":  "2017-08-05T08:00:00.0000-05:00" ,
  //     "time_to":  "2017-08-05T16:00:00.0000-05:00" ,
  //     "title":  "Hiking in Bear Mountain"
  //   }
  // }
  static by_user(user_id, options, callback) {
    var table = this.tableName();

    var orderBy = "time_from";
    if(options.orderBy){
      var orderBy = options.orderBy;
      delete options.orderBy;
    }

    var selection = {user_id: user_id};
    if(options.bookmarked){ selection.bookmarked = true; }
    if(options.confirmed){  selection.confirmed = true;  }

    r.table("events_users").filter(selection).
      eqJoin('event_id', r.table('events')).
      without({"left": {"id": true, "created_at": true, "event_id": true}}).zip().
      orderBy("time_from").
      run(dbConn, (err, cursor) => {
        if (err) throw err;

        cursor.toArray((err, result) => {
            if (err) throw err;

            var models = result.map( x => new this(x));
            callback(models);
        });
      });
  }
}

module.exports = Event;
