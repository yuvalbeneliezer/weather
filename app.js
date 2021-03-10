var createError = require('http-errors');
var express = require('express');
var path = require('path');
var async = require('async');
var logger = require('morgan');
var bodyParser = require("body-parser");
var mysql = require('mysql');
var weatherRouter = require('./routes/weather');
var app = express();

app.set('port', process.env.PORT || 3000);
var port = app.get('port');
// if(process.env.NODE_ENV === 'development') {
if(true) {
  console.log('Using development settings.');
  app.set('connection', mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: '3306',
    password: 'Yuvalbe12!'
  }));
}
if(process.env.NODE_ENV === 'production') {
  console.log('Using production settings.');
  app.set('connection', mysql.createConnection({
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    port: process.env.RDS_PORT}));
}


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use("/weather", weatherRouter);

// catch 404 and forward to error handler
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
  console.log(`Example app listening on port ${port}!`);
});



var client = app.get('connection');
async.series([
  function connect(callback) {
    client.connect(callback);
  },
  function clear(callback) {
    client.query('DROP DATABASE IF EXISTS weather', callback);
  },
  function create_db(callback) {
    client.query('CREATE DATABASE weather', callback);
  },
  function use_db(callback) {
    client.query('USE weather', callback);
  },
  function create_table(callback) {
    client.query('CREATE TABLE weather (' +
        'Longitude FLOAT NOT NULL, ' +
        'Latitude FLOAT NOT NULL, ' +
        'forecast_time datetime NOT NULL, ' +
        'Temperature_Celsius FLOAT NOT NULL, ' +
        'Precipitation_Rate FLOAT NOT NULL,' +
        ' INDEX `Longitude_index` (`Longitude`),' +
        ' INDEX `Latitude_index` (`Latitude`),' +
        ' INDEX `Temperature_Celsius_index` (`Temperature_Celsius`),' +
        ' INDEX `Precipitation_Rate_index` (`Precipitation_Rate`))'
        , callback);
  },
function insert_default(callback) {
  const fs = require("fs");
  const fastcsv = require("fast-csv");
  var CombinedStream = require('combined-stream');

  var combinedStream = CombinedStream.create();
  combinedStream.append(fs.createReadStream('file1.csv'));
  combinedStream.append(fs.createReadStream('file2.csv'));
  combinedStream.append(fs.createReadStream('file3.csv'));

  // let stream = fs.createReadStream("file1.csv");
  let csvData = [];
  let csvStream = fastcsv
      .parse()
      .on("data", function(data) {
        csvData.push(data);
      })
      .on("end", function() {
        // remove the first line: header
        csvData.shift();

        // open the connection
        let query =
            "INSERT INTO weather.weather (Longitude, Latitude, forecast_time, Temperature_Celsius, Precipitation_Rate ) VALUES ?";
        client.query(query, [csvData], (error, response) => {
          console.log(error || response);
            });
        });
  combinedStream.pipe(csvStream);
  }
], function (err, results) {
  if (err) {
    console.log('Exception initializing database.');
    throw err;
  } else {
    console.log('Database initialization complete.');
  }
});

module.exports = app;