import React, { Component } from 'react';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import PipelineService from '../../api/PipelineService.js';
import PlanningUnitService from '../../api/PlanningUnitService';
import ProductCategoryServcie from '../../api/PoroductCategoryService.js';
import { jExcelLoadedFunction, jExcelLoadedFunctionPipeline } from '../../CommonComponent/JExcelCommonFunctions.js';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY} from '../../Constants.js';
export default class PipelineProgramPlanningUnits extends Component {
    constructor(props) {
        super(props);
        this.state = {
            planningUnitList: [],
            mapPlanningUnitEl: '',
            loading: true,
            productCategoryList: []
        }
        this.loaded = this.loaded.bind(this);
        this.changed = this.changed.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.savePlanningUnits = this.savePlanningUnits.bind(this);
        this.dropdownFilter = this.dropdownFilter.bind(this);
    }

    dropdownFilter = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[c - 1];

        var puList = []
        if (value != -1) {
            console.log("in if=====>");
            var pc = this.state.productCategoryList.filter(c => c.payload.productCategoryId == value)[0]
            var pcList = this.state.productCategoryList.filter(c => c.payload.productCategoryId == pc.payload.productCategoryId || c.parentId == pc.id);
            var pcIdArray = [];
            for (var pcu = 0; pcu < pcList.length; pcu++) {
                pcIdArray.push(pcList[pcu].payload.productCategoryId);
            }
            puList = (this.state.activePlanningUnitList).filter(c => pcIdArray.includes(c.forecastingUnit.productCategory.id) && c.active.toString() == "true");
        } else {
            console.log("in else=====>");
            puList = this.state.activePlanningUnitList
        }

        // var puList = (this.state.activePlanningUnitList).filter(c => c.forecastingUnit.productCategory.id == value);

