const compression = require('compression');
const config = require('./config');
const api = require('./api');
const express = require('express');
var path = require('path');

const server = express();
server.use(compression());
server.set('view engine', 'ejs');
server.use(express.static(path.join(__dirname, 'dock_frontend/build')));
server.use(express.static(path.join(__dirname, 'api/events')));
server.use('/', api);

server.get('*', function(req, res) {
  res.sendFile(path.resolve(__dirname,'dock_frontend/build/index.html'));
});

server.listen(config.port, config.host, () => console.log('API Server is live on '+config.getHost()));
