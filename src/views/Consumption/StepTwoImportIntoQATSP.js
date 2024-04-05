import jexcel from 'jspreadsheet';
import React, { Component } from 'react';
import {
    Button,
    FormGroup,
    Modal,
    ModalBody,
    ModalHeader
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import listImportIntoQATSupplyPlanEn from '../../../src/ShowGuidanceFiles/listImportIntoQATSupplyPlanEn.html';
import listImportIntoQATSupplyPlanFr from '../../../src/ShowGuidanceFiles/listImportIntoQATSupplyPlanFr.html';
import listImportIntoQATSupplyPlanPr from '../../../src/ShowGuidanceFiles/listImportIntoQATSupplyPlanPr.html';
import listImportIntoQATSupplyPlanSp from '../../../src/ShowGuidanceFiles/listImportIntoQATSupplyPlanSp.html';
import { checkValidation, jExcelLoadedFunction, loadedForNonEditableTables } from '../../CommonComponent/JExcelCommonFunctions.js';
import { contrast } from "../../CommonComponent/JavascriptCommonFunctions";
import getLabelText from '../../CommonComponent/getLabelText';
import { JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
/**
 * Component for Import into QAT supply plan step two for the import
 */
export default class StepTwoImportMapPlanningUnits extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lang: localStorage.getItem('lang'),
            selSource: [],
            supplyPlanRegionList: [],
            forecastRegionList: [],
            supplyPlanRegionListJExcel: [],
            selSource2: [],
        }
        this.changed = this.changed.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.filterData = this.filterData.bind(this);
    }
    /**
     * Toggles the visibility of the guidance.
     */
    toggleShowGuidance() {
        this.setState({
            showGuidance: !this.state.showGuidance
        })
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
                if (parseInt(map1.get("3")) != -1) {
                    let json = {
                        forecastRegionId: parseInt(map1.get("0")),
                        forecastPercentage: parseInt(map1.get("2")),
                        supplyPlanRegionId: parseInt(map1.get("3")),
                        supplyPlanRegionName: this.state.supplyPlanRegionListJExcel.filter(c => c.id == parseInt(map1.get("3")))[0].name
                    }
                    changedpapuList.push(json);
                }
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
        valid = checkValidation(this.el);
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
            let supplyPlanRegionId = this.el.getValueFromCoords(3, y);
            if (supplyPlanRegionId != -1 && supplyPlanRegionId != null && supplyPlanRegionId != '') {
            } else {
                this.el.setValueFromCoords(2, y, '', true);
            }
        }
        else if (x == 2) {
            let supplyPlanRegionId = this.el.getValueFromCoords(3, y);
            var col = ("C").concat(parseInt(y) + 1);
            value = this.el.getValue(`C${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = /^\d{1,6}(\.\d{1,6})?$/;
            if (supplyPlanRegionId != -1) {
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                } else {
                    if (!(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.usagePeriod.conversionTOFUTest'));
                    } else {
                        if (isNaN(Number.parseInt(value)) || value <= 0) {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setStyle(col, "background-color", "yellow");
                            this.el.setComments(col, i18n.t('static.program.validvaluetext'));
                        } else {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setComments(col, "");
                        }
                    }
                }
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        if (!this.state.isChanged1) {
            this.setState({
                isChanged1: true,
            });
        }
    }
    /**
     * Filters region data and prepares it for display.
     * Retrieves region list information from component props.
     * Sorts the region list alphabetically by name.
     * Prepends a "Do Not Import" option to the region list.
     * Updates the component's state with the filtered region lists and triggers the building of the Jexcel component.
     */
    filterData() {
        let regionList = this.props.items.regionList
        let programRegionList = []
        let forecastProgramRegionList = []
        for (var j = 0; j < regionList.length; j++) {
            forecastProgramRegionList = regionList[j].forecastRegionList
            programRegionList = regionList[j].supplyPlanRegionList
        }
        let tempList = [];
        if (programRegionList.length > 0) {
            for (var i = 0; i < programRegionList.length; i++) {
                var paJson = {
                    name: getLabelText(programRegionList[i].label, this.state.lang),
                    id: parseInt(programRegionList[i].id),
                }
                tempList[i] = paJson
            }
        }
        tempList = tempList.sort(function (a, b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        })
        tempList.unshift({
            name: i18n.t('static.quantimed.doNotImport'),
            id: -1,
            multiplier: 1,
            active: true,
            forecastingUnit: []
        });
        this.setState({
            programRegionList: programRegionList,
            forecastProgramRegionList: forecastProgramRegionList,
            supplyPlanRegionListJExcel: tempList
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
        var papuList = this.state.forecastProgramRegionList;
        var data = [];
        var papuDataArr = [];
        var count = 0;
        if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {
                data = [];
                data[0] = papuList[j].regionId
                data[1] = getLabelText(papuList[j].label, this.state.lang)
                data[2] = 100
                let match = null;
                match = this.state.programRegionList.filter(c => c.id == papuList[j].regionId)[0];
                if (match != null) {
                    data[3] = getLabelText(match.label, this.state.lang)
                } else {
                    data[3] = ""
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
                    title: "Forecast Region(s) id",
                    type: 'hidden',
                    readOnly: true,
                },
                {
                    title: i18n.t('static.QATForecastImport.ForecastRegion'),
                    type: 'text',
                    readOnly: true,
                    textEditor: true,
                },
                {
                    title: i18n.t('static.QATForecastImport.perOfForecast'),
                    type: 'numeric',
                    decimal: '.',
                    mask: '#,##.00',
                    textEditor: true,
                },
                {
                    title: i18n.t('static.QATForecastImport.SPRegion'),
                    type: 'autocomplete',
                    source: this.state.supplyPlanRegionListJExcel,
                    required: true,
                    regex: {
                        ex: /^\S+(?: \S+)*$/,
                        text: i18n.t('static.message.spacetext')
                    }
                }
            ],
            updateTable: function (el, cell, x, y, source, value, id) {
                if (y != null) {
                    var elInstance = el;
                    var rowData = elInstance.getRowData(y);
                    var doNotImport = rowData[3];
                    if (doNotImport == -1) {
                        elInstance.setStyle(`D${parseInt(y) + 1}`, 'background-color', 'transparent');
                        elInstance.setStyle(`D${parseInt(y) + 1}`, 'background-color', '#f48282');
                        let textColor = contrast('#f48282');
                        elInstance.setStyle(`D${parseInt(y) + 1}`, 'color', textColor);
                        var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                    } else {
                        var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');
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
            loading: false
        })
        this.props.updateStepOneData("loading", false);
    }
    /**
     * Renders the import into QAT supply plan step two screen.
     * @returns {JSX.Element} - Import into QAT supply plan step two screen.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        return (
            <>
                <AuthenticationServiceComponent history={this.props.history} />
                <h4 className="red">{this.props.message}</h4>
                <div className="Card-header-addicon pb-0">
                    <div className="card-header-actions" style={{ marginTop: '-25px' }}>
                        <a className="card-header-action">
                            <span style={{ cursor: 'pointer' }} onClick={() => { this.toggleShowGuidance() }}><small className="supplyplanformulas">{i18n.t('static.common.showGuidance')}</small></span>
                        </a>
                    </div>
                </div>
                <Modal isOpen={this.state.showGuidance}
                    className={'modal-xl ' + this.props.className} >
                    <ModalHeader toggle={() => this.toggleShowGuidance()} className="ModalHead modal-info-Headher">
                        <strong className="TextWhite">{i18n.t('static.common.showGuidance')}</strong>
                    </ModalHeader>
                    <div>
                        <ModalBody>
                            <div dangerouslySetInnerHTML={{
                                __html: localStorage.getItem('lang') == 'en' ?
                                    listImportIntoQATSupplyPlanEn :
                                    localStorage.getItem('lang') == 'fr' ?
                                        listImportIntoQATSupplyPlanFr :
                                        localStorage.getItem('lang') == 'sp' ?
                                            listImportIntoQATSupplyPlanSp :
                                            listImportIntoQATSupplyPlanPr
                            }} />
                        </ModalBody>
                    </div>
                </Modal>
                <div className="consumptionDataEntryTable">
                    <div id="mapRegion" className="TableWidth100" style={{ display: this.props.items.loading ? "none" : "block" }}>
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