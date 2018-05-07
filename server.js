import express from 'express';
import api from './api';
import config from './config';

const server = express();
server.use(express.static('./dock_frontend/build'));
server.get('/', (req,res) => {
  res.sendFile('./dock_frontend/build/index.html');
});
server.use('/api', api);
server.listen(config.port, config.host, () => console.log('API Server is live on '+config.getHost()));