import React, { Component } from 'react';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n';
import csvicon from '../../assets/img/csv.png';
import {
    Badge,
    Button,
    ButtonDropdown,
    ButtonGroup,
    ButtonToolbar,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    CardTitle,
    Col,
    Widgets,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Progress,
    Pagination,
    PaginationItem,
    PaginationLink,
    Row,
    CardColumns,
    Table, FormGroup, Input, InputGroup, InputGroupAddon, Label, Form
} from 'reactstrap';
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js';
import ProgramService from '../../api/ProgramService';
import getLabelText from '../../CommonComponent/getLabelText';
import { contrast } from "../../CommonComponent/JavascriptCommonFunctions";
import { jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionWithoutPagination } from '../../CommonComponent/JExcelCommonFunctions.js'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { JEXCEL_INTEGER_REGEX, JEXCEL_DECIMAL_LEAD_TIME, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_PRO_KEY, MONTHS_IN_FUTURE_FOR_AMC, MONTHS_IN_PAST_FOR_AMC, REPORT_DATEPICKER_START_MONTH, REPORT_DATEPICKER_END_MONTH, JEXCEL_PAGINATION_OPTION, JEXCEL_MONTH_PICKER_FORMAT } from '../../Constants.js';
import moment from "moment";


export default class StepThreeImportMapPlanningUnits extends Component {
    constructor(props) {
        super(props);

        this.state = {
            lang: localStorage.getItem('lang'),
            loading: false,
            selSource: [],
            actualConsumptionData: [],
            stepOneData: this.props.items.stepOneData,
            datasetList: this.props.items.datasetList,
            forecastProgramVersionId: this.props.items.forecastProgramVersionId,
            forecastProgramId: this.props.items.forecastProgramId,
            startDate: this.props.items.startDate,
            stopDate: this.props.items.stopDate,

        }
        this.changed = this.changed.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.oneditionend = this.oneditionend.bind(this);

    }



    checkValidation() {

    }


    changed = function (instance, cell, x, y, value) {
        this.props.removeMessageText && this.props.removeMessageText();
    }

    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        var rowData = elInstance.getRowData(y);

    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionWithoutPagination(instance);
        var asterisk = document.getElementsByClassName("resizable")[0];
        var tr = asterisk.firstChild;
        // tr.children[1].classList.add('AsteriskTheadtrTd');
        // tr.children[2].classList.add('AsteriskTheadtrTd');

        // var elInstance = instance.jexcel;
        // var json = elInstance.getJson();

        // var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N']
        // for (var j = 0; j < json.length; j++) {


        //     var rowData = elInstance.getRowData(j);
        //     // console.log("elInstance---->", elInstance);

        //     var id = rowData[0];

