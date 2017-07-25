import test from 'ava';
import TestHelper from '../test_helper'
import User from '../../app/models/user'
import async from 'async'

test.cb.beforeEach(t => {
  TestHelper.setupDB(t.end);
});

test("constructor", t => {
  let attrs = {name: 'John', email: 'john@gmail.com'}
  var user = new User(attrs);

	t.deepEqual(user.attrs, attrs);
});

test.serial.cb("create", t => {
  let attrs = {name: 'John', email: 'john@gmail.com'}
  var user = User.create(attrs, user =>{

    t.not(user.attrs.id, null);
    t.is(user.attrs.name, attrs.name);
    t.is(user.attrs.email, attrs.email);
    t.end();
  });
});

test.serial.cb("create dup", t => {
  var attrs = {name: 'John', email: 'john@gmail.com'};

  async.waterfall([
    function(cb){
      User.create(attrs, user =>{ cb(null, user); });
    },
    function(user1, cb){
      User.create(attrs, user =>{ cb(null, user); });
    }
  ], function(err, result){
    t.not(result.error(), null);
    t.end();
  });
});

test.serial.cb("create multiple", t => {
  var arr = [{name: 'John', email: 'john@gmail.com'},
             {name: 'Joe',  email: 'joe@gmail.com'}
            ];

  async.waterfall([
    function(cb){
      User.multiCreate(arr, users =>{ cb(null, users); });
    }
  ], function(err, result){
    t.is(result.length, 2);
    t.end();
  });
});

test.serial.cb("findAll", t => {
  async.waterfall([
    function(cb){
      var attrs = {name: 'John', email: 'john@gmail.com'}
      User.create(attrs, user =>{ cb(null); });
    },
    function(cb){
      var attrs = {name: 'Joe', email: 'joe@gmail.com'}
      User.create(attrs, user =>{ cb(null); });
    },
    function(cb){
      User.findAll(users =>{
        cb(null, users);
      });
    },
  ], function(err, result){
    t.is(result.length, 2);
    t.end();
  });
});

test.serial.cb("by ids", t => {
  async.waterfall([
    function(cb){
      var attrs = {name: 'John', email: 'john@gmail.com'}
      User.create(attrs, user =>{ cb(null, user.attrs.id); });
    },
    function(id1, cb){
      var attrs = {name: 'Joe', email: 'joe@gmail.com'}
      User.create(attrs, user =>{ cb(null, [id1, user.attrs.id]); });
    },
    function(ids, cb){
      User.by_ids(ids, users =>{
        cb(null, users);
      });
    },
  ], function(err, result){
    t.is(result.length, 2);
    t.end();
  });
});

test.serial.cb("by_email", t => {
  var email = 'john@gmail.com';

  async.waterfall([
    function(cb){
      var attrs = {name: 'John', email: email}
      User.create(attrs, user =>{ cb(null); });
    },
    function(cb){
      User.by_email(email, user =>{
        cb(null, user);
      });
    },
  ], function(err, result){
    t.not(result, null);
    t.end();
  });
});

test.serial.cb("authenticate", t => {
  async.waterfall([
    function(cb){
      var attrs = {name: 'John', email: 'john@gmail.com', password: 'testtest'}
      User.create(attrs, user =>{ cb(null); });
    },
    function(cb){
      User.authenticate('john@gmail.com', 'testtest', user =>{
        cb(null, user);
      });
    },
  ], function(err, result){
    t.not(result, null);
    t.end();
  });
});

test.serial.cb("authenticate fail", t => {
  async.waterfall([
    function(cb){
      var attrs = {name: 'John', email: 'john@gmail.com', password: 'testtest'}
      User.create(attrs, user =>{ cb(null); });
    },
    function(cb){
      User.authenticate('john@gmail.com', '', user =>{
        cb(null, user);
      });
    },
  ], function(err, result){
    t.is(result, undefined);
    t.end();
  });
});
