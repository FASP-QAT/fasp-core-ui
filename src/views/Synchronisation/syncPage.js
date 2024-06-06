import CryptoJS from 'crypto-js';
import { Formik } from 'formik';
import jexcel from 'jspreadsheet';
import moment from "moment";
import React, { Component } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import { ProgressBar, Step } from "react-step-progress-bar";
import {
  Button,
  Card, CardBody,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  InputGroup,
  Label,
  Modal, ModalBody, ModalFooter, ModalHeader,
  Nav, NavItem, NavLink,
  Row,
  TabContent, TabPane
} from 'reactstrap';
import * as Yup from 'yup';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import "../../../node_modules/react-step-progress-bar/styles.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js';
import { decompressJson, isCompress } from '../../CommonComponent/JavascriptCommonFunctions';
import QatProblemActionNew from '../../CommonComponent/QatProblemActionNew';
import getLabelText from '../../CommonComponent/getLabelText';
import getProblemDesc from '../../CommonComponent/getProblemDesc';
import getSuggestion from '../../CommonComponent/getSuggestion';
import { ACTUAL_CONSUMPTION_MODIFIED, ADJUSTMENT_MODIFIED, API_URL, DATE_FORMAT_CAP, DATE_FORMAT_CAP_WITHOUT_DATE, FINAL_VERSION_TYPE, FORECASTED_CONSUMPTION_MODIFIED, INDEXED_DB_NAME, INDEXED_DB_VERSION, INVENTORY_MODIFIED, JEXCEL_DATE_FORMAT_SM, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, LATEST_VERSION_COLOUR, LOCAL_VERSION_COLOUR, OPEN_PROBLEM_STATUS_ID, PENDING_APPROVAL_VERSION_STATUS, PROBLEM_STATUS_IN_COMPLIANCE, SECRET_KEY, SHIPMENT_MODIFIED, NO_REVIEW_NEEDED_VERSION_STATUS } from '../../Constants.js';
import ProgramService from '../../api/ProgramService';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
// Localized entity name
const entityname = i18n.t('static.dashboard.commitVersion')
// Initial values for form fields
const initialValues = {
  notes: ''
}
/**
 * Defines the validation schema for commit details.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values, t) {
  return Yup.object().shape({
    notes: Yup.string()
      .matches(/^([a-zA-Z0-9\s,\./<>\?;':""[\]\\{}\|`~!@#\$%\^&\*()-_=\+]*)$/, i18n.t("static.label.validData"))
  })
}
/**
 * This component is used to allow users to commit(push) the local changes on to the server
 */
