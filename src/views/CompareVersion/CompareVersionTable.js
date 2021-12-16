import React, { Component } from 'react';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import {
    Card, CardBody, Col
} from 'reactstrap';
import i18n from '../../i18n'
import { JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, LATEST_VERSION_COLOUR, LOCAL_VERSION_COLOUR } from '../../Constants';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions';

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
        this.loaded = this.loaded.bind(this)
    }

    componentDidMount() {
        console.log("DatasetData+++", this.props.datasetData);
        console.log("DatasetData1+++", this.props.datasetData1);
        var datasetData = this.props.datasetData;
        var datasetData1 = this.props.datasetData1;
        var datasetData2 = this.props.datasetData2;

        var planningUnitList = (datasetData.planningUnitList).concat(datasetData1.planningUnitList);

        var planningUnitSet = [...new Set(planningUnitList.map(ele => (ele.planningUnit.id)))]
        let dataArray = [];
        let data = [];
        let columns = [];
        let nestedHeaders = [];
        var regionList = datasetData.regionList;
        var regionList1 = datasetData1.regionList;
        var regionList2 = datasetData2.regionList;
        this.setState({
            regionList: regionList, regionList1: regionList1, regionList2: regionList2
        })
        nestedHeaders.push(
            [
                {
                    title: '',
                    rowspan: '3'
                },
                {
                    title: this.props.versionLabel,
                    colspan: datasetData.regionList.length * 3,
                },
                {
                    title: this.props.versionLabel1,
                    colspan: datasetData1.regionList.length * 3,
                },
            ]
        );
        var regionJson = [];
        regionJson.push({
            title: "",
            rowspan: '3'
        })
        for (var r = 0; r < regionList.length; r++) {
            regionJson.push({
                title: regionList[r].label.label_en,
                colspan: 3
            })
        }
        for (var r = 0; r < regionList1.length; r++) {
            regionJson.push({
                title: regionList1[r].label.label_en,
                colspan: 3
            })
        }
        // for (var r = 0; r < regionList2.length; r++) {
        //     regionJson.push({
        //         title: regionList2[r].label.label_en,
        //         colspan: 3,
        //         type:'hidden'
        //     })
        // }
        var regionJsonStr = regionJson.map(item => {
            return { title: item.title, colspan: 3 }
        }).join(',')
        nestedHeaders.push(regionJson);
        columns.push({ title: "Planning Unit", width: 300 })
        for (var r = 0; r < regionList.length; r++) {
            columns.push({ title: "Selected Forecast", width: 200 })
            columns.push({ title: "Forecast Qty", width: 100 })
            columns.push({ title: "Notes", width: 200 })
        }
        for (var r = 0; r < regionList1.length; r++) {
            columns.push({ title: "Selected Forecast", width: 200 })
            columns.push({ title: "Forecast Qty", width: 100 })
            columns.push({ title: "Notes", width: 200 })
        }
        for (var r = 0; r < regionList2.length; r++) {
            columns.push({ title: "Selected Forecast", width: 200, type: 'hidden' })
            columns.push({ title: "Forecast Qty", width: 100, type: 'hidden' })
            columns.push({ title: "Notes", width: 200, type: 'hidden' })
        }
        var scenarioList = [];
        var treeScenarioList = [];
        for (var t = 0; t < datasetData.treeList.length; t++) {
            scenarioList = scenarioList.concat(datasetData.treeList[t].scenarioList);
            var sl = datasetData.treeList[t].scenarioList;
            for (var s = 0; s < sl.length; s++) {
                treeScenarioList.push({ treeLabel: datasetData.treeList[t].label.label_en, scenarioId: sl[s].id, scenarioLabel: sl[s].label.label_en })
            }

        }

        var scenarioList1 = [];
        var treeScenarioList1 = [];
        for (var t = 0; t < datasetData1.treeList.length; t++) {
            scenarioList1 = scenarioList1.concat(datasetData1.treeList[t].scenarioList);
            var sl = datasetData1.treeList[t].scenarioList;
            for (var s = 0; s < sl.length; s++) {
                treeScenarioList1.push({ treeLabel: datasetData1.treeList[t].label.label_en, scenarioId: sl[s].id, scenarioLabel: sl[s].label.label_en })
            }
        }

        var scenarioList2 = [];
        var treeScenarioList2 = [];
        for (var t = 0; t < datasetData2.treeList.length; t++) {
            scenarioList2 = scenarioList2.concat(datasetData2.treeList[t].scenarioList);
            var sl = datasetData2.treeList[t].scenarioList;
            for (var s = 0; s < sl.length; s++) {
                treeScenarioList2.push({ treeLabel: datasetData2.treeList[t].label.label_en, scenarioId: sl[s].id, scenarioLabel: sl[s].label.label_en })
            }
        }

        var consumptionExtrapolation = datasetData.consumptionExtrapolation;
        var consumptionExtrapolation1 = datasetData1.consumptionExtrapolation;
        var consumptionExtrapolation2 = datasetData2.consumptionExtrapolation;

        for (var j = 0; j < planningUnitSet.length; j++) {
            data = [];
            var pu = datasetData.planningUnitList.filter(c => c.planningUnit.id == planningUnitSet[j]);
            var pu1 = datasetData1.planningUnitList.filter(c => c.planningUnit.id == planningUnitSet[j]);
            var pu2 = datasetData2.planningUnitList.filter(c => c.planningUnit.id == planningUnitSet[j]);

            var selectedForecastData = pu[0].selectedForecastMap;
            var selectedForecastData1 = pu1[0].selectedForecastMap;
            var selectedForecastData2 = pu2[0].selectedForecastMap;

            data[0] = pu.length > 0 ? pu[0].planningUnit.label.label_en : pu1[0].planningUnit.label.label_en;
            var count = 1;
            for (var r = 0; r < regionList.length; r++) {
                var regionalSelectedForecastData = selectedForecastData[regionList[r].regionId];

                data[count] = regionalSelectedForecastData != undefined ? regionalSelectedForecastData.scenarioId != "" && regionalSelectedForecastData.scenarioId != null ? treeScenarioList.filter(c => c.scenarioId == regionalSelectedForecastData.scenarioId)[0].treeLabel + " ~ " + scenarioList.filter(c => c.id == regionalSelectedForecastData.scenarioId)[0].label.label_en : regionalSelectedForecastData.consumptionExtrapolationId != "" && regionalSelectedForecastData.consumptionExtrapolationId != null ? consumptionExtrapolation.filter(c => c.consumptionExtrapolationId == regionalSelectedForecastData.consumptionExtrapolationId)[0].extrapolationMethod.label.label_en : "" : ""
                data[count + 1] = regionalSelectedForecastData != undefined ? regionalSelectedForecastData.totalForecast : "";
                data[count + 2] = regionalSelectedForecastData != undefined ? regionalSelectedForecastData.notes : "";
                count += 3;
            }
            for (var r = 0; r < regionList1.length; r++) {
                var regionalSelectedForecastData1 = selectedForecastData1[regionList1[r].regionId];
                data[count] = regionalSelectedForecastData1 != undefined ? regionalSelectedForecastData1.scenarioId != "" && regionalSelectedForecastData1.scenarioId != null ? treeScenarioList1.filter(c => c.scenarioId == regionalSelectedForecastData1.scenarioId)[0].treeLabel + " ~ " + scenarioList1.filter(c => c.id == regionalSelectedForecastData1.scenarioId)[0].label.label_en : regionalSelectedForecastData1.consumptionExtrapolationId != "" && regionalSelectedForecastData1.consumptionExtrapolationId != null ? consumptionExtrapolation1.filter(c => c.consumptionExtrapolationId == regionalSelectedForecastData1.consumptionExtrapolationId)[0].extrapolationMethod.label.label_en : "" : ""
                data[count + 1] = regionalSelectedForecastData1 != undefined ? regionalSelectedForecastData1.totalForecast : "";
                data[count + 2] = regionalSelectedForecastData1 != undefined ? regionalSelectedForecastData1.notes : "";
                count += 3;
            }
            for (var r = 0; r < regionList2.length; r++) {
                var regionalSelectedForecastData2 = selectedForecastData2[regionList2[r].regionId];
                data[count] = regionalSelectedForecastData2 != undefined ? regionalSelectedForecastData2.scenarioId != "" && regionalSelectedForecastData2.scenarioId != null ? treeScenarioList2.filter(c => c.scenarioId == regionalSelectedForecastData2.scenarioId)[0].treeLabel + " ~ " + scenarioList2.filter(c => c.id == regionalSelectedForecastData2.scenarioId)[0].label.label_en : regionalSelectedForecastData2.consumptionExtrapolationId != "" && regionalSelectedForecastData2.consumptionExtrapolationId != null ? consumptionExtrapolation2.filter(c => c.consumptionExtrapolationId == regionalSelectedForecastData2.consumptionExtrapolationId)[0].extrapolationMethod.label.label_en : "" : ""
                data[count + 1] = regionalSelectedForecastData2 != undefined ? regionalSelectedForecastData2.totalForecast : "";
                data[count + 2] = regionalSelectedForecastData2 != undefined ? regionalSelectedForecastData2.notes : "";
                count += 3;
            }

            // data[0] = langaugeList[j].languageId
            // data[1] = langaugeList[j].label.label_en;
            // data[2] = langaugeList[j].languageCode;
            // data[3] = langaugeList[j].countryCode;
            // data[4] = langaugeList[j].lastModifiedBy.username;
            // data[5] = (langaugeList[j].lastModifiedDate ? moment(langaugeList[j].lastModifiedDate).format("YYYY-MM-DD") : null)
            // data[6] = langaugeList[j].active;

            dataArray.push(data);
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
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                return [];
            }.bind(this),
        };
        var dataEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = dataEl;
        this.setState({
            dataEl: dataEl, loading: false
        })
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        if (this.props.page == "commit") {
            var elInstance = instance.jexcel;
            var json = elInstance.getJson(null, false);
            var startPt = 1;
            var startPt1 = 1 + this.props.datasetData.regionList.length * 3;
            var startPt2 = 1 + this.props.datasetData.regionList.length * 3 + this.props.datasetData1.regionList.length * 3;
            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X']
            for (var r = 0; r < json.length; r++) {
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
                        }
                    }
                    startPt += 1;
                }
            }
        }
    }

    render() { return (<div></div>) }
}