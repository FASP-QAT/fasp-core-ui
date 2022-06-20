import React, { Component } from 'react';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import PlanningUnitService from '../../api/PlanningUnitService';
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n';
import ProductCategoryServcie from '../../api/PoroductCategoryService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionWithoutPagination } from '../../CommonComponent/JExcelCommonFunctions.js'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { JEXCEL_INTEGER_REGEX, JEXCEL_DECIMAL_LEAD_TIME, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_PRO_KEY, MONTHS_IN_FUTURE_FOR_AMC, MONTHS_IN_PAST_FOR_AMC } from '../../Constants.js';
export default class MapPlanningUnits extends Component {
    constructor(props) {
        super(props);
        this.state = {
            planningUnitList: [],
            mapPlanningUnitEl: '',
            loading: true,
            productCategoryList: [],
            lang: localStorage.getItem('lang')
        }
        this.changed = this.changed.bind(this);
        this.myFunction = this.myFunction.bind(this);
        this.getRealmId = this.getRealmId.bind(this);
        this.dropdownFilter = this.dropdownFilter.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.addRow = this.addRow.bind(this);
        this.oneditionend = this.oneditionend.bind(this);

    }

    addRow = function () {
        console.log("add row called");
        var data = [];
        data[0] = "-1";
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = MONTHS_IN_FUTURE_FOR_AMC;
        data[5] = MONTHS_IN_PAST_FOR_AMC;
        data[6] = "";
        data[7] = "";
        data[8] = "";
        this.el.insertRow(
            data, 0, 1
        );
        // this.el.insertRow();
        console.log("insert row called");
        var json = this.el.getJson(null, false)
    }

