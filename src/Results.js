import React from 'react';

function Results(props) {

    const {adjustedSalary, hidden, comparingName} = props;

    if (hidden) {
        return null;
    }

    return (
        <div id="results">
            <p>
                The equivalent salary in {comparingName} is: 
            </p>
            <h3>${parseInt(adjustedSalary).toLocaleString()}</h3>
        </div>
    )
}

export default Results;