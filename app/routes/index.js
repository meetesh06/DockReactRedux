const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const nodemailer = require('nodemailer');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const smtpTransport = nodemailer.createTransport({
  host: 'mail.mycampusdock.com',
  port: 465,
  secure: true,      
  auth: {
    user: 'support@mycampusdock.com',
    pass: 'D@ckD@ck'
  }
});

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://dock:D2ckD2ck@103.227.177.152:27017/dock';

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  let dbo = db.db('dock');
});

module.exports = function(app) {
	app.use(express.static('public'));
    app.set('view engine', 'ejs');
    
	app.get('/', (req,res) => {
	  	res.render('index');
	});

	app.post('/signin', jsonParser, (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    if (!req.body) return res.sendStatus(400);

    var query = { _id: req.body.email };
    dbo.collection('Teachers').find(query).toArray(function(err, result) {
      if (err) {
        return res.sendStatus(402);
      }
      if( req.body.password == result[0].password ) {
        res.json({token: 'dhagjskjahsvcnvbxnbgsjahgd'});
      } else {
        return res.sendStatus(401);
      }
    });
  });
}