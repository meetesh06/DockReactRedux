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
const TABLE_SCOPE = 'scopes';
const jwt = require('jsonwebtoken');
const random = require('hat');
const APP_SECRET_KEY = 'IaMnOtMeDiOcRe';
const MAIL_EVENT_TITLE = 'New Event Created';
const MAIL_EVENT_TEXT = 'You have successfully created a new Event.\n\n';
const MAIL_EVENT_DEATILS_TITLE = 'Event Title: ';
const MAIL_EVENT_FOOTER = '\nYou can check the event details on Web Portal.\nFor any technical issue, feel free to write at help@mycampusdock.com.';

const ObjectID = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://dock:D2ckD2ck@103.227.177.152:27017/dock';

const MAX_RETRIES_MESSAGING = 5; // each retry is done 1 second laterr
var jsonArr = [{
    foo: 'bar',
    qux: 'moo',
    poo: 123,
    stux: new Date()
}, {
    foo: 'bar',
    qux: 'moo',
    poo: 345,
    stux: new Date()
}];
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
    router.post('/web/enrolee-list-for-event', (req, res) => {
        var token = req.headers['x-access-token'];
        if (!token) return res.json({
            error: true,
            mssg: 'invalid token'
        });
        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err || req.body.email != decoded.email) return res.json({
                error: true,
                mssg: 'invalid token'
            });
            let event_id = req.body.event_id;

            dbo.collection(TABLE_EVENTS).findOne({
                event_id
            }, (err, data) => {
                if (err) return res.json({
                    error: true,
                    mssg: 'event not found'
                });
                if (data) {
                    if (data.event_enrollees && data.event_enrollees.length > 0) {
                        res.json({
                            error: false,
                            data: data.event_enrollees
                        });
                    } else {
                        res.json({
                            error: false,
                            data: []
                        });
                    }
                } else {
                    res.json({
                        error: true,
                        mssg: 'event not found'
                    });
                }
            });
        });

    });

    router.post('/android/get-data-for-scope-list', (req, res) => {
        var token = req.headers['x-access-token'];
        if (!token) return res.status(200).send({
            error: true,
            mssg: 'No token provided.'
        });

        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err) return res.status(200).send({
                error: true,
                message: err
            });
            const scope = req.body.scope; // comma seperated
            const type = parseInt(req.body.type);
            let CURRENT_TABLE = '';
            if (!scope) return res.status(200).send({
                error: true,
                message: 'no scope specified'
            });

            let params = {};

            switch (type) {
                case 0:
                    CURRENT_TABLE = TABLE_EVENTS;
                    params = {
                        'event_end': {
                            $gte: new Date()
                        }
                    };
                    break;
                case 1:
                    CURRENT_TABLE = TABLE_BULLETINS;
                    break;
                case 2:
                    CURRENT_TABLE = TABLE_NOTIFICATIONS;
                    break;
                default:
                    return res.status(200).send({
                        error: true,
                        message: 'invalid request'
                    });
            }
            dbo.collection(CURRENT_TABLE).find({
                    'audience_processed': {
                        '$in': scope.split(',')
                    },
                    ...params
                })
                .toArray((err, data) => {
                    if (err) return res.json({
                        error: true,
                        mssg: err
                    });
                    res.json({
                        error: false,
                        data: data
                    });
                });
        });
    });

    router.post('/android/check-scope-validity', (req, res) => {
        var token = req.headers['x-access-token'];
        if (!token) return res.status(200).send({
            error: true,
            mssg: 'No token provided.'
        });

        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err) return res.status(200).send({
                error: true,
                message: err
            });
            // let scope = JSON.parse(req.body.scope);
            let scope;
            try {
                scope = JSON.parse(req.body.scope);
            } catch (e) {
                return res.status(200).send({
                    error: true,
                    message: 'invalid scope object'
                });
            }
            const type = req.body.type;
            let toSearch = [];
            for (const key in scope) {
                toSearch.push(key);
            }
            if (toSearch.length == 0) return res.status(200).send({
                error: true,
                message: 'no valid scopes found'
            });
            if (scope && type) {
                let current_hash = 'd_hash';
                switch (parseInt(type)) {
                    case 0:
                        current_hash = 'event_hash';
                        break;
                    case 1:
                        current_hash = 'bulletin_hash';
                        break;
                    case 2:
                        current_hash = 'notification_hash';
                        break;
                    default:
                        return res.status(200).send({
                            error: true,
                            message: 'invalid request'
                        });
                }
                dbo.collection(TABLE_SCOPE).find({
                        'name': {
                            '$in': toSearch
                        }
                    })
                    .toArray((err, data) => {
                        if (err) return res.json({
                            error: true,
                            mssg: 'Internal error occured!'
                        });
                        if (data) {
                            let toSend = {}; // all the invalid scopes
                            let j;
                            for (j = 0; j < data.length; j++) {
                                if (scope[data[j].name] !== data[j][current_hash]) {
                                    toSend[data[j].name] = data[j][current_hash];
                                }
                            }
                            return res.json({
                                error: false,
                                data: toSend
                            });

                        } else {
                            return res.status(200).send({
                                error: true,
                                message: 'no valid scopes found'
                            });
                        }
                        // console.log(data);
                    });

            }
        });
    });

    router.post('/cdc/create-info', (req, res) => {
        var token = req.headers['x-access-token'];
        if (!token) return res.json({
            error: true,
            mssg: 'invalid token'
        });
        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err || req.body.email != decoded.email) return res.json({
                error: true,
                mssg: 'invalid token'
            });
            var creator = decoded.name;
            var creator_email = decoded.email;
            var belongs_to = decoded.college;

            var cdc_info_id = creator + '-' + UID(6);
            var cdc_info_title = req.body.title;
            var cdc_info_description = req.body.description;
            var cdc_info_audience = req.body.audience;

            let paramsToSend = {
                creator,
                creator_email,
                belongs_to,
                bulletin_id: cdc_info_id,
                bulletin_title: cdc_info_title,
                bulletin_description: cdc_info_description,
                bulletin_reach: [],
                important: true,
                bulletin_audience: cdc_info_audience,
                audience_processed: cdc_info_audience.split(','),
                creation_time: Date.now()
            };

            saveFiles(req.files ? req.files : [], function(media, err) {
                if (err)
                    res.json({
                        error: true,
                        mssg: 'error saving files'
                    });
                else {
                    paramsToSend['bulletin_media'] = media;
                    saveInfoToDB(paramsToSend, function(err) {
                        if (err) return res.json({
                            error: true,
                            mssg: 'error saving files'
                        });
                        res.json({
                            error: false
                        });

                        const payload = {
                            data: {
                                type: 'bulletin',
                                content: JSON.stringify(paramsToSend)
                            }
                        };
                        sendToScope(cdc_info_audience.split(','), payload, function(err) {
                            console.log('error sending ', err);
                        });
                    });
                }
            });
        });
    });

    router.post('/web/event-week-data-from-list', (req, res) => {
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
            if (decoded.email == req.body.email && req.body.event_list) {
                // get current weeks data
                const week_later_midnight = new Date();
                week_later_midnight.setDate(week_later_midnight.getDate() + 8);
                dbo.collection(TABLE_EVENTS).find({
                        'event_id': {
                            '$in': req.body.event_list
                        },
                        'creator_email': req.body.email,
                        'event_end': {
                            $lt: week_later_midnight
                        }
                    })
                    .sort({
                        '_id': -1
                    })
                    .toArray((err, data) => {
                        if (err) return res.json({
                            error: true,
                            mssg: 'Internal error occured!'
                        });
                        // console.log(data);
                        let i;
                        let toSend = [];
                        for (i = 0; i < data.length; i++) {
                            let start = new Date(data[i].event_start);
                            let end = new Date(data[i].event_end);
                            let event_range = start.getDate() + '/' + (start.getMonth() + 1) + '/' + start.getFullYear() + ' - ' + end.getDate() + '/' + (end.getMonth() + 1) + '/' + end.getFullYear();
                            toSend.push({
                                event_id: data[i].event_id,
                                event_name: data[i].event_title,
                                event_reach: data[i].event_reach,
                                event_enrollments: data[i].event_enrollees ? data[i].event_enrollees.lenght : 0,
                                event_end: data[i].event_end,
                                event_range
                            });
                        }
                        return res.json({
                            error: false,
                            data: toSend
                        });

                    });
            } else {
                res.json({
                    error: true,
                    mssg: 'invalid credentials'
                });
            }
        });
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
                    })
                    .sort({
                        'event_start': -1
                    })
                    .toArray((err, data) => {
                        if (err) return res.status(200).json({
                            error: true,
                            mssg: 'Internal error occured!'
                        });
                        res.status(200).json({
                            error: false,
                            data
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
                let info = req.body.info;
                let params = {
                    'bulletin_id': {
                        '$in': bulletin_list
                    },
                    important: {
                        $ne: true
                    }
                };
                if (info != undefined) {
                    params['important'] = true;
                }
                dbo.collection(TABLE_BULLETINS).find(params).sort({
                    _id: -1
                }).toArray((err, data) => {
                    if (err) return res.status(200).json({
                        error: true,
                        mssg: 'Internal error occured!'
                    });
                    var toSend = [];
                    var i;

                    for (var prop in data) {
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
        console.log(req.body);
        if (!token) return res.sendStatus(401);
        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err) return res.sendStatus(401);
            if (decoded.email == req.body.email) {
                let notification_list = req.body.notification_list;
                dbo.collection(TABLE_NOTIFICATIONS).find({
                        'notification_id': {
                            '$in': notification_list
                        }
                    })
                    .sort({
                        _id: -1
                    })
                    .toArray((err, data) => {
                        if (err) return res.status(200).json({
                            error: true,
                            mssg: 'Internal error occured!'
                        });
                        var toSend = [];
                        var i;
                        for (var prop in data) {
                            // if (prop == 50) break;
                            var dateExists = false;
                            let curr = new Date(new ObjectID(data[prop]._id).getTimestamp());
                            let ISTTime = new Date(curr.getTime() + (330 + curr.getTimezoneOffset()) * 60000);
                            for (i = 0; i < toSend.length; i++) {
                                let loc = new Date(toSend[i].date);
                                if ((loc.getDate() == curr.getDate()) && (loc.getMonth() == curr.getMonth())) {
                                    toSend[i]['reach'] = toSend[i]['reach'] + data[prop].notification_reach;
                                    toSend[i]['data'].push({
                                        description: data[prop].notification_description,
                                        reach: data[prop].notification_reach,
                                        audience: data[prop].notification_audience,
                                        id: data[prop].notification_id,
                                        name: 'created: ' + ISTTime.getHours() + ':' + ISTTime.getMinutes()
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
                                        name: 'created: ' + ISTTime.getHours() + ':' + ISTTime.getMinutes()
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
                    dbo.collection(TABLE_COLLEGES).findOne({
                        '_id': data.college
                    }, (err, dataH) => {
                        if (err) {
                            return res.sendStatus(402);
                        }
                        if (dataH.data_raw) {
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
                                    notifications: data.notifications ? data.notifications : [],
                                    hierarchy: dataH.data_raw
                                }
                            };
                            return res.status(200).json({
                                error: false,
                                token: JWTToken,
                                bundle: toSend
                            });
                        } else {
                            return res.sendStatus(402);
                        }

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
                data: decoded.email,
                name: decoded.name
            });
        });
    });

    router.post('/verify', (req, res) => {
        console.log(req.body);
        var token = req.headers['x-access-token'];
        if (!token) return res.sendStatus(401);
        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err) return res.sendStatus(401);
            if (decoded.email == req.body.email) {
                dbo.collection(TABLE_USERS_ADMIN).findOne({
                    email: req.body.email
                }, function(err, data) {
                    if (err) return res.sendStatus(401);

                    dbo.collection(TABLE_COLLEGES).findOne({
                        '_id': data.college
                    }, (err, dataH) => {
                        if (err) {
                            return res.sendStatus(402);
                        }
                        if (dataH.data_raw) {
                            const JWTToken = jwt.sign({
                                    email: decoded.email,
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
                                    notifications: data.notifications ? data.notifications : [],
                                    hierarchy: dataH.data_raw
                                }
                            };
                            return res.status(200).json({
                                error: false,
                                token: JWTToken,
                                bundle: toSend
                            });
                        } else {
                            return res.sendStatus(402);
                        }
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
        console.log(req.body);
        var token = req.headers['x-access-token'];
        if (!token) return res.sendStatus(401);
        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err || req.body.email != decoded.email) return res.sendStatus(500);

            let creator_name = decoded.name;
            let creator_email = decoded.email;
            let belongs_to = decoded.college;
            let event_id = creator_name + '-' + UID(6);
            let event_title = req.body.name;
            let event_description = req.body.description;
            let event_start = new Date(req.body.start);
            let event_end = new Date(req.body.end);

            let event_venue = req.body.venue;
            let event_team = req.body.team;
            let event_category = req.body.category;
            let event_tags = req.body.tags;

            let event_c1_name = req.body.c1_name;
            let event_c1_phone = req.body.c1_phone;
            let event_c2_name = req.body.c2_name;
            let event_c2_phone = req.body.c2_phone;
            let event_c3_name = req.body.c3_name;
            let event_c3_phone = req.body.c3_phone;

            let event_other_details = {
                event_coordinator_names: event_c1_name + ',' + event_c2_name + ',' + event_c3_name,
                event_coordinator_contact: event_c1_phone + ',' + event_c2_phone + ',' + event_c3_phone
            };

            let event_audience = req.body.audience;
            let timestamp = new Date();
            let creation_time = Date.now();

            const queryData = {
                creator_name,
                creator_email,
                belongs_to,
                event_id,
                event_title,
                event_description,
                event_start,
                event_end,
                event_venue,
                event_team,
                event_category,
                event_tags,
                event_other_details,
                timestamp,
                creation_time,
                event_audience,
                audience_processed: event_audience.split(','),
                event_reach: [],
                event_enrollees: []
            };

            saveFiles(req.files ? req.files : [], function(media, err) {
                if (err)
                    res.sendStatus(403);
                else {
                    queryData['event_media'] = media;
                    saveEventToDB(queryData, function(err) {
                        if (err) return res.sendStatus(403);
                        console.log('new event created', queryData[event_id]);
                        res.status(200).json({
                            error: false
                        });

                        const payload = {
                            data: {
                                type: 'event',
                                content: JSON.stringify(queryData)
                            }
                        };
                        sendToScope(queryData['audience_processed'], payload, function(err) {
                            if (!err)
                                console.log('sending to scope for event request');
                        });
                    });
                }
            });
        });

    });


    // router.post('/events/create-event', (req, res) => {
    //     var token = req.headers['x-access-token'];
    //     if (!token) return res.sendStatus(401);
    //     jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
    //         if (err || req.body.email != decoded.email) return res.sendStatus(500);
    //         console.log(req.body);
    //         var creator = decoded.name;
    //         var creatorEmail = decoded.email;
    //         var belongs_to = decoded.college;
    //         var event_id = creator + '-' + UID(6);
    //         var event_name = req.body.name;
    //         var event_description = req.body.description;
    //         var event_start = req.body.start;
    //         var event_end = req.body.end;
    //         var event_tags = req.body.tags;
    //         var event_audience = req.body.audience;
    //         saveFiles(req.files ? req.files : [], function(media, err) {
    //             if (err)
    //                 res.sendStatus(403);
    //             else {
    //                 saveEventToDB(event_id, creator, creatorEmail, belongs_to, event_name, event_description, event_start, event_end, event_tags, event_audience, media, function(err) {
    //                     if (err) return res.sendStatus(403);
    //                     const data = {
    //                         event_id: event_id,
    //                         belongs_to: belongs_to,
    //                         created_by: creator,
    //                         event_title: event_name,
    //                         event_description: event_description,
    //                         event_start: new Date(event_start),
    //                         event_end: new Date(event_end),
    //                         event_tags: event_tags,
    //                         event_audience: event_audience,
    //                         event_media: media,
    //                         event_reach: 0,
    //                         timestamp: Date.now()
    //                     };

    //                     const payload = {
    //                         data: {
    //                             type: 'event',
    //                             content: JSON.stringify(data)
    //                         }
    //                     };
    //                     sendToScope(event_audience.split(','), payload, function(err) {
    //                         if (err) return res.sendStatus(403);
    //                         else return res.status(200).json({
    //                             error: false
    //                         });
    //                     });
    //                 });
    //             }
    //         });
    //     });

    // });

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
                    res.send({
                        error: false,
                        mssg: 'success',
                        reload: false
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
            error: true,
            mssg: 'No token provided.'
        });

        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err) return res.status(200).send({
                error: true,
                message: err
            });
            if (decoded.pin == req.body.pin && decoded.email == req.body.email) {
                checkUserExists(decoded.email, (err, data) => {
                    if (!err) {
                        if (data) {
                            const token = jwt.sign({
                                    email: req.body.email,
                                    college: decoded.college,
                                    name: data.username,
                                    scope: data.scope
                                },
                                APP_SECRET_KEY, {
                                    expiresIn: '100d'
                                });
                        }
                        return res.status(200).json({
                            error: false,
                            token: token,
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
            error: true,
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
                error: true,
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

    function unenrollEventDB(event_id, roll_no, email, callback) {
        dbo.collection(TABLE_EVENTS).update({
            event_id: event_id,
        }, {
            $pull: {
                'event_enrollees': {
                    user_roll: roll_no,
                    user_email: email
                }
            }
        }, function(err, data) {
            if (err)
                callback(err);
            else
                callback(null);
        });
    }

    router.post('/android/event/unenroll', (req, res) => {
        var token = req.headers['x-access-token'];
        if (!token) return res.status(200).send({
            error: true,
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
                error: true,
                message: err
            });
            unenrollEventDB(event_id, user_roll, user_email, function(err) {
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

    function unenrollEventDB(event_id, roll_no, email, callback) {
        dbo.collection(TABLE_EVENTS).update({
            event_id: event_id,
        }, {
            $pull: {
                'event_enrollees': {
                    user_roll: roll_no,
                    user_email: email
                }
            }
        }, function(err, data) {
            if (err)
                callback(err);
            else
                callback(null);
        });
    }


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
            var creator_email = decoded.email;
            var belongs_to = decoded.college;
            var bulletin_id = creator + '-' + UID(6);
            var bulletin_title = req.body.name;
            var bulletin_description = req.body.description;
            var bulletin_audience = req.body.audience;

            let toSend = {
                creator,
                creator_email,
                belongs_to,
                bulletin_id,
                bulletin_title,
                bulletin_description,
                bulletin_audience,
                audience_processed: bulletin_audience.split(','),
                creation_time: Date.now(),
                bulletin_reach: []
            };

            saveFiles(req.files ? req.files : [], function(media, err) {
                if (err)
                    res.sendStatus(403);
                else {
                    toSend['bulletin_media'] = media;

                    saveBulletinToDB(toSend, function(err) {
                        console.log(err);
                        if (err) return res.sendStatus(403);
                        res.status(200).json({
                            error: false
                        });

                        const payload = {
                            data: {
                                type: 'bulletin',
                                content: JSON.stringify(toSend)
                            }
                        };
                        sendToScope(bulletin_audience.split(','), payload, function(err) {
                            if (err)
                                console.log('error sending');
                        });
                    });
                }
            });
        });

    });

    function saveBulletinToDB(toSend, callback) {
        dbo.collection(TABLE_BULLETINS).insertOne(toSend, function(err, data) {
            if (err) {
                return callback(err);
            }
            dbo.collection(TABLE_USERS_ADMIN).update({
                email: toSend['creator_email']
            }, {
                $push: {
                    bulletins: toSend['bulletin_id']
                },
                $set: {
                    hashsum: random()
                }
            }, function(err, result) {
                if (err) return callback(err);
                callback(null);
                updateScopeAsync(toSend['audience_processed'], 1);
                // mail(toSend['creator_email'], MAIL_EVENT_TITLE, MAIL_EVENT_TEXT + MAIL_EVENT_DEATILS_TITLE + toSend['bulletin_title'] + MAIL_EVENT_FOOTER, function(error) {
                //   return callback(error);
                // });
            });
        });
    }

    function saveInfoToDB(toSend, callback) {
        dbo.collection(TABLE_BULLETINS).insertOne(toSend, function(err, data) {
            if (err) {
                return callback(err);
            }
            dbo.collection(TABLE_USERS_ADMIN).update({
                email: toSend['creator_email']
            }, {
                $push: {
                    bulletins: toSend['bulletin_id']
                },
                $set: {
                    hashsum: random()
                }
            }, function(err, result) {
                if (err) return callback(err);
                callback(null);
                mail(toSend['creator_email'], MAIL_EVENT_TITLE, MAIL_EVENT_TEXT + MAIL_EVENT_DEATILS_TITLE + toSend['bulletin_title'] + MAIL_EVENT_FOOTER, function(error) {
                    updateScopeAsync(toSend['audience_processed'], 1);
                });
            });
        });
    }

    router.post('/notifications/create-notification', (req, res) => {
        var token = req.headers['x-access-token'];
        if (!token) return res.sendStatus(401);
        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err || req.body.email != decoded.email) return res.sendStatus(500);
            var creator = decoded.name;
            var creator_email = decoded.email;
            var belongs_to = decoded.college;
            var notification_id = creator + '-' + UID(6);
            var notification_description = req.body.description;
            var notification_audience = req.body.audience;
            let toSend = {
                creator,
                creator_email,
                belongs_to,
                notification_id,
                notification_description,
                notification_audience,
                audience_processed: notification_audience.split(','),
                notification_reach: [],
                creation_time: Date.now()
            };
            saveNotificationToDB(toSend, function(err) {
                if (err) return res.sendStatus(403);
                res.status(200).json({
                    error: false
                });

                const payload = {
                    data: {
                        type: 'notification',
                        content: JSON.stringify(toSend)
                    }
                };
                sendToScope(notification_audience.split(','), payload, function(err) {
                    if (err) console.log(err);
                });
            });
        });

    });

    router.post('/android/event/feedback', (req, res) => {
        return res.status(200).send({
            error: false,
            mssg: 'Feedback Done'
        })
    });

    router.post('/android/update-user-data', (req, res) => {
        var token = req.headers['x-access-token'];
        if (!token) return res.status(200).send({
            error: true,
            mssg: 'No token provided'
        });
        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err) return res.status(200).send({
                error: true,
                message: err
            });
            let roll_no = req.body.roll_no;
            let username = req.body.username;
            let email = req.body.email;
            let scope = req.body.scope;
            let college = req.body.college;
            let gender = req.body.gender;

            dbo.collection(TABLE_USERS).replaceOne({
                roll_no: roll_no
            }, {
                roll_no,
                username,
                gender,
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
                    const JWTToken = jwt.sign({
                            email,
                            username,
                            roll_no,
                            college,
                            scope
                        },
                        APP_SECRET_KEY, {
                            expiresIn: '100d'
                        });
                    return res.status(200).send({
                        error: false,
                        token: JWTToken,
                        mssg: 'updated'
                    });
                }
            });

        });
    });


    function saveNotificationToDB(toSend, callback) {
        dbo.collection(TABLE_NOTIFICATIONS).insertOne(toSend, function(err, data) {
            if (err) {
                return callback(err);
            }
            dbo.collection(TABLE_USERS_ADMIN).update({
                email: toSend['creator_email']
            }, {
                $push: {
                    notifications: toSend['notification_id']
                },
                $set: {
                    hashsum: random()
                }
            }, function(err, result) {
                if (err) return callback(err);
                callback(null);
                updateScopeAsync(toSend['audience_processed'], 2);
                // mail(toSend['creator_email'], MAIL_EVENT_TITLE, MAIL_EVENT_TEXT + MAIL_EVENT_DEATILS_TITLE + toSend['notification_description'] + MAIL_EVENT_FOOTER, function(error) {
                // });
            });
        });
    }
    router.post('/android/event/check-enrolled', (req, res) => {
        var token = req.headers['x-access-token'];
        if (!token) return res.status(200).send({
            error: true,
            mssg: 'No token provided'
        });
        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err) return res.status(200).send({
                error: true,
                mssg: err
            });
            let event_id = req.body.event_id;
            let roll_no = req.body.roll_no;
            if (!roll_no || !event_id)
                return res.status(200).send({
                    error: true,
                    mssg: 'invalid details'
                });
            dbo.collection(TABLE_EVENTS).findOne({
                'event_id': event_id,
                'event_enrollees': {
                    $elemMatch: {
                        user_email: decoded.email,
                        user_roll: roll_no
                    }
                }
            }, (err, result) => {
                if (err) return res.status(200).send({
                    error: true,
                    message: err
                });
                console.log(result);
                if (result) {
                    return res.status(200).send({
                        error: false,
                        data: true,
                        reach: result.reach
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
                updateScopeAsync(event_audience.split(','), 0);
                callback(null);
            }
        });
    }


    router.post('/android/reach', (req, res) => {
        var token = req.headers['x-access-token'];
        if (!token) return res.status(200).send({
            error: true,
            mssg: 'No token provided'
        });
        jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
            if (err) return res.status(200).send({
                error: true,
                message: err
            });
            var type = req.body.type + '';
            var id = req.body.id;
            var event_id = id;
            let payload = {
                email: decoded.email,
                name: decoded.name,
                timestamp: new Date()
            };
            switch (type) {
                case '101':
                    if (event_id) {
                        updateEventReach(event_id, payload, function(err) {
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
                    var bulletin_id = id;
                    console.log('bulletin reach request', bulletin_id);
                    if (bulletin_id) {
                        updateBulletinReach(bulletin_id, payload, function(err) {
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
                    var notification_id = id;
                    if (notification_id) {
                        updateNotificationReach(notification_id, payload, function(err) {
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
                    return res.status(200).send({
                        error: true,
                        message: 'unknown request'
                    });
            }

        });
    });

    function updateEventReach(event_id, payload, callback) {
        dbo.collection(TABLE_EVENTS).updateOne({
            event_id: event_id
        }, {
            $addToSet: {
                event_reach: payload
            }
        }, function(err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null);
            }
        });
    }

    function updateBulletinReach(bulletin_id, payload, callback) {
        dbo.collection(TABLE_BULLETINS).updateOne({
            bulletin_id: bulletin_id
        }, {
            $addToSet: {
                bulletin_reach: payload
            }
        }, function(err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null);
            }
        });
    }

    function updateNotificationReach(notification_id, payload, callback) {
        dbo.collection(TABLE_NOTIFICATIONS).updateOne({
            notification_id: notification_id
        }, {
            $addToSet: {
                notification_reach: payload
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

    function sendToIndividual(scope, payload, retries) {
        if (retries == MAX_RETRIES_MESSAGING) {
            console.log('scope: ' + scope + ' permanently failed');
            return;
        }
        admin.messaging().sendToTopic(scope, payload)
            .then(function(response) {
                console.log(response);
            })
            .catch(function(error) {
                console.log(error);
                setTimeout(() => {
                    sendToIndividual(scope, payload, retries + 1);
                }, 1000);
            });
    }

    function sendToScope(scopeArray, payload, callback) {
        console.log('scope request sent');
        let currentQueue = [...scopeArray];
        let sending = false;
        let i = 0;
        callback(null);
        console.log(currentQueue);
        console.log(currentQueue.length);

        for (i = 0; i < currentQueue.length; i++) {
            sendToIndividual(currentQueue[i], payload, 0);
        }

        // while(currentQueue.length > 0) {
        // console.log('while loop', currentQueue);
        // console.log('sending ', sending);

        // if (!sending){ 
        //   sending = true;
        //   currentQueue.shift();
        //   admin.messaging().sendToTopic(currentQueue[0], payload)
        //     .then(function(response) {
        //       console.log(response);
        //       currentQueue.shift();
        //       sending = false;
        //     })
        //     .catch(function(error) {
        //       console.log('scope error: ', currentQueue[0]);
        //       console.log('Error sending message:', error);
        //     });
        // }
        // }
    }

    // function saveEventToDB(event_id, creator, creatorEmail, belongs_to, event_name, event_description, event_start, event_end, event_tags, event_audience, media, callback) {
    //     var params = {
    //         event_id: event_id,
    //         belongs_to: belongs_to,
    //         creator_name: creator,
    //         creator_email: creatorEmail,
    //         event_name: event_name,
    //         event_description: event_description,
    //         event_audience: event_audience,
    //         audience_processed: event_audience.split(','),
    //         event_media: media,
    //         event_start: new Date(event_start),
    //         event_end: new Date(event_end),
    //         event_tags: event_tags,
    //         event_reach: 0,
    //         timestamp: Date.now()
    //     };
    //     dbo.collection(TABLE_EVENTS).insertOne(params, function(err, data) {
    //         if (err) {
    //             return callback(err);
    //         }
    //         dbo.collection(TABLE_USERS_ADMIN).update({
    //             email: creatorEmail
    //         }, {
    //             $push: {
    //                 events: event_id
    //             },
    //             $set: {
    //                 hashsum: random()
    //             }
    //         }, function(err, result) {
    //             if (err) return callback(err);
    //             mail(creatorEmail, MAIL_EVENT_TITLE, MAIL_EVENT_TEXT + MAIL_EVENT_DEATILS_TITLE + event_name + MAIL_EVENT_FOOTER, function(error) {
    //                 updateScopeAsync(event_audience.split(','), 0);
    //                 callback(error);
    //             });
    //         });
    //     });
    // }

    function saveEventToDB(queryData, callback) {
        dbo.collection(TABLE_EVENTS).insertOne(queryData, function(err, data) {
            if (err) {
                return callback(err);
            }
            dbo.collection(TABLE_USERS_ADMIN).update({
                email: queryData['creator_email']
            }, {
                $push: {
                    events: queryData['event_id']
                },
                $set: {
                    hashsum: random()
                }
            }, function(err, result) {
                if (err) return callback(err);
                callback(null);
                updateScopeAsync(queryData['event_audience'].split(','), 0);
                // mail(queryData['creator_email'], MAIL_EVENT_TITLE, MAIL_EVENT_TEXT + MAIL_EVENT_DEATILS_TITLE + queryData['event_title'] + MAIL_EVENT_FOOTER, function(error) {
                //   console.log('event_mail_failed',error);
                // });
            });
        });
    }

    function saveFiles(files, callback) {
        var media = [];
        let err = false;
        Object.entries(files).forEach(([key, value]) => {
            var filename = random() + '-' + value.name;
            var loc = __dirname + '/media/' + filename;
            media.push(filename);
            value.mv(loc, function(err) {
                if (err) err = true;
            });
        });
        if (err)
            callback(null, err);
        else
            callback(media, null);
    }

    function UID(length) {
        var text = '';
        var possible = '0123456789ABCDEFGHIJKLMNO8PQRSTUVWXYZabcd8efghijklmnopqrstuvwxyz0123456789';

        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    function updateScopeAsync(audience, type) {
        let i;
        // 0 - event
        // 1 - bulletin
        // 2 - notification
        let current_hash = 'd_hash';
        switch (type) {
            case 0:
                current_hash = 'event_hash';
                break;
            case 1:
                current_hash = 'bulletin_hash';
                break;
            case 2:
                current_hash = 'notification_hash';
                break;
            default:
                return;
        }
        let params = {};
        params[current_hash] = UID(20);
        // console.log(params);
        for (i = 0; i < audience.length; i++) {
            dbo.collection(TABLE_SCOPE).update({
                'name': audience[i]
            }, {
                $set: params
            }, {
                upsert: true
            });
        }
    }
});

module.exports = router;