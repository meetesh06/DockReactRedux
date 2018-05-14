const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const router = express.Router();
const fileUpload = require('express-fileupload');
var urlencodedParser = bodyParser.urlencoded({
    extended: false
});
const passwordHash = require('password-hash');
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
const TABLE_USERS_ADMIN = 'users_admin';
const TABLE_USERS = "users";
const TABLE_EVENTS = 'events';

const random = require('hat');
const jwt = require('njwt');

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://dock:D2ckD2ck@103.227.177.152:27017/dock';

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db('dock');
    router.use(fileUpload());

    router.get('/test', (req, res) => {
        const data = {
            message: 'Test Data Here'
        };
        var text = 'This is a text';
        var mailOptions = {
            from: 'support@mycampusdock.com',
            to: 'meeteshmehta4@gmail.com',
            subject: 'This is a test email!',
            text: text
        };
        smtpTransport.sendMail(mailOptions, function(error, response) {
            if (error) {
                console.log(error);
                res.end('error');
            } else {
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
        dbo.collection(TABLE_USERS_ADMIN).findOne({email: email}, function(err, data) {
            if (err) {
                return res.sendStatus(402);
            }
            if(data)
            if(passwordHash.verify(password, data.password)){
                res.json({
                    token: getLoginToken(data._id)
                });
            } else {
                return res.sendStatus(401);
            }
        });
    });

    router.post('/events/create-event', urlencodedParser, (req, res) => { //attach username with this data
        if(!req.body) return res.status(400).send('no body');
        console.log(req.body);
        var event_name = req.body.name;
        var event_description = req.body.description;
        var event_start = req.body.start;
        var event_end = req.body.end;
        var event_tags = req.body.tags;
        var event_audience = req.body.audience;
        saveFiles(req.files, res, function(media, err){
            if(err) 
                res.sendStatus(400);
            else{
                saveEventToDB(event_name, event_description, event_start, event_end, event_tags, event_audience, media, function(err){
                    console.log('Err:'+err);
                    res.status(200).send('ok');
                });
            }
        });
    });

    function saveEventToDB(event_name, event_description, event_start, event_end, event_tags, event_audience, media, callback){
        var creator = 'OGIL';
        var event_id = creator + '-' + UID(6);
        var params = {
            event_id: event_id,
            creator_name: creator,
            event_name: event_name,
            event_description: event_description,
            event_audience: event_audience,
            event_media: media,
            event_start: event_start,
            event_end: event_end,
            event_tags: event_tags,
            event_reach : 1
        };
        dbo.collection(TABLE_EVENTS).insertOne(params, function(err, data) {
            if(err) callback(err);
            callback(null);
        });
    }

    function saveFiles(files, res, callback){  //mv function takes absolute path
        var media  = [];
        Object.entries(files).forEach(([key, value]) => {
            var filename = random() + '-' + value.name;
            var loc = __dirname + '/events/media/' + filename;
            media.push(loc);
            value.mv(loc, function(err){
                if(err) callback(null, err);
            });
        });
        callback(media, null);
    }

    function getLoginToken(id){
      var secretKey = random();
      var claims = {
        user: id,
        iss: '/api',
        permissions: 'admin-user'
      }

      var jwtin = jwt.create(claims,secretKey);
      var token = jwtin.compact();
      return token;
    }

    function UID(length) {
      var text = "";
      var possible = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
    }
});

module.exports = router;


/* TODO */
// http://localhost/api
// auth router
//  login/web - user bundle store in redux
//  login/android - user bundle { scope }
// 
// event router
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