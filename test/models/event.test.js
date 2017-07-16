import test from 'ava'
import async from 'async'

import TestHelper from '../test_helper'
import User from '../../app/models/user'
import Event from '../../app/models/event'
import EventUser from '../../app/models/event_user'


test.cb.beforeEach(t => {
  TestHelper.setupDB(t.end);
});

test.serial.cb("findFull", t => {
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
    function(user, event, cb){
      var attrs = {event_id: event.attrs.id, user_id: user.attrs.id, bookmarked:true, confirmed: true};
      EventUser.create(attrs, assn =>{
        cb(null, event.attrs.id);
      });
    },
    function(event_id, cb){
      Event.findFull(event_id, event =>{
        t.is(event.bookmarked_users.length, 1);
        cb(null, 'done');
      });
    },
  ], function(err, result){
    t.end();
  });

});
