import express from 'express';
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const fileUpload = require('express-fileupload');

router.use(fileUpload());

router.post('/create-event', jsonParser, (req, res) => {
  console.log(req.body);
  console.log(req.files);
  res.status(200).send('DONE');
});

export default router;