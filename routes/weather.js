var express = require("express");
var router = express.Router();

/**
 * This endpoint returns the weather forecast in a specific location for a specific time.
 * Query parameters: lon, lat.
 * lon - Longitude.
 * lat - Latitude.
 */
router.get("/data", function(req, res,next) {
    const {lon, lat} = req.query;
    if (!lon || !lat || isNaN(lon) || isNaN(lat)) {
      res.status(400).send({message: "Missing parameters lon or lat"});
    }
    else{
      res.app.get('connection').query(`SELECT * FROM weather.weather WHERE Longitude = ? and Latitude = ?`,[lon,lat],
          function (err, rows) {
            if (err) {
              res.send(err);
            } else {
              res.send(getJsonResponseForGetData(rows));
            }
          });
    }

});


function getJsonResponseForGetData(response) {
  return response.map((response) => {
    const {
      forecast_time: forecast_time,
      Temperature_Celsius: Temperature_Celsius,
      Precipitation_Rate: Precipitation_Rate
    } = response;
    return {
      forecastTime: forecast_time,
      Temperature: Temperature_Celsius,
      Precipitation: Precipitation_Rate,
    };
  });
}

/**
 * This endpoint returns returns the max,min,avg weather data for a specific location.
 * Query parameters: lon, lat.
 * lon - Longitude.
 * lat - Latitude.
 */
router.get("/summarize", function(req, res) {
    const {lon, lat} = req.query;
    if (!lon || !lat || isNaN(lon) || isNaN(lat) ) {
      res.status(400).send({message: "Missing parameters lon or lat"});
    }
    else{
      res.app.get('connection').query(`SELECT max(Temperature_Celsius) as max_Temperature , 
min(Temperature_Celsius) as min_Temperature,avg(Temperature_Celsius) as avg_Temperature, 
max(Precipitation_Rate) as max_Precipitation ,min(Precipitation_Rate) as min_Precipitation, 
avg(Precipitation_Rate) as avg_Precipitation From weather.weather WHERE Longitude = ? and Latitude = ?`,[lon,lat],
          function (err, rows) {
            if (err) {
              res.send(err);
            } else {
              res.send(getJsonResponseForSummarize(rows));
            }
          });
    }
});

function getJsonResponseForSummarize(response) {
  return response.map((response) => {
    const {
      max_Temperature: max_Temperature,
      min_Temperature: min_Temperature,
      avg_Temperature: avg_Temperature,
      max_Precipitation: max_Precipitation,
      min_Precipitation: min_Precipitation,
      avg_Precipitation: avg_Precipitation
    } = response;
    return {
      max:{
        Temperature: max_Temperature,
        Precipitation: max_Precipitation,
      },
      min:{
        Temperature: min_Temperature,
        Precipitation: min_Precipitation,
      },
      avg:{
        Temperature: avg_Temperature,
        Precipitation: avg_Precipitation,
      }
    };
  });
}
module.exports = router;
