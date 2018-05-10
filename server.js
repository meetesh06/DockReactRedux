import express from 'express';
import api from './api';
import EventsApi from './api/events';
import config from './config';
import compression from 'compression';

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