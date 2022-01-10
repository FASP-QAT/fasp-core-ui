import React, { Component, lazy, Suspense, DatePicker } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
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
import Select from 'react-select';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import paginationFactory from 'react-bootstrap-table2-paginator'
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { getStyle, hexToRgba } from '@coreui/coreui-pro/dist/js/coreui-utilities'
import i18n from '../../i18n'
import Pdf from "react-to-pdf"
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import CryptoJS from 'crypto-js'
import { SECRET_KEY, INDEXED_DB_NAME, INDEXED_DB_VERSION, REPORT_DATEPICKER_START_MONTH, REPORT_DATEPICKER_END_MONTH, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_DATE_FORMAT_SM } from '../../Constants.js'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import pdfIcon from '../../assets/img/pdf.png';
import csvicon from '../../assets/img/csv.png'
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import 'chartjs-plugin-annotation';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import MultiSelect from "react-multi-select-component";
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
import jexcel from 'jexcel-pro';
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import "../../../node_modules/react-step-progress-bar/styles.css"
import { ProgressBar, Step } from "react-step-progress-bar";
import 'react-select/dist/react-select.min.css';
import StepOneImport from './StepOneImportIntoQATSP';
import StepTwoImport from './StepTwoImportIntoQATSP';
import StepThreeImport from './StepThreeImportIntoQATSP';
const entityname = i18n.t('static.program.programMaster');


