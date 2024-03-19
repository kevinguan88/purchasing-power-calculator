require(‘dotenv’).config()
const express = require('express');
const app = express();
var cron = require('node-cron');
var mysql = require('mysql2');
const axios = require('axios');
const areaCode = require('./area-code.json')
var cors = require('cors')
app.use(cors());
app.use(express.json()); // Parse JSON in the request body

const apiKey = process.env.API_KEY;

let currentId;


var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.SQL_PASS,
  database: "cpidb"
});

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

app.listen(3001, () => {
  console.log(`Server is running on port 3001`);
});


//array containing all area codes for cities, used for API calls
const areaCodeArray = Object.entries(areaCode).map(([key, value]) => ({
    name: key,
    code: value
  }));


const getCpi = (current, comparing, callback) => {
  let cpiArray = [];
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    
      con.query(`SELECT cpi FROM citycpi WHERE Code = '${current}'`, (err, result) => {
        if (err) throw err;
        console.log('Retrieved current CPI:', result);
        cpiArray[0] = result;
      });

      con.query(`SELECT cpi FROM citycpi WHERE Code = '${comparing}'`, (err, result) => {
        if (err) throw err;
        console.log('Retrieved comparing CPI:', result);
        cpiArray[1] = result;
      });
  })
  con.end();
  callback(cpiArray); //replaced return statement to account for async tasks; the queries
}

const adjustSalary = (currentCpi, comparingCpi, salary) => {
  return((salary / currentCpi) * comparingCpi);
}
//todo: define post endpoint method
app.post('/api/calculate', (req, res) => {
  try {
  console.log(req.body);
  const { currentCity, comparingCity, salary } = req.body;
  
  //todo: incorperate promises to handle the CPI data after its set
  let citiesCpi;
  
  getCpi(currentCity, comparingCity, cpiArray => {
    citiesCpi = cpiArray;
  });

  console.log("Retrieved Cities CPI: " + citiesCpi[0]);

  let adjustedSalary = adjustSalary(citiesCpi[0], citiesCpi[1], salary);

  console.log("Calculated adjusted salary: " + adjustedSalary);
  res.json({ adjustedSalary });
  } catch (error) {
    
    console.error('Error in /api/calculate:', error);
    res.status(500).json({ error: 'Internal Server Error' });

  }
});

console.log(adjustSalary(1,1,1));