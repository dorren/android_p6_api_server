var async = require('async');
var r = require('rethinkdb');
var AppCfg = require("../config/app_cfg");

class TestHelper {
  static dbConfig(){
    var env = 'test';
    var appCfg = new AppCfg(env);
    return appCfg.get("rethinkdb");
  }

  static setupDB(callback) {
    var cfg = this.dbConfig();

    async.waterfall([
      function(cb){  // connect DB
        r.connect(cfg, (err, conn) => {
            if (err) throw err;
            global.dbConn = conn;
            cb(null);
          });
      },
      function(cb){  // truncate table
        r.table('users').delete().run(dbConn, (result)=>{
          cb(null);
        });
      },
      function(cb){  // truncate table
        r.table('users').indexCreate("email").run(dbConn, (result)=>{ cb(null); });
      },
      function(cb){  // truncate table
        r.table('events').delete().run(dbConn, (result)=>{
          cb(null);
        });
      },
      function(cb){  // truncate table
        r.table('events').indexCreate("time_from").run(dbConn, (result)=>{ cb(null); });
      },
      function(cb){  // truncate table
        r.table('events_users').delete().run(dbConn, (result)=>{
          cb(null, 'done');
        });
      },
    ], function(err, result){
      callback();
    });
  }

}

module.exports = TestHelper;
