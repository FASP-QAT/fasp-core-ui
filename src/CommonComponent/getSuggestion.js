import getLabelText from '../CommonComponent/getLabelText';
import moment from "moment";
import { compareSync } from 'bcryptjs';
import i18n from '../i18n';

export default function getSuggestion(row, lang) {
    if (row.realmProblem.problem.problemId == 1) {
        // console.log("lang====>", lang);
        // Please ensure you have recent actual consumption data in region <%REGION%>. 
        // The last actual consumption data in QAT is month/year <%CONSUMPTIONMONTH%> there is no actual consumption for the month of <%NOCONSUMPTIONMONTHS%>
        // var numberOfMonths = parseInt(row.realmProblem.data1);
        var monthString = '';
        // for (var m = numberOfMonths; m > 0; m--) {
        //     var curMonth = moment(row.dt).subtract(m, 'months').startOf('month').format("MMM-YY");
        //     monthString = monthString.concat(curMonth + ",");
        // }
        var obj = JSON.parse(row.data5);
        var res = [];
        for (var i in obj)
            res.push(obj[i]);
        // console.log("[]][]][][][][]+++", res);
        monthString = res[1].noActualConsumptionMonth + "," + res[2].noActualConsumptionMonth + "," + res[3].noActualConsumptionMonth;
        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;
        // console.log("desc_sp====",desc_sp);
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
        // Please provide Stock count for <%PLANNING_UNIT%> in <%REGION%> region for the month of <%DT%>
        // var numberOfMonths = parseInt(row.realmProblem.data1);
        var monthString = '';
        // for (var m = numberOfMonths; m >= 0; m--) {
        //     var curMonth = moment(row.dt).subtract(m, 'months').startOf('month').format("MMM-YY");
        //     monthString = monthString.concat(curMonth + ",");
        // }
        var obj = JSON.parse(row.data5);
        var res = [];
        for (var i in obj)
            res.push(obj[i]);
        monthString = res[1].noInventoryMonth + "," + res[2].noInventoryMonth + "," + res[3].noInventoryMonth;

        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;
        // console.log("desc_sp====",desc_sp);
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
        // Please update the Shipment status for Shipment Id <%SHIPMENT_ID%>, it should have been Received by now
        // Please check to make sure shipment id <%SHIPMENT_ID%>  for product <%PLANNING_UNIT%> was received, and update either the receive date or the shipment status.
        console.log("===", row.data5);
        if (row.data5 != "") {
            var obj = JSON.parse(row.data5);
        }
        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;

        var label = row.realmProblem.problem.actionLabel;

        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%SHIPMENT_ID%>').join(row.shipmentId).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%PROCUREMNET_AGENT%>').join(row.data5 != "" ? obj.procurementAgentCode : "").split('<%RO_NO%>').join(row.data5 != "" ? (obj.orderNo == null ? "" : obj.orderNo) : "").split('<%SHIPMENT_QTY%>').join(row.data5 != "" ? obj.shipmentQuantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " " + i18n.t("static.qpl.units") : "").split('<%SHIPMENT_DATE%>').join(row.data5 != "" ? moment(obj.shipmentDate).format("MMM DD, YYYY") : "");
            label.label_en = row.data5 == "" ? (result_en.replace("(", "").replace("|", "").replace("|", "").replace("|", "").replace(")", "")).replace(/  +/g, ' ') : result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%SHIPMENT_ID%>').join(row.shipmentId).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%PROCUREMNET_AGENT%>').join(row.data5 != "" ? obj.procurementAgentCode : "").split('<%RO_NO%>').join(row.data5 != "" ? (obj.orderNo == null ? "" : obj.orderNo) : "").split('<%SHIPMENT_QTY%>').join(row.data5 != "" ? obj.shipmentQuantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " " + i18n.t("static.qpl.units") : "").split('<%SHIPMENT_DATE%>').join(row.data5 != "" ? moment(obj.shipmentDate).format("MMM DD, YYYY") : "");
            label.label_fr = row.data5 == "" ? (result_fr.replace("(", "").replace("|", "").replace("|", "").replace("|", "").replace(")", "")).replace(/  +/g, ' ') : result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%SHIPMENT_ID%>').join(row.shipmentId).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%PROCUREMNET_AGENT%>').join(row.data5 != "" ? obj.procurementAgentCode : "").split('<%RO_NO%>').join(row.data5 != "" ? (obj.orderNo == null ? "" : obj.orderNo) : "").split('<%SHIPMENT_QTY%>').join(row.data5 != "" ? obj.shipmentQuantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " " + i18n.t("static.qpl.units") : "").split('<%SHIPMENT_DATE%>').join(row.data5 != "" ? moment(obj.shipmentDate).format("MMM DD, YYYY") : "");
            label.label_sp = row.data5 == "" ? (result_sp.replace("(", "").replace("|", "").replace("|", "").replace("|", "").replace(")", "")).replace(/  +/g, ' ') : result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%SHIPMENT_ID%>').join(row.shipmentId).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%PROCUREMNET_AGENT%>').join(row.data5 != "" ? obj.procurementAgentCode : "").split('<%RO_NO%>').join(row.data5 != "" ? (obj.orderNo == null ? "" : obj.orderNo) : "").split('<%SHIPMENT_QTY%>').join(row.data5 != "" ? obj.shipmentQuantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " " + i18n.t("static.qpl.units") : "").split('<%SHIPMENT_DATE%>').join(row.data5 != "" ? moment(obj.shipmentDate).format("MMM DD, YYYY") : "");
            label.label_pr = row.data5 == "" ? (result_pr.replace("(", "").replace("|", "").replace("|", "").replace("|", "").replace(")", "")).replace(/  +/g, ' ') : result_pr;
        }

        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 4) {
        // Please update the Shipment status for Shipment Id <%SHIPMENT_ID%>, it should have been Submitted by now
        // Please check to make sure shipment id <%SHIPMENT_ID%>   for product <%PLANNING_UNIT%> was submitted, and update either the receive date or the shipment status.
        console.log("===", row.data5);
        if (row.data5 != "") {
            var obj = JSON.parse(row.data5);
        }

        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;

        var label = row.realmProblem.problem.actionLabel;

        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%SHIPMENT_ID%>').join(row.shipmentId).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%PROCUREMNET_AGENT%>').join(row.data5 != "" ? obj.procurementAgentCode : "").split('<%RO_NO%>').join(row.data5 != "" ? (obj.orderNo == null ? "" : obj.orderNo) : "").split('<%SHIPMENT_QTY%>').join(row.data5 != "" ? obj.shipmentQuantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " " + i18n.t("static.qpl.units") : "").split('<%SHIPMENT_DATE%>').join(row.data5 != "" ? moment(obj.shipmentDate).format("MMM DD, YYYY") : "").split('<%SUBMITTED_DATE%>').join(row.data5 != "" ? moment(obj.submittedDate).format("MMM DD, YYYY") : "");
            label.label_en = row.data5 == "" ? (result_en.replace("(", '').replace("|", '').replace("|", '').replace("|", '').replace(")", '')).replace(/  +/g, ' ') : result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%SHIPMENT_ID%>').join(row.shipmentId).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%PROCUREMNET_AGENT%>').join(row.data5 != "" ? obj.procurementAgentCode : "").split('<%RO_NO%>').join(row.data5 != "" ? (obj.orderNo == null ? "" : obj.orderNo) : "").split('<%SHIPMENT_QTY%>').join(row.data5 != "" ? obj.shipmentQuantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " " + i18n.t("static.qpl.units") : "").split('<%SHIPMENT_DATE%>').join(row.data5 != "" ? moment(obj.shipmentDate).format("MMM DD, YYYY") : "").split('<%SUBMITTED_DATE%>').join(row.data5 != "" ? moment(obj.submittedDate).format("MMM DD, YYYY") : "");
            label.label_fr = row.data5 == "" ? (result_fr.replace("(", "").replace("|", "").replace("|", "").replace("|", "").replace(")", "")).replace(/  +/g, ' ') : result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%SHIPMENT_ID%>').join(row.shipmentId).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%PROCUREMNET_AGENT%>').join(row.data5 != "" ? obj.procurementAgentCode : "").split('<%RO_NO%>').join(row.data5 != "" ? (obj.orderNo == null ? "" : obj.orderNo) : "").split('<%SHIPMENT_QTY%>').join(row.data5 != "" ? obj.shipmentQuantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " " + i18n.t("static.qpl.units") : "").split('<%SHIPMENT_DATE%>').join(row.data5 != "" ? moment(obj.shipmentDate).format("MMM DD, YYYY") : "").split('<%SUBMITTED_DATE%>').join(row.data5 != "" ? moment(obj.submittedDate).format("MMM DD, YYYY") : "");
            label.label_sp = row.data5 == "" ? (result_sp.replace("(", "").replace("|", "").replace("|", "").replace("|", "").replace(")", "")).replace(/  +/g, ' ') : result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%SHIPMENT_ID%>').join(row.shipmentId).split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%PROCUREMNET_AGENT%>').join(row.data5 != "" ? obj.rocurementAgentCode : "").split('<%RO_NO%>').join(row.data5 != "" ? (obj.orderNo == null ? "" : obj.orderNo) : "").split('<%SHIPMENT_QTY%>').join(row.data5 != "" ? obj.shipmentQuantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " " + i18n.t("static.qpl.units") : "").split('<%SHIPMENT_DATE%>').join(row.data5 != "" ? moment(obj.shipmentDate).format("MMM DD, YYYY") : "").split('<%SUBMITTED_DATE%>').join(row.data5 != "" ? moment(obj.submittedDate).format("MMM DD, YYYY") : "");
            label.label_pr = row.data5 == "" ? (result_pr.replace("(", "").replace("|", "").replace("|", "").replace("|", "").replace(")", "")).replace(/  +/g, ' ') : result_pr;
        }
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 5) {
        // Please update the Shipment status for Shipment Id <%SHIPMENT_ID%>, it should have been Approved by now
        // Please check to make sure shipment id <%SHIPMENT_ID%> for product <%PLANNING_UNIT%> was approved, and update either the  date or the  status.

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
        // Please update the Shipment status for Shipment Id <%SHIPMENT_ID%>, it should have been Shipped by now
        // Please check to make sure shipment id <%SHIPMENT_ID%>  for product <%PLANNING_UNIT%> was shipped, and update either the  date or the  status.

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
        // Please update the Shipment status for Shipment Id <%SHIPMENT_ID%>, it should have Arrived by now
        // Please check to make sure shipment id <%SHIPMENT_ID%> for product <%PLANNING_UNIT%> was Arrived, and update either the  date or the  status.

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
        // Please provide Forecasted consumption for <%PLANNING_UNIT%> in <%REGION%> region for the month of <%DT%>
        // var desc = row.realmProblem.problem.actionLabel.label_en;
        // const result = desc.split('<%PLANNING_UNIT%>').join(row.planningUnit.label.label_en).split('<%REGION%>').join(row.region.label.label_en).split('<%DT%>').join('18 months in future');
        // var label = row.realmProblem.problem.actionLabel;
        // label.label_en = result;

        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;

        // console.log("desc_sp====",desc_sp);
        var label = row.realmProblem.problem.actionLabel;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%MONTHARRAY%>').join(JSON.parse(row.data5)).split('<%NOOFMONTHS%>').join((row.data5).split(',').length);
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%MONTHARRAY%>').join(JSON.parse(row.data5)).split('<%NOOFMONTHS%>').join((row.data5).split(',').length);
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%MONTHARRAY%>').join(JSON.parse(row.data5)).split('<%NOOFMONTHS%>').join((row.data5).split(',').length);
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang)).split('<%REGION%>').join(getLabelText(row.region.label, lang)).split('<%MONTHARRAY%>').join(JSON.parse(row.data5)).split('<%NOOFMONTHS%>').join((row.data5).split(',').length);
            label.label_pr = result_pr;
        }

        return getLabelText(label, lang);
        // return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 9) {
        // Compares supply plan shipments to USAID mandated ARV tier list (ARV specific)
        // var label = row.realmProblem.problem.label;
        // label.label_en = "Compares supply plan shipments to USAID mandated ARV tier list (ARV specific)";
        // return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 10) {
        // Dynamic forecasting is not used for certain commodity groups (Malaria, ARV, VMMC)
        // var label = row.realmProblem.problem.label;
        // label.label_en = "Dynamic forecasting is not used for certain commodity groups (Malaria, ARV, VMMC)";
        // return getLabelText(label, lang);

        var obj = JSON.parse(row.data5);
        var res = [];
        for (var i in obj)
            res.push(obj[i]);
        // console.log("res+++", res);
        var causeString = ""
        if (res.length > 0) {
            for (var i = 0; i < res.length; i++) {
                causeString = causeString.concat(res[i].monthRange[0] + " to " + res[i].monthRange[3] + " with consumption quantity " + res[i].consumptionValue + ",");
            }
        }
        var myStartDate = moment(row.dt).add(1, 'months').startOf('month').format("MMM-YY");
        var myEndDate = moment(row.dt).add(row.realmProblem.data1, 'months').endOf('month').format("MMM-YY");
        // var desc = row.realmProblem.problem.actionLabel.label_en;
        // const result = desc.split('<%PLANNING_UNIT%>').join(row.planningUnit.label.label_en).split('<%REGION%>').join(row.region.label.label_en).split('<%DT%>').join(myStartDate + " to " + myEndDate);
        // var label = row.realmProblem.problem.actionLabel;
        // label.label_en = result;
        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;

        // console.log("desc_sp====",desc_sp);
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
        // var label = row.realmProblem.problem.actionLabel;
        // // label.label_en = label.label_en;
        // return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 11) {
        // var desc = row.realmProblem.problem.actionLabel.label_en;
        // const result = desc.split('<%PLANNING_UNIT%>').join(row.planningUnit.label.label_en).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
        // var label = row.realmProblem.problem.actionLabel;
        // label.label_en = result;
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
        // var label = row.realmProblem.problem.label;
        // label.label_en = "Please fill proper notes in shipments for " + row.planningUnit.label.label_en;
        // // + monthString.replace(/,\s*$/, "");
        // return getLabelText(label, lang);
        // var desc = row.realmProblem.problem.actionLabel.label_en;
        // const result = desc.split('<%PLANNING_UNIT%>').join(row.planningUnit.label.label_en);
        // var label = row.realmProblem.problem.actionLabel;
        // label.label_en = result;
        // var desc_en = row.realmProblem.problem.actionLabel.label_en;
        // var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        // var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        // var desc_pr = row.realmProblem.problem.actionLabel.label_pr;

        // var label = row.realmProblem.problem.actionLabel;
        // if (desc_en != null && desc_en != '') {
        //     const result_en = desc_en.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang));
        //     label.label_en = result_en;
        // } if (desc_fr != null && desc_fr != '') {
        //     const result_fr = desc_fr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang));
        //     label.label_fr = result_fr;
        // } if (desc_sp != null && desc_sp != '') {
        //     const result_sp = desc_sp.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang));
        //     label.label_sp = result_sp;
        // } if (desc_pr != null && desc_pr != '') {
        //     const result_pr = desc_pr.split('<%PLANNING_UNIT%>').join(getLabelText(row.planningUnit.label, lang));
        //     label.label_pr = result_pr;
        // }
        console.log("row.data5", row.data5.suggession)
        var label = row.data5.suggession;

        return label;
        // return getLabelText(label, lang);

    }
    if (row.realmProblem.problem.problemId == 14) {
        // Dynamic forecasting is not used for certain commodity groups (Malaria, ARV, VMMC)
        // var label = row.realmProblem.problem.label;
        // label.label_en = "Dynamic forecasting is not used for certain commodity groups (Malaria, ARV, VMMC)";
        // return getLabelText(label, lang);

        var obj = JSON.parse(row.data5);
        var res = [];
        for (var i in obj)
            res.push(obj[i]);
        // console.log("res+++", res);

        var causeString = ""
        if (res.length > 0) {
            for (var i = 0; i < res.length; i++) {
                causeString = causeString.concat(res[i].monthRange[0] + i18n.t('static.jexcel.to') + res[i].monthRange[3] + i18n.t('static.jexcel.consumptionQuantity') + res[i].consumptionValue + ",");
            }
        }

        var myStartDate = moment(row.dt).add(1, 'months').startOf('month').format("MMM-YY");
        var myEndDate = moment(row.dt).add(row.realmProblem.data1, 'months').endOf('month').format("MMM-YY");
        // var desc = row.realmProblem.problem.actionLabel.label_en;
        // const result = desc.split('<%PLANNING_UNIT%>').join(row.planningUnit.label.label_en).split('<%REGION%>').join(row.region.label.label_en).split('<%DT%>').join(myStartDate + " to " + myEndDate);
        // var label = row.realmProblem.problem.actionLabel;
        // label.label_en = result;
        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;

        // console.log("desc_sp====",desc_sp);
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
        // var label = row.realmProblem.problem.actionLabel;
        // // label.label_en = label.label_en;
        // return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 15) {
        // Dynamic forecasting is not used for certain commodity groups (Malaria, ARV, VMMC)
        // var label = row.realmProblem.problem.label;
        // label.label_en = "Dynamic forecasting is not used for certain commodity groups (Malaria, ARV, VMMC)";
        // return getLabelText(label, lang);

        var obj = JSON.parse(row.data5);
        var res = [];
        for (var i in obj)
            res.push(obj[i]);
        // console.log("res+++", res);

        var causeString = ""
        if (res.length > 0) {
            for (var i = 0; i < res.length; i++) {
                causeString = causeString.concat(res[i].monthRange[0] + " to " + res[i].monthRange[3] + " consumption quantity " + res[i].consumptionValue + ",");
            }
        }

        var myStartDate = moment(row.dt).add(1, 'months').startOf('month').format("MMM-YY");
        var myEndDate = moment(row.dt).add(row.realmProblem.data1, 'months').endOf('month').format("MMM-YY");
        // var desc = row.realmProblem.problem.actionLabel.label_en;
        // const result = desc.split('<%PLANNING_UNIT%>').join(row.planningUnit.label.label_en).split('<%REGION%>').join(row.region.label.label_en).split('<%DT%>').join(myStartDate + " to " + myEndDate);
        // var label = row.realmProblem.problem.actionLabel;
        // label.label_en = result;
        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;

        // console.log("desc_sp====",desc_sp);
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
        // var label = row.realmProblem.problem.actionLabel;
        // // label.label_en = label.label_en;
        // return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 16) {
        // var desc = row.realmProblem.problem.actionLabel.label_en;
        // const result = desc.split('<%PLANNING_UNIT%>').join(row.planningUnit.label.label_en).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
        // var label = row.realmProblem.problem.actionLabel;
        // label.label_en = result;
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
        // var desc = row.realmProblem.problem.actionLabel.label_en;
        // const result = desc.split('<%PLANNING_UNIT%>').join(row.planningUnit.label.label_en).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
        // var label = row.realmProblem.problem.actionLabel;
        // label.label_en = result;
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
        // var desc = row.realmProblem.problem.actionLabel.label_en;
        // const result = desc.split('<%PLANNING_UNIT%>').join(row.planningUnit.label.label_en).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
        // var label = row.realmProblem.problem.actionLabel;
        // label.label_en = result;
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
        // var desc = row.realmProblem.problem.actionLabel.label_en;
        // const result = desc.split('<%PLANNING_UNIT%>').join(row.planningUnit.label.label_en).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
        // var label = row.realmProblem.problem.actionLabel;
        // label.label_en = result;
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
        // var desc = row.realmProblem.problem.actionLabel.label_en;
        // const result = desc.split('<%PLANNING_UNIT%>').join(row.planningUnit.label.label_en).split('<%DT%>').join(moment(row.dt).format('MMM-YY'));
        // var label = row.realmProblem.problem.actionLabel;
        // label.label_en = result;
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

        // console.log("desc_sp====",desc_sp);
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

        // console.log("desc_sp====",desc_sp);
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
    if (row.realmProblem.problem.problemId == 23) {
        var label = row.realmProblem.problem.actionLabel;
        // label.label_en = "Inventory doen't fall within min/max range";
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 24) {
        var label = row.realmProblem.problem.actionLabel;
        // label.label_en = "Inventory doen't fall within min/max range";
        return getLabelText(label, lang);
    }

    if (row.realmProblem.problem.problemId == 25) {
        var desc_en = row.realmProblem.problem.actionLabel.label_en;
        var desc_fr = row.realmProblem.problem.actionLabel.label_fr;
        var desc_sp = row.realmProblem.problem.actionLabel.label_sp;
        var desc_pr = row.realmProblem.problem.actionLabel.label_pr;
        // console.log("desc_sp====",desc_sp);
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
    if (row.realmProblem.problem.problemId == 26) {
        var obj = JSON.parse(row.data5);
        var label = obj.suggession;
        return label;
    }
}