export default class syncPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      programList: [],
      activeTab: new Array(3).fill('1'),
      lang: localStorage.getItem('lang'),
      versionTypeList: [],
      isChanged: false,
      conflictsCount: 0,
      loading: true,
      versionType: 1,
      openCount: 0,
      progressPer: 0,
      notes: '',
      deletedRowsListLocal: [],
      deletedRowsListServer: [],
      shipmentAlreadyLinkedToOtherProgCount: 0,
      conflictsCountErp: 0,
      shipmentIdsToBeActivated: [],
      conflictsCountConsumption: 0,
      conflictsCountInventory: 0,
      conflictsCountShipment: 0,
      conflictsCountQPL: 0
    }
    this.toggle = this.toggle.bind(this);
    this.getDataForCompare = this.getDataForCompare.bind(this);
    this.cancelClicked = this.cancelClicked.bind(this);
    this.toggleLarge = this.toggleLarge.bind(this);
    this.showConsumptionData = this.showConsumptionData.bind(this);
    this.acceptCurrentChanges = this.acceptCurrentChanges.bind(this);
    this.acceptIncomingChanges = this.acceptIncomingChanges.bind(this);
    this.toggleLargeInventory = this.toggleLargeInventory.bind(this);
    this.showInventoryData = this.showInventoryData.bind(this);
    this.acceptCurrentChangesInventory = this.acceptCurrentChangesInventory.bind(this);
    this.acceptIncomingChangesInventory = this.acceptIncomingChangesInventory.bind(this);
    this.toggleLargeShipment = this.toggleLargeShipment.bind(this);
    this.showShipmentData = this.showShipmentData.bind(this);
    this.acceptCurrentChangesShipment = this.acceptCurrentChangesShipment.bind(this);
    this.acceptIncomingChangesShipment = this.acceptIncomingChangesShipment.bind(this);
    this.toggleLargeProblem = this.toggleLargeProblem.bind(this);
    this.showProblemData = this.showProblemData.bind(this);
    this.acceptCurrentChangesProblem = this.acceptCurrentChangesProblem.bind(this);
    this.acceptIncomingChangesProblem = this.acceptIncomingChangesProblem.bind(this);
    this.loadedFunctionForMerge = this.loadedFunctionForMerge.bind(this);
    this.loadedFunctionForMergeInventory = this.loadedFunctionForMergeInventory.bind(this)
    this.loadedFunctionForMergeShipment = this.loadedFunctionForMergeShipment.bind(this)
    this.loadedFunctionForMergeProblemList = this.loadedFunctionForMergeProblemList.bind(this);
    this.loadedFunctionForMergeShipmentLinked = this.loadedFunctionForMergeShipmentLinked.bind(this)
    this.recursiveConflictsForShipmentLinking = this.recursiveConflictsForShipmentLinking.bind(this)
    this.synchronize = this.synchronize.bind(this);
    this.updateState = this.updateState.bind(this);
    this.hideFirstComponent = this.hideFirstComponent.bind(this);
    this.hideSecondComponent = this.hideSecondComponent.bind(this);
    this.fetchData = this.fetchData.bind(this)
    this.versionTypeChanged = this.versionTypeChanged.bind(this);
    this.generateDataAfterResolveConflictsForQPL = this.generateDataAfterResolveConflictsForQPL.bind(this);
    this.notesChange = this.notesChange.bind(this);
    this.checkLastModifiedDateForProgram = this.checkLastModifiedDateForProgram.bind(this)
  }
  /**
   * This function is called on notes change to update the notes in state
   * @param {*} event This is the on change event
   */
  notesChange(event) {
    this.setState({
      notes: event.target.value
    })
  }
  /**
   * This function is called on version type change to update the notes in state
   * @param {*} event This is the on change event
   */
  versionTypeChanged(event) {
    this.setState({
      versionType: event.target.value
    })
  }
  /**
   * This function is used to hide the messages that are there in div1 after 30 seconds
   */
  hideFirstComponent() {
    document.getElementById('div1').style.display = 'block';
    this.state.timeout = setTimeout(function () {
      document.getElementById('div1').style.display = 'none';
    }, 30000);
  }
  /**
   * This function is used to hide the messages that are there in div2 after 30 seconds
   */
  hideSecondComponent() {
    document.getElementById('div2').style.display = 'block';
    this.state.timeout = setTimeout(function () {
      document.getElementById('div2').style.display = 'none';
    }, 30000);
  }
  /**
   * This function is called when component is about to change to clear the timeout
   */
  componentWillUnmount() {
    clearTimeout(this.timeout);
  }
  /**
   * This function is used to toggle the tab
   * @param {*} tabPane
   * @param {*} tab This is the value of the tab selected by the user
   */
  toggle(tabPane, tab) {
    const newArray = this.state.activeTab.slice()
    newArray[tabPane] = tab
    this.setState({
      activeTab: newArray,
    });
  }
  /**
   * This function is called to toggle the conflict resolution screen for consumption
   * @param {*} oldData This is the local data for the consumption record
   * @param {*} latestData This is the latest data for the consumption record
   * @param {*} index This is the index for the consumption record
   * @param {*} page This is the page from which the toggle is called
   */
  toggleLarge(oldData, latestData, index, page) {
    this.setState({
      conflicts: !this.state.conflicts
    });
    if (oldData != "") {
      this.showConsumptionData(oldData, latestData, index);
    }
  }
  /**
   * This function is called to toggle the conflict resolution screen for inventory
   * @param {*} oldData This is the local data for the inventory record
   * @param {*} latestData This is the latest data for the inventory record
   * @param {*} index This is the index for the inventory record
   * @param {*} page This is the page from which the toggle is called
   */
  toggleLargeInventory(oldData, latestData, index, page) {
    this.setState({
      conflictsInventory: !this.state.conflictsInventory
    });
    if (oldData != "") {
      this.showInventoryData(oldData, latestData, index);
    }
  }
  /**
   * This function is called to toggle the conflict resolution screen for shipment
   * @param {*} oldData This is the local data for the shipment record
   * @param {*} latestData This is the latest data for the shipment record
   * @param {*} index This is the index for the shipment record
   * @param {*} page This is the page from which the toggle is called
   */
  toggleLargeShipment(oldData, latestData, index, page) {
    this.setState({
      conflictsShipment: !this.state.conflictsShipment
    });
    if (oldData != "") {
      this.showShipmentData(oldData, latestData, index);
    }
  }
  /**
   * This function is called to toggle the conflict resolution screen for problem list
   * @param {*} oldData This is the local data for the problem list record
   * @param {*} latestData This is the latest data for the problem list record
   * @param {*} index This is the index for the problem list record
   * @param {*} page This is the page from which the toggle is called
   */
  toggleLargeProblem(oldData, latestData, index, page) {
    this.setState({
      conflictsProblem: !this.state.conflictsProblem
    });
    if (oldData != "") {
      this.showProblemData(oldData, latestData, index);
    }
  }
  /**
   * This function is used to display the jexcel table for consumption conflict resolution
   * @param {*} oldData This is the local data for the consumption record
   * @param {*} latestData This is the latest server data for the consumption record
   * @param {*} index This is the index for the consumption record
   */
  showConsumptionData(oldData, latestData, index) {
    var data = [];
    data.push(oldData);
    data.push(latestData);
    var options = {
      data: data,
      columns: [
        { title: i18n.t('static.commit.consumptionId'), type: 'hidden', },
        { title: i18n.t('static.planningunit.planningunit'), type: 'dropdown', source: this.state.planningUnitList, width: 200 },
        { title: i18n.t('static.pipeline.consumptionDate'), type: 'text', width: 90 },
        { title: i18n.t('static.region.region'), type: 'dropdown', source: this.state.regionList, width: 100 },
        { title: i18n.t('static.inventory.dataSource'), type: 'dropdown', source: this.state.dataSourceList, width: 100 },
        { title: i18n.t('static.supplyPlan.alternatePlanningUnit'), type: 'dropdown', source: this.state.realmCountryPlanningUnitList, width: 150 },
        { title: i18n.t('static.supplyPlan.quantityCountryProduct'), type: 'numeric', mask: '#,##', width: 80 },
        { title: i18n.t('static.unit.multiplier'), type: 'numeric', mask: '#,##.000000', decimal: '.', width: 80 },
        { title: i18n.t('static.supplyPlan.quantityQATProduct'), type: 'numeric', mask: '#,##', width: 80 },
        { title: i18n.t('static.consumption.daysofstockout'), type: 'numeric', mask: '#,##', width: 80 },
        { title: i18n.t('static.program.notes'), type: 'text', width: 200 },
        { type: 'dropdown', title: i18n.t('static.consumption.consumptionType'), source: [{ id: 1, name: i18n.t('static.consumption.actual') }, { id: 2, name: i18n.t('static.consumption.forcast') }], width: 100 },
        { title: i18n.t('static.inventory.active'), type: 'checkbox', width: 70 },
        { type: 'hidden', title: i18n.t('static.supplyPlan.batchInfo'), width: 0 },
        { type: 'text', title: i18n.t('static.supplyPlan.batchInfo'), width: 80 },
        { type: 'hidden', title: 'Old data' },
        { type: 'hidden', title: 'latest data' },
        { type: 'hidden', title: 'downloaded data' },
        { type: 'hidden', title: 'result of compare' },
      ],
      pagination: false,
      search: false,
      filters: false,
      license: JEXCEL_PRO_KEY,
      contextMenu: function (obj, x, y, e) {
        return false;
      }.bind(this),
      columnSorting: false,
      wordWrap: true,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      onload: this.loadedResolveConflicts
    };
    var resolveConflict = jexcel(document.getElementById("resolveConflictsTable"), options);
    this.el = resolveConflict;
    this.setState({
      resolveConflict: resolveConflict,
      loading: false
    })
    document.getElementById("index").value = index;
  }
  /**
   * This function is used to format the table like add asterisk or info to the table headers
   * @param {*} instance This is the DOM Element where sheet is created
   */
  loadedResolveConflicts = function (instance) {
    let target = document.getElementById('resolveConflictsTable');
    target.classList.add("removeOddColor")
    jExcelLoadedFunctionOnlyHideRow(instance);
    var elInstance = instance.worksheets[0];
    elInstance.options.editable = true;
    var jsonData = elInstance.getJson();
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R']
    for (var j = 1; j < 13; j++) {
      var col = (colArr[j]).concat(1);
      var col1 = (colArr[j]).concat(2);
      var valueToCompare = (jsonData[0])[j];
      var valueToCompareWith = (jsonData[1])[j];
      if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
        elInstance.setStyle(col, "background-color", "transparent");
        elInstance.setStyle(col1, "background-color", "transparent");
      } else {
        elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
        elInstance.setStyle(col1, "background-color", LATEST_VERSION_COLOUR);
      }
    }
    var col = (colArr[14]).concat(1);
    var col1 = (colArr[14]).concat(2);
    var valueToCompare = (jsonData[0])[13];
    var valueToCompareWith = (jsonData[1])[13];
    if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
      elInstance.setStyle(col, "background-color", "transparent");
      elInstance.setStyle(col1, "background-color", "transparent");
    } else {
      elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
      elInstance.setStyle(col1, "background-color", LATEST_VERSION_COLOUR);
    }
    elInstance.options.editable = false;
  }
  /**
   * This function is called when user clicks on accept local changes from conflict resolution screen for consumption record
   */
  acceptCurrentChanges() {
    this.setState({ loading: true });
    var resolveConflictsInstance = this.state.resolveConflict;
    var consumptionInstance = this.state.mergedConsumptionJexcel;
    var index = document.getElementById("index").value;
    consumptionInstance.options.editable = true;
    consumptionInstance.setRowData(index, resolveConflictsInstance.getRowData(0));
    var jsonData = resolveConflictsInstance.getJson();
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R']
    for (var j = 0; j < 13; j++) {
      var col = (colArr[j]).concat(parseInt(index) + 1);
      var valueToCompare = (jsonData[0])[j];
      var valueToCompareWith = (jsonData[1])[j];
      if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
        consumptionInstance.setStyle(col, "background-color", "transparent");
      } else {
        consumptionInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
        consumptionInstance.setValueFromCoords(18, index, 2, true);
      }
    }
    var col = (colArr[14]).concat(parseInt(index) + 1);
    var valueToCompare = (jsonData[0])[13];
    var valueToCompareWith = (jsonData[1])[13];
    if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
      consumptionInstance.setStyle(col, "background-color", "transparent");
    } else {
      consumptionInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
      consumptionInstance.setValueFromCoords(18, index, 2, true);
    }
    this.setState({
      conflictsCount: this.state.conflictsCount - 1,
      conflictsCountConsumption: this.state.conflictsCountConsumption - 1
    }, () => {
      if (this.state.conflictsCount == 0) {
        this.generateDataAfterResolveConflictsForQPL();
      }
    })
    consumptionInstance.orderBy(18, 0);
    consumptionInstance.options.editable = false;
    this.toggleLarge('', '', 0, '');
    this.setState({ loading: false })
  }
  /**
   * This function is called when user clicks on accept latest server changes from conflict resolution screen for consumption record
   */
  acceptIncomingChanges() {
    this.setState({ loading: true })
    var resolveConflictsInstance = this.state.resolveConflict;
    var consumptionInstance = this.state.mergedConsumptionJexcel;
    var index = document.getElementById("index").value;
    consumptionInstance.options.editable = true;
    consumptionInstance.setRowData(index, resolveConflictsInstance.getRowData(1));
    var jsonData = resolveConflictsInstance.getJson();
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R']
    for (var j = 0; j < 13; j++) {
      var col = (colArr[j]).concat(parseInt(index) + 1);
      var valueToCompare = (jsonData[0])[j];
      var valueToCompareWith = (jsonData[1])[j];
      if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
        consumptionInstance.setStyle(col, "background-color", "transparent");
      } else {
        consumptionInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
        consumptionInstance.setValueFromCoords(18, (index), 3, true);
      }
    }
    var col = (colArr[14]).concat(parseInt(index) + 1);
    var valueToCompare = (jsonData[0])[13];
    var valueToCompareWith = (jsonData[1])[13];
    if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
      consumptionInstance.setStyle(col, "background-color", "transparent");
    } else {
      consumptionInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
      consumptionInstance.setValueFromCoords(18, (index), 3, true);
    }
    consumptionInstance.orderBy(18, 0);
    consumptionInstance.options.editable = false;
    this.setState({
      conflictsCount: this.state.conflictsCount - 1,
      conflictsCountConsumption: this.state.conflictsCountConsumption - 1
    }, () => {
      if (this.state.conflictsCount == 0) {
        this.generateDataAfterResolveConflictsForQPL();
      }
    })
    this.toggleLarge('', '', 0, '');
    this.setState({ loading: false })
  }
  /**
   * This function is used to display the jexcel table for inventory conflict resolution
   * @param {*} oldData This is the local data for the inventory record
   * @param {*} latestData This is the latest server data for the inventory record
   * @param {*} index This is the index for the inventory record
   */
  showInventoryData(oldData, latestData, index) {
    var data = [];
    data.push(oldData);
    data.push(latestData);
    var options = {
      data: data,
      columns: [
        { title: i18n.t('static.commit.inventoryId'), type: 'hidden', },
        { title: i18n.t('static.planningunit.planningunit'), type: 'dropdown', source: this.state.planningUnitList, width: 200 },
        { title: i18n.t('static.inventory.inventoryDate'), type: 'text', width: 85 },
        { title: i18n.t('static.region.region'), type: 'dropdown', source: this.state.regionList, width: 100 },
        { title: i18n.t('static.inventory.dataSource'), type: 'dropdown', source: this.state.dataSourceList, width: 100 },
        { title: i18n.t('static.supplyPlan.alternatePlanningUnit'), type: 'dropdown', source: this.state.realmCountryPlanningUnitList, width: 150 },
        { title: i18n.t('static.supplyPlan.inventoryType'), type: 'dropdown', source: [{ id: 1, name: i18n.t('static.inventory.inventory') }, { id: 2, name: i18n.t('static.inventoryType.adjustment') }], width: 100 },
        { title: i18n.t('static.inventory.adjustmentQunatity'), type: 'numeric', mask: '[-]#,##', width: 120 },
        { title: i18n.t('static.inventory.inventoryQunatity'), type: 'numeric', mask: '#,##', width: 120 },
        { title: i18n.t('static.unit.multiplier'), type: 'numeric', mask: '#,##.000000', decimal: '.', width: 80, },
        { title: i18n.t('static.inventory.adjustmentQunatityPU'), type: 'numeric', mask: '[-]#,##', width: 120, },
        { title: i18n.t('static.inventory.inventoryQunatityPU'), type: 'numeric', mask: '#,##', width: 120, },
        { title: i18n.t('static.program.notes'), type: 'text', width: 200 },
        { title: i18n.t('static.inventory.active'), type: 'checkbox', width: 70 },
        { type: 'hidden', title: i18n.t('static.supplyPlan.batchInfo'), width: 0 },
        { type: 'text', title: i18n.t('static.supplyPlan.batchInfo'), width: 70 },
        { type: 'hidden', title: 'Old data' },
        { type: 'hidden', title: 'latest data' },
        { type: 'hidden', title: 'downloaded data' },
        { type: 'hidden', title: 'result of compare' },
      ],
      pagination: false,
      search: false,
      columnSorting: false,
      wordWrap: true,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      filters: false,
      license: JEXCEL_PRO_KEY,
      contextMenu: function (obj, x, y, e) {
        return false;
      }.bind(this),
      onload: this.loadedResolveConflictsInventory
    };
    var resolveConflictInventory = jexcel(document.getElementById("resolveConflictsInventoryTable"), options);
    this.el = resolveConflictInventory;
    this.setState({
      resolveConflictInventory: resolveConflictInventory,
      loading: false
    })
    document.getElementById("indexInventory").value = index;
  }
  /**
   * This function is used to format the table like add asterisk or info to the table headers
   * @param {*} instance This is the DOM Element where sheet is created
   */
  loadedResolveConflictsInventory = function (instance) {
    let target = document.getElementById('resolveConflictsInventoryTable');
    target.classList.add("removeOddColor")
    jExcelLoadedFunctionOnlyHideRow(instance);
    var elInstance = instance.worksheets[0];
    elInstance.options.editable = true;
    var jsonData = elInstance.getJson();
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S']
    for (var j = 1; j < 14; j++) {
      var col = (colArr[j]).concat(1);
      var col1 = (colArr[j]).concat(2);
      var valueToCompare = (jsonData[0])[j];
      var valueToCompareWith = (jsonData[1])[j];
      if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
        elInstance.setStyle(col, "background-color", "transparent");
        elInstance.setStyle(col1, "background-color", "transparent");
      } else {
        elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
        elInstance.setStyle(col1, "background-color", LATEST_VERSION_COLOUR);
      }
    }
    var col = (colArr[15]).concat(1);
    var col1 = (colArr[15]).concat(2);
    var valueToCompare = (jsonData[0])[14];
    var valueToCompareWith = (jsonData[1])[14];
    if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
      elInstance.setStyle(col, "background-color", "transparent");
      elInstance.setStyle(col1, "background-color", "transparent");
    } else {
      elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
      elInstance.setStyle(col1, "background-color", LATEST_VERSION_COLOUR);
    }
    elInstance.options.editable = false;
  }
  /**
   * This function is called when user clicks on accept local changes from conflict resolution screen for inventory record
   */
  acceptCurrentChangesInventory() {
    this.setState({ loading: true })
    var resolveConflictsInstance = this.state.resolveConflictInventory;
    var inventoryInstance = this.state.mergedInventoryJexcel;
    var index = document.getElementById("indexInventory").value;
    inventoryInstance.options.editable = true;
    inventoryInstance.setRowData(index, resolveConflictsInstance.getRowData(0));
    var jsonData = resolveConflictsInstance.getJson();
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S']
    for (var j = 0; j < 14; j++) {
      var col = (colArr[j]).concat(parseInt(index) + 1);
      var valueToCompare = (jsonData[0])[j];
      var valueToCompareWith = (jsonData[1])[j];
      if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
        inventoryInstance.setStyle(col, "background-color", "transparent");
      } else {
        inventoryInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
        inventoryInstance.setValueFromCoords(19, index, 2, true);
      }
    }
    var col = (colArr[15]).concat(parseInt(index) + 1);
    var valueToCompare = (jsonData[0])[14];
    var valueToCompareWith = (jsonData[1])[14];
    if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
      inventoryInstance.setStyle(col, "background-color", "transparent");
    } else {
      inventoryInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
      inventoryInstance.setValueFromCoords(19, index, 2, true);
    }
    inventoryInstance.orderBy(19, 0);
    inventoryInstance.options.editable = false;
    this.setState({
      conflictsCount: this.state.conflictsCount - 1,
      conflictsCountInventory: this.state.conflictsCountInventory - 1
    }, () => {
      if (this.state.conflictsCount == 0) {
        this.generateDataAfterResolveConflictsForQPL();
      }
    })
    this.toggleLargeInventory('', '', 0, '');
    this.setState({ loading: false })
  }
  /**
   * This function is called when user clicks on accept latest server changes from conflict resolution screen for inventory record
   */
  acceptIncomingChangesInventory() {
    this.setState({ loading: true })
    var resolveConflictsInstance = this.state.resolveConflictInventory;
    var inventoryInstance = this.state.mergedInventoryJexcel;
    var index = document.getElementById("indexInventory").value;
    inventoryInstance.options.editable = true;
    inventoryInstance.setRowData(index, resolveConflictsInstance.getRowData(1));
    var jsonData = resolveConflictsInstance.getJson();
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S']
    for (var j = 0; j < 14; j++) {
      var col = (colArr[j]).concat(parseInt(index) + 1);
      var valueToCompare = (jsonData[0])[j];
      var valueToCompareWith = (jsonData[1])[j];
      if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
        inventoryInstance.setStyle(col, "background-color", "transparent");
      } else {
        inventoryInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
        inventoryInstance.setValueFromCoords(19, (index), 3, true);
      }
    }
    var col = (colArr[15]).concat(parseInt(index) + 1);
    var valueToCompare = (jsonData[0])[14];
    var valueToCompareWith = (jsonData[1])[14];
    if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
      inventoryInstance.setStyle(col, "background-color", "transparent");
    } else {
      inventoryInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
      inventoryInstance.setValueFromCoords(19, (index), 3, true);
    }
    inventoryInstance.orderBy(19, 0);
    inventoryInstance.options.editable = false;
    this.setState({
      conflictsCount: this.state.conflictsCount - 1,
      conflictsCountInventory: this.state.conflictsCountInventory - 1
    }, () => {
      if (this.state.conflictsCount == 0) {
        this.generateDataAfterResolveConflictsForQPL();
      }
    })
    this.toggleLargeInventory('', '', 0, '');
    this.setState({ loading: false })
  }
  /**
   * This function is used to display the jexcel table for shipment conflict resolution
   * @param {*} oldData This is the local data for the shipment record
   * @param {*} latestData This is the latest server data for the shipment record
   * @param {*} index This is the index for the shipment record
   */
  showShipmentData(oldData, latestData, index) {
    var data = [];
    data.push(oldData);
    data.push(latestData);
    var options = {
      data: data,
      columns: [
        { title: i18n.t('static.commit.shipmentId'), type: 'hidden', },
        { title: i18n.t('static.planningunit.planningunit'), type: 'dropdown', source: this.state.planningUnitList, width: 200 },
        { type: 'dropdown', title: i18n.t('static.supplyPlan.shipmentStatus'), source: this.state.shipmentStatusList, width: 100 },
        { type: 'text', title: i18n.t('static.supplyPlan.expectedDeliveryDate'), width: 100, },
        { type: 'dropdown', title: i18n.t('static.procurementagent.procurementagent'), source: this.state.procurementAgentList, width: 120 },
        { type: 'dropdown', title: i18n.t('static.subfundingsource.fundingsource'), source: this.state.fundingSourceList, width: 120 },
        { type: 'dropdown', title: i18n.t('static.dashboard.budget'), source: this.state.budgetList, width: 120 },
        { type: 'text', title: i18n.t('static.supplyPlan.orderNoAndPrimeLineNo'), width: 150 },
        { type: 'dropdown', title: i18n.t('static.datasource.datasource'), source: this.state.dataSourceList, width: 150 },
        { type: 'dropdown', title: i18n.t("static.supplyPlan.shipmentMode"), source: [{ id: 1, name: i18n.t('static.supplyPlan.sea') }, { id: 2, name: i18n.t('static.supplyPlan.air') }, { id: 3, name: i18n.t('static.dataentry.road') }], width: 100 },
        { type: 'dropdown', title: i18n.t('static.supplyPlan.alternatePlanningUnit'), source: this.state.realmCountryPlanningUnitList, width: 150 },
        { type: 'hidden', title: i18n.t("static.shipment.suggestedQty"), width: 100, mask: '#,##' },
        { type: 'numeric', title: i18n.t("static.shipment.shipmentQtyARU"), width: 100, mask: '#,##' },
        { title: i18n.t('static.unit.multiplierFromARUTOPU'), type: 'numeric', mask: '#,##0.00', decimal: '.', width: 90 },
        { title: i18n.t('static.shipment.shipmentQtyPU'), type: 'numeric', mask: '#,##', width: 120 },
        { type: 'dropdown', title: i18n.t('static.dashboard.currency'), source: this.state.currencyList, width: 120 },
        { type: 'numeric', title: i18n.t('static.supplyPlan.pricePerPlanningUnit'), width: 80, mask: '#,##.00', decimal: '.' },
        { type: 'numeric', title: i18n.t('static.shipment.productcost'), width: 80, mask: '#,##.00', decimal: '.' },
        { type: 'numeric', title: i18n.t('static.shipment.freightcost'), width: 80, mask: '#,##.00', decimal: '.' },
        { type: 'text', title: i18n.t('static.supplyPlan.plannedDate'), width: 100, },
        { type: 'text', title: i18n.t('static.supplyPlan.submittedDate'), width: 100, },
        { type: 'text', title: i18n.t('static.supplyPlan.approvedDate'), width: 100, },
        { type: 'text', title: i18n.t('static.supplyPlan.shippedDate'), width: 100, },
        { type: 'text', title: i18n.t('static.supplyPlan.arrivedDate'), width: 100, },
        { type: 'text', title: i18n.t('static.shipment.receiveddate'), width: 100, },
        { type: 'text', title: i18n.t('static.program.notes'), width: 200 },
        { type: 'checkbox', title: i18n.t('static.supplyPlan.erpFlag'), width: 80 },
        { type: 'checkbox', title: i18n.t('static.supplyPlan.emergencyOrder'), width: 80 },
        { type: 'checkbox', title: i18n.t('static.common.accountFlag'), width: 80 },
        { type: 'checkbox', title: i18n.t('static.common.active'), width: 80 },
        { type: 'checkbox', title: i18n.t('static.report.localprocurement'), width: 80 },
        { type: 'hidden', title: i18n.t('static.supplyPlan.batchInfo'), width: 0 },
        { type: 'text', title: i18n.t('static.supplyPlan.batchInfo'), width: 70 },
        { type: 'hidden', title: 'Old data' },
        { type: 'hidden', title: 'latest data' },
        { type: 'hidden', title: 'downloaded data' },
        { type: 'hidden', title: 'result of compare' },
      ],
      pagination: false,
      search: false,
      columnSorting: false,
      wordWrap: true,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      filters: false,
      license: JEXCEL_PRO_KEY,
      contextMenu: function (obj, x, y, e) {
        return false;
      }.bind(this),
      onload: this.loadedResolveConflictsShipment
    };
    var resolveConflictShipment = jexcel(document.getElementById("resolveConflictsShipmentTable"), options);
    this.el = resolveConflictShipment;
    this.setState({
      resolveConflictShipment: resolveConflictShipment,
      loading: false
    })
    document.getElementById("indexShipment").value = index;
  }
  /**
   * This function is used to display the jexcel table for problem list conflict resolution
   * @param {*} oldData This is the local data for the problem list record
   * @param {*} latestData This is the latest server data for the problem list record
   * @param {*} index This is the index for the problem list record
   */
  showProblemData(oldData, latestData, index) {
    var data = [];
    data.push(oldData);
    data.push(latestData);
    var options = {
      data: data,
      colWidths: [50, 10, 10, 50, 10, 100, 10, 50, 180, 180, 50, 100],
      colHeaderClasses: ["Reqasterisk"],
      columns: [
        {
          title: 'problemReportId',
          type: 'hidden',
        },
        {
          title: 'problemActionIndex',
          type: 'hidden',
        },
        {
          title: i18n.t('static.program.programCode'),
          type: 'hidden',
        },
        {
          title: i18n.t('static.program.versionId'),
          type: 'hidden',
        },
        {
          title: i18n.t('static.region.region'),
          type: 'hidden',
        },
        {
          title: i18n.t('static.planningunit.planningunit'),
          type: 'text',
        },
        {
          title: i18n.t('static.report.month'),
          type: 'hidden',
        },
        {
          title: i18n.t('static.report.createdDate'),
          type: 'hide',
        },
        {
          title: i18n.t('static.report.problemDescription'),
          type: 'text',
        },
        {
          title: i18n.t('static.report.suggession'),
          type: 'text',
        },
        {
          title: i18n.t('static.report.problemStatus'),
          type: 'text',
        },
        {
          title: i18n.t('static.program.notes'),
          type: 'text',
        },
        {
          title: i18n.t('static.common.action'),
          type: 'hidden',
        },
        {
          title: 'planningUnitId',
          type: 'hidden',
        },
        {
          title: 'problemId',
          type: 'hidden',
        },
        {
          title: 'actionUrl',
          type: 'hidden',
        },
        {
          title: 'criticalitiId',
          type: 'hidden',
        },
        { type: 'hidden', title: 'Old data' },
        { type: 'hidden', title: 'latest data' },
        { type: 'hidden', title: 'downloaded data' },
        { type: 'hidden', title: 'result of compare' },
      ],
      pagination: false,
      search: false,
      columnSorting: false,
      wordWrap: true,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      filters: false,
      license: JEXCEL_PRO_KEY,
      contextMenu: function (obj, x, y, e) {
        return false;
      }.bind(this),
      onload: this.loadedResolveConflictsProblem
    };
    var resolveConflictProblem = jexcel(document.getElementById("resolveConflictsProblemTable"), options);
    this.el = resolveConflictProblem;
    this.setState({
      resolveConflictProblem: resolveConflictProblem,
      loading: false
    })
    document.getElementById("indexProblem").value = index;
  }
  /**
   * This function is used to format the table like add asterisk or info to the table headers
   * @param {*} instance This is the DOM Element where sheet is created
   */
  loadedResolveConflictsShipment = function (instance) {
    let target = document.getElementById('resolveConflictsShipmentTable');
    target.classList.add("removeOddColor")
    jExcelLoadedFunctionOnlyHideRow(instance);
    var elInstance = instance.worksheets[0];
    elInstance.options.editable = true;
    var jsonData = elInstance.getJson();
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI']
    for (var j = 1; j < 31; j++) {
      var col = (colArr[j]).concat(1);
      var col1 = (colArr[j]).concat(2);
      var valueToCompare = (jsonData[0])[j];
      var valueToCompareWith = (jsonData[1])[j];
      if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
        elInstance.setStyle(col, "background-color", "transparent");
        elInstance.setStyle(col1, "background-color", "transparent");
      } else {
        elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
        elInstance.setStyle(col1, "background-color", LATEST_VERSION_COLOUR);
      }
    }
    var col = (colArr[32]).concat(1);
    var col1 = (colArr[32]).concat(2);
    var valueToCompare = (jsonData[0])[31];
    var valueToCompareWith = (jsonData[1])[31];
    if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
      elInstance.setStyle(col, "background-color", "transparent");
      elInstance.setStyle(col1, "background-color", "transparent");
    } else {
      elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
      elInstance.setStyle(col1, "background-color", LATEST_VERSION_COLOUR);
    }
    elInstance.options.editable = false;
  }
  /**
   * This function is called when user clicks on accept local changes from conflict resolution screen for shipment record
   */
  acceptCurrentChangesShipment() {
    this.setState({ loading: true })
    var resolveConflictsInstance = this.state.resolveConflictShipment;
    var shipmentInstance = this.state.mergedShipmentJexcel;
    var index = document.getElementById("indexShipment").value;
    shipmentInstance.options.editable = true;
    shipmentInstance.setRowData(index, resolveConflictsInstance.getRowData(0));
    var jsonData = resolveConflictsInstance.getJson();
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI']
    for (var j = 0; j < 31; j++) {
      var col = (colArr[j]).concat(parseInt(index) + 1);
      var valueToCompare = (jsonData[0])[j];
      var valueToCompareWith = (jsonData[1])[j];
      if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
        shipmentInstance.setStyle(col, "background-color", "transparent");
      } else {
        shipmentInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
        shipmentInstance.setValueFromCoords(36, index, 2, true);
      }
    }
    var col = (colArr[32]).concat(parseInt(index) + 1);
    var valueToCompare = (jsonData[0])[31];
    var valueToCompareWith = (jsonData[1])[31];
    if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
      shipmentInstance.setStyle(col, "background-color", "transparent");
    } else {
      shipmentInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
      shipmentInstance.setValueFromCoords(36, index, 2, true);
    }
    shipmentInstance.orderBy(36, 0);
    shipmentInstance.options.editable = false;
    this.setState({
      conflictsCount: this.state.conflictsCount - 1,
      conflictsCountShipment: this.state.conflictsCountShipment - 1
    }, () => {
      if (this.state.conflictsCount == 0) {
        this.generateDataAfterResolveConflictsForQPL();
      }
    })
    this.toggleLargeShipment('', '', 0, '');
    this.setState({ loading: false })
  }
  /**
   * This function is called when user clicks on accept latest server changes from conflict resolution screen for shipment record
   */
  acceptIncomingChangesShipment() {
    this.setState({ loading: true })
    var resolveConflictsInstance = this.state.resolveConflictShipment;
    var shipmentInstance = this.state.mergedShipmentJexcel;
    var index = document.getElementById("indexShipment").value;
    shipmentInstance.options.editable = true;
    shipmentInstance.setRowData(index, resolveConflictsInstance.getRowData(1));
    var jsonData = resolveConflictsInstance.getJson();
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI']
    for (var j = 0; j < 31; j++) {
      var col = (colArr[j]).concat(parseInt(index) + 1);
      var valueToCompare = (jsonData[0])[j];
      var valueToCompareWith = (jsonData[1])[j];
      if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
        shipmentInstance.setStyle(col, "background-color", "transparent");
      } else {
        shipmentInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
        shipmentInstance.setValueFromCoords(36, (index), 3, true);
      }
    }
    var col = (colArr[32]).concat(parseInt(index) + 1);
    var valueToCompare = (jsonData[0])[31];
    var valueToCompareWith = (jsonData[1])[31];
    if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
      shipmentInstance.setStyle(col, "background-color", "transparent");
    } else {
      shipmentInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
      shipmentInstance.setValueFromCoords(36, (index), 3, true);
    }
    shipmentInstance.orderBy(36, 0);
    shipmentInstance.options.editable = false;
    this.setState({
      conflictsCount: this.state.conflictsCount - 1,
      conflictsCountShipment: this.state.conflictsCountShipment - 1
    }, () => {
      if (this.state.conflictsCount == 0) {
        this.generateDataAfterResolveConflictsForQPL();
      }
    })
    this.toggleLargeShipment('', '', 0, '');
    this.setState({ loading: false })
  }
  /**
   * This function is used to format the table like add asterisk or info to the table headers
   * @param {*} instance This is the DOM Element where sheet is created
   */
  loadedResolveConflictsProblem = function (instance) {
    let target = document.getElementById('resolveConflictsProblemTable');
    target.classList.add("removeOddColor")
    jExcelLoadedFunctionOnlyHideRow(instance);
    var elInstance = instance.worksheets[0];
    elInstance.options.editable = true;
    var jsonData = elInstance.getJson();
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T']
    for (var j = 0; j < 17; j++) {
      if (j == 10 || j == 8 || j == 9 || j == 11) {
        var col = (colArr[j]).concat(1);
        var col1 = (colArr[j]).concat(2);
        var valueToCompare = (jsonData[0])[j];
        var valueToCompareWith = (jsonData[1])[j];
        if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
          elInstance.setStyle(col, "background-color", "transparent");
          elInstance.setStyle(col1, "background-color", "transparent");
        } else {
          elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
          elInstance.setStyle(col1, "background-color", LATEST_VERSION_COLOUR);
        }
      }
    }
    elInstance.options.editable = false;
  }
  /**
   * This function is called when user clicks on accept local changes from conflict resolution screen for problem record
   */
  acceptCurrentChangesProblem() {
    this.setState({ loading: true })
    var resolveConflictsInstance = this.state.resolveConflictProblem;
    var problemInstance = this.state.mergedProblemListJexcel;
    var index = document.getElementById("indexProblem").value;
    problemInstance.options.editable = true;
    problemInstance.setRowData(index, resolveConflictsInstance.getRowData(0));
    var jsonData = resolveConflictsInstance.getJson();
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T']
    for (var j = 0; j < 17; j++) {
      if (j == 10 || j == 8 || j == 9 || j == 11) {
        var col = (colArr[j]).concat(parseInt(index) + 1);
        var valueToCompare = (jsonData[0])[j];
        var valueToCompareWith = (jsonData[1])[j];
        if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
          problemInstance.setStyle(col, "background-color", "transparent");
        } else {
          problemInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
          problemInstance.setValueFromCoords(20, index, 2, true);
        }
      } else {
        var col = (colArr[j]).concat(parseInt(index) + 1);
        problemInstance.setStyle(col, "background-color", "transparent");
      }
    }
    problemInstance.orderBy(20, 0);
    problemInstance.options.editable = false;
    var json = problemInstance.getJson()
    var openCount = json.filter(c => c[12] == OPEN_PROBLEM_STATUS_ID).length;
    this.setState({
      conflictsCount: this.state.conflictsCount - 1,
      conflictsCountQPL: this.state.conflictsCountQPL - 1,
      openCount: openCount
    }, () => {
      if (this.state.conflictsCount == 0) {
        this.setState({ progressPer: 25, message: i18n.t('static.commitVersion.resolvedConflictsSuccess'), color: 'green' }, () => {
          this.hideFirstComponent();
        })
      }
    })
    this.toggleLargeProblem('', '', 0, '');
    this.setState({ loading: false })
  }
  /**
   * This function is called when user clicks on accept latest server changes from conflict resolution screen for problem record
   */
  acceptIncomingChangesProblem() {
    this.setState({ loading: true })
    var resolveConflictsInstance = this.state.resolveConflictProblem;
    var problemInstance = this.state.mergedProblemListJexcel;
    var index = document.getElementById("indexProblem").value;
    problemInstance.options.editable = true;
    var oldRowData = resolveConflictsInstance.getRowData(0);
    var latestRowData = resolveConflictsInstance.getRowData(1);
    oldRowData[10] = latestRowData[10];
    oldRowData[11] = latestRowData[11];
    oldRowData[12] = latestRowData[12];
    problemInstance.setRowData(index, oldRowData);
    var jsonData = resolveConflictsInstance.getJson();
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T']
    for (var j = 0; j < 17; j++) {
      if (j == 10 || j == 8 || j == 9 || j == 11) {
        var col = (colArr[j]).concat(parseInt(index) + 1);
        var valueToCompare = (jsonData[0])[j];
        var valueToCompareWith = (jsonData[1])[j];
        if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
          problemInstance.setStyle(col, "background-color", "transparent");
        } else {
          problemInstance.setStyle(col, "background-color", "transparent");
          problemInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
          problemInstance.setValueFromCoords(20, (index), 3, true);
        }
      } else {
        var col = (colArr[j]).concat(parseInt(index) + 1);
        problemInstance.setStyle(col, "background-color", "transparent");
      }
    }
    problemInstance.orderBy(20, 0);
    problemInstance.options.editable = false;
    var json = problemInstance.getJson()
    var openCount = json.filter(c => c[12] == OPEN_PROBLEM_STATUS_ID).length;
    this.setState({
      conflictsCount: this.state.conflictsCount - 1,
      conflictsCountQPL: this.state.conflictsCountQPL - 1,
      openCount: openCount
    }, () => {
      if (this.state.conflictsCount == 0) {
        this.setState({ progressPer: 25, message: i18n.t('static.commitVersion.resolvedConflictsSuccess'), color: 'green' }, () => {
          this.hideFirstComponent();
        })
      }
    })
    this.toggleLargeProblem('', '', 0, '');
    this.setState({ loading: false })
  }
  /**
   * This function is called after conflicts for consumption, inventory and shipments are solved to build the QPL based on latest data
   */
  generateDataAfterResolveConflictsForQPL() {
    this.setState({ loading: true });
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
      this.setState({
        supplyPlanError: i18n.t('static.program.errortext')
      })
    }.bind(this);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var programJson = this.state.programRequestProgramJson;
      var actionList = programJson.actionList;
      if (actionList == undefined) {
        actionList = []
      }
      var consumptionData = (this.state.oldProgramDataConsumption).filter(c => c.consumptionId != 0);
      var consumptionJson = (this.state.mergedConsumptionJexcel).getJson();
      var oldProgramDataConsumption = this.state.oldProgramDataConsumption;
      var latestProgramDataConsumption = this.state.latestProgramDataConsumption;
      for (var c = 0; c < consumptionJson.length; c++) {
        if (((consumptionJson[c])[18] == 2 || (consumptionJson[c])[18] == 4) && (consumptionJson[c])[0] != 0) {
        } else if ((consumptionJson[c])[18] == 3 && (consumptionJson[c])[0] != 0) {
          var index = consumptionData.findIndex(p => p.consumptionId == (consumptionJson[c])[0]);
          if (index == -1) {
            consumptionData.push(latestProgramDataConsumption.filter(a => a.consumptionId == (consumptionJson[c])[0])[0]);
          } else {
            consumptionData[index] = latestProgramDataConsumption.filter(a => a.consumptionId == (consumptionJson[c])[0])[0];
          }
        }
      }
      consumptionData = consumptionData.concat(oldProgramDataConsumption.filter(c => c.consumptionId == 0));
      var uniquePlanningUnitsInConsumption = [];
      consumptionJson.map(c => uniquePlanningUnitsInConsumption = uniquePlanningUnitsInConsumption.concat(parseInt(c[1])));
      uniquePlanningUnitsInConsumption.map(c => {
        actionList.push({
          planningUnitId: c,
          type: ACTUAL_CONSUMPTION_MODIFIED,
          date: moment(Date.now()).startOf('month').format("YYYY-MM-DD")
        });
        actionList.push({
          planningUnitId: c,
          type: FORECASTED_CONSUMPTION_MODIFIED,
          date: moment(Date.now()).startOf('month').format("YYYY-MM-DD")
        });
      })
      var inventoryData = (this.state.oldProgramDataInventory).filter(c => c.inventoryId != 0);
      var inventoryJson = (this.state.mergedInventoryJexcel).getJson();
      var oldProgramDataInventory = this.state.oldProgramDataInventory;
      var latestProgramDataInventory = this.state.latestProgramDataInventory;
      for (var c = 0; c < inventoryJson.length; c++) {
        if (((inventoryJson[c])[19] == 2 || (inventoryJson[c])[19] == 4) && (inventoryJson[c])[0] != 0) {
        } else if ((inventoryJson[c])[19] == 3 && (inventoryJson[c])[0] != 0) {
          var index = inventoryData.findIndex(p => p.inventoryId == (inventoryJson[c])[0]);
          if (index == -1) {
            inventoryData.push(latestProgramDataInventory.filter(a => a.inventoryId == (inventoryJson[c])[0])[0]);
          } else {
            inventoryData[index] = latestProgramDataInventory.filter(a => a.inventoryId == (inventoryJson[c])[0])[0];
          }
        }
      }
      inventoryData = inventoryData.concat(oldProgramDataInventory.filter(c => c.inventoryId == 0));
      var uniquePlanningUnitsInInventory = [];
      inventoryJson.map(c => uniquePlanningUnitsInInventory = uniquePlanningUnitsInInventory.concat(parseInt(c[1])));
      uniquePlanningUnitsInInventory.map(c => {
        actionList.push({
          planningUnitId: c,
          type: INVENTORY_MODIFIED,
          date: moment(Date.now()).startOf('month').format("YYYY-MM-DD")
        });
        actionList.push({
          planningUnitId: c,
          type: ADJUSTMENT_MODIFIED,
          date: moment(Date.now()).startOf('month').format("YYYY-MM-DD")
        });
      })
      var shipmentData = (this.state.oldProgramDataShipment).filter(c => c.shipmentId != 0);
      var shipmentJson = (this.state.mergedShipmentJexcel).getJson();
      var oldProgramDataShipment = this.state.oldProgramDataShipment;
      var latestProgramDataShipment = this.state.latestProgramDataShipment;
      for (var c = 0; c < shipmentJson.length; c++) {
        if (((shipmentJson[c])[36] == 2 || (shipmentJson[c])[36] == 4) && (shipmentJson[c])[0] != 0) {
        } else if ((shipmentJson[c])[36] == 3 && (shipmentJson[c])[0] != 0) {
          var index = shipmentData.findIndex(p => p.shipmentId == (shipmentJson[c])[0]);
          if (index == -1) {
            shipmentData.push(latestProgramDataShipment.filter(a => a.shipmentId == (shipmentJson[c])[0])[0]);
          } else {
            shipmentData[index] = latestProgramDataShipment.filter(a => a.shipmentId == (shipmentJson[c])[0])[0];
          }
        }
      }
      shipmentData = shipmentData.concat(oldProgramDataShipment.filter(c => (c.shipmentId == 0 && c.erpFlag == true) || (c.shipmentId == 0 && c.active.toString() == "true")));
      shipmentData.map((item, index) => {
        if (item.erpFlag.toString() == "true") {
          shipmentData[index].active = false;
        }
      })
      var shipmentLinkedJson = this.state.mergedShipmentLinkedJexcel.getJson();
      var linkedShipmentListLocal = this.state.oldShipmentLinkingList;
      var originalShipmentLinkingList = this.state.oldShipmentLinkingList;
      var linkedShipmentListServer = this.state.latestProgramData.shipmentLinkingList != null ? this.state.latestProgramData.shipmentLinkingList : [];
      var listThatIsFiltered = [];
      for (var c = 0; c < shipmentLinkedJson.length; c++) {
        if (shipmentLinkedJson[c][21] == 3) {
          listThatIsFiltered = listThatIsFiltered.concat(linkedShipmentListLocal.filter(d => (d.roNo.toString() + " - " + d.roPrimeLineNo.toString()) == shipmentLinkedJson[c][0]));
          linkedShipmentListLocal = linkedShipmentListLocal.filter(d => (d.roNo.toString() + " - " + d.roPrimeLineNo.toString()) != shipmentLinkedJson[c][0])
          linkedShipmentListLocal = linkedShipmentListLocal.concat(linkedShipmentListServer.filter(d => (d.roNo.toString() + " - " + d.roPrimeLineNo.toString()) == shipmentLinkedJson[c][0]));
          var listOfChildShipments = linkedShipmentListServer.filter(d => (d.roNo.toString() + " - " + d.roPrimeLineNo.toString()) == shipmentLinkedJson[c][0]);
          listOfChildShipments.map(item => {
            var shipmentIndex1 = shipmentData.findIndex(c => item.childShipmentId > 0 ? c.shipmentId == item.childShipmentId : c.tempShipmentId == item.tempChildShipmentId);
            var latestShipmentIndex = latestProgramDataShipment.findIndex(c => item.childShipmentId > 0 ? c.shipmentId == item.childShipmentId : c.tempShipmentId == item.tempChildShipmentId);
            if (shipmentIndex1 != -1 && latestShipmentIndex != -1) {
              shipmentData[shipmentIndex1] = latestProgramDataShipment[latestShipmentIndex];
            }
            var shipmentIndex2 = shipmentData.findIndex(c => item.parentShipmentId > 0 ? c.shipmentId == item.parentShipmentId : c.tempShipmentId == item.tempParentShipmentId);
            var latestShipmentIndex1 = latestProgramDataShipment.findIndex(c => item.parentShipmentId > 0 ? c.shipmentId == item.parentShipmentId : c.tempShipmentId == item.tempParentShipmentId);
            if (shipmentIndex2 != -1 && latestShipmentIndex1 != -1) {
              shipmentData[shipmentIndex2] = latestProgramDataShipment[latestShipmentIndex1];
            }
            var listOfLinkedParentShipments = latestProgramDataShipment.filter(c => item.parentShipmentId > 0 ? (c.parentLinkedShipmentId == item.parentShipmentId) : (c.tempParentLinkedShipmentId == item.tempParentShipmentId));
            listOfLinkedParentShipments.map(item1 => {
              var shipmentIndex2 = shipmentData.findIndex(c => item1.shipmentId > 0 ? c.shipmentId == item1.shipmentId : c.tempShipmentId == item1.tempShipmentId);
              var latestShipmentIndex2 = latestProgramDataShipment.findIndex(c => item1.shipmentId > 0 ? c.shipmentId == item1.shipmentId : c.tempShipmentId == item1.tempShipmentId);
              if (shipmentIndex2 != -1 && latestShipmentIndex2 != -1) {
                shipmentData[shipmentIndex2] = latestProgramDataShipment[latestShipmentIndex2];
              }
            })
            var listOfLinkedParentShipments = shipmentData.filter(c => item.parentShipmentId > 0 ? (c.parentLinkedShipmentId == item.parentShipmentId) : (c.tempParentLinkedShipmentId == item.tempParentShipmentId));
            listOfLinkedParentShipments.map(item1 => {
              var shipmentIndex2 = shipmentData.findIndex(c => item1.shipmentId > 0 ? c.shipmentId == item1.shipmentId : c.tempShipmentId == item1.tempShipmentId);
              var latestShipmentIndex2 = latestProgramDataShipment.findIndex(c => item1.shipmentId > 0 ? c.shipmentId == item1.shipmentId : c.tempShipmentId == item1.tempShipmentId);
              if (shipmentIndex2 != -1 && latestShipmentIndex2 != -1) {
                shipmentData[shipmentIndex2] = latestProgramDataShipment[latestShipmentIndex2];
              }
            })
          })
        }
      }
      var setOfLocalShipmentLinkingIds = [...new Set(linkedShipmentListLocal.map(ele => (ele.shipmentLinkingId)))];
      var listOfShipmentLinkingFromServer = linkedShipmentListServer.filter(c => !setOfLocalShipmentLinkingIds.includes(c.shipmentLinkingId));
      listOfShipmentLinkingFromServer.map(item => {
        item.active = false
      })
      var listOfShipmentLinkingFromLocal = originalShipmentLinkingList.filter(c => !setOfLocalShipmentLinkingIds.includes(c.shipmentLinkingId) && c.shipmentLinkingId != 0);
      listOfShipmentLinkingFromLocal.map(item => {
        item.active = false
      })
      var listOfShipmentLinkingFromLocalWith0 = listThatIsFiltered.filter(c => c.shipmentLinkingId == 0);
      listOfShipmentLinkingFromLocalWith0.map(item => {
        item.active = false
      })
      linkedShipmentListLocal = linkedShipmentListLocal.concat(listOfShipmentLinkingFromServer).concat(listOfShipmentLinkingFromLocal).concat(listOfShipmentLinkingFromLocalWith0);
      var uniquePlanningUnitsInShipmentLinking = [];
      linkedShipmentListLocal.map(item1 => {
        uniquePlanningUnitsInShipmentLinking = uniquePlanningUnitsInShipmentLinking.concat(item1.qatPlanningUnitId)
        if (item1.active.toString() == "true") {
          var shipmentIndex = shipmentData.findIndex(c => item1.childShipmentId > 0 ? c.shipmentId == item1.childShipmentId : c.tempShipmentId == item1.tempChildShipmentId);
          if (shipmentIndex != -1) {
            shipmentData[shipmentIndex].active = true;
          }
        }
      })
      linkedShipmentListLocal.map(item1 => {
        if (item1.active.toString() == "false") {
          var parentShipmentId = item1.parentShipmentId;
          var tempParentShipmentId = item1.tempParentShipmentId;
          var checkIfThereAreAnyActiveChildShipments = shipmentData.filter(c => c.active.toString() == "true" && c.erpFlag.toString() == "true" && (parentShipmentId > 0 ? (c.parentShipmentId == parentShipmentId) : (c.tempParentShipmentId == tempParentShipmentId)));
          if (checkIfThereAreAnyActiveChildShipments.length == 0) {
            var shipmentIndex1 = shipmentData.findIndex(c => parentShipmentId > 0 ? (c.shipmentId > 0 ? (c.shipmentId == parentShipmentId) : (c.tempShipmentId == parentShipmentId)) : (c.shipmentId > 0 ? (c.shipmentId == tempParentShipmentId) : (c.tempShipmentId == tempParentShipmentId)));
            if (shipmentIndex1 != -1) {
              shipmentData[shipmentIndex1].active = true;
              shipmentData[shipmentIndex1].erpFlag = false;
            }
            var linkedParentShipmentIdList = shipmentData.filter(c => parentShipmentId > 0 ? (c.parentLinkedShipmentId == parentShipmentId) : (c.tempParentLinkedShipmentId == tempParentShipmentId));
            for (var l = 0; l < linkedParentShipmentIdList.length; l++) {
              var parentShipmentIndex1 = shipmentData.findIndex(c => linkedParentShipmentIdList[l].shipmentId > 0 ? c.shipmentId == linkedParentShipmentIdList[l].shipmentId : c.tempShipmentId == linkedParentShipmentIdList[l].tempShipmentId);
              if (parentShipmentIndex1 != -1) {
                shipmentData[parentShipmentIndex1].active = true;
                shipmentData[parentShipmentIndex1].erpFlag = false;
                shipmentData[parentShipmentIndex1].parentLinkedShipmentId = null;
                shipmentData[parentShipmentIndex1].tempParentLinkedShipmentId = null;
              }
            }
          }
        }
      })
      var uniquePlanningUnitsInShipment = [];
      shipmentJson.map(c => uniquePlanningUnitsInShipment = uniquePlanningUnitsInShipment.concat(parseInt(c[1])));
      uniquePlanningUnitsInShipment.map(c => {
        actionList.push({
          planningUnitId: c,
          type: SHIPMENT_MODIFIED,
          date: moment(Date.now()).startOf('month').format("YYYY-MM-DD")
        });
      })
      uniquePlanningUnitsInShipmentLinking.map(c => {
        actionList.push({
          planningUnitId: c,
          type: SHIPMENT_MODIFIED,
          date: moment(Date.now()).startOf('month').format("YYYY-MM-DD")
        });
      })
      programJson.consumptionList = consumptionData;
      programJson.inventoryList = inventoryData;
      programJson.shipmentList = shipmentData;
      programJson.actionList = actionList;
      programJson.shipmentLinkingList = linkedShipmentListLocal.filter(c => (c.shipmentLinkingId > 0) || (c.shipmentLinkingId == 0 && c.active == true));
      var planningUnitDataListFromState = this.state.planningUnitDataList;
      var consumptionList = programJson.consumptionList;
      var inventoryList = programJson.inventoryList;
      var shipmentList = programJson.shipmentList;
      var batchInfoList = programJson.batchInfoList;
      var supplyPlan = programJson.supplyPlan;
      var generalData = programJson;
      delete generalData.consumptionList;
      delete generalData.inventoryList;
      delete generalData.shipmentList;
      delete generalData.batchInfoList;
      delete generalData.supplyPlan;
      delete generalData.planningUnitList;
      var generalEncryptedData = CryptoJS.AES.encrypt(JSON.stringify(generalData), SECRET_KEY).toString();
      var planningUnitDataList = [];
      for (var pu = 0; pu < planningUnitDataListFromState.length; pu++) {
        var planningUnitDataJson = {
          consumptionList: consumptionList.filter(c => c.planningUnit.id == planningUnitDataListFromState[pu].planningUnitId),
          inventoryList: inventoryList.filter(c => c.planningUnit.id == planningUnitDataListFromState[pu].planningUnitId),
          shipmentList: shipmentList.filter(c => c.planningUnit.id == planningUnitDataListFromState[pu].planningUnitId),
          batchInfoList: batchInfoList.filter(c => c.planningUnitId == planningUnitDataListFromState[pu].planningUnitId),
          supplyPlan: supplyPlan.filter(c => c.planningUnitId == planningUnitDataListFromState[pu].planningUnitId)
        }
        var encryptedPlanningUnitDataText = CryptoJS.AES.encrypt(JSON.stringify(planningUnitDataJson), SECRET_KEY).toString();
        planningUnitDataList.push({ planningUnitId: planningUnitDataListFromState[pu].planningUnitId, planningUnitData: encryptedPlanningUnitDataText })
      }
      var programDataJson = {
        generalData: generalEncryptedData,
        planningUnitDataList: planningUnitDataList
      };
      var proRequestResult = this.state.programRequestResult;
      proRequestResult.programData = programDataJson;
      var programTransaction = db1.transaction(['whatIfProgramData'], 'readwrite');
      var programOs = programTransaction.objectStore('whatIfProgramData');
      var putRequest = programOs.put(proRequestResult);
      putRequest.onerror = function (event) {
        this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
        this.props.updateState("color", "red");
        this.props.hideFirstComponent();
      }.bind(this);
      putRequest.onsuccess = function (event) {
        this.refs.problemListChild.qatProblemActions((this.state.programId).value, "loading", false);
      }.bind(this);
    }.bind(this);
  }
  /**
   * This function is used to get list of programs that are loaded by user, list of version type on page load
   */
  componentDidMount() {
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
      this.setState({
        commitVersionError: i18n.t('static.program.errortext'),
        loading: false
      })
      this.hideSecondComponent()
    }.bind(this);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(['programQPLDetails'], 'readwrite');
      var program = transaction.objectStore('programQPLDetails');
      var getRequest = program.getAll();
      var proList = [];
      getRequest.onerror = function (event) {
        this.setState({
          commitVersionError: i18n.t('static.program.errortext'),
          loading: false
        })
        this.hideSecondComponent()
      }.bind(this);
      getRequest.onsuccess = function (event) {
        var myResult = [];
        myResult = getRequest.result;
        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        for (var i = 0; i < myResult.length; i++) {
          if (myResult[i].userId == userId && !myResult[i].readonly) {
            var programJson = {
              label: myResult[i].programCode + "~v" + myResult[i].version,
              value: myResult[i].id,
              version: myResult[i].version,
              programId: myResult[i].programId
            }
            proList.push(programJson)
          }
        }
        proList.sort((a, b) => {
          var itemLabelA = a.label.toUpperCase();
          var itemLabelB = b.label.toUpperCase();
          return itemLabelA > itemLabelB ? 1 : -1;
        });
        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getVersionTypeList().then(response => {
          if (proList.length > 0) {
            if (proList.length == 1) {
              this.setState({
                versionTypeList: response.data,
                programList: proList,
                programId: proList[0].value
              }, () => {
                this.checkLastModifiedDateForProgram(proList[0]);
              })
            } else if (localStorage.getItem("sesProgramId") != '' && localStorage.getItem("sesProgramId") != undefined) {
              var programFilter = proList.filter(c => c.value == localStorage.getItem("sesProgramId"));
              if (programFilter.length > 0) {
                this.setState({
                  versionTypeList: response.data,
                  programList: proList,
                  programId: localStorage.getItem("sesProgramId")
                }, () => {
                  this.checkLastModifiedDateForProgram(proList.filter(c => c.value == localStorage.getItem("sesProgramId"))[0]);
                })
              } else {
                this.setState({
                  versionTypeList: response.data,
                  programList: proList,
                  loading: false
                })
              }
            } else {
              this.setState({
                versionTypeList: response.data,
                programList: proList,
                loading: false
              })
            }
          } else {
            this.setState({
              loading: false
            })
          }
        })
          .catch(
            error => {
              if (error.message === "Network Error") {
                this.setState({
                  message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                  loading: false,
                  statuses: [],
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
                      statuses: [],
                    });
                    break;
                  case 412:
                    this.setState({
                      message: error.response.data.messageCode,
                      loading: false,
                      statuses: [],
                    });
                    break;
                  default:
                    this.setState({
                      message: 'static.unkownError',
                      loading: false,
                      statuses: [],
                    });
                    break;
                }
              }
            }
          );
      }.bind(this);
    }.bind(this);
    document.getElementById("detailsDiv").style.display = "none";
  }
  /**
   * This function is used to get the last modified date for the program to check if someother user have tried comitting in between
   * @param {*} value This is the program Id which user is trying to commit
   */
  checkLastModifiedDateForProgram(value) {
    document.getElementById("detailsDiv").style.display = "block";
    this.setState({
      programId: value,
      loading: true,
      mergedConsumptionJexcel: "",
      mergedInventoryJexcel: "",
      mergedShipmentJexcel: "",
      mergedProblemListJexcel: "",
      mergedShipmentLinkedJexcel: ""
    })
    if (this.state.mergedConsumptionJexcel != "" && this.state.mergedConsumptionJexcel != undefined) {
      jexcel.destroy(document.getElementById("mergedVersionConsumption"), true);
    }
    if (this.state.mergedInventoryJexcel != "" && this.state.mergedInventoryJexcel != undefined) {
      jexcel.destroy(document.getElementById("mergedVersionInventory"), true);
    }
    if (this.state.mergedShipmentJexcel != "" && this.state.mergedShipmentJexcel != undefined) {
      jexcel.destroy(document.getElementById("mergedVersionShipment"), true);
    }
    if (this.state.mergedShipmentLinkedJexcel != "" && this.state.mergedShipmentLinkedJexcel != undefined) {
      jexcel.destroy(document.getElementById("mergedVersionShipmentLinked"), true);
    }
    if (this.state.mergedProblemListJexcel != "" && this.state.mergedProblemListJexcel != undefined) {
      jexcel.destroy(document.getElementById("mergedVersionProblemList"), true);
    }
    var programId = value != "" && value != undefined ? value.value : 0;
    var programVersion = (this.state.programList).filter(c => c.value == programId)[0].version;
    var singleProgramId = (this.state.programList).filter(c => c.value == programId)[0].programId;
    if (programId != 0) {
      localStorage.setItem("sesProgramId", programId);
      ProgramService.getLastModifiedDateForProgram(singleProgramId, programVersion).then(response1 => {
        if (response1.status == 200) {
          var lastModifiedDate = response1.data;
          var db1;
          var storeOS;
          getDatabase();
          var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
          openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['lastSyncDate'], 'readwrite');
            var lastSyncDateTransaction = transaction.objectStore('lastSyncDate');
            var lastSyncDateRequest = lastSyncDateTransaction.getAll();
            lastSyncDateRequest.onsuccess = function (event) {
              var lastSyncDate = lastSyncDateRequest.result[0];
              var result = lastSyncDateRequest.result;
              for (var i = 0; i < result.length; i++) {
                if (result[i].id == 0) {
                  var lastSyncDate = lastSyncDateRequest.result[i];
                }
              }
              if (lastSyncDate == undefined) {
                lastSyncDate = "2020-01-01 00:00:00";
              } else {
                lastSyncDate = lastSyncDate.lastSyncDate;
              }
              if (lastModifiedDate != undefined && lastModifiedDate != null && lastModifiedDate != "" && moment(lastModifiedDate).format("YYYY-MM-DD HH:mm:ss") > moment(lastSyncDate).format("YYYY-MM-DD HH:mm:ss")) {
                alert(i18n.t('static.commitVersion.outdatedsync'));
                this.props.history.push(`/syncProgram`)
              } else {
                this.getDataForCompare(value);
              }
            }.bind(this)
          }.bind(this)
        }
      }).catch(error => {
        if (error.message === "Network Error") {
          this.setState({
            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
            loading: false,
            statuses: [],
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
                statuses: [],
              });
              break;
            case 412:
              this.setState({
                message: error.response.data.messageCode,
                loading: false,
                statuses: [],
              });
              break;
            default:
              this.setState({
                message: 'static.unkownError',
                loading: false,
                statuses: [],
              });
              break;
          }
        }
      })
    }
  }
  /**
   * This function is used to get the latest version data for the program selected by the user
   * @param {*} value This is the program Id which user is trying to commit
   */
  getDataForCompare(value) {
    var programId = value != "" && value != undefined ? value.value : 0;
    var programVersion = (this.state.programList).filter(c => c.value == programId)[0].version;
    var singleProgramId = (this.state.programList).filter(c => c.value == programId)[0].programId;
    if (programId != 0) {
      localStorage.setItem("sesProgramId", programId);
      AuthenticationService.setupAxiosInterceptors();
      ProgramService.getLatestVersionForProgram((singleProgramId)).then(response1 => {
        if (response1.status == 200) {
          var latestVersion = response1.data;
          var programRequestJson = [];
          programRequestJson.push({ programId: (programId.split("_"))[0], versionId: -1 })
          if (latestVersion == programVersion) {
          } else {
            programRequestJson.push({ programId: (programId.split("_"))[0], versionId: programVersion });
          }
          ProgramService.getAllProgramData(programRequestJson)
            .then(response => {
              if (response.status == 200) {
                response.data = decompressJson(response.data);
                AuthenticationService.setupAxiosInterceptors();
                var db1;
                var realmCountryPlanningUnitList = []
                var dataSourceList = []
                var planningUnitList = []
                var shipmentStatusList = []
                var procurementAgentList = []
                var fundingSourceList = []
                var budgetList = []
                var currencyList = []
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onerror = function (event) {
                  this.setState({
                    commitVersionError: i18n.t('static.program.errortext'),
                    loading: false
                  })
                  this.hideSecondComponent()
                }.bind(this);
                openRequest.onsuccess = function (e) {
                  db1 = e.target.result;
                  var programDataTransaction = db1.transaction(['programData'], 'readwrite');
                  var programDataOs = programDataTransaction.objectStore('programData');
                  var programRequest = programDataOs.get(value != "" && value != undefined ? value.value : 0);
                  programRequest.onerror = function (event) {
                    this.setState({
                      commitVersionError: i18n.t('static.program.errortext'),
                      loading: false
                    })
                    this.hideSecondComponent()
                  }.bind(this);
                  programRequest.onsuccess = function (e) {
                    var generalDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData.generalData, SECRET_KEY);
                    var generalData = generalDataBytes.toString(CryptoJS.enc.Utf8);
                    var generalJson = JSON.parse(generalData);
                    var planningUnitDataList = programRequest.result.programData.planningUnitDataList;
                    var consumptionList = [];
                    var inventoryList = [];
                    var shipmentList = [];
                    var batchInfoList = [];
                    var supplyPlan = [];
                    for (var pu = 0; pu < planningUnitDataList.length; pu++) {
                      var planningUnitData = planningUnitDataList[pu];
                      var programDataBytes = CryptoJS.AES.decrypt(planningUnitData.planningUnitData, SECRET_KEY);
                      var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                      var planningUnitDataJson = JSON.parse(programData);
                      consumptionList = consumptionList.concat(planningUnitDataJson.consumptionList);
                      inventoryList = inventoryList.concat(planningUnitDataJson.inventoryList);
                      shipmentList = shipmentList.concat(planningUnitDataJson.shipmentList);
                      batchInfoList = batchInfoList.concat(planningUnitDataJson.batchInfoList);
                      supplyPlan = supplyPlan.concat(planningUnitDataJson.supplyPlan);
                    }
                    var programJson = generalJson;
                    if (generalJson.shipmentLinkingList !== "" && generalJson.shipmentLinkingList != undefined) {
                      programJson.consumptionList = consumptionList;
                      programJson.inventoryList = inventoryList;
                      programJson.shipmentList = shipmentList;
                      programJson.batchInfoList = batchInfoList;
                      programJson.supplyPlan = supplyPlan;
                      this.setState({
                        programRequestResult: programRequest.result,
                        programRequestProgramJson: programJson,
                        planningUnitDataList: planningUnitDataList
                      })
                      var rcpuTransaction = db1.transaction(['realmCountryPlanningUnit'], 'readwrite');
                      var rcpuOs = rcpuTransaction.objectStore('realmCountryPlanningUnit');
                      var rcpuRequest = rcpuOs.getAll();
                      rcpuRequest.onerror = function (event) {
                        this.setState({
                          commitVersionError: i18n.t('static.program.errortext'),
                          loading: false
                        })
                        this.hideSecondComponent()
                      }.bind(this);
                      rcpuRequest.onsuccess = function (event) {
                        var rcpuResult = [];
                        rcpuResult = rcpuRequest.result.filter(c => (c.active).toString() == "true");
                        for (var k = 0; k < rcpuResult.length; k++) {
                          var rcpuJson = {
                            name: getLabelText(rcpuResult[k].label, this.state.lang),
                            id: rcpuResult[k].realmCountryPlanningUnitId,
                            multiplier: rcpuResult[k].multiplier
                          }
                          realmCountryPlanningUnitList.push(rcpuJson);
                        }
                        var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
                        var dataSourceOs = dataSourceTransaction.objectStore('dataSource');
                        var dataSourceRequest = dataSourceOs.getAll();
                        dataSourceRequest.onerror = function (event) {
                          this.setState({
                            commitVersionError: i18n.t('static.program.errortext'),
                            loading: false
                          })
                          this.hideSecondComponent()
                        }.bind(this);
                        dataSourceRequest.onsuccess = function (event) {
                          var dataSourceResult = [];
                          dataSourceResult = dataSourceRequest.result;
                          for (var k = 0; k < dataSourceResult.length; k++) {
                            var dataSourceJson = {
                              name: getLabelText(dataSourceResult[k].label, this.state.lang),
                              id: dataSourceResult[k].dataSourceId,
                              dataSourceTypeId: dataSourceResult[k].dataSourceType.id
                            }
                            dataSourceList.push(dataSourceJson);
                          }
                          var puTransaction = db1.transaction(['planningUnit'], 'readwrite');
                          var puOs = puTransaction.objectStore('planningUnit');
                          var puRequest = puOs.getAll();
                          planningUnitList = []
                          puRequest.onerror = function (event) {
                            this.setState({
                              supplyPlanError: i18n.t('static.program.errortext'),
                              loading: false
                            })
                          }.bind(this);
                          puRequest.onsuccess = function (e) {
                            var puResult = [];
                            puResult = puRequest.result;
                            for (var k = 0; k < puResult.length; k++) {
                              var puJson = {
                                name: getLabelText(puResult[k].label, this.state.lang),
                                id: puResult[k].planningUnitId,
                              }
                              planningUnitList.push(puJson);
                            }
                            var shipmentStatusTransaction = db1.transaction(['shipmentStatus'], 'readwrite');
                            var shipmentStatusOs = shipmentStatusTransaction.objectStore('shipmentStatus');
                            var shipmentStatusRequest = shipmentStatusOs.getAll();
                            shipmentStatusRequest.onerror = function (event) {
                              this.setState({
                                commitVersionError: i18n.t('static.program.errortext'),
                                loading: false
                              })
                              this.hideSecondComponent()
                            }.bind(this);
                            shipmentStatusRequest.onsuccess = function (event) {
                              var shipmentStatusResult = [];
                              shipmentStatusResult = shipmentStatusRequest.result.filter(c => c.active == true);
                              for (var k = 0; k < shipmentStatusResult.length; k++) {
                                var shipmentStatusJson = {
                                  name: getLabelText(shipmentStatusResult[k].label, this.state.lang),
                                  id: shipmentStatusResult[k].shipmentStatusId
                                }
                                shipmentStatusList.push(shipmentStatusJson);
                              }
                              var papuTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                              var papuOs = papuTransaction.objectStore('procurementAgent');
                              var papuRequest = papuOs.getAll();
                              papuRequest.onerror = function (event) {
                                this.setState({
                                  commitVersionError: i18n.t('static.program.errortext'),
                                  loading: false
                                })
                                this.hideSecondComponent()
                              }.bind(this);
                              papuRequest.onsuccess = function (event) {
                                var papuResult = [];
                                papuResult = papuRequest.result;
                                for (var k = 0; k < papuResult.length; k++) {
                                  var papuJson = {
                                    name: papuResult[k].procurementAgentCode,
                                    id: papuResult[k].procurementAgentId
                                  }
                                  procurementAgentList.push(papuJson);
                                }
                                this.setState({
                                  procurementAgentPlanningUnitListAll: papuResult
                                })
                                var fsTransaction = db1.transaction(['fundingSource'], 'readwrite');
                                var fsOs = fsTransaction.objectStore('fundingSource');
                                var fsRequest = fsOs.getAll();
                                fsRequest.onerror = function (event) {
                                  this.setState({
                                    commitVersionError: i18n.t('static.program.errortext'),
                                    loading: false
                                  })
                                  this.hideSecondComponent()
                                }.bind(this);
                                fsRequest.onsuccess = function (event) {
                                  var fsResult = [];
                                  fsResult = fsRequest.result;
                                  for (var k = 0; k < fsResult.length; k++) {
                                    var fsJson = {
                                      name: fsResult[k].fundingSourceCode,
                                      id: fsResult[k].fundingSourceId
                                    }
                                    fundingSourceList.push(fsJson);
                                  }
                                  var bTransaction = db1.transaction(['budget'], 'readwrite');
                                  var bOs = bTransaction.objectStore('budget');
                                  var bRequest = bOs.getAll();
                                  var budgetListAll = []
                                  bRequest.onerror = function (event) {
                                    this.setState({
                                      commitVersionError: i18n.t('static.program.errortext'),
                                      loading: false
                                    })
                                    this.hideSecondComponent()
                                  }.bind(this);
                                  bRequest.onsuccess = function (event) {
                                    var bResult = [];
                                    bResult = bRequest.result;
                                    for (var k = 0; k < bResult.length; k++) {
                                      var bJson = {
                                        name: bResult[k].budgetCode,
                                        id: bResult[k].budgetId
                                      }
                                      budgetList.push(bJson);
                                      budgetListAll.push({
                                        name: bResult[k].budgetCode,
                                        id: bResult[k].budgetId,
                                        fundingSource: bResult[k].fundingSource,
                                        currency: bResult[k].currency,
                                        budgetAmt: bResult[k].budgetAmt
                                      })
                                    }
                                    this.setState({
                                      budgetListAll: budgetListAll
                                    })
                                    var currencyTransaction = db1.transaction(['currency'], 'readwrite');
                                    var currencyOs = currencyTransaction.objectStore('currency');
                                    var currencyRequest = currencyOs.getAll();
                                    currencyRequest.onerror = function (event) {
                                      this.setState({
                                        commitVersionError: i18n.t('static.program.errortext'),
                                        loading: false
                                      })
                                      this.hideSecondComponent()
                                    }.bind(this);
                                    currencyRequest.onsuccess = function (event) {
                                      var currencyResult = [];
                                      currencyResult = (currencyRequest.result).filter(c => c.active == true);
                                      for (var k = 0; k < currencyResult.length; k++) {
                                        var currencyJson = {
                                          name: getLabelText(currencyResult[k].label, this.state.lang),
                                          id: currencyResult[k].currencyId
                                        }
                                        currencyList.push(currencyJson);
                                      }
                                      this.setState({
                                        currencyListAll: currencyResult
                                      })
                                      var latestProgramData = response.data[0];
                                      this.setState({
                                        comparedLatestVersion: latestProgramData.currentVersion.versionId,
                                        singleProgramId: latestProgramData.programId
                                      })
                                      var listOfRoAndRoPrimeLineNo = [];
                                      var shipmentLinkingListForAPI = programJson.shipmentLinkingList;
                                      for (var l = 0; l < shipmentLinkingListForAPI.length; l++) {
                                        listOfRoAndRoPrimeLineNo.push(
                                          {
                                            "roNo": shipmentLinkingListForAPI[l].roNo,
                                            "roPrimeLineNo": shipmentLinkingListForAPI[l].roPrimeLineNo,
                                          }
                                        )
                                      }
                                      var json = {
                                        programId: programJson.programId,
                                        roAndRoPrimeLineNoList: listOfRoAndRoPrimeLineNo
                                      }
                                      ProgramService.checkIfLinkingExistsWithOtherProgram(json)
                                        .then(responseLinking => {
                                          if (responseLinking.status == 200) {
                                            var oldProgramData = programJson;
                                            var checkIfThereIsUnMappedBudget = 0;
                                            oldProgramData.shipmentList.filter(c => c.budget != null && c.budget.id > 0 && c.active.toString() == "true").map(item => {
                                              var budgetFilter = bResult.filter(c => c.budgetId == item.budget.id);
                                              if (budgetFilter.length == 0 || (budgetFilter.length > 0 && ![...new Set(budgetFilter[0].programs.map(ele => ele.id))].includes(parseInt(programJson.programId)))) {
                                                checkIfThereIsUnMappedBudget = 1;
                                              }
                                            })
                                            if (checkIfThereIsUnMappedBudget == 0) {
                                              var downloadedProgramData = response.data.length > 1 ? response.data[1] : response.data[0];
                                              var regionList = [];
                                              for (var i = 0; i < latestProgramData.regionList.length; i++) {
                                                var regionJson = {
                                                  name: getLabelText(latestProgramData.regionList[i].label, this.state.lang),
                                                  id: latestProgramData.regionList[i].regionId
                                                }
                                                regionList.push(regionJson);
                                              }
                                              var latestProgramDataConsumption = latestProgramData.consumptionList;
                                              var oldProgramDataConsumption = oldProgramData.consumptionList;
                                              var downloadedProgramDataConsumption = downloadedProgramData.consumptionList;
                                              var modifiedConsumptionIds = []
                                              latestProgramDataConsumption.filter(c => c.versionId > oldProgramData.currentVersion.versionId).map(item => { modifiedConsumptionIds.push(item.consumptionId) });
                                              oldProgramData.consumptionList.filter(c => moment(c.lastModifiedDate).format("YYYY-MM-DD HH:mm:ss") > moment(oldProgramData.currentVersion.createdDate).format("YYYY-MM-DD HH:mm:ss")).map(item => modifiedConsumptionIds.push(item.consumptionId));
                                              var latestModifiedConsumptionData = latestProgramDataConsumption.filter(c => modifiedConsumptionIds.includes(c.consumptionId));
                                              var oldModifiedConsumptionData = oldProgramDataConsumption.filter(c => c.consumptionId == 0 || modifiedConsumptionIds.includes(c.consumptionId));
                                              var mergedConsumptionData = [];
                                              var existingConsumptionId = [];
                                              for (var c = 0; c < oldModifiedConsumptionData.length; c++) {
                                                if (oldModifiedConsumptionData[c].consumptionId != 0) {
                                                  mergedConsumptionData.push(oldModifiedConsumptionData[c]);
                                                  existingConsumptionId.push(oldModifiedConsumptionData[c].consumptionId);
                                                } else {
                                                  var index = latestProgramDataConsumption.findIndex(f =>
                                                    f.planningUnit.id == oldModifiedConsumptionData[c].planningUnit.id &&
                                                    moment(f.consumptionDate).format("YYYY-MM") == moment(oldModifiedConsumptionData[c].consumptionDate).format("YYYY-MM") &&
                                                    f.region.id == oldModifiedConsumptionData[c].region.id &&
                                                    f.actualFlag.toString() == oldModifiedConsumptionData[c].actualFlag.toString() &&
                                                    f.realmCountryPlanningUnit.id == oldModifiedConsumptionData[c].realmCountryPlanningUnit.id &&
                                                    !existingConsumptionId.includes(f.consumptionId)
                                                  );
                                                  if (index == -1) {
                                                    mergedConsumptionData.push(oldModifiedConsumptionData[c]);
                                                  } else {
                                                    oldModifiedConsumptionData[c].consumptionId = latestProgramDataConsumption[index].consumptionId;
                                                    var index1 = oldProgramDataConsumption.findIndex(f =>
                                                      f.planningUnit.id == oldModifiedConsumptionData[c].planningUnit.id &&
                                                      moment(f.consumptionDate).format("YYYY-MM") == moment(oldModifiedConsumptionData[c].consumptionDate).format("YYYY-MM") &&
                                                      f.region.id == oldModifiedConsumptionData[c].region.id &&
                                                      f.actualFlag.toString() == oldModifiedConsumptionData[c].actualFlag.toString() &&
                                                      f.realmCountryPlanningUnit.id == oldModifiedConsumptionData[c].realmCountryPlanningUnit.id &&
                                                      !existingConsumptionId.includes(f.consumptionId)
                                                    );
                                                    oldProgramDataConsumption[index1].consumptionId = latestProgramDataConsumption[index].consumptionId;
                                                    oldProgramDataConsumption[index1].versionId = latestProgramDataConsumption[index].versionId;
                                                    existingConsumptionId.push(latestProgramDataConsumption[index].consumptionId);
                                                    mergedConsumptionData.push(oldModifiedConsumptionData[c]);
                                                  }
                                                }
                                              }
                                              var latestOtherConsumptionEntries = latestModifiedConsumptionData.filter(c => !(existingConsumptionId.includes(c.consumptionId)));
                                              mergedConsumptionData = mergedConsumptionData.concat(latestOtherConsumptionEntries);
                                              var data = [];
                                              var mergedConsumptionJexcel = [];
                                              for (var cd = 0; cd < mergedConsumptionData.length; cd++) {
                                                var consumptionFlag = 1;
                                                if (mergedConsumptionData[cd].actualFlag == false) {
                                                  consumptionFlag = 2;
                                                }
                                                data = [];
                                                data[0] = mergedConsumptionData[cd].consumptionId;
                                                data[1] = mergedConsumptionData[cd].planningUnit.id;
                                                data[2] = moment(mergedConsumptionData[cd].consumptionDate).format(DATE_FORMAT_CAP_WITHOUT_DATE);
                                                data[3] = mergedConsumptionData[cd].region.id;
                                                data[4] = mergedConsumptionData[cd].dataSource.id;
                                                data[5] = mergedConsumptionData[cd].realmCountryPlanningUnit.id;
                                                data[6] = Math.round(mergedConsumptionData[cd].consumptionRcpuQty);
                                                data[7] = mergedConsumptionData[cd].multiplier;
                                                data[8] = Math.round(Math.round(mergedConsumptionData[cd].consumptionRcpuQty) * mergedConsumptionData[cd].multiplier);
                                                data[9] = mergedConsumptionData[cd].dayOfStockOut;
                                                if (mergedConsumptionData[cd].notes === null || ((mergedConsumptionData[cd].notes) == "NULL")) {
                                                  data[10] = "";
                                                } else {
                                                  data[10] = mergedConsumptionData[cd].notes;
                                                }
                                                data[11] = consumptionFlag;
                                                data[12] = mergedConsumptionData[cd].active;
                                                data[13] = JSON.stringify(mergedConsumptionData[cd].batchInfoList != "" ? ((mergedConsumptionData[cd].batchInfoList).map(function (a) { return { "batchNo": a.batch.batchNo, "qty": parseInt(a.consumptionQty) } })).sort(function (a, b) { return a.qty - b.qty; }) : "");
                                                data[14] = "";
                                                var oldDataList = oldProgramDataConsumption.filter(c => c.consumptionId == mergedConsumptionData[cd].consumptionId);
                                                var oldData = ""
                                                if (oldDataList.length > 0) {
                                                  oldData = [oldDataList[0].consumptionId, oldDataList[0].planningUnit.id, moment(oldDataList[0].consumptionDate).format(DATE_FORMAT_CAP_WITHOUT_DATE), oldDataList[0].region.id, oldDataList[0].dataSource.id, oldDataList[0].realmCountryPlanningUnit.id, Math.round(oldDataList[0].consumptionRcpuQty), oldDataList[0].multiplier, Math.round(Math.round(oldDataList[0].consumptionRcpuQty) * oldDataList[0].multiplier), oldDataList[0].dayOfStockOut, oldDataList[0].notes, (oldDataList[0].actualFlag.toString() == "true" ? 1 : 0), oldDataList[0].active, JSON.stringify(oldDataList[0].batchInfoList != "" ? ((oldDataList[0].batchInfoList).map(function (a) { return { "batchNo": a.batch.batchNo, "qty": parseInt(a.consumptionQty) } })).sort(function (a, b) { return a.qty - b.qty; }) : ""), "", "", "", "", 4];
                                                }
                                                data[15] = oldData;
                                                var latestDataList = latestProgramDataConsumption.filter(c => c.consumptionId == mergedConsumptionData[cd].consumptionId);
                                                var latestData = ""
                                                if (latestDataList.length > 0) {
                                                  latestData = [latestDataList[0].consumptionId, latestDataList[0].planningUnit.id, moment(latestDataList[0].consumptionDate).format(DATE_FORMAT_CAP_WITHOUT_DATE), latestDataList[0].region.id, latestDataList[0].dataSource.id, latestDataList[0].realmCountryPlanningUnit.id, Math.round(latestDataList[0].consumptionRcpuQty), latestDataList[0].multiplier, Math.round(Math.round(latestDataList[0].consumptionRcpuQty) * latestDataList[0].multiplier), latestDataList[0].dayOfStockOut, latestDataList[0].notes, (latestDataList[0].actualFlag.toString() == "true" ? 1 : 0), latestDataList[0].active, JSON.stringify(latestDataList[0].batchInfoList != "" ? ((latestDataList[0].batchInfoList).map(function (a) { return { "batchNo": a.batch.batchNo, "qty": parseInt(a.consumptionQty) } })).sort(function (a, b) { return a.qty - b.qty; }) : ""), "", "", "", "", 4];
                                                }
                                                data[16] = latestData;
                                                var downloadedDataList = downloadedProgramDataConsumption.filter(c => c.consumptionId == mergedConsumptionData[cd].consumptionId);
                                                var downloadedData = "";
                                                if (downloadedDataList.length > 0) {
                                                  downloadedData = [downloadedDataList[0].consumptionId, downloadedDataList[0].planningUnit.id, moment(downloadedDataList[0].consumptionDate).format(DATE_FORMAT_CAP_WITHOUT_DATE), downloadedDataList[0].region.id, downloadedDataList[0].dataSource.id, downloadedDataList[0].realmCountryPlanningUnit.id, Math.round(downloadedDataList[0].consumptionRcpuQty), downloadedDataList[0].multiplier, Math.round(Math.round(downloadedDataList[0].consumptionRcpuQty) * downloadedDataList[0].multiplier), downloadedDataList[0].dayOfStockOut, downloadedDataList[0].notes, (downloadedDataList[0].actualFlag.toString() == "true" ? 1 : 0), downloadedDataList[0].active, JSON.stringify(downloadedDataList[0].batchInfoList != "" ? ((downloadedDataList[0].batchInfoList).map(function (a) { return { "batchNo": a.batch.batchNo, "qty": parseInt(a.consumptionQty) } })).sort(function (a, b) { return a.qty - b.qty; }) : ""), "", "", "", "", 4];
                                                }
                                                data[17] = downloadedData;
                                                data[18] = 4;
                                                mergedConsumptionJexcel.push(data);
                                              }
                                              var options = {
                                                data: mergedConsumptionJexcel,
                                                columnDrag: false,
                                                columns: [
                                                  { title: i18n.t('static.commit.consumptionId'), type: 'hidden', width: 100 },
                                                  { title: i18n.t('static.planningunit.planningunit'), type: 'dropdown', source: planningUnitList, width: 200 },
                                                  { title: i18n.t('static.pipeline.consumptionDate'), type: 'text', width: 95 },
                                                  { title: i18n.t('static.region.region'), type: 'dropdown', source: regionList, width: 100 },
                                                  { title: i18n.t('static.inventory.dataSource'), type: 'dropdown', source: dataSourceList, width: 100 },
                                                  { title: i18n.t('static.supplyPlan.alternatePlanningUnit'), type: 'dropdown', source: realmCountryPlanningUnitList, width: 150 },
                                                  { title: i18n.t('static.supplyPlan.quantityCountryProduct'), type: 'numeric', mask: '#,##', width: 80 },
                                                  { title: i18n.t('static.unit.multiplier'), type: 'numeric', mask: '#,##.000000', decimal: '.', width: 90 },
                                                  { title: i18n.t('static.supplyPlan.quantityQATProduct'), type: 'numeric', mask: '#,##', width: 80 },
                                                  { title: i18n.t('static.consumption.daysofstockout'), type: 'numeric', mask: '#,##', width: 80 },
                                                  { title: i18n.t('static.program.notes'), type: 'text', width: 200 },
                                                  { type: 'dropdown', title: i18n.t('static.consumption.consumptionType'), source: [{ id: 1, name: i18n.t('static.consumption.actual') }, { id: 2, name: i18n.t('static.consumption.forcast') }], width: 100 },
                                                  { title: i18n.t('static.inventory.active'), type: 'checkbox', width: 70 },
                                                  { type: 'hidden', title: i18n.t('static.supplyPlan.batchInfo'), width: 0 },
                                                  { type: 'text', title: i18n.t('static.supplyPlan.batchInfo'), width: 85 },
                                                  { type: 'hidden', title: 'Old data' },
                                                  { type: 'hidden', title: 'latest data' },
                                                  { type: 'hidden', title: 'downloaded data' },
                                                  { type: 'hidden', title: 'result of compare' },
                                                ],
                                                pagination: localStorage.getItem("sesRecordCount"),
                                                paginationOptions: JEXCEL_PAGINATION_OPTION,
                                                search: true,
                                                columnSorting: true,
                                                wordWrap: true,
                                                allowInsertColumn: false,
                                                allowManualInsertColumn: false,
                                                allowDeleteRow: false,
                                                onload: this.loadedFunctionForMerge,
                                                filters: true,
                                                license: JEXCEL_PRO_KEY,
                                                contextMenu: function (obj, x, y, e) {
                                                  var items = [];
                                                  var rowData = obj.getRowData(y)
                                                  if (rowData[18].toString() == 1) {
                                                    items.push({
                                                      title: "Resolve conflicts",
                                                      onclick: function () {
                                                        this.setState({ loading: true })
                                                        this.toggleLarge(rowData[15], rowData[16], y, 'consumption');
                                                      }.bind(this)
                                                    })
                                                  } else {
                                                    return false;
                                                  }
                                                  return items;
                                                }.bind(this)
                                              };
                                              var mergedConsumptionJexcel = jexcel(document.getElementById("mergedVersionConsumption"), options);
                                              this.el = mergedConsumptionJexcel;
                                              this.setState({
                                                mergedConsumptionJexcel: mergedConsumptionJexcel,
                                                dataSourceList: dataSourceList,
                                                realmCountryPlanningUnitList: realmCountryPlanningUnitList,
                                                planningUnitList: planningUnitList,
                                                regionList: regionList,
                                                shipmentStatusList: shipmentStatusList,
                                                budgetList: budgetList,
                                                fundingSourceList: fundingSourceList,
                                                procurementAgentList: procurementAgentList
                                              })
                                              var latestProgramDataInventory = latestProgramData.inventoryList;
                                              var oldProgramDataInventory = oldProgramData.inventoryList;
                                              var downloadedProgramDataInventory = downloadedProgramData.inventoryList;
                                              var modifiedInventoryIds = []
                                              latestProgramDataInventory.filter(c => c.versionId > oldProgramData.currentVersion.versionId).map(item => { modifiedInventoryIds.push(item.inventoryId) });
                                              oldProgramDataInventory.filter(c => moment(c.lastModifiedDate).format("YYYY-MM-DD HH:mm:ss") > moment(oldProgramData.currentVersion.createdDate).format("YYYY-MM-DD HH:mm:ss")).map(item => modifiedInventoryIds.push(item.inventoryId));
                                              var latestModifiedInventoryData = latestProgramDataInventory.filter(c => modifiedInventoryIds.includes(c.inventoryId));
                                              var oldModifiedInventoryData = oldProgramDataInventory.filter(c => c.inventoryId == 0 || modifiedInventoryIds.includes(c.inventoryId));
                                              var mergedInventoryData = [];
                                              var existingInventoryId = [];
                                              for (var c = 0; c < oldModifiedInventoryData.length; c++) {
                                                if (oldModifiedInventoryData[c].inventoryId != 0) {
                                                  mergedInventoryData.push(oldModifiedInventoryData[c]);
                                                  existingInventoryId.push(oldModifiedInventoryData[c].inventoryId);
                                                } else {
                                                  var index = 0;
                                                  if (oldModifiedInventoryData[c].actualQty != null && oldModifiedInventoryData[c].actualQty != "" && oldModifiedInventoryData[c].actualQty != undefined) {
                                                    index = latestProgramDataInventory.findIndex(f =>
                                                      f.planningUnit.id == oldModifiedInventoryData[c].planningUnit.id &&
                                                      moment(f.inventoryDate).format("YYYY-MM") == moment(oldModifiedInventoryData[c].inventoryDate).format("YYYY-MM") &&
                                                      f.region != null && f.region.id != 0 && oldModifiedInventoryData[c].region != null && oldModifiedInventoryData[c].region.id != 0 && f.region.id == oldModifiedInventoryData[c].region.id &&
                                                      (f.actualQty != null && f.actualQty.toString() != "" && f.actualQty != undefined) == (oldModifiedInventoryData[c].actualQty != null && oldModifiedInventoryData[c].actualQty != "" && oldModifiedInventoryData[c].actualQty != undefined) &&
                                                      f.realmCountryPlanningUnit.id == oldModifiedInventoryData[c].realmCountryPlanningUnit.id &&
                                                      f.dataSource.id == oldModifiedInventoryData[c].dataSource.id &&
                                                      !existingInventoryId.includes(f.inventoryId)
                                                    );
                                                  } else {
                                                    index = -1;
                                                  }
                                                  if (index == -1) {
                                                    mergedInventoryData.push(oldModifiedInventoryData[c]);
                                                  } else {
                                                    oldModifiedInventoryData[c].inventoryId = latestProgramDataInventory[index].inventoryId;
                                                    var index1 = oldProgramDataInventory.findIndex(f =>
                                                      f.planningUnit.id == oldModifiedInventoryData[c].planningUnit.id &&
                                                      moment(f.inventoryDate).format("YYYY-MM") == moment(oldModifiedInventoryData[c].inventoryDate).format("YYYY-MM") &&
                                                      f.region != null && f.region.id != 0 && oldModifiedInventoryData[c].region != null && oldModifiedInventoryData[c].region.id != 0 && f.region.id == oldModifiedInventoryData[c].region.id &&
                                                      (f.actualQty != null && f.actualQty.toString() != "" && f.actualQty != undefined) == (oldModifiedInventoryData[c].actualQty != null && oldModifiedInventoryData[c].actualQty != "" && oldModifiedInventoryData[c].actualQty != undefined) &&
                                                      f.realmCountryPlanningUnit.id == oldModifiedInventoryData[c].realmCountryPlanningUnit.id &&
                                                      f.dataSource.id == oldModifiedInventoryData[c].dataSource.id &&
                                                      !existingInventoryId.includes(f.inventoryId)
                                                    );
                                                    oldProgramDataInventory[index1].inventoryId = latestProgramDataInventory[index].inventoryId;
                                                    oldProgramDataInventory[index1].versionId = latestProgramDataInventory[index].versionId;
                                                    existingInventoryId.push(latestProgramDataInventory[index].inventoryId);
                                                    mergedInventoryData.push(oldModifiedInventoryData[c]);
                                                  }
                                                }
                                              }
                                              var latestOtherInventoryEntries = latestModifiedInventoryData.filter(c => !(existingInventoryId.includes(c.inventoryId)));
                                              mergedInventoryData = mergedInventoryData.concat(latestOtherInventoryEntries);
                                              var data = [];
                                              var mergedInventoryJexcel = [];
                                              for (var cd = 0; cd < mergedInventoryData.length; cd++) {
                                                if (mergedInventoryData[cd].region != null && mergedInventoryData[cd].region.id != 0) {
                                                  data = [];
                                                  data[0] = mergedInventoryData[cd].inventoryId;
                                                  data[1] = mergedInventoryData[cd].planningUnit.id;
                                                  data[2] = moment(mergedInventoryData[cd].inventoryDate).format(DATE_FORMAT_CAP_WITHOUT_DATE);
                                                  data[3] = mergedInventoryData[cd].region.id;
                                                  data[4] = mergedInventoryData[cd].dataSource.id;
                                                  data[5] = mergedInventoryData[cd].realmCountryPlanningUnit.id;
                                                  data[6] = mergedInventoryData[cd].adjustmentQty != "" && mergedInventoryData[cd].adjustmentQty != null && mergedInventoryData[cd].adjustmentQty != undefined ? 2 : 1;
                                                  data[7] = Math.round(mergedInventoryData[cd].adjustmentQty);
                                                  data[8] = Math.round(mergedInventoryData[cd].actualQty);
                                                  data[9] = mergedInventoryData[cd].multiplier;
                                                  data[10] = Math.round(Math.round(mergedInventoryData[cd].adjustmentQty) * mergedInventoryData[cd].multiplier);
                                                  data[11] = Math.round(Math.round(mergedInventoryData[cd].actualQty) * mergedInventoryData[cd].multiplier);
                                                  data[12] = mergedInventoryData[cd].notes;
                                                  data[13] = mergedInventoryData[cd].active;
                                                  data[14] = JSON.stringify(mergedInventoryData[cd].batchInfoList != "" ? ((mergedInventoryData[cd].batchInfoList).map(function (a) { return { "batchNo": a.batch.batchNo, "qty1": parseInt(a.adjustmentQty), "qty2": parseInt(a.actualQty) } })).sort(function (a, b) { return a.qty1 - b.qty1; }) : "");
                                                  data[15] = "";
                                                  var oldDataList = oldProgramDataInventory.filter(c => c.inventoryId == mergedInventoryData[cd].inventoryId && c.region != null && c.region.id != 0);
                                                  var oldData = ""
                                                  if (oldDataList.length > 0) {
                                                    oldData = [oldDataList[0].inventoryId, oldDataList[0].planningUnit.id, moment(oldDataList[0].inventoryDate).format(DATE_FORMAT_CAP_WITHOUT_DATE), oldDataList[0].region.id, oldDataList[0].dataSource.id, oldDataList[0].realmCountryPlanningUnit.id, oldDataList[0].adjustmentQty != "" && oldDataList[0].adjustmentQty != null && oldDataList[0].adjustmentQty != undefined ? 2 : 1, Math.round(oldDataList[0].adjustmentQty), Math.round(oldDataList[0].actualQty), oldDataList[0].multiplier, Math.round(Math.round(oldDataList[0].adjustmentQty) * oldDataList[0].multiplier), Math.round(Math.round(oldDataList[0].actualQty) * oldDataList[0].multiplier), oldDataList[0].notes, oldDataList[0].active, JSON.stringify(oldDataList[0].batchInfoList != "" ? ((oldDataList[0].batchInfoList).map(function (a) { return { "batchNo": a.batch.batchNo, "qty1": parseInt(a.adjustmentQty), "qty2": parseInt(a.actualQty) } })).sort(function (a, b) { return a.qty1 - b.qty1; }) : ""), "", "", "", "", 4];
                                                  }
                                                  data[16] = oldData;
                                                  var latestDataList = latestProgramDataInventory.filter(c => c.inventoryId == mergedInventoryData[cd].inventoryId && c.region != null && c.region.id != 0);
                                                  var latestData = ""
                                                  if (latestDataList.length > 0) {
                                                    latestData = [latestDataList[0].inventoryId, latestDataList[0].planningUnit.id, moment(latestDataList[0].inventoryDate).format(DATE_FORMAT_CAP_WITHOUT_DATE), latestDataList[0].region.id, latestDataList[0].dataSource.id, latestDataList[0].realmCountryPlanningUnit.id, latestDataList[0].adjustmentQty != "" && latestDataList[0].adjustmentQty != null && latestDataList[0].adjustmentQty != undefined ? 2 : 1, Math.round(latestDataList[0].adjustmentQty), Math.round(latestDataList[0].actualQty), latestDataList[0].multiplier, Math.round(Math.round(latestDataList[0].adjustmentQty) * latestDataList[0].multiplier), Math.round(Math.round(latestDataList[0].actualQty) * latestDataList[0].multiplier), latestDataList[0].notes, latestDataList[0].active, JSON.stringify(latestDataList[0].batchInfoList != "" ? ((latestDataList[0].batchInfoList).map(function (a) { return { "batchNo": a.batch.batchNo, "qty1": parseInt(a.adjustmentQty), "qty2": parseInt(a.actualQty) } })).sort(function (a, b) { return a.qty1 - b.qty1; }) : ""), "", "", "", "", 4];
                                                  }
                                                  data[17] = latestData;
                                                  var downloadedDataList = downloadedProgramDataInventory.filter(c => c.inventoryId == mergedInventoryData[cd].inventoryId && c.region != null && c.region.id != 0);
                                                  var downloadedData = "";
                                                  if (downloadedDataList.length > 0) {
                                                    downloadedData = [downloadedDataList[0].inventoryId, downloadedDataList[0].planningUnit.id, moment(downloadedDataList[0].inventoryDate).format(DATE_FORMAT_CAP_WITHOUT_DATE), downloadedDataList[0].region.id, downloadedDataList[0].dataSource.id, downloadedDataList[0].realmCountryPlanningUnit.id, downloadedDataList[0].adjustmentQty != "" && downloadedDataList[0].adjustmentQty != null && downloadedDataList[0].adjustmentQty != undefined ? 2 : 1, Math.round(downloadedDataList[0].adjustmentQty), Math.round(downloadedDataList[0].actualQty), downloadedDataList[0].multiplier, Math.round(Math.round(downloadedDataList[0].adjustmentQty) * downloadedDataList[0].multiplier), Math.round(Math.round(downloadedDataList[0].actualQty) * downloadedDataList[0].multiplier), downloadedDataList[0].notes, downloadedDataList[0].active, JSON.stringify(downloadedDataList[0].batchInfoList != "" ? ((downloadedDataList[0].batchInfoList).map(function (a) { return { "batchNo": a.batch.batchNo, "qty1": parseInt(a.adjustmentQty), "qty2": parseInt(a.actualQty) } })).sort(function (a, b) { return a.qty1 - b.qty1; }) : ""), "", "", "", "", 4];
                                                  }
                                                  data[18] = downloadedData;
                                                  data[19] = 4;
                                                  mergedInventoryJexcel.push(data);
                                                }
                                              }
                                              var options = {
                                                data: mergedInventoryJexcel,
                                                columnDrag: false,
                                                columns: [
                                                  { title: i18n.t('static.commit.inventoryId'), type: 'hidden', width: 100 },
                                                  { title: i18n.t('static.planningunit.planningunit'), type: 'dropdown', source: planningUnitList, width: 200 },
                                                  { title: i18n.t('static.inventory.inventoryDate'), type: 'text', width: 85 },
                                                  { title: i18n.t('static.region.region'), type: 'dropdown', source: regionList, width: 100 },
                                                  { title: i18n.t('static.inventory.dataSource'), type: 'dropdown', source: dataSourceList, width: 100 },
                                                  { title: i18n.t('static.supplyPlan.alternatePlanningUnit'), type: 'dropdown', source: realmCountryPlanningUnitList, width: 150 },
                                                  { title: i18n.t('static.supplyPlan.inventoryType'), type: 'dropdown', source: [{ id: 1, name: i18n.t('static.inventory.inventory') }, { id: 2, name: i18n.t('static.inventoryType.adjustment') }], width: 100 },
                                                  { title: i18n.t('static.inventory.adjustmentQunatity'), type: 'numeric', mask: '[-]#,##', width: 120 },
                                                  { title: i18n.t('static.inventory.inventoryQunatity'), type: 'numeric', mask: '#,##', width: 120 },
                                                  { title: i18n.t('static.unit.multiplier'), type: 'numeric', mask: '#,##.000000', decimal: '.', width: 90, },
                                                  { title: i18n.t('static.inventory.adjustmentQunatityPU'), type: 'numeric', mask: '[-]#,##', width: 120, },
                                                  { title: i18n.t('static.inventory.inventoryQunatityPU'), type: 'numeric', mask: '#,##', width: 120, },
                                                  { title: i18n.t('static.program.notes'), type: 'text', width: 200 },
                                                  { title: i18n.t('static.inventory.active'), type: 'checkbox', width: 70 },
                                                  { type: 'hidden', title: i18n.t('static.supplyPlan.batchInfo'), width: 0 },
                                                  { type: 'text', title: i18n.t('static.supplyPlan.batchInfo'), width: 90 },
                                                  { type: 'hidden', title: 'Old data' },
                                                  { type: 'hidden', title: 'latest data' },
                                                  { type: 'hidden', title: 'downloaded data' },
                                                  { type: 'hidden', title: 'result of compare' },
                                                ],
                                                pagination: localStorage.getItem("sesRecordCount"),
                                                paginationOptions: JEXCEL_PAGINATION_OPTION,
                                                search: true,
                                                columnSorting: true,
                                                wordWrap: true,
                                                allowInsertColumn: false,
                                                allowManualInsertColumn: false,
                                                allowDeleteRow: false,
                                                onload: this.loadedFunctionForMergeInventory,
                                                filters: true,
                                                license: JEXCEL_PRO_KEY,
                                                contextMenu: function (obj, x, y, e) {
                                                  var items = [];
                                                  var rowData = obj.getRowData(y)
                                                  if (rowData[19].toString() == 1) {
                                                    items.push({
                                                      title: "Resolve conflicts",
                                                      onclick: function () {
                                                        this.setState({ loading: true })
                                                        this.toggleLargeInventory(rowData[16], rowData[17], y, 'inventory');
                                                      }.bind(this)
                                                    })
                                                  } else {
                                                    return false;
                                                  }
                                                  return items;
                                                }.bind(this)
                                              };
                                              var mergedInventoryJexcel = jexcel(document.getElementById("mergedVersionInventory"), options);
                                              this.el = mergedInventoryJexcel;
                                              this.setState({
                                                mergedInventoryJexcel: mergedInventoryJexcel
                                              })
                                              var latestProgramDataBatchInfo = latestProgramData.batchInfoList;
                                              var oldProgramDataBatchInfo = oldProgramData.batchInfoList;
                                              var latestProgramDataShipment = latestProgramData.shipmentList;
                                              var oldProgramDataShipment = oldProgramData.shipmentList;
                                              var downloadedProgramDataShipment = downloadedProgramData.shipmentList;
                                              var modifiedShipmentIds = []
                                              latestProgramDataShipment.filter(c => c.versionId > oldProgramData.currentVersion.versionId || moment(c.lastModifiedDate).format("YYYY-MM-DD HH:mm:ss") > moment(oldProgramData.currentVersion.createdDate).format("YYYY-MM-DD HH:mm:ss")).map(item => { modifiedShipmentIds.push(item.shipmentId) });
                                              oldProgramDataShipment.filter(c => moment(c.lastModifiedDate).format("YYYY-MM-DD HH:mm:ss") > moment(oldProgramData.currentVersion.createdDate).format("YYYY-MM-DD HH:mm:ss")).map(item => modifiedShipmentIds.push(item.shipmentId));
                                              var latestModifiedShipmentData = latestProgramDataShipment.filter(c => modifiedShipmentIds.includes(c.shipmentId));
                                              var oldModifiedShipmentData = oldProgramDataShipment.filter(c => c.shipmentId == 0 || modifiedShipmentIds.includes(c.shipmentId));
                                              var mergedShipmentData = [];
                                              var existingShipmentId = [];
                                              for (var c = 0; c < oldModifiedShipmentData.length; c++) {
                                                if (oldModifiedShipmentData[c].shipmentId != 0) {
                                                  if ((oldModifiedShipmentData[c].budget.id == "undefined" || oldModifiedShipmentData[c].budget.id == undefined) && oldModifiedShipmentData[c].active.toString() == "false") {
                                                    oldModifiedShipmentData[c].budget.id = '';
                                                  }
                                                  mergedShipmentData.push(oldModifiedShipmentData[c]);
                                                  existingShipmentId.push(oldModifiedShipmentData[c].shipmentId);
                                                } else {
                                                  if (oldModifiedShipmentData[c].active.toString() == "true") {
                                                    mergedShipmentData.push(oldModifiedShipmentData[c]);
                                                  }
                                                }
                                              }
                                              var latestOtherShipmentEntries = latestModifiedShipmentData.filter(c => !(existingShipmentId.includes(c.shipmentId)));
                                              mergedShipmentData = mergedShipmentData.concat(latestOtherShipmentEntries);
                                              var data = [];
                                              var mergedShipmentJexcel = [];
                                              for (var cd = 0; cd < mergedShipmentData.length; cd++) {
                                                data = [];
                                                data[0] = mergedShipmentData[cd].shipmentId;
                                                data[1] = mergedShipmentData[cd].planningUnit.id;
                                                data[2] = mergedShipmentData[cd].shipmentStatus.id;
                                                data[3] = moment(mergedShipmentData[cd].expectedDeliveryDate).format(DATE_FORMAT_CAP);
                                                data[4] = mergedShipmentData[cd].procurementAgent.id;
                                                data[5] = mergedShipmentData[cd].fundingSource.id;
                                                data[6] = mergedShipmentData[cd].budget.id;
                                                data[7] = mergedShipmentData[cd].orderNo != "" && mergedShipmentData[cd].orderNo != null ? mergedShipmentData[cd].orderNo.toString().concat(mergedShipmentData[cd].primeLineNo != null ? "~" : "").concat(mergedShipmentData[cd].primeLineNo != null ? mergedShipmentData[cd].primeLineNo : "") : "";
                                                data[8] = mergedShipmentData[cd].dataSource.id;
                                                data[9] = mergedShipmentData[cd].shipmentMode == "Air" ? 2 : mergedShipmentData[cd].shipmentMode == "Road" ? 3 : 1;
                                                data[10] = mergedShipmentData[cd].realmCountryPlanningUnit.id;
                                                data[11] = mergedShipmentData[cd].suggestedQty;
                                                data[12] = mergedShipmentData[cd].shipmentRcpuQty;
                                                data[13] = mergedShipmentData[cd].realmCountryPlanningUnit.multiplier;
                                                data[14] = mergedShipmentData[cd].shipmentQty;
                                                data[15] = mergedShipmentData[cd].currency.currencyId;
                                                data[16] = parseFloat(mergedShipmentData[cd].rate).toFixed(2);
                                                data[17] = parseFloat(mergedShipmentData[cd].rate).toFixed(2) * mergedShipmentData[cd].shipmentQty;
                                                data[18] = parseFloat(mergedShipmentData[cd].freightCost).toFixed(2);
                                                data[19] = mergedShipmentData[cd].plannedDate != "" && mergedShipmentData[cd].plannedDate != null ? moment(mergedShipmentData[cd].plannedDate).format(DATE_FORMAT_CAP) : "";
                                                data[20] = mergedShipmentData[cd].submittedDate != "" && mergedShipmentData[cd].submittedDate != null ? moment(mergedShipmentData[cd].submittedDate).format(DATE_FORMAT_CAP) : "";
                                                data[21] = mergedShipmentData[cd].approvedDate != "" && mergedShipmentData[cd].approvedDate != null ? moment(mergedShipmentData[cd].approvedDate).format(DATE_FORMAT_CAP) : "";
                                                data[22] = mergedShipmentData[cd].shippedDate != "" && mergedShipmentData[cd].shippedDate != null ? moment(mergedShipmentData[cd].shippedDate).format(DATE_FORMAT_CAP) : "";
                                                data[23] = mergedShipmentData[cd].arrivedDate != "" && mergedShipmentData[cd].arrivedDate != null ? moment(mergedShipmentData[cd].arrivedDate).format(DATE_FORMAT_CAP) : "";
                                                data[24] = mergedShipmentData[cd].receivedDate != "" && mergedShipmentData[cd].receivedDate != null ? moment(mergedShipmentData[cd].receivedDate).format(DATE_FORMAT_CAP) : "";
                                                data[25] = mergedShipmentData[cd].notes;
                                                data[26] = mergedShipmentData[cd].erpFlag;
                                                data[27] = mergedShipmentData[cd].emergencyOrder;
                                                data[28] = mergedShipmentData[cd].accountFlag;
                                                data[29] = mergedShipmentData[cd].active;
                                                data[30] = mergedShipmentData[cd].localProcurement;
                                                data[31] = JSON.stringify(mergedShipmentData[cd].batchInfoList != "" ? ((mergedShipmentData[cd].batchInfoList).map(function (a) { return { "batchNo": a.batch.batchNo, "qty": parseInt(a.shipmentQty) } })).sort(function (a, b) { return a.qty - b.qty; }) : "");
                                                data[32] = "";
                                                var oldDataList = oldProgramDataShipment.filter(c => c.shipmentId == mergedShipmentData[cd].shipmentId);
                                                var oldData = ""
                                                if (oldDataList.length > 0) {
                                                  oldData = [oldDataList[0].shipmentId, oldDataList[0].planningUnit.id, oldDataList[0].shipmentStatus.id, moment(oldDataList[0].expectedDeliveryDate).format(DATE_FORMAT_CAP), oldDataList[0].procurementAgent.id, oldDataList[0].fundingSource.id, oldDataList[0].budget.id, oldDataList[0].orderNo != "" && oldDataList[0].orderNo != null ? oldDataList[0].orderNo.toString().concat(oldDataList[0].primeLineNo != null ? "~" : "").concat(oldDataList[0].primeLineNo != null ? oldDataList[0].primeLineNo : "") : "", oldDataList[0].dataSource.id, oldDataList[0].shipmentMode == "Air" ? 2 : oldDataList[0].shipmentMode == "Road" ? 3 : 1, oldDataList[0].realmCountryPlanningUnit.id, oldDataList[0].suggestedQty, oldDataList[0].shipmentRcpuQty, oldDataList[0].realmCountryPlanningUnit.multiplier, oldDataList[0].shipmentQty, oldDataList[0].currency.currencyId, parseFloat(oldDataList[0].rate).toFixed(2), parseFloat(oldDataList[0].rate).toFixed(2) * oldDataList[0].shipmentQty, parseFloat(oldDataList[0].freightCost).toFixed(2), oldDataList[0].plannedDate != "" && oldDataList[0].plannedDate != null ? moment(oldDataList[0].plannedDate).format(DATE_FORMAT_CAP) : "", oldDataList[0].submittedDate != "" && oldDataList[0].submittedDate != null ? moment(oldDataList[0].submittedDate).format(DATE_FORMAT_CAP) : "", oldDataList[0].approvedDate != "" && oldDataList[0].approvedDate != null ? moment(oldDataList[0].approvedDate).format(DATE_FORMAT_CAP) : "", oldDataList[0].shippedDate != "" && oldDataList[0].shippedDate != null ? moment(oldDataList[0].shippedDate).format(DATE_FORMAT_CAP) : "", oldDataList[0].arrivedDate != "" && oldDataList[0].arrivedDate != null ? moment(oldDataList[0].arrivedDate).format(DATE_FORMAT_CAP) : "", oldDataList[0].receivedDate != "" && oldDataList[0].receivedDate != null ? moment(oldDataList[0].receivedDate).format(DATE_FORMAT_CAP) : "", oldDataList[0].notes, oldDataList[0].erpFlag, oldDataList[0].emergencyOrder, oldDataList[0].accountFlag, oldDataList[0].active, oldDataList[0].localProcurement, JSON.stringify(oldDataList[0].batchInfoList != "" ? ((oldDataList[0].batchInfoList).map(function (a) { return { "batchNo": a.batch.batchNo, "qty": parseInt(a.shipmentQty) } })).sort(function (a, b) { return a.qty - b.qty; }) : ""), "", "", "", "", 4];
                                                }
                                                data[33] = oldData;
                                                var latestDataList = latestProgramDataShipment.filter(c => c.shipmentId == mergedShipmentData[cd].shipmentId);
                                                var latestData = ""
                                                if (latestDataList.length > 0) {
                                                  latestData = [latestDataList[0].shipmentId, latestDataList[0].planningUnit.id, latestDataList[0].shipmentStatus.id, moment(latestDataList[0].expectedDeliveryDate).format(DATE_FORMAT_CAP), latestDataList[0].procurementAgent.id, latestDataList[0].fundingSource.id, latestDataList[0].budget.id, latestDataList[0].orderNo != "" && latestDataList[0].orderNo != null ? latestDataList[0].orderNo.toString().concat(latestDataList[0].primeLineNo != null ? "~" : "").concat(latestDataList[0].primeLineNo != null ? latestDataList[0].primeLineNo : "") : "", latestDataList[0].dataSource.id, latestDataList[0].shipmentMode == "Air" ? 2 : latestDataList[0].shipmentMode == "Road" ? 3 : 1, latestDataList[0].realmCountryPlanningUnit.id, latestDataList[0].suggestedQty, latestDataList[0].shipmentRcpuQty, latestDataList[0].realmCountryPlanningUnit.multiplier, latestDataList[0].shipmentQty, latestDataList[0].currency.currencyId, parseFloat(latestDataList[0].rate).toFixed(2), parseFloat(latestDataList[0].rate).toFixed(2) * latestDataList[0].shipmentQty, parseFloat(latestDataList[0].freightCost).toFixed(2), latestDataList[0].plannedDate != "" && latestDataList[0].plannedDate != null ? moment(latestDataList[0].plannedDate).format(DATE_FORMAT_CAP) : "", latestDataList[0].submittedDate != "" && latestDataList[0].submittedDate != null ? moment(latestDataList[0].submittedDate).format(DATE_FORMAT_CAP) : "", latestDataList[0].approvedDate != "" && latestDataList[0].approvedDate != null ? moment(latestDataList[0].approvedDate).format(DATE_FORMAT_CAP) : "", latestDataList[0].shippedDate != "" && latestDataList[0].shippedDate != null ? moment(latestDataList[0].shippedDate).format(DATE_FORMAT_CAP) : "", latestDataList[0].arrivedDate != "" && latestDataList[0].arrivedDate != null ? moment(latestDataList[0].arrivedDate).format(DATE_FORMAT_CAP) : "", latestDataList[0].receivedDate != "" && latestDataList[0].receivedDate != null ? moment(latestDataList[0].receivedDate).format(DATE_FORMAT_CAP) : "", latestDataList[0].notes, latestDataList[0].erpFlag, latestDataList[0].emergencyOrder, latestDataList[0].accountFlag, latestDataList[0].active, latestDataList[0].localProcurement, JSON.stringify(latestDataList[0].batchInfoList != "" ? ((latestDataList[0].batchInfoList).map(function (a) { return { "batchNo": a.batch.batchNo, "qty": parseInt(a.shipmentQty) } })).sort(function (a, b) { return a.qty - b.qty; }) : ""), "", "", "", "", 4];
                                                }
                                                data[34] = latestData;
                                                var downloadedDataList = downloadedProgramDataShipment.filter(c => c.shipmentId == mergedShipmentData[cd].shipmentId);
                                                var downloadedData = "";
                                                if (downloadedDataList.length > 0) {
                                                  downloadedData = [downloadedDataList[0].shipmentId, downloadedDataList[0].planningUnit.id, downloadedDataList[0].shipmentStatus.id, moment(downloadedDataList[0].expectedDeliveryDate).format(DATE_FORMAT_CAP), downloadedDataList[0].procurementAgent.id, downloadedDataList[0].fundingSource.id, downloadedDataList[0].budget.id, downloadedDataList[0].orderNo != "" && downloadedDataList[0].orderNo != null ? downloadedDataList[0].orderNo.toString().concat(downloadedDataList[0].primeLineNo != null ? "~" : "").concat(downloadedDataList[0].primeLineNo != null ? downloadedDataList[0].primeLineNo : "") : "", downloadedDataList[0].dataSource.id, downloadedDataList[0].shipmentMode == "Air" ? 2 : downloadedDataList[0].shipmentMode == "Road" ? 3 : 1, downloadedDataList[0].realmCountryPlanningUnit.id, downloadedDataList[0].suggestedQty, downloadedDataList[0].shipmentRcpuQty, downloadedDataList[0].realmCountryPlanningUnit.multiplier, downloadedDataList[0].shipmentQty, downloadedDataList[0].currency.currencyId, parseFloat(downloadedDataList[0].rate).toFixed(2), parseFloat(downloadedDataList[0].rate).toFixed(2) * downloadedDataList[0].shipmentQty, parseFloat(downloadedDataList[0].freightCost).toFixed(2), downloadedDataList[0].plannedDate != "" && downloadedDataList[0].plannedDate != null ? moment(downloadedDataList[0].plannedDate).format(DATE_FORMAT_CAP) : "", downloadedDataList[0].submittedDate != "" && downloadedDataList[0].submittedDate != null ? moment(downloadedDataList[0].submittedDate).format(DATE_FORMAT_CAP) : "", downloadedDataList[0].approvedDate != "" && downloadedDataList[0].approvedDate != null ? moment(downloadedDataList[0].approvedDate).format(DATE_FORMAT_CAP) : "", downloadedDataList[0].shippedDate != "" && downloadedDataList[0].shippedDate != null ? moment(downloadedDataList[0].shippedDate).format(DATE_FORMAT_CAP) : "", downloadedDataList[0].arrivedDate != "" && downloadedDataList[0].arrivedDate != null ? moment(downloadedDataList[0].arrivedDate).format(DATE_FORMAT_CAP) : "", downloadedDataList[0].receivedDate != "" && downloadedDataList[0].receivedDate != null ? moment(downloadedDataList[0].receivedDate).format(DATE_FORMAT_CAP) : "", downloadedDataList[0].notes, downloadedDataList[0].erpFlag, downloadedDataList[0].emergencyOrder, downloadedDataList[0].accountFlag, downloadedDataList[0].active, downloadedDataList[0].localProcurement, JSON.stringify(downloadedDataList[0].batchInfoList != "" ? ((downloadedDataList[0].batchInfoList).map(function (a) { return { "batchNo": a.batch.batchNo, "qty": parseInt(a.shipmentQty) } })).sort(function (a, b) { return a.qty - b.qty; }) : ""), "", "", "", "", 4];
                                                }
                                                data[35] = downloadedData;
                                                data[36] = 4;
                                                mergedShipmentJexcel.push(data);
                                              }
                                              var options = {
                                                data: mergedShipmentJexcel,
                                                columnDrag: false,
                                                columns: [
                                                  { title: i18n.t('static.commit.shipmentId'), type: 'hidden', width: 100 },
                                                  { title: i18n.t('static.planningunit.planningunit'), type: 'dropdown', source: planningUnitList, width: 200 },
                                                  { type: 'dropdown', title: i18n.t('static.supplyPlan.shipmentStatus'), source: shipmentStatusList, width: 100 },
                                                  { type: 'text', title: i18n.t('static.supplyPlan.expectedDeliveryDate'), width: 100, },
                                                  { type: 'dropdown', title: i18n.t('static.procurementagent.procurementagent'), source: procurementAgentList, width: 120 },
                                                  { type: 'dropdown', title: i18n.t('static.subfundingsource.fundingsource'), source: fundingSourceList, width: 120 },
                                                  { type: 'dropdown', title: i18n.t('static.dashboard.budget'), source: budgetList, width: 120 },
                                                  { type: 'text', title: i18n.t('static.supplyPlan.orderNoAndPrimeLineNo'), width: 150 },
                                                  { type: 'dropdown', title: i18n.t('static.datasource.datasource'), source: dataSourceList, width: 150 },
                                                  { type: 'dropdown', title: i18n.t("static.supplyPlan.shipmentMode"), source: [{ id: 1, name: i18n.t('static.supplyPlan.sea') }, { id: 2, name: i18n.t('static.supplyPlan.air') }, { id: 3, name: i18n.t('static.dataentry.road') }], width: 100 },
                                                  { type: 'dropdown', title: i18n.t('static.supplyPlan.alternatePlanningUnit'), source: this.state.realmCountryPlanningUnitList, width: 150 },
                                                  { type: 'hidden', title: i18n.t("static.shipment.suggestedQty"), width: 100, mask: '#,##' },
                                                  { type: 'numeric', title: i18n.t("static.shipment.shipmentQtyARU"), width: 100, mask: '#,##' },
                                                  { title: i18n.t('static.unit.multiplierFromARUTOPU'), type: 'numeric', mask: '#,##0.00', decimal: '.', width: 90 },
                                                  { title: i18n.t('static.shipment.shipmentQtyPU'), type: 'numeric', mask: '#,##', width: 120 },
                                                  { type: 'dropdown', title: i18n.t('static.dashboard.currency'), source: currencyList, width: 120 },
                                                  { type: 'numeric', title: i18n.t('static.supplyPlan.pricePerPlanningUnit'), width: 80, mask: '#,##.00', decimal: '.' },
                                                  { type: 'numeric', title: i18n.t('static.shipment.productcost'), width: 80, mask: '#,##.00', decimal: '.' },
                                                  { type: 'numeric', title: i18n.t('static.shipment.freightcost'), width: 80, mask: '#,##.00', decimal: '.' },
                                                  { type: 'text', title: i18n.t('static.supplyPlan.plannedDate'), width: 100, },
                                                  { type: 'text', title: i18n.t('static.supplyPlan.submittedDate'), width: 100, },
                                                  { type: 'text', title: i18n.t('static.supplyPlan.approvedDate'), width: 100, },
                                                  { type: 'text', title: i18n.t('static.supplyPlan.shippedDate'), width: 100, },
                                                  { type: 'text', title: i18n.t('static.supplyPlan.arrivedDate'), width: 100, },
                                                  { type: 'text', title: i18n.t('static.shipment.receiveddate'), width: 100, },
                                                  { type: 'text', title: i18n.t('static.program.notes'), width: 200 },
                                                  { type: 'checkbox', title: i18n.t('static.supplyPlan.erpFlag'), width: 80 },
                                                  { type: 'checkbox', title: i18n.t('static.supplyPlan.emergencyOrder'), width: 80 },
                                                  { type: 'checkbox', title: i18n.t('static.common.accountFlag'), width: 80 },
                                                  { type: 'checkbox', title: i18n.t('static.common.active'), width: 80 },
                                                  { type: 'checkbox', title: i18n.t('static.report.localprocurement'), width: 80 },
                                                  { type: 'hidden', title: i18n.t('static.supplyPlan.batchInfo'), width: 0 },
                                                  { type: 'text', title: i18n.t('static.supplyPlan.batchInfo'), width: 90 },
                                                  { type: 'hidden', title: 'Old data' },
                                                  { type: 'hidden', title: 'latest data' },
                                                  { type: 'hidden', title: 'downloaded data' },
                                                  { type: 'hidden', title: 'result of compare' },
                                                ],
                                                pagination: localStorage.getItem("sesRecordCount"),
                                                paginationOptions: JEXCEL_PAGINATION_OPTION,
                                                search: true,
                                                columnSorting: true,
                                                wordWrap: true,
                                                allowInsertColumn: false,
                                                allowManualInsertColumn: false,
                                                allowDeleteRow: false,
                                                onload: this.loadedFunctionForMergeShipment,
                                                filters: true,
                                                license: JEXCEL_PRO_KEY,
                                                contextMenu: function (obj, x, y, e) {
                                                  var items = [];
                                                  var rowData = obj.getRowData(y)
                                                  if (rowData[36].toString() == 1) {
                                                    items.push({
                                                      title: "Resolve conflicts",
                                                      onclick: function () {
                                                        this.setState({ loading: true })
                                                        this.toggleLargeShipment(rowData[33], rowData[34], y, 'shipment');
                                                      }.bind(this)
                                                    })
                                                  } else {
                                                    return false;
                                                  }
                                                  return items;
                                                }.bind(this)
                                              };
                                              var mergedShipmentJexcel = jexcel(document.getElementById("mergedVersionShipment"), options);
                                              this.el = mergedShipmentJexcel;
                                              this.setState({
                                                mergedShipmentJexcel: mergedShipmentJexcel,
                                              })
                                              var latestProgramDataShipmentLinked = latestProgramData.shipmentLinkingList != null ? latestProgramData.shipmentLinkingList : [];
                                              var oldProgramDataShipmentLinked = oldProgramData.shipmentLinkingList != null ? oldProgramData.shipmentLinkingList.filter(c => c.shipmentLinkingId > 0 || (c.shipmentLinkingId == 0 && c.active == true)) : [];
                                              var downloadedProgramDataShipmentLinked = downloadedProgramData.shipmentLinkingList != null ? downloadedProgramData.shipmentLinkingList : [];
                                              var data = [];
                                              var mergedShipmentLinkedJexcel = [];
                                              var mergedData = (latestProgramDataShipmentLinked.concat(oldProgramDataShipmentLinked).concat(downloadedProgramDataShipmentLinked));
                                              var uniqueRoNoAndRoPrimeLineNo = [...new Set(mergedData.map(ele => ele.roNo + "|" + ele.roPrimeLineNo))];
                                              for (var cd = 0; cd < uniqueRoNoAndRoPrimeLineNo.length; cd++) {
                                                data = [];
                                                var latestProgramDataShipmentLinkedFiltered = latestProgramDataShipmentLinked.filter(c => uniqueRoNoAndRoPrimeLineNo[cd] == (c.roNo + "|" + c.roPrimeLineNo))
                                                if (latestProgramDataShipmentLinkedFiltered.filter(c => c.active.toString() == "true").length > 0) {
                                                  latestProgramDataShipmentLinkedFiltered = latestProgramDataShipmentLinkedFiltered.filter(c => c.active.toString() == "true");
                                                }
                                                var oldProgramDataShipmentLinkedFiltered = oldProgramDataShipmentLinked.filter(c => uniqueRoNoAndRoPrimeLineNo[cd] == (c.roNo + "|" + c.roPrimeLineNo))
                                                if (oldProgramDataShipmentLinkedFiltered.filter(c => c.active.toString() == "true").length > 0) {
                                                  oldProgramDataShipmentLinkedFiltered = oldProgramDataShipmentLinkedFiltered.filter(c => c.active.toString() == "true");
                                                }
                                                var downloadedProgramDataShipmentLinkedFiltered = downloadedProgramDataShipmentLinked.filter(c => uniqueRoNoAndRoPrimeLineNo[cd] == (c.roNo + "|" + c.roPrimeLineNo))
                                                if (downloadedProgramDataShipmentLinkedFiltered.filter(c => c.active.toString() == "true").length > 0) {
                                                  downloadedProgramDataShipmentLinkedFiltered = downloadedProgramDataShipmentLinkedFiltered.filter(c => c.active.toString() == "true");
                                                }
                                                var listFromAPI = responseLinking.data;
                                                var listFromAPIFiltered = listFromAPI.filter(c => uniqueRoNoAndRoPrimeLineNo[cd] == c.roNo + "|" + c.roPrimeLineNo);
                                                var arr = [];
                                                var arr1 = [];
                                                var arrDownloaded = [];
                                                if (listFromAPIFiltered.length > 0) {
                                                } else {
                                                  if (latestProgramDataShipmentLinkedFiltered.length > 0) {
                                                    arr.push(latestProgramDataShipmentLinkedFiltered[latestProgramDataShipmentLinkedFiltered.length - 1].parentShipmentId);
                                                    (latestProgramData.shipmentList.filter(c => latestProgramDataShipmentLinkedFiltered[latestProgramDataShipmentLinkedFiltered.length - 1].parentShipmentId == 0 ? c.tempParentLinkedShipmentId == latestProgramDataShipmentLinkedFiltered[latestProgramDataShipmentLinkedFiltered.length - 1].tempParentShipmentId : c.parentLinkedShipmentId == latestProgramDataShipmentLinkedFiltered[latestProgramDataShipmentLinkedFiltered.length - 1].parentShipmentId)).map(item => {
                                                      arr.push(item.shipmentId)
                                                    })
                                                  }
                                                }
                                                if (oldProgramDataShipmentLinkedFiltered.length > 0) {
                                                  arr1.push(oldProgramDataShipmentLinkedFiltered[oldProgramDataShipmentLinkedFiltered.length - 1].parentShipmentId);
                                                  (oldProgramData.shipmentList.filter(c => oldProgramDataShipmentLinkedFiltered[oldProgramDataShipmentLinkedFiltered.length - 1].parentShipmentId == 0 ? c.tempParentLinkedShipmentId == oldProgramDataShipmentLinkedFiltered[oldProgramDataShipmentLinkedFiltered.length - 1].tempParentShipmentId : c.parentLinkedShipmentId == oldProgramDataShipmentLinkedFiltered[oldProgramDataShipmentLinkedFiltered.length - 1].parentShipmentId)).map(item => {
                                                    arr1.push(item.shipmentId)
                                                  })
                                                }
                                                if (downloadedProgramDataShipmentLinkedFiltered.length > 0) {
                                                  arrDownloaded.push(downloadedProgramDataShipmentLinkedFiltered[downloadedProgramDataShipmentLinkedFiltered.length - 1].parentShipmentId);
                                                  (downloadedProgramData.shipmentList.filter(c => downloadedProgramDataShipmentLinkedFiltered[downloadedProgramDataShipmentLinkedFiltered.length - 1].parentShipmentId == 0 ? c.tempParentLinkedShipmentId == downloadedProgramDataShipmentLinkedFiltered[downloadedProgramDataShipmentLinkedFiltered.length - 1].tempParentShipmentId : c.parentLinkedShipmentId == downloadedProgramDataShipmentLinkedFiltered[downloadedProgramDataShipmentLinkedFiltered.length - 1].parentShipmentId)).map(item => {
                                                    arrDownloaded.push(item.shipmentId)
                                                  })
                                                }
                                                var oldShipmentDetails = oldProgramDataShipmentLinkedFiltered.length > 0 ? oldProgramData.shipmentList.filter(c => oldProgramDataShipmentLinkedFiltered[oldProgramDataShipmentLinkedFiltered.length - 1].childShipmentId > 0 ? c.shipmentId == oldProgramDataShipmentLinkedFiltered[oldProgramDataShipmentLinkedFiltered.length - 1].childShipmentId : c.tempShipmentId == oldProgramDataShipmentLinkedFiltered[oldProgramDataShipmentLinkedFiltered.length - 1].tempChildShipmentId) : [];
                                                var downloadedShipmentDetails = downloadedProgramDataShipmentLinkedFiltered.length > 0 ? downloadedProgramData.shipmentList.filter(c => downloadedProgramDataShipmentLinkedFiltered[downloadedProgramDataShipmentLinkedFiltered.length - 1].childShipmentId > 0 ? c.shipmentId == downloadedProgramDataShipmentLinkedFiltered[downloadedProgramDataShipmentLinkedFiltered.length - 1].childShipmentId : c.tempShipmentId == downloadedProgramDataShipmentLinkedFiltered[downloadedProgramDataShipmentLinkedFiltered.length - 1].tempChildShipmentId) : [];
                                                var latestShipmentDetails = latestProgramDataShipmentLinkedFiltered.length > 0 ? latestProgramData.shipmentList.filter(c => latestProgramDataShipmentLinkedFiltered[latestProgramDataShipmentLinkedFiltered.length - 1].childShipmentId > 0 ? c.shipmentId == latestProgramDataShipmentLinkedFiltered[latestProgramDataShipmentLinkedFiltered.length - 1].childShipmentId : c.tempShipmentId == latestProgramDataShipmentLinkedFiltered[latestProgramDataShipmentLinkedFiltered.length - 1].tempChildShipmentId) : [];
                                                var shipmentQtyLocal = 0;
                                                var shipmentQtyServer = 0;
                                                var shipmentQtyDownloaded = 0;
                                                var shipmentQtyOtherProgram = 0;
                                                oldProgramDataShipmentLinkedFiltered.map(item => {
                                                  var sl = oldProgramData.shipmentList.filter(c => item.childShipmentId > 0 ? c.shipmentId == item.childShipmentId : c.tempShipmentId == item.tempChildShipmentId);
                                                  shipmentQtyLocal += sl[0].shipmentQty;
                                                })
                                                downloadedProgramDataShipmentLinkedFiltered.map(item => {
                                                  var sl = downloadedProgramData.shipmentList.filter(c => item.childShipmentId > 0 ? c.shipmentId == item.childShipmentId : c.tempShipmentId == item.tempChildShipmentId);
                                                  shipmentQtyDownloaded += sl[0].shipmentQty;
                                                })
                                                latestProgramDataShipmentLinkedFiltered.map(item => {
                                                  var sl = latestProgramData.shipmentList.filter(c => item.childShipmentId > 0 ? c.shipmentId == item.childShipmentId : c.tempShipmentId == item.tempChildShipmentId)
                                                  shipmentQtyServer += sl[0].shipmentQty;
                                                })
                                                listFromAPIFiltered.map(item => {
                                                  shipmentQtyOtherProgram += item.shipmentQty
                                                })
                                                data[0] = uniqueRoNoAndRoPrimeLineNo[cd].split("|")[0] + " - " + uniqueRoNoAndRoPrimeLineNo[cd].split("|")[1];
                                                data[1] = uniqueRoNoAndRoPrimeLineNo[cd].split("|")[1];
                                                data[2] = oldProgramDataShipmentLinkedFiltered.length > 0 ? getLabelText(oldProgramData.label, this.state.lang) : "";
                                                data[3] = oldShipmentDetails.length > 0 ? getLabelText(oldShipmentDetails[0].planningUnit.label, this.state.lang) : ""
                                                data[4] = oldShipmentDetails.length > 0 ? getLabelText(oldShipmentDetails[0].realmCountryPlanningUnit.label, this.state.lang) : ""
                                                data[5] = oldProgramDataShipmentLinkedFiltered.length > 0 ? arr1 : "";
                                                data[6] = oldShipmentDetails.length > 0 ? oldShipmentDetails[0].realmCountryPlanningUnit.multiplier : "";
                                                data[7] = shipmentQtyLocal;
                                                data[8] = oldProgramDataShipmentLinkedFiltered.length > 0 ? oldProgramDataShipmentLinkedFiltered.filter(d => d.active == 1 || d.active == true).length > 0 ? true : false : false;
                                                data[9] = listFromAPIFiltered.length > 0 ? getLabelText(listFromAPIFiltered[0].program.label, this.state.lang) : latestProgramDataShipmentLinkedFiltered.length > 0 ? getLabelText(latestProgramData.label, this.state.lang) : "";
                                                data[10] = listFromAPIFiltered.length > 0 ? getLabelText(listFromAPIFiltered[listFromAPIFiltered.length - 1].planningUnit.label) : latestShipmentDetails.length > 0 ? getLabelText(latestShipmentDetails[0].planningUnit.label) : "";
                                                data[11] = listFromAPIFiltered.length > 0 ? getLabelText(listFromAPIFiltered[listFromAPIFiltered.length - 1].realmCountryPlanningUnit.label) : latestShipmentDetails.length > 0 ? getLabelText(latestShipmentDetails[0].realmCountryPlanningUnit.label) : "";
                                                data[12] = listFromAPIFiltered.length > 0 ? listFromAPIFiltered[listFromAPIFiltered.length - 1].shipmentId : latestProgramDataShipmentLinkedFiltered.length > 0 ? arr : "";
                                                data[13] = listFromAPIFiltered.length > 0 ? listFromAPIFiltered[listFromAPIFiltered.length - 1].realmCountryPlanningUnit.multiplier : latestShipmentDetails.length > 0 ? latestShipmentDetails[0].realmCountryPlanningUnit.multiplier : "";
                                                data[14] = listFromAPIFiltered.length > 0 ? shipmentQtyOtherProgram : latestProgramDataShipmentLinkedFiltered.length > 0 ? shipmentQtyServer : "";
                                                data[15] = listFromAPIFiltered.length > 0 ? true : latestProgramDataShipmentLinkedFiltered.length > 0 ? latestProgramDataShipmentLinkedFiltered.filter(d => d.active == 1 || d.active == true).length > 0 ? true : false : false;
                                                data[16] = listFromAPIFiltered.length > 0 ? listFromAPIFiltered[listFromAPIFiltered.length - 1].lastModifiedBy.username : latestShipmentDetails.length > 0 ? latestShipmentDetails[0].lastModifiedBy.username : "";
                                                data[17] = listFromAPIFiltered.length > 0 ? moment(listFromAPIFiltered[listFromAPIFiltered.length - 1].lastModifiedDate).format("YYYY-MM-DD") : latestShipmentDetails.length > 0 ? moment(latestShipmentDetails[0].lastModifiedDate).format("YYYY-MM-DD") : "";
                                                data[18] = oldProgramDataShipmentLinkedFiltered.length > 0 ? oldProgramDataShipmentLinkedFiltered[oldProgramDataShipmentLinkedFiltered.length - 1].shipmentLinkingId : "";
                                                data[19] = latestProgramDataShipmentLinkedFiltered.length > 0 ? latestProgramDataShipmentLinkedFiltered[latestProgramDataShipmentLinkedFiltered.length - 1].shipmentLinkingId : "";
                                                data[20] = downloadedProgramDataShipmentLinkedFiltered.length > 0 ? downloadedProgramDataShipmentLinkedFiltered[downloadedProgramDataShipmentLinkedFiltered.length - 1].shipmentLinkingId : "";
                                                data[21] = 4;
                                                data[22] = (oldProgramDataShipmentLinkedFiltered.length > 0 && latestProgramDataShipmentLinkedFiltered.length == 0) || (oldProgramDataShipmentLinkedFiltered.length == 0 && latestProgramDataShipmentLinkedFiltered.length > 0) ? (oldProgramDataShipmentLinkedFiltered.length > 0 && latestProgramDataShipmentLinkedFiltered.length == 0) ? oldProgramData.currentVersion.versionId : latestProgramData.currentVersion.versionId : "";
                                                data[23] = cd;
                                                data[24] = oldProgramData.currentVersion.versionId;
                                                data[25] = latestProgramData.currentVersion.versionId;
                                                data[26] = [];
                                                data[27] = oldProgramDataShipmentLinkedFiltered.length > 0 ? oldProgramDataShipmentLinkedFiltered[oldProgramDataShipmentLinkedFiltered.length - 1] : {};
                                                data[28] = latestProgramDataShipmentLinkedFiltered.length > 0 ? latestProgramDataShipmentLinkedFiltered[latestProgramDataShipmentLinkedFiltered.length - 1] : {};
                                                data[29] = downloadedProgramDataShipmentLinkedFiltered.length > 0 ? downloadedProgramDataShipmentLinkedFiltered[downloadedProgramDataShipmentLinkedFiltered.length - 1].active : ""
                                                data[30] = downloadedShipmentDetails.length > 0 ? getLabelText(downloadedShipmentDetails[0].planningUnit.label, this.state.lang) : ""
                                                data[31] = downloadedShipmentDetails.length > 0 ? getLabelText(downloadedShipmentDetails[0].realmCountryPlanningUnit.label, this.state.lang) : ""
                                                data[32] = downloadedProgramDataShipmentLinkedFiltered.length > 0 ? arrDownloaded : "";
                                                data[33] = downloadedShipmentDetails.length > 0 ? downloadedShipmentDetails[0].realmCountryPlanningUnit.multiplier : "";
                                                data[34] = shipmentQtyDownloaded;
                                                data[35] = downloadedProgramDataShipmentLinkedFiltered.length > 0 ? downloadedProgramDataShipmentLinkedFiltered[downloadedProgramDataShipmentLinkedFiltered.length - 1].active == 1 || downloadedProgramDataShipmentLinkedFiltered[downloadedProgramDataShipmentLinkedFiltered.length - 1].active == true ? true : false : false;
                                                data[36] = downloadedProgramDataShipmentLinkedFiltered.length > 0 ? downloadedProgramDataShipmentLinkedFiltered[downloadedProgramDataShipmentLinkedFiltered.length - 1].shipmentLinkingId : "";
                                                data[37] = oldProgramData.programId;
                                                data[38] = listFromAPIFiltered.length > 0 ? listFromAPIFiltered[0].program.id : latestProgramDataShipmentLinkedFiltered.length > 0 ? latestProgramData.programId : ""
                                                mergedShipmentLinkedJexcel.push(data);
                                              }
                                              var options = {
                                                data: mergedShipmentLinkedJexcel,
                                                columnDrag: false,
                                                nestedHeaders: [
                                                  [{
                                                    title: '',
                                                    rowspan: '1',
                                                  },
                                                  {
                                                    title: i18n.t('static.commit.local'),
                                                    colspan: '7',
                                                  },
                                                  {
                                                    title: i18n.t('static.commit.server'),
                                                    colspan: '11',
                                                  },
                                                  ],
                                                ],
                                                columns: [
                                                  { title: i18n.t('static.manualTagging.RONO'), type: 'text', width: 200 },
                                                  { title: i18n.t('static.commit.erpLineNo'), type: 'hidden', width: 200 },
                                                  { type: 'text', title: i18n.t('static.dashboard.programheader'), width: 150 },
                                                  { type: 'text', title: i18n.t('static.report.planningUnit'), width: 150 },
                                                  { type: 'text', title: i18n.t('static.dashboad.planningunitcountry'), width: 150 },
                                                  { type: 'text', title: i18n.t('static.report.id'), width: 100, },
                                                  { type: 'text', title: i18n.t('static.manualTagging.conversionFactor'), width: 120 },
                                                  { title: i18n.t('static.shipment.shipmentQtyPU'), type: 'numeric', mask: '#,##', width: 120 },
                                                  { type: 'checkbox', title: i18n.t('static.common.active'), width: 120 },
                                                  { type: 'text', title: i18n.t('static.dashboard.programheader'), width: 100 },
                                                  { type: 'text', title: i18n.t('static.report.planningUnit'), width: 150 },
                                                  { type: 'text', title: i18n.t('static.dashboad.planningunitcountry'), width: 150 },
                                                  { type: 'text', title: i18n.t('static.report.id'), width: 100, },
                                                  { type: 'text', title: i18n.t('static.manualTagging.conversionFactor'), width: 120 },
                                                  { title: i18n.t('static.shipment.shipmentQtyPU'), type: 'numeric', mask: '#,##', width: 120 },
                                                  { type: 'checkbox', title: i18n.t('static.common.active'), width: 120 },
                                                  {
                                                    title: i18n.t('static.common.lastModifiedBy'),
                                                    type: 'text',
                                                  },
                                                  {
                                                    title: i18n.t('static.common.lastModifiedDate'),
                                                    type: 'calendar',
                                                    options: { format: JEXCEL_DATE_FORMAT_SM },
                                                  },
                                                  { type: 'hidden', title: 'Old Id' },
                                                  { type: 'hidden', title: 'latest Id' },
                                                  { type: 'hidden', title: 'download Id' },
                                                  { type: 'hidden', title: 'result of compare' },
                                                  { type: 'hidden', title: 'version Id' },
                                                  { type: 'hidden', title: 'index' },
                                                  { type: 'hidden', title: 'index' },
                                                  { type: 'hidden', title: 'index' },
                                                  { type: 'hidden', title: 'index' },
                                                  { type: 'hidden', title: 'index' },
                                                  { type: 'hidden', title: 'index' },
                                                  { type: 'hidden', title: 'index' },
                                                  { type: 'hidden', title: 'index' },
                                                  { type: 'hidden', title: 'index' },
                                                  { type: 'hidden', title: 'index' },
                                                  { type: 'hidden', title: 'index' },
                                                  { type: 'hidden', title: 'index' },
                                                  { type: 'hidden', title: 'index' },
                                                  { type: 'hidden', title: 'index' },
                                                  { type: 'hidden', title: 'index' },
                                                  { type: 'hidden', title: 'index' },
                                                ],
                                                pagination: localStorage.getItem("sesRecordCount"),
                                                paginationOptions: JEXCEL_PAGINATION_OPTION,
                                                search: true,
                                                columnSorting: true,
                                                wordWrap: true,
                                                allowInsertColumn: false,
                                                allowManualInsertColumn: false,
                                                allowDeleteRow: false,
                                                onload: this.loadedFunctionForMergeShipmentLinked,
                                                filters: true,
                                                license: JEXCEL_PRO_KEY,
                                                contextMenu: function (obj, x, y, e) {
                                                  var items = [];
                                                  var rowData = obj.getRowData(y);
                                                  if (rowData[21].toString() == 1) {
                                                    items.push({
                                                      title: "Accept local changes",
                                                      onclick: function () {
                                                        var getServerParentShipmentId = obj.getValueFromCoords(12, y);
                                                        var getLocalParentShipmentId = obj.getValueFromCoords(5, y);
                                                        var rowNumber = obj.getJson(null, false).filter(c => getServerParentShipmentId !== "" ? c[5] === getServerParentShipmentId || c[12] === getServerParentShipmentId : c[5] === getLocalParentShipmentId || c[12] === getLocalParentShipmentId);
                                                        for (var rn = 0; rn < rowNumber.length; rn++) {
                                                          var index = obj.getJson(null, false).findIndex(c => c[23] == rowNumber[rn][23]);
                                                          obj.options.editable = true;
                                                          obj.options.allowDeleteRow = true;
                                                          var deletedRowsListServer = this.state.deletedRowsListServer;
                                                          obj.setValueFromCoords(9, index, '', true)
                                                          obj.setValueFromCoords(38, index, '', true)
                                                          obj.setValueFromCoords(10, index, '', true)
                                                          obj.setValueFromCoords(11, index, '', true)
                                                          obj.setValueFromCoords(12, index, '', true)
                                                          obj.setValueFromCoords(13, index, '', true)
                                                          obj.setValueFromCoords(14, index, '', true)
                                                          obj.setValueFromCoords(15, index, '', true)
                                                          obj.setValueFromCoords(16, index, '', true)
                                                          obj.setValueFromCoords(17, index, '', true)
                                                          obj.setValueFromCoords(19, index, '', true)
                                                          obj.setValueFromCoords(22, index, rowNumber[rn][24], true)
                                                          obj.options.allowDeleteRow = false;
                                                          obj.orderBy(21, 0);
                                                          obj.options.editable = false;
                                                          this.setState({
                                                            conflictsCount: this.state.conflictsCount - this.state.conflictsCountErp,
                                                            conflictsCountErp: 0,
                                                            deletedRowsListServer: deletedRowsListServer
                                                          }, () => {
                                                          })
                                                        }
                                                        this.recursiveConflictsForShipmentLinking(obj)
                                                      }.bind(this)
                                                    })
                                                    items.push({
                                                      title: "Accept server changes",
                                                      onclick: function () {
                                                        var getServerParentShipmentId = obj.getValueFromCoords(12, y);
                                                        var getLocalParentShipmentId = obj.getValueFromCoords(5, y);
                                                        var rowNumber = obj.getJson(null, false).filter(c => getServerParentShipmentId !== "" ? c[5] === getServerParentShipmentId || c[12] === getServerParentShipmentId : c[5] === getLocalParentShipmentId || c[12] === getLocalParentShipmentId);
                                                        for (var rn = 0; rn < rowNumber.length; rn++) {
                                                          var index = obj.getJson(null, false).findIndex(c => c[23] == rowNumber[rn][23]);
                                                          obj.options.editable = true;
                                                          obj.options.allowDeleteRow = true;
                                                          var deletedRowsListLocal = this.state.deletedRowsListLocal;
                                                          obj.setValueFromCoords(2, index, '', true)
                                                          obj.setValueFromCoords(37, index, '', true)
                                                          obj.setValueFromCoords(3, index, '', true)
                                                          obj.setValueFromCoords(4, index, '', true)
                                                          obj.setValueFromCoords(5, index, '', true)
                                                          obj.setValueFromCoords(6, index, '', true)
                                                          obj.setValueFromCoords(7, index, '', true)
                                                          obj.setValueFromCoords(8, index, '', true)
                                                          obj.setValueFromCoords(18, index, '', true)
                                                          obj.setValueFromCoords(20, index, '', true)
                                                          obj.setValueFromCoords(22, index, rowNumber[rn][25], true)
                                                          obj.options.allowDeleteRow = false;
                                                          obj.orderBy(21, 0);
                                                          obj.options.editable = false;
                                                          this.setState({
                                                            conflictsCount: this.state.conflictsCount - this.state.conflictsCountErp,
                                                            conflictsCountErp: 0,
                                                            deletedRowsListLocal: deletedRowsListLocal
                                                          }, () => {
                                                          })
                                                        }
                                                        this.recursiveConflictsForShipmentLinking(obj)
                                                      }.bind(this)
                                                    })
                                                    if (rowData[5] === "" || rowData[12] === "") {
                                                      items.push({
                                                        title: "Accept both",
                                                        onclick: function () {
                                                          var getServerParentShipmentId = obj.getValueFromCoords(12, y);
                                                          var getLocalParentShipmentId = obj.getValueFromCoords(5, y);
                                                          var rowNumber = obj.getJson(null, false).filter(c => getServerParentShipmentId !== "" ? c[5] === getServerParentShipmentId || c[12] === getServerParentShipmentId : c[5] === getLocalParentShipmentId || c[12] === getLocalParentShipmentId);
                                                          var shipmentIdSetThatWhoseConflictsAreResolved = [...new Set(rowNumber.map(ele => ele[23]))];
                                                          for (var rn = 0; rn < rowNumber.length; rn++) {
                                                            var index = obj.getJson(null, false).findIndex(c => c[23] == rowNumber[rn][23]);
                                                            obj.options.editable = true;
                                                            obj.setValueFromCoords(26, index, rowNumber[rn][26].concat(shipmentIdSetThatWhoseConflictsAreResolved), true);
                                                            obj.orderBy(21, 0);
                                                            obj.options.editable = false;
                                                            this.setState({
                                                              conflictsCount: this.state.conflictsCount - this.state.conflictsCountErp,
                                                              conflictsCountErp: 0
                                                            }, () => {
                                                            })
                                                          }
                                                          this.recursiveConflictsForShipmentLinking(obj)
                                                        }.bind(this)
                                                      })
                                                    }
                                                  } else {
                                                    return [];
                                                  }
                                                  return items;
                                                }.bind(this)
                                              };
                                              var mergedShipmentLinkedJexcel = jexcel(document.getElementById("mergedVersionShipmentLinked"), options);
                                              this.el = mergedShipmentLinkedJexcel;
                                              this.setState({
                                                mergedShipmentLinkedJexcel: mergedShipmentLinkedJexcel,
                                              })
                                              this.setState({
                                                oldProgramDataConsumption: oldProgramDataConsumption,
                                                oldProgramDataInventory: oldProgramDataInventory,
                                                oldProgramDataShipment: oldProgramDataShipment,
                                                latestProgramDataConsumption: latestProgramDataConsumption,
                                                latestProgramDataInventory: latestProgramDataInventory,
                                                latestProgramDataShipment: latestProgramDataShipment,
                                                oldProgramDataBatchInfo: oldProgramDataBatchInfo,
                                                latestProgramDataBatchInfo: latestProgramDataBatchInfo,
                                                latestProgramData: latestProgramData,
                                                oldProgramData: oldProgramData,
                                                downloadedProgramData: downloadedProgramData,
                                                oldShipmentLinkingList: oldProgramDataShipmentLinked,
                                                loading: false
                                              }, () => {
                                                if (this.state.conflictsCount == 0) {
                                                  this.generateDataAfterResolveConflictsForQPL();
                                                }
                                              })
                                            } else {
                                              alert(i18n.t('static.commit.untaggedShipments'));
                                              this.setState({
                                                loading: false,
                                              })
                                            }
                                          }
                                        })
                                    }.bind(this)
                                  }.bind(this)
                                }.bind(this)
                              }.bind(this)
                            }.bind(this)
                          }.bind(this)
                        }.bind(this)
                      }.bind(this)
                    } else {
                      alert("This is the older program version. Please reload the program")
                      this.setState({
                        loading: false,
                      })
                    }
                  }.bind(this)
                }.bind(this)
              } else {
                this.setState({
                  message: response.data.messageCode,
                  loading: false,
                  color: "red"
                },
                  () => {
                    this.hideFirstComponent()
                  })
              }
            })
            .catch(
              error => {
                if (error.message === "Network Error") {
                  this.setState({
                    message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
            message: response1.data.messageCode,
            loading: false,
            color: "red"
          },
            () => {
              this.hideFirstComponent()
            })
        }
      })
        .catch(
          error => {
            if (error.message === "Network Error") {
              this.setState({
                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
      this.setState({ loading: false })
    }
  }
  /**
   * This function is used to format the table like add asterisk or info to the table headers
   * @param {*} instance This is the DOM Element where sheet is created
   */
  loadedFunctionForMerge = function (instance) {
    let target = document.getElementById('mergedVersionConsumption');
    target.classList.add("removeOddColor")
    jExcelLoadedFunction(instance, 0);
    var elInstance = instance.worksheets[0];
    var jsonData = elInstance.getJson();
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R']
    elInstance.options.editable = true;
    for (var c = 0; c < jsonData.length; c++) {
      if ((jsonData[c])[16] == "") {
        for (var i = 0; i < colArr.length; i++) {
          var col = (colArr[i]).concat(parseInt(c) + 1);
          elInstance.setStyle(col, "background-color", "transparent");
          elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
          elInstance.setValueFromCoords(18, c, 2, true);
        }
        this.setState({
          isChanged: true
        })
      } else if ((jsonData[c])[15] == "") {
        for (var i = 0; i < colArr.length; i++) {
          var col = (colArr[i]).concat(parseInt(c) + 1);
          elInstance.setStyle(col, "background-color", "transparent");
          elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
          elInstance.setValueFromCoords(18, c, 3, true);
        }
        this.setState({
          isChanged: true
        })
      } else if ((jsonData[c])[16] != "" && (jsonData[c])[15] != "" && (jsonData[c])[18] != 1) {
        var oldData = (jsonData[c])[15];
        var latestData = (jsonData[c])[16];
        var downloadedData = (jsonData[c])[17];
        for (var j = 1; j < 13; j++) {
          if ((oldData[j] == latestData[j]) || (oldData[j] == "" && latestData[j] == null) || (oldData[j] == null && latestData[j] == "")) {
            var col = (colArr[j]).concat(parseInt(c) + 1);
            elInstance.setStyle(col, "background-color", "#fff");
          } else {
            this.setState({
              isChanged: true
            })
            if ((jsonData[c])[17] != "" && oldData[j] == downloadedData[j]) {
              var col = (colArr[j]).concat(parseInt(c) + 1);
              elInstance.setValueFromCoords(j, c, latestData[j], true);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
              elInstance.setValueFromCoords(18, c, 3, true);
              (jsonData[c])[18] = 3;
            } else if ((jsonData[c])[17] != "" && latestData[j] == downloadedData[j]) {
              var col = (colArr[j]).concat(parseInt(c) + 1);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
              elInstance.setValueFromCoords(18, c, 2, true);
              (jsonData[c])[18] = 2;
            } else {
              this.setState({
                conflictsCount: this.state.conflictsCount + 1,
                conflictsCountConsumption: this.state.conflictsCountConsumption + 1
              })
              elInstance.setValueFromCoords(18, c, 1, true);
              (jsonData[c])[18] = 1;
              for (var j = 0; j < colArr.length; j++) {
                var col = (colArr[j]).concat(parseInt(c) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
              }
            }
          }
        }
        if ((jsonData[c])[16] != "" && (jsonData[c])[15] != "" && (jsonData[c])[18] != 1) {
          if ((oldData[13] == latestData[13]) || (oldData[13] == "" && latestData[13] == null) || (oldData[13] == null && latestData[13] == "")) {
            var col = (colArr[14]).concat(parseInt(c) + 1);
            elInstance.setStyle(col, "background-color", "#fff");
          } else {
            this.setState({
              isChanged: true
            })
            if ((jsonData[c])[17] != "" && oldData[13] == downloadedData[13]) {
              var col = (colArr[14]).concat(parseInt(c) + 1);
              elInstance.setValueFromCoords(13, c, latestData[j], true);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
              elInstance.setValueFromCoords(18, c, 3, true);
            } else if ((jsonData[c])[17] != "" && latestData[13] == downloadedData[13]) {
              var col = (colArr[14]).concat(parseInt(c) + 1);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
              elInstance.setValueFromCoords(18, c, 2, true);
            } else {
              this.setState({
                conflictsCount: this.state.conflictsCount + 1,
                conflictsCountConsumption: this.state.conflictsCountConsumption + 1
              })
              elInstance.setValueFromCoords(18, c, 1, true);
              for (var j = 0; j < colArr.length; j++) {
                var col = (colArr[j]).concat(parseInt(c) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
              }
            }
          }
        }
      }
    }
    elInstance.orderBy(18, 0);
    elInstance.options.editable = false;
  }
  /**
   * This function is used to format the table like add asterisk or info to the table headers
   * @param {*} instance This is the DOM Element where sheet is created
   */
  loadedFunctionForMergeInventory = function (instance) {
    let target = document.getElementById('mergedVersionInventory');
    target.classList.add("removeOddColor")
    jExcelLoadedFunction(instance, 1);
    var elInstance = instance.worksheets[0];
    var jsonData = elInstance.getJson();
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S']
    elInstance.options.editable = true;
    for (var c = 0; c < jsonData.length; c++) {
      if ((jsonData[c])[17] == "") {
        for (var i = 0; i < colArr.length; i++) {
          var col = (colArr[i]).concat(parseInt(c) + 1);
          elInstance.setStyle(col, "background-color", "transparent");
          elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
          elInstance.setValueFromCoords(19, c, 2, true);
        }
        this.setState({
          isChanged: true
        })
      } else if ((jsonData[c])[16] == "") {
        for (var i = 0; i < colArr.length; i++) {
          var col = (colArr[i]).concat(parseInt(c) + 1);
          elInstance.setStyle(col, "background-color", "transparent");
          elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
          elInstance.setValueFromCoords(19, c, 3, true);
        }
        this.setState({
          isChanged: true
        })
      } else if ((jsonData[c])[17] != "" && (jsonData[c])[16] != "" && (jsonData[c])[19] != 1) {
        var oldData = (jsonData[c])[16];
        var latestData = (jsonData[c])[17];
        var downloadedData = (jsonData[c])[18];
        for (var j = 1; j < 14; j++) {
          if ((oldData[j] == latestData[j]) || (oldData[j] == "" && latestData[j] == null) || (oldData[j] == null && latestData[j] == "")) {
            var col = (colArr[j]).concat(parseInt(c) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
          } else {
            this.setState({
              isChanged: true
            })
            if ((jsonData[c])[18] != "" && oldData[j] == downloadedData[j]) {
              var col = (colArr[j]).concat(parseInt(c) + 1);
              elInstance.setValueFromCoords(j, c, latestData[j], true);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
              elInstance.setValueFromCoords(19, c, 3, true);
              (jsonData[c])[19] = 3;
            } else if ((jsonData[c])[18] != "" && latestData[j] == downloadedData[j]) {
              var col = (colArr[j]).concat(parseInt(c) + 1);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
              elInstance.setValueFromCoords(19, c, 2, true);
              (jsonData[c])[19] = 2;
            } else {
              this.setState({
                conflictsCount: this.state.conflictsCount + 1,
                conflictsCountInventory: this.state.conflictsCountInventory + 1
              })
              elInstance.setValueFromCoords(19, c, 1, true);
              (jsonData[c])[19] = 1;
              for (var j = 0; j < colArr.length; j++) {
                var col = (colArr[j]).concat(parseInt(c) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
              }
            }
          }
        }
        if ((jsonData[c])[17] != "" && (jsonData[c])[16] != "" && (jsonData[c])[19] != 1) {
          if ((oldData[14] == latestData[14]) || (oldData[14] == "" && latestData[14] == null) || (oldData[14] == null && latestData[14] == "")) {
            var col = (colArr[15]).concat(parseInt(c) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
          } else {
            this.setState({
              isChanged: true
            })
            if ((jsonData[c])[18] != "" && oldData[14] == downloadedData[14]) {
              var col = (colArr[15]).concat(parseInt(c) + 1);
              elInstance.setValueFromCoords(14, c, latestData[j], true);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
              elInstance.setValueFromCoords(19, c, 3, true);
            } else if ((jsonData[c])[18] != "" && latestData[14] == downloadedData[14]) {
              var col = (colArr[15]).concat(parseInt(c) + 1);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
              elInstance.setValueFromCoords(19, c, 2, true);
            } else {
              this.setState({
                conflictsCount: this.state.conflictsCount + 1,
                conflictsCountInventory: this.state.conflictsCountInventory + 1
              })
              elInstance.setValueFromCoords(19, c, 1, true);
              for (var j = 0; j < colArr.length; j++) {
                var col = (colArr[j]).concat(parseInt(c) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
              }
            }
          }
        }
      }
    }
    elInstance.orderBy(19, 0);
    elInstance.options.editable = false;
  }
  /**
   * This function is used to generate conflicts recursively for shipment linking
   * @param {*} instance 
   */
  recursiveConflictsForShipmentLinking(instance) {
    var elInstance = instance;
    var jsonData = elInstance.getJson();
    var jsonLength = jsonData.length;
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD']
    elInstance.options.editable = true;
    var localDataChanged = 0;
    var serverDataChanged = 0;
    for (var c = 0; c < jsonLength; c++) {
      localDataChanged = 0;
      serverDataChanged = 0;
      elInstance.setStyle(("I").concat(parseInt(c) + 1), "pointer-events", "");
      elInstance.setStyle(("P").concat(parseInt(c) + 1), "pointer-events", "");
      elInstance.setStyle(("I").concat(parseInt(c) + 1), "pointer-events", "none");
      elInstance.setStyle(("P").concat(parseInt(c) + 1), "pointer-events", "none");
      if (jsonData[c][37] !== "" && jsonData[c][38] !== "" && jsonData[c][37] !== jsonData[c][38]) {
        this.setState({
          conflictsCount: this.state.conflictsCount + 1,
          conflictsCountErp: this.state.conflictsCountErp + 1,
          shipmentAlreadyLinkedToOtherProgCount: this.state.shipmentAlreadyLinkedToOtherProgCount + 1
        })
        elInstance.setValueFromCoords(21, c, 0, true);
        for (var j = 0; j < colArr.length; j++) {
          var col = (colArr[j]).concat(parseInt(c) + 1);
          elInstance.setStyle(col, "background-color", "transparent");
          elInstance.setStyle(col, "background-color", "yellow");
          elInstance.setStyle(col, "color", "red");
          elInstance.setStyle(col, "font-weight", "");
          elInstance.setStyle(col, "font-weight", "bold");
        }
      } else {
        var checkIfSameParentShipmentIdExists = -1;
        if (checkIfSameParentShipmentIdExists > 0) {
          this.setState({
            conflictsCount: this.state.conflictsCount + 1,
            conflictsCountErp: this.state.conflictsCountErp + 1,
          })
          elInstance.setValueFromCoords(21, c, 1, true);
          for (var j = 0; j < colArr.length; j++) {
            var col = (colArr[j]).concat(parseInt(c) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
          }
        } else {
          if ((jsonData[c])[19] === "" && ((jsonData[c])[18] === 0 || jsonData[c][3] != jsonData[c][30] || jsonData[c][4] != jsonData[c][31] || jsonData[c][5] != jsonData[c][32] || jsonData[c][6] != jsonData[c][33] || jsonData[c][8] != jsonData[c][35])) {
            elInstance.setValueFromCoords(21, c, 2, true);
            for (var i = 0; i < colArr.length; i++) {
              var col = (colArr[i]).concat(parseInt(c) + 1);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
            }
            this.setState({
              isChanged: true
            })
          } else if ((jsonData[c])[18] === "" && (jsonData[c])[19] !== (jsonData[c])[20]) {
            elInstance.setValueFromCoords(21, c, 3, true);
            for (var i = 0; i < colArr.length; i++) {
              var col = (colArr[i]).concat(parseInt(c) + 1);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
            }
            this.setState({
              isChanged: true
            })
          } else if (jsonData[c][3] !== "" && jsonData[c][10] !== "") {
            if (jsonData[c][3] == jsonData[c][10]) {
            } else if (jsonData[c][3] == jsonData[c][30]) {
              this.setState({
                isChanged: true
              })
              elInstance.setValueFromCoords(21, c, 3, true);
              var col = ("K").concat(parseInt(c) + 1);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
              serverDataChanged += 1;
            } else if (jsonData[c][10] == jsonData[c][30]) {
              this.setState({
                isChanged: true
              })
              elInstance.setValueFromCoords(21, c, 2, true);
              var col = ("D").concat(parseInt(c) + 1);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
              localDataChanged += 1;
            } else {
              this.setState({
                conflictsCount: this.state.conflictsCount + 1,
                conflictsCountErp: this.state.conflictsCountErp + 1,
                isChanged: true
              })
              elInstance.setValueFromCoords(21, c, 1, true);
              for (var j = 0; j < colArr.length; j++) {
                var col = (colArr[j]).concat(parseInt(c) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
              }
            }
            if (jsonData[c][4] == jsonData[c][11]) {
            } else if (jsonData[c][4] == jsonData[c][31]) {
              this.setState({
                isChanged: true
              })
              elInstance.setValueFromCoords(21, c, 3, true);
              var col = ("L").concat(parseInt(c) + 1);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
              serverDataChanged += 1;
            } else if (jsonData[c][11] == jsonData[c][31]) {
              this.setState({
                isChanged: true
              })
              elInstance.setValueFromCoords(21, c, 2, true);
              var col = ("E").concat(parseInt(c) + 1);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
              localDataChanged += 1;
            } else {
              this.setState({
                conflictsCount: this.state.conflictsCount + 1,
                conflictsCountErp: this.state.conflictsCountErp + 1,
                isChanged: true
              })
              elInstance.setValueFromCoords(21, c, 1, true);
              for (var j = 0; j < colArr.length; j++) {
                var col = (colArr[j]).concat(parseInt(c) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
              }
            }
            if (jsonData[c][8].toString() == "true" && jsonData[c][15].toString() == "true") {
              if (jsonData[c][5].toString() == jsonData[c][12].toString()) {
              } else if (jsonData[c][5].toString() == jsonData[c][32].toString() && jsonData[c][35].toString() == "true") {
                this.setState({
                  isChanged: true
                })
                elInstance.setValueFromCoords(21, c, 3, true);
                var col = ("M").concat(parseInt(c) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
                serverDataChanged += 1;
              } else if (jsonData[c][12].toString() == jsonData[c][32].toString() && jsonData[c][35].toString() == "true") {
                this.setState({
                  isChanged: true
                })
                elInstance.setValueFromCoords(21, c, 2, true);
                var col = ("F").concat(parseInt(c) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                localDataChanged += 1;
              } else {
                this.setState({
                  conflictsCount: this.state.conflictsCount + 1,
                  conflictsCountErp: this.state.conflictsCountErp + 1,
                  isChanged: true
                })
                elInstance.setValueFromCoords(21, c, 1, true);
                for (var j = 0; j < colArr.length; j++) {
                  var col = (colArr[j]).concat(parseInt(c) + 1);
                  elInstance.setStyle(col, "background-color", "transparent");
                  elInstance.setStyle(col, "background-color", "yellow");
                }
              }
            }
            if (jsonData[c][6].toString() == jsonData[c][13].toString()) {
            } else if (jsonData[c][6].toString() == jsonData[c][33].toString()) {
              this.setState({
                isChanged: true
              })
              elInstance.setValueFromCoords(21, c, 3, true);
              var col = ("N").concat(parseInt(c) + 1);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
              serverDataChanged += 1;
            } else if (jsonData[c][13].toString() == jsonData[c][33].toString()) {
              this.setState({
                isChanged: true
              })
              elInstance.setValueFromCoords(21, c, 2, true);
              var col = ("G").concat(parseInt(c) + 1);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
              localDataChanged += 1;
            } else {
              this.setState({
                conflictsCount: this.state.conflictsCount + 1,
                conflictsCountErp: this.state.conflictsCountErp + 1,
                isChanged: true
              })
              elInstance.setValueFromCoords(21, c, 1, true);
              for (var j = 0; j < colArr.length; j++) {
                var col = (colArr[j]).concat(parseInt(c) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
              }
            }
            if (jsonData[c][8].toString() == jsonData[c][15].toString()) {
            } else if (jsonData[c][8].toString() == jsonData[c][35].toString()) {
              this.setState({
                isChanged: true
              })
              elInstance.setValueFromCoords(21, c, 3, true);
              var col = ("P").concat(parseInt(c) + 1);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
              serverDataChanged += 1;
            } else if (jsonData[c][15].toString() == jsonData[c][35].toString()) {
              this.setState({
                isChanged: true
              })
              elInstance.setValueFromCoords(21, c, 2, true);
              var col = ("I").concat(parseInt(c) + 1);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
              localDataChanged += 1;
            } else {
              this.setState({
                conflictsCount: this.state.conflictsCount + 1,
                conflictsCountErp: this.state.conflictsCountErp + 1,
                isChanged: true
              })
              elInstance.setValueFromCoords(21, c, 1, true);
              for (var j = 0; j < colArr.length; j++) {
                var col = (colArr[j]).concat(parseInt(c) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
              }
            }
            if (localDataChanged > 0 && serverDataChanged > 0) {
              this.setState({
                conflictsCount: this.state.conflictsCount + 1,
                conflictsCountErp: this.state.conflictsCountErp + 1,
                isChanged: true
              })
              elInstance.setValueFromCoords(21, c, 1, true);
              for (var j = 0; j < colArr.length; j++) {
                var col = (colArr[j]).concat(parseInt(c) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
              }
            }
          }
        }
      }
    }
    elInstance.orderBy(21, 0);
    elInstance.options.editable = false;
    if (this.state.conflictsCount == 0) {
      this.generateDataAfterResolveConflictsForQPL();
    }
  }
  /**
   * This function is used to format the table like add asterisk or info to the table headers
   * @param {*} instance This is the DOM Element where sheet is created
   */
  loadedFunctionForMergeShipmentLinked = function (instance) {
    let target = document.getElementById('mergedVersionShipmentLinked');
    target.classList.add("removeOddColor")
    jExcelLoadedFunction(instance, 3);
    this.recursiveConflictsForShipmentLinking(instance.worksheets[0])
  }
  /**
   * This function is used to format the table like add asterisk or info to the table headers
   * @param {*} instance This is the DOM Element where sheet is created
   */
  loadedFunctionForMergeShipment = function (instance) {
    let target = document.getElementById('mergedVersionShipment');
    target.classList.add("removeOddColor")
    jExcelLoadedFunction(instance, 2);
    var elInstance = instance.worksheets[0];
    var jsonData = elInstance.getJson();
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI']
    elInstance.options.editable = true;
    for (var c = 0; c < jsonData.length; c++) {
      if ((jsonData[c])[34] == "") {
        for (var i = 0; i < colArr.length; i++) {
          var col = (colArr[i]).concat(parseInt(c) + 1);
          elInstance.setStyle(col, "background-color", "transparent");
          elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
          elInstance.setValueFromCoords(36, c, 2, true);
        }
        this.setState({
          isChanged: true
        })
      } else if ((jsonData[c])[33] == "") {
        for (var i = 0; i < colArr.length; i++) {
          var col = (colArr[i]).concat(parseInt(c) + 1);
          elInstance.setStyle(col, "background-color", "transparent");
          elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
          elInstance.setValueFromCoords(36, c, 3, true);
        }
        this.setState({
          isChanged: true
        })
      } else if ((jsonData[c])[33] != "" && (jsonData[c])[34] != "" && (jsonData[c])[36] != 1) {
        var oldData = (jsonData[c])[33];
        var latestData = (jsonData[c])[34];
        var downloadedData = (jsonData[c])[35];
        for (var j = 1; j < 31; j++) {
          if ((oldData[j] == latestData[j]) || (oldData[j] == "" && latestData[j] == null) || (oldData[j] == null && latestData[j] == "")) {
            var col = (colArr[j]).concat(parseInt(c) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
          } else {
            this.setState({
              isChanged: true
            })
            if (jsonData[c][26].toString() != "true") {
              if ((jsonData[c])[35] != "" && oldData[j] == downloadedData[j]) {
                var col = (colArr[j]).concat(parseInt(c) + 1);
                if (j == 26 && latestData[j].toString() != "true") {
                  elInstance.setValueFromCoords(j, c, latestData[j], true);
                  elInstance.setStyle(col, "background-color", "transparent");
                  elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
                  elInstance.setValueFromCoords(36, c, 3, true);
                  (jsonData[c])[36] = 3;
                }
              } else if ((jsonData[c])[35] != "" && latestData[j] == downloadedData[j]) {
                var col = (colArr[j]).concat(parseInt(c) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                elInstance.setValueFromCoords(36, c, 2, true);
                (jsonData[c])[36] = 2;
              } else {
                this.setState({
                  conflictsCount: this.state.conflictsCount + 1,
                  conflictsCountShipment: this.state.conflictsCountShipment + 1
                })
                elInstance.setValueFromCoords(36, c, 1, true);
                (jsonData[c])[36] = 1;
                for (var j = 0; j < colArr.length; j++) {
                  var col = (colArr[j]).concat(parseInt(c) + 1);
                  elInstance.setStyle(col, "background-color", "transparent");
                  elInstance.setStyle(col, "background-color", "yellow");
                }
              }
            }
          }
        }
        if ((jsonData[c])[33] != "" && (jsonData[c])[34] != "" && (jsonData[c])[36] != 1) {
          if ((oldData[31] == latestData[31]) || (oldData[31] == "" && latestData[31] == null) || (oldData[31] == null && latestData[31] == "")) {
            var col = (colArr[32]).concat(parseInt(c) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
          } else {
            this.setState({
              isChanged: true
            })
            if ((jsonData[c])[35] != "" && oldData[31] == downloadedData[31]) {
              var col = (colArr[32]).concat(parseInt(c) + 1);
              elInstance.setValueFromCoords(31, c, latestData[j], true);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
              elInstance.setValueFromCoords(36, c, 3, true);
            } else if ((jsonData[c])[35] != "" && latestData[31] == downloadedData[31]) {
              var col = (colArr[32]).concat(parseInt(c) + 1);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
              elInstance.setValueFromCoords(36, c, 2, true);
            } else {
              if (jsonData[c][26].toString() != "true") {
                this.setState({
                  conflictsCount: this.state.conflictsCount + 1,
                  conflictsCountShipment: this.state.conflictsCountShipment + 1
                })
                elInstance.setValueFromCoords(36, c, 1, true);
                for (var j = 0; j < colArr.length; j++) {
                  var col = (colArr[j]).concat(parseInt(c) + 1);
                  elInstance.setStyle(col, "background-color", "transparent");
                  elInstance.setStyle(col, "background-color", "yellow");
                }
              }
            }
          }
        }
      }
    }
    elInstance.orderBy(36, 0);
    elInstance.options.editable = false;
  }
  /**
   * This function is used to show the notes of the problem
   * @param {*} row This is instance of the row for which notes should be visible
   * @param {*} lang This is the name of the language in which notes should be displayed
   * @returns Returns the latest notes for a problem
   */
  getNote(row, lang) {
    var transList = row.problemTransList.filter(c => c.reviewed == false);
    if (transList.length == 0) {
      return ""
    } else {
      var listLength = transList.length;
      return transList[listLength - 1].notes;
    }
  }
  /**
   * This function is used to format the table like add asterisk or info to the table headers
   * @param {*} instance This is the DOM Element where sheet is created
   */
  loadedFunctionForMergeProblemList = function (instance) {
    let target = document.getElementById('mergedVersionProblemList');
    target.classList.add("removeOddColor")
    jExcelLoadedFunction(instance, 4);
    var elInstance = instance.worksheets[0];
    var jsonData = elInstance.getJson();
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T']
    elInstance.options.editable = true;
    for (var c = 0; c < jsonData.length; c++) {
      if ((jsonData[c])[18] == "") {
        for (var i = 0; i < colArr.length; i++) {
          var col = (colArr[i]).concat(parseInt(c) + 1);
          elInstance.setStyle(col, "background-color", "transparent");
          elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
          elInstance.setValueFromCoords(20, c, 2, true);
        }
        this.setState({
          isChanged: true
        })
      } else if ((jsonData[c])[17] == "") {
        for (var i = 0; i < colArr.length; i++) {
          var col = (colArr[i]).concat(parseInt(c) + 1);
          elInstance.setStyle(col, "background-color", "transparent");
          elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
          elInstance.setValueFromCoords(20, c, 3, true);
        }
        this.setState({
          isChanged: true
        })
      } else if ((jsonData[c])[18] != "" && (jsonData[c])[17] != "" && (jsonData[c])[20] != 1) {
        var oldData = (jsonData[c])[17];
        var latestData = (jsonData[c])[18];
        var downloadedData = (jsonData[c])[19];
        if ((oldData[10] == latestData[10]) || (oldData[10] == "" && latestData[10] == null) || (oldData[10] == null && latestData[10] == "")) {
          var col = ("K").concat(parseInt(c) + 1);
          elInstance.setStyle(col, "background-color", "transparent");
        } else {
          this.setState({
            isChanged: true
          })
          if ((jsonData[c])[19] != "" && oldData[10] == downloadedData[10]) {
            if (latestData[12] != PROBLEM_STATUS_IN_COMPLIANCE) {
              var col = ("K").concat(parseInt(c) + 1);
              elInstance.setValueFromCoords(10, c, latestData[10], true);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
              elInstance.setValueFromCoords(20, c, 3, true);
              (jsonData[c])[20] = 3;
            } else {
              var col = ("K").concat(parseInt(c) + 1);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
              elInstance.setValueFromCoords(20, c, 2, true);
              (jsonData[c])[20] = 2;
            }
          } else if ((jsonData[c])[19] != "" && latestData[10] == downloadedData[10]) {
            var col = ("K").concat(parseInt(c) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
            elInstance.setValueFromCoords(20, c, 2, true);
            (jsonData[c])[20] = 2;
          } else {
            if (oldData[12] != PROBLEM_STATUS_IN_COMPLIANCE && latestData[12] != PROBLEM_STATUS_IN_COMPLIANCE) {
              this.setState({
                conflictsCount: this.state.conflictsCount + 1,
                conflictsCountQPL: this.state.conflictsCountQPL + 1
              })
              elInstance.setValueFromCoords(20, c, 1, true);
              (jsonData[c])[20] = 1;
              for (var j = 0; j < colArr.length; j++) {
                var col = (colArr[j]).concat(parseInt(c) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
              }
            } else {
              var col = ("K").concat(parseInt(c) + 1);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
              elInstance.setValueFromCoords(20, c, 2, true);
              (jsonData[c])[20] = 2;
            }
          }
        }
      }
      var rowData = jsonData[c];
      if (rowData[20] != 1) {
        var oldData = rowData[17];
        var latestData = rowData[18];
        if (rowData[18] != "" && rowData[17] != "") {
          if ((oldData[8] == latestData[8]) || (oldData[8] == "" && latestData[8] == null) || (oldData[8] == null && latestData[8] == "")) {
          } else {
            if (rowData[8] == oldData[8]) {
              var col = ("I").concat(parseInt(c) + 1);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
            } else if (rowData[8] == latestData[8]) {
              var col = ("I").concat(parseInt(c) + 1);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
            }
          }
          if ((oldData[9] == latestData[9]) || (oldData[9] == "" && latestData[9] == null) || (oldData[9] == null && latestData[9] == "")) {
          } else {
            if (rowData[9] == oldData[9]) {
              var col = ("J").concat(parseInt(c) + 1);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
            } else if (rowData[9] == latestData[9]) {
              var col = ("J").concat(parseInt(c) + 1);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
            }
          }
          if ((oldData[11] == latestData[11]) || (oldData[11] == "" && latestData[11] == null) || (oldData[11] == null && latestData[11] == "")) {
          } else {
            if (rowData[11] == oldData[11]) {
              var col = ("L").concat(parseInt(c) + 1);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
            } else if (rowData[11] == latestData[11]) {
              var col = ("L").concat(parseInt(c) + 1);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
            }
          }
        }
      }
    }
    elInstance.orderBy(20, 0);
    elInstance.options.editable = false;
    if (this.state.conflictsCount == 0) {
      this.setState({
        progressPer: 25, message: i18n.t('static.commitVersion.resolvedConflictsSuccess'), color: 'green'
      }, () => {
        this.hideFirstComponent();
      })
    }
  }
  /**
   * This function is used to display multiple tabs on the screen
   * @returns Returns multiple tabs
   */
  tabPane() {
    return (
      <>
        <TabPane tabId="1">
          <Row>
            <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
              <Col md="12 pl-0 pr-lg-0" id="realmDiv">
                <div className="table-responsive consumptionDataEntryTable">
                  <div style={{ width: '100%' }} id="mergedVersionConsumption" />
                </div>
              </Col>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="2">
          <Row>
            <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
              <Col md="12 pl-0 pr-lg-0" id="realmDiv">
                <div className="table-responsive RemoveStriped consumptionDataEntryTable">
                  <div style={{ width: '100%' }} id="mergedVersionInventory" />
                </div>
              </Col>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="3">
          <Row>
            <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
              <Col md="12 pl-0 pr-lg-0" id="realmDiv">
                <div className="table-responsive RemoveStriped consumptionDataEntryTable">
                  <div style={{ width: '100%' }} id="mergedVersionShipment" />
                </div>
              </Col>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="4">
          <Row>
            <Col sm={12} md={12} className="pt-2" style={{ flexBasis: 'auto' }}>
              <Col md="12" id="realmDiv">
                <div><h5 style={{ color: "red" }}>{this.state.shipmentAlreadyLinkedToOtherProgCount > 0 ? i18n.t("static.commitVersion.shipmentAlreadyLinkedToOtherProgram") : ""}</h5></div>
                <div className="table-responsive RemoveStriped consumptionDataEntryTable rightClickColors ERPLinkTable" style={{ marginTop: "-30px" }}>
                  <div style={{ width: '100%' }} id="mergedVersionShipmentLinked" />
                </div>
              </Col>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="5">
          <Row>
            <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
              <Col md="12 pl-0" id="realmDiv">
                <div className="table-responsive RemoveStriped consumptionDataEntryTable">
                  <div style={{ width: '100%' }} id="mergedVersionProblemList" />
                </div>
              </Col>
            </Col>
          </Row>
        </TabPane>
      </>
    );
  }
  /**
   * This is used to display the content
   * @returns It returns the commit screen
   */
  render = () => {
    jexcel.setDictionary({
      Show: " ",
      entries: " ",
    });
    const { versionTypeList } = this.state;
    let versionTypes = versionTypeList.length > 0
      && versionTypeList.map((item, i) => {
        return (
          <option key={i} value={item.id}>{getLabelText(item.label, this.state.lang)}</option>
        )
      }, this);
    return (
      <div className="animated fadeIn">
        <AuthenticationServiceComponent history={this.props.history} />
        <QatProblemActionNew ref="problemListChild" updateState={this.updateState} fetchData={this.fetchData} objectStore="whatIfProgramData" page="commitVersion"></QatProblemActionNew>
        <h5 id="div1" className={this.state.color}>{i18n.t(this.state.message, { entityname })}</h5>
        <h5 className="red" id="div2">{this.state.noFundsBudgetError || this.state.commitVersionError}</h5>
        <Row>
          <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
            <Card>
              <CardBody>
                <Form name='simpleForm'>
                  <Col md="12 pl-0">
                    <div className="d-md-flex">
                      <FormGroup className="col-md-4">
                        <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')} </Label>
                        <div className="controls ">
                          <Select
                            name="programSelect"
                            id="programSelect"
                            bsSize="sm"
                            disabled={this.state.loading}
                            options={this.state.programList}
                            value={this.state.programId}
                            onChange={(e) => { this.checkLastModifiedDateForProgram(e); }}
                          />
                        </div>
                      </FormGroup>
                      <div className="col-md-10 pt-4 pb-3">
                        <ul className="legendcommitversion">
                          <li><span className="lightpinklegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.conflicts')}</span></li>
                          <li><span className=" greenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInCurrentVersion')} </span></li>
                          <li><span className="notawesome legendcolor"></span > <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInLatestVersion')}</span></li>
                        </ul>
                      </div>
                    </div>
                  </Col>
                </Form>
                <ProgressBar
                  percent={this.state.progressPer}
                  filledBackground="linear-gradient(to right, #fefb72, #f0bb31)"
                  style={{ width: '75%' }}
                >
                  <Step transition="scale">
                    {({ accomplished }) => (
                      <img
                        style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                        width="30"
                        src="../../../../public/assets/img/numbers/number1.png"
                      />
                    )}
                  </Step>
                  <Step transition="scale">
                    {({ accomplished }) => (
                      <img
                        style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                        width="30"
                        src="../../../../public/assets/img/numbers/number2.png"
                      />
                    )}
                  </Step>
                  <Step transition="scale">
                    {({ accomplished }) => (
                      <img
                        style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                        width="30"
                        src="../../../../public/assets/img/numbers/number3.png"
                      />
                    )}
                  </Step>
                  <Step transition="scale">
                    {({ accomplished }) => (
                      <img
                        style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                        width="30"
                        src="../../../../public/assets/img/numbers/number4.png"
                      />
                    )}
                  </Step>
                  <Step transition="scale">
                    {({ accomplished }) => (
                      <img
                        style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                        width="30"
                        src="../../../../public/assets/img/numbers/number5.png"
                      />
                    )}
                  </Step>
                </ProgressBar>
                <div className="d-sm-down-none  progressbar">
                  <ul>
                    <li className="quantimedProgressbartext1">{i18n.t('static.commitVersion.compareData')}</li>
                    <li className="quantimedProgressbartext2">{i18n.t('static.commitVersion.resolveConflicts')}</li>
                    <li className="quantimedProgressbartext3">{i18n.t('static.commitVersion.sendingDataToServer')}</li>
                    <li className="quantimedProgressbartext4">{i18n.t('static.commitVersion.serverProcessing')}</li>
                    <li className="quantimedProgressbartext5">{i18n.t('static.commitVersion.upgradeLocalToLatest')}</li>
                  </ul>
                </div>
                <br></br>
                <div id="detailsDiv">
                  <div className="animated fadeIn" style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                      initialValues={initialValues}
                      validationSchema={validationSchema}
                      onSubmit={(values, { setSubmitting, setErrors }) => {
                        this.synchronize()
                      }}
                      render={
                        ({
                          values,
                          errors,
                          touched,
                          handleChange,
                          handleBlur,
                          handleSubmit,
                          isSubmitting,
                          isValid,
                          setTouched,
                          handleReset,
                          setFieldValue,
                          setFieldTouched,
                          setFieldError
                        }) => (
                          <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='budgetForm' autocomplete="off">
                            <Col md="12 pl-0 pt-3">
                              <div className="d-md-flex">
                                <FormGroup className="col-md-3">
                                  <Label htmlFor="appendedInputButton">{i18n.t('static.report.versiontype')}</Label>
                                  <div className="controls ">
                                    <InputGroup>
                                      <Input type="select"
                                        bsSize="sm"
                                        name="versionType" id="versionType" onChange={this.versionTypeChanged}>
                                        {versionTypes}
                                      </Input>
                                    </InputGroup>
                                  </div>
                                </FormGroup>
                                <FormGroup className="col-md-6">
                                  <Label htmlFor="appendedInputButton">{i18n.t('static.program.notes')}</Label>
                                  <div className="controls ">
                                    <InputGroup>
                                      <Input type="textarea"
                                        name="notes"
                                        id="notes"
                                        valid={!errors.notes && this.state.notes != ''}
                                        invalid={touched.notes && !!errors.notes}
                                        onChange={(e) => { handleChange(e); this.notesChange(e); }}
                                        onBlur={handleBlur}
                                        value={this.state.notes}
                                      >
                                      </Input>
                                      <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </InputGroup>
                                  </div>
                                </FormGroup>
                                <FormGroup className="tab-ml-1 mt-4">
                                  <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                  {((this.state.isChanged.toString() == "true" && this.state.versionType == 1) || (this.state.versionType == 2 && (this.state.openCount == 0 || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes("ROLE_BF_READONLY_ACCESS_REALM_ADMIN")))) && this.state.conflictsCount == 0 && <Button type="submit" size="md" color="success" className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.button.commit')} </Button>}
                                  &nbsp;
                                </FormGroup>
                              </div>
                            </Col>
                          </Form>
                        )} />
                    <h5 style={{ color: 'red' }}>{i18n.t('static.commitVersion.commitNote')}</h5>
                    <Row>
                      <Col xs="12" md="12" className="mb-4">
                        <Nav tabs>
                          <NavItem>
                            <NavLink
                              style={{ background: this.state.conflictsCountConsumption > 0 ? "yellow" : "" }}
                              active={this.state.activeTab[0] === '1'}
                              onClick={() => { this.toggle(0, '1'); }}
                            >
                              {i18n.t('static.supplyPlan.consumption')}
                            </NavLink>
                          </NavItem>
                          <NavItem>
                            <NavLink
                              style={{ background: this.state.conflictsCountInventory > 0 ? "yellow" : "" }}
                              active={this.state.activeTab[0] === '2'}
                              onClick={() => { this.toggle(0, '2'); }}
                            >
                              {i18n.t('static.inventory.inventory')}
                            </NavLink>
                          </NavItem>
                          <NavItem>
                            <NavLink
                              style={{ background: this.state.conflictsCountShipment > 0 ? "yellow" : "" }}
                              active={this.state.activeTab[0] === '3'}
                              onClick={() => { this.toggle(0, '3'); }}
                            >
                              {i18n.t('static.shipment.manualShipments')}
                            </NavLink>
                          </NavItem>
                          <NavItem>
                            <NavLink
                              style={{ background: this.state.conflictsCountErp > 0 ? "yellow" : "" }}
                              active={this.state.activeTab[0] === '4'}
                              onClick={() => { this.toggle(0, '4'); }}
                            >
                              {i18n.t('static.supplyPlan.erpShipments')}
                            </NavLink>
                          </NavItem>
                          <NavItem>
                            <NavLink
                              style={{ background: this.state.conflictsCountQPL > 0 ? "yellow" : "" }}
                              active={this.state.activeTab[0] === '5'}
                              onClick={() => { this.toggle(0, '5'); }}
                            >
                              {i18n.t('static.dashboard.qatProblemList')}
                            </NavLink>
                          </NavItem>
                        </Nav>
                        <TabContent activeTab={this.state.activeTab[0]}>
                          {this.tabPane()}
                        </TabContent>
                      </Col>
                    </Row>
                  </div>
                  <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                      <div className="align-items-center">
                        <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                        <div className="spinner-border blue ml-4" role="status">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Modal isOpen={this.state.conflicts}
          className={'modal-lg modalWidth ' + this.props.className} style={{ display: this.state.loading ? "none" : "block" }}>
          <ModalHeader toggle={() => this.toggleLarge()} className="modalHeaderSupplyPlan">
            <strong>{i18n.t('static.commitVersion.resolveConflicts')}</strong>
            <ul className="legendcommitversion">
              <li><span className="greenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInCurrentVersion')}</span></li>
              <li><span className="notawesome  legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInLatestVersion')}</span></li>
            </ul>
          </ModalHeader>
          <ModalBody>
            <div className="table-responsive RemoveStriped consumptionDataEntryTable">
              <div id="resolveConflictsTable" />
              <input type="hidden" id="index" />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.acceptCurrentChanges}> <i className="fa fa-check"></i>{i18n.t('static.commitVersion.acceptCurrentVersion')}</Button>{' '}
            <Button type="submit" size="md" className="acceptLocalChnagesButton submitBtn float-right mr-1" onClick={this.acceptIncomingChanges}> <i className="fa fa-check"></i>{i18n.t('static.commitVersion.acceptLatestVersion')}</Button>{' '}
          </ModalFooter>
        </Modal>
        <Modal isOpen={this.state.conflictsInventory}
          className={'modal-lg modalWidth ' + this.props.className} style={{ display: this.state.loading ? "none" : "block" }}>
          <ModalHeader toggle={() => this.toggleLargeInventory()} className="modalHeaderSupplyPlan">
            <strong>{i18n.t('static.commitVersion.resolveConflicts')}</strong>
            <ul className="legendcommitversion">
              <li><span className="greenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInCurrentVersion')}</span></li>
              <li><span className="notawesome  legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInLatestVersion')}</span></li>
            </ul>
          </ModalHeader>
          <ModalBody>
            <div className="table-responsive RemoveStriped consumptionDataEntryTable">
              <div id="resolveConflictsInventoryTable" />
              <input type="hidden" id="indexInventory" />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.acceptCurrentChangesInventory}> <i className="fa fa-check"></i>{i18n.t('static.commitVersion.acceptCurrentVersion')}</Button>{' '}
            <Button type="submit" size="md" className="acceptLocalChnagesButton submitBtn float-right mr-1" onClick={this.acceptIncomingChangesInventory}> <i className="fa fa-check"></i>{i18n.t('static.commitVersion.acceptLatestVersion')}</Button>{' '}
          </ModalFooter>
        </Modal>
        <Modal isOpen={this.state.conflictsShipment}
          className={'modal-lg modalWidth ' + this.props.className} style={{ display: this.state.loading ? "none" : "block" }}>
          <ModalHeader toggle={() => this.toggleLargeShipment()} className="modalHeaderSupplyPlan">
            <strong>{i18n.t('static.commitVersion.resolveConflicts')}</strong>
            <ul className="legendcommitversion">
              <li><span className="greenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInCurrentVersion')}</span></li>
              <li><span className="notawesome  legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInLatestVersion')}</span></li>
            </ul>
          </ModalHeader>
          <ModalBody>
            <div className="table-responsive RemoveStriped consumptionDataEntryTable">
              <div id="resolveConflictsShipmentTable" />
              <input type="hidden" id="indexShipment" />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.acceptCurrentChangesShipment}> <i className="fa fa-check"></i>{i18n.t('static.commitVersion.acceptCurrentVersion')}</Button>{' '}
            <Button type="submit" size="md" className="acceptLocalChnagesButton submitBtn float-right mr-1" onClick={this.acceptIncomingChangesShipment}> <i className="fa fa-check"></i>{i18n.t('static.commitVersion.acceptLatestVersion')}</Button>{' '}
          </ModalFooter>
        </Modal>
        <Modal isOpen={this.state.conflictsProblem}
          className={'modal-lg modalWidth ' + this.props.className} style={{ display: this.state.loading ? "none" : "block" }}>
          <ModalHeader toggle={() => this.toggleLargeProblem()} className="modalHeaderSupplyPlan">
            <strong>{i18n.t('static.commitVersion.resolveConflicts')}</strong>
            <ul className="legendcommitversion">
              <li><span className="greenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInCurrentVersion')}</span></li>
              <li><span className="notawesome  legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInLatestVersion')}</span></li>
            </ul>
          </ModalHeader>
          <ModalBody>
            <div className="table-responsive RemoveStriped consumptionDataEntryTable">
              <div id="resolveConflictsProblemTable" />
              <input type="hidden" id="indexProblem" />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.acceptCurrentChangesProblem}> <i className="fa fa-check"></i>{i18n.t('static.commitVersion.acceptCurrentVersion')}</Button>{' '}
            <Button type="submit" size="md" className="acceptLocalChnagesButton submitBtn float-right mr-1" onClick={this.acceptIncomingChangesProblem}> <i className="fa fa-check"></i>{i18n.t('static.commitVersion.acceptLatestVersion')}</Button>{' '}
          </ModalFooter>
        </Modal>
      </div>
    );
  };
  /**
   * This function is called when user clicks on commit button to send the data on server
   */
  synchronize() {
    this.setState({ loading: true });
    var checkValidations = true;
    if (checkValidations) {
      var problemReportList = [];
      var problemJson = (this.state.mergedProblemListJexcel).getJson();
      var oldProgramDataProblem = this.state.oldProgramDataProblemList;
      var latestProgramDataProblem = this.state.latestProgramDataProblemList;
      for (var c = 0; c < problemJson.length; c++) {
        if (((problemJson[c])[20] == 2 || (problemJson[c])[20] == 4) && (problemJson[c])[0] != 0) {
          problemReportList.push(oldProgramDataProblem.filter(a => a.problemReportId == (problemJson[c])[0])[0]);
        } else if ((problemJson[c])[20] == 3 && (problemJson[c])[0] != 0) {
          problemReportList.push(latestProgramDataProblem.filter(a => a.problemReportId == (problemJson[c])[0])[0]);
        }
      }
      problemReportList = (problemReportList.concat(oldProgramDataProblem.filter(c => c.problemReportId == 0))).filter(c => c.newAdded != true);
      problemReportList = problemReportList.filter(c => c.planningUnitActive != false && c.regionActive != false);
      if (problemReportList.filter(c =>
        c.problemStatus.id == OPEN_PROBLEM_STATUS_ID
      ).length > 0 && document.getElementById("versionType").value == FINAL_VERSION_TYPE && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes("ROLE_BF_READONLY_ACCESS_REALM_ADMIN")) {
        alert(i18n.t("static.commitVersion.cannotCommitWithOpenProblems"))
        this.setState({ loading: false });
      } else {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
          this.setState({
            supplyPlanError: i18n.t('static.program.errortext')
          })
        }.bind(this);
        openRequest.onsuccess = function (e) {
          db1 = e.target.result;
          var programDataTransaction = db1.transaction(['whatIfProgramData'], 'readwrite');
          var programDataOs = programDataTransaction.objectStore('whatIfProgramData');
          var programRequest = programDataOs.get((this.state.programId).value);
          programRequest.onerror = function (event) {
            this.setState({
              supplyPlanError: i18n.t('static.program.errortext')
            })
          }.bind(this);
          programRequest.onsuccess = function (e) {
            var programQPLDetailsTransaction1 = db1.transaction(['programQPLDetails'], 'readwrite');
            var programQPLDetailsOs1 = programQPLDetailsTransaction1.objectStore('programQPLDetails');
            var programQPLDetailsGetRequest = programQPLDetailsOs1.get((this.state.programId).value);
            programQPLDetailsGetRequest.onsuccess = function (event) {
              var programQPLDetails = programQPLDetailsGetRequest.result;
              var generalDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData.generalData, SECRET_KEY);
              var generalData = generalDataBytes.toString(CryptoJS.enc.Utf8);
              var generalJson = JSON.parse(generalData);
              var planningUnitDataList = programRequest.result.programData.planningUnitDataList;
              var consumptionList = [];
              var inventoryList = [];
              var shipmentList = [];
              var batchInfoList = [];
              var supplyPlan = [];
              for (var pu = 0; pu < planningUnitDataList.length; pu++) {
                var planningUnitData = planningUnitDataList[pu];
                var programDataBytes = CryptoJS.AES.decrypt(planningUnitData.planningUnitData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var planningUnitDataJson = JSON.parse(programData);
                consumptionList = consumptionList.concat(planningUnitDataJson.consumptionList);
                inventoryList = inventoryList.concat(planningUnitDataJson.inventoryList);
                shipmentList = shipmentList.concat(planningUnitDataJson.shipmentList);
                batchInfoList = batchInfoList.concat(planningUnitDataJson.batchInfoList);
                supplyPlan = supplyPlan.concat(planningUnitDataJson.supplyPlan);
              }
              var sl = shipmentList.filter(c => c.budget.id === "");
              sl.map(item => {
                var index = shipmentList.findIndex(c => item.shipmentId > 0 ? c.shipmentId == item.shipmentId : c.tempShipmentId == item.tempShipmentId);
                if (index != -1) {
                  shipmentList[index].budget.id = 0;
                }
              })
              var programJson = generalJson;
              programJson.consumptionList = consumptionList;
              programJson.inventoryList = inventoryList;
              programJson.shipmentList = shipmentList;
              programJson.batchInfoList = batchInfoList;
              programJson.supplyPlan = supplyPlan;
              var generalDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData.generalData, SECRET_KEY);
              var generalData = generalDataBytes.toString(CryptoJS.enc.Utf8);
              var generalJson = JSON.parse(generalData);
              var planningUnitDataList = programRequest.result.programData.planningUnitDataList;
              var consumptionList = [];
              var inventoryList = [];
              var shipmentList = [];
              var batchInfoList = [];
              var supplyPlan = [];
              for (var pu = 0; pu < planningUnitDataList.length; pu++) {
                var planningUnitData = planningUnitDataList[pu];
                var programDataBytes = CryptoJS.AES.decrypt(planningUnitData.planningUnitData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var planningUnitDataJson = JSON.parse(programData);
                consumptionList = consumptionList.concat(planningUnitDataJson.consumptionList);
                inventoryList = inventoryList.concat(planningUnitDataJson.inventoryList);
                shipmentList = shipmentList.concat(planningUnitDataJson.shipmentList);
                batchInfoList = batchInfoList.concat(planningUnitDataJson.batchInfoList);
                supplyPlan = supplyPlan.concat(planningUnitDataJson.supplyPlan);
              }
              var sl = shipmentList.filter(c => c.budget.id === "");
              sl.map(item => {
                var index = shipmentList.findIndex(c => item.shipmentId > 0 ? c.shipmentId == item.shipmentId : c.tempShipmentId == item.tempShipmentId);
                if (index != -1) {
                  shipmentList[index].budget.id = 0;
                }
              })
              var programJson = generalJson;
              programJson.consumptionList = consumptionList;
              programJson.inventoryList = inventoryList;
              programJson.shipmentList = shipmentList;
              programJson.batchInfoList = batchInfoList;
              programJson.supplyPlan = supplyPlan;
              var problemReportList = [];
              var problemJson = (this.state.mergedProblemListJexcel).getJson();
              var oldProgramDataProblem = this.state.oldProgramDataProblemList;
              var latestProgramDataProblem = this.state.latestProgramDataProblemList;
              for (var c = 0; c < problemJson.length; c++) {
                if (((problemJson[c])[20] == 2 || (problemJson[c])[20] == 4) && (problemJson[c])[0] != 0) {
                  problemReportList.push(oldProgramDataProblem.filter(a => a.problemReportId == (problemJson[c])[0])[0]);
                } else if ((problemJson[c])[20] == 3 && (problemJson[c])[0] != 0) {
                  problemReportList.push(latestProgramDataProblem.filter(a => a.problemReportId == (problemJson[c])[0])[0]);
                }
              }
              problemReportList = (problemReportList.concat(oldProgramDataProblem.filter(c => c.problemReportId == 0))).filter(c => c.newAdded != true);
              problemReportList = problemReportList.filter(c => c.planningUnitActive != false && c.regionActive != false);
              programJson.problemReportList = problemReportList;
              let versionType = document.getElementById("versionType").value;
              programJson.versionType = { id: versionType };
              programJson.versionStatus = { id: versionType == 2? PENDING_APPROVAL_VERSION_STATUS : NO_REVIEW_NEEDED_VERSION_STATUS};
              programJson.notes = document.getElementById("notes").value;
              const compressedData = isCompress(programJson);
              ProgramService.saveProgramData(compressedData, this.state.comparedLatestVersion).then(response => {
                if (response.status == 200) {
                  var transactionForProgramQPLDetails = db1.transaction(['programQPLDetails'], 'readwrite');
                  var programQPLDetailSaveData = transactionForProgramQPLDetails.objectStore('programQPLDetails');
                  programQPLDetails.readonly = 1;
                  var putRequest2 = programQPLDetailSaveData.put(programQPLDetails);
                  localStorage.setItem("sesProgramId", "");
                  this.setState({
                    progressPer: 50
                    , message: i18n.t('static.commitVersion.sendLocalToServerCompleted'), color: 'green'
                  }, () => {
                    this.hideFirstComponent();
                    this.redirectToDashbaord(response.data);
                  })
                } else {
                  this.setState({
                    message: response.data.messageCode,
                    color: "red",
                    loading: false
                  })
                  this.hideFirstComponent();
                }
              })
                .catch(
                  error => {
                    if (error.message === "Network Error") {
                      this.setState({
                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                        color: "red",
                        loading: false
                      }, () => {
                        this.hideFirstComponent();
                      });
                    } else {
                      switch (error.response ? error.response.status : "") {
                        case 401:
                          this.props.history.push(`/login/static.message.sessionExpired`)
                          break;
                        case 403:
                          this.props.history.push(`/accessDenied`)
                          break;
                        case 406:
                          if (error.response.data.messageCode == 'static.commitVersion.versionIsOutDated') {
                            alert(i18n.t("static.commitVersion.versionIsOutDated"));
                          }
                          this.setState({
                            message: error.response.data.messageCode,
                            color: "red",
                            loading: false
                          }, () => {
                            this.hideFirstComponent()
                            if (error.response.data.messageCode == 'static.commitVersion.versionIsOutDated') {
                              this.checkLastModifiedDateForProgram(this.state.programId);
                            }
                          });
                          break;
                        case 500:
                        case 404:
                        case 412:
                          this.setState({
                            message: error.response.data.messageCode,
                            loading: false,
                            color: "red"
                          }, () => {
                            this.hideFirstComponent()
                          });
                          break;
                        default:
                          this.setState({
                            message: 'static.unkownError',
                            loading: false,
                            color: "red"
                          }, () => {
                            this.hideFirstComponent()
                          });
                          break;
                      }
                    }
                  }
                );
            }.bind(this)
          }.bind(this)
        }.bind(this)
      }
    } else {
      this.setState({ "noFundsBudgetError": i18n.t('static.label.noFundsAvailable'), loading: false });
      this.hideSecondComponent();
    }
  }
  /**
   * This function is called when user clicks on the cancel button and is redirected to dashboard
   */
  cancelClicked() {
    let id = AuthenticationService.displayDashboardBasedOnRole();
    this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
  }
  /**
   * This function is used to check the status of commit and once the commit is sucessful then call the load the latest version function
   * @param {*} commitRequestId This is the commit request Id that is auto generated when user commits a version
   */
  redirectToDashbaord(commitRequestId) {
    this.setState({ loading: true });
    AuthenticationService.setupAxiosInterceptors();
    ProgramService.sendNotificationAsync(commitRequestId).then(resp => {
      var curUser = AuthenticationService.getLoggedInUserId();
      if (resp.data.createdBy.userId == curUser && resp.data.status == 1) {
        setTimeout(function () {
          this.redirectToDashbaord(commitRequestId)
        }.bind(this), 10000);
      } else if (resp.data.createdBy.userId == curUser && resp.data.status == 2) {
        this.setState({
          progressPer: 75
          , message: i18n.t('static.commitVersion.serverProcessingCompleted'), color: 'green'
        }, () => {
          this.hideFirstComponent();
          this.getLatestProgram({ openModal: true, notificationDetails: resp.data });
        })
      } else if (resp.data.createdBy.userId == curUser && resp.data.status == 3) {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
          this.setState({
            message: i18n.t('static.program.errortext'),
            color: 'red'
          })
          this.hideFirstComponent()
        }.bind(this);
        openRequest.onsuccess = function (e) {
          db1 = e.target.result;
          var transaction = db1.transaction(['programQPLDetails'], 'readwrite');
          var program = transaction.objectStore('programQPLDetails');
          var getRequest = program.get((this.state.programId).value);
          getRequest.onerror = function (event) {
            this.setState({
              message: i18n.t('static.program.errortext'),
              color: 'red'
            })
            this.hideFirstComponent()
          }.bind(this);
          getRequest.onsuccess = function (event) {
            var myResult = [];
            myResult = getRequest.result;
            myResult.readonly = 0;
            var transaction1 = db1.transaction(['programQPLDetails'], 'readwrite');
            var program1 = transaction1.objectStore('programQPLDetails');
            var getRequest1 = program1.put(myResult);
            getRequest1.onsuccess = function (e) {
              this.setState({
                message: i18n.t('static.commitVersion.commitFailed'),
                color: 'red',
                loading: false
              })
              this.hideFirstComponent()
            }.bind(this)
          }.bind(this)
        }.bind(this)
      }
    }).catch(
      error => {
        this.redirectToDashbaord(commitRequestId)
      })
  }
  /**
   * This function is used to get the latest program version
   * @param {*} notificationDetails This is the program Id which user is trying to commit
   */
  getLatestProgram(notificationDetails) {
    this.setState({ loading: true });
    var checkboxesChecked = [];
    var programIdsToSyncArray = [];
    var notificationArray = [];
    notificationArray.push(notificationDetails)
    var programIdsSuccessfullyCommitted = notificationArray;
    for (var i = 0; i < programIdsSuccessfullyCommitted.length; i++) {
      var index = checkboxesChecked.findIndex(c => c.programId == programIdsSuccessfullyCommitted[i].notificationDetails.program.id);
      if (index == -1) {
        checkboxesChecked.push({ programId: programIdsSuccessfullyCommitted[i].notificationDetails.program.id, versionId: -1 })
      }
    }
    ProgramService.getAllProgramData(checkboxesChecked)
      .then(response => {
        response.data = decompressJson(response.data);
        var json = response.data;
        var updatedJson = [];
        for (var r = 0; r < json.length; r++) {
          var planningUnitList = json[r].planningUnitList;
          var consumptionList = json[r].consumptionList;
          var inventoryList = json[r].inventoryList;
          var shipmentList = json[r].shipmentList;
          var batchInfoList = json[r].batchInfoList;
          var supplyPlan = json[r].supplyPlan;
          var generalData = json[r];
          delete generalData.consumptionList;
          delete generalData.inventoryList;
          delete generalData.shipmentList;
          delete generalData.batchInfoList;
          delete generalData.supplyPlan;
          delete generalData.planningUnitList;
          generalData.actionList = [];
          var generalEncryptedData = CryptoJS.AES.encrypt(JSON.stringify(generalData), SECRET_KEY).toString();
          var planningUnitDataList = [];
          for (var pu = 0; pu < planningUnitList.length; pu++) {
            var planningUnitDataJson = {
              consumptionList: consumptionList.filter(c => c.planningUnit.id == planningUnitList[pu].id),
              inventoryList: inventoryList.filter(c => c.planningUnit.id == planningUnitList[pu].id),
              shipmentList: shipmentList.filter(c => c.planningUnit.id == planningUnitList[pu].id),
              batchInfoList: batchInfoList.filter(c => c.planningUnitId == planningUnitList[pu].id),
              supplyPlan: supplyPlan.filter(c => c.planningUnitId == planningUnitList[pu].id)
            }
            var encryptedPlanningUnitDataText = CryptoJS.AES.encrypt(JSON.stringify(planningUnitDataJson), SECRET_KEY).toString();
            planningUnitDataList.push({ planningUnitId: planningUnitList[pu].id, planningUnitData: encryptedPlanningUnitDataText })
          }
          var programDataJson = {
            generalData: generalEncryptedData,
            planningUnitDataList: planningUnitDataList
          };
          updatedJson.push(programDataJson);
        }
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
          this.setState({
            message: i18n.t('static.program.errortext'),
            color: 'red'
          })
          this.hideFirstComponent()
        }.bind(this);
        openRequest.onsuccess = function (e) {
          db1 = e.target.result;
          var transaction = db1.transaction(['programQPLDetails'], 'readwrite');
          var program = transaction.objectStore('programQPLDetails');
          var getRequest = program.getAll();
          getRequest.onerror = function (event) {
            this.setState({
              message: i18n.t('static.program.errortext'),
              color: 'red'
            })
            this.hideFirstComponent()
          }.bind(this);
          getRequest.onsuccess = function (event) {
            var myResult = [];
            myResult = getRequest.result;
            var userId = AuthenticationService.getLoggedInUserId();
            var programDataTransaction1 = db1.transaction(['programData'], 'readwrite');
            var programDataOs1 = programDataTransaction1.objectStore('programData');
            for (var dpd = 0; dpd < programIdsSuccessfullyCommitted.length; dpd++) {
              var checkIfProgramExists = myResult.filter(c => c.programId == programIdsSuccessfullyCommitted[dpd].notificationDetails.program.id && c.version == programIdsSuccessfullyCommitted[dpd].notificationDetails.committedVersionId && c.readonly == 1 && c.userId == userId);
              var programIdToDelete = 0;
              if (checkIfProgramExists.length > 0) {
                programIdToDelete = checkIfProgramExists[0].id;
              }
              programDataOs1.delete(checkIfProgramExists[0].id);
            }
            programDataTransaction1.oncomplete = function (event) {
              var programDataTransaction3 = db1.transaction(['programQPLDetails'], 'readwrite');
              var programDataOs3 = programDataTransaction3.objectStore('programQPLDetails');
              for (var dpd = 0; dpd < programIdsSuccessfullyCommitted.length; dpd++) {
                var checkIfProgramExists = myResult.filter(c => c.programId == programIdsSuccessfullyCommitted[dpd].notificationDetails.program.id && c.version == programIdsSuccessfullyCommitted[dpd].notificationDetails.committedVersionId && c.readonly == 1 && c.userId == userId);
                var programIdToDelete = 0;
                if (checkIfProgramExists.length > 0) {
                  programIdToDelete = checkIfProgramExists[0].id;
                }
                programDataOs3.delete(checkIfProgramExists[0].id);
              }
              programDataTransaction3.oncomplete = function (event) {
                var programDataTransaction2 = db1.transaction(['downloadedProgramData'], 'readwrite');
                var programDataOs2 = programDataTransaction2.objectStore('downloadedProgramData');
                for (var dpd = 0; dpd < programIdsSuccessfullyCommitted.length; dpd++) {
                  var checkIfProgramExists = myResult.filter(c => c.programId == programIdsSuccessfullyCommitted[dpd].notificationDetails.program.id && c.version == programIdsSuccessfullyCommitted[dpd].notificationDetails.committedVersionId && c.readonly == 1 && c.userId == userId);
                  var programIdToDelete = 0;
                  if (checkIfProgramExists.length > 0) {
                    programIdToDelete = checkIfProgramExists[0].id;
                  }
                  programDataOs2.delete(checkIfProgramExists[0].id);
                }
                programDataTransaction2.oncomplete = function (event) {
                  var transactionForSavingData = db1.transaction(['programData'], 'readwrite');
                  var programSaveData = transactionForSavingData.objectStore('programData');
                  for (var r = 0; r < json.length; r++) {
                    json[r].actionList = [];
                    var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                    var userId = userBytes.toString(CryptoJS.enc.Utf8);
                    var version = json[r].requestedProgramVersion;
                    if (version == -1) {
                      version = json[r].currentVersion.versionId
                    }
                    var item = {
                      id: json[r].programId + "_v" + version + "_uId_" + userId,
                      programId: json[r].programId,
                      version: version,
                      programName: (CryptoJS.AES.encrypt(JSON.stringify((json[r].label)), SECRET_KEY)).toString(),
                      programData: updatedJson[r],
                      userId: userId,
                      programCode: json[r].programCode,
                    };
                    programIdsToSyncArray.push(json[r].programId + "_v" + version + "_uId_" + userId)
                    programSaveData.put(item);
                  }
                  transactionForSavingData.oncomplete = function (event) {
                    var transactionForSavingDownloadedProgramData = db1.transaction(['downloadedProgramData'], 'readwrite');
                    var downloadedProgramSaveData = transactionForSavingDownloadedProgramData.objectStore('downloadedProgramData');
                    for (var r = 0; r < json.length; r++) {
                      var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                      var userId = userBytes.toString(CryptoJS.enc.Utf8);
                      var version = json[r].requestedProgramVersion;
                      if (version == -1) {
                        version = json[r].currentVersion.versionId
                      }
                      var item = {
                        id: json[r].programId + "_v" + version + "_uId_" + userId,
                        programId: json[r].programId,
                        version: version,
                        programName: (CryptoJS.AES.encrypt(JSON.stringify((json[r].label)), SECRET_KEY)).toString(),
                        programData: updatedJson[r],
                        userId: userId
                      };
                      downloadedProgramSaveData.put(item);
                    }
                    transactionForSavingDownloadedProgramData.oncomplete = function (event) {
                      var programQPLDetailsTransaction = db1.transaction(['programQPLDetails'], 'readwrite');
                      var programQPLDetailsOs = programQPLDetailsTransaction.objectStore('programQPLDetails');
                      var programIds = []
                      for (var r = 0; r < json.length; r++) {
                        var programQPLDetailsJson = {
                          id: json[r].programId + "_v" + json[r].currentVersion.versionId + "_uId_" + userId,
                          programId: json[r].programId,
                          version: json[r].currentVersion.versionId,
                          userId: userId,
                          programCode: json[r].programCode,
                          openCount: 0,
                          addressedCount: 0,
                          programModified: 0,
                          readonly: 0
                        };
                        programIds.push(json[r].programId + "_v" + json[r].currentVersion.versionId + "_uId_" + userId);
                        programQPLDetailsOs.put(programQPLDetailsJson);
                      }
                      programQPLDetailsTransaction.oncomplete = function (event) {
                        this.setState({
                          progressPer: 100
                        })
                        this.goToMasterDataSync(programIdsToSyncArray);
                      }.bind(this)
                    }.bind(this)
                  }.bind(this);
                }.bind(this);
              }.bind(this);
            }.bind(this);
          }.bind(this);
        }.bind(this);
      })
  }
  /**
   * This function is used to redirect user to master data sync screen after the latest version is loaded
   * @param {*} programIds This is the program Id which user is trying to commit
   */
  goToMasterDataSync(programIds) {
    this.props.history.push({ pathname: `/syncProgram/green/` + i18n.t('static.message.commitSuccess'), state: { "programIds": programIds } });
  }
  /**
   * This function is used to update the state of this component from any other component
   * @param {*} parameterName This is the name of the key
   * @param {*} value This is the value for the key
   */
  updateState(parameterName, value) {
    this.setState({
      [parameterName]: value
    })
  }
  /**
   * This function is used to build the jexcel tables for consumption, inventory, shipment, erp linked shipments and problem list
   */
  fetchData() {
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
      this.setState({
        commitVersionError: i18n.t('static.program.errortext'),
        loading: false
      })
      this.hideSecondComponent()
    }.bind(this);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var programDataTransaction = db1.transaction(['whatIfProgramData'], 'readwrite');
      var programDataOs = programDataTransaction.objectStore('whatIfProgramData');
      var value = (this.state.programId);
      var programRequest = programDataOs.get(value != "" && value != undefined ? value.value : 0);
      programRequest.onerror = function (event) {
        this.setState({
          commitVersionError: i18n.t('static.program.errortext'),
          loading: false
        })
        this.hideSecondComponent()
      }.bind(this);
      programRequest.onsuccess = function (e) {
        var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData.generalData, SECRET_KEY);
        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
        var programJson = JSON.parse(programData);
        var oldProgramData = programJson;
        var latestProgramDataProblemList = this.state.latestProgramData.problemReportList;
        var oldProgramDataProblemList = oldProgramData.problemReportList;
        var downloadedProgramDataProblemList = this.state.downloadedProgramData.problemReportList;
        var mergedProblemListData = [];
        var existingProblemReportId = [];
        for (var c = 0; c < oldProgramDataProblemList.length; c++) {
          if (oldProgramDataProblemList[c].problemReportId != 0) {
            mergedProblemListData.push(oldProgramDataProblemList[c]);
            existingProblemReportId.push(oldProgramDataProblemList[c].problemReportId);
          } else {
            var index = 0;
            if (oldProgramDataProblemList[c].realmProblem.problem.problemId == 1 || oldProgramDataProblemList[c].realmProblem.problem.problemId == 2 || oldProgramDataProblemList[c].realmProblem.problem.problemId == 8 || oldProgramDataProblemList[c].realmProblem.problem.problemId == 10 || oldProgramDataProblemList[c].realmProblem.problem.problemId == 14 || oldProgramDataProblemList[c].realmProblem.problem.problemId == 15 || oldProgramDataProblemList[c].realmProblem.problem.problemId == 25) {
              index = latestProgramDataProblemList.findIndex(
                f =>
                  f.region != null && f.region.id != 0 &&
                  f.region.id == oldProgramDataProblemList[c].region.id
                  && f.planningUnit.id == oldProgramDataProblemList[c].planningUnit.id
                  && f.realmProblem.problem.problemId == oldProgramDataProblemList[c].realmProblem.problem.problemId &&
                  !existingProblemReportId.includes(f.problemReportId));
            } else if (oldProgramDataProblemList[c].realmProblem.problem.problemId == 13) {
              index = -1;
            } else if (oldProgramDataProblemList[c].realmProblem.problem.problemId == 3 || oldProgramDataProblemList[c].realmProblem.problem.problemId == 4 || oldProgramDataProblemList[c].realmProblem.problem.problemId == 5 || oldProgramDataProblemList[c].realmProblem.problem.problemId == 6 || oldProgramDataProblemList[c].realmProblem.problem.problemId == 7) {
              index = latestProgramDataProblemList.findIndex(
                f =>
                  f.realmProblem.problem.problemId == oldProgramDataProblemList[c].realmProblem.problem.problemId
                  && f.shipmentId == oldProgramDataProblemList[c].shipmentId &&
                  !existingProblemReportId.includes(f.problemReportId));
            } else if (oldProgramDataProblemList[c].realmProblem.problem.problemId == 23 || oldProgramDataProblemList[c].realmProblem.problem.problemId == 24 || oldProgramDataProblemList[c].realmProblem.problem.problemId == 29) {
              index = latestProgramDataProblemList.findIndex(
                f =>
                  f.planningUnit.id == oldProgramDataProblemList[c].planningUnit.id
                  && f.realmProblem.problem.problemId == oldProgramDataProblemList[c].realmProblem.problem.problemId &&
                  !existingProblemReportId.includes(f.problemReportId));
            }
            if (index == -1) {
              mergedProblemListData.push(oldProgramDataProblemList[c]);
            } else {
              oldProgramDataProblemList[c].problemReportId = latestProgramDataProblemList[index].problemReportId;
              existingProblemReportId.push(latestProgramDataProblemList[index].problemReportId);
              mergedProblemListData.push(oldProgramDataProblemList[c]);
            }
          }
        }
        var latestOtherProblemListEntries = latestProgramDataProblemList.filter(c => !(existingProblemReportId.includes(c.problemReportId)));
        mergedProblemListData = mergedProblemListData.concat(latestOtherProblemListEntries);
        mergedProblemListData = mergedProblemListData.filter(c => c.planningUnitActive != false && c.regionActive != false)
        this.setState({
          openCount: mergedProblemListData.filter(c =>
            c.problemStatus.id == OPEN_PROBLEM_STATUS_ID
          ).length
        })
        var data = [];
        var mergedProblemListJexcel = [];
        for (var cd = 0; cd < mergedProblemListData.length; cd++) {
          data = []
          data[0] = mergedProblemListData[cd].problemReportId;
          data[1] = 1;
          data[2] = mergedProblemListData[cd].program.code;
          data[3] = 1;
          data[4] = (mergedProblemListData[cd].region != null && mergedProblemListData[cd].region.id != 0) ? (getLabelText(mergedProblemListData[cd].region.label, this.state.lang)) : '';
          data[5] = getLabelText(mergedProblemListData[cd].planningUnit.label, this.state.lang);
          data[6] = (mergedProblemListData[cd].dt != null) ? (moment(mergedProblemListData[cd].dt).format('MMM-YY')) : '';
          data[7] = moment(mergedProblemListData[cd].createdDate).format('MMM-YY');
          data[8] = getProblemDesc(mergedProblemListData[cd], this.state.lang);
          data[9] = getSuggestion(mergedProblemListData[cd], this.state.lang);
          data[10] = getLabelText(mergedProblemListData[cd].problemStatus.label, this.state.lang);
          data[11] = this.getNote(mergedProblemListData[cd], this.state.lang);
          data[12] = mergedProblemListData[cd].problemStatus.id;
          data[13] = mergedProblemListData[cd].planningUnit.id;
          data[14] = mergedProblemListData[cd].realmProblem.problem.problemId;
          data[15] = mergedProblemListData[cd].realmProblem.problem.actionUrl;
          data[16] = mergedProblemListData[cd].realmProblem.criticality.id;
          var oldDataList = oldProgramDataProblemList.filter(c => c.problemReportId == mergedProblemListData[cd].problemReportId);
          var oldData = ""
          if (oldDataList.length > 0) {
            oldData = [oldDataList[0].problemReportId, 1, oldDataList[0].program.code, 1, (oldDataList[0].region != null && oldDataList[0].region.id != 0) ? (getLabelText(oldDataList[0].region.label, this.state.lang)) : '', getLabelText(oldDataList[0].planningUnit.label, this.state.lang), (oldDataList[0].dt != null) ? (moment(oldDataList[0].dt).format('MMM-YY')) : '', moment(oldDataList[0].createdDate).format('MMM-YY'), getProblemDesc(oldDataList[0], this.state.lang), getSuggestion(oldDataList[0], this.state.lang), getLabelText(oldDataList[0].problemStatus.label, this.state.lang), this.getNote(oldDataList[0], this.state.lang), oldDataList[0].problemStatus.id, oldDataList[0].planningUnit.id, oldDataList[0].realmProblem.problem.problemId, oldDataList[0].realmProblem.problem.actionUrl, oldDataList[0].realmProblem.criticality.id, "", "", "", 4];
          }
          data[17] = oldData;
          var latestDataList = latestProgramDataProblemList.filter(c => mergedProblemListData[cd].problemReportId != 0 && c.problemReportId == mergedProblemListData[cd].problemReportId);
          var latestData = ""
          if (latestDataList.length > 0) {
            latestData = [latestDataList[0].problemReportId, 1, latestDataList[0].program.code, 1, (latestDataList[0].region != null && latestDataList[0].region.id != 0) ? (getLabelText(latestDataList[0].region.label, this.state.lang)) : '', getLabelText(latestDataList[0].planningUnit.label, this.state.lang), (latestDataList[0].dt != null) ? (moment(latestDataList[0].dt).format('MMM-YY')) : '', moment(latestDataList[0].createdDate).format('MMM-YY'), getProblemDesc(latestDataList[0], this.state.lang), getSuggestion(latestDataList[0], this.state.lang), getLabelText(latestDataList[0].problemStatus.label, this.state.lang), this.getNote(latestDataList[0], this.state.lang), latestDataList[0].problemStatus.id, latestDataList[0].planningUnit.id, latestDataList[0].realmProblem.problem.problemId, latestDataList[0].realmProblem.problem.actionUrl, latestDataList[0].realmProblem.criticality.id, "", "", "", 4];
          }
          data[18] = latestData;
          var downloadedDataList = downloadedProgramDataProblemList.filter(c => mergedProblemListData[cd].problemReportId != 0 && c.problemReportId == mergedProblemListData[cd].problemReportId);
          var downloadedData = "";
          if (downloadedDataList.length > 0) {
            downloadedData = [downloadedDataList[0].problemReportId, 1, downloadedDataList[0].program.code, 1, (downloadedDataList[0].region != null && downloadedDataList[0].region.id != 0) ? (getLabelText(downloadedDataList[0].region.label, this.state.lang)) : '', getLabelText(downloadedDataList[0].planningUnit.label, this.state.lang), (downloadedDataList[0].dt != null) ? (moment(downloadedDataList[0].dt).format('MMM-YY')) : '', moment(downloadedDataList[0].createdDate).format('MMM-YY'), getProblemDesc(downloadedDataList[0], this.state.lang), getSuggestion(downloadedDataList[0], this.state.lang), getLabelText(downloadedDataList[0].problemStatus.label, this.state.lang), this.getNote(downloadedDataList[0], this.state.lang), downloadedDataList[0].problemStatus.id, downloadedDataList[0].planningUnit.id, downloadedDataList[0].realmProblem.problem.problemId, downloadedDataList[0].realmProblem.problem.actionUrl, downloadedDataList[0].realmProblem.criticality.id, "", "", "", 4];
          }
          data[19] = downloadedData;
          data[20] = 4;
          mergedProblemListJexcel.push(data);
        }
        var options = {
          data: mergedProblemListJexcel,
          columnDrag: false,
          colWidths: [50, 10, 10, 50, 10, 100, 10, 50, 180, 180, 50, 100],
          colHeaderClasses: ["Reqasterisk"],
          columns: [
            {
              title: i18n.t('static.commitVersion.problemReportId'),
              type: 'hidden',
            },
            {
              title: 'problemActionIndex',
              type: 'hidden',
            },
            {
              title: i18n.t('static.program.programCode'),
              type: 'hidden',
            },
            {
              title: i18n.t('static.program.versionId'),
              type: 'hidden',
            },
            {
              title: i18n.t('static.region.region'),
              type: 'hidden',
            },
            {
              title: i18n.t('static.planningunit.planningunit'),
              type: 'text',
            },
            {
              title: i18n.t('static.report.month'),
              type: 'hidden',
            },
            {
              title: i18n.t('static.report.createdDate'),
              type: 'hidden',
            },
            {
              title: i18n.t('static.report.problemDescription'),
              type: 'text',
            },
            {
              title: i18n.t('static.report.suggession'),
              type: 'text',
            },
            {
              title: i18n.t('static.report.problemStatus'),
              type: 'text',
            },
            {
              title: i18n.t('static.program.notes'),
              type: 'text',
            },
            {
              title: i18n.t('static.common.action'),
              type: 'hidden',
            },
            {
              title: 'planningUnitId',
              type: 'hidden',
            },
            {
              title: 'problemId',
              type: 'hidden',
            },
            {
              title: 'actionUrl',
              type: 'hidden',
            },
            {
              title: 'criticalitiId',
              type: 'hidden',
            },
            { type: 'hidden', title: 'Old data' },
            { type: 'hidden', title: 'latest data' },
            { type: 'hidden', title: 'downloaded data' },
            { type: 'hidden', title: 'result of compare' },
          ],
          pagination: localStorage.getItem("sesRecordCount"),
          paginationOptions: JEXCEL_PAGINATION_OPTION,
          search: true,
          columnSorting: true,
          wordWrap: true,
          allowInsertColumn: false,
          allowManualInsertColumn: false,
          allowDeleteRow: false,
          onload: this.loadedFunctionForMergeProblemList,
          filters: true,
          license: JEXCEL_PRO_KEY,
          contextMenu: function (obj, x, y, e) {
            var items = [];
            var rowData = obj.getRowData(y)
            if (rowData[20].toString() == 1) {
              items.push({
                title: "Resolve conflicts",
                onclick: function () {
                  this.setState({ loading: true })
                  this.toggleLargeProblem(rowData[17], rowData[18], y, 'problemList');
                }.bind(this)
              })
            } else {
              return false;
            }
            return items;
          }.bind(this)
        };
        var mergedProblemListJexcel = jexcel(document.getElementById("mergedVersionProblemList"), options);
        this.el = mergedProblemListJexcel;
        this.setState({
          mergedProblemListJexcel: mergedProblemListJexcel,
          oldProgramDataProblemList: oldProgramDataProblemList,
          latestProgramDataProblemList: latestProgramDataProblemList,
          mergedProblemListData: mergedProblemListData,
          loading: false
        })
      }.bind(this)
    }.bind(this)
  }
}