import express from 'express';
import api from './api';
import config from './config';

const server = express();
server.set('view engine', 'ejs');
server.use(express.static('public'));

server.get('/', (req,res) => {
  res.render('index');
});
server.use('/api', api);
server.listen(config.port, config.host, () => console.log('API Server is live on '+config.getHost()));