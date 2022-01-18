import regression from 'regression';
import { calculateError } from '../Extrapolation/ErrorCalculations.js';
export function calculateLinearRegression(inputData, noOfProjectionMonths, props) {
    const data = inputData;

    const noOfMonthsForProjection = noOfProjectionMonths;
    let actualMonths = data[data.length - 1].month;

    const result = regression.linear(initializeRegression(data));
    const gradient = result.equation[0];
    const yIntercept = result.equation[1];

    for (let x = 1; x <= actualMonths + noOfMonthsForProjection; x++) {
        if (x <= actualMonths) {
            data[x - 1].forecast = getLinearRegression(x, gradient, yIntercept);
        } else {
            data[x - 1] = { "month": x, "actual": null, "forecast": getLinearRegression(x, gradient, yIntercept) };
        }
    }
    calculateError(data, "linearRegressionError", props);
    props.updateState("linearRegressionData", data);
    // // Print the output
    // for (let y=1; y<=actualMonths+noOfMonthsForProjection; y++) {
    //     console.log(y+" = "+data[y-1].forecast);
    // }
}

function getLinearRegression(month,gradient,yIntercept) {
    return gradient * month + yIntercept;
}

function initializeRegression(data) {
    let tmpArray = new Array();
    for (let x = 0; x < data.length; x++) {
        tmpArray.push(new Array(data[x].month, data[x].actual));
    }
    return tmpArray;
}
