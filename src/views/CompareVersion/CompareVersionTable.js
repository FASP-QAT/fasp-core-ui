import React, { Component } from 'react';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import i18n from '../../i18n'
import { DATE_FORMAT_CAP_WITHOUT_DATE, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, LATEST_VERSION_COLOUR, LOCAL_VERSION_COLOUR, OPEN_PROBLEM_STATUS_ID } from '../../Constants';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import getLabelText from '../../CommonComponent/getLabelText'
import {
    Col, Row, Card, CardBody, Form,
    FormGroup, Label, InputGroup, Input, Button,
    Nav, NavItem, NavLink, TabContent, TabPane, CardFooter, Modal, ModalBody, ModalFooter, ModalHeader,
    FormFeedback
} from 'reactstrap';
import { jExcelLoadedFunctionWithoutPagination, jExcelLoadedFunctionOnlyHideRow, inValid, inValidWithColor, jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js'
import jsPDF from "jspdf";
import { LOGO } from '../../CommonComponent/Logo';
import moment from "moment";

export default class CompareVersion extends Component {
    constructor(props) {
        super(props);
        this.state = {
            datasetData: {},
            datasetData1: {},
            regionList: [],
            regionList1: [],
            regionList2: []
        }
        this.loaded = this.loaded.bind(this);
        this.exportCSV = this.exportCSV.bind(this);
        this.toggleLarge = this.toggleLarge.bind(this);
        this.showData = this.showData.bind(this);
        this.acceptCurrentChanges = this.acceptCurrentChanges.bind(this);
        this.acceptIncomingChanges = this.acceptIncomingChanges.bind(this);
    }

    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }

    formatter = value => {

        var cell1 = value
        cell1 += '';
        var x = cell1.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }

    exportPDF() {
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
                doc.text(i18n.t('static.dashboard.compareVersion'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFont('helvetica', 'normal')
                    doc.setFontSize(8)
                    doc.text(i18n.t('static.dashboard.programheader') + ' : ' + document.getElementById("datasetId").selectedOptions[0].text, doc.internal.pageSize.width / 20, 90, {
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
        doc.setTextColor("#002f6c");


        var y = 110;
        doc.text(i18n.t('static.report.version') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 20, y, {
            align: 'left'
        })
        doc.text(i18n.t('static.common.forecastPeriod') + ' : ' + moment(this.props.datasetData.currentVersion.forecastStartDate).format(DATE_FORMAT_CAP_WITHOUT_DATE) + " - " + moment(this.props.datasetData.currentVersion.forecastStopDate).format(DATE_FORMAT_CAP_WITHOUT_DATE), doc.internal.pageSize.width / 5, y, {
            align: 'left'
        })
        doc.text(i18n.t('static.common.note') + ' : ' + this.props.datasetData.currentVersion.notes, doc.internal.pageSize.width / 2.8, y, {
            align: 'left'
        })
        y = y + 10;
        doc.text(i18n.t('static.compareVersion.compareWithVersion') + ' : ' + document.getElementById("versionId1").selectedOptions[0].text, doc.internal.pageSize.width / 20, y, {
            align: 'left'
        })
        doc.text(i18n.t('static.common.forecastPeriod') + ' : ' + moment(this.props.datasetData1.currentVersion.forecastStartDate).format(DATE_FORMAT_CAP_WITHOUT_DATE) + " - " + moment(this.props.datasetData1.currentVersion.forecastStopDate).format(DATE_FORMAT_CAP_WITHOUT_DATE), doc.internal.pageSize.width / 5, y, {
            align: 'left'
        })
        doc.text(i18n.t('static.common.note') + ' : ' + this.props.datasetData1.currentVersion.notes, doc.internal.pageSize.width / 2.8, y, {
            align: 'left'
        })
        y = y + 10;





        //   const title = i18n.t('static.dashboard.globalconsumption');
        //   var canvas = document.getElementById("cool-canvas");
        //   //creates image

        //   var canvasImg = canvas.toDataURL("image/png", 1.0);
        //   var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        //   var aspectwidth1 = (width - h1);
        let startY = y + 10
        //   console.log('startY', startY)
        let pages = Math.ceil(startY / height)
        for (var j = 1; j < pages; j++) {
            doc.addPage()
        }
        let startYtable = startY - ((height - h1) * (pages - 1))
        //   doc.setTextColor("#fff");
        //   if (startYtable > (height - 400)) {
        //     doc.addPage()
        //     startYtable = 80
        //   }
        //   doc.addImage(canvasImg, 'png', 50, startYtable, 750, 260, 'CANVAS');
        var columns = [];
        this.state.columns.filter(c => c.type != 'hidden').map((item, idx) => { columns.push(item.title) });
        const headers2 = [
            { content: '', colSpan: 1 },
            { content: '', colSpan: 1 },
            { content: this.props.versionLabel, colSpan: 3 },
            { content: this.props.versionLabel1, colSpan: 3 }
        ];
        var dataArr = [];
        var dataArr1 = [];
        this.state.dataEl.getJson(null, false).map(ele => {
            dataArr = [];
            this.state.columns.map((item, idx) => {
                if (item.type != 'hidden') {
                    if (item.type == 'numeric') {
                        dataArr.push(this.formatter(ele[idx]));
                    } else {
                        dataArr.push(ele[idx]);
                    }
                }
            })
            dataArr1.push(dataArr);
        })
        const data = dataArr1;
        // doc.addPage()
        let content = {
            margin: { top: 80, bottom: 50 },
            startY: startYtable,
            head: [headers2, columns],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center' }

        };


        //doc.text(title, marginLeft, 40);
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.dashboard.compareVersion').concat('.pdf'));
        //creates PDF from img
        /*  var doc = new jsPDF('landscape');
          doc.setFontSize(20);
          doc.text(15, 15, "Cool Chart");
          doc.save('canvas.pdf');*/
    }

    exportCSV() {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.dashboard.programheader') + ' : ' + document.getElementById("datasetId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.report.version') + ' : ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.forecastPeriod') + ' : ' + moment(this.props.datasetData.currentVersion.forecastStartDate).format(DATE_FORMAT_CAP_WITHOUT_DATE) + " - " + moment(this.props.datasetData.currentVersion.forecastStopDate).format(DATE_FORMAT_CAP_WITHOUT_DATE)).replaceAll(" ",'%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.note') + ' : ' + this.props.datasetData.currentVersion.notes).replaceAll(' ', '%20').replaceAll('#', '%23') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.compareVersion.compareWithVersion') + ' : ' + document.getElementById("versionId1").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.forecastPeriod') + ' : ' + moment(this.props.datasetData1.currentVersion.forecastStartDate).format(DATE_FORMAT_CAP_WITHOUT_DATE) + " - " + moment(this.props.datasetData1.currentVersion.forecastStopDate).format(DATE_FORMAT_CAP_WITHOUT_DATE)).replaceAll(" ",'%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.note') + ' : ' + this.props.datasetData1.currentVersion.notes).replaceAll(' ', '%20').replaceAll('#', '%23') + '"')
        csvRow.push('')


        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        var re;
        var columns = [];
        // columns.push(i18n.t('static.common.level'));
        // columns.push(i18n.t('static.supplyPlan.type'));
        // columns.push(i18n.t('static.forecastingunit.forecastingunit'));
        // columns.push(i18n.t('static.forecastingunit.forecastingunit') + " " + i18n.t('static.common.text'));
        // columns.push(i18n.t('static.common.product'));
        // columns.push(i18n.t('static.common.product') + " " + i18n.t('static.common.text'));
        // columns.push(i18n.t('static.productValidation.cost'));
        const headers = [];
        this.state.columns.filter(c => c.type != 'hidden').map((item, idx) => { headers[idx] = (item.title).replaceAll(' ', '%20') });

        var A = [this.addDoubleQuoteToRowContent(headers)];
        var C = [this.addDoubleQuoteToRowContent(["", "", this.props.versionLabel, this.props.versionLabel, this.props.versionLabel, this.props.versionLabel1, this.props.versionLabel1, this.props.versionLabel1])];
        var B = []
        this.state.dataEl.getJson(null, false).map(ele => {
            B = [];
            this.state.columns.map((item, idx) => {
                if (item.type != 'hidden') {
                    B.push(ele[idx].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23'));
                }
            })
            A.push(this.addDoubleQuoteToRowContent(B));
        })

        for (var i = 0; i < C.length; i++) {
            csvRow.push(C[i].join(","))
        }
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }

        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.dashboard.compareVersion') + ".csv"
        document.body.appendChild(a)
        a.click()
    }

    componentDidMount() {
        console.log("DatasetData+++", this.props.datasetData);
        console.log("DatasetData1+++", this.props.datasetData1);
        this.props.updateState("loading", true);
        var datasetData = this.props.datasetData;// local working copy
        var datasetData1 = this.props.datasetData1;//server latest version
        var datasetData2 = this.props.datasetData2;// local downloaded data

        var planningUnitList = (datasetData.planningUnitList).concat(datasetData1.planningUnitList).concat(datasetData2.planningUnitList).sort(function (a, b) {
            a = getLabelText(a.planningUnit.label, this.state.lang).toLowerCase();
            b = getLabelText(b.planningUnit.label, this.state.lang).toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        }.bind(this));

        var planningUnitSet = [...new Set(planningUnitList.map(ele => (ele.planningUnit.id)))]
        let dataArray = [];
        let data = [];
        let columns = [];
        let nestedHeaders = [];
        var regionList = datasetData.regionList;
        var regionList1 = datasetData1.regionList;
        var regionList2 = datasetData2.regionList;

        var combineRegionList = (regionList).concat(regionList1).concat(regionList2).sort(function (a, b) {
            a = getLabelText(a.label, this.state.lang).toLowerCase();
            b = getLabelText(b.label, this.state.lang).toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        }.bind(this));

        var regionSet = [...new Set(combineRegionList.map(ele => (ele.regionId)))]
        this.setState({
            regionList: regionList, regionList1: regionList1, regionList2: regionList2
        })
        nestedHeaders.push(
            [
                {
                    title: '',
                    rowspan: '1'
                },
                {
                    title: '',
                    rowspan: '1'
                },
                {
                    title: this.props.versionLabel,
                    colspan: 3,
                },
                {
                    title: this.props.versionLabel1,
                    colspan: 3,
                },
            ]
        );
        // var regionJson = [];
        // regionJson.push({
        //     title: "",
        //     rowspan: '3'
        // })
        // for (var r = 0; r < regionList.length; r++) {
        //     regionJson.push({
        //         title: regionList[r].label.label_en,
        //         colspan: 3
        //     })
        // }
        // for (var r = 0; r < regionList1.length; r++) {
        //     regionJson.push({
        //         title: regionList1[r].label.label_en,
        //         colspan: 3
        //     })
        // }
        // for (var r = 0; r < regionList2.length; r++) {
        //     regionJson.push({
        //         title: regionList2[r].label.label_en,
        //         colspan: 3,
        //         type:'hidden'
        //     })
        // }
        // var regionJsonStr = regionJson.map(item => {
        //     return { title: item.title, colspan: 3 }
        // }).join(',')
        // nestedHeaders.push(regionJson);
        columns.push({ title: i18n.t('static.consumption.planningunit'), width: 300 })
        columns.push({ title: i18n.t('static.dashboard.regionreport'), width: 100 })
        // for (var r = 0; r < regionList.length; r++) {
        columns.push({ title: i18n.t('static.compareVersion.selectedForecast'), width: 200 })
        columns.push({ title: i18n.t('static.compareVersion.forecastQty'), width: 120, type: 'numeric', mask: '#,##.00', decimal: '.' })
        columns.push({ title: i18n.t('static.program.notes'), width: 210 })
        // }
        // for (var r = 0; r < regionList1.length; r++) {
        columns.push({ title: i18n.t('static.compareVersion.selectedForecast'), width: 200 })
        columns.push({ title: i18n.t('static.compareVersion.forecastQty'), width: 120, type: 'numeric', mask: '#,##.00', decimal: '.' })
        columns.push({ title: i18n.t('static.program.notes'), width: 210 })
        // }
        // for (var r = 0; r < regionList2.length; r++) {
        columns.push({ title: i18n.t('static.compareVersion.selectedForecast'), width: 200, type: 'hidden' })
        columns.push({ title: i18n.t('static.compareVersion.forecastQty'), width: 120, type: 'hidden' })
        columns.push({ title: i18n.t('static.program.notes'), width: 210, type: 'hidden' })
        // }

        var scenarioList = [];
        var treeScenarioList = [];
        for (var t = 0; t < datasetData.treeList.length; t++) {
            scenarioList = scenarioList.concat(datasetData.treeList[t].scenarioList);
            var sl = datasetData.treeList[t].scenarioList;
            for (var s = 0; s < sl.length; s++) {
                treeScenarioList.push({ treeLabel: getLabelText(datasetData.treeList[t].label), scenarioId: sl[s].id, treeId: datasetData.treeList[t].treeId, scenarioLabel: getLabelText(sl[s].label) })
            }

        }

        var scenarioList1 = [];
        var treeScenarioList1 = [];
        for (var t = 0; t < datasetData1.treeList.length; t++) {
            scenarioList1 = scenarioList1.concat(datasetData1.treeList[t].scenarioList);
            var sl = datasetData1.treeList[t].scenarioList;
            for (var s = 0; s < sl.length; s++) {
                treeScenarioList1.push({ treeLabel: getLabelText(datasetData1.treeList[t].label), scenarioId: sl[s].id, treeId: datasetData1.treeList[t].treeId, scenarioLabel: getLabelText(sl[s].label) })
            }
        }

        var scenarioList2 = [];
        var treeScenarioList2 = [];
        for (var t = 0; t < datasetData2.treeList.length; t++) {
            scenarioList2 = scenarioList2.concat(datasetData2.treeList[t].scenarioList);
            var sl = datasetData2.treeList[t].scenarioList;
            for (var s = 0; s < sl.length; s++) {
                treeScenarioList2.push({ treeLabel: getLabelText(datasetData2.treeList[t].label), scenarioId: sl[s].id, treeId: datasetData2.treeList[t].treeId, scenarioLabel: getLabelText(sl[s].label) })
            }
        }

        var consumptionExtrapolation = datasetData.consumptionExtrapolation;
        var consumptionExtrapolation1 = datasetData1.consumptionExtrapolation;
        var consumptionExtrapolation2 = datasetData2.consumptionExtrapolation;

        for (var j = 0; j < planningUnitSet.length; j++) {
            for (var k = 0; k < regionSet.length; k++) {
                data = [];
                var pu = datasetData.planningUnitList.filter(c => c.planningUnit.id == planningUnitSet[j]);
                var pu1 = datasetData1.planningUnitList.filter(c => c.planningUnit.id == planningUnitSet[j]);
                var pu2 = datasetData2.planningUnitList.filter(c => c.planningUnit.id == planningUnitSet[j]);

                var rg = regionList.filter(c => c.regionId == regionSet[k]);
                var rg1 = regionList1.filter(c => c.regionId == regionSet[k]);
                var rg2 = regionList2.filter(c => c.regionId == regionSet[k]);

                var selectedForecastData = pu.length > 0 ? pu[0].selectedForecastMap : '';
                var selectedForecastData1 = pu1.length > 0 ? pu1[0].selectedForecastMap : '';
                var selectedForecastData2 = pu2.length > 0 ? pu2[0].selectedForecastMap : '';


                console.log("consumptionExtrapolation", consumptionExtrapolation);

                data[0] = pu.length > 0 ? getLabelText(pu[0].planningUnit.label, this.state.lang) : getLabelText(pu1[0].planningUnit.label);
                data[1] = rg.length > 0 ? getLabelText(rg[0].label) : getLabelText(rg1[0].label);

                // var count = 1;
                // for (var r = 0; r < regionList.length; r++) {
                var regionalSelectedForecastData = selectedForecastData[regionSet[k]];
                console.log("regionalSelectedForecastData", regionalSelectedForecastData);
                var ce = regionalSelectedForecastData != undefined && regionalSelectedForecastData.consumptionExtrapolationId != null ? consumptionExtrapolation.filter(c => c.consumptionExtrapolationId == regionalSelectedForecastData.consumptionExtrapolationId) : [];
                var selectedTreeScenario = [];
                if (regionalSelectedForecastData != undefined && regionalSelectedForecastData.scenarioId != "" && regionalSelectedForecastData.scenarioId != null) {
                    selectedTreeScenario = treeScenarioList.filter(c => c.scenarioId == regionalSelectedForecastData.scenarioId && c.treeId == regionalSelectedForecastData.treeId);
                }
                data[2] = regionalSelectedForecastData != undefined ? regionalSelectedForecastData.scenarioId != "" && regionalSelectedForecastData.scenarioId != null ? selectedTreeScenario.length > 0 ? selectedTreeScenario[0].treeLabel + " ~ " + selectedTreeScenario[0].scenarioLabel : "" : regionalSelectedForecastData.consumptionExtrapolationId != "" && regionalSelectedForecastData.consumptionExtrapolationId != null && ce.length > 0 ? getLabelText(ce[0].extrapolationMethod.label, this.state.lang) : "" : ""
                data[3] = regionalSelectedForecastData != undefined ? regionalSelectedForecastData.totalForecast > 0 ? regionalSelectedForecastData.totalForecast.toFixed(2) : "" : "";
                data[4] = regionalSelectedForecastData != undefined ? regionalSelectedForecastData.notes : "";
                // count += 3;
                // }
                // for (var r = 0; r < regionList1.length; r++) {
                var regionalSelectedForecastData1 = selectedForecastData1[regionSet[k]];
                var ce1 = regionalSelectedForecastData1 != undefined && regionalSelectedForecastData1.consumptionExtrapolationId != null ? consumptionExtrapolation1.filter(c => c.consumptionExtrapolationId == regionalSelectedForecastData1.consumptionExtrapolationId) : [];
                var selectedTreeScenario1 = [];
                if (regionalSelectedForecastData1 != undefined && regionalSelectedForecastData1.scenarioId != "" && regionalSelectedForecastData1.scenarioId != null) {
                    selectedTreeScenario1 = treeScenarioList1.filter(c => c.scenarioId == regionalSelectedForecastData1.scenarioId && c.treeId == regionalSelectedForecastData1.treeId);
                }
                data[5] = regionalSelectedForecastData1 != undefined ? regionalSelectedForecastData1.scenarioId != "" && regionalSelectedForecastData1.scenarioId != null ? selectedTreeScenario1.length > 0 ? selectedTreeScenario1[0].treeLabel + " ~ " + selectedTreeScenario1[0].scenarioLabel : "" : regionalSelectedForecastData1.consumptionExtrapolationId != "" && regionalSelectedForecastData1.consumptionExtrapolationId != null && ce1.length > 0 ? getLabelText(ce1[0].extrapolationMethod.label, this.state.lang) : "" : ""
                data[6] = regionalSelectedForecastData1 != undefined ? regionalSelectedForecastData1.totalForecast > 0 ? regionalSelectedForecastData1.totalForecast.toFixed(2) : "" : "";
                data[7] = regionalSelectedForecastData1 != undefined ? regionalSelectedForecastData1.notes : "";
                //     count += 3;
                // }
                // for (var r = 0; r < regionList2.length; r++) {
                var regionalSelectedForecastData2 = selectedForecastData2[regionSet[k]];
                var ce2 = regionalSelectedForecastData2 != undefined && regionalSelectedForecastData2.consumptionExtrapolationId != null ? consumptionExtrapolation2.filter(c => c.consumptionExtrapolationId == regionalSelectedForecastData2.consumptionExtrapolationId) : [];
                var selectedTreeScenario2 = [];
                if (regionalSelectedForecastData2 != undefined && regionalSelectedForecastData2.scenarioId != "" && regionalSelectedForecastData2.scenarioId != null) {
                    selectedTreeScenario2 = treeScenarioList2.filter(c => c.scenarioId == regionalSelectedForecastData2.scenarioId && c.treeId == regionalSelectedForecastData2.treeId);
                }
                data[8] = regionalSelectedForecastData2 != undefined ? regionalSelectedForecastData2.scenarioId != "" && regionalSelectedForecastData2.scenarioId != null ? selectedTreeScenario2.length > 0 ? selectedTreeScenario2[0].treeLabel + " ~ " + selectedTreeScenario2[0].scenarioLabel : "" : regionalSelectedForecastData2.consumptionExtrapolationId != "" && regionalSelectedForecastData2.consumptionExtrapolationId != null && ce2.length > 0 ? getLabelText(ce2[0].extrapolationMethod.label, this.state.lang) : "" : ""
                data[9] = regionalSelectedForecastData2 != undefined ? regionalSelectedForecastData2.totalForecast : "";
                data[10] = regionalSelectedForecastData2 != undefined ? regionalSelectedForecastData2.notes : "";

                // data[11] = 1;
                //     count += 3;
                // }

                // data[0] = langaugeList[j].languageId
                // data[1] = langaugeList[j].label.label_en;
                // data[2] = langaugeList[j].languageCode;
                // data[3] = langaugeList[j].countryCode;
                // data[4] = langaugeList[j].lastModifiedBy.username;
                // data[5] = (langaugeList[j].lastModifiedDate ? moment(langaugeList[j].lastModifiedDate).format("YYYY-MM-DD") : null)
                // data[6] = langaugeList[j].active;

                // data[12] = pu.length > 0 ? pu[0].planningUnit.id : pu1[0].planningUnit.id;
                // data[13] = rg.length > 0 ? rg[0].regionId : rg1[0].regionId;

                dataArray.push(data);
            }
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();

        var options = {
            data: dataArray,
            columnDrag: true,
            colHeaderClasses: ["Reqasterisk"],
            columns: columns,
            nestedHeaders: nestedHeaders,
            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            onselection: this.selected,
            oneditionend: this.onedit,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            editable: false,
            license: JEXCEL_PRO_KEY,
            editable: false,
            // contextMenu: function (obj, x, y, e) {
            //     var items = [];
            //     //Resolve conflicts
            //     var rowData = obj.getRowData(y)
            //     // if (rowData[11].toString() == 2) {
            //     items.push({
            //         title: "Resolve conflicts",
            //         onclick: function () {
            //             this.setState({ loading: true })
            //             this.toggleLarge(rowData, y);
            //         }.bind(this)
            //     })
            //     // } else {
            //     //     return false;
            //     // }

            //     return items;
            // }.bind(this),
        };
        var dataEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = dataEl;
        this.setState({
            dataEl: dataEl,
            columns: columns
        })
        this.props.updateState("loading", false);
    }

    toggleLarge(data, index) {
        this.setState({
            conflicts: !this.state.conflicts,
            index: index
        });
        if (index != -1) {
            this.showData(data, index);
        }
    }

    // functions
    showData(data, index) {
        console.log('inside');
        var dataArray = [];
        dataArray.push([data[0], data[1], data[2], data[3], data[4]]);
        dataArray.push([data[0], data[1], data[5], data[6], data[7]]);
        var options = {
            data: dataArray,
            // colWidths: [50, 10, 10, 50, 10, 100, 10, 50, 180, 180, 50, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.planningunit.planningunit'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.region.region'),
                    type: 'text',
                },
                {
                    title: "Selected Forecast",
                    type: 'text',
                },
                {
                    title: "Forecast Qty",
                    type: 'text',
                },
                {
                    title: "Notes",
                    type: 'text',
                }
            ],
            text: {
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            pagination: false,
            search: false,
            columnSorting: false,
            tableOverflow: false,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            tableOverflow: false,
            editable: false,
            filters: false,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this),
            onload: this.loadedResolveConflicts
        };
        var resolveConflict = jexcel(document.getElementById("resolveConflictsTable"), options);
        this.el = resolveConflict;
        this.setState({
            resolveConflict: resolveConflict,
            loading: false
        })
        document.getElementById("index").value = index;
    }

    loadedResolveConflicts = function (instance) {
        jExcelLoadedFunctionOnlyHideRow(instance);
        var elInstance = instance.jexcel;
        var jsonData = elInstance.getJson();
        var colArr = ['A', 'B', 'C', 'D', 'E']
        for (var j = 0; j < 8; j++) {
            if (j == 2 || j == 3 || j == 4) {
                var col = (colArr[j]).concat(1);
                var col1 = (colArr[j]).concat(2);
                var valueToCompare = (jsonData[0])[j];
                var valueToCompareWith = (jsonData[1])[j];
                if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col1, "background-color", "transparent");
                } else {
                    elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                    elInstance.setStyle(col1, "background-color", LATEST_VERSION_COLOUR);
                }
            }
        }
    }

    acceptCurrentChanges() {
        var elInstance = this.state.dataEl;
        elInstance.options.editable = true;
        elInstance.setValueFromCoords(11, this.state.index, 1, true);
        elInstance.options.editable = false;
        this.props.updateState("json", elInstance.getJson(null, false));
        this.toggleLarge([], -1);
    }

    acceptIncomingChanges() {
        var elInstance = this.state.dataEl;
        console.log("this.state.index", this.state.index);
        elInstance.options.editable = true;
        elInstance.setValueFromCoords(11, this.state.index, 3, true);
        elInstance.options.editable = false;
        this.props.updateState("json", elInstance.getJson(null, false));
        this.toggleLarge([], -1);
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        if (this.props.page == "commit") {
            var elInstance = instance.jexcel;
            var json = elInstance.getJson(null, false);

            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X']
            for (var r = 0; r < json.length; r++) {
                var startPt = 2;
                var startPt1 = 5;
                var startPt2 = 8;
                for (var i = 0; startPt < startPt1; i++) {
                    var local = (json[r])[startPt]
                    var server = (json[r])[startPt1 + i]
                    var downloaded = (json[r])[startPt2 + i]

                    if (local == server) {
                    } else {
                        if (local == downloaded) {
                            var col = (colArr[startPt1 + i]).concat(parseInt(r) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
                        } else if (server == downloaded) {
                            var col = (colArr[startPt]).concat(parseInt(r) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                        } else {
                            //yellow color
                            var col = (colArr[0]).concat(parseInt(r) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                            var col = (colArr[1]).concat(parseInt(r) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                            var col = (colArr[2]).concat(parseInt(r) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                            var col = (colArr[3]).concat(parseInt(r) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                            var col = (colArr[4]).concat(parseInt(r) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                            var col = (colArr[5]).concat(parseInt(r) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                            var col = (colArr[6]).concat(parseInt(r) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                            var col = (colArr[7]).concat(parseInt(r) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                            // elInstance.setValueFromCoords(11, r, 2, true);
                        }
                    }
                    startPt += 1;
                }
            }
        }
    }

    render() {
        return (
            <div>
                {/* Resolve conflicts modal */}
                <Modal isOpen={this.state.conflicts}
                    className={'modal-lg ' + this.props.className, "modalWidth"} style={{ display: this.state.loading ? "none" : "block" }}>
                    <ModalHeader toggle={() => this.toggleLarge()} className="modalHeaderSupplyPlan">
                        <strong>{i18n.t('static.commitVersion.resolveConflicts')}</strong>
                        <ul className="legendcommitversion">
                            <li><span className="greenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInCurrentVersion')}</span></li>
                            <li><span className="notawesome  legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInLatestVersion')}</span></li>
                        </ul>
                    </ModalHeader>
                    <ModalBody>
                        <div className="table-responsive RemoveStriped">
                            <div id="resolveConflictsTable" />
                            <input type="hidden" id="index" />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.acceptCurrentChanges}> <i className="fa fa-check"></i>{i18n.t('static.commitVersion.acceptCurrentVersion')}</Button>{' '}
                        <Button type="submit" size="md" className="acceptLocalChnagesButton submitBtn float-right mr-1" onClick={this.acceptIncomingChanges}> <i className="fa fa-check"></i>{i18n.t('static.commitVersion.acceptLatestVersion')}</Button>{' '}
                    </ModalFooter>
                </Modal>
                {/* Resolve conflicts modal */}
            </div>)
    }
}