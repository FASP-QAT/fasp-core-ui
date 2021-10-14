import React, { Component } from 'react';
import { Formik } from 'formik';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import {
  Col, Row, Card, CardBody, Form,
  FormGroup, Label, InputGroup, Input, Button,
  Nav, NavItem, NavLink, TabContent, TabPane, CardFooter, Modal, ModalBody, ModalFooter, ModalHeader,
  FormFeedback
} from 'reactstrap';
import * as Yup from 'yup';
import CryptoJS from 'crypto-js';
import { SECRET_KEY, INDEXED_DB_NAME, INDEXED_DB_VERSION, LOCAL_VERSION_COLOUR, LATEST_VERSION_COLOUR, PENDING_APPROVAL_VERSION_STATUS, DATE_FORMAT_CAP, DATE_FORMAT_CAP_WITHOUT_DATE, CANCELLED_SHIPMENT_STATUS, JEXCEL_PAGINATION_OPTION, OPEN_PROBLEM_STATUS_ID, JEXCEL_PRO_KEY, FINAL_VERSION_TYPE, PROBLEM_STATUS_IN_COMPLIANCE, ACTUAL_CONSUMPTION_MODIFIED, FORECASTED_CONSUMPTION_MODIFIED, INVENTORY_MODIFIED, ADJUSTMENT_MODIFIED, SHIPMENT_MODIFIED, SPECIAL_CHARECTER_WITH_NUM } from '../../Constants.js';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import getLabelText from '../../CommonComponent/getLabelText';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import ProgramService from '../../api/ProgramService';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import { jExcelLoadedFunctionWithoutPagination, jExcelLoadedFunctionOnlyHideRow, inValid, inValidWithColor, jExcelLoadedFunction, } from '../../CommonComponent/JExcelCommonFunctions.js'
import moment from "moment";
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import getSuggestion from '../../CommonComponent/getSuggestion';
import getProblemDesc from '../../CommonComponent/getProblemDesc';
import { calculateSupplyPlan } from '../SupplyPlan/SupplyPlanCalculations';
import QatProblemActions from '../../CommonComponent/QatProblemActions'
import QatProblemActionNew from '../../CommonComponent/QatProblemActionNew'
import LanguageService from '../../api/LanguageService';
import eventBus from '../../containers/DefaultLayout/eventBus';

const entityname = i18n.t('static.dashboard.commitVersion')

const initialValues = {
  notes: ''
}

