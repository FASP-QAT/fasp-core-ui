import getLabelText from '../CommonComponent/getLabelText';

export default function getProblemDesc(row, lang) {
    if (row.realmProblem.problem.problemId == 1) {
        // Missing recent actual consumption inputs (within the last <%X%> months)
        var desc_en = row.realmProblem.problem.label.label_en;
        var desc_fr = row.realmProblem.problem.label.label_fr;
        var desc_sp = row.realmProblem.problem.label.label_sp;
        var desc_pr = row.realmProblem.problem.label.label_pr;

        var label = row.realmProblem.problem.label;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%X%>').join(row.realmProblem.data1);
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%X%>').join(row.realmProblem.data1);
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%X%>').join(row.realmProblem.data1);
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%X%>').join(row.realmProblem.data1);
            label.label_pr = result_pr;
        }

        // var outputString = row.realmProblem.problem.label.label_en.replace("<%X%>", row.realmProblem.data1);
        // // console.log("outputString=====>",outputString);
        // var label = row.realmProblem.problem.label;
        // label.label_en = outputString;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 2) {
        // Missing recent inventory inputs (within the last X months)
        // var label = row.realmProblem.problem.label;
        // label.label_en = "Missing recent inventory inputs (within the last " + row.realmProblem.data1 + " months)";
        // return getLabelText(label, lang);

        // var outputString = row.realmProblem.problem.label.label_en.replace("<%X%>", row.realmProblem.data1);
        // console.log("outputString=====>",outputString);
        var desc_en = row.realmProblem.problem.label.label_en;
        var desc_fr = row.realmProblem.problem.label.label_fr;
        var desc_sp = row.realmProblem.problem.label.label_sp;
        var desc_pr = row.realmProblem.problem.label.label_pr;

        var label = row.realmProblem.problem.label;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%X%>').join(row.realmProblem.data1);
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%X%>').join(row.realmProblem.data1);
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%X%>').join(row.realmProblem.data1);
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%X%>').join(row.realmProblem.data1);
            label.label_pr = result_pr;
        }
        // var label = row.realmProblem.problem.label;
        // label.label_en = outputString;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 3) {
        // Shipments have receive dates more than X days in the past
        // var label = row.realmProblem.problem.label;
        // label.label_en = "Shipments have receive dates more than " + row.realmProblem.data1 + " days in the past";
        // return getLabelText(label, lang);

        // var outputString = row.realmProblem.problem.label.label_en.replace("<%X%>", row.realmProblem.data1);
        // console.log("outputString=====>",outputString);
        var desc_en = row.realmProblem.problem.label.label_en;
        var desc_fr = row.realmProblem.problem.label.label_fr;
        var desc_sp = row.realmProblem.problem.label.label_sp;
        var desc_pr = row.realmProblem.problem.label.label_pr;

        var label = row.realmProblem.problem.label;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%X%>').join(row.realmProblem.data1);
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%X%>').join(row.realmProblem.data1);
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%X%>').join(row.realmProblem.data1);
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%X%>').join(row.realmProblem.data1);
            label.label_pr = result_pr;
        }
        // var label = row.realmProblem.problem.label;
        // label.label_en = outputString;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 4) {
        // Shipment have not been submitted for over X days since target date
        // var label = row.realmProblem.problem.label;
        // label.label_en = "Shipment have not been submitted for over " + row.realmProblem.data1 + " days since target date";
        // return getLabelText(label, lang);
        // var outputString = row.realmProblem.problem.label.label_en.replace("<%X%>", row.realmProblem.data1);
        // console.log("outputString=====>",outputString);
        var desc_en = row.realmProblem.problem.label.label_en;
        var desc_fr = row.realmProblem.problem.label.label_fr;
        var desc_sp = row.realmProblem.problem.label.label_sp;
        var desc_pr = row.realmProblem.problem.label.label_pr;

        var label = row.realmProblem.problem.label;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%X%>').join(row.realmProblem.data1);
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%X%>').join(row.realmProblem.data1);
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%X%>').join(row.realmProblem.data1);
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%X%>').join(row.realmProblem.data1);
            label.label_pr = result_pr;
        }
        // var label = row.realmProblem.problem.label;
        // label.label_en = outputString;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 5) {
        // Shipments have not been approved for more than X days since target date
        // var label = row.realmProblem.problem.label;
        // label.label_en = "Shipments have not been approved for more than " + row.realmProblem.data1 + " days since target date";
        // return getLabelText(label, lang);
        // var outputString = row.realmProblem.problem.label.label_en.replace("<%X%>", row.realmProblem.data1);
        // console.log("outputString=====>",outputString);
        var desc_en = row.realmProblem.problem.label.label_en;
        var desc_fr = row.realmProblem.problem.label.label_fr;
        var desc_sp = row.realmProblem.problem.label.label_sp;
        var desc_pr = row.realmProblem.problem.label.label_pr;

        var label = row.realmProblem.problem.label;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%X%>').join(row.realmProblem.data1);
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%X%>').join(row.realmProblem.data1);
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%X%>').join(row.realmProblem.data1);
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%X%>').join(row.realmProblem.data1);
            label.label_pr = result_pr;
        }
        // var label = row.realmProblem.problem.label;
        // label.label_en = outputString;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 6) {
        // Shipments have not shipped for more than X days since target date
        // var label = row.realmProblem.problem.label;
        // label.label_en = "Shipments have not shipped for more than " + row.realmProblem.data1 + " days since target date";
        // return getLabelText(label, lang);
        // var outputString = row.realmProblem.problem.label.label_en.replace("<%X%>", row.realmProblem.data1);
        // console.log("outputString=====>",outputString);
        var desc_en = row.realmProblem.problem.label.label_en;
        var desc_fr = row.realmProblem.problem.label.label_fr;
        var desc_sp = row.realmProblem.problem.label.label_sp;
        var desc_pr = row.realmProblem.problem.label.label_pr;

        var label = row.realmProblem.problem.label;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%X%>').join(row.realmProblem.data1);
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%X%>').join(row.realmProblem.data1);
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%X%>').join(row.realmProblem.data1);
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%X%>').join(row.realmProblem.data1);
            label.label_pr = result_pr;
        }

        // var label = row.realmProblem.problem.label;
        // label.label_en = outputString;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 7) {
        // Shipments have not arrived for more than X days since target date
        // var label = row.realmProblem.problem.label;
        // label.label_en = "Shipments have not arrived for more than " + row.realmProblem.data1 + " days since target date";
        // return getLabelText(label, lang);
        // var outputString = row.realmProblem.problem.label.label_en.replace("<%X%>", row.realmProblem.data1);
        // console.log("outputString=====>",outputString);
        var desc_en = row.realmProblem.problem.label.label_en;
        var desc_fr = row.realmProblem.problem.label.label_fr;
        var desc_sp = row.realmProblem.problem.label.label_sp;
        var desc_pr = row.realmProblem.problem.label.label_pr;

        var label = row.realmProblem.problem.label;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%X%>').join(row.realmProblem.data1);
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%X%>').join(row.realmProblem.data1);
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%X%>').join(row.realmProblem.data1);
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%X%>').join(row.realmProblem.data1);
            label.label_pr = result_pr;
        }

        // var label = row.realmProblem.problem.label;
        // label.label_en = outputString;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 8) {
        // No Forecasted consumption X months in to the future
        // var label = row.realmProblem.problem.label;
        // label.label_en = "No Forecasted consumption " + row.realmProblem.data1 + " months in to the future";
        // return getLabelText(label, lang);
        // var outputString = row.realmProblem.problem.label.label_en.replace("<%X%>", row.realmProblem.data1);
        // console.log("outputString=====>",outputString);
        var desc_en = row.realmProblem.problem.label.label_en;
        var desc_fr = row.realmProblem.problem.label.label_fr;
        var desc_sp = row.realmProblem.problem.label.label_sp;
        var desc_pr = row.realmProblem.problem.label.label_pr;

        var label = row.realmProblem.problem.label;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%X%>').join(row.realmProblem.data1);
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%X%>').join(row.realmProblem.data1);
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%X%>').join(row.realmProblem.data1);
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%X%>').join(row.realmProblem.data1);
            label.label_pr = result_pr;
        }
        // var label = row.realmProblem.problem.label;
        // label.label_en = outputString;
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
        var obj = JSON.parse(row.data5);
        var desc_en = row.realmProblem.problem.label.label_en;
        var desc_fr = row.realmProblem.problem.label.label_fr;
        var desc_sp = row.realmProblem.problem.label.label_sp;
        var desc_pr = row.realmProblem.problem.label.label_pr;
        var label = row.realmProblem.problem.label;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%RANGE_1TO6_MONTHS%>').join(obj.range1to6months).split('<%MOSABOVE_MAX_IN6MONTHS%>').join(obj.monthWithMosAboveThenMaxWithing6months).split('<%MOSLESS_MIN_IN6MONTHS%>').join(obj.monthWithMosLessThenMinWithing6months).split('<%RANGE_7TO18_MONTHS%>').join(obj.range7to18months).split('<%MOSABOVE_MAX_IN7TO18MONTHS%>').join(obj.monthWithMosAboveThenMaxWithing7to18months).split('<%MOSLESS_MIN_IN7TO18MONTHS%>').join(obj.monthWithMosLessThenMinWithing7to18months).split('<%SHIPMENTS_IN6MONTHS%>').join(obj.shipmentListWithin6Months).split('<%SHIPMENTS_IN7TO18MONTHS%>').join(obj.shipmentListWithin7to18Months);
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%RANGE_1TO6_MONTHS%>').join(obj.range1to6months).split('<%MOSABOVE_MAX_IN6MONTHS%>').join(obj.monthWithMosAboveThenMaxWithing6months).split('<%MOSLESS_MIN_IN6MONTHS%>').join(obj.monthWithMosLessThenMinWithing6months).split('<%RANGE_7TO18_MONTHS%>').join(obj.range7to18months).split('<%MOSABOVE_MAX_IN7TO18MONTHS%>').join(obj.monthWithMosAboveThenMaxWithing7to18months).split('<%MOSLESS_MIN_IN7TO18MONTHS%>').join(obj.monthWithMosLessThenMinWithing7to18months).split('<%SHIPMENTS_IN6MONTHS%>').join(obj.shipmentListWithin6Months).split('<%SHIPMENTS_IN7TO18MONTHS%>').join(obj.shipmentListWithin7to18Months);
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%RANGE_1TO6_MONTHS%>').join(obj.range1to6months).split('<%MOSABOVE_MAX_IN6MONTHS%>').join(obj.monthWithMosAboveThenMaxWithing6months).split('<%MOSLESS_MIN_IN6MONTHS%>').join(obj.monthWithMosLessThenMinWithing6months).split('<%RANGE_7TO18_MONTHS%>').join(obj.range7to18months).split('<%MOSABOVE_MAX_IN7TO18MONTHS%>').join(obj.monthWithMosAboveThenMaxWithing7to18months).split('<%MOSLESS_MIN_IN7TO18MONTHS%>').join(obj.monthWithMosLessThenMinWithing7to18months).split('<%SHIPMENTS_IN6MONTHS%>').join(obj.shipmentListWithin6Months).split('<%SHIPMENTS_IN7TO18MONTHS%>').join(obj.shipmentListWithin7to18Months);
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%RANGE_1TO6_MONTHS%>').join(obj.range1to6months).split('<%MOSABOVE_MAX_IN6MONTHS%>').join(obj.monthWithMosAboveThenMaxWithing6months).split('<%MOSLESS_MIN_IN6MONTHS%>').join(obj.monthWithMosLessThenMinWithing6months).split('<%RANGE_7TO18_MONTHS%>').join(obj.range7to18months).split('<%MOSABOVE_MAX_IN7TO18MONTHS%>').join(obj.monthWithMosAboveThenMaxWithing7to18months).split('<%MOSLESS_MIN_IN7TO18MONTHS%>').join(obj.monthWithMosLessThenMinWithing7to18months).split('<%SHIPMENTS_IN6MONTHS%>').join(obj.shipmentListWithin6Months).split('<%SHIPMENTS_IN7TO18MONTHS%>').join(obj.shipmentListWithin7to18Months);
            label.label_pr = result_pr;
        }
        return getLabelText(label, lang);
        // Inventory doen't fall within min/max range
        // var label = row.realmProblem.problem.label;
        // label.label_en = "Inventory doen't fall within min/max range";
        // return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 13) {
        // Inventory doen't fall within min/max range
        // var label = row.realmProblem.problem.label;
        var label = row.data5.problemDescription;
        // label.label_en="Inventory doen't fall within min/max range";
        return label;
        // return getLabelText(label, lang);

    }
    if (row.realmProblem.problem.problemId == 14) {
        // Dynamic forecasting is not used for certain commodity groups (Malaria, ARV, VMMC)
        var label = row.realmProblem.problem.label;
        // label.label_en = "Dynamic forecasting is not used for certain commodity groups (Malaria, ARV, VMMC)";
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 15) {
        // Dynamic forecasting is not used for certain commodity groups (Malaria, ARV, VMMC)
        var label = row.realmProblem.problem.label;
        // label.label_en = "Dynamic forecasting is not used for certain commodity groups (Malaria, ARV, VMMC)";
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 16) {
        // Inventory doen't fall within min/max range
        var label = row.realmProblem.problem.label;
        // label.label_en = "Inventory doen't fall within min/max range";
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 17) {
        // Inventory doen't fall within min/max range
        var label = row.realmProblem.problem.label;
        // label.label_en = "Inventory doen't fall within min/max range";
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 18) {
        // Inventory doen't fall within min/max range
        var label = row.realmProblem.problem.label;
        // label.label_en = "Inventory doen't fall within min/max range";
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 19) {
        // Inventory doen't fall within min/max range
        var label = row.realmProblem.problem.label;
        // label.label_en = "Inventory doen't fall within min/max range";
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 20) {
        // Inventory doen't fall within min/max range
        var label = row.realmProblem.problem.label;
        // label.label_en = "Inventory doen't fall within min/max range";
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 21) {
        var label = row.realmProblem.problem.label;
        // label.label_en = "Inventory doen't fall within min/max range";
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 22) {
        var label = row.realmProblem.problem.label;
        // label.label_en = "Inventory doen't fall within min/max range";
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 23) {
        var obj = JSON.parse(row.data5);
        var desc_en = row.realmProblem.problem.label.label_en;
        var desc_fr = row.realmProblem.problem.label.label_fr;
        var desc_sp = row.realmProblem.problem.label.label_sp;
        var desc_pr = row.realmProblem.problem.label.label_pr;
        var label = row.realmProblem.problem.label;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%RANGE_1TO6_MONTHS%>').join(obj.range1to6months).split('<%MOSABOVE_MAX_IN6MONTHS%>').join(obj.monthWithMosAboveThenMaxWithing6months).split('<%MOSLESS_MIN_IN6MONTHS%>').join(obj.monthWithMosLessThenMinWithing6months).split('<%RANGE_7TO18_MONTHS%>').join(obj.range7to18months).split('<%MOSABOVE_MAX_IN7TO18MONTHS%>').join(obj.monthWithMosAboveThenMaxWithing7to18months).split('<%MOSLESS_MIN_IN7TO18MONTHS%>').join(obj.monthWithMosLessThenMinWithing7to18months).split('<%SHIPMENTS_IN6MONTHS%>').join(obj.shipmentListWithin6Months).split('<%SHIPMENTS_IN7TO18MONTHS%>').join(obj.shipmentListWithin7to18Months);
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%RANGE_1TO6_MONTHS%>').join(obj.range1to6months).split('<%MOSABOVE_MAX_IN6MONTHS%>').join(obj.monthWithMosAboveThenMaxWithing6months).split('<%MOSLESS_MIN_IN6MONTHS%>').join(obj.monthWithMosLessThenMinWithing6months).split('<%RANGE_7TO18_MONTHS%>').join(obj.range7to18months).split('<%MOSABOVE_MAX_IN7TO18MONTHS%>').join(obj.monthWithMosAboveThenMaxWithing7to18months).split('<%MOSLESS_MIN_IN7TO18MONTHS%>').join(obj.monthWithMosLessThenMinWithing7to18months).split('<%SHIPMENTS_IN6MONTHS%>').join(obj.shipmentListWithin6Months).split('<%SHIPMENTS_IN7TO18MONTHS%>').join(obj.shipmentListWithin7to18Months);
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%RANGE_1TO6_MONTHS%>').join(obj.range1to6months).split('<%MOSABOVE_MAX_IN6MONTHS%>').join(obj.monthWithMosAboveThenMaxWithing6months).split('<%MOSLESS_MIN_IN6MONTHS%>').join(obj.monthWithMosLessThenMinWithing6months).split('<%RANGE_7TO18_MONTHS%>').join(obj.range7to18months).split('<%MOSABOVE_MAX_IN7TO18MONTHS%>').join(obj.monthWithMosAboveThenMaxWithing7to18months).split('<%MOSLESS_MIN_IN7TO18MONTHS%>').join(obj.monthWithMosLessThenMinWithing7to18months).split('<%SHIPMENTS_IN6MONTHS%>').join(obj.shipmentListWithin6Months).split('<%SHIPMENTS_IN7TO18MONTHS%>').join(obj.shipmentListWithin7to18Months);
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%RANGE_1TO6_MONTHS%>').join(obj.range1to6months).split('<%MOSABOVE_MAX_IN6MONTHS%>').join(obj.monthWithMosAboveThenMaxWithing6months).split('<%MOSLESS_MIN_IN6MONTHS%>').join(obj.monthWithMosLessThenMinWithing6months).split('<%RANGE_7TO18_MONTHS%>').join(obj.range7to18months).split('<%MOSABOVE_MAX_IN7TO18MONTHS%>').join(obj.monthWithMosAboveThenMaxWithing7to18months).split('<%MOSLESS_MIN_IN7TO18MONTHS%>').join(obj.monthWithMosLessThenMinWithing7to18months).split('<%SHIPMENTS_IN6MONTHS%>').join(obj.shipmentListWithin6Months).split('<%SHIPMENTS_IN7TO18MONTHS%>').join(obj.shipmentListWithin7to18Months);
            label.label_pr = result_pr;
        }
        return getLabelText(label, lang);
        // Inventory doen't fall within min/max range
        // var label = row.realmProblem.problem.label;
        // label.label_en = "Inventory doen't fall within min/max range";
        // return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 24) {
        var obj = JSON.parse(row.data5);
        var desc_en = row.realmProblem.problem.label.label_en;
        var desc_fr = row.realmProblem.problem.label.label_fr;
        var desc_sp = row.realmProblem.problem.label.label_sp;
        var desc_pr = row.realmProblem.problem.label.label_pr;
        var label = row.realmProblem.problem.label;
        if (desc_en != null && desc_en != '') {
            const result_en = desc_en.split('<%RANGE_1TO6_MONTHS%>').join(obj.range1to6months).split('<%STOCKOUT_1TO6_MONTHS%>').join(obj.stockoutsWithing6months).split('<%RANGE_7TO18_MONTHS%>').join(obj.range7to18months).split('<%STOCKOUT_7TO18_MONTHS%>').join(obj.stockoutsWithing7to18months).split('<%SHIPMENTS_IN6MONTHS%>').join(obj.shipmentListWithin6Months).split('<%SHIPMENTS_IN7TO18MONTHS%>').join(obj.shipmentListWithin7to18Months);
            label.label_en = result_en;
        } if (desc_fr != null && desc_fr != '') {
            const result_fr = desc_fr.split('<%RANGE_1TO6_MONTHS%>').join(obj.range1to6months).split('<%STOCKOUT_1TO6_MONTHS%>').join(obj.stockoutsWithing6months).split('<%RANGE_7TO18_MONTHS%>').join(obj.range7to18months).split('<%STOCKOUT_7TO18_MONTHS%>').join(obj.stockoutsWithing7to18months).split('<%SHIPMENTS_IN6MONTHS%>').join(obj.shipmentListWithin6Months).split('<%SHIPMENTS_IN7TO18MONTHS%>').join(obj.shipmentListWithin7to18Months);
            label.label_fr = result_fr;
        } if (desc_sp != null && desc_sp != '') {
            const result_sp = desc_sp.split('<%RANGE_1TO6_MONTHS%>').join(obj.range1to6months).split('<%STOCKOUT_1TO6_MONTHS%>').join(obj.stockoutsWithing6months).split('<%RANGE_7TO18_MONTHS%>').join(obj.range7to18months).split('<%STOCKOUT_7TO18_MONTHS%>').join(obj.stockoutsWithing7to18months).split('<%SHIPMENTS_IN6MONTHS%>').join(obj.shipmentListWithin6Months).split('<%SHIPMENTS_IN7TO18MONTHS%>').join(obj.shipmentListWithin7to18Months);
            label.label_sp = result_sp;
        } if (desc_pr != null && desc_pr != '') {
            const result_pr = desc_pr.split('<%RANGE_1TO6_MONTHS%>').join(obj.range1to6months).split('<%STOCKOUT_1TO6_MONTHS%>').join(obj.stockoutsWithing6months).split('<%RANGE_7TO18_MONTHS%>').join(obj.range7to18months).split('<%STOCKOUT_7TO18_MONTHS%>').join(obj.stockoutsWithing7to18months).split('<%SHIPMENTS_IN6MONTHS%>').join(obj.shipmentListWithin6Months).split('<%SHIPMENTS_IN7TO18MONTHS%>').join(obj.shipmentListWithin7to18Months);
            label.label_pr = result_pr;
        }
        return getLabelText(label, lang);
        // Inventory doen't fall within min/max range
        // var label = row.realmProblem.problem.label;
        // label.label_en = "Inventory doen't fall within min/max range";
        // return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 25) {
        var label = row.realmProblem.problem.label;
        // label.label_en = "Inventory doen't fall within min/max range";
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 26) {
        var obj = JSON.parse(row.data5);
        var label = obj.problemDescription;
        return label;
    }

}