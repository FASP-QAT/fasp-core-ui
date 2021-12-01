import React, { Component } from 'react';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import {
    Card, CardBody, Col
} from 'reactstrap';
import i18n from '../../i18n'
import { JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions';

export default class CompareVersion extends Component {
    constructor(props) {
        super(props);
        this.state = {
            datasetData: {},
            datasetData1: {}
        }
    }

    componentDidMount() {
        console.log("DatasetData+++", this.props.datasetData);
        console.log("DatasetData1+++", this.props.datasetData1);
        var datasetData = this.props.datasetData;
        var datasetData1 = this.props.datasetData1;
        datasetData.selectedForecastData = [
            {
                planningUnit: { id: 4149, label: { label_en: "Male Condom (Latex) Lubricated, Dume Classic, 53 mm, 2592 Pieces" } },
                selectedForecastScenario: { id: 2, label: { label_en: "High Scenario" } },
                selectedForecastTree: { id: 1, label: { label_en: "Demographic comdoms template" } },
                forecastQty: 65000,
                region: { regionId: 70, label: { label_en: "National" } },
                notes: "Test"
            },
            {
                planningUnit: { id: 4149, label: { label_en: "Male Condom (Latex) Lubricated, Dume Classic, 53 mm, 2592 Pieces" } },
                selectedForecastScenario: { id: 2, label: { label_en: "High Scenario" } },
                selectedForecastTree: { id: 1, label: { label_en: "Demographic comdoms template" } },
                forecastQty: 55000,
                region: { regionId: 73, label: { label_en: "North" } },
                notes: "Test"
            },
            {
                planningUnit: { id: 4149, label: { label_en: "Male Condom (Latex) Lubricated, Dume Classic, 53 mm, 2592 Pieces" } },
                selectedForecastScenario: { id: 2, label: { label_en: "High Scenario" } },
                selectedForecastTree: { id: 1, label: { label_en: "Demographic comdoms template" } },
                forecastQty: 50000,
                region: { regionId: 74, label: { label_en: "South" } },
                notes: "Test"
            },


            {
                planningUnit: { id: 2733, label: { label_en: "Dolutegravir/Lamivudine/Tenofovir DF 50/300/300 mg Tablet, 30 Tablets" } },
                selectedForecastScenario: { id: 2, label: { label_en: "Medium Scenario" } },
                selectedForecastTree: { id: 1, label: { label_en: "Demographic comdoms template" } },
                forecastQty: 55000,
                region: { regionId: 70, label: { label_en: "National" } },
                notes: "Test"
            },
            {
                planningUnit: { id: 2733, label: { label_en: "Dolutegravir/Lamivudine/Tenofovir DF 50/300/300 mg Tablet, 30 Tablets" } },
                selectedForecastScenario: { id: 1, label: { label_en: "High Scenario" } },
                selectedForecastTree: { id: 1, label: { label_en: "Demographic comdoms template" } },
                forecastQty: 45000,
                region: { regionId: 73, label: { label_en: "North" } },
                notes: "Test"
            },
        ];
        datasetData1.selectedForecastData = [
            {
                planningUnit: { id: 4148, label: { label_en: "Male Condom (Latex) Lubricated, Dume Classic, 53 mm, 1 Each" } },
                selectedForecastScenario: { id: 1, label: { label_en: "Default Scenario" } },
                selectedForecastTree: { id: 1, label: { label_en: "Demographic comdoms template" } },
                forecastQty: 55000,
                region: { regionId: 70, label: { label_en: "National" } },
                notes: "Test 3"
            },
            {
                planningUnit: { id: 4148, label: { label_en: "Male Condom (Latex) Lubricated, Dume Classic, 53 mm, 1 Each" } },
                selectedForecastScenario: { id: 1, label: { label_en: "Default Scenario" } },
                selectedForecastTree: { id: 1, label: { label_en: "Demographic comdoms template" } },
                forecastQty: 35000,
                region: { regionId: 73, label: { label_en: "North" } },
                notes: "Test 3"
            },
            {
                planningUnit: { id: 4148, label: { label_en: "Male Condom (Latex) Lubricated, Dume Classic, 53 mm, 1 Each" } },
                selectedForecastScenario: { id: 2, label: { label_en: "Medium Scenario" } },
                selectedForecastTree: { id: 1, label: { label_en: "Demographic comdoms template" } },
                forecastQty: 45000,
                region: { regionId: 74, label: { label_en: "South" } },
                notes: "Test 3"
            },
            {
                planningUnit: { id: 2733, label: { label_en: "Dolutegravir/Lamivudine/Tenofovir DF 50/300/300 mg Tablet, 30 Tablets" } },
                selectedForecastScenario: { id: 2, label: { label_en: "Medium Scenario" } },
                selectedForecastTree: { id: 1, label: { label_en: "Demographic comdoms template" } },
                forecastQty: 65000,
                region: { regionId: 70, label: { label_en: "National" } },
                notes: "Test 4"
            },
            {
                planningUnit: { id: 2733, label: { label_en: "Dolutegravir/Lamivudine/Tenofovir DF 50/300/300 mg Tablet, 30 Tablets" } },
                selectedForecastScenario: { id: 3, label: { label_en: "High Scenario" } },
                selectedForecastTree: { id: 1, label: { label_en: "Demographic comdoms template" } },
                forecastQty: 65000,
                region: { regionId: 74, label: { label_en: "South" } },
                notes: "Test 4"
            }
        ]

        var planningUnitList = (datasetData.planningUnitList).concat(datasetData1.planningUnitList);

        var planningUnitSet = [...new Set(planningUnitList.map(ele => (ele.planningUnit.id)))]
        let dataArray = [];
        let data = [];
        let columns = [];
        let nestedHeaders = [];
        var regionList = datasetData.regionList;
        var regionList1 = datasetData1.regionList;
        nestedHeaders.push(
            [
                {
                    title: '',
                    rowspan: '3'
                },
                {
                    title: 'V1',
                    colspan: datasetData.regionList.length * 3,
                },
                {
                    title: "V1 (Local)",
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
        var regionJsonStr = regionJson.map(item => {
            return { title: item.title, colspan: 3 }
        }).join(',')
        console.log("regionJsonStr+++", regionJsonStr)
        nestedHeaders.push(regionJson);
        console.log("nestedHeaders+++", nestedHeaders)
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


        for (var j = 0; j < planningUnitSet.length; j++) {
            data = [];
            var selectedForecastData = datasetData.selectedForecastData.filter(c => c.planningUnit.id == planningUnitSet[j]);
            var selectedForecastData1 = datasetData1.selectedForecastData.filter(c => c.planningUnit.id == planningUnitSet[j]);
            console.log("selectedForecastData+++", selectedForecastData)
            console.log("selectedForecastData1+++", selectedForecastData1)
            data[0] = selectedForecastData.length > 0 ? selectedForecastData[0].planningUnit.label.label_en : selectedForecastData1[0].planningUnit.label.label_en;
            var count = 1;
            for (var r = 0; r < regionList.length; r++) {
                var regionalSelectedForecastData = selectedForecastData.filter(c => c.region.regionId == regionList[r].regionId);
                console.log("regionalSelectedForecastData+++", regionalSelectedForecastData)
                data[count] = regionalSelectedForecastData.length > 0 ? regionalSelectedForecastData[0].selectedForecastTree.label.label_en + " - " + regionalSelectedForecastData[0].selectedForecastScenario.label.label_en : ""
                data[count + 1] = regionalSelectedForecastData.length > 0 ? regionalSelectedForecastData[0].forecastQty : "";
                data[count + 2] = regionalSelectedForecastData.length > 0 ? regionalSelectedForecastData[0].notes : "";
                count += 3;
            }
            for (var r = 0; r < regionList1.length; r++) {
                var regionalSelectedForecastData1 = selectedForecastData1.filter(c => c.region.regionId == regionList[r].regionId);
                console.log("regionalSelectedForecastData1+++", regionalSelectedForecastData1)
                data[count] = regionalSelectedForecastData1.length > 0 ? regionalSelectedForecastData1[0].selectedForecastTree.label.label_en + " - " + regionalSelectedForecastData1[0].selectedForecastScenario.label.label_en : ""
                data[count + 1] = regionalSelectedForecastData1.length > 0 ? regionalSelectedForecastData1[0].forecastQty : "";
                data[count + 2] = regionalSelectedForecastData1.length > 0 ? regionalSelectedForecastData1[0].notes : "";
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
    }

    render() { return (<div></div>) }
}