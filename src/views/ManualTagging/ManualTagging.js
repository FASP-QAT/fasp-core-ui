import React, { Component } from 'react';
import AuthenticationService from '../Common/AuthenticationService.js';
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, Label, Button, Col, Row, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import getLabelText from '../../CommonComponent/getLabelText';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import { DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
import moment from 'moment';

import i18n from '../../i18n';
import ProgramService from '../../api/ProgramService.js';
import ManualTaggingService from '../../api/ManualTaggingService.js';
import PlanningUnitService from '../../api/PlanningUnitService.js';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';



const entityname = i18n.t('static.dashboard.manualTagging');
export default class ManualTagging extends Component {

    constructor(props) {
        super(props);
        this.state = {
            // changedConversionFactor: '',
            planningUnitIdUpdated: '',
            erpPlanningUnitId: '',
            conversionFactorEntered: false,
            searchedValue: '',
            result: '',
            message: '',
            outputList: [],
            loading: true,
            programs: [],
            planningUnits: [],
            outputListAfterSearch: [],
            artmisList: [],
            shipmentId: '',
            reason: "1",
            haslinked: false,
            alreadyLinkedmessage: "",
            tracercategoryPlanningUnit: [],
            planningUnitId: '',
            planningUnitName: '',
            autocompleteData: [],
            orderNo: '',
            primeLineNo: '',
            procurementAgentId: '',
            displayButton: false
        }
        this.addNewCountry = this.addNewCountry.bind(this);
        this.editCountry = this.editCountry.bind(this);
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.formatPlanningUnitLabel = this.formatPlanningUnitLabel.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this);
        this.link = this.link.bind(this);
        this.getProgramList = this.getProgramList.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
    }
    link() {
        var conversionFactor = document.getElementById("conversionFactor").value;
        this.setState({ loading: true })
        ManualTaggingService.linkShipmentWithARTMIS(this.state.orderNo, this.state.primeLineNo, this.state.shipmentId, conversionFactor)
            .then(response => {
                console.log("response m tagging---", response)
                this.setState({
                    message: i18n.t('static.shipment.linkingsuccess'),
                    color: 'green',
                    haslinked: true,
                    loading: false,
                    alreadyLinkedmessage: i18n.t('static.message.alreadyTagged'),
                },
                    () => {
                        if (response.data != -1) {
                            console.log(this.state.message, "success 1")
                            this.hideSecondComponent();
                            document.getElementById('div2').style.display = 'block';
                            this.toggleLarge();
                            this.filterData();
                        }
                    })

            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
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
    getConvertedQATShipmentQty = () => {
        var conversionFactor = document.getElementById("conversionFactor").value;
        conversionFactor = conversionFactor.replace("-", "")
        console.log("changedConversionFactor---",conversionFactor);
        console.log("conversionFactor---",conversionFactor);
        var erpShipmentQty = document.getElementById("erpShipmentQty").value;
        if (conversionFactor != null && conversionFactor != "" && conversionFactor != 0) {
            var result = erpShipmentQty * conversionFactor;
            document.getElementById("convertedQATShipmentQty").value = result.toFixed(2);
            this.setState({
                conversionFactorEntered: true
            })
        } else {
            this.setState({ conversionFactorEntered: false})
        }
        document.getElementById("conversionFactor").value = conversionFactor;
    }


    getOrderDetails = () => {
        console.log("combo box value-------------------------------", document.getElementById("combo-box-demo").value);
        // var roNoOrderNo = event.label;
        var roNoOrderNo = this.state.searchedValue;
        console.log("roNoOrderNo---", roNoOrderNo);
        var searchId = document.getElementById("searchId").value;
        var programId = document.getElementById("programId").value;
        var erpPlanningUnitId = this.state.planningUnitIdUpdated;
        if (roNoOrderNo != "") {
            ManualTaggingService.getOrderDetailsByOrderNoAndPrimeLineNo(roNoOrderNo, searchId, programId, erpPlanningUnitId)
                .then(response => {
                    console.log("artmis response===", response.data);
                    document.getElementById("erpShipmentQty").value = '';
                    document.getElementById("convertedQATShipmentQty").value = '';
                    this.setState({
                        artmisList: response.data,
                        displayButton: false
                    })
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
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
                                        loading: false,
                                        result: error.response.data.messageCode
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
        // else if (orderNo == "" && primeLineNo == "") {
        //     this.setState({
        //         artmisList: [],
        //         result: i18n.t('static.manualtagging.result'),
        //         alreadyLinkedmessage: ''
        //     })
        // }
        // else if (orderNo == "") {
        //     this.setState({
        //         artmisList: [],
        //         result: i18n.t('static.manualtagging.resultOrderNoBlank'),
        //         alreadyLinkedmessage: ''
        //     })
        // }
        // else if (primeLineNo == "") {
        //     this.setState({
        //         artmisList: [],
        //         result: i18n.t('static.manualtagging.resultPrimeLineNoBlank'),
        //         alreadyLinkedmessage: ''
        //     })
        // }
    }
    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    hideSecondComponent() {

        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);


    }

    filterData() {
        document.getElementById('div2').style.display = 'block';
        var programId = document.getElementById("programId").value;
        var planningUnitId = document.getElementById("planningUnitId").value;

        var planningUnitSelect = document.getElementById("planningUnitId");
        var planningUnitName = planningUnitSelect.options[planningUnitSelect.selectedIndex].text;

        if (programId != -1 && planningUnitId != 0) {
            this.setState({ loading: true })
            if (this.state.haslinked) {
                this.setState({ haslinked: false })
            } else {
                this.setState({ message: '' })
            }

            console.log("1-programId------>", programId);
            ManualTaggingService.getShipmentListForManualTagging(programId, planningUnitId)
                .then(response => {
                    console.log("manual tagging response===", response);
                    this.setState({
                        outputList: response.data,
                        planningUnitIdUpdated: planningUnitId,
                        planningUnitId: planningUnitId,
                        planningUnitName: planningUnitName
                        // message: ''
                    }, () => {
                        // this.getPlanningUnitListByTracerCategory(planningUnitId);
                        this.buildJExcel();
                    });
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
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
        } else if (programId == -1) {
            console.log("2-programId------>", programId);
            this.setState({
                outputList: [],
                message: i18n.t('static.program.validselectprogramtext'),
                color: 'red'
            }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                this.el.destroy();
            });
        } else if (planningUnitId == 0) {
            console.log("3-programId------>", programId);
            this.setState({
                outputList: [],
                message: i18n.t('static.procurementUnit.validPlanningUnitText'),
                color: 'red'
            }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                this.el.destroy();
            });
        }

    }
    getPlanningUnitListByTracerCategory = (term) => {
        console.log("planning unit term---", term)
        this.setState({ planningUnitName: term });
        PlanningUnitService.getPlanningUnitByTracerCategory(this.state.planningUnitId, this.state.procurementAgentId, term)
            .then(response => {
                console.log("tracercategoryPlanningUnit response===", response);
                var tracercategoryPlanningUnit = [];
                for (var i = 0; i < response.data.length; i++) {
                    var label = response.data[i].planningUnit.label.label_en + '(' + response.data[i].skuCode + ')';
                    tracercategoryPlanningUnit[i] = { value: response.data[i].planningUnit.id, label: label }
                }
                this.setState({
                    tracercategoryPlanningUnit
                });
                // this.setState({
                //     tracercategoryPlanningUnit: response.data
                // });
                // document.getElementById("erpPlanningUnitId").value = planningUnitId;
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
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
    searchErpOrderData = (term) => {
        if (term != null && term != "") {
            var searchId = document.getElementById("searchId").value;
            var erpPlanningUnitId = this.state.planningUnitIdUpdated;
            var programId = document.getElementById("programId").value;
            console.log("programId ---", programId);
            console.log("erpPlanningUnitId ---", erpPlanningUnitId);

            ManualTaggingService.searchErpOrderData(term.toUpperCase(), searchId, programId, erpPlanningUnitId)
                .then(response => {
                    console.log("searchErpOrderData response===", response);

                    var autocompleteData = [];
                    for (var i = 0; i < response.data.length; i++) {
                        autocompleteData[i] = { value: response.data[i].id, label: response.data[i].label }
                    }
                    this.setState({
                        autocompleteData
                    });
                    // document.getElementById("erpPlanningUnitId").value = planningUnitId;
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
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
    }
    addNewCountry() {
        if (navigator.onLine) {
            this.props.history.push(`/country/addCountry`)
        } else {
            alert("You must be Online.")
        }

    }
    editCountry(country) {
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_COUNTRY')) {
            console.log(country);
            this.props.history.push({
                pathname: `/country/editCountry/${country.countryId}`,
                // state: { country: country }
            });
        }
    }
    getProgramList() {
        ProgramService.getProgramList()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        programs: response.data,
                        loading: false
                    })
                }
                else {

                    this.setState({
                        message: response.data.messageCode,
                        color: 'red',
                        loading: false
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
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

    buildJExcel() {
        let manualTaggingList = this.state.outputList;
        console.log("manualTaggingList---->", manualTaggingList);
        let manualTaggingArray = [];
        let count = 0;

        for (var j = 0; j < manualTaggingList.length; j++) {
            data = [];
            data[0] = manualTaggingList[j].shipmentId;
            data[1] = manualTaggingList[j].shipmentTransId;
            data[2] = this.formatDate(manualTaggingList[j].expectedDeliveryDate);
            data[3] = getLabelText(manualTaggingList[j].shipmentStatus.label, this.state.lang)
            data[4] = manualTaggingList[j].procurementAgent.code;
            data[5] = manualTaggingList[j].fundingSource.code
            data[6] = getLabelText(manualTaggingList[j].budget.label, this.state.lang)
            // data[7] = getLabelText(manualTaggingList[j].fundingSource.label, this.state.lang)
            data[7] = this.addCommas(manualTaggingList[j].shipmentQty);

            manualTaggingArray[count] = data;
            count++;
        }
        // if (manualTaggingList.length == 0) {
        //     data = [];
        //     manualTaggingArray[0] = data;
        // }
        // console.log("manualTaggingArray---->", manualTaggingArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = manualTaggingArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [20, 25, 20, 20, 40, 40, 40, 25],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.commit.qatshipmentId'),
                    type: 'text',
                },
                {
                    title: "shipmentTransId",
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.supplyPlan.mtexpectedDeliveryDate'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.supplyPlan.mtshipmentStatus'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.report.procurementAgentName'),
                    type: 'text',
                }
                ,
                {
                    title: i18n.t('static.budget.fundingsource'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.dashboard.budget'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.supplyPlan.shipmentQty'),
                    type: 'text',
                },
            ],
            editable: false,
            text: {
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
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
                var items = [];
                if (y != null) {
                    if (obj.options.allowInsertRow == true) {
                        items.push({
                            title: i18n.t('static.dashboard.linkShipment'),
                            onclick: function () {
                                // console.log("onclick------>", this.el.getValueFromCoords(0, y));
                                var outputListAfterSearch = [];
                                let row = this.state.outputList.filter(c => (c.shipmentId == this.el.getValueFromCoords(0, y)))[0];
                                console.log("row---------***----", row);
                                outputListAfterSearch.push(row);

                                this.setState({
                                    shipmentId: this.el.getValueFromCoords(0, y),
                                    outputListAfterSearch,
                                    procurementAgentId: outputListAfterSearch[0].procurementAgent.id,
                                    planningUnitName: row.planningUnit.label.label_en + '(' + row.skuCode + ')'
                                })
                                this.toggleLarge();

                            }.bind(this)
                        });
                    }
                }

                return items;
            }.bind(this)
        };
        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false
        })
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    selected = function (instance, cell, x, y, value) {

        if ((x == 0 && value != 0) || (y == 0)) {
            // console.log("HEADER SELECTION--------------------------");
        } else {
            var outputListAfterSearch = [];
            let row = this.state.outputList.filter(c => (c.shipmentId == this.el.getValueFromCoords(0, x)))[0];
            outputListAfterSearch.push(row);

            this.setState({
                shipmentId: this.el.getValueFromCoords(0, x),
                outputListAfterSearch,
                procurementAgentId: outputListAfterSearch[0].procurementAgent.id,
                planningUnitName: row.planningUnit.label.label_en + '(' + row.skuCode + ')'
            })
            this.toggleLarge();
        }
    }.bind(this);


    componentDidMount() {
        this.hideFirstComponent();
        this.getProgramList();
    }

    getPlanningUnitList() {
        var programId = document.getElementById("programId").value;
        if (programId != -1) {
            ProgramService.getProgramPlaningUnitListByProgramId(programId)
                .then(response => {
                    if (response.status == 200) {
                        this.setState({
                            planningUnits: response.data
                        })
                    }
                    else {

                        this.setState({
                            message: response.data.messageCode,
                            color: 'red'
                        },
                            () => {
                                this.hideSecondComponent();
                            })
                    }
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
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
        this.filterData();

    }

    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }

    formatPlanningUnitLabel(cell, row) {
        console.log("cell------", cell);
        console.log("row------", row);
        return getLabelText(cell, this.state.lang) + " (" + row.skuCode + ")";
    }

    toggleLarge() {
        console.log("procurementAgentId---", this.state.procurementAgentId)
        // this.getPlanningUnitListByTracerCategory(this.state.planningUnitId, this.state.procurementAgentId);
        this.setState({
            artmisList: [],
            reason: "1",
            result: '',
            alreadyLinkedmessage: '',
            manualTag: !this.state.manualTag,
        })
    }

    addCommas(cell, row) {
        console.log("row---------->", row);
        cell += '';
        var x = cell.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }

    formatDate(cell, row) {
        if (cell != null && cell != "") {
            var modifiedDate = moment(cell).format(`${DATE_FORMAT_CAP}`);
            return modifiedDate;
        } else {
            return "";
        }
    }

    render() {
        const selectRow = {
            mode: 'radio',
            clickToSelect: true,
            onSelect: (row, isSelect, rowIndex, e) => {
                document.getElementById("erpShipmentQty").value = row.quantity;
                this.getConvertedQATShipmentQty();
                this.setState({
                    orderNo: row.orderNo,
                    primeLineNo: row.primeLineNo,
                    displayButton: true
                });
            }
        };
        const { programs } = this.state;
        let programList = programs.length > 0 && programs.map((item, i) => {
            return (
                <option key={i} value={item.programId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>
            )
        }, this);

        const { planningUnits } = this.state;
        let planningUnitList = planningUnits.length > 0 && planningUnits.map((item, i) => {
            return (
                <option key={i} value={item.planningUnit.id}>
                    {getLabelText(item.planningUnit.label, this.state.lang)}
                </option>
            )
        }, this);

        // const { tracercategoryPlanningUnit } = this.state;
        // let tracerCategoryPlanningUnitList = tracercategoryPlanningUnit.length > 0 && tracercategoryPlanningUnit.map((item, i) => {
        //     return (
        //         <option key={i} value={item.planningUnit.id}>
        //             {getLabelText(item.planningUnit.label, this.state.lang) + '(' + item.skuCode + ')'}
        //         </option>
        //     )
        // }, this);


        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        const columns = [
            {
                dataField: 'planningUnit.label',
                text: i18n.t('static.supplyPlan.qatProduct'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '20px' },
                formatter: this.formatPlanningUnitLabel
            },
            {
                dataField: 'shipmentId',
                text: i18n.t('static.commit.qatshipmentId'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '20px' }
            },
            {
                dataField: 'orderNo',
                text: i18n.t('static.manualTagging.procOrderNo'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '20px' }
            },
            {
                dataField: 'shipmentTransId',
                hidden: true,
            },
            {
                dataField: 'expectedDeliveryDate',
                text: i18n.t('static.supplyPlan.mtexpectedDeliveryDate'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatDate,
                style: { width: '20px' }
            },
            {
                dataField: 'shipmentStatus.label',
                text: i18n.t('static.supplyPlan.mtshipmentStatus'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '20px' },
                formatter: this.formatLabel
            }, {
                dataField: 'procurementAgent.code',
                text: i18n.t('static.report.procurementAgentName'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '40px' }
                // formatter: this.formatLabel
            }, {
                dataField: 'fundingSource.code',
                text: i18n.t('static.fundingSourceHead.fundingSource'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '40px' }
            },
            // {
            //     dataField: 'budget.label.label_en',
            //     text: i18n.t('static.budgetHead.budget'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center',
            //     style: { width: '40px' }
            //     // formatter: this.formatLabel
            // },
            {
                dataField: 'shipmentQty',
                text: i18n.t('static.supplyPlan.shipmentQty'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas,
                style: { width: '25px' }
            }

        ];

        const columns1 = [
            {
                dataField: 'erpOrderId',
                text: i18n.t('static.manualTagging.linkColumn'),
                align: 'center',
                hidden: true,
                headerAlign: 'center'
            },
            {
                dataField: 'roNo',
                text: i18n.t('static.manualTagging.RONO'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'roPrimeLineNo',
                text: i18n.t('static.manualTagging.ROPrimeline'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                // formatter: this.formatLabel
            },
            {
                dataField: 'orderNo',
                text: i18n.t('static.manualTagging.erpShipmentNo'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'primeLineNo',
                text: i18n.t('static.manualTagging.erpShipmentLineNo'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                // formatter: this.formatLabel
            },
            //  {
            //     dataField: 'orderType',
            //     text: i18n.t('static.manualTagging.OrderType'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center',
            //     // formatter: this.formatLabel
            // },
            {
                dataField: 'currentEstimatedDeliveryDate',
                text: i18n.t('static.supplyPlan.mtexpectedDeliveryDate'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatDate
            },
            {
                dataField: 'status',
                text: i18n.t('static.manualTagging.erpStatus'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },

            // {
            //     dataField: 'planningUnitSkuCode',
            //     text: i18n.t('static.manualTagging.planningUnitSKUCode'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center',
            //     // formatter: this.formatLabel
            // },
            // {
            //     dataField: 'planningUnitLabel',
            //     text: i18n.t('static.planningUnit.planningUnitName'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center',
            //     formatter: this.formatLabel
            // },

            // {
            //     dataField: 'procurementUnitSkuCode',
            //     text: i18n.t('static.manualTagging.procurementUnitSKUCode'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center'
            // },


            // {
            //     dataField: 'supplierName',
            //     text: i18n.t('static.supplier.supplierName'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center'
            // },
            // {
            //     dataField: 'recipentCountry',
            //     text: i18n.t('static.manualTagging.receipentCountry'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center'
            // },
            {
                dataField: 'quantity',
                // text: i18n.t('static.shipment.qty'),
                text: i18n.t('static.manualTagging.erpShipmentQty'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas
            }
            // {
            //     dataField: 'price',
            //     text: i18n.t('static.manualTagging.price'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center',
            //     formatter: this.addCommas
            // },
            // {
            //     dataField: 'shippingCost',
            //     text: i18n.t('static.manualTagging.shippingCost'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center',
            //     formatter: this.addCommas
            // }
        ];
        const options = {
            hidePageListOnlyOnePage: true,
            firstPageText: i18n.t('static.common.first'),
            prePageText: i18n.t('static.common.back'),
            nextPageText: i18n.t('static.common.next'),
            lastPageText: i18n.t('static.common.last'),
            nextPageTitle: i18n.t('static.common.firstPage'),
            prePageTitle: i18n.t('static.common.prevPage'),
            firstPageTitle: i18n.t('static.common.nextPage'),
            lastPageTitle: i18n.t('static.common.lastPage'),
            showTotal: true,
            paginationTotalRenderer: customTotal,
            disablePageTitle: true,
            sizePerPageList: [{
                text: '10', value: 10
            }, {
                text: '30', value: 30
            }
                ,
            {
                text: '50', value: 50
            },
            {
                text: 'All', value: this.state.outputList.length
            }]
        }
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className={this.state.color} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                {/* <Card style={{ display: this.state.loading ? "none" : "block" }}> */}
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <CardBody className="pb-lg-5">
                        <Col md="10 pl-0">
                            <div className="row">
                                <FormGroup className="col-md-4 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.inventory.program')}</Label>
                                    <div className="controls ">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="programId"
                                                id="programId"
                                                bsSize="sm"
                                                onChange={this.getPlanningUnitList}
                                            >
                                                <option value="-1">{i18n.t('static.common.select')}</option>
                                                {programList}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-4">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.procurementUnit.planningUnit')}</Label>
                                    <div className="controls ">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="planningUnitId"
                                                id="planningUnitId"
                                                bsSize="sm"
                                                autocomplete="off"
                                                onChange={this.filterData}
                                            >
                                                <option value="0">{i18n.t('static.common.select')}</option>
                                                {planningUnitList}

                                            </Input>
                                            {/* <InputGroupAddon addonType="append">
                                                                        <Button color="secondary Gobtn btn-sm" onClick={this.formSubmit}>{i18n.t('static.common.go')}</Button>
                                                                    </InputGroupAddon> */}
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>

                        {/* <ToolkitProvider
                            keyField="countryId"
                            data={this.state.outputList}
                            columns={columns}
                            search={{ searchFormatted: true }}
                            hover
                            filter={filterFactory()}
                        >
                            {
                                props => (
                                    <div className="TableCust">
                                        <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
                                            <SearchBar {...props.searchProps} />
                                            <ClearSearchButton {...props.searchProps} />
                                        </div>
                                        <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                            pagination={paginationFactory(options)}
                                            rowEvents={{
                                                onClick: (e, row, rowIndex) => {

                                                    var outputListAfterSearch = [];
                                                    outputListAfterSearch.push(row);

                                                    this.setState({
                                                        shipmentId: row.shipmentId,
                                                        outputListAfterSearch
                                                    })
                                                    this.toggleLarge();
                                                }
                                            }}
                                            {...props.baseProps}
                                        />
                                    </div>
                                )
                            }
                        </ToolkitProvider> */}
                        <div className="ReportSearchMarginTop">
                            <div id="tableDiv" className="jexcelremoveReadonlybackground">
                            </div>
                        </div>

                        {/* Consumption modal */}
                        <Modal isOpen={this.state.manualTag}
                            className={'modal-lg ' + this.props.className, "modalWidth"}>
                            <ModalHeader toggle={() => this.toggleLarge()} className="modalHeaderSupplyPlan">
                                <strong>{i18n.t('static.manualTagging.searchErpOrders')}</strong>
                            </ModalHeader>
                            <ModalBody>
                                <div>
                                    <p><h5><b>{i18n.t('static.manualTagging.qatShipmentTitle')}</b></h5></p>
                                    <ToolkitProvider
                                        keyField="optList"
                                        data={this.state.outputListAfterSearch}
                                        columns={columns}
                                        search={{ searchFormatted: true }}
                                        hover
                                        filter={filterFactory()}
                                    >
                                        {
                                            props => (
                                                <div className="TableCust FortablewidthMannualtaggingtable2 ">
                                                    {/* <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
                                                    <SearchBar {...props.searchProps} />
                                                    <ClearSearchButton {...props.searchProps} />
                                                </div> */}
                                                    <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                                        // pagination={paginationFactory(options)}
                                                        rowEvents={{
                                                        }}
                                                        {...props.baseProps}
                                                    />
                                                </div>
                                            )
                                        }
                                    </ToolkitProvider>
                                </div><br />
                                <div>
                                    <p><h5><b>{i18n.t('static.manualTagging.erpShipment')}</b></h5></p>
                                    <Col md="12 pl-0">
                                        <div className="d-md-flex">
                                            <FormGroup className="col-md-4">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.manualTagging.erpPlanningUnit')}</Label>
                                                <div className="controls ">
                                                    <Autocomplete
                                                        id="combo-box-demo1"
                                                        // value={this.state.selectedPlanningUnit}
                                                        defaultValue={{ id: this.state.planningUnitIdUpdated, label: this.state.planningUnitName }}
                                                        options={this.state.tracercategoryPlanningUnit}
                                                        getOptionLabel={(option) => option.label}
                                                        style={{ width: 300 }}
                                                        onChange={(event, value) => {
                                                            // this.getOrderDetails()
                                                            console.log("demo2 value---", value);
                                                            this.setState({
                                                                erpPlanningUnitId: value.value,
                                                                planningUnitIdUpdated: value.value,
                                                                planningUnitName: value.label
                                                            }, () => { this.getOrderDetails() });

                                                        }} // prints the selected value
                                                        renderInput={(params) => <TextField {...params} variant="outlined"
                                                            onChange={(e) => this.getPlanningUnitListByTracerCategory(e.target.value)} />}
                                                    />
                                                    {/* <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="erpPlanningUnitId"
                                                            id="erpPlanningUnitId"
                                                            bsSize="sm"
                                                            autocomplete="off"
                                                            onChange={this.getOrderDetails}
                                                        >
                                                            <option value="">All</option>
                                                            {tracerCategoryPlanningUnitList}

                                                        </Input>
                                                    </InputGroup> */}
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-4">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.manualTagging.searchBy')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="searchId"
                                                            id="searchId"
                                                            bsSize="sm"
                                                            autocomplete="off"
                                                        // onChange={this.filterData}
                                                        >
                                                            <option value="1">{i18n.t('static.manualTagging.RONO')}</option>
                                                            <option value="2">{i18n.t('static.report.orderNo')}</option>

                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3 pl-0">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.manualTagging.search')}</Label>
                                                <div className="controls "
                                                >
                                                    <Autocomplete
                                                        id="combo-box-demo"
                                                        options={this.state.autocompleteData}
                                                        getOptionLabel={(option) => option.label}
                                                        style={{ width: 300 }}
                                                        onChange={(event, value) => {
                                                            this.setState({ searchedValue: value.label }, () => { this.getOrderDetails() });

                                                        }} // prints the selected value
                                                        renderInput={(params) => <TextField {...params} variant="outlined"
                                                            onChange={(e) => this.searchErpOrderData(e.target.value)} />}
                                                    />

                                                </div>
                                            </FormGroup>

                                        </div>
                                    </Col>
                                    <ToolkitProvider
                                        keyField="erpOrderId"
                                        data={this.state.artmisList}
                                        columns={columns1}
                                        search={{ searchFormatted: true }}
                                        hover
                                        filter={filterFactory()}
                                    >
                                        {
                                            props => (
                                                <div className="TableCust FortablewidthMannualtaggingtable1 height-auto">

                                                    <BootstrapTable
                                                        // keyField='erpOrderId'
                                                        ref={n => this.node = n}
                                                        selectRow={selectRow}
                                                        hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell

                                                        rowEvents={{

                                                        }}
                                                        {...props.baseProps}
                                                    />
                                                </div>
                                            )
                                        }
                                    </ToolkitProvider>
                                </div><br />
                                <Col md="12 pl-0">
                                    <div className="d-md-flex">
                                        <FormGroup className="col-md-3 pl-0">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.manualTagging.erpShipmentQty')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="text"
                                                        name="erpShipmentQty"
                                                        id="erpShipmentQty"
                                                        bsSize="sm"
                                                        autocomplete="off"
                                                        readOnly={true}
                                                    >
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                        <div className="col-md-1">

                                            <div className="calculationSignformanualtaing" style={{ paddingTop: '28px', paddingLeft: '23px' }}>
                                                <h3>*</h3>
                                            </div>
                                        </div>
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.manualTagging.conversionFactor')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        // value={this.state.changedConversionFactor}
                                                        type="number"
                                                        min={0.1}
                                                        name="conversionFactor"
                                                        id="conversionFactor"
                                                        bsSize="sm"
                                                        autocomplete="off"
                                                        onChange={this.getConvertedQATShipmentQty}
                                                    >
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                        <div className="col-md-1">
                                            <div className="calculationSignformanualtaing" style={{ paddingTop: '28px', paddingLeft: '23px' }}>
                                                <h3>=</h3>
                                            </div>
                                        </div>
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.manualTagging.convertedQATShipmentQty')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="text"
                                                        name="convertedQATShipmentQty"
                                                        id="convertedQATShipmentQty"
                                                        bsSize="sm"
                                                        autocomplete="off"
                                                        readOnly={true}
                                                    >
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                    </div>
                                </Col>

                                <h5> {this.state.reason != "" && this.state.reason != 1 && <div style={{ color: 'red' }}>Note : {i18n.t(this.state.reason)}</div>}</h5>
                                <h5><div style={{ color: 'red' }} >
                                    {i18n.t(this.state.result)}</div></h5>
                                <h5 style={{ color: 'red' }}>{i18n.t(this.state.alreadyLinkedmessage)}</h5>
                            </ModalBody>
                            <ModalFooter>

                                {this.state.displayButton && this.state.conversionFactorEntered &&
                                    <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.link}> <i className="fa fa-check"></i>{i18n.t('static.manualTagging.link')}</Button>
                                }
                                <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.toggleLarge()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            </ModalFooter>
                        </Modal>
                        {/* Consumption modal */}
                    </CardBody>
                </Card>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}