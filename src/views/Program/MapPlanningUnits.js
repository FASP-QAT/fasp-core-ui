import React, { Component } from 'react';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import PlanningUnitService from '../../api/PlanningUnitService';
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n';

export default class MapPlanningUnits extends Component {
    constructor(props) {
        super(props);
        this.state = {
            planningUnitList: [],
            mapPlanningUnitEl: ''
        }
        this.changed = this.changed.bind(this);
        this.myFunction = this.myFunction.bind(this);

    }


    changed = function (instance, cell, x, y, value) {
        if (x == 0) {
            var json = this.el.getJson();
            var col = ("A").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                for (var i = 0; i < json.length; i++) {
                    var map = new Map(Object.entries(json[i]));
                    var planningUnitValue = map.get("0");
                    if (planningUnitValue == value && y != i) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, "Planning Unit Allready Exists");
                        i = json.length;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }

            }
        }
        if (x == 1) {
            var reg = /^[0-9\b]+$/;
            var col = ("B").concat(parseInt(y) + 1);
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
        if (x == 2) {
            var reg = /^[0-9\b]+$/;
            var col = ("C").concat(parseInt(y) + 1);
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


    componentDidMount() {
        var list = []
        AuthenticationService.setupAxiosInterceptors();
        PlanningUnitService.getActivePlanningUnitList()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        planningUnitList: response.data
                    });
                    for (var k = 0; k < (response.data).length; k++) {
                        var planningUnitJson = {
                            name: response.data[k].label.label_en,
                            id: response.data[k].planningUnitId
                        }
                        list.push(planningUnitJson);
                    }
                    this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
                    this.el.destroy();
                    var json = [];
                    var data = [{}];
                    var options = {
                        data: data,
                        columnDrag: true,
                        colWidths: [500, 210, 210],
                        columns: [

                            {
                                title: 'Planning Unit',
                                type: 'dropdown',
                                source: list
                            },
                            {
                                title: 'Reorder frequency in months',
                                type: 'number',

                            },
                            {
                                title: 'Min month of stock',
                                type: 'number'
                            },
                        ],
                        pagination: false,
                        search: true,
                        columnSorting: true,
                        tableOverflow: true,
                        wordWrap: true,
                        // paginationOptions: [10, 25, 50, 100],
                        // position: 'top',
                        allowInsertColumn: false,
                        allowManualInsertColumn: false,
                        allowDeleteRow: false,
                        onchange: this.changed,
                        oneditionend: this.onedit,
                        copyCompatibility: true

                    };
                    var elVar = jexcel(document.getElementById("mapPlanningUnit"), options);
                    this.el = elVar;
                    this.setState({ mapPlanningUnitEl: elVar });
                } else {
                    list = []
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            });
    }

    myFunction() {
        var json = this.el.getJson();
        var planningUnitArray = []
        for (var i = 0; i < json.length; i++) {
            var map = new Map(Object.entries(json[i]));
            var planningUnitJson = {
                planningUnit: {
                    id: map.get("0"),
                },
                reorderFrequencyInMonths: map.get("1"),
                minMonthsOfStock: map.get("2"),
                active: true,
                programPlanningUnitId: 0
            }
            planningUnitArray.push(planningUnitJson);
        }
        return planningUnitArray;
    }

    render() {
        return (
            <div className="table-responsive">
                <div id="mapPlanningUnit">
                </div>
            </div>
        );
    }

}