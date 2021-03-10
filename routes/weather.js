var express = require("express");
var router = express.Router();
const DButils = require("../DButils");

router.get("/data", function(req, res,next) {
  try {
    const {lon, lat} = req.query;
    if (!lon || !lat) {
      res.status(400).send({message: "Could not find lon and lat"});
    }
    res.app.get('connection').query(`SELECT * FROM weather.weather WHERE Longitude = ${lon} and Latitude = ${lat}`,
        function (err, rows) {
          if (err) {
            res.send(err);
          } else {
            console.log(JSON.stringify(rows));
            res.send(getJsonResponseForGetData(rows));
          }
        });
  }
  catch (error) {
      next(error);
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

router.get("/summarize", function(req, res) {
  const {lon, lat} = req.query;
  DButils.execQuery(`SELECT max(Temperature_Celsius) as max_Temperature ,min(Temperature_Celsius) as min_Temperature,avg(Temperature_Celsius) as avg_Temperature, max(Precipitation_Rate) as max_Precipitation ,min(Precipitation_Rate) as min_Precipitation,avg(Precipitation_Rate) as avg_Precipitation From weather.weather WHERE Longitude = ${lon} and Latitude = ${lat}`)
      .then((response) =>res.send(getJsonResponseForSummarize(response)[0]))
      .catch((error) => console.log(error.message));
});

function getJsonResponseForSummarize(response) {
  return response.map((response) => {
    // const {
    //   max_Temperature: max_Temperature,
    //   min_Temperature: min_Temperature,
    //   avg_Temperature: avg_Temperature,
    //   max_Precipitation: max_Precipitation,
    //   min_Precipitation: min_Precipitation,
    //   avg_Precipitation: avg_Precipitation
    // } = response;
    return {
      max:{
        Temperature: response.max_Temperature,
        Precipitation: response.max_Precipitation,
      },
      min:{
        Temperature: response.min_Temperature,
        Precipitation: response.min_Precipitation,
      },
      avg:{
        Temperature: response.avg_Temperature,
        Precipitation: response.avg_Precipitation,
      }
    };
  });
}
module.exports = router;
