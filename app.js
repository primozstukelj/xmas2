var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var xmlparser = require('express-xml-bodyparser');
var logger = require('morgan');
var libxml = require("libxmljs");
const uuid = require('uuid');

var app = express();

const map = new Map();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//
// We need the same instance of the session parser in express and
// WebSocket server.
//
const sessionParser = session({
  saveUninitialized: false,
  secret: 'mamma mia',
  resave: false
});

// Session  
app.use(sessionParser);


app.use(logger('dev'));
app.use(express.json());
app.use(xmlparser());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


/* GET home page. */
app.get('/', (req, res, next) => {
  const id = uuid.v4();
  console.log(`Updating session for user ${id}`);
  req.session.userId = id;
  res.render('index');
});

/* POST home page. */
app.post('/', (req, res) => {
  console.log(req.rawBody)
  const xmlBody = libxml.parseXml(req.rawBody, { noent: true});
  var gchild = xmlBody.get('//msg');

  console.log(gchild.text());
  req.session.send = true;
  req.session.msg = gchild;
  res.render('index')
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  console.log('ps1');
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err);
  // render the error page
  console.log('ps3');
  res.status(err.status || 500);
  res.render('error');
});


var WebSocket = require('ws');

var wss = new WebSocket.Server({ rejectUnauthorized: false, clientTracking: false, noServer: true });

app.on('upgrade', function (request, socket, head) {
  console.log('Parsing session from request...');

  sessionParser(request, {}, () => {
    if (!request.session.userId) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    console.log('Session is parsed!');

    wss.handleUpgrade(request, socket, head, function (ws) {
      wss.emit('connection', ws, request);
    });
  });
});

wss.on('connection', function (ws, request) {
  const userId = request.session.userId;

  map.set(userId, ws);

  ws.on('message', function (message) {
    //
    // Here we can now use session parameters.
    //
    console.log(`Received message ${message} from user ${userId}`);
  });

  ws.on('close', function () {
    map.delete(userId);
  });
});




module.exports = app;
