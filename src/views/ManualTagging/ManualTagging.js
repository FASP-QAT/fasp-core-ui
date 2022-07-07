import React, { Component } from 'react';
import AuthenticationService from '../Common/AuthenticationService.js';
import { Table, ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText, Card, CardHeader, CardBody, FormGroup, Input, InputGroup, Label, Button, Col, Row, Modal, ModalBody, ModalFooter, ModalHeader, CardFooter } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import getLabelText from '../../CommonComponent/getLabelText';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import { STRING_TO_DATE_FORMAT, JEXCEL_DATE_FORMAT, DATE_FORMAT_CAP, DATE_FORMAT_CAP_WITHOUT_DATE, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY, SHIPMENT_ID_ARR_MANUAL_TAGGING, PSM_PROCUREMENT_AGENT_ID, DELIVERED_SHIPMENT_STATUS, BATCH_PREFIX, SHIPMENT_MODIFIED, NONE_SELECTED_DATA_SOURCE_ID, USD_CURRENCY_ID } from '../../Constants.js';
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
import { generateRandomAplhaNumericCode, isSiteOnline, paddingZero } from '../../CommonComponent/JavascriptCommonFunctions.js';
import { MultiSelect } from 'react-multi-select-component';
import conversionFormula from '../../assets/img/conversionFormula.png';
import conversionFormulaExample from '../../assets/img/conversionFormulaExample.png';
import { getDatabase } from '../../CommonComponent/IndexedDbFunctions.js';
import CryptoJS from 'crypto-js'
import { calculateSupplyPlan } from '../SupplyPlan/SupplyPlanCalculations.js';


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
            tempShipmentId: '',
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
            table1Loader: true,
            versionList: [],
            versionId: -1,
            changedDataForTab2: false

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
        this.changeTab2 = this.changeTab2.bind(this);
        this.delink = this.delink.bind(this);
    }

    versionChange(event) {
        this.setState({
            loading: true
        })
        var versionId = event.target.value;
        localStorage.setItem("sesVersionIdReport", versionId);
        this.setState({
            versionId: versionId,
            hasSelectAll: true
        }, () => {
            if (versionId != -1) {
                this.getPlanningUnitList()
            } else {
                this.setState({
                    planningUnits: [],
                    loading: false
                })
            }
        })
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
                        }, () => {
                            this.hideSecondComponent()
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
                                }, () => {
                                    this.hideSecondComponent()
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent()
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent()
                                });
                                break;
                        }
                    }
                }
            );
    }
    filterProgramByCountry() {
        let programList = this.state.programObjectStoreList;
        let countryId = this.state.countryId;
        let countryWisePrograms;
        if (countryId != -1) {
            countryWisePrograms = programList.filter(c => c.realmCountry.realmCountryId == countryId)
        } else {
            countryWisePrograms = programList;
        }
        var setOfProgramIds = [...new Set(countryWisePrograms.map(ele => ele.programId))]
        var localProgramList = this.state.programQPLDetailsList.filter(c => setOfProgramIds.includes(c.programId))
        if (localProgramList.length == 1) {
            this.setState({
                // loading: false,
                // loading1: false,
                programId1: localProgramList[0].id,
                countryWisePrograms: localProgramList
            }, () => {
                this.getOrderDetails();
                this.getNotLinkedShipments();
                this.getPlanningUnitList();
                this.getBudgetListByProgramId();
            });
        } else {
            // if (localStorage.getItem("sesProgramIdReport") != '' && localStorage.getItem("sesProgramIdReport") != undefined) {
            //     this.setState({
            //         loading: false,
            //         loading1: false,
            //         countryWisePrograms: localProgramList,
            //         // programId1: localStorage.getItem("sesProgramIdReport")
            //     }, () => {
            //         this.getOrderDetails();
            //         this.getNotLinkedShipments();
            //         this.getPlanningUnitList();
            //         this.getBudgetListByProgramId();
            //     });
            // } else {
            this.setState({
                countryWisePrograms: localProgramList,
                planningUnits: []
            });
            // }
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
                        }, () => {
                            this.hideSecondComponent()
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
                                }, () => {
                                    this.hideSecondComponent()
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent()
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent()
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
        for (var ss = 0; ss < selectedShipment.length; ss++) {
            selectedShipment[ss].tempIndex = selectedShipment[ss].shipmentId > 0 ? selectedShipment[ss].shipmentId : selectedShipment[ss].tempShipmentId;
        }
        // if(this.state.checkboxValue){

        // }
        this.setState({
            finalShipmentId: '',
            tempShipmentId: '',
            selectedShipment
        }, () => {
            this.getOrderDetails()
        })
    }
    getNotLinkedShipments() {
        let programId1 = this.state.programId1;
        console.log("programId1@@@@@@@@@@@@@", programId1)
        if (programId1 != "") {
            var shipmentList = [];
            var localProgramList = this.state.localProgramList;
            var localProgramListFilter = localProgramList.filter(c => c.id == programId1);
            var planningUnitDataList = localProgramListFilter[0].programData.planningUnitDataList;
            for (var pu = 0; pu < planningUnitDataList.length; pu++) {
                var planningUnitData = planningUnitDataList[pu];
                var programDataBytes = CryptoJS.AES.decrypt(planningUnitData.planningUnitData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var planningUnitDataJson = JSON.parse(programData);
                shipmentList = shipmentList.concat(planningUnitDataJson.shipmentList);
            }
            shipmentList = shipmentList.filter(c => c.erpFlag.toString() == "false" && c.active.toString() == "true" && c.accountFlag.toString() == "true" && c.procurementAgent.id == PSM_PROCUREMENT_AGENT_ID && SHIPMENT_ID_ARR_MANUAL_TAGGING.includes(c.shipmentStatus.id.toString()));
            shipmentList = shipmentList.filter(c => (moment(c.expectedDeliveryDate).format("YYYY-MM-DD") < moment(Date.now()).subtract(6, 'months').format("YYYY-MM-DD") && ([3, 4, 5, 6, 9]).includes(c.shipmentStatus.id.toString())) || (moment(c.expectedDeliveryDate).format("YYYY-MM-DD") >= moment(Date.now()).subtract(6, 'months').format("YYYY-MM-DD") && SHIPMENT_ID_ARR_MANUAL_TAGGING.includes(c.shipmentStatus.id.toString())));
            var listArray = shipmentList;
            listArray.sort((a, b) => {
                var itemLabelA = a.shipmentId;
                var itemLabelB = b.shipmentId;
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
                notLinkedShipments: listArray
            });
        }
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
                        }, () => {
                            this.hideSecondComponent()
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
                                }, () => {
                                    this.hideSecondComponent()
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent()
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent()
                                });
                                break;
                        }
                    }
                }
            );

    }

    checkValidationTab2 = function () {
        var valid = true;
        var json = this.state.languageEl.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            // var value = this.el.getValueFromCoords(10, y);
            var rowData = json[y];
            if (rowData[20] == 0) {


                var col = ("K").concat(parseInt(y) + 1);
                if (this.state.languageEl.getValueFromCoords(0, y)) {
                    var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
                    var value = this.state.languageEl.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                    value = value.replace(/,/g, "");
                    if (value == "") {
                        this.state.languageEl.setStyle(col, "background-color", "transparent");
                        this.state.languageEl.setStyle(col, "background-color", "yellow");
                        this.state.languageEl.setComments(col, i18n.t('static.label.fieldRequired'));
                        valid = false;
                    } else {
                        // if (isNaN(Number.parseInt(value)) || value < 0 || !(reg.test(value))) {
                        if (!(reg.test(value))) {
                            this.state.languageEl.setStyle(col, "background-color", "transparent");
                            this.state.languageEl.setStyle(col, "background-color", "yellow");
                            this.state.languageEl.setComments(col, i18n.t('static.message.invalidnumber'));
                            valid = false;
                        } else {
                            this.state.languageEl.setStyle(col, "background-color", "transparent");
                            this.state.languageEl.setComments(col, "");
                        }

                    }
                } else {
                    this.state.languageEl.setStyle(col, "background-color", "transparent");
                    this.state.languageEl.setComments(col, "");
                }

            }
        }
        return valid;
    }

    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            // var value = this.el.getValueFromCoords(10, y);
            var rowData = json[y];
            if (rowData[13] == 0) {


                var col = ("K").concat(parseInt(y) + 1);
                if (this.el.getValueFromCoords(0, y)) {
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
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

            }
        }
        return valid;
    }

    // -----------start of changed function

    changeTab2 = function (instance, cell, x, y, value) {
        if (!this.state.changedDataForTab2) {
            this.setState({
                changedDataForTab2: true
            })
        }
        var rowData = this.el.getRowData(y);
        if (this.el.getValueFromCoords(22, y) == 0) {
            this.el.setValueFromCoords(22, y, 1, true);
        }
        if (rowData[20] == 0) {
            if (x == 0) {
                var json = this.el.getJson(null, false);
                var checkboxValue = this.el.getValue(`A${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                if (checkboxValue.toString() == "true") {

                    for (var j = 0; j < json.length; j++) {
                        if (json[j][21] == this.el.getValueFromCoords(21, y, true)) {
                            if (j != y) {
                                this.el.setValueFromCoords(0, j, true, true);
                            }
                        }
                    }
                } else {
                    console.log("inside else---", checkboxValue);
                    for (var j = 0; j < json.length; j++) {
                        this.el.setValueFromCoords(10, j, this.el.getValueFromCoords(23, j), true);
                        this.el.setValueFromCoords(12, j, this.el.getValueFromCoords(24, j), true);
                        if (j != y && json[j][21] == this.el.getValueFromCoords(21, y, true)) {
                            this.el.setValueFromCoords(0, j, false, true);
                        }
                    }
                }
            }

            if (x == 10) {
                var col = ("K").concat(parseInt(y) + 1);
                value = this.el.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
                var qty = this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                console.log("x@@@@@@@@@@@@", x)
                console.log("y@@@@@@@@@@@@", y)
                console.log("Value@@@@@@@@@@@@", value)
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
                        this.el.setComments(col, "");
                        var json = this.el.getJson(null, false);
                        // var checkboxValue = this.el.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                        for (var j = 0; j < json.length; j++) {
                            if (j != y && json[j][21] == this.el.getValueFromCoords(21, y, true)) {
                                this.el.setValueFromCoords(10, j, value, true);
                            }
                        }
                    }
                }
            }
            if (x == 12) {
                var json = this.el.getJson(null, false);
                // var checkboxValue = this.el.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                for (var j = 0; j < json.length; j++) {
                    if (j != y && json[j][21] == this.el.getValueFromCoords(21, y, true)) {
                        this.el.setValueFromCoords(12, j, value, true);
                    }
                }
            }

        }
    }

    changed = function (instance, cell, x, y, value) {

        var rowData = this.state.instance.getRowData(y);
        if (rowData[13] == 0) {
            //conversion factor
            var json = this.state.instance.getJson(null, false);
            if (x == 10) {
                var col = ("K").concat(parseInt(y) + 1);
                value = this.el.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
                var qty = this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                console.log("x@@@@@@@@@@@@", x)
                console.log("y@@@@@@@@@@@@", y)
                console.log("Value@@@@@@@@@@@@", value)
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
                        this.el.setComments(col, "");
                        if (rowData[0].toString() == "true") {
                            for (var j = 0; j < json.length; j++) {
                                // console.log("J@@@@@@@@################",j)
                                // console.log("y@@@@@@@@################",y)
                                // console.log("value@@@@@@@@################",this.state.instance.getValueFromCoords(1, y, true))
                                // console.log("jsonvalue@@@@@@@@################",json[j][1])
                                if (json[j][16] == this.state.instance.getValueFromCoords(16, y, true)) {
                                    if (j != y) {
                                        this.state.instance.setValueFromCoords(10, j, value, true);
                                    }
                                }
                            }
                        }

                        // `=ROUND(G${parseInt(index) + 1}*H${parseInt(index) + 1},2)`,
                        // this.state.instance.setValueFromCoords(8, y, `=ROUND(G${parseInt(y) + 1}*H${parseInt(y) + 1},0)`, true);
                    }

                }
                // this.state.instance.setValueFromCoords(8, y, Math.round(qty * (value != null && value != "" ? value : 1)), true);
            }
            if (x == 12) {
                var col = ("M").concat(parseInt(y) + 1);
                value = this.el.getValue(`M${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                // var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
                // var qty = this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                // console.log("x@@@@@@@@@@@@", x)
                // console.log("y@@@@@@@@@@@@", y)
                // console.log("Value@@@@@@@@@@@@", value)
                // if (value == "") {
                //     this.el.setStyle(col, "background-color", "transparent");
                //     this.el.setStyle(col, "background-color", "yellow");
                //     this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                // } else {
                //     // if (isNaN(Number.parseInt(value)) || value < 0 || !(reg.test(value))) {
                //     if (!(reg.test(value))) {
                //         this.el.setStyle(col, "background-color", "transparent");
                //         this.el.setStyle(col, "background-color", "yellow");
                //         this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                //     } else {
                if (rowData[0].toString() == "true") {
                    for (var j = 0; j < json.length; j++) {
                        // console.log("J@@@@@@@@################",j)
                        // console.log("y@@@@@@@@################",y)
                        // console.log("value@@@@@@@@################",this.state.instance.getValueFromCoords(1, y, true))
                        // console.log("jsonvalue@@@@@@@@################",json[j][1])
                        if (json[j][16] == this.state.instance.getValueFromCoords(16, y, true)) {
                            if (j != y) {
                                this.state.instance.setValueFromCoords(12, j, value, true);
                            }
                        }
                    }
                }

                // `=ROUND(G${parseInt(index) + 1}*H${parseInt(index) + 1},2)`,
                // this.state.instance.setValueFromCoords(8, y, `=ROUND(G${parseInt(y) + 1}*H${parseInt(y) + 1},0)`, true);
                // }

                // }
                // this.state.instance.setValueFromCoords(8, y, Math.round(qty * (value != null && value != "" ? value : 1)), true);
            }
            // if (x == 0) {
            //     console.log("check box value----------------", value = this.el.getValue(`A${parseInt(y) + 1}`, true).toString().replaceAll(",", ""));
            // }

            // if (x == 9) {

            // }
            if (x == 0) {
                var checkboxValue = this.el.getValue(`A${parseInt(y) + 1}`, true).toString().replaceAll(",", "");

                console.log("Json@@@@@@@@@@@@", json)
                console.log("Json@@@@@@@@@@@@", json.length)
                if (checkboxValue.toString() == "true") {

                    for (var j = 0; j < json.length; j++) {
                        // console.log("J@@@@@@@@################",j)
                        // console.log("y@@@@@@@@################",y)
                        // console.log("value@@@@@@@@################",this.state.instance.getValueFromCoords(1, y, true))
                        // console.log("jsonvalue@@@@@@@@################",json[j][1])
                        if (json[j][16] == this.state.instance.getValueFromCoords(16, y, true)) {
                            if (j != y) {
                                this.state.instance.setValueFromCoords(0, j, true, true);
                            }
                        }
                    }
                    // console.log("jexcel instance---", this.state.instance);
                    // this.state.instance.setValueFromCoords(9, y, this.state.tempNotes, true)
                } else {
                    console.log("inside else---", checkboxValue);
                    this.state.instance.setValueFromCoords(10, y, "", true);
                    this.state.instance.setValueFromCoords(12, y, "", true);
                    this.state.instance.setValueFromCoords(12, y, "", true);
                    for (var j = 0; j < json.length; j++) {
                        if (j != y && json[j][16] == this.state.instance.getValueFromCoords(16, y, true)) {
                            this.state.instance.setValueFromCoords(0, j, false, true);
                            this.state.instance.setValueFromCoords(10, j, "", true);
                            this.state.instance.setValueFromCoords(12, j, "", true);
                        }
                    }
                    // var qty = this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                    // this.state.instance.setValueFromCoords(8, y, Math.round(qty), true);
                }
            }
            // //Active
            // if (x != 10) {

            //     this.el.setValueFromCoords(10, y, 1, true);
            // }
            this.displayButton();
        }

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


        // if (data.length == 1 && Object.keys(data[0])[2] == "value") {
        //     (instance.jexcel).setValueFromCoords(7, data[0].y, parseFloat(data[0].value), true);
        // }
        // else {
        //     for (var i = 0; i < data.length; i++) {
        //         (instance.jexcel).setValueFromCoords(10, data[i].y, 1, true);
        //     }
        // }




    }

    dataChangeCheckbox(event) {
        this.setState({
            selectedShipment: [],
            originalQty: 0,
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
                // this.displayButton();
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
                // this.displayButton();
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
                console.log("localStorage.getItem@@@@@@@@@@@@@@@@@", localStorage.getItem("sesProgramIdReport"));
                if (localStorage.getItem("sesProgramIdReport") != '' && localStorage.getItem("sesProgramIdReport") != undefined && this.state.programs.filter(c => c.programId == localStorage.getItem("sesProgramIdReport")).length > 0) {
                    this.setState({
                        programId: localStorage.getItem("sesProgramIdReport")
                    }, () => {
                        this.getVersionList()
                    });
                } else if (this.state.programId != null && this.state.programId != "" && this.state.programId != -1) {
                    this.getVersionList();
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
                if (localStorage.getItem("sesProgramIdReport") != '' && localStorage.getItem("sesProgramIdReport") != undefined && this.state.programs.filter(c => c.programId == localStorage.getItem("sesProgramIdReport")).length > 0) {
                    this.setState({
                        programId: localStorage.getItem("sesProgramIdReport")
                    }, () => {
                        this.getVersionList();
                    });
                } else if (this.state.programId != null && this.state.programId != "" && this.state.programId != -1) {
                    this.getVersionList();
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
                            }, () => {
                                if (this.state.countryList.length == 1) {
                                    var event = {
                                        target: {
                                            value: this.state.countryList[0].realmCountry.id
                                        }
                                    };
                                    this.countryChange(event)
                                } else if (localStorage.getItem("sesCountryId") != '' && localStorage.getItem("sesCountryId") != undefined && this.state.countryList.filter(c => c.realmCountry.id == localStorage.getItem("sesCountryId")).length > 0) {
                                    var event = {
                                        target: {
                                            value: localStorage.getItem("sesCountryId")
                                        }
                                    };
                                    this.countryChange(event)

                                }
                            })
                        } else {
                            this.setState({ message: response.data.messageCode }, () => {
                                this.hideSecondComponent()
                            })
                        }
                    }).catch(
                        error => {
                            if (error.message === "Network Error") {
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent()
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
                                        }, () => {
                                            this.hideSecondComponent()
                                        });
                                        break;
                                    case 412:
                                        this.setState({
                                            message: error.response.data.messageCode,
                                            loading: false
                                        }, () => {
                                            this.hideSecondComponent()
                                        });
                                        break;
                                    default:
                                        this.setState({
                                            message: 'static.unkownError',
                                            loading: false
                                        }, () => {
                                            this.hideSecondComponent()
                                        });
                                        break;
                                }
                            }
                        }
                    );


            });
        }
        try {
            this.state.languageEl.destroy();
        } catch (e) {

        }
        // this.buildJExcel();
    }

    getBudgetListByProgramId = (e) => {
        let programId1 = this.state.programId1.toString().split("_")[0];
        console.log("this.state.budgetList@@@@@@@@@@", programId1)
        if (programId1 != "") {
            console.log("this.state.budgetList@@@@@@@@@@", this.state.budgetList)
            const filteredBudgetList = this.state.budgetList.filter(c => c.program.id == programId1)
            console.log("this.state.filteredBudgetList@@@@@@@@@@", filteredBudgetList)
            this.setState({
                filteredBudgetList,
                filteredBudgetListByProgram: filteredBudgetList
            });
        }
    }

    getBudgetListByFundingSourceId = (e) => {
        let fundingSourceId = this.state.fundingSourceId;
        const filteredBudgetList = this.state.filteredBudgetListByProgram.filter(c => c.fundingSource.fundingSourceId == fundingSourceId)
        console.log("this.state.filteredBudgetList1@@@@@@@@@@", filteredBudgetList)
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
                        }, () => {
                            this.hideSecondComponent()
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
                                }, () => {
                                    this.hideSecondComponent()
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent()
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent()
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
                        }, () => {
                            this.hideSecondComponent()
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
                                }, () => {
                                    this.hideSecondComponent()
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent()
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent()
                                });
                                break;
                        }
                    }
                }
            );
    }
    programChange(event) {
        var programId = event.target.value;
        this.setState({
            planningUnits: [],
            planningUnitValues: [],
            planningUnitLabels: [],
            versionId: -1,
            versionList: [],
            programId: programId,
            hasSelectAll: true
        }
            , () => {
                // this.getPlanningUnitList();
                if (programId != "" && programId != -1) {
                    this.getVersionList();
                } else {
                    this.setState({
                        outputList: []
                    }, () => {
                        try {
                            this.state.languageEl.destroy();
                        } catch (e) {

                        }
                    })
                }
            }
        )
    }

    getVersionList() {
        console.log("VersionList@@@@@@@@@@@@")
        this.setState({
            loading: true
        })
        // var db1;
        // getDatabase();
        // var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        // openRequest.onerror = function (event) {
        // }.bind(this);
        // openRequest.onsuccess = function (e) {
        //     db1 = e.target.result;
        //     var datasetTransaction = db1.transaction(['programData'], 'readwrite');
        //     var datasetOs = datasetTransaction.objectStore('programData');
        //     var getRequest = datasetOs.getAll();
        //     getRequest.onerror = function (event) {
        //     }.bind(this);
        //     getRequest.onsuccess = function (event) {
        var myResult = this.state.localProgramList;
        var selectedProgramId = this.state.programId;
        // for (var mr = 0; mr < myResult.length; mr++) {
        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        var filterList = myResult.filter(c => c.programId == selectedProgramId && c.userId == userId);
        var versionList = [];
        var filteredProgramList = this.state.programs.filter(c => c.programId == selectedProgramId)[0];

        versionList.push({ versionId: filteredProgramList.currentVersion.versionId })
        var programQPLDetailsList = this.state.programQPLDetailsList
        for (var v = 0; v < filterList.length; v++) {
            var programQPLDetailsFilter = programQPLDetailsList.filter(c => c.id == filterList[v].id);
            versionList.push({ versionId: filterList[v].version + "  (Local)" })
        }
        var onlineVersionList = versionList.filter(c => !c.versionId.toString().includes("Local")).sort(function (a, b) {
            a = a.versionId;
            b = b.versionId;
            return a > b ? -1 : a < b ? 1 : 0;
        });
        var offlineVersionList = versionList.filter(c => c.versionId.toString().includes("Local")).sort(function (a, b) {
            a = a.versionId.split(" ")[0];
            b = b.versionId.split(" ")[0];
            return a > b ? -1 : a < b ? 1 : 0;
        });
        var newVList = offlineVersionList.concat(onlineVersionList)
        var finalVersionList=[]
        for (var v = 0; v < newVList.length; v++) {
            finalVersionList.push({ versionId: newVList[v].versionId})
        }
        console.log("filteredProgramList@@@@@@@@@@@@", versionList)
        console.log("filteredProgramList@@@@@@@@@@@@", this.state.programs)
        console.log("filteredProgramList@@@@@@@@@@@@", this.state.programs)
        this.setState({
            versionList: finalVersionList,
            loading: false
        }, () => {
            if (localStorage.getItem("sesVersionIdReport") != '' && localStorage.getItem("sesVersionIdReport") != undefined && versionList.filter(c => c.versionId == localStorage.getItem("sesVersionIdReport")).length > 0) {
                var event = {
                    target: {
                        value: localStorage.getItem("sesVersionIdReport")
                    }
                };
                this.versionChange(event)

            } else {
                this.getPlanningUnitList()
            }
            if (this.state.versionId.toString() != -1) {

            } else {
                this.setState({
                    outputList: []
                }, () => {
                    try {
                        this.state.languageEl.destroy();
                    } catch (e) {

                    }
                })
            }
        })
        //     }.bind(this)
        // }.bind(this)
    }

    getPlanningUnitArray() {
        console.log("In Array@@@@@@@@@@@@@@@@")
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
        localStorage.setItem("sesCountryId", event.target.value);
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
            this.getOrderDetails();
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
                if (map1.get("0")) {
                    console.log("value---", Number(this.el.getValue(`L${parseInt(i) + 1}`, true).toString().replaceAll(",", "")));
                    qty = Number(qty) + Number(this.el.getValue(`L${parseInt(i) + 1}`, true).toString().replaceAll(",", ""));
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

    delink() {
        this.setState({ loading: true })
        var validation = this.checkValidationTab2();
        if (validation == true) {
            console.log("this.state.languageEl.getJson(null, false)---------------->", this.state.languageEl.getJson(null, false))
            var selectedChangedShipment = this.state.languageEl.getJson(null, false).filter(c => c[22] == 1);
            var selectedShipment = this.state.languageEl.getJson(null, false).filter(c => c[0] == false);
            var setOfPlanningUnitIds = [...new Set(selectedChangedShipment.map(ele => ele[16].planningUnit.id))];
            // if (setOfPlanningUnitIds.length > 1) {
            //     alert(i18n.t('static.mt.selectShipmentOfSamePlanningUnit'));
            // } else {
            var db1;
            var storeOS;
            getDatabase();
            var thisAsParameter = this;
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
                this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                this.props.updateState("color", "#BA0C2F");
                this.props.hideFirstComponent();
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction;
                var programTransaction;
                transaction = db1.transaction(['programData'], 'readwrite');
                programTransaction = transaction.objectStore('programData');
                // Yaha program Id dalna hai actual wala
                var curUser = AuthenticationService.getLoggedInUserId();
                var programId = (this.state.programId + "_v" + this.state.versionId.split(" ")[0] + "_uId_" + curUser);
                console.log("ProgramId@@@@@@@@@@@@", programId)
                var programRequest = programTransaction.get(programId);
                programRequest.onsuccess = function (event) {
                    var programDataJson = programRequest.result.programData;
                    var planningUnitDataList = programDataJson.planningUnitDataList;
                    var minDate = moment(Date.now()).format("YYYY-MM-DD");
                    // var planningUnitListForSP=[];
                    // var planningUnitId = this.state.active1 ? this.state.selectedRowPlanningUnit : (this.state.active3 ? (this.state.active4 || this.state.active5 ? document.getElementById("planningUnitId1").value : 0) : 0)
                    var generalProgramDataBytes = CryptoJS.AES.decrypt(programDataJson.generalData, SECRET_KEY);
                    var generalProgramData = generalProgramDataBytes.toString(CryptoJS.enc.Utf8);
                    var generalProgramJson = JSON.parse(generalProgramData);
                    var actionList = generalProgramJson.actionList;
                    var linkedShipmentsList = generalProgramJson.shipmentLinkingList == null ? [] : generalProgramJson.shipmentLinkingList;
                    if (actionList == undefined) {
                        actionList = []
                    }
                    for (var pu = 0; pu < setOfPlanningUnitIds.length; pu++) {
                        var planningUnitId = setOfPlanningUnitIds[pu];
                        // var programId1 = this.state.active1 ? this.state.programId : this.state.programId1.toString().split("_")[0]
                        var planningUnitDataIndex = (planningUnitDataList).findIndex(c => c.planningUnitId == planningUnitId);
                        // var ppuObject = ppuRequest.result.filter(c => c.program.id == programId1 && c.planningUnit.id == planningUnitId)[0];
                        var programJson = {}
                        if (planningUnitDataIndex != -1) {
                            var planningUnitData = ((planningUnitDataList).filter(c => c.planningUnitId == planningUnitId))[0];
                            var programDataBytes = CryptoJS.AES.decrypt(planningUnitData.planningUnitData, SECRET_KEY);
                            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                            programJson = JSON.parse(programData);
                        } else {
                            programJson = {
                                consumptionList: [],
                                inventoryList: [],
                                shipmentList: [],
                                batchInfoList: [],
                                supplyPlan: []
                            }
                        }
                        console.log("ProgramJson&&&&&&&&&&&&&&", programJson)

                        var shipmentList = programJson.shipmentList;
                        var batchInfoList = programJson.batchInfoList;

                        var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                        var curUser = AuthenticationService.getLoggedInUserId();
                        var username = AuthenticationService.getLoggedInUsername();

                        for (var ss = 0; ss < selectedShipment.length; ss++) {
                            if (selectedShipment[ss][16].planningUnit.id == planningUnitId) {
                                var linkedShipmentsListIndex = linkedShipmentsList.findIndex(c => (selectedShipment[ss][16].shipmentId > 0 ? selectedShipment[ss][16].shipmentId == c.childShipmentId : selectedShipment[ss][16].tempShipmentId == c.tempChildShipmentId) && c.active.toString() == "true");
                                var linkedShipmentsListFilter = linkedShipmentsList.filter(c => (selectedShipment[ss][16].shipmentId > 0 ? selectedShipment[ss][16].shipmentId == c.childShipmentId : selectedShipment[ss][16].tempShipmentId == c.tempChildShipmentId) && c.active.toString() == "true");
                                linkedShipmentsList[linkedShipmentsListIndex].active = false;
                                linkedShipmentsList[linkedShipmentsListIndex].lastModifiedBy.userId = curUser;
                                linkedShipmentsList[linkedShipmentsListIndex].lastModifiedBy.username = username;
                                linkedShipmentsList[linkedShipmentsListIndex].lastModifiedDate = curDate;
                                var checkIfThereIsOnlyOneChildShipmentOrNot = linkedShipmentsList.filter(c => (linkedShipmentsListFilter[0].parentShipmentId > 0 ? c.parentShipmentId == linkedShipmentsListFilter[0].parentShipmentId : c.tempParentShipmentId == linkedShipmentsListFilter[0].tempParentShipmentId) && c.active == true);
                                var activateParentShipment = false;
                                if (checkIfThereIsOnlyOneChildShipmentOrNot.length == 0) {
                                    activateParentShipment = true;
                                }
                                var shipmentIndex = shipmentList.findIndex(c => selectedShipment[ss][16].shipmentId > 0 ? c.shipmentId == selectedShipment[ss][16].shipmentId : c.tempShipmentId == selectedShipment[ss][16].tempShipmentId);
                                shipmentList[shipmentIndex].active = false;
                                shipmentList[shipmentIndex].lastModifiedBy.userId = curUser;
                                shipmentList[shipmentIndex].lastModifiedBy.username = username;
                                shipmentList[shipmentIndex].lastModifiedDate = curDate;
                                if (moment(minDate).format("YYYY-MM-DD") > moment(shipmentList[shipmentIndex].expectedDeliveryDate).format("YYYY-MM-DD")) {
                                    minDate = moment(shipmentList[shipmentIndex].expectedDeliveryDate).format("YYYY-MM-DD");
                                }
                                if (shipmentList[shipmentIndex].receivedDate != null && shipmentList[shipmentIndex].receivedDate != "" && shipmentList[shipmentIndex].receivedDate != undefined && moment(minDate).format("YYYY-MM-DD") > moment(shipmentList[shipmentIndex].receivedDate).format("YYYY-MM-DD")) {
                                    minDate = moment(shipmentList[shipmentIndex].receivedDate).format("YYYY-MM-DD");
                                }
                                if (activateParentShipment) {
                                    var parentShipmentIndex = shipmentList.findIndex(c => linkedShipmentsListFilter[0].parentShipmentId > 0 ? c.shipmentId == linkedShipmentsListFilter[0].parentShipmentId : c.tempShipmentId == linkedShipmentsListFilter[0].tempParentShipmentId);
                                    shipmentList[parentShipmentIndex].active = true;
                                    shipmentList[parentShipmentIndex].erpFlag = false;
                                    shipmentList[parentShipmentIndex].lastModifiedBy.userId = curUser;
                                    shipmentList[parentShipmentIndex].lastModifiedBy.username = username;
                                    shipmentList[parentShipmentIndex].lastModifiedDate = curDate;

                                    if (moment(minDate).format("YYYY-MM-DD") > moment(shipmentList[parentShipmentIndex].expectedDeliveryDate).format("YYYY-MM-DD")) {
                                        minDate = moment(shipmentList[shipmentIndex].expectedDeliveryDate).format("YYYY-MM-DD");
                                    }
                                    if (shipmentList[parentShipmentIndex].receivedDate != null && shipmentList[parentShipmentIndex].receivedDate != "" && shipmentList[parentShipmentIndex].receivedDate != undefined && moment(minDate).format("YYYY-MM-DD") > moment(shipmentList[parentShipmentIndex].receivedDate).format("YYYY-MM-DD")) {
                                        minDate = moment(shipmentList[shipmentIndex].receivedDate).format("YYYY-MM-DD");
                                    }
                                }
                            }
                        }
                        var modifiedDataFilter = this.state.languageEl.getJson(null, false);
                        for (var mdf = 0; mdf < modifiedDataFilter.length; mdf++) {
                            console.log("@@@@@@@@@@@@@@@@=====================>Mdf", modifiedDataFilter[mdf]);
                            if (modifiedDataFilter[mdf][0] == true && modifiedDataFilter[mdf][22] == 1 && modifiedDataFilter[mdf][16].planningUnit.id == planningUnitId) {
                                var linkedShipmentsListIndex = linkedShipmentsList.findIndex(c => (modifiedDataFilter[mdf][16].shipmentId > 0 ? modifiedDataFilter[mdf][16].shipmentId == c.childShipmentId : modifiedDataFilter[mdf][16].tempShipmentId == c.tempChildShipmentId) && c.active.toString() == "true");
                                var linkedShipmentsListFilter = linkedShipmentsList.filter(c => (modifiedDataFilter[ss][16].shipmentId > 0 ? modifiedDataFilter[mdf][16].shipmentId == c.childShipmentId : modifiedDataFilter[mdf][16].tempShipmentId == c.tempChildShipmentId) && c.active.toString() == "true");
                                linkedShipmentsList[linkedShipmentsListIndex].conversionFactor = Number(this.state.languageEl.getValue(`K${parseInt(mdf) + 1}`, true).toString().replaceAll("\,", ""));
                                linkedShipmentsList[linkedShipmentsListIndex].lastModifiedBy.userId = curUser;
                                linkedShipmentsList[linkedShipmentsListIndex].lastModifiedBy.username = username;
                                linkedShipmentsList[linkedShipmentsListIndex].lastModifiedDate = curDate;
                                var shipmentIndex = shipmentList.findIndex(c => modifiedDataFilter[ss][16].shipmentId > 0 ? c.shipmentId == modifiedDataFilter[mdf][16].shipmentId : c.tempShipmentId == modifiedDataFilter[mdf][16].tempShipmentId);
                                shipmentList[shipmentIndex].notes = this.state.languageEl.getValue(`M${parseInt(mdf) + 1}`, true);
                                console.log("ShipmentQty@@@@@@@@@@@@@@@@=====================>", this.state.languageEl.getValue(`L${parseInt(mdf) + 1}`, true))
                                shipmentList[shipmentIndex].shipmentQty = Number(this.state.languageEl.getValue(`L${parseInt(mdf) + 1}`, true).toString().replaceAll("\,", ""));
                                var batchInfoList = shipmentList[shipmentIndex].batchInfoList;
                                var batchInfoListOriginal = this.state.languageEl.getValueFromCoords(25, mdf).batchDetailsList;
                                console.log("BatchNoOriginal@@@@@@@@@@@@@@@@=====================>", batchInfoListOriginal);
                                console.log("VatchNo@@@@@@@@@@@@@@@@=====================>", batchInfoList);
                                for (var bi = 0; bi < batchInfoList.length; bi++) {

                                    var batchInfoListOriginalFilter = batchInfoListOriginal.filter(c => c.batchNo == batchInfoList[bi].batch.batchNo);
                                    if (batchInfoListOriginalFilter.length > 0) {
                                        batchInfoList[bi].shipmentQty = Math.round(batchInfoListOriginalFilter[0].quantity * this.state.languageEl.getValue(`K${parseInt(mdf) + 1}`, true).toString().replaceAll("\,", ""));
                                    }

                                }
                                shipmentList[shipmentIndex].batchInfoList = batchInfoList;
                                if (moment(minDate).format("YYYY-MM-DD") > moment(shipmentList[shipmentIndex].expectedDeliveryDate).format("YYYY-MM-DD")) {
                                    minDate = moment(shipmentList[shipmentIndex].expectedDeliveryDate).format("YYYY-MM-DD");
                                }
                                if (shipmentList[shipmentIndex].receivedDate != null && shipmentList[shipmentIndex].receivedDate != "" && shipmentList[shipmentIndex].receivedDate != undefined && moment(minDate).format("YYYY-MM-DD") > moment(shipmentList[shipmentIndex].receivedDate).format("YYYY-MM-DD")) {
                                    minDate = moment(shipmentList[shipmentIndex].receivedDate).format("YYYY-MM-DD");
                                }
                            }

                        }
                        actionList.push({
                            planningUnitId: planningUnitId,
                            type: SHIPMENT_MODIFIED,
                            date: moment(minDate).startOf('month').format("YYYY-MM-DD")
                        })
                        programJson.shipmentList = shipmentList;
                        programJson.batchInfoList = batchInfoList;
                        console.log("Program Json@@@@@@@@@@@@@@@@=====================>", programJson);
                        console.log("linkedShipmentsList@@@@@@@@@@@@@@@@=====================>", linkedShipmentsList);
                        console.log("shipmentList@@@@@@@@@@@@@@@@=====================>", shipmentList);
                        if (planningUnitDataIndex != -1) {
                            planningUnitDataList[planningUnitDataIndex].planningUnitData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                        } else {
                            planningUnitDataList.push({ planningUnitId: planningUnitId, planningUnitData: (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString() });
                        }
                    }
                    generalProgramJson.actionList = actionList;
                    generalProgramJson.shipmentLinkingList = linkedShipmentsList;
                    console.log("General Program Json@@@@@@@@@@@@@@@@", generalProgramJson);
                    programDataJson.planningUnitDataList = planningUnitDataList;

                    programDataJson.generalData = (CryptoJS.AES.encrypt(JSON.stringify(generalProgramJson), SECRET_KEY)).toString()
                    programRequest.result.programData = programDataJson;
                    var putRequest = programTransaction.put(programRequest.result);

                    putRequest.onerror = function (event) {
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        console.log("in success@@@@@@@@@@@@@@@", thisAsParameter)
                        calculateSupplyPlan(programId, 0, 'programData', "erpDelink", thisAsParameter, setOfPlanningUnitIds, moment(minDate).startOf('month').format("YYYY-MM-DD"));
                    }

                }.bind(this)
            }.bind(this)
            // }
        }else{
            this.setState({
                loading:false,
                message:i18n.t("static.supplyPlan.validationFailed")
            },()=>{
                this.hideSecondComponent()
            })
        }
    }

    link() {
        this.setState({ loading1: true })
        console.log("This.state.outputListAfterSerach@@@@@@@@@@@@@@@@@@@@@", this.state.outputListAfterSearch)
        var validation = this.checkValidation();
        let linkedShipmentCount = 0;
        if (validation == true) {
            var selectedShipment = this.state.instance.getJson(null, false).filter(c => c[0] == true && c[13] == 0);
            var valid = true;
            if (this.state.active4) {
                if (this.state.programId1 == -1) {
                    valid = false;
                    alert(i18n.t('static.mt.selectProgram'));
                }
                else if (document.getElementById("planningUnitId1").value == -1) {
                    valid = false;
                    alert(i18n.t('static.mt.selectPlanninfUnit'));
                }
                else if (this.state.fundingSourceId == -1) {
                    valid = false;
                    alert(i18n.t('static.mt.selectFundingSource'));
                } else if (this.state.budgetId == -1) {
                    valid = false;
                    alert(i18n.t('static.mt.selectBudget'));
                } else if (selectedShipment.length > 1 || [...new Set(this.state.instance.getJson(null, false).filter(c => c[0] == true).map(ele => ele[15].orderNo + "|" + ele[15].primeLineNo + "|" + ele[15].knShipmentNo))].length > 1) {
                    valid = false;
                    alert(i18n.t('static.mt.oneOrderAtATime'));
                }
            }
            if (!valid) {
                this.setState({ loading1: false })
            } else {
                var db1;
                var storeOS;
                getDatabase();
                var thisAsParameter = this;
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onerror = function (event) {
                    this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                    this.props.updateState("color", "#BA0C2F");
                    this.props.hideFirstComponent();
                }.bind(this);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;
                    var ppuTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                    ppuTransaction = ppuTransaction.objectStore('programPlanningUnit');
                    // Yaha program Id dalna hai actual wala

                    var ppuRequest = ppuTransaction.getAll();
                    ppuRequest.onsuccess = function (event) {

                        var paTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                        paTransaction = paTransaction.objectStore('procurementAgent');
                        // Yaha program Id dalna hai actual wala

                        var paRequest = paTransaction.getAll();
                        paRequest.onsuccess = function (event) {

                            var dsTransaction = db1.transaction(['dataSource'], 'readwrite');
                            dsTransaction = dsTransaction.objectStore('dataSource');
                            // Yaha program Id dalna hai actual wala

                            var dsRequest = dsTransaction.getAll();
                            dsRequest.onsuccess = function (event) {

                                var cTransaction = db1.transaction(['currency'], 'readwrite');
                                cTransaction = cTransaction.objectStore('currency');
                                // Yaha program Id dalna hai actual wala

                                var cRequest = cTransaction.getAll();
                                cRequest.onsuccess = function (event) {


                                    var transaction;
                                    var programTransaction;


                                    transaction = db1.transaction(['programData'], 'readwrite');
                                    programTransaction = transaction.objectStore('programData');
                                    // Yaha program Id dalna hai actual wala
                                    var curUser = AuthenticationService.getLoggedInUserId();
                                    var programId = this.state.active1 ? (this.state.programId + "_v" + this.state.versionId.split(" ")[0] + "_uId_" + curUser) : this.state.programId1;
                                    console.log("ProgramId@@@@@@@@@@@@", programId)
                                    var programRequest = programTransaction.get(programId);
                                    programRequest.onsuccess = function (event) {
                                        var programDataJson = programRequest.result.programData;
                                        var planningUnitDataList = programDataJson.planningUnitDataList;
                                        // var planningUnitId = this.state.active1 ? this.state.selectedRowPlanningUnit : (this.state.active3 ? (this.state.active4 || this.state.active5 ? document.getElementById("planningUnitId1").value : 0) : 0)
                                        var planningUnitId = this.state.active1 ? this.state.selectedRowPlanningUnit : (this.state.active3 ? ((this.state.active4 || this.state.active5) && !this.state.checkboxValue ? document.getElementById("planningUnitId1").value : (this.state.active4 || this.state.active5) && this.state.checkboxValue ? this.state.selectedShipment[0].planningUnit.id : 0) : 0)
                                        var programId1 = this.state.active1 ? this.state.programId : this.state.programId1.toString().split("_")[0]
                                        var planningUnitDataIndex = (planningUnitDataList).findIndex(c => c.planningUnitId == planningUnitId);
                                        var ppuObject = ppuRequest.result.filter(c => c.program.id == programId1 && c.planningUnit.id == planningUnitId)[0];
                                        var programJson = {}
                                        if (planningUnitDataIndex != -1) {
                                            var planningUnitData = ((planningUnitDataList).filter(c => c.planningUnitId == planningUnitId))[0];
                                            var programDataBytes = CryptoJS.AES.decrypt(planningUnitData.planningUnitData, SECRET_KEY);
                                            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                                            programJson = JSON.parse(programData);
                                        } else {
                                            programJson = {
                                                consumptionList: [],
                                                inventoryList: [],
                                                shipmentList: [],
                                                batchInfoList: [],
                                                supplyPlan: []
                                            }
                                        }
                                        var generalProgramDataBytes = CryptoJS.AES.decrypt(programDataJson.generalData, SECRET_KEY);
                                        var generalProgramData = generalProgramDataBytes.toString(CryptoJS.enc.Utf8);
                                        var generalProgramJson = JSON.parse(generalProgramData);
                                        var actionList = generalProgramJson.actionList;
                                        var linkedShipmentsList = generalProgramJson.shipmentLinkingList == null ? [] : generalProgramJson.shipmentLinkingList;
                                        if (actionList == undefined) {
                                            actionList = []
                                        }
                                        var shipmentList = programJson.shipmentList;
                                        var batchInfoList = programJson.batchInfoList;
                                        console.log("Shipment List@@@@@@@@@@@@@@@", programJson.shipmentList)
                                        if (!this.state.active4) {
                                            var shipmentId = this.state.active1 ? this.state.outputListAfterSearch[0].shipmentId : this.state.finalShipmentId;
                                            var index = this.state.active1 ? this.state.outputListAfterSearch[0].tempShipmentId : this.state.tempShipmentId;
                                            var shipmentIndex = shipmentList.findIndex(c => shipmentId > 0 ? (c.shipmentId == shipmentId) : (c.tempShipmentId == index));

                                            console.log("Shipment Index@@@@@@@@@@@@@@@", shipmentIndex)
                                            shipmentList[shipmentIndex].erpFlag = true;
                                            shipmentList[shipmentIndex].active = false;
                                            var minDate = shipmentList[shipmentIndex].receivedDate != "" && shipmentList[shipmentIndex].receivedDate != null && shipmentList[shipmentIndex].receivedDate != undefined && shipmentList[shipmentIndex].receivedDate != "Invalid date" ? shipmentList[shipmentIndex].receivedDate : shipmentList[shipmentIndex].expectedDeliveryDate;
                                        }


                                        var tableJson = this.state.instance.getJson(null, false);
                                        for (var y = 0; y < tableJson.length; y++) {
                                            if (tableJson[y][0] && tableJson[y][13] == 0) {
                                                if (moment(minDate).format("YYYY-MM") > moment(tableJson[y][4]).format("YYYY-MM")) {
                                                    minDate = moment(tableJson[y][4]).format("YYYY-MM-DD")
                                                }
                                                var filterList = tableJson.filter((c) => c[16] == tableJson[y][16]);
                                                console.log("FilterList@@@@@@@@@@@@@@@", filterList);
                                                var getUniqueOrderNoAndPrimeLineNoList = filterList.filter((v, i, a) => a.findIndex(t => (t[15].roNo === v[15].roNo && t[15].roPrimeLineNo === v[15].roPrimeLineNo && t[15].knShipmentNo === v[15].knShipmentNo && t[15].orderNo === v[15].orderNo && t[15].primeLineNo === v[15].primeLineNo)) === i);
                                                console.log("getUniqueOrderNoAndPrimeLineNoList@@@@@@@@@@@@@@@", getUniqueOrderNoAndPrimeLineNoList)
                                                for (var uq = 0; uq < getUniqueOrderNoAndPrimeLineNoList.length; uq++) {
                                                    var shipmentQty = 0;
                                                    var batchInfo = [];
                                                    var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                                                    var curUser = AuthenticationService.getLoggedInUserId();
                                                    var username = AuthenticationService.getLoggedInUsername();
                                                    tableJson.filter(c => c[15].roNo == getUniqueOrderNoAndPrimeLineNoList[uq][15].roNo && c[15].roPrimeLineNo == getUniqueOrderNoAndPrimeLineNoList[uq][15].roPrimeLineNo && c[15].knShipmentNo == getUniqueOrderNoAndPrimeLineNoList[uq][15].knShipmentNo && c[15].orderNo == getUniqueOrderNoAndPrimeLineNoList[uq][15].orderNo && c[15].primeLineNo == getUniqueOrderNoAndPrimeLineNoList[uq][15].primeLineNo).map(item => {
                                                        console.log("Item@@@@@@@@@@@@@@@@", item)
                                                        shipmentQty += Number(item[9]) * Number(this.state.instance.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll("\,", ""));
                                                        var batchNo = item[7];
                                                        var expiryDate = item[8];
                                                        var autoGenerated = false;
                                                        var shelfLife = ppuObject.shelfLife;
                                                        // if (batchNo.toString() == "-99" || batchNo=="") {
                                                        var programId1 = paddingZero(this.state.programId, 0, 6);
                                                        var planningUnitId1 = paddingZero(planningUnitId, 0, 8);
                                                        autoGenerated = (batchNo.toString() == "-99" || batchNo == "") ? true : autoGenerated;
                                                        batchNo = (batchNo.toString() == "-99" || batchNo == "") ? (BATCH_PREFIX).concat(programId1).concat(planningUnitId1).concat(moment(Date.now()).format("YYMMDD")).concat(generateRandomAplhaNumericCode(3)) : batchNo;
                                                        expiryDate = expiryDate == "" ? moment(tableJson[y][4]).add(shelfLife, 'months').startOf('month').format("YYYY-MM-DD") : expiryDate;

                                                        // }
                                                        batchInfo.push({
                                                            shipmentTransBatchInfoId: 0,
                                                            batch: {
                                                                batchNo: batchNo,
                                                                expiryDate: moment(expiryDate).endOf('month').format("YYYY-MM-DD"),
                                                                batchId: 0,
                                                                autoGenerated: autoGenerated,
                                                                createdDate: curDate
                                                            },
                                                            shipmentQty: Number(item[9]) * Number(this.state.instance.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll("\,", ""))
                                                        })
                                                    }
                                                    );
                                                    if (this.state.active4 && uq == 0) {
                                                        var c = (cRequest.result.filter(c => c.currencyId == USD_CURRENCY_ID)[0]);
                                                        shipmentList.push({
                                                            accountFlag: true,
                                                            active: false,
                                                            dataSource: {
                                                                id: NONE_SELECTED_DATA_SOURCE_ID,
                                                                label: dsRequest.result.filter(c => c.dataSourceId == NONE_SELECTED_DATA_SOURCE_ID)[0].label
                                                            },
                                                            erpFlag: true,
                                                            localProcurement: false,
                                                            freightCost: tableJson[y][15].shippingCost,//Yeh
                                                            notes: tableJson[y][12],
                                                            planningUnit: ppuObject.planningUnit,
                                                            procurementAgent: {
                                                                id: PSM_PROCUREMENT_AGENT_ID,
                                                                label: paRequest.result.filter(c => c.procurementAgentId == PSM_PROCUREMENT_AGENT_ID)[0].label,
                                                                code: paRequest.result.filter(c => c.procurementAgentId == PSM_PROCUREMENT_AGENT_ID)[0].procurementAgentCode
                                                            },
                                                            productCost: Number(tableJson[y][15].price) * Number(shipmentQty),//Final cost
                                                            shipmentQty: shipmentQty,
                                                            rate: tableJson[y][15].price,//Price per planning unit
                                                            shipmentId: 0,
                                                            shipmentMode: (tableJson[y][15].shipBy == "Land" || tableJson[y][15].shipBy == "Ship" ? "Sea" : tableJson[y][15].shipBy == "Air" ? "Air" : "Sea"),//Yeh
                                                            shipmentStatus: tableJson[y][14],
                                                            suggestedQty: 0,
                                                            budget: {
                                                                id: this.state.budgetId,
                                                                label: this.state.filteredBudgetList.filter(c => c.budgetId == this.state.budgetId)[0].label,
                                                                code: this.state.filteredBudgetList.filter(c => c.budgetId == this.state.budgetId)[0].budgetCode,
                                                            },
                                                            emergencyOrder: false,
                                                            currency: c,
                                                            fundingSource: {
                                                                id: this.state.fundingSourceId,
                                                                code: this.state.fundingSourceList.filter(c => c.fundingSourceId == this.state.fundingSourceId)[0].fundingSourceCode,
                                                                label: this.state.fundingSourceList.filter(c => c.fundingSourceId == this.state.fundingSourceId)[0].label,
                                                            },
                                                            plannedDate: null,
                                                            submittedDate: null,
                                                            approvedDate: null,
                                                            shippedDate: null,
                                                            arrivedDate: null,
                                                            expectedDeliveryDate: tableJson[y][4],
                                                            receivedDate: tableJson[y][14].id == DELIVERED_SHIPMENT_STATUS ? tableJson[y][4] : null,
                                                            index: shipmentList.length,
                                                            batchInfoList: batchInfo,
                                                            orderNo: tableJson[y][2].split("|")[0],
                                                            primeLineNo: tableJson[y][2].split("|")[1],
                                                            parentShipmentId: null,
                                                            createdBy: {
                                                                userId: curUser,
                                                                username: username
                                                            },
                                                            createdDate: curDate,
                                                            lastModifiedBy: {
                                                                userId: curUser,
                                                                username: username
                                                            },
                                                            lastModifiedDate: curDate,
                                                            tempShipmentId: ppuObject.planningUnit.id.toString().concat(shipmentList.length),
                                                            tempParentShipmentId: null,
                                                        })
                                                        var shipmentId = 0;
                                                        var index = ppuObject.planningUnit.id.toString().concat(shipmentList.length - 1);
                                                        var shipmentIndex = shipmentList.findIndex(c => shipmentId > 0 ? (c.shipmentId == shipmentId) : (c.tempShipmentId == index));
                                                        var minDate = shipmentList[shipmentIndex].receivedDate != "" && shipmentList[shipmentIndex].receivedDate != null && shipmentList[shipmentIndex].receivedDate != undefined && shipmentList[shipmentIndex].receivedDate != "Invalid date" ? shipmentList[shipmentIndex].receivedDate : shipmentList[shipmentIndex].expectedDeliveryDate;
                                                    }

                                                    console.log("ShipmentQty@@@@@@@@@@@@@@@@", shipmentQty);
                                                    linkedShipmentsList.push({
                                                        shipmentLinkingId: 0,
                                                        versionId: this.state.versionId.toString().split(" ")[0],
                                                        programId: this.state.programId,
                                                        procurementAgent: shipmentList[shipmentIndex].procurementAgent,
                                                        parentShipmentId: shipmentList[shipmentIndex].shipmentId,
                                                        tempParentShipmentId: shipmentList[shipmentIndex].shipmentId == 0 ? shipmentList[shipmentIndex].tempShipmentId : null,
                                                        childShipmentId: 0,
                                                        tempChildShipmentId: shipmentList[shipmentIndex].planningUnit.id.toString().concat(shipmentList.length),
                                                        erpPlanningUnit: getUniqueOrderNoAndPrimeLineNoList[uq][15].erpPlanningUnit,
                                                        roNo: getUniqueOrderNoAndPrimeLineNoList[uq][15].roNo,
                                                        roPrimeLineNo: getUniqueOrderNoAndPrimeLineNoList[uq][15].roPrimeLineNo,
                                                        knShipmentNo: getUniqueOrderNoAndPrimeLineNoList[uq][15].knShipmentNo,
                                                        erpShipmentStatus: getUniqueOrderNoAndPrimeLineNoList[uq][15].erpShipmentStatus,
                                                        orderNo: getUniqueOrderNoAndPrimeLineNoList[uq][15].orderNo,
                                                        primeLineNo: getUniqueOrderNoAndPrimeLineNoList[uq][15].primeLineNo,
                                                        conversionFactor: Number(this.state.instance.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll("\,", "")),
                                                        qatPlanningUnitId: ppuObject.planningUnit.id,
                                                        active: true,
                                                        createdBy: {
                                                            userId: curUser,
                                                            username: username
                                                        },
                                                        createdDate: curDate,
                                                        lastModifiedBy: {
                                                            userId: curUser,
                                                            username: username
                                                        },
                                                        lastModifiedDate: curDate,
                                                    })
                                                    shipmentList.push({
                                                        accountFlag: true,
                                                        active: true,
                                                        dataSource: shipmentList[shipmentIndex].dataSource,
                                                        erpFlag: true,
                                                        localProcurement: shipmentList[shipmentIndex].localProcurement,
                                                        freightCost: getUniqueOrderNoAndPrimeLineNoList[uq][15].shippingCost,//Yeh
                                                        notes: getUniqueOrderNoAndPrimeLineNoList[uq][12],
                                                        planningUnit: shipmentList[shipmentIndex].planningUnit,

                                                        procurementAgent: shipmentList[shipmentIndex].procurementAgent,
                                                        productCost: Number(getUniqueOrderNoAndPrimeLineNoList[uq][15].price) * Number(shipmentQty),//Final cost
                                                        shipmentQty: shipmentQty,
                                                        rate: getUniqueOrderNoAndPrimeLineNoList[uq][15].price,//Price per planning unit
                                                        shipmentId: 0,
                                                        shipmentMode: (getUniqueOrderNoAndPrimeLineNoList[uq][15].shipBy == "Land" || getUniqueOrderNoAndPrimeLineNoList[uq][15].shipBy == "Ship" ? "Sea" : getUniqueOrderNoAndPrimeLineNoList[uq][15].shipBy == "Air" ? "Air" : "Sea"),//Yeh
                                                        shipmentStatus: getUniqueOrderNoAndPrimeLineNoList[uq][14],
                                                        suggestedQty: 0,
                                                        budget: shipmentList[shipmentIndex].budget,
                                                        emergencyOrder: shipmentList[shipmentIndex].emergencyOrder,
                                                        currency: shipmentList[shipmentIndex].currency,
                                                        fundingSource: shipmentList[shipmentIndex].fundingSource,
                                                        plannedDate: null,
                                                        submittedDate: null,
                                                        approvedDate: null,
                                                        shippedDate: null,
                                                        arrivedDate: null,
                                                        expectedDeliveryDate: getUniqueOrderNoAndPrimeLineNoList[uq][4],
                                                        receivedDate: getUniqueOrderNoAndPrimeLineNoList[uq][14].id == DELIVERED_SHIPMENT_STATUS ? getUniqueOrderNoAndPrimeLineNoList[uq][4] : null,
                                                        index: shipmentList.length,
                                                        batchInfoList: batchInfo,
                                                        orderNo: getUniqueOrderNoAndPrimeLineNoList[uq][2].split("|")[0],
                                                        primeLineNo: getUniqueOrderNoAndPrimeLineNoList[uq][2].split("|")[1],
                                                        parentShipmentId: shipmentList[shipmentIndex].shipmentId,
                                                        createdBy: {
                                                            userId: curUser,
                                                            username: username
                                                        },
                                                        createdDate: curDate,
                                                        lastModifiedBy: {
                                                            userId: curUser,
                                                            username: username
                                                        },
                                                        lastModifiedDate: curDate,
                                                        tempShipmentId: shipmentList[shipmentIndex].planningUnit.id.toString().concat(shipmentList.length),
                                                        tempParentShipmentId: shipmentList[shipmentIndex].shipmentId == 0 ? shipmentList[shipmentIndex].tempShipmentId : null,
                                                    })

                                                    for (var bi = 0; bi < batchInfo.length; bi++) {
                                                        var index = batchInfoList.findIndex(c => c.batchNo == batchInfo[bi].batch.batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(batchInfo[bi].batch.expiryDate).format("YYYY-MM") && c.planningUnitId == planningUnitId);
                                                        if (index == -1) {
                                                            var batchDetails = {
                                                                batchId: batchInfo[bi].batch.batchId,
                                                                batchNo: batchInfo[bi].batch.batchNo,
                                                                planningUnitId: planningUnitId,
                                                                expiryDate: batchInfo[bi].batch.expiryDate,
                                                                createdDate: batchInfo[bi].batch.createdDate,
                                                                autoGenerated: batchInfo[bi].batch.autoGenerated
                                                            }
                                                            batchInfoList.push(batchDetails);
                                                        } else {
                                                            batchInfoList[index].expiryDate = batchInfo[bi].batch.expiryDate;
                                                            batchInfoList[index].createdDate = batchInfo[bi].batch.createdDate;
                                                            batchInfoList[index].autoGenerated = batchInfo[bi].batch.autoGenerated;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        actionList.push({
                                            planningUnitId: planningUnitId,
                                            type: SHIPMENT_MODIFIED,
                                            date: moment(minDate).startOf('month').format("YYYY-MM-DD")
                                        })
                                        programJson.shipmentList = shipmentList;
                                        programJson.batchInfoList = batchInfoList;
                                        console.log("Program Json@@@@@@@@@@@@@@@@", programJson);
                                        if (planningUnitDataIndex != -1) {
                                            planningUnitDataList[planningUnitDataIndex].planningUnitData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                                        } else {
                                            planningUnitDataList.push({ planningUnitId: planningUnitId, planningUnitData: (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString() });
                                        }
                                        generalProgramJson.actionList = actionList;
                                        generalProgramJson.shipmentLinkingList = linkedShipmentsList;
                                        console.log("General Program Json@@@@@@@@@@@@@@@@", generalProgramJson);
                                        programDataJson.planningUnitDataList = planningUnitDataList;

                                        programDataJson.generalData = (CryptoJS.AES.encrypt(JSON.stringify(generalProgramJson), SECRET_KEY)).toString()
                                        programRequest.result.programData = programDataJson;
                                        var putRequest = programTransaction.put(programRequest.result);

                                        putRequest.onerror = function (event) {
                                        }.bind(this);
                                        putRequest.onsuccess = function (event) {
                                            console.log("in success@@@@@@@@@@@@@@@", thisAsParameter)
                                            calculateSupplyPlan(programId, planningUnitId, 'programData', "erp", thisAsParameter, [], moment(minDate).startOf('month').format("YYYY-MM-DD"));
                                        }
                                    }.bind(this)
                                }.bind(this)
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            }
        }
    }

    updateState(parameterName, value) {
        this.setState({
            [parameterName]: value
        })

    }

    linkOld() {
        // document.getElementById('div2').style.display = 'block';
        // let valid = false;
        // var programId = (this.state.active3 ? this.state.programId1 : this.state.programId);
        // if (this.state.active3) {
        //     localStorage.setItem("sesProgramIdReport", programId)
        //     if (this.state.active5) {
        //         if (this.state.finalShipmentId != "" && this.state.finalShipmentId != null) {
        //             valid = true;
        //         } else {
        //             alert(i18n.t('static.mt.selectShipmentId'));
        //         }

        //     } else if (this.state.active4) {
        //         if (programId == -1) {
        //             alert(i18n.t('static.mt.selectProgram'));
        //         }
        //         else if (document.getElementById("planningUnitId1").value == -1) {
        //             alert(i18n.t('static.mt.selectPlanninfUnit'));
        //         }
        //         else if (this.state.fundingSourceId == -1) {
        //             alert(i18n.t('static.mt.selectFundingSource'));
        //         } else if (this.state.budgetId == -1) {
        //             alert(i18n.t('static.mt.selectBudget'));
        //         }


        //         else {
        //             // var cf = window.confirm(i18n.t('static.mt.confirmNewShipmentCreation'));
        //             // if (cf == true) {
        //             valid = true;
        //             // } else { }
        //         }
        //     }
        // } else {
        //     valid = true;
        // }
        // if (valid) {
        //     this.setState({ loading1: true })
        //     var validation = this.checkValidation();
        //     let linkedShipmentCount = 0;
        //     if (validation == true) {
        //         var tableJson = this.state.instance.getJson(null, false);
        //         let changedmtList = [];
        //         for (var i = 0; i < tableJson.length; i++) {
        //             var map1 = new Map(Object.entries(tableJson[i]));
        //             if (parseInt(map1.get("10")) === 1) {
        //                 let json = {
        //                     parentShipmentId: (this.state.active2 ? this.state.parentShipmentId : 0),
        //                     programId: programId,
        //                     fundingSourceId: (this.state.active3 ? this.state.fundingSourceId : 0),
        //                     budgetId: (this.state.active3 ? this.state.budgetId : 0),
        //                     shipmentId: (this.state.active3 ? this.state.finalShipmentId : this.state.shipmentId),
        //                     conversionFactor: this.el.getValue(`H${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
        //                     notes: (map1.get("9") === '' ? null : map1.get("9")),
        //                     active: map1.get("0"),
        //                     orderNo: map1.get("11"),
        //                     primeLineNo: parseInt(map1.get("12")),
        //                     // planningUnitId: (this.state.active3 ? this.el.getValue(`N${parseInt(i) + 1}`, true).toString().replaceAll(",", "") : 0),
        //                     planningUnitId: (this.state.active3 ? (this.state.active4 ? document.getElementById("planningUnitId1").value : 0) : 0),
        //                     quantity: this.el.getValue(`G${parseInt(i) + 1}`, true).toString().replaceAll(",", "")
        //                 }

        //                 changedmtList.push(json);
        //             }
        //             if ((this.state.active2 || this.state.active4) && map1.get("0")) {
        //                 linkedShipmentCount++;
        //             }
        //         }
        //         console.log("FINAL SUBMIT changedmtList---", changedmtList);
        //         if (this.state.active4 && linkedShipmentCount > 1) {
        //             alert(i18n.t('static.mt.oneOrderAtATime'));
        //             this.setState({
        //                 loading1: false
        //             })

        //         } else {
        //             let goAhead = false;
        //             if (this.state.active4) {
        //                 var cf = window.confirm(i18n.t('static.mt.confirmNewShipmentCreation'));
        //                 if (cf == true) {
        //                     goAhead = true;
        //                 } else {
        //                     this.setState({
        //                         loading1: false
        //                     })
        //                 }
        //             } else {
        //                 goAhead = true;
        //             }
        //             let callApiActive2 = false;
        //             if (this.state.active2) {
        //                 let active2GoAhead = false;

        //                 if (linkedShipmentCount > 0) {
        //                     active2GoAhead = false
        //                     callApiActive2 = true
        //                 } else {
        //                     active2GoAhead = true
        //                 }
        //                 if (active2GoAhead) {
        //                     // var cf1 = window.confirm(i18n.t('static.mt.confirmNewShipmentCreation'));
        //                     var cf1 = window.confirm(i18n.t("static.mt.delinkAllShipments"));
        //                     if (cf1 == true) {
        //                         callApiActive2 = true;
        //                     } else {
        //                         callApiActive2 = false;
        //                     }
        //                 }
        //             }
        //             if (!callApiActive2 && this.state.active2) {
        //                 this.setState({
        //                     loading: false,
        //                     loading1: false
        //                 });
        //             }
        //             if (this.state.active1 || (this.state.active3 && this.state.active4 && goAhead) || (this.state.active3 && this.state.active5) || callApiActive2) {
        //                 console.log("Going to link shipment-----", changedmtList);
        //                 // for (var i = 0; i <= 2; i++) {
        //                 // console.log("for loop -----",i);
        //                 ManualTaggingService.linkShipmentWithARTMIS(changedmtList)
        //                     .then(response => {
        //                         console.log("linking response---", response);

        //                         this.setState({
        //                             message: (this.state.active2 ? i18n.t('static.mt.linkingUpdateSuccess') : i18n.t('static.shipment.linkingsuccess')),
        //                             color: 'green',
        //                             loading: false,
        //                             loading1: false,
        //                             planningUnitIdUpdated: ''
        //                         },
        //                             () => {

        //                                 this.hideSecondComponent();
        //                                 this.toggleLarge();

        //                                 (this.state.active3 ? this.filterErpData() : this.filterData(this.state.planningUnitIds));

        //                             })
        //                         // }

        //                     }).catch(
        //                         error => {
        //                             console.log("Linking error-----------", error);
        //                             if (error.message === "Network Error") {
        //                                 this.setState({
        //                                     message: 'static.unkownError',
        //                                     color: '#BA0C2F',
        //                                     loading: false,
        //                                     loading1: false
        //                                 });
        //                             } else {
        //                                 switch (error.response ? error.response.status : "") {

        //                                     case 401:
        //                                         this.props.history.push(`/login/static.message.sessionExpired`)
        //                                         break;
        //                                     case 403:
        //                                         this.props.history.push(`/accessDenied`)
        //                                         break;
        //                                     case 500:
        //                                     case 404:
        //                                     case 406:
        //                                         console.log("500 error--------");
        //                                         this.setState({
        //                                             message: error.response.data.messageCode,
        //                                             loading: false,
        //                                             loading1: false,
        //                                             color: '#BA0C2F',
        //                                         },
        //                                             () => {

        //                                                 this.hideSecondComponent();
        //                                                 this.toggleLarge();

        //                                                 (this.state.active3 ? this.filterErpData() : this.filterData(this.state.planningUnitIds));

        //                                             });
        //                                         break;
        //                                     case 412:
        //                                         this.setState({
        //                                             message: error.response.data.messageCode,
        //                                             loading: false,
        //                                             loading1: false,
        //                                             color: '#BA0C2F',
        //                                         },
        //                                             () => {

        //                                                 this.hideSecondComponent();
        //                                                 this.toggleLarge();

        //                                                 (this.state.active3 ? this.filterErpData() : this.filterData(this.state.planningUnitIds));

        //                                             });
        //                                         break;
        //                                     default:
        //                                         this.setState({
        //                                             message: 'static.unkownError',
        //                                             loading: false,
        //                                             loading1: false,
        //                                             color: '#BA0C2F',
        //                                         });
        //                                         break;
        //                                 }
        //                             }
        //                         }
        //                     );
        //                 // }
        //             }
        //         }
        //     }
        // }
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
        var programId = (this.state.active3 ? this.state.programId1.split("_")[0] : document.getElementById("programId").value);
        var versionId = this.state.active1 ? this.state.versionId.toString().split(" ")[0] : this.state.localProgramList.filter(c => c.id == this.state.programId1)[0].version;
        var erpPlanningUnitId = (this.state.planningUnitIdUpdated != null && this.state.planningUnitIdUpdated != "" ? this.state.planningUnitIdUpdated : 0);
        var linkedRoNoAndRoPrimeLineNo = [];
        if (this.state.active1) {
            var localProgramList = this.state.localProgramList;
            var localProgramListFilter = localProgramList.filter(c => c.programId == this.state.programId && c.version == this.state.versionId.split(" ")[0]);
            console.log("localProgramListFilter@@@@@@@@@@@@@", localProgramListFilter)
            var generalProgramDataBytes = CryptoJS.AES.decrypt(localProgramListFilter[0].programData.generalData, SECRET_KEY);
            var generalProgramData = generalProgramDataBytes.toString(CryptoJS.enc.Utf8);
            var generalProgramJson = JSON.parse(generalProgramData);
            var linkedShipmentsList = generalProgramJson.shipmentLinkingList != null ? generalProgramJson.shipmentLinkingList : [];

            linkedShipmentsList.filter(c => c.shipmentLinkingId == 0 && c.active == true).map(c => {
                linkedRoNoAndRoPrimeLineNo.push(c.roNo + "|" + c.roPrimeLineNo)
            })
        } else if (this.state.active3) {
            console.log("In else if@@@@@@@#########")
            var localProgramList = this.state.localProgramList;
            for (var i = 0; i < localProgramList.length; i++) {
                var generalProgramDataBytes = CryptoJS.AES.decrypt(localProgramList[i].programData.generalData, SECRET_KEY);
                var generalProgramData = generalProgramDataBytes.toString(CryptoJS.enc.Utf8);
                var generalProgramJson = JSON.parse(generalProgramData);
                var linkedShipmentsList = generalProgramJson.shipmentLinkingList != null ? generalProgramJson.shipmentLinkingList : [];
                var linkedRoNoAndRoPrimeLineNo = [];
                linkedShipmentsList.filter(c => c.shipmentLinkingId == 0 && c.active == true).map(c => {
                    linkedRoNoAndRoPrimeLineNo.push(c.roNo + "|" + c.roPrimeLineNo)
                })
            }
        }
        var shipmentPlanningUnitId = this.state.active1 ? this.state.selectedRowPlanningUnit : (this.state.active3 ? ((this.state.active4 || this.state.active5) && !this.state.checkboxValue ? document.getElementById("planningUnitId1").value : (this.state.active4 || this.state.active5) && this.state.checkboxValue ? this.state.selectedShipment.length > 0 ? this.state.selectedShipment[0].planningUnit.id : 0 : 0) : 0)
        console.log("erpPlanningUnitIdMohit@@@@@@@@@@@@@@@@@@@",erpPlanningUnitId)
        if ((roNoOrderNo != "" && roNoOrderNo != "0") || (erpPlanningUnitId != 0)) {
            // roNoOrderNo, programId, erpPlanningUnitId, (this.state.active1 ? 1 : (this.state.active2 ? 2 : 3)), (this.state.active2 ? this.state.parentShipmentId : 0)
            var json = {
                programId: programId,
                versionId: versionId,
                shipmentPlanningUnitId: shipmentPlanningUnitId,
                roNo: roNoOrderNo==0?"":roNoOrderNo,
                filterPlanningUnitId: erpPlanningUnitId,

            }
            console.log("JsonMohit@@@@@@@@@@@@@@@@@@@", json)
            ManualTaggingService.getOrderDetails(json)
                .then(response => {
                    console.log("response.data------", response.data)
                    this.setState({
                        artmisList: response.data.filter(c => !linkedRoNoAndRoPrimeLineNo.includes(c.roNo + "|" + c.roPrimeLineNo)),
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
                            }, () => {
                                this.hideSecondComponent()
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
                                    }, () => {
                                        this.hideSecondComponent()
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false
                                    }, () => {
                                        this.hideSecondComponent()
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false
                                    }, () => {
                                        this.hideSecondComponent()
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
        }, 30000);
    }
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    hideSecondComponent() {

        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);


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
                        }, () => {
                            this.hideSecondComponent()
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
                                }, () => {
                                    this.hideSecondComponent()
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent()
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent()
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
        if ((this.state.productCategoryValues.length > 0) || (this.state.planningUnitValues.length > 0)) {
            let productCategoryIdList = this.state.productCategoryValues.length == this.state.productCategories.length && this.state.productCategoryValues.length != 0 ? [] : (this.state.productCategoryValues.length == 0 ? null : this.state.productCategoryValues.map(ele => (ele.value).toString()))
            let planningUnitIdList = (this.state.planningUnitValues.length == 0 ? null : this.state.planningUnitValues.map(ele => (ele.value).toString()))
            console.log("this.state.productCategories@@@@@@@@@@@@@", this.state.productCategories)
            console.log("this.state.productCategoryValues[0].value@@@@@@@@@@@@@@", productCategoryIdList);
            var productCategorySortOrder = this.state.productCategories.filter(c => productCategoryIdList.includes(c.payload.productCategoryId.toString()));
            var sortOrderList = [];
            productCategorySortOrder.map(ele => sortOrderList.push(ele.sortOrder))
            console.log("Sort@@@@@@@@@@@@@@", sortOrderList);
            var json = {
                realmCountryId: countryId,
                productCategorySortOrder: sortOrderList,
                planningUnitIds: planningUnitIdList,
                // linkingType: (this.state.active1 ? 1 : (this.state.active2 ? 2 : 3))
            }
            console.log("length1---", this.state.planningUnitValues.length);
            console.log("length2---", this.state.planningUnits1.length);
            console.log("json---", json);
            var localProgramList = this.state.localProgramList;
            for (var i = 0; i < localProgramList.length; i++) {
                var generalProgramDataBytes = CryptoJS.AES.decrypt(localProgramList[i].programData.generalData, SECRET_KEY);
                var generalProgramData = generalProgramDataBytes.toString(CryptoJS.enc.Utf8);
                var generalProgramJson = JSON.parse(generalProgramData);
                var linkedShipmentsList = generalProgramJson.shipmentLinkingList != null ? generalProgramJson.shipmentLinkingList : [];
                var linkedRoNoAndRoPrimeLineNo = [];
                console.log("linkedShipmentsList@@@@@@@@@@@@@@@", linkedShipmentsList);
                linkedShipmentsList.filter(c => c.shipmentLinkingId == 0 && c.active == true).map(c => {
                    linkedRoNoAndRoPrimeLineNo.push(c.roNo + "|" + c.roPrimeLineNo)
                })
            }
            console.log("linkedRoNoAndRoPrimeLineNo@@@@@@@@@@@@@@@@@@@@@@@", linkedRoNoAndRoPrimeLineNo)
            ManualTaggingService.getShipmentListForTab3(json)
                .then(response => {
                    var outputList = response.data;
                    console.log("output list@@@@@@@@@@@@@@@", outputList)
                    var filterOnLinkedData = outputList.filter(c => !linkedRoNoAndRoPrimeLineNo.includes(c.roNo + "|" + c.roPrimeLineNo));
                    let resultTrue = Object.values(filterOnLinkedData.reduce((a, { roNo, roPrimeLineNo, knShipmentNo, erpQty, orderNo, primeLineNo, erpShipmentStatus, expectedDeliveryDate, batchNo, expiryDate, erpPlanningUnit, price, shippingCost, shipBy, qatEquivalentShipmentStatus, parentShipmentId, childShipmentId, notes, qatPlanningUnit }) => {
                        if (!a[roNo + "|" + roPrimeLineNo + "|" + orderNo + "|" + primeLineNo + "|" + knShipmentNo])
                            a[roNo + "|" + roPrimeLineNo + "|" + orderNo + "|" + primeLineNo + "|" + knShipmentNo] = Object.assign({}, { roNo, roPrimeLineNo, knShipmentNo, erpQty, orderNo, primeLineNo, erpShipmentStatus, expectedDeliveryDate, batchNo, expiryDate, erpPlanningUnit, price, shippingCost, shipBy, qatEquivalentShipmentStatus, parentShipmentId, childShipmentId, notes, qatPlanningUnit });
                        else
                            a[roNo + "|" + roPrimeLineNo + "|" + orderNo + "|" + primeLineNo + "|" + knShipmentNo].erpQty += erpQty;
                        return a;
                    }, {}));
                    console.log("ResultTrue@@@@@@@@@@@@@@@", resultTrue);
                    this.setState({
                        outputList: resultTrue
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
                            }, () => {
                                this.hideSecondComponent()
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
                                    }, () => {
                                        this.hideSecondComponent()
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false
                                    }, () => {
                                        this.hideSecondComponent()
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false
                                    }, () => {
                                        this.hideSecondComponent()
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
        console.log("In filter data@@@@@@@@@@@@@@@")
        var programId = this.state.programId;

        planningUnitIds = planningUnitIds;
        this.setState({
            hasSelectAll: false,
            planningUnitValues: planningUnitIds.map(ele => ele),
            planningUnitLabels: planningUnitIds.map(ele => ele.label)
        }, () => {
            var versionId = this.state.versionId.toString();
            if (programId != -1 && planningUnitIds != null && planningUnitIds != "") {
                this.setState({
                    loading: true,
                    planningUnitIds
                })
                if (!versionId.includes("Local")) {


                    // var json = {
                    //     planningUnitIdList: ,
                    // }
                    if (this.state.active1) {
                        ManualTaggingService.getNotLinkedQatShipments(this.state.programId, this.state.versionId, this.state.planningUnitValues.map(ele => (ele.value).toString()))
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
                                        }, () => {
                                            this.hideSecondComponent()
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
                                                }, () => {
                                                    this.hideSecondComponent()
                                                });
                                                break;
                                            case 412:
                                                this.setState({
                                                    message: error.response.data.messageCode,
                                                    loading: false
                                                }, () => {
                                                    this.hideSecondComponent()
                                                });
                                                break;
                                            default:
                                                this.setState({
                                                    message: 'static.unkownError',
                                                    loading: false
                                                }, () => {
                                                    this.hideSecondComponent()
                                                });
                                                break;
                                        }
                                    }
                                }
                            );
                    } else {
                        console.log("In eklse@@@@@@@@@@@@@@")
                        ManualTaggingService.getLinkedQatShipments(this.state.programId, this.state.versionId, this.state.planningUnitValues.map(ele => (ele.value).toString()))
                            .then(response => {
                                console.log("In eklseresponse.data@@@@@@@@@@@@@@", response.data)
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
                                        }, () => {
                                            this.hideSecondComponent()
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
                                                }, () => {
                                                    this.hideSecondComponent()
                                                });
                                                break;
                                            case 412:
                                                this.setState({
                                                    message: error.response.data.messageCode,
                                                    loading: false
                                                }, () => {
                                                    this.hideSecondComponent()
                                                });
                                                break;
                                            default:
                                                this.setState({
                                                    message: 'static.unkownError',
                                                    loading: false
                                                }, () => {
                                                    this.hideSecondComponent()
                                                });
                                                break;
                                        }
                                    }
                                }
                            );
                    }
                } else {
                    var shipmentList = [];
                    var roPrimeNoList = [];
                    var localProgramList = this.state.localProgramList;
                    var localProgramListFilter = localProgramList.filter(c => c.programId == this.state.programId && c.version == versionId.split(" ")[0]);
                    var planningUnitDataList = localProgramListFilter[0].programData.planningUnitDataList;
                    var gprogramDataBytes = CryptoJS.AES.decrypt(localProgramListFilter[0].programData.generalData, SECRET_KEY);
                    var gprogramData = gprogramDataBytes.toString(CryptoJS.enc.Utf8);
                    var gprogramJson = JSON.parse(gprogramData);
                    var linkedShipmentsList = gprogramJson.shipmentLinkingList != null ? gprogramJson.shipmentLinkingList : []
                    for (var pu = 0; pu < planningUnitIds.length; pu++) {
                        var planningUnitData = planningUnitDataList.filter(c => c.planningUnitId == planningUnitIds[pu].value)[0];
                        var programDataBytes = CryptoJS.AES.decrypt(planningUnitData.planningUnitData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var planningUnitDataJson = JSON.parse(programData);
                        shipmentList = shipmentList.concat(planningUnitDataJson.shipmentList);
                    }
                    if (this.state.active1) {
                        shipmentList = shipmentList.filter(c => c.erpFlag.toString() == "false" && c.active.toString() == "true" && c.accountFlag.toString() == "true" && c.procurementAgent.id == PSM_PROCUREMENT_AGENT_ID && SHIPMENT_ID_ARR_MANUAL_TAGGING.includes(c.shipmentStatus.id.toString()));
                        shipmentList = shipmentList.filter(c => (moment(c.expectedDeliveryDate).format("YYYY-MM-DD") < moment(Date.now()).subtract(6, 'months').format("YYYY-MM-DD") && ([3, 4, 5, 6, 9]).includes(c.shipmentStatus.id.toString())) || (moment(c.expectedDeliveryDate).format("YYYY-MM-DD") >= moment(Date.now()).subtract(6, 'months').format("YYYY-MM-DD") && SHIPMENT_ID_ARR_MANUAL_TAGGING.includes(c.shipmentStatus.id.toString())));
                    } else if (this.state.active2) {
                        shipmentList = shipmentList.filter(c => c.erpFlag.toString() == "true" && c.active.toString() == "true" && c.accountFlag.toString() == "true" && c.procurementAgent.id == PSM_PROCUREMENT_AGENT_ID);
                        console.log("ShipmentList@@@@@@@@@@@@@@@", shipmentList);
                        for (var sl = 0; sl < shipmentList.length; sl++) {
                            var lsf = linkedShipmentsList.filter(c => shipmentList[sl].shipmentId > 0 ? c.childShipmentId == shipmentList[sl].shipmentId : c.tempChildShipmentId == shipmentList[sl].tempShipmentId);
                            if (lsf.length > 0) {
                                roPrimeNoList.push({
                                    "roNo": lsf[0].roNo,
                                    "roPrimeLineNo": lsf[0].roPrimeLineNo
                                })
                            }

                        }
                    }
                    ManualTaggingService.getDataBasedOnRoNoAndRoPrimeLineNo(roPrimeNoList)
                        .then(response => {
                            console.log("In eklseresponse.data@@@@@@@@@@@@@@", response.data)
                            this.setState({
                                outputList: shipmentList,
                                linkedShipmentsListForTab2: linkedShipmentsList,
                                roPrimeNoListOriginal: response.data
                            }, () => {
                                if (!this.state.active3) {
                                    localStorage.setItem("sesProgramIdReport", programId)
                                }
                                // this.getPlanningUnitListByTracerCategory(planningUnitId);
                                this.buildJExcel();
                            });
                        }).catch(
                            error => {
                            }
                        );
                }
            } else {

                this.setState({
                    outputList: []
                }, () => {
                    try {
                        this.state.languageEl.destroy();
                    } catch (e) {

                    }
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
        ManualTaggingService.autocompletePlanningUnit(this.state.planningUnitId, term.toUpperCase())
            .then(response => {
                console.log("Response@@@@@@@@@@@@@@@@@@", response)
                var tracercategoryPlanningUnit = [];
                for (var i = 0; i < response.data.length; i++) {
                    var label = response.data[i].label.label_en + '(' + response.data[i].code + ')';
                    tracercategoryPlanningUnit[i] = { value: response.data[i].id, label: label }
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
                        }, () => {
                            this.hideSecondComponent()
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
                                }, () => {
                                    this.hideSecondComponent()
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent()
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent()
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
            var programId = this.state.active1 ? this.state.programId : this.state.programId1.split("_")[0];

            ManualTaggingService.autocompleteDataOrderNo(term.toUpperCase(), (programId != null && programId != "" ? programId : 0), (erpPlanningUnitId != null && erpPlanningUnitId != "" ? erpPlanningUnitId : 0))
                .then(response => {
                    console.log("Response@@@@@@@@@@@@@@@@@@@@@", response)
                    var autocompleteData = [];
                    for (var i = 0; i < response.data.length; i++) {
                        autocompleteData[i] = { value: response.data[i], label: response.data[i] }
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
                            }, () => {
                                this.hideSecondComponent()
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
                                    }, () => {
                                        this.hideSecondComponent()
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false
                                    }, () => {
                                        this.hideSecondComponent()
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false
                                    }, () => {
                                        this.hideSecondComponent()
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
                        var itemLabelA = a.programCode.toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = b.programCode.toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    if (response.data.length == 1) {
                        this.setState({
                            programs: response.data,
                            loading: false,
                            programId: response.data[0].programId
                        }, () => {
                            if (localStorage.getItem("sesProgramIdReport") != '' && localStorage.getItem("sesProgramIdReport") != undefined && this.state.programs.filter(c => c.programId == localStorage.getItem("sesProgramIdReport")).length > 0) {
                                this.setState({
                                    programId: localStorage.getItem("sesProgramIdReport")
                                }, () => {
                                    this.getVersionList()
                                });
                            } else if (this.state.programId != null && this.state.programId != "" && this.state.programId != -1) {
                                this.getVersionList();
                            }
                        })
                    } else {
                        this.setState({
                            programs: listArray,
                            loading: false
                        }, () => {
                            if (localStorage.getItem("sesProgramIdReport") != '' && localStorage.getItem("sesProgramIdReport") != undefined && this.state.programs.filter(c => c.programId == localStorage.getItem("sesProgramIdReport")).length > 0) {
                                this.setState({
                                    programId: localStorage.getItem("sesProgramIdReport")
                                }, () => {
                                    this.getVersionList()
                                });
                            } else if (this.state.programId != null && this.state.programId != "" && this.state.programId != -1) {
                                this.getVersionList();
                            }
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
                        }, () => {
                            this.hideSecondComponent()
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
                                }, () => {
                                    this.hideSecondComponent()
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent()
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                }, () => {
                                    this.hideSecondComponent()
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
                console.log('erpDataList****************', erpDataList)
                let erpDataArray = [];
                let count = 0;
                let qty = 0;
                let convertedQty = 0;
                // if (erpDataList.length > 0) {
                for (var j = 0; j < erpDataList.length; j++) {
                    data = [];
                    // if (this.state.active3) {
                    //     data[0] = 0;
                    //     data[1] = erpDataList[j].erpOrderId;
                    //     data[2] = erpDataList[j].roNo + ' - ' + erpDataList[j].roPrimeLineNo + " | " + erpDataList[j].orderNo + ' - ' + erpDataList[j].primeLineNo;
                    //     data[3] = getLabelText(erpDataList[j].erpPlanningUnit.label);
                    //     data[4] = erpDataList[j].expectedDeliveryDate;
                    //     data[5] = erpDataList[j].erpStatus;
                    //     data[6] = erpDataList[j].shipmentQty;
                    //     data[7] = '';
                    //     // let convertedQty = this.addCommas(erpDataList[j].shipmentQty * 1);
                    //     data[8] = erpDataList[j].shipmentQty;
                    //     data[9] = '';
                    //     data[10] = 0;
                    //     data[11] = erpDataList[j].orderNo;
                    //     data[12] = erpDataList[j].primeLineNo;
                    //     data[13] = erpDataList[j].erpPlanningUnit.id;

                    // } else {
                    console.log("order no ---", erpDataList[j].orderNo + " active---", erpDataList[j].active)
                    data[0] = false;//A
                    data[1] = erpDataList[j].roNo + ' - ' + erpDataList[j].roPrimeLineNo + ' | ' + erpDataList[j].orderNo + ' - ' + erpDataList[j].primeLineNo + (erpDataList[j].knShipmentNo != '' && erpDataList[j].knShipmentNo != null ? ' | ' + erpDataList[j].knShipmentNo : "");//B
                    data[2] = erpDataList[j].orderNo + ' | ' + erpDataList[j].primeLineNo;//C
                    data[3] = getLabelText(erpDataList[j].erpPlanningUnit.label);//D
                    data[4] = erpDataList[j].expectedDeliveryDate;//E
                    data[5] = erpDataList[j].erpShipmentStatus;//F
                    data[6] = erpDataList[j].knShipmentNo;//G
                    data[7] = erpDataList[j].batchNo;//H
                    data[8] = erpDataList[j].expiryDate;//I
                    data[9] = erpDataList[j].erpQty;//J
                    // let conversionFactor = (erpDataList[j].conversionFactor != null && erpDataList[j].conversionFactor != "" ? erpDataList[j].conversionFactor : '');
                    data[10] = "";//K
                    // convertedQty = erpDataList[j].quantity * (erpDataList[j].conversionFactor != null && erpDataList[j].conversionFactor != "" ? erpDataList[j].conversionFactor : 1);
                    // data[11] = ``;
                    data[11] = `=ROUND(J${parseInt(j) + 1}*K${parseInt(j) + 1},0)`
                    data[12] = "";
                    data[13] = erpDataArray.filter(c => c[16] == erpDataList[j].roNo + ' | ' + erpDataList[j].roPrimeLineNo).length > 0 ? 1 : 0;
                    data[14] = erpDataList[j].qatEquivalentShipmentStatus;
                    data[15] = erpDataList[j];
                    data[16] = erpDataList[j].roNo + ' | ' + erpDataList[j].roPrimeLineNo
                    // data[9] = "";
                    // data[10] = "";
                    // data[11] = "";
                    // data[12] = "";
                    // data[13] = "";
                    // // data[10] = 0;
                    // // data[11] = erpDataList[j].orderNo;
                    // // data[12] = erpDataList[j].primeLineNo;
                    // // data[13] = 0;
                    // // if (erpDataList[j].active) {
                    // //     qty = Number(qty) + convertedQty;
                    // // }
                    // }
                    erpDataArray[count] = data;
                    count++;
                }
                this.setState({
                    totalQuantity: this.addCommas(Math.round(qty)),
                    displayTotalQty: (qty > 0 ? true : false)
                });
                console.log("TableDiv1@@@@@@@@@@@@@@@@@@@@@", document.getElementById("tableDiv1"))
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
                            width: 60
                        },
                        {
                            title: i18n.t('static.mt.roNoAndRoLineNo'),
                            type: 'text',
                            readOnly: true,
                            width: 150
                        },
                        {
                            title: i18n.t('static.mt.orderNoAndPrimeLineNo'),
                            type: 'hidden',
                            readOnly: true,
                            width: 0
                        },
                        {
                            title: i18n.t('static.dashboard.planningunitheader'),
                            type: 'text',
                            readOnly: true,
                            width: 200
                        },
                        {
                            title: i18n.t('static.supplyPlan.mtexpectedDeliveryDate'),
                            type: 'calendar',
                            readOnly: true,
                            options: { format: JEXCEL_DATE_FORMAT },
                            width: 80
                        },
                        {
                            title: i18n.t('static.shipmentDataEntry.shipmentStatus'),
                            type: 'text',
                            readOnly: true,
                            width: 60
                        },
                        {
                            title: i18n.t('static.mt.knShipmentNo'),
                            type: 'hidden',
                            readOnly: true,
                            width: 0
                        },
                        {
                            title: i18n.t('static.mt.batchNo'),
                            type: 'text',
                            readOnly: true,
                            width: 80
                        },
                        {
                            title: i18n.t('static.supplyPlan.expiryDate'),
                            type: 'calendar',
                            readOnly: true,
                            options: { format: JEXCEL_DATE_FORMAT },
                            width: 80
                        },
                        {
                            title: i18n.t('static.supplyPlan.qty'),
                            type: 'numeric',
                            mask: '#,##', decimal: '.',
                            readOnly: true,
                            width: 80
                        },
                        {
                            title: i18n.t('static.manualTagging.conversionFactor'),
                            type: 'numeric',
                            mask: '#,##0.0000',
                            decimal: '.',
                            textEditor: true,
                            disabledMaskOnEdition: true,
                            width: 80
                        },
                        {
                            title: i18n.t('static.manualTagging.convertedQATShipmentQty'),
                            type: 'numeric',
                            mask: '#,##0.0000',
                            decimal: '.',
                            readOnly: true,
                            width: 80
                        },
                        {
                            title: i18n.t('static.program.notes'),
                            type: 'text',
                            width: 200
                        },
                        {
                            title: "Exists",
                            type: 'hidden',
                        },
                        {
                            title: "QAT shipment status",
                            type: 'hidden',
                        },
                        {
                            title: "Object",
                            type: 'hidden',
                        },
                        {
                            title: "Ro No and Ro Prime line No",
                            type: 'hidden',
                        },
                    ],
                    // footers: [['Total','1','1','1','1',0,0,0,0]],
                    editable: true,
                    text: {
                        showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                        show: '',
                        entries: '',
                    },
                    onsearch: function (el) {
                        el.jexcel.updateTable();
                    },
                    onfilter: function (el) {
                        el.jexcel.updateTable();
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
                            if (rowData[13] == 0 && rowData[0]) {
                                var cell = elInstance.getCell(("K").concat(parseInt(y) + 1))
                                cell.classList.remove('readonly');
                                var cell = elInstance.getCell(("M").concat(parseInt(y) + 1))
                                cell.classList.remove('readonly');
                            } else {
                                var cell = elInstance.getCell(("K").concat(parseInt(y) + 1))
                                cell.classList.add('readonly');
                                var cell = elInstance.getCell(("M").concat(parseInt(y) + 1))
                                cell.classList.add('readonly');
                            }
                            if (rowData[13] == 1) {
                                var cell = elInstance.getCell(("A").concat(parseInt(y) + 1))
                                cell.classList.add('readonly');
                            }
                        }
                    }.bind(this),
                    // oneditionend: this.oneditionend,
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
        if (this.state.active2) {
            manualTaggingList = manualTaggingList.sort(function (a, b) {
                a = a.parentShipmentId > 0 ? a.parentShipmentId : a.tempParentShipmentId;
                b = b.parentShipmentId > 0 ? b.parentShipmentId : b.tempParentShipmentId;
                return a < b ? -1 : a > b ? 1 : 0;
            })
        }
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
                data[9] = manualTaggingList[j].shipmentId != 0 ? -1 : manualTaggingList[j].tempShipmentId;
            } else if (this.state.active2) {
                let shipmentQty = !this.state.versionId.toString().includes("Local") ? manualTaggingList[j].erpQty : manualTaggingList[j].shipmentQty;
                let linkedShipmentsListForTab2 = this.state.versionId.toString().includes("Local") ? this.state.linkedShipmentsListForTab2.filter(c => manualTaggingList[j].shipmentId > 0 ? c.childShipmentId == manualTaggingList[j].shipmentId : c.tempChildShipmentId == manualTaggingList[j].tempShipmentId) : [manualTaggingList[j]];
                console.log("linkedShipmentsListForTab2@@@@@@@@@@@", linkedShipmentsListForTab2)
                console.log("manualTaggingList[j]@@@@@@@@@@@@", manualTaggingList[j])
                data[0] = true;
                data[1] = manualTaggingList[j].parentShipmentId + " (" + (!this.state.versionId.toString().includes("Local") ? manualTaggingList[j].childShipmentId : manualTaggingList[j].shipmentId + ")");
                data[2] = !this.state.versionId.toString().includes("Local") ? manualTaggingList[j].childShipmentId : manualTaggingList[j].shipmentId
                data[3] = (linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2[0].roNo + " - " + linkedShipmentsListForTab2[0].roPrimeLineNo : "") + " | " + (manualTaggingList[j].orderNo + " - " + manualTaggingList[j].primeLineNo) + (linkedShipmentsListForTab2.length > 0 && linkedShipmentsListForTab2[0].knShipmentNo != "" && linkedShipmentsListForTab2[0].knShipmentNo != null ? " | " + linkedShipmentsListForTab2[0].knShipmentNo : "");
                data[4] = manualTaggingList[j].orderNo + " | " + manualTaggingList[j].primeLineNo
                data[5] = linkedShipmentsListForTab2.length > 0 ? getLabelText(linkedShipmentsListForTab2[0].erpPlanningUnit.label, this.state.lang) : ""
                data[6] = !this.state.versionId.toString().includes("Local") ? getLabelText(manualTaggingList[j].erpPlanningUnit.label, this.state.lang) : getLabelText(manualTaggingList[j].planningUnit.label, this.state.lang)
                data[7] = manualTaggingList[j].expectedDeliveryDate
                data[8] = linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2[0].erpShipmentStatus : ""
                // data[7] = ""
                data[9] = Math.round((shipmentQty) / (linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2[0].conversionFactor : 1))
                data[10] = linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2[0].conversionFactor : 1
                data[11] = `=ROUND(J${parseInt(j) + 1}*K${parseInt(j) + 1},0)`;
                data[12] = manualTaggingList[j].notes
                data[13] = manualTaggingList[j].orderNo
                data[14] = manualTaggingList[j].primeLineNo
                data[15] = manualTaggingList[j].tempShipmentId;
                data[16] = manualTaggingList[j];
                data[17] = linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2 : {}
                data[18] = linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2[0].roNo : ""
                data[19] = linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2[0].roPrimeLineNo : ""
                data[20] = manualTaggingArray.filter(c => (c[18] == (linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2[0].roNo : "")) && (c[19] == (linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2[0].roPrimeLineNo : ""))).length > 0 ? 1 : 0;
                data[21] = (linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2[0].roNo + " - " + linkedShipmentsListForTab2[0].roPrimeLineNo : "")
                data[22] = 0;
                data[23] = linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2[0].conversionFactor : 1;
                data[24] = manualTaggingList[j].notes;
                data[25] = this.state.versionId.toString().includes("Local") && linkedShipmentsListForTab2.length > 0 ? this.state.roPrimeNoListOriginal.filter(c => c.roNo == linkedShipmentsListForTab2[0].roNo && c.roPrimeLineNo == linkedShipmentsListForTab2[0].roPrimeLineNo)[0] : {};
            }
            else {
                // data[0] = manualTaggingList[j].erpOrderId
                data[0] = (manualTaggingList[j].roNo + " - " + manualTaggingList[j].roPrimeLineNo) + " | " + (manualTaggingList[j].orderNo + " - " + manualTaggingList[j].primeLineNo) + (manualTaggingList[j].knShipmentNo != "" && manualTaggingList[j].knShipmentNo != null ? " | " + manualTaggingList[j].knShipmentNo : "");
                data[1] = manualTaggingList[j].orderNo + " - " + manualTaggingList[j].primeLineNo
                data[2] = manualTaggingList[j].knShipmentNo;
                data[3] = getLabelText(manualTaggingList[j].erpPlanningUnit.label, this.state.lang)
                data[4] = manualTaggingList[j].expectedDeliveryDate
                data[5] = manualTaggingList[j].erpShipmentStatus
                data[6] = manualTaggingList[j].erpQty
                data[7] = j;

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
                colWidths: [20, 40, 50, 20, 20, 30, 30, 25, 50],
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
                    {
                        title: "Index",
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
                    return false;
                }.bind(this),
            };
        }

        else if (this.state.active2) {
            var options = {
                data: data,
                columnDrag: true,
                colWidths: [40, 40, 0, 50, 0, 80, 80, 30, 35, 25, 35, 35, 80],
                colHeaderClasses: ["Reqasterisk"],
                columns: [
                    {
                        title: i18n.t('static.mt.linked'),
                        type: 'checkbox',
                        // readOnly: this.state.versionId.toString().includes("Local") ? false : true
                        // mask: '#,##', decimal: '.'
                    },
                    {
                        title: i18n.t('static.mt.parentShipmentId(childShipmentId)'),
                        type: 'numeric',
                        readOnly: true
                        // mask: '#,##', decimal: '.'
                    },
                    {
                        title: i18n.t('static.mt.childShipmentId'),
                        type: 'hidden',
                        readOnly: true
                        // mask: '#,##', decimal: '.'
                    },
                    {
                        title: i18n.t('static.manualTagging.RONO'),
                        type: 'text',
                        readOnly: true
                    },
                    {
                        title: i18n.t('static.manualTagging.procOrderNo'),
                        type: 'hidden',
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
                        options: { format: JEXCEL_DATE_FORMAT },
                        readOnly: true
                    },
                    {
                        title: i18n.t('static.common.status'),
                        type: 'text',
                        readOnly: true
                    },

                    {
                        title: i18n.t('static.supplyPlan.qty'),
                        type: 'numeric',
                        mask: '#,##', decimal: '.',
                        readOnly: true
                    },
                    {
                        title: i18n.t('static.manualTagging.conversionFactor'),
                        type: 'numeric',
                        mask: '#,##0.0000', decimal: '.',
                        // readOnly: true
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
                        // readOnly: true
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
                        title: "tempShipmentId",
                        type: 'hidden',
                    },
                    {
                        title: "shipment list",
                        type: 'hidden',
                    },
                    {
                        title: "linked shipment list",
                        type: 'hidden',
                    },
                    {
                        title: "linked shipment list",
                        type: 'hidden',
                    },
                    {
                        title: "linked shipment list",
                        type: 'hidden',
                    },
                    {
                        title: "linked shipment list",
                        type: 'hidden',
                    },
                    {
                        title: "linked shipment list",
                        type: 'hidden',
                    },
                    {
                        title: "linked shipment list",
                        type: 'hidden',
                    },
                    {
                        title: "linked shipment list",
                        type: 'hidden',
                    },
                    {
                        title: "linked shipment list",
                        type: 'hidden',
                    },
                    {
                        title: "Original data",
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
                onchange: this.changeTab2,
                // onselection: this.selected,


                // oneditionend: this.onedit,
                copyCompatibility: true,
                allowExport: false,
                paginationOptions: JEXCEL_PAGINATION_OPTION,
                position: 'top',
                filters: true,
                license: JEXCEL_PRO_KEY,
                updateTable: function (el, cell, x, y, source, value, id) {
                    var elInstance = el.jexcel;
                    if (y != null) {
                        var rowData = elInstance.getRowData(y);
                        console.log("RowData@@@@@@@@", rowData)
                        if (rowData[20] == 1 || !this.state.versionId.toString().includes("Local")) {
                            var cell = elInstance.getCell(("A").concat(parseInt(y) + 1))
                            cell.classList.add('readonly');
                            var cell = elInstance.getCell(("K").concat(parseInt(y) + 1))
                            cell.classList.add('readonly');
                            var cell = elInstance.getCell(("M").concat(parseInt(y) + 1))
                            cell.classList.add('readonly');
                            if (rowData[0] == false) {
                                var cell = elInstance.getCell(("K").concat(parseInt(y) + 1))
                                cell.classList.add('readonly');
                                var cell = elInstance.getCell(("M").concat(parseInt(y) + 1))
                                cell.classList.add('readonly');
                            }
                        } else {
                            if (rowData[0] == false) {
                                var cell = elInstance.getCell(("K").concat(parseInt(y) + 1))
                                cell.classList.add('readonly');
                                var cell = elInstance.getCell(("M").concat(parseInt(y) + 1))
                                cell.classList.add('readonly');
                            } else {
                                var cell = elInstance.getCell(("K").concat(parseInt(y) + 1))
                                cell.classList.remove('readonly');
                                var cell = elInstance.getCell(("M").concat(parseInt(y) + 1))
                                cell.classList.remove('readonly');
                            }
                        }
                    }
                }.bind(this),
                onsearch: function (el) {
                    el.jexcel.updateTable();
                },
                onfilter: function (el) {
                    el.jexcel.updateTable();
                },
                contextMenu: function (obj, x, y, e) {
                    var items = [];
                    if (y != null) {
                        if (obj.options.allowInsertRow == true) {
                            items.push({
                                // title: i18n.t('static.dashboard.linkShipment'),
                                title: i18n.t('static.mt.viewArtmisHistory'),
                                onclick: function () {
                                    let orderNo = this.el.getValueFromCoords(13, y).toString().trim();
                                    let primeLineNo = this.el.getValueFromCoords(14, y).toString().trim();
                                    console.log("OrderNo@@@@@@@@@@", orderNo)
                                    console.log("primeLineNo@@@@@@@@@@", primeLineNo)
                                    ManualTaggingService.getARTMISHistory(orderNo, primeLineNo)
                                        .then(response => {
                                            console.log("MohitResponse.data@@@@@@@@@@@@@",response.data)
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
                                                    }, () => {
                                                        this.hideSecondComponent()
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
                                                            }, () => {
                                                                this.hideSecondComponent()
                                                            });
                                                            break;
                                                        case 412:
                                                            this.setState({
                                                                message: error.response.data.messageCode,
                                                                loading: false
                                                            }, () => {
                                                                this.hideSecondComponent()
                                                            });
                                                            break;
                                                        default:
                                                            this.setState({
                                                                message: 'static.unkownError',
                                                                loading: false
                                                            }, () => {
                                                                this.hideSecondComponent()
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
                colWidths: [50, 0, 0, 60, 45, 45],
                colHeaderClasses: ["Reqasterisk"],
                columns: [

                    {
                        title: i18n.t('static.mt.roNoAndRoLineNo'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.mt.orderNoAndPrimeLineNo'),
                        type: 'hidden',
                    },
                    {
                        title: i18n.t('static.mt.knShipmentNo'),
                        type: 'hidden',
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
                        title: i18n.t('static.common.status'),
                        type: 'text',
                    },

                    {
                        title: i18n.t('static.supplyPlan.shipmentQty'),
                        type: 'numeric',
                        mask: '#,##', decimal: '.'
                    },
                    {
                        title: "Index",
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


                // oneditionend: this.onedit,
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
        tr.children[10].classList.add('AsteriskTheadtrTd');
    }

    selected = function (instance, cell, x, y, value) {
        console.log("x$$$$$$$$$$$$$$$$", x);
        console.log("y$$$$$$$$$$$$$$$$", y);
        console.log("value$$$$$$$$$$$$$$$$", value);
        if ((x == 0 && value != 0) || (y == 0 && value != 0)) {
            // console.log("HEADER SELECTION--------------------------");
        } else {
            this.setState({
                loading: true
            })
            var outputListAfterSearch = [];
            let row;
            let json;
            let buildJexcelRequired = true;
            if (this.state.active1
                && this.state.versionId.includes("Local")
            ) {
                row = this.state.outputList.filter(c => (this.el.getValueFromCoords(0, x) != 0 ? c.shipmentId == this.el.getValueFromCoords(0, x) : c.tempShipmentId == this.el.getValueFromCoords(9, x)))[0];
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
                    table1Loader: outputListAfterSearch[0].orderNo != null && outputListAfterSearch[0].orderNo != "" ? false : true,
                    searchedValue: (outputListAfterSearch[0].orderNo != null && outputListAfterSearch[0].orderNo != "" ? outputListAfterSearch[0].orderNo : ""),
                    selectedRowPlanningUnit: outputListAfterSearch[0].planningUnit.id
                    // planningUnitIdUpdated: outputListAfterSearch[0].planningUnit.id
                }, () => {

                    this.getOrderDetails();
                });
            } else if (this.state.active2 && this.state.versionId.includes("Local")) {
                // var index = this.state.outputList.findIndex(c => (this.el.getValueFromCoords(1, x))>0?c.shipmentId == (this.el.getValueFromCoords(1, x)):c.tempShipmentId==(this.el.getValueFromCoords(14, x)))[0];
                var rowData = this.el.getRowData(x);
                // outputListAfterSearch.push(row);
                this.toggleLarge();
                this.getShipmentsForTab2(rowData[1], rowData[14], rowData[2].split("|")[0], rowData[2].split("|")[1]);
                // this.getOrderDetails();

            } else if (this.state.active3) {
                row = this.state.outputList.filter((c, index) => (index == this.el.getValueFromCoords(7, x)))[0];
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
                    // this.getOrderDetails();
                });
            } else {
                this.setState({
                    loading: false
                })
            }
            // outputListAfterSearch.push(row);
            // console.log("1------------------------------>>>>", outputListAfterSearch[0].erpPlanningUnit.id)
            if ((this.state.active1
                && this.state.versionId.includes("Local")) || this.state.active3) {
                console.log("In function To open popup@@@@@@@@@@@@@@@@@@@@@@@))))))))))))))))")
                this.setState({
                    planningUnitId: (this.state.active3 ? outputListAfterSearch[0].erpPlanningUnit.id : outputListAfterSearch[0].planningUnit.id),
                    shipmentId: (this.state.active1 ? this.el.getValueFromCoords(0, x) : (this.state.active2 ? this.el.getValueFromCoords(1, x) : 0)),
                    procurementAgentId: (this.state.active3 ? 1 : outputListAfterSearch[0].procurementAgent.id),
                    planningUnitName: (this.state.active3 ? row.erpPlanningUnit.label.label_en + "(" + row.skuCode + ")" : row.planningUnit.label.label_en + '(' + row.skuCode + ')')
                })
                this.toggleLarge();
            }
        }
    }.bind(this);

    getShipmentsForTab2 = (shipmentId, tempShipmentId, roNo, roPrimeLineNo) => {
        console.log("MohitShipmentId*****************", shipmentId);
        console.log("MohitParentShipmentId*****************", tempShipmentId);
        console.log("MohitRoNo*****************", roNo);
        console.log("MohitRoPrimeLineNo*****************", roPrimeLineNo);
        var linkedShipmentsListForTab2 = this.state.linkedShipmentsListForTab2;
        var filterOnRoNoAndRoPrimeLineNo = linkedShipmentsListForTab2.filter(c => c.roNo.toString().trim() == roNo.toString().trim() && c.roPrimeLineNo.toString().trim() == roPrimeLineNo.toString().trim());
        console.log("filterOnRoNoAndRoPrimeLineNo@@@@@@@@@@@", filterOnRoNoAndRoPrimeLineNo)
        this.setState({
            artmisList: filterOnRoNoAndRoPrimeLineNo,
            displayButton: false
        }, () => {
            this.buildJExcelERP()
        })

    }
    componentDidMount() {
        this.setState({ active1: true }, () => {
            this.hideFirstComponent();
            this.getLocalProgramList();
        });

    }

    getLocalProgramList(parameter) {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var datasetTransaction = db1.transaction(['programData'], 'readwrite');
            var datasetOs = datasetTransaction.objectStore('programData');
            var getRequest = datasetOs.getAll();
            getRequest.onerror = function (event) {
            }.bind(this);
            getRequest.onsuccess = function (event) {

                var datasetTransaction1 = db1.transaction(['program'], 'readwrite');
                var datasetOs1 = datasetTransaction1.objectStore('program');
                var getRequest1 = datasetOs1.getAll();
                getRequest1.onsuccess = function (event) {
                    var programList = getRequest1.result;

                    var datasetTransaction2 = db1.transaction(['programQPLDetails'], 'readwrite');
                    var datasetOs2 = datasetTransaction2.objectStore('programQPLDetails');
                    var getRequest2 = datasetOs2.getAll();
                    getRequest2.onsuccess = function (event) {
                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                        var userId = userBytes.toString(CryptoJS.enc.Utf8);
                        var programQPLDetails = getRequest2.result.filter(c => c.userId == userId);
                        var programList = getRequest1.result;


                        var myResult = getRequest.result.filter(c => c.userId == userId);
                        this.setState({
                            localProgramList: myResult,
                            programObjectStoreList: programList,
                            programQPLDetailsList: programQPLDetails
                        }, () => {
                            this.getProgramList();
                            if (parameter == 1) {
                                this.filterErpData();
                            }
                        })
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }

    getPlanningUnitList() {
        var programId = (this.state.active3 ? this.state.programId1.toString().split("_")[0] : this.state.programId);
        var versionId = this.state.versionId.toString();
        console.log("Condition@@@@@@@@@@@@@", programId != -1 && programId != null && programId != "" && (this.state.active3 || ((this.state.active1 || this.state.active2) && versionId != "-1")));
        if (programId != -1 && programId != null && programId != "" && (this.state.active3 || ((this.state.active1 || this.state.active2) && versionId != "-1"))) {
            // if (!versionId.includes("Local")) {
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
                            loading: false,
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
                            }, () => {
                                this.hideSecondComponent()
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
                                    }, () => {
                                        this.hideSecondComponent()
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false
                                    }, () => {
                                        this.hideSecondComponent()
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false
                                    }, () => {
                                        this.hideSecondComponent()
                                    });
                                    break;
                            }
                        }
                    }
                );
            // } else {
            //     var localProgramList = this.state.localProgramList;
            //     var localProgramListFilter = localProgramList.filter(c => c.programId == this.state.programId && c.version == versionId.split(" ")[0]);
            //     var programDataBytes = CryptoJS.AES.decrypt(localProgramListFilter[0].programData.generalData, SECRET_KEY);
            //     var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
            //     var programJson = JSON.parse(programData);
            //     console.log("ProgramJson@@@@@@@@@@@",programJson)
            //     var listArray = programJson.planningUnitList;
            //     var list = []
            //     for (var l = 0; l < listArray.length; l++) {
            //         list.push({
            //             planningUnit: {
            //                 id: listArray[l].id,
            //                 label: listArray[l].label,
            //                 active: listArray[l].active
            //             }
            //         })
            //     }
            //     list.sort((a, b) => {
            //         var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
            //         var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
            //         return itemLabelA > itemLabelB ? 1 : -1;
            //     });

            //     list = list.filter(c => (c.active == true))
            //     this.setState({
            //         planningUnits: list
            //     }, () => {
            //         if (!this.state.active3) {
            //             this.getPlanningUnitArray();
            //         }
            //     })

            // }
        } else {
            this.setState({
                outputList: []
            }, () => {
                try {
                    this.state.languageEl.destroy();
                } catch (e) {

                }
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
                    tempShipmentId: row.shipmentId > 0 ? null : row.tempShipmentId,
                    tempNotes: (row.notes != null && row.notes != "" ? row.notes : "")
                });
            }
        };
        const { programs } = this.state;
        let programList = programs.length > 0 && programs.map((item, i) => {
            return (
                <option key={i} value={item.programId}>
                    {/* {getLabelText(item.label, this.state.lang)} */}
                    {item.programCode}
                </option>
            )
        }, this);

        const { versionList } = this.state;
        let versions = versionList.length > 0 && versionList.map((item, i) => {
            return (
                <option key={i} value={item.versionId}>
                    {/* {getLabelText(item.label, this.state.lang)} */}
                    {item.versionId}
                </option>
            )
        }, this);

        const { countryWisePrograms } = this.state;
        let filteredProgramList = countryWisePrograms.length > 0 && countryWisePrograms.map((item, i) => {
            return (
                <option key={i} value={item.id}>
                    {/* {getLabelText(item.label, this.state.lang)} */}
                    {item.programCode + "~v" + item.version}
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
        let shipmentIdList = notLinkedShipments.length > 0 && notLinkedShipments.filter(c => c.shipmentId != 0).map((item, i) => {
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
                        <b><div className="col-md-11 pl-3" style={{ 'marginLeft': '-15px', 'marginTop': '-13px' }}> <span style={{ 'color': '#002f6c', 'fontSize': '13px' }}>{i18n.t('static.mt.manualTaggingNotePart1')}<a href="#/program/downloadProgram" target="_blank">{i18n.t('static.mt.manualTaggingNotePart2')}</a>{i18n.t('static.mt.manualTaggingNotePart3')}</span></div></b><br />

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
                                {(this.state.active1 || this.state.active2) &&
                                    <FormGroup className="col-md-3 ">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.report.version')}</Label>
                                        <div className="controls ">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="versionId"
                                                    id="versionId"
                                                    bsSize="sm"
                                                    value={this.state.versionId}
                                                    // onChange={this.getPlanningUnitList}
                                                    onChange={(e) => { this.versionChange(e); }}
                                                >
                                                    <option value="-1">{i18n.t('static.common.select')}</option>
                                                    {versions}
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

                            <div className="ReportSearchMarginTop  consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
                                <div id="tableDiv" className={!this.state.active2 ? "jexcelremoveReadonlybackground RowClickable" : "RowClickable"}>
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
                                        {!this.state.active3 && !this.state.active2 && <p><h5><b>{i18n.t('static.manualTagging.qatShipmentTitle')}</b></h5></p>}
                                        {!this.state.active3 && !this.state.active2 &&
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
                                                            <FormGroup className="col-md-6 ">
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
                                                        keyField="tempIndex"
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
                                        {!this.state.active2 && <><p><h5><b>{i18n.t('static.manualTagging.erpShipment')}</b></h5></p>
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
                                            </Col></>}
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

                                    {this.state.displaySubmitButton
                                        && (this.state.active4 || this.state.originalQty > 0)
                                        && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.link}> <i className="fa fa-check"></i>{(this.state.active2 ? i18n.t('static.common.update') : i18n.t('static.manualTagging.link'))}</Button>}

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
                    {this.state.active2 && <CardFooter>
                        {this.state.changedDataForTab2 && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.delink}> <i className="fa fa-check"></i>{(this.state.active2 ? i18n.t('static.common.update') : i18n.t('static.manualTagging.link'))}</Button>}
                    </CardFooter>}
                </Card>

            </div>
        );
    }

}
