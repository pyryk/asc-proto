// adapted from https://gist.github.com/sbrekken/1999230

var express = require('express'),
    mongoq = require('mongoq'),
    config = require('./config');
 
var db = mongoq(config.db); // Initialize database
 
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
    event.id = Date.now().toString(); // You probably want to swap this for something like https://github.com/dylang/shortid
 
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
 
// Delete event
app.del('/api/events/:id', function(req, res) {
    db.collection('events').remove({id: req.params.id}, {safe: true}).done(function(success) {
        res.json(success ? 200 : 404);
    });
});
 
app.listen(config.port);