export default class ImportIntoQATSupplyPlan extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            lang: localStorage.getItem('lang'),
            message: '',
            color: '',

            progressPer: 0,

            //step1
            programId: '',
            forecastProgramId: '',
            programs: [],
            datasetList: [],
            datasetList1: [],
            startDate: '',
            stopDate: '',
            stepOneData: [],
            versionId: '',
            planningUnitListJexcel: [],
            forecastProgramVersionId: '',
            planningUnitList: [],

            // step2
            stepTwoData: [],
        }

        this.finishedStepOne = this.finishedStepOne.bind(this);
        this.finishedStepTwo = this.finishedStepTwo.bind(this);
        this.finishedStepThree = this.finishedStepThree.bind(this);

        this.previousToStepOne = this.previousToStepOne.bind(this);
        this.previousToStepTwo = this.previousToStepTwo.bind(this);

        this.removeMessageText = this.removeMessageText.bind(this);
        this.updateStepOneData = this.updateStepOneData.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    updateStepOneData(key, value) {
        // let { program } = this.state;

        this.setState({
            [key]: value
        },
            () => {
                // console.log("program---------->1", key + ' ------ ' + value);
                // console.log("program---------->2", this.state);
            })
    }

    componentDidMount() {

        this.hideSecondComponent();
        // console.log("state-----------------", this.state.color, "---------", this.state.message);
        // this.props.history.push(`/importFromQATSupplyPlan/listImportFromQATSupplyPlan`)

        document.getElementById('stepOneImport').style.display = 'block';
        document.getElementById('stepTwoImport').style.display = 'none';
        document.getElementById('stepThreeImport').style.display = 'none';


    }
    finishedStepOne() {
        this.setState({ progressPer: 50, loading: true });
        document.getElementById('stepOneImport').style.display = 'none';
        document.getElementById('stepTwoImport').style.display = 'block';
        document.getElementById('stepThreeImport').style.display = 'none';


        this.refs.countryChild.filterData();
    }
    finishedStepTwo() {
        this.setState({ progressPer: 100, loading: true });
        document.getElementById('stepOneImport').style.display = 'none';
        document.getElementById('stepTwoImport').style.display = 'none';
        document.getElementById('stepThreeImport').style.display = 'block';


        this.refs.child.filterData();
    }
    finishedStepThree() {
        this.setState({ progressPer: 0, loading: true });
        document.getElementById('stepOneImport').style.display = 'block';
        document.getElementById('stepTwoImport').style.display = 'none';
        document.getElementById('stepThreeImport').style.display = 'none';

    }


    removeMessageText() {
        this.setState({ message: '' });
    }

    previousToStepOne() {
        this.setState({ progressPer: 0, loading: true });
        document.getElementById('stepOneImport').style.display = 'block';
        document.getElementById('stepTwoImport').style.display = 'none';
        document.getElementById('stepThreeImport').style.display = 'none';

        this.refs.stepOneChild.filterData();
    }

    previousToStepTwo() {
        this.setState({ progressPer: 50, loading: true });
        document.getElementById('stepOneImport').style.display = 'none';
        document.getElementById('stepTwoImport').style.display = 'block';
        document.getElementById('stepThreeImport').style.display = 'none';

        this.refs.countryChild.filterData();
    }


    render() {

        return (

            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.state.color} id="div2">{i18n.t(this.state.message)}</h5>
                {/* <h5 className={this.props.match.params.color} id="div2">{i18n.t(this.props.match.params.message)}</h5> */}
                <Row>
                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardBody>
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
                                                // src="https://pngimg.com/uploads/number1/number1_PNG14871.png"
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
                                            // src="https://cdn.clipart.email/096a56141a18c8a5b71ee4a53609b16a_data-privacy-news-five-stories-that-you-need-to-know-about-_688-688.png"
                                            />
                                            // <h2>2</h2>
                                        )}

                                    </Step>
                                    <Step transition="scale">
                                        {({ accomplished }) => (
                                            <img
                                                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                                width="30"
                                                src="../../../../public/assets/img/numbers/number3.png"
                                            // src="https://www.obiettivocoaching.it/wp-content/uploads/2016/04/recruit-circle-3-icon-blue.png"
                                            />
                                            // <h2>3</h2>
                                        )}
                                    </Step>
                                </ProgressBar>

                                <div className="d-sm-down-none  progressbar">
                                    <ul>
                                        <li className="progressbartext1Import">{i18n.t('static.importFromQATSupplyPlan.ProgramAndPlanningUnits')}</li>
                                        <li className="progressbartext2Import">{i18n.t('static.program.region')}</li>
                                        <li className="progressbartext3Import">{i18n.t('static.quantimed.quantimedImportScreenFourth')}</li>
                                    </ul>
                                </div>

                                <br></br>
                                <div>
                                    <div id="stepOneImport">
                                        <StepOneImport ref='stepOneChild' finishedStepOne={this.finishedStepOne} updateStepOneData={this.updateStepOneData} items={this.state}></StepOneImport>
                                    </div>
                                    <div id="stepTwoImport">
                                        <StepTwoImport ref='countryChild' finishedStepTwo={this.finishedStepTwo} updateStepOneData={this.updateStepOneData} previousToStepOne={this.previousToStepOne} items={this.state}></StepTwoImport>
                                    </div>
                                    <div id="stepThreeImport">
                                        <StepThreeImport ref="child" message={i18n.t(this.state.message)} updateStepOneData={this.updateStepOneData} previousToStepTwo={this.previousToStepTwo} finishedStepThree={this.finishedStepThree} removeMessageText={this.removeMessageText} hideSecondComponent={this.hideSecondComponent} items={this.state} {...this.props}></StepThreeImport>
                                        {/* <FormGroup className="mt-2">
                                            <Button color="success" size="md" className="float-right mr-1" type="button" onClick={this.finishedStepThree}> <i className="fa fa-check"></i>Import</Button>
                                            &nbsp;
                                            <Button color="info" size="md" className="float-left mr-1 px-4" type="button" onClick={this.previousToStepTwo} > <i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                            &nbsp;
                                        </FormGroup> */}
                                    </div>
                                </div>
                                {/* <div style={{ display: this.state.loading ? "block" : "none" }}>
                                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                        <div class="align-items-center">
                                            <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>

                                            <div class="spinner-border blue ml-4" role="status">

                                            </div>
                                        </div>
                                    </div>
                                </div> */}
                            </CardBody></Card>

                    </Col></Row></div>
        );
    }
}









//----------------------------------------------------------------------------------

// const pickerLang = {
//     months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
//     from: 'From', to: 'To',
// }

// class ImportFromQATSupplyPlan extends Component {
//     constructor(props) {
//         super(props);

//         var dt = new Date();
//         dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
//         var dt1 = new Date();
//         dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
//         this.state = {
//             lang: localStorage.getItem('lang'),
//             message: '',
//             // rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
//             // rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
//             rangeValue: { from: { year: 2020, month: 1 }, to: { year: 2024, month: 12 } },
//             minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
//             maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
//             loading: false,
//             selSource: []


//         };
//         this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
//         this.handleRangeChange = this.handleRangeChange.bind(this);
//         this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
//         this.filterData = this.filterData.bind(this);
//         this.buildJexcel = this.buildJexcel.bind(this);

//     }

//     componentDidMount() {


//     }

//     handleRangeChange(value, text, listIndex) {
//         //
//     }
//     handleRangeDissmis(value) {
//         this.setState({ rangeValue: value })
//         this.filterData(value);
//     }

//     _handleClickRangeBox(e) {
//         this.refs.pickRange.show()
//     }

//     makeText = m => {
//         if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
//         return '?'
//     }

