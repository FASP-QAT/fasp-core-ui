import React, { Component } from 'react';
import jexcel from 'jexcel';
import i18n from '../../i18n';
import PipelineService from '../../api/PipelineService.js';
import AuthenticationService from '../Common/AuthenticationService.js';
import DataSourceService from '../../api/DataSourceService.js';
import PlanningUnitService from '../../api/PlanningUnitService';
import moment from 'moment';
import { jExcelLoadedFunction, jExcelLoadedFunctionWithoutPagination, jExcelLoadedFunctionPipeline } from '../../CommonComponent/JExcelCommonFunctions';
import { ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE, FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE, JEXCEL_DATE_FORMAT_WITHOUT_DATE } from '../../Constants';
import RealmCountryService from '../../api/RealmCountryService';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { JEXCEL_PAGINATION_OPTION, JEXCEL_INTEGER_REGEX } from '../../Constants.js';
export default class PipelineProgramConsumption extends Component {

    constructor(props) {
        super(props);
        this.loaded = this.loaded.bind(this);
        this.saveConsumption = this.saveConsumption.bind(this);
        this.changed = this.changed.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.state = {
            loading: true
        }
    }

    checkValidation() {
        var valid = true;
        var json = this.el.getJson();
        for (var y = 0; y < json.length; y++) {

            var col = ("B").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(1, y);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }

            var col = ("C").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(2, y);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }

