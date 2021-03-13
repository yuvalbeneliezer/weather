var async = require('async');
const fastcsv = require("fast-csv");
const fs = require("fs");

function insert_csv_file(file,client){
  let stream_file1 = fs.createReadStream(file);

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
  stream_file1.pipe(csvStream);
}
function insert_all_data_to_db(client){
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
            insert_csv_file('file1.csv',client);
            insert_csv_file('file2.csv',client);
            insert_csv_file('file3.csv',client);
        }
    ], function (err, results) {
        if (err) {
            console.log('Exception initializing database.');
            console.log(err);
        } else {
            console.log('Database initialization complete.');
        }
    });
}

module.exports = {
     insert_all_data_to_db
};

