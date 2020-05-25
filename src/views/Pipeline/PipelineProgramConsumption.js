import React, { Component } from 'react';
import jexcel from 'jexcel';
import i18n from '../../i18n';
import PipelineService from '../../api/PipelineService.js';
import AuthenticationService from '../Common/AuthenticationService.js';
import DataSourceService from '../../api/DataSourceService.js'

export default class PipelineProgramConsumption extends Component {

    constructor(props) {
        super(props);
        this.loaded = this.loaded.bind(this);
        this.saveConsumption = this.saveConsumption.bind(this);
        this.changed = this.changed.bind(this);
    }

    changed = function (instance, cell, x, y, value) {
        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
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
            var col = ("E").concat(parseInt(y) + 1);
            var value = map.get("4");
            if (value != "" && !isNaN(parseInt(value))) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, (list[y].consdatasourceid).concat(" Does not exist."));
            }
        }

    }
    saveConsumption() {
        var json = this.el.getJson();
        console.log("consumption json------->", json);
        var consumptionArray = []
        for (var i = 0; i < json.length; i++) {
            var map = new Map(Object.entries(json[i]));
            var consumptionJson = {
                region: {
                    id: map.get("1")
                },
                planningUnit: {
                    id: map.get("7"),
                },
                consumptionDate: map.get("0"),
                actualFlag: map.get("6"),
                consumptionQty: map.get("2"),
                dayOfStockOut: map.get("3"),
                dataSource: {
                    id: map.get("4")
                },
                notes: map.get("5")
            }
            consumptionArray.push(consumptionJson);
        }
        return consumptionArray;
    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        PipelineService.getQatTempProgramregion(this.props.pipelineId).then(response => {
            console.log("my region List ----->", response.data);
            var regionList = [];
            var dataSourceList = [];
            for (var i = 0; i < response.data.length; i++) {
                var regionJson = {
                    id: ((response.data)[i]).regionId,
                    name: ((response.data)[i]).label.label_en
                }
                regionList.push(regionJson);
            }

            AuthenticationService.setupAxiosInterceptors();
            DataSourceService.getActiveDataSourceList().then(response => {
                console.log("data source List ----->", response.data);

                for (var j = 0; j < response.data.length; j++) {
                    var dataSourceJson = {
                        id: ((response.data)[j]).dataSourceId,
                        name: ((response.data)[j]).label.label_en
                    }
                    dataSourceList.push(dataSourceJson);
                }

                AuthenticationService.setupAxiosInterceptors();
                PipelineService.getQatTempConsumptionById(this.props.pipelineId).then(response => {
                    console.log("temp consumpton list--->", response.data);
                    if (response.data.length > 0) {
                        console.log("in if==================");
                        var data = [];
                            var consumptionDataArr = [];
                            var consumptionList = response.data;

                            //don for loaded function
                            this.setState({ consumptionList: consumptionList });
                            //don for loaded function

                            for (var j = 0; j < consumptionList.length; j++) {
                                data = [];
                                data[0] = consumptionList[j].consumptionDate;
                                data[1] = consumptionList[j].region.id;
                                data[2] = consumptionList[j].consumptionQty;
                                data[3] = consumptionList[j].dayOfStockOut;
                                data[4] = consumptionList[j].dataSource.id;
                                if (consumptionList[j].notes === null || consumptionList[j].notes === ' NULL') {
                                    data[5] = '';
                                } else {
                                    data[5] = consumptionList[j].notes;
                                }
                                data[6] = consumptionList[j].actualFlag;
                                data[7] = consumptionList[j].planningUnit.id;
                                consumptionDataArr.push(data);
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
                                colWidths: [130, 130, 120, 120, 100, 100, 100, 100],
                                columns: [
                                    // { title: 'Month', type: 'text', readOnly: true },
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
                                    { title: 'Product Id', type: 'hidden' },
                                    // { title: 'Created By', type: 'text', readOnly: true },
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
                        


                    } else {
                        console.log("in else==================");
                        AuthenticationService.setupAxiosInterceptors();
                        PipelineService.getPipelineProgramConsumption(this.props.pipelineId).then(response => {
                            console.log("consumption List ----->", response.data);
                            var data = [];
                            var consumptionDataArr = [];
                            var consumptionList = response.data;

                            //don for loaded function
                            this.setState({ consumptionList: consumptionList });
                            //don for loaded function

                            for (var j = 0; j < consumptionList.length; j++) {
                                data = [];
                                data[0] = consumptionList[j].conDate;
                                data[1] = "";
                                data[2] = consumptionList[j].consamount;
                                data[3] = "";
                                data[4] = consumptionList[j].consdatasourceid;
                                if (consumptionList[j].consnote === null || consumptionList[j].consnote === ' NULL') {
                                    data[5] = '';
                                } else {
                                    data[5] = consumptionList[j].consnote;
                                }
                                data[6] = consumptionList[j].consactualflag;
                                data[7] = consumptionList[j].productid;
                                consumptionDataArr.push(data);
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
                                colWidths: [130, 130, 120, 120, 100, 100, 100, 100],
                                columns: [
                                    // { title: 'Month', type: 'text', readOnly: true },
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
                                    { title: 'Product Id', type: 'hidden' },
                                    // { title: 'Created By', type: 'text', readOnly: true },
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
                        });

                    }
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