//     filterData() {
//         let tempList = [];
//         tempList.push({ id: 1, v1: 'Female Condom (Nitrile) Lubricated, 17 cm, 1 Each', v2: 2, v3: 1.00 });
//         tempList.push({ id: 2, v1: 'Male Condom (Latex) Lubricated, Pante Vanilla, 53 mm, 1 Each', v2: 3, v3: 1.00 });
//         tempList.push({ id: 3, v1: 'Male Condom (Latex) Lubricated, Protector Plus Original, 53 mm, 1 Each', v2: 4, v3: 1.00 });
//         tempList.push({ id: 4, v1: 'Male Condom (Latex) Lubricated, Red Strawberry, 53 mm, 1 Each', v2: 7, v3: 0.00033 });
//         tempList.push({ id: 5, v1: 'Personal Lubricant (Water-Based) 4.5 g Topical Gel, 1 Sachet', v2: 1, v3: 0 });
//         this.setState({
//             selSource: tempList,
//             loading: true
//         },
//             () => {
//                 this.buildJexcel();
//             })
//     }

//     buildJexcel() {
//         var papuList = this.state.selSource;
//         var data = [];
//         var papuDataArr = [];

//         var count = 0;
//         if (papuList.length != 0) {
//             for (var j = 0; j < papuList.length; j++) {

//                 data = [];
//                 data[0] = papuList[j].id
//                 // data[1] = getLabelText(papuList[j].label, this.state.lang)
//                 data[1] = papuList[j].v1
//                 data[2] = papuList[j].v2
//                 data[3] = papuList[j].v3 == 0 ? '' : papuList[j].v3

//                 papuDataArr[count] = data;
//                 count++;
//             }
//         }

//         // if (papuDataArr.length == 0) {
//         //     data = [];
//         //     data[0] = 0;
//         //     data[1] = "";
//         //     data[2] = true
//         //     data[3] = "";
//         //     data[4] = "";
//         //     data[5] = 1;
//         //     data[6] = 1;
//         //     papuDataArr[0] = data;
//         // }

//         this.el = jexcel(document.getElementById("paputableDiv"), '');
//         this.el.destroy();
//         var json = [];
//         var data = papuDataArr;

//         var options = {
//             data: data,
//             columnDrag: true,
//             colWidths: [100, 100, 100, 100, 100],
//             columns: [

//                 {
//                     title: 'id',
//                     type: 'hidden',
//                     readOnly: true
//                 },
//                 {
//                     title: 'Supply Plan Planning Unit',
//                     type: 'text',
//                     readOnly: true,
//                     textEditor: true,
//                 },
//                 {
//                     title: 'Forecast Planning Unit',
//                     // readOnly: true,
//                     type: 'dropdown',
//                     // source: this.state.forecastMethodTypeList,
//                     source: [
//                         { id: 1, name: 'Do not import' },
//                         { id: 2, name: 'Female Condom (Nitrile) Lubricated, 17 cm, 1 Each' },
//                         { id: 3, name: 'Male Condom (Latex) Lubricated, Pante Vanilla, 53 mm, 1 Each' },
//                         { id: 4, name: 'Male Condom (Latex) Lubricated, Protector Plus Original, 53 mm, 1 Each' },
//                         { id: 5, name: 'Male Condom (Latex) Lubricated, Red Strawberry, 53 mm, 1 Each' },
//                         { id: 6, name: 'Personal Lubricant (Water-Based) 4.5 g Topical Gel, 1 Sachet' },
//                         { id: 7, name: 'Male Condom (Latex) Lubricated, No Logo Yellow Banana, 53 mm, 3000 Pieces' },
//                     ]
//                 },
//                 {
//                     title: 'Multiplier',
//                     type: 'numeric',
//                     decimal: '.',
//                     readOnly: true,
//                     textEditor: true,
//                 },


//             ],
//             pagination: localStorage.getItem("sesRecordCount"),
//             filters: true,
//             search: true,
//             columnSorting: true,
//             tableOverflow: true,
//             wordWrap: true,
//             paginationOptions: JEXCEL_PAGINATION_OPTION,
//             position: 'top',
//             allowInsertColumn: false,
//             allowManualInsertColumn: false,
//             // allowDeleteRow: true,
//             // onchange: this.changed,
//             // oneditionend: this.onedit,
//             copyCompatibility: true,
//             allowManualInsertRow: false,
//             parseFormulas: true,
//             // onpaste: this.onPaste,
//             // oneditionend: this.oneditionend,
//             text: {
//                 // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
//                 showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
//                 show: '',
//                 entries: '',
//             },
//             onload: this.loaded,
//             editable: true,
//             license: JEXCEL_PRO_KEY,
//             contextMenu: false
//         };

