import { calculateError } from '../Extrapolation/ErrorCalculations.js';
export function calculateMovingAvg(inputData, noOfMonths, noOfProjectionMonths, props, page, regionId, planningUnitId) {
    const data = inputData;
    const monthsForMovingAverage = noOfMonths;
    const noOfMonthsForProjection = noOfProjectionMonths;
    let actualMonths = data[data.length - 1].month;
    for (let x = 1; x <= actualMonths + noOfMonthsForProjection; x++) {
        if (x <= actualMonths) {
            var movingAvg = getMovingAverage(x, monthsForMovingAverage, actualMonths, data)
            data[x - 1].forecast = movingAvg > 0 ? movingAvg : 0;
        } else {
            var movingAvg = getMovingAverage(x, monthsForMovingAverage, actualMonths, data)
            data[x - 1] = { "month": x, "actual": null, "forecast": movingAvg > 0 ? movingAvg : 0 };
        }
    }
    if (page == "DataEntry") {
        var movingAvgData = { "data": data, "PlanningUnitId": props.state.selectedConsumptionUnitId, "regionId": regionId }
        props.updateMovingAvgData(movingAvgData);
    } else if (page == "importFromQATSP" || page == "bulkExtrapolation") {
        var movingAvgData = { "data": data, "PlanningUnitId": planningUnitId, "regionId": regionId }
        props.updateMovingAvgData(movingAvgData);
    } else {
        calculateError(data, "movingAvgError", props);
        props.updateState("movingAvgData", data);
    }
}
function getMovingAverage(month, monthsForMovingAverage, actualMonths, data) {
    let startMonth = month - monthsForMovingAverage;
    if (startMonth < 1) {
        startMonth = 1;
    }
    let endMonth = month - 1;
    if (endMonth < 1) {
        return null;
    }
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
    if (count == 0) {
        return null;
    } else {
        return sum / count;
    }
}