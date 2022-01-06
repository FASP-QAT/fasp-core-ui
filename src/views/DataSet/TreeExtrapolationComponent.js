import React from "react";
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import i18n from '../../i18n';
import { Row, Col, Card, CardFooter, Button, Table, CardBody, Form, Modal, ModalBody, PopoverBody, Popover, ModalFooter, ModalHeader, FormGroup, Label, FormFeedback, Input, InputGroupAddon, Collapse, InputGroupText, InputGroup } from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionWithoutPagination } from '../../CommonComponent/JExcelCommonFunctions.js';
import { SECRET_KEY, JEXCEL_INTEGER_REGEX_FOR_DATA_ENTRY, INDEXED_DB_VERSION, INDEXED_DB_NAME, DATE_FORMAT_CAP, ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE, FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE, JEXCEL_DATE_FORMAT_WITHOUT_DATE, ACTUAL_CONSUMPTION_TYPE, FORCASTED_CONSUMPTION_TYPE, JEXCEL_PAGINATION_OPTION, ACTUAL_CONSUMPTION_MONTHS_IN_PAST, FORECASTED_CONSUMPTION_MONTHS_IN_PAST, JEXCEL_PRO_KEY, JEXCEL_MONTH_PICKER_FORMAT, ACTUAL_CONSUMPTION_MODIFIED, FORECASTED_CONSUMPTION_MODIFIED } from "../../Constants";
import moment from "moment";
import CryptoJS from 'crypto-js'
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import { Bar, Line, Pie } from 'react-chartjs-2';
export default class TreeExtrapolationComponent extends React.Component {
    constructor(props) {
        super(props);
        this.pickRange = React.createRef();
        this.pickRange1 = React.createRef();
        var startDate = moment("2021-05-01").format("YYYY-MM-DD");
        var endDate = moment("2022-02-01").format("YYYY-MM-DD")
        this.state = {
            dataList: [
                {
                    months: '2022-01-01',
                    actuals: '1000',
                    movingAverages: '2000',
                    semiAveragesForecast: '30000',
                    linearRegression: '40000',
                    tesLcb: '50000',
                    arimaForecast: '60000',
                    tesMedium: '80000',
                    tesUcb: '97000'
                },
                {
                    months: '2022-02-01',
                    actuals: '10000',
                    movingAverages: '20000',
                    semiAveragesForecast: '30000',
                    linearRegression: '400000',
                    tesLcb: '500000',
                    arimaForecast: '60000',
                    tesMedium: '80000',
                    tesUcb: '97000'
                }
            ],
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            rangeValue: { from: { year: new Date(startDate).getFullYear(), month: new Date(startDate).getMonth() + 1 }, to: { year: new Date(endDate).getFullYear(), month: new Date(endDate).getMonth() + 1 } },
            movingAvgId: true,
            semiAvgId: true,
            linearRegressionId: true,
            smoothingId: true,
            arimaId: true,
            popoverOpenMa: false,
            popoverOpenSa: false,
            popoverOpenLr: false,
            popoverOpenTes: false,
            popoverOpenArima: false
        }
        this.buildJexcel = this.buildJexcel.bind(this);
    }
    buildJexcel() {
        let dataArray = [];
        let data = [];
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();

        var options = {
            data: dataArray,
            columnDrag: true,
            columns: [
                {
                    title: 'Month',
                    type: 'calendar', options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' }, width: 100
                },
                {
                    title: '1L ARV Patients',
                    type: 'number'
                },
                {
                    title: 'Reporting Rate',
                    type: 'number'
                },
                {
                    title: '1L ARV Patients(Adjusted)',
                    type: 'number',
                    readOnly: true
                },
                {
                    title: 'Moving Averages',
                    type: 'number',
                    readOnly: true
                },
                {
                    title: 'Semi-Averages',
                    type: 'number',
                    readOnly: true
                },
                {
                    title: 'Linear Regression',
                    type: 'number',
                    readOnly: true
                },
                {
                    title: 'ARIMA',
                    type: 'number',
                    readOnly: true
                },
                {
                    title: 'TES (Medium)',
                    type: 'number',
                    readOnly: true
                },
                {
                    title: 'Selected Forecast',
                    type: 'number',
                    readOnly: true
                },
                {
                    title: 'Manual Change (+/-)',
                    type: 'number'
                },
                {
                    title: 'Month End (Final)',
                    type: 'number',
                    readOnly: true
                },

            ],
            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            pagination: false,
            search: true,
            columnSorting: true,
            tableOverflow: true,
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
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                return [];
            }.bind(this),
        };
        var dataEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = dataEl;
        this.setState({
            // dataEl: dataEl, loading: false,
            // inputDataFilter: inputData,
            // inputDataAverageFilter: inputDataAverage,
            // inputDataRegressionFilter: inputDataRegression,
            // startMonthForExtrapolation: startMonth
        })
    }
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionWithoutPagination(instance);
        var asterisk = document.getElementsByClassName("resizable")[0];
        var tr = asterisk.firstChild;

        tr.children[5].classList.add('InfoTr');
        tr.children[6].classList.add('InfoTr');
        tr.children[7].classList.add('InfoTr');
        tr.children[8].classList.add('InfoTr');
        tr.children[9].classList.add('InfoTr');


    }

    setMovingAvgId(e) {
        var movingAvgId = e.target.checked;
        this.setState({
            movingAvgId: movingAvgId
        })
    }
    setSemiAvgId(e) {
        var semiAvgId = e.target.checked;
        this.setState({
            semiAvgId: semiAvgId
        })
    }
    setLinearRegressionId(e) {
        var linearRegressionId = e.target.checked;
        this.setState({
            linearRegressionId: linearRegressionId
        })
    }
    setSmoothingId(e) {
        var smoothingId = e.target.checked;
        this.setState({
            smoothingId: smoothingId
        })
    }
    setArimaId(e) {
        var arimaId = e.target.checked;
        this.setState({
            arimaId: arimaId
        })
    }
    getDatasetData(e) {

    }
    render() {
        const pickerLang = {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            from: 'From', to: 'To',
        }
        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }
        const { rangeValue, rangeValue1 } = this.state;
        const options = {
            title: {
                display: false,
            },

            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Y axis label',
                        fontColor: 'black'
                    },
                    ticks: {
                        beginAtZero: true,
                        fontColor: 'black',
                        callback: function (value) {
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
                    }
                }],
                xAxes: [
                    {
                        id: 'xAxis1',
                        gridLines: {
                            color: "rgba(0, 0, 0, 0)",
                        },
                        ticks: {
                            fontColor: 'black',
                            callback: function (label) {
                                var xAxis1 = label
                                xAxis1 += '';
                                var month = xAxis1.split('-')[0];
                                return month;
                            }
                        }
                    },
                    {
                        id: 'xAxis2',
                        gridLines: {
                            drawOnChartArea: false, // only want the grid lines for one axis to show up
                        },
                        ticks: {
                            callback: function (label) {
                                var xAxis2 = label
                                xAxis2 += '';
                                var month = xAxis2.split('-')[0];
                                var year = xAxis2.split('-')[1];
                                if (month === "Feb") {
                                    return year;
                                } else {
                                    return "";
                                }
                            }
                        }
                    }]
            },

            // tooltips: {
            //   enabled: false,
            //   custom: CustomTooltips,
            //   callbacks: {
            //     label: function (tooltipItem, data) {

            //       let label = data.labels[tooltipItem.index];
            //       let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];

            //       var cell1 = value
            //       cell1 += '';
            //       var x = cell1.split('.');
            //       var x1 = x[0];
            //       var x2 = x.length > 1 ? '.' + x[1] : '';
            //       var rgx = /(\d+)(\d{3})/;
            //       while (rgx.test(x1)) {
            //         x1 = x1.replace(rgx, '$1' + ',' + '$2');
            //       }
            //       return data.datasets[tooltipItem.datasetIndex].label + ' : ' + x1 + x2;
            //     }
            //   }

            // },

            maintainAspectRatio: false,
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    fontColor: "black"
                }
            }
        }


        let line = "";
        line = {
            labels: this.state.dataList.map((item, index) => (item.months)),
            datasets: [
                {
                    type: "line",
                    pointRadius: 0,
                    lineTension: 0,
                    label: 'Adjusted Actuals',
                    backgroundColor: 'transparent',
                    borderColor: '#CFCDC9',
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    showInLegend: true,
                    pointStyle: 'line',
                    pointBorderWidth: 5,
                    yValueFormatString: "###,###,###,###",
                    data: this.state.dataList.map((item, index) => (item.actuals > 0 ? item.actuals : null))
                },
                {
                    type: "line",
                    pointRadius: 0,
                    lineTension: 0,
                    label: 'Moving Averages',
                    backgroundColor: 'transparent',
                    borderColor: '#A7C6ED',
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    showInLegend: true,
                    pointStyle: 'line',
                    pointBorderWidth: 5,
                    yValueFormatString: "###,###,###,###",
                    data: this.state.dataList.map((item, index) => (item.movingAverages > 0 ? item.movingAverages : null))
                },
                {
                    type: "line",
                    pointRadius: 0,
                    lineTension: 0,
                    label: 'Semi-Averages',
                    backgroundColor: 'transparent',
                    borderColor: '#49A4A1',
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    showInLegend: true,
                    pointStyle: 'line',
                    pointBorderWidth: 5,
                    yValueFormatString: "###,###,###,###",
                    data: this.state.dataList.map((item, index) => (item.semiAveragesForecast > 0 ? item.semiAveragesForecast : null))
                },
                {
                    type: "line",
                    pointRadius: 0,
                    lineTension: 0,
                    label: 'Linear Regression',
                    backgroundColor: 'transparent',
                    borderColor: '#118B70',
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    showInLegend: true,
                    pointStyle: 'line',
                    pointBorderWidth: 5,
                    yValueFormatString: "###,###,###,###",
                    data: this.state.dataList.map((item, index) => (item.linearRegression > 0 ? item.linearRegression : null))
                },
                {
                    type: "line",
                    pointRadius: 0,
                    lineTension: 0,
                    label: 'TES (Lower Confidence Bound)',
                    backgroundColor: 'transparent',
                    borderColor: '#002FC6',
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    showInLegend: true,
                    pointStyle: 'line',
                    pointBorderWidth: 5,
                    yValueFormatString: "###,###,###,###",
                    data: this.state.dataList.map((item, index) => (item.tesLcb > 0 ? item.tesLcb : null))
                },
                {
                    type: "line",
                    pointRadius: 0,
                    lineTension: 0,
                    label: 'TES (Medium)',
                    backgroundColor: 'transparent',
                    borderColor: '#FFFF00',
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    showInLegend: true,
                    pointStyle: 'line',
                    pointBorderWidth: 5,
                    yValueFormatString: "###,###,###,###",
                    data: this.state.dataList.map((item, index) => (item.tesMedium > 0 ? item.tesMedium : null))
                },
                {
                    type: "line",
                    pointRadius: 0,
                    lineTension: 0,
                    label: 'TES (Upper Confidence Bound)',
                    backgroundColor: 'transparent',
                    borderColor: '#FFA500',
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    showInLegend: true,
                    pointStyle: 'line',
                    pointBorderWidth: 5,
                    yValueFormatString: "###,###,###,###",
                    data: this.state.dataList.map((item, index) => (item.tesUcb > 0 ? item.tesUcb : null))
                },
                {
                    type: "line",
                    pointRadius: 0,
                    lineTension: 0,
                    label: 'ARIMA',
                    backgroundColor: 'transparent',
                    borderColor: '#BA0C2F',
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    showInLegend: true,
                    pointStyle: 'line',
                    pointBorderWidth: 5,
                    yValueFormatString: "###,###,###,###",
                    data: this.state.dataList.map((item, index) => (item.arimaForecast > 0 ? item.arimaForecast : null))
                }
            ]
        }
        return (
            <div className="animated fadeIn">
                <CardBody className="pb-lg-5 pt-lg-0">
                    <Form name='simpleForm'>
                        <div className=" pl-0">
                            <div className="row">
                                <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton">Start Month for Historical Data<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                    <div className="controls edit">

                                        <Picker
                                            years={{ min: this.state.minDate, max: this.state.maxDate }}
                                            ref={this.pickRange1}
                                            years={{ min: this.state.minDate, max: this.state.maxDate }}
                                            value={{
                                                year: new Date().getFullYear(), month: ("0" + (new Date().getMonth() + 1)).slice(-2)
                                            }}
                                            lang={pickerLang}
                                            // theme="light"
                                            onChange={this.handleRangeChange5}
                                            onDismiss={this.handleRangeDissmis5}
                                            readOnly
                                        >
                                            <MonthBox value={makeText({ year: new Date().getFullYear(), month: ("0" + (new Date().getMonth() + 1)).slice(-2) })} onClick={this._handleClickRangeBox5} />
                                        </Picker>
                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton">Forecast Period<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                    <div className="controls edit">

                                        <Picker
                                            years={{ min: this.state.minDate, max: this.state.maxDate }}
                                            ref={this.pickRange}
                                            value={rangeValue}
                                            lang={pickerLang}
                                            // theme="light"
                                            // onChange={this.handleRangeChange}
                                            // onDismiss={this.handleRangeDissmis}
                                            className="greyColor"
                                        >
                                            <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} />
                                        </Picker>
                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton"><span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                    <div>
                                        Show Guidance
                                    </div>
                                </FormGroup>
                            </div>
                            <div className="row">
                                <FormGroup className="col-md-12 ">
                                    <div className="check inline  pl-lg-3 pt-lg-3">
                                        <div>
                                            <Popover placement="top" isOpen={this.state.popoverOpenMa} target="Popover1" trigger="hover" toggle={() => this.toggle('popoverOpenMa', !this.state.popoverOpenMa)}>
                                                <PopoverBody>Need to add Info.</PopoverBody>
                                            </Popover>
                                        </div>
                                        <div>
                                            <Input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="movingAvgId"
                                                name="movingAvgId"
                                                checked={this.state.movingAvgId}
                                                onClick={(e) => { this.setMovingAvgId(e); }}
                                            />
                                            <Label
                                                className="form-check-label"
                                                check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                <b>Moving Averages</b>
                                                <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.toggle('popoverOpenMa', !this.state.popoverOpenMa)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                            </Label>
                                        </div>
                                        {this.state.movingAvgId &&
                                            <div className="col-md-3">
                                                <Label htmlFor="appendedInputButton"># of Months</Label>
                                                <Input
                                                    className="controls"
                                                    type="text"
                                                    id="noOfMonthsId"
                                                    name="noOfMonthsId"
                                                    onChange={(e) => { this.getDatasetData(e); }}
                                                />
                                            </div>
                                        }
                                        <div>
                                            <Popover placement="top" isOpen={this.state.popoverOpenSa} target="Popover1" trigger="hover" toggle={() => this.toggle('popoverOpenMa', !this.state.popoverOpenSa)}>
                                                <PopoverBody>Need to add Info.</PopoverBody>
                                            </Popover>
                                        </div>
                                        <div>
                                            <Input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="semiAvgId"
                                                name="semiAvgId"
                                                checked={this.state.semiAvgId}
                                                onClick={(e) => { this.setSemiAvgId(e); }}
                                            />
                                            <Label
                                                className="form-check-label"
                                                check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                <b>Semi-Averages</b>
                                                <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.toggle('popoverOpenSa', !this.state.popoverOpenSa)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                            </Label>
                                        </div>
                                        <div>
                                            <Popover placement="top" isOpen={this.state.popoverOpenLr} target="Popover1" trigger="hover" toggle={() => this.toggle('popoverOpenLr', !this.state.popoverOpenLr)}>
                                                <PopoverBody>Need to add Info.</PopoverBody>
                                            </Popover>
                                        </div>
                                        <div>
                                            <Input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="linearRegressionId"
                                                name="linearRegressionId"
                                                checked={this.state.linearRegressionId}
                                                onClick={(e) => { this.setLinearRegressionId(e); }}
                                            />
                                            <Label
                                                className="form-check-label"
                                                check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                <b>Linear Regression</b>
                                                <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.toggle('popoverOpenLr', !this.state.popoverOpenLr)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                            </Label>
                                        </div>
                                        <div>
                                            <Popover placement="top" isOpen={this.state.popoverOpenTes} target="Popover1" trigger="hover" toggle={() => this.toggle('popoverOpenMa', !this.state.popoverOpenTes)}>
                                                <PopoverBody>Need to add Info.</PopoverBody>
                                            </Popover>
                                        </div>
                                        <div>
                                            <Input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="smoothingId"
                                                name="smoothingId"
                                                checked={this.state.smoothingId}
                                                onClick={(e) => { this.setSmoothingId(e); }}
                                            />
                                            <Label
                                                className="form-check-label"
                                                check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                <b>Triple-Exponential Smoothing (Holts-Winters)</b>
                                                <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.toggle('popoverOpenTes', !this.state.popoverOpenTes)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                            </Label>
                                        </div>
                                        {this.state.smoothingId &&
                                            <div className="row col-md-12">
                                                <div className="col-md-2">
                                                    <Label htmlFor="appendedInputButton">Confidence level</Label>
                                                    <Input
                                                        className="controls"
                                                        type="text"
                                                        id="confidenceLevelId"
                                                        name="confidenceLevelId"
                                                    />
                                                </div>
                                                <div className="col-md-2">
                                                    <Label htmlFor="appendedInputButton">Seasonality</Label>
                                                    <Input
                                                        className="controls"
                                                        type="text"
                                                        id="seasonalityId"
                                                        name="seasonalityId"
                                                    />
                                                </div>
                                                {/* <div className="col-md-3">
                                                        <Input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="showAdvanceId"
                                                            name="showAdvanceId"
                                                            checked={this.state.showAdvanceId}
                                                            onClick={(e) => { this.setShowAdvanceId(e); }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                            Show Advance
                                                        </Label>
                                                    </div> */}

                                                <div className="col-md-2">
                                                    <Label htmlFor="appendedInputButton">Alpha</Label>
                                                    <Input
                                                        className="controls"
                                                        type="text"
                                                        id="alphaId"
                                                        name="alphaId"
                                                    />
                                                </div>
                                                <div className="col-md-2">
                                                    <Label htmlFor="appendedInputButton">Beta</Label>
                                                    <Input
                                                        className="controls"
                                                        type="text"
                                                        id="betaId"
                                                        name="betaId"
                                                    />
                                                </div>
                                                <div className="col-md-2">
                                                    <Label htmlFor="appendedInputButton">Gamma</Label>
                                                    <Input
                                                        className="controls"
                                                        type="text"
                                                        id="gammaId"
                                                        name="gammaId"
                                                    />
                                                </div>
                                                <div className="col-md-2">
                                                    <Label htmlFor="appendedInputButton">Phi</Label>
                                                    <Input
                                                        className="controls"
                                                        type="text"
                                                        id="phiId"
                                                        name="phiId"
                                                    />
                                                </div>
                                            </div>
                                        }
                                        <div>
                                            <Popover placement="top" isOpen={this.state.popoverOpenArima} target="Popover1" trigger="hover" toggle={() => this.toggle('popoverOpenArima', !this.state.popoverOpenArima)}>
                                                <PopoverBody>Need to add Info.</PopoverBody>
                                            </Popover>
                                        </div>
                                        <div>
                                            <Input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="arimaId"
                                                name="arimaId"
                                                checked={this.state.arimaId}
                                                onClick={(e) => { this.setArimaId(e); }}
                                            />
                                            <Label
                                                className="form-check-label"
                                                check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                <b>Autoregressive Integrated Moving Average (ARIMA)</b>
                                                <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.toggle('popoverOpenArima', !this.state.popoverOpenArima)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                            </Label>
                                        </div>
                                        {this.state.arimaId &&
                                            <div className="row">
                                                <div className="col-md-3">
                                                    <Label htmlFor="appendedInputButton">p</Label>
                                                    <Input
                                                        className="controls"
                                                        type="text"
                                                        id="pId"
                                                        name="pId"
                                                    />
                                                </div>
                                                <div className="col-md-3">
                                                    <Label htmlFor="appendedInputButton">d</Label>
                                                    <Input
                                                        className="controls"
                                                        type="text"
                                                        id="dId"
                                                        name="dId"
                                                    />
                                                </div>
                                                <div className="col-md-3">
                                                    <Label htmlFor="appendedInputButton">q</Label>
                                                    <Input
                                                        className="controls"
                                                        type="text"
                                                        id="qId"
                                                        name="qId"
                                                    />
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </FormGroup>
                            </div>
                            <div className="row">
                                <Button type="submit" color="success" className="mr-1 float-right" size="md"><i className="fa fa-check"></i>{i18n.t('static.common.interpolate')}</Button>
                            </div>
                        </div>
                    </Form>
                    <div className="col-md-12 pl-lg-0 pr-lg-0 pt-lg-3">
                        <div className="col-md-6">
                            {/* <Button type="button" size="md" color="info" className="float-left mr-1" onClick={this.resetTree}>{'Show/hide data'}</Button> */}
                        </div>
                        <div className="col-md-6 float-right">
                            <FormGroup className="float-right" >
                                <div className="check inline  pl-lg-1 pt-lg-0">
                                    <div>
                                        <Input
                                            className="form-check-input checkboxMargin"
                                            type="checkbox"
                                            id="manualChangeExtrapolation"
                                            name="manualChangeExtrapolation"
                                            // checked={true}
                                            checked={false}
                                        // onClick={(e) => { this.momCheckbox(e); }}
                                        />
                                        <Label
                                            className="form-check-label"
                                            check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                            <b>{'Manual change affects future months (cumulative)'}</b>
                                        </Label>
                                    </div>
                                </div>
                            </FormGroup>
                        </div>
                    </div>
                    <div id="tableDiv" className="extrapolateTable"></div>
                    {/* Graph */}
                    <div className="col-md-12">
                        <div className="chart-wrapper chart-graph-report pl-5 ml-3" style={{ marginLeft: '50px' }}>
                            <Line id="cool-canvas" data={line} options={options} />
                            <div>

                            </div>
                        </div>
                    </div><br /><br />
                    <div className="table-scroll">
                        <div className="table-wrap table-responsive">
                            <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm" >
                                <thead>
                                    <tr>
                                        <td width="230px"><b>Errors</b></td>
                                        {this.state.movingAvgId &&
                                            <td width="110px"><b>Moving Averages</b></td>
                                        }
                                        <td width="110px"><b>Semi Averages</b></td>
                                        <td width="110px"><b>linear Regression</b></td>
                                        <td width="110px"><b>TES(Lower Confidence Bound)</b></td>
                                        <td width="110px"><b>TES(Medium)</b></td>
                                        <td width="110px"><b>TES(Upper Confidence Bound)</b></td>
                                        <td width="110px"><b>ARIMA</b></td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>RMSE</td>
                                        {this.state.movingAvgId &&
                                            <td>199.896015</td>
                                        }
                                        <td>180.873394</td>
                                        <td bgcolor="#118B70">176.258641</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>MAPE</td>
                                        {this.state.movingAvgId &&
                                            <td>0.506926</td>
                                        }
                                        <td>0.531222</td>
                                        <td bgcolor="#118B70">0.506034</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>MSE</td>
                                        {this.state.movingAvgId &&
                                            <td>39958.416892</td>
                                        }
                                        <td>32715.184570</td>
                                        <td bgcolor="#118B70">31067.108640</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>WAPE</td>
                                        {this.state.movingAvgId &&
                                            <td></td>
                                        }
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>R^2</td>
                                        {this.state.movingAvgId &&
                                            <td></td>
                                        }
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    </div><br/>
                    <div className="col-md-12 pl-lg-0">
                        <Row>
                            <FormGroup className="col-md-3 pl-lg-0">
                                <Label htmlFor="currencyId">Choose Method<span class="red Reqasterisk">*</span></Label>
                                <InputGroup>
                                    <Input
                                        type="select"
                                        name="extrapolationMethodId"
                                        id="extrapolationMethodId"
                                        bsSize="sm"
                                    // value={this.state.programId}
                                    // onChange={(e) => { this.setStartAndStopDateOfProgram(e.target.value) }}
                                    >
                                        <option value="">{"Linear Regression"}</option>
                                        <option value="">{"Semi-Averages"}</option>
                                        <option value="">{"Moving Averages"}</option>
                                        <option value="">{"ARIMA"}</option>
                                        <option value="">{"Triple Exponential Smoothing (Holtz-Wnters)"}</option>
                                    </Input>

                                </InputGroup>

                            </FormGroup>
                            <FormGroup className="col-md-3 pl-lg-0">
                                <Button type="submit" color="success" className="mr-1 float-right" size="md"><i className="fa fa-check"></i>{i18n.t('static.pipeline.save')}</Button>
                            </FormGroup>
                        </Row>
                    </div>
                </CardBody>
                
            </div>
        )
    }
}