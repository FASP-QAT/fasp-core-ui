import React, { Component } from "react";
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Badge, Col, Row, Form, FormFeedback

} from 'reactstrap';

import ProgramService from "../../api/ProgramService";
import AuthenticationService from '../Common/AuthenticationService.js';
import PlanningUnitService from "../../api/PlanningUnitService";
import i18n from '../../i18n';
import ProductCategoryServcie from '../../api/PoroductCategoryService.js';
import { jExcelLoadedFunction } from "../../CommonComponent/JExcelCommonFunctions";
const entityname = i18n.t('static.dashboard.programPlanningUnit');



class AddprogramPlanningUnit extends Component {
    constructor(props) {
        super(props);
        let rows = [];
        // if (this.props.location.state.programPlanningUnit.length > 0) {
        //     rows = this.props.location.state.programPlanningUnit;
        // }
        this.state = {
            // programPlanningUnit: this.props.location.state.programPlanningUnit,
            programPlanningUnit: [],
            planningUnitId: '',
            planningUnitName: '',
            reorderFrequencyInMonths: '',
            minMonthsOfStock: '',
            monthsInFutureForAmc: '',
            monthsInPastForAmc: '',
            rows: rows,
            programList: [],
            planningUnitList: [],
            rowErrorMessage: '',
            programPlanningUnitId: 0,
            isNew: true,
            programId: this.props.match.params.programId,
            updateRowStatus: 0,
            lang: localStorage.getItem('lang'),
            batchNoRequired: false,
            localProcurementLeadTime: '',
            isValidData: true

        }
        // this.addRow = this.addRow.bind(this);
        // this.handleRemoveSpecificRow = this.handleRemoveSpecificRow.bind(this);
        this.submitForm = this.submitForm.bind(this);
        // this.setTextAndValue = this.setTextAndValue.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        // this.enableRow = this.enableRow.bind(this);
        // this.disableRow = this.disableRow.bind(this);
        // this.updateRow = this.updateRow.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.addRowInJexcel = this.addRowInJexcel.bind(this);
        this.changed = this.changed.bind(this);
         this.dropdownFilter = this.dropdownFilter.bind(this);
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
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    componentDidMount() {
        var list = [];
        var productCategoryList = [];
        // var realmId = document.getElementById("realmId").value;

        AuthenticationService.setupAxiosInterceptors();
        ProductCategoryServcie.getProductCategoryListByRealmId(1)
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


                                AuthenticationService.setupAxiosInterceptors();
                                ProgramService.getProgramPlaningUnitListByProgramId(this.state.programId)
                                    .then(response => {
                                        if (response.status == 200) {
                                            // alert("hi");
                                            let myReasponse = response.data;
                                            var productDataArr = []
                                            // if (myReasponse.length > 0) {
                                            this.setState({ rows: myReasponse });
                                            var data = [];
                                            if (myReasponse.length != 0) {
                                                for (var j = 0; j < myReasponse.length; j++) {
                                                    console.log("myReasponse[j]---",myReasponse[j]);
                                                    data = [];
                                                    data[0] = myReasponse[j].productCategory.id;
                                                    data[1] = myReasponse[j].planningUnit.id;
                                                    data[2] = myReasponse[j].reorderFrequencyInMonths;
                                                    data[3] = myReasponse[j].minMonthsOfStock;
                                                    data[4] = myReasponse[j].monthsInFutureForAmc;
                                                    data[5] = myReasponse[j].monthsInPastForAmc;
                                                    data[6] = myReasponse[j].localProcurementLeadTime;
                                                    data[7] = myReasponse[j].shelfLife;
                                                    data[8] = myReasponse[j].catalogPrice;
                                                    data[9] = myReasponse[j].programPlanningUnitId;
                                                    data[10] = myReasponse[j].active;
                                                    data[11] = 0;
                                                    data[12] = myReasponse[j].program.id;
                                                    productDataArr.push(data);
                                                }
                                            }

                                            if (productDataArr.length == 0) {
                                                data = [];
                                                data[0] = 0;
                                                data[1] = "";
                                                data[2] = "";
                                                data[3] = "";
                                                data[4] = "";
                                                data[5] = "";
                                                data[6] = "";
                                                data[7] = "";
                                                data[8] = 0;
                                                data[9] = 0;
                                                data[10] = 1;
                                                data[11] = 1;
                                                data[12] = this.props.match.params.programId;
                                                productDataArr[0] = data;
                                            }


                                            this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
                                            this.el.destroy();
                                            var json = [];
                                            var data = productDataArr;
                                            var options = {
                                                data: data,
                                                columnDrag: true,
                                                colWidths: [290, 290, 100, 100, 100, 100, 100, 100, 100, 100, 100],
                                                columns: [
                                                    {
                                                        title: 'Product Category',
                                                        type: 'dropdown',
                                                        source: productCategoryList
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
                                                        title: 'Months In Future For AMC',
                                                        type: 'number'
                                                    },
                                                    {
                                                        title: 'Months In Past For AMC',
                                                        type: 'number'
                                                    },
                                                    {
                                                        title: 'Local Procurment Lead Time(Months)',
                                                        type: 'number'
                                                    },
                                                    {
                                                        title: 'Shelf Life(Months)',
                                                        type: 'number'
                                                    },
                                                    {
                                                        title: 'Catalog Price (USD)',
                                                        type: 'number'
                                                    },
                                                    {
                                                        title: 'Id',
                                                        type: 'hidden'
                                                    },
                                                    {
                                                        title: 'Active',
                                                        type: 'hidden'
                                                    },
                                                    {
                                                        title: 'Changed Flag',
                                                        type: 'hidden'
                                                    },
                                                    {
                                                        title: 'ProgramId',
                                                        type: 'hidden'
                                                    }


                                                ],
                                                pagination: 10,
                                                search: true,
                                                columnSorting: true,
                                                tableOverflow: true,
                                                wordWrap: true,
                                                paginationOptions: [10, 25, 50, 100],
                                                position: 'top',
                                                allowInsertColumn: false,
                                                allowManualInsertColumn: false,
                                                allowDeleteRow: true,
                                                onchange: this.changed,
                                                oneditionend: this.onedit,
                                                copyCompatibility: true,
                                                text: {
                                                    showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                                    show: '',
                                                    entries: '',
                                                },
                                                onload: this.loaded,
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
                                                                    data[0] = 0;
                                                                    data[1] = "";
                                                                    data[2] = "";
                                                                    data[3] = "";
                                                                    data[4] = "";
                                                                    data[5] = "";
                                                                    data[6] = "";
                                                                    data[7] = "";
                                                                    data[8] = 0;
                                                                    data[9] = 0;
                                                                    data[10] = 1;
                                                                    data[11] = 1;
                                                                    data[12] = this.props.match.params.programId;
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
                                                                    data[0] = 0;
                                                                    data[1] = "";
                                                                    data[2] = "";
                                                                    data[3] = "";
                                                                    data[4] = "";
                                                                    data[5] = "";
                                                                    data[6] = "";
                                                                    data[7] = "";
                                                                    data[8] = 0;
                                                                    data[9] = 0;
                                                                    data[10] = 1;
                                                                    data[11] = 1;
                                                                    data[12] = this.props.match.params.programId;
                                                                    obj.insertRow(data, parseInt(y));
                                                                }.bind(this)
                                                            });
                                                        }
                                                        // Delete a row
                                                        if (obj.options.allowDeleteRow == true) {
                                                            // region id
                                                            if (obj.getRowData(y)[9] == 0) {
                                                                items.push({
                                                                    title: obj.options.text.deleteSelectedRows,
                                                                    onclick: function () {
                                                                        obj.deleteRow(obj.getSelectedRows().length ? undefined : parseInt(y));
                                                                    }
                                                                });
                                                            }
                                                        }

                                                        if (x) {
                                                            if (obj.options.allowComments == true) {
                                                                items.push({ type: 'line' });

                                                                var title = obj.records[y][x].getAttribute('title') || '';

                                                                items.push({
                                                                    title: title ? obj.options.text.editComments : obj.options.text.addComments,
                                                                    onclick: function () {
                                                                        obj.setComments([x, y], prompt(obj.options.text.comments, title));
                                                                    }
                                                                });

                                                                if (title) {
                                                                    items.push({
                                                                        title: obj.options.text.clearComments,
                                                                        onclick: function () {
                                                                            obj.setComments([x, y], '');
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        }
                                                    }

                                                    // Line
                                                    items.push({ type: 'line' });

                                                    // Save
                                                    if (obj.options.allowExport) {
                                                        items.push({
                                                            title: i18n.t('static.supplyPlan.exportAsCsv'),
                                                            shortcut: 'Ctrl + S',
                                                            onclick: function () {
                                                                obj.download(true);
                                                            }
                                                        });
                                                    }

                                                    return items;
                                                }.bind(this)
                                            };
                                            var elVar = jexcel(document.getElementById("mapPlanningUnit"), options);
                                            this.el = elVar;
                                            this.setState({ mapPlanningUnitEl: elVar });
                                            // }
                                        } else {
                                            this.setState({
                                                message: response.data.messageCode
                                            })
                                        }
                                    }).catch(
                                        error => {
                                            if (error.message === "Network Error") {
                                                this.setState({ message: error.message });
                                            } else {
                                                switch (error.response ? error.response.status : "") {
                                                    case 500:
                                                    case 401:
                                                    case 404:
                                                    case 406:
                                                    case 412:
                                                        this.setState({ message: error.response.data.messageCode });
                                                        break;
                                                    default:
                                                        this.setState({ message: 'static.unkownError' });
                                                        console.log("Error code unkown");
                                                        break;
                                                }
                                            }
                                        }
                                    );

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

    addRowInJexcel = function () {
        var json = this.el.getJson();
        var data = [];
        data[0] = 0;
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = "";
        data[5] = "";
        data[6] = "";
        data[7] = "";
        data[8] = 0;
        data[9] = 0;
        data[10] = 1;
        data[11] = 1;
        data[12] = this.props.match.params.programId;
        this.el.insertRow(
            data,0,1
        );
    }

    checkValidation() {
        var valid = true;
        var json = this.el.getJson();
        for (var y = 0; y < json.length; y++) {


            var value = this.el.getValueFromCoords(11, y);
            if (parseInt(value) == 1) {
                // console.log("PROBLEM");


                var col = ("A").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(0, y);
                // console.log("value-----", value);
                if (value == "") {
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
                // console.log("value-----", value);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

                //Reorder frequency
                var col = ("C").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(2, y);
                var reg = /^[0-9\b]+$/;
                // console.log("value-----", value);
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

                //Min months of stock
                var col = ("D").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(3, y);
                var reg = /^[0-9\b]+$/;
                // console.log("value-----", value);
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

                //Months in future for AMC
                var col = ("E").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(4, y);
                var reg = /^[0-9\b]+$/;
                // console.log("value-----", value);
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

                //Months in past for AMC
                var col = ("F").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(5, y);
                var reg = /^[0-9\b]+$/;
                // console.log("value-----", value);
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
                var col = ("G").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(6, y);
                var reg = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;
                // console.log("value-----", value);
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


                //Shelf life
                var col = ("H").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(7, y);
                var reg = /^[0-9\b]+$/;
                // console.log("value-----", value);
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


                //Catalog price
                var col = ("I").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(8, y);
                var reg = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;
                // console.log("value-----", value);
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

            }

        }
        return valid;
    }

    changed = function (instance, cell, x, y, value) {
        var valid = true;
        //Product category
        console.log("changed 1");
        if (x == 0) {
            console.log("changed 2");
            var col = ("A").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(11, y, 1, true);
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
                this.el.setValueFromCoords(11, y, 1, true);
                valid = true;
            }
            var columnName = jexcel.getColumnNameFromId([parseInt(x) + 1, y]);
            instance.jexcel.setValue(columnName, '');
        }

        //Planning Unit
        if (x == 1) {
            console.log("changed 3");
            var json = this.el.getJson();
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(11, y, 1, true);
                valid = false;
            } else {
                for (var i = 0; i < json.length; i++) {
                    var map = new Map(Object.entries(json[i]));
                    var planningUnitValue = map.get("1");
                    if (planningUnitValue == value && y != i) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, "Planning Unit aready exist");
                        i = json.length;
                        this.el.setValueFromCoords(11, y, 1, true);
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                        this.el.setValueFromCoords(11, y, 1, true);
                        valid = true;
                    }
                }
            }
            // var columnName = jexcel.getColumnNameFromId([x + 1, y]);
            // instance.jexcel.setValue(columnName, '');
        }

        //Reorder frequency
        if (x == 2) {
            console.log("changed 4");
            var reg = /^[0-9\b]+$/;
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(11, y, 1, true);
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = true;
                }
            }
        }
        //Min months of stock
        if (x == 3) {
            console.log("changed 5");
            var reg = /^[0-9\b]+$/;
            var col = ("D").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(11, y, 1, true);
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = true;
                }
            }
        }
        //Months in future for AMC
        if (x == 4) {
            console.log("changed 6");
            var reg = /^[0-9\b]+$/;
            var col = ("E").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(11, y, 1, true);
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = true;
                }
            }
        }
        //Months in past for AMC
        if (x == 5) {
            console.log("changed 7");
            var reg = /^[0-9\b]+$/;
            var col = ("F").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(11, y, 1, true);
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = true;
                }
            }
        }
        //Local procurement lead time
        if (x == 6) {
            console.log("changed 8");
            var reg = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;
            var col = ("G").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(11, y, 1, true);
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = true;
                }
            }
        }
        //Shelf life
        if (x == 7) {
            console.log("changed 9");
            var reg = /^[0-9\b]+$/;
            var col = ("H").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(11, y, 1, true);
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = true;
                }
            }
        }
        //Catalog price
        if (x == 8) {
            console.log("changed 10");
            var reg = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;
            var col = ("I").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(11, y, 1, true);
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = true;
                }
            }
        }
        this.setState({ isValidData: valid });
    }




    submitForm() {

        var validation = this.checkValidation();
        // var validation = this.state.isValidData;
        if (validation == true) {
            // console.log("validation---true-->");

            var json = this.el.getJson();
            console.log("Rows on submit", json)
            var planningUnitArray = []
            console.log("json.length---" + json.length);
            for (var i = 0; i < json.length; i++) {
                var map = new Map(Object.entries(json[i]));
                console.log("(map.get(11)---" + map.get("11"));
                if (map.get("11") == 1) {
                    if (map.get("9") == "") {
                        var pId = 0;
                    } else {
                        var pId = map.get("9");
                    }
                    var planningUnitJson = {
                        programPlanningUnitId: pId,
                        program: {
                            id: map.get("12")
                        },
                        planningUnit: {
                            id: map.get("1"),
                        },
                        reorderFrequencyInMonths: map.get("2"),
                        minMonthsOfStock: map.get("3"),
                        monthsInFutureForAmc: map.get("4"),
                        monthsInPastForAmc: map.get("5"),
                        localProcurementLeadTime: map.get("6"),
                        shelfLife: map.get("7"),
                        catalogPrice: map.get("8"),
                        active: map.get("10")
                    }
                    planningUnitArray.push(planningUnitJson);
                }

            }
            AuthenticationService.setupAxiosInterceptors();
            console.log("SUBMIT----", planningUnitArray);
            ProgramService.addprogramPlanningUnitMapping(planningUnitArray)
                .then(response => {
                    if (response.status == "200") {
                        this.props.history.push(`/program/listProgram/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                    } else {
                        this.setState({
                            message: response.data.messageCode
                        },
                            () => {
                                this.hideSecondComponent();
                            })
                    }

                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({ message: error.message });
                        } else {
                            switch (error.response ? error.response.status : "") {
                                case 500:
                                case 401:
                                case 404:
                                case 406:
                                case 412:
                                    this.setState({ message: error.response.data.messageCode });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError' });
                                    console.log("Error code unkown");
                                    break;
                            }
                        }
                    }
                );

        } else {
            console.log("Something went wrong");
        }
    }


    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    render() {

        return (
            <div className="animated fadeIn">
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message)}</h5>

                <div style={{ flexBasis: 'auto' }}>
                    <Card>
                        {/* <CardHeader>
                                <strong>{i18n.t('static.program.mapPlanningUnit')}</strong>
                            </CardHeader> */}
                        <CardBody className="p-0">
                            <Col sm={12} md={12}>
                                <h4 className="red">{this.props.message}</h4>
                                <div className="table-responsive" >
                                    <div id="mapPlanningUnit">
                                    </div>
                                </div>
                            </Col>
                        </CardBody>
                        <CardFooter>
                            <FormGroup>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                {this.state.isValidData && <Button type="submit" size="md" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>}
                                &nbsp;
                                    <Button color="info" size="md" className="float-right mr-1" type="button" onClick={this.addRowInJexcel}> <i className="fa fa-plus"></i> Add Row</Button>
                                &nbsp;
                                </FormGroup>
                        </CardFooter>
                    </Card>
                </div>

            </div>

        );
    }
    cancelClicked() {
        this.props.history.push(`/program/listProgram/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

}
export default AddprogramPlanningUnit;