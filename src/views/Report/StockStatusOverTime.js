import React, { Component, lazy } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import pdfIcon from '../../assets/img/pdf.png';
import csvicon from '../../assets/img/csv.png'
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import i18n from '../../i18n'
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import PlanningUnitService from '../../api/PlanningUnitService';
import ProductService from '../../api/ProductService';
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import RealmCountryService from '../../api/RealmCountryService';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import ReportService from '../../api/ReportService';
import {
    Button, Card, CardBody, CardHeader, Col, Row, FormGroup, Input, InputGroup, InputGroupAddon, Label, Form,Table
} from 'reactstrap';
import ProgramService from '../../api/ProgramService';

const options = {
    title: {
        display: true,
        fontColor: 'black',
        fontStyle: "normal",
        fontSize: "12"
    },
    scales: {
        yAxes: [
            {
                scaleLabel: {
                    display: true,
                    labelString: i18n.t('static.report.mos'),
                    fontColor: 'black'
                },
                ticks: {
                    beginAtZero: true,
                    Max: 900,
                    fontColor: 'black'
                }
            }
        ], xAxes: [{
            ticks: {
                fontColor: 'black'
            }
        }]
    },
    tooltips: {
        mode: 'index',
        enabled: false,
        custom: CustomTooltips
    },
    maintainAspectRatio: false,
    legend: {
        display: true,
        position: 'bottom',
        labels: {
            usePointStyle: true,
            fontColor: 'black'
        }
    }
}

const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
class StockStatusOverTime extends Component {