    checkValidation() {
        var reg = /^[0-9\b]+$/;
        var regDec = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;

        var valid = true;
        var json = this.el.getJson(null, false);
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
            var value = this.el.getRowData(parseInt(y))[1];
            console.log("Vlaue------>", value);
            if (value === "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                for (var i = (json.length - 1); i >= 0; i--) {
                    var map = new Map(Object.entries(json[i]));
                    var planningUnitValue = map.get("1");
                    if (planningUnitValue == value && y != i && i > y) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.planningUnitAlreadyExists'));
                        i = -1;
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }

            }
            //reorder frequency
            var col = ("C").concat(parseInt(y) + 1);
            value = this.el.getValue(`C${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_INTEGER_REGEX
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
            //min month of stock
            var col = ("D").concat(parseInt(y) + 1);
            value = this.el.getValue(`D${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_INTEGER_REGEX
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
            //month in future amc
            var col = ("E").concat(parseInt(y) + 1);
            value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_INTEGER_REGEX
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
            //month in past amc
            var col = ("F").concat(parseInt(y) + 1);
            value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_INTEGER_REGEX
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
            //procuementAgent lead time
            var col = ("G").concat(parseInt(y) + 1);
            value = this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_DECIMAL_LEAD_TIME
            if (value === "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

            }
            //shelf life
            var col = ("H").concat(parseInt(y) + 1);
            value = this.el.getValue(`H${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_INTEGER_REGEX
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
            //catelog price
            var col = ("I").concat(parseInt(y) + 1);
            value = this.el.getValue(`I${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
            if (value === "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                if (!(reg.test(value))) {
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
            var json = this.el.getJson(null, false);
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                console.log("json.length", json.length);
                var jsonLength = parseInt(json.length) - 1;
                console.log("jsonLength", jsonLength);
                for (var i = jsonLength; i >= 0; i--) {
                    console.log("i=---------->", i, "y----------->", y);
                    var map = new Map(Object.entries(json[i]));
                    var planningUnitValue = map.get("1");
                    console.log("Planning Unit value in change", map.get("1"));
                    console.log("Value----->", value);
                    if (planningUnitValue == value && y != i) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.planningUnitAlreadyExists'));
                        i = -1;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }

            }
        }
        //reoder frequency
        if (x == 2) {
            // var reg = /^[0-9\b]+$/;
            var reg = JEXCEL_INTEGER_REGEX;
            var col = ("C").concat(parseInt(y) + 1);
            value = this.el.getValue(`C${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
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
        //min month of stock
        if (x == 3) {
            var reg = JEXCEL_INTEGER_REGEX
            var col = ("D").concat(parseInt(y) + 1);
            value = this.el.getValue(`D${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
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
        //month in future amc
        if (x == 4) {
            var reg = JEXCEL_INTEGER_REGEX
            var col = ("E").concat(parseInt(y) + 1);
            value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
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
        //month in past amc
        if (x == 5) {
            var reg = JEXCEL_INTEGER_REGEX
            var col = ("F").concat(parseInt(y) + 1);
            value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
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
        //procurementAgent lead time
        if (x == 6) {
            // var reg = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;
            var reg = JEXCEL_DECIMAL_LEAD_TIME
            var col = ("G").concat(parseInt(y) + 1);
            value = this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        //Shelf life
        if (x == 7) {
            // var reg = /^[0-9\b]+$/;
            var reg = JEXCEL_INTEGER_REGEX
            var col = ("H").concat(parseInt(y) + 1);
            value = this.el.getValue(`H${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
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
        //Catelog price
        if (x == 8) {
            // var reg = /^[0-9]+.[0-9]+$/;
            // var reg = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;
            var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
            var col = ("I").concat(parseInt(y) + 1);
            value = this.el.getValue(`I${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (!(reg.test(value))) {
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
        var value = (instance.jexcel.getJson(null, false)[r])[c - 1];
        // AuthenticationService.setupAxiosInterceptors();
        // PlanningUnitService.getActivePlanningUnitList()
        //     .then(response => {
        //         if (response.status == 200) {
        // console.log("for my list response---", response.data);
        // this.setState({
        //     planningUnitList: response.data
        // });

        var puList = []
        if (value != -1) {
            console.log("in if=====>");
            var pc = this.state.productCategoryList.filter(c => c.payload.productCategoryId == value)[0]
            var pcList = this.state.productCategoryList.filter(c => c.payload.productCategoryId == pc.payload.productCategoryId || c.parentId == pc.id);
            var pcIdArray = [];
            for (var pcu = 0; pcu < pcList.length; pcu++) {
                pcIdArray.push(pcList[pcu].payload.productCategoryId);
            }
            puList = (this.state.planningUnitList).filter(c => pcIdArray.includes(c.forecastingUnit.productCategory.id) && c.active.toString() == "true");
        } else {
            console.log("in else=====>");
            puList = this.state.planningUnitList
        }

        // var puList = (this.state.planningUnitList).filter(c => c.forecastingUnit.productCategory.id == value);

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
        var realmId = this.props.items.program.realm.realmId;
        console.log("in mapping page---->", realmId);
        console.log("in mapping page---->", this.props.items);
        // AuthenticationService.setupAxiosInterceptors();
        ProductCategoryServcie.getProductCategoryListByRealmId(this.props.items.program.realm.realmId)
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

                    productCategoryList.sort((a, b) => {
                        var itemLabelA = a.name.toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = b.name.toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });

                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.payload.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.payload.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({ productCategoryList: listArray });

                    PlanningUnitService.getActivePlanningUnitList()
                        .then(response => {
                            if (response.status == 200) {
                                var listArray = response.data;
                                listArray.sort((a, b) => {
                                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                                    return itemLabelA > itemLabelB ? 1 : -1;
                                });
                                this.setState({
                                    planningUnitList: listArray
                                });
                                for (var k = 0; k < (response.data).length; k++) {
                                    var planningUnitJson = {
                                        name: response.data[k].label.label_en,
                                        id: response.data[k].planningUnitId
                                    }
                                    list.push(planningUnitJson);
                                }
                                list.sort((a, b) => {
                                    var itemLabelA = a.name.toUpperCase(); // ignore upper and lowercase
                                    var itemLabelB = b.name.toUpperCase(); // ignore upper and lowercase                   
                                    return itemLabelA > itemLabelB ? 1 : -1;
                                });

                                var productDataArr = []
                                // if (productDataArr.length == 0) {
                                data = [];
                                data[0] = "-1";
                                data[1] = "";
                                data[2] = "";
                                data[3] = "";
                                data[4] = MONTHS_IN_FUTURE_FOR_AMC;
                                data[5] = MONTHS_IN_PAST_FOR_AMC;
                                data[6] = "";
                                data[7] = "";
                                data[8] = "";
                                productDataArr[0] = data;
                                // }

                                this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
                                this.el.destroy();
                                var json = [];
                                var data = productDataArr;
                                var options = {
                                    data: data,
                                    columnDrag: true,
                                    colWidths: [250, 250, 90, 90, 90, 90, 90, 90, 90],
                                    columns: [

                                        {
                                            title: i18n.t('static.product.productcategory'),
                                            type: 'dropdown',
                                            source: productCategoryList
                                        },
                                        {
                                            title: i18n.t('static.planningunit.planningunit'),
                                            type: 'autocomplete',
                                            source: list,
                                            filter: this.dropdownFilter
                                        },
                                        {
                                            title: i18n.t('static.report.reorderFrequencyInMonths'),
                                            type: 'numeric',
                                            textEditor: true,
                                            decimal: '.',
                                            mask: '#,##.00',
                                            disabledMaskOnEdition: true

                                        },
                                        {
                                            title: i18n.t('static.supplyPlan.minMonthsOfStock'),
                                            type: 'numeric',
                                            textEditor: true,
                                            decimal: '.',
                                            mask: '#,##.00',
                                            disabledMaskOnEdition: true
                                        },
                                        {
                                            title: i18n.t('static.program.monthfutureamc'),
                                            type: 'numeric',
                                            textEditor: true,
                                            decimal: '.',
                                            mask: '#,##.00',
                                            disabledMaskOnEdition: true
                                        },
                                        {
                                            title: i18n.t('static.program.monthpastamc'),
                                            type: 'numeric',
                                            textEditor: true,
                                            decimal: '.',
                                            mask: '#,##.00',
                                            disabledMaskOnEdition: true
                                        },
                                        {
                                            title: i18n.t('static.report.procurmentAgentLeadTimeReport'),
                                            type: 'numeric',
                                            textEditor: true,
                                            decimal: '.',
                                            mask: '#,##.00',
                                            disabledMaskOnEdition: true
                                        },
                                        {
                                            title: i18n.t('static.supplyPlan.shelfLife'),
                                            type: 'numeric',
                                            textEditor: true,
                                            decimal: '.',
                                            mask: '#,##.00',
                                            disabledMaskOnEdition: true
                                        },
                                        {
                                            title: i18n.t('static.procurementAgentPlanningUnit.catalogPrice'),
                                            type: 'numeric',
                                            textEditor: true,
                                            decimal: '.',
                                            mask: '#,##.00',
                                            disabledMaskOnEdition: true
                                        },
                                        // {
                                        //     title: 'Batch Required',
                                        //     type: 'checkbox'
                                        // }

                                    ],
                                    pagination: false,
                                    search: true,
                                    columnSorting: true,
                                    tableOverflow: true,
                                    wordWrap: true,
                                    parseFormulas: true,
                                    filters: true,
                                    // paginationOptions: [10, 25, 50, 100],
                                    // position: 'top',
                                    allowInsertColumn: false,
                                    allowManualInsertColumn: false,
                                    allowDeleteRow: true,
                                    onchange: this.changed,
                                    // oneditionend: this.onedit,
                                    copyCompatibility: true,
                                    allowManualInsertRow: false,
                                    text: {
                                        showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                        show: '',
                                        entries: '',
                                    },
                                    onload: this.loaded,
                                    oneditionend: this.oneditionend,
                                    license: JEXCEL_PRO_KEY,
                                    contextMenu: function (obj, x, y, e) {
                                        var items = [];
                                        //Add consumption batch info


                                        if (y == null) {
                                            // Insert a new column
                                            if (obj.options.allowInsertColumn == true) {
                                                items.push({
                                                    title: obj.options.text.insertANewColumnBefore,
                                                    onclick: function () {
                                                        obj.insertColumn(1, parseInt(x), 1);
                                                    }
                                                });
                                            }

                                            if (obj.options.allowInsertColumn == true) {
                                                items.push({
                                                    title: obj.options.text.insertANewColumnAfter,
                                                    onclick: function () {
                                                        obj.insertColumn(1, parseInt(x), 0);
                                                    }
                                                });
                                            }

                                            // Delete a column
                                            // if (obj.options.allowDeleteColumn == true) {
                                            //     items.push({
                                            //         title: obj.options.text.deleteSelectedColumns,
                                            //         onclick: function () {
                                            //             obj.deleteColumn(obj.getSelectedColumns().length ? undefined : parseInt(x));
                                            //         }
                                            //     });
                                            // }

                                            // Rename column
                                            // if (obj.options.allowRenameColumn == true) {
                                            //     items.push({
                                            //         title: obj.options.text.renameThisColumn,
                                            //         onclick: function () {
                                            //             obj.setHeader(x);
                                            //         }
                                            //     });
                                            // }

                                            // Sorting
                                            if (obj.options.columnSorting == true) {
                                                // Line
                                                items.push({ type: 'line' });

                                                items.push({
                                                    title: obj.options.text.orderAscending,
                                                    onclick: function () {
                                                        obj.orderBy(x, 0);
                                                    }
                                                });
                                                items.push({
                                                    title: obj.options.text.orderDescending,
                                                    onclick: function () {
                                                        obj.orderBy(x, 1);
                                                    }
                                                });
                                            }
                                        } else {
                                            // Insert new row before
                                            if (obj.options.allowInsertRow == true) {
                                                items.push({
                                                    title: i18n.t('static.common.insertNewRowBefore'),
                                                    onclick: function () {
                                                        var data = [];
                                                        data[0] = "";
                                                        data[1] = "";
                                                        data[2] = "";
                                                        data[3] = "";
                                                        data[4] = "";
                                                        data[5] = "";
                                                        data[6] = "";
                                                        data[7] = "";
                                                        data[8] = "";
                                                        // this.el.insertRow();
                                                        // var json = this.el.getJson();
                                                        obj.insertRow(data, parseInt(y), 1);
                                                    }.bind(this)
                                                });
                                            }
                                            // after
                                            if (obj.options.allowInsertRow == true) {
                                                items.push({
                                                    title: i18n.t('static.common.insertNewRowAfter'),
                                                    onclick: function () {
                                                        var data = [];
                                                        data[0] = "";
                                                        data[1] = "";
                                                        data[2] = "";
                                                        data[3] = "";
                                                        data[4] = "";
                                                        data[5] = "";
                                                        data[6] = "";
                                                        data[7] = "";
                                                        data[8] = "";
                                                        obj.insertRow(data, parseInt(y));
                                                        // obj.insertRow(parseInt(y), 1);
                                                    }.bind(this)
                                                });
                                            }
                                            // Delete a row
                                            if (obj.options.allowDeleteRow == true) {
                                                // region id
                                                // if (obj.getRowData(y)[8] == 0) {
                                                items.push({
                                                    title: i18n.t("static.common.deleterow"),
                                                    onclick: function () {
                                                        obj.deleteRow(parseInt(y));
                                                    }
                                                });
                                                // }
                                            }

                                            if (x) {
                                                if (obj.options.allowComments == true) {
                                                    items.push({ type: 'line' });

                                                    // var title = obj.records[y][x].getAttribute('title') || '';

                                                    // items.push({
                                                    //     title: title ? obj.options.text.editComments : obj.options.text.addComments,
                                                    //     onclick: function () {
                                                    //         obj.setComments([x, y], prompt(obj.options.text.comments, title));
                                                    //     }
                                                    // });

                                                    // if (title) {
                                                    //     items.push({
                                                    //         title: obj.options.text.clearComments,
                                                    //         onclick: function () {
                                                    //             obj.setComments([x, y], '');
                                                    //         }
                                                    //     });
                                                    // }
                                                }
                                            }
                                        }

                                        // Line
                                        items.push({ type: 'line' });

                                        // Save
                                        // if (obj.options.allowExport) {
                                        //     items.push({
                                        //         title: i18n.t('static.supplyPlan.exportAsCsv'),
                                        //         shortcut: 'Ctrl + S',
                                        //         onclick: function () {
                                        //             obj.download(true);
                                        //         }
                                        //     });
                                        // }

                                        return items;
                                    }.bind(this)
                                };
                                var elVar = jexcel(document.getElementById("mapPlanningUnit"), options);
                                this.el = elVar;
                                this.setState({ mapPlanningUnitEl: elVar, loading: false });
                            } else {
                                list = [];
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
                    productCategoryList = []
                    this.setState({
                        message: response.data.messageCode, loading: false
                    })
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

    }

    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        var rowData = elInstance.getRowData(y);

        if (x == 2 && !isNaN(rowData[2]) && rowData[2].toString().indexOf('.') != -1) {
            console.log("RESP---------", parseFloat(rowData[2]));
            elInstance.setValueFromCoords(2, y, parseFloat(rowData[2]), true);
        } else if (x == 3 && !isNaN(rowData[3]) && rowData[3].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(3, y, parseFloat(rowData[3]), true);
        } else if (x == 4 && !isNaN(rowData[4]) && rowData[4].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(4, y, parseFloat(rowData[4]), true);
        } else if (x == 5 && !isNaN(rowData[5]) && rowData[5].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(5, y, parseFloat(rowData[5]), true);
        } else if (x == 6 && !isNaN(rowData[6]) && rowData[6].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(6, y, parseFloat(rowData[6]), true);
        } else if (x == 7 && !isNaN(rowData[7]) && rowData[7].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(7, y, parseFloat(rowData[7]), true);
        } else if (x == 8 && !isNaN(rowData[8]) && rowData[8].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(8, y, parseFloat(rowData[8]), true);
        }

    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionWithoutPagination(instance);
        var asterisk = document.getElementsByClassName("resizable")[0];
        var tr = asterisk.firstChild;
        tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[5].classList.add('AsteriskTheadtrTd');
        tr.children[6].classList.add('AsteriskTheadtrTd');
        tr.children[7].classList.add('AsteriskTheadtrTd');
        tr.children[8].classList.add('AsteriskTheadtrTd');
        tr.children[9].classList.add('AsteriskTheadtrTd');
        tr.children[3].title = i18n.t("static.message.reorderFrequency")
    }

    myFunction() {
        var json = this.el.getJson(null, false);
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
                reorderFrequencyInMonths: this.el.getValue(`C${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                minMonthsOfStock: this.el.getValue(`D${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                monthsInFutureForAmc: this.el.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                monthsInPastForAmc: this.el.getValue(`F${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                localProcurementLeadTime: this.el.getValue(`G${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                shelfLife: this.el.getValue(`H${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                catalogPrice: this.el.getValue(`I${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
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
                <AuthenticationServiceComponent history={this.props.history} />
                <h4 className="red">{this.props.message}</h4>
                <div className="table-responsive" style={{ display: this.state.loading ? "none" : "block" }} >

                    <div id="mapPlanningUnit" className="RowheightForjexceladdRow consumptionDataEntryTable">
                    </div>
                </div>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

}