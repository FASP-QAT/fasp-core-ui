import getLabelText from '../CommonComponent/getLabelText';

export default function getProblemDesc(row, lang) {
    if (row.realmProblem.problem.problemId == 1) {
        // Missing recent actual consumption inputs (within the last <%X months)
        var outputString = row.realmProblem.problem.label.label_en.replace("<%X", row.realmProblem.data1);
        // console.log("outputString=====>",outputString);
        var label = row.realmProblem.problem.label;
        label.label_en = outputString;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 2) {
        // Missing recent inventory inputs (within the last X months)
        // var label = row.realmProblem.problem.label;
        // label.label_en = "Missing recent inventory inputs (within the last " + row.realmProblem.data1 + " months)";
        // return getLabelText(label, lang);

        var outputString = row.realmProblem.problem.label.label_en.replace("<%X", row.realmProblem.data1);
        // console.log("outputString=====>",outputString);
        var label = row.realmProblem.problem.label;
        label.label_en = outputString;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 3) {
        // Shipments have receive dates more than X days in the past
        // var label = row.realmProblem.problem.label;
        // label.label_en = "Shipments have receive dates more than " + row.realmProblem.data1 + " days in the past";
        // return getLabelText(label, lang);

        var outputString = row.realmProblem.problem.label.label_en.replace("<%X", row.realmProblem.data1);
        // console.log("outputString=====>",outputString);
        var label = row.realmProblem.problem.label;
        label.label_en = outputString;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 4) {
        // Shipment have not been submitted for over X days since target date
        // var label = row.realmProblem.problem.label;
        // label.label_en = "Shipment have not been submitted for over " + row.realmProblem.data1 + " days since target date";
        // return getLabelText(label, lang);
        var outputString = row.realmProblem.problem.label.label_en.replace("<%X", row.realmProblem.data1);
        // console.log("outputString=====>",outputString);
        var label = row.realmProblem.problem.label;
        label.label_en = outputString;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 5) {
        // Shipments have not been approved for more than X days since target date
        // var label = row.realmProblem.problem.label;
        // label.label_en = "Shipments have not been approved for more than " + row.realmProblem.data1 + " days since target date";
        // return getLabelText(label, lang);
        var outputString = row.realmProblem.problem.label.label_en.replace("<%X", row.realmProblem.data1);
        // console.log("outputString=====>",outputString);
        var label = row.realmProblem.problem.label;
        label.label_en = outputString;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 6) {
        // Shipments have not shipped for more than X days since target date
        // var label = row.realmProblem.problem.label;
        // label.label_en = "Shipments have not shipped for more than " + row.realmProblem.data1 + " days since target date";
        // return getLabelText(label, lang);
        var outputString = row.realmProblem.problem.label.label_en.replace("<%X", row.realmProblem.data1);
        // console.log("outputString=====>",outputString);
        var label = row.realmProblem.problem.label;
        label.label_en = outputString;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 7) {
        // Shipments have not arrived for more than X days since target date
        // var label = row.realmProblem.problem.label;
        // label.label_en = "Shipments have not arrived for more than " + row.realmProblem.data1 + " days since target date";
        // return getLabelText(label, lang);
        var outputString = row.realmProblem.problem.label.label_en.replace("<%X", row.realmProblem.data1);
        // console.log("outputString=====>",outputString);
        var label = row.realmProblem.problem.label;
        label.label_en = outputString;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 8) {
        // No Forecasted consumption X months in to the future
        // var label = row.realmProblem.problem.label;
        // label.label_en = "No Forecasted consumption " + row.realmProblem.data1 + " months in to the future";
        // return getLabelText(label, lang);
        var outputString = row.realmProblem.problem.label.label_en.replace("<%X", row.realmProblem.data1);
        // console.log("outputString=====>",outputString);
        var label = row.realmProblem.problem.label;
        label.label_en = outputString;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 9) {
        // Compares supply plan shipments to USAID mandated ARV tier list (ARV specific)
        var label = row.realmProblem.problem.label;
        label.label_en = "Compares supply plan shipments to USAID mandated ARV tier list (ARV specific)";
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 10) {
        // Dynamic forecasting is not used for certain commodity groups (Malaria, ARV, VMMC)
        var label = row.realmProblem.problem.label;
        // label.label_en = "Dynamic forecasting is not used for certain commodity groups (Malaria, ARV, VMMC)";
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 11) {
        // Inventory doen't fall within min/max range
        var label = row.realmProblem.problem.label;
        label.label_en = "Inventory doen't fall within min/max range";
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 13) {
        // Inventory doen't fall within min/max range
        var label = row.realmProblem.problem.label;
        // label.label_en="Inventory doen't fall within min/max range";
        return getLabelText(label, lang);
    }

}