import getLabelText from '../CommonComponent/getLabelText';
import moment from "moment";
import { compareSync } from 'bcryptjs';

export default function getSuggestion(row, lang) {
    if (row.realmProblem.problem.problemId == 1) {
        // Please provide Actual consumption for <%PLANNING_UNIT%> in <%REGION%> region for the month of <%DT%>
        var numberOfMonths = parseInt(row.realmProblem.data1);
        var monthString = '';
        for (var m = 1; m <= numberOfMonths; m++) {
            var curMonth = moment(Date.now()).subtract(m, 'months').startOf('month').format("MMM-YY");
            monthString = monthString.concat(curMonth + ",");
        }
        var desc = row.realmProblem.problem.actionLabel.label_en;
        const result = desc.split('<%PLANNING_UNIT%>').join(row.planningUnit.label.label_en).split('<%REGION%>').join(row.region.label.label_en).split('<%DT%>').join(monthString.replace(/,\s*$/, ""));
        var label = row.realmProblem.problem.actionLabel;
        label.label_en = result;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 2) {
        // Please provide Stock count for <%PLANNING_UNIT%> in <%REGION%> region for the month of <%DT%>
        var numberOfMonths = parseInt(row.realmProblem.data1);
        var monthString = '';
        for (var m = 1; m <= numberOfMonths; m++) {
            var curMonth = moment(Date.now()).subtract(m, 'months').startOf('month').format("MMM-YY");
            monthString = monthString.concat(curMonth + ",");
        }
        var desc = row.realmProblem.problem.actionLabel.label_en;
        const result = desc.split('<%PLANNING_UNIT%>').join(row.planningUnit.label.label_en).split('<%REGION%>').join(row.region.label.label_en).split('<%DT%>').join(monthString.replace(/,\s*$/, ""));
        var label = row.realmProblem.problem.actionLabel;
        label.label_en = result;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 3) {
        // Please update the Shipment status for Shipment Id <%SHIPMENT_ID%>, it should have been Received by now
        var label = row.realmProblem.problem.actionLabel;
        label.label_en = row.realmProblem.problem.actionLabel.label_en.split('<%SHIPMENT_ID%>').join(row.shipmentId);
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 4) {
        // Please update the Shipment status for Shipment Id <%SHIPMENT_ID%>, it should have been Submitted by now
        var label = row.realmProblem.problem.actionLabel;
        label.label_en = row.realmProblem.problem.actionLabel.label_en.split('<%SHIPMENT_ID%>').join(row.shipmentId);
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 5) {
        // Please update the Shipment status for Shipment Id <%SHIPMENT_ID%>, it should have been Approved by now
        var label = row.realmProblem.problem.actionLabel;
        label.label_en = row.realmProblem.problem.actionLabel.label_en.split('<%SHIPMENT_ID%>').join(row.shipmentId);
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 6) {
        // Please update the Shipment status for Shipment Id <%SHIPMENT_ID%>, it should have been Shipped by now
        var label = row.realmProblem.problem.actionLabel;
        label.label_en = row.realmProblem.problem.actionLabel.label_en.split('<%SHIPMENT_ID%>').join(row.shipmentId);
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 7) {
        // Please update the Shipment status for Shipment Id <%SHIPMENT_ID%>, it should have Arrived by now
        var label = row.realmProblem.problem.actionLabel;
        label.label_en = row.realmProblem.problem.actionLabel.label_en.split('<%SHIPMENT_ID%>').join(row.shipmentId);
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 8) {
        // Please provide Forecasted consumption for <%PLANNING_UNIT%> in <%REGION%> region for the month of <%DT%>
        var desc = row.realmProblem.problem.actionLabel.label_en;
        const result = desc.split('<%PLANNING_UNIT%>').join(row.planningUnit.label.label_en).split('<%REGION%>').join(row.region.label.label_en).split('<%DT%>').join('18 months in future');
        var label = row.realmProblem.problem.actionLabel;
        label.label_en = result;
        return getLabelText(label, lang);
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
        var myStartDate = moment(Date.now()).add(1, 'months').startOf('month').format("MMM-YY");
        var myEndDate = moment(Date.now()).add(row.realmProblem.data1, 'months').endOf('month').format("MMM-YY");
        var desc = row.realmProblem.problem.actionLabel.label_en;
        const result = desc.split('<%PLANNING_UNIT%>').join(row.planningUnit.label.label_en).split('<%REGION%>').join(row.region.label.label_en).split('<%DT%>').join(myStartDate + " to " + myEndDate);
        var label = row.realmProblem.problem.actionLabel;
        label.label_en = result;
        return getLabelText(label, lang);
        // var label = row.realmProblem.problem.actionLabel;
        // // label.label_en = label.label_en;
        // return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 11) {
        // Inventory doen't fall within min/max range
        // var label = row.realmProblem.problem.label;
        // label.label_en = "Inventory doen't fall within min/max range";
        // return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 13) {
        // var label = row.realmProblem.problem.label;
        // label.label_en = "Please fill proper notes in shipments for " + row.planningUnit.label.label_en;
        // // + monthString.replace(/,\s*$/, "");
        // return getLabelText(label, lang);
        var desc = row.realmProblem.problem.actionLabel.label_en;
        const result = desc.split('<%PLANNING_UNIT%>').join(row.planningUnit.label.label_en);
        var label = row.realmProblem.problem.actionLabel;
        label.label_en = result;
        return getLabelText(label, lang);
    }

}