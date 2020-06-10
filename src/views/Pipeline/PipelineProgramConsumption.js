import React, { Component } from 'react';
import jexcel from 'jexcel';
import i18n from '../../i18n';
import PipelineService from '../../api/PipelineService.js';
import AuthenticationService from '../Common/AuthenticationService.js';
import DataSourceService from '../../api/DataSourceService.js';
import PlanningUnitService from '../../api/PlanningUnitService';
import moment from 'moment';

export default class PipelineProgramConsumption extends Component {

    constructor(props) {
        super(props);
        this.loaded = this.loaded.bind(this);
        this.saveConsumption = this.saveConsumption.bind(this);
        this.changed = this.changed.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
    }

    checkValidation() {
        var valid = true;
        var json = this.el.getJson();
        for (var y = 0; y < json.length; y++) {
            var col = ("F").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(5, y);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }

        }
        return valid;
    }

    changed = function (instance, cell, x, y, value) {
        if (x == 5) {
            var col = ("F").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }

    }

    loaded() {
        var list = this.state.consumptionList;
        var json = this.el.getJson();
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            var col = ("F").concat(parseInt(y) + 1);
            var value = map.get("5");
            if (value != "" && !isNaN(parseInt(value))) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, (list[map.get("8")].dataSourceId).concat(" Does not exist."));
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

            var dataSourceId = map.get("5");
            if (dataSourceId != "" && !isNaN(parseInt(dataSourceId))) {
                dataSourceId = map.get("5");
            } else {
                dataSourceId = list[i].dataSourceId;
            }

            var consumptionJson = {
                regionId: map.get("2"),
                planningUnitId: map.get("0"),
                consumptionDate: map.get("1"),
                actualFlag: map.get("7"),
                consumptionQty: map.get("3"),
                dayOfStockOut: map.get("4"),
                dataSourceId: dataSourceId,
                notes: map.get("6")
            }
            consumptionArray.push(consumptionJson);
        }
        return consumptionArray;
    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
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

            AuthenticationService.setupAxiosInterceptors();
            DataSourceService.getActiveDataSourceList().then(response => {
                // console.log("data source List ----->", response.data);
                for (var j = 0; j < response.data.length; j++) {
                    var dataSourceJson = {
                        id: ((response.data)[j]).dataSourceId,
                        name: ((response.data)[j]).label.label_en
                    }
                    dataSourceList.push(dataSourceJson);
                }


                AuthenticationService.setupAxiosInterceptors();
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

                        AuthenticationService.setupAxiosInterceptors();
                        PipelineService.getQatTempConsumptionById(this.props.pipelineId).then(response => {
                            // console.log("temp consumpton list--->", response.data);
                            if (response.status == 200) {

                                var data = [];
                                var consumptionDataArr = [];
                                var consumptionList = response.data;

                                //don for loaded function
                                this.setState({ consumptionList: consumptionList });
                                //don for loaded function

                                for (var j = 0; j < consumptionList.length; j++) {
                                    for (var cm = 0; cm < consumptionList[j].consNumMonth; cm++) {
                                        data = [];
                                        data[1] = moment(consumptionList[j].consumptionDate).add(cm,'months').format("YYYY-MM-DD");
                                        data[2] = consumptionList[j].regionId;
                                        data[3] = consumptionList[j].consumptionQty;
                                        data[4] = consumptionList[j].dayOfStockOut;
                                        data[5] = consumptionList[j].dataSourceId;
                                        if (consumptionList[j].notes === null || consumptionList[j].notes === ' NULL') {
                                            data[6] = '';
                                        } else {
                                            data[6] = consumptionList[j].notes;
                                        }
                                        data[7] = consumptionList[j].actualFlag;
                                        data[0] = consumptionList[j].planningUnitId;
                                        data[8] = j;
                                        consumptionDataArr.push(data);
                                    }
                                }

                                this.el = jexcel(document.getElementById("consumptiontableDiv"), '');
                                this.el.destroy();
                                var json = [];
                                var data = consumptionDataArr;
                                // var data = [{}, {}, {}, {}, {}];
                                // json[0] = data;
                                var options = {
                                    data: data,
                                    columnDrag: true,
                                    colWidths: [200, 80, 90, 90, 80, 110, 150, 90],
                                    columns: [
                                        // { title: 'Month', type: 'text', readOnly: true },
                                        {
                                            title: 'Planning Unit',
                                            type: 'dropdown',
                                            source: planningUnitListQat,
                                            readOnly: true
                                        },
                                        {
                                            title: 'Consumption Date',
                                            type: 'calendar',
                                            options: {
                                                format: 'MM-YYYY'
                                            }
                                        },
                                        {
                                            title: i18n.t('static.inventory.region'),
                                            type: 'dropdown',
                                            source: regionList
                                        },
                                        {
                                            title: i18n.t('static.consumption.consumptionqty'),
                                            type: 'numeric'
                                        },
                                        {
                                            title: i18n.t('static.consumption.daysofstockout'),
                                            type: 'numeric'
                                        },
                                        {
                                            title: i18n.t('static.inventory.dataSource'),
                                            type: 'dropdown',
                                            source: dataSourceList
                                        },
                                        {
                                            title: 'Notes',
                                            type: 'text'
                                        },
                                        {
                                            title: i18n.t('static.consumption.actualflag'),
                                            type: 'dropdown',
                                            source: [{ id: true, name: i18n.t('static.consumption.actual') }, { id: false, name: i18n.t('static.consumption.forcast') }]
                                        },

                                        { title: 'Index', type: 'hidden'},
                                        // { title: 'Last Modified date', type: 'text', readOnly: true },
                                        // { title: 'Last Modified by', type: 'text', readOnly: true }
                                    ],
                                    pagination: 10,
                                    search: true,
                                    columnSorting: true,
                                    tableOverflow: true,
                                    wordWrap: true,
                                    allowInsertColumn: false,
                                    allowManualInsertColumn: false,
                                    allowDeleteRow: false,
                                    onchange: this.changed,
                                    oneditionend: this.onedit,
                                    copyCompatibility: true,
                                    // paginationOptions: [10, 25, 50, 100],
                                    position: 'top'
                                };

                                this.el = jexcel(document.getElementById("consumptiontableDiv"), options);
                                this.loaded();
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
                        });

                    });
            });

        });
    }
    render() {
        return (
            <>
                <h4 className="red">{this.props.message}</h4>
                <div className="table-responsive" >

                    <div id="consumptiontableDiv">
                    </div>
                </div>
            </>
        );
    }
}
