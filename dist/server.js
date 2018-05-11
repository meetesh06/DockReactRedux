'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

var _events = require('./api/events');

var _events2 = _interopRequireDefault(_events);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var server = (0, _express2.default)();
server.use((0, _compression2.default)());
server.set('view engine', 'ejs');
server.use(_express2.default.static('public'));

server.get('/', function (req, res) {
  res.render('index');
});
server.use('/api', _api2.default);
server.use('/events/api', _events2.default);
server.listen(_config2.default.port, _config2.default.host, function () {
  return console.log('API Server is live on ' + _config2.default.getHost());
});