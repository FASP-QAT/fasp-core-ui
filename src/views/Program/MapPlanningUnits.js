import React, { Component } from 'react';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import PlanningUnitService from '../../api/PlanningUnitService';
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n';
import ProductCategoryServcie from '../../api/PoroductCategoryService.js';

export default class MapPlanningUnits extends Component {
    constructor(props) {
        super(props);
        this.state = {
            planningUnitList: [],
            mapPlanningUnitEl: '',
        }
        this.changed = this.changed.bind(this);
        this.myFunction = this.myFunction.bind(this);
        this.getRealmId = this.getRealmId.bind(this);
        this.dropdownFilter = this.dropdownFilter.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.addRow = this.addRow.bind(this);

    }

    addRow = function () {
        this.el.insertRow();
        var json = this.el.getJson();
    }

    checkValidation() {
        var reg = /^[0-9\b]+$/;
        var valid = true;
        var json = this.el.getJson();
        for (var y = 0; y < json.length; y++) {

            var col = ("A").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(0, y);
            if (value === "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
            var col = ("B").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(1, y);
            if (value === "") {
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
            if (value === "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

            }

            var col = ("D").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(3, y);
            if (value === "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

            }
        }
        return valid;
    }
    changed = function (instance, cell, x, y, value) {
        this.props.removeMessageText && this.props.removeMessageText();
        if (x == 0) {
            var col = ("A").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
            var columnName = jexcel.getColumnNameFromId([x + 1, y]);
            instance.jexcel.setValue(columnName, '');
        }
        if (x == 1) {
            var json = this.el.getJson();
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                for (var i = 0; i < json.length; i++) {
                    var map = new Map(Object.entries(json[i]));
                    var planningUnitValue = map.get("1");
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
        if (x == 3) {
            var reg = /^[0-9\b]+$/;
            var col = ("D").concat(parseInt(y) + 1);
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


    dropdownFilter = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[c - 1];
        // AuthenticationService.setupAxiosInterceptors();
        // PlanningUnitService.getActivePlanningUnitList()
        //     .then(response => {
        //         if (response.status == 200) {
        // console.log("for my list response---", response.data);
        // this.setState({
        //     planningUnitList: response.data
        // });

        var puList = (this.state.planningUnitList).filter(c => c.forecastingUnit.productCategory.id == value);

        for (var k = 0; k < puList.length; k++) {
            var planningUnitJson = {
                name: puList[k].label.label_en,
                id: puList[k].planningUnitId
            }
            mylist.push(planningUnitJson);
        }
        return mylist;
    }

    getRealmId() {
        var list = [];
        var productCategoryList = [];
        var realmId = document.getElementById("realmId").value;
        AuthenticationService.setupAxiosInterceptors();
        ProductCategoryServcie.getProductCategoryListByRealmId(realmId)
            .then(response => {
                if (response.status == 200) {
                    console.log("productCategory response----->", response.data);
                    for (var k = 0; k < (response.data).length; k++) {

                        var spaceCount = response.data[k].sortOrder.split(".").length;
                        console.log("spaceCOunt--->", spaceCount);
                        var indendent = "";
                        for (var p = 1; p <= spaceCount - 1; p++) {
                            if (p == 1) {
                                indendent = indendent.concat("|_");
                            } else {
                                indendent = indendent.concat("_");
                            }
                        }
                        console.log("ind", indendent);
                        console.log("indendent.concat(response.data[k].payload.label.label_en)-->", indendent.concat(response.data[k].payload.label.label_en));
                        var productCategoryJson = {
                            name: (response.data[k].payload.label.label_en),
                            id: response.data[k].payload.productCategoryId
                        }
                        productCategoryList.push(productCategoryJson);

                    }

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
                                    colWidths: [290, 290, 170, 170,170],
                                    columns: [

                                        {
                                            title: 'Product Category',
                                            type: 'dropdown',
                                            source:productCategoryList
                                        },
                                        {
                                            title: 'Planning Unit',
                                            type: 'autocomplete',
                                            source: list,
                                            filter: this.dropdownFilter
                                        },
                                        {
                                            title: 'Reorder frequency in months',
                                            type: 'number',

                                        },
                                        {
                                            title: 'Min month of stock',
                                            type: 'number'
                                        },
                                        {
                                            title: 'Local Procurment Lead Time',
                                            type: 'number'
                                        }

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
                                list = [];
                            }
                        });



                } else {
                    productCategoryList = []
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
                program: {
                    id: 0
                },
                planningUnit: {
                    id: map.get("1"),
                },
                reorderFrequencyInMonths: map.get("2"),
                minMonthsOfStock: map.get("3"),
                localProcurementLeadTime:map.get("4"),
                active: true,
                programPlanningUnitId: 0
            }
            planningUnitArray.push(planningUnitJson);
        }
        return planningUnitArray;
    }
    componentDidMount() {

    }

    render() {
        return (
            <>
                <h4 className="red">{this.props.message}</h4>
                <div className="table-responsive" >

                    <div id="mapPlanningUnit">
                    </div>
                </div>
            </>
        );
    }

}