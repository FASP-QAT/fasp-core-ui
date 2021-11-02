import React, { Component } from 'react';
import jexcel from 'jspreadsheet-pro';
import "../../../node_modules/jspreadsheet-pro/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import ProcurementAgentService from "../../api/ProcurementAgentService";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Badge, Col, Row, Form, FormFeedback

} from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import ProcurementUnitService from "../../api/ProcurementUnitService";
import getLabelText from '../../CommonComponent/getLabelText';
import i18n from '../../i18n';
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions';
import { JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_DECIMAL_LEAD_TIME, DECIMAL_NO_REGEX, INTEGER_NO_REGEX, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
const entityname = i18n.t('static.dashboard.procurementAgentProcurementUnit')



export default class AddProcurementAgentProcurementUnit extends Component {
    constructor(props) {
        super(props);
        let rows = [];
        // if (this.props.location.state.procurementAgentProcurementUnit.length > 0) {
        //     rows = this.props.location.state.procurementAgentProcurementUnit;
        // }
        this.state = {
            // procurementAgentProcurementUnit: this.props.location.state.procurementAgentProcurementUnit,
            procurementUnitId: '',
            procurementUnitName: '',
            skuCode: '',
            vendorPrice: '',
            approvedToShippedLeadTime: '',
            gtin: '',
            procurementAgentProcurementUnitId: 0,
            isNew: true,
            rows: rows,
            procurementAgentList: [],
            procurementUnitList: [],
            rowErrorMessage: '',
            lang: localStorage.getItem('lang'),
            procurementAgentId: this.props.match.params.procurementAgentId,
            updateRowStatus: 0,
            loading: true,
            isValidData: true
        }
        // this.addRow = this.addRow.bind(this);
        // this.deleteLastRow = this.deleteLastRow.bind(this);
        // this.handleRemoveSpecificRow = this.handleRemoveSpecificRow.bind(this);
        // this.setTextAndValue = this.setTextAndValue.bind(this);
        // this.enableRow = this.enableRow.bind(this);
        // this.disableRow = this.disableRow.bind(this);
        // this.updateRow = this.updateRow.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.addRowInJexcel = this.addRowInJexcel.bind(this);
        this.changed = this.changed.bind(this);
        this.checkDuplicatePlanningUnit = this.checkDuplicatePlanningUnit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
    }

    addRowInJexcel = function () {
        // $('#my').jexcel('insertRow', [ 'Pears', 10, 0.59, '=B2*C2' ], 1);
        // this.el.insertRow();
        // var json = this.el.getJson();
        var json = this.el.getJson(null, false);
        var data = [];
        data[0] = this.props.match.params.procurementAgentId;
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = "";
        data[5] = "";
        data[6] = 0;
        data[7] = 1;
        this.el.insertRow(
            data
        );
    }

    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance.jexcel).getValue(`G${parseInt(data[i].y) + 1}`, true);
                if (index == "" || index == null || index == undefined) {
                    (instance.jexcel).setValueFromCoords(0, data[i].y, this.props.match.params.procurementAgentId, true);
                    (instance.jexcel).setValueFromCoords(6, data[i].y, 0, true);
                    (instance.jexcel).setValueFromCoords(7, data[i].y, 1, true);
                    z = data[i].y;
                }
            }
        }
    }

    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }
    capitalize(event) {
        if (event.target.name === "skuCode") {
            let { skuCode } = this.state
            skuCode = event.target.value.toUpperCase()
            this.setState({
                skuCode: skuCode
            })
        } else if (event.target.name === "gtin") {
            let { gtin } = this.state
            gtin = event.target.value.toUpperCase()
            this.setState({
                gtin: gtin
            })

        }
    }

    checkDuplicatePlanningUnit = function () {
        var tableJson = this.el.getJson(null, false);
        let count = 0;

        let tempArray = tableJson;
        console.log('hasDuplicate------', tempArray);

        var hasDuplicate = false;
        tempArray.map(v => parseInt(v[Object.keys(v)[1]])).sort().sort((a, b) => {
            if (a === b) hasDuplicate = true
        })
        console.log('hasDuplicate', hasDuplicate);
        if (hasDuplicate) {
            this.setState({
                message: i18n.t('static.procurementUnit.duplicateProcurementUnit'),
                changedFlag: 0,

            },
                () => {
                    this.hideSecondComponent();
                })
            return false;
        } else {
            return true;
        }


    }

    submitForm() {

        var duplicateValidation = this.checkDuplicatePlanningUnit();
        var validation = this.checkValidation();

        if (validation == true && duplicateValidation == true) {
            this.setState({
                loading: false
            })
            var json = this.el.getJson(null, false);
            console.log("Rows on submit", json)
            var procurementUnitArray = []
            for (var i = 0; i < json.length; i++) {
                var map = new Map(Object.entries(json[i]));
                console.log("D-------------->Map--------", map);
                if (map.get("7") == 1) {
                    if (map.get("6") == "") {
                        var pId = 0;
                    } else {
                        var pId = map.get("6");
                    }
                    var procurementUnitJson = {
                        procurementAgentProcurementUnitId: pId,
                        procurementAgent: {
                            id: map.get("0")
                        },
                        procurementUnit: {
                            id: map.get("1"),
                        },
                        skuCode: map.get("2"),
                        vendorPrice: this.el.getValue(`D${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        approvedToShippedLeadTime: this.el.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        gtin: map.get("5")
                    }
                    procurementUnitArray.push(procurementUnitJson);
                }

            }
            console.log("procurementUnitArray----->", procurementUnitArray);
            // AuthenticationService.setupAxiosInterceptors();
            ProcurementAgentService.addprocurementAgentProcurementUnitMapping(procurementUnitArray)
                .then(response => {
                    if (response.status == "200") {
                        this.props.history.push(`/procurementAgent/listProcurementAgent/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))

                    } else {
                        this.setState({
                            message: response.data.messageCode, loading: false
                        },
                            () => {
                                this.hideSecondComponent();
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
        } else {
            console.log("Something went wrong");
        }
    }

    checkValidation() {
        var valid = true;
        var json = this.el.getJson(null, false);
        console.log("json.length-------", json.length);
        for (var y = 0; y < json.length; y++) {
            // var col = ("L").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(7, y);
            if (parseInt(value) == 1) {

                var col = ("B").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(1, y);
                console.log("value-----", value);
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


                // var col = ("D").concat(parseInt(y) + 1);
                // var value = this.el.getValueFromCoords(3, y);
                // var reg = DECIMAL_NO_REGEX;
                // // console.log("---------VAL----------", value);
                // if (value == "" || isNaN(Number.parseFloat(value)) || value < 0) {
                //     this.el.setStyle(col, "background-color", "transparent");
                //     this.el.setStyle(col, "background-color", "yellow");
                //     valid = false;
                //     if (isNaN(Number.parseInt(value)) || value < 0) {
                //         this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                //     } else {
                //         this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                //     }
                // } else {
                //     this.el.setStyle(col, "background-color", "transparent");
                //     this.el.setComments(col, "");
                // }


                // var col = ("E").concat(parseInt(y) + 1);
                // var value = this.el.getValueFromCoords(4, y);
                // if (value == "") {
                //     this.el.setStyle(col, "background-color", "transparent");
                //     this.el.setStyle(col, "background-color", "yellow");
                //     this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                //     valid = false;
                // } else {
                //     if (isNaN(Number.parseInt(value)) || value < 0) {
                //         this.el.setStyle(col, "background-color", "transparent");
                //         this.el.setStyle(col, "background-color", "yellow");
                //         this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                //         valid = false;
                //     } else {
                //         this.el.setStyle(col, "background-color", "transparent");
                //         this.el.setComments(col, "");
                //     }
                // }

                var col = ("D").concat(parseInt(y) + 1);
                var value = this.el.getValue(`D${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    // if (isNaN(parseInt(value)) || !(reg.test(value))) {
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

                var col = ("E").concat(parseInt(y) + 1);
                var value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = JEXCEL_DECIMAL_LEAD_TIME;
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    // if (isNaN(parseInt(value)) || !(reg.test(value))) {
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


                // var col = ("F").concat(parseInt(y) + 1);
                // var value = this.el.getValueFromCoords(5, y);
                // if (value == "") {
                //     this.el.setStyle(col, "background-color", "transparent");
                //     this.el.setStyle(col, "background-color", "yellow");
                //     this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                //     valid = false;
                // } else {
                //     if (isNaN(parseInt(value)) || !(reg.test(value))) {
                //         this.el.setStyle(col, "background-color", "transparent");
                //         this.el.setStyle(col, "background-color", "yellow");
                //         this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                //         valid = false;
                //     } else {
                //         this.el.setStyle(col, "background-color", "transparent");
                //         this.el.setComments(col, "");
                //     }
                // }

            }
        }
        return valid;
    }



    changed = function (instance, cell, x, y, value) {
        this.setState({
            changedFlag: 1
        })

        if (x == 1) {
            var json = this.el.getJson(null, false);
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
            // var json = this.el.getJson();
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

        // if (x == 3) {
        //     var reg = /^[0-9\b]+$/;
        //     var col = ("D").concat(parseInt(y) + 1);
        //     if (value == "") {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setComments(col, "");
        //         this.el.setValueFromCoords(7, y, 1, true);

        //         // this.el.setStyle(col, "background-color", "transparent");
        //         // this.el.setStyle(col, "background-color", "yellow");
        //         // this.el.setComments(col, i18n.t('static.label.fieldRequired'));
        //         // valid = false;
        //     } else {
        //         if (isNaN(Number.parseInt(value)) || value < 0) {
        //             this.el.setStyle(col, "background-color", "transparent");
        //             this.el.setStyle(col, "background-color", "yellow");
        //             this.el.setComments(col, i18n.t('static.message.invalidnumber'));

        //         } else {
        //             this.el.setStyle(col, "background-color", "transparent");
        //             this.el.setComments(col, "");

        //         }
        //     }
        // }

        // if (x == 4) {
        //     var reg = /^[0-9\b]+$/;
        //     var col = ("E").concat(parseInt(y) + 1);
        //     if (value == "") {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, i18n.t('static.label.fieldRequired'));

        //     } else {
        //         if (isNaN(Number.parseInt(value)) || value < 0) {
        //             this.el.setStyle(col, "background-color", "transparent");
        //             this.el.setStyle(col, "background-color", "yellow");
        //             this.el.setComments(col, i18n.t('static.message.invalidnumber'));

        //         } else {
        //             this.el.setStyle(col, "background-color", "transparent");
        //             this.el.setComments(col, "");

        //         }
        //     }
        // }

        if (x == 3) {
            var col = ("D").concat(parseInt(y) + 1);
            value = this.el.getValue(`D${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = /^[0-9\b]+$/;
            var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
            if (value != "") {
                // if (isNaN(parseInt(value)) || !(reg.test(value))) {
                if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            }
        }

        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = /^[0-9\b]+$/;
            var reg = JEXCEL_DECIMAL_LEAD_TIME;
            if (value != "") {
                // if (isNaN(parseInt(value)) || !(reg.test(value))) {
                if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            }
        }


        if (x == 5) {
            // var json = this.el.getJson();
            var col = ("F").concat(parseInt(y) + 1);
            if (value == "") {
                // this.el.setStyle(col, "background-color", "transparent");
                // this.el.setStyle(col, "background-color", "yellow");
                // this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                // this.el.setValueFromCoords(7, y, 1, true);
                // valid = false;
            } else {
                // this.el.setStyle(col, "background-color", "transparent");
                // this.el.setComments(col, "");
                // this.el.setValueFromCoords(7, y, 1, true);
                // valid = true;
            }
        }

        // this.setState({ isValidData: valid });
    }

    onedit = function (instance, cell, x, y, value) {
        this.el.setValueFromCoords(7, y, 1, true);
    }.bind(this);

    filterProcurmentUnitList = function (instance, cell, c, r, source) {
        return this.state.procurmentUnitListJexcel.filter(c => c.active.toString() == "true");
    }.bind(this);

    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        var rowData = elInstance.getRowData(y);

        if (x == 3 && !isNaN(rowData[3]) && rowData[3].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(3, y, parseFloat(rowData[3]), true);
        } else if (x == 4 && !isNaN(rowData[4]) && rowData[4].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(4, y, parseFloat(rowData[4]), true);
        }
        this.el.setValueFromCoords(7, y, 1, true);
    }

    componentDidMount() {
        var procurmentAgentListJexcel = [];
        var procurmentUnitListJexcel = [];

        // AuthenticationService.setupAxiosInterceptors();
        ProcurementAgentService.getProcurementAgentProcurementUnitList(this.state.procurementAgentId)
            .then(response => {
                if (response.status == 200) {
                    // console.log("first---->", response.data);
                    let myResponse = response.data;
                    if (myResponse.length > 0) {
                        this.setState({ rows: myResponse });
                    }
                    // AuthenticationService.setupAxiosInterceptors();
                    ProcurementAgentService.getProcurementAgentListAll().then(response => {
                        if (response.status == "200") {
                            // console.log("second--->", response.data);
                            this.setState({
                                procurementAgentList: response.data
                            });
                            for (var k = 0; k < (response.data).length; k++) {
                                var procurementAgentJson = {
                                    name: response.data[k].label.label_en,
                                    id: response.data[k].procurementAgentId
                                }
                                procurmentAgentListJexcel.push(procurementAgentJson);
                            }
                            // AuthenticationService.setupAxiosInterceptors();
                            ProcurementUnitService.getProcurementUnitList().then(response => {
                                if (response.status == 200) {
                                    // console.log("third ffff---->", response.data);
                                    var listArray = response.data;
                                    listArray.sort((a, b) => {
                                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                                        return itemLabelA > itemLabelB ? 1 : -1;
                                    });
                                    for (var k = 0; k < (listArray).length; k++) {
                                        var procurementUnitListJson = {
                                            name: response.data[k].label.label_en,
                                            id: response.data[k].procurementUnitId,
                                            active: response.data[k].active
                                        }
                                        procurmentUnitListJexcel.push(procurementUnitListJson);
                                    }

                                    this.setState({
                                        procurementUnitList: listArray,
                                        procurmentUnitListJexcel: procurmentUnitListJexcel
                                    });

                                    var procurmentAgentProcurmentUnitList = this.state.rows;
                                    var data = [];
                                    var productDataArr = []

                                    //seting this for loaded function
                                    // this.setState({ planningUnitList: planningUnitList });
                                    //seting this for loaded function

                                    if (procurmentAgentProcurmentUnitList.length != 0) {
                                        for (var j = 0; j < procurmentAgentProcurmentUnitList.length; j++) {
                                            data = [];
                                            data[0] = procurmentAgentProcurmentUnitList[j].procurementAgent.id;
                                            data[1] = procurmentAgentProcurmentUnitList[j].procurementUnit.id;
                                            data[2] = procurmentAgentProcurmentUnitList[j].skuCode;
                                            data[3] = procurmentAgentProcurmentUnitList[j].vendorPrice;
                                            data[4] = procurmentAgentProcurmentUnitList[j].approvedToShippedLeadTime;
                                            data[5] = procurmentAgentProcurmentUnitList[j].gtin;
                                            data[6] = procurmentAgentProcurmentUnitList[j].procurementAgentProcurementUnitId;
                                            data[7] = 0;
                                            productDataArr.push(data);
                                        }
                                    } else {
                                        console.log("list length is 0.");
                                    }
                                    this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
                                    this.el.destroy();
                                    var json = [];
                                    // var data = [{}];
                                    var data = productDataArr;
                                    var options = {
                                        data: data,
                                        columnDrag: true,
                                        colWidths: [200, 290, 170, 170, 170, 170, 200, 50],
                                        columns: [
                                            {
                                                title: i18n.t('static.procurementagent.procurementagent'),
                                                type: 'dropdown',
                                                source: procurmentAgentListJexcel,
                                                readOnly: true
                                            },
                                            {
                                                title: i18n.t('static.procurementUnit.procurementUnit'),
                                                type: 'dropdown',
                                                source: procurmentUnitListJexcel,
                                                filter: this.filterProcurmentUnitList
                                            },
                                            {
                                                title: i18n.t('static.procurementAgentProcurementUnit.skuCode'),
                                                type: 'text'
                                            },
                                            {
                                                title: i18n.t('static.procurementAgentProcurementUnit.vendorPrice'),
                                                type: 'numeric',
                                                decimal: '.',
                                                mask: '#,##.00',
                                                textEditor: true,
                                                disabledMaskOnEdition: true

                                            },
                                            {
                                                title: i18n.t('static.program.approvetoshipleadtime'),
                                                type: 'numeric',
                                                decimal: '.',
                                                textEditor: true,
                                                mask: '#,##.00',
                                                disabledMaskOnEdition: true
                                            },
                                            {
                                                title: i18n.t('static.procurementAgentProcurementUnit.gtin'),
                                                type: 'text'
                                            },
                                            {
                                                title: 'Procurment Agent Procurment Unit Id',
                                                type: 'hidden',
                                                // readOnly: true
                                            },
                                            {
                                                title: 'Changed Flag',
                                                type: 'hidden'
                                            },

                                        ],
                                        pagination: localStorage.getItem("sesRecordCount"),
                                        filters: true,
                                        search: true,
                                        columnSorting: true,
                                        tableOverflow: true,
                                        wordWrap: true,
                                        paginationOptions: JEXCEL_PAGINATION_OPTION,
                                        position: 'top',
                                        allowInsertColumn: false,
                                        allowManualInsertColumn: false,
                                        allowDeleteRow: true,
                                        onchange: this.changed,
                                        // oneditionend: this.onedit,
                                        copyCompatibility: true,
                                        parseFormulas: true,
                                        onpaste: this.onPaste,
                                        oneditionend: this.oneditionend,
                                        text: {
                                            // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                            showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                                            show: '',
                                            entries: '',
                                        },
                                        onload: this.loaded,
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
                                                            data[0] = this.props.match.params.procurementAgentId;
                                                            data[1] = "";
                                                            data[2] = "";
                                                            data[3] = "";
                                                            data[4] = "";
                                                            data[5] = "";
                                                            data[6] = 0;
                                                            data[7] = 1;
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
                                                            data[0] = this.props.match.params.procurementAgentId;
                                                            data[1] = "";
                                                            data[2] = "";
                                                            data[3] = "";
                                                            data[4] = "";
                                                            data[5] = "";
                                                            data[6] = 0;
                                                            data[7] = 1;
                                                            obj.insertRow(data, parseInt(y));
                                                        }.bind(this)
                                                    });
                                                }
                                                // Delete a row
                                                if (obj.options.allowDeleteRow == true) {
                                                    // region id
                                                    if (obj.getRowData(y)[6] == 0) {
                                                        items.push({
                                                            title: i18n.t("static.common.deleterow"),
                                                            onclick: function () {
                                                                obj.deleteRow(parseInt(y));
                                                            }
                                                        });
                                                    }
                                                }

                                                if (x) {
                                                    // if (obj.options.allowComments == true) {
                                                    //     items.push({ type: 'line' });

                                                    //     var title = obj.records[y][x].getAttribute('title') || '';

                                                    //     items.push({
                                                    //         title: title ? obj.options.text.editComments : obj.options.text.addComments,
                                                    //         onclick: function () {
                                                    //             obj.setComments([x, y], prompt(obj.options.text.comments, title));
                                                    //         }
                                                    //     });

                                                    //     if (title) {
                                                    //         items.push({
                                                    //             title: obj.options.text.clearComments,
                                                    //             onclick: function () {
                                                    //                 obj.setComments([x, y], '');
                                                    //             }
                                                    //         });
                                                    //     }
                                                    // }
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

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        var asterisk = document.getElementsByClassName("resizable")[0];
        var tr = asterisk.firstChild;
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[5].classList.add('AsteriskTheadtrTd');
    }

    render() {
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message)}</h5>
                <div>

                    <Card  >

                        {/* <CardHeader>
                                <strong>{i18n.t('static.procurementAgentProcurementUnit.mapProcurementUnit')}</strong>
                            </CardHeader> */}
                        <CardBody className="p-0">
                            <Col xs="12" sm="12">
                                <h4 className="red">{this.props.message}</h4>
                                <div className="table-responsive" style={{ display: this.state.loading ? "none" : "block" }}>
                                    <div id="mapPlanningUnit">
                                    </div>
                                </div>
                                <Row style={{ display: this.state.loading ? "block" : "none" }}>
                                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                        <div class="align-items-center">
                                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                                            <div class="spinner-border blue ml-4" role="status">

                                            </div>
                                        </div>
                                    </div>
                                </Row>
                            </Col>
                        </CardBody>
                        <CardFooter>
                            <FormGroup>
                                {/* <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                {this.state.isValidData && <Button type="submit" size="md" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}
                                &nbsp;
                                    <Button color="info" size="md" className="float-right mr-1" type="button" onClick={this.addRowInJexcel}> <i className="fa fa-plus"></i> Add Row</Button>
                                &nbsp; */}

                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                <Button type="submit" size="md" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRowInJexcel()}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>
                            </FormGroup>

                        </CardFooter>
                    </Card>

                </div>

            </div>

        );
    }
    cancelClicked() {
        this.props.history.push(`/procurementAgent/listProcurementAgent/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
}




