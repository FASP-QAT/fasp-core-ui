import getLabelText from '../CommonComponent/getLabelText';
/**
 * This function is used to construct the problem desc based on different dynamic parameters
 * @param {*} row This is the instance of the problem
 * @param {*} lang This is the language in which the description must be displayed
 * @returns This function returns problem desc in specified language
 */
export default function getProblemDesc(row, lang) {
    if (row.realmProblem.problem.problemId == 1) {
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
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 2) {
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
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 3) {
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
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 4) {
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
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 5) {
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
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 6) {
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
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 7) {
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
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 8) {
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
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 9) {
        var label = row.realmProblem.problem.label;
        label.label_en = "Compares supply plan shipments to USAID mandated ARV tier list (ARV specific)";
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 10) {
        var label = row.realmProblem.problem.label;
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
    }
    if (row.realmProblem.problem.problemId == 13) {
        var label = row.data5.problemDescription;
        return label;
    }
    if (row.realmProblem.problem.problemId == 14) {
        var label = row.realmProblem.problem.label;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 15) {
        var label = row.realmProblem.problem.label;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 16) {
        var label = row.realmProblem.problem.label;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 17) {
        var label = row.realmProblem.problem.label;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 18) {
        var label = row.realmProblem.problem.label;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 19) {
        var label = row.realmProblem.problem.label;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 20) {
        var label = row.realmProblem.problem.label;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 21) {
        var label = row.realmProblem.problem.label;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 22) {
        var label = row.realmProblem.problem.label;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 23 || row.realmProblem.problem.problemId == 29) {
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
    }
    if (row.realmProblem.problem.problemId == 25) {
        var label = row.realmProblem.problem.label;
        return getLabelText(label, lang);
    }
    if (row.realmProblem.problem.problemId == 26 || row.realmProblem.problem.problemId == 27 || row.realmProblem.problem.problemId == 28) {
        const regex = /(?:\r\n|\r|\n)/g;
        var obj = JSON.parse(row.data5.toString().replaceAll(regex, '<br/>'));
        var label = obj.problemDescription;
        return label;
    }
}