import regression from 'regression';
import ExtrapolationService from '../../api/ExtrapolationService.js';
import i18n from '../../i18n.js';
import { calculateError } from '../Extrapolation/ErrorCalculations.js';
import { calculateCI } from './CalculateCI.js';
export function calculateLinearRegression(inputData, confidence, noOfProjectionMonths, props,isTreeExtrapolation) {
    // console.log("InputData@@@", inputData)

    // const noOfMonthsForProjection = noOfProjectionMonths;
    // let actualMonths = data[data.length - 1].month;

    // const result = regression.linear(initializeRegression(data));
    // const gradient = result.equation[0];
    // const yIntercept = result.equation[1];

    // for (let x = 1; x <= actualMonths + noOfMonthsForProjection; x++) {
    //     if (x <= actualMonths) {
    //         var linearReg = getLinearRegression(x, gradient, yIntercept);
    //         data[x - 1].forecast = linearReg > 0 ? linearReg : 0;
    //         // data[x - 1].forecast = getLinearRegression(x, gradient, yIntercept);
    //     } else {
    //         var linearReg = getLinearRegression(x, gradient, yIntercept);
    //         data[x - 1] = { "month": x, "actual": null, "forecast": linearReg > 0 ? linearReg : 0 };
    //         // data[x - 1] = { "month": x, "actual": null, "forecast": getLinearRegression(x, gradient, yIntercept) };
    //     }
    // }
    // calculateError(data, "linearRegressionError", props);
    // calculateCI(data, Number(confidence), "linearRegressionData", props);
    // props.updateState("", data);
    // // Print the output
    // for (let y=1; y<=actualMonths+noOfMonthsForProjection; y++) {
    //     console.log(y+" = "+data[y-1].forecast);
    // }
    var data = []
    for (var i = 0; i < inputData.length; i++) {
        data.push(Number(inputData[i].actual));
    }
    var json = {
        "data": data,
        "n": Number(noOfProjectionMonths),
        "level": Number(confidence)
    }
    console.log("Json@@@@@@", json);
    ExtrapolationService.regression(json)
        .then(response => {
            if (response.status == 200) {
                console.log("response.status@@@@@@", response);
                var responseData = response.data;
                var output = [];
                var count = 0;
                for (var k = 0; k < responseData.fits.length; k++) {
                    count += 1;
                    output.push({ month: count, actual: inputData[k] != undefined && inputData[k].actual != undefined && inputData[k].actual != null && inputData[k].actual != '' ? inputData[k].actual : null, forecast: responseData.fits[k] == 'NA' ? null : responseData.fits[k] > 0 ? responseData.fits[k] : 0, ci: null })
                }
                for (var j = 0; j < responseData.forecast.length; j++) {
                    count += 1;
                    output.push({ month: count, actual: inputData[count - 1] != undefined && inputData[count - 1].actual != undefined && inputData[count - 1].actual != null && inputData[count - 1].actual != '' ? inputData[count - 1].actual : null, forecast: responseData.forecast[j] == 'NA' ? null : responseData.forecast[j] > 0 ? responseData.forecast[j] : 0, ci: responseData.ci[j] > 0 ? responseData.ci[j] : 0 })
                }

                console.log("OutPut@@@@@@@@@@@@@@@@@@@@@@", output)
                // calculateCI(output, Number(confidenceLevel), "tesData", props)
                props.updateState("linearRegressionData", output);
                calculateError(output, "linearRegressionError", props);

            }
        }).catch(error => {
            console.log("Error@@@@@@", error)
            if (!isTreeExtrapolation) {
                // props.updateState("showData", false);
                // props.updateState("dataEl", "");
                props.updateState("loading", false);
                props.updateState("noDataMessage", i18n.t('static.extrapolation.errorOccured'));
                props.updateState("dataChanged", true);
                // props.updateState("show", false);
                // props.el = jexcel(document.getElementById("tableDiv"), '');
                // props.el.destroy();
            }
        })
}

// function getLinearRegression(month, gradient, yIntercept) {
//     return gradient * month + yIntercept;
// }

// function initializeRegression(data) {
//     let tmpArray = new Array();
//     for (let x = 0; x < data.length; x++) {
//         tmpArray.push(new Array(data[x].month, data[x].actual));
//     }
//     return tmpArray;
// }
