import jexcel from 'jspreadsheet';
import React, { Component } from 'react';
import {
    Button,
    CardBody,
    FormGroup
} from 'reactstrap';
import * as Yup from 'yup';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunctionWithoutPagination } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_PRO_KEY } from '../../Constants';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideFirstComponent } from '../../CommonComponent/JavascriptCommonFunctions';
// Localized entity name
const entityname = 'Quantimed Import'
/**
 * Component for Qunatimed Import step two for taking the planning unit details for the import
 */
export default class QunatimedImportStepTwo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            programPlanningUnits: [],
            qatPlanningList: [],
            loading: false,
            quantimedEl: "",
            programId: '',
            filename: '',
            procurementAgentPlanningUnitList: [],
            planningUnitListForMultiplier: []
        }
        this.loadTableData = this.loadTableData.bind(this);
        this.programPlanningUnitChanged = this.programPlanningUnitChanged.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkDuplicateCountry = this.checkDuplicateCountry.bind(this);
        this.loaded = this.loaded.bind(this);
        this.updatePlanningUnitNotFound = this.updatePlanningUnitNotFound.bind(this);
    }
    /**
     * Retrieves list of planning units
     */
    componentDidMount() {
        this.setState({
            loading: true
        })
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var planningunitTransaction = db1.transaction(['planningUnit'], 'readwrite');
            var planningunitOs = planningunitTransaction.objectStore('planningUnit');
            var planningunitRequest = planningunitOs.getAll();
            planningunitRequest.onerror = function (event) {
            };
            planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                this.setState({
                    planningUnitListForMultiplier: myResult,
                    loading: false
                }, () => {
                })
            }.bind(this);
        }.bind(this);
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded = function (instance, cell) {
        jExcelLoadedFunctionWithoutPagination(instance);
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[3].classList.add('AsteriskTheadtrTd');
        tr.children[5].title = `${i18n.t('static.quantimed.conversionFactor')} = 1 / ${i18n.t('static.unit.multiplier')}`
    }
    /**
     * Updates the planning unit not found by highlighting the corresponding cell and setting a comment.
     */
    updatePlanningUnitNotFound = function () {
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var col = ("C").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(2, y);
            if (value == "-2") {
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
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
    programPlanningUnitChanged = function (instance, cell, x, y, value) {
        var tableJson = this.el.getJson(null, false);
        var hasDuplicate = false;
        if (x == 2) {
            var col_C_1 = ("C").concat(parseInt(y) + 1);
            var value_C_1 = this.el.getValueFromCoords(2, y);
            for (var z = 0; z < tableJson.length; z++) {
                var col_C_2 = ("C").concat(parseInt(z) + 1);
                var value_C_2 = this.el.getValueFromCoords(2, z);
                if (col_C_1 !== col_C_2 && value_C_1 == value_C_2) {
                    hasDuplicate = true;
                }
            }
            var col = ("C").concat(parseInt(y) + 1);
            var cf = "";
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else if (value == "-2") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else if (value == "-1") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "pink");
                this.el.setComments(col, "");
            }
            else if (hasDuplicate) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.quantimed.duplicateQATPlanningUnit'));
            }
            else {
                var index = this.state.planningUnitListForMultiplier.findIndex(c => c.planningUnitId == value);
                if (index != -1) {
                    cf = parseFloat(1 / (this.state.planningUnitListForMultiplier[index].multiplier)).toFixed(4);
                }
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
            var col_D = ("D").concat(parseInt(y) + 1);
            var value_D = this.el.getValueFromCoords(3, y);
            if (value_D !== "" && value_D !== "-1" && value_D !== "-2") {
                for (var z = 0; z < tableJson.length; z++) {
                    var col_D_2 = ("D").concat(parseInt(z) + 1);
                    var col_C_3 = ("C").concat(parseInt(z) + 1);
                    var value_D_2 = this.el.getValueFromCoords(3, z);
                    if (col_D !== col_D_2 && value_D_2 !== "-1" && value_D_2 !== "-2" && value_D == value_D_2) {
                        this.el.setStyle(col_C_3, "background-color", "transparent");
                        this.el.setComments(col_C_3, "");
                        break;
                    }
                }
            }
            this.el.setValue(col_D, value);
            this.el.setValueFromCoords(4, y, cf, true);
        }
    }
    /**
     * Function to check validation of the jexcel table.
     * @returns {boolean} - True if validation passes, false otherwise.
     */
    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        var totalDoNotImport = 0;
        for (var y = 0; y < json.length; y++) {
            var col = ("C").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(2, y);
            if (value == "-1") {
                totalDoNotImport = totalDoNotImport + 1;
            }
        }
        for (var y = 0; y < json.length; y++) {
            var col = ("C").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(2, y);
            if (value == "") {
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else if (value == "-2") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setComments(col, "");
            }
        }
        if (totalDoNotImport == (json.length)) {
            alert(i18n.t("static.quantimed.mapAtLeastOnePlanningUnitValidationText"));
            valid = false;
        }
        return valid;
    }
    /**
     * Function to check for duplicate countries.
     * @returns Returns true if there are no duplicates, false otherwise.
     */
    checkDuplicateCountry = function () {
        var tableJson = this.el.getJson(null, false);
        let tempArray = tableJson;
        var hasDuplicate = false;
        tempArray.map(v => v[Object.keys(v)[2]]).sort().sort((a, b) => {
            if (a !== "" && b !== "")
                if ((a !== '-1' && b !== '-1') && (a !== '-2' && b !== '-2'))
                    if (a == b)
                        hasDuplicate = true
        })
        if (hasDuplicate) {
            alert(i18n.t('static.quantimed.duplicateQATPlanningUnitFound'));
            this.setState({
                changedFlag: 0,
            },
                () => {
                })
            return false;
        } else {
            return true;
        }
    }
    /**
     * Function to handle form submission and move to next step.
     */
    formSubmit = function () {
        if (this.checkDuplicateCountry() && this.checkValidation()) {
            this.setState({
                loading: true
            })
            var db1;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var planningunitTransaction = db1.transaction(['planningUnit'], 'readwrite');
                var planningunitOs = planningunitTransaction.objectStore('planningUnit');
                var planningunitRequest = planningunitOs.getAll();
                planningunitRequest.onerror = function (event) {
                };
                planningunitRequest.onsuccess = function (e) {
                    var myResult = [];
                    myResult = planningunitRequest.result;
                    var tableJson = this.el.getJson(null, false);
                    for (var i = 0; i < tableJson.length; i++) {
                        var map1 = new Map(Object.entries(tableJson[i]));
                        var value = map1.get("2");
                        this.props.items.importData.products[i].programPlanningUnitId = value;
                    }
                    for (var j = 0; j < this.props.items.importData.products.length; j++) {
                        var puid = this.props.items.importData.products[j].programPlanningUnitId;
                        if (puid != "-1") {
                            var index = myResult.findIndex(c => c.planningUnitId == puid);
                            if (index != -1) {
                                var mtp = (myResult[index]).multiplier;
                                if (mtp > 0) {
                                    this.props.items.importData.products[j].multiplier = parseFloat(1 / ((myResult[index]).multiplier)).toFixed(4);
                                } else {
                                    this.props.items.importData.products[j].multiplier = (myResult[index]).multiplier
                                }
                            }
                        }
                    }
                    for (var i = 0; i < this.props.items.importData.records.length; i++) {
                        for (var j = 0; j < this.props.items.importData.products.length; j++) {
                            if (this.props.items.importData.records[i].productId === this.props.items.importData.products[j].productId) {
                                this.props.items.importData.records[i].product = this.props.items.importData.products[j];
                            }
                        }
                    }
                    this.setState({
                        loading: false
                    })
                    this.props.finishedStepTwo();
                    this.props.triggerStepThree();
                }.bind(this);
            }.bind(this)
        }
    }
    /**
     * Function to build a jexcel table.
     * Constructs and initializes a jexcel table using the provided data and options.
     */
    loadTableData() {
        this.setState({
            loading: true
        })
        var value = this.props.items.program.programId;
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext'),
                loading: false,
                color: "#BA0C2F"
            })
            hideFirstComponent()
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var procurementAgentPlanningunitTransaction = db1.transaction(['procurementAgentPlanningUnit'], 'readwrite');
            var procurementAgentPlanningunitOs = procurementAgentPlanningunitTransaction.objectStore('procurementAgentPlanningUnit');
            var procurementAgentPlanningunitRequest = procurementAgentPlanningunitOs.getAll();
            procurementAgentPlanningunitRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext'),
                    loading: false,
                    color: "#BA0C2F"
                })
                hideFirstComponent()
            }.bind(this);
            procurementAgentPlanningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = procurementAgentPlanningunitRequest.result;
                this.setState({
                    procurementAgentPlanningUnitList: myResult
                })
                var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                var planningunitRequest = planningunitOs.getAll();
                var planningList = []
                planningunitRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext'),
                        loading: false,
                        color: "#BA0C2F"
                    })
                    hideFirstComponent()
                }.bind(this);
                planningunitRequest.onsuccess = function (e) {
                    var myResult = [];
                    myResult = planningunitRequest.result;
                    var programId = (value != "" && value != undefined ? value : 0).split("_")[0];
                    var proList = []
                    for (var i = 0; i < myResult.length; i++) {
                        if (myResult[i].program.id == parseInt(programId) && myResult[i].active == true) {
                            var productJson = {
                                label: getLabelText(myResult[i].planningUnit.label, this.state.lang),
                                value: myResult[i].planningUnit.id
                            }
                            proList.push(productJson);
                            planningList.push(myResult[i]);
                        }
                    }
                    this.setState({
                        programPlanningUnits: proList,
                        qatPlanningList: planningList
                    })
                    this.props.items.qatPlanningList = proList;
                    if (this.state.programId !== this.props.items.program.programId || this.state.filename !== this.props.items.program.filename) {
                        const { programPlanningUnits } = this.state;
                        let programPlanningUnitsArr = [];
                        var myVar = "";
                        if (programPlanningUnits.length > 0) {
                            var paJson = {
                                name: i18n.t("static.quantimed.doNotImport"),
                                id: -1,
                                active: true
                            }
                            var paJson_1 = {
                                name: i18n.t("static.quantimed.planningUnitNotFoundText"),
                                id: -2,
                                active: true
                            }
                            programPlanningUnitsArr[0] = paJson_1;
                            programPlanningUnitsArr[1] = paJson;
                            for (var i = 0; i < programPlanningUnits.length; i++) {
                                var paJson = {
                                    name: programPlanningUnits[i].label,
                                    id: parseInt(programPlanningUnits[i].value),
                                    active: true
                                }
                                programPlanningUnitsArr[i + 2] = paJson
                            }
                        }
                        this.el = jexcel(document.getElementById("paputableDiv"), '');
                        jexcel.destroy(document.getElementById("paputableDiv"), true);
                        var json = this.props.items.importData.products;
                        var data = [];
                        var products = [];
                        for (var i = 0; i < json.length; i++) {
                            var index_1 = this.state.procurementAgentPlanningUnitList.findIndex(c => ((c.skuCode).substring(0, 12)) == json[i].productId);
                            var selectedPlanningUnitId = "-2";
                            var conversionFactor = ""
                            if (index_1 != -1) {
                                selectedPlanningUnitId = this.state.procurementAgentPlanningUnitList[index_1].planningUnit.id;
                                var index_2 = this.state.programPlanningUnits.findIndex(c => c.value == selectedPlanningUnitId);
                                if (index_2 != -1) {
                                    selectedPlanningUnitId = this.state.programPlanningUnits[index_2].value;
                                    var index_3 = this.state.planningUnitListForMultiplier.findIndex(c => c.planningUnitId == selectedPlanningUnitId);
                                    if (index_3 != -1) {
                                        conversionFactor = parseFloat(1 / (this.state.planningUnitListForMultiplier[index_3].multiplier)).toFixed(4);
                                    } else {
                                        conversionFactor = "";
                                    }
                                } else {
                                    selectedPlanningUnitId = "-2";
                                    conversionFactor = "";
                                }
                            }
                            data = [];
                            data[0] = json[i].productId;
                            data[1] = json[i].productName;
                            data[2] = selectedPlanningUnitId;
                            data[3] = selectedPlanningUnitId;
                            data[4] = conversionFactor;
                            products[i] = data;
                        }
                        var options = {
                            data: products,
                            contextMenu: function () { return false; },
                            colWidths: [80, 120, 120, 0, 80],
                            columns: [
                                { type: 'text', title: i18n.t('static.quantimed.quantimedProductIdLabel'), readOnly: true },
                                { type: 'text', title: i18n.t('static.quantimed.quantimedPlanningUnitLabel'), readOnly: true },
                                { type: 'dropdown', source: programPlanningUnitsArr, title: i18n.t('static.supplyPlan.qatProduct'), autocomplete: true },
                                {
                                    type: 'hidden', title: 'Previous Program Planning Unit'
                                    // title: 'A',
                                    // type: 'text',
                                    // visible: false
                                },
                                { type: 'numeric', title: i18n.t('static.quantimed.conversionFactor'), mask: '#,##.00', decimal: '.', readOnly: true },
                            ],
                            pagination: false,
                            search: true,
                            columnSorting: false,
                            wordWrap: true,
                            paginationOptions: [],
                            allowInsertColumn: false,
                            allowManualInsertColumn: false,
                            onchange: this.programPlanningUnitChanged,
                            allowDeleteRow: false,
                            onload: this.loaded,
                            license: JEXCEL_PRO_KEY, allowRenameColumn: false,
                            filters: true,
                            editable: true,
                        };
                        myVar = jexcel(document.getElementById("paputableDiv"), options);
                        this.el = myVar;
                        this.setState({
                            programId: this.props.items.program.programId,
                            filename: this.props.items.program.filename
                        }, () => { this.updatePlanningUnitNotFound() })
                    }
                    this.setState({
                        loading: false
                    })
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }
    /**
     * Renders the quantimed import step two screen.
     * @returns {JSX.Element} - Quantimed import step two screen.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.state.color} id="div1">{i18n.t(this.state.message, { entityname }) || this.state.supplyPlanError}</h5>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <CardBody className="pl-0 pr-0 pt-lg-0">
                        <div className="consumptionDataEntryTable">
                            <div style={{width: '100%'}} id="paputableDiv" >
                            </div>
                        </div>
                        <br></br>
                        <FormGroup>
                            <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" >{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>
                            <Button color="info" size="md" className="float-right mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.props.previousToStepOne} > <i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
                            &nbsp;
                        </FormGroup>
                    </CardBody>
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
        );
    }
}