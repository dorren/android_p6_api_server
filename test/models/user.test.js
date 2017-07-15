import test from 'ava';
import TestHelper from '../test_helper'
import User from '../../app/models/user'

test.cb.beforeEach(t => {
  TestHelper.setupDB(t.end);
});

test("constructor", t => {
  let attrs = {name: 'John', email: 'john@gmail.com'}
  var user = new User(attrs);

	t.deepEqual(user.attrs, attrs);
});

test.cb("create", t => {
  let attrs = {name: 'John', email: 'john@gmail.com'}
  var user = User.create(attrs, user =>{

    t.not(user.attrs.id, null);
    t.is(user.attrs.name, attrs.name);
    t.is(user.attrs.email, attrs.email);
    t.end();
  });
});
