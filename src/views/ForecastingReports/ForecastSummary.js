import React, { Component, lazy } from 'react';
import {
    Card,
    CardBody,
    Col,
    Table, FormGroup, Input, InputGroup, Label, Form, Button, ModalHeader, ModalBody, Modal, CardFooter, Row
} from 'reactstrap';
import i18n from '../../i18n'
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import CryptoJS from 'crypto-js'
import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME, polling, DATE_FORMAT_CAP_WITHOUT_DATE, REPORT_DATEPICKER_START_MONTH, REPORT_DATEPICKER_END_MONTH, TITLE_FONT, API_URL, PROGRAM_TYPE_DATASET } from '../../Constants.js'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import pdfIcon from '../../assets/img/pdf.png';
import csvicon from '../../assets/img/csv.png'
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideFirstComponent, isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { Prompt } from 'react-router';
import ReportService from '../../api/ReportService';
import DropdownService from '../../api/DropdownService';
import { DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION, JEXCEL_DATE_FORMAT_SM, JEXCEL_PRO_KEY } from '../../Constants.js';
import showguidanceforForecastSummaryEn from '../../../src/ShowGuidanceFiles/ForecastSummaryEn.html'
import showguidanceforForecastSummaryFr from '../../../src/ShowGuidanceFiles/ForecastSummaryFr.html'
import showguidanceforForecastSummaryPr from '../../../src/ShowGuidanceFiles/ForecastSummaryPr.html'
import showguidanceforForecastSummarySp from '../../../src/ShowGuidanceFiles/ForecastSummarySp.html'