//         this.el = jexcel(document.getElementById("paputableDiv"), options);
//         this.setState({
//             loading: false
//         })
//     }

//     loaded = function (instance, cell, x, y, value) {
//         jExcelLoadedFunction(instance);
//     }

//     render() {
//         const { rangeValue } = this.state
//         return (
//             <div className="animated">
//                 <AuthenticationServiceComponent history={this.props.history} />
//                 <h5>{i18n.t(this.props.match.params.message)}</h5>
//                 <h5 className="red">{i18n.t(this.state.message)}</h5>
//                 <Card>
//                     <CardBody className="pt-lg-2 pb-lg-5">

//                         <div className="pl-0">
//                             <div className="row ">

//                                 <FormGroup className="col-md-3">
//                                     {/* <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label> */}
//                                     <Label htmlFor="appendedInputButton">Supply Plan Program</Label>
//                                     <div className="controls ">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="programId"
//                                                 id="programId"
//                                                 bsSize="sm"
//                                             // onChange={this.filterVersion}
//                                             // onChange={(e) => { this.setProgramId(e); }}
//                                             // value={this.state.programId}
//                                             >
//                                                 <option value="0">{i18n.t('static.common.select')}</option>
//                                                 <option value="1">SWZ-PRH/CON-MOH</option>
//                                                 <option value="2">Benin Malaria</option>
//                                                 <option value="3">Burundi Lab</option>
//                                                 <option value="4">TZA - PRH/CON</option>

//                                             </Input>

//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>

//                                 <FormGroup className="col-md-3">
//                                     {/* <Label htmlFor="appendedInputButton">{i18n.t('static.report.version*')}</Label> */}
//                                     <Label htmlFor="appendedInputButton">Supply Plan Version</Label>
//                                     <div className="controls">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="versionId"
//                                                 id="versionId"
//                                                 bsSize="sm"
//                                             // onChange={(e) => { this.getPlanningUnit(); }}
//                                             // onChange={(e) => { this.setVersionId(e); }}
//                                             // value={this.state.versionId}
//                                             >
//                                                 <option value="0">{i18n.t('static.common.select')}</option>
//                                                 <option value="1">1</option>
//                                                 <option value="2">2</option>
//                                                 <option value="3">3*</option>
//                                             </Input>

//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>

//                                 <FormGroup className="col-md-3">
//                                     {/* <Label htmlFor="appendedInputButton">{i18n.t('static.program.isincludeplannedshipment')}</Label> */}
//                                     <Label htmlFor="appendedInputButton">Forecast Program</Label>
//                                     <div className="controls ">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="isPlannedShipmentId"
//                                                 id="isPlannedShipmentId"
//                                                 bsSize="sm"
//                                                 onChange={this.filterData}
//                                             >
//                                                 <option value="0">{i18n.t('static.common.select')}</option>
//                                                 <option value="1">Tanzania Condoms & ARV</option>
//                                                 <option value="2">TZA - PRH/CON</option>
//                                             </Input>

//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>

//                                 <FormGroup className="col-md-3">
//                                     {/* <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon fa fa-sort-desc"></span></Label> */}
//                                     <Label htmlFor="appendedInputButton">Range</Label>
//                                     <div className="controls  Regioncalender">

//                                         <Picker
//                                             ref="pickRange"
//                                             years={{ min: this.state.minDate, max: this.state.maxDate }}
//                                             value={rangeValue}
//                                             lang={pickerLang}
//                                             //theme="light"
//                                             onChange={this.handleRangeChange}
//                                             onDismiss={this.handleRangeDissmis}
//                                         >
//                                             <MonthBox value={this.makeText(rangeValue.from) + ' ~ ' + this.makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
//                                         </Picker>

//                                     </div>
//                                 </FormGroup>

//                             </div>
//                         </div>
//                         <div className="" style={{ display: this.state.loading ? "none" : "block" }}>
//                             <div id="paputableDiv" className="jexcelremoveReadonlybackground">
//                             </div>
//                         </div>
//                         <div style={{ display: this.state.loading ? "block" : "none" }}>
//                             <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
//                                 <div class="align-items-center">
//                                     <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

//                                     <div class="spinner-border blue ml-4" role="status">

//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </CardBody>
//                     <CardFooter>
//                         <FormGroup>
//                             <Button type="submit" size="md" color="success" className="float-right mr-1" ><i className="fa fa-check"></i>Import</Button>
//                         </FormGroup>
//                     </CardFooter>
//                 </Card>
//             </div>
//         );
//     }
// }
// export default ImportFromQATSupplyPlan;



