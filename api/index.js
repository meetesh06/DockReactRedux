const express =  require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();


router.get('/test', (req, res) => {
  const data = {message: 'Test Data Here'};
  res.json(data);
});


router.post('/signin', jsonParser, (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!req.body) return res.sendStatus(400);
  if (email == 'meeteshmehta4@gmail.com' && password == 'polkmn') {
    res.json({token: 'dhagjskjahsvcnvbxnbgsjahgd'});
  } else {
    res.sendStatus(401);
  }
});

router.post('/create-event', jsonParser, (req, res) => {
  console.log(req.body);
  res.sendStatus(200).send('DONE');
});

module.exports = router;