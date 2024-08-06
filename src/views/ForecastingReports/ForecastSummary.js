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
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
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
        // console.log("E++++++++", e.target.checked);
        this.setState({
            hideCalculation: e.target.checked,
            hideColumn: !this.state.hideColumn
        })

    }

    storeProduct(e) {
        // console.log("E++++++++", e.target)
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
        // console.log("e+++", e);
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
        // csvRow.push('')
        csvRow.push('"' + (i18n.t('static.supplyPlan.runTime') + ' ' + moment(new Date()).format('hh:mm A')).replaceAll(' ', '%20') + '"')
        // csvRow.push('')
        csvRow.push('"' + (i18n.t('static.user.user') + ': ' + AuthenticationService.getLoggedInUsername()).replaceAll(' ', '%20') + '"')
        // csvRow.push('')
        csvRow.push('"' + (this.state.programs.filter(c => c.id == this.state.programId)[0].code + " " + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
        // csvRow.push('')
        // csvRow.push('"' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        // csvRow.push('')

        // csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        // csvRow.push('')
        // csvRow.push('"' + (i18n.t('static.report.versionFinal*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        // csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.forecastPeriod') + ': ' + document.getElementById("forecastPeriod").value).replaceAll(' ', '%20') + '"')
        // csvRow.push('')
        csvRow.push('"' + (i18n.t('static.forecastReport.display') + ': ' + this.state.displayName).replaceAll(' ', '%20') + '"')
        // csvRow.push('')

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
                // headers.push((i18n.t('static.report.stock')).replaceAll(' ', '%20') + (i18n.t('static.forecastReport.endOf')).replaceAll(' ', '%20') + this.state.endDateDisplay + ')');
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

            // this.state.buildCSVTable.map(ele =>
            //     A.push(this.addDoubleQuoteToRowContent([ ((ele.supplyPlanPlanningUnit).replaceAll(',', ' ')).replaceAll(' ', '%20'),
            //     ((ele.forecastPlanningUnit).replaceAll(',', ' ')).replaceAll(' ', '%20'),
            //     ele.region, this.dateFormatter(ele.month).replaceAll(' ', '%20'),
            //     ele.supplyPlanConsumption,
            //     ele.multiplier,
            //     ele.convertedConsumption,
            //     ele.currentQATConsumption,
            //     ele.import == true ? 'Yes' : 'No' ])));

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
                        // ((getLabelText(ele.tracerCategory.label, this.state.lang)).replaceAll(',', ' ')).replaceAll(' ', '%20'),
                        // ((getLabelText(ele.planningUnit.label, this.state.lang)).replaceAll(',', ' ')).replaceAll(' ', '%20'),
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
                // // console.log(A[i])
                csvRow.push(A[i].join(","))
            }

            var csvString = csvRow.join("%0A")
            // // console.log('csvString' + csvString)
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
                // console.log("Array--------->31", tsList);
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
                            // // console.log("Array--------->2", filterForecastSelected);
                            total += Number(filterForecastSelected != undefined && filterForecastSelected.totalForecast != null ? filterForecastSelected.totalForecast : 0);
                            total1 = total1 + (filterForecastSelected != undefined && filterForecastSelected.totalForecast != null ? filterForecastSelected.totalForecast : '');

                            // (tsList.filter(c => c.id == )[0].label)
                            let nameTC = '';
                            try {
                                // let idTC = (((filterForecastSelected != undefined) ? (filterForecastSelected.scenarioId > 0) ? "T" + filterForecastSelected.scenarioId : (filterForecastSelected.consumptionExtrapolationId > 0) ? "C" + filterForecastSelected.consumptionExtrapolationId : "" : ""));
                                let idTC = (((filterForecastSelected != undefined) ? (filterForecastSelected.scenarioId > 0) ? "T" + filterForecastSelected.treeId + "~" + filterForecastSelected.scenarioId : (filterForecastSelected.consumptionExtrapolationId > 0) ? "C" + filterForecastSelected.consumptionExtrapolationId : "" : ""));
                                nameTC = (tsList.filter(c => c.id == idTC)[0].name);

                            }
                            catch (err) {
                                // document.getElementById("demo").innerHTML = err.message;
                            }

                            // regionArray.push((((filterForecastSelected != undefined) ? (filterForecastSelected.scenarioId > 0) ? treeVar : (filterForecastSelected.consumptionExtrapolationId > 0) ? consumptionVar : "" : "")));
                            regionArray.push(((nameTC).replaceAll(',', ' ')).replaceAll(' ', '%20'));
                            regionArray.push((filterForecastSelected != undefined ? (filterForecastSelected.totalForecast == null ? "" : Number(filterForecastSelected.totalForecast).toFixed(2)) : ""));
                            regionArray.push((filterForecastSelected != undefined ? (filterForecastSelected.notes == null ? "" : ((filterForecastSelected.notes).replaceAll(',', ' ')).replaceAll(' ', '%20')) : ""));
                        }
                        // // console.log("Array--------->", regionArray);

                        A.push(this.addDoubleQuoteToRowContent([((puListFiltered[j].planningUnit.label.label_en).replaceAll(',', ' ')).replaceAll(' ', '%20')].concat(regionArray).concat([(total1 == '' ? '' : Number(total).toFixed(2))])));
                        // // console.log("Array--------->2", [((puListFiltered[j].planningUnit.label.label_en).replaceAll(',', ' ')).replaceAll(' ', '%20')].concat(regionArray).concat([total]));
                    }
                }

                for (var i = 0; i < A.length; i++) {
                    // // console.log(A[i])
                    csvRow.push(A[i].join(","))
                }

                var csvString = csvRow.join("%0A")
                // // console.log('csvString' + csvString)
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

                // for (var tc = 0; tc < tcList.length; tc++) {
                //     A.push([this.addDoubleQuoteToRowContent([((puList.filter(c => c.planningUnit.forecastingUnit.tracerCategory.id == tcList[tc])[0].planningUnit.forecastingUnit.tracerCategory.label.label_en).replaceAll(',', ' ')).replaceAll(' ', '%20')])]);

                //     var puListFiltered = puList.filter(c => c.planningUnit.forecastingUnit.tracerCategory.id == tcList[tc]);
                //     for (var j = 0; j < puListFiltered.length; j++) {
                //         let regionArray = [];
                //         var total = 0;
                //         let total1 = '';


                //         for (var k = 0; k < regRegionList.length; k++) {
                //             var filterForecastSelected = puListFiltered[j].selectedForecastMap[regRegionList[k].regionId]
                //             // // console.log("Array--------->2", filterForecastSelected);
                //             total += Number(filterForecastSelected != undefined ? filterForecastSelected.totalForecast : 0);
                //             total1 = total1 + (filterForecastSelected != undefined ? filterForecastSelected.totalForecast : '');

                //             // (tsList.filter(c => c.id == )[0].label)
                //             let nameTC = '';
                //             try {
                //                 // let idTC = (((filterForecastSelected != undefined) ? (filterForecastSelected.scenarioId > 0) ? "T" + filterForecastSelected.scenarioId : (filterForecastSelected.consumptionExtrapolationId > 0) ? "C" + filterForecastSelected.consumptionExtrapolationId : "" : ""));
                //                 let idTC = (((filterForecastSelected != undefined) ? (filterForecastSelected.scenarioId > 0) ? "T" + filterForecastSelected.treeId + "~" + filterForecastSelected.scenarioId : (filterForecastSelected.consumptionExtrapolationId > 0) ? "C" + filterForecastSelected.consumptionExtrapolationId : "" : ""));
                //                 nameTC = (tsList.filter(c => c.id == idTC)[0].name);

                //             }
                //             catch (err) {
                //                 // document.getElementById("demo").innerHTML = err.message;
                //             }

                //             // regionArray.push((((filterForecastSelected != undefined) ? (filterForecastSelected.scenarioId > 0) ? treeVar : (filterForecastSelected.consumptionExtrapolationId > 0) ? consumptionVar : "" : "")));
                //             regionArray.push(((nameTC).replaceAll(',', ' ')).replaceAll(' ', '%20'));
                //             regionArray.push((filterForecastSelected != undefined ? (filterForecastSelected.totalForecast == null ? "" : Math.round(filterForecastSelected.totalForecast)) : ""));
                //             regionArray.push((filterForecastSelected != undefined ? (filterForecastSelected.notes == null ? "" : ((filterForecastSelected.notes).replaceAll(',', ' ')).replaceAll(' ', '%20')) : ""));
                //         }
                //         // // console.log("Array--------->", regionArray);

                //         A.push(this.addDoubleQuoteToRowContent([((puListFiltered[j].planningUnit.label.label_en).replaceAll(',', ' ')).replaceAll(' ', '%20')].concat(regionArray).concat([(total1 == '' ? '' : Math.round(total))])));
                //         // // console.log("Array--------->2", [((puListFiltered[j].planningUnit.label.label_en).replaceAll(',', ' ')).replaceAll(' ', '%20')].concat(regionArray).concat([total]));
                //     }
                // }

                for (var i = 0; i < A.length; i++) {
                    // // console.log(A[i])
                    csvRow.push(A[i].join(","))
                }

                var csvString = csvRow.join("%0A")
                // // console.log('csvString' + csvString)
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
                // doc.text(i18n.t('static.supplyPlan.runDate') + " " + moment(new Date()).format(`${DATE_FORMAT_CAP}`), doc.internal.pageSize.width - 40, 20, {
                //     align: 'right'
                // })
                // doc.setFont('helvetica', 'normal')
                // doc.text(i18n.t('static.supplyPlan.runTime') + " " + moment(new Date()).format('hh:mm A'), doc.internal.pageSize.width - 40, 30, {
                //     align: 'right'
                // })
                // doc.text(i18n.t('static.user.user') + ': ' + AuthenticationService.getLoggedInUsername(), doc.internal.pageSize.width - 40, 40, {
                //     align: 'right'
                // })
                // doc.text(this.state.programs.filter(c => c.programId == this.state.programId)[0].programCode + " " + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text), doc.internal.pageSize.width - 40, 50, {
                //     align: 'right'
                // })
                // doc.text(document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width - 40, 60, {
                //     align: 'right'
                // })
                doc.setFontSize(TITLE_FONT)
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.forecastReport.forecastSummary'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    // doc.text(i18n.t('static.program.program') + ': ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 90, {
                    //     align: 'left'
                    // })
                    // doc.text(i18n.t('static.report.versionFinal*') + ': ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                    //     align: 'left'
                    // })

                    doc.fromHTML("<span style = 'font-family:helvetica;'><font size = '1' color = '#002f6c'><b>" + i18n.t('static.common.forecastPeriod') + ":</b> " + document.getElementById("forecastPeriod").value + "</font></span>", (doc.internal.pageSize.width / 8) - 50, 90)
                    doc.fromHTML("<span style = 'font-family:helvetica;'><font size = '1' color = '#002f6c'><b>" + i18n.t('static.forecastReport.display') + ":</b> " + this.state.displayName + "</font></span>", (doc.internal.pageSize.width / 8) - 50, 100)

                    // doc.setFont('helvetica', 'bold')
                    // doc.text(i18n.t('static.report.dateRange') + ': ' + document.getElementById("forecastPeriod").value, doc.internal.pageSize.width / 8, 90, {
                    //     align: 'left'
                    // })
                    // doc.setFont('helvetica', 'normal')
                    // doc.text(i18n.t('static.forecastReport.display') + ': ' + this.state.displayName, doc.internal.pageSize.width / 8, 100, {
                    //     align: 'left'
                    // })

                    let viewById = this.state.displayId;
                    if (viewById == 1) {//National
                        // doc.text(i18n.t('static.forecastReport.hideCalculations') + ': ' + (this.state.hideCalculation == true ? i18n.t('static.realm.yes') : i18n.t('static.program.no')), doc.internal.pageSize.width / 8, 110, {
                        //     align: 'left'
                        // })
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


        // const title = i18n.t('static.dashboard.stockstatusmatrix');
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
                            // // console.log("Array--------->2", filterForecastSelected);
                            total += Number(filterForecastSelected != undefined && filterForecastSelected.totalForecast != null ? filterForecastSelected.totalForecast : '');
                            total1 = total1 + (filterForecastSelected != undefined && filterForecastSelected.totalForecast != null ? filterForecastSelected.totalForecast : '');

                            let nameTC = '';
                            try {
                                // let idTC = (((filterForecastSelected != undefined) ? (filterForecastSelected.scenarioId > 0) ? "T" + filterForecastSelected.scenarioId : (filterForecastSelected.consumptionExtrapolationId > 0) ? "C" + filterForecastSelected.consumptionExtrapolationId : "" : ""));
                                let idTC = (((filterForecastSelected != undefined) ? (filterForecastSelected.scenarioId > 0) ? "T" + filterForecastSelected.treeId + "~" + filterForecastSelected.scenarioId : (filterForecastSelected.consumptionExtrapolationId > 0) ? "C" + filterForecastSelected.consumptionExtrapolationId : "" : ""));
                                nameTC = (tsList.filter(c => c.id == idTC)[0].name);

                            }
                            catch (err) {
                                // document.getElementById("demo").innerHTML = err.message;
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

                // console.log("data------------------>12345 ", data);

                var startY = 140;
                let content = {
                    margin: { top: 80, bottom: 90 },
                    startY: startY,
                    head: header,
                    body: data,
                    styles: { lineWidth: 1, fontSize: 8, halign: 'center' },
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

                // console.log("data------------------>123456 ", data);

                var startY = 130;
                let content = {
                    margin: { top: 80, bottom: 90 },
                    startY: startY,
                    head: header,
                    body: data,
                    styles: { lineWidth: 1, fontSize: 8, halign: 'center' },
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
        // console.log("INSIDE FILTERDATA---------------------------------");
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        // console.log("programId----------->", programId);
        // console.log("versionId----------->", versionId);
        let displayId = this.state.displayId;
        (displayId == 1 ? document.getElementById("hideCalculationDiv").style.display = "block" : document.getElementById("hideCalculationDiv").style.display = "none");
        (displayId == 1 ? document.getElementById("hideLegendDiv").style.display = "block" : document.getElementById("hideLegendDiv").style.display = "none");
        // (displayId == 1 ? document.getElementById("hideCurrencyDiv").style.display = "block" : document.getElementById("hideCurrencyDiv").style.display = "none");
        // this.setState({
        //     displayId: displayId
        // })
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();

        let start_date = new Date(startDate);
        let end_date = new Date(endDate);
        // let total_months = (end_date.getFullYear() - start_date.getFullYear()) * 12 + (end_date.getMonth() - start_date.getMonth()) + 1;
        let total_months = (end_date.getFullYear() - start_date.getFullYear()) * 12;
        total_months += end_date.getMonth() - start_date.getMonth()
        total_months = total_months + 1;
        // console.log("total_months----------->", programId + '-----------------' + total_months);


        if (versionId != 0 && programId > 0) {
            if (versionId == -1) {
                // console.log("1----------insdie 1--------------",versionId);
                this.setState({ message: i18n.t('static.program.validversion'), summeryData: [], dataArray: [], versionId: '', forecastPeriod: '', });
                try {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    // this.el.destroy();
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                }
                catch (err) {
                    // document.getElementById("demo").innerHTML = err.message;
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
                        // Handle errors!
                    };
                    getRequest.onsuccess = function (event) {
                        var myResult = [];
                        myResult = getRequest.result;
                        // // console.log("DATASET----------->", myResult);
                        // this.setState({
                        //     datasetList: myResult
                        // });

                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                        var userId = userBytes.toString(CryptoJS.enc.Utf8);
                        var filteredGetRequestList = myResult.filter(c => c.userId == userId);
                        for (var i = 0; i < filteredGetRequestList.length; i++) {

                            var bytes = CryptoJS.AES.decrypt(filteredGetRequestList[i].programName, SECRET_KEY);
                            var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                            var programDataBytes = CryptoJS.AES.decrypt(filteredGetRequestList[i].programData, SECRET_KEY);
                            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                            var programJson1 = JSON.parse(programData);
                            // console.log("programJson1-------->1", programJson1);
                            // let dupForecastingUnitObj = programJson1.consumptionList.map(ele => ele.consumptionUnit.forecastingUnit);
                            // const ids = dupForecastingUnitObj.map(o => o.id)
                            // const filtered = dupForecastingUnitObj.filter(({ id }, index) => !ids.includes(id, index + 1))
                            // // console.log("programJson1-------->2", filtered);

                            // let dupPlanningUnitObjwithNull = programJson1.consumptionList.map(ele => ele.consumptionUnit.planningUnit);
                            // let dupPlanningUnitObj = dupPlanningUnitObjwithNull.filter(c => c != null);
                            // const idsPU = dupPlanningUnitObj.map(o => o.id)
                            // const filteredPU = dupPlanningUnitObj.filter(({ id }, index) => !idsPU.includes(id, index + 1))

                            datasetList.push({
                                programCode: filteredGetRequestList[i].programCode,
                                programVersion: filteredGetRequestList[i].version,
                                programId: filteredGetRequestList[i].programId,
                                versionId: filteredGetRequestList[i].version,
                                id: filteredGetRequestList[i].id,
                                loading: false,
                                forecastStartDate: (programJson1.currentVersion.forecastStartDate ? moment(programJson1.currentVersion.forecastStartDate).format(`MMM-YYYY`) : ''),
                                forecastStopDate: (programJson1.currentVersion.forecastStopDate ? moment(programJson1.currentVersion.forecastStopDate).format(`MMM-YYYY`) : ''),
                                healthAreaList: programJson1.healthAreaList,
                                actualConsumptionList: programJson1.actualConsumptionList,
                                consumptionExtrapolation: programJson1.consumptionExtrapolation,
                                treeList: programJson1.treeList,
                                planningUnitList: programJson1.planningUnitList,
                                // filteredForecastingUnit: filtered,
                                // filteredPlanningUnit: filteredPU,
                                regionList: programJson1.regionList,
                                label: programJson1.label,
                                realmCountry: programJson1.realmCountry,
                            });
                            datasetList1.push(filteredGetRequestList[i])
                            // }
                        }
                        // console.log("DATASET-------->", datasetList);
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
                            // console.log("Test------------>1", filteredProgram);

                            let planningUnitList = filteredProgram.planningUnitList;
                            planningUnitList = planningUnitList.filter(c => c.active == true);
                            let summeryData = [];
                            let tempData = [];


                            let treeList = filteredProgram.treeList.filter(c => c.active == true);;
                            let regionList = filteredProgram.regionList;
                            let consumptionExtrapolation = filteredProgram.consumptionExtrapolation;

                            let duplicateTracerCategoryId = planningUnitList.map(c => c.planningUnit.forecastingUnit.tracerCategory.id)
                            let filteredTracercategoryId = [...new Set(duplicateTracerCategoryId)];
                            // console.log("Test------------>2", filteredTracercategoryId);
                            let totalProductCost = 0.0;

                            // planningUnitList = planningUnitList.filter(c => Object.keys(c.selectedForecastMap).length !== 0)
                            // planningUnitList = planningUnitList.filter(c => ((c.selectedForecastMap[(Object.keys(c.selectedForecastMap))].scenarioId != null) ? c : ((c.selectedForecastMap[(Object.keys(c.selectedForecastMap))].consumptionExtrapolationId != 0) ? c : '')));

                            for (var j = 0; j < planningUnitList.length; j++) {

                                //calculation part
                                let nodeDataMomList = [];
                                let consumptionData = [];
                                let selectedForecastMap = planningUnitList[j].selectedForecastMap;
                                // console.log("Test------------>2", selectedForecastMap);
                                // console.log("Test------------>3", Object.keys(selectedForecastMap)[0]);
                                // console.log("Test------------>4", (selectedForecastMap[Object.keys(selectedForecastMap)[0]]));
                                let notes1 = '';
                                var isForecastSelected = false;
                                if ((selectedForecastMap[Object.keys(selectedForecastMap)[0]]) != undefined && (selectedForecastMap[Object.keys(selectedForecastMap)[0]]) != '' && (selectedForecastMap[Object.keys(selectedForecastMap)[0]]) != null) {

                                    let keys = Object.keys(selectedForecastMap);
                                    for (let k = 0; k < keys.length; k++) {
                                        let selectedForecastMapObjIn = (selectedForecastMap[keys[k]]);

                                        //add notes
                                        if (selectedForecastMapObjIn.notes != '' && selectedForecastMapObjIn.notes != undefined) {
                                            if (notes1 == '') {
                                                notes1 = regionList.filter(c => c.regionId == keys[k])[0].label.label_en + ': ' + selectedForecastMapObjIn.notes;
                                            } else {
                                                notes1 = notes1.concat(' | ' + regionList.filter(c => c.regionId == keys[k])[0].label.label_en + ': ' + selectedForecastMapObjIn.notes);
                                            }
                                        }
                                        // console.log("planningUnitList Test@123",planningUnitList[j]);
                                        // console.log("checkPU------------>2", selectedForecastMapObjIn);
                                        if (((selectedForecastMapObjIn.scenarioId != null) ? true : ((selectedForecastMapObjIn.consumptionExtrapolationId != 0) ? true : false))) {
                                            // console.log("In side scenario Id Test@123")
                                            let treeId = selectedForecastMapObjIn.treeId;
                                            let scenarioId = selectedForecastMapObjIn.scenarioId;
                                            let consumptionExtrapolationId = selectedForecastMapObjIn.consumptionExtrapolationId;
                                            if (scenarioId != null) {//scenarioId
                                                // console.log("In side scenario Id is not null Test@123")
                                                for (let p = 0; p < treeList.length; p++) {
                                                    // let filteredScenario = treeList[p].scenarioList.filter(c => c.id == scenarioId);
                                                    let filteredScenario = (treeList[p].treeId == treeId ? treeList[p].scenarioList.filter(c => c.id == scenarioId && c.active.toString() == "true") : []);
                                                    if (filteredScenario.length > 0) {
                                                        isForecastSelected = true;
                                                        // console.log("Inside filter scenario Test@123")
                                                        let flatlist = treeList[p].tree.flatList;
                                                        let listContainNodeType5 = flatlist.filter(c => c.payload.nodeType.id == 5);
                                                        // console.log("Test------------>5", listContainNodeType5);
                                                        // console.log("Test------------>6", listContainNodeType5[0].payload);
                                                        // console.log("Test------------>7", (listContainNodeType5[0].payload.nodeDataMap[scenarioId]));

                                                        let myTempData = [];
                                                        for (let k = 0; k < listContainNodeType5.length; k++) {
                                                            // console.log("Indise list of node Test@123")
                                                            let arrayOfNodeDataMap = (listContainNodeType5[k].payload.nodeDataMap[scenarioId]).filter(c => c.puNode.planningUnit.id == planningUnitList[j].planningUnit.id)
                                                            // console.log("Test------------>7.1", arrayOfNodeDataMap);

                                                            if (arrayOfNodeDataMap.length > 0) {
                                                                // console.log("Inside array of node data mao Test@123")
                                                                // console.log("Test------------>8", arrayOfNodeDataMap[0].nodeDataMomList, ' --- ', planningUnitList[j].planningUnit);
                                                                nodeDataMomList = arrayOfNodeDataMap[0].nodeDataMomList;
                                                                // console.log("Node data mom list Test@123")
                                                                let consumptionList = nodeDataMomList.map(m => {
                                                                    return {
                                                                        consumptionDate: m.month,
                                                                        // consumptionQty: Math.round(m.calculatedMmdValue)
                                                                        consumptionQty: (m.calculatedMmdValue == null ? 0 : (m.calculatedMmdValue))
                                                                    }
                                                                });

                                                                if (consumptionData.length > 0) {
                                                                    consumptionData[0].consumptionList = consumptionData[0].consumptionList.concat(consumptionList);
                                                                } else {
                                                                    let jsonTemp = { objUnit: planningUnitList[j].planningUnit, scenario: { id: 1, label: treeList[p].label.label_en + filteredScenario[0].label.label_en }, display: true, color: "#ba0c2f", consumptionList: consumptionList }
                                                                    consumptionData.push(jsonTemp);
                                                                }
                                                                // break;
                                                            }
                                                        }

                                                    }

                                                }
                                            } else {//consumptionExtrapolationId
                                                // console.log("in else Test@123")
                                                let consumptionExtrapolationObj = consumptionExtrapolation.filter(c => c.consumptionExtrapolationId == consumptionExtrapolationId);
                                                // console.log("consumptionExtrapolationObj-----------> Test@123", consumptionExtrapolationObj);
                                                if (consumptionExtrapolationObj.length > 0) {
                                                    isForecastSelected = true;
                                                    // console.log("In if Test@123")
                                                    let consumptionList = consumptionExtrapolationObj[0].extrapolationDataList.map(m => {
                                                        return {
                                                            consumptionDate: m.month,
                                                            // consumptionQty: (m.amount).toFixed(2)
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


                                    // let selectedForecastMapObjIn = (selectedForecastMap[Object.keys(selectedForecastMap)[0]]);
                                    // // console.log("checkPU------------>2", selectedForecastMapObjIn);

                                    // let treeId = selectedForecastMapObjIn.treeId;
                                    // let scenarioId = selectedForecastMapObjIn.scenarioId;
                                    // let consumptionExtrapolationId = selectedForecastMapObjIn.consumptionExtrapolationId;

                                    // if (scenarioId != null) {//scenarioId
                                    //     for (let p = 0; p < treeList.length; p++) {
                                    //         // let filteredScenario = treeList[p].scenarioList.filter(c => c.id == scenarioId);
                                    //         let filteredScenario = (treeList[p].treeId == treeId ? treeList[p].scenarioList.filter(c => c.id == scenarioId) : []);
                                    //         if (filteredScenario.length > 0) {
                                    //             let flatlist = treeList[p].tree.flatList;
                                    //             let listContainNodeType5 = flatlist.filter(c => c.payload.nodeType.id == 5);
                                    //             // console.log("Test------------>5", listContainNodeType5);
                                    //             // console.log("Test------------>6", listContainNodeType5[0].payload);
                                    //             // console.log("Test------------>7", (listContainNodeType5[0].payload.nodeDataMap[scenarioId]));

                                    //             for (let k = 0; k < listContainNodeType5.length; k++) {
                                    //                 let arrayOfNodeDataMap = (listContainNodeType5[k].payload.nodeDataMap[scenarioId]).filter(c => c.puNode.planningUnit.id == planningUnitList[j].planningUnit.id)
                                    //                 // console.log("Test------------>7.1", arrayOfNodeDataMap);

                                    //                 if (arrayOfNodeDataMap.length > 0) {
                                    //                     // console.log("Test------------>8", arrayOfNodeDataMap[0].nodeDataMomList);
                                    //                     nodeDataMomList = arrayOfNodeDataMap[0].nodeDataMomList;
                                    //                     let consumptionList = nodeDataMomList.map(m => {
                                    //                         return {
                                    //                             consumptionDate: m.month,
                                    //                             consumptionQty: (m.calculatedMmdValue).toFixed(2)
                                    //                         }
                                    //                     });
                                    //                     let jsonTemp = { objUnit: planningUnitList[j].planningUnit, scenario: { id: 1, label: treeList[p].label.label_en + filteredScenario[0].label.label_en }, display: true, color: "#ba0c2f", consumptionList: consumptionList }
                                    //                     consumptionData.push(jsonTemp);

                                    //                     break;
                                    //                 }
                                    //             }

                                    //         }

                                    //     }
                                    // } else {//consumptionExtrapolationId

                                    //     let consumptionExtrapolationObj = consumptionExtrapolation.filter(c => c.consumptionExtrapolationId == consumptionExtrapolationId);
                                    //     // console.log("consumptionExtrapolationObj----------->", consumptionExtrapolationObj);
                                    //     if (consumptionExtrapolationObj.length > 0) {
                                    //         let consumptionList = consumptionExtrapolationObj[0].extrapolationDataList.map(m => {
                                    //             return {
                                    //                 consumptionDate: m.month,
                                    //                 // consumptionQty: (m.amount).toFixed(2)
                                    //                 consumptionQty: (m.amount == null ? 0 : Number(m.amount).toFixed(2))
                                    //             }
                                    //         });
                                    //         let jsonTemp = { objUnit: planningUnitList[j].planningUnit, scenario: { id: 1, label: "" }, display: true, color: "#ba0c2f", consumptionList: consumptionList }
                                    //         consumptionData.push(jsonTemp);

                                    //     }
                                    // }





                                    // console.log("consumptionData Test@123",consumptionData)
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

                                        // logic for add same date data
                                        resultTrue = Object.values(tempList1.reduce((a, { consumptionDate, consumptionQty, id }) => {
                                            if (!a[id])
                                                a[id] = Object.assign({}, { consumptionDate, consumptionQty, id });
                                            else
                                                // a[id].consumptionQty += consumptionQty;
                                                a[id].consumptionQty = parseFloat(a[id].consumptionQty) + parseFloat(consumptionQty);
                                            return a;
                                        }, {}));
                                        // console.log("Result True Test@123",resultTrue)
                                        totalForecastedQuantity0ri = (resultTrue.length > 0 ? parseFloat(resultTrue[0].consumptionQty) : 0);

                                    }

                                    totalForecastedQuantity0ri = (totalForecastedQuantity0ri);
                                    if (!isForecastSelected) {
                                        totalForecastedQuantity0ri = null;
                                    }


                                    //obj parameter decleration
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
                                    // let procurementNeeded = (isProcurementGapRed == true ? '$ ' + (tempProcurementGap * unitPrice).toFixed(2) : '');
                                    let procurementNeeded = (isProcurementGapRed == true ? '$ ' + (Math.abs(tempProcurementGap) * Number(unitPrice)).toFixed(2) : '');
                                    let notes = planningUnitList[j].consumptionNotes;

                                    let obj = { id: 1, tempTracerCategoryId: tracerCategory.id, display: true, tracerCategory: tracerCategory, forecastingUnit: forecastingUnit, planningUnit: planningUnit, totalForecastedQuantity: totalForecastedQuantity, stock1: stock1, existingShipments: existingShipments, stock2: stock2.toFixed(2), isStock2Red: isStock2Red, desiredMonthOfStock1: desiredMonthOfStock1, desiredMonthOfStock2: desiredMonthOfStock2.toFixed(2), procurementGap: procurementGap.toFixed(2), isProcurementGapRed: isProcurementGapRed, priceType: priceType, isPriceTypeRed: isPriceTypeRed, unitPrice: unitPrice, procurementNeeded: procurementNeeded, notes: notes1 }
                                    tempData.push(obj);



                                    if (isProcurementGapRed == true) {
                                        totalProductCost = parseFloat(totalProductCost) + parseFloat(Math.abs(tempProcurementGap) * unitPrice);
                                        // console.log("totalProductCost----------->4", totalProductCost);
                                    }

                                } else {
                                    //obj parameter decleration
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
                                    // let procurementNeeded = (isProcurementGapRed == true ? '$ ' + (tempProcurementGap * unitPrice).toFixed(2) : '');
                                    let procurementNeeded = (isProcurementGapRed == true ? '$ ' + (Math.abs(tempProcurementGap) * unitPrice).toFixed(2) : '');
                                    let notes = planningUnitList[j].consumptionNotes;

                                    let obj = { id: 1, tempTracerCategoryId: tracerCategory.id, display: true, tracerCategory: tracerCategory, forecastingUnit: forecastingUnit, planningUnit: planningUnit, totalForecastedQuantity: totalForecastedQuantity, stock1: stock1, existingShipments: existingShipments, stock2: stock2.toFixed(2), isStock2Red: isStock2Red, desiredMonthOfStock1: desiredMonthOfStock1, desiredMonthOfStock2: desiredMonthOfStock2.toFixed(2), procurementGap: procurementGap.toFixed(2), isProcurementGapRed: isProcurementGapRed, priceType: priceType, isPriceTypeRed: isPriceTypeRed, unitPrice: unitPrice, procurementNeeded: procurementNeeded, notes: notes1 }
                                    tempData.push(obj);



                                    if (isProcurementGapRed == true) {
                                        totalProductCost = parseFloat(totalProductCost) + parseFloat(Math.abs(tempProcurementGap) * Number(unitPrice));
                                        // console.log("totalProductCost----------->4", totalProductCost);
                                    }
                                }


                            }
                            totalProductCost = parseFloat(totalProductCost).toFixed(2);
                            // console.log("totalProductCost----------->5", totalProductCost);
                            // // console.log("consumptionData----->", consumptionData);
                            // // console.log("Test------------>3331", filteredTracercategoryId);
                            // // console.log("Test------------>3332", tempData);
                            //sort based on tracerCategory
                            for (var i = 0; i < filteredTracercategoryId.length; i++) {
                                let filteredTracerCategoryList = tempData.filter(c => c.tracerCategory.id == filteredTracercategoryId[i]);
                                // // console.log("Test------------>3333", filteredTracerCategoryList);
                                if (filteredTracerCategoryList.length > 0) {
                                    let obj = { id: 0, tempTracerCategoryId: filteredTracerCategoryList[0].tracerCategory.id, display: true, tracerCategory: filteredTracerCategoryList[0].tracerCategory, forecastingUnit: '', planningUnit: '', totalForecastedQuantity: '', stock1: '', existingShipments: '', stock2: '', isStock2Red: '', desiredMonthOfStock1: '', desiredMonthOfStock2: '', procurementGap: '', priceType: '', unitPrice: '', procurementNeeded: '', notes: '' }
                                    summeryData.push(obj);
                                    summeryData = summeryData.concat(filteredTracerCategoryList);
                                }
                            }
                            // console.log("Test------------>301", summeryData);
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
                                    // // console.log("langaugeList---->", langaugeList);
                                    let dataArray = [];
                                    // console.log("Test@123 datasetJson",this.state.regDatasetJson)
                                    var treeList = this.state.regDatasetJson.treeList.filter(c => c.active == true);;
                                    // console.log("TreeList+++", treeList)
                                    var consumptionExtrapolation = this.state.regDatasetJson.consumptionExtrapolation;
                                    var tsList = [];
                                    let startDate = this.state.regDatasetJson.forecastStartDate;
                                    let endDate = this.state.regDatasetJson.forecastStopDate;
                                    for (var tl = 0; tl < treeList.length; tl++) {
                                        var scenarioList = treeList[tl].scenarioList.filter(c => c.active.toString() == "true");
                                        for (var sl = 0; sl < scenarioList.length; sl++) {
                                            tsList.push({ id: "T" + treeList[tl].treeId + '~' + scenarioList[sl].id, name: treeList[tl].label.label_en + " - " + scenarioList[sl].label.label_en, flatList: treeList[tl].tree.flatList, planningUnitId: "", type: "T", id1: scenarioList[sl].id, treeId: treeList[tl].treeId, totalForecast: 0, region: treeList[tl].regionList });
                                        }
                                    }
                                    for (var ce = 0; ce < consumptionExtrapolation.length; ce++) {
                                        var total = 0;
                                        // console.log("consumptionExtrapolation[ce].extrapolationDataList+++", consumptionExtrapolation[ce].extrapolationDataList)
                                        consumptionExtrapolation[ce].extrapolationDataList.filter(c => moment(c.month).format("YYYY-MM-DD") >= moment(startDate).format("YYYY-MM-DD") && moment(c.month).format("YYYY-MM-DD") <= moment(endDate).format("YYYY-MM-DD")).map(ele => {
                                            total += Number(ele.amount);
                                        });
                                        // console.log("total+++", total);
                                        // if (consumptionExtrapolation[ce].extrapolationMethod.active == true) {
                                        tsList.push({ id: "C" + consumptionExtrapolation[ce].consumptionExtrapolationId, name: consumptionExtrapolation[ce].extrapolationMethod.label.label_en, planningUnitId: consumptionExtrapolation[ce].planningUnit.id, type: "C", id1: consumptionExtrapolation[ce].consumptionExtrapolationId, totalForecast: total, region: [consumptionExtrapolation[ce].region] });
                                        // }

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
                                    // console.log("tcList+++", tcList);
                                    var puList = this.state.regPlanningUnitList;
                                    // console.log("PuList+++", puList);
                                    var regRegionList = this.state.regRegionList;
                                    for (var tc = 0; tc < tcList.length; tc++) {
                                        data = [];
                                        data[0] = puList.filter(c => c.planningUnit.forecastingUnit.tracerCategory.id == tcList[tc])[0].planningUnit.forecastingUnit.tracerCategory.label.label_en;
                                        data[1] = "";
                                        // data[2] = "";
                                        data[2] = puList.filter(c => c.planningUnit.forecastingUnit.tracerCategory.id == tcList[tc])[0].planningUnit.forecastingUnit.tracerCategory.label.label_en;
                                        for (var k = 0; k < this.state.regRegionList.length; k++) {
                                            // data[k + 3] = "";
                                            // data[k + 4] = "";
                                            // data[k + 5] = "";
                                            data[(k + 1) * 3] = "";
                                            data[((k + 1) * 3) + 1] = "";
                                            data[((k + 1) * 3) + 2] = "";
                                        }
                                        data[(regRegionList.length * 3) + 3] = 1
                                        data[(regRegionList.length * 3) + 4] = ""
                                        data[(regRegionList.length * 3) + 5] = 0

                                        // console.log("data------------------->3211", data);
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
                                                // console.log("filterForecastSelected+++", filterForecastSelected);
                                                // console.log("filterForecastSelected != undefined ? filterForecastSelected.notes : +++", filterForecastSelected != undefined ? filterForecastSelected.notes : "");
                                                var selectedForecast = (filterForecastSelected != undefined) ? (filterForecastSelected.scenarioId > 0) ? "T" + filterForecastSelected.treeId + "~" + filterForecastSelected.scenarioId : (filterForecastSelected.consumptionExtrapolationId > 0) ? "C" + filterForecastSelected.consumptionExtrapolationId : "" : "";
                                                data[(k + 1) * 3] = selectedForecast;
                                                var totalForecast = 0;
                                                if (selectedForecast != "") {
                                                    var tsListFilter = tsList.filter(c => c.id == selectedForecast)[0]
                                                    if (tsListFilter != undefined) {
                                                        // console.log("totalForecast---------->0", tsListFilter);
                                                        totalForecast = 0;
                                                        if (tsListFilter.type == "C") {
                                                            totalForecast = tsListFilter.totalForecast;
                                                        } else {
                                                            var flatList = tsListFilter.flatList;
                                                            // console.log("Flat List @@@@@@@ Test", flatList)
                                                            var flatListFilter = flatList.filter(c => c.payload.nodeType.id == 5 && c.payload.nodeDataMap[tsListFilter.id1][0].puNode != null && c.payload.nodeDataMap[tsListFilter.id1][0].puNode.planningUnit.id == puListFiltered[j].planningUnit.id);
                                                            // console.log("Flat List Filter @@@@@@@ Test", flatListFilter)
                                                            var nodeDataMomList = [];
                                                            for (var fl = 0; fl < flatListFilter.length; fl++) {
                                                                nodeDataMomList = nodeDataMomList.concat(flatListFilter[fl].payload.nodeDataMap[tsListFilter.id1][0].nodeDataMomList.filter(c => moment(c.month).format("YYYY-MM") >= moment(this.state.regDatasetJson.forecastStartDate).format("YYYY-MM") && moment(c.month).format("YYYY-MM") <= moment(this.state.regDatasetJson.forecastStopDate).format("YYYY-MM")));
                                                            }
                                                            nodeDataMomList.map(ele => {
                                                                totalForecast += Number(ele.calculatedMmdValue);
                                                            });
                                                        }
                                                    } else {
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
                                            // data[(regRegionList.length * 3) + 4] = total;
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
                                        columns.push({ title: i18n.t('static.compareVersion.selectedForecast'), type: 'dropdown', width: 100, source: tsList, filter: this.filterTsList });//D3
                                        columns.push({ title: i18n.t('static.forecastReport.forecastQuantity'), type: 'numeric', textEditor: true, mask: '#,##.00', decimal: '.', width: 100, readOnly: true });//E4
                                        columns.push({ title: i18n.t('static.program.notes'), type: 'text', width: 100 });//F5
                                    }
                                    columns.push({ title: i18n.t('static.supplyPlan.type'), type: 'hidden', width: 100, readOnly: true });//G6
                                    columns.push({ title: i18n.t('static.forecastOutput.totalForecastQuantity'), type: 'numeric', textEditor: true, mask: '#,##.00', decimal: '.', width: 100, readOnly: true });//H7
                                    columns.push({ title: 'forecast Blank', type: 'hidden', width: 100, readOnly: true });//I8
                                    let nestedHeaders = [];
                                    // nestedHeaders.push(
                                    //     {
                                    //         title: '',
                                    //         colspan: '1'
                                    //     },

                                    // );
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
                                    // if (langaugeList.length == 0) {
                                    //     data = [];
                                    //     languageArray[0] = data;
                                    // }
                                    // // console.log("languageArray---->", languageArray);
                                    try {
                                        this.el = jexcel(document.getElementById("tableDiv"), '');
                                        // this.el.destroy();
                                        jexcel.destroy(document.getElementById("tableDiv"), true);
                                    }
                                    catch (err) {
                                        // document.getElementById("demo").innerHTML = err.message;
                                    }

                                    // console.log("DataArray+++", dataArray);
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
                                        // text: {
                                        //     // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                                        //     showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                                        //     show: '',
                                        //     entries: '',
                                        // },
                                        pagination: false,
                                        search: false,
                                        columnSorting: true,
                                        // tableOverflow: true,
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
                                        editable: AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_LIST_FORECAST_SUMMARY') ? true : false,
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
                    // displayId: 0
                })

                displayId = (displayId == 1 ? 2 : 1);


                let inputJson = {
                    "programId": programId,
                    "versionId": versionId,
                    "reportView": displayId//2-National 1-Regional
                }

                // console.log("OnlineInputJson---------------->reportView", displayId);

                // console.log("OnlineInputJson---------------->", inputJson);

                ReportService.forecastSummary(inputJson)
                    .then(response => {
                        // console.log("RESP---------->forecastSummary", response.data);
                        let primaryOutputData = response.data.filter(c => c.planningUnit.active == true);
                        let totalProductCost = 0;


                        if (displayId == 2) {//National
                            let duplicateTracerCategoryId = primaryOutputData.map(c => c.tracerCategory.id);
                            let filteredTracercategoryId = [...new Set(duplicateTracerCategoryId)];
                            // console.log("Test------------>Online---2", filteredTracercategoryId);

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
                                // let procurementNeeded = (isProcurementGapRed == true ? '$ ' + (tempProcurementGap * unitPrice).toFixed(2) : '');
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
                                // // console.log("Test------------>3333", filteredTracerCategoryList);
                                if (filteredTracerCategoryList.length > 0) {
                                    let obj = { id: 0, tempTracerCategoryId: filteredTracerCategoryList[0].tracerCategory.id, display: true, tracerCategory: filteredTracerCategoryList[0].tracerCategory, forecastingUnit: '', planningUnit: '', totalForecastedQuantity: '', stock1: '', existingShipments: '', stock2: '', isStock2Red: '', desiredMonthOfStock1: '', desiredMonthOfStock2: '', procurementGap: '', priceType: '', unitPrice: '', procurementNeeded: '', notes: '' }
                                    summeryData.push(obj);
                                    summeryData = summeryData.concat(filteredTracerCategoryList);
                                }
                            }
                            // console.log("Test------------>Online---301", summeryData);

                            totalProductCost = parseFloat(totalProductCost).toFixed(2);
                            this.setState({
                                loading: (displayId == 1 ? true : false),
                                summeryData: summeryData,
                                totalProductCost: totalProductCost,
                                freightPerc: (primaryOutputData.length > 0 ? (primaryOutputData[0].freightPerc != null ? Number(primaryOutputData[0].freightPerc) : '') : '')
                                // displayId: 1
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

                            // console.log("summeryData--------------->", summeryData);

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
                                // this.el.destroy();
                                jexcel.destroy(document.getElementById("tableDiv"), true);
                            }
                            catch (err) {
                                // document.getElementById("demo").innerHTML = err.message;
                            }
                            // console.log("DataArray+++", dataArray);
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
                                // text: {
                                //     // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                                //     showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                                //     show: '',
                                //     entries: '',
                                // },
                                pagination: false,
                                search: false,
                                columnSorting: true,
                                // tableOverflow: true,
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
                                // onchange: this.forecastChanged,
                                onload: function (instance, cell, x, y, value) {
                                    jExcelLoadedFunctionOnlyHideRow(instance);
                                    var elInstance = instance.worksheets[0];
                                    var rowElement = elInstance.records;
                                    console.log("hello1")

                                    for (var r = 0; r < rowElement.length; r++) {
                                        if (rowElement[r][0].v == 1) {
                                            for (var j = 0; j < rowElement[r].length; j++) {
                                                var ele = rowElement[r][j].element;
                                                ele.classList.add('readonly');
                                                ele.classList.add('regionBold');
                                            }
                                        }
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

                        // alert("Hi");
                        // // console.log("2------------------------");
                        // this.setState({ message: '', summeryData: [], dataArray: [] });
                        // try {
                        //     this.el = jexcel(document.getElementById("tableDiv"), '');
                        //     this.el.destroy();
                        // }
                        // catch (err) {
                        //     // document.getElementById("demo").innerHTML = err.message;
                        // }


                    }).catch(
                        error => {
                            if (error.message === "Network Error") {
                                this.setState({
                                    // message: 'static.unkownError',
                                    message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
                // this.el.destroy();
                jexcel.destroy(document.getElementById("tableDiv"), true);
            }
            catch (err) {
                // document.getElementById("demo").innerHTML = err.message;
            }

        } else if (versionId == -1) {
            // console.log("3------------------------");
            this.setState({ message: i18n.t('static.program.validversion'), summeryData: [], dataArray: [], versionId: '', forecastPeriod: '', });
            try {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                // this.el.destroy();
                jexcel.destroy(document.getElementById("tableDiv"), true);
            }
            catch (err) {
                // document.getElementById("demo").innerHTML = err.message;
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
        if (index != -1) {
            if (value != "") {
                // alert("If");
                var tsListFilter = this.state.tsList.filter(c => c.id == value)[0]
                // console.log("totalForecast---------->0", tsListFilter);
                var totalForecast = 0;
                if (tsListFilter.type == "C") {
                    totalForecast = tsListFilter.totalForecast;
                } else {
                    var flatList = tsListFilter.flatList;
                    // console.log("Flat List @@@@@@@ Test", flatList)
                    var flatListFilter = flatList.filter(c => c.payload.nodeType.id == 5 && c.payload.nodeDataMap[tsListFilter.id1][0].puNode != null && c.payload.nodeDataMap[tsListFilter.id1][0].puNode.planningUnit.id == rowData[1].id);
                    // console.log("Flat List Filter @@@@@@@ Test", flatListFilter)
                    var nodeDataMomList = [];
                    for (var fl = 0; fl < flatListFilter.length; fl++) {
                        nodeDataMomList = nodeDataMomList.concat(flatListFilter[fl].payload.nodeDataMap[tsListFilter.id1][0].nodeDataMomList.filter(c => moment(c.month).format("YYYY-MM") >= moment(this.state.regDatasetJson.forecastStartDate).format("YYYY-MM") && moment(c.month).format("YYYY-MM") <= moment(this.state.regDatasetJson.forecastStopDate).format("YYYY-MM")));
                    }
                    nodeDataMomList.map(ele => {
                        totalForecast += Number(ele.calculatedMmdValue);
                    });
                }
                // elInstance.setValueFromCoords((Number(x) + 1), y, totalForecast.toFixed(2), true);
                // console.log("totalForecast---------->1", totalForecast);
                elInstance.setValueFromCoords((Number(x) + 1), y, (totalForecast).toFixed(2), true);
                let loopVar = 4;
                let total = 0;
                for (var r = 0; r < this.state.regRegionList.length; r++) {
                    total = total + this.el.getValueFromCoords(loopVar, y);
                    loopVar = loopVar + 3;
                }
                elInstance.setValueFromCoords((Object.keys(tableJson[0]).length - 2), y, (total).toFixed(2), true);
            } else {
                // alert("Else");
                elInstance.setValueFromCoords((Number(x) + 1), y, '', true);
                elInstance.setValueFromCoords((Number(x) + 2), y, '', true);

                let loopVar = 4;
                let total = 0;

                for (var r = 0; r < this.state.regRegionList.length; r++) {
                    total = total + this.el.getValueFromCoords(loopVar, y);
                    loopVar = loopVar + 3;

                }

                // // console.log("total1------------>", total1);

                elInstance.setValueFromCoords((Object.keys(tableJson[0]).length - 2), y, (total == 0 ? '' : (total).toFixed(2)), true);
                elInstance.setValueFromCoords((Object.keys(tableJson[0]).length - 1), y, 1, true);


            }
        }
    }

    filterTsList(instance, cell, c, r, source) {
        // // console.log("x---------------->1 1", c);
        // // console.log("x---------------->2 2", r);
        var tsList = this.state.tsList;
        var mylist = [];
        // var value = (instance.jexcel.getJson(null, false)[r])[1].id;
        var value = (this.state.dataEl.getJson(null, false)[r])[1].id;
        var consumptionForecast = this.state.regPlanningUnitList.filter(c => c.planningUnit.id == value)[0].consuptionForecast;

        var regionList = this.state.regRegionList;
        // var planningUniObj = this.state.regPlanningUnitList.filter(c => c.planningUnit.id == value);
        var regionId = regionList[(c / 3) - 1].regionId;
        // // console.log("x---------------->2 3", planningUniObj);
        // // console.log("x---------------->2 4", regionId);
        // // console.log("x---------------->2 5", planningUniObj.selectedForecastMap);
        // // console.log("x---------------->2 6", selectedForecastMapObj);
        // let selectedForecastMapObj = planningUniObj.selectedForecastMap[regionId];
        mylist = tsList.filter(e => (e.type == "T" && e.flatList.filter(c => c.payload.nodeDataMap[e.id1][0].puNode != null && c.payload.nodeDataMap[e.id1][0].puNode.planningUnit.id == value).length > 0) || (e.type == "C" && e.planningUnitId == value && consumptionForecast.toString() == "true"));
        let mylist1 = [];
        for (var i = 0; i < mylist.length; i++) {
            let regionList = mylist[i].region;
            let region = regionList.filter(c => c.id == regionId);
            if (region.length > 0) {
                mylist1.push(mylist[i]);
            }
        }
        // console.log("x---------------->mylist1", mylist1);

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
            // console.log("tempTracerCategoryId---------->2", summeryData);
            // this.calculateEquivalencyUnitTotal();
        })
    }


    getPrograms() {
        // this.setState({ programs: [{ label: "Benin PRH,Condoms Forecast Dataset", programId: 1 }, { label: "Benin ARV Forecast Dataset", programId: 2 }, { label: "Benin Malaria Forecast Dataset", programId: 3 }], loading: false });
        if (isSiteOnline()) {
            // AuthenticationService.setupAxiosInterceptors();
            let realmId = AuthenticationService.getRealmId();
            DropdownService.getProgramForDropdown(realmId, PROGRAM_TYPE_DATASET)
                // ProgramService.getDataSetListAll()
                .then(response => {
                    let datasetList = response.data;
                    // console.log("datasetList-------------->1", datasetList);
                    // datasetList = datasetList.filter(c => c.active == true);
                    // console.log("datasetList-------------->2", datasetList);
                    this.setState({
                        programs: datasetList,
                        // allProgramList: response.data
                    }, () => { this.consolidatedProgramList() })
                }).catch(
                    error => {
                        // console.log("datasetList in catch-------------->2");
                        this.setState({
                            programs: [], loading: false
                        }, () => { this.consolidatedProgramList() })
                        if (error.message === "Network Error") {
                            this.setState({
                                // message: 'static.unkownError',
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
            // console.log('offline')
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
                // Handle errors!
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
                        // console.log(programNameLabel)

                        var f = 0
                        for (var k = 0; k < this.state.programs.length; k++) {
                            if (this.state.programs[k].id == programData.programId) {
                                f = 1;
                                // console.log('already exist')
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
                        // console.log("programs------------------>", this.state.programs);
                    })
                } else {
                    // console.log("this.props.match.params.programId@@@", this.props.match.params.programId);
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
                            // console.log("programs------------------>", this.state.programs);
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
                            // console.log("programs------------------>", this.state.programs);
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
                            // console.log("programs------------------>", this.state.programs);
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
        // document.getElementById("hideCurrencyDiv").style.display = "none";
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
            // localStorage.setItem("sesVersionIdReport", '');
            this.filterData();
            this.getVersionIds();
        })
    }

    setForecastPeriod() {
        let programId = this.state.programId;
        let versionId = this.state.versionId;
        // versionId = (versionId.toString().includes('(') ? versionId.split('(')[0] : versionId);
        if (programId != -1 && (versionId.toString().includes('(') ? versionId.split('(')[0] : versionId) != -1) {
            // if (programId != -1 && versionIdsplit('(')[0] != -1) {
            if (versionId.toString().includes('Local')) {//Local version

                // versionId = versionId.split('(')[0];
                programId = parseInt(programId);
                versionId = parseInt(versionId);
                // console.log("Test-----------------1100", programId);
                // console.log("Test-----------------1101", versionId);
                // console.log("Test-----------------1102", this.state.downloadedProgramData);
                let selectedForecastProgram = this.state.downloadedProgramData.filter(c => c.programId == programId && c.currentVersion.versionId == versionId)[0];
                // console.log("Test-----------------111", selectedForecastProgram);

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
                    // console.log("Test-----------------111", startDateSplit);

                    let forecastStartDateNew = selectedForecastProgram.currentVersion.forecastStartDate;
                    let forecastStopDateNew = selectedForecastProgram.currentVersion.forecastStopDate;

                    let beforeEndDateDisplay = new Date(selectedForecastProgram.currentVersion.forecastStartDate);
                    beforeEndDateDisplay.setMonth(beforeEndDateDisplay.getMonth() - 1);

                    this.setState({
                        // forecastPeriod: months[new Date(forecastStartDateNew).getMonth()] + ' ' + new Date(forecastStartDateNew).getFullYear() + ' ~ ' + months[new Date(forecastStopDateNew).getMonth()] + ' ' + new Date(forecastStopDateNew).getFullYear(),
                        forecastPeriod: months[Number(moment(forecastStartDateNew).startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStartDateNew).startOf('month').format("YYYY")) + ' ~ ' + months[Number(moment(forecastStopDateNew).startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStopDateNew).startOf('month').format("YYYY")),
                        // rangeValue: { from: { year: new Date(forecastStartDateNew).getFullYear(), month: new Date(forecastStartDateNew).getMonth() + 1 }, to: { year: new Date(forecastStopDateNew).getFullYear(), month: new Date(forecastStopDateNew).getMonth() + 1 } },
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
                // console.log("Test-----------------111", startDateSplit);

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
                // this.filterData();
            })
        }
    }

    setVersionId(event) {

        // var versionId = ((event == null || event == '' || event == undefined) ? ((this.state.versionId).toString().split('(')[0]) : (event.target.value.split('(')[0]).trim());
        // versionId = parseInt(versionId);
        // var programId = this.state.programId;
        // // console.log("Test-----------------110", event);
        // // console.log("Test-----------------111", versionId);


        // if (programId != -1 && versionId != -1) {
        //     let selectedForecastProgram = this.state.programs.filter(c => c.programId == programId && c.currentVersion.versionId == versionId)[0];
        //     // console.log("Test-----------------111", selectedForecastProgram);

        //     let tempObj = {
        //         forecastStartDate: (selectedForecastProgram.currentVersion.forecastStartDate ? moment(selectedForecastProgram.currentVersion.forecastStartDate).format(`MMM-YYYY`) : ''),
        //         forecastStopDate: (selectedForecastProgram.currentVersion.forecastStopDate ? moment(selectedForecastProgram.currentVersion.forecastStopDate).format(`MMM-YYYY`) : ''),
        //     }

        //     selectedForecastProgram = {
        //         ...selectedForecastProgram,
        //         ...tempObj
        //     }

        //     let startDateSplit = selectedForecastProgram.forecastStartDate.split('-');
        //     let stopDateSplit = selectedForecastProgram.forecastStopDate.split('-');


        //     let forecastStopDate = new Date(selectedForecastProgram.forecastStartDate);
        //     forecastStopDate.setMonth(forecastStopDate.getMonth() - 1);

        //     let d11 = new Date(startDateSplit[1] - 3 + '-' + (new Date(selectedForecastProgram.currentVersion.forecastStartDate).getMonth() + 1) + '-01 00:00:00');
        //     d11.setMonth(d11.getMonth() - 1);

        //     let d1 = new Date(selectedForecastProgram.currentVersion.forecastStartDate);
        //     let d2 = new Date(selectedForecastProgram.currentVersion.forecastStopDate);
        //     var month = [
        //         "Jan",
        //         "Feb",
        //         "Mar",
        //         "Apr",
        //         "May",
        //         "Jun",
        //         "Jul",
        //         "Aug",
        //         "Sep",
        //         "Oct",
        //         "Nov",
        //         "Dec",
        //     ]

        //     let startDateSplit1 = ((month[d1.getMonth()] + '-' + d1.getFullYear())).split('-');
        //     let stopDateSplit1 = ((month[d2.getMonth()] + '-' + d2.getFullYear())).split('-');

        //     let forecastStopDate1 = new Date((month[d1.getMonth()] + '-' + d1.getFullYear()));
        //     forecastStopDate1.setMonth(forecastStopDate1.getMonth() - 1);
        //     // console.log("Test-----------------111", startDateSplit);

        //     let forecastStartDateNew = selectedForecastProgram.forecastStartDate;
        //     let forecastStopDateNew = selectedForecastProgram.forecastStopDate;

        //     let beforeEndDateDisplay = new Date(selectedForecastProgram.forecastStartDate);
        //     beforeEndDateDisplay.setMonth(beforeEndDateDisplay.getMonth() - 1);

        //     this.setState({
        //         forecastPeriod: months[new Date(forecastStartDateNew).getMonth()] + ' ' + new Date(forecastStartDateNew).getFullYear() + ' ~ ' + months[new Date(forecastStopDateNew).getMonth()] + ' ' + new Date(forecastStopDateNew).getFullYear(),
        //         rangeValue: { from: { year: new Date(forecastStartDateNew).getFullYear(), month: new Date(forecastStartDateNew).getMonth() + 1 }, to: { year: new Date(forecastStopDateNew).getFullYear(), month: new Date(forecastStopDateNew).getMonth() + 1 } },
        //         startDateDisplay: months[new Date(forecastStartDateNew).getMonth()] + ' ' + new Date(forecastStartDateNew).getFullYear(),
        //         endDateDisplay: months[new Date(forecastStopDateNew).getMonth()] + ' ' + new Date(forecastStopDateNew).getFullYear(),
        //         beforeEndDateDisplay: months[new Date(beforeEndDateDisplay).getMonth()] + ' ' + new Date(beforeEndDateDisplay).getFullYear(),
        //     }, () => {

        //     })
        // } else {
        //     var dt = new Date();
        //     dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
        //     var dt1 = new Date();
        //     dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
        //     this.setState({
        //         forecastPeriod: '',
        //         rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
        //         startDateDisplay: '',
        //         endDateDisplay: '',
        //         beforeEndDateDisplay: '',
        //     }, () => {
        //         // this.filterData();
        //     })
        // }


        this.setState({
            versionId: ((event == null || event == '' || event == undefined) ? (this.state.versionId) : (event.target.value).trim()),
        }, () => {
            // localStorage.setItem("sesVersionIdReport", '');
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
        // var versionListAll = this.state.versionListAll;
        // var reportPeriod = [{ programId: 1, startDate: '2020-09-01', endDate: '2021-08-30' }, { programId: 2, startDate: '2020-07-01', endDate: '2021-06-30' }, { programId: 3, startDate: '2020-11-01', endDate: '2021-10-30' }];
        // var startDate = reportPeriod.filter(c => c.programId == this.state.programId)[0].startDate;
        // var endDate = reportPeriod.filter(c => c.programId == this.state.programId)[0].endDate;
        // var rangeValue = { from: { year: new Date(startDate).getFullYear(), month: new Date(startDate).getMonth() + 1 }, to: { year: new Date(endDate).getFullYear(), month: new Date(endDate).getMonth() + 1 } }
        // this.setState({ versions: versionListAll.filter(c => c.program.programId == this.state.programId), loading: false, rangeValue });

        let programId = this.state.programId;
        if (programId != 0) {
            const program = this.state.programs.filter(c => c.id == programId)
            if (program.length == 1) {
                if (isSiteOnline()) {
                    DropdownService.getVersionListForProgram(PROGRAM_TYPE_DATASET, programId)
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
                                        // message: 'static.unkownError',
                                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
                // Handle errors!
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

                // console.log(verList)
                let versionList = verList.filter(function (x, i, a) {
                    return a.indexOf(x) === i;
                })
                versionList.reverse();
                // console.log("versionList----->", versionList);
                if (this.props.match.params.versionId != "" && this.props.match.params.versionId != undefined) {
                    // let versionVar = versionList.filter(c => c.versionId == this.props.match.params.versionId+" (Local)");
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
            // this.filterData();
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
        // console.log("e.targetvakue+++", e.target.value)
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
        var id = this.state.regDatasetJson.id;
        var json = this.state.dataEl.getJson(null, false).filter(c => c[this.state.regRegionList.length * 3 + 3] == 2);
        // console.log("Json+++", json);
        var dataList = [];
        for (var j = 0; j < json.length; j++) {
            for (var k = 0; k < this.state.regRegionList.length; k++) {
                // console.log("(k + 1) * 3+++", (k + 1) * 3);
                // console.log("json[(k + 1) * 3]+++", json[j][(k + 1) * 3]);
                if (json[j][(k + 1) * 3] != "") {
                    var tsList = this.state.tsList.filter(c => c.id == json[j][(k + 1) * 3]);
                    if (tsList.length > 0) {
                        dataList.push({
                            planningUnit: json[j][1],
                            scenarioId: tsList[0].type == "T" ? tsList[0].id1 : null,
                            treeId: tsList[0].type == "T" ? tsList[0].treeId : null,
                            consumptionExtrapolationId: tsList[0].type == "C" ? tsList[0].id1 : null,
                            totalForecast: json[j][((k + 1) * 3) + 1],
                            notes: json[j][((k + 1) * 3) + 2],
                            region: this.state.regRegionList[k]
                        })
                    }
                } else {
                    // console.log("DataList+++1", json[j][Object.keys(json[j])[Object.keys(json[j]).length - 1]]);
                    if (json[j][Object.keys(json[j])[Object.keys(json[j]).length - 1]] == 1) {
                        dataList.push({
                            planningUnit: json[j][1],
                            scenarioId: null,
                            treeId: null,
                            consumptionExtrapolationId: null,
                            totalForecast: '',
                            notes: '',
                            region: this.state.regRegionList[k]
                        })
                    }
                }
            }

        }
        // console.log("DataList+++", dataList)
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
                    // console.log("dataList[dl].planningUnit.id+++", dataList[dl].planningUnit.id);
                    var index = planningUnitList.findIndex(c => c.planningUnit.id == dataList[dl].planningUnit.id && c.active.toString() == "true");
                    // console.log("Index+++", index)
                    // console.log("Reg+++", dataList[dl].region.regionId)
                    var pu = planningUnitList1[index];
                    // let treeId = pu.selectedForecastMap[dataList[dl].region.regionId].treeId;
                    // // console.log("TreeId-----------> ", treeId);
                    if (dataList[dl].treeId == null && dataList[dl].consumptionExtrapolationId == null) {
                        pu.selectedForecastMap[dataList[dl].region.regionId] = {};
                        planningUnitList1[index] = pu;
                    } else {
                        pu.selectedForecastMap[dataList[dl].region.regionId] = { "scenarioId": dataList[dl].scenarioId, "consumptionExtrapolationId": dataList[dl].consumptionExtrapolationId, "totalForecast": dataList[dl].totalForecast, notes: dataList[dl].notes, treeId: dataList[dl].treeId };
                        planningUnitList1[index] = pu;
                    }

                }
                // console.log("PlanningUnitList1+++", planningUnitList1);
                datasetForEncryption.planningUnitList = planningUnitList1;

                var encryptedDatasetJson = (CryptoJS.AES.encrypt(JSON.stringify(datasetForEncryption), SECRET_KEY)).toString();
                dataset.programData = encryptedDatasetJson;

                var datasetTransaction = db1.transaction(['datasetData'], 'readwrite');
                var datasetOs = datasetTransaction.objectStore('datasetData');
                var putRequest = datasetOs.put(dataset);
                putRequest.onerror = function (event) {
                }.bind(this);
                putRequest.onsuccess = function (event) {
                    // console.log("in side datasetDetails")
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
                    // let id = AuthenticationService.displayDashboardBasedOnRole();
                    // this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/green/' + i18n.t('static.compareAndSelect.dataSaved'));
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }

    radioChange(event) {
        this.setState({
            displayId: event.target.id === "displayId2" ? parseInt(2) : parseInt(1),
            displayName: event.target.id === "displayId2" ? i18n.t('static.forecastReport.regionalView') : i18n.t('static.forecastReport.nationalView'),
            summeryData: []
        },
            () => {
                // console.log("displayId----------->", this.state.displayId + ' - ' + this.state.displayName);
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
                        {/* {item.label.label_en} */}
                        {item.code}
                    </option>
                )
            }, this);

        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {/* {item.versionId} */}
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
                <h5 className="red">{i18n.t(this.state.message)}</h5>
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
                        {/* {checkOnline === 'Offline' &&
                            (this.state.dataArray.length > 0 || this.state.summeryData.length > 0) &&
                            <div className="card-header-actions">
                                <a className="card-header-action">

                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />

                                </a>
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                            </div>
                        } */}
                    </div>
                    <div className="card-header-actions">
                        <div className="Card-header-reporticon">
                            {/* <a className="pr-lg-0 pt-lg-1">
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.backToMonthlyForecast() }}><i className="fa fa-long-arrow-left" style={{ color: '#20a8d8', fontSize: '13px' }}></i> <small className="supplyplanformulas">{i18n.t('static.forecastReport.returnToMonthlyForecast')}</small></span>
                            </a> */}
                            <span className="compareAndSelect-larrow"> <i className="cui-arrow-left icons " > </i></span>
                            <span className="compareAndSelect-rarrow"> <i className="cui-arrow-right icons " > </i></span>
                            <span className="compareAndSelect-larrowText"> {i18n.t('static.common.backTo')} <a href="/#/forecastReport/forecastOutput" className='supplyplanformulas'>{i18n.t('static.MonthlyForecast.MonthlyForecast')}</a> </span>
                            <span className="compareAndSelect-rarrowText"> {i18n.t('static.common.continueTo')} <a href="/#/dataset/commitTree" className="supplyplanformulas">{i18n.t('static.commitProgram.commitProgram')}</a></span>

                            {/* <a className="card-header-action">
                                Back to <span style={{ cursor: 'pointer' }} onClick={() => { this.backToMonthlyForecast() }}><small className="supplyplanformulas">Monthly Forecast</small></span>
                            </a> */}
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
                                        {/* <p>Some text here to explain users this is not a detailed supply plan, Just high level estimate.</p> */}
                                        <p>{i18n.t("static.placeholder.forecastSummary")}</p>
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
                                                            // onChange={this.filterVersion}
                                                            onChange={(e) => { this.setProgramId(e); }}
                                                            value={this.state.programId}

                                                        >
                                                            <option value="-1">{i18n.t('static.common.select')}</option>
                                                            {programList}
                                                            {/* <option value="4">FASPonia MOH 1</option> */}
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
                                                        // onChange={this.filterData}
                                                        // onChange={(e) => { this.dataChange(e); this.formSubmit() }}
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
                                                        //theme="light"
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
                                                    {/* <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="displayId"
                                                            id="displayId"
                                                            bsSize="sm"
                                                            onChange={this.filterData}
                                                        // onChange={(e) => { this.dataChange(e); this.formSubmit() }}
                                                        >
                                                            <option value="2">{i18n.t('static.forecastReport.regionalView')}</option>
                                                            <option value="1">{i18n.t('static.forecastReport.nationalView')}</option>
                                                        </Input>
                                                    </InputGroup> */}

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
                                            {/* <div> */}
                                            <FormGroup className="col-md-2" id="hideCalculationDiv">
                                                {/* <Label htmlFor="appendedInputButton">{i18n.t('static.forecastReport.hideCalculations')}</Label> */}
                                                <div className="controls pl-lg-4 pt-lg-0">
                                                    {/* <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="calculationId"
                                                            id="calculationId"
                                                            bsSize="sm"
                                                            value={this.state.hideCalculation}
                                                            onChange={(e) => { this.hideCalculation(e); }}
                                                        >
                                                            <option value="1">{i18n.t('static.realm.yes')}</option>
                                                            <option value="2">{i18n.t('static.program.no')}</option>
                                                        </Input>
                                                    </InputGroup> */}
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
                                                {/* <ul className="legendcommitversion list-group"> */}
                                                <i class="fa fa-exclamation-triangle" style={{ color: "#BA0C2F" }}></i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{i18n.t('static.forecastSummary.priceIsMissing')}
                                                {/* </ul> */}
                                            </FormGroup>
                                            {/* </div> */}
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
                                                        // onChange={(e) => { this.hideCalculation(e); }}
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
                                            {/* <div className="shipmentconsumptionSearchMarginTop" style={{ display: this.state.loading ? "none" : "block" }}>
                                                <div className="table-responsive" id="consumptionTableDiv">
                                                    <div id="consumptionTable" />
                                                </div>
                                            </div> */}
                                            <div className="" style={{ display: this.state.loading ? "none" : "block" }}>
                                                {this.state.summeryData.length > 0 && this.state.displayId == 1 &&
                                                    <div className='table-scroll mt-2 tablesticky'>
                                                        <div className='table-wrap table-responsive fixTableHeadSupplyPlan'>
                                                            <Table className="table-bordered table-bordered1 text-center">
                                                                {/* <Table className="table-bordered text-center mt-2 overflowhide main-table "> */}

                                                                <thead>
                                                                    <tr>
                                                                        <th className="BorderNoneSupplyPlan sticky-col first-col clone1"></th>
                                                                        {/* <th className="text-center" style={{}}> Forecasting Unit </th> */}
                                                                        <th className="text-center ForecastSumarydWidth sticky-col first-col clone" style={{ minWidth: '200px' }}>{i18n.t('static.product.product')}</th>
                                                                        <th className="text-center" title={i18n.t('static.Tooltip.TotalForecastedQuantity')} style={{ minWidth: '120px' }}>{i18n.t('static.forecastOutput.totalForecastQuantity')} <i className="fa fa-info-circle icons ToltipInfoicon"></i></th>
                                                                        {!this.state.hideColumn &&
                                                                            <>
                                                                                <th className="text-center" title={i18n.t('static.Tooltip.StockEndOfDec')} style={{ minWidth: '120px' }}>{i18n.t('static.ForecastSummary.Stock')} <span className="FontWeightNormal">{i18n.t('static.forecastReport.endOf')} {this.state.beforeEndDateDisplay})</span> <i className="fa fa-info-circle icons ToltipInfoicon"></i></th>
                                                                                <th className="text-center" title={i18n.t('static.Tooltip.ExistingShipments')} style={{ minWidth: '120px' }}>{i18n.t('static.forecastReport.existingShipments')} <span className="FontWeightNormal">({this.state.startDateDisplay + ' - ' + this.state.endDateDisplay})</span> <i className="fa fa-info-circle icons ToltipInfoicon"></i></th>
                                                                                {/* <th className="text-center" title={(i18n.t('static.report.stock') + ' ' + i18n.t('static.forecastReport.endOf') + ' ' + this.state.beforeEndDateDisplay) + ' + ' + (i18n.t('static.forecastReport.existingShipments') + '( ' + this.state.startDateDisplay + ' - ' + this.state.endDateDisplay + ' )') + ' - ' + (i18n.t('static.forecastReport.totalForecastQuantity'))} style={{ width: '8%' }}>{i18n.t('static.report.stock')} <span className="FontWeightNormal">{i18n.t('static.forecastReport.endOf')} {this.state.endDateDisplay})</span> <i className="fa fa-info-circle icons ToltipInfoicon"></i></th> */}
                                                                                {/* <th className="text-center" style={{ minWidth: '120px' }} title={(i18n.t('static.report.stock') + ' ' + i18n.t('static.forecastReport.endOf') + ' ' + this.state.beforeEndDateDisplay) + ' + ' + (i18n.t('static.forecastReport.existingShipments') + '( ' + this.state.startDateDisplay + ' - ' + this.state.endDateDisplay + ' )') + ' - ' + (i18n.t('static.forecastReport.totalForecastQuantity'))} >{'Stock or Unmet Demand'} <span className="FontWeightNormal">{i18n.t('static.forecastReport.endOf')} {this.state.endDateDisplay})</span> <i className="fa fa-info-circle icons ToltipInfoicon"></i></th> */}
                                                                                <th className="text-center" style={{ minWidth: '120px' }} title={i18n.t('static.Tooltip.StockorUnmetDemand')}>{i18n.t('static.forecastOutput.stockOrUnmedDemand')} <span className="FontWeightNormal">{i18n.t('static.forecastReport.endOf')} {this.state.endDateDisplay})</span> <i className="fa fa-info-circle icons ToltipInfoicon"></i></th>
                                                                                <th className="text-center" title={i18n.t('static.Tooltip.desiredMonthsOfStock')} style={{ minWidth: '120px' }}>{i18n.t('static.forecastReport.desiredMonthsOfStock')} <span className="FontWeightNormal">{i18n.t('static.forecastReport.endOf')} {this.state.endDateDisplay})</span> <i className="fa fa-info-circle icons ToltipInfoicon"></i></th>
                                                                                {/* <th className="text-center" style={{ minWidth: '120px' }} title={(i18n.t('static.forecastReport.desiredMonthsOfStock') + ' ' + i18n.t('static.forecastReport.endOf') + ' ' + this.state.endDateDisplay) + ') * ' + i18n.t('static.forecastReport.totalForecastQuantity') + ' / ' + 'Difference between months'} >{i18n.t('static.forecastReport.desiredStock')} <span className="FontWeightNormal">{i18n.t('static.forecastReport.endOf')} {this.state.endDateDisplay})</span> <i className="fa fa-info-circle icons ToltipInfoicon"></i></th> */}
                                                                                <th className="text-center" style={{ minWidth: '120px' }} title={i18n.t('static.Tooltip.DesiredStock')} >{i18n.t('static.forecastReport.desiredStock')} <span className="FontWeightNormal">{i18n.t('static.forecastReport.endOf')} {this.state.endDateDisplay})</span> <i className="fa fa-info-circle icons ToltipInfoicon"></i></th>
                                                                            </>
                                                                        }
                                                                        {/* <th className="text-center" style={{ minWidth: '120px' }} title={i18n.t('static.report.stock') + ' ' + i18n.t('static.forecastReport.endOf') + ' ' + this.state.endDateDisplay + ') - ' + i18n.t('static.forecastReport.desiredStock') + ' ' + i18n.t('static.forecastReport.endOf') + ' ' + this.state.endDateDisplay + ')'} >{i18n.t('static.forecastReport.procurementSurplus')} <i className="fa fa-info-circle icons ToltipInfoicon"></i></th> */}
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
                                                                                                    // <><i className="fa fa-plus-square-o supplyPlanIcon" onClick={() => this.checkedChanged(item1.tempTracerCategoryId)} ></i> <>{item1.tracerCategory.label.label_en}</></>
                                                                                                    <><i className="fa fa-plus-square-o supplyPlanIcon" onClick={() => this.checkedChanged(item1.tempTracerCategoryId)} ></i> </>
                                                                                                    :
                                                                                                    // <><i className="fa fa-minus-square-o supplyPlanIcon" onClick={() => this.checkedChanged(item1.tempTracerCategoryId)} ></i> <>{item1.tracerCategory.label.label_en}</></>
                                                                                                    <><i className="fa fa-minus-square-o supplyPlanIcon" onClick={() => this.checkedChanged(item1.tempTracerCategoryId)} ></i> </>
                                                                                            }

                                                                                        </td>
                                                                                        {/* <td></td> */}
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
                                                                                                {/* <td>{item1.forecastingUnit.label.label_en}</td> */}
                                                                                                <td className='text-left  sticky-col first-col clone'>{getLabelText(item1.planningUnit.label, this.state.lang) + " | " + item1.planningUnit.id}</td>
                                                                                                <td>{(item1.totalForecastedQuantity != null ? (item1.totalForecastedQuantity).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : '')}</td>
                                                                                                {!this.state.hideColumn &&
                                                                                                    <>
                                                                                                        <td>{(item1.stock1 != null ? (item1.stock1).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : '')}</td>
                                                                                                        <td>{(item1.existingShipments != null ? (item1.existingShipments).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : '')}</td>
                                                                                                        {/* <td>{item1.stock2}</td> */}
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
                                                                            {/* <td></td> */}
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
                                                                            {/* <td></td> */}
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
                                                                            {/* <td></td> */}
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
                                                                            {/* <td></td> */}
                                                                            <td className='text-left sticky-col first-col clone'></td>
                                                                            <td></td>
                                                                            <td><b>{i18n.t('static.forecastReport.productCost')}</b></td>
                                                                            <td><b>{'$ ' + (this.state.totalProductCost).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</b></td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                            {/* <td></td> */}
                                                                            <td className='text-left sticky-col first-col clone'></td>
                                                                            <td></td>
                                                                            <td><b>{i18n.t('static.forecastReport.freight')} ({this.state.freightPerc}%)</b></td>
                                                                            <td><b>{'$ ' + (parseFloat((this.state.freightPerc / 100) * this.state.totalProductCost).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</b></td>
                                                                            <td></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                            {/* <td></td> */}
                                                                            <td className='text-left sticky-col first-col clone'></td>
                                                                            <td></td>
                                                                            <td><b>{i18n.t('static.shipment.totalCost')}</b></td>
                                                                            <td><b>{'$ ' + (parseFloat(parseFloat(this.state.totalProductCost) + parseFloat((this.state.freightPerc / 100) * this.state.totalProductCost)).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</b></td>
                                                                            {/* <td><b>{'$ ' + (parseFloat(this.state.totalProductCost + 0.07 * this.state.totalProductCost).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</b></td> */}
                                                                            <td></td>
                                                                        </tr>
                                                                    </tfoot>
                                                                }
                                                            </Table>
                                                        </div>
                                                    </div>
                                                }
                                                {/* {this.state.regPlanningUnitList.length > 0 && this.state.displayId == 2 && */}
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
                            {/* <div>
                                <h3 className='ShowGuidanceHeading'>{i18n.t('static.ForecastSummary.ForecastSummary')}</h3>
                            </div>
                            <p>
                                <p style={{ fontSize: '13px' }}><span className="UnderLineText">{i18n.t('static.listTree.purpose')} :</span> {i18n.t('static.ForecastSummary.EnableUser')} '<a href='/#/forecastReport/forecastOutput' target="_blank" style={{ textDecoration: 'underline' }}>{i18n.t('static.dashboard.monthlyForecast')}</a>' screen.
                                    <ul>
                                        <li><b>{i18n.t('static.ForecastSummary.RegionalView')}:</b>  {i18n.t('static.ForecastSummary.RegionalViewText')} '<a href='/#/report/compareAndSelectScenario' target="_blank" style={{ textDecoration: 'underline' }}>{i18n.t('static.dashboard.compareAndSelect')}</a>' screen.</li>
                                        <li><b>{i18n.t('static.ForecastSummary.NationalView')}:</b> {i18n.t('static.ForecastSummary.NationalViewText')} <span style={{ textDecoration: 'underline' }}>{i18n.t('static.ForecastSummary.NationalLevel')}</span> {i18n.t('static.ForecastSummary.EvaluateYour')} <span style={{ textDecoration: 'underline' }}>{i18n.t('static.ForecastSummary.ProcurementSurplus')}</span>. </li>
                                    </ul>
                                </p>
                            </p>
                            <p style={{ fontSize: '13px' }}>
                                <p style={{ fontSize: '13px' }}><span className="UnderLineText">{i18n.t('static.ForecastSummary.UsingNationalView')} :</span><br></br>
                                    <b>{i18n.t('static.versionSettings.note')}:</b> {i18n.t('static.ForecastSummary.FullSupplyPlan')}
                                </p>
                                <p>{i18n.t('static.ForecastSummary.DataToDisplay')}
                                    <ul>
                                        <li>{i18n.t('static.ForecastSummary.Under')} <a href='/#/planningUnitSetting/listPlanningUnitSetting' target="_blank" style={{ textDecoration: 'underline' }}>{i18n.t('static.updatePlanningUnit.updatePlanningUnit')}</a>:
                                            <ul>
                                                <li><b>{i18n.t('static.ForecastSummary.Stock')}</b> - {i18n.t('static.ForecastSummary.BeginningForecast')}</li>
                                                <li><b>{i18n.t('static.ForecastSummary.ExistingShipments')}</b> - {i18n.t('static.ForecastSummary.DuringForecast')}</li>
                                                <li><b>{i18n.t('static.ForecastSummary.DesiredMonthsStock')}</b> - {i18n.t('static.ForecastSummary.EndForecastPeriod')}</li>
                                                <li><b>{i18n.t('static.ForecastSummary.PriceType')}</b> and <b>{i18n.t('static.ForecastSummary.UnitPrices')}</b></li>
                                            </ul>
                                        </li>
                                        <li>{i18n.t('static.ForecastSummary.Under')} <a href='/#/dataset/versionSettings' target="_blank" style={{ textDecoration: 'underline' }}>{i18n.t('static.UpdateversionSettings.UpdateversionSettings')}</a>:
                                            <ul>
                                                <li><b>{i18n.t('static.ForecastSummary.Freight')} %</b> - {i18n.t('static.ForecastSummary.FreightCalculated')}</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </p>
                            </p>
                            <p style={{ fontSize: '13px' }}>
                                <b>{i18n.t('static.ForecastSummary.CalculatingProcurement')} </b>
                                <ul>
                                    <li><img className="formula-img-mr-showGuidance" src={ProjectStockatForecastend} /><br></br></li>
                                    <li><img style={{ border: '1px solid #fff', padding: '10px', borderRadius: '5px' }} src={DesiredStockatForecasend} /><br></br></li>
                                    <li><img className="formula-img-mr-showGuidance" src={ProcurementSurplusGap} /><br></br></li>
                                  
                                </ul>
                            </p>
                            <p>
                                {i18n.t('static.ForecastSummary.ForExample')}
                                <table className="table table-bordered ">
                                    <thead>
                                        <tr>
                                            <th>{i18n.t('static.ForecastSummary.ForecastedQuantity')}</th>
                                            <th>{i18n.t('static.ForecastSummary.StockEnd')}</th>
                                            <th>{i18n.t('static.ForecastSummary.ExistingShipments')}</th>
                                            <th>{i18n.t('static.ForecastSummary.StockDecEnd')}</th>
                                            <th>{i18n.t('static.ForecastSummary.DesiredMonthsofStock')}</th>
                                            <th>{i18n.t('static.ForecastSummary.DesiredStockDec')}</th>
                                            <th>{i18n.t('static.ForecastSummary.ProcurementSurplusGap')}</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>360,000</td>
                                            <td>5,000</td>
                                            <td>20,000</td>
                                            <td>5,000 + 20,000 - 360,000 = -335,000</td>
                                            <td>5</td>
                                            <td>(360,000 * 5 )/ 36 = 50,000</td>
                                            <td>-335,000 -50,000 = -385,000</td>

                                        </tr>
                                    </tbody>
                                </table>
                            </p>
                            <p style={{ fontSize: '13px' }}>
                                <b>{i18n.t('static.ForecastSummary.ProcurementCosts')}  </b><br></br>
                                {i18n.t('static.versionSettings.note')} : {i18n.t('static.ForecastSummary.CostCalculated')}

                                <ul>
                                    <li><img className="formula-img-mr-showGuidance1 img-fluid" src={ProductCost} /><br></br></li>
                                    <li><img className="formula-img-mr-showGuidance1 img-fluid" src={FreightCost} /><br></br></li>
                                    <li><img className="formula-img-mr-showGuidance1 img-fluid" src={TotalCost} /><br></br></li>
                                 
                                </ul>
                            </p>
                            <p>
                                {i18n.t('static.ForecastSummary.AssumingUnitCost')}:
                                <ul>
                                    <li>{i18n.t('static.ForecastSummary.ProductCost')} = -385,000 * 0.10 = $38,500</li>
                                    <li>{i18n.t('static.ForecastSummary.FreightCost')} = $38,500 * 7% = $2,695</li>
                                    <li>{i18n.t('static.ForecastSummary.TotalCost')} = $38,500 + $2,695 = $41,195</li>
                                </ul>
                            </p> */}

                        </ModalBody>
                    </div>
                </Modal>
            </div >
        );
    }
}

export default ForecastSummary;