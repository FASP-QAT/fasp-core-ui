import { calculateError } from '../Extrapolation/ErrorCalculations.js';
export function calculateMovingAvg(inputData, noOfMonths, noOfProjectionMonths, props) {

    const data = inputData;

    const monthsForMovingAverage = noOfMonths;
    const noOfMonthsForProjection = noOfProjectionMonths;
    let actualMonths = data[data.length - 1].month;
    for (let x = 1; x <= actualMonths + noOfMonthsForProjection; x++) {
        if (x <= actualMonths) {
            data[x - 1].forecast = getMovingAverage(x, monthsForMovingAverage, actualMonths, data);
        } else {
            data[x - 1] = { "month": x, "actual": null, "forecast": getMovingAverage(x, monthsForMovingAverage, actualMonths, data) };
        }
    }
    calculateError(data, "movingAvgError", props);
    props.updateState("movingAvgData", data);
    // for (let y=1; y<=actualMonths+noOfMonthsForProjection; y++) {
    //     console.log(y+" = "+data[y-1].forecast);
    // }


}

function getMovingAverage(month, monthsForMovingAverage, actualMonths, data) {
    console.log("month=" + month);
    let startMonth = month - monthsForMovingAverage;
    if (startMonth < 1) {
        startMonth = 1;
    }
    let endMonth = month - 1;
    if (endMonth < 1) {
        return null;
    }
    console.log("startMonth=" + startMonth + ", endMonth=" + endMonth);
    let sum = 0;
    let count = 0;
    for (let x = startMonth; x <= endMonth; x++) {
        if (x <= actualMonths) {
            sum += data[x - 1].actual;
            count++;
        } else {
            sum += data[x - 1].forecast;
            count++;
        }
    }
    console.log("sum=" + sum + ", count=" + count);
    if (count == 0) {
        return null;
    } else {
        return sum / count;
    }

}