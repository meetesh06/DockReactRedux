const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const fileUpload = require('express-fileupload');
const passwordHash = require('password-hash');
const nodemailer = require('nodemailer');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
const admin = require('firebase-admin');
const serviceAccount = require('./admincred.json');
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
const TABLE_USERS = 'users';
const TABLE_COLLEGES = 'colleges';
const TABLE_EVENTS = 'events';
const TABLE_BULLETINS = 'bulletins';
const TABLE_NOTIFICATIONS = 'notifications';
const jwt = require('jsonwebtoken');
const random = require('hat');
const APP_SECRET_KEY = 'IaMnOtMeDiOcRe';

const MAIL_EVENT_TITLE = 'New Event Created';
const MAIL_EVENT_TEXT = 'You have successfully created a new Event.\n';
const MAIL_EVENT_DEATILS_TITLE = 'Event Title: ';
const MAIL_EVENT_FOOTER = '\nYou can check the event details on Web Portal.\nFor any technical issue, feel free to write at help@mycampusdock.com.';

const ObjectID = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://dock:D2ckD2ck@103.227.177.152:27017/dock';

MongoClient.connect(url, {
    useNewUrlParser: true
}, function(err, db) {
    if (err) throw err;
    let dbo = db.db('dock');
    router.use(fileUpload());
    router.use(bodyParser.urlencoded({
        extended: false
    }));
    router.use(bodyParser.json());
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://mycampusdock-12f5a.firebaseio.com'
    });

    router.post('/hierarchy', (req, res) => {
        if (req.body && req.body.college_id) {
            let college_id = req.body.college_id;
            if (!college_id) return res.json({
                error: true,
                mssg: 'invalid request'
            });
            dbo.collection(TABLE_COLLEGES).findOne({
                _id: college_id
            }, (err, result) => {
                if (err) return res.json({
                    error: true,
                    mssg: 'invalid college id'
                });
                if (result && result.data) {
                    res.json({
                        error: false,
                        data: result.data
                    });
                } else {
                    if (err) return res.json({
                        error: true,
                        mssg: 'college not configured yet'
                    });
                }
            });
        } else {
            return res.json({
                error: true,
                mssg: 'invalid request'
            });
        }
    });

    function checkUserExists(email, callback) {
        dbo.collection(TABLE_USERS).findOne({
            email
        }, (err, result) => {
            if (err) callback(err, null);
            callback(null, result);
        });
    }


    router.post('/web/event-data-from-list', (req, res) => {
        var token = req.headers['x-access-token'];
        if (!token) return res.sendStatus(401);
        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err) return res.sendStatus(401);
            if (decoded.email == req.body.email) {
                let event_list = req.body.event_list;
                dbo.collection(TABLE_EVENTS).find({
                    'event_id': {
                        '$in': event_list
                    }
                }).toArray((err, data) => {
                    if (err) return res.status(200).json({
                        error: true,
                        mssg: 'Internal error occured!'
                    });
                    var toSend = [];
                    var i;
                    for (var prop in data) {
                        if (prop == 50) break;
                        var dateExists = false;
                        let curr = new Date(data[prop].event_start);

                        for (i = 0; i < toSend.length; i++) {
                            let loc = new Date(toSend[i].date);
                            if ((loc.getDate() == curr.getDate()) && (loc.getMonth() == curr.getMonth())) {
                                toSend[i]['reach'] = toSend[i]['reach'] + data[prop].event_reach;
                                toSend[i]['data'].push({
                                    name: data[prop].event_name,
                                    description: data[prop].event_description,
                                    reach: data[prop].event_reach,
                                    audience: data[prop].event_audience,
                                    tags: data[prop].event_tags,
                                    media: data[prop].event_media,
                                    id: data[prop].event_id
                                });
                                dateExists = true;
                            }
                        }
                        if (!dateExists) {
                            toSend.push({
                                date: curr,
                                reach: data[prop].event_reach,
                                data: [{
                                    name: data[prop].event_name,
                                    description: data[prop].event_description,
                                    reach: data[prop].event_reach,
                                    audience: data[prop].event_audience,
                                    tags: data[prop].event_tags,
                                    media: data[prop].event_media,
                                    id: data[prop].event_id
                                }]
                            });
                        }
                    }
                    res.status(200).json({
                        error: false,
                        data: toSend
                    });
                });
            } else {
                return res.status(200).json({
                    error: true,
                    mssg: 'Not valid credentials!'
                });
            }
        });
    });

    router.post('/web/bulletin-data-from-list', (req, res) => {
        var token = req.headers['x-access-token'];
        if (!token) return res.sendStatus(401);
        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err) return res.sendStatus(401);
            if (decoded.email == req.body.email) {
                let bulletin_list = req.body.bulletin_list;
                dbo.collection(TABLE_BULLETINS).find({
                    'bulletin_id': {
                        '$in': bulletin_list
                    }
                }).toArray((err, data) => {
                    if (err) return res.status(200).json({
                        error: true,
                        mssg: 'Internal error occured!'
                    });
                    var toSend = [];
                    var i;

                    for (var prop in data) {
                        if (prop == 50) break;
                        var dateExists = false;
                        let curr = new Date(new ObjectID(data[prop]._id).getTimestamp());
                        for (i = 0; i < toSend.length; i++) {
                            let loc = new Date(toSend[i].date);
                            if ((loc.getDate() == curr.getDate()) && (loc.getMonth() == curr.getMonth())) {
                                toSend[i]['reach'] = toSend[i]['reach'] + data[prop].bulletin_reach;
                                toSend[i]['data'].push({
                                    name: data[prop].bulletin_title,
                                    description: data[prop].bulletin_description,
                                    reach: data[prop].bulletin_reach,
                                    audience: data[prop].bulletin_audience,
                                    media: data[prop].event_media,
                                    id: data[prop].bulletin_id
                                });
                                dateExists = true;
                            }
                        }
                        if (!dateExists) {
                            toSend.push({
                                date: curr,
                                reach: data[prop].event_reach,
                                data: [{
                                    name: data[prop].bulletin_title,
                                    description: data[prop].bulletin_description,
                                    reach: data[prop].bulletin_reach,
                                    audience: data[prop].bulletin_audience,
                                    media: data[prop].event_media,
                                    id: data[prop].bulletin_id
                                }]
                            });
                        }
                    }
                    res.status(200).json({
                        error: false,
                        data: toSend
                    });
                });
            } else {
                return res.status(200).json({
                    error: true,
                    mssg: 'Not valid credentials!'
                });
            }
        });
    });

    router.post('/web/notification-data-from-list', (req, res) => {
        var token = req.headers['x-access-token'];
        if (!token) return res.sendStatus(401);
        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err) return res.sendStatus(401);
            if (decoded.email == req.body.email) {
                let notification_list = req.body.notification_list;
                dbo.collection(TABLE_NOTIFICATIONS).find({
                    'notification_id': {
                        '$in': notification_list
                    }
                }).toArray((err, data) => {
                    if (err) return res.status(200).json({
                        error: true,
                        mssg: 'Internal error occured!'
                    });
                    var toSend = [];
                    var i;
                    for (var prop in data) {
                        if (prop == 50) break;
                        var dateExists = false;
                        let curr = new Date(new ObjectID(data[prop]._id).getTimestamp());

                        for (i = 0; i < toSend.length; i++) {
                            let loc = new Date(toSend[i].date);
                            if ((loc.getDate() == curr.getDate()) && (loc.getMonth() == curr.getMonth())) {
                                toSend[i]['reach'] = toSend[i]['reach'] + data[prop].notification_reach;
                                toSend[i]['data'].push({
                                    description: data[prop].notification_description,
                                    reach: data[prop].notification_reach,
                                    audience: data[prop].notification_audience,
                                    id: data[prop].notification_id,
                                    name: 'created: ' + curr.getHours() + ':' + curr.getMinutes()
                                });
                                dateExists = true;
                            }
                        }
                        if (!dateExists) {
                            toSend.push({
                                date: curr,
                                reach: data[prop].event_reach,
                                data: [{
                                    description: data[prop].notification_description,
                                    reach: data[prop].notification_reach,
                                    audience: data[prop].notification_audience,
                                    id: data[prop].notification_id,
                                    name: 'created: ' + curr.getHours() + ':' + curr.getMinutes()
                                }]
                            });
                        }
                    }
                    res.status(200).json({
                        error: false,
                        data: toSend
                    });
                });
            } else {
                return res.status(200).json({
                    error: true,
                    mssg: 'Not valid credentials!'
                });
            }
        });
    });

    router.post('/web/bundle-check', (req, res) => {
        var token = req.headers['x-access-token'];
        if (!token) return res.sendStatus(401);
        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err) return res.sendStatus(401);
            if (decoded.email == req.body.email) {
                dbo.collection(TABLE_USERS_ADMIN).findOne({
                    email: req.body.email
                }, function(err, data) {
                    if (err) {
                        return res.sendStatus(402);
                    }
                    if (data) {
                        let toSend = {
                            hashsum: data.hashsum ? data.hashsum : '-1',
                            bundle: {
                                events: data.events ? data.events : [],
                                bulletins: data.bulletins ? data.bulletins : [],
                                notifications: data.notifications ? data.notifications : []
                            }
                        };
                        if (data.hashsum === req.body.hashsum) {
                            return res.status(200).json({
                                error: false,
                                mssg: 'already up-to-date'
                            });
                        } else {
                            return res.status(200).json({
                                error: false,
                                mssg: 'send new data',
                                bundle: toSend
                            });
                        }
                    }
                });
            } else {
                return res.status(200).json({
                    error: true,
                    mssg: 'Not valid credentials!'
                });
            }
        });
    });

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
                            name: data.name,
                            college: data.college
                        },
                        APP_SECRET_KEY, {
                            expiresIn: '4d'
                        });
                    let toSend = {
                        hashsum: data.hashsum ? data.hashsum : '-1',
                        bundle: {
                            events: data.events ? data.events : [],
                            bulletins: data.bulletins ? data.bulletins : [],
                            notifications: data.notifications ? data.notifications : []
                        }
                    };
                    res.status(200).json({
                        error: false,
                        token: JWTToken,
                        bundle: toSend
                    });
                } else {
                    return res.sendStatus(401);
                }
            else
                return res.status(401).json({
                    error: true,
                    mssg: 'User does not exist!'
                });
        });
    });

    router.post('/verify-chat', (req, res) => {
        var token = req.headers['x-access-token'];
        if (!token) return res.json({
            error: true,
            mssg: 'invalid token'
        });
        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err) return res.json({
                error: true,
                mssg: 'invalid token'
            });
            else return res.json({
                error: false,
                data: decoded.email
            });
        });
    });

    router.post('/verify', (req, res) => {
        var token = req.headers['x-access-token'];
        if (!token) return res.sendStatus(401);
        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err) return res.sendStatus(401);
            if (decoded.email == req.body.email) {
                const JWTToken = jwt.sign({
                        email: req.body.email
                    },
                    APP_SECRET_KEY, {
                        expiresIn: '4d'
                    });

                dbo.collection(TABLE_USERS_ADMIN).findOne({
                    email: req.body.email
                }, function(err, data) {
                    if (err) return res.sendStatus(401);
                    let toSend = {
                        hashsum: data.hashsum ? data.hashsum : '-1',
                        bundle: {
                            events: data.events ? data.events : [],
                            bulletins: data.bulletins ? data.bulletins : [],
                            notifications: data.notifications ? data.notifications : []
                        }
                    };
                    return res.status(200).json({
                        error: false,
                        token: JWTToken,
                        bundle: toSend
                    });
                });

            } else {
                return res.status(200).json({
                    error: true,
                    mssg: 'Not valid credentials!'
                });
            }
        });

    });

    router.post('/events/create-event', (req, res) => {
        var token = req.headers['x-access-token'];
        if (!token) return res.sendStatus(401);
        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err || req.body.email != decoded.email) return res.sendStatus(500);
            var creator = decoded.name;
            var creatorEmail = decoded.email;
            var belongs_to = decoded.college;
            var event_id = creator + '-' + UID(6);
            var event_name = req.body.name;
            var event_description = req.body.description;
            var event_start = req.body.start;
            var event_end = req.body.end;
            var event_tags = req.body.tags;
            var event_audience = req.body.audience;
            saveFiles(req.files ? req.files : [], function(media, err) {
                if (err)
                    res.sendStatus(403);
                else {
                    saveEventToDB(event_id, creator, creatorEmail, belongs_to, event_name, event_description, event_start, event_end, event_tags, event_audience, media, function(err) {
                        if (err) return res.sendStatus(403);
                        const data = {
                            event_id: event_id,
                            belongs_to: belongs_to,
                            created_by: creator,
                            event_title: event_name,
                            event_description: event_description,
                            event_start: event_start,
                            event_end: event_end,
                            event_tags: event_tags,
                            event_audience: event_audience,
                            event_media: media,
                            event_reach: 0,
                            updated_on: Date.now()
                        };

                        const payload = {
                            data: {
                                type: 'event',
                                content: JSON.stringify(data)
                            }
                        };
                        sendToScope(event_audience.split(','), payload, function(err) {
                            if (err) return res.sendStatus(403);
                            else return res.status(200).json({
                                error: false
                            });
                        });
                    });
                }
            });
        });

    });

    router.post('/events/update-event', (req, res) => {
        var token = req.headers['x-access-token'];
        if (!token) return res.sendStatus(401);
        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err || req.body.email != decoded.email) return res.send({
                error: true,
                mssg: 'invalid email',
                reload: true
            });
            var event_description = req.body.description;
            var event_id = req.body.id;
            var event_audience = req.body.audience;
            if (!event_description || !event_description || !event_audience) return res.send({
                error: true,
                mssg: 'invalid details',
                reload: false
            });

            updateEventDB(event_id, event_description, event_audience, function(err) {
                if (err) {
                    return res.send({
                        error: true,
                        mssg: 'error saving changes',
                        reload: false
                    });
                } else {
                    const data = {
                        event_id: event_id,
                        event_description: event_description
                    };

                    const payload = {
                        data: {
                            type: 'event_update',
                            content: JSON.stringify(data)
                        }
                    };
                    sendToScope(event_audience.split(','), payload, function(err) {
                        if (err) {
                            return res.send({
                                error: true,
                                mssg: 'error saving changes',
                                reload: false
                            });
                        } else {
                            return res.send({
                                error: false,
                                mssg: 'success',
                                reload: false
                            });
                        }
                    });
                }
            });

        });
    });

    router.post('/android/signin', (req, res) => {
        if (!req.body) return res.sendStatus(400);
        const email = req.body.email;
        const college = req.body.college;
        var pin = Math.floor(Math.random() * 9000) + 1000;
        sendVerificationMail(email, pin, function(error) {
            if (error) return res.status(200).json({
                error: true,
                mssg: error
            });

            const JWTToken = jwt.sign({
                    email: email,
                    pin: pin,
                    college
                },
                APP_SECRET_KEY, {
                    expiresIn: '2h'
                });
            return res.status(200).json({
                error: false,
                token: JWTToken
            });
        });
    });

    router.post('/android/signin/verify', (req, res) => {
        var token = req.headers['x-access-token'];
        if (!token) return res.status(200).send({
            auth: false,
            mssg: 'No token provided.'
        });

        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err) return res.status(200).send({
                auth: false,
                message: err
            });
            if (decoded.pin == req.body.pin && decoded.email == req.body.email) {
                checkUserExists(decoded.email, (err, data) => {
                    if (!err) {
                        const JWTToken = jwt.sign({
                                email: req.body.email,
                                college: decoded.college
                            },
                            APP_SECRET_KEY, {
                                expiresIn: '7d'
                            });
                        return res.status(200).json({
                            error: false,
                            token: JWTToken,
                            data: data ? data : {}
                        });
                    } else {
                        return res.status(200).json({
                            error: true,
                            mssg: err
                        });
                    }
                });

            } else {
                return res.status(200).json({
                    error: true,
                    mssg: 'Not valid credentials!'
                });
            }
        });
    });

    router.post('/android/event/enroll', (req, res) => {
        var token = req.headers['x-access-token'];
        if (!token) return res.status(200).send({
            auth: false,
            mssg: 'No token provided'
        });
        var event_id = req.body.event_id;
        var user_email = req.body.email;
        var user_roll = req.body.roll_no;

        if (!event_id || !user_email || !user_roll) return res.status(200).send({
            error: true,
            message: 'invalid details'
        });

        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err) return res.status(200).send({
                auth: false,
                message: err
            });
            enrollEventDB(event_id, {
                user_email,
                user_roll
            }, function(err) {
                if (err) return res.status(200).send({
                    error: true,
                    message: err
                });
                return res.status(200).send({
                    error: false
                });
            });
        });
    });



    function enrollEventDB(event_id, user, callback) {
        dbo.collection(TABLE_EVENTS).updateOne({
            event_id: event_id
        }, {
            $addToSet: {
                event_enrollees: user
            }
        }, function(err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null);
            }
        });
    }

    router.post('/bulletins/create-bulletin', (req, res) => {
        var token = req.headers['x-access-token'];
        if (!token) return res.sendStatus(401);
        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err || req.body.email != decoded.email) return res.sendStatus(500);
            var creator = decoded.name;
            var creatorEmail = decoded.email;
            var belongs_to = decoded.college;
            var bulletin_id = creator + '-' + UID(6);
            var bulletin_name = req.body.name;
            var bulletin_description = req.body.description;
            var bulletin_audience = req.body.audience;

            saveFiles(req.files ? req.files : [], function(media, err) {
                if (err)
                    res.sendStatus(403);
                else {
                    saveBulletinToDB(bulletin_id, creator, creatorEmail, belongs_to, bulletin_name, bulletin_description, bulletin_audience, media, function(err) {
                        if (err) return res.sendStatus(403);
                        const data = {
                            bulletin_id: bulletin_id,
                            belongs_to: belongs_to,
                            creator_name: creator,
                            creator_email: creatorEmail,
                            bulletin_title: bulletin_name,
                            bulletin_description: bulletin_description,
                            bulletin_audience: bulletin_audience,
                            bulletin_media: media,
                            bulletin_reach: 0
                        };

                        const payload = {
                            data: {
                                type: 'bulletin',
                                content: JSON.stringify(data)
                            }
                        };
                        sendToScope(bulletin_audience.split(','), payload, function(err) {
                            if (err) return res.sendStatus(403);
                            else return res.status(200).json({
                                error: false
                            });
                        });
                    });
                }
            });
        });

    });

    function saveBulletinToDB(bulletin_id, creator, creatorEmail, belongs_to, bulletin_name, bulletin_description, bulletin_audience, media, callback) {
        var params = {
            bulletin_id: bulletin_id,
            belongs_to: belongs_to,
            creator: creator,
            bulletin_title: bulletin_name,
            bulletin_description: bulletin_description,
            bulletin_audience: bulletin_audience,
            bulletin_media: media,
            bulletin_reach: 0,
            bulletin_created: new Date()
        };
        dbo.collection(TABLE_BULLETINS).insertOne(params, function(err, data) {
            if (err) {
                return callback(err);
            }
            dbo.collection(TABLE_USERS_ADMIN).update({
                email: creatorEmail
            }, {
                $push: {
                    bulletins: bulletin_id
                },
                $set: {
                    hashsum: random()
                }
            }, function(err, result) {
                if (err) return callback(err);
                mail(creatorEmail, MAIL_EVENT_TITLE, MAIL_EVENT_TEXT + MAIL_EVENT_DEATILS_TITLE + bulletin_name + MAIL_EVENT_FOOTER, function(error) {
                    return callback(error);
                });
            });
        });
    }

    router.post('/notifications/create-notification', (req, res) => {
        var token = req.headers['x-access-token'];
        if (!token) return res.sendStatus(401);
        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err || req.body.email != decoded.email) return res.sendStatus(500);
            var creator = decoded.email.substring(0, decoded.email.lastIndexOf('@'));
            var creatorEmail = decoded.email;
            var belongs_to = 'MRIIRS';
            var notification_id = creator + '-' + UID(6);
            var notification_description = req.body.description;
            var notification_audience = req.body.audience;

            saveNotificationToDB(notification_id, creator, creatorEmail, belongs_to, notification_description, notification_audience, function(err) {
                if (err) return res.sendStatus(403);
                const data = {
                    notification_id: notification_id,
                    belongs_to: belongs_to,
                    creator_name: creator,
                    notification_description: notification_description,
                    notification_audience: notification_audience,
                    notification_reach: 0
                };

                const payload = {
                    data: {
                        type: 'notification',
                        content: JSON.stringify(data)
                    }
                };
                sendToScope(notification_audience.split(','), payload, function(err) {
                    if (err) return res.sendStatus(403);
                    else return res.status(200).json({
                        error: false
                    });
                });
            });
        });

    });

    router.post('/android/update-user-data', (req, res) => {
        var token = req.headers['x-access-token'];
        if (!token) return res.status(200).send({
            auth: false,
            mssg: 'No token provided'
        });
        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err) return res.status(200).send({
                auth: false,
                message: err
            });
            let roll_no = req.body.roll_no;
            let username = req.body.username;
            let email = req.body.email;
            let scope = req.body.scope;
            let college = req.body.college;

            dbo.collection(TABLE_USERS).replaceOne({
                roll_no: roll_no
            }, {
                roll_no,
                username,
                email,
                scope,
                college
            }, {
                upsert: true
            }, function(err, data) {
                if (err) {
                    return res.status(200).send({
                        error: true,
                        mssg: err
                    });
                } else {
                    return res.status(200).send({
                        error: false,
                        mssg: 'updated'
                    });
                }
            });

        });
    });

    router.post('/android/reach', (req, res) => {
        var token = req.headers['x-access-token'];
        if (!token) return res.status(200).send({
            auth: false,
            mssg: 'No token provided'
        });
        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err) return res.status(200).send({
                auth: false,
                message: err
            });
            var type = req.body.type;
            switch (type) {
                case '101':
                    var event_id = req.body.event_id;
                    if (event_id) {
                        updateEventReach(event_id, function(err) {
                            if (err) return res.status(200).send({
                                error: true,
                                message: err
                            });
                            return res.status(200).send({
                                error: false
                            });
                        });
                    } else {
                        return res.status(200).send({
                            error: true,
                            message: 'event id not specified'
                        });
                    }
                    break;
                case '102':
                    var bulletin_id = req.body.bulletin_id;
                    if (bulletin_id) {
                        updateBulletinReach(bulletin_id, function(err) {
                            if (err) return res.status(200).send({
                                error: true,
                                message: err
                            });
                            return res.status(200).send({
                                error: false
                            });
                        });
                    } else {
                        return res.status(200).send({
                            error: true,
                            message: 'bulletin id not specified'
                        });
                    }
                    break;
                case '103':
                    var notification_id = req.body.notification_id;
                    if (notification_id) {
                        updateNotificationReach(notification_id, function(err) {
                            if (err) return res.status(200).send({
                                error: true,
                                message: err
                            });
                            return res.status(200).send({
                                error: false
                            });
                        });
                    } else {
                        return res.status(200).send({
                            error: true,
                            message: 'notification id not specified'
                        });
                    }
                    break;
                default:
            }

        });
    });


    function saveNotificationToDB(notification_id, creator, creatorEmail, belongs_to, notification_description, notification_audience, callback) {
        var params = {
            notification_id: notification_id,
            belongs_to: belongs_to,
            creator: creator,
            creator_email: creatorEmail,
            notification_description: notification_description,
            notification_audience: notification_audience,
            notification_reach: 0
        };
        dbo.collection(TABLE_NOTIFICATIONS).insertOne(params, function(err, data) {
            if (err) {
                return callback(err);
            }
            dbo.collection(TABLE_USERS_ADMIN).update({
                email: creatorEmail
            }, {
                $push: {
                    notifications: notification_id
                },
                $set: {
                    hashsum: random()
                }
            }, function(err, result) {
                if (err) return callback(err);
                mail(creatorEmail, MAIL_EVENT_TITLE, MAIL_EVENT_TEXT + MAIL_EVENT_DEATILS_TITLE + notification_description + MAIL_EVENT_FOOTER, function(error) {
                    return callback(error);
                });
            });
        });
    }
    router.post('/android/event/check-enrolled', (req, res) => {
        var token = req.headers['x-access-token'];
        if (!token) return res.status(200).send({
            auth: false,
            mssg: 'No token provided'
        });
        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err) return res.status(200).send({
                auth: false,
                message: err
            });
            let event_id = req.body.event_id;
            let roll_no = req.body.roll_no;
            dbo.collection(TABLE_EVENTS).findOne({
                event_id: event_id,
                'event_enrollees.user_roll': roll_no
            }, (err, result) => {
                console.log(JSON.stringify(result));
                if (err) return res.status(200).send({
                    error: true,
                    message: err
                });
                if (result) {
                    return res.status(200).send({
                        error: false,
                        data: true
                    });
                } else {
                    return res.status(200).send({
                        error: false,
                        data: false
                    });
                }
            });
        });
    });


    function updateEventDB(event_id, event_description, event_audience, callback) {
        dbo.collection(TABLE_EVENTS).updateOne({
            event_id: event_id
        }, {
            $set: {
                event_description
            }
        }, function(err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null);
            }
        });
    }

    function updateEventReach(event_id, callback) {
        dbo.collection(TABLE_EVENTS).updateOne({
            event_id: event_id
        }, {
            $inc: {
                event_reach: 1
            }
        }, function(err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null);
            }
        });
    }

    function updateBulletinReach(bulletin_id, callback) {
        dbo.collection(TABLE_BULLETINS).updateOne({
            bulletin_id: bulletin_id
        }, {
            $inc: {
                bulletin_reach: 1
            }
        }, function(err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null);
            }
        });
    }

    function updateNotificationReach(notification_id, callback) {
        dbo.collection(TABLE_NOTIFICATIONS).updateOne({
            notification_id: notification_id
        }, {
            $inc: {
                notification_reach: 1
            }
        }, function(err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null);
            }
        });
    }


    function mail(reciever, subject, text, callback) {
        var mailOptions = {
            from: '"Campus Dock" <support@mycampusdock.com>',
            to: reciever,
            subject: subject,
            text: text
        };
        smtpTransport.sendMail(mailOptions, function(error, response) {
            callback(error);
        });
    }

    function sendVerificationMail(reciever, pin, callback) {
        var text = 'This is your verification PIN : ' + pin + '.\nThis PIN is valid for 2 hours only.\nNever share your PIN with anyone. If you didn\'t requested PIN, please ignore!';
        var subject = 'Verify your E-mail';
        mail(reciever, subject, text, function(error) {
            callback(error);
        });
    }

    function sendToScope(scopeArray, payload, callback) {
        let i;
        for (i = 0; i < scopeArray.length; i++) {
            admin.messaging().sendToTopic(scopeArray[i], payload)
                .then(function(response) {

                })
                .catch(function(error) {
                    console.log('Error sending message:', error);
                    callback(error);
                });
            if (i == scopeArray.length - 1) {
                callback(null);
            }
        }
    }

    function saveEventToDB(event_id, creator, creatorEmail, belongs_to, event_name, event_description, event_start, event_end, event_tags, event_audience, media, callback) {
        var params = {
            event_id: event_id,
            belongs_to: belongs_to,
            creator_name: creator,
            creator_email: creatorEmail,
            event_name: event_name,
            event_description: event_description,
            event_audience: event_audience,
            event_media: media,
            event_start: event_start,
            event_end: event_end,
            event_tags: event_tags,
            event_reach: 0
        };
        dbo.collection(TABLE_EVENTS).insertOne(params, function(err, data) {
            if (err) {
                return callback(err);
            }
            dbo.collection(TABLE_USERS_ADMIN).update({
                email: creatorEmail
            }, {
                $push: {
                    events: event_id
                },
                $set: {
                    hashsum: random()
                }
            }, function(err, result) {
                if (err) return callback(err);
                mail(creatorEmail, MAIL_EVENT_TITLE, MAIL_EVENT_TEXT + MAIL_EVENT_DEATILS_TITLE + event_name + MAIL_EVENT_FOOTER, function(error) {
                    callback(error);
                });
            });
        });
    }

    function saveFiles(files, callback) {
        var media = [];
        Object.entries(files).forEach(([key, value]) => {
            var filename = random() + '-' + value.name;
            var loc = __dirname + '/media/' + filename;
            media.push(filename);
            value.mv(loc, function(err) {
                if (err) callback(null, err);
            });
        });
        callback(media, null);
    }

    function UID(length) {
        var text = '';
        var possible = '0123456789ABCDEFGHIJKLMNO8PQRSTUVWXYZabcd8efghijklmnopqrstuvwxyz0123456789';

        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }
});

module.exports = router;

//TODO : FIX LOGIC OF COLLEGE ON ANDROID LOGIN