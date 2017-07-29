require('babel-core/register');
require('babel-polyfill');

var async = require('async');
var r = require('rethinkdb');
var AppCfg = require("../config/app_cfg");
var data = require("./db_seed.json");

var User  = require("../app/models/user");
var Event = require("../app/models/event");
var EventUser = require("../app/models/event_user");

// setup initial db data
class DbSeed {
  static dbConfig(){
    var env = 'dev';
    var appCfg = new AppCfg(env);
    return appCfg.get("rethinkdb");
  }

  static execute(callback) {
    var cfg = this.dbConfig();
    var klass = this;

    async.waterfall([
      function(cb){  // connect DB
        r.connect(cfg, (err, conn) => {
            if (err) throw err;
            global.dbConn = conn;
            cb(null);
          });
      },
      function(cb){  // truncate table
        r.table('users').delete().run(dbConn, (result)=>{ cb(null); });
      },
      function(cb){  // truncate table
        r.table('users').indexCreate("email").run(dbConn, (result)=>{ cb(null); });
      },
      function(cb){  // truncate table
        r.table('events').delete().run(dbConn, (result)=>{ cb(null); });
      },
      function(cb){  // truncate table
        r.table('events').indexCreate("time_from").run(dbConn, (result)=>{ cb(null); });
      },
      function(cb){  // truncate table
        r.table('events_users').delete().run(dbConn, (result)=>{ cb(null); });
      },
      function(cb){
        klass.loadOrganizers(cb);
      },
      function(organizers, cb){
        klass.loadUsers(organizers, cb);
      },
      function(organizers, users, cb){
        klass.loadEvents(organizers, users, cb);
      },
      function(hash, cb){
        klass.participateEvents(hash, cb);
      }
    ], function(err, result){
      console.log("db seeded.");
      callback();
    });
  }

  static loadOrganizers(callback) {
    var arr = data.organizers;
    User.multiCreate(arr, users => {
        callback(null, users);
    });
  }

  static loadUsers(organizers, callback) {
    var arr = data.users;
    User.multiCreate(arr, users => {
        callback(null, organizers, users);
    });
  }

  static loadEvents(organizers, users, callback) {
    var event_arr = data.events;

    // add random organizer_id
    var event_arr = event_arr.map( event => {
      var organizer_id = this.randomUserId(organizers);
      event.organizer_id = organizer_id;
      return event;
    });

    Event.multiCreate(event_arr, events => {
        var result = {organizers: organizers, users: users, events: events};
        callback(null, result);
    });
  }


  static participateEvents(hash, callback){
    var events = hash.events;

    async.every(events,
      (event, cb)=> {
        this.updateEvent(event, hash, cb);
      }, (err, result) => {
      callback(null, "done");
    });
  }

  // add organizer, add bookmark, add confirm.
  static updateEvent(event, hash, callback){
    var organizers = hash.organizers;
    var users = hash.users;

    async.waterfall([
      cb => { // create bookmark
        var user_id = this.randomUserId(users);
        EventUser.bookmark(user_id, event.attrs.id, event_user => {
          cb(null, user_id);
        });
      },
      (user_id, cb) => { // create 2nd bookmark
        var user_id = this.randomUserId(users);
        EventUser.bookmark(user_id, event.attrs.id, event_user => {
          cb(null, user_id);
        });
      },
      (user_id, cb) => { // create 3rd bookmark
        var user_id = this.randomUserId(users);
        EventUser.bookmark(user_id, event.attrs.id, event_user => {
          cb(null, user_id);
        });
      },
      (user_id, cb) => { // 67% chance to create confirm
        var x = Math.floor(Math.random() * 100);

        if(x >= 33){
          EventUser.confirm(user_id, event.attrs.id, event_user => {
            cb(null);
          });
        }else{
          cb(null);
        }
      },
    ], (err, result) => {
      callback(null);
    });
  }

  static randomUserId(users){
    var n = Math.floor(Math.random() * users.length);
    var user_id = users[n].attrs.id;
    return user_id;
  }
}

DbSeed.execute(()=>{});
