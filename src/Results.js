import React from 'react';

function Results(props) {

    const {adjustedSalary, hidden} = props;

    if (hidden) {
        return null;
    }

    return (
        <div id="results">
            <p>
                Your equivalent salary is: ${parseInt(adjustedSalary).toLocaleString()}
            </p>
        </div>
    )
}

export default Results;