import moment from "moment";
import getLabelText from "../../CommonComponent/getLabelText";
import { DATE_FORMAT_CAP_WITHOUT_DATE, JEXCEL_MONTH_PICKER_FORMAT, JEXCEL_PAGINATION_OPTION } from "../../Constants";
import i18n from '../../i18n';
import jexcel from 'jexcel-pro';
import { DATE_FORMAT_CAP, JEXCEL_DATE_FORMAT_SM, JEXCEL_PRO_KEY } from '../../Constants.js';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionWithoutPagination } from '../../CommonComponent/JExcelCommonFunctions.js';
import { LOGO } from "../../CommonComponent/Logo";
import jsPDF from 'jspdf';
import "jspdf-autotable";

export function dataCheck(props, datasetJson) {
    var PgmTreeList = datasetJson.treeList;

    var treeScenarioNotes = [];
    var missingBranchesList = [];
    for (var tl = 0; tl < PgmTreeList.length; tl++) {
        var treeList = PgmTreeList[tl];
        var scenarioList = treeList.scenarioList;
        for (var ndm = 0; ndm < scenarioList.length; ndm++) {
            treeScenarioNotes.push({
                tree: PgmTreeList[tl].label,
                scenario: scenarioList[ndm].label,
                treeId: PgmTreeList[tl].treeId,
                scenarioId: scenarioList[ndm].id,
                scenarioNotes: scenarioList[ndm].notes
            });
        }
    }
    var treePlanningUnitList = [];
    var treeNodeList = [];
    var treeScenarioList = [];
    var missingBranchesList = [];
    for (var tl = 0; tl < PgmTreeList.length; tl++) {
        var treeList = PgmTreeList[tl];
        var flatList = treeList.tree.flatList;
        for (var fl = 0; fl < flatList.length; fl++) {
            var payload = flatList[fl].payload;
            var nodeDataMap = payload.nodeDataMap;
            var scenarioList = treeList.scenarioList;
            for (var ndm = 0; ndm < scenarioList.length; ndm++) {
                if (payload.nodeType.id == 5) {
                    var nodePlanningUnit = ((nodeDataMap[scenarioList[ndm].id])[0].puNode.planningUnit);
                    treePlanningUnitList.push(nodePlanningUnit);
                }

                //Tree scenario and node notes
                var nodeNotes = ((nodeDataMap[scenarioList[ndm].id])[0].notes);
                var modelingList = ((nodeDataMap[scenarioList[ndm].id])[0].nodeDataModelingList);
                var madelingNotes = "";
                for (var ml = 0; ml < modelingList.length; ml++) {
                    madelingNotes = madelingNotes.concat(modelingList[ml].notes).concat(" ")
                }
                treeNodeList.push({
                    tree: PgmTreeList[tl].label,
                    scenario: scenarioList[ndm].label,
                    treeId: PgmTreeList[tl].treeId,
                    scenarioId: scenarioList[ndm].id,
                    node: payload.label,
                    notes: nodeNotes,
                    madelingNotes: madelingNotes,
                    scenarioNotes: scenarioList[ndm].notes
                });
            }
            // Tree Forecast : branches missing PU
            var flatListFiltered = flatList.filter(c => flatList.filter(f => f.parent == c.id).length == 0);
            var flatListArray = []
            for (var flf = 0; flf < flatListFiltered.length; flf++) {
                var nodeTypeId = flatListFiltered[flf].payload.nodeType.id;
                if (nodeTypeId != 5) {
                    flatListArray.push(flatListFiltered[flf]);
                }
            }
        }
        missingBranchesList.push({
            treeId: PgmTreeList[tl].treeId,
            treeLabel: PgmTreeList[tl].label,
            flatList: flatListArray
        })

        //Nodes less than 100%
        var scenarioList = PgmTreeList[tl].scenarioList;
        var treeId = PgmTreeList[tl].treeId;
        for (var sc = 0; sc < scenarioList.length; sc++) {
            treeScenarioList.push(
                {
                    "treeId": treeId,
                    "treeLabel": PgmTreeList[tl].label,
                    "scenarioId": scenarioList[sc].id,
                    "scenarioLabel": scenarioList[sc].label
                });
        }
    }

    // Tree Forecast : planing unit missing on tree
    var puRegionList = []
    var datasetRegionList = datasetJson.regionList;
    for (var drl = 0; drl < datasetRegionList.length; drl++) {
        for (var ptl = 0; ptl < PgmTreeList.length; ptl++) {
            let regionListFiltered = PgmTreeList[ptl].regionList.filter(c => (c.id == datasetRegionList[drl].regionId));
            if (regionListFiltered.length == 0) {
                var regionIndex = puRegionList.findIndex(i => i == getLabelText(datasetRegionList[drl].label, props.state.lang))
                if (regionIndex == -1) {
                    puRegionList.push(getLabelText(datasetRegionList[drl].label, props.state.lang))
                }
            }
        }
    }
    var datasetPlanningUnit = datasetJson.planningUnitList;
    var notSelectedPlanningUnitList = [];
    for (var dp = 0; dp < datasetPlanningUnit.length; dp++) {
        var puId = datasetPlanningUnit[dp].planningUnit.id;
        let planningUnitNotSelected = treePlanningUnitList.filter(c => (c.id == puId));
        if (planningUnitNotSelected.length == 0) {
            notSelectedPlanningUnitList.push({
                planningUnit: datasetPlanningUnit[dp].planningUnit,
                regionsArray: datasetRegionList.map(c => getLabelText(c.label, props.state.lang))
            });
        } else {
            notSelectedPlanningUnitList.push({
                planningUnit: datasetPlanningUnit[dp].planningUnit,
                regionsArray: puRegionList
            });
        }
    }
    //*** */
    var startDate = moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD");
    var stopDate = moment(datasetJson.currentVersion.forecastStopDate).format("YYYY-MM-DD");
    var curDate = startDate;
    var nodeDataModelingList = datasetJson.nodeDataModelingList;
    var childrenWithoutHundred = [];
    var nodeWithPercentageChildren = [];

    for (var i = 0; curDate < stopDate; i++) {
        curDate = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
        for (var tl = 0; tl < PgmTreeList.length; tl++) {
            var treeList = PgmTreeList[tl];
            var flatList = treeList.tree.flatList;
            for (var fl = 0; fl < flatList.length; fl++) {
                var payload = flatList[fl].payload;
                var nodeDataMap = payload.nodeDataMap;
                var scenarioList = treeList.scenarioList;
                for (var ndm = 0; ndm < scenarioList.length; ndm++) {
                    // var nodeModellingList = nodeDataModelingList.filter(c => c.month == curDate);
                    var nodeChildrenList = flatList.filter(c => flatList[fl].id == c.parent && (c.payload.nodeType.id == 3 || c.payload.nodeType.id == 4 || c.payload.nodeType.id == 5));
                    if (nodeChildrenList.length > 0) {
                        var totalPercentage = 0;
                        for (var ncl = 0; ncl < nodeChildrenList.length; ncl++) {
                            var payloadChild = nodeChildrenList[ncl].payload;
                            var nodeDataMapChild = payloadChild.nodeDataMap;
                            var nodeDataMapForScenario = (nodeDataMapChild[scenarioList[ndm].id])[0];

                            var nodeModellingList = nodeDataMapForScenario.nodeDataMomList.filter(c => c.month == curDate);
                            var nodeModellingListFiltered = nodeModellingList;
                            if (nodeModellingListFiltered.length > 0) {
                                totalPercentage += nodeModellingListFiltered[0].endValue;
                            }
                        }
                        childrenWithoutHundred.push(
                            {
                                "treeId": PgmTreeList[tl].treeId,
                                "scenarioId": scenarioList[ndm].id,
                                "month": curDate,
                                "label": payload.label,
                                "id": flatList[fl].id,
                                "percentage": totalPercentage
                            }
                        )
                        if (i == 0) {
                            var index = nodeWithPercentageChildren.findIndex(c => c.id == flatList[fl].id);
                            if (index == -1) {
                                nodeWithPercentageChildren.push(
                                    {
                                        "id": flatList[fl].id,
                                        "label": payload.label,
                                        "treeId": PgmTreeList[tl].treeId,
                                        "scenarioId": scenarioList[ndm].id,
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
    // })
    // Consumption Forecast
    var startDate = moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD");
    var stopDate = moment(datasetJson.currentVersion.forecastStopDate).format("YYYY-MM-DD");

    var consumptionList = datasetJson.actualConsumptionList;
    var missingMonthList = [];

    //Consumption : planning unit less 24 month
    var consumptionListlessTwelve = [];
    var noForecastSelectedList = [];
    for (var dpu = 0; dpu < datasetPlanningUnit.length; dpu++) {
        for (var drl = 0; drl < datasetRegionList.length; drl++) {
            var curDate = startDate;
            var monthsArray = [];
            var puId = datasetPlanningUnit[dpu].planningUnit.id;
            var regionId = datasetRegionList[drl].regionId;
            var consumptionListFiltered = consumptionList.filter(c => c.planningUnit.id == puId && c.region.id == regionId);
            if (consumptionListFiltered.length < 24) {
                consumptionListlessTwelve.push({
                    planningUnitId: datasetPlanningUnit[dpu].planningUnit.id,
                    planningUnitLabel: datasetPlanningUnit[dpu].planningUnit.label,
                    regionId: datasetRegionList[drl].regionId,
                    regionLabel: datasetRegionList[drl].label,
                    noOfMonths: consumptionListFiltered.length
                })
            }

            //Consumption : missing months
            for (var i = 0; moment(curDate).format("YYYY-MM") < moment(Date.now()).format("YYYY-MM"); i++) {
                curDate = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
                var consumptionListFilteredForMonth = consumptionList.filter(c => c.planningUnit.id == puId && c.region.id == regionId && c.month == curDate);
                if (consumptionListFilteredForMonth.length == 0) {
                    monthsArray.push(moment(curDate).format(DATE_FORMAT_CAP_WITHOUT_DATE));
                }
            }

            if (monthsArray.length > 0) {
                missingMonthList.push({
                    planningUnitId: datasetPlanningUnit[dpu].planningUnit.id,
                    planningUnitLabel: datasetPlanningUnit[dpu].planningUnit.label,
                    regionId: datasetRegionList[drl].regionId,
                    regionLabel: datasetRegionList[drl].label,
                    monthsArray: monthsArray
                })
            }
        }
        //No Forecast selected
        var selectedForecast = datasetPlanningUnit[dpu].selectedForecastMap;
        var regionArray = [];
        for (var drl = 0; drl < datasetRegionList.length; drl++) {
            if (selectedForecast[datasetRegionList[drl].regionId] == undefined || (selectedForecast[datasetRegionList[drl].regionId].scenarioId == null && selectedForecast[datasetRegionList[drl].regionId].consumptionExtrapolationId == null)) {
                regionArray.push({ id: datasetRegionList[drl].regionId, label: getLabelText(datasetRegionList[drl].label, props.state.lang) });
            }
        }
        noForecastSelectedList.push({
            planningUnit: datasetPlanningUnit[dpu],
            regionList: regionArray
        })
    }
    props.updateState("noForecastSelectedList", noForecastSelectedList)
    props.updateState("missingMonthList", missingMonthList)
    props.updateState("consumptionListlessTwelve", consumptionListlessTwelve)
    props.updateState("notSelectedPlanningUnitList", notSelectedPlanningUnitList)
    props.updateState("treeNodeList", treeNodeList)
    props.updateState("treeScenarioList", treeScenarioList)
    props.updateState("missingBranchesList", missingBranchesList)
    props.updateState("treeScenarioNotes", treeScenarioNotes)
    props.updateState("datasetPlanningUnit", datasetPlanningUnit)
    props.updateState("childrenWithoutHundred", childrenWithoutHundred)
    props.updateState("nodeWithPercentageChildren", nodeWithPercentageChildren)
    props.updateState("startDate", startDate)
    props.updateState("stopDate", stopDate)
    props.updateState("progressPer", 25)
    props.updateState("loading", false)
}

export function buildJxl(props) {
    props.updateState("loading", true)
    var treeScenarioList = props.state.treeScenarioList;
    console.log("TreeScenarioList@@@",treeScenarioList)
    var treeScenarioListFilter = treeScenarioList;
    for (var tsl = 0; tsl < treeScenarioListFilter.length; tsl++) {
        var nodeWithPercentageChildren = props.state.nodeWithPercentageChildren.filter(c => c.treeId == treeScenarioListFilter[tsl].treeId && c.scenarioId == treeScenarioListFilter[tsl].scenarioId);
        if (nodeWithPercentageChildren.length > 0) {
            let childrenList = props.state.childrenWithoutHundred;
            let childrenArray = [];
            var data = [];
            let startDate = props.state.startDate;
            let stopDate = props.state.stopDate;
            var curDate = startDate;
            var nodeWithPercentageChildrenWithHundredCent = [];
            for (var i = 0; curDate < stopDate; i++) {
                curDate = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
                data = [];
                data[0] = curDate;
                for (var nwp = 0; nwp < nodeWithPercentageChildren.length; nwp++) {
                    var child = childrenList.filter(c => c.id == nodeWithPercentageChildren[nwp].id && c.month == curDate);
                    data[nwp + 1] = child.length > 0 ? (child[0].percentage).toFixed(2) : '';
                    nodeWithPercentageChildrenWithHundredCent[nwp] = nodeWithPercentageChildrenWithHundredCent[nwp] != 1 ? (child.length > 0 && (child[0].percentage).toFixed(2) != 100) ? 1 : 0 : 1;
                }
                childrenArray.push(data);
            }

            props.el = jexcel(document.getElementById("tableDiv" + tsl), '');
            props.el.destroy();

            var columnsArray = [];
            columnsArray.push({
                title: i18n.t('static.inventoryDate.inventoryReport'),
                type: 'calendar', options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' }, width: 100,
                // readOnly: true
            });
            for (var nwp = 0; nwp < nodeWithPercentageChildren.length; nwp++) {
                columnsArray.push({
                    title: getLabelText(nodeWithPercentageChildren[nwp].label, props.state.lang),
                    type: nodeWithPercentageChildrenWithHundredCent[nwp] == 1 ? 'numeric' : 'hidden',
                    mask: '#,##.00%', decimal: '.'
                    // readOnly: true
                });
            }
            treeScenarioListFilter[tsl].columnArray = columnsArray;
            treeScenarioListFilter[tsl].dataArray = childrenArray;
            var options = {
                data: childrenArray,
                columnDrag: true,
                colWidths: [0, 150, 150, 150, 100, 100, 100],
                colHeaderClasses: ["Reqasterisk"],
                columns: columnsArray,
                text: {
                    showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                    show: '',
                    entries: '',
                },
                onload: function (instance, cell, x, y, value) {
                    jExcelLoadedFunctionOnlyHideRow(instance);
                },
                updateTable: function (el, cell, x, y, source, value, id) {
                    if (y != null && x != 0) {
                        if (value != "100.00%") {
                            var elInstance = el.jexcel;
                            cell.classList.add('red');
                        }
                    }
                },

                // pagination: localStorage.getItem("sesRecordCount"),
                pagination: false,
                search: false,
                columnSorting: true,
                tableOverflow: true,
                wordWrap: true,
                allowInsertColumn: false,
                allowManualInsertColumn: false,
                allowDeleteRow: false,
                onselection: props.selected,
                copyCompatibility: true,
                allowExport: false,
                paginationOptions: JEXCEL_PAGINATION_OPTION,
                position: 'top',
                filters: true,
                license: JEXCEL_PRO_KEY,
                contextMenu: function (obj, x, y, e) {
                    return [];
                }.bind(this),
            };
            var languageEl = jexcel(document.getElementById("tableDiv" + tsl), options);
            props.el = languageEl;
        }
    }
    props.updateState("loading",false);
    props.updateState("treeScenarioListFilter",treeScenarioListFilter);
}

export function exportPDF(props) {
    const addFooters = doc => {

        const pageCount = doc.internal.getNumberOfPages()

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(6)
        for (var i = 1; i <= pageCount; i++) {
            doc.setPage(i)

            doc.setPage(i)
            doc.text('Page ' + String(i) + ' of ' + String(pageCount), doc.internal.pageSize.width / 9, doc.internal.pageSize.height - 30, {
                align: 'center'
            })
            doc.text('Copyright © 2020 ' + i18n.t('static.footer'), doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
                align: 'center'
            })


        }
    }
    const addHeaders = doc => {

        const pageCount = doc.internal.getNumberOfPages()


        //  var file = new File('QAT-logo.png','../../../assets/img/QAT-logo.png');
        // var reader = new FileReader();

        //var data='';
        // Use fs.readFile() method to read the file 
        //fs.readFile('../../assets/img/logo.svg', 'utf8', function(err, data){ 
        //}); 
        for (var i = 1; i <= pageCount; i++) {
            doc.setFontSize(12)
            doc.setFont('helvetica', 'bold')
            doc.setPage(i)
            doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
            /*doc.addImage(data, 10, 30, {
              align: 'justify'
            });*/
            doc.setTextColor("#002f6c");
            doc.text(i18n.t('static.commitTree.forecastValidation'), doc.internal.pageSize.width / 2, 60, {
                align: 'center'
            })
            if (i == 1) {
                doc.setFont('helvetica', 'normal')
                doc.setFontSize(8)
                doc.text(i18n.t('static.dashboard.programheader') + ' : ' + props.state.programName, doc.internal.pageSize.width / 20, 90, {
                    align: 'left'
                })

            }

        }
    }


    const unit = "pt";
    const size = "A4"; // Use A1, A2, A3 or A4
    const orientation = "landscape"; // portrait or landscape

    const marginLeft = 10;
    const doc = new jsPDF(orientation, unit, size, true);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal')


    var y = 110;
    var planningText = doc.splitTextToSize(i18n.t('static.common.forecastPeriod') + ' : ' + moment(props.state.forecastStartDate).format('MMM-YYYY') + ' to ' + moment(props.state.forecastStopDate).format('MMM-YYYY'), doc.internal.pageSize.width * 3 / 4);
    // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
    for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
            doc.addPage();
            y = 80;

        }
        doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
        y = y + 10;
    }


    doc.setFont('helvetica', 'bold')
    planningText = doc.splitTextToSize("1. " + i18n.t('static.commitTree.noForecastSelected'), doc.internal.pageSize.width * 3 / 4);
    // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
    y = y + 20;
    for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
            doc.addPage();
            y = 80;

        }
        doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
        y = y + 10;
    }

    doc.setFont('helvetica', 'normal')
    props.state.noForecastSelectedList.map((item, i) => {
        item.regionList.map(item1 => {
            planningText = doc.splitTextToSize(getLabelText(item.planningUnit.planningUnit.label, props.state.lang) + " - " + item1.label, doc.internal.pageSize.width * 3 / 4);
            // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
            y = y + 3;
            for (var i = 0; i < planningText.length; i++) {
                if (y > doc.internal.pageSize.height - 100) {
                    doc.addPage();
                    y = 80;

                }
                doc.text(doc.internal.pageSize.width / 15, y, planningText[i]);
                y = y + 10;
            }
        })
    })

    doc.setFont('helvetica', 'bold')
    planningText = doc.splitTextToSize("2. " + i18n.t('static.commitTree.consumptionForecast'), doc.internal.pageSize.width * 3 / 4);
    // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
    y = y + 20;
    for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
            doc.addPage();
            y = 80;

        }
        doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
        y = y + 10;
    }

    doc.setFont('helvetica', 'normal')
    planningText = doc.splitTextToSize("a. " + i18n.t('static.commitTree.monthsMissingActualConsumptionValues'), doc.internal.pageSize.width * 3 / 4);
    // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
    y = y + 10;
    for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
            doc.addPage();
            y = 80;

        }
        doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
        y = y + 10;
    }
    props.state.missingMonthList.map((item, i) => {
        doc.setFont('helvetica', 'bold')
        planningText = doc.splitTextToSize(getLabelText(item.planningUnitLabel, props.state.lang) + " - " + getLabelText(item.regionLabel, props.state.lang) + " : ", doc.internal.pageSize.width * 3 / 4);
        // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
        y = y + 10;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;

            }
            doc.text(doc.internal.pageSize.width / 15, y, planningText[i]);
            y = y + 10;
        }
        doc.setFont('helvetica', 'normal')
        planningText = doc.splitTextToSize("" + item.monthsArray, doc.internal.pageSize.width * 3 / 4);
        // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
        y = y + 3;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;

            }
            doc.text(doc.internal.pageSize.width / 15, y, planningText[i]);
            y = y + 10;
        }
    })

    doc.setFont('helvetica', 'normal')
    planningText = doc.splitTextToSize("b. " + i18n.t('static.commitTree.puThatDoNotHaveAtleast24MonthsOfActualConsumptionValues'), doc.internal.pageSize.width * 3 / 4);
    // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
    y = y + 20;
    for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
            doc.addPage();
            y = 80;

        }
        doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
        y = y + 10;
    }
    props.state.consumptionListlessTwelve.map((item, i) => {
        doc.setFont('helvetica', 'bold')
        planningText = doc.splitTextToSize(getLabelText(item.planningUnitLabel, props.state.lang) + " - " + getLabelText(item.regionLabel, props.state.lang) + " : ", doc.internal.pageSize.width * 3 / 4);
        // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
        y = y + 10;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;

            }
            doc.text(doc.internal.pageSize.width / 15, y, planningText[i]);
            y = y + 10;
        }
        doc.setFont('helvetica', 'normal')
        planningText = doc.splitTextToSize("" + item.noOfMonths + " month(s)", doc.internal.pageSize.width * 3 / 4);
        // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
        y = y + 3;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;

            }
            doc.text(doc.internal.pageSize.width / 15, y, planningText[i]);
            y = y + 10;
        }
    })

    doc.setFont('helvetica', 'bold')
    planningText = doc.splitTextToSize("3. " + i18n.t('static.commitTree.treeForecast'), doc.internal.pageSize.width * 3 / 4);
    // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
    y = y + 20;
    for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
            doc.addPage();
            y = 80;

        }
        doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
        y = y + 10;
    }

    doc.setFont('helvetica', 'normal')
    planningText = doc.splitTextToSize("a. " + i18n.t('static.commitTree.puThatDoesNotAppearOnAnyTree'), doc.internal.pageSize.width * 3 / 4);
    // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
    y = y + 10;
    for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
            doc.addPage();
            y = 80;

        }
        doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
        y = y + 10;
    }
    doc.setFont('helvetica', 'normal')
    props.state.notSelectedPlanningUnitList.map((item, i) => {
        planningText = doc.splitTextToSize(getLabelText(item.planningUnit.label, props.state.lang) + " - " + item.regionsArray, doc.internal.pageSize.width * 3 / 4);
        // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
        y = y + 3;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;

            }
            doc.text(doc.internal.pageSize.width / 15, y, planningText[i]);
            y = y + 10;
        }
    })

    doc.setFont('helvetica', 'normal')
    planningText = doc.splitTextToSize("b. " + i18n.t('static.commitTree.branchesMissingPlanningUnit'), doc.internal.pageSize.width * 3 / 4);
    // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
    y = y + 10;
    for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
            doc.addPage();
            y = 80;

        }
        doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
        y = y + 10;
    }

    props.state.missingBranchesList.map((item, i) => {
        doc.setFont('helvetica', 'normal')
        planningText = doc.splitTextToSize(getLabelText(item.treeLabel, props.state.lang), doc.internal.pageSize.width * 3 / 4);
        // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
        y = y + 10;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;

            }
            doc.text(doc.internal.pageSize.width / 15, y, planningText[i]);
            y = y + 10;
        }
        item.flatList.length > 0 && item.flatList.map((item1, j) => {
            doc.setFont('helvetica', 'normal')
            if (item1.payload.nodeType.id == 4) {
                doc.setTextColor("red")
            } else {
                doc.setTextColor("black")
            }

            planningText = doc.splitTextToSize(getLabelText(item1.payload.label, props.state.lang), doc.internal.pageSize.width * 3 / 4);
            // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
            y = y + 10;
            for (var i = 0; i < planningText.length; i++) {
                if (y > doc.internal.pageSize.height - 100) {
                    doc.addPage();
                    y = 80;

                }
                doc.text(doc.internal.pageSize.width / 10, y, planningText[i]);
                y = y + 10;
            }
        })

    })

    doc.setFont('helvetica', 'normal')
    planningText = doc.splitTextToSize("c. " + i18n.t('static.commitTree.NodesWithChildrenThatDoNotAddUpTo100Prcnt'), doc.internal.pageSize.width * 3 / 4);
    // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
    y = y + 10;
    for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
            doc.addPage();
            y = 80;

        }
        doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
        y = y + 10;
    }
    var height = doc.internal.pageSize.height - 50;
    var h1 = 50;
    //   var aspectwidth1 = (width - h1);
    var startY = y + 10
    var pages = Math.ceil(startY / height)
    for (var j = 1; j < pages; j++) {
        doc.addPage()
    }
    y = startY - ((height - h1) * (pages - 1))
    props.state.treeScenarioList.map((item1, count) => {
        var nodeWithPercentageChildren = props.state.nodeWithPercentageChildren.filter(c => c.treeId == item1.treeId && c.scenarioId == item1.scenarioId);
        if (nodeWithPercentageChildren.length > 0) {
            doc.setFont('helvetica', 'normal')
            planningText = doc.splitTextToSize(getLabelText(item1.treeLabel, props.state.lang) + " / " + getLabelText(item1.scenarioLabel, props.state.lang), doc.internal.pageSize.width * 3 / 4);
            // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
            y = y + 10;
            for (var i = 0; i < planningText.length; i++) {
                if (y > doc.internal.pageSize.height - 100) {
                    doc.addPage();
                    y = 80;

                }
                doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
                y = y + 10;
            }


            var columnsArray = [];
            item1.columnArray.filter(c => c.type != 'hidden').map(item4 => {
                columnsArray.push(item4.title)
            })
            var dataArr = [];
            item1.dataArray.map(item3 => {
                var dataArr1 = []
                item1.columnArray.map((item2, count) => {
                    if (item2.type != 'hidden') {
                        dataArr1.push(item3[count])
                    }
                })
                dataArr.push(dataArr1);
            })

            var data = dataArr;
            var content = {
                margin: { top: 80, bottom: 50 },
                startY: y,
                head: [columnsArray],
                body: data,
                styles: { lineWidth: 1, fontSize: 8, halign: 'center' }

            };
            doc.autoTable(content);
            doc.addPage();
            y = 80;
        }
    })

    doc.setFont('helvetica', 'bold')
    planningText = doc.splitTextToSize("4. " + i18n.t('static.program.notes'), doc.internal.pageSize.width * 3 / 4);
    // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
    y = y + 20;
    for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
            doc.addPage();
            y = 80;

        }
        doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
        y = y + 10;
    }

    doc.setFont('helvetica', 'normal')
    planningText = doc.splitTextToSize("a. " + i18n.t('static.forecastMethod.historicalData'), doc.internal.pageSize.width * 3 / 4);
    // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
    y = y + 10;
    for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
            doc.addPage();
            y = 80;

        }
        doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
        y = y + 10;
    }
    var height = doc.internal.pageSize.height;
    var h1 = 50;
    var startY = y + 10
    var pages = Math.ceil(startY / height)
    for (var j = 1; j < pages; j++) {
        doc.addPage()
    }
    var startYtable = startY - ((height - h1) * (pages - 1))
    var columns = [];
    columns.push(i18n.t('static.dashboard.planningunitheader'));
    columns.push(i18n.t('static.program.notes'));
    var headers = [columns]
    var dataArr2 = [];
    props.state.datasetPlanningUnit.map((item5, i) => {
        dataArr2.push([
            getLabelText(item5.planningUnit.label, props.state.lang),
            item5.consumtionNotes])
    });
    var content1 = {
        margin: { top: 80, bottom: 50 },
        startY: startYtable,
        head: headers,
        body: dataArr2,
        styles: { lineWidth: 1, fontSize: 8, halign: 'center' }

    };
    doc.autoTable(content1);
    doc.addPage()

    doc.setFont('helvetica', 'normal')
    y = 80;
    planningText = doc.splitTextToSize("b. " + i18n.t('static.commitTree.treeScenarios'), doc.internal.pageSize.width * 3 / 4);
    // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
    y = y + 10;
    for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
            doc.addPage();
            y = 80;

        }
        doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
        y = y + 10;
    }

    var height = doc.internal.pageSize.height;
    var h1 = 50;
    var startY = y + 10
    var pages = Math.ceil(startY / height)
    for (var j = 1; j < pages; j++) {
        doc.addPage()
    }
    var startYtable = startY - ((height - h1) * (pages - 1))
    var columns = [];
    columns.push(i18n.t('static.forecastMethod.tree'));
    columns.push(i18n.t('static.whatIf.scenario'));
    columns.push(i18n.t('static.program.notes'));
    var headers = [columns]
    var dataArr2 = [];
    props.state.treeScenarioNotes.map((item5, i) => {
        dataArr2.push([
            getLabelText(item5.tree, props.state.lang),
            getLabelText(item5.scenario, props.state.lang),
            item5.scenarioNotes
        ])
    });
    var content2 = {
        margin: { top: 80, bottom: 50 },
        startY: startYtable,
        head: headers,
        body: dataArr2,
        styles: { lineWidth: 1, fontSize: 8, halign: 'center' }

    };
    doc.autoTable(content2);
    y = 80;
    doc.addPage()
    doc.setFont('helvetica', 'normal')
    planningText = doc.splitTextToSize("c. " + i18n.t('static.commitTree.treeNodes'), doc.internal.pageSize.width * 3 / 4);
    // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
    y = y + 10;
    for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
            doc.addPage();
            y = 80;

        }
        doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
        y = y + 10;
    }
    var height = doc.internal.pageSize.height;
    var h1 = 50;
    var startY = y + 10
    var pages = Math.ceil(startY / height)
    for (var j = 1; j < pages; j++) {
        doc.addPage()
    }
    var startYtable = startY - ((height - h1) * (pages - 1))
    var columns = [];
    columns.push(i18n.t('static.forecastMethod.tree'));
    columns.push(i18n.t('static.common.node'));
    columns.push(i18n.t('static.whatIf.scenario'));
    columns.push(i18n.t('static.program.notes'));
    var headers = [columns]
    var dataArr2 = [];
    props.state.treeNodeList.map((item6, i) => {
        dataArr2.push([
            getLabelText(item6.tree, props.state.lang),
            getLabelText(item6.node, props.state.lang),
            getLabelText(item6.scenario, props.state.lang),
            ((item6.notes != "" && item6.notes != null) ? i18n.t('static.commitTree.main') + " : " + item6.notes : "" + "" +
                ((item6.madelingNotes != "" && item6.madelingNotes != null) ? i18n.t('static.commitTree.modeling') + " : " + item6.madelingNotes : ""))
        ])
    });
    var content3 = {
        margin: { top: 80, bottom: 50 },
        startY: startYtable,
        head: headers,
        body: dataArr2,
        styles: { lineWidth: 1, fontSize: 8, halign: 'center' }

    };
    doc.autoTable(content3);


    addHeaders(doc)
    addFooters(doc)
    doc.save(i18n.t('static.commitTree.forecastValidation').concat('.pdf'));
}

export function noForecastSelectedClicked(planningUnitId, regionId,props) {
    localStorage.setItem("sesDatasetPlanningUnitId", planningUnitId);
    localStorage.setItem("sesDatasetRegionId", regionId);
    localStorage.setItem("sesDatasetId",props.state.programId);
    const win = window.open("/#/report/compareAndSelectScenario", "_blank");
    win.focus();
    // this.props.history.push(``);
}

export function missingMonthsClicked(planningUnitId,props) {
    localStorage.setItem("sesDatasetId",props.state.programId);
    const win = window.open("/#/dataentry/consumptionDataEntryAndAdjustment/" + planningUnitId, "_blank");
    win.focus();
}

export function missingBranchesClicked(treeId,props) {
    localStorage.setItem("sesDatasetId",props.state.programId);
    const win = window.open(`/#/dataSet/buildTree/tree/${treeId}/${props.state.programId}`, "_blank");
    win.focus();
}

export function nodeWithPercentageChildrenClicked(treeId, scenarioId,props) {
    localStorage.setItem("sesDatasetId",props.state.programId);
    const win = window.open(`/#/dataSet/buildTree/tree/${treeId}/${props.state.programId}/${scenarioId}`, "_blank");
    win.focus();
}