const validationSchema = function (values, t) {
  return Yup.object().shape({
    notes: Yup.string()
      .matches(/^([a-zA-Z0-9\s,\./<>\?;':""[\]\\{}\|`~!@#\$%\^&\*()-_=\+]*)$/, i18n.t("static.label.validData"))
  })
}
const validate = (getValidationSchema) => {
  return (values) => {

    const validationSchema = getValidationSchema(values, i18n.t)
    try {
      validationSchema.validateSync(values, { abortEarly: false })
      return {}
    } catch (error) {
      return getErrorsFromValidationError(error)
    }
  }
}

const getErrorsFromValidationError = (validationError) => {
  const FIRST_ERROR = 0
  return validationError.inner.reduce((errors, error) => {
    return {
      ...errors,
      [error.path]: error.errors[FIRST_ERROR],
    }
  }, {})
}

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
      notes: ''
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

    this.synchronize = this.synchronize.bind(this);

    this.updateState = this.updateState.bind(this);

    this.hideFirstComponent = this.hideFirstComponent.bind(this);
    this.hideSecondComponent = this.hideSecondComponent.bind(this);
    this.fetchData = this.fetchData.bind(this)
    this.versionTypeChanged = this.versionTypeChanged.bind(this);
    this.generateDataAfterResolveConflictsForQPL = this.generateDataAfterResolveConflictsForQPL.bind(this);
    this.notesChange = this.notesChange.bind(this);
    this.checkLastModifiedDateForProgram = this.checkLastModifiedDateForProgram.bind(this)
    // this.checkValidations = this.checkValidations.bind(this);
  }

  notesChange(event) {
    this.setState({
      notes: event.target.value
    })
  }

  touchAll(setTouched, errors) {
    setTouched({
      notes: true
    }
    );
    this.validateForm(errors);
  }
  validateForm(errors) {
    this.findFirstError('budgetForm', (fieldName) => {
      return Boolean(errors[fieldName])
    })
  }
  findFirstError(formName, hasError) {
    const form = document.forms[formName]
    for (let i = 0; i < form.length; i++) {
      if (hasError(form[i].name)) {
        form[i].focus()
        break
      }
    }
  }

  versionTypeChanged(event) {
    this.setState({
      versionType: event.target.value
    })
  }

  hideFirstComponent() {
    document.getElementById('div1').style.display = 'block';
    this.state.timeout = setTimeout(function () {
      document.getElementById('div1').style.display = 'none';
    }, 8000);
  }

  hideSecondComponent() {
    document.getElementById('div2').style.display = 'block';
    this.state.timeout = setTimeout(function () {
      document.getElementById('div2').style.display = 'none';
    }, 8000);
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  toggle(tabPane, tab) {
    const newArray = this.state.activeTab.slice()
    newArray[tabPane] = tab
    this.setState({
      activeTab: newArray,
    });
  }

  toggleLarge(oldData, latestData, index, page) {
    this.setState({
      conflicts: !this.state.conflicts
    });
    if (oldData != "") {
      this.showConsumptionData(oldData, latestData, index);
    }
  }

  toggleLargeInventory(oldData, latestData, index, page) {
    this.setState({
      conflictsInventory: !this.state.conflictsInventory
    });
    if (oldData != "") {
      this.showInventoryData(oldData, latestData, index);
    }
  }

  toggleLargeShipment(oldData, latestData, index, page) {
    this.setState({
      conflictsShipment: !this.state.conflictsShipment
    });
    if (oldData != "") {
      this.showShipmentData(oldData, latestData, index);
    }
  }

  toggleLargeProblem(oldData, latestData, index, page) {
    this.setState({
      conflictsProblem: !this.state.conflictsProblem
    });
    if (oldData != "") {
      this.showProblemData(oldData, latestData, index);
    }
  }

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
      text: {
        showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
        show: '',
        entries: '',
      },
      pagination: false,
      search: false,
      filters: false,
      license: JEXCEL_PRO_KEY,
      contextMenu: function (obj, x, y, e) {
        return [];
      }.bind(this),
      columnSorting: false,
      tableOverflow: false,
      wordWrap: true,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      tableOverflow: false,
      editable: false,
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

  loadedResolveConflicts = function (instance) {
    jExcelLoadedFunctionOnlyHideRow(instance);
    var elInstance = instance.jexcel;
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
  }

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
      conflictsCount: this.state.conflictsCount - 1
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
      conflictsCount: this.state.conflictsCount - 1
    }, () => {
      if (this.state.conflictsCount == 0) {
        this.generateDataAfterResolveConflictsForQPL();
      }
    })
    this.toggleLarge('', '', 0, '');
    this.setState({ loading: false })
  }

  // Inventory functions
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
      text: {
        showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
        show: '',
        entries: '',
      },
      pagination: false,
      search: false,
      columnSorting: false,
      tableOverflow: false,
      wordWrap: true,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      tableOverflow: false,
      editable: false,
      filters: false,
      license: JEXCEL_PRO_KEY,
      contextMenu: function (obj, x, y, e) {
        return [];
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

  loadedResolveConflictsInventory = function (instance) {
    jExcelLoadedFunctionOnlyHideRow(instance);
    var elInstance = instance.jexcel;
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
  }

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
      conflictsCount: this.state.conflictsCount - 1
    }, () => {
      if (this.state.conflictsCount == 0) {
        this.generateDataAfterResolveConflictsForQPL();
      }
    })
    this.toggleLargeInventory('', '', 0, '');
    this.setState({ loading: false })
  }

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
      conflictsCount: this.state.conflictsCount - 1
    }, () => {
      if (this.state.conflictsCount == 0) {
        this.generateDataAfterResolveConflictsForQPL();
      }
    })
    this.toggleLargeInventory('', '', 0, '');
    this.setState({ loading: false })
  }

  // Shipment functions
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
        { type: 'dropdown', title: i18n.t("static.supplyPlan.shipmentMode"), source: [{ id: 1, name: i18n.t('static.supplyPlan.sea') }, { id: 2, name: i18n.t('static.supplyPlan.air') }], width: 100 },
        { type: 'numeric', title: i18n.t("static.shipment.suggestedQty"), width: 100, mask: '#,##' },
        { type: 'numeric', title: i18n.t("static.supplyPlan.adjustesOrderQty"), width: 100, mask: '#,##' },
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
      text: {
        showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
        show: '',
        entries: '',
      },
      pagination: false,
      search: false,
      columnSorting: false,
      tableOverflow: false,
      wordWrap: true,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      tableOverflow: false,
      editable: false,
      filters: false,
      license: JEXCEL_PRO_KEY,
      contextMenu: function (obj, x, y, e) {
        return [];
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

  // Problem functions
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
      text: {
        showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
        show: '',
        entries: '',
      },
      pagination: false,
      search: false,
      columnSorting: false,
      tableOverflow: false,
      wordWrap: true,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      tableOverflow: false,
      editable: false,
      filters: false,
      license: JEXCEL_PRO_KEY,
      contextMenu: function (obj, x, y, e) {
        return [];
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

  loadedResolveConflictsShipment = function (instance) {
    jExcelLoadedFunctionOnlyHideRow(instance);
    var elInstance = instance.jexcel;
    var jsonData = elInstance.getJson();
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF']
    for (var j = 1; j < 28; j++) {
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

    var col = (colArr[29]).concat(1);
    var col1 = (colArr[29]).concat(2);
    var valueToCompare = (jsonData[0])[28];
    var valueToCompareWith = (jsonData[1])[28];
    if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
      elInstance.setStyle(col, "background-color", "transparent");
      elInstance.setStyle(col1, "background-color", "transparent");
    } else {
      elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
      elInstance.setStyle(col1, "background-color", LATEST_VERSION_COLOUR);
    }
  }

  acceptCurrentChangesShipment() {
    this.setState({ loading: true })
    var resolveConflictsInstance = this.state.resolveConflictShipment;
    var shipmentInstance = this.state.mergedShipmentJexcel;
    var index = document.getElementById("indexShipment").value;
    shipmentInstance.options.editable = true;
    shipmentInstance.setRowData(index, resolveConflictsInstance.getRowData(0));
    var jsonData = resolveConflictsInstance.getJson();
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF']
    for (var j = 0; j < 28; j++) {
      var col = (colArr[j]).concat(parseInt(index) + 1);
      var valueToCompare = (jsonData[0])[j];
      var valueToCompareWith = (jsonData[1])[j];
      if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
        shipmentInstance.setStyle(col, "background-color", "transparent");
      } else {
        shipmentInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
        shipmentInstance.setValueFromCoords(33, index, 2, true);
      }
    }

    var col = (colArr[29]).concat(parseInt(index) + 1);
    var valueToCompare = (jsonData[0])[28];
    var valueToCompareWith = (jsonData[1])[28];
    if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
      shipmentInstance.setStyle(col, "background-color", "transparent");
    } else {
      shipmentInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
      shipmentInstance.setValueFromCoords(33, index, 2, true);
    }
    shipmentInstance.orderBy(33, 0);
    shipmentInstance.options.editable = false;
    this.setState({
      conflictsCount: this.state.conflictsCount - 1
    }, () => {
      if (this.state.conflictsCount == 0) {
        this.generateDataAfterResolveConflictsForQPL();
      }
    })
    this.toggleLargeShipment('', '', 0, '');
    this.setState({ loading: false })
  }

  acceptIncomingChangesShipment() {
    this.setState({ loading: true })
    var resolveConflictsInstance = this.state.resolveConflictShipment;
    var shipmentInstance = this.state.mergedShipmentJexcel;
    var index = document.getElementById("indexShipment").value;
    shipmentInstance.options.editable = true;
    shipmentInstance.setRowData(index, resolveConflictsInstance.getRowData(1));
    var jsonData = resolveConflictsInstance.getJson();
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF']
    for (var j = 0; j < 28; j++) {
      var col = (colArr[j]).concat(parseInt(index) + 1);
      var valueToCompare = (jsonData[0])[j];
      var valueToCompareWith = (jsonData[1])[j];
      if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
        shipmentInstance.setStyle(col, "background-color", "transparent");
      } else {
        shipmentInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
        shipmentInstance.setValueFromCoords(33, (index), 3, true);
      }
    }

    var col = (colArr[29]).concat(parseInt(index) + 1);
    var valueToCompare = (jsonData[0])[28];
    var valueToCompareWith = (jsonData[1])[28];
    if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
      shipmentInstance.setStyle(col, "background-color", "transparent");
    } else {
      shipmentInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
      shipmentInstance.setValueFromCoords(33, (index), 3, true);
    }
    shipmentInstance.orderBy(33, 0);
    shipmentInstance.options.editable = false;
    this.setState({
      conflictsCount: this.state.conflictsCount - 1
    }, () => {
      if (this.state.conflictsCount == 0) {
        this.generateDataAfterResolveConflictsForQPL();
      }
    })
    this.toggleLargeShipment('', '', 0, '');
    this.setState({ loading: false })
  }


  loadedResolveConflictsProblem = function (instance) {
    jExcelLoadedFunctionOnlyHideRow(instance);
    var elInstance = instance.jexcel;
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
  }

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
      openCount: openCount
    }, () => {
      if (this.state.conflictsCount == 0) {
        // this.generateDataAfterResolveConflictsForQPL();
      }
    })
    this.toggleLargeProblem('', '', 0, '');
    this.setState({ loading: false })
  }

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
      openCount: openCount
    }, () => {
      if (this.state.conflictsCount == 0) {
        // this.generateDataAfterResolveConflictsForQPL();
      }
    })
    this.toggleLargeProblem('', '', 0, '');
    this.setState({ loading: false })
  }

  generateDataAfterResolveConflictsForQPL() {
    console.log("+++in generate QPL ", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"))
    this.setState({ loading: true });
    var db1;
    var storeOS;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
      this.setState({
        supplyPlanError: i18n.t('static.program.errortext')
      })
    }.bind(this);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      // var programDataTransaction = db1.transaction(['programData'], 'readwrite');
      // var programDataOs = programDataTransaction.objectStore('programData');
      // var programRequest = programDataOs.get((this.state.programId).value);
      // programRequest.onerror = function (event) {
      //   this.setState({
      //     supplyPlanError: i18n.t('static.program.errortext')
      //   })
      // }.bind(this);
      // programRequest.onsuccess = function (e) {
      //   var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
      //   var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
      var programJson = this.state.programRequestProgramJson;
      var actionList = programJson.actionList;
      if (actionList == undefined) {
        actionList = []
      }
      var planningUnitList = [];
      var consumptionData = (this.state.oldProgramDataConsumption).filter(c => c.consumptionId != 0);
      var consumptionJson = (this.state.mergedConsumptionJexcel).getJson();
      var oldProgramDataConsumption = this.state.oldProgramDataConsumption;
      var latestProgramDataConsumption = this.state.latestProgramDataConsumption;
      for (var c = 0; c < consumptionJson.length; c++) {
        if (((consumptionJson[c])[18] == 2 || (consumptionJson[c])[18] == 4) && (consumptionJson[c])[0] != 0) {
          // consumptionData.push(oldProgramDataConsumption.filter(a => a.consumptionId == (consumptionJson[c])[0])[0]);
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
      console.log("uniquePlanningUnitsInConsumption+++", uniquePlanningUnitsInConsumption);

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
          // inventoryData.push(oldProgramDataInventory.filter(a => a.inventoryId == (inventoryJson[c])[0])[0]);
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
        if (((shipmentJson[c])[33] == 2 || (shipmentJson[c])[33] == 4) && (shipmentJson[c])[0] != 0) {
          // shipmentData.push(oldProgramDataShipment.filter(a => a.shipmentId == (shipmentJson[c])[0])[0]);
        } else if ((shipmentJson[c])[33] == 3 && (shipmentJson[c])[0] != 0) {
          var index = shipmentData.findIndex(p => p.shipmentId == (shipmentJson[c])[0]);
          if (index == -1) {
            shipmentData.push(latestProgramDataShipment.filter(a => a.shipmentId == (shipmentJson[c])[0])[0]);
          } else {
            shipmentData[index] = latestProgramDataShipment.filter(a => a.shipmentId == (shipmentJson[c])[0])[0];
          }
        }
      }
      shipmentData = shipmentData.concat(oldProgramDataShipment.filter(c => c.shipmentId == 0 && c.active.toString() == "true"));

      var uniquePlanningUnitsInShipment = [];
      shipmentJson.map(c => uniquePlanningUnitsInShipment = uniquePlanningUnitsInShipment.concat(parseInt(c[1])));
      console.log("uniquePlanningUnitsInConsumption+++", uniquePlanningUnitsInConsumption);

      uniquePlanningUnitsInShipment.map(c => {
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

      var planningUnitDataListFromState = this.state.planningUnitDataList;
      var updatedJson = [];
      var consumptionList = programJson.consumptionList;
      var inventoryList = programJson.inventoryList;
      var shipmentList = programJson.shipmentList;
      var batchInfoList = programJson.batchInfoList;
      var problemReportList = programJson.problemReportList;
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
        console.log("+++Ready data for QPL ", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"))
        this.refs.problemListChild.qatProblemActions((this.state.programId).value, "loading", false);
      }.bind(this);
    }.bind(this);
    // }.bind(this);
  }

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
            // var programDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
            // var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
            // var programJson1 = JSON.parse(programData);
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
          var itemLabelA = a.label.toUpperCase(); // ignore upper and lowercase
          var itemLabelB = b.label.toUpperCase(); // ignore upper and lowercase                   
          return itemLabelA > itemLabelB ? 1 : -1;
        });

        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getVersionTypeList().then(response => {
          if (proList.length > 0) {
            if (proList.length == 1) {
              this.setState({
                versionTypeList: response.data,
                programList: proList,
                // loading: false,
                programId: proList[0].value
              }, () => {
                // this.getDataForCompare(proList[0]);
                this.checkLastModifiedDateForProgram(proList[0]);
              })
            } else if (localStorage.getItem("sesProgramId") != '' && localStorage.getItem("sesProgramId") != undefined) {
              var programFilter=proList.filter(c => c.value == localStorage.getItem("sesProgramId"));
              if(programFilter.length>0){
              this.setState({
                versionTypeList: response.data,
                programList: proList,
                // loading: false,
                programId: localStorage.getItem("sesProgramId")
              }, () => {
                // this.getDataForCompare(proList.filter(c => c.value == localStorage.getItem("sesProgramId"))[0]);
                this.checkLastModifiedDateForProgram(proList.filter(c => c.value == localStorage.getItem("sesProgramId"))[0]);
              })
            }
            } else {
              this.setState({
                versionTypeList: response.data,
                programList: proList,
                loading: false
              })
            }
          }
        })
          .catch(
            error => {
              console.log("@@@Error1", error);
              console.log("@@@Error1", error.message);
              console.log("@@@Error1", error.response ? error.response.status : "")
              if (error.message === "Network Error") {
                console.log("+++in catch 1")
                this.setState({
                  message: 'static.common.networkError',
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
                    console.log("+++in catch 2")
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

  checkLastModifiedDateForProgram(value) {
    console.log("+++Started with commit version", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"))
    document.getElementById("detailsDiv").style.display = "block";
    this.setState({
      programId: value,
      loading: true,
      mergedConsumptionJexcel: "",
      mergedInventoryJexcel: "",
      mergedShipmentJexcel: "",
      mergedProblemListJexcel: ""
    })
    if (this.state.mergedConsumptionJexcel != "" && this.state.mergedConsumptionJexcel != undefined) {
      this.state.mergedConsumptionJexcel.destroy();
    }
    if (this.state.mergedInventoryJexcel != "" && this.state.mergedInventoryJexcel != undefined) {
      this.state.mergedInventoryJexcel.destroy();
    }
    if (this.state.mergedShipmentJexcel != "" && this.state.mergedShipmentJexcel != undefined) {
      this.state.mergedShipmentJexcel.destroy();
    }
    if (this.state.mergedProblemListJexcel != "" && this.state.mergedProblemListJexcel != undefined) {
      this.state.mergedProblemListJexcel.destroy();
    }

    var programId = value != "" && value != undefined ? value.value : 0;
    console.log("@@@ProgramId", programId);
    console.log("@@@this.state.programList", this.state.programList);
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
              if (moment(lastModifiedDate).format("YYYY-MM-DD HH:mm:ss") > moment(lastSyncDate).format("YYYY-MM-DD HH:mm:ss")) {
                alert(i18n.t('static.commitVersion.outdatedsync'));
                this.props.history.push(`/masterDataSync`)
              } else {
                this.getDataForCompare(value);
              }
            }.bind(this)
          }.bind(this)
        }
      }).catch(error => {
        console.log("@@@Error1", error);
        console.log("@@@Error1", error.message);
        console.log("@@@Error1", error.response ? error.response.status : "")
        if (error.message === "Network Error") {
          console.log("+++in catch 1")
          this.setState({
            message: 'static.common.networkError',
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
              console.log("+++in catch 2")
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
                console.log("+++Response for latest version success", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"))

                AuthenticationService.setupAxiosInterceptors();
                // var programRequestJson1 = { programId: (programId.split("_"))[0], versionId: programVersion }
                // ProgramService.getProgramData(programRequestJson1)
                //   .then(response1 => {
                //     if (response1.status == 200) {
                console.log("+++Response for downloaded version", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"))

                var db1;
                var storeOS;
                var realmCountryPlanningUnitList = []
                var dataSourceList = []
                var planningUnitList = []
                var shipmentStatusList = []
                var procurementAgentList = []
                var fundingSourceList = []
                var budgetList = []
                var currencyList = []
                var currencyListAll = []
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
                    console.log("+++Response of local version", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"))
                    // var dProgramDataTransaction = db1.transaction(['downloadedProgramData'], 'readwrite');
                    // var dProgramDataOs = dProgramDataTransaction.objectStore('downloadedProgramData');
                    // var dProgramRequest = dProgramDataOs.get(value != "" && value != undefined ? value.value : 0);
                    // dProgramRequest.onerror = function (event) {
                    //   this.setState({
                    //     commitVersionError: i18n.t('static.program.errortext'),
                    //     loading: false
                    //   })
                    //   this.hideSecondComponent()
                    // }.bind(this);
                    // dProgramRequest.onsuccess = function (e) {
                    //   var dProgramDataBytes = CryptoJS.AES.decrypt(dProgramRequest.result.programData, SECRET_KEY);
                    //   var dProgramData = dProgramDataBytes.toString(CryptoJS.enc.Utf8);
                    //   var dProgramJson = JSON.parse(dProgramData);
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
                                    var oldProgramData = programJson;
                                    var downloadedProgramData = response.data.length > 1 ? response.data[1] : response.data[0];
                                    var regionList = [];
                                    for (var i = 0; i < latestProgramData.regionList.length; i++) {
                                      var regionJson = {
                                        // name: // programJson.regionList[i].regionId,
                                        name: getLabelText(latestProgramData.regionList[i].label, this.state.lang),
                                        id: latestProgramData.regionList[i].regionId
                                      }
                                      regionList.push(regionJson);

                                    }
                                    console.log("+++Completion of basic flow", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"))
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
                                        // If 0 check whether that exists in latest version or not
                                        var index = latestProgramDataConsumption.findIndex(f =>
                                          f.planningUnit.id == oldModifiedConsumptionData[c].planningUnit.id &&
                                          moment(f.consumptionDate).format("YYYY-MM") == moment(oldModifiedConsumptionData[c].consumptionDate).format("YYYY-MM") &&
                                          f.region.id == oldModifiedConsumptionData[c].region.id &&
                                          f.actualFlag.toString() == oldModifiedConsumptionData[c].actualFlag.toString() &&
                                          f.realmCountryPlanningUnit.id == oldModifiedConsumptionData[c].realmCountryPlanningUnit.id &&
                                          !existingConsumptionId.includes(f.consumptionId)
                                        );
                                        if (index == -1) { // Does not exists
                                          mergedConsumptionData.push(oldModifiedConsumptionData[c]);
                                        } else { // Exists
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
                                    // Getting other entries of latest consumption data
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
                                      data[2] = moment(mergedConsumptionData[cd].consumptionDate).format(DATE_FORMAT_CAP_WITHOUT_DATE); //A
                                      data[3] = mergedConsumptionData[cd].region.id; //B                        
                                      data[4] = mergedConsumptionData[cd].dataSource.id; //C
                                      data[5] = mergedConsumptionData[cd].realmCountryPlanningUnit.id; //D
                                      data[6] = Math.round(mergedConsumptionData[cd].consumptionRcpuQty); //E
                                      data[7] = mergedConsumptionData[cd].multiplier; //F
                                      data[8] = Math.round(Math.round(mergedConsumptionData[cd].consumptionRcpuQty) * mergedConsumptionData[cd].multiplier); //I
                                      data[9] = mergedConsumptionData[cd].dayOfStockOut;
                                      if (mergedConsumptionData[cd].notes === null || ((mergedConsumptionData[cd].notes).trim() == "NULL")) {
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
                                      data[15] = oldData;//Old data
                                      var latestDataList = latestProgramDataConsumption.filter(c => c.consumptionId == mergedConsumptionData[cd].consumptionId);
                                      var latestData = ""
                                      if (latestDataList.length > 0) {
                                        latestData = [latestDataList[0].consumptionId, latestDataList[0].planningUnit.id, moment(latestDataList[0].consumptionDate).format(DATE_FORMAT_CAP_WITHOUT_DATE), latestDataList[0].region.id, latestDataList[0].dataSource.id, latestDataList[0].realmCountryPlanningUnit.id, Math.round(latestDataList[0].consumptionRcpuQty), latestDataList[0].multiplier, Math.round(Math.round(latestDataList[0].consumptionRcpuQty) * latestDataList[0].multiplier), latestDataList[0].dayOfStockOut, latestDataList[0].notes, (latestDataList[0].actualFlag.toString() == "true" ? 1 : 0), latestDataList[0].active, JSON.stringify(latestDataList[0].batchInfoList != "" ? ((latestDataList[0].batchInfoList).map(function (a) { return { "batchNo": a.batch.batchNo, "qty": parseInt(a.consumptionQty) } })).sort(function (a, b) { return a.qty - b.qty; }) : ""), "", "", "", "", 4];
                                      }
                                      data[16] = latestData;//Latest data
                                      var downloadedDataList = downloadedProgramDataConsumption.filter(c => c.consumptionId == mergedConsumptionData[cd].consumptionId);
                                      var downloadedData = "";
                                      if (downloadedDataList.length > 0) {
                                        downloadedData = [downloadedDataList[0].consumptionId, downloadedDataList[0].planningUnit.id, moment(downloadedDataList[0].consumptionDate).format(DATE_FORMAT_CAP_WITHOUT_DATE), downloadedDataList[0].region.id, downloadedDataList[0].dataSource.id, downloadedDataList[0].realmCountryPlanningUnit.id, Math.round(downloadedDataList[0].consumptionRcpuQty), downloadedDataList[0].multiplier, Math.round(Math.round(downloadedDataList[0].consumptionRcpuQty) * downloadedDataList[0].multiplier), downloadedDataList[0].dayOfStockOut, downloadedDataList[0].notes, (downloadedDataList[0].actualFlag.toString() == "true" ? 1 : 0), downloadedDataList[0].active, JSON.stringify(downloadedDataList[0].batchInfoList != "" ? ((downloadedDataList[0].batchInfoList).map(function (a) { return { "batchNo": a.batch.batchNo, "qty": parseInt(a.consumptionQty) } })).sort(function (a, b) { return a.qty - b.qty; }) : ""), "", "", "", "", 4];
                                      }
                                      data[17] = downloadedData;//Downloaded data
                                      data[18] = 4;
                                      mergedConsumptionJexcel.push(data);
                                    }

                                    var options = {
                                      data: mergedConsumptionJexcel,
                                      columnDrag: true,
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
                                      tableOverflow: true,
                                      wordWrap: true,
                                      allowInsertColumn: false,
                                      allowManualInsertColumn: false,
                                      allowDeleteRow: false,
                                      editable: false,
                                      onload: this.loadedFunctionForMerge,
                                      text: {
                                        showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                                        show: '',
                                        entries: '',
                                      },
                                      filters: true,
                                      license: JEXCEL_PRO_KEY,
                                      contextMenu: function (obj, x, y, e) {
                                        var items = [];
                                        //Resolve conflicts
                                        var rowData = obj.getRowData(y)
                                        if (rowData[18].toString() == 1) {
                                          items.push({
                                            title: "Resolve conflicts",
                                            onclick: function () {
                                              this.setState({ loading: true })
                                              this.toggleLarge(rowData[15], rowData[16], y, 'consumption');
                                            }.bind(this)
                                          })
                                        }

                                        // if (rowData[0].toString() > 0) {
                                        //   items.push({
                                        //     title: "Show version history",
                                        //     onclick: function () {
                                        //       this.toggleVersionHistory(rowData[13]);
                                        //     }.bind(this)
                                        //   })
                                        // }
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
                                    console.log("+++Consumption jexcel completed", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"))

                                    // Inventory part
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
                                        // If 0 check whether that exists in latest version or not
                                        var index = 0;
                                        if (oldModifiedInventoryData[c].actualQty != null && oldModifiedInventoryData[c].actualQty != "" && oldModifiedInventoryData[c].actualQty != undefined) {
                                          index = latestProgramDataInventory.findIndex(f =>
                                            f.planningUnit.id == oldModifiedInventoryData[c].planningUnit.id &&
                                            moment(f.inventoryDate).format("YYYY-MM") == moment(oldModifiedInventoryData[c].inventoryDate).format("YYYY-MM") &&
                                            f.region != null && f.region.id != 0 && oldModifiedInventoryData[c].region != null && oldModifiedInventoryData[c].region.id != 0 && f.region.id == oldModifiedInventoryData[c].region.id &&
                                            (f.actualQty != null && f.actualQty.toString() != "" && f.actualQty != undefined) == (oldModifiedInventoryData[c].actualQty != null && oldModifiedInventoryData[c].actualQty != "" && oldModifiedInventoryData[c].actualQty != undefined) &&
                                            f.realmCountryPlanningUnit.id == oldModifiedInventoryData[c].realmCountryPlanningUnit.id &&
                                            !existingInventoryId.includes(f.inventoryId)
                                          );
                                        } else {
                                          index = -1;
                                        }
                                        if (index == -1) { // Does not exists
                                          mergedInventoryData.push(oldModifiedInventoryData[c]);
                                        } else { // Exists
                                          oldModifiedInventoryData[c].inventoryId = latestProgramDataInventory[index].inventoryId;
                                          var index1 = oldProgramDataInventory.findIndex(f =>
                                            f.planningUnit.id == oldModifiedInventoryData[c].planningUnit.id &&
                                            moment(f.inventoryDate).format("YYYY-MM") == moment(oldModifiedInventoryData[c].inventoryDate).format("YYYY-MM") &&
                                            f.region != null && f.region.id != 0 && oldModifiedInventoryData[c].region != null && oldModifiedInventoryData[c].region.id != 0 && f.region.id == oldModifiedInventoryData[c].region.id &&
                                            (f.actualQty != null && f.actualQty.toString() != "" && f.actualQty != undefined) == (oldModifiedInventoryData[c].actualQty != null && oldModifiedInventoryData[c].actualQty != "" && oldModifiedInventoryData[c].actualQty != undefined) &&
                                            f.realmCountryPlanningUnit.id == oldModifiedInventoryData[c].realmCountryPlanningUnit.id &&
                                            !existingInventoryId.includes(f.inventoryId)
                                          );
                                          oldProgramDataInventory[index1].inventoryId = latestProgramDataInventory[index].inventoryId;
                                          oldProgramDataInventory[index1].versionId = latestProgramDataInventory[index].versionId;
                                          existingInventoryId.push(latestProgramDataInventory[index].inventoryId);
                                          mergedInventoryData.push(oldModifiedInventoryData[c]);
                                        }

                                      }
                                    }
                                    // Getting other entries of latest inventory data
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
                                        data[16] = oldData;//Old data
                                        var latestDataList = latestProgramDataInventory.filter(c => c.inventoryId == mergedInventoryData[cd].inventoryId && c.region != null && c.region.id != 0);
                                        var latestData = ""
                                        if (latestDataList.length > 0) {
                                          latestData = [latestDataList[0].inventoryId, latestDataList[0].planningUnit.id, moment(latestDataList[0].inventoryDate).format(DATE_FORMAT_CAP_WITHOUT_DATE), latestDataList[0].region.id, latestDataList[0].dataSource.id, latestDataList[0].realmCountryPlanningUnit.id, latestDataList[0].adjustmentQty != "" && latestDataList[0].adjustmentQty != null && latestDataList[0].adjustmentQty != undefined ? 2 : 1, Math.round(latestDataList[0].adjustmentQty), Math.round(latestDataList[0].actualQty), latestDataList[0].multiplier, Math.round(Math.round(latestDataList[0].adjustmentQty) * latestDataList[0].multiplier), Math.round(Math.round(latestDataList[0].actualQty) * latestDataList[0].multiplier), latestDataList[0].notes, latestDataList[0].active, JSON.stringify(latestDataList[0].batchInfoList != "" ? ((latestDataList[0].batchInfoList).map(function (a) { return { "batchNo": a.batch.batchNo, "qty1": parseInt(a.adjustmentQty), "qty2": parseInt(a.actualQty) } })).sort(function (a, b) { return a.qty1 - b.qty1; }) : ""), "", "", "", "", 4];
                                        }
                                        data[17] = latestData;//Latest data
                                        var downloadedDataList = downloadedProgramDataInventory.filter(c => c.inventoryId == mergedInventoryData[cd].inventoryId && c.region != null && c.region.id != 0);
                                        var downloadedData = "";
                                        if (downloadedDataList.length > 0) {
                                          downloadedData = [downloadedDataList[0].inventoryId, downloadedDataList[0].planningUnit.id, moment(downloadedDataList[0].inventoryDate).format(DATE_FORMAT_CAP_WITHOUT_DATE), downloadedDataList[0].region.id, downloadedDataList[0].dataSource.id, downloadedDataList[0].realmCountryPlanningUnit.id, downloadedDataList[0].adjustmentQty != "" && downloadedDataList[0].adjustmentQty != null && downloadedDataList[0].adjustmentQty != undefined ? 2 : 1, Math.round(downloadedDataList[0].adjustmentQty), Math.round(downloadedDataList[0].actualQty), downloadedDataList[0].multiplier, Math.round(Math.round(downloadedDataList[0].adjustmentQty) * downloadedDataList[0].multiplier), Math.round(Math.round(downloadedDataList[0].actualQty) * downloadedDataList[0].multiplier), downloadedDataList[0].notes, downloadedDataList[0].active, JSON.stringify(downloadedDataList[0].batchInfoList != "" ? ((downloadedDataList[0].batchInfoList).map(function (a) { return { "batchNo": a.batch.batchNo, "qty1": parseInt(a.adjustmentQty), "qty2": parseInt(a.actualQty) } })).sort(function (a, b) { return a.qty1 - b.qty1; }) : ""), "", "", "", "", 4];
                                        }
                                        data[18] = downloadedData;//Downloaded data
                                        data[19] = 4;
                                        mergedInventoryJexcel.push(data);
                                      }
                                    }

                                    var options = {
                                      data: mergedInventoryJexcel,
                                      columnDrag: true,
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
                                      tableOverflow: true,
                                      wordWrap: true,
                                      allowInsertColumn: false,
                                      allowManualInsertColumn: false,
                                      allowDeleteRow: false,
                                      editable: false,
                                      onload: this.loadedFunctionForMergeInventory,
                                      text: {
                                        showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                                        show: '',
                                        entries: '',
                                      },
                                      filters: true,
                                      license: JEXCEL_PRO_KEY,
                                      contextMenu: function (obj, x, y, e) {
                                        var items = [];
                                        //Resolve conflicts
                                        var rowData = obj.getRowData(y)
                                        if (rowData[19].toString() == 1) {
                                          items.push({
                                            title: "Resolve conflicts",
                                            onclick: function () {
                                              this.setState({ loading: true })
                                              this.toggleLargeInventory(rowData[16], rowData[17], y, 'inventory');
                                            }.bind(this)
                                          })
                                        }

                                        // if (rowData[0].toString() > 0) {
                                        //   items.push({
                                        //     title: "Show version history",
                                        //     onclick: function () {
                                        //       this.toggleVersionHistory(rowData[13]);
                                        //     }.bind(this)
                                        //   })
                                        // }
                                        return items;
                                      }.bind(this)
                                    };

                                    var mergedInventoryJexcel = jexcel(document.getElementById("mergedVersionInventory"), options);
                                    this.el = mergedInventoryJexcel;
                                    this.setState({
                                      mergedInventoryJexcel: mergedInventoryJexcel
                                    })
                                    console.log("+++Inventory jexcel completed", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"))

                                    // Batch info
                                    var latestProgramDataBatchInfo = latestProgramData.batchInfoList;
                                    var oldProgramDataBatchInfo = oldProgramData.batchInfoList;

                                    // Shipment part
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
                                        // If 0 check whether that exists in latest version or not
                                        if (oldModifiedShipmentData[c].active.toString() == "true") {
                                          mergedShipmentData.push(oldModifiedShipmentData[c]);
                                        }
                                      }
                                    }
                                    // Getting other entries of latest shipment data
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
                                      data[9] = mergedShipmentData[cd].shipmentMode == "Air" ? 2 : 1;
                                      data[10] = mergedShipmentData[cd].suggestedQty;
                                      data[11] = mergedShipmentData[cd].shipmentQty;
                                      data[12] = mergedShipmentData[cd].currency.currencyId;
                                      data[13] = parseFloat(mergedShipmentData[cd].rate).toFixed(2);
                                      data[14] = parseFloat(mergedShipmentData[cd].rate).toFixed(2) * mergedShipmentData[cd].shipmentQty;
                                      data[15] = parseFloat(mergedShipmentData[cd].freightCost).toFixed(2);
                                      data[16] = mergedShipmentData[cd].plannedDate != "" && mergedShipmentData[cd].plannedDate != null ? moment(mergedShipmentData[cd].plannedDate).format(DATE_FORMAT_CAP) : "";
                                      data[17] = mergedShipmentData[cd].submittedDate != "" && mergedShipmentData[cd].submittedDate != null ? moment(mergedShipmentData[cd].submittedDate).format(DATE_FORMAT_CAP) : "";
                                      data[18] = mergedShipmentData[cd].approvedDate != "" && mergedShipmentData[cd].approvedDate != null ? moment(mergedShipmentData[cd].approvedDate).format(DATE_FORMAT_CAP) : "";
                                      data[19] = mergedShipmentData[cd].shippedDate != "" && mergedShipmentData[cd].shippedDate != null ? moment(mergedShipmentData[cd].shippedDate).format(DATE_FORMAT_CAP) : "";
                                      data[20] = mergedShipmentData[cd].arrivedDate != "" && mergedShipmentData[cd].arrivedDate != null ? moment(mergedShipmentData[cd].arrivedDate).format(DATE_FORMAT_CAP) : "";
                                      data[21] = mergedShipmentData[cd].receivedDate != "" && mergedShipmentData[cd].receivedDate != null ? moment(mergedShipmentData[cd].receivedDate).format(DATE_FORMAT_CAP) : "";
                                      data[22] = mergedShipmentData[cd].notes;
                                      data[23] = mergedShipmentData[cd].erpFlag;
                                      data[24] = mergedShipmentData[cd].emergencyOrder;
                                      data[25] = mergedShipmentData[cd].accountFlag;
                                      data[26] = mergedShipmentData[cd].active;
                                      data[27] = mergedShipmentData[cd].localProcurement;
                                      data[28] = JSON.stringify(mergedShipmentData[cd].batchInfoList != "" ? ((mergedShipmentData[cd].batchInfoList).map(function (a) { return { "batchNo": a.batch.batchNo, "qty": parseInt(a.shipmentQty) } })).sort(function (a, b) { return a.qty - b.qty; }) : "");
                                      data[29] = "";
                                      var oldDataList = oldProgramDataShipment.filter(c => c.shipmentId == mergedShipmentData[cd].shipmentId);
                                      var oldData = ""
                                      if (oldDataList.length > 0) {
                                        oldData = [oldDataList[0].shipmentId, oldDataList[0].planningUnit.id, oldDataList[0].shipmentStatus.id, moment(oldDataList[0].expectedDeliveryDate).format(DATE_FORMAT_CAP), oldDataList[0].procurementAgent.id, oldDataList[0].fundingSource.id, oldDataList[0].budget.id, oldDataList[0].orderNo != "" && oldDataList[0].orderNo != null ? oldDataList[0].orderNo.toString().concat(oldDataList[0].primeLineNo != null ? "~" : "").concat(oldDataList[0].primeLineNo != null ? oldDataList[0].primeLineNo : "") : "", oldDataList[0].dataSource.id, oldDataList[0].shipmentMode == "Air" ? 2 : 1, oldDataList[0].suggestedQty, oldDataList[0].shipmentQty, oldDataList[0].currency.currencyId, parseFloat(oldDataList[0].rate).toFixed(2), parseFloat(oldDataList[0].rate).toFixed(2) * oldDataList[0].shipmentQty, parseFloat(oldDataList[0].freightCost).toFixed(2), oldDataList[0].plannedDate != "" && oldDataList[0].plannedDate != null ? moment(oldDataList[0].plannedDate).format(DATE_FORMAT_CAP) : "", oldDataList[0].submittedDate != "" && oldDataList[0].submittedDate != null ? moment(oldDataList[0].submittedDate).format(DATE_FORMAT_CAP) : "", oldDataList[0].approvedDate != "" && oldDataList[0].approvedDate != null ? moment(oldDataList[0].approvedDate).format(DATE_FORMAT_CAP) : "", oldDataList[0].shippedDate != "" && oldDataList[0].shippedDate != null ? moment(oldDataList[0].shippedDate).format(DATE_FORMAT_CAP) : "", oldDataList[0].arrivedDate != "" && oldDataList[0].arrivedDate != null ? moment(oldDataList[0].arrivedDate).format(DATE_FORMAT_CAP) : "", oldDataList[0].receivedDate != "" && oldDataList[0].receivedDate != null ? moment(oldDataList[0].receivedDate).format(DATE_FORMAT_CAP) : "", oldDataList[0].notes, oldDataList[0].erpFlag, oldDataList[0].emergencyOrder, oldDataList[0].accountFlag, oldDataList[0].active, oldDataList[0].localProcurement, JSON.stringify(oldDataList[0].batchInfoList != "" ? ((oldDataList[0].batchInfoList).map(function (a) { return { "batchNo": a.batch.batchNo, "qty": parseInt(a.shipmentQty) } })).sort(function (a, b) { return a.qty - b.qty; }) : ""), "", "", "", "", 4];
                                      }
                                      data[30] = oldData;//Old data
                                      var latestDataList = latestProgramDataShipment.filter(c => c.shipmentId == mergedShipmentData[cd].shipmentId);
                                      var latestData = ""
                                      if (latestDataList.length > 0) {
                                        latestData = [latestDataList[0].shipmentId, latestDataList[0].planningUnit.id, latestDataList[0].shipmentStatus.id, moment(latestDataList[0].expectedDeliveryDate).format(DATE_FORMAT_CAP), latestDataList[0].procurementAgent.id, latestDataList[0].fundingSource.id, latestDataList[0].budget.id, latestDataList[0].orderNo != "" && latestDataList[0].orderNo != null ? latestDataList[0].orderNo.toString().concat(latestDataList[0].primeLineNo != null ? "~" : "").concat(latestDataList[0].primeLineNo != null ? latestDataList[0].primeLineNo : "") : "", latestDataList[0].dataSource.id, latestDataList[0].shipmentMode == "Air" ? 2 : 1, latestDataList[0].suggestedQty, latestDataList[0].shipmentQty, latestDataList[0].currency.currencyId, parseFloat(latestDataList[0].rate).toFixed(2), parseFloat(latestDataList[0].rate).toFixed(2) * latestDataList[0].shipmentQty, parseFloat(latestDataList[0].freightCost).toFixed(2), latestDataList[0].plannedDate != "" && latestDataList[0].plannedDate != null ? moment(latestDataList[0].plannedDate).format(DATE_FORMAT_CAP) : "", latestDataList[0].submittedDate != "" && latestDataList[0].submittedDate != null ? moment(latestDataList[0].submittedDate).format(DATE_FORMAT_CAP) : "", latestDataList[0].approvedDate != "" && latestDataList[0].approvedDate != null ? moment(latestDataList[0].approvedDate).format(DATE_FORMAT_CAP) : "", latestDataList[0].shippedDate != "" && latestDataList[0].shippedDate != null ? moment(latestDataList[0].shippedDate).format(DATE_FORMAT_CAP) : "", latestDataList[0].arrivedDate != "" && latestDataList[0].arrivedDate != null ? moment(latestDataList[0].arrivedDate).format(DATE_FORMAT_CAP) : "", latestDataList[0].receivedDate != "" && latestDataList[0].receivedDate != null ? moment(latestDataList[0].receivedDate).format(DATE_FORMAT_CAP) : "", latestDataList[0].notes, latestDataList[0].erpFlag, latestDataList[0].emergencyOrder, latestDataList[0].accountFlag, latestDataList[0].active, latestDataList[0].localProcurement, JSON.stringify(latestDataList[0].batchInfoList != "" ? ((latestDataList[0].batchInfoList).map(function (a) { return { "batchNo": a.batch.batchNo, "qty": parseInt(a.shipmentQty) } })).sort(function (a, b) { return a.qty - b.qty; }) : ""), "", "", "", "", 4];
                                      }
                                      data[31] = latestData;//Latest data
                                      var downloadedDataList = downloadedProgramDataShipment.filter(c => c.shipmentId == mergedShipmentData[cd].shipmentId);
                                      var downloadedData = "";
                                      if (downloadedDataList.length > 0) {
                                        downloadedData = [downloadedDataList[0].shipmentId, downloadedDataList[0].planningUnit.id, downloadedDataList[0].shipmentStatus.id, moment(downloadedDataList[0].expectedDeliveryDate).format(DATE_FORMAT_CAP), downloadedDataList[0].procurementAgent.id, downloadedDataList[0].fundingSource.id, downloadedDataList[0].budget.id, downloadedDataList[0].orderNo != "" && downloadedDataList[0].orderNo != null ? downloadedDataList[0].orderNo.toString().concat(downloadedDataList[0].primeLineNo != null ? "~" : "").concat(downloadedDataList[0].primeLineNo != null ? downloadedDataList[0].primeLineNo : "") : "", downloadedDataList[0].dataSource.id, downloadedDataList[0].shipmentMode == "Air" ? 2 : 1, downloadedDataList[0].suggestedQty, downloadedDataList[0].shipmentQty, downloadedDataList[0].currency.currencyId, parseFloat(downloadedDataList[0].rate).toFixed(2), parseFloat(downloadedDataList[0].rate).toFixed(2) * downloadedDataList[0].shipmentQty, parseFloat(downloadedDataList[0].freightCost).toFixed(2), downloadedDataList[0].plannedDate != "" && downloadedDataList[0].plannedDate != null ? moment(downloadedDataList[0].plannedDate).format(DATE_FORMAT_CAP) : "", downloadedDataList[0].submittedDate != "" && downloadedDataList[0].submittedDate != null ? moment(downloadedDataList[0].submittedDate).format(DATE_FORMAT_CAP) : "", downloadedDataList[0].approvedDate != "" && downloadedDataList[0].approvedDate != null ? moment(downloadedDataList[0].approvedDate).format(DATE_FORMAT_CAP) : "", downloadedDataList[0].shippedDate != "" && downloadedDataList[0].shippedDate != null ? moment(downloadedDataList[0].shippedDate).format(DATE_FORMAT_CAP) : "", downloadedDataList[0].arrivedDate != "" && downloadedDataList[0].arrivedDate != null ? moment(downloadedDataList[0].arrivedDate).format(DATE_FORMAT_CAP) : "", downloadedDataList[0].receivedDate != "" && downloadedDataList[0].receivedDate != null ? moment(downloadedDataList[0].receivedDate).format(DATE_FORMAT_CAP) : "", downloadedDataList[0].notes, downloadedDataList[0].erpFlag, downloadedDataList[0].emergencyOrder, downloadedDataList[0].accountFlag, downloadedDataList[0].active, downloadedDataList[0].localProcurement, JSON.stringify(downloadedDataList[0].batchInfoList != "" ? ((downloadedDataList[0].batchInfoList).map(function (a) { return { "batchNo": a.batch.batchNo, "qty": parseInt(a.shipmentQty) } })).sort(function (a, b) { return a.qty - b.qty; }) : ""), "", "", "", "", 4];
                                      }
                                      data[32] = downloadedData;//Downloaded data
                                      data[33] = 4;
                                      mergedShipmentJexcel.push(data);
                                    }

                                    var options = {
                                      data: mergedShipmentJexcel,
                                      columnDrag: true,
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
                                        { type: 'dropdown', title: i18n.t("static.supplyPlan.shipmentMode"), source: [{ id: 1, name: i18n.t('static.supplyPlan.sea') }, { id: 2, name: i18n.t('static.supplyPlan.air') }], width: 100 },
                                        { type: 'numeric', title: i18n.t("static.shipment.suggestedQty"), width: 100, mask: '#,##' },
                                        { type: 'numeric', title: i18n.t("static.supplyPlan.adjustesOrderQty"), width: 100, mask: '#,##' },
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
                                      tableOverflow: true,
                                      wordWrap: true,
                                      allowInsertColumn: false,
                                      allowManualInsertColumn: false,
                                      allowDeleteRow: false,
                                      editable: false,
                                      onload: this.loadedFunctionForMergeShipment,
                                      filters: true,
                                      license: JEXCEL_PRO_KEY,
                                      text: {
                                        showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                                        show: '',
                                        entries: '',
                                      },
                                      contextMenu: function (obj, x, y, e) {
                                        var items = [];
                                        //Resolve conflicts
                                        var rowData = obj.getRowData(y)
                                        if (rowData[33].toString() == 1) {
                                          items.push({
                                            title: "Resolve conflicts",
                                            onclick: function () {
                                              this.setState({ loading: true })
                                              this.toggleLargeShipment(rowData[30], rowData[31], y, 'shipment');
                                            }.bind(this)
                                          })
                                        }

                                        // if (rowData[0].toString() > 0) {
                                        //   items.push({
                                        //     title: "Show version history",
                                        //     onclick: function () {
                                        //       this.toggleVersionHistory(rowData[13]);
                                        //     }.bind(this)
                                        //   })
                                        // }
                                        return items;
                                      }.bind(this)
                                    };

                                    var mergedShipmentJexcel = jexcel(document.getElementById("mergedVersionShipment"), options);
                                    this.el = mergedShipmentJexcel;
                                    this.setState({
                                      mergedShipmentJexcel: mergedShipmentJexcel,
                                    })
                                    console.log("+++Shipment Jexcel completed", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"))
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
                                      loading: false
                                    }, () => {
                                      // Problem list
                                      if (this.state.conflictsCount == 0) {
                                        this.generateDataAfterResolveConflictsForQPL();
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
                  }.bind(this)
                }.bind(this)
                // }.bind(this)
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
                console.log("@@@Error2", error);
                console.log("@@@Error2", error.message);
                console.log("@@@Error2", error.response ? error.response.status : "")
                if (error.message === "Network Error") {
                  console.log("+++in catch 3")
                  this.setState({
                    message: 'static.common.networkError',
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
                      console.log("+++in catch 4")
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
            console.log("@@@Error3", error);
            console.log("@@@Error3", error.message);
            console.log("@@@Error3", error.response ? error.response.status : "")
            if (error.message === "Network Error") {
              console.log("+++in catch 5")
              this.setState({
                message: 'static.common.networkError',
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
                  console.log("+++in catch 6")
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

  loadedFunctionForMerge = function (instance) {
    jExcelLoadedFunction(instance, 0);
    var elInstance = instance.jexcel;
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
            elInstance.setStyle(col, "background-color", "transparent");
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
                conflictsCount: this.state.conflictsCount + 1
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

        // Checking batch details
        if ((jsonData[c])[16] != "" && (jsonData[c])[15] != "" && (jsonData[c])[18] != 1) {
          if ((oldData[13] == latestData[13]) || (oldData[13] == "" && latestData[13] == null) || (oldData[13] == null && latestData[13] == "")) {
            var col = (colArr[14]).concat(parseInt(c) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
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
                conflictsCount: this.state.conflictsCount + 1
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


  loadedFunctionForMergeInventory = function (instance) {
    jExcelLoadedFunction(instance, 1);
    var elInstance = instance.jexcel;
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
                conflictsCount: this.state.conflictsCount + 1
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

        // Checking batch details
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
                conflictsCount: this.state.conflictsCount + 1
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

  loadedFunctionForMergeShipment = function (instance) {
    jExcelLoadedFunction(instance, 2);
    var elInstance = instance.jexcel;
    var jsonData = elInstance.getJson();
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF']
    elInstance.options.editable = true;
    for (var c = 0; c < jsonData.length; c++) {
      if ((jsonData[c])[31] == "") {
        for (var i = 0; i < colArr.length; i++) {
          var col = (colArr[i]).concat(parseInt(c) + 1);
          elInstance.setStyle(col, "background-color", "transparent");
          elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
          elInstance.setValueFromCoords(33, c, 2, true);
        }
        this.setState({
          isChanged: true
        })
      } else if ((jsonData[c])[30] == "") {
        for (var i = 0; i < colArr.length; i++) {
          var col = (colArr[i]).concat(parseInt(c) + 1);
          elInstance.setStyle(col, "background-color", "transparent");
          elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
          elInstance.setValueFromCoords(33, c, 3, true);
        }
        this.setState({
          isChanged: true
        })
      } else if ((jsonData[c])[30] != "" && (jsonData[c])[31] != "" && (jsonData[c])[33] != 1) {
        var oldData = (jsonData[c])[30];
        var latestData = (jsonData[c])[31];
        var downloadedData = (jsonData[c])[32];
        for (var j = 1; j < 28; j++) {
          if ((oldData[j] == latestData[j]) || (oldData[j] == "" && latestData[j] == null) || (oldData[j] == null && latestData[j] == "")) {
            var col = (colArr[j]).concat(parseInt(c) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
          } else {
            this.setState({
              isChanged: true
            })
            if ((jsonData[c])[32] != "" && oldData[j] == downloadedData[j]) {
              var col = (colArr[j]).concat(parseInt(c) + 1);
              elInstance.setValueFromCoords(j, c, latestData[j], true);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
              elInstance.setValueFromCoords(33, c, 3, true);
              (jsonData[c])[33] = 3;
            } else if ((jsonData[c])[32] != "" && latestData[j] == downloadedData[j]) {
              var col = (colArr[j]).concat(parseInt(c) + 1);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
              elInstance.setValueFromCoords(33, c, 2, true);
              (jsonData[c])[33] = 2;
            } else {
              this.setState({
                conflictsCount: this.state.conflictsCount + 1
              })
              elInstance.setValueFromCoords(33, c, 1, true);
              (jsonData[c])[33] = 1;
              for (var j = 0; j < colArr.length; j++) {
                var col = (colArr[j]).concat(parseInt(c) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
              }
            }
          }
        }

        // Checking batch details
        if ((jsonData[c])[30] != "" && (jsonData[c])[31] != "" && (jsonData[c])[33] != 1) {
          if ((oldData[28] == latestData[28]) || (oldData[28] == "" && latestData[28] == null) || (oldData[28] == null && latestData[28] == "")) {
            var col = (colArr[29]).concat(parseInt(c) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
          } else {
            this.setState({
              isChanged: true
            })
            if ((jsonData[c])[32] != "" && oldData[28] == downloadedData[28]) {
              var col = (colArr[29]).concat(parseInt(c) + 1);
              elInstance.setValueFromCoords(28, c, latestData[j], true);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
              elInstance.setValueFromCoords(33, c, 3, true);
            } else if ((jsonData[c])[32] != "" && latestData[28] == downloadedData[28]) {
              var col = (colArr[29]).concat(parseInt(c) + 1);
              elInstance.setStyle(col, "background-color", "transparent");
              elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
              elInstance.setValueFromCoords(33, c, 2, true);
            } else {
              this.setState({
                conflictsCount: this.state.conflictsCount + 1
              })
              elInstance.setValueFromCoords(33, c, 1, true);
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
    elInstance.orderBy(33, 0);
    elInstance.options.editable = false;
  }

  getNote(row, lang) {
    var transList = row.problemTransList.filter(c => c.reviewed == false);
    if (transList.length == 0) {
      console.log("this problem report id do not have trans+++", row.problemReportId);
      return ""
    } else {
      var listLength = transList.length;
      return transList[listLength - 1].notes;
    }
  }

  loadedFunctionForMergeProblemList = function (instance) {
    jExcelLoadedFunction(instance, 3);
    var elInstance = instance.jexcel;
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
        // for (var j = 11; j < 12; j++) {
        //   if ((oldData[j] == latestData[j]) || (oldData[j] == "" && latestData[j] == null) || (oldData[j] == null && latestData[j] == "")) {
        //     var col = (colArr[j]).concat(parseInt(c) + 1);
        //     elInstance.setStyle(col, "background-color", "transparent");
        //   } else {
        //     this.setState({
        //       isChanged: true
        //     })
        //     if ((jsonData[c])[19] != "" && oldData[j] == downloadedData[j]) {
        //       if((jsonData[c])[12]!=PROBLEM_STATUS_IN_COMPLIANCE){
        //       var col = (colArr[j]).concat(parseInt(c) + 1);
        //       elInstance.setValueFromCoords(j, c, latestData[j], true);
        //       elInstance.setStyle(col, "background-color", "transparent");
        //       elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
        //       elInstance.setValueFromCoords(20, c, 3, true);
        //       (jsonData[c])[20] = 3;
        //       }else{

        //       }
        //     } else if ((jsonData[c])[19] != "" && latestData[j] == downloadedData[j]) {
        //       var col = (colArr[j]).concat(parseInt(c) + 1);
        //       elInstance.setStyle(col, "background-color", "transparent");
        //       elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
        //       elInstance.setValueFromCoords(20, c, 2, true);
        //       (jsonData[c])[20] = 2;
        //     } else {
        //       this.setState({
        //         conflictsCount: this.state.conflictsCount + 1
        //       })
        //       elInstance.setValueFromCoords(20, c, 1, true);
        //       (jsonData[c])[20] = 1;
        //       for (var j = 0; j < colArr.length; j++) {
        //         var col = (colArr[j]).concat(parseInt(c) + 1);
        //         elInstance.setStyle(col, "background-color", "transparent");
        //         elInstance.setStyle(col, "background-color", "yellow");
        //       }
        //     }
        //   }
        // }

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
                conflictsCount: this.state.conflictsCount + 1
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
          console.log("RowData[11+++", rowData[11]);
          console.log("OldData[11+++", oldData[11]);
          console.log("LatestData[11]+++", latestData[11]);
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
  }

  tabPane() {
    return (
      <>
        <TabPane tabId="1">
          <Row>
            <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
              <Col md="12 pl-0" id="realmDiv">
                <div className="table-responsive RemoveStriped">
                  <div id="mergedVersionConsumption" />
                </div>
              </Col>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="2">
          <Row>
            <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
              <Col md="12 pl-0" id="realmDiv">
                <div className="table-responsive RemoveStriped">
                  <div id="mergedVersionInventory" />
                </div>
              </Col>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="3">
          <Row>
            <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
              <Col md="12 pl-0" id="realmDiv">
                <div className="table-responsive RemoveStriped">
                  <div id="mergedVersionShipment" />
                </div>
              </Col>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="4">
          <Row>
            <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
              <Col md="12 pl-0" id="realmDiv">
                <div className="table-responsive RemoveStriped">
                  <div id="mergedVersionProblemList" />
                </div>
              </Col>
            </Col>
          </Row>
        </TabPane>
      </>
    );
  }

  render = () => {
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
        {/* <QatProblemActions ref="problemListChild" updateState={this.updateState} fetchData={this.fetchData} objectStore="programData" /> */}
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
                          {/* <li><span className=" redlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.label.noFundsAvailable')} </span></li> */}
                        </ul>
                      </div>

                    </div>

                  </Col>
                </Form>
                <div id="detailsDiv">
                  <div className="animated fadeIn" style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                      initialValues={initialValues}
                      validate={validate(validationSchema)}
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
                                        // maxLength={600} 
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
                                  {/* {((this.state.isChanged.toString() == "true" && this.state.versionType == 1) || (this.state.versionType == 2 && (this.state.openCount == 0 || AuthenticationService.getLoggedInUserRoleIdArr().includes("ROLE_APPLICATION_ADMIN")))) && this.state.conflictsCount == 0 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} ><i className="fa fa-check"></i>{i18n.t('static.button.commit')} </Button>} */}
                                  {((this.state.isChanged.toString() == "true" && this.state.versionType == 1) || (this.state.versionType == 2 && (this.state.openCount == 0 || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes("ROLE_BF_READONLY_ACCESS_REALM_ADMIN")))) && this.state.conflictsCount == 0 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} ><i className="fa fa-check"></i>{i18n.t('static.button.commit')} </Button>}
                                  &nbsp;
                                </FormGroup>
                              </div>
                            </Col>
                          </Form>
                        )} />
                    <Row>
                      <Col xs="12" md="12" className="mb-4">
                        <Nav tabs>
                          <NavItem>
                            <NavLink
                              active={this.state.activeTab[0] === '1'}
                              onClick={() => { this.toggle(0, '1'); }}
                            >
                              {i18n.t('static.supplyPlan.consumption')}
                            </NavLink>
                          </NavItem>
                          <NavItem>
                            <NavLink
                              active={this.state.activeTab[0] === '2'}
                              onClick={() => { this.toggle(0, '2'); }}
                            >
                              {i18n.t('static.inventory.inventory')}
                            </NavLink>
                          </NavItem>

                          <NavItem>
                            <NavLink
                              active={this.state.activeTab[0] === '3'}
                              onClick={() => { this.toggle(0, '3'); }}
                            >
                              {i18n.t('static.shipment.shipment')}
                            </NavLink>
                          </NavItem>

                          <NavItem>
                            <NavLink
                              active={this.state.activeTab[0] === '4'}
                              onClick={() => { this.toggle(0, '4'); }}
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
                      <div class="align-items-center">
                        <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                        <div class="spinner-border blue ml-4" role="status">

                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </CardBody>
              {/* <CardFooter> */}
              {/* <FormGroup>
                  <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                  {this.state.isChanged == 1 && this.state.conflictsCount == 0 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={this.synchronize} ><i className="fa fa-check"></i>{i18n.t('static.button.commit')} </Button>}
                  &nbsp;
                </FormGroup> */}
              {/* </CardFooter> */}
            </Card>
          </Col>
        </Row>

        {/* Resolve conflicts modal */}
        <Modal isOpen={this.state.conflicts}
          className={'modal-lg ' + this.props.className, "modalWidth"} style={{ display: this.state.loading ? "none" : "block" }}>
          <ModalHeader toggle={() => this.toggleLarge()} className="modalHeaderSupplyPlan">
            <strong>{i18n.t('static.commitVersion.resolveConflicts')}</strong>
            <ul className="legendcommitversion">
              <li><span className="greenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInCurrentVersion')}</span></li>
              <li><span className="notawesome  legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInLatestVersion')}</span></li>
            </ul>
          </ModalHeader>
          <ModalBody>
            <div className="table-responsive RemoveStriped">
              <div id="resolveConflictsTable" />
              <input type="hidden" id="index" />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.acceptCurrentChanges}> <i className="fa fa-check"></i>{i18n.t('static.commitVersion.acceptCurrentVersion')}</Button>{' '}
            <Button type="submit" size="md" className="acceptLocalChnagesButton submitBtn float-right mr-1" onClick={this.acceptIncomingChanges}> <i className="fa fa-check"></i>{i18n.t('static.commitVersion.acceptLatestVersion')}</Button>{' '}
          </ModalFooter>
        </Modal>
        {/* Resolve conflicts modal */}


        {/* Resolve conflicts modal */}
        <Modal isOpen={this.state.conflictsInventory}
          className={'modal-lg ' + this.props.className, "modalWidth"} style={{ display: this.state.loading ? "none" : "block" }}>
          <ModalHeader toggle={() => this.toggleLargeInventory()} className="modalHeaderSupplyPlan">
            <strong>{i18n.t('static.commitVersion.resolveConflicts')}</strong>
            <ul className="legendcommitversion">
              <li><span className="greenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInCurrentVersion')}</span></li>
              <li><span className="notawesome  legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInLatestVersion')}</span></li>
            </ul>
          </ModalHeader>
          <ModalBody>
            <div className="table-responsive RemoveStriped">
              <div id="resolveConflictsInventoryTable" />
              <input type="hidden" id="indexInventory" />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.acceptCurrentChangesInventory}> <i className="fa fa-check"></i>{i18n.t('static.commitVersion.acceptCurrentVersion')}</Button>{' '}
            <Button type="submit" size="md" className="acceptLocalChnagesButton submitBtn float-right mr-1" onClick={this.acceptIncomingChangesInventory}> <i className="fa fa-check"></i>{i18n.t('static.commitVersion.acceptLatestVersion')}</Button>{' '}
          </ModalFooter>
        </Modal>
        {/* Resolve conflicts modal */}

        {/* Resolve conflicts modal */}
        <Modal isOpen={this.state.conflictsShipment}
          className={'modal-lg ' + this.props.className, "modalWidth"} style={{ display: this.state.loading ? "none" : "block" }}>
          <ModalHeader toggle={() => this.toggleLargeShipment()} className="modalHeaderSupplyPlan">
            <strong>{i18n.t('static.commitVersion.resolveConflicts')}</strong>
            <ul className="legendcommitversion">
              <li><span className="greenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInCurrentVersion')}</span></li>
              <li><span className="notawesome  legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInLatestVersion')}</span></li>
            </ul>
          </ModalHeader>
          <ModalBody>
            <div className="table-responsive RemoveStriped">
              <div id="resolveConflictsShipmentTable" />
              <input type="hidden" id="indexShipment" />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.acceptCurrentChangesShipment}> <i className="fa fa-check"></i>{i18n.t('static.commitVersion.acceptCurrentVersion')}</Button>{' '}
            <Button type="submit" size="md" className="acceptLocalChnagesButton submitBtn float-right mr-1" onClick={this.acceptIncomingChangesShipment}> <i className="fa fa-check"></i>{i18n.t('static.commitVersion.acceptLatestVersion')}</Button>{' '}
          </ModalFooter>
        </Modal>
        {/* Resolve conflicts modal */}

        {/* Resolve conflicts modal */}
        <Modal isOpen={this.state.conflictsProblem}
          className={'modal-lg ' + this.props.className, "modalWidth"} style={{ display: this.state.loading ? "none" : "block" }}>
          <ModalHeader toggle={() => this.toggleLargeProblem()} className="modalHeaderSupplyPlan">
            <strong>{i18n.t('static.commitVersion.resolveConflicts')}</strong>
            <ul className="legendcommitversion">
              <li><span className="greenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInCurrentVersion')}</span></li>
              <li><span className="notawesome  legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInLatestVersion')}</span></li>
            </ul>
          </ModalHeader>
          <ModalBody>
            <div className="table-responsive RemoveStriped">
              <div id="resolveConflictsProblemTable" />
              <input type="hidden" id="indexProblem" />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.acceptCurrentChangesProblem}> <i className="fa fa-check"></i>{i18n.t('static.commitVersion.acceptCurrentVersion')}</Button>{' '}
            <Button type="submit" size="md" className="acceptLocalChnagesButton submitBtn float-right mr-1" onClick={this.acceptIncomingChangesProblem}> <i className="fa fa-check"></i>{i18n.t('static.commitVersion.acceptLatestVersion')}</Button>{' '}
          </ModalFooter>
        </Modal>
        {/* Resolve conflicts modal */}
      </div>
    );
  };

  // checkValidations() {
  //   var valid = true;
  //   var elInstance = this.state.mergedShipmentJexcel;
  //   var json = elInstance.getJson();
  //   var shipmentData = [];
  //   var shipmentJson = (this.state.mergedShipmentJexcel).getJson();
  //   var oldProgramDataShipment = this.state.oldProgramDataShipment;
  //   var latestProgramDataShipment = this.state.latestProgramDataShipment;
  //   for (var c = 0; c < shipmentJson.length; c++) {
  //     if (((shipmentJson[c])[33] == 2 || (shipmentJson[c])[33] == 4) && (shipmentJson[c])[0] != 0) {
  //       shipmentData.push(oldProgramDataShipment.filter(a => a.shipmentId == (shipmentJson[c])[0])[0]);
  //     } else if ((shipmentJson[c])[33] == 3 && (shipmentJson[c])[0] != 0) {
  //       shipmentData.push(latestProgramDataShipment.filter(a => a.shipmentId == (shipmentJson[c])[0])[0]);
  //     }
  //   }
  //   shipmentData = shipmentData.concat(oldProgramDataShipment.filter(c => c.shipmentId == 0));
  //   for (var y = 0; y < json.length; y++) {
  //     var map = new Map(Object.entries(json[y]));
  //     var rowData = elInstance.getRowData(y);
  //     if (map.get("6") != "" && map.get("12") != "") {
  //       var budget = this.state.budgetListAll.filter(c => c.id == map.get("6"))[0]
  //       var totalBudget = budget.budgetAmt * budget.currency.conversionRateToUsd;
  //       var shipmentList = shipmentData.filter(c => c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.active == true && c.budget.id == map.get("6"))
  //       var usedBudgetTotalAmount = 0;
  //       for (var s = 0; s < shipmentList.length; s++) {
  //         usedBudgetTotalAmount += parseFloat((parseFloat(shipmentList[s].productCost) + parseFloat(shipmentList[s].freightCost)) * parseFloat(shipmentList[s].currency.conversionRateToUsd));
  //       }
  //       var totalCost = parseFloat(((elInstance.getCell(`O${parseInt(y) + 1}`)).innerHTML).toString().replaceAll("\,", "")) + parseFloat(((elInstance.getCell(`P${parseInt(y) + 1}`)).innerHTML).toString().replaceAll("\,", ""));
  //       var enteredBudgetAmt = (totalCost * (parseFloat((this.state.currencyListAll.filter(c => c.currencyId == rowData[12])[0]).conversionRateToUsd)));
  //       usedBudgetTotalAmount = usedBudgetTotalAmount.toFixed(2);
  //       enteredBudgetAmt = enteredBudgetAmt.toFixed(2);

  //       var availableBudgetAmount = totalBudget - usedBudgetTotalAmount;
  //       if (enteredBudgetAmt > availableBudgetAmount || availableBudgetAmount < 0) {
  //         valid = false;
  //         inValidWithColor("G", y, i18n.t('static.label.noFundsAvailable'), elInstance, "red");
  //         inValidWithColor("O", y, i18n.t('static.label.noFundsAvailable'), elInstance, "red");
  //       } else {
  //       }
  //     } else {
  //     }
  //   }
  //   return valid;
  // }

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
      var problemListDate = moment(Date.now()).subtract(12, 'months').endOf('month').format("YYYY-MM-DD");
      if (problemReportList.filter(c =>
        c.problemStatus.id == OPEN_PROBLEM_STATUS_ID &&
        moment(c.createdDate).format("YYYY-MM-DD") > problemListDate
      ).length > 0 && document.getElementById("versionType").value == FINAL_VERSION_TYPE && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes("ROLE_BF_READONLY_ACCESS_REALM_ADMIN")) {
        alert(i18n.t("static.commitVersion.cannotCommitWithOpenProblems"))
        this.setState({ loading: false });
      } else {
        var db1;
        var storeOS;
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
            // var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
            // var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
            // var programJson = JSON.parse(programData);

            var programQPLDetailsTransaction1 = db1.transaction(['programQPLDetails'], 'readwrite');
            var programQPLDetailsOs1 = programQPLDetailsTransaction1.objectStore('programQPLDetails');
            var programQPLDetailsGetRequest = programQPLDetailsOs1.get((this.state.programId).value);
            programQPLDetailsGetRequest.onsuccess = function (event) {
              var programQPLDetails = programQPLDetailsGetRequest.result;
              var programIdForNotification = programQPLDetails.programId;
              var versionIdForNotification = programQPLDetails.version;
              // var planningUnitList = [];
              // var consumptionData = [];
              // var consumptionJson = (this.state.mergedConsumptionJexcel).getJson();
              // var oldProgramDataConsumption = this.state.oldProgramDataConsumption;
              // var latestProgramDataConsumption = this.state.latestProgramDataConsumption;
              // for (var c = 0; c < consumptionJson.length; c++) {
              // if (((consumptionJson[c])[18] == 2 || (consumptionJson[c])[18] == 4) && (consumptionJson[c])[0] != 0) {
              // consumptionData.push(oldProgramDataConsumption.filter(a => a.consumptionId == (consumptionJson[c])[0])[0]);
              // } else if ((consumptionJson[c])[18] == 3 && (consumptionJson[c])[0] != 0) {
              // consumptionData.push(latestProgramDataConsumption.filter(a => a.consumptionId == (consumptionJson[c])[0])[0]);
              // }
              // }
              // consumptionData = consumptionData.concat(oldProgramDataConsumption.filter(c => c.consumptionId == 0));

              // var inventoryData = [];
              // var inventoryJson = (this.state.mergedInventoryJexcel).getJson();
              // var oldProgramDataInventory = this.state.oldProgramDataInventory;
              // var latestProgramDataInventory = this.state.latestProgramDataInventory;
              // for (var c = 0; c < inventoryJson.length; c++) {
              // if (((inventoryJson[c])[19] == 2 || (inventoryJson[c])[19] == 4) && (inventoryJson[c])[0] != 0) {
              // inventoryData.push(oldProgramDataInventory.filter(a => a.inventoryId == (inventoryJson[c])[0])[0]);
              // } else if ((inventoryJson[c])[19] == 3 && (inventoryJson[c])[0] != 0) {
              // inventoryData.push(latestProgramDataInventory.filter(a => a.inventoryId == (inventoryJson[c])[0])[0]);
              // }
              // }
              // inventoryData = inventoryData.concat(oldProgramDataInventory.filter(c => c.inventoryId == 0));

              // var shipmentData = [];
              // var shipmentJson = (this.state.mergedShipmentJexcel).getJson();
              // var oldProgramDataShipment = this.state.oldProgramDataShipment;
              // var latestProgramDataShipment = this.state.latestProgramDataShipment;
              // for (var c = 0; c < shipmentJson.length; c++) {
              // if (((shipmentJson[c])[33] == 2 || (shipmentJson[c])[33] == 4) && (shipmentJson[c])[0] != 0) {
              // shipmentData.push(oldProgramDataShipment.filter(a => a.shipmentId == (shipmentJson[c])[0])[0]);
              // } else if ((shipmentJson[c])[33] == 3 && (shipmentJson[c])[0] != 0) {
              // shipmentData.push(latestProgramDataShipment.filter(a => a.shipmentId == (shipmentJson[c])[0])[0]);
              // }
              // }
              // shipmentData = shipmentData.concat(oldProgramDataShipment.filter(c => c.shipmentId == 0 && c.active.toString() == "true"));

              // var problemReportList = [];
              // var problemJson = (this.state.mergedProblemListJexcel).getJson();
              // var oldProgramDataProblem = this.state.oldProgramDataProblemList;
              // var latestProgramDataProblem = this.state.latestProgramDataProblemList;
              // for (var c = 0; c < problemJson.length; c++) {
              // if (((problemJson[c])[20] == 2 || (problemJson[c])[20] == 4) && (problemJson[c])[0] != 0) {
              // problemReportList.push(oldProgramDataProblem.filter(a => a.problemReportId == (problemJson[c])[0])[0]);
              // } else if ((problemJson[c])[20] == 3 && (problemJson[c])[0] != 0) {
              // problemReportList.push(latestProgramDataProblem.filter(a => a.problemReportId == (problemJson[c])[0])[0]);
              // }
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
              programJson.consumptionList = consumptionList;
              programJson.inventoryList = inventoryList;
              programJson.shipmentList = shipmentList;
              programJson.batchInfoList = batchInfoList;
              programJson.supplyPlan = supplyPlan;
              // var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
              // var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
              // var programJson = JSON.parse(programData);
              // var planningUnitList = [];
              // var consumptionData = [];
              // var consumptionJson = (this.state.mergedConsumptionJexcel).getJson();
              // var oldProgramDataConsumption = this.state.oldProgramDataConsumption;
              // var latestProgramDataConsumption = this.state.latestProgramDataConsumption;
              // for (var c = 0; c < consumptionJson.length; c++) {
              // if (((consumptionJson[c])[18] == 2 || (consumptionJson[c])[18] == 4) && (consumptionJson[c])[0] != 0) {
              // consumptionData.push(oldProgramDataConsumption.filter(a => a.consumptionId == (consumptionJson[c])[0])[0]);
              // } else if ((consumptionJson[c])[18] == 3 && (consumptionJson[c])[0] != 0) {
              // consumptionData.push(latestProgramDataConsumption.filter(a => a.consumptionId == (consumptionJson[c])[0])[0]);
              // }
              // }
              // consumptionData = consumptionData.concat(oldProgramDataConsumption.filter(c => c.consumptionId == 0));

              // var inventoryData = [];
              // var inventoryJson = (this.state.mergedInventoryJexcel).getJson();
              // var oldProgramDataInventory = this.state.oldProgramDataInventory;
              // var latestProgramDataInventory = this.state.latestProgramDataInventory;
              // for (var c = 0; c < inventoryJson.length; c++) {
              // if (((inventoryJson[c])[19] == 2 || (inventoryJson[c])[19] == 4) && (inventoryJson[c])[0] != 0) {
              // inventoryData.push(oldProgramDataInventory.filter(a => a.inventoryId == (inventoryJson[c])[0])[0]);
              // } else if ((inventoryJson[c])[19] == 3 && (inventoryJson[c])[0] != 0) {
              // inventoryData.push(latestProgramDataInventory.filter(a => a.inventoryId == (inventoryJson[c])[0])[0]);
              // }
              // }
              // inventoryData = inventoryData.concat(oldProgramDataInventory.filter(c => c.inventoryId == 0));

              // var shipmentData = [];
              // var shipmentJson = (this.state.mergedShipmentJexcel).getJson();
              // var oldProgramDataShipment = this.state.oldProgramDataShipment;
              // var latestProgramDataShipment = this.state.latestProgramDataShipment;
              // for (var c = 0; c < shipmentJson.length; c++) {
              // if (((shipmentJson[c])[33] == 2 || (shipmentJson[c])[33] == 4) && (shipmentJson[c])[0] != 0) {
              // shipmentData.push(oldProgramDataShipment.filter(a => a.shipmentId == (shipmentJson[c])[0])[0]);
              // } else if ((shipmentJson[c])[33] == 3 && (shipmentJson[c])[0] != 0) {
              // shipmentData.push(latestProgramDataShipment.filter(a => a.shipmentId == (shipmentJson[c])[0])[0]);
              // }
              // }
              // shipmentData = shipmentData.concat(oldProgramDataShipment.filter(c => c.shipmentId == 0 && c.active.toString() == "true"));

              // var problemReportList = [];
              // var problemJson = (this.state.mergedProblemListJexcel).getJson();
              // var oldProgramDataProblem = this.state.oldProgramDataProblemList;
              // var latestProgramDataProblem = this.state.latestProgramDataProblemList;
              // for (var c = 0; c < problemJson.length; c++) {
              // if (((problemJson[c])[20] == 2 || (problemJson[c])[20] == 4) && (problemJson[c])[0] != 0) {
              // problemReportList.push(oldProgramDataProblem.filter(a => a.problemReportId == (problemJson[c])[0])[0]);
              // } else if ((problemJson[c])[20] == 3 && (problemJson[c])[0] != 0) {
              // problemReportList.push(latestProgramDataProblem.filter(a => a.problemReportId == (problemJson[c])[0])[0]);
              // }
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
              programJson.consumptionList = consumptionList;
              programJson.inventoryList = inventoryList;
              programJson.shipmentList = shipmentList;
              programJson.batchInfoList = batchInfoList;
              programJson.supplyPlan = supplyPlan;
              // var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
              // var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
              // var programJson = JSON.parse(programData);
              // var planningUnitList = [];
              // var consumptionData = [];
              // var consumptionJson = (this.state.mergedConsumptionJexcel).getJson();
              // var oldProgramDataConsumption = this.state.oldProgramDataConsumption;
              // var latestProgramDataConsumption = this.state.latestProgramDataConsumption;
              // for (var c = 0; c < consumptionJson.length; c++) {
              // if (((consumptionJson[c])[18] == 2 || (consumptionJson[c])[18] == 4) && (consumptionJson[c])[0] != 0) {
              // consumptionData.push(oldProgramDataConsumption.filter(a => a.consumptionId == (consumptionJson[c])[0])[0]);
              // } else if ((consumptionJson[c])[18] == 3 && (consumptionJson[c])[0] != 0) {
              // consumptionData.push(latestProgramDataConsumption.filter(a => a.consumptionId == (consumptionJson[c])[0])[0]);
              // }
              // }
              // consumptionData = consumptionData.concat(oldProgramDataConsumption.filter(c => c.consumptionId == 0));

              // var inventoryData = [];
              // var inventoryJson = (this.state.mergedInventoryJexcel).getJson();
              // var oldProgramDataInventory = this.state.oldProgramDataInventory;
              // var latestProgramDataInventory = this.state.latestProgramDataInventory;
              // for (var c = 0; c < inventoryJson.length; c++) {
              // if (((inventoryJson[c])[19] == 2 || (inventoryJson[c])[19] == 4) && (inventoryJson[c])[0] != 0) {
              // inventoryData.push(oldProgramDataInventory.filter(a => a.inventoryId == (inventoryJson[c])[0])[0]);
              // } else if ((inventoryJson[c])[19] == 3 && (inventoryJson[c])[0] != 0) {
              // inventoryData.push(latestProgramDataInventory.filter(a => a.inventoryId == (inventoryJson[c])[0])[0]);
              // }
              // }
              // inventoryData = inventoryData.concat(oldProgramDataInventory.filter(c => c.inventoryId == 0));

              // var shipmentData = [];
              // var shipmentJson = (this.state.mergedShipmentJexcel).getJson();
              // var oldProgramDataShipment = this.state.oldProgramDataShipment;
              // var latestProgramDataShipment = this.state.latestProgramDataShipment;
              // for (var c = 0; c < shipmentJson.length; c++) {
              // if (((shipmentJson[c])[33] == 2 || (shipmentJson[c])[33] == 4) && (shipmentJson[c])[0] != 0) {
              // shipmentData.push(oldProgramDataShipment.filter(a => a.shipmentId == (shipmentJson[c])[0])[0]);
              // } else if ((shipmentJson[c])[33] == 3 && (shipmentJson[c])[0] != 0) {
              // shipmentData.push(latestProgramDataShipment.filter(a => a.shipmentId == (shipmentJson[c])[0])[0]);
              // }
              // }
              // shipmentData = shipmentData.concat(oldProgramDataShipment.filter(c => c.shipmentId == 0 && c.active.toString() == "true"));

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
              // programJson.consumptionList = consumptionData;
              // programJson.inventoryList = inventoryData;
              // programJson.shipmentList = shipmentData;
              programJson.problemReportList = problemReportList;
              console.log("ProgramJson.consumption+++", programJson.consumptionList);
              // programJson.problemReportList = [];
              programJson.versionType = { id: document.getElementById("versionType").value };
              programJson.versionStatus = { id: PENDING_APPROVAL_VERSION_STATUS };
              programJson.notes = document.getElementById("notes").value;
              console.log("ProgramJson+++", programJson);
              ProgramService.getLatestVersionForProgram((this.state.singleProgramId)).then(response => {
                if (response.status == 200) {
                  if (response.data == this.state.comparedLatestVersion) {
                    ProgramService.checkIfCommitRequestExists((this.state.singleProgramId)).then(response1 => {
                      if (response1.status == 200) {
                        if (response1.data == false) {
                          ProgramService.saveProgramData(programJson).then(response => {
                            if (response.status == 200) {
                              // var programDataTransaction1 = db1.transaction(['programData'], 'readwrite');
                              // var programDataOs1 = programDataTransaction1.objectStore('programData');
                              // var programRequest1 = programDataOs1.delete((this.state.programId).value);

                              // var programDataTransaction3 = db1.transaction(['programQPLDetails'], 'readwrite');
                              // var programDataOs3 = programDataTransaction3.objectStore('programQPLDetails');
                              // var programRequest3 = programDataOs3.delete((this.state.programId).value);

                              // var programDataTransaction2 = db1.transaction(['downloadedProgramData'], 'readwrite');
                              // var programDataOs2 = programDataTransaction2.objectStore('downloadedProgramData');
                              // var programRequest2 = programDataOs2.delete((this.state.programId).value);

                              // programRequest1.onerror = function (event) {
                              // this.setState({
                              // supplyPlanError: i18n.t('static.program.errortext')
                              // })
                              // }.bind(this);
                              // programRequest2.onsuccess = function (e) {

                              // var json = response.data;
                              // json.actionList = [];
                              // var version = json.requestedProgramVersion;
                              // if (version == -1) {
                              // version = json.currentVersion.versionId
                              // }

                              // var transactionForSavingData = db1.transaction(['programData'], 'readwrite');
                              // var programSaveData = transactionForSavingData.objectStore('programData');

                              // var transactionForSavingDownloadedProgramData = db1.transaction(['downloadedProgramData'], 'readwrite');
                              // var downloadedProgramSaveData = transactionForSavingDownloadedProgramData.objectStore('downloadedProgramData');

                              var transactionForProgramQPLDetails = db1.transaction(['programQPLDetails'], 'readwrite');
                              var programQPLDetailSaveData = transactionForProgramQPLDetails.objectStore('programQPLDetails');
                              // // for (var i = 0; i < json.length; i++) {
                              // var encryptedText = CryptoJS.AES.encrypt(JSON.stringify(json), SECRET_KEY);
                              // var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                              // var userId = userBytes.toString(CryptoJS.enc.Utf8);
                              // var openCount = (json.problemReportList.filter(c => c.problemStatus.id == 1 && c.planningUnitActive != false && c.regionActive != false)).length;
                              // var addressedCount = (json.problemReportList.filter(c => c.problemStatus.id == 3 && c.planningUnitActive != false && c.regionActive != false)).length;

                              // var item = {
                              // id: json.programId + "_v" + version + "_uId_" + userId,
                              // programId: json.programId,
                              // version: version,
                              // programName: (CryptoJS.AES.encrypt(JSON.stringify((json.label)), SECRET_KEY)).toString(),
                              // programData: encryptedText.toString(),
                              // userId: userId
                              // };
                              // var programQPLDetails = {
                              // id: json.programId + "_v" + version + "_uId_" + userId,
                              // programId: json.programId,
                              // version: version,
                              // userId: userId,
                              // programCode: json.programCode,
                              // openCount: openCount,
                              // addressedCount: addressedCount,
                              // programModified: 0
                              // }
                              programQPLDetails.readonly = 1;
                              // var putRequest = programSaveData.put(programRequest.result);
                              // var putRequest1 = downloadedProgramSaveData.put(item);
                              var putRequest2 = programQPLDetailSaveData.put(programQPLDetails);

                              // this.props.history.push({ pathname: `/masterDataSync/green/` + i18n.t('static.message.commitSuccess'), state: { "programIds": json.programId + "_v" + version + "_uId_" + userId } })
                              this.redirectToDashbaord(response.data);
                              // }.bind(this)
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
                                console.log("@@@Error4", error);
                                console.log("@@@Error4", error.message);
                                console.log("@@@Error4", error.response ? error.response.status : "")
                                if (error.message === "Network Error") {
                                  console.log("+++in catch 7")
                                  this.setState({
                                    message: 'static.common.networkError',
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
                                    case 500:
                                    case 404:
                                    case 406:
                                      this.setState({
                                        message: error.response.data.messageCode,
                                        color: "red",
                                        loading: false
                                      }, () => {
                                        this.hideFirstComponent()
                                      });
                                      break;
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
                                      console.log("+++in catch 8")
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
                        } else {
                          alert(i18n.t("static.commitVersion.requestAlreadyExists"));
                          this.setState({
                            message: i18n.t("static.commitVersion.requestAlreadyExists"),
                            loading: false,
                            color: "red"
                          }, () => {
                            this.hideFirstComponent()
                            // this.checkLastModifiedDateForProgram(this.state.programId);
                          });

                        }
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
                          console.log("@@@Error5", error);
                          console.log("@@@Error5", error.message);
                          console.log("@@@Error5", error.response ? error.response.status : "")
                          if (error.message === "Network Error") {
                            console.log("+++in catch 9")
                            this.setState({
                              message: 'static.common.networkError',
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
                              case 500:
                              case 404:
                              case 406:
                                this.setState({
                                  message: error.response.data.messageCode,
                                  color: "red",
                                  loading: false
                                }, () => {
                                  this.hideFirstComponent()
                                });
                                break;
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
                                console.log("+++in catch 10")
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
                  } else {
                    alert(i18n.t("static.commitVersion.versionIsOutDated"));
                    this.setState({
                      message: i18n.t("static.commitVersion.versionIsOutDated"),
                      loading: false,
                      color: "red"
                    }, () => {
                      this.hideFirstComponent()
                      this.checkLastModifiedDateForProgram(this.state.programId);
                    });

                  }
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
                    console.log("@@@Error5", error);
                    console.log("@@@Error5", error.message);
                    console.log("@@@Error5", error.response ? error.response.status : "")
                    if (error.message === "Network Error") {
                      console.log("+++in catch 9")
                      this.setState({
                        message: 'static.common.networkError',
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
                        case 500:
                        case 404:
                        case 406:
                          this.setState({
                            message: error.response.data.messageCode,
                            color: "red",
                            loading: false
                          }, () => {
                            this.hideFirstComponent()
                          });
                          break;
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
                          console.log("+++in catch 10")
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

  cancelClicked() {
    let id = AuthenticationService.displayDashboardBasedOnRole();
    this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
  }

  redirectToDashbaord(commitRequestId) {
    console.log("method called", commitRequestId);
    AuthenticationService.setupAxiosInterceptors();
    const sendGetRequest = async () => {
      try {
        const resp = await ProgramService.sendNotificationAsync(commitRequestId);
        // var msg=resp.data.messageCode;
        // console.log("Response +++", msg);
        // this.setState({openModal:true,
        // responseMessage:msg});
        var curUser = AuthenticationService.getLoggedInUserId();
        console.log("Resposne.data+++", resp.data);
        if (resp.data.createdBy.userId == curUser) {
          eventBus.dispatch("testDataAccess", { openModal: true, notificationDetails: resp.data });
        }
        // window.visible=true;

      } catch (err) {
        // Handle Error Here
        console.error("Error+++", err);
      }
    };
    sendGetRequest();
    this.setState({ loading: false })
    let id = AuthenticationService.displayDashboardBasedOnRole();
    this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/green/' + i18n.t('static.message.commitSuccess'))
  }

  updateState(parameterName, value) {
    this.setState({
      [parameterName]: value
    })
  }

  fetchData() {
    console.log("+++in fetch data", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"))
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
            // If 0 check whether that exists in latest version or not
            var index = 0;
            if (oldProgramDataProblemList[c].realmProblem.problem.problemId == 1 || oldProgramDataProblemList[c].realmProblem.problem.problemId == 2 || oldProgramDataProblemList[c].realmProblem.problem.problemId == 8 || oldProgramDataProblemList[c].realmProblem.problem.problemId == 10 || oldProgramDataProblemList[c].realmProblem.problem.problemId == 14 || oldProgramDataProblemList[c].realmProblem.problem.problemId == 15 || oldProgramDataProblemList[c].realmProblem.problem.problemId == 25) {
              index = latestProgramDataProblemList.findIndex(
                f =>
                  // moment(f.dt).format("YYYY-MM") == moment(oldProgramDataProblemList[c].dt).format("YYYY-MM") && 
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
                  // f.planningUnit.id == oldProgramDataProblemList[c].planningUnit.id &&
                  f.realmProblem.problem.problemId == oldProgramDataProblemList[c].realmProblem.problem.problemId
                  // && oldProgramDataProblemList[c].newAdded != true
                  && f.shipmentId == oldProgramDataProblemList[c].shipmentId &&
                  !existingProblemReportId.includes(f.problemReportId));
            } else if (oldProgramDataProblemList[c].realmProblem.problem.problemId == 23 || oldProgramDataProblemList[c].realmProblem.problem.problemId == 24) {
              index = latestProgramDataProblemList.findIndex(
                f =>
                  f.planningUnit.id == oldProgramDataProblemList[c].planningUnit.id
                  && f.realmProblem.problem.problemId == oldProgramDataProblemList[c].realmProblem.problem.problemId &&
                  !existingProblemReportId.includes(f.problemReportId));

            }
            // else if (oldProgramDataProblemList[c].realmProblem.problem.problemId == 11 || oldProgramDataProblemList[c].realmProblem.problem.problemId == 16 || oldProgramDataProblemList[c].realmProblem.problem.problemId == 17 || oldProgramDataProblemList[c].realmProblem.problem.problemId == 18 || oldProgramDataProblemList[c].realmProblem.problem.problemId == 19 || oldProgramDataProblemList[c].realmProblem.problem.problemId == 20) {
            //   index = latestProgramDataProblemList.findIndex(
            //     f => 
            //       moment(f.dt).format("YYYY-MM") == moment(oldProgramDataProblemList[c].dt).format("YYYY-MM")
            //       && f.planningUnit.id == oldProgramDataProblemList[c].planningUnit.id
            //       && f.realmProblem.problem.problemId == oldProgramDataProblemList[c].realmProblem.problem.problemId);
            // }
            console.log("Index-------------->", index);
            // var index = -1;
            if (index == -1) {
              mergedProblemListData.push(oldProgramDataProblemList[c]);
            } else {
              oldProgramDataProblemList[c].problemReportId = latestProgramDataProblemList[index].problemReportId;
              existingProblemReportId.push(latestProgramDataProblemList[index].problemReportId);
              mergedProblemListData.push(oldProgramDataProblemList[c]);
            }
          }
        }
        // Getting other entries of latest problemList data
        var latestOtherProblemListEntries = latestProgramDataProblemList.filter(c => !(existingProblemReportId.includes(c.problemReportId)));
        mergedProblemListData = mergedProblemListData.concat(latestOtherProblemListEntries);
        mergedProblemListData = mergedProblemListData.filter(c => c.planningUnitActive != false && c.regionActive != false)
        var problemListDate = moment(Date.now()).subtract(12, 'months').endOf('month').format("YYYY-MM-DD");
        this.setState({
          openCount: mergedProblemListData.filter(c =>
            c.problemStatus.id == OPEN_PROBLEM_STATUS_ID &&
            moment(c.createdDate).format("YYYY-MM-DD") > problemListDate).length
        })

        var data = [];
        var mergedProblemListJexcel = [];
        for (var cd = 0; cd < mergedProblemListData.length; cd++) {
          data = []
          data[0] = mergedProblemListData[cd].problemReportId; //A
          data[1] = 1; //B
          data[2] = mergedProblemListData[cd].program.code; //C
          data[3] = 1; //D
          data[4] = (mergedProblemListData[cd].region != null && mergedProblemListData[cd].region.id != 0) ? (getLabelText(mergedProblemListData[cd].region.label, this.state.lang)) : ''; //E
          data[5] = getLabelText(mergedProblemListData[cd].planningUnit.label, this.state.lang); //F
          data[6] = (mergedProblemListData[cd].dt != null) ? (moment(mergedProblemListData[cd].dt).format('MMM-YY')) : ''; //G
          data[7] = moment(mergedProblemListData[cd].createdDate).format('MMM-YY'); //H
          data[8] = getProblemDesc(mergedProblemListData[cd], this.state.lang); //I
          data[9] = getSuggestion(mergedProblemListData[cd], this.state.lang); //J
          data[10] = getLabelText(mergedProblemListData[cd].problemStatus.label, this.state.lang); //K
          data[11] = this.getNote(mergedProblemListData[cd], this.state.lang); //L
          data[12] = mergedProblemListData[cd].problemStatus.id; //M
          data[13] = mergedProblemListData[cd].planningUnit.id; //N
          data[14] = mergedProblemListData[cd].realmProblem.problem.problemId; //O
          data[15] = mergedProblemListData[cd].realmProblem.problem.actionUrl; //P
          data[16] = mergedProblemListData[cd].realmProblem.criticality.id; //Q
          var oldDataList = oldProgramDataProblemList.filter(c => c.problemReportId == mergedProblemListData[cd].problemReportId);
          var oldData = ""
          if (oldDataList.length > 0) {
            oldData = [oldDataList[0].problemReportId, 1, oldDataList[0].program.code, 1, (oldDataList[0].region != null && oldDataList[0].region.id != 0) ? (getLabelText(oldDataList[0].region.label, this.state.lang)) : '', getLabelText(oldDataList[0].planningUnit.label, this.state.lang), (oldDataList[0].dt != null) ? (moment(oldDataList[0].dt).format('MMM-YY')) : '', moment(oldDataList[0].createdDate).format('MMM-YY'), getProblemDesc(oldDataList[0], this.state.lang), getSuggestion(oldDataList[0], this.state.lang), getLabelText(oldDataList[0].problemStatus.label, this.state.lang), this.getNote(oldDataList[0], this.state.lang), oldDataList[0].problemStatus.id, oldDataList[0].planningUnit.id, oldDataList[0].realmProblem.problem.problemId, oldDataList[0].realmProblem.problem.actionUrl, oldDataList[0].realmProblem.criticality.id, "", "", "", 4];
          }
          data[17] = oldData;//Old data //R
          var latestDataList = latestProgramDataProblemList.filter(c => mergedProblemListData[cd].problemReportId != 0 && c.problemReportId == mergedProblemListData[cd].problemReportId);
          var latestData = ""
          if (latestDataList.length > 0) {
            latestData = [latestDataList[0].problemReportId, 1, latestDataList[0].program.code, 1, (latestDataList[0].region != null && latestDataList[0].region.id != 0) ? (getLabelText(latestDataList[0].region.label, this.state.lang)) : '', getLabelText(latestDataList[0].planningUnit.label, this.state.lang), (latestDataList[0].dt != null) ? (moment(latestDataList[0].dt).format('MMM-YY')) : '', moment(latestDataList[0].createdDate).format('MMM-YY'), getProblemDesc(latestDataList[0], this.state.lang), getSuggestion(latestDataList[0], this.state.lang), getLabelText(latestDataList[0].problemStatus.label, this.state.lang), this.getNote(latestDataList[0], this.state.lang), latestDataList[0].problemStatus.id, latestDataList[0].planningUnit.id, latestDataList[0].realmProblem.problem.problemId, latestDataList[0].realmProblem.problem.actionUrl, latestDataList[0].realmProblem.criticality.id, "", "", "", 4];
          }
          data[18] = latestData;//Latest data //S
          var downloadedDataList = downloadedProgramDataProblemList.filter(c => mergedProblemListData[cd].problemReportId != 0 && c.problemReportId == mergedProblemListData[cd].problemReportId);
          var downloadedData = "";
          if (downloadedDataList.length > 0) {
            downloadedData = [downloadedDataList[0].problemReportId, 1, downloadedDataList[0].program.code, 1, (downloadedDataList[0].region != null && downloadedDataList[0].region.id != 0) ? (getLabelText(downloadedDataList[0].region.label, this.state.lang)) : '', getLabelText(downloadedDataList[0].planningUnit.label, this.state.lang), (downloadedDataList[0].dt != null) ? (moment(downloadedDataList[0].dt).format('MMM-YY')) : '', moment(downloadedDataList[0].createdDate).format('MMM-YY'), getProblemDesc(downloadedDataList[0], this.state.lang), getSuggestion(downloadedDataList[0], this.state.lang), getLabelText(downloadedDataList[0].problemStatus.label, this.state.lang), this.getNote(downloadedDataList[0], this.state.lang), downloadedDataList[0].problemStatus.id, downloadedDataList[0].planningUnit.id, downloadedDataList[0].realmProblem.problem.problemId, downloadedDataList[0].realmProblem.problem.actionUrl, downloadedDataList[0].realmProblem.criticality.id, "", "", "", 4];
          }
          data[19] = downloadedData;//Downloaded data //T
          data[20] = 4; //U
          mergedProblemListJexcel.push(data);
        }
        var options = {
          data: mergedProblemListJexcel,
          columnDrag: true,
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
          tableOverflow: true,
          wordWrap: true,
          allowInsertColumn: false,
          allowManualInsertColumn: false,
          allowDeleteRow: false,
          editable: false,
          onload: this.loadedFunctionForMergeProblemList,
          filters: true,
          license: JEXCEL_PRO_KEY,
          text: {
            showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            show: '',
            entries: '',
          },
          contextMenu: function (obj, x, y, e) {
            var items = [];
            //Resolve conflicts
            var rowData = obj.getRowData(y)
            if (rowData[20].toString() == 1) {
              items.push({
                title: "Resolve conflicts",
                onclick: function () {
                  this.setState({ loading: true })
                  this.toggleLargeProblem(rowData[17], rowData[18], y, 'problemList');
                }.bind(this)
              })
            }

            // if (rowData[0].toString() > 0) {
            //   items.push({
            //     title: "Show version history",
            //     onclick: function () {
            //       this.toggleVersionHistory(rowData[13]);
            //     }.bind(this)
            //   })
            // }
            return items;
          }.bind(this)
        };

        var mergedProblemListJexcel = jexcel(document.getElementById("mergedVersionProblemList"), options);
        this.el = mergedProblemListJexcel;
        console.log("+++QPL jexcel completed ", moment(Date.now()).format("YYYY-MM-DD HH:mm:ss:SSS"))
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
