import jexcel from 'jspreadsheet';
import React, { Component } from 'react';
import { Prompt } from 'react-router';
import {
    Button,
    FormGroup
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, loadedForNonEditableTables } from '../../CommonComponent/JExcelCommonFunctions.js';
import { contrast } from "../../CommonComponent/JavascriptCommonFunctions";
import getLabelText from '../../CommonComponent/getLabelText';
import { JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
/**
 * Component for Import from QAT supply plan step two for the import
 */
export default class StepTwoImportMapPlanningUnits extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lang: localStorage.getItem('lang'),
            selSource: [],
            programRegionList: [],
            forecastProgramRegionList: [],
            selSource2: [],
            isChanged1: false
        }
        this.changed = this.changed.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
    }
    /**
     * This function is triggered when this component is about to unmount
     */
    componentWillUnmount() {
        clearTimeout(this.timeout);
        window.onbeforeunload = null;
    }
    /**
     * This function is trigged when this component is updated and is being used to display the warning for leaving unsaved changes
     */
    componentDidUpdate = () => {
        if (this.state.isChanged1 == true) {
            window.onbeforeunload = () => true
        } else {
            window.onbeforeunload = undefined
        }
    }
    /**
     * Builds the json for region data
     */
    formSubmit = function () {
        var validation = this.checkValidation();
        if (validation == true) {
            var tableJson = this.el.getJson(null, false);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                let json = {
                    supplyPlanRegionId: parseInt(map1.get("0")),
                    isRegionInForecastProgram: parseInt(map1.get("2")),
                    importRegion: parseInt(map1.get("3")),
                }
                changedpapuList.push(json);
            }
            this.setState({
                stepTwoData: changedpapuList,
                selSource2: tableJson
            }, () => {
                this.props.finishedStepTwo();
            })
            this.props.updateStepOneData("stepTwoData", changedpapuList);
            this.props.updateStepOneData("selSource2", tableJson);
        } else {
        }
    }
    /**
     * Function to check validation of the jexcel table.
     * @returns {boolean} - True if validation passes, false otherwise.
     */
    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var budgetRegx = /^\S+(?: \S+)*$/;
            var col = ("D").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(3, y);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                if (!(budgetRegx.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.spacetext'));
                    valid = false;
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
    changed = function (instance, cell, x, y, value) {
        this.props.removeMessageText && this.props.removeMessageText();
        if (x == 3) {
            var budgetRegx = /^\S+(?: \S+)*$/;
            var col = ("D").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (!(budgetRegx.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.spacetext'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
    }
    /**
     * Filters and sets data based on the selected program and forecast program.
     * Retrieves program and dataset information from component props.
     * Sets the program region list, forecast program region list, and source data.
     * Updates the component's state accordingly and triggers the building of the Jexcel component.
     */
    filterData() {
        let programId = this.props.items.programId
        let forecastProgramId = this.props.items.forecastProgramId
        let programs = this.props.items.programs
        let datasetList = this.props.items.datasetList
        let forecastProgramVersionId = this.props.items.forecastProgramVersionId
        let selectedProgramObj = programs.filter(c => c.id == programId)[0];
        let selectedForecastProgramObj = datasetList.filter(c => c.programId == forecastProgramId && c.versionId == forecastProgramVersionId)[0];
        this.setState({
            programRegionList: selectedProgramObj.regionList,
            forecastProgramRegionList: selectedForecastProgramObj.regionList,
            selSource: selectedProgramObj.regionList,
        },
            () => {
                this.buildJexcel();
            })
    }
    /**
     * Function to build a jexcel table.
     * Constructs and initializes a jexcel table using the provided data and options.
     */
    buildJexcel() {
        var papuList = this.state.selSource;
        var data = [];
        var papuDataArr = [];
        var count = 0;
        if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {
                data = [];
                data[0] = papuList[j].id
                data[1] = getLabelText(papuList[j].label, this.state.lang)
                let match = this.state.forecastProgramRegionList.filter(c => c.regionId == papuList[j].id);
                if (match.length > 0) {
                    data[2] = 1
                    data[3] = 1
                } else {
                    data[2] = 0
                    data[3] = 3
                }
                papuDataArr[count] = data;
                count++;
            }
        }
        this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
        jexcel.destroy(document.getElementById("mapPlanningUnit"), true);
        this.el = jexcel(document.getElementById("mapRegion"), '');
        jexcel.destroy(document.getElementById("mapRegion"), true);
        this.el = jexcel(document.getElementById("mapImport"), '');
        jexcel.destroy(document.getElementById("mapImport"), true);
        var papuList11 = this.state.selSource2;
        var data;
        if (papuList11 != "") {
            data = papuList11
        } else {
            data = papuDataArr
        }
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [100, 100, 100, 100, 100],
            columns: [
                {
                    title: 'id',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: i18n.t('static.importFromQATSupplyPlan.supplyPlanRegion'),
                    type: 'text',
                    readOnly: true,
                    textEditor: true,
                },
                {
                    title: i18n.t('static.importFromQATSupplyPlan.isRegionInForecastProgram'),
                    readOnly: true,
                    type: 'dropdown',
                    source: [
                        { id: 0, name: 'No' },
                        { id: 1, name: 'Yes' },
                    ]
                },
                {
                    title: i18n.t('static.quantimed.importData'),
                    type: 'dropdown',
                    source: [
                        { id: 1, name: i18n.t('static.importFromQATSupplyPlan.Import') },
                        { id: 2, name: i18n.t('static.quantimed.doNotImport') },
                        { id: 3, name: i18n.t('static.importFromQATSupplyPlan.noRegionToImportInto') },
                    ],
                    filter: this.filterImport
                },
            ],
            updateTable: function (el, cell, x, y, source, value, id) {
                if (y != null) {
                    var elInstance = el;
                    elInstance.setStyle(`B${parseInt(y) + 1}`, 'text-align', 'left');
                    var rowData = elInstance.getRowData(y);
                    var importRegion = rowData[3];
                    if (importRegion == 2) {
                        elInstance.setStyle(`D${parseInt(y) + 1}`, 'background-color', 'transparent');
                        elInstance.setStyle(`D${parseInt(y) + 1}`, 'background-color', '#f48282');
                        let textColor = contrast('#f48282');
                        elInstance.setStyle(`D${parseInt(y) + 1}`, 'color', textColor);
                    } else {
                    }
                    var isRegionInForecast = rowData[2];
                    if (isRegionInForecast == false) {
                        var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                    }
                }
            }.bind(this),
            pagination: 5000000,
            filters: true,
            search: true,
            columnSorting: true,
            wordWrap: true,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            onchange: this.changed,
            copyCompatibility: true,
            allowManualInsertRow: false,
            parseFormulas: true,
            onload: loadedForNonEditableTables,
            editable: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this)
        };
        this.el = jexcel(document.getElementById("mapRegion"), options);
        this.setState({
            loading: false,
            isChanged1: true
        })
        this.props.updateStepOneData("loading", false);
    }
    /**
     * Build options for import and do not import region dropdown
     */
    filterImport = function (instance, cell, c, r, source) {
        var mylist = [
            { id: 1, name: i18n.t('static.importFromQATSupplyPlan.Import') },
            { id: 2, name: i18n.t('static.quantimed.doNotImport') },
        ];
        return mylist;
    }.bind(this)
    /**
     * Renders the import from QAT supply plan step two screen.
     * @returns {JSX.Element} - Import from QAT supply plan step two screen.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        return (
            <>
                <Prompt
                    when={this.state.isChanged1 == true}
                    message={i18n.t("static.dataentry.confirmmsg")}
                />
                <AuthenticationServiceComponent history={this.props.history} />
                <h4 className="red">{this.props.message}</h4>
                <div className="consumptionDataEntryTable" style={{ display: this.props.items.loading ? "none" : "block" }} >
                    <div id="mapRegion" style={{width:'100%'}}>
                    </div>
                </div>
                <div style={{ display: this.props.items.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>
                            <div class="spinner-border blue ml-4" role="status">
                            </div>
                        </div>
                    </div>
                </div>
                <FormGroup>
                    <Button color="info" size="md" className="float-right mr-1" type="submit" onClick={() => this.formSubmit()}>{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>
                    &nbsp;
                    <Button color="info" size="md" className="float-right mr-1" type="button" onClick={this.props.previousToStepOne} > <i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
                    &nbsp;
                </FormGroup>
            </>
        );
    }
}