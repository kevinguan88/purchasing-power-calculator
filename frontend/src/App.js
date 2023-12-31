import './App.css';
import Results from './Results.js';
import axios from 'axios';
import { useState } from 'react';
import { useEffect } from 'react';
import areaCode from './area-code.json';

//TODO: Reformat numbers and start working on UI

function App() {
  const [initialRender, setInitialRender] = useState(true);
  // const [salary, setSalary] = useState(0);
  // const [currentCity, setCurrentCity] = useState("");
  // const [comparingCity, setComparingCity] = useState("");
  
  //array containing the city codes and salary
  //data used to query the backend API
  const [reqData, setReqData] = useState([]); 
  const [adjustedSalary, setAdjustedSalary] = useState(0);
  
  const [comparingName, setComparingName] = useState("");

  // const [currentCpi, setCurrentCpi] = useState('');
  // const [comparingCpi, setComparingCpi] = useState('');

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

  //when the request data changes, it is used to call the backend
  useEffect(() => {
    if(!initialRender) {
      handleCalculations();
    }
    else {
      setInitialRender(false);
    }
  }, [reqData])

  //1st step in effect chain
  //fetches cpi data from BLS and sets variables 
  // useEffect(() => {
  //   if (!initialRender) {
  //     try {
  //       //daily limit is 500 requests
  //       axios.get(`https://api.bls.gov/publicAPI/v2/timeseries/data/CUUS${currentCity}SA0?registrationkey=${apiKey}`)
  //         .then(response => {
  //           if (response.data.status == "REQUEST_NOT_PROCESSED") {
  //             alert("Error: Exceeded daily request limit\nThe BLS's Public Data API only allows up to 500 daily requests.");
  //           }
  //           else {
  //             const current = response.data.Results.series[0].data[0].value;
  //             console.log(response.data.Results)
  //             try {
  //               axios.get(`https://api.bls.gov/publicAPI/v2/timeseries/data/CUUS${comparingCity}SA0?registrationkey=${apiKey}`)
  //                 .then(response => {
  //                   setCurrentCpi(current);
  //                   setComparingCpi(response.data.Results.series[0].data[0].value);
  //                 })
  //                 .catch(error => {
  //                   console.log(error);
  //                 });
  //             } catch (error) {
  //               console.log(error);
  //             }
  //           }
  //         })
  //         .catch(error => {
  //           console.log(error);
  //         });
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }
  //   else {
  //     setInitialRender(false);
  //   }
  // }, [currentCity, comparingCity, salary]);

  //step 2 in effect chain
  //calculates adjusted salary and sets variable
  // useEffect(() => {
  //   if (!initialRender) {
  //     setAdjustedSalary((salary / currentCpi) * comparingCpi);
  //   }
  //   else {
  //     setInitialRender(false);
  //   }
  // }, [currentCpi, comparingCpi])

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


  //gets users' selection and updates the state accordingly
  //after setting all data together they should be batched to update together
  const setData = () => {
    //the selectors themselves  
    const currentSelect = document.querySelector('#current-city');
    const comparingSelect = document.querySelector('#comparing-city');
    const salaryField = document.querySelector('.form-control');
    //the data in the selectors
    const currentChoice = currentSelect.options[currentSelect.selectedIndex].value;
    const comparingChoice = comparingSelect.options[comparingSelect.selectedIndex].value;
    const salaryAmount = salaryField.value;
    //array containing the data, used to query the backend
    console.log(currentChoice);
    console.log(comparingChoice);
    console.log(salaryAmount);

    const codesAndSalary = [currentChoice, comparingChoice, parseInt(salaryAmount.replace(/,/g, ''))];
    setReqData(codesAndSalary);
    setComparingName(comparingSelect.options[comparingSelect.selectedIndex].label);
    //remove everything below
    // setCurrentCity(currentChoice);
    // setComparingCity(comparingChoice);
    // setSalary(parseInt(salaryAmount.replace(/,/g, '')));
  }

  //formats salary input with commas and removes non-numeric characters
  const formatInput = () => {
    const input = document.querySelector('#salaryInput');
    let formattedNumber = input.value.replace(/,/g, '').replace(/\D/g, '');
    formattedNumber = Number(formattedNumber).toLocaleString();
    input.value = formattedNumber;
  }

//todo: create axios post request 
  const handleCalculations = async () => {
    console.log(reqData);
    let currentCity = reqData[0];
    let comparingCity = reqData[1];
    let salary = reqData[2];
      try {
        const response = await axios.post('http://localhost:3001/api/calculate', {
          currentCity,
          comparingCity,
          salary
        }, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        setAdjustedSalary(response.data.adjustedSalary);
      } catch (error) {
        console.log("Error in calculating: " + error);
      }
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
              <select className="form-select" id='current-city' defaultValue={'default'}>
                <option value="default" disabled hidden>Choose a City</option>
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