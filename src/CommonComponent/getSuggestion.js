import moment from "moment";
import getLabelText from '../CommonComponent/getLabelText';
import i18n from '../i18n';
import { CONSTANT_FOR_TEMP_SHIPMENT } from "../Constants";
/**
 * This function is used to construct the problem suggestion based on different dynamic parameters
 * @param {*} row This is the instance of the problem
 * @param {*} lang This is the language in which the suggestion must be displayed
 * @returns This function returns problem desc in specified language
 */
export default function getSuggestion(row, lang) {
    if (row.realmProblem.problem.problemId == 1) {
        var monthString = '';
        var obj = JSON.parse(row.data5);
        var res = [];
        for (var i in obj)
            res.push(obj[i]);
        monthString = res[1].noActualConsumptionMonth + ", " + res[2].noActualConsumptionMonth + ", " + res[3].noActualConsumptionMonth;
        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;
        var label = row.realmProblem.problem.actionLabel;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%CONSUMPTIONMONTH%>').join(res[0].actualConsumptionMonth != "" ? res[0].actualConsumptionMonth : i18n.t('static.qpl.notPresent')).split('<%NOCONSUMPTIONMONTHS%>').join(monthString);
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%CONSUMPTIONMONTH%>').join(res[0].actualConsumptionMonth != "" ? res[0].actualConsumptionMonth : i18n.t('static.qpl.notPresent')).split('<%NOCONSUMPTIONMONTHS%>').join(monthString);
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%CONSUMPTIONMONTH%>').join(res[0].actualConsumptionMonth != "" ? res[0].actualConsumptionMonth : i18n.t('static.qpl.notPresent')).split('<%NOCONSUMPTIONMONTHS%>').join(monthString);
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%CONSUMPTIONMONTH%>').join(res[0].actualConsumptionMonth != "" ? res[0].actualConsumptionMonth : i18n.t('static.qpl.notPresent')).split('<%NOCONSUMPTIONMONTHS%>').join(monthString);
            label.label_pr = result_pr;
        }
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 2) {
        var monthString = '';
        var obj = JSON.parse(row.data5);
        var res = [];
        for (var i in obj)
            res.push(obj[i]);
        monthString = res[1].noInventoryMonth + ", " + res[2].noInventoryMonth + ", " + res[3].noInventoryMonth;
        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;
        var label = row.realmProblem.problem.actionLabel;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%INVENTORYMONTH%>').join(res[0].inventoryMonth != "" ? res[0].inventoryMonth : "not present").split('<%NOINVENTORYMONTHS%>').join(monthString);
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%INVENTORYMONTH%>').join(res[0].inventoryMonth != "" ? res[0].inventoryMonth : "not present").split('<%NOINVENTORYMONTHS%>').join(monthString);
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%INVENTORYMONTH%>').join(res[0].inventoryMonth != "" ? res[0].inventoryMonth : "not present").split('<%NOINVENTORYMONTHS%>').join(monthString);
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%INVENTORYMONTH%>').join(res[0].inventoryMonth != "" ? res[0].inventoryMonth : "not present").split('<%NOINVENTORYMONTHS%>').join(monthString);
            label.label_pr = result_pr;
        }
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 3) {
        if (row.data5 != "") {
            var obj = JSON.parse(row.data5);
        }
        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;
        var label = row.realmProblem.problem.actionLabel;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%SHIPMENT_ID%>').join(((row.shipmentId!=0)?(row.shipmentId):(CONSTANT_FOR_TEMP_SHIPMENT+row.tempShipmentId))).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%PROCUREMNET_AGENT%>').join(row.data5 != "" ? obj.procurementAgentCode : "").split('<%RO_NO%>').join(row.data5 != "" ? (obj.orderNo == null ? "" : obj.orderNo) : "").split('<%SHIPMENT_QTY%>').join(row.data5 != "" ? parseFloat(obj.shipmentQuantity).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " " + i18n.t("static.qpl.units") : "").split('<%SHIPMENT_DATE%>').join(row.data5 != "" ? moment(obj.shipmentDate).format("MMM DD, YYYY") : "");
            label.label_en = row.data5 == "" ? (result_en.replace("(", "").replace("|", "").replace("|", "").replace("|", "").replace(")", "")).replace(/  +/g, ' ') : result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%SHIPMENT_ID%>').join(((row.shipmentId!=0)?(row.shipmentId):(CONSTANT_FOR_TEMP_SHIPMENT+row.tempShipmentId))).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%PROCUREMNET_AGENT%>').join(row.data5 != "" ? obj.procurementAgentCode : "").split('<%RO_NO%>').join(row.data5 != "" ? (obj.orderNo == null ? "" : obj.orderNo) : "").split('<%SHIPMENT_QTY%>').join(row.data5 != "" ? parseFloat(obj.shipmentQuantity).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " " + i18n.t("static.qpl.units") : "").split('<%SHIPMENT_DATE%>').join(row.data5 != "" ? moment(obj.shipmentDate).format("MMM DD, YYYY") : "");
            label.label_fr = row.data5 == "" ? (result_fr.replace("(", "").replace("|", "").replace("|", "").replace("|", "").replace(")", "")).replace(/  +/g, ' ') : result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%SHIPMENT_ID%>').join(((row.shipmentId!=0)?(row.shipmentId):(CONSTANT_FOR_TEMP_SHIPMENT+row.tempShipmentId))).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%PROCUREMNET_AGENT%>').join(row.data5 != "" ? obj.procurementAgentCode : "").split('<%RO_NO%>').join(row.data5 != "" ? (obj.orderNo == null ? "" : obj.orderNo) : "").split('<%SHIPMENT_QTY%>').join(row.data5 != "" ? parseFloat(obj.shipmentQuantity).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " " + i18n.t("static.qpl.units") : "").split('<%SHIPMENT_DATE%>').join(row.data5 != "" ? moment(obj.shipmentDate).format("MMM DD, YYYY") : "");
            label.label_sp = row.data5 == "" ? (result_sp.replace("(", "").replace("|", "").replace("|", "").replace("|", "").replace(")", "")).replace(/  +/g, ' ') : result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%SHIPMENT_ID%>').join(((row.shipmentId!=0)?(row.shipmentId):(CONSTANT_FOR_TEMP_SHIPMENT+row.tempShipmentId))).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%PROCUREMNET_AGENT%>').join(row.data5 != "" ? obj.procurementAgentCode : "").split('<%RO_NO%>').join(row.data5 != "" ? (obj.orderNo == null ? "" : obj.orderNo) : "").split('<%SHIPMENT_QTY%>').join(row.data5 != "" ? parseFloat(obj.shipmentQuantity).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " " + i18n.t("static.qpl.units") : "").split('<%SHIPMENT_DATE%>').join(row.data5 != "" ? moment(obj.shipmentDate).format("MMM DD, YYYY") : "");
            label.label_pr = row.data5 == "" ? (result_pr.replace("(", "").replace("|", "").replace("|", "").replace("|", "").replace(")", "")).replace(/  +/g, ' ') : result_pr;
        }
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 4) {
        if (row.data5 != "") {
            var obj = JSON.parse(row.data5);
        }
        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;
        var label = row.realmProblem.problem.actionLabel;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%SHIPMENT_ID%>').join(((row.shipmentId!=0)?(row.shipmentId):(CONSTANT_FOR_TEMP_SHIPMENT+row.tempShipmentId))).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%PROCUREMNET_AGENT%>').join(row.data5 != "" ? obj.procurementAgentCode : "").split('<%RO_NO%>').join(row.data5 != "" ? (obj.orderNo == null ? "" : obj.orderNo) : "").split('<%SHIPMENT_QTY%>').join(row.data5 != "" ? parseFloat(obj.shipmentQuantity).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " " + i18n.t("static.qpl.units") : "").split('<%SHIPMENT_DATE%>').join(row.data5 != "" ? moment(obj.shipmentDate).format("MMM DD, YYYY") : "").split('<%SUBMITTED_DATE%>').join(row.data5 != "" ? moment(obj.submittedDate).format("MMM DD, YYYY") : "");
            label.label_en = row.data5 == "" ? (result_en.replace("(", '').replace("|", '').replace("|", '').replace("|", '').replace(")", '')).replace(/  +/g, ' ') : result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%SHIPMENT_ID%>').join(((row.shipmentId!=0)?(row.shipmentId):(CONSTANT_FOR_TEMP_SHIPMENT+row.tempShipmentId))).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%PROCUREMNET_AGENT%>').join(row.data5 != "" ? obj.procurementAgentCode : "").split('<%RO_NO%>').join(row.data5 != "" ? (obj.orderNo == null ? "" : obj.orderNo) : "").split('<%SHIPMENT_QTY%>').join(row.data5 != "" ? parseFloat(obj.shipmentQuantity).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " " + i18n.t("static.qpl.units") : "").split('<%SHIPMENT_DATE%>').join(row.data5 != "" ? moment(obj.shipmentDate).format("MMM DD, YYYY") : "").split('<%SUBMITTED_DATE%>').join(row.data5 != "" ? moment(obj.submittedDate).format("MMM DD, YYYY") : "");
            label.label_fr = row.data5 == "" ? (result_fr.replace("(", "").replace("|", "").replace("|", "").replace("|", "").replace(")", "")).replace(/  +/g, ' ') : result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%SHIPMENT_ID%>').join(((row.shipmentId!=0)?(row.shipmentId):(CONSTANT_FOR_TEMP_SHIPMENT+row.tempShipmentId))).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%PROCUREMNET_AGENT%>').join(row.data5 != "" ? obj.procurementAgentCode : "").split('<%RO_NO%>').join(row.data5 != "" ? (obj.orderNo == null ? "" : obj.orderNo) : "").split('<%SHIPMENT_QTY%>').join(row.data5 != "" ? parseFloat(obj.shipmentQuantity).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " " + i18n.t("static.qpl.units") : "").split('<%SHIPMENT_DATE%>').join(row.data5 != "" ? moment(obj.shipmentDate).format("MMM DD, YYYY") : "").split('<%SUBMITTED_DATE%>').join(row.data5 != "" ? moment(obj.submittedDate).format("MMM DD, YYYY") : "");
            label.label_sp = row.data5 == "" ? (result_sp.replace("(", "").replace("|", "").replace("|", "").replace("|", "").replace(")", "")).replace(/  +/g, ' ') : result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%SHIPMENT_ID%>').join(((row.shipmentId!=0)?(row.shipmentId):(CONSTANT_FOR_TEMP_SHIPMENT+row.tempShipmentId))).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%PROCUREMNET_AGENT%>').join(row.data5 != "" ? obj.rocurementAgentCode : "").split('<%RO_NO%>').join(row.data5 != "" ? (obj.orderNo == null ? "" : obj.orderNo) : "").split('<%SHIPMENT_QTY%>').join(row.data5 != "" ? parseFloat(obj.shipmentQuantity).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " " + i18n.t("static.qpl.units") : "").split('<%SHIPMENT_DATE%>').join(row.data5 != "" ? moment(obj.shipmentDate).format("MMM DD, YYYY") : "").split('<%SUBMITTED_DATE%>').join(row.data5 != "" ? moment(obj.submittedDate).format("MMM DD, YYYY") : "");
            label.label_pr = row.data5 == "" ? (result_pr.replace("(", "").replace("|", "").replace("|", "").replace("|", "").replace(")", "")).replace(/  +/g, ' ') : result_pr;
        }
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 5) {
        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;
        var label = row.realmProblem.problem.actionLabel;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%SHIPMENT_ID%>').join(row.shipmentId).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang));
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%SHIPMENT_ID%>').join(row.shipmentId).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang));
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%SHIPMENT_ID%>').join(row.shipmentId).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang));
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%SHIPMENT_ID%>').join(row.shipmentId).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang));
            label.label_pr = result_pr;
        }
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 6) {
        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;
        var label = row.realmProblem.problem.actionLabel;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%SHIPMENT_ID%>').join(row.shipmentId).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang));
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%SHIPMENT_ID%>').join(row.shipmentId).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang));
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%SHIPMENT_ID%>').join(row.shipmentId).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang));
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%SHIPMENT_ID%>').join(row.shipmentId).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang));
            label.label_pr = result_pr;
        }
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 7) {
        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;
        var label = row.realmProblem.problem.actionLabel;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%SHIPMENT_ID%>').join(row.shipmentId).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang));
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%SHIPMENT_ID%>').join(row.shipmentId).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang));
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%SHIPMENT_ID%>').join(row.shipmentId).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang));
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%SHIPMENT_ID%>').join(row.shipmentId).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang));
            label.label_pr = result_pr;
        }
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 8) {
        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;
        var label = row.realmProblem.problem.actionLabel;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%MONTHARRAY%>').join(JSON.parse((row.data5.toString().replaceAll(",",", ")))).split('<%NOOFMONTHS%>').join((row.data5).split(', ').length);
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%MONTHARRAY%>').join(JSON.parse((row.data5.toString().replaceAll(",",", ")))).split('<%NOOFMONTHS%>').join((row.data5).split(', ').length);
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%MONTHARRAY%>').join(JSON.parse((row.data5.toString().replaceAll(",",", ")))).split('<%NOOFMONTHS%>').join((row.data5).split(', ').length);
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%MONTHARRAY%>').join(JSON.parse((row.data5.toString().replaceAll(",",", ")))).split('<%NOOFMONTHS%>').join((row.data5).split(', ').length);
            label.label_pr = result_pr;
        }
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 9) {
    }
    if (row.realmProblem.problem.problemId == 10) {
        var obj = JSON.parse(row.data5);
        var res = [];
        for (var i in obj)
            res.push(obj[i]);
        var causeString = ""
        if (res.length > 0) {
            for (var i = 0; i < res.length; i++) {
                causeString = causeString.concat(res[i].monthRange[0] + " to " + res[i].monthRange[3] + " with consumption quantity " + res[i].consumptionValue + ",");
            }
        }
        var myStartDate = moment(row.dt).add(1, 'months').startOf('month').format("MMM-YY");
        var myEndDate = moment(row.dt).add(row.realmProblem.data1, 'months').endOf('month').format("MMM-YY");
        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;
        var label = row.realmProblem.problem.actionLabel;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%DT%>').join(myStartDate + " to " + myEndDate).split('<%SAMECONSUMPTIONMONTHS%>').join(causeString.replace(/,\s*$/, ""));
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%DT%>').join(myStartDate + " to " + myEndDate).split('<%SAMECONSUMPTIONMONTHS%>').join(causeString.replace(/,\s*$/, ""));
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%DT%>').join(myStartDate + " to " + myEndDate).split('<%SAMECONSUMPTIONMONTHS%>').join(causeString.replace(/,\s*$/, ""));
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%DT%>').join(myStartDate + " to " + myEndDate).split('<%SAMECONSUMPTIONMONTHS%>').join(causeString.replace(/,\s*$/, ""));
            label.label_pr = result_pr;
        }
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 11) {
        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;
        var label = row.realmProblem.problem.actionLabel;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
            label.label_pr = result_pr;
        }
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 13) {
        var label = row.data5.suggession;
        return label;
    }
    if (row.realmProblem.problem.problemId == 14) {
        var obj = JSON.parse(row.data5);
        var res = [];
        for (var i in obj)
            res.push(obj[i]);
        var causeString = ""
        if (res.length > 0) {
            for (var i = 0; i < res.length; i++) {
                causeString = causeString.concat(res[i].monthRange[0] + i18n.t('static.jexcel.to') + res[i].monthRange[3] + i18n.t('static.jexcel.consumptionQuantity') + res[i].consumptionValue + ",");
            }
        }
        var myStartDate = moment(row.dt).add(1, 'months').startOf('month').format("MMM-YY");
        var myEndDate = moment(row.dt).add(row.realmProblem.data1, 'months').endOf('month').format("MMM-YY");
        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;
        var label = row.realmProblem.problem.actionLabel;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%DT%>').join(myStartDate + " to " + myEndDate).split('<%SAMECONSUMPTIONMONTHS%>').join(causeString.replace(/,\s*$/, ""));
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%DT%>').join(myStartDate + " to " + myEndDate).split('<%SAMECONSUMPTIONMONTHS%>').join(causeString.replace(/,\s*$/, ""));
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%DT%>').join(myStartDate + " to " + myEndDate).split('<%SAMECONSUMPTIONMONTHS%>').join(causeString.replace(/,\s*$/, ""));
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%DT%>').join(myStartDate + " to " + myEndDate).split('<%SAMECONSUMPTIONMONTHS%>').join(causeString.replace(/,\s*$/, ""));
            label.label_pr = result_pr;
        }
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 15) {
        var obj = JSON.parse(row.data5);
        var res = [];
        for (var i in obj)
            res.push(obj[i]);
        var causeString = ""
        if (res.length > 0) {
            for (var i = 0; i < res.length; i++) {
                causeString = causeString.concat(res[i].monthRange[0] + " to " + res[i].monthRange[3] + " consumption quantity " + res[i].consumptionValue + ",");
            }
        }
        var myStartDate = moment(row.dt).add(1, 'months').startOf('month').format("MMM-YY");
        var myEndDate = moment(row.dt).add(row.realmProblem.data1, 'months').endOf('month').format("MMM-YY");
        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;
        var label = row.realmProblem.problem.actionLabel;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%DT%>').join(myStartDate + " to " + myEndDate).split('<%SAMECONSUMPTIONMONTHS%>').join(causeString.replace(/,\s*$/, ""));
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%DT%>').join(myStartDate + " to " + myEndDate).split('<%SAMECONSUMPTIONMONTHS%>').join(causeString.replace(/,\s*$/, ""));
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%DT%>').join(myStartDate + " to " + myEndDate).split('<%SAMECONSUMPTIONMONTHS%>').join(causeString.replace(/,\s*$/, ""));
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%DT%>').join(myStartDate + " to " + myEndDate).split('<%SAMECONSUMPTIONMONTHS%>').join(causeString.replace(/,\s*$/, ""));
            label.label_pr = result_pr;
        }
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 16) {
        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;
        var label = row.realmProblem.problem.actionLabel;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
            label.label_pr = result_pr;
        }
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 17) {
        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;
        var label = row.realmProblem.problem.actionLabel;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
            label.label_pr = result_pr;
        }
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 18) {
        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;
        var label = row.realmProblem.problem.actionLabel;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
            label.label_pr = result_pr;
        }
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 19) {
        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;
        var label = row.realmProblem.problem.actionLabel;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
            label.label_pr = result_pr;
        }
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 20) {
        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;
        var label = row.realmProblem.problem.actionLabel;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
            label.label_pr = result_pr;
        }
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 21) {
        var gapMonth = moment(row.dt).subtract(2, 'months').startOf('month').format("MMM-YY");
        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;
        var label = row.realmProblem.problem.actionLabel;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%DT%>').join(gapMonth);
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%DT%>').join(gapMonth);
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%DT%>').join(gapMonth);
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%DT%>').join(gapMonth);
            label.label_pr = result_pr;
        }
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 22) {
        var gapMonth = moment(row.dt).subtract(1, 'months').startOf('month').format("MMM-YY");
        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;
        var label = row.realmProblem.problem.actionLabel;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%DT%>').join(gapMonth);
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%DT%>').join(gapMonth);
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%DT%>').join(gapMonth);
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%DT%>').join(gapMonth);
            label.label_pr = result_pr;
        }
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 23 || row.realmProblem.problem.problemId == 29) {
        var label = row.realmProblem.problem.actionLabel;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 24) {
        var label = row.realmProblem.problem.actionLabel;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 25) {
        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;
        var label = row.realmProblem.problem.actionLabel;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%GAP_MONTHS%>').join(JSON.parse(row.data5));
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%GAP_MONTHS%>').join(JSON.parse(row.data5));
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%GAP_MONTHS%>').join(JSON.parse(row.data5));
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%GAP_MONTHS%>').join(JSON.parse(row.data5));
            label.label_pr = result_pr;
        }
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 26 || row.realmProblem.problem.problemId == 27 || row.realmProblem.problem.problemId == 28) {
        const regex = /(?:\r\n|\r|\n)/g;
        var obj = JSON.parse(row.data5.toString().replaceAll(regex, '<br/>'));
        var label = obj.suggession;
        return label;
    }
    if (row.realmProblem.problem.problemId == 30) {
        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;
        var label = row.realmProblem.problem.actionLabel;
        var obj = JSON.parse(row.data5);
        var suggestion="";
        if(obj.underMinMonthsCount == 0 && obj.stockedOutMonthsCount == 0){
            suggestion=i18n.t('static.problemList.suggestion1')
        }else if(obj.overMaxMonthsCount == 0 && obj.stockedOutMonthsCount == 0){
            suggestion=i18n.t('static.problemList.suggestion2')
        }else if(obj.underMinMonthsCount == 0 && obj.overMaxMonthsCount == 0){
            suggestion=i18n.t('static.problemList.suggestion2')
        }else{
            suggestion=i18n.t('static.problemList.suggestion3')
        }
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%PROBLEM_SUGGESTION%>').join(suggestion);
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%PROBLEM_SUGGESTION%>').join(suggestion);
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%PROBLEM_SUGGESTION%>').join(suggestion);
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%PROBLEM_SUGGESTION%>').join(suggestion);
            label.label_pr = result_pr;
        }
        return getLabelText(label, lang);
    }
}