            var col = ("D").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(3, y);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }


            var reg = JEXCEL_INTEGER_REGEX;
            var col = ("G").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(6, y);
            value = value.toString().replaceAll("\,", "");
            if (value == "") {
                // alert("in if");
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                // alert("in else");
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                    // alert("in if 2");
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    // alert("in else 2");
                }
            }

        }
        console.log("valid=====>", valid);
        return valid;
    }

    changed = function (instance, cell, x, y, value) {
        if (x == 1) {
            var json = this.el.getJson();
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        if (x == 3) {
            var col = ("D").concat(parseInt(y) + 1);
            // console.log("value=====>", value);
            // console.log("list====>", filteredList);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");

                var realmCountryPlanningUnitList = this.state.realmCountryPlanningUnitList;
                var filteredList = realmCountryPlanningUnitList.filter(c => c.realmCountryPlanningUnitId == value);
                var multiplier = filteredList[0].multiplier;
                this.el.setValueFromCoords(4, y, multiplier);
            }

        }
        if (x == 5) {
            var col = ("F").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Date.parse(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invaliddate'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        if (x == 6) {
            var reg = JEXCEL_INTEGER_REGEX;
            var col = ("G").concat(parseInt(y) + 1);
            value = value.toString().replaceAll("\,", "");
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }

    }

    loaded() {
        var list = this.state.consumptionList;
        var json = this.el.getJson();
        for (var y = 0; y < json.length; y++) {

            var value = (this.el.getRowData(y)[1]).toString();
            var col = ("B").concat(parseInt(y) + 1);

            if (value != "" && value > 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                //valid = false;
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, (list[y].dataSourceId).concat(i18n.t('static.message.notExist')));
            }
            var map = new Map(Object.entries(json[y]));
            var col = ("C").concat(parseInt(y) + 1);
            // var value = map.get("2");
            var value = (this.el.getRowData(y)[2]).toString();
            // if (value != "" && !isNaN(parseInt(value))) {
            //     this.el.setStyle(col, "background-color", "transparent");
            //     this.el.setComments(col, ""); 
            // } else {
            //     this.el.setStyle(col, "background-color", "transparent");
            //     this.el.setStyle(col, "background-color", "yellow");
            //     this.el.setComments(col, (list[map.get("2")].regionId).concat(i18n.t('static.message.notExist')));
            // }
            if (value != "" && value > 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, (list[y].regionId).concat(i18n.t('static.message.notExist')));
            }

            var col = ("D").concat(parseInt(y) + 1);
            // var value = map.get("3");
            var value = (this.el.getRowData(y)[3]).toString();
            // if (value != "" && !isNaN(parseInt(value))) {
            //     this.el.setStyle(col, "background-color", "transparent");
            //     this.el.setComments(col, "");
            // } else {
            //     this.el.setStyle(col, "background-color", "transparent");
            //     this.el.setStyle(col, "background-color", "yellow");
            //     this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            //     // this.el.setComments(col, (list[y].dataSourceId).concat(" Does not exist."));
            // }
            if (value != "" && value > 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, (list[y].realmCountryPlanningUnitId).concat(i18n.t('static.message.notExist')));
            }



        }


    }
    saveConsumption() {
        var json = this.el.getJson();
        var list = this.state.consumptionList;
        console.log("consumption json------->", json);
        var consumptionArray = []
        for (var i = 0; i < json.length; i++) {
            var map = new Map(Object.entries(json[i]));

            var dataSourceId = map.get("1");
            if (dataSourceId != "" && !isNaN(parseInt(dataSourceId))) {
                dataSourceId = map.get("1");
            } else {
                dataSourceId = list[map.get("1")].dataSourceId;

            }

            var consumptionJson = {
                regionId: map.get("2"),
                planningUnitId: map.get("0"),
                consumptionDate: map.get("5"),
                actualFlag: map.get("9"),
                // consumptionQty: map.get("6"),
                consumptionQty: (map.get("6")).toString().replaceAll("\,", ""),
                dayOfStockOut: map.get("7"),
                dataSourceId: dataSourceId,
                notes: map.get("8"),
                realmCountryPlanningUnitId: map.get("3"),
                multiplier: map.get("4")
            }
            consumptionArray.push(consumptionJson);
        }
        return consumptionArray;
    }
    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        PipelineService.getQatTempProgramregion(this.props.pipelineId).then(response => {
            // console.log("my region List ----->", response.data);
            var regionList = [];
            var dataSourceList = [];
            var planningUnitListQat = []

            for (var i = 0; i < response.data.length; i++) {
                var regionJson = {
                    id: ((response.data)[i]).regionId,
                    name: ((response.data)[i]).label.label_en
                }
                regionList.push(regionJson);
            }
            var realmCounryId = document.getElementById("realmCountryId").value;
            // AuthenticationService.setupAxiosInterceptors();
            RealmCountryService.getRealmCountryPlanningUnitAllByrealmCountryId(realmCounryId).then(response => {
                var realmCountryPlanningUnitList = [];

                this.setState({ realmCountryPlanningUnitList: response.data });
                console.log("realmCountryPlanningUnitId====>", response.data);

                for (var i = 0; i < response.data.length; i++) {
                    var rcpJson = {
                        id: ((response.data)[i]).realmCountryPlanningUnitId,
                        name: ((response.data)[i]).label.label_en
                    }
                    realmCountryPlanningUnitList.push(rcpJson);
                }

                // AuthenticationService.setupAxiosInterceptors();
                DataSourceService.getAllDataSourceList().then(response => {
                    // console.log("data source List ----->", response.data);
                    for (var j = 0; j < response.data.length; j++) {
                        if (response.data[j].dataSourceType.id == ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE || response.data[j].dataSourceType.id == FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE)
                            var dataSourceJson = {
                                id: ((response.data)[j]).dataSourceId,
                                name: ((response.data)[j]).label.label_en
                            }
                        dataSourceList.push(dataSourceJson);
                    }


                    // AuthenticationService.setupAxiosInterceptors();
                    PlanningUnitService.getActivePlanningUnitList()
                        .then(response => {
                            // console.log("planning units list in consumption--->", response.data);
                            // planningUnitListQat = response.data
                            for (var k = 0; k < (response.data).length; k++) {
                                var planningUnitJson = {
                                    name: response.data[k].label.label_en,
                                    id: response.data[k].planningUnitId
                                }
                                planningUnitListQat.push(planningUnitJson);
                            }

                            // AuthenticationService.setupAxiosInterceptors();
                            PipelineService.getQatTempConsumptionById(this.props.pipelineId).then(response => {
                                console.log("temp consumpton list--->", response.data);
                                if (response.status == 200) {


                                    var consumptionDataArr = [];
                                    var consumptionList = response.data;

                                    //don for loaded function
                                    this.setState({ consumptionList: consumptionList });
                                    //don for loaded function

                                    for (var j = 0; j < consumptionList.length; j++) {
                                        for (var cm = 0; cm < consumptionList[j].consNumMonth; cm++) {
                                            var data = [];
                                            data[5] = moment(consumptionList[j].consumptionDate).add(cm, 'months').format("YYYY-MM-DD");
                                            if (regionList.length == 1) {
                                                data[2] = regionList[0].id;
                                            } else {
                                                data[2] = consumptionList[j].regionId;
                                            };
                                            // data[2] = consumptionList[j].regionId;
                                            data[6] = (cm == 0 || cm != consumptionList[j].consNumMonth - 1) ? Math.ceil(consumptionList[j].consumptionQty / consumptionList[j].consNumMonth) : Math.ceil(consumptionList[j].consumptionQty / consumptionList[j].consNumMonth) + (consumptionList[j].consumptionQty - ((Math.ceil(consumptionList[j].consumptionQty / consumptionList[j].consNumMonth)) * consumptionList[j].consNumMonth));
                                            data[7] = consumptionList[j].dayOfStockOut;
                                            data[1] = consumptionList[j].dataSourceId;
                                            data[3] = consumptionList[j].realmCountryPlanningUnitId;
                                            data[4] = consumptionList[j].multiplier
                                            if (consumptionList[j].notes === null || consumptionList[j].notes === ' NULL') {
                                                data[8] = '';
                                            } else {
                                                data[8] = consumptionList[j].notes;
                                            }
                                            data[9] = consumptionList[j].actualFlag;
                                            data[0] = consumptionList[j].planningUnitId;
                                            data[10] = j;
                                            consumptionDataArr.push(data);
                                        }
                                    }
                                    console.log('consumptionDataArr', consumptionDataArr)
                                    this.el = jexcel(document.getElementById("consumptiontableDiv"), '');
                                    this.el.destroy();
                                    var json = [];
                                    var data = consumptionDataArr;
                                    // var data = [{}, {}, {}, {}, {}];
                                    // json[0] = data;
                                    var options = {
                                        data: data,
                                        columnDrag: true,
                                        colWidths: [150, 150, 150, 150, 90, 90, 90, 90, 150, 90],
                                        columns: [
                                            // { title: 'Month', type: 'text', readOnly: true },
                                            {
                                                title: i18n.t('static.planningunit.planningunit'),
                                                type: 'dropdown',
                                                source: planningUnitListQat,
                                                readOnly: true
                                            },

                                            {
                                                title: i18n.t('static.inventory.dataSource'),
                                                type: 'dropdown',
                                                source: dataSourceList
                                            },
                                            {
                                                title: i18n.t('static.inventory.region'),
                                                type: 'dropdown',
                                                source: regionList
                                            }, {
                                                title: i18n.t('static.planningunit.countrysku'),
                                                type: 'dropdown',
                                                source: realmCountryPlanningUnitList,
                                                // filter: this.dropdownFilter

                                            },
                                            {
                                                title: i18n.t('static.unit.multiplier'),
                                                type: 'text',
                                                readOnly: true
                                            },
                                            {
                                                title: i18n.t('static.pipeline.consumptionDate'),
                                                type: 'calendar',
                                                options: {
                                                    format: JEXCEL_DATE_FORMAT_WITHOUT_DATE
                                                }
                                            },
                                            {
                                                title: i18n.t('static.consumption.consumptionqty'),
                                                type: 'numeric',
                                                mask: '#,##.00',
                                                decimal: '.'
                                            },
                                            {
                                                title: i18n.t('static.consumption.daysofstockout'),
                                                type: 'numeric'
                                            },
                                            {
                                                title: i18n.t('static.program.notes'),
                                                type: 'text'
                                            },
                                            {
                                                title: i18n.t('static.consumption.consumptionType'),
                                                type: 'dropdown',
                                                source: [{ id: true, name: i18n.t('static.consumption.actual') }, { id: false, name: i18n.t('static.consumption.forcast') }]
                                            },

                                            { title: 'Index', type: 'hidden' },
                                            // { title: 'Last Modified date', type: 'text', readOnly: true },
                                            // { title: 'Last Modified by', type: 'text', readOnly: true }
                                        ],
                                        pagination: localStorage.getItem("sesRecordCount"),
                                        contextMenu: false,
                                        search: true,
                                        columnSorting: true,
                                        tableOverflow: true,
                                        wordWrap: true,
                                        allowInsertColumn: false,
                                        allowManualInsertColumn: false,
                                        allowDeleteRow: false,
                                        onchange: this.changed,
                                        oneditionend: this.onedit,
                                        allowInsertRow: false,
                                        copyCompatibility: true,
                                        paginationOptions: JEXCEL_PAGINATION_OPTION,
                                        position: 'top',
                                        text: {
                                            showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')} `,
                                            show: '',
                                            entries: '',
                                        },
                                        onload: this.loadedJexcelCommonFunctionTwo,
                                    };

                                    this.el = jexcel(document.getElementById("consumptiontableDiv"), options);
                                    this.loaded();
                                    this.setState({
                                        loading: false
                                    })

                                }
                                // else {
                                //     console.log("in else==================");
                                //     AuthenticationService.setupAxiosInterceptors();
                                //     PipelineService.getPipelineProgramConsumption(this.props.pipelineId).then(response => {
                                //         console.log("consumption List pipeline ----->", response.data);
                                //         var data = [];
                                //         var consumptionDataArr = [];
                                //         var consumptionList = response.data;
                                //         // var consumptionList=this.props.pipelineConsumptionList;

                                //         //don for loaded function
                                //         this.setState({ consumptionList: consumptionList });
                                //         //don for loaded function

                                //         for (var j = 0; j < consumptionList.length; j++) {
                                //             data = [];
                                //             data[0] = consumptionList[j].conDate;
                                //             data[1] = "";
                                //             data[2] = consumptionList[j].consamount;
                                //             data[3] = "";
                                //             data[4] = consumptionList[j].consdatasourceid;
                                //             if (consumptionList[j].consnote === null || consumptionList[j].consnote === ' NULL') {
                                //                 data[5] = '';
                                //             } else {
                                //                 data[5] = consumptionList[j].consnote;
                                //             }
                                //             data[6] = consumptionList[j].consactualflag;
                                //             data[7] = consumptionList[j].productid;
                                //             consumptionDataArr.push(data);
                                //         }

                                //         this.el = jexcel(document.getElementById("consumptiontableDiv"), '');
                                //         this.el.destroy();
                                //         var json = [];
                                //         var data = consumptionDataArr;
                                //         // var data = [{}, {}, {}, {}, {}];
                                //         // json[0] = data;
                                //         var options = {
                                //             data: data,
                                //             columnDrag: true,
                                //             colWidths: [100, 100, 100,70, 100, 120, 90, 160],
                                //             columns: [
                                //                 // { title: 'Month', type: 'text', readOnly: true },
                                //                 {
                                //                     title: 'Consumption Date',
                                //                     type: 'calendar',
                                //                     options: {
                                //                         format: 'MM-YYYY'
                                //                     }
                                //                 },
                                //                 {
                                //                     title: i18n.t('static.inventory.region'),
                                //                     type: 'dropdown',
                                //                     source: regionList
                                //                 },
                                //                 {
                                //                     title: i18n.t('static.consumption.consumptionqty'),
                                //                     type: 'numeric'
                                //                 },
                                //                 {
                                //                     title: i18n.t('static.consumption.daysofstockout'),
                                //                     type: 'numeric'
                                //                 },
                                //                 {
                                //                     title: i18n.t('static.inventory.dataSource'),
                                //                     type: 'dropdown',
                                //                     source: dataSourceList
                                //                 },
                                //                 {
                                //                     title: 'Notes',
                                //                     type: 'text'
                                //                 },
                                //                 {
                                //                     title: i18n.t('static.consumption.actualflag'),
                                //                     type: 'dropdown',
                                //                     source: [{ id: true, name: i18n.t('static.consumption.actual') }, { id: false, name: i18n.t('static.consumption.forcast') }]
                                //                 },
                                //                 {
                                //                     title: 'Planning Unit',
                                //                     type: 'dropdown',
                                //                     source:planningUnitListQat,
                                //                     readOnly:true
                                //                 },
                                //                 // { title: 'Created By', type: 'text', readOnly: true },
                                //                 // { title: 'Last Modified date', type: 'text', readOnly: true },
                                //                 // { title: 'Last Modified by', type: 'text', readOnly: true }
                                //             ],
                                //             pagination: 10,
                                //             search: true,
                                //             columnSorting: true,
                                //             tableOverflow: true,
                                //             wordWrap: true,
                                //             allowInsertColumn: false,
                                //             allowManualInsertColumn: false,
                                //             allowDeleteRow: false,
                                //             onchange: this.changed,
                                //             oneditionend: this.onedit,
                                //             copyCompatibility: true,
                                //             // paginationOptions: [10, 25, 50, 100],
                                //             position: 'top'
                                //         };

                                //         this.el = jexcel(document.getElementById("consumptiontableDiv"), options);
                                //         this.loaded();
                                //     });

                                // }
                            }).catch(
                                error => {
                                    if (error.message === "Network Error") {
                                        this.setState({
                                            message: 'static.unkownError',
                                            loading: false
                                        });
                                    } else {
                                        switch (error.response ? error.response.status : "") {

                                            case 401:
                                                this.props.history.push(`/login/static.message.sessionExpired`)
                                                break;
                                            case 403:
                                                this.props.history.push(`/accessDenied`)
                                                break;
                                            case 500:
                                            case 404:
                                            case 406:
                                                this.setState({
                                                    message: error.response.data.messageCode,
                                                    loading: false
                                                });
                                                break;
                                            case 412:
                                                this.setState({
                                                    message: error.response.data.messageCode,
                                                    loading: false
                                                });
                                                break;
                                            default:
                                                this.setState({
                                                    message: 'static.unkownError',
                                                    loading: false
                                                });
                                                break;
                                        }
                                    }
                                }
                            );

                        }).catch(
                            error => {
                                if (error.message === "Network Error") {
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false
                                    });
                                } else {
                                    switch (error.response ? error.response.status : "") {

                                        case 401:
                                            this.props.history.push(`/login/static.message.sessionExpired`)
                                            break;
                                        case 403:
                                            this.props.history.push(`/accessDenied`)
                                            break;
                                        case 500:
                                        case 404:
                                        case 406:
                                            this.setState({
                                                message: error.response.data.messageCode,
                                                loading: false
                                            });
                                            break;
                                        case 412:
                                            this.setState({
                                                message: error.response.data.messageCode,
                                                loading: false
                                            });
                                            break;
                                        default:
                                            this.setState({
                                                message: 'static.unkownError',
                                                loading: false
                                            });
                                            break;
                                    }
                                }
                            }
                        );
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
                                loading: false
                            });
                        } else {
                            switch (error.response ? error.response.status : "") {

                                case 401:
                                    this.props.history.push(`/login/static.message.sessionExpired`)
                                    break;
                                case 403:
                                    this.props.history.push(`/accessDenied`)
                                    break;
                                case 500:
                                case 404:
                                case 406:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false
                                    });
                                    break;
                            }
                        }
                    }
                );

            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
                            loading: false
                        });
                    } else {
                        switch (error.response ? error.response.status : "") {

                            case 401:
                                this.props.history.push(`/login/static.message.sessionExpired`)
                                break;
                            case 403:
                                this.props.history.push(`/accessDenied`)
                                break;
                            case 500:
                            case 404:
                            case 406:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                });
                                break;
                        }
                    }
                }
            );
        }).catch(
            error => {
                if (error.message === "Network Error") {
                    this.setState({
                        message: 'static.unkownError',
                        loading: false
                    });
                } else {
                    switch (error.response ? error.response.status : "") {

                        case 401:
                            this.props.history.push(`/login/static.message.sessionExpired`)
                            break;
                        case 403:
                            this.props.history.push(`/accessDenied`)
                            break;
                        case 500:
                        case 404:
                        case 406:
                            this.setState({
                                message: error.response.data.messageCode,
                                loading: false
                            });
                            break;
                        case 412:
                            this.setState({
                                message: error.response.data.messageCode,
                                loading: false
                            });
                            break;
                        default:
                            this.setState({
                                message: 'static.unkownError',
                                loading: false
                            });
                            break;
                    }
                }
            }
        );
    }
    loadedJexcelCommonFunctionTwo = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionPipeline(instance, 0);
    }

    render() {
        return (
            <>
                <AuthenticationServiceComponent history={this.props.history} />
                <h4 className="red">{this.props.message}</h4>
                <div className="table-responsive" style={{ display: this.state.loading ? "none" : "block" }}>

                    <div id="consumptiontableDiv">
                    </div>
                </div>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
