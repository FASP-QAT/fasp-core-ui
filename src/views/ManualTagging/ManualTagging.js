import React, { Component } from 'react';
import AuthenticationService from '../Common/AuthenticationService.js';
import { Table, ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText, Card, CardHeader, CardBody, FormGroup, Input, InputGroup, Label, Button, Col, Row, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import getLabelText from '../../CommonComponent/getLabelText';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import { STRING_TO_DATE_FORMAT, JEXCEL_DATE_FORMAT, DATE_FORMAT_CAP, DATE_FORMAT_CAP_WITHOUT_DATE, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
import moment from 'moment';
import BudgetServcie from '../../api/BudgetService';
import FundingSourceService from '../../api/FundingSourceService';
import i18n from '../../i18n';
import ProgramService from '../../api/ProgramService.js';
import ProductService from '../../api/ProductService';
import ManualTaggingService from '../../api/ManualTaggingService.js';
import PlanningUnitService from '../../api/PlanningUnitService.js';
import RealmCountryService from '../../api/RealmCountryService';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions.js';
import MultiSelect from 'react-multi-select-component';
import conversionFormula from '../../assets/img/conversionFormula.png';
import conversionFormulaExample from '../../assets/img/conversionFormulaExample.png';



const entityname = i18n.t('static.dashboard.manualTagging');
export default class ManualTagging extends Component {

    constructor(props) {
        super(props);
        this.state = {
            duplicateOrderNo: false,
            artmisHistory: [],
            tempNotes: '',
            originalQty: 0,
            filteredBudgetListByProgram: [],
            checkboxValue: true,
            buildJexcelRequired: true,
            getPlanningUnitArray: [],
            countryWisePrograms: [],
            active4: false,
            active5: false,
            selectedRowPlanningUnit: '',
            programId1: '',
            fundingSourceId: '',
            budgetId: '',
            totalQuantity: '',
            filteredBudgetList: [],
            budgetList: [],
            planningUnits1: [],
            finalShipmentId: '',
            selectedShipment: [],
            productCategories: [],
            countryList: [],
            parentShipmentId: '',
            planningUnitIdUpdated: '',
            erpPlanningUnitId: '',
            conversionFactorEntered: false,
            searchedValue: '',
            result: '',
            message: '',
            instance: '',
            outputList: [],
            loading: true,
            loading1: false,
            programs: [],
            planningUnits: [],
            outputListAfterSearch: [],
            artmisList: [],
            shipmentId: '',
            reason: "1",
            tracercategoryPlanningUnit: [],
            planningUnitId: '',
            planningUnitName: '',
            autocompleteData: [],
            orderNo: '',
            primeLineNo: '',
            procurementAgentId: '',
            displayButton: false,
            programId: '',
            active1: true,
            active2: false,
            active3: false,
            planningUnitValues: [],
            planningUnitIds: [],
            roNoOrderNo: '',
            notLinkedShipments: [],
            fundingSourceList: [],
            displaySubmitButton: false,
            countryId: '',
            hasSelectAll: true,
            artmisHistoryModal: false,
            batchDetails: [],
            table1Loader: true

        }

        this.filterData = this.filterData.bind(this);
        this.filterErpData = this.filterErpData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.formatLabelHistory = this.formatLabelHistory.bind(this);
        this.formatPlanningUnitLabel = this.formatPlanningUnitLabel.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this);
        this.link = this.link.bind(this);
        this.getProgramList = this.getProgramList.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
        this.buildJExcelERP = this.buildJExcelERP.bind(this);
        this.programChange = this.programChange.bind(this);
        this.countryChange = this.countryChange.bind(this);

        this.programChangeModal = this.programChangeModal.bind(this);
        this.fundingSourceModal = this.fundingSourceModal.bind(this);
        this.budgetChange = this.budgetChange.bind(this);

        this.dataChange = this.dataChange.bind(this);
        this.dataChange1 = this.dataChange1.bind(this);
        this.dataChangeCheckbox = this.dataChangeCheckbox.bind(this);
        this.changed = this.changed.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.getProductCategories = this.getProductCategories.bind(this);
        this.getNotLinkedShipments = this.getNotLinkedShipments.bind(this);
        this.displayShipmentData = this.displayShipmentData.bind(this);
        this.getFundingSourceList = this.getFundingSourceList.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.displayButton = this.displayButton.bind(this);
        this.getPlanningUnitListByRealmCountryId = this.getPlanningUnitListByRealmCountryId.bind(this);
        this.filterProgramByCountry = this.filterProgramByCountry.bind(this);
        this.getPlanningUnitArray = this.getPlanningUnitArray.bind(this);
        this.getShipmentDetailsByParentShipmentId = this.getShipmentDetailsByParentShipmentId.bind(this);
        this.toggleDetailsModal = this.toggleDetailsModal.bind(this);
        this.toggle = this.toggle.bind(this);
        this.toggleArtmisHistoryModal = this.toggleArtmisHistoryModal.bind(this);
        this.viewBatchData = this.viewBatchData.bind(this);
        this.oneditionend = this.oneditionend.bind(this);

    }

    viewBatchData(event, row) {
        console.log("event---", event);
        console.log("row---", row.maxFilename);
        console.log("row length---", row.shipmentList.length);
        if (row.shipmentList.length > 1 || (row.shipmentList.length == 1 && row.shipmentList[0].batchNo != null)) {
            var batchDetails = row.shipmentList.filter(c => (c.fileName === row.maxFilename));

            batchDetails.sort(function (a, b) {
                var dateA = new Date(a.expiryDate).getTime();
                var dateB = new Date(b.expiryDate).getTime();
                return dateA > dateB ? 1 : -1;
            })
            this.setState({
                batchDetails
            });
        } else {
            this.setState({
                batchDetails: []
            });
        }
        // batchDetails
    }


    toggleArtmisHistoryModal() {
        this.setState({
            artmisHistoryModal: !this.state.artmisHistoryModal,
            batchDetails: []
        })
    }
    toggleDetailsModal() {
        this.setState({
            modal: !this.state.modal
        })
    }

    toggle() {
        this.setState({
            modal: !this.state.modal,
        });
    }
    getShipmentDetailsByParentShipmentId(parentShipmentId) {
        ManualTaggingService.getShipmentDetailsByParentShipmentId(parentShipmentId)
            .then(response => {
                let outputListAfterSearch = [];
                outputListAfterSearch.push(response.data)
                this.setState({
                    outputListAfterSearch,
                    originalQty: outputListAfterSearch[0].shipmentQty,
                    tempNotes: (outputListAfterSearch[0].notes != null && outputListAfterSearch[0].notes != "" ? outputListAfterSearch[0].notes : "")
                })
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
    filterProgramByCountry() {
        let programList = this.state.programs;
        let countryId = this.state.countryId;
        let countryWisePrograms;
        if (countryId != -1) {
            countryWisePrograms = programList.filter(c => c.realmCountry.realmCountryId == countryId)
        } else {
            countryWisePrograms = programList;
        }
        if (countryWisePrograms.length == 1) {
            this.setState({
                loading: false,
                loading1: false,
                programId1: countryWisePrograms[0].programId,
                countryWisePrograms
            }, () => {
                this.getNotLinkedShipments();
                this.getPlanningUnitList();
                this.getBudgetListByProgramId();
            });
        } else {
            if (localStorage.getItem("sesProgramIdReport") != '' && localStorage.getItem("sesProgramIdReport") != undefined) {
                this.setState({
                    loading: false,
                    loading1: false,
                    countryWisePrograms,
                    programId1: localStorage.getItem("sesProgramIdReport")
                }, () => {
                    this.getNotLinkedShipments();
                    this.getPlanningUnitList();
                    this.getBudgetListByProgramId();
                });
            } else {
                this.setState({
                    countryWisePrograms,
                    planningUnits: []
                });
            }
        }
    }
    getPlanningUnitListByRealmCountryId() {
        PlanningUnitService.getActivePlanningUnitByRealmCountryId(this.state.countryId)
            .then(response => {
                this.setState({
                    planningUnits1: response.data
                })
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

    cancelClicked() {
        document.getElementById('div2').style.display = 'block';
        if (this.state.active1 || this.state.active2) {
            this.filterData(this.state.planningUnitIds);
        } else {
            this.filterErpData();
        }
        this.setState({
            originalQty: 0,
            message: i18n.t('static.actionCancelled'),
            color: "#BA0C2F",
            planningUnitIdUpdated: '',
            table1Loader: false
        }, () => {
            this.hideSecondComponent();
            this.toggleLarge();
        })

    }
    displayShipmentData() {
        let selectedShipmentId = (this.state.checkboxValue ? parseInt(document.getElementById("notLinkedShipmentId").value) : 0);
        let selectedPlanningUnitId = (!this.state.checkboxValue ? parseInt(document.getElementById("planningUnitId1").value) : 0);
        let selectedShipment;
        if (selectedShipmentId != null && selectedShipmentId != 0 && this.state.checkboxValue) {
            selectedShipment = this.state.notLinkedShipments.filter(c => (c.shipmentId == selectedShipmentId));
        } else {
            selectedShipment = this.state.notLinkedShipments.filter(c => (c.planningUnit.id == selectedPlanningUnitId));
        }
        this.setState({
            finalShipmentId: '',
            selectedShipment
        })
    }
    getNotLinkedShipments() {

        let programId1 = parseInt(this.state.programId1);
        // let planningUnitId = this.state.planningUnitIdUpdated;
        ManualTaggingService.getNotLinkedShipmentListForManualTagging(programId1, 3)
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = a.shipmentId;
                    var itemLabelB = b.shipmentId;
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    notLinkedShipments: listArray
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
    }
    getProductCategories() {
        // AuthenticationService.setupAxiosInterceptors();
        let realmId = AuthenticationService.getRealmId();
        ProductService.getProductCategoryList(realmId)
            .then(response => {
                // response.data.splice(0, 1);
                this.setState({
                    productCategories: response.data.splice(1)
                })
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
    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(10, y);
            if (parseInt(value) == 1) {


                var col = ("H").concat(parseInt(y) + 1);
                if (this.el.getValueFromCoords(0, y)) {
                    var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
                    var value = this.el.getValue(`H${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
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
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

            }
        }
        return valid;
    }

    // -----------start of changed function
    changed = function (instance, cell, x, y, value) {

        //conversion factor
        if (x == 7) {
            var col = ("H").concat(parseInt(y) + 1);
            value = this.el.getValue(`H${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
            var qty = this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
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

                    // `=ROUND(G${parseInt(index) + 1}*H${parseInt(index) + 1},2)`,
                    // this.state.instance.setValueFromCoords(8, y, `=ROUND(G${parseInt(y) + 1}*H${parseInt(y) + 1},0)`, true);
                }

            }
            this.state.instance.setValueFromCoords(8, y, Math.round(qty * (value != null && value != "" ? value : 1)), true);
        }
        // if (x == 0) {
        //     console.log("check box value----------------", value = this.el.getValue(`A${parseInt(y) + 1}`, true).toString().replaceAll(",", ""));
        // }

        // if (x == 9) {

        // }
        if (x == 0) {
            var checkboxValue = this.el.getValue(`A${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            console.log("checkboxValue---", checkboxValue);
            if (checkboxValue == "true") {
                console.log("jexcel instance---", this.state.instance);
                this.state.instance.setValueFromCoords(9, y, this.state.tempNotes, true)
            } else {
                console.log("inside else---", checkboxValue);
                this.state.instance.setValueFromCoords(7, y, "", true);
                this.state.instance.setValueFromCoords(9, y, "", true);
                var qty = this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                this.state.instance.setValueFromCoords(8, y, Math.round(qty), true);
            }
        }
        // //Active
        if (x != 10) {

            this.el.setValueFromCoords(10, y, 1, true);
        }
        this.displayButton();


    }.bind(this);
    // -----end of changed function

    onedit = function (instance, cell, x, y, value) {
        this.el.setValueFromCoords(10, y, 1, true);
    }.bind(this);

    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        var rowData = elInstance.getRowData(y);

        if (x == 7 && !isNaN(rowData[7]) && rowData[7].toString().indexOf('.') != -1) {
            // console.log("RESP---------", parseFloat(rowData[3]));
            elInstance.setValueFromCoords(7, y, parseFloat(rowData[7]), true);
        }
        elInstance.setValueFromCoords(10, y, 1, true);
    }

    onPaste(instance, data) {
        // console.log("DATA------->", data);
        // // console.log("DATA------->1", parseFloat(data[0].value));


        if (data.length == 1 && Object.keys(data[0])[2] == "value") {
            (instance.jexcel).setValueFromCoords(7, data[0].y, parseFloat(data[0].value), true);
        }
        else {
            for (var i = 0; i < data.length; i++) {
                (instance.jexcel).setValueFromCoords(10, data[i].y, 1, true);
            }
        }




    }

    dataChangeCheckbox(event) {
        this.setState({
            selectedShipment: [],
            checkboxValue: (event.target.checked ? true : false)
        })
    }

    dataChange1(event) {
        if (event.target.id == 'active4') {
            this.setState({
                originalQty: 0,
                active4: true,
                active5: false,
                checkboxValue: false,
                tempNotes: ''
            }, () => {
                this.displayButton();
            });
        } else if (event.target.id == 'active5') {
            this.setState({
                originalQty: 0,
                selectedShipment: [],
                active4: false,
                active5: true,
                checkboxValue: false,
                tempNotes: ''
            }, () => {
                this.displayButton();
            });
        }
    }

    dataChange(event) {
        if (event.target.id == 'active1') {
            this.setState({
                programId: (this.state.programId != null && this.state.programId != "" && this.state.programId != -1 ? this.state.programId : -1),
                planningUnitValues: [],
                planningUnitLabels: [],
                planningUnits: [],
                outputList: [],
                active1: true,
                active2: false,
                active3: false,
                tempNotes: ''
            }, () => {
                if (localStorage.getItem("sesProgramIdReport") != '' && localStorage.getItem("sesProgramIdReport") != undefined) {
                    this.setState({
                        programId: localStorage.getItem("sesProgramIdReport")
                    }, () => {
                        this.getPlanningUnitList();
                    });
                } else if (this.state.programId != null && this.state.programId != "" && this.state.programId != -1) {
                    this.getPlanningUnitList();
                }
            });
        } else if (event.target.id == 'active2') {
            this.setState({
                programId: (this.state.programId != null && this.state.programId != "" && this.state.programId != -1 ? this.state.programId : -1),
                planningUnitValues: [],
                planningUnitLabels: [],
                planningUnits: [],
                outputList: [],
                active2: true,
                active1: false,
                active3: false,
                tempNotes: ''
            }, () => {
                if (localStorage.getItem("sesProgramIdReport") != '' && localStorage.getItem("sesProgramIdReport") != undefined) {
                    this.setState({
                        programId: localStorage.getItem("sesProgramIdReport")
                    }, () => {
                        this.getPlanningUnitList();
                    });
                } else if (this.state.programId != null && this.state.programId != "" && this.state.programId != -1) {
                    this.getPlanningUnitList();
                }
            });
        } else {

            this.setState({
                outputList: [],
                planningUnitValues: [],
                productCategoryValues: [],
                planningUnits1: [],
                planningUnits: [],
                countryId: -1,
                active3: true,
                active1: false,
                active2: false,
                tempNotes: ''
            }, () => {
                // this.buildJExcel();
                let realmId = AuthenticationService.getRealmId();
                this.getProductCategories();
                this.getBudgetList();
                this.getFundingSourceList();
                RealmCountryService.getRealmCountryForProgram(realmId)
                    .then(response => {
                        if (response.status == 200) {
                            var listArray = response.data.map(ele => ele.realmCountry);
                            // listArray.sort((a, b) => {
                            //     var itemLabelA = getLabelText(a.country.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                            //     var itemLabelB = getLabelText(b.country.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                            //     return itemLabelA > itemLabelB ? 1 : -1;
                            // });
                            this.setState({
                                countryList: response.data
                            })
                        } else {
                            this.setState({ message: response.data.messageCode })
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


            });
        }
        this.state.languageEl.destroy();
        // this.buildJExcel();
    }

    getBudgetListByProgramId = (e) => {
        let programId1 = this.state.programId1;
        const filteredBudgetList = this.state.budgetList.filter(c => c.program.id == programId1)
        this.setState({
            filteredBudgetList,
            filteredBudgetListByProgram: filteredBudgetList
        });
    }

    getBudgetListByFundingSourceId = (e) => {
        let fundingSourceId = this.state.fundingSourceId;
        const filteredBudgetList = this.state.filteredBudgetListByProgram.filter(c => c.fundingSource.fundingSourceId == fundingSourceId)
        this.setState({
            filteredBudgetList
        });
    }
    getFundingSourceList() {
        FundingSourceService.getFundingSourceListAll()
            .then(response => {
                if (response.status == 200) {
                    let fundingSourceList = response.data.filter(c => c.active == true)
                    this.setState({
                        fundingSourceList
                    }, () => {
                        // this.buildJExcel();
                        // this.filterData();
                    });
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
    }
    getBudgetList = () => {
        BudgetServcie.getBudgetList()
            .then(response => {
                if (response.status == 200) {
                    // let 
                    let budgetList = response.data.filter(c => c.active == true)
                    this.setState({
                        budgetList
                    }, () => {
                        // this.buildJExcel();
                        // this.filterData();
                    });
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
    }
    programChange(event) {
        this.setState({
            planningUnits: [],
            planningUnitValues: [],
            planningUnitLabels: [],
            programId: event.target.value,
            hasSelectAll: true
        }
            , () => {
                this.getPlanningUnitList();
            }
        )
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

    countryChange = (event) => {
        let planningUnits1 = this.state.planningUnits1;
        this.setState({
            planningUnitValues: [],
            productCategoryValues: [],
            planningUnits1: (this.state.productCategoryValues != null && this.state.productCategoryValues != "" ? planningUnits1 : []),
            countryId: event.target.value
        }, () => {
            this.getPlanningUnitListByRealmCountryId();
            this.filterErpData();
        })
    }


    programChangeModal(event) {
        this.setState({
            programId1: event.target.value,
            planningUnits: []
        }, () => {
            this.getNotLinkedShipments();
            this.getPlanningUnitList();
            this.getBudgetListByProgramId();
        })
    }

    fundingSourceModal(event) {
        this.setState({
            fundingSourceId: event.target.value
        }, () => {
            this.getBudgetListByFundingSourceId();
        })
    }

    budgetChange(event) {
        this.setState({
            budgetId: event.target.value
        })
    }


    displayButton() {
        var validation = this.checkValidation();

        var tableJson = this.state.instance.getJson(null, false);
        let count = 0, qty = 0;
        for (var i = 0; i < tableJson.length; i++) {
            var map1 = new Map(Object.entries(tableJson[i]));
            if (this.state.active2) {
                count++;
                if (map1.get("0")) {
                    qty = Number(qty) + Number(this.el.getValue(`I${parseInt(i) + 1}`, true).toString().replaceAll(",", ""));
                }
            }
            else {
                if (parseInt(map1.get("10")) === 1 && map1.get("0")) {
                    console.log("value---", Number(this.el.getValue(`I${parseInt(i) + 1}`, true).toString().replaceAll(",", "")));
                    qty = Number(qty) + Number(this.el.getValue(`I${parseInt(i) + 1}`, true).toString().replaceAll(",", ""));
                    count++;
                }
            }
        }
        console.log("qty---", qty);
        if (validation == true) {

            this.setState({
                displaySubmitButton: (count > 0 ? (this.state.active3 ? ((this.state.active4 || this.state.active5) ? true : false) : true) : false),
                totalQuantity: this.addCommas(qty),
                displayTotalQty: (count > 0 ? true : false)
            })
        } else {
            this.setState({
                displaySubmitButton: false,
                totalQuantity: this.addCommas(qty),
                displayTotalQty: (count > 0 ? true : false)
            })
        }
    }

    link() {
        document.getElementById('div2').style.display = 'block';
        let valid = false;
        var programId = (this.state.active3 ? this.state.programId1 : this.state.programId);
        if (this.state.active3) {
            localStorage.setItem("sesProgramIdReport", programId)
            if (this.state.active5) {
                if (this.state.finalShipmentId != "" && this.state.finalShipmentId != null) {
                    valid = true;
                } else {
                    alert(i18n.t('static.mt.selectShipmentId'));
                }

            } else if (this.state.active4) {
                if (programId == -1) {
                    alert(i18n.t('static.mt.selectProgram'));
                }
                else if (document.getElementById("planningUnitId1").value == -1) {
                    alert(i18n.t('static.mt.selectPlanninfUnit'));
                }
                else if (this.state.fundingSourceId == -1) {
                    alert(i18n.t('static.mt.selectFundingSource'));
                } else if (this.state.budgetId == -1) {
                    alert(i18n.t('static.mt.selectBudget'));
                }


                else {
                    // var cf = window.confirm(i18n.t('static.mt.confirmNewShipmentCreation'));
                    // if (cf == true) {
                    valid = true;
                    // } else { }
                }
            }
        } else {
            valid = true;
        }
        if (valid) {
            this.setState({ loading1: true })
            var validation = this.checkValidation();
            let linkedShipmentCount = 0;
            if (validation == true) {
                var tableJson = this.state.instance.getJson(null, false);
                let changedmtList = [];
                for (var i = 0; i < tableJson.length; i++) {
                    var map1 = new Map(Object.entries(tableJson[i]));
                    if (parseInt(map1.get("10")) === 1) {
                        let json = {
                            parentShipmentId: (this.state.active2 ? this.state.parentShipmentId : 0),
                            programId: programId,
                            fundingSourceId: (this.state.active3 ? this.state.fundingSourceId : 0),
                            budgetId: (this.state.active3 ? this.state.budgetId : 0),
                            shipmentId: (this.state.active3 ? this.state.finalShipmentId : this.state.shipmentId),
                            conversionFactor: this.el.getValue(`H${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                            notes: (map1.get("9") === '' ? null : map1.get("9")),
                            active: map1.get("0"),
                            orderNo: map1.get("11"),
                            primeLineNo: parseInt(map1.get("12")),
                            // planningUnitId: (this.state.active3 ? this.el.getValue(`N${parseInt(i) + 1}`, true).toString().replaceAll(",", "") : 0),
                            planningUnitId: (this.state.active3 ? (this.state.active4 ? document.getElementById("planningUnitId1").value : 0) : 0),
                            quantity: this.el.getValue(`G${parseInt(i) + 1}`, true).toString().replaceAll(",", "")
                        }

                        changedmtList.push(json);
                    }
                    if ((this.state.active2 || this.state.active4) && map1.get("0")) {
                        linkedShipmentCount++;
                    }
                }
                console.log("FINAL SUBMIT changedmtList---", changedmtList);
                if (this.state.active4 && linkedShipmentCount > 1) {
                    alert(i18n.t('static.mt.oneOrderAtATime'));
                    this.setState({
                        loading1: false
                    })

                } else {
                    let goAhead = false;
                    if (this.state.active4) {
                        var cf = window.confirm(i18n.t('static.mt.confirmNewShipmentCreation'));
                        if (cf == true) {
                            goAhead = true;
                        } else {
                            this.setState({
                                loading1: false
                            })
                        }
                    } else {
                        goAhead = true;
                    }
                    let callApiActive2 = false;
                    if (this.state.active2) {
                        let active2GoAhead = false;

                        if (linkedShipmentCount > 0) {
                            active2GoAhead = false
                            callApiActive2 = true
                        } else {
                            active2GoAhead = true
                        }
                        if (active2GoAhead) {
                            // var cf1 = window.confirm(i18n.t('static.mt.confirmNewShipmentCreation'));
                            var cf1 = window.confirm(i18n.t("static.mt.delinkAllShipments"));
                            if (cf1 == true) {
                                callApiActive2 = true;
                            } else {
                                callApiActive2 = false;
                            }
                        }
                    }
                    if (!callApiActive2 && this.state.active2) {
                        this.setState({
                            loading: false,
                            loading1: false
                        });
                    }
                    if (this.state.active1 || (this.state.active3 && this.state.active4 && goAhead) || (this.state.active3 && this.state.active5) || callApiActive2) {
                        console.log("Going to link shipment-----", changedmtList);
                        // for (var i = 0; i <= 2; i++) {
                        // console.log("for loop -----",i);
                        ManualTaggingService.linkShipmentWithARTMIS(changedmtList)
                            .then(response => {
                                console.log("linking response---", response);

                                this.setState({
                                    message: (this.state.active2 ? i18n.t('static.mt.linkingUpdateSuccess') : i18n.t('static.shipment.linkingsuccess')),
                                    color: 'green',
                                    loading: false,
                                    loading1: false,
                                    planningUnitIdUpdated: ''
                                },
                                    () => {

                                        this.hideSecondComponent();
                                        this.toggleLarge();

                                        (this.state.active3 ? this.filterErpData() : this.filterData(this.state.planningUnitIds));

                                    })
                                // }

                            }).catch(
                                error => {
                                    console.log("Linking error-----------", error);
                                    if (error.message === "Network Error") {
                                        this.setState({
                                            message: 'static.unkownError',
                                            color: '#BA0C2F',
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
                                                console.log("500 error--------");
                                                this.setState({
                                                    message: error.response.data.messageCode,
                                                    loading: false,
                                                    loading1: false,
                                                    color: '#BA0C2F',
                                                },
                                                    () => {

                                                        this.hideSecondComponent();
                                                        this.toggleLarge();

                                                        (this.state.active3 ? this.filterErpData() : this.filterData(this.state.planningUnitIds));

                                                    });
                                                break;
                                            case 412:
                                                this.setState({
                                                    message: error.response.data.messageCode,
                                                    loading: false,
                                                    loading1: false,
                                                    color: '#BA0C2F',
                                                },
                                                    () => {

                                                        this.hideSecondComponent();
                                                        this.toggleLarge();

                                                        (this.state.active3 ? this.filterErpData() : this.filterData(this.state.planningUnitIds));

                                                    });
                                                break;
                                            default:
                                                this.setState({
                                                    message: 'static.unkownError',
                                                    loading: false,
                                                    loading1: false,
                                                    color: '#BA0C2F',
                                                });
                                                break;
                                        }
                                    }
                                }
                            );
                        // }
                    }
                }
            }
        }
    }
    getConvertedQATShipmentQty = () => {
        var conversionFactor = document.getElementById("conversionFactor").value;
        // conversionFactor = conversionFactor.slice(0,13)
        conversionFactor = conversionFactor.replace("-", "")
        // var regex = "/^\d{0,6}(\.\d{1,2})?$/";
        // var regResult = regex.test(conversionFactor);

        // Reg start
        var beforeDecimal = 10;
        var afterDecimal = 4;
        conversionFactor = conversionFactor.replace(/[^\d.]/g, '')
            .replace(new RegExp("(^[\\d]{" + beforeDecimal + "})[\\d]", "g"), '$1')
            .replace(/(\..*)\./g, '$1')
            .replace(new RegExp("(\\.[\\d]{" + afterDecimal + "}).", "g"), '$1');
        // Reg end
        var erpShipmentQty = document.getElementById("erpShipmentQty").value;
        if (conversionFactor != null && conversionFactor != "" && conversionFactor != 0) {
            var result = erpShipmentQty * conversionFactor;
            document.getElementById("convertedQATShipmentQty").value = result.toFixed(2);
            this.setState({
                conversionFactorEntered: true
            })
        } else {
            this.setState({ conversionFactorEntered: false })
        }
        document.getElementById("conversionFactor").value = conversionFactor;
    }


    getOrderDetails = () => {
        var roNoOrderNo = (this.state.searchedValue != null && this.state.searchedValue != "" ? this.state.searchedValue : "0");
        var programId = (this.state.active3 ? 0 : document.getElementById("programId").value);
        var erpPlanningUnitId = (this.state.planningUnitIdUpdated != null && this.state.planningUnitIdUpdated != "" ? this.state.planningUnitIdUpdated : 0);
        if ((roNoOrderNo != "" && roNoOrderNo != "0") || (erpPlanningUnitId != 0)) {
            ManualTaggingService.getOrderDetailsByOrderNoAndPrimeLineNo(roNoOrderNo, programId, erpPlanningUnitId, (this.state.active1 ? 1 : (this.state.active2 ? 2 : 3)), (this.state.active2 ? this.state.parentShipmentId : 0))
                .then(response => {
                    console.log("response.data------", response.data)
                    this.setState({
                        artmisList: response.data,
                        displayButton: false
                    }, () => {
                        this.buildJExcelERP();
                    })
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
                                        loading: false,
                                        result: error.response.data.messageCode
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
                artmisList: [],
                displayButton: false
            }, () => {
                if (this.state.buildJexcelRequired) {
                    this.buildJExcelERP();
                }
            })
        }
        // else if (orderNo == "" && primeLineNo == "") {
        //     this.setState({
        //         artmisList: [],
        //         result: i18n.t('static.manualtagging.result'),
        //         alreadyLinkedmessage: ''
        //     })
        // }
        // else if (orderNo == "") {
        //     this.setState({
        //         artmisList: [],
        //         result: i18n.t('static.manualtagging.resultOrderNoBlank'),
        //         alreadyLinkedmessage: ''
        //     })
        // }
        // else if (primeLineNo == "") {
        //     this.setState({
        //         artmisList: [],
        //         result: i18n.t('static.manualtagging.resultPrimeLineNoBlank'),
        //         alreadyLinkedmessage: ''
        //     })
        // }
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

    handlePlanningUnitChange = (planningUnitIds) => {
        planningUnitIds = planningUnitIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            planningUnitValues: planningUnitIds.map(ele => ele),
            planningUnitLabels: planningUnitIds.map(ele => ele.label)
        }, () => {
            this.filterErpData()
        })
    }

    handleProductCategoryChange = (productCategoryIds) => {
        this.setState({
            productCategoryValues: productCategoryIds.map(ele => ele),
            productCategoryLabels: productCategoryIds.map(ele => ele.label),
            planningUnitValues: [],
            planningUnitLabels: [],
            planningUnits1: []
        }, () => {
            if (productCategoryIds.length > 0) {
                this.getPlanningUnitListByProductcategoryIds();
            } else {
                this.getPlanningUnitListByRealmCountryId();
            }
            this.filterErpData();
        })
    }

    getPlanningUnitListByProductcategoryIds = () => {
        PlanningUnitService.getActivePlanningUnitByProductCategoryIds(this.state.productCategoryValues.map(ele => (ele.value).toString()))
            .then(response => {
                this.setState({
                    planningUnits1: response.data
                })
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

    filterErpData() {

        var countryId = this.state.countryId;

        // if (countryId != -1) {
        this.setState({
            loading: true,
            programId1: -1,
            fundingSourceId: -1,
            budgetId: -1
        })
        let productCategoryIdList = this.state.productCategoryValues.length == this.state.productCategories.length && this.state.productCategoryValues.length != 0 ? [] : (this.state.productCategoryValues.length == 0 ? null : this.state.productCategoryValues.map(ele => (ele.value).toString()))
        let planningUnitIdList = this.state.planningUnitValues.length == this.state.planningUnits1.length && this.state.planningUnitValues.length != 0 ? [] : (this.state.planningUnitValues.length == 0 ? null : this.state.planningUnitValues.map(ele => (ele.value).toString()))
        var json = {
            countryId: countryId,
            productCategoryIdList: productCategoryIdList,
            planningUnitIdList: planningUnitIdList,
            linkingType: (this.state.active1 ? 1 : (this.state.active2 ? 2 : 3))
        }
        console.log("length1---", this.state.planningUnitValues.length);
        console.log("length2---", this.state.planningUnits1.length);
        console.log("json---", json);
        if ((this.state.productCategoryValues.length > 0) || (this.state.planningUnitValues.length > 0)) {
            ManualTaggingService.getShipmentListForManualTagging(json)
                .then(response => {
                    this.setState({
                        outputList: response.data
                    }, () => {
                        this.buildJExcel();
                    });
                }).catch(
                    error => {
                        document.getElementById('div2').style.display = 'block';
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
                this.buildJExcel();
            });
        }


    }

    filterData = (planningUnitIds) => {
        var programId = this.state.programId;

        planningUnitIds = planningUnitIds;
        this.setState({
            hasSelectAll: false,
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
                    planningUnitIdList: this.state.planningUnitValues.map(ele => (ele.value).toString()),
                    linkingType: (this.state.active1 ? 1 : (this.state.active2 ? 2 : 3))
                }
                ManualTaggingService.getShipmentListForManualTagging(json)
                    .then(response => {
                        this.setState({
                            outputList: response.data
                        }, () => {
                            if (!this.state.active3) {
                                localStorage.setItem("sesProgramIdReport", programId)
                            }
                            // this.getPlanningUnitListByTracerCategory(planningUnitId);
                            this.buildJExcel();
                        });
                    }).catch(
                        error => {

                            document.getElementById('div2').style.display = 'block';
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
    getPlanningUnitListByTracerCategory = (term) => {
        this.setState({ planningUnitName: term });
        PlanningUnitService.getPlanningUnitByTracerCategory(this.state.planningUnitId, this.state.procurementAgentId, term.toUpperCase())
            .then(response => {
                var tracercategoryPlanningUnit = [];
                for (var i = 0; i < response.data.length; i++) {
                    var label = response.data[i].planningUnit.label.label_en + '(' + response.data[i].skuCode + ')';
                    tracercategoryPlanningUnit[i] = { value: response.data[i].planningUnit.id, label: label }
                }

                var listArray = tracercategoryPlanningUnit;
                listArray.sort((a, b) => {
                    var itemLabelA = a.label.toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = b.label.toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });

                this.setState({
                    tracercategoryPlanningUnit: listArray
                });
                // this.setState({
                //     tracercategoryPlanningUnit: response.data
                // });
                // document.getElementById("erpPlanningUnitId").value = planningUnitId;
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
    searchErpOrderData = (term) => {
        if (term != null && term != "") {
            var erpPlanningUnitId = this.state.planningUnitIdUpdated;
            var programId = this.state.programId;

            ManualTaggingService.searchErpOrderData(term.toUpperCase(), (programId != null && programId != "" ? programId : 0), (erpPlanningUnitId != null && erpPlanningUnitId != "" ? erpPlanningUnitId : 0), (this.state.active1 ? 1 : (this.state.active2 ? 2 : 3)))
                .then(response => {
                    var autocompleteData = [];
                    for (var i = 0; i < response.data.length; i++) {
                        autocompleteData[i] = { value: response.data[i].id, label: response.data[i].label }
                    }
                    this.setState({
                        autocompleteData
                    });
                    // document.getElementById("erpPlanningUnitId").value = planningUnitId;
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
                        this.setState({
                            programs: listArray,
                            loading: false
                        })
                    }

                }
                else {

                    this.setState({
                        message: response.data.messageCode,
                        color: '#BA0C2F',
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

    buildJExcelERP() {
        this.setState({
            table1Loader: false
        },
            () => {

                let erpDataList = this.state.artmisList;
                let erpDataArray = [];
                let count = 0;
                let qty = 0;
                let convertedQty = 0;
                // if (erpDataList.length > 0) {
                for (var j = 0; j < erpDataList.length; j++) {
                    data = [];
                    if (this.state.active3) {
                        data[0] = 0;
                        data[1] = erpDataList[j].erpOrderId;
                        data[2] = erpDataList[j].roNo + ' - ' + erpDataList[j].roPrimeLineNo + " | " + erpDataList[j].orderNo + ' - ' + erpDataList[j].primeLineNo;
                        data[3] = getLabelText(erpDataList[j].erpPlanningUnit.label);
                        data[4] = erpDataList[j].expectedDeliveryDate;
                        data[5] = erpDataList[j].erpStatus;
                        data[6] = erpDataList[j].shipmentQty;
                        data[7] = '';
                        // let convertedQty = this.addCommas(erpDataList[j].shipmentQty * 1);
                        data[8] = erpDataList[j].shipmentQty;
                        data[9] = '';
                        data[10] = 0;
                        data[11] = erpDataList[j].orderNo;
                        data[12] = erpDataList[j].primeLineNo;
                        data[13] = erpDataList[j].erpPlanningUnit.id;

                    } else {
                        console.log("order no ---", erpDataList[j].orderNo + " active---", erpDataList[j].active)
                        data[0] = erpDataList[j].active;
                        data[1] = erpDataList[j].erpOrderId;
                        data[2] = erpDataList[j].roNo + ' - ' + erpDataList[j].roPrimeLineNo + " | " + erpDataList[j].orderNo + ' - ' + erpDataList[j].primeLineNo;
                        data[3] = getLabelText(erpDataList[j].planningUnitLabel);
                        data[4] = erpDataList[j].currentEstimatedDeliveryDate;
                        data[5] = erpDataList[j].status;
                        data[6] = erpDataList[j].quantity;
                        let conversionFactor = (erpDataList[j].conversionFactor != null && erpDataList[j].conversionFactor != "" ? erpDataList[j].conversionFactor : '');
                        data[7] = (erpDataList[j].active ? conversionFactor : "");
                        convertedQty = erpDataList[j].quantity * (erpDataList[j].conversionFactor != null && erpDataList[j].conversionFactor != "" ? erpDataList[j].conversionFactor : 1);
                        data[8] = Math.round((erpDataList[j].active ? convertedQty : erpDataList[j].quantity))
                        data[9] = (erpDataList[j].active ? erpDataList[j].notes : "");
                        data[10] = 0;
                        data[11] = erpDataList[j].orderNo;
                        data[12] = erpDataList[j].primeLineNo;
                        data[13] = 0;
                        if (erpDataList[j].active) {
                            qty = Number(qty) + convertedQty;
                        }
                    }
                    erpDataArray[count] = data;
                    count++;
                }
                this.setState({
                    totalQuantity: this.addCommas(Math.round(qty)),
                    displayTotalQty: (qty > 0 ? true : false)
                });

                this.el = jexcel(document.getElementById("tableDiv1"), '');
                this.el.destroy();
                var json = [];
                var data = erpDataArray;
                // var data = [];

                var options = {
                    data: data,
                    columnDrag: true,
                    colHeaderClasses: ["Reqasterisk"],
                    columns: [
                        {
                            title: i18n.t('static.mt.linkColumn'),
                            type: 'checkbox',
                        },
                        {
                            title: "erpOrderId",
                            type: 'hidden',
                        },
                        {
                            title: i18n.t('static.manualTagging.RONO'),
                            type: 'text',
                            readOnly: true
                        },
                        {
                            title: i18n.t('static.manualTagging.erpPlanningUnit'),
                            type: 'text',
                            readOnly: true
                        },
                        {
                            title: i18n.t('static.supplyPlan.mtexpectedDeliveryDate'),
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
                            title: i18n.t('static.manualTagging.erpShipmentQty'),
                            type: 'numeric',
                            mask: '#,##', decimal: '.',
                            readOnly: true
                        },
                        {
                            title: i18n.t('static.manualTagging.conversionFactor'),
                            type: 'numeric',
                            mask: '#,##.0000',
                            decimal: '.',
                            textEditor: true,
                            disabledMaskOnEdition: true

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
                            title: 'isChange',
                            type: 'hidden'
                        },
                        {
                            title: 'orderNo',
                            type: 'hidden'
                        },
                        {
                            title: 'primeLineNo',
                            type: 'hidden'
                        },
                        {
                            title: 'erpPlanningUnitId',
                            type: 'hidden'
                        }
                    ],
                    // footers: [['Total','1','1','1','1',0,0,0,0]],
                    editable: true,
                    text: {
                        showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                        show: '',
                        entries: '',
                    },
                    onload: this.loadedERP,
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
                    allowDeleteRow: false,
                    onchange: this.changed,
                    updateTable: function (el, cell, x, y, source, value, id) {
                        var elInstance = el.jexcel;
                        if (y != null) {
                            var rowData = elInstance.getRowData(y);
                            if (rowData[0]) {
                                var cell = elInstance.getCell(("H").concat(parseInt(y) + 1))
                                cell.classList.remove('readonly');
                            } else {
                                var cell = elInstance.getCell(("H").concat(parseInt(y) + 1))
                                cell.classList.add('readonly');
                            }
                        }
                    }.bind(this),
                    oneditionend: this.oneditionend,
                    copyCompatibility: true,
                    allowManualInsertRow: false,
                    parseFormulas: true,
                    onpaste: this.onPaste,
                    // oneditionend: this.oneditionend,
                    text: {
                        // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                        showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                        show: '',
                        entries: '',
                    },

                    license: JEXCEL_PRO_KEY,
                    contextMenu: function (obj, x, y, e) {
                        return false;
                    }.bind(this),

                };
                var instance = jexcel(document.getElementById("tableDiv1"), options);
                this.el = instance;
                this.setState({
                    instance, loading: false,
                    buildJexcelRequired: true,
                    table1Loader: true
                })
                // }
            })
    }

    buildJExcel() {
        let manualTaggingList = this.state.outputList;
        let manualTaggingArray = [];
        let count = 0;

        for (var j = 0; j < manualTaggingList.length; j++) {
            data = [];
            if (this.state.active1) {
                data[0] = manualTaggingList[j].shipmentId
                data[1] = manualTaggingList[j].shipmentTransId
                data[2] = getLabelText(manualTaggingList[j].planningUnit.label, this.state.lang)
                data[3] = manualTaggingList[j].expectedDeliveryDate
                data[4] = getLabelText(manualTaggingList[j].shipmentStatus.label, this.state.lang)
                data[5] = manualTaggingList[j].procurementAgent.code
                data[6] = manualTaggingList[j].orderNo
                data[7] = manualTaggingList[j].shipmentQty
                data[8] = manualTaggingList[j].notes
            } else if (this.state.active2) {
                let shipmentQty = manualTaggingList[j].shipmentQty;
                data[0] = manualTaggingList[j].parentShipmentId
                data[1] = manualTaggingList[j].shipmentId
                data[2] = manualTaggingList[j].shipmentTransId
                data[3] = manualTaggingList[j].roNo + " - " + manualTaggingList[j].roPrimeLineNo + " | " + manualTaggingList[j].orderNo + " - " + manualTaggingList[j].primeLineNo
                data[4] = getLabelText(manualTaggingList[j].erpPlanningUnit.label, this.state.lang)
                data[5] = getLabelText(manualTaggingList[j].planningUnit.label, this.state.lang)
                data[6] = manualTaggingList[j].expectedDeliveryDate
                data[7] = manualTaggingList[j].erpStatus
                data[8] = Math.round(manualTaggingList[j].shipmentQty)
                data[9] = (manualTaggingList[j].conversionFactor != null && manualTaggingList[j].conversionFactor != "" ? (manualTaggingList[j].conversionFactor) : 1)
                data[10] = Math.round(shipmentQty * (manualTaggingList[j].conversionFactor != null && manualTaggingList[j].conversionFactor != "" ? manualTaggingList[j].conversionFactor : 1))
                data[11] = manualTaggingList[j].notes
                data[12] = manualTaggingList[j].orderNo
                data[13] = manualTaggingList[j].primeLineNo
            }
            else {
                data[0] = manualTaggingList[j].erpOrderId
                data[1] = manualTaggingList[j].roNo + " - " + manualTaggingList[j].roPrimeLineNo + " | " + manualTaggingList[j].orderNo + " - " + manualTaggingList[j].primeLineNo
                data[2] = getLabelText(manualTaggingList[j].erpPlanningUnit.label, this.state.lang)
                data[3] = manualTaggingList[j].expectedDeliveryDate
                data[4] = manualTaggingList[j].erpStatus
                data[5] = manualTaggingList[j].shipmentQty

            }
            manualTaggingArray[count] = data;
            count++;
        }

        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = manualTaggingArray;
        if (this.state.active1) {
            var options = {
                data: data,
                columnDrag: true,
                colWidths: [20, 40, 25, 20, 20, 40, 40, 25, 25],
                colHeaderClasses: ["Reqasterisk"],
                columns: [

                    {
                        title: i18n.t('static.commit.qatshipmentId'),
                        type: 'numeric'
                        // mask: '#,##', decimal: '.'
                    },
                    {
                        title: "shipmentTransId",
                        type: 'hidden',
                    },
                    {
                        title: i18n.t('static.supplyPlan.qatProduct'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.supplyPlan.mtexpectedDeliveryDate'),
                        type: 'calendar',
                        options: { format: JEXCEL_DATE_FORMAT },
                    },
                    {
                        title: i18n.t('static.supplyPlan.mtshipmentStatus'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.report.procurementAgentName'),
                        type: 'text',
                    }
                    ,
                    {
                        title: i18n.t('static.manualTagging.procOrderNo'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.supplyPlan.shipmentQty'),
                        type: 'numeric',
                        mask: '#,##', decimal: '.'
                    },
                    {
                        title: i18n.t('static.common.notes'),
                        type: 'text',
                    },
                ],
                editable: false,
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


                oneditionend: this.onedit,
                copyCompatibility: true,
                allowExport: false,
                paginationOptions: JEXCEL_PAGINATION_OPTION,
                position: 'top',
                filters: true,
                license: JEXCEL_PRO_KEY,
                contextMenu: function (obj, x, y, e) {
                    return false;
                }.bind(this),
            };
        }

        else if (this.state.active2) {
            var options = {
                data: data,
                columnDrag: true,
                colWidths: [20, 20, 40, 45, 45, 45, 30, 30, 35, 25, 35, 35],
                colHeaderClasses: ["Reqasterisk"],
                columns: [
                    {
                        title: i18n.t('static.mt.parentShipmentId'),
                        type: 'numeric'
                        // mask: '#,##', decimal: '.'
                    },
                    {
                        title: i18n.t('static.mt.childShipmentId'),
                        type: 'numeric'
                        // mask: '#,##', decimal: '.'
                    },
                    {
                        title: "shipmentTransId",
                        type: 'hidden',
                    },
                    {
                        title: i18n.t('static.manualTagging.procOrderNo'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.manualTagging.erpPlanningUnit'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.supplyPlan.qatProduct'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.manualTagging.currentEstimetedDeliveryDate'),
                        type: 'calendar',
                        options: { format: JEXCEL_DATE_FORMAT },
                    },
                    {
                        title: i18n.t('static.manualTagging.erpStatus'),
                        type: 'text',
                    },

                    {
                        title: i18n.t('static.supplyPlan.shipmentQty'),
                        type: 'numeric',
                        mask: '#,##', decimal: '.'
                    },
                    {
                        title: i18n.t('static.manualTagging.conversionFactor'),
                        type: 'numeric',
                        mask: '#,##.0000', decimal: '.'
                    },

                    {
                        title: i18n.t('static.manualTagging.convertedQATShipmentQty'),
                        type: 'numeric',
                        mask: '#,##', decimal: '.'
                    },

                    {
                        title: i18n.t('static.common.notes'),
                        type: 'text',
                    },
                    {
                        title: "orderNo",
                        type: 'hidden',
                    },
                    {
                        title: "primeLineNo",
                        type: 'hidden',
                    },
                ],
                editable: false,
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
                                title: i18n.t('static.mt.viewArtmisHistory'),
                                onclick: function () {
                                    let orderNo = this.el.getValueFromCoords(12, y);
                                    let primeLineNo = this.el.getValueFromCoords(13, y);
                                    ManualTaggingService.getARTMISHistory(orderNo, primeLineNo)
                                        .then(response => {

                                            let responseData = response.data.sort(function (a, b) {
                                                var dateA = new Date(a.receivedOn).getTime();
                                                var dateB = new Date(b.receivedOn).getTime();
                                                return dateA < dateB ? 1 : -1;
                                            })
                                            console.log("history---", response.data);
                                            responseData = responseData.filter((responseData, index, self) =>
                                                index === self.findIndex((t) => (
                                                    t.procurementAgentOrderNo === responseData.procurementAgentOrderNo && t.erpPlanningUnit.id === responseData.erpPlanningUnit.id && t.calculatedExpectedDeliveryDate === responseData.calculatedExpectedDeliveryDate && t.erpStatus === responseData.erpStatus && t.shipmentQty === responseData.shipmentQty && t.totalCost === responseData.totalCost
                                                    && (t.shipmentList.length > 1 || (t.shipmentList.length == 1 && t.shipmentList[0].batchNo != null)) == (responseData.shipmentList.length > 1 || (responseData.shipmentList.length == 1 && responseData.shipmentList[0].batchNo != null))
                                                ))
                                            )
                                            console.log("history-2--", responseData);

                                            responseData = responseData.sort(function (a, b) {
                                                var dateA = a.erpOrderId;
                                                var dateB = b.erpOrderId;
                                                return dateA < dateB ? 1 : -1;
                                            })
                                            console.log("DATA---->3", responseData);

                                            this.setState({
                                                artmisHistory: responseData
                                            }, () => {
                                                // this.buildARTMISHistory();
                                                this.toggleArtmisHistoryModal();
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
                }.bind(this),
            };
        }
        else if (this.state.active3) {
            var options = {
                data: data,
                columnDrag: true,
                colWidths: [20, 20, 40, 45, 45, 45],
                colHeaderClasses: ["Reqasterisk"],
                columns: [

                    {
                        title: "erpOrderId",
                        type: 'hidden',
                    },
                    {
                        title: i18n.t('static.manualTagging.procOrderNo'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.manualTagging.erpPlanningUnit'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.manualTagging.currentEstimetedDeliveryDate'),
                        type: 'calendar',
                        options: { format: JEXCEL_DATE_FORMAT },
                    },
                    {
                        title: i18n.t('static.manualTagging.erpStatus'),
                        type: 'text',
                    },

                    {
                        title: i18n.t('static.supplyPlan.shipmentQty'),
                        type: 'numeric',
                        mask: '#,##', decimal: '.'
                    },
                ],
                editable: false,
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


                oneditionend: this.onedit,
                copyCompatibility: true,
                allowExport: false,
                paginationOptions: JEXCEL_PAGINATION_OPTION,
                position: 'top',
                filters: true,
                license: JEXCEL_PRO_KEY,
                contextMenu: function (obj, x, y, e) {
                    return false;
                }.bind(this),
            };
        }
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
        var asterisk = document.getElementsByClassName("resizable")[2];
        var tr = asterisk.firstChild;
        tr.children[8].classList.add('AsteriskTheadtrTd');
    }

    selected = function (instance, cell, x, y, value) {

        if ((x == 0 && value != 0) || (y == 0)) {
            // console.log("HEADER SELECTION--------------------------");
        } else {
            var outputListAfterSearch = [];
            let row;
            let json;
            let buildJexcelRequired = true;
            if (this.state.active1) {
                row = this.state.outputList.filter(c => (c.shipmentId == this.el.getValueFromCoords(0, x)))[0];
                outputListAfterSearch.push(row);
                if (outputListAfterSearch[0].orderNo != null && outputListAfterSearch[0].orderNo != "") {
                    json = { id: outputListAfterSearch[0].orderNo, label: outputListAfterSearch[0].orderNo };
                } else {
                    json = { id: '', label: '' };
                    buildJexcelRequired = false;
                }
                this.setState({
                    tempNotes: (outputListAfterSearch[0].notes != null && outputListAfterSearch[0].notes != "" ? outputListAfterSearch[0].notes : ""),
                    originalQty: outputListAfterSearch[0].shipmentQty,
                    outputListAfterSearch,
                    buildJexcelRequired,
                    roNoOrderNo: json,
                    table1Loader : outputListAfterSearch[0].orderNo != null && outputListAfterSearch[0].orderNo != "" ? false : true,
                    searchedValue: (outputListAfterSearch[0].orderNo != null && outputListAfterSearch[0].orderNo != "" ? outputListAfterSearch[0].orderNo : ""),
                    selectedRowPlanningUnit: outputListAfterSearch[0].planningUnit.id
                    // planningUnitIdUpdated: outputListAfterSearch[0].planningUnit.id
                }, () => {

                    this.getOrderDetails();
                });
            } else if (this.state.active2) {
                row = this.state.outputList.filter(c => (c.shipmentId == this.el.getValueFromCoords(1, x)))[0];
                outputListAfterSearch.push(row);
                json = { id: outputListAfterSearch[0].roNo, label: outputListAfterSearch[0].roNo };
                this.setState({
                    parentShipmentId: outputListAfterSearch[0].parentShipmentId,
                    roNoOrderNo: json,
                    searchedValue: outputListAfterSearch[0].roNo,
                    selectedRowPlanningUnit: outputListAfterSearch[0].erpPlanningUnit.id
                    // planningUnitIdUpdated: outputListAfterSearch[0].erpPlanningUnit.id
                }, () => {
                    this.getOrderDetails();
                    this.getShipmentDetailsByParentShipmentId(this.el.getValueFromCoords(0, x));
                });
            } else {
                row = this.state.outputList.filter(c => (c.erpOrderId == this.el.getValueFromCoords(0, x)))[0];
                outputListAfterSearch.push(row);
                json = { id: outputListAfterSearch[0].roNo, label: outputListAfterSearch[0].roNo };

                this.setState({
                    originalQty: 0,
                    outputListAfterSearch,
                    selectedShipment: [],
                    roNoOrderNo: json,
                    searchedValue: outputListAfterSearch[0].roNo
                    // planningUnitIdUpdated: outputListAfterSearch[0].erpPlanningUnit.id
                }, () => {
                    this.filterProgramByCountry();
                    this.getOrderDetails();
                });
            }
            // outputListAfterSearch.push(row);
            // console.log("1------------------------------>>>>", outputListAfterSearch[0].erpPlanningUnit.id)
            this.setState({
                planningUnitId: (this.state.active2 || this.state.active3 ? outputListAfterSearch[0].erpPlanningUnit.id : outputListAfterSearch[0].planningUnit.id),
                shipmentId: (this.state.active1 ? this.el.getValueFromCoords(0, x) : (this.state.active2 ? this.el.getValueFromCoords(1, x) : 0)),
                procurementAgentId: (this.state.active3 ? 1 : outputListAfterSearch[0].procurementAgent.id),
                planningUnitName: (this.state.active2 || this.state.active3 ? row.erpPlanningUnit.label.label_en + "(" + row.skuCode + ")" : row.planningUnit.label.label_en + '(' + row.skuCode + ')')
            })
            this.toggleLarge();
        }
    }.bind(this);


    componentDidMount() {
        this.setState({ active1: true }, () => {
            this.hideFirstComponent();
            this.getProgramList();
        });

    }

    getPlanningUnitList() {
        var programId = (this.state.active3 ? this.state.programId1 : this.state.programId);
        if (programId != -1 && programId != null && programId != "") {
            ProgramService.getProgramPlaningUnitListByProgramId(programId)
                .then(response => {
                    if (response.status == 200) {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });

                        listArray = listArray.filter(c => (c.active == true))
                        this.setState({
                            planningUnits: listArray
                        }, () => {
                            if (!this.state.active3) {
                                this.getPlanningUnitArray();
                            }
                        })
                    }
                    else {

                        this.setState({
                            message: response.data.messageCode,
                            color: '#BA0C2F'
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
                outputList: []
            }, () => {
                this.state.languageEl.destroy();
            })
        }
        // this.filterData();

    }

    formatLabel(cell, row) {
        if (cell != null && cell != "") {
            console.log("cell----", cell)
            return getLabelText(cell, this.state.lang);
        } else {
            return "";
        }
    }

    formatLabelHistory(cell, row) {
        if (cell != null && cell != "") {
            console.log("cell----", cell)
            return getLabelText(cell.label, this.state.lang);
        } else {
            return "";
        }
    }

    formatPlanningUnitLabel(cell, row) {
        if (cell != null && cell != "") {
            if (row.skuCode != null && row.skuCode != "") {
                return getLabelText(cell, this.state.lang) + " (" + row.skuCode + ")";
            } else {
                return getLabelText(cell, this.state.lang);
            }
        } else {
            return "";
        }
    }

    toggleLarge() {
        // this.getPlanningUnitListByTracerCategory(this.state.planningUnitId, this.state.procurementAgentId);
        this.setState({
            displaySubmitButton: false,
            displayTotalQty: false,
            selectedRowPlanningUnit: this.state.planningUnitId,
            artmisList: [],
            reason: "1",
            totalQuantity: '',
            result: '',
            manualTag: !this.state.manualTag,
            active4: false,
            active5: false
        })
    }

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

    formatDate(cell, row) {
        if (cell != null && cell != "") {
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

    render() {
        const selectRow = {
            mode: 'radio',
            clickToSelect: true,
            // columnWidth: '10px',
            selectionHeaderRenderer: () => i18n.t('static.mt.selectShipment'),
            headerColumnStyle: {
                headerAlign: 'center'

                // align:  function callback(cell, row, rowIndex, colIndex) { 
                //     console.log("my row----------------------")
                //     return "center" }
            },
            onSelect: (row, isSelect, rowIndex, e) => {
                console.log("my row---", row);
                this.setState({
                    originalQty: row.shipmentQty,
                    finalShipmentId: row.shipmentId,
                    tempNotes: (row.notes != null && row.notes != "" ? row.notes : "")
                });
            }
        };
        const { programs } = this.state;
        let programList = programs.length > 0 && programs.map((item, i) => {
            return (
                <option key={i} value={item.programId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>
            )
        }, this);

        const { countryWisePrograms } = this.state;
        let filteredProgramList = countryWisePrograms.length > 0 && countryWisePrograms.map((item, i) => {
            return (
                <option key={i} value={item.programId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>
            )
        }, this);


        const { planningUnits } = this.state;
        let planningUnitList = planningUnits.length > 0 && planningUnits.map((item, i) => {
            return (
                <option key={i} value={item.planningUnit.id}>
                    {getLabelText(item.planningUnit.label, this.state.lang)}
                </option>
            )
        }, this);


        const { fundingSourceList } = this.state;
        let newFundingSourceList = fundingSourceList.length > 0 && fundingSourceList.map((item, i) => {
            return (
                <option key={i} value={item.fundingSourceId}>
                    {item.fundingSourceCode}
                </option>
            )
        }, this);


        const { filteredBudgetList } = this.state;
        let newBudgetList = filteredBudgetList.length > 0 && filteredBudgetList.map((item, i) => {
            return (
                <option key={i} value={item.budgetId}>
                    {item.budgetCode}
                </option>
            )
        }, this);


        const { notLinkedShipments } = this.state;
        let shipmentIdList = notLinkedShipments.length > 0 && notLinkedShipments.map((item, i) => {
            return (
                <option key={i} value={item.shipmentId}>
                    {item.shipmentId}
                </option>
            )
        }, this);

        const { productCategories } = this.state;
        let productCategoryMultList = productCategories.length > 0 && productCategories.map((item, i) => {
            return ({ label: getLabelText(item.payload.label, this.state.lang), value: item.payload.productCategoryId })
        }, this);

        let planningUnitMultiList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return ({ label: getLabelText(item.planningUnit.label, this.state.lang), value: item.planningUnit.id })

            }, this);

        planningUnitMultiList = Array.from(planningUnitMultiList);

        const { planningUnits1 } = this.state;
        let planningUnitMultiList1 = planningUnits1.length > 0
            && planningUnits1.map((item, i) => {
                return ({ label: getLabelText(item.label, this.state.lang), value: item.id })

            }, this);


        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        const columns = [
            {
                dataField: 'planningUnit.label',
                text: i18n.t('static.supplyPlan.qatProduct'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '40px' },
                formatter: this.formatPlanningUnitLabel
            },
            {
                dataField: 'shipmentId',
                text: i18n.t('static.commit.qatshipmentId'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '20px' }
            },
            {
                dataField: 'orderNo',
                text: i18n.t('static.manualTagging.procOrderNo'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '20px' }
            },
            {
                dataField: 'shipmentTransId',
                hidden: true,
            },
            {
                dataField: 'expectedDeliveryDate',
                text: i18n.t('static.supplyPlan.mtexpectedDeliveryDate'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatDate,
                style: { width: '30px' }
            },
            {
                dataField: 'shipmentStatus.label',
                text: i18n.t('static.supplyPlan.mtshipmentStatus'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '20px' },
                formatter: this.formatLabel
            }, {
                dataField: 'procurementAgent.code',
                text: i18n.t('static.report.procurementAgentName'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '30px' }
                // formatter: this.formatLabel
            },
            //  {
            //     dataField: 'fundingSource.code',
            //     text: i18n.t('static.fundingSourceHead.fundingSource'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center',
            //     style: { width: '40px' }
            // },
            // {
            //     dataField: 'budget.label.label_en',
            //     text: i18n.t('static.budgetHead.budget'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center',
            //     style: { width: '40px' }
            //     // formatter: this.formatLabel
            // },
            {
                dataField: 'shipmentQty',
                text: i18n.t('static.supplyPlan.shipmentQty'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas,
                style: { width: '25px' }
            },
            {
                dataField: 'notes',
                text: i18n.t('static.common.notes'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '40px' }
                // formatter: this.formatLabel
            }

        ];

        const columns1 = [
            {
                dataField: 'erpOrderId',
                text: i18n.t('static.mt.viewBatchDetails'),
                align: 'center',
                headerAlign: 'center',
                formatter: (cellContent, row) => {
                    // return (<i className="fa fa-eye eyeIconFontSize" title={i18n.t('static.mt.viewBatchDetails')} onClick={(event) => this.viewBatchData(event, row)} ></i>
                    // )
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
                text: i18n.t('static.manualTagging.erpPlanningUnit'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatLabelHistory
            },

            {
                dataField: 'calculatedExpectedDeliveryDate',
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
            },
            {
                dataField: 'batchQty',
                text: i18n.t('static.supplyPlan.shipmentQty'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas
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
                text: 'All', value: this.state.outputList.length
            }]
        }

        const { countryList } = this.state;
        let countries = countryList.length > 0
            && countryList.map((item, i) => {
                return (
                    <option key={i} value={item.realmCountry.id}>
                        {getLabelText(item.realmCountry.label, this.state.lang)}
                    </option>
                )
            }, this);
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.props.match.params.color} id="div1" style={{ color: '#BA0C2F' }}>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className={this.state.color} id="div2" style={{ color: '#BA0C2F' }}>{i18n.t(this.state.message, { entityname })}</h5>
                {/* <Card style={{ display: this.state.loading ? "none" : "block" }}> */}
                <Card>
                    <div className="Card-header-reporticon">
                        <div className="card-header-actions">
                            <a className="card-header-action">
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.toggleDetailsModal() }}><small className="supplyplanformulas">{i18n.t('static.mt.showDetails')}</small></span>
                            </a>
                        </div>
                    </div>
                    <CardBody className="pb-lg-5">
                        {/* <Col md="10 ml-0"> */}
                        <b><div className="col-md-11 pl-3" style={{ 'marginLeft': '-15px', 'marginTop': '-13px' }}> <span style={{ 'color': '#002f6c', 'fontSize': '13px' }}>{i18n.t('static.mt.masterDataSyncNote')}</span></div></b><br />

                        <div className="col-md-12 pl-0">
                            <Row>

                                <FormGroup className="pl-3">
                                    {/* <Label className="P-absltRadio">{i18n.t('static.common.status')}</Label> */}
                                    <FormGroup check inline style={{ 'marginLeft': '-52px' }}
                                    >
                                        <Input
                                            className="form-check-input"
                                            type="radio"
                                            id="active1"
                                            name="active"
                                            value={true}
                                            title={i18n.t('static.mt.tab1Purpose')}
                                            checked={this.state.active1 == true}
                                            onChange={(e) => { this.dataChange(e) }}
                                        />
                                        <Label
                                            className="form-check-label"
                                            check htmlFor="inline-radio1"
                                            title={i18n.t('static.mt.tab1Purpose')}>
                                            {i18n.t('static.mt.notLinkedQAT')}
                                        </Label>
                                    </FormGroup>
                                    <FormGroup check inline
                                    >
                                        <Input
                                            className="form-check-input"
                                            type="radio"
                                            id="active2"
                                            name="active"
                                            value={false}
                                            title={i18n.t('static.mt.tab2Purpose')}
                                            checked={this.state.active2 === true}
                                            onChange={(e) => { this.dataChange(e) }}
                                        />
                                        <Label
                                            className="form-check-label"
                                            check htmlFor="inline-radio2"
                                            title={i18n.t('static.mt.tab2Purpose')}>
                                            {i18n.t('static.mt.linked')}
                                        </Label>
                                    </FormGroup>
                                    <FormGroup check inline
                                    >
                                        <Input
                                            className="form-check-input"
                                            type="radio"
                                            id="active3"
                                            name="active"
                                            value={false}
                                            title={i18n.t('static.mt.tab3Purpose')}
                                            checked={this.state.active3 === true}
                                            onChange={(e) => { this.dataChange(e) }}
                                        />
                                        <Label
                                            className="form-check-label"
                                            check htmlFor="inline-radio2"
                                            title={i18n.t('static.mt.tab3Purpose')}>
                                            {i18n.t('static.mt.notLinkedERP')}
                                        </Label>
                                    </FormGroup>
                                </FormGroup>
                            </Row>
                        </div>
                        {/* </Col> */}

                        {/* {this.state.active1 &&
                            <>
                                <b><div className="col-md-12 pl-3" style={{ 'marginLeft': '-15px' }}> <span style={{ 'color': '#002f6c', 'fontSize': '13px' }}>{i18n.t('static.mt.tab1Purpose')}</span></div></b><br />
                            </>
                        }
                        {this.state.active2 &&
                            <>
                                <b><div className="col-md-12 pl-3" style={{ 'marginLeft': '-15px' }}> <span style={{ 'color': '#002f6c', 'fontSize': '13px' }}>{i18n.t('static.mt.tab2Purpose')}</span></div></b><br />
                            </>
                        }
                        {this.state.active3 &&
                            <>
                                <b><div className="col-md-12 pl-3" style={{ 'marginLeft': '-15px' }}> <span style={{ 'color': '#002f6c', 'fontSize': '13px' }}>{i18n.t('static.mt.tab3Purpose')}</span></div></b><br />
                            </>
                        } */}
                        <div className="col-md-12 pl-0">
                            <Row>
                                {this.state.active3 &&
                                    <>
                                        <FormGroup className="col-md-3 ">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.region.country')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="countryId"
                                                        id="countryId"
                                                        bsSize="sm"
                                                        value={this.state.countryId}
                                                        onChange={(e) => { this.countryChange(e); }}
                                                    >
                                                        <option value="-1">{i18n.t('static.common.select')}</option>
                                                        {countries}
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.productcategory')}</Label>
                                            <div className="controls ">
                                                {/* <InMultiputGroup> */}
                                                <MultiSelect
                                                    // type="select"
                                                    name="productCategoryId"
                                                    id="productCategoryId"
                                                    bsSize="sm"
                                                    value={this.state.productCategoryValues}
                                                    onChange={(e) => { this.handleProductCategoryChange(e) }}
                                                    options={productCategoryMultList && productCategoryMultList.length > 0 ? productCategoryMultList : []}
                                                />

                                            </div>
                                        </FormGroup>
                                    </>}
                                {(this.state.active1 || this.state.active2) &&
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
                                    </FormGroup>}
                                {this.state.active3 &&
                                    <FormGroup className="col-md-3">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.procurementUnit.planningUnit')}</Label>
                                        <div className="controls ">
                                            {/* <InMultiputGroup> */}
                                            <MultiSelect
                                                // type="select"
                                                name="planningUnitId2"
                                                id="planningUnitId2"
                                                bsSize="sm"
                                                value={this.state.planningUnitValues}
                                                onChange={(e) => { this.handlePlanningUnitChange(e) }}
                                                options={planningUnitMultiList1 && planningUnitMultiList1.length > 0 ? planningUnitMultiList1 : []}
                                            />
                                            {/* <option value="0">{i18n.t('static.common.select')}</option> */}
                                            {/* {planningUnitList} */}

                                            {/* </MultiSelect> */}

                                            {/* </InputMultiGroup> */}
                                        </div>
                                    </FormGroup>}


                                {(this.state.active1 || this.state.active2) &&
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
                                                labelledBy={i18n.t('static.common.select')}
                                            />
                                            {/* <option value="0">{i18n.t('static.common.select')}</option> */}
                                            {/* {planningUnitList} */}

                                            {/* </MultiSelect> */}

                                            {/* </InputMultiGroup> */}
                                        </div>
                                    </FormGroup>}
                            </Row>

                            <div className="ReportSearchMarginTop" style={{ display: this.state.loading ? "none" : "block" }}>
                                <div id="tableDiv" className="jexcelremoveReadonlybackground RowClickable">
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


                        </div>


                        {/* Consumption modal */}
                        <Modal isOpen={this.state.manualTag}
                            className={'modal-lg ' + this.props.className, "modalWidth"}>
                            <div style={{ display: this.state.loading1 ? "none" : "block" }}>
                                <ModalHeader className="modalHeaderSupplyPlan hideCross">
                                    <strong>{i18n.t('static.manualTagging.searchErpOrders')}</strong>
                                    <strong>{this.state.duplicateOrderNo && 'Already Linked'}</strong>
                                    <Button size="md" color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1" onClick={() => this.cancelClicked()} disabled={(this.state.table1Loader ? false : true)}> <i className="fa fa-times"></i></Button>
                                </ModalHeader>
                                <ModalBody>
                                    <div>
                                        <p><h5><b>{i18n.t('static.manualTagging.qatShipmentTitle')}</b></h5></p>
                                        {!this.state.active3 &&
                                            <ToolkitProvider
                                                keyField="optList"
                                                data={this.state.outputListAfterSearch}
                                                columns={columns}
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
                                                            <BootstrapTable striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                                                // pagination={paginationFactory(options)}
                                                                rowEvents={{
                                                                }}
                                                                {...props.baseProps}
                                                            />
                                                        </div>
                                                    )
                                                }
                                            </ToolkitProvider>}
                                        {this.state.active3 &&
                                            <>
                                                <div className="col-md-12">
                                                    <Row>

                                                        <FormGroup className="pl-3">
                                                            {/* <Label className="P-absltRadio">{i18n.t('static.common.status')}</Label> */}
                                                            <FormGroup check inline style={{ 'marginLeft': '-52px' }}>
                                                                <Input
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    id="active4"
                                                                    name="active"
                                                                    value={true}
                                                                    checked={this.state.active4 === true}
                                                                    onChange={(e) => { this.dataChange1(e) }}
                                                                />
                                                                <Label
                                                                    className="form-check-label"
                                                                    check htmlFor="inline-radio1">
                                                                    {i18n.t('static.mt.createNewShipment')}
                                                                </Label>
                                                            </FormGroup>
                                                            <FormGroup check inline>
                                                                <Input
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    id="active5"
                                                                    name="active"
                                                                    value={false}
                                                                    checked={this.state.active5 === true}
                                                                    onChange={(e) => { this.dataChange1(e) }}
                                                                />
                                                                <Label
                                                                    className="form-check-label"
                                                                    check htmlFor="inline-radio2">
                                                                    {i18n.t('static.mt.selectExistingShipment')}
                                                                </Label>
                                                            </FormGroup>
                                                        </FormGroup>

                                                    </Row>
                                                    <Row>
                                                        {(this.state.active4 || this.state.active5) &&
                                                            <FormGroup className="col-md-3 ">
                                                                <Label htmlFor="appendedInputButton">{i18n.t('static.inventory.program')}<span class="red Reqasterisk">*</span></Label>
                                                                <div className="controls ">
                                                                    <InputGroup>
                                                                        <Input
                                                                            type="select"
                                                                            name="programId1"
                                                                            id="programId1"
                                                                            bsSize="sm"
                                                                            value={this.state.programId1}
                                                                            // onChange={this.getPlanningUnitList}
                                                                            onChange={(e) => { this.programChangeModal(e); }}
                                                                        >
                                                                            <option value="-1">{i18n.t('static.common.select')}</option>
                                                                            {filteredProgramList}
                                                                        </Input>
                                                                    </InputGroup>
                                                                </div>
                                                            </FormGroup>}
                                                        {this.state.active5 &&
                                                            <>
                                                                <FormGroup check inline>
                                                                    <Input
                                                                        className="form-check-input"
                                                                        type="checkbox"
                                                                        id="active6"
                                                                        name="active"
                                                                        checked={this.state.checkboxValue}
                                                                        onChange={(e) => { this.dataChangeCheckbox(e) }}
                                                                    />
                                                                    <Label
                                                                        className="form-check-label"
                                                                        check htmlFor="inline-radio2">
                                                                        <b>{i18n.t('static.mt.filterByShipmentId')}</b>
                                                                    </Label>
                                                                </FormGroup>
                                                                {this.state.checkboxValue &&
                                                                    <FormGroup className="col-md-3 pl-0">
                                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.commit.qatshipmentId')}</Label>
                                                                        <div className="controls ">
                                                                            <InputGroup>
                                                                                <Input
                                                                                    type="select"
                                                                                    name="notLinkedShipmentId"
                                                                                    id="notLinkedShipmentId"
                                                                                    bsSize="sm"
                                                                                    onChange={this.displayShipmentData}
                                                                                >
                                                                                    <option value="0">{i18n.t('static.common.select')}</option>
                                                                                    {shipmentIdList}
                                                                                </Input>
                                                                            </InputGroup>
                                                                        </div>
                                                                    </FormGroup>}
                                                            </>}
                                                        {(this.state.active4 || (this.state.active5 && !this.state.checkboxValue)) &&
                                                            <FormGroup className="col-md-3 ">
                                                                <Label htmlFor="appendedInputButton">{i18n.t('static.procurementUnit.planningUnit')}{this.state.active4 && <span class="red Reqasterisk">*</span>}</Label>
                                                                <div className="controls ">
                                                                    <InputGroup>
                                                                        <Input
                                                                            type="select"
                                                                            name="planningUnitId1"
                                                                            id="planningUnitId1"
                                                                            bsSize="sm"
                                                                            // value={this.state.programId}
                                                                            onChange={this.displayShipmentData}
                                                                        // onChange={(e) => { this.programChange(e); this.getPlanningUnitList(e) }}
                                                                        >
                                                                            <option value="-1">{i18n.t('static.common.select')}</option>
                                                                            {planningUnitList}
                                                                        </Input>
                                                                    </InputGroup>
                                                                </div>
                                                            </FormGroup>}
                                                        {this.state.active4 &&
                                                            <FormGroup className="col-md-3 ">
                                                                <Label htmlFor="appendedInputButton">{i18n.t('static.budget.fundingsource')}<span class="red Reqasterisk">*</span></Label>
                                                                <div className="controls ">
                                                                    <InputGroup>
                                                                        <Input
                                                                            type="select"
                                                                            name="fundingSourceId"
                                                                            id="fundingSourceId"
                                                                            bsSize="sm"
                                                                            value={this.state.fundingSourceId}
                                                                            // onChange={this.getBudgetListByFundingSourceId}
                                                                            onChange={(e) => { this.fundingSourceModal(e); }}
                                                                        >
                                                                            <option value="-1">{i18n.t('static.common.select')}</option>
                                                                            {newFundingSourceList}
                                                                        </Input>
                                                                    </InputGroup>
                                                                </div>
                                                            </FormGroup>}
                                                        {this.state.active4 &&
                                                            <FormGroup className="col-md-3 ">
                                                                <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.budget')}<span class="red Reqasterisk">*</span></Label>
                                                                <div className="controls ">
                                                                    <InputGroup>
                                                                        <Input
                                                                            type="select"
                                                                            name="budgetId"
                                                                            id="budgetId"
                                                                            bsSize="sm"
                                                                            value={this.state.budgetId}
                                                                            // onChange={this.getPlanningUnitList}
                                                                            onChange={(e) => { this.budgetChange(e) }}
                                                                        >
                                                                            <option value="-1">{i18n.t('static.common.select')}</option>
                                                                            {newBudgetList}
                                                                        </Input>
                                                                    </InputGroup>
                                                                </div>
                                                            </FormGroup>}
                                                    </Row>
                                                </div>
                                                {this.state.active5 &&
                                                    <ToolkitProvider
                                                        keyField="shipmentId"
                                                        data={this.state.selectedShipment}
                                                        columns={columns}
                                                        search={{ searchFormatted: true }}
                                                        hover
                                                        filter={filterFactory()}
                                                    >
                                                        {
                                                            props => (
                                                                <div className="FortablewidthMannualtaggingtable1 height-auto">

                                                                    <BootstrapTable
                                                                        // keyField='erpOrderId'
                                                                        ref={n => this.node = n}
                                                                        selectRow={selectRow}
                                                                        striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell

                                                                        rowEvents={{

                                                                        }}
                                                                        {...props.baseProps}
                                                                    />
                                                                </div>
                                                            )
                                                        }
                                                    </ToolkitProvider>}
                                            </>
                                        }
                                    </div><br />
                                    <div>
                                        <p><h5><b>{i18n.t('static.manualTagging.erpShipment')}</b></h5></p>
                                        <Col md="12 pl-0">
                                            <div className="d-md-flex">
                                                <FormGroup className="col-md-6">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.manualTagging.erpPlanningUnit')}</Label>
                                                    <div className="controls ">
                                                        <Autocomplete
                                                            id="combo-box-demo1"
                                                            // value={this.state.selectedPlanningUnit}
                                                            // defaultValue={{ id: this.state.planningUnitIdUpdated, label: this.state.planningUnitName }}
                                                            options={this.state.tracercategoryPlanningUnit}
                                                            getOptionLabel={(option) => option.label}
                                                            style={{ width: 450 }}
                                                            onChange={(event, value) => {
                                                                // console.log("demo2 value---", value);
                                                                if (value != null) {
                                                                    this.setState({
                                                                        erpPlanningUnitId: value.value,
                                                                        planningUnitIdUpdated: value.value,
                                                                        planningUnitName: value.label
                                                                    }, () => { this.getOrderDetails() });
                                                                } else {
                                                                    this.setState({
                                                                        erpPlanningUnitId: '',
                                                                        planningUnitIdUpdated: '',
                                                                        planningUnitName: '',
                                                                        tracercategoryPlanningUnit: []
                                                                    }, () => { this.getOrderDetails() });
                                                                }

                                                            }} // prints the selected value
                                                            renderInput={(params) => <TextField
                                                                {...params}
                                                                // InputProps={{ style: { fontSize: 12.24992 } }}
                                                                variant="outlined"
                                                                onChange={(e) => this.getPlanningUnitListByTracerCategory(e.target.value)} />}
                                                        />

                                                    </div>
                                                </FormGroup>

                                                <FormGroup className="col-md-6 pl-0">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.manualTagging.search')}</Label>
                                                    <div className="controls "
                                                    >
                                                        <Autocomplete
                                                            id="combo-box-demo"
                                                            // value={this.state.roNoOrderNo}
                                                            defaultValue={this.state.roNoOrderNo}
                                                            options={this.state.autocompleteData}
                                                            getOptionLabel={(option) => option.label}
                                                            style={{ width: 450 }}
                                                            onChange={(event, value) => {
                                                                // console.log("combo 2 ro combo box---", value)
                                                                if (value != null) {
                                                                    this.setState({
                                                                        searchedValue: value.label
                                                                        ,
                                                                        roNoOrderNo: value.label
                                                                    }, () => { this.getOrderDetails() });
                                                                } else {
                                                                    this.setState({
                                                                        searchedValue: ''
                                                                        , autocompleteData: []
                                                                    }, () => { this.getOrderDetails() });
                                                                }

                                                            }} // prints the selected value
                                                            renderInput={(params) => <TextField {...params} variant="outlined"
                                                                onChange={(e) => {
                                                                    this.searchErpOrderData(e.target.value)
                                                                }} />}
                                                        />

                                                    </div>
                                                </FormGroup>

                                            </div>
                                        </Col>
                                        <div id="tableDiv1" className="RemoveStriped" style={{ display: this.state.table1Loader ? "block" : "none" }}>
                                        </div>
                                        <div style={{ display: this.state.table1Loader ? "none" : "block" }}>
                                            <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                                <div class="align-items-center">
                                                    <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                                                    <div class="spinner-border blue ml-4" role="status">

                                                    </div>
                                                </div>
                                            </div>
                                        </div>


                                    </div><br />
                                </ModalBody>
                                <ModalFooter>
                                    <b><h3 className="float-right">{i18n.t('static.mt.originalQty')} : {this.state.active4 ? this.state.totalQuantity : this.addCommas(this.state.originalQty)}</h3></b>
                                    {this.state.displayTotalQty && <b><h3 className="float-right">{i18n.t('static.mt.totalQty')} : {this.state.totalQuantity}</h3></b>}

                                    {this.state.displaySubmitButton && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.link}> <i className="fa fa-check"></i>{(this.state.active2 ? i18n.t('static.common.update') : i18n.t('static.manualTagging.link'))}</Button>}

                                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.cancelClicked()} disabled={(this.state.table1Loader ? false : true)}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}
                                    </Button>

                                </ModalFooter>
                            </div>
                            <div style={{ display: this.state.loading1 ? "block" : "none" }}>
                                <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                    <div class="align-items-center">
                                        <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>

                                        <div class="spinner-border blue ml-4" role="status">

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Modal>
                        {/* Consumption modal */}
                        {/* Details modal start */}
                        <Modal isOpen={this.state.modal} className={'modal-xl ' + this.props.className} >
                            <ModalHeader toggle={this.toggle} className="ModalHead modal-info-Headher">
                                <strong className="TextWhite" >{i18n.t('static.mt.showDetails')}</strong>
                            </ModalHeader>
                            <ModalBody >
                                <ListGroup style={{ height: '490px', overflowY: 'scroll' }}>
                                    <ListGroupItem >
                                        <ListGroupItemHeading className="formulasheading">{i18n.t('static.mt.purposeOfEachScreen')}</ListGroupItemHeading>
                                        <ListGroupItemText className="formulastext">
                                            <p><span className="formulastext-p">{i18n.t("static.mt.notLinkedQAT") + " :"}</span><br></br>

                                                {i18n.t("static.mt.tab1DetailPurpose")}<br></br>
                                            </p>

                                            <p><span className="formulastext-p">{i18n.t("static.mt.linked") + " :"}</span><br></br>

                                                {i18n.t("static.mt.tab2DetailPurpose")}<br></br>
                                            </p>

                                            <p><span className="formulastext-p">{i18n.t("static.mt.notLinkedERP") + " :"}</span><br></br>

                                                {i18n.t("static.mt.tab3DetailPurpose")}<br></br>
                                            </p>
                                        </ListGroupItemText>
                                    </ListGroupItem>
                                    <ListGroupItem >
                                        <ListGroupItemHeading className="formulasheading">{i18n.t('static.mt.reminders')}</ListGroupItemHeading>
                                        <ListGroupItemText className="formulastext">
                                            <ul className="list-group">
                                                <li class="list-summery  "> <i class="fa fa-circle list-summer-iconMt " aria-hidden="true"></i> &nbsp;&nbsp;<p>{i18n.t("static.mt.reminders1")}

                                                </p></li>
                                                <li class="list-summery  "> <i class="fa fa-circle list-summer-iconMt " aria-hidden="true"></i> &nbsp;&nbsp;<p>{i18n.t("static.mt.reminders2")}
                                                    <br />    <ol className="list-group list-groupMt">
                                                        <li class="list-summery  "> <i class="fa fa-circle-o  list-summer-iconMt " aria-hidden="true"></i> &nbsp;&nbsp;<p>{i18n.t("static.mt.reminders2A")}
                                                            <br />    <ol className="list-group list-groupMt">
                                                                <li class="list-summery  "> <i class="fa fa-square list-summer-iconMt1 " aria-hidden="true"></i> &nbsp;&nbsp;<p>{i18n.t("static.mt.reminders2A1")}</p></li>
                                                            </ol>
                                                            <ol className="list-group list-groupMt">
                                                                <li class="list-summery  "> <i class="fa fa-square list-summer-iconMt1 " aria-hidden="true"></i> &nbsp;&nbsp;<p>{i18n.t("static.mt.reminders2A2")}</p></li>
                                                            </ol>
                                                            <ol className="list-group list-groupMt">
                                                                <li class="list-summery  "> <i class="fa fa-square list-summer-iconMt1 " aria-hidden="true"></i> &nbsp;&nbsp;<p>{i18n.t("static.mt.reminders2A3")}</p></li>
                                                            </ol>
                                                        </p></li>
                                                    </ol>
                                                    <ol className="list-group list-groupMt">
                                                        <li class="list-summery  "> <i class="fa fa-circle-o list-summer-iconMt " aria-hidden="true"></i> &nbsp;&nbsp;<p>{i18n.t("static.mt.reminders2B")}
                                                            <br />    <ol className="list-group list-groupMt">
                                                                <li class="list-summery  "> <i class="fa fa-square list-summer-iconMt1 " aria-hidden="true"></i> &nbsp;&nbsp;<p>{i18n.t("static.mt.reminders2B1")}</p></li>
                                                            </ol>
                                                            <ol className="list-group list-groupMt">
                                                                <li class="list-summery  "> <i class="fa fa-square list-summer-iconMt1 " aria-hidden="true"></i> &nbsp;&nbsp;<p>{i18n.t("static.mt.reminders2B2")}</p></li>
                                                            </ol>
                                                        </p></li>
                                                    </ol>
                                                    <ol className="list-group list-groupMt">
                                                        <li class="list-summery  "> <i class="fa fa-circle-o list-summer-iconMt " aria-hidden="true"></i> &nbsp;&nbsp;<p>{i18n.t("static.mt.reminders2C")}</p></li>
                                                    </ol>
                                                    <ol className="list-group list-groupMt">
                                                        <li class="list-summery  "> <i class="fa fa-circle-o list-summer-iconMt " aria-hidden="true"></i> &nbsp;&nbsp;<p>{i18n.t("static.mt.reminders2D")}
                                                            <ol className="list-group list-groupMt">
                                                                <li class="list-summery  "><img src={conversionFormula} className="formula-img-mr img-fluid" /></li>
                                                            </ol>
                                                            <ol className="list-group list-groupMt">
                                                                <li class="list-summery  "> <i class="fa fa-square list-summer-iconMt1 " aria-hidden="true"></i> &nbsp;&nbsp;<p>{i18n.t("static.mt.reminders2D1a")}<b>{i18n.t("static.mt.reminders2D1b")}</b>{i18n.t("static.mt.reminders2D1c")}</p></li>
                                                            </ol>
                                                            <ol className="list-group list-groupMt">
                                                                <li class="list-summery  "> <i class="fa fa-square list-summer-iconMt1 " aria-hidden="true"></i> &nbsp;&nbsp;<p>{i18n.t("static.mt.reminders2D2a")}<b>{i18n.t("static.mt.reminders2D2b")}</b>{i18n.t("static.mt.reminders2D2c")}</p></li>
                                                            </ol>
                                                            <ol className="list-group list-groupMt">
                                                                <li class="list-summery  ">
                                                                    <p><b><u><span className="">{i18n.t("static.common.example") + ": "}</span></u></b>{i18n.t("static.mt.reminders2D3")}<br></br>

                                                                    </p>

                                                                </li>
                                                            </ol>
                                                            <ol className="list-group list-groupMt">
                                                                <li class="list-summery  "><img src={conversionFormulaExample} className="formula-img-mr img-fluid" /></li>
                                                            </ol>

                                                            <ol className="list-group list-groupMt">
                                                                <li class="list-summery  ">
                                                                    <Table id="mytable1" responsive className="table-fixed table-bordered text-center mt-2">
                                                                        <thead>
                                                                            <tr>
                                                                                <th>{i18n.t("static.manualTagging.erpPlanningUnit")}</th>
                                                                                <th>{i18n.t("static.manualTagging.erpShipmentQty")}</th>
                                                                                <th>{i18n.t("static.manualTagging.conversionFactor")}</th>
                                                                                <th>{i18n.t("static.manualTagging.convertedQATShipmentQty")}</th>
                                                                                <th>{i18n.t("static.supplyPlan.qatProduct")}</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            <tr>
                                                                                <td>{i18n.t("static.mt.reminders2D4a")}</td>
                                                                                <td>{i18n.t("static.mt.reminders2D4b")}</td>
                                                                                <td>{i18n.t("static.mt.reminders2D4c")}</td>
                                                                                <td>{i18n.t("static.mt.reminders2D4d")}</td>
                                                                                <td>{i18n.t("static.mt.reminders2D4e")}</td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </Table>
                                                                </li>
                                                            </ol>

                                                        </p></li>
                                                    </ol>
                                                </p>
                                                </li>
                                                <li class="list-summery  "> <i class="fa fa-circle list-summer-iconMt " aria-hidden="true"></i> &nbsp;&nbsp;<p>{i18n.t("static.mt.reminders3")}
                                                    <br />    <ol className="list-group list-groupMt">
                                                        <li class="list-summery  "> <i class="fa fa-circle-o list-summer-iconMt " aria-hidden="true"></i> &nbsp;&nbsp;<p>{i18n.t("static.mt.reminders3A")}</p></li>
                                                    </ol>
                                                </p></li>
                                                <li class="list-summery  "> <i class="fa fa-circle list-summer-iconMt " aria-hidden="true"></i> &nbsp;&nbsp;<p>{i18n.t("static.mt.reminders4")}
                                                    <br />    <ol className="list-group list-groupMt">
                                                        <li class="list-summery  "> <i class="fa fa-circle-o list-summer-iconMt " aria-hidden="true"></i> &nbsp;&nbsp;<p>{i18n.t("static.mt.reminders4A")}</p></li>
                                                    </ol>
                                                </p></li>
                                            </ul>
                                        </ListGroupItemText>
                                    </ListGroupItem>
                                </ListGroup>
                            </ModalBody>
                        </Modal>
                        {/* Details modal end */}

                        {/* ARTMIS history modal start */}
                        <Modal isOpen={this.state.artmisHistoryModal}
                            className={'modal-lg ' + this.props.className, "modalWidth"}>
                            {/* <div style={{ display: this.state.loading1 ? "none" : "block" }}> */}
                            <div>
                                <ModalHeader className="modalHeaderSupplyPlan hideCross">
                                    <strong>{i18n.t('static.mt.erpHistoryTitle')}</strong>
                                    <Button size="md" color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1" onClick={() => this.toggleArtmisHistoryModal()}> <i className="fa fa-times"></i></Button>
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
                                                    <div className="TableCust FortablewidthMannualtaggingtable3 reactTableNotification">
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
                                        <br />
                                        {this.state.batchDetails.length > 0 &&
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
                                                        <div className="TableCust ShipmentNotificationtable ">
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
                                            </ToolkitProvider>}

                                    </div><br />
                                </ModalBody>
                                <ModalFooter>
                                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.toggleArtmisHistoryModal()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                </ModalFooter>
                            </div>

                        </Modal>
                        {/* ARTMIS history modal end */}
                    </CardBody>
                </Card>

            </div>
        );
    }

}