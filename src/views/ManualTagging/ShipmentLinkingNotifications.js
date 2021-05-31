import React, { Component } from 'react';
import AuthenticationService from '../Common/AuthenticationService.js';
import { Card, CardHeader, CardBody, CardFooter, FormGroup, Input, InputGroup, Label, Button, Col, Row, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import { STRING_TO_DATE_FORMAT, JEXCEL_DATE_FORMAT, DATE_FORMAT_CAP, DATE_FORMAT_CAP_WITHOUT_DATE, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
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



const entityname = i18n.t('static.mt.shipmentLinkingNotification');
export default class ShipmentLinkingNotifications extends Component {

    constructor(props) {
        super(props);
        this.state = {
            batchDetails: [],
            notificationSummary: [],
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
        // this.buildARTMISHistory = this.buildARTMISHistory.bind(this);
        this.getPlanningUnitArray = this.getPlanningUnitArray.bind(this);
        this.getNotificationSummary = this.getNotificationSummary.bind(this);
        this.buildNotificationSummaryJExcel = this.buildNotificationSummaryJExcel.bind(this);
        this.viewBatchData = this.viewBatchData.bind(this);
    }

    viewBatchData(event, row) {
        console.log("event---", event);
        console.log("row---", row);
        console.log("row length---", row.shipmentList.length);
        if (row.shipmentList.length > 1 || (row.shipmentList.length == 1 && row.shipmentList[0].batchNo != null)) {
            this.setState({
                batchDetails: row.shipmentList
            });
        } else {
            this.setState({
                batchDetails: []
            });
        }
        // batchDetails
    }

    getPlanningUnitArray() {
        let planningUnits = this.state.planningUnits;
        let planningUnitArray = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return ({ label: getLabelText(item.planningUnit.label, this.state.lang), value: item.planningUnit.id })

            }, this);

        this.setState({
            planningUnitArray
        }, () => {
            this.filterData(planningUnitArray);
        })
    }

    displayButton() {
        var validation = this.checkValidation();
        var tableJson = this.el.getJson(null, false);
        let count = 0;
        for (var i = 0; i < tableJson.length; i++) {
            var map1 = new Map(Object.entries(tableJson[i]));
            if (parseInt(map1.get("13")) === 1 && map1.get("0")) {
                count++;
            }
        }
        if (validation == true) {

            this.setState({
                displaySubmitButton: (count > 0 ? true : false)
            })
        } else {
            this.setState({
                displaySubmitButton: false
            })
        }
    }



    filterData1() {
        this.filterData(this.state.planningUnitIds);
    }
    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.actionCancelled'))
    }
    updateDetails() {
        document.getElementById('div2').style.display = 'block';
        var programId = this.state.programId;

        this.setState({ loading: true })
        var validation = this.checkValidation();
        if (validation == true) {
            var tableJson = this.el.getJson(null, false);
            let changedmtList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                if (parseInt(map1.get("13")) === 1 && map1.get("0")) {
                    let json = {
                        parentShipmentId: (map1.get("2") === '' ? null : map1.get("2")),
                        conversionFactor: this.el.getValue(`K${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        notes: (map1.get("12") === '' ? null : map1.get("12")),
                        orderNo: map1.get("14"),
                        primeLineNo: parseInt(map1.get("15")),
                        notificationId: parseInt(map1.get("16")),
                        notificationType: {
                            id: parseInt(map1.get("17"))
                        },
                        shipmentQty: this.el.getValue(`J${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        programId: programId,
                        shipmentId: (map1.get("3") === '' ? null : map1.get("3"))
                    }
                    changedmtList.push(json);
                }
            }
            console.log("FINAL SUBMIT changedmtList---", changedmtList);
            ManualTaggingService.updateNotification(changedmtList)
                .then(response => {
                    // document.getElementById('div2').style.display = 'block';
                    this.setState({
                        message: i18n.t('static.mt.dataUpdateSuccess'),
                        color: 'green',
                        loading: false,
                        loading1: false,
                        displaySubmitButton: false
                    },
                        () => {
                            this.hideSecondComponent();
                            this.filterData(this.state.planningUnitIds);
                            this.getNotificationSummary();
                        })

                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
                                color: 'red',
                                loading: false,
                                loading1: false
                            }, () => {
                                this.hideSecondComponent();
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
                                    }, () => {
                                        this.hideSecondComponent();
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false,
                                        loading1: false,
                                        color: 'red',
                                    }, () => {
                                        this.hideSecondComponent();
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false,
                                        loading1: false,
                                        color: 'red',
                                    }, () => {
                                        this.hideSecondComponent();
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
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(13, y);
            if (parseInt(value) == 1 && this.el.getValueFromCoords(0, y) == true) {


                var col = ("K").concat(parseInt(y) + 1);
                var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
                var value = this.el.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
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
        //conversion factor
        if (x == 10) {

            var col = ("K").concat(parseInt(y) + 1);
            value = this.el.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
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

                }

            }
            var qty = this.el.getValue(`J${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            this.el.setValueFromCoords(11, y, Math.round(qty * (value != null && value != "" ? value : 1)), true);
        }

        // if (x == 9) {

        // }

        // //Active
        if (x != 13) {
            this.el.setValueFromCoords(13, y, 1, true);
            if (x == 0) {
                value = this.el.getValue(`A${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                if (value === "false") {
                    this.el.setStyle(("K").concat(parseInt(y) + 1), "background-color", "transparent");
                    this.el.setComments(("K").concat(parseInt(y) + 1), "");
                }
            }
        }
        this.displayButton();


    }.bind(this);
    // -----end of changed function

    onedit = function (instance, cell, x, y, value) {
        this.el.setValueFromCoords(13, y, 1, true);
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

    componentDidMount() {
        this.hideFirstComponent();
        this.getProgramList();
        this.getNotificationSummary();
    }

    filterData = (planningUnitIds) => {
        document.getElementById('div2').style.display = 'block';
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
                var json = {
                    programId: parseInt(this.state.programId),
                    planningUnitIdList: this.state.planningUnitValues.map(ele => (ele.value).toString())
                }

                ManualTaggingService.getShipmentLinkingNotification(json)
                    .then(response => {
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
                                    color: 'red',
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent();
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
                                            color: 'red',
                                            loading: false
                                        }, () => {
                                            this.hideSecondComponent();
                                        });
                                        break;
                                    case 412:
                                        this.setState({
                                            message: error.response.data.messageCode,
                                            color: 'red',
                                            loading: false
                                        }, () => {
                                            this.hideSecondComponent();
                                        });
                                        break;
                                    default:
                                        this.setState({
                                            message: 'static.unkownError',
                                            color: 'red',
                                            loading: false
                                        }, () => {
                                            this.hideSecondComponent();
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
                            color: 'red',
                            loading: false
                        }, () => {
                            this.hideSecondComponent();
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
                                    color: 'red',
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent();
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    color: 'red',
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent();
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    color: 'red',
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent();
                                });
                                break;
                        }
                    }
                }
            );
    }


    // buildARTMISHistory() {
    //     let artmisHistoryList = this.state.artmisHistory;
    //     let artmisHistoryArray = [];
    //     let count = 0;
    //     this.el = jexcel(document.getElementById("tableDiv2"), '');
    //     this.el.destroy();
    //     var json = [];
    //     var data = artmisHistoryArray;

    //     var options = {
    //         data: data,
    //         columnDrag: true,
    //         colWidths: [40, 30, 40, 45, 30, 30, 35, 25, 35],
    //         colHeaderClasses: ["Reqasterisk"],
    //         columns: [

    //             {
    //                 title: i18n.t('static.mt.roNo'),
    //                 type: 'text',
    //                 readOnly: true
    //             },
    //             {
    //                 title: i18n.t('static.mt.roPrimeLineNo'),
    //                 type: 'text',
    //                 readOnly: true
    //             },
    //             {
    //                 title: i18n.t('static.mt.orderNo'),
    //                 type: 'text',
    //                 readOnly: true
    //             },
    //             {
    //                 title: i18n.t('static.mt.primeLineNo'),
    //                 type: 'text',
    //                 readOnly: true
    //             },
    //             {

    //                 title: i18n.t('static.manualTagging.erpPlanningUnit'),
    //                 type: 'text',
    //                 readOnly: true
    //             },
    //             {
    //                 title: i18n.t('static.manualTagging.currentEstimetedDeliveryDate'),
    //                 type: 'text',
    //                 readOnly: true
    //             },
    //             {
    //                 title: i18n.t('static.manualTagging.erpStatus'),
    //                 type: 'text',
    //                 readOnly: true
    //             },

    //             {
    //                 title: i18n.t('static.supplyPlan.shipmentQty'),
    //                 type: 'text',
    //                 readOnly: true
    //             },
    //             {
    //                 title: "Received On",
    //                 type: 'text',
    //                 readOnly: true
    //             },
    //         ],
    //         editable: true,
    //         text: {
    //             showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
    //             show: '',
    //             entries: '',
    //         },
    //         onload: this.loadedERP,
    //         pagination: localStorage.getItem("sesRecordCount"),
    //         search: true,
    //         columnSorting: true,
    //         tableOverflow: true,
    //         wordWrap: true,
    //         allowInsertColumn: false,
    //         allowManualInsertColumn: false,
    //         allowDeleteRow: false,
    //         // onselection: this.selected,
    //         copyCompatibility: true,
    //         allowExport: false,
    //         paginationOptions: JEXCEL_PAGINATION_OPTION,
    //         position: 'top',
    //         filters: true,
    //         license: JEXCEL_PRO_KEY,
    //         contextMenu: function (obj, x, y, e) {
    //             return [];
    //         }.bind(this),
    //     };


    //     var instance = jexcel(document.getElementById("tableDiv2"), options);
    //     this.el = instance;
    //     this.setState({
    //         instance, loading: false
    //     })
    // }

    buildJExcel() {
        let manualTaggingList = this.state.outputList;
        let manualTaggingArray = [];
        let count = 0;

        for (var j = 0; j < manualTaggingList.length; j++) {
            data = [];

            data[0] = manualTaggingList[j].addressed;
            data[1] = getLabelText(manualTaggingList[j].notificationType.label);
            data[2] = manualTaggingList[j].parentShipmentId
            data[3] = manualTaggingList[j].shipmentId;
            data[4] = manualTaggingList[j].roNo + " - " + manualTaggingList[j].roPrimeLineNo + " | " + manualTaggingList[j].orderNo + " - " + manualTaggingList[j].primeLineNo;
            data[5] = getLabelText(manualTaggingList[j].erpPlanningUnit.label, this.state.lang)
            data[6] = getLabelText(manualTaggingList[j].planningUnit.label, this.state.lang)
            data[7] = manualTaggingList[j].expectedDeliveryDate;
            // data[7] = getLabelText(manualTaggingList[j].shipmentStatus.label, this.state.lang)
            data[8] = manualTaggingList[j].erpStatus
            console.log("conversion factor---", manualTaggingList[j].conversionFactor);
            data[9] = Math.round(manualTaggingList[j].conversionFactor != null && manualTaggingList[j].conversionFactor != "" ? (manualTaggingList[j].shipmentQty / manualTaggingList[j].conversionFactor) : manualTaggingList[j].shipmentQty);
            if ((manualTaggingList[j].addressed && manualTaggingList[j].notificationType.id == 2)) {
                data[10] = (manualTaggingList[j].conversionFactor != null && manualTaggingList[j].conversionFactor != "" ? (manualTaggingList[j].conversionFactor) : 1);
            } else {
                data[10] = ""
            }
            data[11] = Math.round((manualTaggingList[j].addressed && manualTaggingList[j].notificationType.id == 2 ? (manualTaggingList[j].conversionFactor != null && manualTaggingList[j].conversionFactor != "" ? (manualTaggingList[j].shipmentQty / manualTaggingList[j].conversionFactor) : manualTaggingList[j].shipmentQty) * (manualTaggingList[j].conversionFactor != null && manualTaggingList[j].conversionFactor != "" ? manualTaggingList[j].conversionFactor : 1) : (manualTaggingList[j].conversionFactor != null && manualTaggingList[j].conversionFactor != "" ? (manualTaggingList[j].shipmentQty / manualTaggingList[j].conversionFactor) : manualTaggingList[j].shipmentQty)));
            data[12] = manualTaggingList[j].notes
            data[13] = 0
            data[14] = manualTaggingList[j].orderNo
            data[15] = manualTaggingList[j].primeLineNo

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
            colWidths: [45, 45, 40, 50, 60, 65, 65, 45, 40, 30, 45, 50],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.mt.isAddressed'),
                    type: 'checkbox',
                },
                {
                    title: i18n.t('static.mt.notificationType'),
                    type: 'text',
                    readOnly: true
                },

                {
                    title: i18n.t('static.mt.parentShipmentId'),
                    type: 'numeric',
                    // mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: i18n.t('static.mt.childShipmentId'),
                    type: 'numeric',
                    // mask: '#,##.00', decimal: '.',
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
                    type: 'calendar',
                    readOnly: true,
                    options: { format: JEXCEL_DATE_FORMAT },
                },
                {
                    title: i18n.t('static.manualTagging.erpStatus'),
                    type: 'text',
                    readOnly: true
                },

                {
                    title: i18n.t('static.supplyPlan.shipmentQty'),
                    type: 'numeric',
                    mask: '#,##', decimal: '.',
                    readOnly: true
                },
                {
                    title: i18n.t('static.manualTagging.conversionFactor'),
                    type: 'numeric',
                    mask: '#,##.0000', decimal: '.'
                },

                {
                    title: i18n.t('static.manualTagging.convertedQATShipmentQty'),
                    type: 'numeric',
                    mask: '#,##', decimal: '.',
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
            // onselection: this.selected,
            onchange: this.changed,
            updateTable: function (el, cell, x, y, source, value, id) {
                var elInstance = el.jexcel;
                if (y != null) {
                    var rowData = elInstance.getRowData(y);
                    if (rowData[0] && parseInt(rowData[13]) != 1) {
                        var cell;
                        cell = elInstance.getCell(("A").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');


                        cell = elInstance.getCell(("K").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');

                        cell = elInstance.getCell(("M").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                    }
                    else if (rowData[17] == 1) {
                        var cell = elInstance.getCell(("K").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                    }
                    else {
                        var cell;

                        cell = elInstance.getCell(("A").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');

                        cell = elInstance.getCell(("K").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');

                        cell = elInstance.getCell(("M").concat(parseInt(y) + 1))
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
                            title: i18n.t('static.mt.viewArtmisHistory'),
                            onclick: function () {
                                console.log("my order no.---", this.el.getValueFromCoords(14, y));
                                let orderNo = this.el.getValueFromCoords(14, y);
                                let primeLineNo = this.el.getValueFromCoords(15, y);
                                ManualTaggingService.getARTMISHistory(orderNo, primeLineNo)
                                    .then(response => {
                                        console.log("DATA---->1", response.data);

                                        let responseData = response.data.sort(function (a, b) {
                                            var dateA = new Date(a.date).getTime();
                                            var dateB = new Date(b.date).getTime();
                                            return dateA > dateB ? 1 : -1;
                                        })
                                        responseData = responseData.filter((responseData, index, self) =>
                                            index === self.findIndex((t) => (
                                                t.procurementAgentOrderNo === responseData.procurementAgentOrderNo && t.erpPlanningUnit.id === responseData.erpPlanningUnit.id && t.expectedDeliveryDate === responseData.expectedDeliveryDate && t.erpStatus === responseData.erpStatus && t.shipmentQty === responseData.shipmentQty && t.totalCost === responseData.totalCost
                                                && (t.shipmentList.length > 1 || (t.shipmentList.length == 1 && t.shipmentList[0].batchNo != null)) == (responseData.shipmentList.length > 1 || (responseData.shipmentList.length == 1 && responseData.shipmentList[0].batchNo != null))
                                            ))
                                        )

                                        responseData = responseData.sort(function (a, b) {
                                            var dateA = new Date(a.date).getTime();
                                            var dateB = new Date(b.date).getTime();
                                            return dateA < dateB ? 1 : -1;
                                        })
                                        console.log("DATA---->2", responseData);

                                        responseData = responseData.sort(function (a, b) {
                                            var dateA = a.erpOrderId;
                                            var dateB = b.erpOrderId;
                                            return dateA < dateB ? 1 : -1;
                                        })
                                        console.log("DATA---->3", responseData);

                                        this.setState({
                                            artmisHistory: responseData
                                        }, () => {
                                            this.toggleLarge();
                                        });
                                    }).catch(
                                        error => {
                                            if (error.message === "Network Error") {
                                                this.setState({
                                                    message: 'static.unkownError',
                                                    color: 'red',
                                                    loading: false
                                                }, () => {
                                                    this.hideSecondComponent();
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
                                                            color: 'red',
                                                            loading: false
                                                        }, () => {
                                                            this.hideSecondComponent();
                                                        });
                                                        break;
                                                    case 412:
                                                        this.setState({
                                                            message: error.response.data.messageCode,
                                                            color: 'red',
                                                            loading: false
                                                        }, () => {
                                                            this.hideSecondComponent();
                                                        });
                                                        break;
                                                    default:
                                                        this.setState({
                                                            message: 'static.unkownError',
                                                            color: 'red',
                                                            loading: false
                                                        }, () => {
                                                            this.hideSecondComponent();
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
    buildNotificationSummaryJExcel() {
        let notificationSummaryList = this.state.notificationSummary;
        let notificationSummaryArray = [];
        let count = 0;

        for (var j = 0; j < notificationSummaryList.length; j++) {
            data = [];

            data[0] = getLabelText(notificationSummaryList[j].label);
            data[1] = notificationSummaryList[j].notificationCount;
            data[2] = notificationSummaryList[j].programId;

            notificationSummaryArray[count] = data;
            count++;
        }

        this.el = jexcel(document.getElementById("tableDiv1"), '');
        this.el.destroy();
        var json = [];
        var data = notificationSummaryArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [10, 10],
            columns: [

                {
                    title: i18n.t('static.program.programName'),
                    type: 'text',
                    readOnly: true
                },

                {
                    title: i18n.t('static.mt.notificationCount'),
                    type: 'numeric',
                    mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: "programId",
                    type: 'hidden',
                }
            ],
            editable: false,
            text: {
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded1,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            onselection: this.selected,
            // onchange: this.changed,
            oneditionend: this.onedit,
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
    selected = function (instance, x1, y1, x2, y2, origin) {
        var instance = (instance).jexcel;
        console.log("RESP------>x1", x1);
        console.log("RESP------>y1", y1);
        console.log("RESP------>x2", x2);
        console.log("RESP------>y2", y2);
        console.log("RESP------>origin-x1", instance.getValueFromCoords(2, y1));

        if (y1 == 0 && y2 != 0) {
            console.log("RESP------>Header");
        } else {
            console.log("RESP------>Not");
            this.setState({
                programId: instance.getValueFromCoords(2, y1)
            }, () => {
                document.getElementById("addressed").value = 0;
                this.getPlanningUnitList();
            })
        }

        // if ((x == 0 && value != 0) || (y == 0)) {
        // // console.log("HEADER SELECTION--------------------------");
        // } else {
        // var instance = (instance).jexcel;
        // console.log("selected instance---", instance)
        // console.log("selected cell---", cell)
        // console.log("selected x---", x)
        // console.log("selected y---", y)
        // console.log("selected value---", value)
        // // console.log("selected program---", this.el);
        // console.log("selected program id---", instance.getValueFromCoords(2, x))
        // if (instance.getValueFromCoords(2, x) != null && instance.getValueFromCoords(2, x) != "") {
        // this.setState({
        // programId: instance.getValueFromCoords(2, x)
        // }, () => {
        // this.getPlanningUnitList();
        // })
        // }
        // }

    }.bind(this)

    loaded1 = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance, 0);
    }
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance, 1);
        console.log("asterisk---", document.getElementsByClassName("resizable")[2])
        var asterisk = document.getElementsByClassName("resizable")[2];

        var tr = asterisk.firstChild;
        tr.children[10].classList.add('AsteriskTheadtrTd');
    }




    getNotificationSummary() {
        ManualTaggingService.getNotificationSummary()
            .then(response => {
                if (response.status == 200) {
                    console.log("notification summary---", response.data);
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        notificationSummary: listArray,
                        loading: false
                    }, () => {
                        this.buildNotificationSummaryJExcel();
                    })

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
                            color: 'red',
                            loading: false
                        }, () => {
                            this.hideSecondComponent();
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
                                    color: 'red',
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent();
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    color: 'red',
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent();
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    color: 'red',
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent();
                                });
                                break;
                        }
                    }
                }
            );
    }

    toggleLarge() {
        this.setState({
            manualTag: !this.state.manualTag,
            batchDetails: []
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
                                color: 'red',
                                loading: false
                            }, () => {
                                this.hideSecondComponent();
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
                                        color: 'red',
                                        loading: false
                                    }, () => {
                                        this.hideSecondComponent();
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        color: 'red',
                                        loading: false
                                    }, () => {
                                        this.hideSecondComponent();
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        color: 'red',
                                        loading: false
                                    }, () => {
                                        this.hideSecondComponent();
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
            var dateMonthAsWord = moment(date).format(`${DATE_FORMAT_CAP}`);
            return dateMonthAsWord.toUpperCase();
        } else {
            return "";
        }
    }

    formatExpiryDate(cell, row) {
        if (cell != null && cell != "") {
            // var modifiedDate = moment(cell).format(`${STRING_TO_DATE_FORMAT}`);
            var date = moment(cell).format(`${STRING_TO_DATE_FORMAT}`);
            var dateMonthAsWord = moment(date).format(`${DATE_FORMAT_CAP_WITHOUT_DATE}`);
            return dateMonthAsWord;
        } else {
            return "";
        }
    }
    // DATE_FORMAT_CAP_WITHOUT_DATE

    addCommas(cell, row) {
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
                dataField: 'erpOrderId',
                text: i18n.t('static.mt.viewBatchDetails'),
                align: 'center',
                headerAlign: 'center',
                formatter: (cellContent, row) => {
                    // return (<i className="fa fa-eye eyeIconFontSize" title={i18n.t('static.mt.viewBatchDetails')} onClick={(event) => this.viewBatchData(event, row)} ></i>)
                    return (
                        ((row.shipmentList.length > 1 || (row.shipmentList.length == 1 && row.shipmentList[0].batchNo != null)) ? <i className="fa fa-eye eyeIconFontSize" title={i18n.t('static.mt.viewBatchDetails')} onClick={(event) => this.viewBatchData(event, row)} ></i> : "")
                    )
                }
            },

            {
                dataField: 'procurementAgentOrderNo',
                text: i18n.t('static.manualTagging.procOrderNo'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
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
                dataField: 'totalCost',
                // text: i18n.t('static.shipment.qty'),
                text: i18n.t('static.shipment.totalCost'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas
            },
            {
                dataField: 'receivedOn',
                text: i18n.t('static.mt.dataReceivedOn'),
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

        const columns2 = [
            {
                dataField: 'batchNo',
                text: i18n.t('static.supplyPlan.batchId'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'expiryDate',
                text: i18n.t('static.supplyPlan.expiryDate'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatExpiryDate
            }

        ];



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
                                <ModalHeader className="modalHeaderSupplyPlan hideCross">
                                    <strong>{i18n.t('static.mt.erpHistoryTitle')}</strong>
                                    <Button size="md" color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1" onClick={() => this.toggleLarge()}> <i className="fa fa-times"></i></Button>
                                </ModalHeader>
                                <ModalBody>
                                    <div>
                                        {/* <div> */}

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
                                                    <div className="TableCust FortablewidthMannualtaggingtable3 reactTableNotification ">
                                                        {/* <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
                                                    <SearchBar {...props.searchProps} />
                                                    <ClearSearchButton {...props.searchProps} />
                                                </div> */}
                                                        <BootstrapTable striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                                            // pagination={paginationFactory(options)}
                                                            rowEvents={{
                                                            }}
                                                            {...props.baseProps}
                                                        />
                                                    </div>
                                                )
                                            }
                                        </ToolkitProvider>
                                    </div>
                                    <br />

                                    {this.state.batchDetails.length > 0 &&
                                        <div>
                                            <ToolkitProvider
                                                keyField="optList"
                                                data={this.state.batchDetails}
                                                columns={columns2}
                                                search={{ searchFormatted: true }}
                                                hover
                                                filter={filterFactory()}
                                            >
                                                {
                                                    props => (
                                                        <div className="TableCust ShipmentNotificationtable">
                                                            {/* <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
                                                    <SearchBar {...props.searchProps} />
                                                    <ClearSearchButton {...props.searchProps} />
                                                </div> */}
                                                            <BootstrapTable striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                                                // pagination={paginationFactory(options)}
                                                                rowEvents={{
                                                                }}
                                                                {...props.baseProps}
                                                            />
                                                        </div>
                                                    )
                                                }
                                            </ToolkitProvider></div>}

                                    <br />
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
                            <div id="tableDiv1" className="jexcelremoveReadonlybackground RowClickable">
                            </div>
                        </div>
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
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.mt.addressed')}</Label>
                                    <div className="controls ">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="addressed"
                                                id="addressed"
                                                bsSize="sm"
                                                // value={this.state.addressed}
                                                onChange={this.filterData1}
                                            >
                                                <option value="-1">{i18n.t('static.common.all')}</option>
                                                <option value="1">{i18n.t('static.mt.addressed')}</option>
                                                <option value="0" selected>{i18n.t('static.mt.notAddressed')}</option>
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