    constructor(props) {
        super(props);

        this.state = {
            matricsList: [],
            dropdownOpen: false,
            radioSelected: 2,
            productCategories: [],
            planningUnits: [],
            countries: [],
            programs: [],
            planningUnitValues: [],
            planningUnitLabels: [],
            countryValues: [],
            countryLabels: [],
            programValues: [],
            programLabels: [],
            planningUnitlines: [],
            lineData: [],
            lineDates: [],
            planningUnitMatrix: {
                date: []
            },
            rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },



        }


        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.getCountrylist = this.getCountrylist.bind(this);
        this.getProductCategories = this.getProductCategories.bind(this)
        this.getPlanningUnit = this.getPlanningUnit.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.handlePlanningUnitChange = this.handlePlanningUnitChange.bind(this)
        this.getPrograms = this.getPrograms.bind(this);
        this.handleChangeProgram = this.handleChangeProgram.bind(this)
    }

    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    roundN = num => {
        return parseFloat(Math.round(num * Math.pow(10, 1)) / Math.pow(10, 1)).toFixed(1);
    }

  formatter = value => {

    var cell1 = value
    cell1 += '';
    var x = cell1.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  }
 
    handlePlanningUnitChange(planningUnitIds) {


        var planningUnitIdArray = [];
        var planningUnitLabel = [];
        planningUnitIdArray = planningUnitIds.map(ele => ele.value)
        planningUnitLabel = planningUnitIds.map(ele => ele.label)
        /* for (var i = 0; i < planningUnitIds.length; i++) {
           planningUnitIdArray[i] = planningUnitIds[i].value;
           planningUnitLabel[i] = planningUnitIds[i].label
     
         }*/

        this.setState({
            planningUnitValues: planningUnitIds.map(ele => ele.value),
            planningUnitLabels: planningUnitIds.map(ele => ele.label)
        }, () => {

            this.fetchData()
        })


    }
    handleChangeProgram(programIds) {

        this.setState({
            programValues: programIds.map(ele => ele.value),
            programLabels: programIds.map(ele => ele.label)
        }, () => {

            this.fetchData()
        })

    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        this.getPrograms()
        this.getProductCategories()
    }

    show() {
    }
    handleRangeChange(value, text, listIndex) {
        //
    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => { this.fetchData(); })

    }

    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }

    getCountrylist() {
        AuthenticationService.setupAxiosInterceptors();
        let realmId = AuthenticationService.getRealmId();
        RealmCountryService.getRealmCountryrealmIdById(realmId)
            .then(response => {
                this.setState({
                    countries: response.data
                })
            }).catch(
                error => {
                    this.setState({
                        countries: []
                    })
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }) });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );

    }

    getPrograms() {
        AuthenticationService.setupAxiosInterceptors();
        let realmId = AuthenticationService.getRealmId();
        ProgramService.getProgramByRealmId(realmId)
            .then(response => {
                // console.log(JSON.stringify(response.data))
                this.setState({
                    programs: response.data
                })
            }).catch(
                error => {
                    this.setState({
                        programs: []
                    })
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );

    }

    getProductCategories() {
        AuthenticationService.setupAxiosInterceptors();
        let realmId = AuthenticationService.getRealmId();
        ProductService.getProductCategoryList(realmId)
            .then(response => {
                //  console.log(JSON.stringify(response.data))
                this.setState({
                    productCategories: response.data
                })
            }).catch(
                error => {
                    this.setState({
                        productCategories: []
                    })
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }) });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );

    }
    getPlanningUnit() {
        AuthenticationService.setupAxiosInterceptors();
        let productCategoryId = document.getElementById("productCategoryId").value;
        PlanningUnitService.getPlanningUnitByProductCategoryId(productCategoryId).then(response => {
            // console.log('**' + JSON.stringify(response.data))
            this.setState({
                planningUnits: response.data,
            })
        })
            .catch(
                error => {
                    this.setState({
                        planningUnits: [],
                    })
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: error.response.data.messageCode });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );

    }
    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));
    fetchData() {
        let productCategoryId = document.getElementById("productCategoryId").value;
        let planningUnitIds = this.state.planningUnitValues;
        let programIds = this.state.programValues
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let stopDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();

        var programAndPlanningUnitList = (programIds.flatMap(d => planningUnitIds.map(v => ({ "programId": d, "planningUnitId": v }))));
        if (planningUnitIds.length > 0 && programIds.length > 0) {

            var input = {
                "programAndPlanningUnitList": programAndPlanningUnitList,
                "mosPast": document.getElementById("mosPast").selectedOptions[0].value == 0 ? null : document.getElementById("mosPast").selectedOptions[0].value,
                "mosFuture": document.getElementById("mosFuture").selectedOptions[0].value == 0 ? null : document.getElementById("mosFuture").selectedOptions[0].value,
                "startDate": startDate,
                "stopDate": stopDate
            }

            /*var inputjson={
            "realmCountryIds":CountryIds,"programIds":programIds,"planningUnitIds":planningUnitIds,"startDate": startDate
           }*/
            AuthenticationService.setupAxiosInterceptors();

            ReportService.getStockOverTime(input)
                .then(response => {
                    response.data = [[{ "dt": "Dec 19", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 152, "label": { "active": false, "labelId": 9098, "label_en": "Abacavir 20 mg/mL Solution, 240 mL", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 54800, "consumptionQty": 0, "amc": 23122, "amcMonthCount": 4, "mos": 2.37 },
                    { "dt": "Jan 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 152, "label": { "active": false, "labelId": 9098, "label_en": "Abacavir 20 mg/mL Solution, 240 mL", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 27203, "consumptionQty": 17475, "amc": 23533, "amcMonthCount": 5, "mos": 1.1559 },
                    { "dt": "Feb 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 152, "label": { "active": false, "labelId": 9098, "label_en": "Abacavir 20 mg/mL Solution, 240 mL", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 6067, "consumptionQty": 25135, "amc": 22402, "amcMonthCount": 6, "mos": 0.2708 },
                    { "dt": "Mar 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 152, "label": { "active": false, "labelId": 9098, "label_en": "Abacavir 20 mg/mL Solution, 240 mL", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 36137, "consumptionQty": 49880, "amc": 21202, "amcMonthCount": 7, "mos": 1.7044 },
                    { "dt": "Apr 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 152, "label": { "active": false, "labelId": 9098, "label_en": "Abacavir 20 mg/mL Solution, 240 mL", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 10960, "consumptionQty": 25177, "amc": 23631, "amcMonthCount": 7, "mos": 0.4638 },
                    { "dt": "May 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 152, "label": { "active": false, "labelId": 9098, "label_en": "Abacavir 20 mg/mL Solution, 240 mL", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 0, "consumptionQty": 16750, "amc": 23706, "amcMonthCount": 7, "mos": 0.0 },
                    { "dt": "Jun 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 152, "label": { "active": false, "labelId": 9098, "label_en": "Abacavir 20 mg/mL Solution, 240 mL", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 26000, "consumptionQty": 14000, "amc": 22401, "amcMonthCount": 7, "mos": 1.1607 }],
                    [{ "dt": "Dec 19", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 156, "label": { "active": false, "labelId": 9102, "label_en": "Abacavir 60 mg Tablet, 1000 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 28648, "consumptionQty": 0, "amc": 8604, "amcMonthCount": 4, "mos": 3.3293 },
                    { "dt": "Jan 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 156, "label": { "active": false, "labelId": 9102, "label_en": "Abacavir 60 mg Tablet, 1000 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 17103, "consumptionQty": 11522, "amc": 9351, "amcMonthCount": 5, "mos": 1.829 },
                    { "dt": "Feb 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 156, "label": { "active": false, "labelId": 9102, "label_en": "Abacavir 60 mg Tablet, 1000 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 20500, "consumptionQty": 11513, "amc": 9709, "amcMonthCount": 6, "mos": 2.1114 },
                    { "dt": "Mar 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 156, "label": { "active": false, "labelId": 9102, "label_en": "Abacavir 60 mg Tablet, 1000 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 9116, "consumptionQty": 11384, "amc": 9965, "amcMonthCount": 7, "mos": 0.9148 },
                    { "dt": "Apr 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 156, "label": { "active": false, "labelId": 9102, "label_en": "Abacavir 60 mg Tablet, 1000 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 31757, "consumptionQty": 12336, "amc": 11607, "amcMonthCount": 7, "mos": 2.7358 },
                    { "dt": "May 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 156, "label": { "active": false, "labelId": 9102, "label_en": "Abacavir 60 mg Tablet, 1000 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 20257, "consumptionQty": 11500, "amc": 11604, "amcMonthCount": 7, "mos": 1.7456 },
                    { "dt": "Jun 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 156, "label": { "active": false, "labelId": 9102, "label_en": "Abacavir 60 mg Tablet, 1000 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 28757, "consumptionQty": 11500, "amc": 11602, "amcMonthCount": 7, "mos": 2.4784 }],
                    [{ "dt": "Dec 19", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 154, "label": { "active": false, "labelId": 9100, "label_en": "Abacavir 300 mg Tablet, 60 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 15865, "consumptionQty": 0, "amc": 4608, "amcMonthCount": 4, "mos": 3.4427 },
                    { "dt": "Jan 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 154, "label": { "active": false, "labelId": 9100, "label_en": "Abacavir 300 mg Tablet, 60 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 9789, "consumptionQty": 6053, "amc": 4854, "amcMonthCount": 5, "mos": 2.0166 },
                    { "dt": "Feb 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 154, "label": { "active": false, "labelId": 9100, "label_en": "Abacavir 300 mg Tablet, 60 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 23393, "consumptionQty": 6398, "amc": 5070, "amcMonthCount": 6, "mos": 4.6139 },
                    { "dt": "Mar 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 154, "label": { "active": false, "labelId": 9100, "label_en": "Abacavir 300 mg Tablet, 60 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 15903, "consumptionQty": 5982, "amc": 5224, "amcMonthCount": 7, "mos": 3.044 },
                    { "dt": "Apr 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 154, "label": { "active": false, "labelId": 9100, "label_en": "Abacavir 300 mg Tablet, 60 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 10063, "consumptionQty": 5838, "amc": 6103, "amcMonthCount": 7, "mos": 1.6489 },
                    { "dt": "May 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 154, "label": { "active": false, "labelId": 9100, "label_en": "Abacavir 300 mg Tablet, 60 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 3913, "consumptionQty": 6150, "amc": 6116, "amcMonthCount": 7, "mos": 0.6397 },
                    { "dt": "Jun 20", "program": { "id": 3, "label": { "active": false, "labelId": 136, "label_en": "HIV/AIDS - Malawi - National", "label_sp": "", "label_fr": "", "label_pr": "" } }, "planningUnit": { "id": 154, "label": { "active": false, "labelId": 9100, "label_en": "Abacavir 300 mg Tablet, 60 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "stock": 17763, "consumptionQty": 6150, "amc": 6081, "amcMonthCount": 7, "mos": 2.9209 }]];
                    console.log(JSON.stringify(response.data))
                    var lineData = [];
                    var lineDates = [];
                    var planningUnitlines = [];
                    for (var i = 0; i < response.data.length; i++) {
                        lineData[i] = response.data[i].map(ele => (ele.mos))
                    }
                    lineDates = response.data[0].map(ele => (ele.dt))
                    planningUnitlines = response.data.map(ele1 => [...new Set(ele1.map(ele => (getLabelText(ele.program.label, this.state.lang) + '-' + getLabelText(ele.planningUnit.label, this.state.lang))))])

                    this.setState({
                        matricsList: response.data,
                        message: '',
                        planningUnitlines: planningUnitlines,
                        lineData: lineData,
                        lineDates: lineDates
                    })
                }).catch(
                    error => {
                        this.setState({
                            consumptions: []
                        })

                        if (error.message === "Network Error") {
                            this.setState({ message: error.message });
                        } else {
                            switch (error.response ? error.response.status : "") {
                                case 500:
                                case 401:
                                case 404:
                                case 406:
                                case 412:
                                    this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }) });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError' });
                                    break;
                            }
                        }
                    }
                );
        } else if (programIds.length == 0) {
            this.setState({ message: i18n.t('static.common.selectProgram'), consumptions: [] });

        } else if (productCategoryId == -1) {
            this.setState({ message: i18n.t('static.common.selectProductCategory'), consumptions: [] });

        } else {
            this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), consumptions: [] });

        }


    }


    exportCSV() {

        var csvRow = [];
        csvRow.push((i18n.t('static.report.dateRange') + ' , ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20'))
        this.state.programLabels.map(ele => csvRow.push(i18n.t('static.program.program') + ' , ' + ((ele.toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')))
        csvRow.push((i18n.t('static.dashboard.productcategory')).replaceAll(' ', '%20') + ' , ' + ((document.getElementById("productCategoryId").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
        csvRow.push((i18n.t('static.report.mospast')).replaceAll(' ', '%20') + ' , ' + ((document.getElementById("mosPast").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
        csvRow.push((i18n.t('static.report.mosfuture')).replaceAll(' ', '%20') + ' , ' + ((document.getElementById("mosFuture").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
        this.state.planningUnitLabels.map(ele =>
            csvRow.push((i18n.t('static.planningunit.planningunit')).replaceAll(' ', '%20') + ' , ' + ((ele.toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')))
        csvRow.push('')
        csvRow.push('')
        var re;

        var A = [[i18n.t('static.report.month'), i18n.t('static.program.program'), i18n.t('static.planningunit.planningunit'), i18n.t('static.report.stock'), i18n.t('static.report.consupmtionqty'), i18n.t('static.report.amc'), i18n.t('static.report.noofmonth'), i18n.t('static.report.mos')]]


        this.state.matricsList.map(ele => ele.map(elt => A.push([elt.dt, ((getLabelText(elt.program.label, this.state.lang)).replaceAll(',', '%20')).replaceAll(' ', '%20'), ((getLabelText(elt.planningUnit.label, this.state.lang)).replaceAll(',', '%20')).replaceAll(' ', '%20'), elt.stock, elt.consumptionQty, elt.amc, elt.amcMonthCount, this.roundN(elt.mos)])));


        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.dashboard.stockstatusovertime') + '_' + this.state.rangeValue.from.year + this.state.rangeValue.from.month + i18n.t('static.report.consumptionTo') + this.state.rangeValue.to.year + this.state.rangeValue.to.month + ".csv"
        document.body.appendChild(a)
        a.click()
    }






    exportPDF = () => {
        const addFooters = doc => {

            const pageCount = doc.internal.getNumberOfPages()

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(6)
            for (var i = 1; i <= pageCount; i++) {
                doc.setPage(i)

                doc.setPage(i)
                doc.text('Page ' + String(i) + ' of ' + String(pageCount), doc.internal.pageSize.width / 9, doc.internal.pageSize.height - 30, {
                    align: 'center'
                })
                doc.text('Copyright © 2020 Quantification Analytics Tool', doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
                    align: 'center'
                })


            }
        }
        const addHeaders = doc => {

            const pageCount = doc.internal.getNumberOfPages()

            // var file = new File('QAT-logo.png','../../../assets/img/QAT-logo.png');
            // var reader = new FileReader();

            //var data='';
            // Use fs.readFile() method to read the file 
            //fs.readFile('../../assets/img/logo.svg', 'utf8', function(err, data){ 
            //}); 
            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(12)
                doc.setFont('helvetica', 'bold')

                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 200, 50, 'FAST');
                /*doc.addImage(data, 10, 30, {
                align: 'justify'
                });*/
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.report.stockstatusovertimeReport'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })
                    var planningText = doc.splitTextToSize((i18n.t('static.program.program') + ' : ' + this.state.programLabels.toString()), doc.internal.pageSize.width * 3 / 4);

                    doc.text(doc.internal.pageSize.width / 8, 110, planningText)

                    doc.text(i18n.t('static.productcategory.productcategory') + ' : ' + document.getElementById("productCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.report.mospast') + ' : ' + document.getElementById("mosPast").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.report.mosfuture') + ' : ' + document.getElementById("mosFuture").selectedOptions[0].text, doc.internal.pageSize.width / 8, 170, {
                        align: 'left'
                    })
                    planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);

                    doc.text(doc.internal.pageSize.width / 8, 190, planningText)
                }

            }
        }
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);

        doc.setFontSize(8);

        const title = "Consumption Report";
        var canvas = document.getElementById("cool-canvas");
        //creates image

        var canvasImg = canvas.toDataURL("image/png", 1.0);
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        var aspectwidth1 = (width - h1);

        // doc.addImage(canvasImg, 'png', 50, 130, aspectwidth1, height * 2 / 3);
        doc.addImage(canvasImg, 'png', 50, 220, 750, 230, 'CANVAS');

        const headers = [[i18n.t('static.report.month'), i18n.t('static.program.program'), i18n.t('static.planningunit.planningunit'), i18n.t('static.report.stock'), i18n.t('static.report.consupmtionqty'), i18n.t('static.report.amc'), i18n.t('static.report.noofmonth'), i18n.t('static.report.mos')]];

        const data = [];
        this.state.matricsList.map(ele => ele.map(elt => data.push([elt.dt, getLabelText(elt.program.label, this.state.lang), getLabelText(elt.planningUnit.label, this.state.lang), elt.stock, elt.consumptionQty, this.formatter(elt.amc), elt.amcMonthCount, this.roundN(elt.mos)])));

        let content = {
            margin: { top: 80 },
            startY: height,
            head: headers,
            body: data,
            styles: { lineWidth: 1, fontSize: 8 }

        };


        //doc.text(title, marginLeft, 40);
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save("StockStatusOverTime.pdf")
        //creates PDF from img
        /* var doc = new jsPDF('landscape');
        doc.setFontSize(20);
        doc.text(15, 15, "Cool Chart");
        doc.save('canvas.pdf');*/
    }



    render() {
        const { planningUnits } = this.state;
        let planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return ({ label: getLabelText(item.label, this.state.lang), value: item.planningUnitId })

            }, this);
        const { programs } = this.state;
        let programList = [];
        programList = programs.length > 0
            && programs.map((item, i) => {
                return (

                    { label: getLabelText(item.label, this.state.lang), value: item.programId }

                )
            }, this);
        const { productCategories } = this.state;
        let productCategoryList = productCategories.length > 0
            && productCategories.map((item, i) => {
                return (
                    <option key={i} value={item.payload.productCategoryId}>
                        {getLabelText(item.payload.label, this.state.lang)}
                    </option>
                )
            }, this);
        const getRandomColor = () => {
            var letters = '0123456789ABCDEF'.split('');
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }
        console.log(this.state.matricsList)
        const backgroundColor = [
            '#4dbd74',
            '#c8ced3',
            '#000',
            '#ffc107',
            '#f86c6b',
            '#205493',
            '#20a8d8',
            '#a6c4ec',
            '#ca3828',
            '#388b70',
            '#f4862a',
            '#ed5626',
            '#4dbd74',
            '#ffc107',
            '#f86c6b'
        ]
        const bar = {
            labels: this.state.lineDates,
            datasets: this.state.planningUnitlines.map((item, index) => ({ type: "line", pointStyle: 'line', lineTension: 0, backgroundColor: 'transparent', label: item, data: this.state.lineData[index], borderColor: backgroundColor[index] }))
            /*  [
             {
                   type: "line",
                   label: "MOS past 3",
                   backgroundColor: 'transparent',
                   borderColor: '#ffc107',
                   lineTension: 0,
                   showActualPercentages: true,
                   showInLegend: true,
                   pointStyle: 'line',

                   data: this.state.matricsList.map((item, index) => (item.MOS_pass3))
               },
               {
                   type: "line",
                   label: "MOS P+F",
                   backgroundColor: 'transparent',
                   borderColor: '#4dbd74',
                   lineTension: 0,
                   showActualPercentages: true,
                   showInLegend: true,
                   pointStyle: 'line',

                   data: this.state.matricsList.map((item, index) => (item.MOS_PF))
               },
               {
                   type: "line",
                   label: "MOS Future 3",
                   backgroundColor: 'transparent',
                   borderColor: '#ed5626',
                   lineTension: 0,
                   showActualPercentages: true,
                   showInLegend: true,
                   pointStyle: 'line',

                   data: this.state.matricsList.map((item, index) => (item.MOS_Feature3))
               }
           ]*/
        }


        const pickerLang = {
            months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
            from: 'From', to: 'To',
        }
        const { rangeValue } = this.state

        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }


        return (
            <div className="animated fadeIn" >
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5>{i18n.t(this.state.message)}</h5>
                <Card>
                    <CardHeader className="pb-1">
                        <i className="icon-menu"></i><strong>{i18n.t('static.report.stockstatusovertimeReport')}</strong>
                        {
                            this.state.matricsList.length > 0 &&
                            <div className="card-header-actions">
                                <a className="card-header-action">
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />

                                    {/* <Pdf targetRef={ref} filename={i18n.t('static.report.consumptionpdfname')}>
 
 {({ toPdf }) =>
 <img style={{ height: '25px', width: '25px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => toPdf()} />

 }
 </Pdf>*/}
                                </a>
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                            </div>
                        }
                    </CardHeader>
                    <CardBody>

                        <div>
                            <Form >
                                <Col md="12 pl-0">
                                    <div className="row">
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                            <div className="controls edit">

                                                <Picker
                                                    ref="pickRange"
                                                    years={{ min: 2013 }}
                                                    value={rangeValue}
                                                    lang={pickerLang}
                                                    //theme="light"
                                                    onChange={this.handleRangeChange}
                                                    onDismiss={this.handleRangeDissmis}
                                                >
                                                    <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                                </Picker>
                                            </div>

                                        </FormGroup>

                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="programIds">{i18n.t('static.program.program')}<span className="red Reqasterisk">*</span></Label>
                                            <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                            <InputGroup className="box">
                                                <ReactMultiSelectCheckboxes

                                                    bsSize="sm"
                                                    name="programIds"
                                                    id="programIds"
                                                    onChange={(e) => { this.handleChangeProgram(e) }}
                                                    options={programList && programList.length > 0 ? programList : []}
                                                />
                                                {!!this.props.error &&
                                                    this.props.touched && (
                                                        <div style={{ color: 'red', marginTop: '.5rem' }}>{this.props.error}</div>
                                                    )}
                                            </InputGroup>
                                        </FormGroup>

                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.productcategory.productcategory')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="productCategoryId"
                                                        id="productCategoryId"
                                                        bsSize="sm"
                                                        onChange={this.getPlanningUnit}
                                                    >
                                                        <option value="0">{i18n.t('static.common.select')}</option>
                                                        {productCategoryList}
                                                    </Input>
                                                </InputGroup></div>
                                        </FormGroup>
                                        <FormGroup className="col-sm-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                                            <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                            <div className="controls">
                                                <InputGroup className="box">   
                                                <ReactMultiSelectCheckboxes
                                                    name="planningUnitId"
                                                    id="planningUnitId"
                                                    bsSize="md"
                                                    onChange={(e) => { this.handlePlanningUnitChange(e) }}
                                                    options={planningUnitList && planningUnitList.length > 0 ? planningUnitList : []}
                                                /> </InputGroup>    </div></FormGroup>
                                        <FormGroup className="col-sm-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.mospast')}</Label>
                                            <div className="controls">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="mosPast"
                                                        id="mosPast"
                                                        bsSize="sm"
                                                        onChange={this.fetchData}
                                                    >
                                                        <option value="0">-</option>
                                                        <option value="1">{1}</option>
                                                        <option value="2">{2}</option>
                                                        <option value="3">{3}</option>
                                                        <option value="4">{4}</option>
                                                        <option value="5">{5}</option>
                                                        <option value="6">{6}</option>
                                                        <option value="7">{7}</option>
                                                        <option value="8">{8}</option>
                                                        <option value="9">{9}</option>
                                                        <option value="10">{10}</option>
                                                        <option value="11">{11}</option>
                                                        <option value="12">{12}</option>
                                                    </Input></InputGroup></div>

                                        </FormGroup>
                                        <FormGroup className="col-sm-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.mosfuture')}</Label>
                                            <div className="controls">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="mosFuture"
                                                        id="mosFuture"
                                                        bsSize="sm"
                                                        onChange={this.fetchData}
                                                    >
                                                        <option value="0">-</option>
                                                        <option value="1">{1}</option>
                                                        <option value="2">{2}</option>
                                                        <option value="3">{3}</option>
                                                        <option value="4">{4}</option>
                                                        <option value="5">{5}</option>
                                                        <option value="6">{6}</option>
                                                        <option value="7">{7}</option>
                                                        <option value="8">{8}</option>
                                                        <option value="9">{9}</option>
                                                        <option value="10">{10}</option>
                                                        <option value="11">{11}</option>
                                                        <option value="12">{12}</option>
                                                    </Input></InputGroup></div>

                                        </FormGroup>

                                    </div>
                                </Col>
                            </Form>
                        </div>
                        <div className="row">
                            {(this.state.matricsList.length > 0) && <div className="col-md-12">



                                <div className="col-md-12">
                                    <div className="chart-wrapper chart-graph-report">
                                        <Line id="cool-canvas" data={bar} options={options} />

                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <button className="mr-1 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}>
                                        {this.state.show ? 'Hide Data' : 'Show Data'}
                                    </button>

                                </div>

                                <br></br>
                            </div>}</div>
                                
                         <div className="row">
                    <div className="col-md-12">
                      {this.state.show && this.state.matricsList.length > 0 &&
                       <Table responsive className="table-striped table-hover table-bordered text-center mt-2">

                        <thead>
                          <tr>
                            <th className="text-center" style={{width:'10%'}}> {i18n.t('static.report.month')} </th>
                            <th className="text-center" style={{width:'20%'}}> {i18n.t('static.dashboard.program')} </th>
                            <th className="text-center" style={{width:'20%'}}>{i18n.t('static.planningunit.planningunit')}</th>
                            <th className="text-center" style={{width:'10%'}}>{i18n.t('static.report.stock')}</th>
                            <th className="text-center" style={{width:'10%'}}>{i18n.t('static.report.consupmtionqty')}</th>
                            <th className="text-center" style={{width:'10%'}}>{i18n.t('static.report.amc')}</th>
                            <th className="text-center" style={{width:'10%'}}>{i18n.t('static.report.noofmonth')}</th>
                            <th className="text-center" style={{width:'10%'}}>{i18n.t('static.report.mos')}</th>
                            </tr>
                        </thead>
                       
                          <tbody>
                             { this.state.matricsList.length > 0
                              &&
                              this.state.matricsList.map(ele => ele.map(item => 

                                <tr id="addr0" >    
                                
                                  <td>{item.dt}</td>
                                  <td>
                                    {getLabelText(item.program.label,this.state.lang)}
                                  </td>
                                  <td>
                                    {getLabelText(item.planningUnit.label,this.state.lang)}
                                  </td>
                                  <td>
                                    {this.formatter(item.stock)}
                                  </td>
                                  <td>
                                    {this.formatter(item.consumptionQty)}
                                  </td>
                                  <td>
                                    {this.formatter(item.amc)}
                                  </td>
                                  <td>
                                    {this.formatter(item.amcMonthCount)}
                                  </td>
                                  <td>
                                    {this.roundN(item.mos)}
                                  </td>

        </tr>))}

                            
                          </tbody>
                 </Table>}

                   </div>
                   </div>
                    </CardBody></Card>
            </div>


        );

    }

}



export default StockStatusOverTime
