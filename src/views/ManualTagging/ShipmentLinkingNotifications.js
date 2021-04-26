import React, { Component } from 'react';
import AuthenticationService from '../Common/AuthenticationService.js';
import { Card, CardHeader, CardBody, CardFooter, FormGroup, Input, InputGroup, Label, Button, Col, Row, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import { STRING_TO_DATE_FORMAT, DATE_FORMAT_CAP, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
import moment from 'moment';
import i18n from '../../i18n';
import ProgramService from '../../api/ProgramService.js';
import ProductService from '../../api/ProductService';
import ManualTaggingService from '../../api/ManualTaggingService.js';
import PlanningUnitService from '../../api/PlanningUnitService.js';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions.js';
import MultiSelect from 'react-multi-select-component';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';



const entityname = i18n.t('static.dashboard.manualTagging');
export default class ShipmentLinkingNotifications extends Component {

    constructor(props) {
        super(props);
        this.state = {
            color: '',
            message: '',
            loading: true,
            loading1: false,
            programs: [],
            planningUnits: [],
            instance: '',
            artmisHistory: [],
            lang: 'en',
            displaySubmitButton: false,
            planningUnitArray: [],
            hasSelectAll: true
        }
        this.displayButton = this.displayButton.bind(this);
        this.filterData = this.filterData.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this);
        this.getProgramList = this.getProgramList.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
        this.programChange = this.programChange.bind(this);
        this.changed = this.changed.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.updateDetails = this.updateDetails.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.filterData1 = this.filterData1.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.buildARTMISHistory = this.buildARTMISHistory.bind(this);
        this.getPlanningUnitArray = this.getPlanningUnitArray.bind(this);
    }

    getPlanningUnitArray() {
        let planningUnits = this.state.planningUnits;
        console.log("planningUnitArray1---", planningUnits);
        let planningUnitArray = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return ({ label: getLabelText(item.planningUnit.label, this.state.lang), value: item.planningUnit.id })

            }, this);

        this.setState({
            planningUnitArray
        }, () => {
            this.filterData(planningUnitArray);
        })

        console.log("planningUnitArray2---", planningUnitArray);
    }

    displayButton() {
        var validation = this.checkValidation();
        if (validation == true) {
            var tableJson = this.el.getJson(null, false);
            console.log("tableJson---", tableJson);
            let count = 0;
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                if (parseInt(map1.get("12")) === 1 && map1.get("0")) {
                    count++;
                }
            }
            this.setState({
                displaySubmitButton: (count > 0 ? true : false)
            })
        }
    }

    

    filterData1() {
        this.filterData(this.state.planningUnitIds);
    }
    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    updateDetails() {

        var programId = this.state.programId;

        this.setState({ loading1: true })
        var validation = this.checkValidation();
        if (validation == true) {
            var tableJson = this.el.getJson(null, false);
            console.log("tableJson---", tableJson);
            let changedmtList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                console.log("7 map---" + map1.get("10"))
                console.log("is changed-- ", map1.get("12"));
                if (parseInt(map1.get("12")) === 1 && map1.get("0")) {
                    let json = {
                        parentShipmentId: (map1.get("15") === '' ? null : map1.get("15")),
                        conversionFactor: this.el.getValue(`J${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        notes: (map1.get("11") === '' ? null : map1.get("11")),
                        orderNo: map1.get("13"),
                        primeLineNo: parseInt(map1.get("14")),
                        notificationId: parseInt(map1.get("16")),
                        notificationType: {
                            id: parseInt(map1.get("17"))
                        },
                        shipmentQty: this.el.getValue(`I${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        programId: programId
                    }
                    changedmtList.push(json);
                }
            }
            console.log("FINAL SUBMIT changedmtList---", changedmtList);
            ManualTaggingService.updateNotification(changedmtList)
                .then(response => {
                    console.log("response m tagging---", response)
                    document.getElementById('div2').style.display = 'block';
                    this.setState({
                        message: "Data updated successfully.",
                        color: 'green',
                        loading: false,
                        loading1: false,
                        displaySubmitButton: false
                    },
                        () => {
                            console.log("message ------------------" + this.state.message);
                            // this.hideSecondComponent();
                            document.getElementById('div2').style.display = 'block';
                            console.log("Going to call toggle large 1");

                            this.filterData(this.state.planningUnitIds);

                        })

                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
                                color: 'red',
                                loading: false,
                                loading1: false
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
                                        loading: false,
                                        loading1: false,
                                        color: 'red',
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false,
                                        loading1: false,
                                        color: 'red',
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false,
                                        loading1: false,
                                        color: 'red',
                                    });
                                    break;
                            }
                        }
                    }
                );
        }
    }


    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        console.log("json.length-------", json.length);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(12, y);
            if (parseInt(value) == 1) {


                var col = ("J").concat(parseInt(y) + 1);
                var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
                var value = this.el.getValue(`J${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                value = value.replace(/,/g, "");
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    // if (isNaN(Number.parseInt(value)) || value < 0 || !(reg.test(value))) {
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
        }
        return valid;
    }
    // -----------start of changed function
    changed = function (instance, cell, x, y, value) {
        console.log("changed 1---")

        //conversion factor
        if (x == 9) {
            console.log("-------------inside conversion factor change-------------------------")
            var col = ("J").concat(parseInt(y) + 1);
            value = this.el.getValue(`J${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = DECIMAL_NO_REGEX;
            var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                // if (isNaN(Number.parseInt(value)) || value < 0 || !(reg.test(value))) {
                if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    var qty = this.el.getValue(`I${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                    console.log("qty-------" + qty);
                    this.el.setValueFromCoords(10, y, this.addCommas(qty * value), true);
                }

            }
        }

        // if (x == 9) {

        // }

        // //Active
        if (x != 12) {
            this.el.setValueFromCoords(12, y, 1, true);
        }
        this.displayButton();


    }.bind(this);
    // -----end of changed function

    onedit = function (instance, cell, x, y, value) {
        console.log("------------onedit called")
        console.log("changed 2---")
        this.el.setValueFromCoords(12, y, 1, true);
    }.bind(this);

    onPaste(instance, data) {
        // var z = -1;
        // for (var i = 0; i < data.length; i++) {
        //     if (z != data[i].y) {
        //         var index = (instance.jexcel).getValue(`G${parseInt(data[i].y) + 1}`, true);
        //         if (index == "" || index == null || index == undefined) {
        //             (instance.jexcel).setValueFromCoords(0, data[i].y, this.state.realmCountry.realm.label.label_en + "-" + this.state.realmCountry.country.label.label_en, true);
        //             (instance.jexcel).setValueFromCoords(5, data[i].y, this.props.match.params.realmCountryId, true);
        //             (instance.jexcel).setValueFromCoords(6, data[i].y, 0, true);
        //             (instance.jexcel).setValueFromCoords(7, data[i].y, 1, true);
        //             z = data[i].y;
        //         }
        //     }
        // }
    }

    programChange(event) {
        this.setState({
            programId: event.target.value,
            hasSelectAll: true
        }, () => {
            this.getPlanningUnitList();
        })
    }

    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    hideSecondComponent() {

        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);


    }



    filterData = (planningUnitIds) => {

        console.log("planningUnitIds---", planningUnitIds);
        // document.getElementById('div2').style.display = 'block';
        var programId = this.state.programId;
        var addressed = document.getElementById("addressed").value;

        planningUnitIds = planningUnitIds;
        // .sort(function (a, b) {
        //     return parseInt(a.value) - parseInt(b.value);
        // })
        this.setState({
            hasSelectAll: false,
            planningUnitIds,
            planningUnitValues: planningUnitIds.map(ele => ele),
            planningUnitLabels: planningUnitIds.map(ele => ele.label)
        }, () => {
            if (programId != -1 && planningUnitIds != null && planningUnitIds != "") {
                this.setState({
                    loading: true,
                    planningUnitIds
                })
                // if (this.state.haslinked) {
                //     this.setState({ haslinked: false })
                // } else {
                //     this.setState({ message: '' })
                // }
                var json = {
                    programId: parseInt(this.state.programId),
                    planningUnitIdList: this.state.planningUnitValues.map(ele => (ele.value).toString())
                }

                ManualTaggingService.getShipmentLinkingNotification(json)
                    .then(response => {
                        console.log("notification response===", response);

                        let list = (addressed != -1 ? response.data.filter(c => (c.addressed == (addressed == 1 ? true : false))) : response.data);
                        this.setState({
                            outputList: list
                        }, () => {
                            localStorage.setItem("sesProgramIdReport", programId)
                            this.buildJExcel();
                        });
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
                    outputList: []
                }, () => {
                    this.state.languageEl.destroy();
                })
            }
            // else if (programId == -1) {
            //     console.log("2-programId------>", programId);
            //     this.setState({
            //         outputList: [],
            //         message: i18n.t('static.program.validselectprogramtext'),
            //         color: 'red'
            //     }, () => {
            //         this.el = jexcel(document.getElementById("tableDiv"), '');
            //         this.el.destroy();
            //     });
            // } else if (planningUnitIds != null && planningUnitIds != "") {
            //     console.log("3-programId------>", programId);
            //     this.setState({
            //         outputList: [],
            //         message: i18n.t('static.procurementUnit.validPlanningUnitText'),
            //         color: 'red'
            //     }, () => {
            //         this.el = jexcel(document.getElementById("tableDiv"), '');
            //         this.el.destroy();
            //     });
            // }
        })




    }

    getProgramList() {
        ProgramService.getProgramList()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });

                    if (response.data.length == 1) {
                        this.setState({
                            programs: response.data,
                            loading: false,
                            programId: response.data[0].programId
                        }, () => {
                            this.getPlanningUnitList();
                        })
                    } else {
                        if (localStorage.getItem("sesProgramIdReport") != '' && localStorage.getItem("sesProgramIdReport") != undefined) {
                            this.setState({
                                programs: listArray,
                                loading: false,
                                programId: localStorage.getItem("sesProgramIdReport")
                            }, () => {
                                this.getPlanningUnitList();
                            });
                        } else {
                            this.setState({
                                programs: listArray,
                                loading: false
                            })
                        }
                    }

                }
                else {

                    this.setState({
                        message: response.data.messageCode,
                        color: 'red',
                        loading: false
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


    buildARTMISHistory() {
        let artmisHistoryList = this.state.artmisHistory;
        console.log("artmisHistoryList---->", artmisHistoryList);
        let artmisHistoryArray = [];
        let count = 0;
        console.log("jexcel this------", this);
        this.el = jexcel(document.getElementById("tableDiv1"), '');
        this.el.destroy();
        var json = [];
        var data = artmisHistoryArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [40, 30, 40, 45, 30, 30, 35, 25, 35],
            colHeaderClasses: ["Reqasterisk"],
            columns: [

                {
                    title: "RO No.",
                    type: 'text',
                    readOnly: true
                },
                {
                    title: "RO Prime Line No",
                    type: 'text',
                    readOnly: true
                },
                {
                    title: "Order No.",
                    type: 'text',
                    readOnly: true
                },
                {
                    title: "Prime Line No.",
                    type: 'text',
                    readOnly: true
                },
                {
                    title: "ERP Planning Unit",
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.manualTagging.currentEstimetedDeliveryDate'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.manualTagging.erpStatus'),
                    type: 'text',
                    readOnly: true
                },

                {
                    title: i18n.t('static.supplyPlan.shipmentQty'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: "Received On",
                    type: 'text',
                    readOnly: true
                },
            ],
            editable: true,
            text: {
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loadedERP,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            onselection: this.selected,
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


        var instance = jexcel(document.getElementById("tableDiv1"), options);
        this.el = instance;
        this.setState({
            instance, loading: false
        })
    }

    buildJExcel() {
        let manualTaggingList = this.state.outputList;
        console.log("manualTaggingList---->", manualTaggingList);
        let manualTaggingArray = [];
        let count = 0;

        for (var j = 0; j < manualTaggingList.length; j++) {
            data = [];

            data[0] = manualTaggingList[j].addressed;
            data[1] = getLabelText(manualTaggingList[j].notificationType.label);
            data[2] = manualTaggingList[j].shipmentId;
            data[3] = manualTaggingList[j].roNo + " - " + manualTaggingList[j].roPrimeLineNo + " | " + manualTaggingList[j].orderNo + " - " + manualTaggingList[j].primeLineNo;
            data[4] = getLabelText(manualTaggingList[j].erpPlanningUnit.label, this.state.lang)
            data[5] = getLabelText(manualTaggingList[j].planningUnit.label, this.state.lang)
            data[6] = this.formatDate(manualTaggingList[j].expectedDeliveryDate);
            // data[7] = getLabelText(manualTaggingList[j].shipmentStatus.label, this.state.lang)
            data[7] = manualTaggingList[j].erpStatus
            data[8] = this.addCommas(manualTaggingList[j].conversionFactor != null && manualTaggingList[j].conversionFactor != "" ? (manualTaggingList[j].shipmentQty / manualTaggingList[j].conversionFactor) : manualTaggingList[j].shipmentQty);
            if ((manualTaggingList[j].addressed && manualTaggingList[j].notificationType.id == 2) || manualTaggingList[j].notificationType.id == 1) {
                data[9] = (manualTaggingList[j].conversionFactor != null && manualTaggingList[j].conversionFactor != "" ? this.addCommas(manualTaggingList[j].conversionFactor) : 1);
            } else {
                data[9] = ""
            }
            data[10] = this.addCommas((manualTaggingList[j].addressed && manualTaggingList[j].notificationType.id == 2 ? (manualTaggingList[j].conversionFactor != null && manualTaggingList[j].conversionFactor != "" ? (manualTaggingList[j].shipmentQty / manualTaggingList[j].conversionFactor) : manualTaggingList[j].shipmentQty) * (manualTaggingList[j].conversionFactor != null && manualTaggingList[j].conversionFactor != "" ? manualTaggingList[j].conversionFactor : 1) : (manualTaggingList[j].conversionFactor != null && manualTaggingList[j].conversionFactor != "" ? (manualTaggingList[j].shipmentQty / manualTaggingList[j].conversionFactor) : manualTaggingList[j].shipmentQty)));
            data[11] = manualTaggingList[j].notes
            data[12] = 0
            data[13] = manualTaggingList[j].orderNo
            data[14] = manualTaggingList[j].primeLineNo
            data[15] = manualTaggingList[j].parentShipmentId
            data[16] = manualTaggingList[j].notificationId
            data[17] = manualTaggingList[j].notificationType.id;

            manualTaggingArray[count] = data;
            count++;
        }

        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = manualTaggingArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [45, 45, 40, 50, 60, 60, 45, 45, 40, 30, 45, 50],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: "Addressed?",
                    type: 'checkbox',
                },
                {
                    // title: i18n.t('static.mt.notificationType'),
                    title: "Notification Type",
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.commit.qatshipmentId'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.manualTagging.procOrderNo'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.manualTagging.erpPlanningUnit'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.supplyPlan.qatProduct'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.manualTagging.currentEstimetedDeliveryDate'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.manualTagging.erpStatus'),
                    type: 'text',
                    readOnly: true
                },

                {
                    title: i18n.t('static.supplyPlan.shipmentQty'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.manualTagging.conversionFactor'),
                    type: 'text',
                },

                {
                    title: i18n.t('static.manualTagging.convertedQATShipmentQty'),
                    type: 'text',
                    readOnly: true
                },

                {
                    title: i18n.t('static.common.notes'),
                    type: 'text',
                },
                {
                    title: "changed",
                    type: 'hidden',
                },
                {
                    title: "orderNo",
                    type: 'hidden',
                },
                {
                    title: "primeLineNo",
                    type: 'hidden',
                },
                {
                    title: "parentShipmentId",
                    type: 'hidden',
                },
                {
                    title: "notificationId",
                    type: 'hidden',
                },
                {
                    title: "notificationTypeId",
                    type: 'hidden',
                },
            ],
            editable: true,
            text: {
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
            onchange: this.changed,
            updateTable: function (el, cell, x, y, source, value, id) {
                var elInstance = el.jexcel;
                if (y != null) {
                    var rowData = elInstance.getRowData(y);
                    if (rowData[0] && rowData[12] != 1) {
                        var cell;
                        cell = elInstance.getCell(("A").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');


                        cell = elInstance.getCell(("J").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');

                        cell = elInstance.getCell(("L").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                    }
                    else if (rowData[17] == 1) {
                        var cell = elInstance.getCell(("J").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                    }
                    else {
                        var cell;

                        cell = elInstance.getCell(("A").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');

                        cell = elInstance.getCell(("J").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');

                        cell = elInstance.getCell(("L").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');
                    }

                }
            }.bind(this),
            onsearch: function (el) {
                el.jexcel.updateTable();
            },
            onfilter: function (el) {
                el.jexcel.updateTable();
            },
            oneditionend: this.onedit,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                if (y != null) {
                    if (obj.options.allowInsertRow == true) {
                        items.push({
                            // title: i18n.t('static.dashboard.linkShipment'),
                            title: "View ARTMIS History",
                            onclick: function () {
                                var outputListAfterSearch = [];
                                let orderNo = this.el.getValueFromCoords(13, y);
                                let primeLineNo = this.el.getValueFromCoords(14, y);
                                console.log("history order no---" + orderNo);
                                console.log("history prime line no---" + primeLineNo);
                                // this.buildARTMISHistory();
                                // this.toggleLarge();
                                ManualTaggingService.getARTMISHistory(orderNo, primeLineNo)
                                    .then(response => {
                                        console.log("history response===", response.data);
                                        this.setState({
                                            artmisHistory: response.data
                                        }, () => {
                                            // this.buildARTMISHistory();
                                            this.toggleLarge();
                                        });
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
                            }.bind(this)
                        });
                    }
                }

                return items;
            }.bind(this)
        };


        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false
        })
    }
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance, 0);
    }

    loadedERP = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance, 1);
    }

    // selected = function (instance, cell, x, y, value) {

    //     if ((x == 0 && value != 0) || (y == 0)) {
    //         // console.log("HEADER SELECTION--------------------------");
    //     } else {
    //         var outputListAfterSearch = [];
    //         let row;
    //         if (this.state.active1) {
    //             row = this.state.outputList.filter(c => (c.shipmentId == this.el.getValueFromCoords(0, x)))[0];
    //             outputListAfterSearch.push(row);
    //             let json = { id: '', label: '' };
    //             this.setState({
    //                 roNoOrderNo: json,
    //                 searchedValue: '',
    //                 planningUnitIdUpdated: outputListAfterSearch[0].planningUnit.id
    //             });
    //         } else if (this.state.active2) {
    //             console.log("my out put list---", this.state.outputList)
    //             console.log("my coordinates---", this.el.getValueFromCoords(1, x))
    //             row = this.state.outputList.filter(c => (c.shipmentId == this.el.getValueFromCoords(1, x)))[0];
    //             console.log()
    //             outputListAfterSearch.push(row);
    //             // console.log("my output---", document.getElementById("combo-box-demo1"));
    //             let json = { id: outputListAfterSearch[0].roNo, label: outputListAfterSearch[0].roNo };
    //             this.setState({
    //                 parentShipmentId: outputListAfterSearch[0].parentShipmentId,
    //                 roNoOrderNo: json,
    //                 searchedValue: outputListAfterSearch[0].roNo,
    //                 planningUnitIdUpdated: outputListAfterSearch[0].planningUnit.id
    //             }, () => {

    //                 this.getOrderDetails();
    //             });
    //         } else {
    //             console.log("my out put list---", this.state.outputList)
    //             console.log("my coordinates---", this.el.getValueFromCoords(0, x))
    //             row = this.state.outputList.filter(c => (c.erpOrderId == this.el.getValueFromCoords(0, x)))[0];
    //             console.log()
    //             outputListAfterSearch.push(row);
    //             let json = { id: outputListAfterSearch[0].roNo, label: outputListAfterSearch[0].roNo };
    //             this.setState({
    //                 // parentShipmentId: outputListAfterSearch[0].parentShipmentId,
    //                 roNoOrderNo: json,
    //                 searchedValue: outputListAfterSearch[0].roNo,
    //                 planningUnitIdUpdated: outputListAfterSearch[0].erpPlanningUnit.id
    //             }, () => {

    //                 this.getOrderDetails();
    //                 // this.getNotLinkedShipments();
    //             });
    //         }
    //         // outputListAfterSearch.push(row);

    //         this.setState({
    //             planningUnitId: (this.state.active3 ? outputListAfterSearch[0].erpPlanningUnit.id : outputListAfterSearch[0].planningUnit.id),
    //             shipmentId: (this.state.active1 ? this.el.getValueFromCoords(0, x) : (this.state.active2 ? this.el.getValueFromCoords(1, x) : 0)),
    //             outputListAfterSearch,
    //             procurementAgentId: (this.state.active3 ? 1 : outputListAfterSearch[0].procurementAgent.id),
    //             planningUnitName: (this.state.active3 ? row.erpPlanningUnit.label.label_en + "()" : row.planningUnit.label.label_en + '(' + row.skuCode + ')')
    //         })
    //         console.log("Going to call toggle large 3");
    //         this.toggleLarge();
    //     }
    // }.bind(this);


    componentDidMount() {
        this.hideFirstComponent();
        this.getProgramList();
    }

    toggleLarge() {
        console.log("show artmis history---")
        this.setState({
            manualTag: !this.state.manualTag,
        })
    }

    getPlanningUnitList() {
        var programId = this.state.programId;
        if (programId != -1) {
            ProgramService.getProgramPlaningUnitListByProgramId(programId)
                .then(response => {
                    if (response.status == 200) {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            planningUnits: listArray
                        }, () => {
                            this.getPlanningUnitArray();
                        })
                    }
                    else {

                        this.setState({
                            message: response.data.messageCode,
                            color: 'red'
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
                outputList: [],
                planningUnits: []
            }, () => {
                this.state.languageEl.destroy();
            })
        }
        // this.filterData();

    }


    formatDate(cell, row) {
        if (cell != null && cell != "") {
            // var modifiedDate = moment(cell).format(`${STRING_TO_DATE_FORMAT}`);
            var date = moment(cell).format(`${STRING_TO_DATE_FORMAT}`);
            console.log("date-----", date);
            var dateMonthAsWord = moment(date).format(`${DATE_FORMAT_CAP}`);
            console.log("dateMonthAsWord-----", dateMonthAsWord);
            return dateMonthAsWord;
        } else {
            return "";
        }
    }

    addCommas(cell, row) {
        console.log("row---------->", row);
        cell += '';
        var x = cell.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }
    formatLabel(cell, row) {
        console.log("cell---", cell);
        console.log("row---", row);
        if (cell != null && cell != "") {
            return getLabelText(cell.label, 'en');
        } else {
            return "";
        }
    }


    render() {

        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );
        const columns1 = [

            {
                dataField: 'roNo',
                text: i18n.t('static.manualTagging.RONO'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'roPrimeLineNo',
                text: i18n.t('static.manualTagging.ROPrimeline'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                // formatter: this.formatLabel
            },
            {
                dataField: 'orderNo',
                text: i18n.t('static.manualTagging.erpShipmentNo'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'primeLineNo',
                text: i18n.t('static.manualTagging.erpShipmentLineNo'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                // formatter: this.formatLabel
            },

            {
                dataField: 'erpPlanningUnit',
                text: "ERP Planning Unit",
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatLabel
            },

            {
                dataField: 'expectedDeliveryDate',
                text: i18n.t('static.supplyPlan.mtexpectedDeliveryDate'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatDate
            },
            {
                dataField: 'erpStatus',
                text: i18n.t('static.manualTagging.erpStatus'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'shipmentQty',
                // text: i18n.t('static.shipment.qty'),
                text: i18n.t('static.manualTagging.erpShipmentQty'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas
            },
            {
                dataField: 'receivedOn',
                text: "Data Received On",
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatDate
            }

        ];
        const options = {
            hidePageListOnlyOnePage: true,
            firstPageText: i18n.t('static.common.first'),
            prePageText: i18n.t('static.common.back'),
            nextPageText: i18n.t('static.common.next'),
            lastPageText: i18n.t('static.common.last'),
            nextPageTitle: i18n.t('static.common.firstPage'),
            prePageTitle: i18n.t('static.common.prevPage'),
            firstPageTitle: i18n.t('static.common.nextPage'),
            lastPageTitle: i18n.t('static.common.lastPage'),
            showTotal: true,
            paginationTotalRenderer: customTotal,
            disablePageTitle: true,
            sizePerPageList: [{
                text: '10', value: 10
            }, {
                text: '30', value: 30
            }
                ,
            {
                text: '50', value: 50
            },
            {
                text: 'All', value: this.state.artmisHistory.length
            }]
        }


        const { programs } = this.state;
        let programList = programs.length > 0 && programs.map((item, i) => {
            return (
                <option key={i} value={item.programId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>
            )
        }, this);


        const { planningUnits } = this.state;
        let planningUnitMultiList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return ({ label: getLabelText(item.planningUnit.label, this.state.lang), value: item.planningUnit.id })

            }, this);

        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className={this.state.color} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                {/* <Card style={{ display: this.state.loading ? "none" : "block" }}> */}
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <CardBody className="pb-lg-5">
                        {/* Consumption modal */}
                        <Modal isOpen={this.state.manualTag}
                            className={'modal-lg ' + this.props.className, "modalWidth"}>
                            {/* <div style={{ display: this.state.loading1 ? "none" : "block" }}> */}
                            <div>
                                <ModalHeader toggle={() => this.toggleLarge()} className="modalHeaderSupplyPlan hideCross">
                                    <strong>ERP Order History</strong>
                                </ModalHeader>
                                <ModalBody>
                                    <div>

                                        <ToolkitProvider
                                            keyField="optList"
                                            data={this.state.artmisHistory}
                                            columns={columns1}
                                            search={{ searchFormatted: true }}
                                            hover
                                            filter={filterFactory()}
                                        >
                                            {
                                                props => (
                                                    <div className="TableCust FortablewidthMannualtaggingtable2 ">
                                                        {/* <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
                                                    <SearchBar {...props.searchProps} />
                                                    <ClearSearchButton {...props.searchProps} />
                                                </div> */}
                                                        <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                                            // pagination={paginationFactory(options)}
                                                            rowEvents={{
                                                            }}
                                                            {...props.baseProps}
                                                        />
                                                    </div>
                                                )
                                            }
                                        </ToolkitProvider>

                                    </div><br />
                                </ModalBody>
                                <ModalFooter>
                                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.toggleLarge()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                </ModalFooter>
                            </div>
                            {/* <div style={{ display: this.state.loading1 ? "block" : "none" }}>
                                <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                    <div class="align-items-center">
                                        <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>

                                        <div class="spinner-border blue ml-4" role="status">

                                        </div>
                                    </div>
                                </div>
                            </div> */}
                        </Modal>
                        {/* Consumption modal */}
                        <div className="col-md-12 pl-0">
                            <Row>


                                <FormGroup className="col-md-3 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.inventory.program')}</Label>
                                    <div className="controls ">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="programId"
                                                id="programId"
                                                bsSize="sm"
                                                value={this.state.programId}
                                                // onChange={this.getPlanningUnitList}
                                                onChange={(e) => { this.programChange(e); }}
                                            >
                                                <option value="-1">{i18n.t('static.common.select')}</option>
                                                {programList}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>


                                <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.procurementUnit.planningUnit')}</Label>
                                    <div className="controls ">
                                        {/* <InMultiputGroup> */}
                                        <MultiSelect
                                            // type="select"
                                            name="planningUnitId"
                                            id="planningUnitId"
                                            bsSize="sm"
                                            value={this.state.hasSelectAll ? planningUnitMultiList : this.state.planningUnitValues}
                                            onChange={(e) => { this.filterData(e) }}
                                            options={planningUnitMultiList && planningUnitMultiList.length > 0 ? planningUnitMultiList : []}
                                        />

                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-3 ">
                                    <Label htmlFor="appendedInputButton">Addressed</Label>
                                    <div className="controls ">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="addressed"
                                                id="addressed"
                                                bsSize="sm"
                                                // value={this.state.addressed}
                                                onChange={this.filterData1}
                                            // onChange={(e) => { this.programChange(e); this.getPlanningUnitList(e) }}
                                            >
                                                <option value="-1">All</option>
                                                <option value="1">Addressed</option>
                                                <option value="0" selected>Not Addressed</option>
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </Row>
                            <div className="ReportSearchMarginTop">
                                <div id="tableDiv" className="RemoveStriped">
                                </div>
                                {/* <div id="tableDiv1" className="jexcelremoveReadonlybackground">
                                        </div> */}
                            </div>

                        </div>



                    </CardBody>
                    <CardFooter>
                        <FormGroup>
                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                &nbsp;
                                {this.state.displaySubmitButton && <Button type="submit" size="md" color="success" onClick={this.updateDetails} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>}
                        </FormGroup>
                    </CardFooter>
                </Card>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}