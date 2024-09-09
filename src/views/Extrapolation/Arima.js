import moment from "moment";
import ExtrapolationService from "../../api/ExtrapolationService";
import i18n from "../../i18n";
import { calculateError } from "./ErrorCalculations";
export function calculateArima(inputData, p, d, q, confidenceLevel, noOfProjectionMonths, props, minStartDate, isTreeExtrapolation, seasonality, page, regionId, planningUnitId) {
    console.log("inside arima")
    var startYear = moment(minStartDate).format("YYYY");
    var startMonth = moment(minStartDate).format("M");
    var decimal = (startMonth - 1) / 12;
    var startParam = Number(Number(startYear) + Number(decimal));
    var data = []
    for (var i = 0; i < inputData.length; i++) {
        data.push(Number(inputData[i].actual));
    }
    var json = {
        "data": data,
        "frequency": 12,
        "start": startParam,
        "p": Number(p),
        "d": Number(d),
        "q": Number(q),
        "n": Number(noOfProjectionMonths),
        "seasonality": seasonality,
        "level": Number(confidenceLevel),
        "optimize": page == "bulkExtrapolation" ? props.state.optimizeTESAndARIMAExtrapolation : false
    }
    ExtrapolationService.arima(json)
        .then(response => {
            if (response.status == 200) {
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
                if (page == "DataEntry") {
                    var arimaData = { "data": output, "PlanningUnitId": props.state.selectedConsumptionUnitId, "regionId": regionId }
                    props.updateArimaData(arimaData);
                } else if (page == "importFromQATSP") {
                    var arimaData = { "data": output, "PlanningUnitId": planningUnitId, "regionId": regionId }
                    props.updateArimaData(arimaData);
                } else if (page == "bulkExtrapolation") {
                    var arimaData = { "data": output, "PlanningUnitId": planningUnitId, "regionId": regionId, "p": responseData.var1, "d": responseData.var2, "q": responseData.var3 }
                    props.updateArimaData(arimaData);
                } else {
                    props.updateState("arimaData", output);
                    calculateError(output, "arimaError", props)
                }
            }
        }).catch(error => {
            if (page == "DataEntry") {
                var arimaData = { "data": [], "PlanningUnitId": props.state.selectedConsumptionUnitId, "regionId": regionId }
                props.updateArimaData(arimaData);
            } else if (page == "importFromQATSP" || page == "bulkExtrapolation") {
                var arimaData = { "data": [], "PlanningUnitId": planningUnitId, "regionId": regionId }
                props.updateArimaData(arimaData);
            } else {
                props.updateState("loading", false);
                props.updateState("dataChanged", true);
                if (error.response.status == 500) {
                    props.updateState("noDataMessage", i18n.t('static.extrapolation.error'));
                } else {
                    props.updateState("noDataMessage", i18n.t('static.extrapolation.errorOccured'));
                }
            }
        })
}