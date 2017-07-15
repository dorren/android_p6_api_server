var express = require('express');
var router = express.Router();

var home = require('./controllers/home_controller');
var users = require('./controllers/users_controller');
var events = require('./controllers/events_controller');

router.get( '/',               home.index);
router.get( '/users',          users.index);
router.post('/users',          users.create);
router.get( '/users/:user_id', users.show);
router.put( '/users/:user_id', users.update);

router.get( '/events',           events.index);
router.post('/events',           events.create);
router.get( '/events/:event_id', events.show);
router.put( '/events/:event_id', events.update);

module.exports = router;
