import moment from "moment";
import ExtrapolationService from "../../api/ExtrapolationService";
import i18n from "../../i18n";
import { calculateError } from "./ErrorCalculations";
export function calculateTES(inputData, alphaParam, betaParam, gammaParam, confidenceLevel, noOfProjectionMonths, props, minStartDate, isTreeExtrapolation, page, regionId, planningUnitId) {
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
        "alpha": Number(alphaParam),
        "beta": Number(betaParam),
        "gamma": Number(gammaParam),
        "n": Number(noOfProjectionMonths),
        "level": Number(confidenceLevel)
    }
    ExtrapolationService.tes(json)
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
                    var tesData = { "data": output, "PlanningUnitId": props.state.selectedConsumptionUnitId, "regionId": regionId }
                    props.updateTESData(tesData);
                } else if (page == "importFromQATSP" || page == "bulkExtrapolation") {
                    var tesData = { "data": output, "PlanningUnitId": planningUnitId, "regionId": regionId }
                    props.updateTESData(tesData);
                } else {
                    props.updateState("tesData", output);
                    calculateError(output, "tesError", props);
                }
            }
        }).catch(error => {
            if (page == "DataEntry") {
                var tesData = { "data": [], "PlanningUnitId": props.state.selectedConsumptionUnitId, "regionId": regionId }
                props.updateTESData(tesData);
            } else if (page == "importFromQATSP" || page == "bulkExtrapolation") {
                var tesData = { "data": [], "PlanningUnitId": planningUnitId, "regionId": regionId }
                props.updateTESData(tesData);
            } else {
                if (!isTreeExtrapolation) {
                    props.updateState("loading", false);
                    props.updateState("noDataMessage", i18n.t('static.extrapolation.errorOccured'));
                    props.updateState("dataChanged", true);
                }
            }
        })
}