        //     if (id == 1 || id == 2 || id == 3) {
        //         for (var i = 0; i < colArr.length; i++) {
        //             elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', 'transparent');
        //             elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', '#f48282');
        //             let textColor = contrast('#f48282');
        //             elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'color', textColor);
        //         }
        //     } else {
        //         for (var i = 0; i < colArr.length; i++) {
        //             elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', 'transparent');
        //         }
        //     }
        // }
    }

    componentDidMount() {

    }

    filterData() {
        // let tempList = [];
        // tempList.push({ id: 1, v1: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 3000 Pieces [4182]', v2: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 4320 Pieces [6357]', v3: 'National', v4: 'Jan-21', v5: '0.694444', v6: '4250', v7: '2951.39', v8: '2951.39', v9: true });
        // tempList.push({ id: 2, v1: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 3000 Pieces [4182]', v2: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 4320 Pieces [6357]', v3: 'National', v4: 'Feb-21', v5: '0.694444', v6: '4000', v7: '2777.78', v8: '3000.00', v9: true });
        // tempList.push({ id: 3, v1: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 3000 Pieces [4182]', v2: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 4320 Pieces [6357]', v3: 'National', v4: 'Mar-21', v5: '0.694444', v6: '3850', v7: '2673.61', v8: '3100.00', v9: true });
        // tempList.push({ id: 4, v1: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 3000 Pieces [4182]', v2: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 4320 Pieces [6357]', v3: 'National', v4: 'Apr-21', v5: '0.694444', v6: '4200', v7: '2916.67', v8: '', v9: true });
        // tempList.push({ id: 5, v1: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 3000 Pieces [4182]', v2: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 4320 Pieces [6357]', v3: 'National', v4: 'May-21', v5: '0.694444', v6: '4530', v7: '3145.83', v8: '', v9: true });
        // tempList.push({ id: 6, v1: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 3000 Pieces [4182]', v2: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 4320 Pieces [6357]', v3: 'National', v4: 'Jun-21', v5: '0.694444', v6: '4250', v7: '2951.39', v8: '', v9: true });
        // tempList.push({ id: 7, v1: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 3000 Pieces [4182]', v2: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 4320 Pieces [6357]', v3: 'National', v4: 'Jul-21', v5: '0.694444', v6: '4100', v7: '2847.22', v8: '', v9: true });
        // tempList.push({ id: 8, v1: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 3000 Pieces [4182]', v2: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 4320 Pieces [6357]', v3: 'National', v4: 'Aug-21', v5: '0.694444', v6: '3900', v7: '2708.33', v8: '', v9: true });

        // this.setState({
        //     selSource: tempList,
        //     loading: true
        // },
        //     () => {
        //         this.buildJexcel();
        //     })

        let forecastPlanningUnitList = this.props.items.stepOneData.filter(c => c.forecastPlanningUnitId != -1);
        let supplyPlanPlanningUnitId = forecastPlanningUnitList.map(ele => ele.supplyPlanPlanningUnitId);

        let regionList = this.props.items.stepTwoData.filter(c => c.isRegionInForecastProgram == 1 && c.importRegion == 1);
        let regionIds = regionList.map(ele => ele.supplyPlanRegionId);

        let ActualConsumptionDataInput = { "programId": 2442, "versionId": 1, "planningUnitIds": ["1074", "1082", "2802"], "startDate": "2018-01-01", "stopDate": "2021-12-01", "regionIds": ["70", "73", "74"] }

        // let ActualConsumptionDataInput = {
        //     programId: this.props.items.programId,
        //     versionId: this.props.items.versionId,
        //     planningUnitIds: supplyPlanPlanningUnitId,
        //     startDate: this.props.items.startDate,
        //     stopDate: this.props.items.stopDate,
        //     regionIds: regionIds
        // }

        console.log("ActualConsumptionDataInput-------------->", ActualConsumptionDataInput);


        ProgramService.getActualConsumptionData(ActualConsumptionDataInput)
            .then(response => {
                if (response.status == 200) {
                    console.log("getActualConsumptionData------>", response.data);
                    this.setState({
                        actualConsumptionData: response.data,
                        selSource: response.data
                    }, () => {
                        this.buildJexcel();
                    })
                } else {
                    this.setState({
                        actualConsumptionData: []
                    });
                }
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
                            loading: false, color: 'red'
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
                                    loading: false, color: 'red'
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false, color: 'red'
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false, color: 'red'
                                });
                                break;
                        }
                    }
                }
            );


    }

    buildJexcel() {
        var papuList = this.state.selSource;
        var data = [];
        var papuDataArr = [];

        var count = 0;
        if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {

                let stepOneSelectedObject = this.state.stepOneData.filter(c => c.supplyPlanPlanningUnitId == papuList[j].planningUnit.id)[0];
                let selectedForecastProgram = this.state.datasetList.filter(c => c.programId == this.state.forecastProgramId && c.versionId == this.state.forecastProgramVersionId)[0];

                let match = selectedForecastProgram.consumptionList.filter(c => new Date(c.month).getTime() == new Date(papuList[j].month).getTime() && c.region.id == papuList[j].region.id && c.consumptionUnit.planningUnit.id == stepOneSelectedObject.forecastPlanningUnitId)

                data = [];
                data[0] = papuList[j].planningUnit.id
                data[1] = stepOneSelectedObject.forecastPlanningUnitId
                data[2] = getLabelText(papuList[j].region.label, this.state.lang)
                data[3] = papuList[j].month
                data[4] = stepOneSelectedObject.multiplier
                data[5] = papuList[j].actualConsumption
                data[6] = stepOneSelectedObject.multiplier * papuList[j].actualConsumption
                data[7] = ''
                data[8] = true
                data[9] = (match.length > 0 ? 1 : 0)

                papuDataArr[count] = data;
                count++;
            }
        }

        // if (papuDataArr.length == 0) {
        //     data = [];
        //     data[0] = 0;
        //     data[1] = "";
        //     data[2] = true
        //     data[3] = "";
        //     data[4] = "";
        //     data[5] = 1;
        //     data[6] = 1;
        //     papuDataArr[0] = data;
        // }

        this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
        this.el.destroy();

        this.el = jexcel(document.getElementById("mapRegion"), '');
        this.el.destroy();

        this.el = jexcel(document.getElementById("mapImport"), '');
        this.el.destroy();

        var json = [];
        var data = papuDataArr;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
            columns: [

                {
                    title: 'Supply plan planning unit',
                    type: 'dropdown',
                    source: this.props.items.planningUnitListJexcel,
                },
                {
                    title: 'Forecasting planning Unit',
                    type: 'dropdown',
                    source: this.props.items.planningUnitListJexcel,
                },
                {
                    title: 'Region',
                    type: 'text',
                    textEditor: true,
                },
                {
                    title: 'Month',
                    type: 'calendar',
                    options: {
                        format: JEXCEL_MONTH_PICKER_FORMAT,
                        type: 'year-month-picker'
                    }
                },
                {
                    title: 'Multiplier',
                    type: 'text',
                    textEditor: true,
                },
                {
                    title: 'Supply plan consumption',
                    type: 'text',
                    textEditor: true,
                },
                {
                    title: 'Converted Consumption',
                    type: 'text',
                    textEditor: true,
                },
                {
                    title: 'Current QAT consumption',
                    type: 'text',
                    textEditor: true,
                },
                {
                    title: 'Import?',
                    type: 'checkbox'
                },
                {
                    title: 'duplicate',
                    type: 'hidden'
                },

            ],
            updateTable: function (el, cell, x, y, source, value, id) {
                console.log("INSIDE UPDATE TABLE");
                var elInstance = el.jexcel;
                var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
                var rowData = elInstance.getRowData(y);
                // console.log("elInstance---->", elInstance);
                var id = rowData[9];

                if (id == 1) {
                    for (var i = 0; i < colArr.length; i++) {
                        elInstance.setStyle(`${colArr[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
                        elInstance.setStyle(`${colArr[i]}${parseInt(y) + 1}`, 'background-color', '#f48282');
                        let textColor = contrast('#f48282');
                        elInstance.setStyle(`${colArr[i]}${parseInt(y) + 1}`, 'color', textColor);
                    }
                } else {
                    for (var i = 0; i < colArr.length; i++) {
                        elInstance.setStyle(`${colArr[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
                    }
                }

            }.bind(this),
            pagination: false,
            filters: true,
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            // position: 'top',
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            // allowDeleteRow: true,
            // onchange: this.changed,
            // oneditionend: this.onedit,
            copyCompatibility: true,
            allowManualInsertRow: false,
            parseFormulas: true,
            // onpaste: this.onPaste,
            // oneditionend: this.oneditionend,
            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            editable: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: false
        };

        this.el = jexcel(document.getElementById("mapImport"), options);
        this.setState({
            loading: false
        })
    }

    render() {
        const { rangeValue } = this.state
        return (
            <>
                <div className="Card-header-reporticon">
                    {/* <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.globalconsumption')}</strong> */}
                    {this.state.selSource.length > 0 && <div className="card-header-actions">
                        <a className="card-header-action">
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                        </a>
                    </div>}
                </div>
                <AuthenticationServiceComponent history={this.props.history} />
                <h4 className="red">{this.props.message}</h4>

                <div className="table-responsive" style={{ display: this.state.loading ? "none" : "block" }} >

                    <div id="mapImport" className="RowheightForjexceladdRow">
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
            </>
        );
    }

}