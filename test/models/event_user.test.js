import test from 'ava'
import async from 'async'

import TestHelper from '../test_helper'
import User from '../../app/models/user'
import Event from '../../app/models/event'
import EventUser from '../../app/models/event_user'


test.cb.beforeEach(t => {
  TestHelper.setupDB(t.end);
});

test.serial.cb("bookmark and confirm", t => {
  async.waterfall([
    function(cb){
      var attrs = {name: 'John', email: 'john@gmail.com'}
      User.create(attrs, user =>{
        cb(null, user); });
    },
    function(user, cb){
      var attrs = {title: 'Hiking', detail: 'in the mountain'}
      Event.create(attrs, event =>{
        cb(null, user, event); });
    },
    function(user, event, cb){  // create bookmark association
      var user_id = user.attrs.id;
      var event_id = event.attrs.id;
      EventUser.bookmark(user_id, event_id, event_user =>{
        cb(null, event_user);
      });
    },
    function(event_user, cb){  // create confirm association
      var user_id = event_user.attrs.user_id;
      var event_id = event_user.attrs.event_id;
      EventUser.confirm(user_id, event_id, event_user =>{
        cb(null, event_user);
      });
    },
    function(event_user, cb){  // assert only 1 row created.
      EventUser.findAll({}, event_users =>{
        t.is(event_users.length, 1);
        cb(null, 'done');
      });
    },
  ], function(err, result){
    t.end();
  });

});
