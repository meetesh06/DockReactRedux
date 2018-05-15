const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const fileUpload = require('express-fileupload');
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
const jwt = require('jsonwebtoken');
const random = require('hat');
const APP_SECRET_KEY = 'IaMnOtMeDiOcRe';

const MAIL_EVENT_TITLE = 'New Event Created';
const MAIL_EVENT_TEXT = 'You have successfully created a new Event.';
const MAIL_EVENT_DEATILS_TITLE = 'Event Title : ';
const MAIL_EVENT_FOOTER = 'You can check the event details on Web Portal. For any technical issue, feel free to write at help@mycampusdock.com.';

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://dock:D2ckD2ck@103.227.177.152:27017/dock';

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db('dock');
    router.use(fileUpload());
    router.use(bodyParser.urlencoded({
        extended: false
    }));
    router.use(bodyParser.json());
    router.post('/signin', (req, res) => {
        if (!req.body) return res.sendStatus(400);
        const email = req.body.email;
        const password = req.body.password;
        dbo.collection(TABLE_USERS_ADMIN).findOne({
            email: email
        }, function(err, data) {
            if (err) {
                return res.sendStatus(402);
            }
            if (data)
                if (passwordHash.verify(password, data.password)) {
                    const JWTToken = jwt.sign({
                            email: email,
                            _id: data._id
                        },
                        APP_SECRET_KEY, {
                            expiresIn: '4d'
                        });
                    res.status(200).json({
                        error: false,
                        token: JWTToken
                    });
                } else {
                    return res.sendStatus(401);
                }
            else
                return res.status(401).json({
                    error: true,
                    mssg: 'User does not exists!'
                });
        });
    });

    router.post('/android/signin', (req, res) => {
        if (!req.body) return res.sendStatus(400);
        const email = req.body.email;
        var pin = Math.floor(Math.random() * 1000000);
        sendVerificationMail(email, pin);
        const JWTToken = jwt.sign({
                email: email,
                pin: pin
            },
            APP_SECRET_KEY, {
                expiresIn: '2h'
            });
        return res.status(200).json({
            error: false,
            token: JWTToken
        });
    });

    router.post('/android/verify', (req, res) => { //token verification
        var token = req.headers['x-access-token'];
        if (!token) return res.status(401).send({
            auth: false,
            mssg: 'No token provided.'
        });
        console.log(req.body);

        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err) return res.status(500).send({
                auth: false,
                message: 'Not a valid token!'
            });
            console.log(decoded);
            if(decoded.pin == req.body.pin && decoded.email == req.body.email){
                return res.status(200).json({
                    error : false
                });
            } 
            else{
                return res.status(400).json({
                    error : true,
                    mssg : 'Not valid credentials!'
                });
            }
        });
    });

    router.post('/events/create-event', (req, res) => { //token verification
        /* var token = req.headers['x-access-token'];
        if (!token) return res.status(401).send({
            auth: false,
            mssg: 'No token provided.'
        });

        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err) return res.status(500).send({
                auth: false,
                message: 'Failed to authenticate token.'
            });
        }); */
        if (!req.body) return res.status(400).send({
            error: true,
            mssg: 'no body'
        });
        console.log(req.body);
        var event_name = req.body.name;
        var event_description = req.body.description;
        var event_start = req.body.start;
        var event_end = req.body.end;
        var event_tags = req.body.tags;
        var event_audience = req.body.audience;
        saveFiles(req.files, res, function(media, err) {
            if (err)
                res.sendStatus(400);
            else {
                saveEventToDB(event_name, event_description, event_start, event_end, event_tags, event_audience, media, function(err) {
                    console.log('Err:' + err);
                    res.status(200).send('ok');
                });
            }
        });
    });

    function sendMail(reciever, subject, text) {
        var mailOptions = {
            from: 'support@mycampusdock.com',
            to: reciever,
            subject: subject,
            text: text
        };
        smtpTransport.sendMail(mailOptions, function(error, response) {
            if (error) {
                console.log(error);
            } else {
                console.log('Message sent to: ' + req.session.email);
            }
        });
    }

    function sendVerificationMail(email, pin){
        var mailOptions = {
            from: 'support@mycampusdock.com',
            to: email,
            text: 'This is your verification PIN : ' + pin +'. This PIN is valid for 2 hours only! Never share your PIN with anyone. If you didn\'t requested PIN, please ignore!',
            subject: 'Verify your E-mail'
        };
        smtpTransport.sendMail(mailOptions, function(error, response) {
            if (error) {
                console.log(error);
            } else {
                console.log('Message sent to: ' + req.session.email);
            }
        });
    }

    function saveEventToDB(event_name, event_description, event_start, event_end, event_tags, event_audience, media, callback) {
        var creator = 'androidrajpoot@gmail.com';
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
            event_reach: 1
        };
        dbo.collection(TABLE_EVENTS).insertOne(params, function(err, data) {
            if (err) callback(err);
            sendMail(creator, MAIL_EVENT_TITLE, MAIL_EVENT_TEXT + MAIL_EVENT_DEATILS_TITLE + event_name + MAIL_EVENT_FOOTER);
            callback(null);
        });
    }

    function saveFiles(files, res, callback) {
        var media = [];
        Object.entries(files).forEach(([key, value]) => {
            var filename = random() + '-' + value.name;
            var loc = __dirname + '/events/media/' + filename;
            media.push(loc);
            value.mv(loc, function(err) {
                if (err) callback(null, err);
            });
        });
        callback(media, null);
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