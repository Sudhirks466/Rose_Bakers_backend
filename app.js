var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");
var logger = require('morgan');
var cors = require("cors");

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const customerRouter = require('./routes/customer.routes');
const webRouter = require('./routes/web.routes');
const adminRouter = require('./routes/admin.routes');
const sellerRouter = require('./routes/seller.routes');

require("dotenv").config();
require("./src/config/db");

var app = express();

const allowedOrigins = [  
  "http://localhost:4200",
  "http://127.0.0.1:4200",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    return callback(new Error("Not allowed by CORS: " + origin), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
}));

app.options("*", cors());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

app.use('/', indexRouter);
app.use('/', usersRouter);
app.use('/api/auth', indexRouter);
app.use('/users', usersRouter);
app.use('/api/customer', customerRouter);
app.use('/api/web', webRouter); 
app.use('/api/admin', adminRouter);
app.use('/api/seller', sellerRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
