const express =  require('express');
const router = express.Router();
const bodyParser = require('body-parser');
// const jsonParser = bodyParser.json();
const fileUpload = require('express-fileupload');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
router.use(fileUpload());

router.post('/create-event', urlencodedParser, (req, res) => {
  console.log(req.body);
  console.log(req.files);
  res.status(200).send('DONE');
});

module.exports = router;