var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require("body-parser");
var mysql = require('mysql');
var weatherRouter = require('./routes/weather');
var data_insertion = require('./insert_data_to_db');
var app = express();

app.set('port', process.env.PORT || 3000);
var port = app.get('port');

app.set('connection', mysql.createConnection({
   host: process.env.RDS_HOSTNAME,
   user: process.env.RDS_USERNAME,
   password: process.env.RDS_PASSWORD,
   port: process.env.RDS_PORT}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use("/weather", weatherRouter);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port, () => {
  console.log(`This app listening on port ${port}`);
});

// Data initialization only for development purpose, on a production environment it shouldn't be called .
data_insertion.insert_all_data_to_db(app.get('connection'));

module.exports = app;