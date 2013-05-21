// adapted from https://gist.github.com/sbrekken/1999230

var express = require('express'),
    mongoq = require('mongoq'),
    ShortId = require('shortid'),
    config = require('./config'),
    nodemailer = require("nodemailer");
 
var db = mongoq(config.db); // Initialize database
var sendmail = nodemailer.createTransport("SMTP", {
    service: 'Gmail',
    auth: {
        user: config.mailuser,
        pass: config.mailpass
    }
});
 
var app = express();
app.use(express.bodyParser()); // Automatically parse JSON in POST requests
app.use(express.static(__dirname + '/client')); // Serve static files from public (e.g http://localhost:8080/index.html)
app.use(express.errorHandler({dumpExceptions: true, showStack: true})); // Dump errors

// allow cors
app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });
 
// Add event
app.post('/api/events', function(req, res) {
    var event = req.body;
    event.id = ShortId.generate();
 
    db.collection('events').insert(event, {safe: true}).done(function(event) {
        res.json(event[0], 201);
    });
});
 
// List events (accepts skip and limit query parameters)
app.get('/api/events', function(req, res) {
    db.collection('events').find().skip(req.query.skip || 0).limit(req.query.limit || 0).toArray().done(function(event) {
        res.json(event);
    });
});
 
// Read event
app.get('/api/events/:id', function(req, res) {
    db.collection('events').findOne({id: req.params.id}).done(function(event) {
        res.json(event);
    });
});
 
// Update event (supports partial updates, e.g only send one field or all)
app.put('/api/events/:id', function(req, res) {
    var event = req.body;

    // TODO do not update attendees and attending
    event.attending = undefined;
 
    db.collection('events').update({id: req.params.id}, {$set: event}, {safe: true}).done(function(success) {
        res.json(success ? 200 : 404);
    });
});

// Attend (or cancel attendance) to an event (makes attendees +1/-1)
app.post('/api/events/:id/attend', function(req, res) {
    var operation, data = req.body;

    operation = {};
    if (data.attends === true) {
        
    } else {
        console.log('no');
    }
    operation[data.attends === true ? '$push' : '$pull'] = {attendees: data.user};
 
    db.collection('events').update({id: req.params.id}, operation, {safe: true}).then(function(success) {
        res.json(success ? 200 : 404);
    }, function() { console.log(arguments) });
});

app.post('/api/events/:id/invite', function(req, res) {
    var data = req.body;
    db.collection('events').findOne({id: req.params.id}).done(function(event) {
        for (var i in data.emails) {
            (function(i) {
                var mailoptions = {
                    from: 'Event Engine <noreply@event-engine.herokuapp.com>',
                    to: data.emails[i],
                    subject: event.name + ' ' + event.date_display,
                    text: 'Hi,\n' + event.name + ' is organized ' + event.date_display + ' at ' + event.location + '. Join the event at http://' + req.headers.host + '/#details/' + event.id
                }
                console.log(req.headers);
                sendmail.sendMail(mailoptions, function(error, response) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Message sent to ' + data.emails[i]);
                    }
                })
            })(i);
        }    
        res.json({success: true});
    });
    

});
 
// Delete event
app.del('/api/events/:id', function(req, res) {
    db.collection('events').remove({id: req.params.id}, {safe: true}).done(function(success) {
        res.json(success ? 200 : 404);
    });
});
 
app.listen(config.port);