const ref = React.createRef();
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
const months = [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')]

class ForecastSummary extends Component {
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
            message1: '',
            color: '',
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            loading: true,
            programId: '',
            versionId: -1,
            planningUnitLabel: '',
            viewById: 1,
            regionList: [],
            regionVal: [],
            regionListFiltered: [],
            versionListAll: [{ versionId: 1, program: { label: "Benin PRH,Condoms Forecast Dataset", programId: 1 } }, { versionId: 1, program: { label: "Benin ARV Forecast Dataset", programId: 2 } }, { versionId: 1, program: { label: "Benin Malaria Forecast Dataset", programId: 3 } }, { versionId: 2, program: { label: "Benin PRH,Condoms Forecast Dataset", programId: 1 } }, { versionId: 2, program: { label: "Benin ARV Forecast Dataset", programId: 2 } }],
            showTotalForecast: true,
            showTotalActual: true,
            showTotalDifference: true,
            monthArrayList: [],
            planningUnitId: "",
            hideCalculation: false,
            failedValidationCount: [],
            scenarioList: [{ id: 1, name: "A. Consumption High", checked: true, color: "#4f81bd" },
            { id: 2, name: "B. Consumption Med", checked: true, color: "#f79646" },
            { id: 3, name: "C. Consumption Low", checked: true, color: "#000000" },
            { id: 4, name: "D. Morbidity - assumption Y", checked: true, color: "#ff0000" },
            { id: 5, name: "E. Demographic", checked: true, color: "#604a7b" }],
            consumptionData: [
                { forecastingUnit: { id: 1, label: "Abacavir 300 mg Tablet" }, planningUnit: { id: 1, label: "Abacavir 300 mg Tablet, 60 Tablets" }, scenario: { id: 3 }, consumptionQty: 44556, startingStock: 6188, existingShipmentQty: 48120, desiredMonthsOfStock: 5, priceType: 1, price: 0.81 },
                { forecastingUnit: { id: 2, label: "Benzylpenicillin 5 MU Vial" }, planningUnit: { id: 2, label: "Benzylpenicillin 5 MU Vial, 10 Vials" }, scenario: { id: 1 }, consumptionQty: 51721, startingStock: 7183, existingShipmentQty: 50687, desiredMonthsOfStock: 5, priceType: 2, price: 1.04 },
                { forecastingUnit: { id: 3, label: "Lamivudine 150 mg Tablet" }, planningUnit: { id: 3, label: "Lamivudine 150 mg Tablet, 30 Tablets" }, scenario: { id: 3 }, consumptionQty: 36412, startingStock: 6069, existingShipmentQty: 33863, desiredMonthsOfStock: 5, priceType: 2, price: 43 },
                { forecastingUnit: { id: 4, label: "Lamivudine 10 mg/mL Solution" }, planningUnit: { id: 4, label: "Lamivudine 10 mg/mL Solution, 100 mL" }, scenario: { id: 4 }, consumptionQty: 24421, startingStock: 5427, existingShipmentQty: 23933, desiredMonthsOfStock: 5, priceType: 2, price: 3 },
                { forecastingUnit: { id: 5, label: "Paracetamol 500 mg Tablet" }, planningUnit: { id: 5, label: "Paracetamol 500 mg Tablet, 1000 Tablets" }, scenario: { id: 5 }, consumptionQty: 50152, startingStock: 5572, existingShipmentQty: 49650, desiredMonthsOfStock: 5, priceType: 2, price: 542 },
                { forecastingUnit: { id: 6, label: "Malaria Rapid Diagnostic Test (RDT) HRP2 (Pf) Cassette" }, planningUnit: { id: 6, label: "Malaria Rapid Diagnostic Test (RDT) HRP2 (Pf) Cassette, 25 Single Test Kits" }, scenario: { id: 1 }, consumptionQty: 45904, startingStock: 5100, existingShipmentQty: 44527, desiredMonthsOfStock: 5, priceType: 2, price: 3 },

                { forecastingUnit: { id: 6, label: 'Examination Gloves (Latex) Large, Powder-Free, Non-Sterile' }, planningUnit: { id: 6, label: 'Examination Gloves (Latex) Large, Powder-Free, Non-Sterile, 100 Each' }, scenario: { id: 3 }, consumptionQty: '95366', startingStock: '21192.4444444444', existingShipmentQty: '86783.06', desiredMonthsOfStock: 5, priceType: 2, price: '4' },
                { forecastingUnit: { id: 6, label: 'Gauze, Sterile, 12 Ply, 4 x 4 in (10 x 10 cm)' }, planningUnit: { id: 6, label: 'Gauze, Sterile, 12 Ply, 4 x 4 in (10 x 10 cm), 100 Pieces' }, scenario: { id: 3 }, consumptionQty: '62785', startingStock: '10464.1666666667', existingShipmentQty: '60901.45', desiredMonthsOfStock: 5, priceType: 2, price: '4.1' },
                { forecastingUnit: { id: 6, label: 'MC Kit, Sterile, Single Use, Forceps Guided Procedure, 2017' }, planningUnit: { id: 6, label: 'MC Kit, Sterile, Single Use, Forceps Guided Procedure, 2017, 1 Kit' }, scenario: { id: 3 }, consumptionQty: '54177', startingStock: '12039.3333333333', existingShipmentQty: '56344.08', desiredMonthsOfStock: 5, priceType: 2, price: '51' },
                { forecastingUnit: { id: 6, label: 'Male Condom (Latex) Lubricated, No Logo, 49 mm Male Condom' }, planningUnit: { id: 6, label: 'Male Condom (Latex) Lubricated, No Logo, 49 mm, 1 Each' }, scenario: { id: 3 }, consumptionQty: '70748', startingStock: '9826.11111111111', existingShipmentQty: '71455.48', desiredMonthsOfStock: 5, priceType: 2, price: '4.1' },
                { forecastingUnit: { id: 6, label: 'Male Condom (Latex) Lubricated, Ultimate Blue, 53 mm Male Condom' }, planningUnit: { id: 6, label: 'Male Condom (Latex) Lubricated, Ultimate Blue, 53 mm, 4320 Pieces' }, scenario: { id: 3 }, consumptionQty: '77219', startingStock: '15014.8055555556', existingShipmentQty: '74130.24', desiredMonthsOfStock: 5, priceType: 2, price: '5.1' },
                { forecastingUnit: { id: 6, label: 'Long Lasting Insecticide Treated Net (LLIN) 190x160x180 cm (LxWxH) Rectangular (Light Blue)' }, planningUnit: { id: 6, label: 'Long Lasting Insecticide Treated Net (LLIN) 190x160x180 cm (LxWxH) Rectangular (Light Blue), 1 Each' }, scenario: { id: 3 }, consumptionQty: '88216', startingStock: '14702.6666666667', existingShipmentQty: '90862.48', desiredMonthsOfStock: 5, priceType: 2, price: '55' },
                { forecastingUnit: { id: 6, label: 'Long Lasting Insecticide Treated Net (LLIN) 190x160x180 cm (LxWxH) Rectangular (Light Blue)' }, planningUnit: { id: 6, label: 'Long Lasting Insecticide Treated Net (LLIN) 190x160x180 cm (LxWxH) Rectangular (Light Blue), 1 Each' }, scenario: { id: 3 }, consumptionQty: '71032', startingStock: '7892.44444444444', existingShipmentQty: '64639.12', desiredMonthsOfStock: 5, priceType: 2, price: '5.9' }

            ],
            errorValues: ["39%", "66%", "48%", "32%", "30%", "37%", "32%", "28%", "NA", "NA", "NA", "NA", "NA"],
            summeryData: [],
            forecastPeriod: '',
            startDateDisplay: '',
            endDateDisplay: '',
            beforeEndDateDisplay: '',
            totalProductCost: 0,
            regPlanningUnitList: [],
            hideColumn: false,
            currencyId: '',
            dataArray: [],
            lang: localStorage.getItem('lang'),
            downloadedProgramData: [],
            allProgramList: [],
            regRegionList: [],
            isChanged1: false,
            onlineVersion: true,
            tracerCategoryList: [],
            freightPerc: '',
            displayId: 2,
            displayName: i18n.t('static.forecastReport.regionalView'),

        };
        this.getPrograms = this.getPrograms.bind(this);
        this.filterData = this.filterData.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.setViewById = this.setViewById.bind(this);
        this.setProgramId = this.setProgramId.bind(this);
        this.setVersionId = this.setVersionId.bind(this);
        this.setForecastingUnit = this.setForecastingUnit.bind(this);
        this.setRegionVal = this.setRegionVal.bind(this);
        this.toggleAccordionTotalActual = this.toggleAccordionTotalActual.bind(this);
        this.toggleAccordionTotalF = this.toggleAccordionTotalForecast.bind(this);
        this.toggleAccordionTotalDiffernce = this.toggleAccordionTotalDiffernce.bind(this);
        this.storeProduct = this.storeProduct.bind(this)
        this.hideCalculation = this.hideCalculation.bind(this);
        this.filterTsList = this.filterTsList.bind(this);
        this.saveSelectedForecast = this.saveSelectedForecast.bind(this);
        this.forecastChanged = this.forecastChanged.bind(this);
        this.backToMonthlyForecast = this.backToMonthlyForecast.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.setForecastPeriod = this.setForecastPeriod.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.radioChange = this.radioChange.bind(this);

    }

    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }

    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled'))
    }

    backToMonthlyForecast() {
        this.props.history.push(`/forecastReport/forecastOutput`)
    }

    hideCalculation(e) {
        this.setState({
            hideCalculation: e.target.checked,
            hideColumn: !this.state.hideColumn
        })

    }

    storeProduct(e) {
        var name = this.state.planningUnits.filter(c => c.planningUnitId == e.target.value);
        this.setState({
            planningUnitId: e.target.value,
            planningUnitLabel: name[0].label,
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
        var regionIdArr = [];
        for (var i = 0; i < e.length; i++) {
            regionIdArr.push(e[i].value);
        }
        var regionListFiltered = this.state.regionList.filter(c => regionIdArr.includes(c.value));
        this.setState({
            regionVal: e,
            regionListFiltered
        })
    }

    setForecastingUnit(e) {
        this.setState({
            forecastingUnitId: e.target.value
        }, () => {
            this.filterPlanningUnit()
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
        var csvRow = [];

        csvRow.push('"' + (i18n.t('static.supplyPlan.runDate') + ' ' + moment(new Date()).format(`${DATE_FORMAT_CAP}`)).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.supplyPlan.runTime') + ' ' + moment(new Date()).format('hh:mm A')).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.user.user') + ': ' + AuthenticationService.getLoggedInUsername()).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (this.state.programs.filter(c => c.id == this.state.programId)[0].code + " " + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.common.forecastPeriod') + ': ' + document.getElementById("forecastPeriod").value).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.forecastReport.display') + ': ' + this.state.displayName).replaceAll(' ', '%20') + '"')
        let viewById = this.state.displayId;
        if (viewById == 1) {//National
            csvRow.push('"' + (i18n.t('static.forecastReport.hideCalculations') + ': ' + (this.state.hideCalculation == true ? i18n.t('static.realm.yes') : i18n.t('static.program.no'))).replaceAll(' ', '%20') + '"')
            csvRow.push('')
        }
        if (viewById == 1) {//National----1
            const headers = [];
            headers.push('');
            headers.push((i18n.t('static.product.product')).replaceAll(' ', '%20'));
            headers.push(((i18n.t('static.forecastOutput.totalForecastQuantity')).replaceAll(' ', '%20')));
            if (!this.state.hideColumn) {
                headers.push((i18n.t('static.ForecastSummary.Stock')).replaceAll(' ', '%20') + (i18n.t('static.forecastReport.endOf')).replaceAll(' ', '%20') + this.state.beforeEndDateDisplay + ')');
                headers.push((i18n.t('static.forecastReport.existingShipments')).replaceAll(' ', '%20') + '(' + this.state.startDateDisplay + ' - ' + this.state.endDateDisplay + ')');
                headers.push((i18n.t('static.forecastOutput.stockOrUnmedDemand')).replaceAll(' ', '%20') + (i18n.t('static.forecastReport.endOf')).replaceAll(' ', '%20') + this.state.endDateDisplay + ')');
                headers.push((i18n.t('static.forecastReport.desiredMonthsOfStock')).replaceAll(' ', '%20') + (i18n.t('static.forecastReport.endOf')).replaceAll(' ', '%20') + this.state.endDateDisplay + ')');
                headers.push((i18n.t('static.forecastReport.desiredStock')).replaceAll(' ', '%20') + (i18n.t('static.forecastReport.endOf')).replaceAll(' ', '%20') + this.state.endDateDisplay + ')');
            }
            headers.push((i18n.t('static.forecastReport.procurementSurplus')).replaceAll(' ', '%20'));
            if (!this.state.hideColumn) {
                headers.push((i18n.t('static.forecastReport.priceType').replaceAll(' ', '%20')));
                headers.push((i18n.t('static.forecastReport.unitPrice')).replaceAll(' ', '%20') + ' (USD)');
            }
            headers.push((i18n.t('static.forecastReport.ProcurementsNeeded')).replaceAll(' ', '%20') + '(USD)');
            headers.push((i18n.t('static.program.notes')).replaceAll(' ', '%20'));

            var A = [this.addDoubleQuoteToRowContent(headers)]

            this.state.summeryData.map(ele => {
                let propertyName = [];
                if (!this.state.hideColumn) {
                    propertyName.push((ele.stock1 == null ? '' : ele.stock1));
                    propertyName.push((ele.existingShipments == null ? '' : ele.existingShipments));
                    propertyName.push((ele.stock2 == null ? '' : ele.stock2));
                    propertyName.push((ele.desiredMonthOfStock1 == null ? '' : ele.desiredMonthOfStock1));
                    propertyName.push((ele.desiredMonthOfStock2 == null ? '' : ele.desiredMonthOfStock2));
                }
                let propertyName1 = [];
                if (!this.state.hideColumn) {
                    propertyName1.push((ele.priceType == null ? '' : ele.priceType.replaceAll(' ', '%20')));
                    propertyName1.push((ele.unitPrice == null ? '' : ele.unitPrice));
                }
                return (ele.id != 0 &&
                    A.push(this.addDoubleQuoteToRowContent([
                        ((ele.tracerCategory.label.label_en).replaceAll(',', ' ')).replaceAll(' ', '%20'),
                        ((ele.planningUnit.label.label_en).replaceAll(',', ' ')).replaceAll(' ', '%20'),
                        (ele.totalForecastedQuantity == null ? '' : ele.totalForecastedQuantity)
                    ].concat(propertyName).concat([(ele.procurementGap == null ? '' : ele.procurementGap)].concat(propertyName1).concat([(ele.procurementNeeded == null || ele.unitPrice == null ? '' : ele.procurementNeeded), (ele.notes == null ? '' : (ele.notes).replaceAll(' ', '%20'))]))))
                )
            }
            );

            if (!this.state.hideColumn) {
                A.push(this.addDoubleQuoteToRowContent([
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    (i18n.t('static.forecastReport.productCost')).replaceAll(' ', '%20'),
                    '$ ' + this.state.totalProductCost,
                    ''
                ]))
                A.push(this.addDoubleQuoteToRowContent([
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    (i18n.t('static.forecastReport.freight')).replaceAll(' ', '%20') + ' (' + this.state.freightPerc + '%)'.replaceAll(' ', '%20'),
                    '$ ' + (parseFloat((this.state.freightPerc / 100) * this.state.totalProductCost).toFixed(2)),
                    ''
                ]))
                A.push(this.addDoubleQuoteToRowContent([
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    (i18n.t('static.shipment.totalCost')).replaceAll(' ', '%20'),
                    '$ ' + parseFloat(parseFloat(this.state.totalProductCost) + parseFloat((this.state.freightPerc / 100) * this.state.totalProductCost)).toFixed(2),
                    ''
                ]))
            } else {
                A.push(this.addDoubleQuoteToRowContent([
                    '',
                    '',
                    '',
                    (i18n.t('static.forecastReport.productCost')).replaceAll(' ', '%20'),
                    '$ ' + this.state.totalProductCost,
                    ''
                ]))
                A.push(this.addDoubleQuoteToRowContent([
                    '',
                    '',
                    '',
                    i18n.t('static.forecastReport.freight') + ' (' + this.state.freightPerc + '%)'.replaceAll(' ', '%20'),
                    '$ ' + (parseFloat((this.state.freightPerc / 100) * this.state.totalProductCost).toFixed(2)),
                    ''
                ]))
                A.push(this.addDoubleQuoteToRowContent([
                    '',
                    '',
                    '',
                    (i18n.t('static.shipment.totalCost')).replaceAll(' ', '%20'),
                    '$ ' + parseFloat(parseFloat(this.state.totalProductCost) + parseFloat((this.state.freightPerc / 100) * this.state.totalProductCost)).toFixed(2),
                    ''
                ]))
            }


            for (var i = 0; i < A.length; i++) {
                csvRow.push(A[i].join(","))
            }

            var csvString = csvRow.join("%0A")
            var a = document.createElement("a")
            a.href = 'data:attachment/csv,' + csvString
            a.target = "_Blank"
            a.download = this.state.programs.filter(c => c.id == this.state.programId)[0].code + "-" + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text) + "-" + i18n.t('static.forecastReport.forecastSummary') + "-" + this.state.displayName + ".csv"
            document.body.appendChild(a)
            a.click();

        } else {//Regional-------2

            if ((document.getElementById("versionId").selectedOptions[0].text).includes('Local')) {//local version
                const nestedHeaders = [];
                var tcList = this.state.tracerCategoryList;
                var puList = this.state.regPlanningUnitList;
                let regRegionList = this.state.regRegionList;
                let tsList = this.state.tsList;
                nestedHeaders.push('');
                for (var k = 0; k < regRegionList.length; k++) {
                    nestedHeaders.push('');
                    nestedHeaders.push(regRegionList[k].label.label_en);
                    nestedHeaders.push('');
                }
                nestedHeaders.push((i18n.t('static.forecastReport.allRegions')).replaceAll(' ', '%20'));
                var A = [this.addDoubleQuoteToRowContent(nestedHeaders)]

                const headers = [];
                headers.push((i18n.t('static.product.product')).replaceAll(' ', '%20'));
                for (var k = 0; k < regRegionList.length; k++) {
                    headers.push((i18n.t('static.compareVersion.selectedForecast')).replaceAll(' ', '%20'));
                    headers.push((i18n.t('static.forecastReport.forecastQuantity')).replaceAll(' ', '%20'));
                    headers.push((i18n.t('static.program.notes')).replaceAll(' ', '%20'));
                }

                headers.push((i18n.t('static.forecastOutput.totalForecastQuantity')).replaceAll(' ', '%20'));
                A.push([this.addDoubleQuoteToRowContent(headers)]);

                for (var tc = 0; tc < tcList.length; tc++) {
                    A.push([this.addDoubleQuoteToRowContent([((puList.filter(c => c.planningUnit.forecastingUnit.tracerCategory.id == tcList[tc])[0].planningUnit.forecastingUnit.tracerCategory.label.label_en).replaceAll(',', ' ')).replaceAll(' ', '%20')])]);

                    var puListFiltered = puList.filter(c => c.planningUnit.forecastingUnit.tracerCategory.id == tcList[tc]);
                    for (var j = 0; j < puListFiltered.length; j++) {
                        let regionArray = [];
                        var total = 0;
                        let total1 = '';


                        for (var k = 0; k < regRegionList.length; k++) {
                            var filterForecastSelected = puListFiltered[j].selectedForecastMap[regRegionList[k].regionId]
                            total += Number(filterForecastSelected != undefined && filterForecastSelected.totalForecast != null ? filterForecastSelected.totalForecast : 0);
                            total1 = total1 + (filterForecastSelected != undefined && filterForecastSelected.totalForecast != null ? filterForecastSelected.totalForecast : '');

                            let nameTC = '';
                            try {
                                let idTC = (((filterForecastSelected != undefined) ? (filterForecastSelected.scenarioId > 0) ? "T" + filterForecastSelected.treeId + "~" + filterForecastSelected.scenarioId : (filterForecastSelected.consumptionExtrapolationId > 0) ? "C" + filterForecastSelected.consumptionExtrapolationId : "" : ""));
                                nameTC = (tsList.filter(c => c.id == idTC)[0].name);

                            }
                            catch (err) {
                            }

                            regionArray.push(((nameTC).replaceAll(',', ' ')).replaceAll(' ', '%20'));
                            regionArray.push((filterForecastSelected != undefined ? (filterForecastSelected.totalForecast == null ? "" : Number(filterForecastSelected.totalForecast).toFixed(2)) : ""));
                            regionArray.push((filterForecastSelected != undefined ? (filterForecastSelected.notes == null ? "" : ((filterForecastSelected.notes).replaceAll(',', ' ')).replaceAll(' ', '%20')) : ""));
                        }

                        A.push(this.addDoubleQuoteToRowContent([((puListFiltered[j].planningUnit.label.label_en).replaceAll(',', ' ')).replaceAll(' ', '%20')].concat(regionArray).concat([(total1 == '' ? '' : Number(total).toFixed(2))])));
                    }
                }

                for (var i = 0; i < A.length; i++) {
                    csvRow.push(A[i].join(","))
                }

                var csvString = csvRow.join("%0A")
                var a = document.createElement("a")
                a.href = 'data:attachment/csv,' + csvString
                a.target = "_Blank"
                a.download = this.state.programs.filter(c => c.id == this.state.programId)[0].code + "-" + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text) + "-" + i18n.t('static.forecastReport.forecastSummary') + "-" + this.state.displayName + ".csv"
                document.body.appendChild(a)
                a.click();

            } else {//server version

                const nestedHeaders = [];

                let uniqueRegionList = this.state.uniqueRegionList;
                let summeryData = this.state.summeryData;
                let primaryOutputData = this.state.primaryOutputData;

                nestedHeaders.push('');
                for (var k = 0; k < uniqueRegionList.length; k++) {
                    nestedHeaders.push('');
                    nestedHeaders.push(primaryOutputData.filter(c => c.region.id == uniqueRegionList[k])[0].region.label.label_en);
                    nestedHeaders.push('');
                }
                nestedHeaders.push((i18n.t('static.forecastReport.allRegions')).replaceAll(' ', '%20'));
                var A = [this.addDoubleQuoteToRowContent(nestedHeaders)]

                const headers = [];
                headers.push((i18n.t('static.product.product')).replaceAll(' ', '%20'));
                for (var k = 0; k < uniqueRegionList.length; k++) {
                    headers.push((i18n.t('static.compareVersion.selectedForecast')).replaceAll(' ', '%20'));
                    headers.push((i18n.t('static.forecastReport.forecastQuantity')).replaceAll(' ', '%20'));
                    headers.push((i18n.t('static.program.notes')).replaceAll(' ', '%20'));
                }

                headers.push((i18n.t('static.forecastOutput.totalForecastQuantity')).replaceAll(' ', '%20'));
                A.push([this.addDoubleQuoteToRowContent(headers)]);



                for (var j = 0; j < summeryData.length; j++) {
                    let tempData = [];


                    let regionList = summeryData[j].regionListForSinglePlanningUnit;
                    for (var k = 0; k < regionList.length; k++) {
                        tempData.push(regionList[k].selectedForecast == null ? '' : regionList[k].selectedForecast);
                        tempData.push((regionList[k].forecastQuantity == null || regionList[k].forecastQuantity == '' ? '' : (regionList[k].forecastQuantity).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")));
                        tempData.push(regionList[k].notes == null ? '' : regionList[k].notes);
                    }
                    tempData.push((summeryData[j].totalForecastQuantity).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","));

                    A.push(this.addDoubleQuoteToRowContent([((summeryData[j].planningUnit).replaceAll(',', ' ')).replaceAll(' ', '%20')].concat(tempData)));

                }
                for (var i = 0; i < A.length; i++) {
                    csvRow.push(A[i].join(","))
                }
                var csvString = csvRow.join("%0A")
                var a = document.createElement("a")
                a.href = 'data:attachment/csv,' + csvString
                a.target = "_Blank"
                a.download = this.state.programs.filter(c => c.id == this.state.programId)[0].code + "-" + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text) + "-" + i18n.t('static.forecastReport.forecastSummary') + "-" + this.state.displayName + ".csv"
                document.body.appendChild(a)
                a.click();
            }
        }
    }

    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }

    exportPDF = (columns) => {
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
                doc.text('Copyright © 2020 ' + i18n.t('static.footer'), doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
                    align: 'center'
                })
            }
        }
        const addHeaders = doc => {
            const pageCount = doc.internal.getNumberOfPages()
            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(12)
                doc.setFont('helvetica', 'bold')
                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                doc.setFontSize(8)
                doc.setFont('helvetica', 'normal')
                doc.setTextColor("#002f6c");
                doc.setFont('helvetica', 'bold')
                doc.fromHTML("<span style = 'font-family:helvetica;'><font size = '1' color = '#002f6c'><b>" + i18n.t('static.supplyPlan.runDate') + "</b> " + moment(new Date()).format(`${DATE_FORMAT_CAP}`) + "</font></span>", doc.internal.pageSize.width - 150, 20)
                doc.fromHTML("<span style = 'font-family:helvetica;'><font size = '1' color = '#002f6c'><b>" + i18n.t('static.supplyPlan.runTime') + "</b> " + moment(new Date()).format('hh:mm A') + "</font></span>", doc.internal.pageSize.width - 150, 30)
                doc.fromHTML("<span style = 'font-family:helvetica;'><font size = '1' color = '#002f6c'><b>" + i18n.t('static.user.user') + ":</b> " + AuthenticationService.getLoggedInUsername() + "</font></span>", doc.internal.pageSize.width - 150, 40)
                doc.fromHTML("<span style = 'font-family:helvetica;'><font size = '1' color = '#002f6c'><b>" + this.state.programs.filter(c => c.id == this.state.programId)[0].code + " " + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text) + "</b> " + "</font></span>", doc.internal.pageSize.width - 150, 50)
                doc.setFontSize(TITLE_FONT)
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.forecastReport.forecastSummary'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    doc.fromHTML("<span style = 'font-family:helvetica;'><font size = '1' color = '#002f6c'><b>" + i18n.t('static.common.forecastPeriod') + ":</b> " + document.getElementById("forecastPeriod").value + "</font></span>", (doc.internal.pageSize.width / 8) - 50, 90)
                    doc.fromHTML("<span style = 'font-family:helvetica;'><font size = '1' color = '#002f6c'><b>" + i18n.t('static.forecastReport.display') + ":</b> " + this.state.displayName + "</font></span>", (doc.internal.pageSize.width / 8) - 50, 100)
                    let viewById = this.state.displayId;
                    if (viewById == 1) {//National
                        doc.fromHTML("<span style = 'font-family:helvetica;'><font size = '1' color = '#002f6c'><b>" + i18n.t('static.forecastReport.hideCalculations') + ":</b> " + (this.state.hideCalculation == true ? i18n.t('static.realm.yes') : i18n.t('static.program.no')) + "</font></span>", (doc.internal.pageSize.width / 8) - 50, 110)
                    }

                }

            }
        }

        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size);

        doc.setFontSize(8);
        let viewById = this.state.displayId;
        if (viewById == 2) {//Regional

            if ((document.getElementById("versionId").selectedOptions[0].text).includes('Local')) {//local version

                var tcList = this.state.tracerCategoryList;
                var puList = this.state.regPlanningUnitList;
                let regRegionList = this.state.regRegionList;
                let tsList = this.state.tsList;

                let header1 = [{ content: i18n.t('static.planningunit.planningunit'), rowSpan: 2, styles: { halign: 'center' } }];
                let header2 = [];

                for (var k = 0; k < regRegionList.length; k++) {
                    header1.push({ content: regRegionList[k].label.label_en, colSpan: 3, styles: { halign: 'center' } })

                    header2.push(
                        { content: i18n.t('static.compareVersion.selectedForecast'), styles: { halign: 'center' } },
                        { content: i18n.t('static.forecastReport.forecastQuantity'), styles: { halign: 'center' } },
                        { content: i18n.t('static.program.notes'), styles: { halign: 'center' } }
                    )
                }

                header1.push({ content: i18n.t('static.forecastReport.allRegions'), rowSpan: 1, styles: { halign: 'center' } });
                header2.push({ content: i18n.t('static.forecastOutput.totalForecastQuantity'), styles: { halign: 'center' } },)

                let header = [header1, header2];
                let data = [];
                for (var tc = 0; tc < tcList.length; tc++) {
                    let tempData1 = [];
                    tempData1.push(puList.filter(c => c.planningUnit.forecastingUnit.tracerCategory.id == tcList[tc])[0].planningUnit.forecastingUnit.tracerCategory.label.label_en);
                    data.push(tempData1);
                    tempData1 = [];

                    var puListFiltered = puList.filter(c => c.planningUnit.forecastingUnit.tracerCategory.id == tcList[tc]);
                    for (var j = 0; j < puListFiltered.length; j++) {
                        let regionArray = [];
                        var total = 0;
                        let total1 = '';

                        for (var k = 0; k < regRegionList.length; k++) {
                            var filterForecastSelected = puListFiltered[j].selectedForecastMap[regRegionList[k].regionId]
                            total += Number(filterForecastSelected != undefined && filterForecastSelected.totalForecast != null ? filterForecastSelected.totalForecast : '');
                            total1 = total1 + (filterForecastSelected != undefined && filterForecastSelected.totalForecast != null ? filterForecastSelected.totalForecast : '');

                            let nameTC = '';
                            try {
                                let idTC = (((filterForecastSelected != undefined) ? (filterForecastSelected.scenarioId > 0) ? "T" + filterForecastSelected.treeId + "~" + filterForecastSelected.scenarioId : (filterForecastSelected.consumptionExtrapolationId > 0) ? "C" + filterForecastSelected.consumptionExtrapolationId : "" : ""));
                                nameTC = (tsList.filter(c => c.id == idTC)[0].name);

                            }
                            catch (err) {
                            }

                            regionArray.push(((nameTC)));
                            regionArray.push((filterForecastSelected != undefined ? (filterForecastSelected.totalForecast == null ? "" : (Number(filterForecastSelected.totalForecast)).toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")) : ""));
                            regionArray.push((filterForecastSelected != undefined ? (filterForecastSelected.notes == null ? "" : ((filterForecastSelected.notes))) : ""));
                        }
                        tempData1 = [];
                        tempData1.push(puListFiltered[j].planningUnit.label.label_en);
                        tempData1 = tempData1.concat(regionArray);
                        tempData1.push((total1 == '' ? '' : (Number(total)).toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")));
                        data.push(tempData1);

                    }
                }


                var startY = 140;
                let content = {
                    margin: { top: 80, bottom: 90 },
                    startY: startY,
                    head: header,
                    body: data,
                    styles: { lineWidth: 1, fontSize: 8, halign: 'center' },
                };

                doc.autoTable(content);
                addHeaders(doc)
                addFooters(doc)
                doc.save(this.state.programs.filter(c => c.id == this.state.programId)[0].code + "-" + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text) + "-" + i18n.t('static.forecastReport.forecastSummary') + "-" + this.state.displayName + ".pdf")

            } else {//server version

                let uniqueRegionList = this.state.uniqueRegionList;
                let summeryData = this.state.summeryData;
                let primaryOutputData = this.state.primaryOutputData;

                let header1 = [{ content: i18n.t('static.planningunit.planningunit'), rowSpan: 2, styles: { halign: 'center' } }];
                let header2 = [];

                for (var k = 0; k < uniqueRegionList.length; k++) {
                    header1.push({ content: primaryOutputData.filter(c => c.region.id == uniqueRegionList[k])[0].region.label.label_en, colSpan: 3, styles: { halign: 'center' } })

                    header2.push(
                        { content: i18n.t('static.compareVersion.selectedForecast'), styles: { halign: 'center' } },
                        { content: i18n.t('static.forecastReport.forecastQuantity'), styles: { halign: 'center' } },
                        { content: i18n.t('static.program.notes'), styles: { halign: 'center' } }
                    )
                }

                header1.push({ content: i18n.t('static.forecastReport.allRegions'), rowSpan: 1, styles: { halign: 'center' } });
                header2.push({ content: i18n.t('static.forecastOutput.totalForecastQuantity'), styles: { halign: 'center' } },)

                let header = [header1, header2];
                let data = [];

                for (var j = 0; j < summeryData.length; j++) {
                    let tempData = [];

                    tempData.push(summeryData[j].planningUnit);
                    let regionList = summeryData[j].regionListForSinglePlanningUnit;
                    for (var k = 0; k < regionList.length; k++) {
                        tempData.push(regionList[k].selectedForecast);
                        tempData.push((regionList[k].forecastQuantity == null || regionList[k].forecastQuantity == '' ? regionList[k].forecastQuantity : (regionList[k].forecastQuantity).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")));
                        tempData.push(regionList[k].notes);
                    }
                    tempData.push((summeryData[j].totalForecastQuantity).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","));


                    data.push(tempData);

                }


                var startY = 130;
                let content = {
                    margin: { top: 80, bottom: 90 },
                    startY: startY,
                    head: header,
                    body: data,
                    styles: { lineWidth: 1, fontSize: 8, halign: 'center' },
                };

                doc.autoTable(content);
                addHeaders(doc)
                addFooters(doc)
                doc.save(this.state.programs.filter(c => c.id == this.state.programId)[0].code + "-" + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text) + "-" + i18n.t('static.forecastReport.forecastSummary') + "-" + this.state.displayName + ".pdf")
            }
        } else {//National

            let headers = [];
            let headers1 = ['', i18n.t('static.product.product'), i18n.t('static.forecastOutput.totalForecastQuantity')];
            if (!this.state.hideColumn) {
                // headers1 = headers1.concat([i18n.t('static.report.stock') + i18n.t('static.forecastReport.endOf') + this.state.beforeEndDateDisplay + ')', i18n.t('static.forecastReport.existingShipments') + '(' + this.state.startDateDisplay + ' - ' + this.state.endDateDisplay + ')', i18n.t('static.report.stock') + i18n.t('static.forecastReport.endOf') + this.state.endDateDisplay + ')', i18n.t('static.forecastReport.desiredMonthsOfStock') + i18n.t('static.forecastReport.endOf') + this.state.endDateDisplay + ')', i18n.t('static.forecastReport.desiredStock') + i18n.t('static.forecastReport.endOf') + this.state.endDateDisplay + ')']);
                headers1 = headers1.concat([i18n.t('static.ForecastSummary.Stock') + i18n.t('static.forecastReport.endOf') + ' ' + this.state.beforeEndDateDisplay + ')', i18n.t('static.forecastReport.existingShipments') + '(' + this.state.startDateDisplay + ' - ' + this.state.endDateDisplay + ')', i18n.t('static.forecastOutput.stockOrUnmedDemand') + i18n.t('static.forecastReport.endOf') + ' ' + this.state.endDateDisplay + ')', i18n.t('static.forecastReport.desiredMonthsOfStock') + i18n.t('static.forecastReport.endOf') + ' ' + this.state.endDateDisplay + ')', i18n.t('static.forecastReport.desiredStock') + i18n.t('static.forecastReport.endOf') + ' ' + this.state.endDateDisplay + ')']);
            }
            headers1 = headers1.concat([i18n.t('static.forecastReport.procurementSurplus')]);
            if (!this.state.hideColumn) {
                headers1 = headers1.concat([i18n.t('static.forecastReport.priceType'), i18n.t('static.forecastReport.unitPrice') + '(USD)']);
            }
            headers1 = headers1.concat([i18n.t('static.forecastReport.ProcurementsNeeded') + '(USD)', i18n.t('static.program.notes')]);
            headers.push(headers1);
            // const data = this.state.matricsList.map(elt => [this.dateFormatter(elt.month), this.formatter(elt.forecastedConsumption), this.formatter(elt.actualConsumption), elt.message == null ? this.PercentageFormatter(elt.forecastError) : i18n.t(elt.message)]);
            let data = [];

            this.state.summeryData.map(ele => {
                let A = [];
                let propertyName = [];
                if (!this.state.hideColumn) {
                    propertyName.push((ele.stock1 == null ? '' : (ele.stock1).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")));
                    propertyName.push((ele.existingShipments == null ? '' : (ele.existingShipments).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")));
                    propertyName.push((ele.stock2 == null ? '' : (ele.stock2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")));
                    propertyName.push((ele.desiredMonthOfStock1 == null ? '' : (ele.desiredMonthOfStock1).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")));
                    propertyName.push((ele.desiredMonthOfStock2 == null ? '' : (ele.desiredMonthOfStock2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")));
                }
                let propertyName1 = [];
                if (!this.state.hideColumn) {
                    propertyName1.push((ele.priceType == null ? '' : ele.priceType));
                    propertyName1.push((ele.unitPrice == null ? '' : (ele.unitPrice).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")));
                }

                if (ele.id != 0) {
                    A.push((
                        (ele.tracerCategory.label.label_en)),
                        ((ele.planningUnit.label.label_en)),
                        (ele.totalForecastedQuantity == null ? '' : (ele.totalForecastedQuantity).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
                    )
                    A = A.concat(propertyName).concat([(ele.procurementGap == null ? '' : (ele.procurementGap).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))].concat(propertyName1).concat([(ele.procurementNeeded == null || ele.unitPrice == null ? '' : (ele.procurementNeeded).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")), (ele.notes == null ? '' : ele.notes)]));
                }

                return (ele.id != 0 &&
                    data.push(A)
                )
            }
            );

            if (!this.state.hideColumn) {
                data.push([
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    i18n.t('static.forecastReport.productCost'),
                    '$ ' + this.state.totalProductCost.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
                    ''
                ])
                data.push([
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    i18n.t('static.forecastReport.freight') + '(' + this.state.freightPerc + '%)',
                    '$ ' + ((this.state.freightPerc / 100) * this.state.totalProductCost).toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
                    ''
                ])
                data.push([
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    i18n.t('static.shipment.totalCost'),
                    // (this.state.totalProductCost + 0.07 * this.state.totalProductCost),
                    '$ ' + (parseFloat(parseFloat(this.state.totalProductCost) + parseFloat((this.state.freightPerc / 100) * this.state.totalProductCost)).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
                    ''
                ])
            } else {
                data.push([
                    '',
                    '',
                    '',
                    i18n.t('static.forecastReport.productCost'),
                    '$ ' + (this.state.totalProductCost).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
                    ''
                ])
                data.push([
                    '',
                    '',
                    '',
                    i18n.t('static.forecastReport.freight') + '(' + this.state.freightPerc + '%)',
                    '$ ' + (parseFloat((this.state.freightPerc / 100) * this.state.totalProductCost).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
                    ''
                ])
                data.push([
                    '',
                    '',
                    '',
                    i18n.t('static.shipment.totalCost'),
                    '$ ' + (parseFloat(this.state.totalProductCost + (this.state.freightPerc / 100) * this.state.totalProductCost).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
                    ''
                ])
            }

            var startY = 130;
            let content = {
                margin: { top: 80, bottom: 90 },
                startY: startY,
                head: headers,
                body: data,
                styles: { lineWidth: 1, fontSize: 8, halign: 'center' }
                // styles: { lineWidth: 1, fontSize: 8, cellWidth: 38, halign: 'center' },
                // columnStyles: {
                //     1: { cellWidth: 99.89 },
                //     2: { cellWidth: 54 },
                // }
            };

            doc.autoTable(content);
            addHeaders(doc)
            addFooters(doc)
            doc.save(this.state.programs.filter(c => c.id == this.state.programId)[0].code + "-" + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text) + "-" + i18n.t('static.forecastReport.forecastSummary') + "-" + this.state.displayName + ".pdf")

        }
    }

    filterData() {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        let displayId = this.state.displayId;
        (displayId == 1 ? document.getElementById("hideCalculationDiv").style.display = "block" : document.getElementById("hideCalculationDiv").style.display = "none");
        (displayId == 1 ? document.getElementById("hideLegendDiv").style.display = "block" : document.getElementById("hideLegendDiv").style.display = "none");
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
        let start_date = new Date(startDate);
        let end_date = new Date(endDate);
        let total_months = (end_date.getFullYear() - start_date.getFullYear()) * 12;
        total_months += end_date.getMonth() - start_date.getMonth()
        total_months = total_months + 1;
        if (versionId != 0 && programId > 0) {
            if (versionId == -1) {
                this.setState({ message: i18n.t('static.program.validversion'), summeryData: [], dataArray: [], versionId: '', forecastPeriod: '', });
                try {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                }
                catch (err) {
                }
            }
            if (versionId.includes('Local')) {
                var db1;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;
                    var transaction = db1.transaction(['datasetData'], 'readwrite');
                    var program = transaction.objectStore('datasetData');
                    var getRequest = program.getAll();
                    var datasetList = [];
                    var datasetList1 = [];
                    this.setState({
                        loading: true
                    })

                    getRequest.onerror = function (event) {
                        this.setState({
                            loading: false
                        })
                    };
                    getRequest.onsuccess = function (event) {
                        var myResult = [];
                        myResult = getRequest.result;
                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                        var userId = userBytes.toString(CryptoJS.enc.Utf8);
                        var filteredGetRequestList = myResult.filter(c => c.userId == userId);
                        for (var i = 0; i < filteredGetRequestList.length; i++) {
                            var bytes = CryptoJS.AES.decrypt(filteredGetRequestList[i].programName, SECRET_KEY);
                            var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                            var programDataBytes = CryptoJS.AES.decrypt(filteredGetRequestList[i].programData, SECRET_KEY);
                            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                            var programJson1 = JSON.parse(programData);
                            datasetList.push({
                                programCode: filteredGetRequestList[i].programCode,
                                programVersion: filteredGetRequestList[i].version,
                                programId: filteredGetRequestList[i].programId,
                                versionId: filteredGetRequestList[i].version,
                                id: filteredGetRequestList[i].id,
                                loading: false,
                                programJson: programJson1,
                                forecastStartDate: (programJson1.currentVersion.forecastStartDate ? moment(programJson1.currentVersion.forecastStartDate).format(`MMM-YYYY`) : ''),
                                forecastStopDate: (programJson1.currentVersion.forecastStopDate ? moment(programJson1.currentVersion.forecastStopDate).format(`MMM-YYYY`) : ''),
                                healthAreaList: programJson1.healthAreaList,
                                actualConsumptionList: programJson1.actualConsumptionList,
                                consumptionExtrapolation: programJson1.consumptionExtrapolation,
                                treeList: programJson1.treeList,
                                planningUnitList: programJson1.planningUnitList,
                                regionList: programJson1.regionList,
                                label: programJson1.label,
                                realmCountry: programJson1.realmCountry,
                            });
                            datasetList1.push(filteredGetRequestList[i])
                        }
                        this.setState({
                            datasetList: datasetList,
                            datasetList1: datasetList1,
                            message: ''
                        }, () => {
                            localStorage.setItem("sesForecastProgramIdReport", parseInt(programId));
                            localStorage.setItem("sesForecastVersionIdReport", document.getElementById("versionId").value);
                            localStorage.setItem("sesDatasetId", parseInt(programId) + '_v' + (document.getElementById("versionId").value).replace('(Local)', '').trim() + '_uId_' + userId);

                            localStorage.setItem("sesLiveDatasetId", parseInt(programId));
                            localStorage.setItem("sesDatasetCompareVersionId", document.getElementById("versionId").value);
                            localStorage.setItem("sesDatasetVersionId", document.getElementById("versionId").value);

                            let filteredProgram = this.state.datasetList.filter(c => c.programId == programId && c.versionId == (versionId.split('(')[0]).trim())[0];
                            let planningUnitList = filteredProgram.planningUnitList;
                            planningUnitList = planningUnitList.filter(c => c.active == true);
                            let summeryData = [];
                            let tempData = [];


                            let treeList = filteredProgram.treeList.filter(c => c.active == true);;
                            let regionList = filteredProgram.regionList;
                            let consumptionExtrapolation = filteredProgram.consumptionExtrapolation;

                            let duplicateTracerCategoryId = planningUnitList.map(c => c.planningUnit.forecastingUnit.tracerCategory.id)
                            let filteredTracercategoryId = [...new Set(duplicateTracerCategoryId)];
                            let totalProductCost = 0.0;
                            for (var j = 0; j < planningUnitList.length; j++) {
                                let nodeDataMomList = [];
                                let consumptionData = [];
                                let selectedForecastMap = planningUnitList[j].selectedForecastMap;
                                let notes1 = '';
                                var isForecastSelected = false;
                                if ((selectedForecastMap[Object.keys(selectedForecastMap)[0]]) != undefined && (selectedForecastMap[Object.keys(selectedForecastMap)[0]]) != '' && (selectedForecastMap[Object.keys(selectedForecastMap)[0]]) != null) {
                                    let keys = Object.keys(selectedForecastMap);
                                    for (let k = 0; k < keys.length; k++) {
                                        let selectedForecastMapObjIn = (selectedForecastMap[keys[k]]);
                                        if (selectedForecastMapObjIn.notes != '' && selectedForecastMapObjIn.notes != undefined) {
                                            if (notes1 == '') {
                                                notes1 = regionList.filter(c => c.regionId == keys[k])[0].label.label_en + ': ' + selectedForecastMapObjIn.notes;
                                            } else {
                                                notes1 = notes1.concat(' | ' + regionList.filter(c => c.regionId == keys[k])[0].label.label_en + ': ' + selectedForecastMapObjIn.notes);
                                            }
                                        }
                                        if (((selectedForecastMapObjIn.treeAndScenario != undefined && selectedForecastMapObjIn.treeAndScenario.length > 0) ? true : ((selectedForecastMapObjIn.consumptionExtrapolationId != 0) ? true : false))) {
                                            let consumptionExtrapolationId = selectedForecastMapObjIn.consumptionExtrapolationId;
                                            if (selectedForecastMapObjIn.treeAndScenario != undefined && selectedForecastMapObjIn.treeAndScenario.length > 0) {//scenarioId
                                                var treeAndScenario = selectedForecastMapObjIn.treeAndScenario;
                                                var selectedScenarioId = "";
                                                for (let tas = 0; tas < treeAndScenario.length; tas++) {
                                                    var filteredTree = treeList.filter(c => c.treeId == treeAndScenario[tas].treeId);
                                                    let filteredScenario = filteredTree.length > 0 ? filteredTree[0].scenarioList.filter(c => c.id == treeAndScenario[tas].scenarioId && c.active.toString() == "true") : [];
                                                    if (filteredScenario.length > 0) {
                                                        if (selectedScenarioId != "") {
                                                            selectedScenarioId += ", ";
                                                        }
                                                        selectedScenarioId += getLabelText(filteredTree[0].label, this.state.lang) + " - " + getLabelText(filteredScenario[0].label, this.state.lang);
                                                        isForecastSelected = true;
                                                        let flatlist = filteredTree[0].tree.flatList;
                                                        let listContainNodeType5 = flatlist.filter(c => c.payload.nodeType.id == 5);
                                                        let myTempData = [];
                                                        for (let k = 0; k < listContainNodeType5.length; k++) {
                                                            let arrayOfNodeDataMap = (listContainNodeType5[k].payload.nodeDataMap[treeAndScenario[tas].scenarioId]).filter(c => c.puNode.planningUnit.id == planningUnitList[j].planningUnit.id)
                                                            if (arrayOfNodeDataMap.length > 0) {
                                                                nodeDataMomList = arrayOfNodeDataMap[0].nodeDataMomList;
                                                                let consumptionList = nodeDataMomList.map(m => {
                                                                    return {
                                                                        consumptionDate: m.month,
                                                                        consumptionQty: (m.calculatedMmdValue == null ? 0 : (m.calculatedMmdValue))
                                                                    }
                                                                });

                                                                if (consumptionData.length > 0) {
                                                                    consumptionData[0].consumptionList = consumptionData[0].consumptionList.concat(consumptionList);
                                                                } else {
                                                                    let jsonTemp = { objUnit: planningUnitList[j].planningUnit, scenario: { id: 1, label: selectedScenarioId }, display: true, color: "#ba0c2f", consumptionList: consumptionList }
                                                                    consumptionData.push(jsonTemp);
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            } else {//consumptionExtrapolationId
                                                let consumptionExtrapolationObj = consumptionExtrapolation.filter(c => c.consumptionExtrapolationId == consumptionExtrapolationId);
                                                if (consumptionExtrapolationObj.length > 0) {
                                                    isForecastSelected = true;
                                                    let consumptionList = consumptionExtrapolationObj[0].extrapolationDataList.map(m => {
                                                        return {
                                                            consumptionDate: m.month,
                                                            consumptionQty: (m.amount == null ? 0 : Number(m.amount))
                                                        }
                                                    });
                                                    if (consumptionData.length > 0) {
                                                        consumptionData[0].consumptionList = consumptionData[0].consumptionList.concat(consumptionList);
                                                    } else {
                                                        let jsonTemp = { objUnit: planningUnitList[j].planningUnit, scenario: { id: 1, label: "" }, display: true, color: "#ba0c2f", consumptionList: consumptionList }
                                                        consumptionData.push(jsonTemp);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    let totalForecastedQuantity0ri = 0;
                                    let tempList = [];
                                    let tempList1 = [];
                                    let resultTrue = [];
                                    if (consumptionData.length > 0) {
                                        let cursorDate = startDate;
                                        for (var i = 0; moment(cursorDate).format("YYYY-MM") <= moment(endDate).format("YYYY-MM"); i++) {
                                            var dt = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
                                            cursorDate = moment(cursorDate).add(1, 'months').format("YYYY-MM-DD");
                                            tempList = tempList.concat(consumptionData[0].consumptionList.filter(c => moment(c.consumptionDate).isSame(dt)));
                                        }
                                        tempList1 = tempList.map(m => {
                                            return {
                                                consumptionDate: m.consumptionDate,
                                                consumptionQty: m.consumptionQty,
                                                id: 1
                                            }
                                        });
                                        resultTrue = Object.values(tempList1.reduce((a, { consumptionDate, consumptionQty, id }) => {
                                            if (!a[id])
                                                a[id] = Object.assign({}, { consumptionDate, consumptionQty, id });
                                            else
                                                a[id].consumptionQty = parseFloat(a[id].consumptionQty) + parseFloat(consumptionQty);
                                            return a;
                                        }, {}));
                                        totalForecastedQuantity0ri = (resultTrue.length > 0 ? parseFloat(resultTrue[0].consumptionQty) : 0);
                                    }
                                    totalForecastedQuantity0ri = (totalForecastedQuantity0ri);
                                    if (!isForecastSelected) {
                                        totalForecastedQuantity0ri = null;
                                    }
                                    let tracerCategory = planningUnitList[j].planningUnit.forecastingUnit.tracerCategory;
                                    let forecastingUnit = planningUnitList[j].planningUnit.forecastingUnit;
                                    let planningUnit = planningUnitList[j].planningUnit;
                                    let totalForecastedQuantity = totalForecastedQuantity0ri != null ? Number(totalForecastedQuantity0ri).toFixed(2) : totalForecastedQuantity0ri;
                                    let stock1 = Number(planningUnitList[j].stock);
                                    let existingShipments = Number(planningUnitList[j].existingShipments);
                                    let stock2 = (Number(planningUnitList[j].stock) + Number(planningUnitList[j].existingShipments)) - (Number(totalForecastedQuantity0ri));
                                    let isStock2Red = (stock2 < 0 ? true : false);
                                    let desiredMonthOfStock1 = planningUnitList[j].monthsOfStock;
                                    let desiredMonthOfStock2 = (Number(planningUnitList[j].monthsOfStock) * Number(totalForecastedQuantity0ri) / Number(total_months));
                                    let tempProcurementGap = ((Number(planningUnitList[j].stock) + Number(planningUnitList[j].existingShipments)) - Number(totalForecastedQuantity0ri)) - (Number(planningUnitList[j].monthsOfStock) * Number(totalForecastedQuantity0ri) / Number(total_months));
                                    let procurementGap = (tempProcurementGap < 0 ? tempProcurementGap : tempProcurementGap);
                                    procurementGap = (procurementGap)
                                    let isProcurementGapRed = (tempProcurementGap < 0 ? true : false)
                                    let priceType = (planningUnitList[j].procurementAgent == null && planningUnitList[j].price == null ? i18n.t('static.forecastReport.NoPriceTypeAvailable') : (planningUnitList[j].procurementAgent != null ? planningUnitList[j].procurementAgent.code : i18n.t('static.forecastReport.custom')));
                                    let isPriceTypeRed = (planningUnitList[j].procurementAgent == null && planningUnitList[j].price == null ? true : false);
                                    let unitPrice = planningUnitList[j].price;
                                    let procurementNeeded = (isProcurementGapRed == true ? '$ ' + (Math.abs(tempProcurementGap) * Number(unitPrice)).toFixed(2) : '');
                                    let notes = planningUnitList[j].consumptionNotes;
                                    let obj = { id: 1, tempTracerCategoryId: tracerCategory.id, display: true, tracerCategory: tracerCategory, forecastingUnit: forecastingUnit, planningUnit: planningUnit, totalForecastedQuantity: totalForecastedQuantity, stock1: stock1, existingShipments: existingShipments, stock2: stock2.toFixed(2), isStock2Red: isStock2Red, desiredMonthOfStock1: desiredMonthOfStock1, desiredMonthOfStock2: desiredMonthOfStock2.toFixed(2), procurementGap: procurementGap.toFixed(2), isProcurementGapRed: isProcurementGapRed, priceType: priceType, isPriceTypeRed: isPriceTypeRed, unitPrice: unitPrice, procurementNeeded: procurementNeeded, notes: notes1 }
                                    tempData.push(obj);
                                    if (isProcurementGapRed == true) {
                                        totalProductCost = parseFloat(totalProductCost) + parseFloat(Math.abs(tempProcurementGap) * unitPrice);
                                    }
                                } else {
                                    let tracerCategory = planningUnitList[j].planningUnit.forecastingUnit.tracerCategory;
                                    let forecastingUnit = planningUnitList[j].planningUnit.forecastingUnit;
                                    let planningUnit = planningUnitList[j].planningUnit;
                                    var totalForecastedQuantity0ri = null;
                                    let totalForecastedQuantity = totalForecastedQuantity0ri;
                                    let stock1 = planningUnitList[j].stock;
                                    let existingShipments = planningUnitList[j].existingShipments;
                                    let stock2 = (Number(planningUnitList[j].stock) + Number(planningUnitList[j].existingShipments)) - Number(totalForecastedQuantity0ri);
                                    let isStock2Red = (stock2 < 0 ? true : false);
                                    let desiredMonthOfStock1 = planningUnitList[j].monthsOfStock;
                                    let desiredMonthOfStock2 = (Number(planningUnitList[j].monthsOfStock) * Number(totalForecastedQuantity0ri) / Number(total_months));
                                    let tempProcurementGap = ((Number(planningUnitList[j].stock) + Number(planningUnitList[j].existingShipments)) - Number(totalForecastedQuantity0ri)) - (Number(planningUnitList[j].monthsOfStock) * Number(totalForecastedQuantity0ri) / Number(total_months));
                                    let procurementGap = (tempProcurementGap < 0 ? tempProcurementGap : tempProcurementGap);
                                    procurementGap = (procurementGap)
                                    let isProcurementGapRed = (tempProcurementGap < 0 ? true : false)
                                    let priceType = (planningUnitList[j].procurementAgent == null && planningUnitList[j].price == null ? i18n.t('static.forecastReport.NoPriceTypeAvailable') : (planningUnitList[j].procurementAgent != null ? planningUnitList[j].procurementAgent.code : i18n.t('static.forecastReport.custom')));
                                    let isPriceTypeRed = (planningUnitList[j].procurementAgent == null && planningUnitList[j].price == null ? true : false);
                                    let unitPrice = planningUnitList[j].price;
                                    let procurementNeeded = (isProcurementGapRed == true ? '$ ' + (Math.abs(tempProcurementGap) * unitPrice).toFixed(2) : '');
                                    let notes = planningUnitList[j].consumptionNotes;
                                    let obj = { id: 1, tempTracerCategoryId: tracerCategory.id, display: true, tracerCategory: tracerCategory, forecastingUnit: forecastingUnit, planningUnit: planningUnit, totalForecastedQuantity: totalForecastedQuantity, stock1: stock1, existingShipments: existingShipments, stock2: stock2.toFixed(2), isStock2Red: isStock2Red, desiredMonthOfStock1: desiredMonthOfStock1, desiredMonthOfStock2: desiredMonthOfStock2.toFixed(2), procurementGap: procurementGap.toFixed(2), isProcurementGapRed: isProcurementGapRed, priceType: priceType, isPriceTypeRed: isPriceTypeRed, unitPrice: unitPrice, procurementNeeded: procurementNeeded, notes: notes1 }
                                    tempData.push(obj);
                                    if (isProcurementGapRed == true) {
                                        totalProductCost = parseFloat(totalProductCost) + parseFloat(Math.abs(tempProcurementGap) * Number(unitPrice));
                                    }
                                }
                            }
                            totalProductCost = parseFloat(totalProductCost).toFixed(2);
                            for (var i = 0; i < filteredTracercategoryId.length; i++) {
                                let filteredTracerCategoryList = tempData.filter(c => c.tracerCategory.id == filteredTracercategoryId[i]);
                                if (filteredTracerCategoryList.length > 0) {
                                    let obj = { id: 0, tempTracerCategoryId: filteredTracerCategoryList[0].tracerCategory.id, display: true, tracerCategory: filteredTracerCategoryList[0].tracerCategory, forecastingUnit: '', planningUnit: '', totalForecastedQuantity: '', stock1: '', existingShipments: '', stock2: '', isStock2Red: '', desiredMonthOfStock1: '', desiredMonthOfStock2: '', procurementGap: '', priceType: '', unitPrice: '', procurementNeeded: '', notes: '' }
                                    summeryData.push(obj);
                                    summeryData = summeryData.concat(filteredTracerCategoryList);
                                }
                            }
                            this.setState({
                                loading: (displayId == 2 ? true : false),
                                summeryData: summeryData,
                                totalProductCost: totalProductCost,
                                regDatasetJson: filteredProgram,
                                regPlanningUnitList: planningUnitList,
                                regRegionList: filteredProgram.regionList,
                                tracerCategoryList: [...new Set(planningUnitList.map(ele => (ele.planningUnit.forecastingUnit.tracerCategory.id)))]
                            }, () => {
                                if (displayId == 2) {
                                    let dataArray = [];
                                    var treeList = this.state.regDatasetJson.treeList.filter(c => c.active == true);;
                                    var consumptionExtrapolation = this.state.regDatasetJson.consumptionExtrapolation;
                                    var tsList = [];
                                    let startDate = this.state.regDatasetJson.programJson.currentVersion.forecastStartDate;
                                    let endDate = this.state.regDatasetJson.programJson.currentVersion.forecastStopDate;
                                    for (var tl = 0; tl < treeList.length; tl++) {
                                        var scenarioList = treeList[tl].scenarioList.filter(c => c.active.toString() == "true");
                                        for (var sl = 0; sl < scenarioList.length; sl++) {
                                            tsList.push({ id: "T" + treeList[tl].treeId + '~' + scenarioList[sl].id, name: treeList[tl].label.label_en + " - " + scenarioList[sl].label.label_en, flatList: treeList[tl].tree.flatList, planningUnitId: "", type: "T", id1: scenarioList[sl].id, treeId: treeList[tl].treeId, totalForecast: 0, region: treeList[tl].regionList });
                                        }
                                    }
                                    for (var ce = 0; ce < consumptionExtrapolation.length; ce++) {
                                        var total = 0;
                                        consumptionExtrapolation[ce].extrapolationDataList.filter(c => moment(c.month).format("YYYY-MM-DD") >= moment(startDate).format("YYYY-MM-DD") && moment(c.month).format("YYYY-MM-DD") <= moment(endDate).format("YYYY-MM-DD")).map(ele => {
                                            total += Number(ele.amount);
                                        });
                                        tsList.push({ id: "C" + consumptionExtrapolation[ce].consumptionExtrapolationId, name: consumptionExtrapolation[ce].extrapolationMethod.label.label_en, planningUnitId: consumptionExtrapolation[ce].planningUnit.id, type: "C", id1: consumptionExtrapolation[ce].consumptionExtrapolationId, totalForecast: total, region: [consumptionExtrapolation[ce].region] });
                                    }
                                    tsList = tsList.sort(function (a, b) {
                                        a = (a.name).toLowerCase();
                                        b = (b.name).toLowerCase();
                                        return a < b ? -1 : a > b ? 1 : 0;
                                    })
                                    this.setState({
                                        tsList: tsList
                                    })
                                    var data = []
                                    var tcList = this.state.tracerCategoryList;
                                    var puList = this.state.regPlanningUnitList;
                                    var regRegionList = this.state.regRegionList;
                                    for (var tc = 0; tc < tcList.length; tc++) {
                                        data = [];
                                        data[0] = puList.filter(c => c.planningUnit.forecastingUnit.tracerCategory.id == tcList[tc])[0].planningUnit.forecastingUnit.tracerCategory.label.label_en;
                                        data[1] = "";
                                        data[2] = puList.filter(c => c.planningUnit.forecastingUnit.tracerCategory.id == tcList[tc])[0].planningUnit.forecastingUnit.tracerCategory.label.label_en;
                                        for (var k = 0; k < this.state.regRegionList.length; k++) {
                                            data[(k + 1) * 3] = "";
                                            data[((k + 1) * 3) + 1] = "";
                                            data[((k + 1) * 3) + 2] = "";
                                        }
                                        data[(regRegionList.length * 3) + 3] = 1
                                        data[(regRegionList.length * 3) + 4] = ""
                                        data[(regRegionList.length * 3) + 5] = 0
                                        dataArray.push(data);
                                        var puListFiltered = puList.filter(c => c.planningUnit.forecastingUnit.tracerCategory.id == tcList[tc]);
                                        for (var j = 0; j < puListFiltered.length; j++) {
                                            data = [];
                                            data[0] = puListFiltered[j].planningUnit.forecastingUnit.label.label_en;
                                            data[1] = puListFiltered[j].planningUnit;
                                            data[2] = getLabelText(puListFiltered[j].planningUnit.label, this.state.lang) + " | " + puListFiltered[j].planningUnit.id;
                                            var total = 0;
                                            let selectedForecastQty = 0;
                                            for (var k = 0; k < regRegionList.length; k++) {
                                                var filterForecastSelected = puListFiltered[j].selectedForecastMap[regRegionList[k].regionId]
                                                var selectedForecast = "";
                                                if (filterForecastSelected != undefined) {
                                                    if (filterForecastSelected.treeAndScenario != undefined && filterForecastSelected.treeAndScenario.length > 0) {
                                                        var treeAndScenario = filterForecastSelected.treeAndScenario;
                                                        for (var tas = 0; tas < treeAndScenario.length; tas++) {
                                                            if (selectedForecast != "") {
                                                                selectedForecast += ";"
                                                            }
                                                            selectedForecast += "T" + treeAndScenario[tas].treeId + "~" + treeAndScenario[tas].scenarioId;
                                                        }
                                                    } else {
                                                        if (filterForecastSelected.consumptionExtrapolationId > 0) {
                                                            selectedForecast = "C" + filterForecastSelected.consumptionExtrapolationId;
                                                        }
                                                    }
                                                }
                                                data[(k + 1) * 3] = selectedForecast;
                                                var totalForecast = 0;
                                                if (selectedForecast != "") {
                                                    var count = 0;
                                                    var selectedForecastSplit = selectedForecast.split(";");
                                                    for (var sfs = 0; sfs < selectedForecastSplit.length; sfs++) {
                                                        var tsListFilter = tsList.filter(c => c.id == selectedForecastSplit[sfs])[0]
                                                        if (tsListFilter != undefined) {
                                                            count += 1;
                                                            if (tsListFilter.type == "C") {
                                                                totalForecast += tsListFilter.totalForecast;
                                                            } else {
                                                                var flatList = tsListFilter.flatList;
                                                                var flatListFilter = flatList.filter(c => c.payload.nodeType.id == 5 && c.payload.nodeDataMap[tsListFilter.id1][0].puNode != null && c.payload.nodeDataMap[tsListFilter.id1][0].puNode.planningUnit.id == puListFiltered[j].planningUnit.id);
                                                                var nodeDataMomList = [];
                                                                for (var fl = 0; fl < flatListFilter.length; fl++) {
                                                                    nodeDataMomList = nodeDataMomList.concat(flatListFilter[fl].payload.nodeDataMap[tsListFilter.id1][0].nodeDataMomList.filter(c => moment(c.month).format("YYYY-MM") >= moment(this.state.regDatasetJson.programJson.currentVersion.forecastStartDate).format("YYYY-MM") && moment(c.month).format("YYYY-MM") <= moment(this.state.regDatasetJson.programJson.currentVersion.forecastStopDate).format("YYYY-MM")));
                                                                }
                                                                nodeDataMomList.map(ele => {
                                                                    totalForecast += Number(ele.calculatedMmdValue);
                                                                });
                                                            }
                                                        }
                                                    }
                                                    if (count == 0) {
                                                        totalForecast = null;
                                                    }
                                                } else {
                                                    totalForecast = null;
                                                }
                                                data[((k + 1) * 3) + 1] = filterForecastSelected != undefined && totalForecast != null ? Number(totalForecast) : "";
                                                total += Number(filterForecastSelected != undefined ? Number(totalForecast) : 0);
                                                data[((k + 1) * 3) + 2] = filterForecastSelected != undefined ? filterForecastSelected.notes : "";
                                                if ((filterForecastSelected != undefined ? Number(totalForecast) : "") != "") {
                                                    selectedForecastQty = selectedForecastQty + 1;
                                                }
                                            }
                                            data[(regRegionList.length * 3) + 3] = 2
                                            data[(regRegionList.length * 3) + 4] = (selectedForecastQty == "" ? "" : Number(total).toFixed(2));
                                            data[(regRegionList.length * 3) + 5] = 0
                                            dataArray.push(data);
                                        }
                                    }
                                    var columns = [];
                                    columns.push({ title: i18n.t('static.product.unit1'), type: 'hidden', width: 100, readOnly: true });//A0
                                    columns.push({ title: i18n.t('static.product.product'), type: 'hidden', width: 100, readOnly: true });//B1
                                    columns.push({ title: i18n.t('static.product.product'), type: 'text', width: 100, readOnly: true });//C2
                                    for (var k = 0; k < regRegionList.length; k++) {
                                        columns.push({ title: i18n.t('static.compareVersion.selectedForecast'), type: 'dropdown', width: 100, source: tsList, filter: this.filterTsList, multiple: true });//D3
                                        columns.push({ title: i18n.t('static.forecastReport.forecastQuantity'), type: 'numeric', textEditor: true, mask: '#,##.00', decimal: '.', width: 100, readOnly: true });//E4
                                        columns.push({ title: i18n.t('static.program.notes'), type: 'text', width: 100 });//F5
                                    }
                                    columns.push({ title: i18n.t('static.supplyPlan.type'), type: 'hidden', width: 100, readOnly: true });//G6
                                    columns.push({ title: i18n.t('static.forecastOutput.totalForecastQuantity'), type: 'numeric', textEditor: true, mask: '#,##.00', decimal: '.', width: 100, readOnly: true });//H7
                                    columns.push({ title: 'forecast Blank', type: 'hidden', width: 100, readOnly: true });//I8
                                    let nestedHeaders = [];
                                    nestedHeaders.push(
                                        {
                                            title: '',
                                            colspan: '1'
                                        },
                                    );
                                    for (var k = 0; k < regRegionList.length; k++) {
                                        nestedHeaders.push(
                                            {
                                                title: regRegionList[k].label.label_en,
                                                colspan: '3'
                                            },

                                        );

                                    }
                                    nestedHeaders.push(
                                        {
                                            title: i18n.t('static.forecastReport.allRegions'),
                                            colspan: '1'
                                        },
                                    );
                                    try {
                                        this.el = jexcel(document.getElementById("tableDiv"), '');
                                        jexcel.destroy(document.getElementById("tableDiv"), true);
                                    }
                                    catch (err) {
                                    }
                                    this.setState({
                                        dataArray: dataArray
                                    }, () => {
                                    })
                                    var options = {
                                        data: dataArray,
                                        columnDrag: true,
                                        columns: columns,
                                        nestedHeaders: [nestedHeaders],
                                        updateTable: function (el, cell, x, y, source, value, id) {
                                            if (y != null) {
                                                var elInstance = el;
                                                var rowData = elInstance.getRowData(y);
                                                elInstance.setStyle(`C${parseInt(y) + 1}`, 'text-align', 'left');
                                            }
                                        }.bind(this),
                                        pagination: false,
                                        search: false,
                                        columnSorting: true,
                                        wordWrap: true,
                                        allowInsertColumn: false,
                                        allowManualInsertColumn: false,
                                        allowDeleteRow: false,
                                        onselection: this.selected,
                                        oneditionend: this.onedit,
                                        copyCompatibility: true,
                                        allowExport: false,
                                        paginationOptions: JEXCEL_PAGINATION_OPTION,
                                        position: 'top',
                                        filters: true,
                                        onchange: this.forecastChanged,
                                        onbeforepaste: function (instance, data, x, y) {
                                            if (y != null) {
                                                if (x == 3) {
                                                    return false
                                                }
                                            }
                                        },
                                        editable: AuthenticationService.checkUserACL([this.state.programId.toString()], 'ROLE_BF_LIST_FORECAST_SUMMARY') ? true : false,
                                        onload: function (instance, cell, x, y, value) {
                                            jExcelLoadedFunctionOnlyHideRow(instance);
                                            var elInstance = instance.worksheets[0];
                                            var rowElement = elInstance.records;
                                            for (var r = 0; r < rowElement.length; r++) {
                                                if (rowElement[r][rowElement[r].length - 3].v == 1) {
                                                    for (var j = 0; j < rowElement[r].length; j++) {
                                                        var ele = rowElement[r][j].element;
                                                        ele.classList.add('readonly');
                                                        ele.classList.add('regionBold');
                                                    }
                                                }
                                            }
                                            var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
                                            var tr = asterisk.firstChild.nextSibling;
                                            var colCount = 3;
                                            for (var k = 1; k <= regRegionList.length; k++) {
                                                tr.children[k + colCount].classList.add('InfoTr');
                                                tr.children[k + colCount].title = i18n.t('static.forecastSummaryTooltip.selectForecast');
                                                colCount = colCount + 2;
                                            }
                                        },
                                        license: JEXCEL_PRO_KEY,
                                        contextMenu: function (obj, x, y, e) {
                                            return false;
                                        }.bind(this),
                                    };
                                    var dataEl = jexcel(document.getElementById("tableDiv"), options);
                                    this.el = dataEl;
                                    this.setState({
                                        dataEl: dataEl,
                                        loading: false
                                    })
                                }
                            });
                        })


                    }.bind(this);
                }.bind(this);

                this.setState({
                    onlineVersion: false,
                })
            } else if (versionId > 0) {//api call
                this.setState({
                    onlineVersion: true,
                    summeryData: []
                })
                displayId = (displayId == 1 ? 2 : 1);
                let inputJson = {
                    "programId": programId,
                    "versionId": versionId,
                    "reportView": displayId//2-National 1-Regional
                }
                ReportService.forecastSummary(inputJson)
                    .then(response => {
                        let primaryOutputData = response.data.filter(c => c.planningUnit.active == true);
                        let totalProductCost = 0;
                        if (displayId == 2) {//National
                            let duplicateTracerCategoryId = primaryOutputData.map(c => c.tracerCategory.id);
                            let filteredTracercategoryId = [...new Set(duplicateTracerCategoryId)];
                            let tempData = [];
                            for (let j = 0; j < primaryOutputData.length; j++) {
                                let tracerCategory = primaryOutputData[j].tracerCategory;
                                let forecastingUnit = primaryOutputData[j].planningUnit;
                                let planningUnit = primaryOutputData[j].planningUnit;
                                let totalForecastedQuantity = primaryOutputData[j].totalForecast;
                                let stock1 = primaryOutputData[j].stock;
                                let existingShipments = primaryOutputData[j].existingShipments;
                                let stock2 = ((primaryOutputData[j].stock) + (primaryOutputData[j].existingShipments)) - (primaryOutputData[j].totalForecast);
                                let isStock2Red = (stock2 < 0 ? true : false);
                                let desiredMonthOfStock1 = primaryOutputData[j].monthsOfStock;
                                let desiredMonthOfStock2 = (primaryOutputData[j].monthsOfStock * primaryOutputData[j].totalForecast / total_months);
                                let tempProcurementGap = ((primaryOutputData[j].stock + primaryOutputData[j].existingShipments) - primaryOutputData[j].totalForecast) - (primaryOutputData[j].monthsOfStock * primaryOutputData[j].totalForecast / total_months);
                                let procurementGap = (tempProcurementGap < 0 ? tempProcurementGap : tempProcurementGap);
                                procurementGap = (procurementGap)
                                let isProcurementGapRed = (tempProcurementGap < 0 ? true : false)
                                let priceType = (primaryOutputData[j].procurementAgent == null && primaryOutputData[j].price == null ? i18n.t('static.forecastReport.NoPriceTypeAvailable') : (primaryOutputData[j].procurementAgent.id != 0 ? primaryOutputData[j].procurementAgent.code : i18n.t('static.forecastReport.custom')));
                                let isPriceTypeRed = (primaryOutputData[j].procurementAgent == null && primaryOutputData[j].price == null ? true : false);
                                let unitPrice = primaryOutputData[j].price;
                                let procurementNeeded = (isProcurementGapRed == true ? '$ ' + (Math.abs(tempProcurementGap) * unitPrice).toFixed(2) : '');
                                let notes = (primaryOutputData[j].notes != null ? primaryOutputData[j].notes.label_en : '');
                                let obj = { id: 1, tempTracerCategoryId: tracerCategory.id, display: true, tracerCategory: tracerCategory, forecastingUnit: forecastingUnit, planningUnit: planningUnit, totalForecastedQuantity: totalForecastedQuantity, stock1: stock1, existingShipments: existingShipments, stock2: stock2.toFixed(2), isStock2Red: isStock2Red, desiredMonthOfStock1: desiredMonthOfStock1, desiredMonthOfStock2: desiredMonthOfStock2.toFixed(2), procurementGap: procurementGap.toFixed(2), isProcurementGapRed: isProcurementGapRed, priceType: priceType, isPriceTypeRed: isPriceTypeRed, unitPrice: unitPrice, procurementNeeded: procurementNeeded, notes: notes }
                                tempData.push(obj);
                                if (isProcurementGapRed == true) {
                                    totalProductCost = parseFloat(totalProductCost) + parseFloat(Math.abs(tempProcurementGap) * unitPrice);
                                }
                            }
                            let summeryData = [];
                            for (var i = 0; i < filteredTracercategoryId.length; i++) {
                                let filteredTracerCategoryList = tempData.filter(c => c.tracerCategory.id == filteredTracercategoryId[i]);
                                if (filteredTracerCategoryList.length > 0) {
                                    let obj = { id: 0, tempTracerCategoryId: filteredTracerCategoryList[0].tracerCategory.id, display: true, tracerCategory: filteredTracerCategoryList[0].tracerCategory, forecastingUnit: '', planningUnit: '', totalForecastedQuantity: '', stock1: '', existingShipments: '', stock2: '', isStock2Red: '', desiredMonthOfStock1: '', desiredMonthOfStock2: '', procurementGap: '', priceType: '', unitPrice: '', procurementNeeded: '', notes: '' }
                                    summeryData.push(obj);
                                    summeryData = summeryData.concat(filteredTracerCategoryList);
                                }
                            }
                            totalProductCost = parseFloat(totalProductCost).toFixed(2);
                            this.setState({
                                loading: (displayId == 1 ? true : false),
                                summeryData: summeryData,
                                totalProductCost: totalProductCost,
                                freightPerc: (primaryOutputData.length > 0 ? (primaryOutputData[0].freightPerc != null ? Number(primaryOutputData[0].freightPerc) : '') : '')
                            })

                        } else {//Regional
                            let duplicateRegionList = primaryOutputData.map(c => c.region.id);
                            let uniqueRegionList = [...new Set(duplicateRegionList)];
                            let summeryData = [];
                            let duplicateTracerCategoryList = primaryOutputData.map(c => c.tracerCategory.id);
                            let uniqueTracerCategoryList = [...new Set(duplicateTracerCategoryList)];
                            for (var i = 0; i < uniqueTracerCategoryList.length; i++) {
                                let filterByTracerCategoryList = primaryOutputData.filter(c => c.tracerCategory.id == uniqueTracerCategoryList[i]);
                                summeryData.push({ "id": 1, "planningUnit": filterByTracerCategoryList[0].tracerCategory.label.label_en, "regionListForSinglePlanningUnit": [], "totalForecastQuantity": '' })
                                let duplicatePlanningUnitIdList = filterByTracerCategoryList.map(c => c.planningUnit.id);
                                let uniquePlanningUnitIdList = [...new Set(duplicatePlanningUnitIdList)];
                                for (var j = 0; j < uniquePlanningUnitIdList.length; j++) {
                                    let filterByPlanningUnitList = filterByTracerCategoryList.filter(c => c.planningUnit.id == uniquePlanningUnitIdList[j]);
                                    let regionListForSinglePlanningUnit = [];
                                    let totalForecastQuantity = '';
                                    for (var k = 0; k < uniqueRegionList.length; k++) {
                                        let filterByRegionList = filterByPlanningUnitList.filter(c => c.region.id == uniqueRegionList[k]);
                                        if (filterByRegionList.length > 0) {
                                            regionListForSinglePlanningUnit.push({
                                                "regionId": filterByRegionList[0].region.id,
                                                "selectedForecast": filterByRegionList[0].selectedForecast.label_en,
                                                "forecastQuantity": filterByRegionList[0].totalForecast,
                                                "notes": (filterByRegionList[0].notes != null ? filterByRegionList[0].notes.label_en : '')
                                            })
                                            if (filterByRegionList[0].totalForecast != '' && filterByRegionList[0].totalForecast != null) {
                                                totalForecastQuantity = totalForecastQuantity + parseFloat(filterByRegionList[0].totalForecast)
                                            }
                                        } else {
                                            regionListForSinglePlanningUnit.push({
                                                "regionId": 0,
                                                "selectedForecast": '',
                                                "forecastQuantity": '',
                                                "notes": ''
                                            })
                                        }
                                    }
                                    summeryData.push({ "id": 0, "planningUnit": filterByPlanningUnitList[0].planningUnit.label.label_en + ' | ' + filterByPlanningUnitList[0].planningUnit.id, "regionListForSinglePlanningUnit": regionListForSinglePlanningUnit, "totalForecastQuantity": totalForecastQuantity })
                                }
                            }
                            var data = [];
                            let tempListArray = [];
                            let count = 0;
                            let dataArray = [];
                            for (var j = 0; j < summeryData.length; j++) {
                                data = [];
                                data[0] = summeryData[j].id;
                                data[1] = summeryData[j].id;
                                data[2] = summeryData[j].planningUnit;
                                let regionList = summeryData[j].regionListForSinglePlanningUnit;
                                for (var k = 0; k < regionList.length; k++) {
                                    data[(k + 1) * 3] = regionList[k].selectedForecast;
                                    data[((k + 1) * 3) + 1] = regionList[k].forecastQuantity;
                                    data[((k + 1) * 3) + 2] = regionList[k].notes;
                                }
                                data[(regionList.length * 3) + 3] = summeryData[j].totalForecastQuantity;
                                dataArray.push(data);
                            }
                            var columns = [];
                            columns.push({ title: i18n.t('static.product.unit1'), type: 'hidden', width: 100, readOnly: true });//A0
                            columns.push({ title: i18n.t('static.product.unit1'), type: 'hidden', width: 100, readOnly: true });//A0
                            columns.push({ title: i18n.t('static.product.product'), type: 'text', width: 100, readOnly: true });//C2
                            for (var k = 0; k < uniqueRegionList.length; k++) {
                                columns.push({ title: i18n.t('static.compareVersion.selectedForecast'), type: 'text', width: 100, readOnly: true });//D3
                                columns.push({ title: i18n.t('static.forecastReport.forecastQuantity'), type: 'numeric', textEditor: true, mask: '#,##.00', decimal: '.', width: 100, readOnly: true });//E4
                                columns.push({ title: i18n.t('static.program.notes'), type: 'text', width: 100, readOnly: true });//F5
                            }
                            columns.push({ title: i18n.t('static.forecastOutput.totalForecastQuantity'), type: 'numeric', textEditor: true, mask: '#,##.00', decimal: '.', width: 100, readOnly: true });//H7
                            let nestedHeaders = [];
                            nestedHeaders.push(
                                {
                                    title: '',
                                    colspan: '1'
                                },
                            );
                            for (var k = 0; k < uniqueRegionList.length; k++) {
                                nestedHeaders.push(
                                    {
                                        title: primaryOutputData.filter(c => c.region.id == uniqueRegionList[k])[0].region.label.label_en,
                                        colspan: '3'
                                    },

                                );

                            }
                            nestedHeaders.push(
                                {
                                    title: i18n.t('static.forecastReport.allRegions'),
                                    colspan: '1'
                                },
                            );

                            try {
                                this.el = jexcel(document.getElementById("tableDiv"), '');
                                jexcel.destroy(document.getElementById("tableDiv"), true);
                            }
                            catch (err) {
                            }
                            this.setState({
                                dataArray: dataArray,
                                uniqueRegionList: uniqueRegionList,
                                summeryData: summeryData,
                                primaryOutputData: primaryOutputData
                            }, () => {
                            })
                            var options = {
                                data: dataArray,
                                columnDrag: true,
                                columns: columns,
                                nestedHeaders: [nestedHeaders],
                                updateTable: function (el, cell, x, y, source, value, id) {
                                    if (y != null) {
                                        var elInstance = el;
                                        var rowData = elInstance.getRowData(y);
                                        elInstance.setStyle(`B${parseInt(y) + 1}`, 'text-align', 'left');
                                    }
                                }.bind(this),
                                pagination: false,
                                search: false,
                                columnSorting: true,
                                wordWrap: true,
                                allowInsertColumn: false,
                                allowManualInsertColumn: false,
                                allowDeleteRow: false,
                                onselection: this.selected,
                                oneditionend: this.onedit,
                                copyCompatibility: true,
                                allowExport: false,
                                paginationOptions: JEXCEL_PAGINATION_OPTION,
                                position: 'top',
                                filters: true,
                                onload: function (instance, cell, x, y, value) {
                                    jExcelLoadedFunctionOnlyHideRow(instance);
                                    var elInstance = instance.worksheets[0];
                                    var rowElement = elInstance.records;

                                    for (var r = 0; r < rowElement.length; r++) {
                                        if (rowElement[r][0].v == 1) {
                                            for (var j = 0; j < rowElement[r].length; j++) {
                                                var ele = rowElement[r][j].element;
                                                ele.classList.add('readonly');
                                                ele.classList.add('regionBold');
                                            }
                                        }
                                    }
                                    var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
                                    var tr = asterisk.firstChild.nextSibling;
                                    var colCount = 3;
                                    for (var k = 1; k <= uniqueRegionList.length; k++) {
                                        tr.children[k + colCount].classList.add('InfoTr');
                                        tr.children[k + colCount].title = i18n.t('static.forecastSummaryTooltip.selectForecast');
                                        colCount = colCount + 2;
                                    }
                                },
                                license: JEXCEL_PRO_KEY,
                                contextMenu: function (obj, x, y, e) {
                                    return false;
                                }.bind(this),
                            };
                            var dataEl = jexcel(document.getElementById("tableDiv"), options);
                            this.el = dataEl;
                            this.setState({
                                dataEl: dataEl,
                                loading: false,
                                displayId: 2,
                                displayName: i18n.t('static.forecastReport.regionalView')
                            })
                        }
                    }).catch(
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
                                    case 409:
                                        this.setState({
                                            message: i18n.t('static.common.accessDenied'),
                                            loading: false,
                                            color: "#BA0C2F",
                                        });
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

            }
        } else if (programId == -1) { //validation message
            this.setState({ message: i18n.t('static.common.selectProgram'), summeryData: [], dataArray: [], programId: '', versionId: '', forecastPeriod: '', });
            try {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                jexcel.destroy(document.getElementById("tableDiv"), true);
            }
            catch (err) {
            }
        } else if (versionId == -1) {
            this.setState({ message: i18n.t('static.program.validversion'), summeryData: [], dataArray: [], versionId: '', forecastPeriod: '', });
            try {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                jexcel.destroy(document.getElementById("tableDiv"), true);
            }
            catch (err) {
            }
        }
    }

    forecastChanged = function (instance, cell, x, y, value) {
        var tableJson = this.el.getJson(null, false);
        var elInstance = this.state.dataEl;
        var rowData = elInstance.getRowData(y);
        var possiblex = [];
        for (var r = 0; r < this.state.regRegionList.length; r++) {
            possiblex.push((r + 1) * 3);
        }
        this.setState({
            isChanged1: true,
        });
        var index = possiblex.findIndex(c => c == x);
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN']
        if (index != -1) {
            if (value != "") {
                var totalForecast = 0;
                var valueSplit = value.toString().split(";")
                var consumptionCount = 0;
                for (var vs = 0; vs < valueSplit.length; vs++) {
                    var tsListFilter = this.state.tsList.filter(c => c.id == valueSplit[vs])[0]
                    if (tsListFilter.type == "C") {
                        consumptionCount += 1;
                        totalForecast += Number(tsListFilter.totalForecast);
                    } else {
                        var flatList = tsListFilter.flatList;
                        var flatListFilter = flatList.filter(c => c.payload.nodeType.id == 5 && c.payload.nodeDataMap[tsListFilter.id1][0].puNode != null && c.payload.nodeDataMap[tsListFilter.id1][0].puNode.planningUnit.id == rowData[1].id);
                        var nodeDataMomList = [];
                        for (var fl = 0; fl < flatListFilter.length; fl++) {
                            nodeDataMomList = nodeDataMomList.concat(flatListFilter[fl].payload.nodeDataMap[tsListFilter.id1][0].nodeDataMomList.filter(c => moment(c.month).format("YYYY-MM") >= moment(this.state.regDatasetJson.programJson.currentVersion.forecastStartDate).format("YYYY-MM") && moment(c.month).format("YYYY-MM") <= moment(this.state.regDatasetJson.programJson.currentVersion.forecastStopDate).format("YYYY-MM")));
                        }
                        nodeDataMomList.map(ele => {
                            totalForecast += Number(ele.calculatedMmdValue);
                        });
                    }
                }
                var failedValidationCount = this.state.failedValidationCount;
                if (valueSplit.length > 1 && consumptionCount > 0) {
                    var col = (colArr[Number(x)]).concat(parseInt(y) + 1);
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.forecastSummary.eitherTreeOrConsumptionValidation'));
                    failedValidationCount.push(x);
                } else {
                    failedValidationCount = failedValidationCount.filter(c => c != x);
                    var col = (colArr[Number(x)]).concat(parseInt(y) + 1);
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
                this.setState({
                    failedValidationCount: failedValidationCount
                })
                elInstance.setValueFromCoords((Number(x) + 1), y, (totalForecast).toFixed(2), true);
                let loopVar = 4;
                let total = 0;
                for (var r = 0; r < this.state.regRegionList.length; r++) {
                    total = total + this.el.getValueFromCoords(loopVar, y);
                    loopVar = loopVar + 3;
                }
                elInstance.setValueFromCoords((Object.keys(tableJson[0]).length - 2), y, (total).toFixed(2), true);
            } else {
                elInstance.setValueFromCoords((Number(x) + 1), y, '', true);
                elInstance.setValueFromCoords((Number(x) + 2), y, '', true);
                let loopVar = 4;
                let total = 0;
                for (var r = 0; r < this.state.regRegionList.length; r++) {
                    total = total + this.el.getValueFromCoords(loopVar, y);
                    loopVar = loopVar + 3;
                }
                elInstance.setValueFromCoords((Object.keys(tableJson[0]).length - 2), y, (total == 0 ? '' : (total).toFixed(2)), true);
                elInstance.setValueFromCoords((Object.keys(tableJson[0]).length - 1), y, 1, true);
            }
        }
    }

    filterTsList(instance, cell, c, r, source) {
        var tsList = this.state.tsList;
        var mylist = [];
        var value = (this.state.dataEl.getJson(null, false)[r])[1].id;
        var consumptionForecast = this.state.regPlanningUnitList.filter(c => c.planningUnit.id == value)[0].consuptionForecast;
        var regionList = this.state.regRegionList;
        var regionId = regionList[(c / 3) - 1].regionId;
        mylist = tsList.filter(e => (e.type == "T" && e.flatList.filter(c => c.payload.nodeDataMap[e.id1][0].puNode != null && c.payload.nodeDataMap[e.id1][0].puNode.planningUnit.id == value).length > 0) || (e.type == "C" && e.planningUnitId == value && consumptionForecast.toString() == "true"));
        let mylist1 = [];
        for (var i = 0; i < mylist.length; i++) {
            let regionList = mylist[i].region;
            let region = regionList.filter(c => c.id == regionId);
            if (region.length > 0) {
                mylist1.push(mylist[i]);
            }
        }
        return mylist1;
    }

    checkedChanged(tempTracerCategoryId) {
        var summeryData = this.state.summeryData;
        for (var i = 0; i < summeryData.length; i++) {
            if (tempTracerCategoryId == summeryData[i].tempTracerCategoryId) {
                summeryData[i].display = !summeryData[i].display;
            }
        }
        this.setState({
            summeryData
        }, () => {
        })
    }

    getPrograms() {
        if (isSiteOnline()) {
            let realmId = AuthenticationService.getRealmId();
            DropdownService.getFCProgramBasedOnRealmId(realmId)
                .then(response => {
                    let datasetList = response.data;
                    this.setState({
                        programs: datasetList,
                    }, () => { this.consolidatedProgramList() })
                }).catch(
                    error => {
                        this.setState({
                            programs: [], loading: false
                        }, () => { this.consolidatedProgramList() })
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
                                case 409:
                                    this.setState({
                                        message: i18n.t('static.common.accessDenied'),
                                        loading: false,
                                        color: "#BA0C2F",
                                    });
                                    break;
				                case 403:
                                    this.props.history.push(`/accessDenied`)
                                    break;
                                case 500:
                                case 404:
                                case 406:
                                    this.setState({
                                        message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                                        loading: false
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
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
            this.consolidatedProgramList()
            this.setState({ loading: false })
        }
    }

    consolidatedProgramList = () => {
        const lan = 'en';
        const { programs } = this.state
        var proList = programs;

        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['datasetData'], 'readwrite');
            var program = transaction.objectStore('datasetData');
            var getRequest = program.getAll();

            getRequest.onerror = function (event) {
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                let downloadedProgramData = [];
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8))
                        programData.code = programData.programCode;
                        programData.id = programData.programId;
                        var f = 0
                        for (var k = 0; k < this.state.programs.length; k++) {
                            if (this.state.programs[k].id == programData.programId) {
                                f = 1;
                            }
                        }
                        if (f == 0) {
                            proList.push(programData)
                        }
                        downloadedProgramData.push(programData);
                    }

                }
                var lang = this.state.lang;

                if (proList.length == 1) {
                    this.setState({
                        programs: proList.sort(function (a, b) {
                            a = (a.code).toLowerCase();
                            b = (b.code).toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        }),
                        programId: proList[0].programId,
                        loading: false,
                        downloadedProgramData: downloadedProgramData,
                    }, () => {
                        this.getVersionIds();
                    })
                } else {
                    if (this.props.match.params.programId != "" && this.props.match.params.programId != undefined) {
                        this.setState({
                            programs: proList.sort(function (a, b) {
                                a = (a.code).toLowerCase();
                                b = (b.code).toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            }),
                            programId: this.props.match.params.programId,
                            downloadedProgramData: downloadedProgramData,
                            loading: false
                        }, () => {
                            this.getVersionIds();
                        })
                    }
                    else if (localStorage.getItem("sesForecastProgramIdReport") != '' && localStorage.getItem("sesForecastProgramIdReport") != undefined) {
                        this.setState({
                            programs: proList.sort(function (a, b) {
                                a = (a.code).toLowerCase();
                                b = (b.code).toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            }),
                            programId: localStorage.getItem("sesForecastProgramIdReport"),
                            loading: false,
                            downloadedProgramData: downloadedProgramData,
                        }, () => {
                            this.getVersionIds();
                        })
                    } else {
                        this.setState({
                            programs: proList.sort(function (a, b) {
                                a = (a.code).toLowerCase();
                                b = (b.code).toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            }),
                            loading: false,
                            downloadedProgramData: downloadedProgramData,
                        }, () => {
                        })
                    }
                }
            }.bind(this);
        }.bind(this);
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
        window.onbeforeunload = null;
    }

    componentDidUpdate = () => {
        if (this.state.isChanged1 == true) {
            window.onbeforeunload = () => true
        } else {
            window.onbeforeunload = undefined
        }
    }

    componentDidMount() {
        document.getElementById("hideCalculationDiv").style.display = "none";
        document.getElementById("hideLegendDiv").style.display = "none";
        this.getPrograms();
        this.setState({
            regionVal: [{ label: "East", value: 1 }, { label: "West", value: 2 }, { label: "North", value: 3 }, { label: "South", value: 4 }],
            regionList: [{ label: "East", value: 1 }, { label: "West", value: 2 }, { label: "North", value: 3 }, { label: "South", value: 4 }],
            regionListFiltered: [{ label: "East", value: 1 }, { label: "West", value: 2 }, { label: "North", value: 3 }, { label: "South", value: 4 }],
        })
    }

    setProgramId(event) {
        this.setState({
            programId: event.target.value,
            versionId: ''
        }, () => {
            this.filterData();
            this.getVersionIds();
        })
    }

    setForecastPeriod() {
        let programId = this.state.programId;
        let versionId = this.state.versionId;
        if (programId != -1 && (versionId.toString().includes('(') ? versionId.split('(')[0] : versionId) != -1) {
            if (versionId.toString().includes('Local')) {//Local version
                programId = parseInt(programId);
                versionId = parseInt(versionId);
                let selectedForecastProgram = this.state.downloadedProgramData.filter(c => c.programId == programId && c.currentVersion.versionId == versionId)[0];
                if (selectedForecastProgram != undefined && selectedForecastProgram != null) {
                    let tempObj = {
                        forecastStartDate: (selectedForecastProgram.currentVersion.forecastStartDate ? moment(selectedForecastProgram.currentVersion.forecastStartDate).format(`MMM-YYYY`) : ''),
                        forecastStopDate: (selectedForecastProgram.currentVersion.forecastStopDate ? moment(selectedForecastProgram.currentVersion.forecastStopDate).format(`MMM-YYYY`) : ''),
                    }
                    selectedForecastProgram = {
                        ...selectedForecastProgram,
                        ...tempObj
                    }
                    let startDateSplit = selectedForecastProgram.currentVersion.forecastStartDate.split('-');
                    let stopDateSplit = selectedForecastProgram.currentVersion.forecastStopDate.split('-');
                    let forecastStopDate = new Date(selectedForecastProgram.currentVersion.forecastStartDate);
                    forecastStopDate.setMonth(forecastStopDate.getMonth() - 1);
                    let d11 = new Date(startDateSplit[1] - 3 + '-' + (new Date(selectedForecastProgram.currentVersion.forecastStartDate).getMonth() + 1) + '-01 00:00:00');
                    d11.setMonth(d11.getMonth() - 1);
                    let d1 = new Date(selectedForecastProgram.currentVersion.forecastStartDate);
                    let d2 = new Date(selectedForecastProgram.currentVersion.forecastStopDate);
                    var month = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                    ]
                    let startDateSplit1 = ((month[d1.getMonth()] + '-' + d1.getFullYear())).split('-');
                    let stopDateSplit1 = ((month[d2.getMonth()] + '-' + d2.getFullYear())).split('-');
                    let forecastStopDate1 = new Date((month[d1.getMonth()] + '-' + d1.getFullYear()));
                    forecastStopDate1.setMonth(forecastStopDate1.getMonth() - 1);
                    let forecastStartDateNew = selectedForecastProgram.currentVersion.forecastStartDate;
                    let forecastStopDateNew = selectedForecastProgram.currentVersion.forecastStopDate;
                    let beforeEndDateDisplay = new Date(selectedForecastProgram.currentVersion.forecastStartDate);
                    beforeEndDateDisplay.setMonth(beforeEndDateDisplay.getMonth() - 1);
                    this.setState({
                        forecastPeriod: months[Number(moment(forecastStartDateNew).startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStartDateNew).startOf('month').format("YYYY")) + ' ~ ' + months[Number(moment(forecastStopDateNew).startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStopDateNew).startOf('month').format("YYYY")),
                        rangeValue: { from: { year: Number(moment(forecastStartDateNew).startOf('month').format("YYYY")), month: Number(moment(forecastStartDateNew).startOf('month').format("M")) }, to: { year: Number(moment(forecastStopDateNew).startOf('month').format("YYYY")), month: Number(moment(forecastStopDateNew).startOf('month').format("M")) } },
                        startDateDisplay: months[new Date(forecastStartDateNew).getMonth()] + ' ' + new Date(forecastStartDateNew).getFullYear(),
                        endDateDisplay: months[new Date(forecastStopDateNew).getMonth()] + ' ' + new Date(forecastStopDateNew).getFullYear(),
                        beforeEndDateDisplay: months[new Date(beforeEndDateDisplay).getMonth()] + ' ' + new Date(beforeEndDateDisplay).getFullYear(),
                        freightPerc: Number(selectedForecastProgram.currentVersion.freightPerc)
                    }, () => {
                    })
                }
            } else {//server version
                let selectedForecastProgram = this.state.programs.filter(c => c.id == programId)[0];
                let selectedVersion = this.state.versions.filter(c => c.versionId == versionId)[0];
                let tempObj = {
                    forecastStartDate: (selectedVersion.forecastStartDate ? moment(selectedVersion.forecastStartDate).format(`MMM-YYYY`) : ''),
                    forecastStopDate: (selectedVersion.forecastStopDate ? moment(selectedVersion.forecastStopDate).format(`MMM-YYYY`) : ''),
                }
                selectedForecastProgram = {
                    ...selectedForecastProgram,
                    ...tempObj
                }
                let startDateSplit = selectedVersion.forecastStartDate.split('-');
                let stopDateSplit = selectedVersion.forecastStopDate.split('-');
                let forecastStopDate = new Date(selectedVersion.forecastStartDate);
                forecastStopDate.setMonth(forecastStopDate.getMonth() - 1);
                let d11 = new Date(startDateSplit[1] - 3 + '-' + (new Date(selectedVersion.forecastStartDate).getMonth() + 1) + '-01 00:00:00');
                d11.setMonth(d11.getMonth() - 1);
                let d1 = new Date(selectedVersion.forecastStartDate);
                let d2 = new Date(selectedVersion.forecastStopDate);
                var month = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ]
                let forecastStopDate1 = new Date((month[d1.getMonth()] + '-' + d1.getFullYear()));
                forecastStopDate1.setMonth(forecastStopDate1.getMonth() - 1);
                let forecastStartDateNew = selectedVersion.forecastStartDate;
                let forecastStopDateNew = selectedVersion.forecastStopDate;
                let beforeEndDateDisplay = new Date(selectedVersion.forecastStartDate);
                beforeEndDateDisplay.setMonth(beforeEndDateDisplay.getMonth() - 1);
                this.setState({
                    forecastPeriod: months[Number(moment(forecastStartDateNew).startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStartDateNew).startOf('month').format("YYYY")) + ' ~ ' + months[Number(moment(forecastStopDateNew).startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStopDateNew).startOf('month').format("YYYY")),
                    rangeValue: { from: { year: Number(moment(forecastStartDateNew).startOf('month').format("YYYY")), month: Number(moment(forecastStartDateNew).startOf('month').format("M")) }, to: { year: Number(moment(forecastStopDateNew).startOf('month').format("YYYY")), month: Number(moment(forecastStopDateNew).startOf('month').format("M")) } },
                    startDateDisplay: months[new Date(forecastStartDateNew).getMonth()] + ' ' + new Date(forecastStartDateNew).getFullYear(),
                    endDateDisplay: months[new Date(forecastStopDateNew).getMonth()] + ' ' + new Date(forecastStopDateNew).getFullYear(),
                    beforeEndDateDisplay: months[new Date(beforeEndDateDisplay).getMonth()] + ' ' + new Date(beforeEndDateDisplay).getFullYear(),
                }, () => {
                })
            }
        } else {
            var dt = new Date();
            dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
            var dt1 = new Date();
            dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
            this.setState({
                forecastPeriod: '',
                rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
                startDateDisplay: '',
                endDateDisplay: '',
                beforeEndDateDisplay: '',
                freightPerc: ''
            }, () => {
            })
        }
    }

    setVersionId(event) {
        this.setState({
            versionId: ((event == null || event == '' || event == undefined) ? (this.state.versionId) : (event.target.value).trim()),
        }, () => {
            var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
            var userId = userBytes.toString(CryptoJS.enc.Utf8);
            localStorage.setItem("sesForecastProgramIdReport", parseInt(document.getElementById("programId").value));
            localStorage.setItem("sesForecastVersionIdReport", document.getElementById("versionId").value);
            localStorage.setItem("sesDatasetId", parseInt(document.getElementById("programId").value) + '_v' + (document.getElementById("versionId").value).replace('(Local)', '').trim() + '_uId_' + userId);
            localStorage.setItem("sesLiveDatasetId", parseInt(document.getElementById("programId").value));
            localStorage.setItem("sesDatasetCompareVersionId", document.getElementById("versionId").value);
            localStorage.setItem("sesDatasetVersionId", document.getElementById("versionId").value);
            this.setForecastPeriod();
            this.filterData();
        })


    }

    loaded(instance) {
        jExcelLoadedFunction(instance);
    }

    getVersionIds() {
        let programId = this.state.programId;
        if (programId != 0) {
            const program = this.state.programs.filter(c => c.id == programId)
            if (program.length == 1) {
                if (isSiteOnline()) {
                    DropdownService.getVersionListForFCProgram(programId)
                        .then(response => {
                            this.setState({
                                versions: []
                            }, () => {
                                this.setState({
                                    versions: response.data
                                }, () => { this.consolidatedVersionList(programId) });
                            });
                        }).catch(
                            error => {
                                this.setState({
                                    programs: [], loading: false
                                })
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
                                        case 409:
                                            this.setState({
                                                message: i18n.t('static.common.accessDenied'),
                                                loading: false,
                                                color: "#BA0C2F",
                                            });
                                            break;
                                        case 403:
                                            this.props.history.push(`/accessDenied`)
                                            break;
                                        case 500:
                                        case 404:
                                        case 406:
                                            this.setState({
                                                message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                                                loading: false
                                            });
                                            break;
                                        case 412:
                                            this.setState({
                                                message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
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
                        versions: [],
                    }, () => {
                        this.consolidatedVersionList(programId)
                    })
                }
            } else {
                this.setState({
                    versions: [],
                }, () => { })
            }
        } else {
            this.setState({
                versions: [],
            }, () => { })
        }
    }

    consolidatedVersionList = (programId) => {
        const lan = 'en';
        const { versions } = this.state
        var verList = versions;

        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['datasetData'], 'readwrite');
            var program = transaction.objectStore('datasetData');
            var getRequest = program.getAll();

            getRequest.onerror = function (event) {
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId && myResult[i].programId == programId) {
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = databytes.toString(CryptoJS.enc.Utf8)
                        var version = JSON.parse(programData).currentVersion
                        version.versionId = `${version.versionId} (Local)`
                        verList.push(version)
                    }
                }
                let versionList = verList.filter(function (x, i, a) {
                    return a.indexOf(x) === i;
                })
                versionList.reverse();
                if (this.props.match.params.versionId != "" && this.props.match.params.versionId != undefined) {
                    this.setState({
                        versions: versionList,
                        versionId: this.props.match.params.versionId + " (Local)",
                    }, () => {
                        this.setVersionId();
                    })
                }
                else if (localStorage.getItem("sesForecastVersionIdReport") != '' && localStorage.getItem("sesForecastVersionIdReport") != undefined) {
                    let versionVar = versionList.filter(c => c.versionId == localStorage.getItem("sesForecastVersionIdReport"));
                    this.setState({
                        versions: versionList,
                        versionId: (versionVar != '' && versionVar != undefined ? localStorage.getItem("sesForecastVersionIdReport") : versionList[0].versionId),
                    }, () => {
                        this.setVersionId();
                    })
                } else {
                    this.setState({
                        versions: versionList,
                        versionId: (versionList.length > 0 ? versionList[0].versionId : ''),
                    }, () => {
                        this.setVersionId();
                    })
                }
            }.bind(this);
        }.bind(this)
    }

    show() {
        this.getVersionIds()
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

    saveSelectedForecast() {
        if (this.state.failedValidationCount.length == 0) {
            var id = this.state.regDatasetJson.id;
            var json = this.state.dataEl.getJson(null, false).filter(c => c[this.state.regRegionList.length * 3 + 3] == 2);
            var dataList = [];
            for (var j = 0; j < json.length; j++) {
                for (var k = 0; k < this.state.regRegionList.length; k++) {
                    if (json[j][(k + 1) * 3] != "") {
                        var selectedForecastSplit = (json[j][(k + 1) * 3]).toString().split(";");
                        var treeAndScenario = [];
                        if (selectedForecastSplit.length == 1) {
                            var tsList = this.state.tsList.filter(c => c.id == selectedForecastSplit[0]);
                            if (tsList.length > 0) {
                                if (tsList[0].type == "T") {
                                    treeAndScenario.push({
                                        "treeId": tsList[0].treeId,
                                        "scenarioId": tsList[0].id1
                                    })
                                }
                                dataList.push({
                                    planningUnit: json[j][1],
                                    treeAndScenario: treeAndScenario,
                                    consumptionExtrapolationId: tsList[0].type == "C" ? tsList[0].id1 : null,
                                    totalForecast: json[j][((k + 1) * 3) + 1],
                                    notes: json[j][((k + 1) * 3) + 2],
                                    region: this.state.regRegionList[k]
                                })
                            }
                        } else {
                            for (var sfs = 0; sfs < selectedForecastSplit.length; sfs++) {
                                var tsList = this.state.tsList.filter(c => c.id == selectedForecastSplit[sfs]);
                                if (tsList.length > 0) {
                                    treeAndScenario.push({
                                        "treeId": tsList[0].treeId,
                                        "scenarioId": tsList[0].id1
                                    })
                                }
                            }
                            dataList.push({
                                planningUnit: json[j][1],
                                treeAndScenario: treeAndScenario,
                                consumptionExtrapolationId: null,
                                totalForecast: json[j][((k + 1) * 3) + 1],
                                notes: json[j][((k + 1) * 3) + 2],
                                region: this.state.regRegionList[k]
                            })
                        }
                    } else {
                        if (json[j][Object.keys(json[j])[Object.keys(json[j]).length - 1]] == 1) {
                            dataList.push({
                                planningUnit: json[j][1],
                                treeAndScenario: [],
                                consumptionExtrapolationId: null,
                                totalForecast: '',
                                notes: '',
                                region: this.state.regRegionList[k]
                            })
                        }
                    }
                }

            }
            var db1;
            var storeOS;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;

                var transaction = db1.transaction(['datasetData'], 'readwrite');
                var programTransaction = transaction.objectStore('datasetData');

                var programRequest = programTransaction.get(id);
                programRequest.onerror = function (event) {
                }.bind(this);
                programRequest.onsuccess = function (event) {
                    var dataset = programRequest.result;
                    var programDataJson = programRequest.result.programData;
                    var datasetDataBytes = CryptoJS.AES.decrypt(programDataJson, SECRET_KEY);
                    var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
                    var datasetJson = JSON.parse(datasetData);
                    var datasetForEncryption = datasetJson;
                    var planningUnitList = datasetJson.planningUnitList;
                    var planningUnitList1 = planningUnitList;
                    for (var dl = 0; dl < dataList.length; dl++) {
                        var index = planningUnitList.findIndex(c => c.planningUnit.id == dataList[dl].planningUnit.id && c.active.toString() == "true");
                        var pu = planningUnitList1[index];
                        if (dataList[dl].treeAndScenario.length == 0 && dataList[dl].consumptionExtrapolationId == null) {
                            pu.selectedForecastMap[dataList[dl].region.regionId] = {};
                            planningUnitList1[index] = pu;
                        } else {
                            pu.selectedForecastMap[dataList[dl].region.regionId] = { "treeAndScenario": dataList[dl].treeAndScenario, "consumptionExtrapolationId": dataList[dl].consumptionExtrapolationId, "totalForecast": dataList[dl].totalForecast, notes: dataList[dl].notes };
                            planningUnitList1[index] = pu;
                        }
                    }
                    datasetForEncryption.planningUnitList = planningUnitList1;
                    var encryptedDatasetJson = (CryptoJS.AES.encrypt(JSON.stringify(datasetForEncryption), SECRET_KEY)).toString();
                    dataset.programData = encryptedDatasetJson;
                    var datasetTransaction = db1.transaction(['datasetData'], 'readwrite');
                    var datasetOs = datasetTransaction.objectStore('datasetData');
                    var putRequest = datasetOs.put(dataset);
                    putRequest.onerror = function (event) {
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        db1 = e.target.result;
                        var detailTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                        var datasetDetailsTransaction = detailTransaction.objectStore('datasetDetails');
                        var datasetDetailsRequest = datasetDetailsTransaction.get(id);
                        datasetDetailsRequest.onsuccess = function (e) {
                            var datasetDetailsRequestJson = datasetDetailsRequest.result;
                            datasetDetailsRequestJson.changed = 1;
                            var datasetDetailsRequest1 = datasetDetailsTransaction.put(datasetDetailsRequestJson);
                            datasetDetailsRequest1.onsuccess = function (event) {

                            }
                        }
                        this.setState({
                            isChanged1: false,
                            message1: i18n.t('static.compareAndSelect.dataSaved'),
                            color: 'green'
                        },
                            () => {
                                this.hideSecondComponent();
                            })
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        } else {
            this.setState({
                message: i18n.t("static.supplyPlan.validationFailed")
            }, () => {
                hideFirstComponent();
            })
        }
    }

    radioChange(event) {
        this.setState({
            displayId: event.target.id === "displayId2" ? parseInt(2) : parseInt(1),
            displayName: event.target.id === "displayId2" ? i18n.t('static.forecastReport.regionalView') : i18n.t('static.forecastReport.nationalView'),
            summeryData: []
        },
            () => {
                this.filterData();
            })
    }

    toggleShowGuidance() {
        this.setState({
            showGuidance: !this.state.showGuidance
        })
    }

    redirectToForecastSummary() {
        localStorage.setItem("sesForecastProgramIdReport", this.state.programId)
        localStorage.setItem("sesForecastVersionIdReport", (this.state.versionId.split('(')[0]).trim())
        const win = window.open(`/#/planningUnitSetting/listPlanningUnitSetting`, "_blank");
        win.focus();
    }

    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });

        const { programs } = this.state;
        let programList = programs.length > 0
            && programs.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {item.code}
                    </option>
                )
            }, this);

        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {((item.versionStatus.id == 2 && item.versionType.id == 2) ? item.versionId + '*' : item.versionId)} ({(moment(item.createdDate).format(`MMM DD YYYY`))})
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
                <Prompt
                    when={this.state.isChanged1 == true}
                    message={i18n.t("static.dataentry.confirmmsg")}
                />
                <AuthenticationServiceComponent history={this.props.history} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red" id="div1">{i18n.t(this.state.message)}</h5>
                <h5 style={{ color: this.state.color }} id="div2">{this.state.message1}</h5>

                <Card>

                    <div className="Card-header-reporticon pb-2">
                        {
                            (this.state.dataArray.length > 0 || this.state.summeryData.length > 0) &&
                            <div className="card-header-actions">
                                <a className="card-header-action">

                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />


                                </a>
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                            </div>
                        }
                    </div>
                    <div className="card-header-actions">
                        <div className="Card-header-reporticon">
                            <span className="compareAndSelect-larrow"> <i className="cui-arrow-left icons " > </i></span>
                            <span className="compareAndSelect-rarrow"> <i className="cui-arrow-right icons " > </i></span>
                            <span className="compareAndSelect-larrowText"> {i18n.t('static.common.backTo')} <a href="/#/forecastReport/forecastOutput" className='supplyplanformulas'>{i18n.t('static.MonthlyForecast.MonthlyForecast')}</a> </span>
                            <span className="compareAndSelect-rarrowText"> {i18n.t('static.common.continueTo')} <a href="/#/dataset/commitTree" className="supplyplanformulas">{i18n.t('static.commitProgram.commitProgram')}</a></span>
                        </div>
                    </div>
                    <div className="card-header-actions">
                        <div className="card-header-action pr-lg-4">
                            <a style={{ float: 'right' }}>
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.toggleShowGuidance() }}><small className="supplyplanformulas">{i18n.t('static.common.showGuidance')}</small></span>
                            </a>
                        </div>
                    </div>
                    <CardBody className="pb-lg-2 pt-lg-1 ">
                        <div>
                            <div ref={ref}>
                                <Col md="12" className="pl-lg-0">
                                    <div>
                                        <p className='DarkThColr'>{i18n.t("static.placeholder.forecastSummary")}</p>
                                    </div>
                                </Col>
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
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.versionFinal*')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="versionId"
                                                            id="versionId"
                                                            bsSize="sm"
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
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.common.forecastPeriod')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="text"
                                                            name="forecastPeriod"
                                                            id="forecastPeriod"
                                                            bsSize="sm"
                                                            disabled={true}
                                                            value={this.state.forecastPeriod}
                                                        >
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3" style={{ display: 'none' }}>
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.common.forecastPeriod')}<span className="stock-box-icon fa fa-sort-desc ml-1"></span></Label>
                                                <div className="controls edit">

                                                    <Picker
                                                        ref="pickRange"
                                                        years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                        value={rangeValue}
                                                        lang={pickerLang}
                                                        onChange={this.handleRangeChange}
                                                        onDismiss={this.handleRangeDissmis}
                                                    >
                                                        <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                                    </Picker>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.forecastReport.display')}</Label>
                                                <div className="controls " style={{ marginLeft: '-51px' }}>
                                                    <FormGroup check inline style={{ marginRight: '-36px' }}>
                                                        <Input
                                                            className="form-check-input"
                                                            type="radio"
                                                            id="displayId2"
                                                            name="displayId"
                                                            value={2}
                                                            checked={this.state.displayId == 2}
                                                            onChange={(e) => { this.radioChange(e) }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-radio1">
                                                            {i18n.t('static.forecastReport.regionalView')}
                                                        </Label>
                                                    </FormGroup>
                                                    <FormGroup check inline>
                                                        <Input
                                                            className="form-check-input"
                                                            type="radio"
                                                            id="displayId1"
                                                            name="displayId"
                                                            value={1}
                                                            checked={this.state.displayId == 1}
                                                            onChange={(e) => { this.radioChange(e) }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-radio2">
                                                            {i18n.t('static.forecastReport.nationalView')}
                                                        </Label>
                                                    </FormGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-2" id="hideCalculationDiv">
                                                <div className="controls pl-lg-4 pt-lg-0">
                                                    <Input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id="calculationId"
                                                        name="calculationId"
                                                        style={{ marginTop: '3' }}
                                                        checked={this.state.hideCalculation}
                                                        onClick={(e) => { this.hideCalculation(e); }}
                                                    />
                                                    <Label
                                                        className="form-check-label"
                                                        check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                        {i18n.t('static.forecastReport.hideCalculations')}
                                                    </Label>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-6" id="hideLegendDiv">
                                                <i class="fa fa-exclamation-triangle" style={{ color: "#BA0C2F" }}></i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{i18n.t('static.forecastSummary.priceIsMissing')}
                                            </FormGroup>
                                            <FormGroup className="col-md-3" id="hideCurrencyDiv" style={{ display: 'none' }}>
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.country.currency')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="currencyId"
                                                            id="currencyId"
                                                            bsSize="sm"
                                                            value={this.state.currencyId}
                                                        >
                                                            <option value="-1">{i18n.t('static.common.select')}</option>
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>



                                        </div>
                                    </div>
                                </Form>

                                <Col md="12" className='pl-lg-0' style={{ display: this.state.loading ? "none" : "block" }}>
                                    <div className="row">
                                        <div className="col-md-12 pl-0 pr-0">
                                            <div className="" style={{ display: this.state.loading ? "none" : "block" }}>
                                                {this.state.summeryData.length > 0 && this.state.displayId == 1 &&
                                                    <div className='table-scroll mt-2 tablesticky'>
                                                        <div className='table-wrap table-responsive fixTableHeadSupplyPlan'>
                                                            <Table className="table-bordered table-bordered1 text-center">
                                                                <thead>
                                                                    <tr>
                                                                        <th className="BorderNoneSupplyPlan sticky-col first-col clone1"></th>
                                                                        <th className="text-center ForecastSumarydWidth sticky-col first-col clone" style={{ minWidth: '200px' }}>{i18n.t('static.product.product')}</th>
                                                                        <th className="text-center" title={i18n.t('static.Tooltip.TotalForecastedQuantity')} style={{ minWidth: '120px' }}>{i18n.t('static.forecastOutput.totalForecastQuantity')} <i className="fa fa-info-circle icons ToltipInfoicon"></i></th>
                                                                        {!this.state.hideColumn &&
                                                                            <>
                                                                                <th className="text-center" title={i18n.t('static.Tooltip.StockEndOfDec')} style={{ minWidth: '120px' }}>{i18n.t('static.ForecastSummary.Stock')} <span className="FontWeightNormal">{i18n.t('static.forecastReport.endOf')} {this.state.beforeEndDateDisplay})</span> <i className="fa fa-info-circle icons ToltipInfoicon"></i></th>
                                                                                <th className="text-center" title={i18n.t('static.Tooltip.ExistingShipments')} style={{ minWidth: '120px' }}>{i18n.t('static.forecastReport.existingShipments')} <span className="FontWeightNormal">({this.state.startDateDisplay + ' - ' + this.state.endDateDisplay})</span> <i className="fa fa-info-circle icons ToltipInfoicon"></i></th>
                                                                                <th className="text-center" style={{ minWidth: '120px' }} title={i18n.t('static.Tooltip.StockorUnmetDemand')}>{i18n.t('static.forecastOutput.stockOrUnmedDemand')} <span className="FontWeightNormal">{i18n.t('static.forecastReport.endOf')} {this.state.endDateDisplay})</span> <i className="fa fa-info-circle icons ToltipInfoicon"></i></th>
                                                                                <th className="text-center" title={i18n.t('static.Tooltip.desiredMonthsOfStock')} style={{ minWidth: '120px' }}>{i18n.t('static.forecastReport.desiredMonthsOfStock')} <span className="FontWeightNormal">{i18n.t('static.forecastReport.endOf')} {this.state.endDateDisplay})</span> <i className="fa fa-info-circle icons ToltipInfoicon"></i></th>
                                                                                <th className="text-center" style={{ minWidth: '120px' }} title={i18n.t('static.Tooltip.DesiredStock')} >{i18n.t('static.forecastReport.desiredStock')} <span className="FontWeightNormal">{i18n.t('static.forecastReport.endOf')} {this.state.endDateDisplay})</span> <i className="fa fa-info-circle icons ToltipInfoicon"></i></th>
                                                                            </>
                                                                        }
                                                                        <th className="text-center" style={{ minWidth: '120px' }} title={i18n.t('static.Tooltip.ProcurementSurplusGap')} >{i18n.t('static.forecastReport.procurementSurplus')} <i className="fa fa-info-circle icons ToltipInfoicon"></i></th>
                                                                        {!this.state.hideColumn &&
                                                                            <>
                                                                                <th className="text-center" title={i18n.t('static.Tooltip.forecastReportpriceType')} style={{ minWidth: '120px' }}>{i18n.t('static.forecastReport.priceType')} <i className="fa fa-info-circle icons ToltipInfoicon"></i></th>
                                                                                <th className="text-center" title={i18n.t('static.Tooltip.forecastReportUnitPrice')} style={{ minWidth: '120px' }}>{i18n.t('static.forecastReport.unitPrice')} <span className="FontWeightNormal">(USD)</span> <i className="fa fa-info-circle icons ToltipInfoicon"></i></th>
                                                                            </>
                                                                        }
                                                                        <th className="text-center" title={i18n.t('static.Tooltip.ProcurementsNeeded')} style={{ minWidth: '120px' }}>{i18n.t('static.forecastReport.ProcurementsNeeded')} <span className="FontWeightNormal">(USD)</span> <i className="fa fa-info-circle icons ToltipInfoicon"></i></th>
                                                                        <th className="text-center" style={{ minWidth: '140px' }}>{i18n.t('static.program.notes')} </th>

                                                                    </tr>
                                                                </thead>

                                                                <tbody>
                                                                    {this.state.summeryData.map(item1 => (
                                                                        <>
                                                                            <tr>
                                                                                {item1.id == 0 ?
                                                                                    <>
                                                                                        <td className="BorderNoneSupplyPlan sticky-col first-col clone1">
                                                                                            {
                                                                                                item1.display == false ?
                                                                                                    <><i className="fa fa-plus-square-o supplyPlanIcon" onClick={() => this.checkedChanged(item1.tempTracerCategoryId)} ></i> </>
                                                                                                    :
                                                                                                    <><i className="fa fa-minus-square-o supplyPlanIcon" onClick={() => this.checkedChanged(item1.tempTracerCategoryId)} ></i> </>
                                                                                            }

                                                                                        </td>
                                                                                        <td className='text-left sticky-col first-col clone'><b>{item1.tracerCategory.label.label_en}</b></td>
                                                                                        <td></td>
                                                                                        {!this.state.hideColumn &&
                                                                                            <>
                                                                                                <td></td>
                                                                                                <td></td>
                                                                                                <td></td>
                                                                                                <td></td>
                                                                                                <td></td>
                                                                                            </>
                                                                                        }
                                                                                        <td></td>
                                                                                        {!this.state.hideColumn &&
                                                                                            <>
                                                                                                <td></td>
                                                                                                <td></td>
                                                                                            </>
                                                                                        }
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                    </>
                                                                                    :
                                                                                    <>
                                                                                        {item1.display == true &&
                                                                                            <>
                                                                                                <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                                                <td className='text-left  sticky-col first-col clone'>{getLabelText(item1.planningUnit.label, this.state.lang) + " | " + item1.planningUnit.id}</td>
                                                                                                <td>{(item1.totalForecastedQuantity != null ? (item1.totalForecastedQuantity).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : '')}</td>
                                                                                                {!this.state.hideColumn &&
                                                                                                    <>
                                                                                                        <td>{(item1.stock1 != null ? (item1.stock1).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : '')}</td>
                                                                                                        <td>{(item1.existingShipments != null ? (item1.existingShipments).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : '')}</td>
                                                                                                        {item1.isStock2Red == true ? <td className="red" style={{ fontSize: '12px' }}>{(item1.stock2 != null ? (item1.stock2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : '')}</td> : <td>{(item1.stock2 != null ? (item1.stock2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : '')}</td>}
                                                                                                        <td>{(item1.desiredMonthOfStock1 != null ? (item1.desiredMonthOfStock1).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : '')}</td>
                                                                                                        <td>{(item1.desiredMonthOfStock2 != null ? (item1.desiredMonthOfStock2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : '')}</td>
                                                                                                    </>
                                                                                                }
                                                                                                {item1.isProcurementGapRed == true ? <td className="red" style={{ fontSize: '12px' }}>{(item1.procurementGap != null ? (item1.procurementGap).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : '')}</td> : <td>{(item1.procurementGap != null ? (item1.procurementGap).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : '')}</td>}
                                                                                                {!this.state.hideColumn && item1.unitPrice != null && item1.unitPrice !== "" && item1.unitPrice != undefined &&
                                                                                                    <>
                                                                                                        {item1.isPriceTypeRed == true ? <td onClick={() => this.state.versionId.toString().includes('Local') ? this.redirectToForecastSummary() : ""} className={this.state.versionId.toString().includes('Local') ? "hoverTd red" : "red"} style={{ fontSize: '12px' }}>{item1.priceType}</td> : <td onClick={() => this.state.versionId.toString().includes('Local') ? this.redirectToForecastSummary() : ""} className={this.state.versionId.toString().includes('Local') ? "hoverTd" : ""}>{item1.priceType}</td>}
                                                                                                        <td onClick={() => this.state.versionId.toString().includes('Local') ? this.redirectToForecastSummary() : ""} className={this.state.versionId.toString().includes('Local') ? "hoverTd" : ""}>{(item1.unitPrice != null ? (item1.unitPrice).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : '')}</td>
                                                                                                    </>
                                                                                                }
                                                                                                {!this.state.hideColumn && (item1.unitPrice == null || item1.unitPrice === "" || item1.unitPrice == undefined) &&
                                                                                                    <>
                                                                                                        {!item1.isProcurementGapRed ? <td onClick={() => this.state.versionId.toString().includes('Local') ? this.redirectToForecastSummary() : ""} className={this.state.versionId.toString().includes('Local') ? "hoverTd" : ""}></td> : <td onClick={() => this.state.versionId.toString().includes('Local') ? this.redirectToForecastSummary() : ""} className={this.state.versionId.toString().includes('Local') ? "hoverTd" : ""} title={i18n.t("static.forecastSummary.priceNotAvaiable")}><i class="fa fa-exclamation-triangle" style={{ "color": "#BA0C2F", "margin-top": "7px" }}></i></td>}
                                                                                                        {!item1.isProcurementGapRed ? <td onClick={() => this.state.versionId.toString().includes('Local') ? this.redirectToForecastSummary() : ""} className={this.state.versionId.toString().includes('Local') ? "hoverTd" : ""}></td> : <td onClick={() => this.state.versionId.toString().includes('Local') ? this.redirectToForecastSummary() : ""} className={this.state.versionId.toString().includes('Local') ? "hoverTd" : ""} title={i18n.t("static.forecastSummary.priceNotAvaiable")}><i class="fa fa-exclamation-triangle" style={{ "color": "#BA0C2F", "margin-top": "7px" }}></i></td>}
                                                                                                    </>
                                                                                                }
                                                                                                {(item1.unitPrice != null && item1.unitPrice !== "" && item1.unitPrice != undefined) ? <td>{(item1.procurementNeeded != null ? (item1.procurementNeeded).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : '')}</td> : (!item1.isProcurementGapRed ? <td></td> : <td title={i18n.t("static.forecastSummary.priceNotAvaiable")}><i class="fa fa-exclamation-triangle" style={{ "color": "#BA0C2F", "margin-top": "7px" }}></i></td>)}
                                                                                                <td>{item1.notes}</td>
                                                                                            </>
                                                                                        }
                                                                                    </>
                                                                                }

                                                                            </tr>

                                                                        </>
                                                                    ))}
                                                                </tbody>
                                                                {!this.state.hideColumn &&
                                                                    <tfoot>
                                                                        <tr>
                                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                            <td className='text-left sticky-col first-col clone' style={{ border: 'none' }}></td>
                                                                            <td style={{ border: 'none' }}></td>
                                                                            <td style={{ border: 'none' }}></td>
                                                                            <td style={{ border: 'none' }}></td>
                                                                            <td style={{ border: 'none' }}></td>
                                                                            <td style={{ border: 'none' }}></td>
                                                                            <td style={{ border: 'none' }}></td>
                                                                            <td style={{ border: 'none' }}></td>
                                                                            <td style={{ border: 'none' }}></td>
                                                                            <td><b>{i18n.t('static.forecastReport.productCost')}</b></td>
                                                                            <td><b>{'$ ' + (this.state.totalProductCost).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</b></td>
                                                                            <td style={{ border: 'none' }}></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                            <td className='text-left sticky-col first-col clone' style={{ border: 'none' }}></td>
                                                                            <td style={{ border: 'none' }}></td>
                                                                            <td style={{ border: 'none' }}></td>
                                                                            <td style={{ border: 'none' }}></td>
                                                                            <td style={{ border: 'none' }}></td>
                                                                            <td style={{ border: 'none' }}></td>
                                                                            <td style={{ border: 'none' }}></td>
                                                                            <td style={{ border: 'none' }}></td>
                                                                            <td style={{ border: 'none' }}></td>
                                                                            <td><b>{i18n.t('static.forecastReport.freight')} ({this.state.freightPerc}%)</b></td>
                                                                            <td><b>{'$ ' + (((this.state.freightPerc / 100) * this.state.totalProductCost).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</b></td>
                                                                            <td style={{ border: 'none' }}></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                            <td className='text-left sticky-col first-col clone' style={{ border: 'none' }}></td>
                                                                            <td style={{ border: 'none' }}></td>
                                                                            <td style={{ border: 'none' }}></td>
                                                                            <td style={{ border: 'none' }}></td>
                                                                            <td style={{ border: 'none' }}></td>
                                                                            <td style={{ border: 'none' }}></td>
                                                                            <td style={{ border: 'none' }}></td>
                                                                            <td style={{ border: 'none' }}></td>
                                                                            <td style={{ border: 'none' }}></td>
                                                                            <td><b>{i18n.t('static.shipment.totalCost')}</b></td>
                                                                            <td><b>{'$ ' + (parseFloat(parseFloat(this.state.totalProductCost) + parseFloat((this.state.freightPerc / 100) * this.state.totalProductCost)).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</b></td>
                                                                            <td style={{ border: 'none' }}></td>
                                                                        </tr>
                                                                    </tfoot>
                                                                }
                                                                {this.state.hideColumn &&
                                                                    <tfoot>
                                                                        <tr>
                                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                            <td className='text-left sticky-col first-col clone'></td>
                                                                            <td></td>
                                                                            <td><b>{i18n.t('static.forecastReport.productCost')}</b></td>
                                                                            <td><b>{'$ ' + (this.state.totalProductCost).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</b></td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                            <td className='text-left sticky-col first-col clone'></td>
                                                                            <td></td>
                                                                            <td><b>{i18n.t('static.forecastReport.freight')} ({this.state.freightPerc}%)</b></td>
                                                                            <td><b>{'$ ' + (parseFloat((this.state.freightPerc / 100) * this.state.totalProductCost).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</b></td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                            <td className='text-left sticky-col first-col clone'></td>
                                                                            <td></td>
                                                                            <td><b>{i18n.t('static.shipment.totalCost')}</b></td>
                                                                            <td><b>{'$ ' + (parseFloat(parseFloat(this.state.totalProductCost) + parseFloat((this.state.freightPerc / 100) * this.state.totalProductCost)).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</b></td>
                                                                            <td></td>
                                                                        </tr>
                                                                    </tfoot>
                                                                }
                                                            </Table>
                                                        </div>
                                                    </div>
                                                }
                                                {this.state.displayId == 2 &&
                                                    <div className='ForecastSummaryTable datdEntryRow'>
                                                        <div id="tableDiv" className="consumptionDataEntryTable custom-display">
                                                        </div>
                                                    </div>

                                                }
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
                    {this.state.regPlanningUnitList.length > 0 && this.state.displayId == 2 && this.state.dataArray.length > 0 && !this.state.onlineVersion && < CardFooter >
                        <FormGroup>
                            <FormGroup>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.filterData}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                {this.state.isChanged1 &&
                                    <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.saveSelectedForecast}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>
                                }
                            </FormGroup>
                        </FormGroup>
                    </CardFooter>}
                </Card>
                <Modal isOpen={this.state.showGuidance}
                    className={'modal-lg ' + this.props.className} >
                    <ModalHeader toggle={() => this.toggleShowGuidance()} className="ModalHead modal-info-Headher">
                        <strong className="TextWhite">{i18n.t('static.common.showGuidance')}</strong>
                    </ModalHeader>
                    <div>
                        <ModalBody>
                            <div dangerouslySetInnerHTML={{
                                __html: localStorage.getItem('lang') == 'en' ?
                                    showguidanceforForecastSummaryEn :
                                    localStorage.getItem('lang') == 'fr' ?
                                        showguidanceforForecastSummaryFr :
                                        localStorage.getItem('lang') == 'sp' ?
                                            showguidanceforForecastSummarySp :
                                            showguidanceforForecastSummaryPr
                            }} />
                        </ModalBody>
                    </div>
                </Modal>
            </div >
        );
    }
}

export default ForecastSummary;