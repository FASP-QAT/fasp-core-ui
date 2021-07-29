import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import MultiSelect from "react-multi-select-component";
import {
    Card,
    CardBody,
    Col,
    Table, FormGroup, Input, InputGroup, Label, Form
} from 'reactstrap';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import i18n from '../../i18n'
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import { DATE_FORMAT_CAP_WITHOUT_DATE } from '../../Constants.js'
import moment from "moment";
import pdfIcon from '../../assets/img/pdf.png';
import csvicon from '../../assets/img/csv.png'
import "jspdf-autotable";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
const ref = React.createRef();
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}


class ConsumptionForecastError extends Component {
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - 10);
        this.state = {
            programs: [],
            planningUnits: [],
            versions: [],
            show: false,
            message: '',
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            loading: true,
            programId: '',
            versionId: '',
            planningUnitLabel: '',
            viewById: 1,
            regionList: [],
            regionVal: [],
            regionListFiltered: [],
            versionListAll: [{ versionId: 1, program: { label: "Benin PRH,Condoms Forecast Dataset", programId: 1 } }, { versionId: 1, program: { label: "Benin ARV Forecast Dataset", programId: 2 } }, { versionId: 1, program: { label: "Benin Malaria Forecast Dataset", programId: 3 } }, { versionId: 2, program: { label: "Benin PRH,Condoms Forecast Dataset", programId: 1 } }, { versionId: 2, program: { label: "Benin ARV Forecast Dataset", programId: 2 } }],
            forecastingUnits: [{ forecastingUnitId: 1, label: "Female Condom (Nitrile) Lubricated, 17 cm Female Condom" }, { forecastingUnitId: 2, label: "Male Condom (Latex) Lubricated, No Logo, 53 mm Male Condom" }, { forecastingUnitId: 3, label: "Male Condom (Latex) Lubricated, Prudence Plus, 53 mm Male Condom" }],
            planningUnitListAll: [{ planningUnitId: 1, label: "Female Condom (Nitrile) Lubricated, 17 cm Female Condom, 1 Each", forecastingUnit: { forecastingUnitId: 1, label: "Female Condom (Nitrile) Lubricated, 17 cm Female Condom" }, program: { programId: 1 } }, { planningUnitId: 2, label: "Male Condom (Latex) Lubricated, No Logo, 53 mm Male Condom, 1 Each", forecastingUnit: { forecastingUnitId: 2, label: "Male Condom (Latex) Lubricated, No Logo, 53 mm Male Condom" }, program: { programId: 1 } }, { planningUnitId: 3, label: "Male Condom (Latex) Lubricated, Prudence Plus, 53 mm Male Condom, 1 Each", forecastingUnit: { forecastingUnitId: 3, label: "Male Condom (Latex) Lubricated, Prudence Plus, 53 mm Male Condom" }, program: { programId: 1 } }, { planningUnitId: 4, label: "Female Condom (Nitrile) Lubricated, 17 cm Female Condom, 1000 Each", forecastingUnit: { forecastingUnitId: 1, label: "Female Condom (Nitrile) Lubricated, 17 cm Female Condom" }, program: { programId: 1 } }, { planningUnitId: 5, label: "Male Condom (Latex) Lubricated, No Logo, 53 mm Male Condom, 1000 Each", forecastingUnit: { forecastingUnitId: 2, label: "Male Condom (Latex) Lubricated, No Logo, 53 mm Male Condom" }, program: { programId: 1 } }, { planningUnitId: 6, label: "Male Condom (Latex) Lubricated, Prudence Plus, 53 mm Male Condom, 1000 Each", forecastingUnit: { forecastingUnitId: 3, label: "Male Condom (Latex) Lubricated, Prudence Plus, 53 mm Male Condom" }, program: { programId: 1 } }],
            planningUnits: [{ planningUnitId: 1, label: "Female Condom (Nitrile) Lubricated, 17 cm Female Condom, 1 Each", forecastingUnit: { forecastingUnitId: 1, label: "Female Condom (Nitrile) Lubricated, 17 cm Female Condom" }, program: { programId: 1 } }, { planningUnitId: 2, label: "Male Condom (Latex) Lubricated, No Logo, 53 mm Male Condom, 1 Each", forecastingUnit: { forecastingUnitId: 2, label: "Male Condom (Latex) Lubricated, No Logo, 53 mm Male Condom" }, program: { programId: 1 } }, { planningUnitId: 3, label: "Male Condom (Latex) Lubricated, Prudence Plus, 53 mm Male Condom, 1 Each", forecastingUnit: { forecastingUnitId: 3, label: "Male Condom (Latex) Lubricated, Prudence Plus, 53 mm Male Condom" }, program: { programId: 1 } }, { planningUnitId: 4, label: "Female Condom (Nitrile) Lubricated, 17 cm Female Condom, 1000 Each", forecastingUnit: { forecastingUnitId: 1, label: "Female Condom (Nitrile) Lubricated, 17 cm Female Condom" }, program: { programId: 1 } }, { planningUnitId: 5, label: "Male Condom (Latex) Lubricated, No Logo, 53 mm Male Condom, 1000 Each", forecastingUnit: { forecastingUnitId: 2, label: "Male Condom (Latex) Lubricated, No Logo, 53 mm Male Condom" }, program: { programId: 1 } }, { planningUnitId: 6, label: "Male Condom (Latex) Lubricated, Prudence Plus, 53 mm Male Condom, 1000 Each", forecastingUnit: { forecastingUnitId: 3, label: "Male Condom (Latex) Lubricated, Prudence Plus, 53 mm Male Condom" }, program: { programId: 1 } }],
            forecastingUnitId: "",
            showTotalForecast: true,
            showTotalActual: true,
            showTotalDifference: true,
            monthArrayList: [],
            planningUnitId: "",
            consumptionDataAll: [
                { consumptionDate: '2020-07-01', consumptionQty: 8, region: { regionId: 1 }, actualFlag: false },
                { consumptionDate: '2020-07-01', consumptionQty: 8, region: { regionId: 2 }, actualFlag: false },
                { consumptionDate: '2020-07-01', consumptionQty: 8, region: { regionId: 3 }, actualFlag: false },
                { consumptionDate: '2020-07-01', consumptionQty: 8, region: { regionId: 4 }, actualFlag: false },
                { consumptionDate: '2020-07-01', consumptionQty: 12, region: { regionId: 1 }, actualFlag: true },
                { consumptionDate: '2020-07-01', consumptionQty: 17, region: { regionId: 2 }, actualFlag: true },
                { consumptionDate: '2020-07-01', consumptionQty: 17, region: { regionId: 3 }, actualFlag: true },
                { consumptionDate: '2020-07-01', consumptionQty: 12, region: { regionId: 4 }, actualFlag: true },

                { consumptionDate: '2020-08-01', consumptionQty: 10, region: { regionId: 1 }, actualFlag: false },
                { consumptionDate: '2020-08-01', consumptionQty: 10, region: { regionId: 2 }, actualFlag: false },
                { consumptionDate: '2020-08-01', consumptionQty: 10, region: { regionId: 3 }, actualFlag: false },
                { consumptionDate: '2020-08-01', consumptionQty: 10, region: { regionId: 4 }, actualFlag: false },
                { consumptionDate: '2020-08-01', consumptionQty: 10, region: { regionId: 1 }, actualFlag: true },
                { consumptionDate: '2020-08-01', consumptionQty: 16, region: { regionId: 2 }, actualFlag: true },
                { consumptionDate: '2020-08-01', consumptionQty: 16, region: { regionId: 3 }, actualFlag: true },
                { consumptionDate: '2020-08-01', consumptionQty: 10, region: { regionId: 4 }, actualFlag: true },

                { consumptionDate: '2020-09-01', consumptionQty: 10, region: { regionId: 1 }, actualFlag: false },
                { consumptionDate: '2020-09-01', consumptionQty: 10, region: { regionId: 2 }, actualFlag: false },
                { consumptionDate: '2020-09-01', consumptionQty: 10, region: { regionId: 3 }, actualFlag: false },
                { consumptionDate: '2020-09-01', consumptionQty: 10, region: { regionId: 4 }, actualFlag: false },
                { consumptionDate: '2020-09-01', consumptionQty: 6, region: { regionId: 1 }, actualFlag: true },
                { consumptionDate: '2020-09-01', consumptionQty: 8, region: { regionId: 2 }, actualFlag: true },
                { consumptionDate: '2020-09-01', consumptionQty: 8, region: { regionId: 3 }, actualFlag: true },
                { consumptionDate: '2020-09-01', consumptionQty: 6, region: { regionId: 4 }, actualFlag: true },

                { consumptionDate: '2020-10-01', consumptionQty: 9, region: { regionId: 1 }, actualFlag: false },
                { consumptionDate: '2020-10-01', consumptionQty: 9, region: { regionId: 2 }, actualFlag: false },
                { consumptionDate: '2020-10-01', consumptionQty: 9, region: { regionId: 3 }, actualFlag: false },
                { consumptionDate: '2020-10-01', consumptionQty: 9, region: { regionId: 4 }, actualFlag: false },
                { consumptionDate: '2020-10-01', consumptionQty: 6, region: { regionId: 1 }, actualFlag: true },
                { consumptionDate: '2020-10-01', consumptionQty: 10, region: { regionId: 2 }, actualFlag: true },
                { consumptionDate: '2020-10-01', consumptionQty: 10, region: { regionId: 3 }, actualFlag: true },
                { consumptionDate: '2020-10-01', consumptionQty: 6, region: { regionId: 4 }, actualFlag: true },

                { consumptionDate: '2020-11-01', consumptionQty: 9, region: { regionId: 1 }, actualFlag: false },
                { consumptionDate: '2020-11-01', consumptionQty: 9, region: { regionId: 2 }, actualFlag: false },
                { consumptionDate: '2020-11-01', consumptionQty: 9, region: { regionId: 3 }, actualFlag: false },
                { consumptionDate: '2020-11-01', consumptionQty: 9, region: { regionId: 4 }, actualFlag: false },
                { consumptionDate: '2020-11-01', consumptionQty: 10, region: { regionId: 1 }, actualFlag: true },
                { consumptionDate: '2020-11-01', consumptionQty: 14, region: { regionId: 2 }, actualFlag: true },
                { consumptionDate: '2020-11-01', consumptionQty: 14, region: { regionId: 3 }, actualFlag: true },
                { consumptionDate: '2020-11-01', consumptionQty: 10, region: { regionId: 4 }, actualFlag: true },

                { consumptionDate: '2020-12-01', consumptionQty: 13, region: { regionId: 1 }, actualFlag: false },
                { consumptionDate: '2020-12-01', consumptionQty: 13, region: { regionId: 2 }, actualFlag: false },
                { consumptionDate: '2020-12-01', consumptionQty: 13, region: { regionId: 3 }, actualFlag: false },
                { consumptionDate: '2020-12-01', consumptionQty: 13, region: { regionId: 4 }, actualFlag: false },
                { consumptionDate: '2020-12-01', consumptionQty: 8, region: { regionId: 1 }, actualFlag: true },
                { consumptionDate: '2020-12-01', consumptionQty: 12, region: { regionId: 2 }, actualFlag: true },
                { consumptionDate: '2020-12-01', consumptionQty: 12, region: { regionId: 3 }, actualFlag: true },
                { consumptionDate: '2020-12-01', consumptionQty: 8, region: { regionId: 4 }, actualFlag: true },


                { consumptionDate: '2021-01-01', consumptionQty: 8, region: { regionId: 1 }, actualFlag: false },
                { consumptionDate: '2021-01-01', consumptionQty: 8, region: { regionId: 2 }, actualFlag: false },
                { consumptionDate: '2021-01-01', consumptionQty: 8, region: { regionId: 3 }, actualFlag: false },
                { consumptionDate: '2021-01-01', consumptionQty: 8, region: { regionId: 4 }, actualFlag: false },
                { consumptionDate: '2021-01-01', consumptionQty: 7, region: { regionId: 1 }, actualFlag: true },
                { consumptionDate: '2021-01-01', consumptionQty: 10, region: { regionId: 2 }, actualFlag: true },
                { consumptionDate: '2021-01-01', consumptionQty: 10, region: { regionId: 3 }, actualFlag: true },
                { consumptionDate: '2021-01-01', consumptionQty: 7, region: { regionId: 4 }, actualFlag: true },

                { consumptionDate: '2021-02-01', consumptionQty: 9, region: { regionId: 1 }, actualFlag: false },
                { consumptionDate: '2021-02-01', consumptionQty: 9, region: { regionId: 2 }, actualFlag: false },
                { consumptionDate: '2021-02-01', consumptionQty: 9, region: { regionId: 3 }, actualFlag: false },
                { consumptionDate: '2021-02-01', consumptionQty: 9, region: { regionId: 4 }, actualFlag: false },

                { consumptionDate: '2021-03-01', consumptionQty: 9, region: { regionId: 1 }, actualFlag: false },
                { consumptionDate: '2021-03-01', consumptionQty: 9, region: { regionId: 2 }, actualFlag: false },
                { consumptionDate: '2021-03-01', consumptionQty: 9, region: { regionId: 3 }, actualFlag: false },
                { consumptionDate: '2021-03-01', consumptionQty: 9, region: { regionId: 4 }, actualFlag: false },

                { consumptionDate: '2021-04-01', consumptionQty: 9, region: { regionId: 1 }, actualFlag: false },
                { consumptionDate: '2021-04-01', consumptionQty: 9, region: { regionId: 2 }, actualFlag: false },
                { consumptionDate: '2021-04-01', consumptionQty: 9, region: { regionId: 3 }, actualFlag: false },
                { consumptionDate: '2021-04-01', consumptionQty: 9, region: { regionId: 4 }, actualFlag: false },

                { consumptionDate: '2021-05-01', consumptionQty: 9, region: { regionId: 1 }, actualFlag: false },
                { consumptionDate: '2021-05-01', consumptionQty: 9, region: { regionId: 2 }, actualFlag: false },
                { consumptionDate: '2021-05-01', consumptionQty: 9, region: { regionId: 3 }, actualFlag: false },
                { consumptionDate: '2021-05-01', consumptionQty: 9, region: { regionId: 4 }, actualFlag: false },

                { consumptionDate: '2021-06-01', consumptionQty: 9, region: { regionId: 1 }, actualFlag: false },
                { consumptionDate: '2021-06-01', consumptionQty: 9, region: { regionId: 2 }, actualFlag: false },
                { consumptionDate: '2021-06-01', consumptionQty: 9, region: { regionId: 3 }, actualFlag: false },
                { consumptionDate: '2021-06-01', consumptionQty: 9, region: { regionId: 4 }, actualFlag: false },
            ],
            consumptionData: [],
            errorValues: ["39%", "66%", "48%", "32%", "30%", "37%", "32%", "28%", "NA", "NA", "NA", "NA", "NA"]

        };
        this.getPrograms = this.getPrograms.bind(this);
        this.filterData = this.filterData.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.setViewById = this.setViewById.bind(this);
        // this.getProductCategories = this.getProductCategories.bind(this);
        //this.pickRange = React.createRef()
        this.setProgramId = this.setProgramId.bind(this);
        this.setVersionId = this.setVersionId.bind(this);
        // this.setVersionId = this.setVersionId.bind(this);
        this.setForecastingUnit = this.setForecastingUnit.bind(this);
        this.setRegionVal = this.setRegionVal.bind(this);
        this.toggleAccordionTotalActual = this.toggleAccordionTotalActual.bind(this);
        this.toggleAccordionTotalF = this.toggleAccordionTotalForecast.bind(this);
        this.toggleAccordionTotalDiffernce = this.toggleAccordionTotalDiffernce.bind(this);
        this.storeProduct = this.storeProduct.bind(this)

    }

    storeProduct(e) {
        console.log("E++++++++", e.target)
        var name = this.state.planningUnits.filter(c => c.planningUnitId == e.target.value);
        var planningUnitId = e.target.value;
        this.setState({
            planningUnitId: e.target.value,
            planningUnitLabel: name[0].label,
        }, () => {
            if (planningUnitId > 0) {
                this.showData();
            }
        })
    }

    toggleAccordionTotalActual() {
        this.setState({
            showTotalActual: !this.state.showTotalActual
        })
        var fields = document.getElementsByClassName("totalActual");
        for (var i = 0; i < fields.length; i++) {
            if (!this.state.showTotalActual == true) {
                fields[i].style.display = "";
            } else {
                fields[i].style.display = "none";
            }
        }
    }

    toggleAccordionTotalForecast() {
        this.setState({
            showTotalForecast: !this.state.showTotalForecast
        })
        var fields = document.getElementsByClassName("totalForecast");
        for (var i = 0; i < fields.length; i++) {
            if (!this.state.showTotalForecast == true) {
                fields[i].style.display = "";
            } else {
                fields[i].style.display = "none";
            }
        }
    }

    toggleAccordionTotalDiffernce() {
        this.setState({
            showTotalDifference: !this.state.showTotalDifference
        })
        var fields = document.getElementsByClassName("totalDifference");
        for (var i = 0; i < fields.length; i++) {
            if (!this.state.showTotalDifference == true) {
                fields[i].style.display = "";
            } else {
                fields[i].style.display = "none";
            }
        }
    }

    setRegionVal(e) {
        console.log("e+++", e);
        var regionIdArr = [];
        for (var i = 0; i < e.length; i++) {
            regionIdArr.push(e[i].value);
        }
        var regionListFiltered = this.state.regionList.filter(c => regionIdArr.includes(c.value));
        this.setState({
            regionVal: e,
            regionListFiltered,
            regionIdArr
        })
    }

    showData() {
        var consumptionData = this.state.consumptionDataAll;
        this.setState({
            consumptionData: consumptionData
        })
    }

    setForecastingUnit(e) {
        var forecastingUnitId = e.target.value;
        this.setState({
            forecastingUnitId: e.target.value
        }, () => {
            this.filterPlanningUnit()
            if (this.state.viewById == 2 && forecastingUnitId) {
                this.showData();
            }
        })
    }

    filterPlanningUnit() {
        var planningUnitListAll = this.state.planningUnitListAll;
        var planningUnits = planningUnitListAll.filter(c => c.program.programId == this.state.programId && c.forecastingUnit.forecastingUnitId == this.state.forecastingUnitId);
        this.setState({
            planningUnits
        })
    }

    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));

    exportCSV() {
    }


    exportPDF = () => {
    }

    filterData() {
        let programId = document.getElementById("programId").value;
        let viewById = document.getElementById("viewById").value;
        let versionId = document.getElementById("versionId").value;
        let planningUnitId = document.getElementById("planningUnitId").value;
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
        console.log('values =>', planningUnitId, programId, versionId);
        if (planningUnitId > 0 && programId > 0 && versionId != 0) {
        }
    }


    getPrograms() {
        this.setState({ programs: [{ label: "Benin PRH,Condoms Forecast Dataset", programId: 1 }, { label: "Benin ARV Forecast Dataset", programId: 2 }, { label: "Benin Malaria Forecast Dataset", programId: 3 }], loading: false });
    }

    componentDidMount() {
        this.getPrograms();
        this.setState({
            regionVal: [{ label: "East", value: 1 }, { label: "West", value: 2 }, { label: "North", value: 3 }, { label: "South", value: 4 }],
            regionList: [{ label: "East", value: 1 }, { label: "West", value: 2 }, { label: "North", value: 3 }, { label: "South", value: 4 }],
            regionListFiltered: [{ label: "East", value: 1 }, { label: "West", value: 2 }, { label: "North", value: 3 }, { label: "South", value: 4 }],
            regionIdArr: [1, 2, 3, 4]
        })
    }

    setProgramId(event) {
        this.setState({
            programId: event.target.value,
        }, () => {
            // localStorage.setItem("sesVersionIdReport", '');
            this.getVersionIds();
        })
    }

    setVersionId(event) {
        this.setState({
            versionId: event.target.value,
        }, () => {
            // localStorage.setItem("sesVersionIdReport", '');
            // this.filterVersion();
        })
    }

    getVersionIds() {
        var versionListAll = this.state.versionListAll;
        var planningUnitListAll = this.state.planningUnitListAll;
        var reportPeriod = [{ programId: 2, startDate: '2020-09-01', endDate: '2021-08-30' }, { programId: 1, startDate: '2020-07-01', endDate: '2021-06-30' }, { programId: 3, startDate: '2020-11-01', endDate: '2021-10-30' }];
        var startDate = reportPeriod.filter(c => c.programId == this.state.programId)[0].startDate;
        var endDate = reportPeriod.filter(c => c.programId == this.state.programId)[0].endDate;

        var rangeValue = { from: { year: new Date(startDate).getFullYear(), month: new Date(startDate).getMonth() + 1 }, to: { year: new Date(endDate).getFullYear(), month: new Date(endDate).getMonth() + 1 } }
        let stopDate = endDate;
        var monthArrayList = [];
        let cursorDate = startDate;
        for (var i = 0; moment(cursorDate).format("YYYY-MM") <= moment(stopDate).format("YYYY-MM"); i++) {
            var dt = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
            cursorDate = moment(cursorDate).add(1, 'months').format("YYYY-MM-DD");
            monthArrayList.push(dt);
        }
        this.setState({ versions: versionListAll.filter(c => c.program.programId == this.state.programId), loading: false, planningUnits: planningUnitListAll.filter(c => c.program.programId == this.state.programId), rangeValue: rangeValue, monthArrayList: monthArrayList });
    }

    show() {

    }
    handleRangeChange(value, text, listIndex) {

    }
    handleRangeDissmis(value) {
        let startDate = value.from.year + '-' + value.from.month + '-01';
        let stopDate = value.to.year + '-' + value.to.month + '-' + new Date(value.to.year, value.to.month, 0).getDate();
        var monthArrayList = [];
        let cursorDate = value.from.year + '-' + value.from.month + '-01';
        for (var i = 0; moment(cursorDate).format("YYYY-MM") <= moment(stopDate).format("YYYY-MM"); i++) {
            var dt = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
            cursorDate = moment(cursorDate).add(1, 'months').format("YYYY-MM-DD");
            monthArrayList.push(dt);
        }
        this.setState({ rangeValue: value, monthArrayList: monthArrayList }, () => {
            this.filterData();
        })

    }

    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }
    loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>

    dateFormatterLanguage = value => {
        if (moment(value).format('MM') === '01') {
            return (i18n.t('static.month.jan') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '02') {
            return (i18n.t('static.month.feb') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '03') {
            return (i18n.t('static.month.mar') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '04') {
            return (i18n.t('static.month.apr') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '05') {
            return (i18n.t('static.month.may') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '06') {
            return (i18n.t('static.month.jun') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '07') {
            return (i18n.t('static.month.jul') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '08') {
            return (i18n.t('static.month.aug') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '09') {
            return (i18n.t('static.month.sep') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '10') {
            return (i18n.t('static.month.oct') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '11') {
            return (i18n.t('static.month.nov') + ' ' + moment(value).format('YY'))
        } else {
            return (i18n.t('static.month.dec') + ' ' + moment(value).format('YY'))
        }
    }

    setViewById(e) {
        console.log("e.targetvakue+++", e.target.value)
        var viewById = e.target.value;
        this.setState({
            viewById: viewById,
            planningUnitId: ""
        }, () => {
            if (viewById == 2) {
                document.getElementById("planningUnitDiv").style.display = "none";
            } else {
                document.getElementById("planningUnitDiv").style.display = "block";
            }
        })
    }

    render() {

        var chartOptions = {
            title: {
                display: true,
                text: this.state.planningUnitLabel != "" && this.state.planningUnitLabel != undefined && this.state.planningUnitLabel != null ? "Forecast Error" + " - " + this.state.planningUnitLabel : "Forecast Error"
            },
            scales: {
                yAxes: [{
                    id: 'A',
                    scaleLabel: {
                        display: true,
                        labelString: "Forecast Error",
                        fontColor: 'black'
                    },
                    stacked: false,
                    ticks: {
                        beginAtZero: true,
                        fontColor: 'black',
                        callback: function (value) {
                            return value.toLocaleString();
                        }
                    },
                    gridLines: {
                        drawBorder: true, lineWidth: 0
                    },
                    position: 'left',
                },
                {
                    id: 'B',
                    scaleLabel: {
                        display: true,
                        labelString: "Units",
                        fontColor: 'black'
                    },
                    stacked: false,
                    ticks: {
                        beginAtZero: true,
                        fontColor: 'black'
                    },
                    gridLines: {
                        drawBorder: true, lineWidth: 0
                    },
                    position: 'right',
                }
                ],
                xAxes: [{
                    ticks: {
                        fontColor: 'black'
                    },
                    gridLines: {
                        drawBorder: true, lineWidth: 0
                    }
                }]
            },
            tooltips: {
                callbacks: {
                    label: function (tooltipItems, data) {
                        if (tooltipItems.datasetIndex == 0) {
                            var details = this.state.expiredStockArr[tooltipItems.index].details;
                            var infoToShow = [];
                            details.map(c => {
                                infoToShow.push(c.batchNo + " - " + c.expiredQty.toLocaleString());
                            });
                            return (infoToShow.join(' | '));
                        } else {
                            return (tooltipItems.yLabel.toLocaleString());
                        }
                    }.bind(this)
                },
                enabled: false,
                custom: CustomTooltips
            },
            maintainAspectRatio: false
            ,
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    fontColor: 'black'
                }
            }
        }


        let bar = {}
        var consumptionData = this.state.consumptionData;
        var actualConsumption = [];
        var forecastedConsumption = [];
        this.state.monthArrayList.map((item) => {
            var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
            var sum = 0;
            cd.map(c => { sum += c.consumptionQty });
            actualConsumption.push(sum);
            var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
            var sum = 0;
            cd.map(c => { sum += c.consumptionQty });
            forecastedConsumption.push(sum);
        })
        if (this.state.consumptionData.length > 0)
            bar = {

                labels: [...new Set(this.state.monthArrayList.map(ele => (moment(ele).format(DATE_FORMAT_CAP_WITHOUT_DATE))))],
                datasets: [
                    {
                        label: i18n.t('static.consumption.forcast'),
                        stack: 1,
                        yAxisID: 'B',
                        backgroundColor: '#8064a2',
                        borderColor: '#8064a2',
                        pointBackgroundColor: '#8064a2',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#8064a2',
                        data: forecastedConsumption,
                        barPercentage: 0.5
                    },
                    {
                        label: i18n.t('static.consumption.actual'),
                        stack: 3,
                        yAxisID: 'B',
                        backgroundColor: '#a6a6a6',
                        borderColor: '#a6a6a6',
                        pointBackgroundColor: '#a6a6a6',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#a6a6a6',
                        data: actualConsumption,
                        barPercentage: 0.5
                    }, {
                        label: i18n.t('static.supplyPlan.consumption'),
                        type: 'line',
                        stack: 4,
                        yAxisID: 'A',
                        backgroundColor: 'transparent',
                        borderColor: 'orange',
                        borderStyle: 'dotted',
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent',
                        },
                        lineTension: 0,
                        pointStyle: 'line',
                        pointRadius: 0,
                        showInLegend: true,
                        data: [39, 66, 48, 32, 30, 37, 32, 28, "", "", "", "", ""]
                    }
                ]

            };

        const { planningUnits } = this.state;
        const { forecastingUnits } = this.state;
        const { programs } = this.state;
        let programList = programs.length > 0
            && programs.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
                        {item.label}
                    </option>
                )
            }, this);

        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {item.versionId}
                    </option>
                )
            }, this);

        const pickerLang = {
            months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
            from: 'From', to: 'To',
        }
        const { rangeValue } = this.state
        const checkOnline = localStorage.getItem('sessionType');

        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }

        return (
            <div className="animated fadeIn" >
                <AuthenticationServiceComponent history={this.props.history} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>

                <Card>
                    <div className="Card-header-reporticon pb-2">
                        {checkOnline === 'Online' &&
                            this.state.consumptionData.length > 0 &&
                            <div className="card-header-actions">
                                <a className="card-header-action">

                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />


                                </a>
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                            </div>
                        }
                        {checkOnline === 'Offline' &&
                            this.state.offlineConsumptionList.length > 0 &&
                            <div className="card-header-actions">
                                <a className="card-header-action">

                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />

                                </a>
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                            </div>
                        }
                    </div>
                    <CardBody className="pb-lg-2 pt-lg-0 ">
                        <div>
                            <div ref={ref}>
                                <Form >
                                    <div className="pl-0">
                                        <div className="row">
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="programId"
                                                            id="programId"
                                                            bsSize="sm"
                                                            // onChange={this.filterVersion}
                                                            onChange={(e) => { this.setProgramId(e); }}
                                                            value={this.state.programId}

                                                        >
                                                            <option value="-1">{i18n.t('static.common.select')}</option>
                                                            {programList}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon fa fa-sort-desc ml-1"></span></Label>
                                                <div className="controls edit">

                                                    <Picker
                                                        ref="pickRange"
                                                        years={{ min: this.state.minDate, max: this.state.maxDate }}
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
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.version')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="versionId"
                                                            id="versionId"
                                                            bsSize="sm"
                                                            // onChange={this.filterVersion}
                                                            onChange={(e) => { this.setVersionId(e); }}
                                                            value={this.state.versionId}

                                                        >
                                                            <option value="-1">{i18n.t('static.common.select')}</option>
                                                            {versionList}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.timeWindow')}</Label>
                                                <div className="controls">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="viewById"
                                                            id="viewById"
                                                            bsSize="sm"
                                                            onChange={this.fetchData}
                                                        >
                                                            <option value="5">6 {i18n.t('static.dashboard.months')}</option>
                                                            <option value="2">3 {i18n.t('static.dashboard.months')}</option>
                                                            <option value="8">9 {i18n.t('static.dashboard.months')}</option>
                                                            <option value="11">12 {i18n.t('static.dashboard.months')}</option>
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.common.display')}</Label>
                                                <div className="controls">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="viewById"
                                                            id="viewById"
                                                            bsSize="sm"
                                                            value={this.state.viewById}
                                                            onChange={this.setViewById}
                                                        >
                                                            <option value="1">{i18n.t('static.report.planningUnit')}</option>
                                                            <option value="2">{i18n.t('static.dashboard.forecastingunit')}</option>
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.product.unit1')}</Label>
                                                <div className="controls">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="foreccastingUnitId"
                                                            id="forecastingUnitId"
                                                            value={this.state.forecastingUnitId}
                                                            onChange={this.setForecastingUnit}
                                                            bsSize="sm"
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {forecastingUnits.length > 0
                                                                && forecastingUnits.map((item, i) => {
                                                                    return (
                                                                        <option key={i} value={item.forecastingUnitId}>
                                                                            {item.label}
                                                                        </option>
                                                                    )
                                                                }, this)}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>


                                            <FormGroup className="col-md-3" id="planningUnitDiv">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.planningUnit')}</Label>
                                                <div className="controls">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="planningUnitId"
                                                            id="planningUnitId"
                                                            bsSize="sm"
                                                            onChange={this.filterData}
                                                            value={this.state.planningUnitId}
                                                            onChange={(e) => { this.storeProduct(e); }}
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {planningUnits.length > 0
                                                                && planningUnits.map((item, i) => {
                                                                    return (
                                                                        <option key={i} value={item.planningUnitId}>
                                                                            {item.label}
                                                                        </option>
                                                                    )
                                                                }, this)}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.program.region')}</Label>
                                                <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                                <div className="controls ">
                                                    {/* <InputGroup className="box"> */}
                                                    <MultiSelect
                                                        name="regionId"
                                                        id="regionId"
                                                        options={this.state.regionList && this.state.regionList.length > 0 ? this.state.regionList : []}
                                                        value={this.state.regionVal}
                                                        onChange={(e) => { this.setRegionVal(e) }}
                                                        // onChange={(e) => { this.handlePlanningUnitChange(e) }}
                                                        labelledBy={i18n.t('static.common.select')}
                                                    />

                                                </div>
                                            </FormGroup>

                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.yaxisEquUnit')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="yaxisEquUnit"
                                                            id="yaxisEquUnit"
                                                            bsSize="sm"
                                                        // onChange={(e) => { this.dataChange(e); this.formSubmit() }}
                                                        >
                                                            <option value="true">{i18n.t('static.program.yes')}</option>
                                                            <option value="false">{i18n.t('static.program.no')}</option>
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.consumptionAdjustedForStock')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="consumptionAdjusted"
                                                            id="consumptionAdjusted"
                                                            bsSize="sm"
                                                        // onChange={(e) => { this.dataChange(e); this.formSubmit() }}
                                                        >
                                                            <option value="true">{i18n.t('static.program.yes')}</option>
                                                            <option value="false">{i18n.t('static.program.no')}</option>
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                        </div>
                                    </div>
                                </Form>

                                <Col md="12 pl-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                    <div className="row">
                                        {this.state.consumptionData.length > 0
                                            &&
                                            <div className="col-md-12 p-0">
                                                <div className="col-md-12">
                                                    <div className="chart-wrapper chart-graph-report pl-5 ml-3" style={{ marginLeft: '50px' }}>
                                                        <Bar id="cool-canvas" data={bar} options={chartOptions} />
                                                        <div>

                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <button className="mr-1 mb-2 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}>
                                                        {this.state.show ? i18n.t('static.common.hideData') : i18n.t('static.common.showData')}
                                                    </button>

                                                </div>
                                            </div>}




                                    </div>



                                    <div className="row">
                                        <div className="col-md-12 pl-0 pr-0">
                                            {this.state.show &&
                                                <div className="table-scroll">
                                                    <div className="table-wrap table-responsive">
                                                        <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm" options={this.options}>
                                                            <thead>
                                                                <tr>
                                                                    <th className="BorderNoneSupplyPlan sticky-col first-col clone1"></th>
                                                                    <th className="forecastErrorTdWidth sticky-col first-col clone"></th>
                                                                    <th className="">{i18n.t("static.report.average")}</th>
                                                                    {this.state.monthArrayList.map(item => (
                                                                        <th>{moment(item).format(DATE_FORMAT_CAP_WITHOUT_DATE)}</th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                    <td align="left" className="sticky-col first-col clone" style={{ color: '#8064a2' }}><b>{i18n.t('static.forecastReport.error')}*</b></td>
                                                                    {this.state.errorValues.map(item => (
                                                                        <td>{item}</td>
                                                                    ))}
                                                                </tr>
                                                                <tr>
                                                                    <td className="BorderNoneSupplyPlan sticky-col first-col clone1" onClick={() => this.toggleAccordionTotalForecast()}>
                                                                        {this.state.showTotalForecast ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                                                    </td>
                                                                    <td align="left" className="sticky-col first-col clone" style={{ color: "#4f81bd" }}><b>{i18n.t('static.consumption.forcast')}</b></td>
                                                                    <td align="center"><b>39.4</b></td>
                                                                    {this.state.monthArrayList.map(item => {
                                                                        var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
                                                                        var sum = 0;
                                                                        cd.map(c => { sum += c.consumptionQty });
                                                                        return (<td><b>{sum}</b></td>)
                                                                    })}
                                                                </tr>
                                                                {this.state.regionListFiltered.map(item1 => (
                                                                    <tr className="totalForecast">
                                                                        <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                        <td align="left" className="sticky-col first-col clone" style={{ color: "#4f81bd" }}><b>{item1.label}</b></td>
                                                                        <td align="center">9.5</td>
                                                                        {this.state.monthArrayList.map(item => {
                                                                            var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && c.region.regionId == item1.value);
                                                                            return (<td>{cd.length > 0 ? cd[0].consumptionQty : ""}</td>)
                                                                        })}
                                                                    </tr>
                                                                ))}
                                                                <tr>
                                                                    <td className="BorderNoneSupplyPlan sticky-col first-col clone1" onClick={() => this.toggleAccordionTotalActual()}>
                                                                        {this.state.showTotalActual ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                                                    </td>
                                                                    <td align="left" className="sticky-col first-col clone" style={{ color: "#a6a6a6" }}><b>{i18n.t('static.consumption.actual')}</b></td>
                                                                    <td align="center"><b>41.7</b></td>
                                                                    {this.state.monthArrayList.map(item => {
                                                                        var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
                                                                        var sum = 0;
                                                                        cd.map(c => { sum += c.consumptionQty });
                                                                        return (<td><b>{cd.length > 0 ? sum : "NA"}</b></td>)
                                                                    })}
                                                                </tr>
                                                                {this.state.regionListFiltered.map(item1 => (
                                                                    <tr className="totalActual">
                                                                        <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                        <td align="left" className="sticky-col first-col clone" style={{ color: "#a6a6a6" }}><b>{item1.label}</b></td>
                                                                        <td align="center">{item1.value == 1 ? 8.4 : item1.value == 2 ? 12.4 : item1.value == 3 ? 12.4 : 8.4}</td>
                                                                        {this.state.monthArrayList.map(item => {
                                                                            var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && c.region.regionId == item1.value);
                                                                            return (<td>{cd.length > 0 ? cd[0].consumptionQty : ""}</td>)
                                                                        })}
                                                                    </tr>
                                                                ))}
                                                                <tr>
                                                                    <td className="BorderNoneSupplyPlan sticky-col first-col clone1" onClick={() => this.toggleAccordionTotalDiffernce()}>
                                                                        {this.state.showTotalDifference ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                                                    </td>
                                                                    <td align="left" className="sticky-col first-col clone"><b>{i18n.t('static.forecastReport.difference')}</b></td>
                                                                    <td align="center"><b>2.3</b></td>
                                                                    {this.state.monthArrayList.map(item => {
                                                                        var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
                                                                        var sum = 0;
                                                                        cd.map(c => { sum += c.consumptionQty });
                                                                        var cd1 = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
                                                                        var sum1 = 0;
                                                                        cd1.map(c => { sum1 += c.consumptionQty });
                                                                        return (<td><b>{sum1 > 0 ? sum1 - sum : "NA"}</b></td>)
                                                                    })}
                                                                </tr>
                                                                {this.state.regionListFiltered.map(item1 => (
                                                                    <tr className="totalDifference">
                                                                        <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                        <td align="left" className="sticky-col first-col clone"><b>{item1.label}</b></td>
                                                                        <td align="center">{item1.value == 1 ? -1.4 : item1.value == 2 ? 2.6 : item1.value == 3 ? 2.6 : -1.4}</td>
                                                                        {this.state.monthArrayList.map(item => {
                                                                            var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && c.region.regionId == item1.value);
                                                                            var cd1 = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && c.region.regionId == item1.value);
                                                                            return (<td>{(cd.length > 0 && cd1.length > 0) ? cd[0].consumptionQty - cd1[0].consumptionQty : ""}</td>)
                                                                        })}
                                                                    </tr>
                                                                ))}
                                                            </tbody>

                                                        </Table>

                                                    </div>
                                                </div>}
                                        </div>
                                    </div>

                                </Col>
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
                        </div>
                    </CardBody>
                </Card>
            </div >
        );
    }
}

export default ConsumptionForecastError;