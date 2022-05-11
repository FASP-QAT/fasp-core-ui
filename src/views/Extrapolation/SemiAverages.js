import { calculateError } from '../Extrapolation/ErrorCalculations.js';
let m = 0;
let c = 0;
export function calculateSemiAverages(inputData, noOfProjectionMonths, props) {
    const data = inputData;
    console.log("##SemiAverages##  @@@inputData---", inputData);
    const noOfMonthsForProjection = noOfProjectionMonths;
    let actualMonths = 0;
    for (let x = 0; x < data.length; x++) {
        if (data[x].actual != null) {
            actualMonths++;
        }
    }
    console.log("##SemiAverages##  actualMonths---",actualMonths);
    initializeSemiAverage(data, actualMonths);
    console.log("##SemiAverages##  m---", m + " c---", c)
    for (let x = 1; x <= actualMonths + noOfMonthsForProjection; x++) {
        if (x <= actualMonths) {
            var semiAvg = getSemiAverage(x);
            data[x - 1].forecast = semiAvg > 0 ? semiAvg : 0;
        } else {
            var semiAvg = getSemiAverage(x);
            data[x - 1] = { "month": x, "actual": null, "forecast": semiAvg > 0 ? semiAvg : 0 };
        }
    }
    calculateError(data, "semiAvgError", props);
    props.updateState("semiAvgData", data);
}

function getSemiAverage(month) {
    return m * month + c;
}

function initializeSemiAverage(data, actualMonths) {
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    let cnt = 0;
    for (let x = 1; x <= Math.floor(actualMonths / 2); x++) {
        console.log("##SemiAverages##  data[x-1].month=",data[x-1].month," data[x-1].actual=",data[x-1].actual)
        x1 += data[x - 1].month;
        y1 += data[x - 1].actual;
        cnt++;
    }
    x1 = x1 / cnt;
    y1 = y1 / cnt;
    console.log("##SemiAverages##  x1---",x1);
    console.log("##SemiAverages##  y1---",y1);
    cnt = 0;
    for (let x = Math.floor(actualMonths / 2) + 1; x <= actualMonths; x++) {
        console.log("##SemiAverages##  data[x-1].month=",data[x-1].month," data[x-1].actual=",data[x-1].actual)
        x2 += data[x - 1].month;
        y2 += data[x - 1].actual;
        cnt++;
    }
    x2 = x2 / cnt;
    y2 = y2 / cnt;
    m = (y2 - y1) / (x2 - x1);
    c = m * (0 - x2) + y2;
    console.log("##SemiAverages##  x2---",x2);
    console.log("##SemiAverages##  y2---",y2);
}