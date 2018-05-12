const express =  require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

// http://localhost/api
// auth routes
//  login/web - user bundle store in redux
//  login/android - user bundle { scope }
// 
// event routes
//  event/create -- messaging service
//  event/update -- messaging service
//  event/get-event-by-id 
//  event/get-analytics-by-id
//
// teacher dashboard
//  teacher-dashboard/analytics - user_id, hash - 
//  dashboard/
//
// user dashboard
//  user-dashboard (scope) => ([{updated_timestamp, data},...])
//  
// on event create
//  media storage
//  normal database entry
//  send to scope
//  end response
//  analytics database entry
//  updated scope timestamp
//  
// scope table
//
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
  
  router.get('/test', (req, res) => {
    const data = {message: 'Test Data Here'};
    var text = 'This is a text';
    var mailOptions={
      from: 'support@mycampusdock.com',
      to : 'meeteshmehta4@gmail.com',
      subject : 'This is a test email!',
      text : text
    };
    smtpTransport.sendMail(mailOptions, function(error, response){
      if(error){
        console.log(error);
        res.end('error');
      }else{
        console.log('Message sent to: ' + req.session.email);
        res.end('sent');
      }
    });
    res.json(data);
  });
  
  router.post('/signin', jsonParser, (req, res) => {
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
  
  router.post('/create-event', jsonParser, (req, res) => {
    console.log(req.body);
    res.sendStatus(200).send('DONE');
  });
});



module.exports = router;