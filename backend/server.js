const express = require('express');
const app = express();
var cron = require('node-cron');
var mysql = require('mysql2');
const axios = require('axios');
const areaCode = require('./area-code.json')

const apiKey = "8141847a89544b2db611b6c73eec32af";

let currentId;


var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Kevinbro8868",
  database: "cpidb"
});

//array containing all area codes for cities, used for API calls
const areaCodeArray = Object.entries(areaCode).map(([key, value]) => ({
    name: key,
    code: value
  }));

//updates the CPI data in the database every month
var updateCpi = cron.schedule('* * * 1 * *', () => {
  const fillDatabase = areaCodeArray.map(city => (
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        try {
          axios.get(`https://api.bls.gov/publicAPI/v2/timeseries/data/CUUS${city.code}SA0?registrationkey=${apiKey}`)
            .then(response => {
              let cpi = response.data.Results.series[0].data[0].value;
              console.log(cpi);
              var sql = `UPDATE citycpi SET cpi = (${cpi}) WHERE Code = '${city.code}'`;
              con.query(sql, function (err, result) {
                if (err) throw err;
                console.log(`CPI for ${city.name} (${city.code}) inserted: ${cpi}`);
              });
            })
            .catch(error => {
              console.log(error);
            });
          } catch (error) {
            console.log(error);
          }
        
      })
      
  )); 
});

const getCpi = (current, comparing) => {
  let cpiArray = [];
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    
      con.query(`SELECT cpi FROM citycpi WHERE Code = ${current}`, (err, result) => {
        if (err) throw err;
        console.log('Retrieved current CPI:', results);
        connection.end();
        cpiArray[0] = result;
      });

      con.query(`SELECT cpi FROM citycpi WHERE Code = ${comparing}`, (err, result) => {
        if (err) throw err;
        console.log('Retrieved comparing CPI:', results);
        connection.end();
        cpiArray[1] = result;
      });
  })
  return cpiArray;
}

const adjustSalary = (currentCpi, comparingCpi, salary) => {
  return((salary / currentCpi) * comparingCpi);
}
//todo: define post endpoint method
app.post('/api/calculate', (req, res) => {

  // Assuming input1 and input2 are sent in the request body as JSON
  const { currentCity, comparingCity, salary } = req.body;
  
  const citiesCpi = getCpi(currentCity, comparingCity);

  const adjustedSalary = adjustSalary(citiesCpi[0], citiesCpi[1], salary);

  res.json({ adjustedSalary });
});