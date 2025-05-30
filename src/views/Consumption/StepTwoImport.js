import jexcel from 'jspreadsheet';
import { onOpenFilter } from "../../CommonComponent/JExcelCommonFunctions.js";
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
import { JEXCEL_DECIMAL_NO_REGEX, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
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
            isChanged1: false,
            selectedSupplyPlanPrograms: [],
            forecastPgmRegionListDD: []
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
                let isProgramHeader = parseInt(map1.get("4"));
                let isDoNotImport = parseInt(map1.get("3"));//forecast region column 
                if (isProgramHeader == 1 || isDoNotImport == -1) {//to skip these rows
                    continue;
                }

                let supplyPlanProgramId = parseInt(map1.get("0"));
                let supplyPlanRegionId = parseInt(map1.get("5"));
                //filter selectedSupplyPlanPrograms to fetch region label
                let selectedSpProgram = this.state.selectedSupplyPlanPrograms.filter(c => c.programId == supplyPlanProgramId)[0];
                let regionObj = selectedSpProgram.regionList.filter(c => c.regionId == supplyPlanRegionId)[0];
                let spRegionLabel = getLabelText(regionObj.label, this.state.lang);

                let forecastRegionId = parseInt(map1.get("3"));
                let forecastRegionLabelTxt= this.state.forecastPgmRegionListDD.filter(c => c.id == forecastRegionId)[0].name;

                let json = {
                    supplyPlanProgramId: supplyPlanProgramId,
                    percentOfSupplyPlan: map1.get("2"),
                    forecastRegionId: forecastRegionId,
                    forecastRegionLabelTxt: forecastRegionLabelTxt,
                    supplyPlanRegionId: supplyPlanRegionId,
                    supplyPlanRegionLabelTxt: spRegionLabel
                }
                
                //old json
                // let json = {
                //     supplyPlanRegionId: parseInt(map1.get("0")),
                //     isRegionInForecastProgram: parseInt(map1.get("2")),
                //     importRegion: parseInt(map1.get("3")),
                // }
                changedpapuList.push(json);
            }
            // console.log('stepTwoData: '+JSON.stringify(changedpapuList));
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
            var value = this.el.getValueFromCoords(4, y);//for sp program dropdown
            if(value == 1){
                continue;
            }

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

            var col = ("C").concat(parseInt(y) + 1);
            // var value = this.el.getValue(`C${parseInt(y) + 1}`, true).toString();
            var value = this.el.getValueFromCoords(2, y);
            var reg = JEXCEL_DECIMAL_NO_REGEX;
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else if(isNaN(parseInt(value)) || !(reg.test(value))) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.common.positiveIntegerWithLength'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
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
        if(x == 2) {//% of SP
            var col = ("C").concat(parseInt(y) + 1);
            // var value = this.el.getValue(`C${parseInt(y) + 1}`, true).toString();
            var value = this.el.getValueFromCoords(2, y);
            var reg = JEXCEL_DECIMAL_NO_REGEX;
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else if(isNaN(parseInt(value)) || !(reg.test(value))) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.common.positiveIntegerWithLength'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }

        if (x == 3) {
            var budgetRegx = /^\S+(?: \S+)*$/;
            var col = ("D").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                /*if (!(budgetRegx.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.spacetext'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }*/
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
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
        let programId = this.props.items.programId;
        let programIdArr = this.props.items.selectedSpProgramIdArr;
        let forecastProgramId = this.props.items.forecastProgramId
        let programs = this.props.items.programs
        let datasetList = this.props.items.datasetList
        let forecastProgramVersionId = this.props.items.forecastProgramVersionId

        let selectedPrograms = [];
        for(var i=0; i < programIdArr.length; i++) {
            let selectedProgramObj = programs.filter(c => c.programId == programIdArr[i])[0];
            selectedPrograms.push(selectedProgramObj);
        }
        
        let selectedForecastProgramObj = datasetList.filter(c => c.programId == forecastProgramId && c.versionId == forecastProgramVersionId)[0];
        let forecastProgramRegionList = selectedForecastProgramObj.regionList;
        //create regionList for dropdown
        let forecastPgmRegionListDD = [];
        for (var i = 0; i < forecastProgramRegionList.length; i++) {
            var paJson = {
                name: getLabelText(forecastProgramRegionList[i].label, this.state.lang),
                id: parseInt(forecastProgramRegionList[i].regionId),
            }
            forecastPgmRegionListDD[i] = paJson;
        }
        forecastPgmRegionListDD.unshift({
            name: i18n.t('static.quantimed.doNotImport'),
            id: -1            
        });

        this.setState({
            // programRegionList: selectedProgramObj.regionList, //currently not in use
            forecastProgramRegionList: forecastProgramRegionList,
            // selSource: selectedProgramObj.regionList,
            selectedSupplyPlanPrograms: selectedPrograms,
            selectedForecastProgram: selectedForecastProgramObj,
            forecastPgmRegionListDD: forecastPgmRegionListDD
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
        // var papuList = this.state.selSource;
        var papuList = this.state.selectedSupplyPlanPrograms;
        var data = [];
        var papuDataArr = [];
        var count = 0;
        if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {                
                data = [];
                data[0] = papuList[j].programId;
                data[1] = papuList[j].programCode;
                data[2] = '';
                data[3] = '';
                data[4] = 1;//is pgm code header
                data[5] = 0;//supplyPlanRegionId
                papuDataArr[count] = data; //to add program code heading
                count++;
                var regionList = papuList[j].regionList;
                for(var k = 0; k < regionList.length; k++) {
                    data = [];
                    data[0] = papuList[j].programId
                    data[1] = getLabelText(regionList[k].label, this.state.lang)
                    data[2] = '';
                    let match = this.state.forecastProgramRegionList.filter(c => c.regionId == regionList[k].regionId);
                    if (match.length > 0) {                        
                        data[3] = match[0].regionId;
                    } else {
                        // data[2] = 0
                        data[3] = '';
                    }
                    data[4] = 0;
                    data[5] = regionList[k].regionId;
                    papuDataArr[count] = data;
                    count++;

                }
            }
        }
        this.el = jexcel(document.getElementById("spProgramVersionTable"), '');
        jexcel.destroy(document.getElementById("spProgramVersionTable"), true);
        this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
        jexcel.destroy(document.getElementById("mapPlanningUnit"), true);
        this.el = jexcel(document.getElementById("mapRegion"), '');
        jexcel.destroy(document.getElementById("mapRegion"), true);
        this.el = jexcel(document.getElementById("mapImport"), '');
        jexcel.destroy(document.getElementById("mapImport"), true);
        var papuList11 = this.state.selSource2;
        // console.log('step2Data selSource2 len: ',papuList11.length);
        // console.log('s2 spProgramVersionChanged: ',this.props.items.spProgramVersionChanged);
        var data;
        if (this.props.items.spProgramVersionChanged == true) {
            //generate fresh table
            data = papuDataArr;
            
        } else if(papuList11.length > 0 && this.props.items.spProgramVersionChanged == false) {
            //render selSource2 from state
            data = papuList11;
        }

        // if (papuList11 != "") {
        //     data = papuList11
        // } else {
        //     data = papuDataArr
        // }
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
                    title: i18n.t('static.import.percentOfSupplyPlan'),
                    type: 'numeric',
                    textEditor: true,
                    // mask: '#,##.00', decimal: '.', disabledMaskOnEdition: false
                },
                {
                    title: i18n.t('static.import.forecastRegionFor') + ' ' + this.state.selectedForecastProgram.programCode,
                    type: 'dropdown',
                    // source: [
                    //     { id: 1, name: i18n.t('static.importFromQATSupplyPlan.Import') },
                    //     { id: 2, name: i18n.t('static.quantimed.doNotImport') },
                    //     { id: 3, name: i18n.t('static.importFromQATSupplyPlan.noRegionToImportInto') },
                    // ],
                    source: this.state.forecastPgmRegionListDD,
                    filter: this.forecastPgmRegionListFilter
                },
                {
                    title: 'isProgramCodeHeader',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: 'supplyPlanRegionId',
                    type: 'hidden',
                    readOnly: true
                },
            ],
            updateTable: function (el, cell, x, y, source, value, id) {
                if (y != null) {
                    var colArr = ['A', 'B', 'C', 'D', 'E'];
                    var elInstance = el;
                    elInstance.setStyle(`B${parseInt(y) + 1}`, 'text-align', 'left');
                    var rowData = elInstance.getRowData(y);

                    //apply dark grey colour to SP program code row
                    if (rowData[4] == 1) {
                        for (var col = 0; col < colArr.length; col++) {
                            elInstance.getCell((colArr[col]).concat(parseInt(y) + 1)).classList.add('regionBold');
                        }

                        //make % of supply plan readonly
                        var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');

                        var cell2 = elInstance.getCell(`D${parseInt(y) + 1}`)
                        cell2.classList.add('readonly');
                    }

                    //old code below
                    // for do not import option to heighllight as red color
                    var importRegion = rowData[3];
                    if (importRegion == -1) {
                        elInstance.setStyle(`D${parseInt(y) + 1}`, 'background-color', 'transparent');
                        elInstance.setStyle(`D${parseInt(y) + 1}`, 'background-color', '#f48282');
                        let textColor = contrast('#f48282');
                        elInstance.setStyle(`D${parseInt(y) + 1}`, 'color', textColor);
                    } else {
                    }
                    // var isRegionInForecast = rowData[2];
                    // if (isRegionInForecast == false) {
                    //     var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
                    //     cell1.classList.add('readonly');
                    // }
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
            onload: this.loaded,
            editable: true,
            license: JEXCEL_PRO_KEY, onopenfilter:onOpenFilter, allowRenameColumn: false,
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
        var validation = this.checkValidation();//to heighlight mandatory fields
    }

    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance - This is the DOM Element where sheet is created
     * @param {*} cell - This is the object of the DOM element
     * @param {*} x - Row Number
     * @param {*} y - Column Number
     * @param {*} value - Cell Value 
     */
    loaded = function (instance, cell, x, y, value) {
        loadedForNonEditableTables(instance, cell);
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[3].classList.add('InfoTr');
        tr.children[3].title = i18n.t('static.tooltip.percentOfSupplyPlanInfo');
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
     * Build options for forecast program region dropdown
     */
    forecastPgmRegionListFilter = function (instance, cell, c, r, source) {
        return this.state.forecastPgmRegionListDD;
    }.bind(this);

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
                <div className="consumptionDataEntryTable datdEntryRow" style={{ display: this.props.items.loading ? "none" : "block" }} >
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