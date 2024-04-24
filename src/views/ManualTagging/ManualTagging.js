import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CryptoJS from 'crypto-js';
import jexcel from 'jspreadsheet';
import moment from 'moment';
import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import filterFactory from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { MultiSelect } from 'react-multi-select-component';
import { Button, Card, CardBody, CardFooter, Col, FormGroup, Input, InputGroup, Label, ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from '../../CommonComponent/IndexedDbFunctions.js';
import { jExcelLoadedFunction, jExcelLoadedFunctionForErp, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js';
import { generateRandomAplhaNumericCode, hideFirstComponent, hideSecondComponent, paddingZero } from '../../CommonComponent/JavascriptCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, BATCH_PREFIX, DATE_FORMAT_CAP, DATE_FORMAT_CAP_WITHOUT_DATE, DELIVERED_SHIPMENT_STATUS, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_DATE_FORMAT, JEXCEL_DATE_FORMAT_WITHOUT_DATE, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, NONE_SELECTED_DATA_SOURCE_ID, PROGRAM_TYPE_SUPPLY_PLAN, PSM_PROCUREMENT_AGENT_ID, SECRET_KEY, SHIPMENT_ID_ARR_MANUAL_TAGGING, SHIPMENT_MODIFIED, STRING_TO_DATE_FORMAT, TBD_FUNDING_SOURCE, USD_CURRENCY_ID } from '../../Constants.js';
import DropdownService from '../../api/DropdownService.js';
import FundingSourceService from '../../api/FundingSourceService';
import ManualTaggingService from '../../api/ManualTaggingService.js';
import PlanningUnitService from '../../api/PlanningUnitService.js';
import ProductService from '../../api/ProductService';
import ProgramService from '../../api/ProgramService.js';
import RealmCountryService from '../../api/RealmCountryService';
import conversionFormula from '../../assets/img/conversionFormula.png';
import conversionFormulaExample from '../../assets/img/conversionFormulaExample.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { calculateSupplyPlan } from '../SupplyPlan/SupplyPlanCalculations.js';
// Localized entity name
const entityname = i18n.t('static.dashboard.manualTagging');
/**
 * Component for manual tagging.
 */
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
            selectedRowPlanningUnitLabel: '',
            programId1: '',
            fundingSourceId: '',
            budgetId: '',
            totalQuantity: '',
            filteredBudgetList: [],
            budgetList: [],
            planningUnits1: [],
            finalShipmentId: [],
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
            active1: this.props.match.params.tab == 2 ? false : true,
            active2: this.props.match.params.tab == 2 ? true : false,
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
            changedDataForTab2: false,
            roPrimeLineNoForTab3: "",
            planningUnitsBasedOnTracerCategory: [],
            test: 0,
            showAllShipments: false,
            lang: localStorage.getItem('lang')
        }
        this.filterData = this.filterData.bind(this);
        this.filterErpData = this.filterErpData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.formatPlanningUnitLabel = this.formatPlanningUnitLabel.bind(this);
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
        this.toggleDetailsModal = this.toggleDetailsModal.bind(this);
        this.toggle = this.toggle.bind(this);
        this.toggleArtmisHistoryModal = this.toggleArtmisHistoryModal.bind(this);
        this.changeTab2 = this.changeTab2.bind(this);
        this.delink = this.delink.bind(this);
        this.loadedERP = this.loadedERP.bind(this)
        this.changedTab1 = this.changedTab1.bind(this)
        this.filterRealmCountryPlanningUnit = this.filterRealmCountryPlanningUnit.bind(this)
    }
    /**
     * Handles the change event of the version dropdown.
     * Updates the component state based on the selected version.
     * @param {object} event - The event object representing the version dropdown change event.
     */
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
                    outputList: [],
                    planningUnits: [],
                    loading: false
                }, () => {
                    try {
                        jexcel.destroy(document.getElementById("tableDiv"), true);
                    } catch (e) {
                    }
                })
            }
        })
    }
    /**
     * Toggle Artmis history popup
     */
    toggleArtmisHistoryModal() {
        this.setState({
            artmisHistoryModal: !this.state.artmisHistoryModal,
            batchDetails: []
        }, () => {
            this.sampleFunction();
        })
    }
    /**
     * Calls buildJexcel function
     */
    sampleFunction() {
        this.setState({
            test: 10
        }, () => {
            this.buildJexcel()
        })
    }
    /**
     * Builds the jexcel component to display order details list.
     */
    buildJexcel() {
        try {
            this.el = jexcel(document.getElementById("tableDivOrderDetails"), '');
            jexcel.destroy(document.getElementById("tableDivOrderDetails"), true);
        } catch (err) {
        }
        var json = [];
        var orderHistory = this.state.artmisHistory.erpOrderList
        var count = 0;
        for (var sb = orderHistory.length - 1; sb >= 0; sb--) {
            var data = [];
            data[0] = orderHistory[sb].procurementAgentOrderNo;
            data[1] = orderHistory[sb].planningUnitName;
            data[2] = moment(moment(orderHistory[sb].expectedDeliveryDate).format("YYYY-MM-DD") + " 00:00:" + (sb <= 9 ? ("0" + sb) : sb)).format("YYYY-MM-DD HH:mm:ss");
            data[3] = orderHistory[sb].status;
            data[4] = orderHistory[sb].qty;
            data[5] = orderHistory[sb].cost;
            data[6] = moment(moment(orderHistory[sb].dataReceivedOn).format("YYYY-MM-DD") + " 00:00:" + (sb <= 9 ? ("0" + sb) : sb)).format("YYYY-MM-DD HH:mm:ss");
            data[7] = orderHistory[sb].changeCode;
            data[8] = count;
            count++;
            json.push(data);
        }
        var options = {
            data: json,
            columnDrag: false,
            columns: [
                { title: i18n.t('static.mt.roNoAndRoLineNo'), type: 'text', width: 150 },
                { title: i18n.t('static.manualTagging.erpPlanningUnit'), type: 'text', width: 200 },
                { title: i18n.t('static.supplyPlan.mtexpectedDeliveryDate'), type: 'calendar', options: { format: JEXCEL_DATE_FORMAT }, width: 100 },
                { title: i18n.t('static.manualTagging.erpStatus'), type: 'text', width: 150 },
                { title: i18n.t('static.manualTagging.erpShipmentQty'), type: 'numeric', mask: '#,##.00', disabledMaskOnEdition: true, textEditor: true, decimal: '.', width: 100 },
                { title: i18n.t('static.shipment.totalCost'), type: 'numeric', mask: '#,##.00', disabledMaskOnEdition: true, textEditor: true, decimal: '.', width: 100 },
                { title: i18n.t('static.mt.dataReceivedOn'), type: 'calendar', options: { format: JEXCEL_DATE_FORMAT }, width: 100 },
                { title: i18n.t('static.manualTagging.changeCode'), type: 'text', width: 100 },
                { type: 'hidden' }
            ],
            pagination: false,
            search: false,
            columnSorting: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: true,
            copyCompatibility: true,
            allowInsertRow: true,
            allowManualInsertRow: false,
            allowExport: false,
            editable: false,
            license: JEXCEL_PRO_KEY,
            onload: this.loadedOrderHistory,
            updateTable: function (el, cell, x, y, source, value, id) {
                var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
                var elInstance = el;
                var index = elInstance.getJson(null, false).findIndex(c => c[8] == 0);
                for (var j = 0; j < colArr.length; j++) {
                    var col = (colArr[j]).concat(parseInt(index) + 1);
                    var cell = elInstance.getCell(col);
                    cell.classList.add('historyBold');
                }
            }.bind(this),
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this)
        };
        var elVar = jexcel(document.getElementById("tableDivOrderDetails"), options);
        this.el = elVar;
        try {
            this.el = jexcel(document.getElementById("tableDivShipmentDetails"), '');
            jexcel.destroy(document.getElementById("tableDivShipmentDetails"), true);
        } catch (err) {
        }
        var json = [];
        var shipmentHistory = this.state.artmisHistory.erpShipmentList
        var count1 = 0;
        for (var sb = shipmentHistory.length - 1; sb >= 0; sb--) {
            var data = [];
            data[0] = shipmentHistory[sb].procurementAgentShipmentNo;
            data[1] = moment(moment(shipmentHistory[sb].deliveryDate).format("YYYY-MM-DD") + " 00:00:" + (sb <= 9 ? ("0" + sb) : sb)).format("YYYY-MM-DD HH:mm:ss");
            data[2] = shipmentHistory[sb].batchNo;
            data[3] = moment(shipmentHistory[sb].expiryDate).format("YYYY-MM-DD");
            data[4] = shipmentHistory[sb].qty;
            data[5] = moment(moment(shipmentHistory[sb].dataReceivedOn).format("YYYY-MM-DD") + " 00:00:" + (sb <= 9 ? ("0" + sb) : sb)).format("YYYY-MM-DD HH:mm:ss");
            data[6] = shipmentHistory[sb].changeCode;
            data[7] = count1;
            count1++;
            json.push(data);
        }
        var options = {
            data: json,
            columnDrag: false,
            columns: [
                { title: i18n.t('static.mt.roNoAndRoLineNo'), type: 'text', width: 150 },
                { title: i18n.t('static.supplyPlan.mtexpectedDeliveryDate'), type: 'calendar', options: { format: JEXCEL_DATE_FORMAT }, width: 100 },
                { title: i18n.t('static.supplyPlan.batchId'), type: 'text', width: 150 },
                { title: i18n.t('static.supplyPlan.expiryDate'), type: 'calendar', options: { format: JEXCEL_DATE_FORMAT_WITHOUT_DATE }, width: 100 },
                { title: i18n.t('static.supplyPlan.shipmentQty'), type: 'numeric', mask: '#,##.00', disabledMaskOnEdition: true, textEditor: true, decimal: '.', width: 100 },
                { title: i18n.t('static.mt.dataReceivedOn'), type: 'calendar', options: { format: JEXCEL_DATE_FORMAT }, width: 100 },
                { title: i18n.t('static.manualTagging.changeCode'), type: 'text', width: 100 },
                { type: 'hidden' }
            ],
            pagination: false,
            search: false,
            columnSorting: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: true,
            copyCompatibility: true,
            allowInsertRow: true,
            allowManualInsertRow: false,
            allowExport: false,
            editable: false,
            license: JEXCEL_PRO_KEY,
            onload: this.loadedShipmentHistory,
            updateTable: function (el, cell, x, y, source, value, id) {
                var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
                var elInstance = el;
                var index = elInstance.getJson(null, false).findIndex(c => c[7] == 0);
                for (var j = 0; j < colArr.length; j++) {
                    var col = (colArr[j]).concat(parseInt(index) + 1);
                    var cell = elInstance.getCell(col);
                    cell.classList.add('historyBold');
                }
            }.bind(this),
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this)
        };
        var elVar = jexcel(document.getElementById("tableDivShipmentDetails"), options);
        this.el = elVar;
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loadedOrderHistory(instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
        var asterisk = document.getElementsByClassName("jss")[1].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[8].title = i18n.t('static.manualTagging.changeOrderOrder');
        tr.children[8].classList.add('InfoTr');
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loadedShipmentHistory(instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
        var asterisk = document.getElementsByClassName("jss")[2].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[7].title = i18n.t('static.manualTagging.changeOrderShipment');
        tr.children[7].classList.add('InfoTr');
    }
    /**
     * Toggles the details modal
     */
    toggleDetailsModal() {
        this.setState({
            modal: !this.state.modal
        })
    }
    /**
     * Toggles the details modal
     */
    toggle() {
        this.setState({
            modal: !this.state.modal,
        });
    }
    /**
     * Function to filter program by realm country
     */
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
                programId1: localProgramList[0].id,
                countryWisePrograms: localProgramList
            }, () => {
                this.getOrderDetails();
                this.getPlanningUnitListBasedOnTracerCategory();
                this.getBudgetListByProgramId();
            });
        } else {
            this.setState({
                countryWisePrograms: localProgramList,
                planningUnits: []
            }, () => {
                this.getOrderDetails(1);
            });
        }
    }
    /**
     * Reterives planning unit list by realm country
     */
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
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loading: false
                        }, () => {
                            hideSecondComponent()
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
                                    hideSecondComponent()
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                }, () => {
                                    hideSecondComponent()
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                }, () => {
                                    hideSecondComponent()
                                });
                                break;
                        }
                    }
                }
            );
    }
    /**
     * Handles the click event when cancel button is clicked.
     * Shows 'div2', filters data based on 'active1' or 'active2' state, or calls 'filterErpData' if neither is active.
     * Resets state variables like 'originalQty', 'message', 'planningUnitIdUpdated', and 'table1Loader'.
     * Hides the second component and toggles the large view.
     */
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
            hideSecondComponent();
            this.toggleLarge();
        })
    }
    /**
     * Displays shipment data based on selected shipment or planning unit.
     * Determines the selected shipment or planning unit based on checkbox state and DOM element values.
     * Filters the shipment data accordingly and sorts it based on expected delivery date.
     * Sets the state variables 'finalShipmentId', 'selectedShipment', and 'originalQty'.
     */
    displayShipmentData() {
        let selectedShipmentId = (this.state.checkboxValue && document.getElementById("notLinkedShipmentId")!=null ? parseInt(document.getElementById("notLinkedShipmentId").value) : 0);
        let selectedPlanningUnitId = (!this.state.checkboxValue && document.getElementById("planningUnitId1")!=null ? parseInt(document.getElementById("planningUnitId1").value) : 0);
        let selectedShipment;
        if (selectedShipmentId != null && selectedShipmentId != 0 && this.state.checkboxValue) {
            selectedShipment = this.state.notLinkedShipments.filter(c => (c.shipmentId == selectedShipmentId));
        } else {
            selectedShipment = this.state.notLinkedShipments.filter(c => (c.planningUnit.id == selectedPlanningUnitId));
        }
        for (var ss = 0; ss < selectedShipment.length; ss++) {
            selectedShipment[ss].tempIndex = selectedShipment[ss].shipmentId > 0 ? selectedShipment[ss].shipmentId : selectedShipment[ss].tempShipmentId;
        }
        this.setState({
            finalShipmentId: [],
            selectedShipment: selectedShipment.sort((a, b) => {
                var itemLabelA = moment(a.expectedDeliveryDate).format("YYYY-MM-DD"); 
                var itemLabelB = moment(b.expectedDeliveryDate).format("YYYY-MM-DD"); 
                return itemLabelA > itemLabelB ? 1 : -1;
            }),
            originalQty: ''
        }, () => {
        })
    }
    /**
     * Retrieves and filters shipment data for not linked shipments.
     * Filters shipments based on program ID, planning units, and shipment status criteria.
     * Sorts the filtered shipment list based on shipment ID.
     * Sets the state variable 'notLinkedShipments' with the filtered and sorted shipment list.
     */
    getNotLinkedShipments() {
        let programId1 = this.state.programId1;
        if (programId1 != "") {
            var shipmentList = [];
            var localProgramList = this.state.localProgramList;
            var setOfPlanningUnitsBasedOnTracerCategory = [...new Set(this.state.planningUnitsBasedOnTracerCategory.map(ele => ele.planningUnit.id))]
            var localProgramListFilter = localProgramList.filter(c => c.id == programId1);
            var planningUnitDataList = localProgramListFilter[0].programData.planningUnitDataList;
            for (var pu = 0; pu < planningUnitDataList.length; pu++) {
                if (setOfPlanningUnitsBasedOnTracerCategory.includes(planningUnitDataList[pu].planningUnitId)) {
                    var planningUnitData = planningUnitDataList[pu];
                    var programDataBytes = CryptoJS.AES.decrypt(planningUnitData.planningUnitData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var planningUnitDataJson = JSON.parse(programData);
                    shipmentList = shipmentList.concat(planningUnitDataJson.shipmentList);
                }
            }
            shipmentList = shipmentList.filter(c => c.erpFlag.toString() == "false" && c.active.toString() == "true" && c.accountFlag.toString() == "true" && c.procurementAgent.id == PSM_PROCUREMENT_AGENT_ID && SHIPMENT_ID_ARR_MANUAL_TAGGING.includes(c.shipmentStatus.id.toString()));
            shipmentList = shipmentList.filter(c => (
                (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? moment(c.receivedDate).format("YYYY-MM-DD") < moment(Date.now()).subtract(6, 'months').format("YYYY-MM-DD") : moment(c.expectedDeliveryDate).format("YYYY-MM-DD") < moment(Date.now()).subtract(6, 'months').format("YYYY-MM-DD")) &&
                ([3, 4, 5, 6, 9]).includes(c.shipmentStatus.id.toString())) || (
                    (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? moment(c.receivedDate).format("YYYY-MM-DD") >= moment(Date.now()).subtract(6, 'months').format("YYYY-MM-DD") : moment(c.expectedDeliveryDate).format("YYYY-MM-DD") >= moment(Date.now()).subtract(6, 'months').format("YYYY-MM-DD")) &&
                    SHIPMENT_ID_ARR_MANUAL_TAGGING.includes(c.shipmentStatus.id.toString())));
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
    /**
     * Reterives product category list from server
     */
    getProductCategories() {
        let realmId = AuthenticationService.getRealmId();
        ProductService.getProductCategoryList(realmId)
            .then(response => {
                this.setState({
                    productCategories: response.data.splice(1)
                })
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loading: false
                        }, () => {
                            hideSecondComponent()
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
                                    hideSecondComponent()
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                }, () => {
                                    hideSecondComponent()
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                }, () => {
                                    hideSecondComponent()
                                });
                                break;
                        }
                    }
                }
            );
    }
    /**
     * Function to check validation of the jexcel table.
     * @returns {boolean} - True if validation passes, false otherwise.
     */
    checkValidationTab2 = function () {
        var valid = true;
        var json = this.state.languageEl.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var rowData = json[y];
            if (rowData[21] == 0) {
                var col = ("K").concat(parseInt(y) + 1);
                if (this.state.languageEl.getValueFromCoords(0, y)) {
                    var col = ("I").concat(parseInt(y) + 1);
                    var value = this.el.getValue(`I${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                    if (value == "") {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                        this.el.setComments(col, "");
                    }
                } else {
                    var col = ("I").concat(parseInt(y) + 1);
                    this.state.languageEl.setStyle(col, "background-color", "transparent");
                    this.state.languageEl.setComments(col, "");
                }
            }
        }
        return valid;
    }
    /**
     * Function to check validation of the jexcel table.
     * @returns {boolean} - True if validation passes, false otherwise.
     */
    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var rowData = json[y];
            if (rowData[14] == 0) {
                var col = ("L").concat(parseInt(y) + 1);
                if (this.el.getValueFromCoords(0, y)) {
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
                var col = ("J").concat(parseInt(y) + 1);
                if (this.el.getValueFromCoords(0, y)) {
                    var value = this.el.getValue(`J${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                    if (value == "") {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        return valid;
    }
    /**
     * Function to handle changes in jexcel cells.
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The cell object that changed.
     * @param {number} x - The x-coordinate of the changed cell.
     * @param {number} y - The y-coordinate of the changed cell.
     * @param {any} value - The new value of the changed cell.
     */
    changeTab2 = function (instance, cell, x, y, value) {
        if (!this.state.changedDataForTab2) {
            this.setState({
                changedDataForTab2: true
            })
        }
        var rowData = this.el.getRowData(y);
        if (this.el.getValueFromCoords(23, y) == 0) {
            this.el.setValueFromCoords(23, y, 1, true);
        }
        if (rowData[30] == 0) {
            if (x == 0) {
                var json = this.el.getJson(null, false);
                var checkboxValue = this.el.getValue(`A${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                if (checkboxValue.toString() == "true") {
                    for (var j = 0; j < json.length; j++) {
                        if (json[j][29] == this.el.getValueFromCoords(29, y, true)) {
                            if (j != y) {
                                this.el.setValueFromCoords(0, j, true, true);
                            }
                        }
                    }
                } else {
                    for (var j = 0; j < json.length; j++) {
                        if (j != y && json[j][29] == this.el.getValueFromCoords(29, y, true)) {
                            this.el.setValueFromCoords(0, j, false, true);
                        }
                    }
                }
            }
        }
        if (rowData[21] == 0) {
            if (x == 8) {
                var col = ("I").concat(parseInt(y) + 1);
                value = this.el.getValue(`I${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setComments(col, "");
                    var json = this.el.getJson(null, false);
                    var rcpu = this.state.realmCountryPlanningUnitList.filter(c => c.id == this.el.getValueFromCoords(8, y))[0];
                    this.el.setValueFromCoords(11, y, Math.round(this.el.getValueFromCoords(32, y) * rcpu.multiplier), true);
                    this.el.setValueFromCoords(10, y, rcpu.multiplier, true);
                    for (var j = 0; j < json.length; j++) {
                        if (j != y && json[j][22] == this.el.getValueFromCoords(22, y, true)) {
                            this.el.setValueFromCoords(11, j, Math.round(this.el.getValueFromCoords(32, j) * rcpu.multiplier), true);
                            this.el.setValueFromCoords(10, j, rcpu.multiplier, true);
                            this.el.setValueFromCoords(8, j, rcpu.id, true);
                        }
                    }
                }
            }
            if (x == 13) {
                var json = this.el.getJson(null, false);
                for (var j = 0; j < json.length; j++) {
                    if (j != y && json[j][22] == this.el.getValueFromCoords(22, y, true)) {
                        this.el.setValueFromCoords(13, j, value, true);
                    }
                }
            }
        }
    }
    /**
     * Function to handle changes in jexcel cells.
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The cell object that changed.
     * @param {number} x - The x-coordinate of the changed cell.
     * @param {number} y - The y-coordinate of the changed cell.
     * @param {any} value - The new value of the changed cell.
     */
    changedTab1 = function (instance, cell, x, y, value) {
        if (x == 0) {
            var finalShipmentId = this.state.finalShipmentId;
            var rowData = instance.getRowData(y);
            if (value.toString() == "true") {
                finalShipmentId.push({ "shipmentId": rowData[2], "tempShipmentId": rowData[2] > 0 ? null : rowData[14], "index": rowData[13], "qty": rowData[9] })
            } else {
                finalShipmentId = finalShipmentId.filter(c => c.index != rowData[13]);
            }
            var qty = 0;
            finalShipmentId.map(c => {
                qty += Number(c.qty)
            })
            this.setState({
                originalQty: qty,
                finalShipmentId: finalShipmentId,
            });
        }
    }
    /**
     * Function to handle changes in jexcel cells.
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The cell object that changed.
     * @param {number} x - The x-coordinate of the changed cell.
     * @param {number} y - The y-coordinate of the changed cell.
     * @param {any} value - The new value of the changed cell.
     */
    changed = function (instance, cell, x, y, value) {
        if (this.state.instance.getJson(null, false).length > 0) {
            var rowData = this.state.instance.getRowData(y);
            if (rowData[14] == 0) {
                var json = this.state.instance.getJson(null, false);
                if (x == 0) {
                    if (rowData[0].toString() == "true") {
                        if (this.state.active4 && this.state.instance.getValueFromCoords(13, y) == "") {
                            this.state.instance.setValueFromCoords(13, y, i18n.t("static.manualTagging.newShipmentNotes"), true);
                            for (var j = 0; j < json.length; j++) {
                                if (json[j][17] == this.state.instance.getValueFromCoords(17, y, true)) {
                                    if (j != y) {
                                        this.state.instance.setValueFromCoords(13, j, i18n.t("static.manualTagging.newShipmentNotes"), true);
                                    }
                                }
                            }
                        } else if (this.state.active5 && this.state.instance.getValueFromCoords(13, y) == i18n.t("static.manualTagging.newShipmentNotes")) {
                            this.state.instance.setValueFromCoords(13, y, "", true);
                            for (var j = 0; j < json.length; j++) {
                                if (json[j][17] == this.state.instance.getValueFromCoords(17, y, true)) {
                                    if (j != y) {
                                        this.state.instance.setValueFromCoords(13, j, "", true);
                                    }
                                }
                            }
                        }
                    } else {
                        this.state.instance.setValueFromCoords(13, y, "", true);
                        for (var j = 0; j < json.length; j++) {
                            if (json[j][17] == this.state.instance.getValueFromCoords(17, y, true)) {
                                if (j != y) {
                                    this.state.instance.setValueFromCoords(13, j, "", true);
                                }
                            }
                        }
                    }
                }
                if (x == 9) {
                    var col = ("J").concat(parseInt(y) + 1);
                    value = this.state.instance.getValue(`J${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                    if (value == "") {
                        this.state.instance.setStyle(col, "background-color", "transparent");
                        this.state.instance.setStyle(col, "background-color", "yellow");
                        this.state.instance.setComments(col, i18n.t('static.label.fieldRequired'));
                    } else {
                        this.state.instance.setStyle(col, "background-color", "transparent");
                        this.state.instance.setComments(col, "");
                        this.state.instance.setComments(col, "");
                        var rcpuFilter = this.state.realmCountryPlanningUnitList.filter(c => c.id == this.state.instance.getValueFromCoords(9, y))[0];
                        if (rowData[0].toString() == "true") {
                            this.state.instance.setValueFromCoords(12, y, Math.round(this.state.instance.getValueFromCoords(10, y) * rcpuFilter.multiplier), true);
                            this.state.instance.setValueFromCoords(11, y, Number(rcpuFilter.multiplier), true);
                            this.state.instance.setValueFromCoords(19, y, Math.round(this.state.instance.getValueFromCoords(10, y)), true);
                            for (var j = 0; j < json.length; j++) {
                                if (json[j][17] == this.state.instance.getValueFromCoords(17, y, true)) {
                                    if (j != y) {
                                        this.state.instance.setValueFromCoords(9, j, rcpuFilter.id, true);
                                        this.state.instance.setValueFromCoords(12, j, Math.round(this.state.instance.getValueFromCoords(10, j) * rcpuFilter.multiplier), true);
                                        this.state.instance.setValueFromCoords(11, j, Number(rcpuFilter.multiplier), true);
                                        this.state.instance.setValueFromCoords(19, j, Math.round(this.state.instance.getValueFromCoords(10, j)), true);
                                    }
                                }
                            }
                        }
                    }
                }
                if (x == 13) {
                    var col = ("N").concat(parseInt(y) + 1);
                    value = this.state.instance.getValue(`N${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                    if (rowData[0].toString() == "true") {
                        for (var j = 0; j < json.length; j++) {
                            if (json[j][17] == this.state.instance.getValueFromCoords(17, y, true)) {
                                if (j != y) {
                                    this.state.instance.setValueFromCoords(13, j, value, true);
                                }
                            }
                        }
                    }
                }
                if (x == 0) {
                    var checkboxValue = this.state.instance.getValue(`A${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                    if (checkboxValue.toString() == "true") {
                        for (var j = 0; j < json.length; j++) {
                            if (json[j][17] == this.state.instance.getValueFromCoords(17, y, true)) {
                                if (j != y) {
                                    this.state.instance.setValueFromCoords(0, j, true, true);
                                }
                            }
                        }
                    } else {
                        this.state.instance.setValueFromCoords(9, y, "", true);
                        this.state.instance.setValueFromCoords(11, y, "", true);
                        this.state.instance.setValueFromCoords(13, y, "", true);
                        for (var j = 0; j < json.length; j++) {
                            if (j != y && json[j][17] == this.state.instance.getValueFromCoords(17, y, true)) {
                                this.state.instance.setValueFromCoords(0, j, false, true);
                                this.state.instance.setValueFromCoords(9, j, "", true);
                                this.state.instance.setValueFromCoords(11, j, "", true);
                                this.state.instance.setValueFromCoords(13, j, "", true);
                            }
                        }
                    }
                }
                this.displayButton();
            }
        }
    }.bind(this);
    /**
     * Function to handle cell edits in jexcel.
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The cell object being edited.
     * @param {number} x - The x-coordinate of the edited cell.
     * @param {number} y - The y-coordinate of the edited cell.
     * @param {any} value - The new value of the edited cell.
     */
    onedit = function (instance, cell, x, y, value) {
        this.el.setValueFromCoords(10, y, 1, true);
    }.bind(this);
    /**
     * Handles the change event of the data change checkbox.
     * Updates the state variables based on the checkbox value.
     * Clears the selected shipment and resets the original quantity.
     * @param {object} event - The event object generated by the checkbox change.
     */
    dataChangeCheckbox(event) {
        this.setState({
            selectedShipment: [],
            originalQty: 0,
            checkboxValue: (event.target.checked ? true : false)
        })
    }
    /**
     * Handles the change event of data options.
     * Updates state variables based on the selected option.
     * Resets original quantity, selected shipment, and checkbox value accordingly.
     * @param {object} event - The event object generated by the data options change.
     */
    dataChange1(event) {
        if (event.target.id == 'active4') {
            this.setState({
                originalQty: 0,
                active4: true,
                active5: false,
                checkboxValue: false,
                tempNotes: ''
            }, () => {
                this.changed("", "", 0, 0, true)
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
                this.changed("", "", 0, 0, true)
            });
        }
    }
    /**
     * Handles the change event of data options.
     * Updates state variables based on the selected option.
     * Resets relevant state variables accordingly.
     * Triggers additional actions based on the selected option.
     * @param {object} event - The event object generated by the data options change.
     */
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
                let realmId = AuthenticationService.getRealmId();
                this.getProductCategories();
                this.getFundingSourceList();
                RealmCountryService.getRealmCountryForProgram(realmId)
                    .then(response => {
                        if (response.status == 200) {
                            var listArray = response.data.map(ele => ele.realmCountry);
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
                                hideSecondComponent()
                            })
                        }
                    }).catch(
                        error => {
                            if (error.message === "Network Error") {
                                this.setState({
                                    message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                    loading: false
                                }, () => {
                                    hideSecondComponent()
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
                                            hideSecondComponent()
                                        });
                                        break;
                                    case 412:
                                        this.setState({
                                            message: error.response.data.messageCode,
                                            loading: false
                                        }, () => {
                                            hideSecondComponent()
                                        });
                                        break;
                                    default:
                                        this.setState({
                                            message: 'static.unkownError',
                                            loading: false
                                        }, () => {
                                            hideSecondComponent()
                                        });
                                        break;
                                }
                            }
                        }
                    );
            });
        }
        try {
            jexcel.destroy(document.getElementById("tableDiv"), true);
        } catch (e) {
        }
    }
    /**
     * Retrieves the budget list filtered by the selected program ID.
     * @param {object} e - The event object containing information about the selected program ID.
     */
    getBudgetListByProgramId = (e) => {
        let programId1 = this.state.programId1.toString().split("_")[0];
        if (programId1 != "") {
            const filteredBudgetList = this.state.budgetList.filter(c => [...new Set(c.programs.map(ele => ele.id))].includes(parseInt(programId1)))
            this.setState({
                filteredBudgetList,
                filteredBudgetListByProgram: filteredBudgetList
            });
        }
    }
    /**
     * Retrieves the budget list filtered by the selected funding source ID.
     * @param {object} e - The event object containing information about the selected funding source ID.
     */
    getBudgetListByFundingSourceId = (e) => {
        let fundingSourceId = this.state.fundingSourceId;
        const filteredBudgetList = this.state.filteredBudgetListByProgram.filter(c => c.fundingSource.fundingSourceId == fundingSourceId)
        this.setState({
            filteredBudgetList
        });
    }
    /**
     * Retrieves the list of active funding sources.
     */
    getFundingSourceList() {
        FundingSourceService.getFundingSourceListAll()
            .then(response => {
                if (response.status == 200) {
                    let fundingSourceList = response.data.filter(c => c.active == true && c.fundingSourceId != TBD_FUNDING_SOURCE)
                    this.setState({
                        fundingSourceList: fundingSourceList.sort((a, b) => {
                            var itemLabelA = a.fundingSourceCode.toUpperCase(); 
                            var itemLabelB = b.fundingSourceCode.toUpperCase(); 
                            return itemLabelA > itemLabelB ? 1 : -1;
                        })
                    }, () => {
                    });
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    },
                        () => {
                            hideSecondComponent();
                        })
                }
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loading: false
                        }, () => {
                            hideSecondComponent()
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
                                    hideSecondComponent()
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                }, () => {
                                    hideSecondComponent()
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                }, () => {
                                    hideSecondComponent()
                                });
                                break;
                        }
                    }
                }
            );
    }
    /**
     * Handles the change event when a program is selected.
     * @param {Event} event - The event object containing information about the selected program.
     */
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
                if (programId != "" && programId != -1) {
                    this.getVersionList();
                } else {
                    this.setState({
                        outputList: []
                    }, () => {
                        try {
                            jexcel.destroy(document.getElementById("tableDiv"), true);
                        } catch (e) {
                        }
                    })
                }
            }
        )
    }
    /**
     * Fetches the list of versions for the selected program.
     * Updates the component state with the fetched version list.
     * Handles loading states and initializes other necessary operations.
     */
    getVersionList() {
        this.setState({
            loading: true
        })
        var myResult = this.state.localProgramList;
        var selectedProgramId = this.state.programId;
        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        var filterList = myResult.filter(c => c.programId == selectedProgramId && c.userId == userId);
        var versionList = [];
        var filteredProgramList = this.state.programs.filter(c => c.programId == selectedProgramId)[0];
        versionList.push({ versionId: filteredProgramList.currentVersionId })
        for (var v = 0; v < filterList.length; v++) {
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
        var finalVersionList = []
        for (var v = 0; v < newVList.length; v++) {
            finalVersionList.push({ versionId: newVList[v].versionId })
        }
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
                        jexcel.destroy(document.getElementById("tableDiv"), true);
                    } catch (e) {
                    }
                })
            }
        })
    }
    /**
     * Retrieves the planning unit array from the component state and updates the state with the formatted array.
        * Invokes the filterData function with the updated planning unit array.
     */
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
    /**
     * Handles the change event when selecting a country.
     * Updates the component state with the selected country ID, retrieves planning units based on the selected country,
     * triggers the filterErpData function, and stores the selected country ID in local storage.
     * @param {Event} event - The change event object.
     */
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
    /**
     * Handles the change event when selecting a program in the modal.
     * Updates the component state with the selected program ID and resets the planning units list.
     * If a valid program ID is selected, it triggers the getOrderDetails, getPlanningUnitListBasedOnTracerCategory,
     * and getBudgetListByProgramId functions. Otherwise, it resets relevant state variables.
     * @param {Event} event - The change event object.
     */
    programChangeModal(event) {
        var programId1 = event.target.value;
        this.setState({
            programId1: event.target.value,
            planningUnits: []
        }, () => {
            if (programId1 != -1) {
                this.getOrderDetails();
                this.getPlanningUnitListBasedOnTracerCategory();
                this.getBudgetListByProgramId();
            } else {
                this.setState({
                    planningUnits: [],
                    planningUnitsBasedOnTracerCategory: [],
                    notLinkedShipments: [],
                    outputList: [],
                    selectedShipment: []
                })
            }
        })
    }
    /**
     * Handles the change event when selecting a funding source in the modal.
     * Updates the component state with the selected funding source ID and triggers the getBudgetListByFundingSourceId function.
     * @param {Event} event - The change event object.
     */
    fundingSourceModal(event) {
        this.setState({
            fundingSourceId: event.target.value
        }, () => {
            this.getBudgetListByFundingSourceId();
        })
    }
    /**
     * Handles the change event when selecting a budget.
     * Updates the component state with the selected budget ID.
     * @param {Event} event - The change event object.
     */
    budgetChange(event) {
        this.setState({
            budgetId: event.target.value
        })
    }
    /**
     * Calculates and updates the state to control the visibility of the submit button and total quantity display based on validation and table data.
     */
    displayButton() {
        var validation = this.checkValidation();
        var tableJson = this.state.instance.getJson(null, false);
        let count = 0, qty = 0, qty1 = 0;
        for (var i = 0; i < tableJson.length; i++) {
            var map1 = new Map(Object.entries(tableJson[i]));
            if (this.state.active2) {
                count++;
                if (map1.get("0")) {
                }
            }
            else {
                if (map1.get("0")) {
                    count++;
                }
            }
            if (tableJson[i][0] && tableJson[i][14] == 0) {
                var filterList = tableJson.filter((c) => c[17] == tableJson[i][17]);
                var getUniqueOrderNoAndPrimeLineNoList = filterList.filter((v, i, a) => a.findIndex(t => (t[16].roNo === v[16].roNo && t[16].roPrimeLineNo === v[16].roPrimeLineNo && t[16].knShipmentNo === v[16].knShipmentNo && t[16].orderNo === v[16].orderNo && t[16].primeLineNo === v[16].primeLineNo)) === i);
                for (var uq = 0; uq < getUniqueOrderNoAndPrimeLineNoList.length; uq++) {
                    qty1 = 0;
                    tableJson.filter(c => c[16].roNo == getUniqueOrderNoAndPrimeLineNoList[uq][16].roNo && c[16].roPrimeLineNo == getUniqueOrderNoAndPrimeLineNoList[uq][16].roPrimeLineNo && c[16].knShipmentNo == getUniqueOrderNoAndPrimeLineNoList[uq][16].knShipmentNo && c[16].orderNo == getUniqueOrderNoAndPrimeLineNoList[uq][16].orderNo && c[16].primeLineNo == getUniqueOrderNoAndPrimeLineNoList[uq][16].primeLineNo).map(item => {
                        qty1 += Number(item[10]) * Number(this.state.instance.getValue(`L${parseInt(i) + 1}`, true).toString().replaceAll("\,", "")) * Number(this.state.instance.getValue(`S${parseInt(i) + 1}`, true).toString().replaceAll("\,", ""));
                    })
                    qty += Math.round(qty1);
                }
            }
        }
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
    /**
     * Delinks the shipments and saves the data in indexed db
     */
    delink() {
        this.setState({ loading: true })
        var validation = this.checkValidationTab2();
        if (validation == true) {
            var selectedChangedShipment = this.state.languageEl.getJson(null, false).filter(c => c[23] == 1);
            var selectedShipment = this.state.languageEl.getJson(null, false).filter(c => c[0] == false);
            var setOfPlanningUnitIds = [...new Set(selectedChangedShipment.map(ele => ele[17].planningUnit.id))];
            var db1;
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
                var curUser = AuthenticationService.getLoggedInUserId();
                var programId = (this.state.programId + "_v" + this.state.versionId.split(" ")[0] + "_uId_" + curUser);
                var programRequest = programTransaction.get(programId);
                programRequest.onsuccess = function (event) {
                    var programDataJson = programRequest.result.programData;
                    var planningUnitDataList = programDataJson.planningUnitDataList;
                    var minDate = moment(Date.now()).format("YYYY-MM-DD");
                    var generalProgramDataBytes = CryptoJS.AES.decrypt(programDataJson.generalData, SECRET_KEY);
                    var generalProgramData = generalProgramDataBytes.toString(CryptoJS.enc.Utf8);
                    var generalProgramJson = JSON.parse(generalProgramData);
                    var actionList = generalProgramJson.actionList;
                    var delinkList = generalProgramJson.delinkList;
                    var linkedShipmentsList = generalProgramJson.shipmentLinkingList == null ? [] : generalProgramJson.shipmentLinkingList;
                    if (actionList == undefined) {
                        actionList = []
                    }
                    if (delinkList == undefined) {
                        delinkList = []
                    }
                    for (var pu = 0; pu < setOfPlanningUnitIds.length; pu++) {
                        var planningUnitId = setOfPlanningUnitIds[pu];
                        var planningUnitDataIndex = (planningUnitDataList).findIndex(c => c.planningUnitId == planningUnitId);
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
                        var shipmentList = programJson.shipmentList;
                        var batchInfoList = programJson.batchInfoList;
                        var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                        var curUser = AuthenticationService.getLoggedInUserId();
                        var username = AuthenticationService.getLoggedInUsername();
                        for (var ss = 0; ss < selectedShipment.length; ss++) {
                            if (selectedShipment[ss][17].planningUnit.id == planningUnitId) {
                                var linkedShipmentsListIndex = linkedShipmentsList.findIndex(c => (selectedShipment[ss][17].shipmentId > 0 ? selectedShipment[ss][17].shipmentId == c.childShipmentId : selectedShipment[ss][17].tempShipmentId == c.tempChildShipmentId) && c.active.toString() == "true");
                                var linkedShipmentsListFilter = linkedShipmentsList.filter(c => (selectedShipment[ss][17].shipmentId > 0 ? selectedShipment[ss][17].shipmentId == c.childShipmentId : selectedShipment[ss][17].tempShipmentId == c.tempChildShipmentId) && c.active.toString() == "true");
                                var checkIfAlreadyExistsInDelinkList = delinkList.findIndex(c => c.roNo == linkedShipmentsList[linkedShipmentsListIndex].roNo && c.roPrimeLineNo == linkedShipmentsList[linkedShipmentsListIndex].roPrimeLineNo);
                                if (checkIfAlreadyExistsInDelinkList == -1) {
                                    delinkList.push({
                                        "roNo": linkedShipmentsList[linkedShipmentsListIndex].roNo, "roPrimeLineNo": linkedShipmentsList[linkedShipmentsListIndex].roPrimeLineNo
                                    })
                                }
                                linkedShipmentsList[linkedShipmentsListIndex].active = false;
                                linkedShipmentsList[linkedShipmentsListIndex].lastModifiedBy.userId = curUser;
                                linkedShipmentsList[linkedShipmentsListIndex].lastModifiedBy.username = username;
                                linkedShipmentsList[linkedShipmentsListIndex].lastModifiedDate = curDate;
                                var checkIfThereIsOnlyOneChildShipmentOrNot = linkedShipmentsList.filter(c => (linkedShipmentsListFilter[0].parentShipmentId > 0 ? c.parentShipmentId == linkedShipmentsListFilter[0].parentShipmentId : c.tempParentShipmentId == linkedShipmentsListFilter[0].tempParentShipmentId) && c.active == true);
                                var activateParentShipment = false;
                                if (checkIfThereIsOnlyOneChildShipmentOrNot.length == 0) {
                                    activateParentShipment = true;
                                }
                                var shipmentIndex = shipmentList.findIndex(c => selectedShipment[ss][17].shipmentId > 0 ? c.shipmentId == selectedShipment[ss][17].shipmentId : c.tempShipmentId == selectedShipment[ss][17].tempShipmentId);
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
                                        minDate = moment(shipmentList[parentShipmentIndex].expectedDeliveryDate).format("YYYY-MM-DD");
                                    }
                                    if (shipmentList[parentShipmentIndex].receivedDate != null && shipmentList[parentShipmentIndex].receivedDate != "" && shipmentList[parentShipmentIndex].receivedDate != undefined && moment(minDate).format("YYYY-MM-DD") > moment(shipmentList[parentShipmentIndex].receivedDate).format("YYYY-MM-DD")) {
                                        minDate = moment(shipmentList[parentShipmentIndex].receivedDate).format("YYYY-MM-DD");
                                    }
                                    var linkedParentShipmentIdList = shipmentList.filter(c => linkedShipmentsListFilter[0].parentShipmentId > 0 ? (c.parentLinkedShipmentId == linkedShipmentsListFilter[0].parentShipmentId) : (c.tempParentLinkedShipmentId == linkedShipmentsListFilter[0].tempParentShipmentId));
                                    for (var l = 0; l < linkedParentShipmentIdList.length; l++) {
                                        var parentShipmentIndex1 = shipmentList.findIndex(c => linkedParentShipmentIdList[l].shipmentId > 0 ? c.shipmentId == linkedParentShipmentIdList[l].shipmentId : c.tempShipmentId == linkedParentShipmentIdList[l].tempShipmentId);
                                        shipmentList[parentShipmentIndex1].active = true;
                                        shipmentList[parentShipmentIndex1].erpFlag = false;
                                        shipmentList[parentShipmentIndex1].lastModifiedBy.userId = curUser;
                                        shipmentList[parentShipmentIndex1].lastModifiedBy.username = username;
                                        shipmentList[parentShipmentIndex1].lastModifiedDate = curDate;
                                        shipmentList[parentShipmentIndex1].parentLinkedShipmentId = null;
                                        shipmentList[parentShipmentIndex1].tempParentLinkedShipmentId = null;
                                        if (moment(minDate).format("YYYY-MM-DD") > moment(shipmentList[parentShipmentIndex1].expectedDeliveryDate).format("YYYY-MM-DD")) {
                                            minDate = moment(shipmentList[parentShipmentIndex1].expectedDeliveryDate).format("YYYY-MM-DD");
                                        }
                                        if (shipmentList[parentShipmentIndex1].receivedDate != null && shipmentList[parentShipmentIndex1].receivedDate != "" && shipmentList[parentShipmentIndex1].receivedDate != undefined && moment(minDate).format("YYYY-MM-DD") > moment(shipmentList[parentShipmentIndex1].receivedDate).format("YYYY-MM-DD")) {
                                            minDate = moment(shipmentList[parentShipmentIndex1].receivedDate).format("YYYY-MM-DD");
                                        }
                                    }
                                }
                            }
                        }
                        var modifiedDataFilter = this.state.languageEl.getJson(null, false);
                        for (var mdf = 0; mdf < modifiedDataFilter.length; mdf++) {
                            if (modifiedDataFilter[mdf][0] == true && modifiedDataFilter[mdf][23] == 1 && modifiedDataFilter[mdf][17].planningUnit.id == planningUnitId) {
                                var linkedShipmentsListIndex = linkedShipmentsList.findIndex(c => (modifiedDataFilter[mdf][17].shipmentId > 0 ? modifiedDataFilter[mdf][17].shipmentId == c.childShipmentId : modifiedDataFilter[mdf][17].tempShipmentId == c.tempChildShipmentId) && c.active.toString() == "true");
                                var linkedShipmentsListFilter = linkedShipmentsList.filter(c => (modifiedDataFilter[mdf][17].shipmentId > 0 ? modifiedDataFilter[mdf][17].shipmentId == c.childShipmentId : modifiedDataFilter[mdf][17].tempShipmentId == c.tempChildShipmentId) && c.active.toString() == "true");
                                linkedShipmentsList[linkedShipmentsListIndex].conversionFactor = 1;
                                linkedShipmentsList[linkedShipmentsListIndex].lastModifiedBy.userId = curUser;
                                linkedShipmentsList[linkedShipmentsListIndex].lastModifiedBy.username = username;
                                linkedShipmentsList[linkedShipmentsListIndex].lastModifiedDate = curDate;
                                var shipmentIndex = shipmentList.findIndex(c => modifiedDataFilter[mdf][17].shipmentId > 0 ? c.shipmentId == modifiedDataFilter[mdf][17].shipmentId : c.tempShipmentId == modifiedDataFilter[mdf][17].tempShipmentId);
                                var rcpu = this.state.realmCountryPlanningUnitList.filter(c => c.id == this.state.languageEl.getValueFromCoords(8, mdf))[0];
                                shipmentList[shipmentIndex].notes = this.state.languageEl.getValue(`N${parseInt(mdf) + 1}`, true);
                                shipmentList[shipmentIndex].shipmentQty = Math.round(Number(Number(this.state.languageEl.getValue(`AG${parseInt(mdf) + 1}`, true).toString().replaceAll("\,", "")) * Number(this.state.languageEl.getValue(`K${parseInt(mdf) + 1}`, true).toString().replaceAll("\,", ""))));
                                shipmentList[shipmentIndex].shipmentRcpuQty = Math.round(Number(this.state.languageEl.getValue(`AG${parseInt(mdf) + 1}`, true).toString().replaceAll("\,", "")));
                                shipmentList[shipmentIndex].realmCountryPlanningUnit = {
                                    id: rcpu.id,
                                    label: rcpu.label,
                                    multiplier: rcpu.multiplier
                                }
                                shipmentList[shipmentIndex].lastModifiedBy.userId = curUser;
                                shipmentList[shipmentIndex].lastModifiedBy.username = username;
                                shipmentList[shipmentIndex].lastModifiedDate = curDate;
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
                        if (planningUnitDataIndex != -1) {
                            planningUnitDataList[planningUnitDataIndex].planningUnitData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                        } else {
                            planningUnitDataList.push({ planningUnitId: planningUnitId, planningUnitData: (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString() });
                        }
                    }
                    generalProgramJson.actionList = actionList;
                    generalProgramJson.delinkList = delinkList;
                    generalProgramJson.shipmentLinkingList = linkedShipmentsList;
                    programDataJson.planningUnitDataList = planningUnitDataList;
                    programDataJson.generalData = (CryptoJS.AES.encrypt(JSON.stringify(generalProgramJson), SECRET_KEY)).toString()
                    programRequest.result.programData = programDataJson;
                    var putRequest = programTransaction.put(programRequest.result);
                    putRequest.onerror = function (event) {
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        calculateSupplyPlan(programId, 0, 'programData', "erpDelink", thisAsParameter, setOfPlanningUnitIds, moment(minDate).startOf('month').format("YYYY-MM-DD"));
                    }
                }.bind(this)
            }.bind(this)
        } else {
            this.setState({
                loading: false,
                message: i18n.t("static.supplyPlan.validationFailed")
            }, () => {
                hideSecondComponent()
            })
        }
    }
    /**
     * Links the shipments and saves the data in indexed db
     */
    link() {
        this.setState({ loading1: true })
        var validation = this.checkValidation();
        if (validation == true) {
            var selectedShipment = this.state.instance.getJson(null, false).filter(c => c[0] == true && c[14] == 0);
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
                    var ppuRequest = ppuTransaction.getAll();
                    ppuRequest.onsuccess = function (event) {
                        var paTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                        paTransaction = paTransaction.objectStore('procurementAgent');
                        var paRequest = paTransaction.getAll();
                        paRequest.onsuccess = function (event) {
                            var dsTransaction = db1.transaction(['dataSource'], 'readwrite');
                            dsTransaction = dsTransaction.objectStore('dataSource');
                            var dsRequest = dsTransaction.getAll();
                            dsRequest.onsuccess = function (event) {
                                var cTransaction = db1.transaction(['currency'], 'readwrite');
                                cTransaction = cTransaction.objectStore('currency');
                                var cRequest = cTransaction.getAll();
                                cRequest.onsuccess = function (event) {
                                    var transaction;
                                    var programTransaction;
                                    transaction = db1.transaction(['programData'], 'readwrite');
                                    programTransaction = transaction.objectStore('programData');
                                    var curUser = AuthenticationService.getLoggedInUserId();
                                    var programId = this.state.active1 ? (this.state.programId + "_v" + this.state.versionId.split(" ")[0] + "_uId_" + curUser) : this.state.programId1;
                                    var programRequest = programTransaction.get(programId);
                                    programRequest.onsuccess = function (event) {
                                        var programDataJson = programRequest.result.programData;
                                        var planningUnitDataList = programDataJson.planningUnitDataList;
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
                                        if (!this.state.active4) {
                                            var shipmentId = this.state.active1 ? this.state.finalShipmentId[0].shipmentId : this.state.finalShipmentId[0].shipmentId;
                                            var index = this.state.active1 ? this.state.finalShipmentId[0].tempShipmentId : this.state.finalShipmentId[0].tempShipmentId;
                                            var shipmentIndex = shipmentList.findIndex(c => shipmentId > 0 ? (c.shipmentId == shipmentId) : (c.tempShipmentId == index));
                                            shipmentList[shipmentIndex].erpFlag = true;
                                            shipmentList[shipmentIndex].active = false;
                                            var minDate = shipmentList[shipmentIndex].receivedDate != "" && shipmentList[shipmentIndex].receivedDate != null && shipmentList[shipmentIndex].receivedDate != undefined && shipmentList[shipmentIndex].receivedDate != "Invalid date" ? shipmentList[shipmentIndex].receivedDate : shipmentList[shipmentIndex].expectedDeliveryDate;
                                            for (var i = 1; i < this.state.finalShipmentId.length; i++) {
                                                var shipmentId1 = this.state.active1 ? this.state.finalShipmentId[i].shipmentId : this.state.finalShipmentId[i].shipmentId;
                                                var index1 = this.state.active1 ? this.state.finalShipmentId[i].tempShipmentId : this.state.finalShipmentId[i].tempShipmentId;
                                                var shipmentIndex1 = shipmentList.findIndex(c => shipmentId1 > 0 ? (c.shipmentId == shipmentId1) : (c.tempShipmentId == index1));
                                                shipmentList[shipmentIndex1].erpFlag = true;
                                                shipmentList[shipmentIndex1].active = false;
                                                shipmentList[shipmentIndex1].parentLinkedShipmentId = this.state.finalShipmentId[0].shipmentId > 0 ? this.state.finalShipmentId[0].shipmentId : null;
                                                shipmentList[shipmentIndex1].tempParentLinkedShipmentId = this.state.finalShipmentId[0].tempShipmentId;
                                                var minDate1 = shipmentList[shipmentIndex1].receivedDate != "" && shipmentList[shipmentIndex1].receivedDate != null && shipmentList[shipmentIndex1].receivedDate != undefined && shipmentList[shipmentIndex1].receivedDate != "Invalid date" ? shipmentList[shipmentIndex1].receivedDate : shipmentList[shipmentIndex1].expectedDeliveryDate;
                                                if (moment(minDate1).format("YYYY-MM-DD") < moment(minDate).format("YYYY-MM-DD")) {
                                                    minDate = moment(minDate1).format("YYYY-MM-DD")
                                                }
                                            }
                                        }
                                        var tableJson = this.state.instance.getJson(null, false);
                                        for (var y = 0; y < tableJson.length; y++) {
                                            if (tableJson[y][0] && tableJson[y][14] == 0) {
                                                if (moment(minDate).format("YYYY-MM") > moment(tableJson[y][4]).format("YYYY-MM")) {
                                                    minDate = moment(tableJson[y][4]).format("YYYY-MM-DD")
                                                }
                                                var filterList = tableJson.filter((c) => c[17] == tableJson[y][17]);
                                                var getUniqueOrderNoAndPrimeLineNoList = filterList.filter((v, i, a) => a.findIndex(t => (t[16].roNo === v[16].roNo && t[16].roPrimeLineNo === v[16].roPrimeLineNo && t[16].knShipmentNo === v[16].knShipmentNo && t[16].orderNo === v[16].orderNo && t[16].primeLineNo === v[16].primeLineNo)) === i);
                                                for (var uq = 0; uq < getUniqueOrderNoAndPrimeLineNoList.length; uq++) {
                                                    var shipmentQty = 0;
                                                    var shipmentARUQty = 0;
                                                    var batchInfo = [];
                                                    var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                                                    var curUser = AuthenticationService.getLoggedInUserId();
                                                    var username = AuthenticationService.getLoggedInUsername();
                                                    tableJson.filter(c => c[16].roNo == getUniqueOrderNoAndPrimeLineNoList[uq][16].roNo && c[16].roPrimeLineNo == getUniqueOrderNoAndPrimeLineNoList[uq][16].roPrimeLineNo && c[16].knShipmentNo == getUniqueOrderNoAndPrimeLineNoList[uq][16].knShipmentNo && c[16].orderNo == getUniqueOrderNoAndPrimeLineNoList[uq][16].orderNo && c[16].primeLineNo == getUniqueOrderNoAndPrimeLineNoList[uq][16].primeLineNo).map(item => {
                                                        shipmentQty += Number(item[10]) * Number(this.state.instance.getValue(`L${parseInt(y) + 1}`, true).toString().replaceAll("\,", "")) * Number(this.state.instance.getValue(`S${parseInt(y) + 1}`, true).toString().replaceAll("\,", ""));
                                                        shipmentARUQty += Number(item[10]);
                                                        var batchNo = item[7];
                                                        var expiryDate = item[8];
                                                        var autoGenerated = false;
                                                        var shelfLife = ppuObject.shelfLife;
                                                        var programId1 = paddingZero(this.state.programId, 0, 6);
                                                        var planningUnitId1 = paddingZero(planningUnitId, 0, 8);
                                                        autoGenerated = (batchNo.toString() == "-99" || batchNo == "") ? true : autoGenerated;
                                                        batchNo = (batchNo.toString() == "-99" || batchNo == "") ? (BATCH_PREFIX).concat(programId1).concat(planningUnitId1).concat(moment(Date.now()).format("YYMMDD")).concat(generateRandomAplhaNumericCode(3)) : batchNo;
                                                        expiryDate = expiryDate == "" || expiryDate == null ? moment(tableJson[y][4]).add(shelfLife, 'months').startOf('month').format("YYYY-MM-DD") : expiryDate;
                                                        batchInfo.push({
                                                            shipmentTransBatchInfoId: 0,
                                                            batch: {
                                                                batchNo: batchNo,
                                                                expiryDate: moment(expiryDate).endOf('month').format("YYYY-MM-DD"),
                                                                batchId: 0,
                                                                autoGenerated: autoGenerated,
                                                                createdDate: curDate
                                                            },
                                                            shipmentQty: Math.round(Number(item[10]))
                                                        })
                                                    }
                                                    );
                                                    if (this.state.active4 && uq == 0) {
                                                        var c = (cRequest.result.filter(c => c.currencyId == USD_CURRENCY_ID)[0]);
                                                        var rcpu = this.state.realmCountryPlanningUnitList.filter(c => c.id == this.state.instance.getValueFromCoords(9, y))[0];
                                                        shipmentList.push({
                                                            accountFlag: true,
                                                            active: false,
                                                            dataSource: {
                                                                id: NONE_SELECTED_DATA_SOURCE_ID,
                                                                label: dsRequest.result.filter(c => c.dataSourceId == NONE_SELECTED_DATA_SOURCE_ID)[0].label
                                                            },
                                                            erpFlag: true,
                                                            localProcurement: false,
                                                            freightCost: tableJson[y][16].shippingCost,
                                                            notes: tableJson[y][13],
                                                            planningUnit: ppuObject.planningUnit,
                                                            procurementAgent: {
                                                                id: PSM_PROCUREMENT_AGENT_ID,
                                                                label: paRequest.result.filter(c => c.procurementAgentId == PSM_PROCUREMENT_AGENT_ID)[0].label,
                                                                code: paRequest.result.filter(c => c.procurementAgentId == PSM_PROCUREMENT_AGENT_ID)[0].procurementAgentCode
                                                            },
                                                            productCost: Number(Number(getUniqueOrderNoAndPrimeLineNoList[uq][16].price / rcpu.multiplier).toFixed(6)) * Number(shipmentQty),
                                                            shipmentQty: Math.round(shipmentQty),
                                                            shipmentRcpuQty: Math.round(shipmentARUQty),
                                                            realmCountryPlanningUnit: {
                                                                id: rcpu.id,
                                                                label: rcpu.label,
                                                                multiplier: rcpu.multiplier
                                                            },
                                                            rate: Number(Number(getUniqueOrderNoAndPrimeLineNoList[uq][16].price / rcpu.multiplier).toFixed(6)),
                                                            shipmentId: 0,
                                                            shipmentMode: (tableJson[y][16].shipBy == "Land" ? "Road" : tableJson[y][16].shipBy == "Air" ? "Air" : "Sea"),
                                                            shipmentStatus: tableJson[y][15],
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
                                                            receivedDate: tableJson[y][15].id == DELIVERED_SHIPMENT_STATUS ? tableJson[y][4] : null,
                                                            index: shipmentList.length,
                                                            batchInfoList: batchInfo,
                                                            orderNo: tableJson[y][2].split("|")[0].trim(),
                                                            primeLineNo: tableJson[y][2].split("|")[1].trim(),
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
                                                            parentLinkedShipmentId: null,
                                                            tempParentLinkedShipmentId: null
                                                        })
                                                        var shipmentId = 0;
                                                        var index = ppuObject.planningUnit.id.toString().concat(shipmentList.length - 1);
                                                        var shipmentIndex = shipmentList.findIndex(c => shipmentId > 0 ? (c.shipmentId == shipmentId) : (c.tempShipmentId == index));
                                                        var minDate = shipmentList[shipmentIndex].receivedDate != "" && shipmentList[shipmentIndex].receivedDate != null && shipmentList[shipmentIndex].receivedDate != undefined && shipmentList[shipmentIndex].receivedDate != "Invalid date" ? shipmentList[shipmentIndex].receivedDate : shipmentList[shipmentIndex].expectedDeliveryDate;
                                                    }
                                                    linkedShipmentsList.push({
                                                        shipmentLinkingId: 0,
                                                        versionId: this.state.versionId.toString().split(" ")[0],
                                                        programId: this.state.programId,
                                                        procurementAgent: shipmentList[shipmentIndex].procurementAgent,
                                                        parentShipmentId: shipmentList[shipmentIndex].shipmentId,
                                                        tempParentShipmentId: shipmentList[shipmentIndex].shipmentId == 0 ? shipmentList[shipmentIndex].tempShipmentId : null,
                                                        childShipmentId: 0,
                                                        tempChildShipmentId: shipmentList[shipmentIndex].planningUnit.id.toString().concat(shipmentList.length),
                                                        erpPlanningUnit: getUniqueOrderNoAndPrimeLineNoList[uq][16].erpPlanningUnit,
                                                        roNo: getUniqueOrderNoAndPrimeLineNoList[uq][16].roNo,
                                                        roPrimeLineNo: getUniqueOrderNoAndPrimeLineNoList[uq][16].roPrimeLineNo,
                                                        knShipmentNo: getUniqueOrderNoAndPrimeLineNoList[uq][16].knShipmentNo,
                                                        erpShipmentStatus: getUniqueOrderNoAndPrimeLineNoList[uq][16].erpShipmentStatus,
                                                        orderNo: getUniqueOrderNoAndPrimeLineNoList[uq][16].orderNo,
                                                        primeLineNo: getUniqueOrderNoAndPrimeLineNoList[uq][16].primeLineNo,
                                                        conversionFactor: 1,
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
                                                    var rcpu = this.state.realmCountryPlanningUnitList.filter(c => c.id == this.state.instance.getValueFromCoords(9, y))[0];
                                                    shipmentList.push({
                                                        accountFlag: true,
                                                        active: true,
                                                        dataSource: shipmentList[shipmentIndex].dataSource,
                                                        erpFlag: true,
                                                        localProcurement: shipmentList[shipmentIndex].localProcurement,
                                                        freightCost: getUniqueOrderNoAndPrimeLineNoList[uq][16].shippingCost,
                                                        notes: getUniqueOrderNoAndPrimeLineNoList[uq][13],
                                                        planningUnit: shipmentList[shipmentIndex].planningUnit,
                                                        procurementAgent: shipmentList[shipmentIndex].procurementAgent,
                                                        productCost: Number(Number(getUniqueOrderNoAndPrimeLineNoList[uq][16].price / rcpu.multiplier).toFixed(6)) * Number(shipmentQty),
                                                        shipmentQty: Math.round(shipmentQty),
                                                        shipmentRcpuQty: Math.round(shipmentARUQty),
                                                        realmCountryPlanningUnit: {
                                                            id: rcpu.id,
                                                            label: rcpu.label,
                                                            multiplier: rcpu.multiplier
                                                        },
                                                        rate: Number(Number(getUniqueOrderNoAndPrimeLineNoList[uq][16].price / rcpu.multiplier).toFixed(6)),
                                                        shipmentId: 0,
                                                        shipmentMode: (getUniqueOrderNoAndPrimeLineNoList[uq][16].shipBy == "Land" ? "Road" : getUniqueOrderNoAndPrimeLineNoList[uq][16].shipBy == "Air" ? "Air" : "Sea"),
                                                        shipmentStatus: getUniqueOrderNoAndPrimeLineNoList[uq][15],
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
                                                        receivedDate: getUniqueOrderNoAndPrimeLineNoList[uq][15].id == DELIVERED_SHIPMENT_STATUS ? getUniqueOrderNoAndPrimeLineNoList[uq][4] : null,
                                                        index: shipmentList.length,
                                                        batchInfoList: batchInfo,
                                                        orderNo: getUniqueOrderNoAndPrimeLineNoList[uq][2].split("|")[0].trim(),
                                                        primeLineNo: getUniqueOrderNoAndPrimeLineNoList[uq][2].split("|")[1].trim(),
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
                                                        parentLinkedShipmentId: null,
                                                        tempParentLinkedShipmentId: null
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
                                        if (planningUnitDataIndex != -1) {
                                            planningUnitDataList[planningUnitDataIndex].planningUnitData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                                        } else {
                                            planningUnitDataList.push({ planningUnitId: planningUnitId, planningUnitData: (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString() });
                                        }
                                        generalProgramJson.actionList = actionList;
                                        generalProgramJson.shipmentLinkingList = linkedShipmentsList;
                                        programDataJson.planningUnitDataList = planningUnitDataList;
                                        programDataJson.generalData = (CryptoJS.AES.encrypt(JSON.stringify(generalProgramJson), SECRET_KEY)).toString()
                                        programRequest.result.programData = programDataJson;
                                        var putRequest = programTransaction.put(programRequest.result);
                                        putRequest.onerror = function (event) {
                                        }.bind(this);
                                        putRequest.onsuccess = function (event) {
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
    /**
     * Updates the component state with the provided parameter name and value.
     * @param {string} parameterName - The name of the parameter to update in the component state.
     * @param {*} value - The new value to set for the parameter.
     */
    updateState(parameterName, value) {
        this.setState({
            [parameterName]: value
        })
    }
    /**
     * Retrieves order details based on search criteria and updates the state with the retrieved data.
     * @param {number} takeFromLocalProgram - Flag indicating whether to retrieve data from local program (optional).
     */
    getOrderDetails = (takeFromLocalProgram) => {
        var roNoOrderNo = (this.state.searchedValue != null && this.state.searchedValue != "" ? this.state.searchedValue : "0");
        var programId = (this.state.active3 ? (takeFromLocalProgram != undefined && takeFromLocalProgram == 1 ? this.state.localProgramList[0].programId : this.state.programId1.split("_")[0]) : document.getElementById("programId").value);
        var versionId = this.state.active1 ? this.state.versionId.toString().split(" ")[0] : 0;
        var erpPlanningUnitId = (this.state.planningUnitIdUpdated != null && this.state.planningUnitIdUpdated != "" ? this.state.planningUnitIdUpdated : 0);
        var linkedRoNoAndRoPrimeLineNo = [];
        var listToExclude = [];
        if (this.state.active1) {
            var localProgramList = this.state.localProgramList;
            var localProgramListFilter = localProgramList.filter(c => c.programId == this.state.programId && c.version == this.state.versionId.split(" ")[0]);
            var generalProgramDataBytes = CryptoJS.AES.decrypt(localProgramListFilter[0].programData.generalData, SECRET_KEY);
            var generalProgramData = generalProgramDataBytes.toString(CryptoJS.enc.Utf8);
            var generalProgramJson = JSON.parse(generalProgramData);
            var linkedShipmentsList = generalProgramJson.shipmentLinkingList != null ? generalProgramJson.shipmentLinkingList : [];
            var delinkList = generalProgramJson.delinkList != undefined ? generalProgramJson.delinkList : [];
            delinkList.map(item => {
                var findIndexFromLinkedShipmentsList = linkedShipmentsList.findIndex(c => c.roNo == item.roNo && c.roPrimeLineNo == item.roPrimeLineNo && c.active.toString() == "true");
                if (findIndexFromLinkedShipmentsList == -1) {
                    listToExclude.push(item);
                }
            })
            linkedShipmentsList.filter(c => c.shipmentLinkingId == 0 && c.active == true).map(c => {
                linkedRoNoAndRoPrimeLineNo.push(c.roNo + "|" + c.roPrimeLineNo)
            })
        } else if (this.state.active3) {
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
        if ((roNoOrderNo != "" && roNoOrderNo != "0") || (erpPlanningUnitId != 0)) {
            var json = {
                programId: this.state.active1 ? programId : 0,
                versionId: versionId,
                shipmentPlanningUnitId: this.state.active3 ? this.state.outputListAfterSearch[0].erpPlanningUnit.id : shipmentPlanningUnitId,
                roNo: roNoOrderNo == 0 ? "" : roNoOrderNo,
                filterPlanningUnitId: erpPlanningUnitId,
                realmCountryId: this.state.active1 ? 0 : this.state.countryId,
                delinkedList: listToExclude
            }
            ManualTaggingService.getOrderDetails(json)
                .then(response => {
                    this.setState({
                        artmisList: response.data.filter(c => !linkedRoNoAndRoPrimeLineNo.includes(c.roNo + "|" + c.roPrimeLineNo) && (this.state.roPrimeLineNoForTab3 != "" ? c.roPrimeLineNo == this.state.roPrimeLineNoForTab3 : true)),
                        displayButton: false
                    }, () => {
                        this.buildJExcelERP(true);
                    })
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                loading: false
                            }, () => {
                                hideSecondComponent()
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
                                        hideSecondComponent()
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false
                                    }, () => {
                                        hideSecondComponent()
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false
                                    }, () => {
                                        hideSecondComponent()
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
                this.buildJExcelERP(true);
            })
        }
    }
    /**
     * Clears the timeout when the component is unmounted.
     */
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }
    /**
     * Handles the change event for planning unit selection.
     * @param {Array} planningUnitIds - Array of planning unit IDs and labels.
     */
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
    /**
     * Handles the change event for product category selection.
     * @param {Array} productCategoryIds - Array of product category IDs and labels.
     */
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
    /**
     * Retrieves active planning units based on selected product category IDs.
     */
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
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loading: false
                        }, () => {
                            hideSecondComponent()
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
                                    hideSecondComponent()
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                }, () => {
                                    hideSecondComponent()
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                }, () => {
                                    hideSecondComponent()
                                });
                                break;
                        }
                    }
                }
            );
    }
    /**
     * Filters ERP data based on selected product categories and planning units, then updates the output list accordingly.
     */
    filterErpData() {
        var countryId = this.state.countryId;
        this.setState({
            loading: true,
            programId1: -1,
            fundingSourceId: -1,
            budgetId: -1
        })
        if ((this.state.productCategoryValues.length > 0) || (this.state.planningUnitValues.length > 0)) {
            let productCategoryIdList = this.state.productCategoryValues.length == this.state.productCategories.length && this.state.productCategoryValues.length != 0 ? [] : (this.state.productCategoryValues.length == 0 ? [] : this.state.productCategoryValues.map(ele => (ele.value).toString()))
            let planningUnitIdList = (this.state.planningUnitValues.length == 0 ? null : this.state.planningUnitValues.map(ele => (ele.value).toString()))
            var productCategorySortOrder = this.state.productCategories.filter(c => productCategoryIdList.includes(c.payload.productCategoryId.toString()));
            var sortOrderList = [];
            productCategorySortOrder.map(ele => sortOrderList.push(ele.sortOrder))
            var json = {
                realmCountryId: countryId,
                productCategorySortOrder: sortOrderList,
                planningUnitIds: planningUnitIdList,
            }
            var localProgramList = this.state.localProgramList;
            var linkedRoNoAndRoPrimeLineNo = [];
            for (var i = 0; i < localProgramList.length; i++) {
                var generalProgramDataBytes = CryptoJS.AES.decrypt(localProgramList[i].programData.generalData, SECRET_KEY);
                var generalProgramData = generalProgramDataBytes.toString(CryptoJS.enc.Utf8);
                var generalProgramJson = JSON.parse(generalProgramData);
                var linkedShipmentsList = generalProgramJson.shipmentLinkingList != null ? generalProgramJson.shipmentLinkingList : [];
                linkedShipmentsList.filter(c => c.shipmentLinkingId == 0 && c.active == true).map(c => {
                    linkedRoNoAndRoPrimeLineNo.push(c.roNo + "|" + c.roPrimeLineNo)
                })
            }
            ManualTaggingService.getShipmentListForTab3(json)
                .then(response => {
                    var outputList = response.data;
                    var filterOnLinkedData = outputList.filter(c => !linkedRoNoAndRoPrimeLineNo.includes(c.roNo + "|" + c.roPrimeLineNo));
                    let resultTrue = Object.values(filterOnLinkedData.reduce((a, { roNo, roPrimeLineNo, knShipmentNo, erpQty, orderNo, primeLineNo, erpShipmentStatus, expectedDeliveryDate, batchNo, expiryDate, erpPlanningUnit, price, shippingCost, shipBy, qatEquivalentShipmentStatus, parentShipmentId, childShipmentId, notes, qatPlanningUnit, tracerCategoryId }) => {
                        if (!a[roNo + "|" + roPrimeLineNo + "|" + orderNo + "|" + primeLineNo + "|" + knShipmentNo])
                            a[roNo + "|" + roPrimeLineNo + "|" + orderNo + "|" + primeLineNo + "|" + knShipmentNo] = Object.assign({}, { roNo, roPrimeLineNo, knShipmentNo, erpQty, orderNo, primeLineNo, erpShipmentStatus, expectedDeliveryDate, batchNo, expiryDate, erpPlanningUnit, price, shippingCost, shipBy, qatEquivalentShipmentStatus, parentShipmentId, childShipmentId, notes, qatPlanningUnit, tracerCategoryId });
                        else
                            a[roNo + "|" + roPrimeLineNo + "|" + orderNo + "|" + primeLineNo + "|" + knShipmentNo].erpQty += erpQty;
                        return a;
                    }, {}));
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
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                loading: false
                            }, () => {
                                hideSecondComponent()
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
                                        hideSecondComponent()
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false
                                    }, () => {
                                        hideSecondComponent()
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false
                                    }, () => {
                                        hideSecondComponent()
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
    /**
     * Filters data based on selected planning units and retrieves the corresponding shipments or linked shipments.
     * @param {Array} planningUnitIds - An array of planning unit IDs.
     */
    filterData = (planningUnitIds) => {
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
                    if (this.state.active1) {
                        ManualTaggingService.getNotLinkedQatShipments(this.state.programId, this.state.versionId, this.state.planningUnitValues.map(ele => (ele.value).toString()))
                            .then(response => {
                                this.setState({
                                    outputList: response.data
                                }, () => {
                                    if (!this.state.active3) {
                                        localStorage.setItem("sesProgramIdReport", programId)
                                    }
                                    this.buildJExcel();
                                });
                            }).catch(
                                error => {
                                    document.getElementById('div2').style.display = 'block';
                                    if (error.message === "Network Error") {
                                        this.setState({
                                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                            loading: false
                                        }, () => {
                                            hideSecondComponent()
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
                                                    hideSecondComponent()
                                                });
                                                break;
                                            case 412:
                                                this.setState({
                                                    message: error.response.data.messageCode,
                                                    loading: false
                                                }, () => {
                                                    hideSecondComponent()
                                                });
                                                break;
                                            default:
                                                this.setState({
                                                    message: 'static.unkownError',
                                                    loading: false
                                                }, () => {
                                                    hideSecondComponent()
                                                });
                                                break;
                                        }
                                    }
                                }
                            );
                    } else {
                        ManualTaggingService.getLinkedQatShipments(this.state.programId, this.state.versionId, this.state.planningUnitValues.map(ele => (ele.value).toString()))
                            .then(response => {
                                this.setState({
                                    outputList: response.data
                                }, () => {
                                    if (!this.state.active3) {
                                        localStorage.setItem("sesProgramIdReport", programId)
                                    }
                                    this.buildJExcel();
                                });
                            }).catch(
                                error => {
                                    document.getElementById('div2').style.display = 'block';
                                    if (error.message === "Network Error") {
                                        this.setState({
                                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                            loading: false
                                        }, () => {
                                            hideSecondComponent()
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
                                                    hideSecondComponent()
                                                });
                                                break;
                                            case 412:
                                                this.setState({
                                                    message: error.response.data.messageCode,
                                                    loading: false
                                                }, () => {
                                                    hideSecondComponent()
                                                });
                                                break;
                                            default:
                                                this.setState({
                                                    message: 'static.unkownError',
                                                    loading: false
                                                }, () => {
                                                    hideSecondComponent()
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
                    var fullShipmentList = shipmentList;
                    if (this.state.active1) {
                        shipmentList = shipmentList.filter(c => c.erpFlag.toString() == "false" && c.active.toString() == "true" && c.accountFlag.toString() == "true" && c.procurementAgent.id == PSM_PROCUREMENT_AGENT_ID && SHIPMENT_ID_ARR_MANUAL_TAGGING.includes(c.shipmentStatus.id.toString()));
                        shipmentList = shipmentList.filter(c => (
                            (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? moment(c.receivedDate).format("YYYY-MM-DD") < moment(Date.now()).subtract(6, 'months').format("YYYY-MM-DD") : moment(c.expectedDeliveryDate).format("YYYY-MM-DD") < moment(Date.now()).subtract(6, 'months').format("YYYY-MM-DD")) &&
                            ([3, 4, 5, 6, 9]).includes(c.shipmentStatus.id.toString())) || (
                                (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? moment(c.receivedDate).format("YYYY-MM-DD") >= moment(Date.now()).subtract(6, 'months').format("YYYY-MM-DD") : moment(c.expectedDeliveryDate).format("YYYY-MM-DD") >= moment(Date.now()).subtract(6, 'months').format("YYYY-MM-DD")) &&
                                SHIPMENT_ID_ARR_MANUAL_TAGGING.includes(c.shipmentStatus.id.toString())));
                    } else if (this.state.active2) {
                        shipmentList = shipmentList.filter(c => c.erpFlag.toString() == "true" && c.active.toString() == "true" && c.accountFlag.toString() == "true" && c.procurementAgent.id == PSM_PROCUREMENT_AGENT_ID);
                        for (var sl = 0; sl < shipmentList.length; sl++) {
                            var arr = [];
                            var list = (fullShipmentList.filter(c => shipmentList[sl].parentShipmentId == 0 ? shipmentList[sl].tempParentShipmentId != null && c.tempParentLinkedShipmentId == shipmentList[sl].tempParentShipmentId : shipmentList[sl].parentShipmentId != null && c.parentLinkedShipmentId == shipmentList[sl].parentShipmentId)).map(item => {
                                arr.push(item.shipmentId)
                            });
                            shipmentList[sl].parentShipmentIdArr = arr;
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
                            this.setState({
                                outputList: shipmentList,
                                linkedShipmentsListForTab2: linkedShipmentsList,
                                roPrimeNoListOriginal: response.data
                            }, () => {
                                if (!this.state.active3) {
                                    localStorage.setItem("sesProgramIdReport", programId)
                                }
                                this.buildJExcel();
                            });
                        }).catch(
                            error => {
                            }
                        );
                }
            } else {
                this.setState({
                    outputList: [],
                    loading: false
                }, () => {
                    try {
                        jexcel.destroy(document.getElementById("tableDiv"), true);
                    } catch (e) {
                    }
                })
            }
        })
    }
    /**
     * Fetches planning units based on the provided tracer category term and updates the state with the retrieved data.
     * @param {string} term - The term to search for planning units.
     */
    getPlanningUnitListByTracerCategory = (term) => {
        this.setState({ planningUnitName: term });
        var programId = this.state.active1 ? this.state.programId : this.state.programId1.split("_")[0];
        var listToExclude = [];
        if (this.state.active1) {
            var localProgramList = this.state.localProgramList;
            var localProgramListFilter = localProgramList.filter(c => c.programId == this.state.programId && c.version == this.state.versionId.split(" ")[0]);
            var generalProgramDataBytes = CryptoJS.AES.decrypt(localProgramListFilter[0].programData.generalData, SECRET_KEY);
            var generalProgramData = generalProgramDataBytes.toString(CryptoJS.enc.Utf8);
            var generalProgramJson = JSON.parse(generalProgramData);
            var linkedShipmentsList = generalProgramJson.shipmentLinkingList != null ? generalProgramJson.shipmentLinkingList : [];
            var delinkList = generalProgramJson.delinkList != undefined ? generalProgramJson.delinkList : [];
            delinkList.map(item => {
                var findIndexFromLinkedShipmentsList = linkedShipmentsList.findIndex(c => c.roNo == item.roNo && c.roPrimeLineNo == item.roPrimeLineNo && c.active.toString() == "true");
                if (findIndexFromLinkedShipmentsList == -1) {
                    listToExclude.push(item);
                }
            })
        }
        ManualTaggingService.autocompletePlanningUnit(this.state.planningUnitId, term.toUpperCase(), programId, listToExclude)
            .then(response => {
                var tracercategoryPlanningUnit = [];
                for (var i = 0; i < response.data.length; i++) {
                    var label = response.data[i].label.label_en + '(' + response.data[i].code + ')';
                    tracercategoryPlanningUnit[i] = { value: response.data[i].id, label: label }
                }
                var listArray = tracercategoryPlanningUnit;
                listArray.sort((a, b) => {
                    var itemLabelA = a.label.toUpperCase(); 
                    var itemLabelB = b.label.toUpperCase(); 
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    tracercategoryPlanningUnit: listArray,
                    roPrimeLineNoForTab3: ""
                });
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loading: false
                        }, () => {
                            hideSecondComponent()
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
                                    hideSecondComponent()
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                }, () => {
                                    hideSecondComponent()
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                }, () => {
                                    hideSecondComponent()
                                });
                                break;
                        }
                    }
                }
            );
    }
    /**
     * Searches ERP order data based on the provided term and updates the state with the retrieved data.
     * @param {string} term - The term to search for ERP order data.
     */
    searchErpOrderData = (term) => {
        if (term != null && term != "") {
            var erpPlanningUnitId = this.state.planningUnitIdUpdated;
            var programId = this.state.active1 ? this.state.programId : this.state.programId1.split("_")[0];
            var shipmentPlanningUnitId = this.state.active1 ? this.state.selectedRowPlanningUnit : (this.state.active3 ? ((this.state.active4 || this.state.active5) && !this.state.checkboxValue ? document.getElementById("planningUnitId1").value : (this.state.active4 || this.state.active5) && this.state.checkboxValue ? this.state.selectedShipment.length > 0 ? this.state.selectedShipment[0].planningUnit.id : 0 : 0) : 0)
            var listToExclude = [];
            if (this.state.active1) {
                var localProgramList = this.state.localProgramList;
                var localProgramListFilter = localProgramList.filter(c => c.programId == this.state.programId && c.version == this.state.versionId.split(" ")[0]);
                var generalProgramDataBytes = CryptoJS.AES.decrypt(localProgramListFilter[0].programData.generalData, SECRET_KEY);
                var generalProgramData = generalProgramDataBytes.toString(CryptoJS.enc.Utf8);
                var generalProgramJson = JSON.parse(generalProgramData);
                var linkedShipmentsList = generalProgramJson.shipmentLinkingList != null ? generalProgramJson.shipmentLinkingList : [];
                var delinkList = generalProgramJson.delinkList != undefined ? generalProgramJson.delinkList : [];
                delinkList.map(item => {
                    var findIndexFromLinkedShipmentsList = linkedShipmentsList.findIndex(c => c.roNo == item.roNo && c.roPrimeLineNo == item.roPrimeLineNo && c.active.toString() == "true");
                    if (findIndexFromLinkedShipmentsList == -1) {
                        listToExclude.push(item);
                    }
                })
            }
            var json = {
                "roPo": term.toUpperCase(),
                "programId": (programId != null && programId != "" ? programId : 0),
                "erpPlanningUnitId": (erpPlanningUnitId != null && erpPlanningUnitId != "" ? erpPlanningUnitId : 0),
                "qatPlanningUnitId": shipmentPlanningUnitId,
                "delinkedList": listToExclude
            }
            ManualTaggingService.autocompleteDataOrderNo(json)
                .then(response => {
                    var autocompleteData = [];
                    for (var i = 0; i < response.data.length; i++) {
                        autocompleteData[i] = { value: response.data[i], label: response.data[i] }
                    }
                    this.setState({
                        autocompleteData,
                        roPrimeLineNoForTab3: ""
                    });
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                loading: false
                            }, () => {
                                hideSecondComponent()
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
                                        hideSecondComponent()
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false
                                    }, () => {
                                        hideSecondComponent()
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false
                                    }, () => {
                                        hideSecondComponent()
                                    });
                                    break;
                            }
                        }
                    }
                );
        }
    }
    /**
     * Reterives program list from server
     */
    getProgramList() {
        let realmId = AuthenticationService.getRealmId()
        DropdownService.getProgramForDropdown(realmId, PROGRAM_TYPE_SUPPLY_PLAN)
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    var proList = [];
                    for (var i = 0; i < listArray.length; i++) {
                        var programJson = {
                            programId: listArray[i].id,
                            label: listArray[i].label,
                            programCode: listArray[i].code,
                            currentVersionId: listArray[i].currentVersionId
                        };
                        proList[i] = programJson;
                    }
                    proList.sort((a, b) => {
                        var itemLabelA = a.programCode.toUpperCase(); 
                        var itemLabelB = b.programCode.toUpperCase(); 
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    if (proList.length == 1) {
                        this.setState({
                            programs: proList,
                            loading: false,
                            programId: proList[0].programId
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
                            programs: proList,
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
                            hideSecondComponent();
                        })
                }
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loading: false
                        }, () => {
                            hideSecondComponent()
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
                                    hideSecondComponent()
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                }, () => {
                                    hideSecondComponent()
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                }, () => {
                                    hideSecondComponent()
                                });
                                break;
                        }
                    }
                }
            );
    }
    /**
     * Builds the jexcel component to display role list.
     */
    buildJExcelERP(build) {
        this.setState({
            table1Loader: false
        },
            () => {
                var planningUnitId = this.state.active1 ? this.state.selectedRowPlanningUnit : (this.state.active3 ? ((this.state.active4 || this.state.active5) && !this.state.checkboxValue ? document.getElementById("planningUnitId1").value : (this.state.active4 || this.state.active5) && this.state.checkboxValue ? this.state.selectedShipment[0].planningUnit.id : 0) : 0)
                if (this.state.active1) {
                    var updatedList = [];
                    updatedList.push(this.state.outputListAfterSearch[0]);
                    updatedList = updatedList.concat(this.state.outputList.filter(c => c.planningUnit.id == this.state.outputListAfterSearch[0].planningUnit.id).filter(d => this.state.outputListAfterSearch[0].shipmentId > 0 ? d.shipmentId != this.state.outputListAfterSearch[0].shipmentId : d.tempShipmentId != this.state.outputListAfterSearch[0].tempShipmentId))
                    var finalShipmentId = [];
                    if (!this.state.showAllShipments) {
                        finalShipmentId.push({ "shipmentId": this.state.outputListAfterSearch[0].shipmentId, "tempShipmentId": this.state.outputListAfterSearch[0].shipmentId > 0 ? null : this.state.outputListAfterSearch[0].tempShipmentId, "index": 0, "qty": this.state.outputListAfterSearch[0].shipmentQty })
                        var qtyFinalShipment = 0;
                        finalShipmentId.map(c => {
                            qtyFinalShipment += Number(c.qty)
                        })
                        this.setState({
                            originalQty: qtyFinalShipment,
                            finalShipmentId: finalShipmentId,
                        });
                    }
                    var list = this.state.showAllShipments ? updatedList : this.state.outputListAfterSearch;
                    var dataArray1 = [];
                    var data1 = [];
                    var finalShipmentId = this.state.showAllShipments ? this.state.finalShipmentId : finalShipmentId;
                    var shipmentListArr = [...new Set(finalShipmentId.filter(c => c.shipmentId != 0).map(ele => (ele.shipmentId)))]
                    var tempShipmentListArr = [...new Set(finalShipmentId.filter(c => c.tempShipmentId != 0 && c.tempShipmentId != null).map(ele => (ele.tempShipmentId)))]
                    for (var i = 0; i < list.length; i++) {
                        data1 = []
                        data1[0] = list[i].shipmentId > 0 ? (shipmentListArr.includes(list[i].shipmentId) ? true : false) : (tempShipmentListArr.includes(list[i].tempShipmentId) ? true : false);
                        data1[1] = getLabelText(list[i].planningUnit.label, this.state.lang);
                        data1[2] = list[i].shipmentId;
                        data1[3] = list[i].procurementAgent.code
                        data1[4] = list[i].orderNo;
                        data1[5] = getLabelText(list[i].realmCountryPlanningUnit.label, this.state.lang)
                        data1[6] = list[i].shipmentTransId;
                        data1[7] = list[i].receivedDate != "" && list[i].receivedDate != null && list[i].receivedDate != undefined && list[i].receivedDate != "Invalid date" ? list[i].receivedDate : list[i].expectedDeliveryDate;
                        data1[8] = getLabelText(list[i].shipmentStatus.label, this.state.lang)
                        data1[9] = list[i].shipmentQty
                        data1[10] = list[i].realmCountryPlanningUnit.multiplier
                        data1[11] = Math.round(Number(list[i].shipmentQty) * Number(list[i].realmCountryPlanningUnit.multiplier));
                        data1[12] = list[i].notes
                        data1[13] = i;
                        data1[14] = list[i].tempShipmentId;
                        dataArray1.push(data1)
                    }
                    this.el = jexcel(document.getElementById("tab1"), '');
                    jexcel.destroy(document.getElementById("tab1"), true);
                    var options = {
                        data: dataArray1,
                        columnDrag: false,
                        colHeaderClasses: ["Reqasterisk"],
                        columns: [
                            {
                                title: i18n.t('static.mt.selectShipment'),
                                type: 'checkbox',
                                width: 80
                            },
                            {
                                title: i18n.t('static.supplyPlan.qatProduct'),
                                type: 'hidden',
                                readOnly: true,
                                width: 150
                            },
                            {
                                title: i18n.t('static.commit.qatshipmentId'),
                                type: 'numeric',
                                readOnly: true,
                                width: 80
                            },
                            {
                                title: i18n.t('static.report.procurementAgentName'),
                                type: 'text',
                                readOnly: true,
                                width: 100
                            },
                            {
                                title: i18n.t('static.manualTagging.procOrderNo'),
                                type: 'text',
                                readOnly: true,
                                width: 100
                            },
                            {
                                title: i18n.t('static.supplyPlan.alternatePlanningUnit'),
                                type: 'text',
                                readOnly: true,
                                width: 150
                            },
                            {
                                title: i18n.t('shipmentTransId'),
                                type: 'hidden',
                                readOnly: true,
                                width: 0
                            },
                            {
                                title: i18n.t('static.supplyPlan.mtexpectedDeliveryDate'),
                                type: 'calendar',
                                readOnly: true,
                                options: { format: JEXCEL_DATE_FORMAT },
                                width: 80
                            },
                            {
                                title: i18n.t('static.supplyPlan.mtshipmentStatus'),
                                type: 'text',
                                readOnly: true,
                                width: 80
                            },
                            {
                                title: i18n.t('static.manualTagging.aruQty'),
                                type: 'numeric',
                                mask: '#,##', decimal: '.',
                                readOnly: true,
                                width: 80
                            },
                            {
                                title: i18n.t('static.manualTagging.conversionARUToPU'),
                                type: 'numeric',
                                mask: '#,##0.00',
                                decimal: '.',
                                width: 90,
                                readOnly: true
                            },
                            {
                                title: i18n.t('static.manualTagging.qtyPU'),
                                type: 'numeric',
                                mask: '#,##',
                                readOnly: true,
                                width: 80
                            },
                            {
                                title: i18n.t('static.common.notes'),
                                type: 'text',
                                readOnly: true,
                                width: 150
                            },
                            {
                                title: i18n.t('shipmentTransId'),
                                type: 'hidden',
                                readOnly: true,
                                width: 0
                            },
                            {
                                title: i18n.t('shipmentTransId'),
                                type: 'hidden',
                                readOnly: true,
                                width: 0
                            },
                        ],
                        editable: true,
                        onload: this.loadedERP1,
                        pagination: false,
                        search: false,
                        columnSorting: false,
                        wordWrap: true,
                        allowInsertColumn: false,
                        allowManualInsertColumn: false,
                        allowDeleteRow: false,
                        filters: false,
                        onchange: this.changedTab1,
                        license: JEXCEL_PRO_KEY,
                        contextMenu: function (obj, x, y, e) {
                            return false;
                        }.bind(this),
                    };
                    var instance = jexcel(document.getElementById("tab1"), options);
                    this.el = instance;
                } else {
                    try {
                        this.el = jexcel(document.getElementById("tab1"), '');
                        jexcel.destroy(document.getElementById("tab1"), true);
                    } catch (error) {
                    }
                }
                if (build) {
                    let erpDataList = this.state.artmisList;
                    let erpDataArray = [];
                    let count = 0;
                    let qty = 0;
                    for (var j = 0; j < erpDataList.length; j++) {
                        data = [];
                        data[0] = this.state.active3 ? true : false;
                        data[1] = erpDataList[j].roNo + ' - ' + erpDataList[j].roPrimeLineNo + ' | ' + erpDataList[j].orderNo + ' - ' + erpDataList[j].primeLineNo + (erpDataList[j].knShipmentNo != '' && erpDataList[j].knShipmentNo != null ? ' | ' + erpDataList[j].knShipmentNo : "");
                        data[2] = erpDataList[j].orderNo + ' | ' + erpDataList[j].primeLineNo;
                        data[3] = getLabelText(erpDataList[j].erpPlanningUnit.label);
                        data[4] = erpDataList[j].expectedDeliveryDate;
                        data[5] = erpDataList[j].erpShipmentStatus;
                        data[6] = erpDataList[j].knShipmentNo;
                        data[7] = erpDataList[j].batchNo;
                        data[8] = erpDataList[j].expiryDate;
                        data[9] = "";
                        data[10] = erpDataList[j].erpQty;
                        data[11] = "";
                        data[12] = "";
                        data[13] = "";
                        data[14] = erpDataArray.filter(c => c[17] == erpDataList[j].roNo + ' | ' + erpDataList[j].roPrimeLineNo).length > 0 ? 1 : 0;
                        data[15] = erpDataList[j].qatEquivalentShipmentStatus;
                        data[16] = erpDataList[j];
                        data[17] = erpDataList[j].roNo + ' | ' + erpDataList[j].roPrimeLineNo
                        data[18] = 1;
                        data[19] = ""
                        data[20] = planningUnitId;
                        erpDataArray[count] = data;
                        count++;
                    }
                    this.setState({
                        totalQuantity: this.addCommas(Math.round(qty)),
                        displayTotalQty: (qty > 0 ? true : false)
                    });
                    if (document.getElementById("tableDiv1") != null) {
                        this.el = jexcel(document.getElementById("tableDiv1"), '');
                        jexcel.destroy(document.getElementById("tableDiv1"), true);
                    }
                    var data = erpDataArray;
                    var options = {
                        data: data,
                        columnDrag: false,
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
                                title: i18n.t('static.manualTagging.aru'),
                                type: 'dropdown',
                                source: this.state.realmCountryPlanningUnitList,
                                filter: this.filterRealmCountryPlanningUnit1,
                                width: 150
                            },
                            {
                                title: i18n.t('static.supplyPlan.qty'),
                                type: 'numeric',
                                mask: '#,##', decimal: '.',
                                readOnly: true,
                                width: 80
                            },
                            {
                                title: i18n.t('static.manualTagging.conversionERPToPU'),
                                type: 'numeric',
                                mask: '#,##0.00',
                                decimal: '.',
                                textEditor: true,
                                disabledMaskOnEdition: true,
                                width: 80
                            },
                            {
                                title: i18n.t('static.manualTagging.convertedQATShipmentQty'),
                                type: 'numeric',
                                mask: '#,##',
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
                            {
                                title: "Multiplier",
                                type: 'hidden',
                            },
                            {
                                title: "QAT Rcpu Qty",
                                type: 'hidden',
                            },
                            {
                                title: "QAT Rcpu Qty",
                                type: 'hidden',
                            },
                        ],
                        editable: true,
                        onsearch: function (el) {
                        },
                        onfilter: function (el) {
                        },
                        onload: this.loadedERP,
                        pagination: localStorage.getItem("sesRecordCount"),
                        filters: true,
                        search: true,
                        columnSorting: true,
                        wordWrap: true,
                        paginationOptions: JEXCEL_PAGINATION_OPTION,
                        position: 'top',
                        allowInsertColumn: false,
                        allowManualInsertColumn: false,
                        allowDeleteRow: false,
                        onchange: this.changed,
                        updateTable: function (el, cell, x, y, source, value, id) {
                            var elInstance = el;
                            if (y != null) {
                                var rowData = elInstance.getRowData(y);
                                if (rowData[14] == 0 && rowData[0]) {
                                    var cell = elInstance.getCell(("J").concat(parseInt(y) + 1))
                                    cell.classList.remove('readonly');
                                    var cell = elInstance.getCell(("L").concat(parseInt(y) + 1))
                                    cell.classList.add('readonly');
                                    var cell = elInstance.getCell(("N").concat(parseInt(y) + 1))
                                    cell.classList.remove('readonly');
                                } else {
                                    var cell = elInstance.getCell(("J").concat(parseInt(y) + 1))
                                    cell.classList.add('readonly');
                                    var cell = elInstance.getCell(("L").concat(parseInt(y) + 1))
                                    cell.classList.add('readonly');
                                    var cell = elInstance.getCell(("N").concat(parseInt(y) + 1))
                                    cell.classList.add('readonly');
                                }
                                if (rowData[14] == 1) {
                                    var cell = elInstance.getCell(("A").concat(parseInt(y) + 1))
                                    cell.classList.add('readonly');
                                }
                            }
                        }.bind(this),
                        copyCompatibility: true,
                        allowManualInsertRow: false,
                        parseFormulas: true,
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
                        table1Loader: true,
                        loading1: false
                    })
                } else {
                    this.setState({
                        loading: false,
                        buildJexcelRequired: true,
                        table1Loader: true,
                        loading1: false
                    })
                }
            })
    }
    /**
     * Builds the jexcel component to display role list.
     */
    buildJExcel() {
        var programId = (this.state.active3 ? this.state.programId1.toString().split("_")[0] : this.state.programId)
        RealmCountryService.getRealmCountryPlanningUnitByProgramId([programId]).then(response1 => {
            var rcpuList = [];
            response1.data.map(c => {
                rcpuList.push({
                    name: getLabelText(c.label, this.state.lang),
                    id: c.realmCountryPlanningUnitId,
                    multiplier: c.multiplier,
                    active: c.active,
                    label: c.label,
                    planningUnit: c.planningUnit
                })
            })
            let manualTaggingList = this.state.outputList;
            let manualTaggingArray = [];
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
                    data = [];
                    data[0] = manualTaggingList[j].shipmentId
                    data[1] = manualTaggingList[j].shipmentTransId
                    data[2] = getLabelText(manualTaggingList[j].planningUnit.label, this.state.lang)
                    data[3] = manualTaggingList[j].receivedDate != "" && manualTaggingList[j].receivedDate != null && manualTaggingList[j].receivedDate != undefined && manualTaggingList[j].receivedDate != "Invalid date" ? manualTaggingList[j].receivedDate : manualTaggingList[j].expectedDeliveryDate;
                    data[4] = getLabelText(manualTaggingList[j].shipmentStatus.label, this.state.lang)
                    data[5] = manualTaggingList[j].procurementAgent.code
                    data[6] = manualTaggingList[j].orderNo
                    data[7] = manualTaggingList[j].shipmentQty
                    data[8] = manualTaggingList[j].notes
                    data[9] = manualTaggingList[j].shipmentId != 0 ? -1 : manualTaggingList[j].tempShipmentId;
                    manualTaggingArray.push(data);
                } else if (this.state.active2) {
                    data = [];
                    let shipmentQty = !this.state.versionId.toString().includes("Local") ? manualTaggingList[j].erpQty : manualTaggingList[j].shipmentQty;
                    let linkedShipmentsListForTab2 = this.state.versionId.toString().includes("Local") ? this.state.linkedShipmentsListForTab2.filter(c => manualTaggingList[j].shipmentId > 0 ? c.childShipmentId == manualTaggingList[j].shipmentId : c.tempChildShipmentId == manualTaggingList[j].tempShipmentId) : [manualTaggingList[j]];
                    data[0] = true;
                    data[1] = (!this.state.versionId.toString().includes("Local") ? (linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2[0].parentShipmentId + (manualTaggingList[j].parentLinkedShipmentId != "" && manualTaggingList[j].parentLinkedShipmentId != null ? ", " + manualTaggingList[j].parentLinkedShipmentId : "") : 0) + " (" + manualTaggingList[j].childShipmentId : (linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2[0].parentShipmentId + (manualTaggingList[j].parentShipmentIdArr.length > 0 ? ", " + manualTaggingList[j].parentShipmentIdArr.toString() : "") : 0) + " (" + manualTaggingList[j].shipmentId) + ")";
                    data[2] = !this.state.versionId.toString().includes("Local") ? manualTaggingList[j].childShipmentId : manualTaggingList[j].shipmentId
                    data[3] = (linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2[0].roNo + " - " + linkedShipmentsListForTab2[0].roPrimeLineNo : "") + " | " + (manualTaggingList[j].orderNo + " - " + manualTaggingList[j].primeLineNo) + (linkedShipmentsListForTab2.length > 0 && linkedShipmentsListForTab2[0].knShipmentNo != "" && linkedShipmentsListForTab2[0].knShipmentNo != null ? " | " + linkedShipmentsListForTab2[0].knShipmentNo : "");
                    data[4] = manualTaggingList[j].orderNo + " | " + manualTaggingList[j].primeLineNo
                    data[7] = linkedShipmentsListForTab2.length > 0 ? getLabelText(linkedShipmentsListForTab2[0].erpPlanningUnit.label, this.state.lang) : ""
                    data[12] = !this.state.versionId.toString().includes("Local") ? getLabelText(manualTaggingList[j].qatPlanningUnit.label, this.state.lang) : getLabelText(manualTaggingList[j].planningUnit.label, this.state.lang)
                    data[5] = manualTaggingList[j].expectedDeliveryDate
                    data[6] = linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2[0].erpShipmentStatus : ""
                    data[8] = !this.state.versionId.toString().includes("Local") ? getLabelText(manualTaggingList[j].qatRealmCountryPlanningUnit.label, this.state.lang) : getLabelText(manualTaggingList[j].realmCountryPlanningUnit.label, this.state.lang)
                    data[9] = !this.state.versionId.toString().includes("Local") ? Math.round((shipmentQty)) : Math.round((shipmentQty) / (linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2[0].conversionFactor : 1) / (!this.state.versionId.toString().includes("Local") ? manualTaggingList[j].qatRealmCountryPlanningUnit.multiplier : manualTaggingList[j].realmCountryPlanningUnit.multiplier))
                    data[31] = linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2[0].conversionFactor : 1
                    data[11] = `=ROUND(AG${parseInt(j) + 1}*K${parseInt(j) + 1}*AF${parseInt(j) + 1},0)`;
                    data[13] = manualTaggingList[j].notes
                    data[14] = manualTaggingList[j].orderNo
                    data[15] = manualTaggingList[j].primeLineNo
                    data[16] = manualTaggingList[j].tempShipmentId;
                    data[17] = manualTaggingList[j];
                    data[18] = linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2 : {}
                    data[19] = linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2[0].roNo : ""
                    data[20] = linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2[0].roPrimeLineNo : ""
                    data[21] = manualTaggingArray.filter(c => (c[19] == (linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2[0].roNo : "")) && (c[20] == (linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2[0].roPrimeLineNo : ""))).length > 0 ? 1 : 0;
                    data[22] = (linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2[0].roNo + " - " + linkedShipmentsListForTab2[0].roPrimeLineNo : "")
                    data[23] = 0;
                    data[24] = linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2[0].conversionFactor : 1;
                    data[25] = manualTaggingList[j].notes;
                    data[26] = this.state.versionId.toString().includes("Local") && linkedShipmentsListForTab2.length > 0 ? this.state.roPrimeNoListOriginal.filter(c => c.roNo == linkedShipmentsListForTab2[0].roNo && c.roPrimeLineNo == linkedShipmentsListForTab2[0].roPrimeLineNo)[0] : {};
                    data[27] = linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2[0].roNo : "";
                    data[28] = linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2[0].roPrimeLineNo : "";
                    data[29] = (!this.state.versionId.toString().includes("Local") ? (linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2[0].parentShipmentId + (manualTaggingList[j].parentLinkedShipmentId != "" && manualTaggingList[j].parentLinkedShipmentId != null ? ", " + manualTaggingList[j].parentLinkedShipmentId : "") : 0) : (linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2[0].parentShipmentId + (manualTaggingList[j].parentShipmentIdArr.length > 0 ? ", " + manualTaggingList[j].parentShipmentIdArr.toString() : "") : 0));
                    data[30] = manualTaggingArray.filter(c => (c[29] == data[29])).length > 0 ? 1 : 0;
                    data[10] = !this.state.versionId.toString().includes("Local") ? manualTaggingList[j].qatRealmCountryPlanningUnit.multiplier : manualTaggingList[j].realmCountryPlanningUnit.multiplier
                    data[32] = !this.state.versionId.toString().includes("Local") ? Math.round((shipmentQty)) : Math.round((shipmentQty) / (linkedShipmentsListForTab2.length > 0 ? linkedShipmentsListForTab2[0].conversionFactor : 1) / (!this.state.versionId.toString().includes("Local") ? manualTaggingList[j].qatRealmCountryPlanningUnit.multiplier : manualTaggingList[j].realmCountryPlanningUnit.multiplier))
                    data[33] = !this.state.versionId.toString().includes("Local") ? manualTaggingList[j].qatPlanningUnit.id : manualTaggingList[j].planningUnit.id
                    data[34] = !this.state.versionId.toString().includes("Local") ? manualTaggingList[j].qatRealmCountryPlanningUnit.id : manualTaggingList[j].realmCountryPlanningUnit.id;
                    data[35] = !this.state.versionId.toString().includes("Local") ? manualTaggingList[j].qatRealmCountryPlanningUnit.multiplier : manualTaggingList[j].realmCountryPlanningUnit.multiplier;
                    manualTaggingArray.push(data);
                }
                else {
                    data = [];
                    data[0] = (manualTaggingList[j].roNo + " - " + manualTaggingList[j].roPrimeLineNo) + " | " + (manualTaggingList[j].orderNo + " - " + manualTaggingList[j].primeLineNo) + (manualTaggingList[j].knShipmentNo != "" && manualTaggingList[j].knShipmentNo != null ? " | " + manualTaggingList[j].knShipmentNo : "");
                    data[1] = manualTaggingList[j].orderNo + " - " + manualTaggingList[j].primeLineNo
                    data[2] = manualTaggingList[j].knShipmentNo;
                    data[3] = getLabelText(manualTaggingList[j].erpPlanningUnit.label, this.state.lang)
                    data[4] = manualTaggingList[j].expectedDeliveryDate
                    data[5] = manualTaggingList[j].erpShipmentStatus
                    data[6] = manualTaggingList[j].erpQty
                    data[7] = j;
                    data[8] = manualTaggingList[j].tracerCategoryId;
                    manualTaggingArray.push(data);
                }
            }
            this.el = jexcel(document.getElementById("tableDiv"), '');
            jexcel.destroy(document.getElementById("tableDiv"), true);
            var data = manualTaggingArray;
            if (this.state.active1) {
                var options = {
                    data: data,
                    columnDrag: false,
                    colHeaderClasses: ["Reqasterisk"],
                    columns: [
                        {
                            title: i18n.t('static.commit.qatshipmentId'),
                            type: 'numeric',
                            width: 60,
                        },
                        {
                            title: "shipmentTransId",
                            type: 'hidden',
                            width: 0,
                        },
                        {
                            title: i18n.t('static.supplyPlan.qatProduct'),
                            type: 'text',
                            width: 150,
                        },
                        {
                            title: i18n.t('static.supplyPlan.mtexpectedDeliveryDate'),
                            type: 'calendar',
                            options: { format: JEXCEL_DATE_FORMAT },
                            width: 80,
                        },
                        {
                            title: i18n.t('static.supplyPlan.mtshipmentStatus'),
                            type: 'text',
                            width: 80,
                        },
                        {
                            title: i18n.t('static.report.procurementAgentName'),
                            type: 'text',
                            width: 100,
                        }
                        ,
                        {
                            title: i18n.t('static.manualTagging.procOrderNo'),
                            type: 'text',
                            width: 80,
                        },
                        {
                            title: i18n.t('static.supplyPlan.shipmentQty'),
                            type: 'numeric',
                            mask: '#,##', decimal: '.',
                            width: 60,
                        },
                        {
                            title: i18n.t('static.common.notes'),
                            type: 'text',
                            width: 150,
                        },
                        {
                            title: "Index",
                            type: 'hidden',
                            width: 0,
                        },
                    ],
                    editable: false,
                    onload: this.loaded,
                    pagination: localStorage.getItem("sesRecordCount"),
                    search: true,
                    columnSorting: true,
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
                    columnDrag: false,
                    colHeaderClasses: ["Reqasterisk"],
                    columns: [
                        {
                            title: i18n.t('static.mt.linked'),
                            type: 'checkbox',
                            width: 60,
                        },
                        {
                            title: i18n.t('static.mt.parentShipmentId(childShipmentId)'),
                            type: 'text',
                            readOnly: true,
                            width: 80,
                        },
                        {
                            title: i18n.t('static.mt.childShipmentId'),
                            type: 'hidden',
                            readOnly: true,
                            width: 0,
                        },
                        {
                            title: i18n.t('static.manualTagging.RONO'),
                            type: 'text',
                            readOnly: true,
                            width: 80,
                        },
                        {
                            title: i18n.t('static.manualTagging.procOrderNo'),
                            type: 'hidden',
                            readOnly: true,
                            width: 0,
                        },
                        {
                            title: i18n.t('static.manualTagging.currentEstimetedDeliveryDate'),
                            type: 'calendar',
                            options: { format: JEXCEL_DATE_FORMAT },
                            readOnly: true,
                            width: 80,
                        },
                        {
                            title: i18n.t('static.common.status'),
                            type: 'text',
                            readOnly: true,
                            width: 80,
                        },
                        {
                            title: i18n.t('static.manualTagging.erpProduct'),
                            type: 'text',
                            readOnly: true,
                            width: 150,
                        },
                        {
                            title: i18n.t('static.supplyPlan.alternatePlanningUnit'),
                            type: 'dropdown',
                            source: rcpuList,
                            width: 150,
                            filter: this.filterRealmCountryPlanningUnit
                        },
                        {
                            title: i18n.t('static.manualTagging.erpQty'),
                            type: 'numeric',
                            mask: '#,##', decimal: '.',
                            readOnly: true,
                            width: 60,
                        },
                        {
                            title: i18n.t('static.manualTagging.conversionERPToPU'),
                            type: 'numeric',
                            mask: '#,##0.00', decimal: '.',
                            width: 60,
                        },
                        {
                            title: i18n.t('static.manualTagging.convertedQATShipmentQty'),
                            type: 'numeric',
                            mask: '#,##', decimal: '.',
                            readOnly: true,
                            width: 60,
                        },
                        {
                            title: i18n.t('static.supplyPlan.qatProduct'),
                            type: 'text',
                            readOnly: true,
                            width: 150,
                        },
                        {
                            title: i18n.t('static.common.notes'),
                            type: 'text',
                            width: 150,
                        },
                        {
                            title: "orderNo",
                            type: 'hidden',
                            width: 0,
                        },
                        {
                            title: "primeLineNo",
                            type: 'hidden',
                            width: 0,
                        },
                        {
                            title: "tempShipmentId",
                            type: 'hidden',
                            width: 0,
                        },
                        {
                            title: "shipment list",
                            type: 'hidden',
                            width: 0,
                        },
                        {
                            title: "linked shipment list",
                            type: 'hidden',
                            width: 0,
                        },
                        {
                            title: "linked shipment list",
                            type: 'hidden',
                            width: 0,
                        },
                        {
                            title: "linked shipment list",
                            type: 'hidden',
                            width: 0,
                        },
                        {
                            title: "linked shipment list",
                            type: 'hidden',
                            width: 0,
                        },
                        {
                            title: "linked shipment list",
                            type: 'hidden',
                            width: 0,
                        },
                        {
                            title: "linked shipment list",
                            type: 'hidden',
                            width: 0,
                        },
                        {
                            title: "linked shipment list",
                            type: 'hidden',
                            width: 0,
                        },
                        {
                            title: "linked shipment list",
                            type: 'hidden',
                            width: 0,
                        },
                        {
                            title: "Original data",
                            type: 'hidden',
                            width: 0,
                        },
                        {
                            title: "Ro No",
                            type: 'hidden',
                            width: 0,
                        },
                        {
                            title: "Ro Prime line no",
                            type: 'hidden',
                            width: 0,
                        },
                        {
                            title: "Same parent shipment Id check",
                            type: 'hidden',
                            width: 0,
                        },
                        {
                            title: "Same parent shipment Id check",
                            type: 'hidden',
                            width: 0,
                        },
                        {
                            title: "Same parent shipment Id check",
                            type: 'hidden',
                            width: 0,
                        },
                        {
                            title: "Same parent shipment Id check",
                            type: 'hidden',
                            width: 0,
                        },
                        {
                            title: "Same parent shipment Id check",
                            type: 'hidden',
                            width: 0,
                        },
                        {
                            title: "Same parent shipment Id check",
                            type: 'hidden',
                            width: 0,
                        },
                        {
                            title: "Same parent shipment Id check",
                            type: 'hidden',
                            width: 0,
                        },
                    ],
                    editable: true,
                    onload: this.loaded,
                    pagination: localStorage.getItem("sesRecordCount"),
                    search: true,
                    columnSorting: true,
                    wordWrap: true,
                    allowInsertColumn: false,
                    allowManualInsertColumn: false,
                    allowDeleteRow: false,
                    onchange: this.changeTab2,
                    copyCompatibility: true,
                    allowExport: false,
                    paginationOptions: JEXCEL_PAGINATION_OPTION,
                    position: 'top',
                    filters: true,
                    license: JEXCEL_PRO_KEY,
                    updateTable: function (el, cell, x, y, source, value, id) {
                        var elInstance = el;
                        if (y != null) {
                            var rowData = elInstance.getRowData(y);
                            if (rowData[30] == 1 || !this.state.versionId.toString().includes("Local")) {
                                var cell = elInstance.getCell(("A").concat(parseInt(y) + 1))
                                cell.classList.add('readonly');
                            }
                            if (rowData[21] == 1 || !this.state.versionId.toString().includes("Local")) {
                                var cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                                cell.classList.add('readonly');
                                var cell = elInstance.getCell(("N").concat(parseInt(y) + 1))
                                cell.classList.add('readonly');
                                var cell = elInstance.getCell(("K").concat(parseInt(y) + 1))
                                cell.classList.add('readonly');
                                if (rowData[0] == false) {
                                    var cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                                    cell.classList.add('readonly');
                                    var cell = elInstance.getCell(("N").concat(parseInt(y) + 1))
                                    cell.classList.add('readonly');
                                    var cell = elInstance.getCell(("K").concat(parseInt(y) + 1))
                                    cell.classList.add('readonly');
                                }
                            } else {
                                if (rowData[0] == false) {
                                    var cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                                    cell.classList.add('readonly');
                                    var cell = elInstance.getCell(("N").concat(parseInt(y) + 1))
                                    cell.classList.add('readonly');
                                    var cell = elInstance.getCell(("K").concat(parseInt(y) + 1))
                                    cell.classList.add('readonly');
                                } else {
                                    var cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                                    cell.classList.remove('readonly');
                                    var cell = elInstance.getCell(("N").concat(parseInt(y) + 1))
                                    cell.classList.remove('readonly');
                                    var cell = elInstance.getCell(("K").concat(parseInt(y) + 1))
                                    cell.classList.add('readonly');
                                }
                            }
                        }
                    }.bind(this),
                    onsearch: function (el) {
                    },
                    onfilter: function (el) {
                    },
                    contextMenu: function (obj, x, y, e) {
                        var items = [];
                        if (y != null) {
                            if (obj.options.allowInsertRow == true) {
                                items.push({
                                    title: i18n.t('static.mt.viewArtmisHistory'),
                                    onclick: function () {
                                        let roNo = obj.getValueFromCoords(27, y).toString().trim();
                                        let roPrimeLineNo = obj.getValueFromCoords(28, y).toString().trim();
                                        ManualTaggingService.getARTMISHistory(roNo, roPrimeLineNo)
                                            .then(response => {
                                                this.setState({
                                                    artmisHistory: response.data
                                                }, () => {
                                                    this.toggleArtmisHistoryModal();
                                                });
                                            }).catch(
                                                error => {
                                                    if (error.message === "Network Error") {
                                                        this.setState({
                                                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                                            loading: false
                                                        }, () => {
                                                            hideSecondComponent()
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
                                                                    hideSecondComponent()
                                                                });
                                                                break;
                                                            case 412:
                                                                this.setState({
                                                                    message: error.response.data.messageCode,
                                                                    loading: false
                                                                }, () => {
                                                                    hideSecondComponent()
                                                                });
                                                                break;
                                                            default:
                                                                this.setState({
                                                                    message: 'static.unkownError',
                                                                    loading: false
                                                                }, () => {
                                                                    hideSecondComponent()
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
                    columnDrag: false,
                    colHeaderClasses: ["Reqasterisk"],
                    columns: [
                        {
                            title: i18n.t('static.mt.roNoAndRoLineNo'),
                            type: 'text',
                            width: 50
                        },
                        {
                            title: i18n.t('static.mt.orderNoAndPrimeLineNo'),
                            type: 'hidden',
                            width: 0
                        },
                        {
                            title: i18n.t('static.mt.knShipmentNo'),
                            type: 'hidden',
                            width: 0
                        },
                        {
                            title: i18n.t('static.manualTagging.erpPlanningUnit'),
                            type: 'text',
                            width: 80
                        },
                        {
                            title: i18n.t('static.manualTagging.currentEstimetedDeliveryDate'),
                            type: 'calendar',
                            options: { format: JEXCEL_DATE_FORMAT },
                            width: 45
                        },
                        {
                            title: i18n.t('static.common.status'),
                            type: 'text',
                            width: 45
                        },
                        {
                            title: i18n.t('static.supplyPlan.shipmentQty'),
                            type: 'numeric',
                            mask: '#,##', decimal: '.',
                            width: 45
                        },
                        {
                            title: "Index",
                            type: 'hidden',
                        },
                        {
                            title: "TCId",
                            type: 'hidden',
                        },
                    ],
                    editable: false,
                    onload: this.loaded,
                    pagination: localStorage.getItem("sesRecordCount"),
                    search: true,
                    columnSorting: true,
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
                        return false;
                    }.bind(this),
                };
            }
            var languageEl = jexcel(document.getElementById("tableDiv"), options);
            this.el = languageEl;
            this.setState({
                languageEl: languageEl, loading: false,
                realmCountryPlanningUnitList: rcpuList
            })
        })
    }
    /**
     * Function to filter realm country planning unit based on planning unit
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The jexcel cell object.
     * @param {number} c - Column index.
     * @param {number} r - Row index.
     * @param {Array} source - The source array for autocomplete options (unused).
     * @returns {Array} - Returns an array of active countries.
     */   
    filterRealmCountryPlanningUnit = function (o, cell, x, y, value, config) {
        var planningUnitId = this.el.getValueFromCoords(33, y);
        return this.state.realmCountryPlanningUnitList.filter(c => c.planningUnit.id == planningUnitId);
    }.bind(this);
    /**
     * Function to filter realm country planning unit based on planning unit
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The jexcel cell object.
     * @param {number} c - Column index.
     * @param {number} r - Row index.
     * @param {Array} source - The source array for autocomplete options (unused).
     * @returns {Array} - Returns an array of active countries.
     */
    filterRealmCountryPlanningUnit1 = function (o, cell, x, y, value, config) {
        var planningUnitId = this.state.active1 ? this.state.selectedRowPlanningUnit : (this.state.active3 ? ((this.state.active4 || this.state.active5) && !this.state.checkboxValue ? document.getElementById("planningUnitId1").value : (this.state.active4 || this.state.active5) && this.state.checkboxValue ? this.state.selectedShipment[0].planningUnit.id : 0) : 0)
        return this.state.realmCountryPlanningUnitList.filter(c => c.planningUnit.id == planningUnitId);
    }.bind(this);
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance, 0);
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loadedERP1 = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loadedERP = function (instance, cell, x, y, value) {
        if (this.state.active1) {
            jExcelLoadedFunctionForErp(instance, 1);
            var asterisk = document.getElementsByClassName("jss")[2].firstChild.nextSibling;
        } else {
            jExcelLoadedFunction(instance, 1);
            var asterisk = document.getElementsByClassName("jss")[1].firstChild.nextSibling;
        }
        var tr = asterisk.firstChild;
        tr.children[10].classList.add('AsteriskTheadtrTd');
        tr.children[12].classList.add('AsteriskTheadtrTd');
    }
    /**
     * Open the ERP details modal on row click
     */
    selected = function (instance, cell, x, y, value, e) {
        if (e.buttons == 1) {
            if ((x == 0 && value != 0) || (y == 0 && value != 0)) {
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
                    var finalShipmentId = []
                    if (outputListAfterSearch[0].orderNo != null && outputListAfterSearch[0].orderNo != "") {
                        json = { id: outputListAfterSearch[0].orderNo, label: outputListAfterSearch[0].orderNo };
                        finalShipmentId.push({ "shipmentId": this.el.getValueFromCoords(0, x), "tempShipmentId": this.el.getValueFromCoords(0, x) > 0 ? null : this.el.getValueFromCoords(9, x), "index": "", "qty": outputListAfterSearch[0].shipmentQty })
                    } else {
                        json = { id: '', label: '' };
                        finalShipmentId.push({ "shipmentId": this.el.getValueFromCoords(0, x), "tempShipmentId": this.el.getValueFromCoords(0, x) > 0 ? null : this.el.getValueFromCoords(9, x), "index": "", "qty": outputListAfterSearch[0].shipmentQty })
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
                        selectedRowPlanningUnit: outputListAfterSearch[0].planningUnit.id,
                        selectedRowPlanningUnitLabel: getLabelText(outputListAfterSearch[0].planningUnit.label, this.state.lang),
                        finalShipmentId: finalShipmentId,
                        showAllShipments: false,
                        planningUnitId: (this.state.active3 ? outputListAfterSearch[0].erpPlanningUnit.id : outputListAfterSearch[0].planningUnit.id),
                        shipmentId: (this.state.active1 ? this.el.getValueFromCoords(0, x) : (this.state.active2 ? this.el.getValueFromCoords(1, x) : 0)),
                        procurementAgentId: (this.state.active3 ? 1 : outputListAfterSearch[0].procurementAgent.id),
                        planningUnitName: (this.state.active3 ? row.erpPlanningUnit.label.label_en + "(" + row.skuCode + ")" : row.planningUnit.label.label_en + '(' + row.skuCode + ')')
                    }, () => {
                        this.toggleLarge();
                        this.getOrderDetails();
                    });
                } else if (this.state.active2 && this.state.versionId.includes("Local")) {
                    var rowData = this.el.getRowData(x);
                    this.toggleLarge();
                    this.getShipmentsForTab2(rowData[1], rowData[14], rowData[2].split("|")[0], rowData[2].split("|")[1]);
                } else if (this.state.active3) {
                    this.setState({
                        loading1: true
                    })
                    row = this.state.outputList.filter((c, index) => (index == this.el.getValueFromCoords(7, x)))[0];
                    outputListAfterSearch.push(row);
                    json = { id: outputListAfterSearch[0].roNo, label: outputListAfterSearch[0].roNo };
                    this.setState({
                        originalQty: 0,
                        outputListAfterSearch,
                        selectedShipment: [],
                        roNoOrderNo: json,
                        searchedValue: outputListAfterSearch[0].roNo,
                        roPrimeLineNoForTab3: outputListAfterSearch[0].roPrimeLineNo,
                    }, () => {
                        this.filterProgramByCountry();
                    });
                } else {
                    this.setState({
                        loading: false
                    })
                }
                if (this.state.active3) {
                    this.setState({
                        planningUnitId: (this.state.active3 ? outputListAfterSearch[0].erpPlanningUnit.id : outputListAfterSearch[0].planningUnit.id),
                        shipmentId: (this.state.active1 ? this.el.getValueFromCoords(0, x) : (this.state.active2 ? this.el.getValueFromCoords(1, x) : 0)),
                        procurementAgentId: (this.state.active3 ? 1 : outputListAfterSearch[0].procurementAgent.id),
                        planningUnitName: (this.state.active3 ? row.erpPlanningUnit.label.label_en + "(" + row.skuCode + ")" : row.planningUnit.label.label_en + '(' + row.skuCode + ')')
                    })
                    this.toggleLarge();
                }
            }
        }
    }.bind(this);
    /**
     * Retrieves shipments for a specific tab based on the provided order details.
     * @param {number} shipmentId - The ID of the shipment.
     * @param {number} tempShipmentId - The temporary ID of the shipment.
     * @param {string} roNo - The Reference Order Number (RO number) associated with the shipment.
     * @param {string} roPrimeLineNo - The RO Prime Line Number associated with the shipment.
     */
    getShipmentsForTab2 = (shipmentId, tempShipmentId, roNo, roPrimeLineNo) => {
        var linkedShipmentsListForTab2 = this.state.linkedShipmentsListForTab2;
        var filterOnRoNoAndRoPrimeLineNo = linkedShipmentsListForTab2.filter(c => c.roNo.toString().trim() == roNo.toString().trim() && c.roPrimeLineNo.toString().trim() == roPrimeLineNo.toString().trim());
        this.setState({
            artmisList: filterOnRoNoAndRoPrimeLineNo,
            displayButton: false
        }, () => {
            this.buildJExcelERP(true)
        })
    }
    /**
     * Calls getLocalProgramList function on component mount
     */
    componentDidMount() {
        hideFirstComponent();
        this.getLocalProgramList();
    }
    /**
     * Retrieves local program data from IndexedDB and updates component state accordingly.
     * @param {number} parameter - Specifies the action to perform after retrieving the program data. 
     *                             - If `parameter` is 1, it triggers the `filterErpData` function.
     *                             - Otherwise, it triggers the `getProgramList` function.
     */
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
                    var datasetTransaction2 = db1.transaction(['programQPLDetails'], 'readwrite');
                    var datasetOs2 = datasetTransaction2.objectStore('programQPLDetails');
                    var getRequest2 = datasetOs2.getAll();
                    getRequest2.onsuccess = function (event) {
                        var budgetTransaction2 = db1.transaction(['budget'], 'readwrite');
                        var budgetOs2 = budgetTransaction2.objectStore('budget');
                        var budgetRequest2 = budgetOs2.getAll();
                        budgetRequest2.onsuccess = function (event) {
                            var budgetList = budgetRequest2.result;
                            var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                            var userId = userBytes.toString(CryptoJS.enc.Utf8);
                            var programQPLDetails = getRequest2.result.filter(c => c.userId == userId);
                            var programList = getRequest1.result;
                            var myResult = getRequest.result.filter(c => c.userId == userId);
                            this.setState({
                                localProgramList: myResult,
                                programObjectStoreList: programList,
                                programQPLDetailsList: programQPLDetails,
                                budgetList: budgetList
                            }, () => {
                                if (parameter == 1) {
                                    this.filterErpData();
                                } else {
                                    this.getProgramList();
                                }
                            })
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }
    /**
     * Retrieves planning unit list based on the tracer category of the program.
     * Updates component state with the retrieved data and triggers relevant actions.
     */
    getPlanningUnitListBasedOnTracerCategory() {
        var programId = (this.state.active3 ? this.state.programId1.toString().split("_")[0] : this.state.programId);
        var versionId = this.state.versionId.toString();
        if (programId != -1 && programId != null && programId != "" && (this.state.active3 || ((this.state.active1 || this.state.active2) && versionId != "-1"))) {
            ProgramService.getPlanningUnitByProgramTracerCategory(programId, [this.state.outputListAfterSearch[0].tracerCategoryId])
                .then(response => {
                    if (response.status == 200) {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase(); 
                            var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase(); 
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        listArray = listArray.filter(c => (c.active == true))
                        RealmCountryService.getRealmCountryPlanningUnitByProgramId([programId]).then(response1 => {
                            var rcpuList = [];
                            response1.data.map(c => {
                                rcpuList.push({
                                    name: getLabelText(c.label, this.state.lang),
                                    id: c.realmCountryPlanningUnitId,
                                    multiplier: c.multiplier,
                                    active: c.active,
                                    label: c.label,
                                    planningUnit: c.planningUnit
                                })
                            })
                            if (document.getElementById("planningUnitId1")!=null && listArray.filter(c => c.planningUnit.id == document.getElementById("planningUnitId1").value).length == 0) {
                                document.getElementById("planningUnitId1").value = -1;
                            }
                            this.setState({
                                planningUnitsBasedOnTracerCategory: listArray,
                                realmCountryPlanningUnitList: rcpuList
                            }, () => {
                                if (this.state.active3) {
                                    this.displayShipmentData();
                                }
                                this.getNotLinkedShipments();
                                if (!this.state.active3) {
                                    this.getPlanningUnitArray();
                                } else {
                                    this.setState({
                                        loading: false
                                    })
                                }
                            })
                        })
                    }
                    else {
                        this.setState({
                            message: response.data.messageCode,
                            loading: false,
                            color: '#BA0C2F'
                        },
                            () => {
                                hideSecondComponent();
                            })
                    }
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                loading: false
                            }, () => {
                                hideSecondComponent()
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
                                        hideSecondComponent()
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false
                                    }, () => {
                                        hideSecondComponent()
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false
                                    }, () => {
                                        hideSecondComponent()
                                    });
                                    break;
                            }
                        }
                    }
                );
        } else {
            this.setState({
                outputList: [],
                loading: false
            }, () => {
                try {
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                } catch (e) {
                }
            })
        }
    }
    /**
     * Reterives planning unit list based on program Id
     */
    getPlanningUnitList() {
        var programId = (this.state.active3 ? this.state.programId1.toString().split("_")[0] : this.state.programId);
        var versionId = this.state.versionId.toString();
        if (programId != -1 && programId != null && programId != "" && (this.state.active3 || ((this.state.active1 || this.state.active2) && versionId != "-1"))) {
            ProgramService.getProgramPlaningUnitListByProgramId(programId)
                .then(response => {
                    if (response.status == 200) {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase(); 
                            var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase(); 
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        listArray = listArray.filter(c => (c.active == true))
                        this.setState({
                            planningUnits: listArray
                        }, () => {
                            if (!this.state.active3) {
                                this.getPlanningUnitArray();
                            } else {
                                this.setState({
                                    loading: false
                                })
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
                                hideSecondComponent();
                            })
                    }
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                loading: false
                            }, () => {
                                hideSecondComponent()
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
                                        hideSecondComponent()
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false
                                    }, () => {
                                        hideSecondComponent()
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false
                                    }, () => {
                                        hideSecondComponent()
                                    });
                                    break;
                            }
                        }
                    }
                );
        } else {
            this.setState({
                outputList: [],
                loading: false
            }, () => {
                try {
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                } catch (e) {
                }
            })
        }
    }
    /**
     * Formats the label value based on the selected language.
     * If the label value is not provided or empty, returns an empty string.
     * @param {string} cell - The label value to format.
     * @param {object} row - The row object containing the label value.
     * @returns {string} - The formatted label value.
     */
    formatLabel(cell, row) {
        if (cell != null && cell != "") {
            return getLabelText(cell, this.state.lang);
        } else {
            return "";
        }
    }
    /**
     * Formats the planning unit label value based on the selected language.
     * If the label value is not provided or empty, returns an empty string.
     * @param {string} cell - The planning unit label value to format.
     * @param {object} row - The row object containing the planning unit label value and additional data.
     * @returns {string} - The formatted planning unit label value.
     */
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
    /**
     * Toggles the display of the large component.
     * Updates the state to control various UI elements such as submit button, total quantity display, selected row planning unit,
     * Artmis list, reason, total quantity value, result, and manual tagging status.
     * Also, resets the active states for other components.
     */
    toggleLarge() {
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
    /**
     * Formats a number by adding commas as thousand separators.
     * @param {number|string} cell - The number to format.
     * @param {object} row - The row object containing the cell value.
     * @returns {string} The formatted number with commas.
    */
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
    /**
     * Formats a number by adding commas as thousand separators and limits decimal places to four.
     * @param {number|string} cell1 - The number to format.
     * @param {object} row - The row object containing the cell value.
     * @returns {string} The formatted number with commas and up to four decimal places.
     */
    addCommasFourDecimal(cell1, row) {
        if (cell1 != null && cell1 != "") {
            cell1 += '';
            var x = cell1.replaceAll(",", "").split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1].slice(0, 4) : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        } else {
            return "";
        }
    }
    /**
     * Formats a date by converting it to a specified date format and capitalizing the month name.
     * @param {string|Date} cell - The date string or Date object to format.
     * @param {object} row - The row object containing the cell value.
     * @returns {string} The formatted date with the month name capitalized.
     */
    formatDate(cell, row) {
        if (cell != null && cell != "") {
            var date = moment(cell).format(`${STRING_TO_DATE_FORMAT}`);
            var dateMonthAsWord = moment(date).format(`${DATE_FORMAT_CAP}`);
            return dateMonthAsWord.toUpperCase();
        } else {
            return "";
        }
    }
    /**
     * Formats an expiry date by converting it to a specified date format and capitalizing the month name,
     * excluding the date from the formatted string.
     * @param {string|Date} cell - The expiry date string or Date object to format.
     * @param {object} row - The row object containing the cell value.
     * @returns {string} The formatted expiry date with the month name capitalized, excluding the date.
     */
    formatExpiryDate(cell, row) {
        if (cell != null && cell != "") {
            var date = moment(cell).format(`${STRING_TO_DATE_FORMAT}`);
            var dateMonthAsWord = moment(date).format(`${DATE_FORMAT_CAP_WITHOUT_DATE}`);
            return dateMonthAsWord;
        } else {
            return "";
        }
    }
    /**
     * Updates the state to control whether to show all shipments or not, based on the value of the checkbox.
     * If the checkbox is checked, all shipments will be shown; otherwise, only selected shipments will be shown.
     * @param {object} e - The event object containing information about the checkbox status.
     */
    setShowAllShipments(e) {
        this.setState({
            showAllShipments: e.target.checked
        }, () => {
            this.buildJExcelERP(false)
        })
    }
    /**
     * Renders the manual tagging screen.
     * @returns {JSX.Element} - Manual tagging screen.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        const selectRow = {
            mode: 'checkbox',
            clickToSelect: true,
            selectionHeaderRenderer: () => i18n.t('static.mt.selectShipment'),
            headerColumnStyle: {
                headerAlign: 'center'
            },
            onSelect: (row, isSelect, rowIndex, e) => {
                var finalShipmentId = this.state.finalShipmentId;
                if (isSelect) {
                    finalShipmentId.push({ "shipmentId": row.shipmentId, "tempShipmentId": row.shipmentId > 0 ? null : row.tempShipmentId, "index": rowIndex, "qty": row.shipmentQty })
                } else {
                    finalShipmentId = finalShipmentId.filter(c => c.index != rowIndex);
                }
                var qty = 0;
                finalShipmentId.map(c => {
                    qty += Number(c.qty)
                })
                this.setState({
                    originalQty: qty,
                    finalShipmentId: finalShipmentId,
                    tempNotes: (row.notes != null && row.notes != "" ? row.notes : "")
                });
            }
        };
        const { programs } = this.state;
        let programList = programs.length > 0 && programs.map((item, i) => {
            return (
                <option key={i} value={item.programId}>
                    {item.programCode}
                </option>
            )
        }, this);
        const { versionList } = this.state;
        let versions = versionList.length > 0 && versionList.map((item, i) => {
            return (
                <option key={i} value={item.versionId}>
                    {item.versionId}
                </option>
            )
        }, this);
        const { countryWisePrograms } = this.state;
        let filteredProgramList = countryWisePrograms.length > 0 && countryWisePrograms.map((item, i) => {
            return (
                <option key={i} value={item.id}>
                    {item.programCode + "~v" + item.version}
                </option>
            )
        }, this);
        const { planningUnitsBasedOnTracerCategory } = this.state;
        const { planningUnits } = this.state;
        let planningUnitList = planningUnitsBasedOnTracerCategory.length > 0 && planningUnitsBasedOnTracerCategory.map((item, i) => {
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
                dataField: 'procurementAgent.code',
                text: i18n.t('static.report.procurementAgentName'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '30px' }
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
                dataField: 'realmCountryPlanningUnit.label',
                text: i18n.t('static.supplyPlan.alternatePlanningUnit'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '20px' },
                formatter: this.formatPlanningUnitLabel
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
            },
            {
                dataField: 'shipmentRcpuQty',
                text: i18n.t('static.manualTagging.aruQty'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas,
                style: { width: '25px' }
            },
            {
                dataField: 'realmCountryPlanningUnit.multiplier',
                text: i18n.t('static.manualTagging.conversionARUToPU'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommasFourDecimal,
                style: { width: '25px' }
            },
            {
                dataField: 'shipmentQty',
                text: i18n.t('static.manualTagging.qtyPU'),
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
            }
        ];
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
                <Card>
                    <div className="Card-header-reporticon">
                        <div className="card-header-actions">
                            <a className="card-header-action">
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.toggleDetailsModal() }}><small className="supplyplanformulas">{i18n.t('static.mt.showDetails')}</small></span>
                            </a>
                        </div>
                    </div>
                    <CardBody className="pb-lg-5" >
                        <div style={{ display: this.state.loading ? "none" : "block" }}>
                            <b><div className="col-md-11 pl-3" style={{ 'marginLeft': '-15px', 'marginTop': '-13px' }}> <span style={{ 'color': '#002f6c', 'fontSize': '13px' }}>{i18n.t('static.mt.manualTaggingNotePart1')}<a href="#/program/downloadProgram" target="_blank">{i18n.t('static.mt.manualTaggingNotePart2')}</a>{i18n.t('static.mt.manualTaggingNotePart3')}</span></div></b><br />
                            <div className="col-md-12 pl-0">
                                <Row>
                                    <FormGroup className="pl-3">
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
                            <div className="col-md-12 pl-0">
                                <Row>
                                    {this.state.active3 &&
                                        <>
                                            <FormGroup className="col-md-3 ZindexFeild">
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
                                            <FormGroup className="col-md-3 ZindexFeild">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.productcategory')}</Label>
                                                <div className="controls ">
                                                    <MultiSelect
                                                        name="productCategoryId"
                                                        id="productCategoryId"
                                                        bsSize="sm"
                                                        value={this.state.productCategoryValues}
                                                        onChange={(e) => { this.handleProductCategoryChange(e) }}
                                                        options={productCategoryMultList && productCategoryMultList.length > 0 ? productCategoryMultList : []}
                                                        overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                                        selectSomeItems: i18n.t('static.common.select')}}
                                                    />
                                                </div>
                                            </FormGroup>
                                        </>}
                                    {(this.state.active1 || this.state.active2) &&
                                        <FormGroup className="col-md-3 ZindexFeild">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.inventory.program')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="programId"
                                                        id="programId"
                                                        bsSize="sm"
                                                        value={this.state.programId}
                                                        onChange={(e) => { this.programChange(e); }}
                                                    >
                                                        <option value="-1">{i18n.t('static.common.select')}</option>
                                                        {programList}
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>}
                                    {(this.state.active1 || this.state.active2) &&
                                        <FormGroup className="col-md-3 ZindexFeild">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.version')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="versionId"
                                                        id="versionId"
                                                        bsSize="sm"
                                                        value={this.state.versionId}
                                                        onChange={(e) => { this.versionChange(e); }}
                                                    >
                                                        <option value="-1">{i18n.t('static.common.select')}</option>
                                                        {versions}
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>}
                                    {this.state.active3 &&
                                        <FormGroup className="col-md-3 ZindexFeild">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.procurementUnit.planningUnit')}</Label>
                                            <div className="controls ">
                                                <MultiSelect
                                                    name="planningUnitId2"
                                                    id="planningUnitId2"
                                                    bsSize="sm"
                                                    value={this.state.planningUnitValues}
                                                    onChange={(e) => { this.handlePlanningUnitChange(e) }}
                                                    options={planningUnitMultiList1 && planningUnitMultiList1.length > 0 ? planningUnitMultiList1 : []}
                                                    overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                                        selectSomeItems: i18n.t('static.common.select')}}
                                                />
                                            </div>
                                        </FormGroup>}
                                    {(this.state.active1 || this.state.active2) &&
                                        <FormGroup className="col-md-3 ZindexFeild">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.procurementUnit.planningUnit')}</Label>
                                            <div className="controls ">
                                                <MultiSelect
                                                    name="planningUnitId"
                                                    id="planningUnitId"
                                                    bsSize="sm"
                                                    value={this.state.hasSelectAll ? planningUnitMultiList : this.state.planningUnitValues}
                                                    onChange={(e) => { this.filterData(e) }}
                                                    options={planningUnitMultiList && planningUnitMultiList.length > 0 ? planningUnitMultiList : []}
                                                    labelledBy={i18n.t('static.common.select')}
                                                    overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                                        selectSomeItems: i18n.t('static.common.select')}}
                                                />
                                            </div>
                                        </FormGroup>}
                                </Row>
                                <div className="ReportSearchMarginTop">
                                    <div id="tableDiv" style={{ width: '100%' }} className={!this.state.active2 ? "jexcelremoveReadonlybackground RowClickable" : "RowClickable"}>
                                    </div>
                                </div>
                            </div>
                            <Modal isOpen={this.state.manualTag}
                                className={'modal-lg modalWidth ' + this.props.className}>
                                <div style={{ display: this.state.loading1 ? "none" : "block" }}>
                                    <ModalHeader className="modalHeaderSupplyPlan hideCross">
                                        <strong>{i18n.t('static.manualTagging.searchErpOrders')}</strong>
                                        <strong>{this.state.duplicateOrderNo && 'Already Linked'}</strong>
                                        <Button size="md" color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1" onClick={() => this.cancelClicked()} disabled={(this.state.table1Loader ? false : true)}> <i className="fa fa-times"></i></Button>
                                    </ModalHeader>
                                    <ModalBody>
                                        <div>
                                            {!this.state.active3 && !this.state.active2 &&
                                                <div className="d-flex">
                                                    <div className="mr-4"><h5><b>{i18n.t('static.manualTagging.qatShipmentTitle')}</b></h5></div>
                                                    <div className={"check inline pl-lg-3"}>
                                                        <div className="">
                                                            <Input
                                                                style={{ width: '14px', height: '14px', marginTop: '1px' }}
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id="showAllShipments"
                                                                name="showAllShipments"
                                                                checked={this.state.showAllShipments}
                                                                onClick={(e) => { this.setShowAllShipments(e); }}
                                                            />
                                                            <span><h5><b>{(i18n.t('static.manualTagging.showAllShipments')) + " " + this.state.selectedRowPlanningUnitLabel}</b></h5></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                            {!this.state.active3 && !this.state.active2 &&
                                                <div id="tab1" className={"jexcelremoveReadonlybackground blackText"}>
                                                </div>
                                            }
                                            {this.state.active3 &&
                                                <>
                                                    <div className="col-md-12">
                                                        <Row>
                                                            <FormGroup className="pl-3">
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
                                                                                onChange={this.displayShipmentData}
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
                                                                    options={this.state.tracercategoryPlanningUnit}
                                                                    getOptionLabel={(option) => option.label}
                                                                    style={{ width: 450, backgroundColor: this.state.active3 ? "#cfcdc9" : "transparent" }}
                                                                    disabled={this.state.active3 ? true : false}
                                                                    onChange={(event, value) => {
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
                                                                    }} 
                                                                    renderInput={(params) => <TextField
                                                                        {...params}
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
                                                                    defaultValue={this.state.roNoOrderNo}
                                                                    options={this.state.autocompleteData}
                                                                    getOptionLabel={(option) => option.label}
                                                                    disabled={this.state.active3 ? true : false}
                                                                    style={{ width: 450, backgroundColor: this.state.active3 ? "#cfcdc9" : "transparent" }}
                                                                    onChange={(event, value) => {
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
                                                                    }} 
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
                            <Modal isOpen={this.state.artmisHistoryModal}
                                className={'modal-lg modalWidth ' + this.props.className}>
                                <div>
                                    <ModalHeader className="modalHeaderSupplyPlan hideCross">
                                        <strong>{i18n.t('static.mt.erpHistoryTitle')}</strong>
                                        <Button size="md" color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1" onClick={() => this.toggleArtmisHistoryModal()}> <i className="fa fa-times"></i></Button>
                                    </ModalHeader>
                                    <ModalBody>
                                        <div>
                                            <span><b>{i18n.t('static.manualTagging.orderDetails')}</b></span><br />
                                            <span><b>Bold - Latest record received from ERP system</b></span>
                                            <br />
                                            <br />
                                            <div className='consumptionDataEntryTable'>
                                                <div id="tableDivOrderDetails" className={"jexcelremoveReadonlybackground"}>
                                                </div>
                                            </div>
                                            <br />
                                            <span><b>{i18n.t('static.supplyPlan.shipmentsDetails')}</b></span>
                                            <br />
                                            <br />
                                            <div className='consumptionDataEntryTable'>
                                                <div id="tableDivShipmentDetails" className={"jexcelremoveReadonlybackground"}>
                                                </div>
                                            </div>
                                        </div><br />
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.toggleArtmisHistoryModal()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                    </ModalFooter>
                                </div>
                            </Modal>
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
                    </CardBody>
                    {this.state.active2 && <CardFooter>
                        {this.state.changedDataForTab2 && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.delink}> <i className="fa fa-check"></i>{(this.state.active2 ? i18n.t('static.common.update') : i18n.t('static.manualTagging.link'))}</Button>}
                    </CardFooter>}
                </Card>
            </div>
        );
    }
}