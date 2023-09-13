import './App.css';
import Results from './Results.js';
import axios from 'axios';
import { useState } from 'react';
import { useEffect } from 'react';
import areaCode from './area-code.json';

//TODO: Reformat numbers and start working on UI

function App() {
  const [initialRender, setInitialRender] = useState(true);
  const [salary, setSalary] = useState(0);
  const [adjustedSalary, setAdjustedSalary] = useState(0);
  const [currentCity, setCurrentCity] = useState("");
  const [comparingCity, setComparingCity] = useState("");
  const [comparingName, setComparingName] = useState("");

  const [apiKey, setApiKey] = useState("8141847a89544b2db611b6c73eec32af");

  const [currentCpi, setCurrentCpi] = useState('');
  const [comparingCpi, setComparingCpi] = useState('');

  const [resultHidden, setHidden] = useState(true);

  const areaCodeArray = Object.entries(areaCode).map(([key, value]) => ({
    name: key,
    code: value
  }));

  const options = areaCodeArray.map(city => (
    <option key={city.name} value={city.code}>
      {city.name}
    </option>
  ));

  //1st step in effect chain
  //fetches cpi data from BLS and sets variables 
  useEffect(() => {
    if (!initialRender) {
      try {
        //daily limit is 500 requests
        axios.get(`https://api.bls.gov/publicAPI/v2/timeseries/data/CUUS${currentCity}SA0?registrationkey=${apiKey}`)
          .then(response => {
            const current = response.data.Results.series[0].data[0].value;
            try {
              axios.get(`https://api.bls.gov/publicAPI/v2/timeseries/data/CUUS${comparingCity}SA0?registrationkey=${apiKey}`)
                .then(response => {
                  setCurrentCpi(current);
                  setComparingCpi(response.data.Results.series[0].data[0].value);
                })
                .catch(error => {
                  console.log(error);
                });
            } catch (error) {
              console.log(error);
            }
          })
          .catch(error => {
            console.log(error);
          });
      } catch (error) {
        console.log(error);
      }
    }
    else {
      setInitialRender(false);
    }
  }, [currentCity, comparingCity, salary]);

  //step 2 in effect chain
  //calculates adjusted salary and sets variable
  useEffect(() => {
    if (!initialRender) {
      setAdjustedSalary((salary / currentCpi) * comparingCpi);
    }
    else {
      setInitialRender(false);
    }
  }, [currentCpi, comparingCpi])

  //step 3 in effect chain
  //renders results onto page
  useEffect(() => {
    if (!initialRender) {
      setHidden(false);
      console.log(adjustedSalary);
    }
    else {
      setInitialRender(false);
    }
  }, [adjustedSalary])

  useEffect(() => {
    if (!initialRender) {
      setHidden(false);
      console.log(comparingName);
    }
    else {
      setInitialRender(false);
    }
  }, [comparingName])


  //gets users' selection and updates the state accordingly
  //after setting all data together they should be batched to update together
  const setData = () => {
    const currentSelect = document.querySelector('#current-city');
    const comparingSelect = document.querySelector('#comparing-city');
    const salaryField = document.querySelector('.form-control');
    const currentChoice = currentSelect.options[currentSelect.selectedIndex].value;
    const comparingChoice = comparingSelect.options[comparingSelect.selectedIndex].value;
    const salaryAmount = salaryField.value;
    setCurrentCity(currentChoice);
    setComparingCity(comparingChoice);
    setComparingName(comparingSelect.options[comparingSelect.selectedIndex].label);
    setSalary(parseInt(salaryAmount.replace(/,/g, '')));
  }

  //formats salary input with commas and removes non-numeric characters
  const formatInput = () => {
    const input = document.querySelector('#salaryInput');
    let formattedNumber = input.value.replace(/,/g, '').replace(/\D/g, '');
    formattedNumber = Number(formattedNumber).toLocaleString();
    input.value = formattedNumber;
  }

  return (
    <div className="App">
      <nav className='navbar navbar-expand-lg bg-body-tertiary'>
        <div className='container-fluid'>
          <a className='navbar-brand'>Geographical Cost of Living Calculator</a>
        </div>
      </nav>
      <div className='selection container py-4'>
        <form>
          <label htmlFor="current-city" className="form-label">My salary is</label>
          <div className="input-group mb-3">
            <span className="input-group-text">$</span>
            <input id='salaryInput' type="text" className="form-control" aria-label="Amount (to the nearest dollar)" onInput={formatInput} />
            <span className="input-group-text">.00</span>
          </div>
          <div className='row'>
            <div className='col'>
              <label htmlFor="current-city" className="form-label">I live in</label>
              <select className="form-select" id='current-city'>
                <option value="" disabled selected hidden>Choose a City</option>
                {options}
              </select>
            </div>
            <div className='col'>
              <label htmlFor="current-city" className="form-label">What's my salary in ___?</label>
              <select className="form-select" id='comparing-city' defaultValue={'default'}>
                <option value="default" disabled hidden>Choose a City</option>
                {options}
              </select>
            </div>
          </div>
          <button type='button' className='btn btn-primary my-3' onClick={setData}> {/*new method that calls the set and renders results*/}
            Calculate
          </button>
        </form>
        <div id='results-container'>
          {/*Render results page here*/}
          <Results adjustedSalary={adjustedSalary} hidden={resultHidden} comparingName={comparingName} />
        </div>
      </div>
    </div>
  );
}

export default App;