        for (var k = 0; k < puList.length; k++) {
            var planningUnitJson = {
                name: puList[k].label.label_en,
                id: puList[k].planningUnitId
            }
            mylist.push(planningUnitJson);
        }
        return mylist;
    }


    loaded() {
        var list = this.state.planningUnitList;
        var json = this.el.getJson();

        for (var y = 0; y < json.length; y++) {
            var col = ("D").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[3]).toString();

            if (value != "" && value > 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, (list[y].pipelineProductName).concat(i18n.t('static.message.notExist')));
            }
            var col = ("K").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[10]).toString();

            if (value != "" && value > 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            }
            var col = ("M").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[12]).toString();

            if (value != "" && value > 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            }
        }

    }

    changed = function (instance, cell, x, y, value) {
        //Prodct category
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
            var columnName = jexcel.getColumnNameFromId([parseInt(x) + 1, y]);
            instance.jexcel.setValue(columnName, '');
        }

        //Planning Unit
        if (x == 3) {
            var json = this.el.getJson();
            var col = ("D").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                for (var i = 0; i < json.length; i++) {
                    var map = new Map(Object.entries(json[i]));
                    var planningUnitValue = map.get("3");
                    if (planningUnitValue == value && y != i) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.planningUnitAlreadyExists'));
                        i = json.length;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }
            }
            // var columnName = jexcel.getColumnNameFromId([x + 1, y]);
            // instance.jexcel.setValue(columnName, '');
        }
        if (x == 4) {
            //var reg = /^[0-9\b]+$/;
            var reg = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;
            var col = ("E").concat(parseInt(y) + 1);
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
        //Reorder frequency in months
        if (x == 5) {
            var reg = /^[0-9\b]+$/;
            var col = ("F").concat(parseInt(y) + 1);
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
        //Min month of stock
        if (x == 6) {
            var reg = /^[0-9\b]+$/;
            var col = ("G").concat(parseInt(y) + 1);
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
        //Months In Future For AMC
        if (x == 7) {
            var reg = /^[0-9\b]+$/;
            var col = ("H").concat(parseInt(y) + 1);
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
        //Months In Past For AMC
        if (x == 8) {
            var reg = /^[0-9\b]+$/;
            var col = ("I").concat(parseInt(y) + 1);
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
        //Local Procurment Lead Time
        if (x == 10) {
            var reg = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;
            var col = ("K").concat(parseInt(y) + 1);
            console.log('value=>', value)
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value) || value < 0)) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        //Shelf Life
        if (x == 11) {
            var reg = /^[0-9\b]+$/;
            var col = ("L").concat(parseInt(y) + 1);
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
        //Catalog Price
        if (x == 12) {
            // var reg = /^[0-9]+.[0-9]+$/;
            var reg = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;
            var col = ("M").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value) || value < 0)) {
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

    checkValidation() {

        var reg = /^[0-9\b]+$/;
        var regDec = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;

        var valid = true;
        var json = this.el.getJson();
        for (var y = 0; y < json.length; y++) {
            var col = ("D").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(3, y);

            var currentPlanningUnit = this.el.getRowData(y)[1];

            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                // this.el.setStyle(col, "background-color", "transparent");
                // this.el.setComments(col, "");
                for (var i = 0; i < json.length; i++) {
                    var map = new Map(Object.entries(json[i]));
                    var planningUnitValue = map.get("3");
                    // console.log("currentvalues---", currentPlanningUnit);
                    // console.log("planningUnitValue-->", planningUnitValue);
                    if (planningUnitValue == currentPlanningUnit && y != i) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.planningUnitAlreadyExists'));
                        i = json.length;
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }
            }

            var col = ("E").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(4, y);
            if (value === "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(regDec.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

            }
            var reg = /^[0-9\b]+$/;
            var col = ("F").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(5, y);
            if (value == "") {
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


            var reg = /^[0-9\b]+$/;
            var col = ("G").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(6, y);
            if (value == "") {
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

            var reg = /^[0-9\b]+$/;
            var col = ("H").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(7, y);
            if (value == "") {
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

            var reg = /^[0-9\b]+$/;
            var col = ("I").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(8, y);
            if (value == "") {
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

            //Local procurement lead time
            var col = ("K").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(10, y);
            if (value === "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(regDec.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

            }

            var col = ("L").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(11, y);
            if (value === "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(regDec.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

            }

            var col = ("M").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(12, y);
            if (value === "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(regDec.test(value))) {
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

    savePlanningUnits() {
        var list = this.state.planningUnitList;
        var json = this.el.getJson();
        var planningUnitArray = []
        for (var i = 0; i < json.length; i++) {
            var map = new Map(Object.entries(json[i]));
            var planningUnitId = map.get("3");
            if (planningUnitId != "" && !isNaN(parseInt(planningUnitId))) {
                planningUnitId = map.get("3");
            } else {
                planningUnitId = list[i].planningUnitId;
            }

            var planningUnitJson = {
                // pipelineId: {
                //     id: this.props.pipelineId
                // },
                active: map.get("13"),
                program: {
                    id: 0
                },
                planningUnitId: planningUnitId,
                multiplier: map.get("4"),
                reorderFrequencyInMonths: map.get("5"),
                minMonthsOfStock: map.get("6"),
                monthsInFutureForAmc: map.get("7"),
                monthsInPastForAmc: map.get("8"),
                programPlanningUnitId: map.get("9"),
                localProcurmentLeadTime: map.get("10") == '' ? null : map.get("10"),
                shelfLife: map.get("11"),
                catalogPrice: map.get("12") == '' ? null : map.get("12")


            }
            planningUnitArray.push(planningUnitJson);
        }
        console.log("planning unit array====>", planningUnitArray);
        return planningUnitArray;

    }


    componentDidMount() {
        var productCategoryList = [];
        // var realmId = document.getElementById("realmId").value;
        // AuthenticationService.setupAxiosInterceptors();
        ProductCategoryServcie.getProductCategoryListByRealmId(1)
            .then(response => {
                // productCategoryList = response.data;
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


                    var productCategoryJson = {};
                    if (response.data[k].payload.productCategoryId == 0) {
                        productCategoryJson = {
                            name: (response.data[k].payload.label.label_en),
                            id: -1
                        }
                    } else {
                        productCategoryJson = {
                            name: (response.data[k].payload.label.label_en),
                            id: response.data[k].payload.productCategoryId
                        }
                    }

                    productCategoryList.push(productCategoryJson);

                }
                this.setState({ productCategoryList: response.data });
                console.log("category response---->", productCategoryList);



                var planningUnitListQat = [];
                // var activePlanningUnitList=[];
                // AuthenticationService.setupAxiosInterceptors();
                PlanningUnitService.getActivePlanningUnitList()
                    .then(response => {
                        if (response.status == 200) {
                            // planningUnitListQat = response.data
                            this.setState({ activePlanningUnitList: response.data });
                            for (var k = 0; k < (response.data).length; k++) {
                                var planningUnitJson = {
                                    name: response.data[k].label.label_en + ' ~ ' + response.data[k].planningUnitId,
                                    id: response.data[k].planningUnitId
                                }
                                planningUnitListQat.push(planningUnitJson);
                            }
                            this.setState({ planningUnitListQat: planningUnitListQat });

                            // AuthenticationService.setupAxiosInterceptors();
                            PipelineService.getQatTempPlanningUnitList(this.props.pipelineId)
                                .then(response => {
                                    if (response.status == 200) {
                                        if (response.data.length > 0) {

                                            var planningUnitList = response.data;
                                            var data = [];
                                            var productDataArr = []
                                            //seting this for loaded function
                                            this.setState({ planningUnitList: planningUnitList });
                                            //seting this for loaded function
                                            console.log("planning Unit list==>", planningUnitList);

                                            if (planningUnitList.length != 0) {
                                                for (var j = 0; j < planningUnitList.length; j++) {
                                                    data = [];

                                                    data[0] = planningUnitList[j].pipelineProductCategoryName;
                                                    data[1] = planningUnitList[j].pipelineProductName;

                                                    if (planningUnitList[j].productCategoryId == 0) {
                                                        data[2] = -1;
                                                    } else {
                                                        data[2] = planningUnitList[j].productCategoryId;
                                                    }
                                                    data[3] = planningUnitList[j].planningUnitId;
                                                    data[4] = planningUnitList[j].multiplier
                                                    data[5] = planningUnitList[j].reorderFrequencyInMonths;
                                                    data[6] = planningUnitList[j].minMonthsOfStock;
                                                    if (planningUnitList[j].monthsInFutureForAmc == 0) {
                                                        data[7] = this.props.items.program.monthsInFutureForAmc;
                                                    } else {
                                                        data[7] = planningUnitList[j].monthsInFutureForAmc;
                                                    }
                                                    if (planningUnitList[j].monthsInPastForAmc == 0) {
                                                        data[8] = this.props.items.program.monthsInPastForAmc;
                                                    } else {
                                                        data[8] = planningUnitList[j].monthsInPastForAmc;
                                                    }

                                                    data[9] = planningUnitList[j].programPlanningUnitId

                                                    data[10] = planningUnitList[j].localProcurmentLeadTime == -1 ? '' : planningUnitList[j].localProcurmentLeadTime
                                                    if (planningUnitList[j].shelfLife == 0) {
                                                        data[11] = this.props.items.program.shelfLife;
                                                    } else {
                                                        data[11] = planningUnitList[j].shelfLife
                                                    }
                                                    data[12] = planningUnitList[j].catalogPrice == -1 ? '' : planningUnitList[j].catalogPrice
                                                    data[13] = planningUnitList[j].active
                                                    productDataArr.push(data);

                                                }
                                            } else {
                                                console.log("product list length is 0.");
                                            }

                                            this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
                                            this.el.destroy();
                                            var json = [];
                                            var data = productDataArr;
                                            // var data = []
                                            var options = {
                                                data: data,
                                                columnDrag: true,
                                                colWidths: [160, 190, 190, 190, 80, 80, 80, 80, 80, 80, 120, 120, 80, 80],
                                                columns: [

                                                    {
                                                        title: i18n.t('static.pipeline.pplnproductcategory'),
                                                        type: 'text',
                                                        readOnly: true
                                                    }, {
                                                        title: i18n.t('static.pipeline.pplnproduct'),
                                                        type: 'text',
                                                        readOnly: true
                                                    },
                                                    {
                                                        title: i18n.t('static.product.productcategory'),
                                                        type: 'dropdown',
                                                        source: productCategoryList,
                                                        // filter: this.dropdownFilter
                                                    },
                                                    {
                                                        title: i18n.t('static.planningunit.planningunit'),
                                                        type: 'autocomplete',
                                                        source: planningUnitListQat,
                                                        filter: this.dropdownFilter
                                                    },
                                                    {
                                                        title: i18n.t('static.unit.multiplier'),
                                                        type: 'number',

                                                    },
                                                    {
                                                        title: i18n.t('static.program.reorderFrequencyInMonths'),
                                                        type: 'number',

                                                    },
                                                    {
                                                        title: i18n.t('static.supplyPlan.minStockMos'),
                                                        type: 'number'
                                                    },
                                                    {
                                                        title: i18n.t('static.report.mosfuture'),
                                                        type: 'number'
                                                    },
                                                    {
                                                        title: i18n.t('static.report.mospast'),
                                                        type: 'number'
                                                    },
                                                    {
                                                        title: i18n.t('static.report.id'),
                                                        type: 'hidden'
                                                    },
                                                    {
                                                        title: i18n.t('static.pipeline.localprocurementleadtime'),
                                                        type: 'number',
                                                    },
                                                    {
                                                        title: i18n.t('static.report.shelfLife'),
                                                        type: 'number'
                                                    },
                                                    {
                                                        title: i18n.t('static.procurementAgentPlanningUnit.catalogPrice'),
                                                        type: 'number'
                                                    },
                                                    {
                                                        title: i18n.t('static.common.status'),
                                                        type: 'dropdown',
                                                        source: [{ id: true, name: i18n.t('static.common.active') }, { id: false, name: i18n.t('static.common.disabled') }]
                                                    }
                                                ],
                                                pagination:localStorage.getItem("sesRecordCount"),
                                                filters:true,
                                                contextMenu: false,
                                                search: true, 
                                                columnSorting: true,
                                                tableOverflow: true,
                                                wordWrap: true,
                                                paginationOptions: JEXCEL_PAGINATION_OPTION,
                                                // position: 'top',
                                                allowInsertColumn: false,
                                                allowManualInsertColumn: false,
                                                allowDeleteRow: false,
                                                onchange: this.changed,
                                                oneditionend: this.onedit,
                                                copyCompatibility: true,
                                                allowInsertRow: false,
                                                text: {
                                                    // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                                    showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')} `,
                                                    show: '',
                                                    entries: '',
                                                },
                                                onload: this.loadedJexcelCommonFunction,
                                                license: JEXCEL_PRO_KEY,
                                                // onload: this.loaded

                                            };
                                            var elVar = jexcel(document.getElementById("mapPlanningUnit"), options);
                                            this.el = elVar;
                                            this.loaded();
                                            this.setState({
                                                loading: false
                                            })

                                            // } else {

                                            //     PipelineService.getPipelineProductListById(this.props.pipelineId)
                                            //         .then(response => {
                                            //             if (response.status == 200) {
                                            //                 var planningUnitList = response.data;
                                            //                 var data = [];
                                            //                 var productDataArr = []
                                            //                 //seting this for loaded function
                                            //                 this.setState({ planningUnitList: planningUnitList });
                                            //                 //seting this for loaded function
                                            //                 if (planningUnitList.length != 0) {
                                            //                     for (var j = 0; j < planningUnitList.length; j++) {
                                            //                         data = [];
                                            //                         data[0] = planningUnitList[j].methodid;
                                            //                         data[1] = planningUnitList[j].productname;
                                            //                         data[2] = '';
                                            //                         data[3] = planningUnitList[j].productminmonths;
                                            //                         data[4] = planningUnitList[j].productid
                                            //                         productDataArr.push(data);

                                            //                     }
                                            //                 } else {
                                            //                     console.log("product list length is 0.");
                                            //                 }

                                            //                 this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
                                            //                 this.el.destroy();
                                            //                 var json = [];
                                            //                 var data = productDataArr;
                                            //                 // var data = []
                                            //                 var options = {
                                            //                     data: data,
                                            //                     columnDrag: true,
                                            //                     colWidths: [290, 290, 170, 170],
                                            //                     columns: [
                                            //                         {
                                            //                             title: 'Product Category',
                                            //                             type: 'dropdown',
                                            //                             source: productCategoryList,
                                            //                             // filter: this.dropdownFilter
                                            //                         },
                                            //                         {
                                            //                             title: 'Planning Unit',
                                            //                             type: 'autocomplete',
                                            //                             source: planningUnitListQat,
                                            //                             filter: this.dropdownFilter
                                            //                         },
                                            //                         {
                                            //                             title: 'Reorder frequency in months',
                                            //                             type: 'number',

                                            //                         },
                                            //                         {
                                            //                             title: 'Min month of stock',
                                            //                             type: 'number'
                                            //                         },
                                            //                         {
                                            //                             title: 'Pipeline Product Id',
                                            //                             type: 'hidden'
                                            //                         },
                                            //                     ],
                                            //                     pagination: 10,
                                            //                     search: true,
                                            //                     columnSorting: true,
                                            //                     tableOverflow: true,
                                            //                     wordWrap: true,
                                            //                     // paginationOptions: [10, 25, 50, 100],
                                            //                     // position: 'top',
                                            //                     allowInsertColumn: false,
                                            //                     allowManualInsertColumn: false,
                                            //                     allowDeleteRow: false,
                                            //                     onchange: this.changed,
                                            //                     oneditionend: this.onedit,
                                            //                     copyCompatibility: true,
                                            //                     // onload: this.loaded

                                            //                 };
                                            //                 var elVar = jexcel(document.getElementById("mapPlanningUnit"), options);
                                            //                 this.el = elVar;
                                            //                 this.loaded();

                                            //             } else {
                                            //                 this.setState({ message: response.data.messageCode })
                                            //             }
                                            //         });
                                        }
                                    } else {
                                        this.setState({ message: response.data.messageCode, loading: false })
                                    }
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

                        } else {
                            this.setState({ message: response.data.messageCode, loading: false })
                        }

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

    loadedJexcelCommonFunction = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionPipeline(instance, 0);
    }

    render() {
        return (
            <>
                <AuthenticationServiceComponent history={this.props.history} />
                <h4 className="red">{this.props.message}</h4>
                <div className="table-responsive" style={{ display: this.state.loading ? "none" : "block" }} >

                    <div id="mapPlanningUnit">
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
