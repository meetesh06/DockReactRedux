const compression = require('compression');
const config = require('./config');
const EventsApi = require('./api/events');
const api = require('./api');
const express = require('express');

const server = express();
server.use(compression());
server.set('view engine', 'ejs');
server.use(express.static('public'));

server.get('/', (req,res) => {
  res.render('index');
});
server.use('/api', api);
server.use('/events/api', EventsApi);
server.listen(config.port, config.host, () => console.log('API Server is live on '+config.getHost()));