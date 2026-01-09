import jexcel from 'jspreadsheet';
import { onOpenFilter } from "../../CommonComponent/JExcelCommonFunctions.js";
import React, { Component } from "react";
import {
    Button,
    Card, CardBody,
    CardFooter,
    Col,
    FormGroup,
    Input,
    InputGroup,
    Label,
    Row,
    Modal,
    ModalBody, ModalFooter,
    ModalHeader,
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_DECIMAL_NO_REGEX, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, PROGRAM_TYPE_SUPPLY_PLAN } from "../../Constants";
import ProcurementAgentService from "../../api/ProcurementAgentService";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { addDoubleQuoteToRowContent, filterOptions, formatter, hideFirstComponent, hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
import { MultiSelect } from 'react-multi-select-component';
import DropdownService from '../../api/DropdownService';
import AuthenticationService from '../Common/AuthenticationService';
import PlanningUnitService from '../../api/PlanningUnitService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import { LOGO } from '../../CommonComponent/Logo.js';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Prompt } from 'react-router';
import AddCountrySpecificPriceEn from '../../../src/ShowGuidanceFiles/AddCountrySpecificPriceEn.html';
import AddCountrySpecificPriceFr from '../../../src/ShowGuidanceFiles/AddCountrySpecificPriceFr.html';
import AddCountrySpecificPriceSp from '../../../src/ShowGuidanceFiles/AddCountrySpecificPriceSp.html';
import AddCountrySpecificPricePr from '../../../src/ShowGuidanceFiles/AddCountrySpecificPricePr.html';
// Localized entity name
const entityname = i18n.t('static.countrySpecificPrices.countrySpecificPrices')
/**
 * Component used for taking country specific price
 */
class CountrySpecificPrices extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lang: localStorage.getItem('lang'),
            programs: [],
            procurementAgents: [],
            procurementAgent: {
                id: '',
                label: {
                    label_en: ''
                }
            },
            planningUnit: {
                id: '',
                label: {
                    label_en: ''
                }
            },
            programPlanningUnit: '',
            rows: [],
            isNew: true,
            updateRowStatus: 0,
            loading: true,
            programs: [],
            programValues: [],
            programLabels: [],
            planningUnitList: [],
            planningUnitListJexcel: [],
            planningUnitValues: [],
            planningUnitLabels: [],
            active: 1,
            changed: false
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.changed = this.changed.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this);
    }
    setStatus(event) {
        var cont = false;
        if (this.state.changed == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {
            }
        } else {
            cont = true;
        }
        if (cont == true) {
            this.setState({
                active: event.target.value,
                changed: false
            }, () => {
                this.buildJexcel();
            })
        }
    }
    /**
     * Function to filter active programs
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The jexcel cell object.
     * @param {number} c - Column index.
     * @param {number} r - Row index.
     * @param {Array} source - The source array for autocomplete options (unused).
     * @returns {Array} - Returns an array of active countries.
     */
    filterProgram = function (instance, cell, c, r, source) {
        return this.state.procurementAgentArr.filter(c => c.active.toString() == "true" && (c.programList.filter(c => c.id == (this.el.getJson(null, false)[r])[0])).length > 0);
    }.bind(this);
    /**
     * Function to filter active programs
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The jexcel cell object.
     * @param {number} c - Column index.
     * @param {number} r - Row index.
     * @param {Array} source - The source array for autocomplete options (unused).
     * @returns {Array} - Returns an array of active countries.
     */
    filterProgramPU = function (instance, cell, c, r, source) {
        return (this.state.planningUnitListJexcel.filter(c => c.programId == -1 || (c.programId == (this.el.getJson(null, false)[r])[0])));
    }.bind(this);
    /**
     * Function to build a jexcel table.
     * Constructs and initializes a jexcel table using the provided data and options.
     */
    componentDidMount() {
        hideFirstComponent();
        let realmId = AuthenticationService.getRealmId();
        DropdownService.getSPProgramBasedOnRealmId(realmId)
            .then(response => {
                var proList = []
                var programIds=AuthenticationService.getProgramListBasedOnBusinessFunction('ROLE_BF_MAP_COUNTRY_SPECIFIC_PRICES')
                var programIdsView=AuthenticationService.getProgramListBasedOnBusinessFunction('ROLE_BF_VIEW_COUNTRY_SPECIFIC_PRICES')
                for (var i = 0; i < response.data.length; i++) {
                    if (response.data[i].active == true) {
                        if((programIds.includes(response.data[i].id)) || (programIdsView.includes(response.data[i].id))){
                        var programJson = {
                            programId: response.data[i].id,
                            label: response.data[i].label,
                            programCode: response.data[i].code
                        }
                        proList.push(programJson)
                    }
                    }
                }
                this.setState({
                    programs: proList.sort(function (a, b) {
                        a = a.programCode.toLowerCase();
                        b = b.programCode.toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                    }), loading: false
                }, () => {
                    if (this.props.match.params.programId != undefined && this.props.match.params.programId != "" && this.props.match.params.programId > 0) {
                        var program = this.state.programs.filter(c => c.programId == this.props.match.params.programId)[0];
                        this.setState({
                            programValues: [{ "label": program.programCode, "value": program.programId }],
                            programLabels: [program.programCode],
                        }, () => {
                            this.getPlanningUnitList();
                        })
                    } else {
                        this.getPlanningUnitList();
                    }
                })
            }).catch(
                error => {
                    this.setState({
                        programs: [], loading: false
                    }, () => {
                    })
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            color: "red",
                            loading: false
                        }, () => {
                            hideSecondComponent()
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
                                    loading: false,
                                    color: "red",
                                }, () => {
                                    hideSecondComponent()
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                                    loading: false,
                                    color: "red",
                                }, () => {
                                    hideSecondComponent()
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false,
                                    color: "red",
                                }, () => {
                                    hideSecondComponent()
                                });
                                break;
                        }
                    }
                }
            );
    }

    getPlanningUnitList() {
        let programIds = this.state.programValues.map((ele) =>
            ele.value.toString()
        );
        PlanningUnitService.getProgramAndPlanningUnitForProgramList(programIds)
            .then(response => {
                var planningUnitList = []
                for (var i = 0; i < response.data.length; i++) {
                    // if (response.data[i].active == true) {
                    var puJson = {
                        planningUnitId: response.data[i].id,
                        label: response.data[i].label,
                        programId: response.data[i].typeId
                    }
                    planningUnitList.push(puJson)
                    // }
                }
                var lang = this.state.lang;
                this.setState({
                    planningUnitList: planningUnitList.sort(function (a, b) {
                        a = getLabelText(a.label, lang).toLowerCase();
                        b = getLabelText(b.label, lang).toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                    }), loading: false
                }, () => {
                    if (this.props.match.params.planningUnitId != undefined && this.props.match.params.planningUnitId != "" && this.props.match.params.planningUnitId > 0) {
                        var planningUnit = this.state.planningUnitList.filter(c => c.planningUnitId == this.props.match.params.planningUnitId)[0];
                        this.setState({
                            planningUnitValues: [{ "label": getLabelText(planningUnit.label, this.state.lang), "value": planningUnit.planningUnitId }],
                            planningUnitLabels: [getLabelText(planningUnit.label, this.state.lang)],
                        }, () => {
                            this.filterData();
                        })
                    } else {
                        // this.getPlanningUnitList();
                    }
                })
            }).catch(
                error => {
                    this.setState({
                        planningUnitList: [], loading: false, planningUnitListJexcel: []
                    }, () => {
                    })
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loading: false,
                            color: "red",
                        }, () => {
                            hideSecondComponent()
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
                                    loading: false,
                                    color: "red",
                                }, () => {
                                    hideSecondComponent()
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                                    loading: false,
                                    color: "red",
                                }, () => {
                                    hideSecondComponent()
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false,
                                    color: "red",
                                }, () => {
                                    hideSecondComponent()
                                });
                                break;
                        }
                    }
                }
            );
    }
    filterData() {
        if (this.state.programValues.length > 0 && this.state.planningUnitValues.length > 0) {
            this.setState({
                loading: true
            })
            var json = {
                programIdList: this.state.programValues.map(ele => ele.value),
                planningUnitIdList: this.state.planningUnitValues.map(ele => ele.value),
            };
            ProcurementAgentService.getCountrySpecificPricesList(json).then(response => {
                if (response.status == 200) {
                    let myResponse = response.data;
                    if (myResponse.length > 0) {
                        this.setState({ rows: myResponse });
                    }
                    ProcurementAgentService.getProcurementAgentListAll().then(response => {
                        if (response.status == 200) {
                            this.setState({
                                procurementAgents: response.data,
                            })
                            const { procurementAgents } = this.state;
                            let procurementAgentArr = [];
                            if (procurementAgents.length > 0) {
                                for (var i = 0; i < procurementAgents.length; i++) {
                                    var paJson = {
                                        name: getLabelText(procurementAgents[i].label, this.state.lang),
                                        id: parseInt(procurementAgents[i].procurementAgentId),
                                        active: procurementAgents[i].active,
                                        code: procurementAgents[i].procurementAgentCode,
                                        programList: procurementAgents[i].programList
                                    }
                                    procurementAgentArr[i] = paJson
                                }
                            }
                            procurementAgentArr.sort(function (a, b) {
                                var itemLabelA = a.name.toUpperCase();
                                var itemLabelB = b.name.toUpperCase();
                                if (itemLabelA < itemLabelB) {
                                    return -1;
                                }
                                if (itemLabelA > itemLabelB) {
                                    return 1;
                                }
                                return 0;
                            });
                            this.setState({
                                procurementAgentArr: procurementAgentArr,
                            }, () => {
                                this.buildJexcel();
                            })

                        } else {
                            this.setState({
                                message: response.data.messageCode,
                                color: "red"
                            },
                                () => {
                                    hideSecondComponent();
                                })
                        }
                    })
                        .catch(
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
                } else {
                    this.setState({
                        message: response.data.messageCode,
                        color: "red"
                    },
                        () => {
                            hideSecondComponent();
                        })
                }
            })
                .catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                loading: false,
                                color: "red",
                            }, () => {
                                hideSecondComponent()
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
                                        loading: false,
                                        color: "red",
                                    }, () => {
                                        hideSecondComponent()
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false,
                                        color: "red",
                                    }, () => {
                                        hideSecondComponent()
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false,
                                        color: "red",
                                    }, () => {
                                        hideSecondComponent()
                                    });
                                    break;
                            }
                        }
                    }
                );
        } else {
            try {
                this.el = jexcel(document.getElementById("paputableDiv"), '');
                jexcel.destroy(document.getElementById("paputableDiv"), true);
            } catch (err) { }
        }
    }
    buildJexcel() {
        if (this.state.programValues.length > 0 && this.state.planningUnitValues.length > 0) {
            var papuList = this.state.rows;
            // if (this.state.active == 1) {
            //     papuList = papuList.filter(c => c.active);
            // } else if (this.state.active == 0) {
            //     papuList = papuList.filter(c => !c.active);
            // }
            var programList = [];
            var programs = this.state.programValues;
            for (var i = 0; i < programs.length; i++) {
                programList.push({ "id": programs[i].value, "name": programs[i].label })
            }
            var planningUnitList = [];
            planningUnitList.push({ "id": "-1", "name": i18n.t('static.common.all'), "programId": "-1" });
            var planningUnits = this.state.planningUnitValues;
            for (var i = 0; i < planningUnits.length; i++) {
                planningUnitList.push({ "id": planningUnits[i].value, "name": planningUnits[i].label, "programId": planningUnits[i].programId })
            }
            var data = [];
            var papuDataArr = [];
            var papuDataArr2 = [];
            var count = 0;
            if (papuList.length != 0) {
                for (var j = 0; j < papuList.length; j++) {
                    data = [];
                    data[0] = papuList[j].program.id;
                    data[1] = papuList[j].planningUnit.id;
                    data[2] = parseInt(papuList[j].procurementAgent.id);
                    data[3] = papuList[j].airFreightPerc;
                    data[4] = papuList[j].seaFreightPerc;
                    data[5] = papuList[j].roadFreightPerc;
                    data[6] = papuList[j].plannedToSubmittedLeadTime;
                    data[7] = papuList[j].submittedToApprovedLeadTime;
                    data[8] = papuList[j].approvedToShippedLeadTime;
                    data[9] = papuList[j].shippedToArrivedByAirLeadTime;
                    data[10] = papuList[j].shippedToArrivedBySeaLeadTime;
                    data[11] = papuList[j].shippedToArrivedByRoadLeadTime;
                    data[12] = papuList[j].arrivedToDeliveredLeadTime;
                    data[13] = papuList[j].localProcurementLeadTime;
                    data[14] = papuList[j].price;
                    data[15] = papuList[j].active;
                    data[16] = 0;
                    data[17] = papuList[j].programPlanningUnitProcurementAgentId;
                    data[18] = 0;
                    if ((this.state.active == 0 && papuList[j].active.toString() == "false") || (this.state.active == 1 && papuList[j].active.toString() == "true") || (this.state.active == -1)) {
                        papuDataArr.push(data);
                    } else {
                        papuDataArr2.push(data);
                    }
                }
            }
            if (papuDataArr.length == 0) {
                data = [];
                data[0] = this.state.programValues.length == 1 ? this.state.programValues[0].value : "";
                data[1] = this.state.planningUnitValues.length == 1 ? this.state.planningUnitValues[0].value : "";
                data[2] = "";
                data[3] = "";
                data[4] = "";
                data[5] = "";
                data[6] = "";
                data[7] = "";
                data[8] = "";
                data[9] = "";
                data[10] = "";
                data[11] = "";
                data[12] = "";
                data[13] = "";
                data[14] = "";
                data[15] = true;
                data[16] = 0;
                data[17] = 0;
                data[18] = 1;
                papuDataArr[0] = data;
            }
            this.el = jexcel(document.getElementById("paputableDiv"), '');
            jexcel.destroy(document.getElementById("paputableDiv"), true);
            var json = [];
            var data = papuDataArr;
            var options = {
                data: data,
                columnDrag: false,
                columns: [
                    {
                        title: i18n.t('static.program.programMaster'),
                        type: 'dropdown',
                        width: 150,
                        source: programList,
                        readonly: !AuthenticationService.checkUserACL(this.state.programValues.map(c=>c.value.toString()),'ROLE_BF_MAP_COUNTRY_SPECIFIC_PRICES')
                    },
                    {
                        title: i18n.t('static.product.product'),
                        type: 'dropdown',
                        width: 150,
                        source: planningUnitList,
                        filter: this.filterProgramPU,
                        readonly: !AuthenticationService.checkUserACL(this.state.programValues.map(c=>c.value.toString()),'ROLE_BF_MAP_COUNTRY_SPECIFIC_PRICES')
                    },
                    {
                        title: i18n.t('static.report.procurementAgentName'),
                        type: 'autocomplete',
                        source: this.state.procurementAgentArr,
                        filter: this.filterProgram,
                        width: 150,
                        readonly: !AuthenticationService.checkUserACL(this.state.programValues.map(c=>c.value.toString()),'ROLE_BF_MAP_COUNTRY_SPECIFIC_PRICES')
                    },
                    {
                        title: i18n.t('static.program.airfreightperc') + " (%)",
                        type: 'numeric',
                        textEditor: true,
                        decimal: '.',
                        mask: '#,##.00',
                        disabledMaskOnEdition: true,
                        readonly: !AuthenticationService.checkUserACL(this.state.programValues.map(c=>c.value.toString()),'ROLE_BF_MAP_COUNTRY_SPECIFIC_PRICES')
                    },
                    {
                        title: i18n.t('static.realmcountry.seaFreightPercentage') + " (%)",
                        type: 'numeric',
                        textEditor: true,
                        decimal: '.',
                        mask: '#,##.00',
                        disabledMaskOnEdition: true,
                        readonly: !AuthenticationService.checkUserACL(this.state.programValues.map(c=>c.value.toString()),'ROLE_BF_MAP_COUNTRY_SPECIFIC_PRICES')
                    },
                    {
                        title: i18n.t('static.program.roadfreightperc') + " (%)",
                        type: 'numeric',
                        textEditor: true,
                        decimal: '.',
                        mask: '#,##.00',
                        disabledMaskOnEdition: true,
                        readonly: !AuthenticationService.checkUserACL(this.state.programValues.map(c=>c.value.toString()),'ROLE_BF_MAP_COUNTRY_SPECIFIC_PRICES')
                    },
                    {
                        title: i18n.t('static.program.planleadtime'),
                        type: 'numeric',
                        textEditor: true,
                        decimal: '.',
                        mask: '#,##.00',
                        disabledMaskOnEdition: true,
                        readonly: !AuthenticationService.checkUserACL(this.state.programValues.map(c=>c.value.toString()),'ROLE_BF_MAP_COUNTRY_SPECIFIC_PRICES')
                    },
                    {
                        title: i18n.t('static.program.submittoapproveleadtime'),
                        type: 'numeric',
                        textEditor: true,
                        decimal: '.',
                        mask: '#,##.00',
                        disabledMaskOnEdition: true,
                        readonly: !AuthenticationService.checkUserACL(this.state.programValues.map(c=>c.value.toString()),'ROLE_BF_MAP_COUNTRY_SPECIFIC_PRICES')
                    },
                    {
                        title: i18n.t('static.program.approvetoshipleadtime'),
                        type: 'numeric',
                        textEditor: true,
                        decimal: '.',
                        mask: '#,##.00',
                        disabledMaskOnEdition: true,
                        readonly: !AuthenticationService.checkUserACL(this.state.programValues.map(c=>c.value.toString()),'ROLE_BF_MAP_COUNTRY_SPECIFIC_PRICES')
                    },
                    {
                        title: i18n.t('static.realmcountry.shippedToArrivedAirLeadTime'),
                        type: 'numeric',
                        textEditor: true,
                        decimal: '.',
                        mask: '#,##.00',
                        disabledMaskOnEdition: true,
                        readonly: !AuthenticationService.checkUserACL(this.state.programValues.map(c=>c.value.toString()),'ROLE_BF_MAP_COUNTRY_SPECIFIC_PRICES')
                    },
                    {
                        title: i18n.t('static.realmcountry.shippedToArrivedSeaLeadTime'),
                        type: 'numeric',
                        textEditor: true,
                        decimal: '.',
                        mask: '#,##.00',
                        disabledMaskOnEdition: true,
                        readonly: !AuthenticationService.checkUserACL(this.state.programValues.map(c=>c.value.toString()),'ROLE_BF_MAP_COUNTRY_SPECIFIC_PRICES')
                    },
                    {
                        title: i18n.t('static.realmcountry.shippedToArrivedRoadLeadTime'),
                        type: 'numeric',
                        textEditor: true,
                        decimal: '.',
                        mask: '#,##.00',
                        disabledMaskOnEdition: true,
                        readonly: !AuthenticationService.checkUserACL(this.state.programValues.map(c=>c.value.toString()),'ROLE_BF_MAP_COUNTRY_SPECIFIC_PRICES')
                    },
                    {
                        title: i18n.t('static.realmcountry.arrivedToDeliveredLeadTime'),
                        type: 'numeric',
                        textEditor: true,
                        decimal: '.',
                        mask: '#,##.00',
                        disabledMaskOnEdition: true,
                        readonly: !AuthenticationService.checkUserACL(this.state.programValues.map(c=>c.value.toString()),'ROLE_BF_MAP_COUNTRY_SPECIFIC_PRICES')
                    },
                    {
                        title: i18n.t('static.product.localProcurementAgentLeadTime'),
                        type: 'numeric',
                        textEditor: true,
                        decimal: '.',
                        mask: '#,##.00',
                        disabledMaskOnEdition: true,
                        readonly: !AuthenticationService.checkUserACL(this.state.programValues.map(c=>c.value.toString()),'ROLE_BF_MAP_COUNTRY_SPECIFIC_PRICES')
                    },
                    {
                        title: i18n.t('static.forecastReport.unitPrice'),
                        type: 'numeric',
                        textEditor: true,
                        decimal: '.',
                        mask: '#,##.00',
                        disabledMaskOnEdition: true,
                        readonly: !AuthenticationService.checkUserACL(this.state.programValues.map(c=>c.value.toString()),'ROLE_BF_MAP_COUNTRY_SPECIFIC_PRICES')
                    },
                    {
                        title: i18n.t('static.checkbox.active'),
                        type: 'checkbox',
                        readonly: !AuthenticationService.checkUserACL(this.state.programValues.map(c=>c.value.toString()),'ROLE_BF_MAP_COUNTRY_SPECIFIC_PRICES')
                    },
                    {
                        title: 'programPlanningUnitId',
                        type: 'hidden'
                    },
                    {
                        title: 'programPlanningUnitProcurementAgentId',
                        type: 'hidden'
                    },
                    {
                        title: 'isChange',
                        type: 'hidden'
                    },
                ],
                editable: true,
                pagination: localStorage.getItem("sesRecordCount"),
                filters: true,
                search: true,
                columnSorting: true,
                wordWrap: true,
                paginationOptions: JEXCEL_PAGINATION_OPTION,
                parseFormulas: true,
                position: 'top',
                allowInsertColumn: false,
                allowManualInsertColumn: false,
                allowDeleteRow: true,
                onchange: this.changed,
                oneditionend: this.oneditionend,
                copyCompatibility: true,
                onpaste: this.onPaste,
                allowManualInsertRow: false,
                license: JEXCEL_PRO_KEY, onopenfilter:onOpenFilter, allowRenameColumn: false,
                onload: this.loaded,
                updateTable: function (el, cell, x, y, source, value, id) {
                    if (y != null) {
                        var elInstance = el;
                        var rowData = elInstance.getRowData(y);
                        if (rowData[1] == -1) {
                            var cell1 = elInstance.getCell(`O${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                        } else {
                            if(AuthenticationService.checkUserACL(this.state.programValues.map(c=>c.value.toString()),'ROLE_BF_MAP_COUNTRY_SPECIFIC_PRICES')){
                                var cell1 = elInstance.getCell(`O${parseInt(y) + 1}`)
                                cell1.classList.remove('readonly');
                            }
                        }
                        if (rowData[17] > 0) {
                            var cell1 = elInstance.getCell(`A${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                        } else {
                            var cell1 = elInstance.getCell(`A${parseInt(y) + 1}`)
                            cell1.classList.remove('readonly');
                        }
                    }
                }.bind(this),
                contextMenu: function (obj, x, y, e) {
                    var items = [];
                    if (y == null) {
                        if (obj.options.allowInsertColumn == true) {
                            items.push({
                                title: obj.options.text.insertANewColumnBefore,
                                onclick: function () {
                                    obj.insertColumn(1, parseInt(x), 1);
                                }
                            });
                        }
                        if (obj.options.allowInsertColumn == true) {
                            items.push({
                                title: obj.options.text.insertANewColumnAfter,
                                onclick: function () {
                                    obj.insertColumn(1, parseInt(x), 0);
                                }
                            });
                        }
                        if (obj.options.columnSorting == true) {
                            items.push({ type: 'line' });
                            items.push({
                                title: obj.options.text.orderAscending,
                                onclick: function () {
                                    obj.orderBy(x, 0);
                                }
                            });
                            items.push({
                                title: obj.options.text.orderDescending,
                                onclick: function () {
                                    obj.orderBy(x, 1);
                                }
                            });
                        }
                    } else {
                        if (obj.options.allowInsertRow == true) {
                            items.push({
                                title: i18n.t('static.common.insertNewRowBefore'),
                                onclick: function () {
                                    var data = [];
                                    data[0] = this.state.programValues.length == 1 ? this.state.programValues[0].value : "";
                                    data[1] = this.state.planningUnitValues.length == 1 ? this.state.planningUnitValues[0].value : "";
                                    data[2] = "";
                                    data[3] = "";
                                    data[4] = "";
                                    data[5] = "";
                                    data[6] = "";
                                    data[7] = "";
                                    data[8] = "";
                                    data[9] = "";
                                    data[10] = "";
                                    data[11] = "";
                                    data[12] = "";
                                    data[13] = "";
                                    data[14] = "";
                                    data[15] = true;
                                    data[16] = 0;
                                    data[17] = 0;
                                    data[18] = 1;
                                    obj.insertRow(data, parseInt(y), 1);
                                }.bind(this)
                            });
                        }
                        if (obj.options.allowInsertRow == true) {
                            items.push({
                                title: i18n.t('static.common.insertNewRowAfter'),
                                onclick: function () {
                                    var data = [];
                                    data[0] = this.state.programValues.length == 1 ? this.state.programValues[0].value : "";
                                    data[1] = this.state.planningUnitValues.length == 1 ? this.state.planningUnitValues[0].value : "";
                                    data[2] = "";
                                    data[3] = "";
                                    data[4] = "";
                                    data[5] = "";
                                    data[6] = "";
                                    data[7] = "";
                                    data[8] = "";
                                    data[9] = "";
                                    data[10] = "";
                                    data[11] = "";
                                    data[12] = "";
                                    data[13] = "";
                                    data[14] = "";
                                    data[15] = true;
                                    data[16] = 0;
                                    data[17] = 0;
                                    data[18] = 1;
                                    obj.insertRow(data, parseInt(y));
                                }.bind(this)
                            });
                        }
                        if (obj.options.allowDeleteRow == true) {
                            if (obj.getRowData(y)[17] == 0) {
                                items.push({
                                    title: i18n.t("static.common.deleterow"),
                                    onclick: function () {
                                        obj.deleteRow(parseInt(y));
                                    }
                                });
                            }
                        }
                        if (x) {
                        }
                    }
                    items.push({ type: 'line' });
                    return items;
                }.bind(this)
            };
            this.el = jexcel(document.getElementById("paputableDiv"), options);
            this.setState({
                loading: false,
                papuDataArr2: papuDataArr2,
                planningUnitListJexcel: planningUnitList
            })
        } else {
            this.setState({
                loading: false,
                rows: [],
                planningUnitListJexcel: []
            });
            this.el = jexcel(document.getElementById("paputableDiv"), '');
            jexcel.destroy(document.getElementById("paputableDiv"), true);
        }
    }
    /**
     * Callback function called when editing of a cell in the jexcel table ends.
     * @param {object} instance - The jexcel instance.
     * @param {object} cell - The cell object.
     * @param {number} x - The x-coordinate of the cell.
     * @param {number} y - The y-coordinate of the cell.
     * @param {any} value - The new value of the cell.
     */
    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance;
        var rowData = elInstance.getRowData(y);
        if (x == 14 && !isNaN(rowData[14]) && rowData[14].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(14, y, parseFloat(rowData[14]), true);
        }
        elInstance.setValueFromCoords(18, y, 1, true);
    }
    /**
     * Function to add a new row to the jexcel table.
     */
    addRow = function () {
        var data = [];
        data[0] = this.state.programValues.length == 1 ? this.state.programValues[0].value : "";
        data[1] = this.state.planningUnitValues.length == 1 ? this.state.planningUnitValues[0].value : "";
        data[2] = "";
        data[3] = "";
        data[4] = "";
        data[5] = "";
        data[6] = "";
        data[7] = "";
        data[8] = "";
        data[9] = "";
        data[10] = "";
        data[11] = "";
        data[12] = "";
        data[13] = "";
        data[14] = "";
        data[15] = true;
        data[16] = 0;
        data[17] = 0;
        data[18] = 1;
        this.el.insertRow(
            data, 0, 1
        );
    };
    /**
     * Function to handle paste events in the jexcel table.
     * @param {Object} instance - The jexcel instance.
     * @param {Array} data - The data being pasted.
     */
    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance).getValue(`Q${parseInt(data[i].y) + 1}`, true);
                if (index === "" || index == null || index == undefined) {
                    (instance).setValueFromCoords(0, data[i].y, this.state.programPlanningUnit.program.label.label_en, true);
                    // (instance).setValueFromCoords(1, data[i].y, this.state.programPlanningUnit.planningUnit.label.label_en, true);
                    (instance).setValueFromCoords(17, data[i].y, 0, true);
                    (instance).setValueFromCoords(18, data[i].y, 1, true);
                    z = data[i].y;
                }
            }
            if (data[i].x == 1) {
                var value = data[i].value;
                var filterProgram = (this.state.planningUnitListJexcel.filter(c => c.programId == -1 || (c.programId == (this.el.getJson(null, false)[data[i].y])[0])));
                var filterPU = filterProgram.filter(c => c.name == value || c.id == value);
                if (filterPU.length > 0) {
                    (instance).setValueFromCoords(1, data[i].y, value, true);
                } else {
                    (instance).setValueFromCoords(1, data[i].y, "", true);
                }
            }
            if (data[i].x == 2) {
                var value = data[i].value;
                var filterProgram = this.state.procurementAgentArr.filter(c => c.active.toString() == "true" && (c.programList.filter(c => c.id == (this.el.getJson(null, false)[data[i].y])[0])).length > 0);
                var filterPU = filterProgram.filter(c => c.name == value || c.id == value);
                if (filterPU.length > 0) {
                    (instance).setValueFromCoords(2, data[i].y, value, true);
                } else {
                    (instance).setValueFromCoords(2, data[i].y, "", true);
                }
            }
        }
    }
    /**
     * Function to handle form submission and save the data on server.
     */
    formSubmit = function () {
        this.setState({
            loading: true
        })
        var validation = this.checkValidation();
        if (validation == true) {
            var tableJson = this.el.getJson(null, false);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                if (parseInt(map1.get("18")) === 1) {
                    let json = {
                        program: {
                            id: parseInt(map1.get("0"))
                        },
                        planningUnit: {
                            id: parseInt(map1.get("1"))
                        },
                        procurementAgent: {
                            id: parseInt(map1.get("2"))
                        },
                        airFreightPerc: this.el.getValue(`D${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        seaFreightPerc: this.el.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        roadFreightPerc: this.el.getValue(`F${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        plannedToSubmittedLeadTime: this.el.getValue(`G${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        submittedToApprovedLeadTime: this.el.getValue(`H${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        approvedToShippedLeadTime: this.el.getValue(`I${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        shippedToArrivedByAirLeadTime: this.el.getValue(`J${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        shippedToArrivedBySeaLeadTime: this.el.getValue(`K${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        shippedToArrivedByRoadLeadTime: this.el.getValue(`L${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        arrivedToDeliveredLeadTime: this.el.getValue(`M${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        localProcurementLeadTime: this.el.getValue(`N${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        price: this.el.getValue(`O${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        programPlanningUnitProcurementAgentId: parseInt(map1.get("17")),
                        active: map1.get("15"),
                    }
                    changedpapuList.push(json);
                }
            }
            ProcurementAgentService.savePlanningUnitProgramPriceForProcurementAgent(changedpapuList)
                .then(response => {
                    if (response.status == "200") {
                        let programId = this.props.match.params.programId;
                        if (programId != undefined && programId != "" && programId > 0) {
                            this.setState({
                                changed: false
                            })
                            this.props.history.push(`/programProduct/addProgramProduct/${programId}/` + 'green/' + 'Procurement Agent Prices added successfully')
                        } else {
                            this.setState({
                                message: "Procurement Agent Prices added successfully",
                                color: "green",
                                changed: false
                            }, () => {
                                this.filterData();
                                hideSecondComponent()
                            })
                        }
                    } else {
                        this.setState({
                            message: response.data.messageCode,
                            color: "red"
                        },
                            () => {
                                hideSecondComponent();
                            })
                    }
                })
                .catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                loading: false,
                                color: "red",
                            }, () => {
                                hideSecondComponent()
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
                                        message: i18n.t('static.message.procurementAgentAlreadExists'),
                                        loading: false,
                                        color: "red",
                                    }, () => {
                                        hideSecondComponent()
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false,
                                        color: "red",
                                    }, () => {
                                        hideSecondComponent()
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false,
                                        color: "red",
                                    }, () => {
                                        hideSecondComponent()
                                    });
                                    break;
                            }
                        }
                    }
                );
        } else {
            this.setState({
                loading: false
            })
        }
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded = function (instance, cell) {
        jExcelLoadedFunction(instance);
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
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
        this.setState({
            changed: true
        })
        if (x == 0) {
            var col = ("A").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
                var puValue = this.el.getValueFromCoords(1, y, true);
                var filterProgram = (this.state.planningUnitListJexcel.filter(c => c.programId == -1 || (c.programId == value)));
                var filterPU = filterProgram.filter(c => c.name == puValue || c.id == puValue);
                if (filterPU.length > 0) {
                    // (instance).setValueFromCoords(1, y, value, true);
                } else {
                    this.el.setValueFromCoords(1, y, "", true);
                }
            }
        }
        if (x == 1) {
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
        for (var i = 3; i < 15; i++) {
            if (x == i) {
                var col = (colArr[i]).concat(parseInt(y) + 1);
                value = this.el.getValue(col, true).toString().replaceAll(",", "");
                var reg = JEXCEL_DECIMAL_NO_REGEX;
                if (i == 14) {
                    reg = JEXCEL_DECIMAL_CATELOG_PRICE;
                }
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
                    for (var i = 3; i < 15; i++) {
                        var col = (colArr[i]).concat(parseInt(y) + 1);
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                } else {
                    if (!(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
                        for (var i = 3; i < 15; i++) {
                            var col = (colArr[i]).concat(parseInt(y) + 1);
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setComments(col, "");
                        }
                    }
                }
            }
        }
        if (x != 18) {
            this.el.setValueFromCoords(18, y, 1, true);
        }
    }.bind(this);
    /**
     * Function to check validation of the jexcel table.
     * @returns {boolean} - True if validation passes, false otherwise.
     */
    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false).concat(this.state.papuDataArr2);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(18, y);
            if (parseInt(value) == 1) {
                var col = ("A").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(0, y);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
                var col = ("B").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(1, y);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
                var col = ("C").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(2, y);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
                for (var i = (json.length - 1); i >= 0; i--) {
                    var map = new Map(Object.entries(json[i]));
                    var planningUnitValue = map.get("1");
                    var value = this.el.getRowData(parseInt(y))[1];
                    var programValue = map.get("0");
                    var proValue = this.el.getRowData(parseInt(y))[0];
                    var procurementAgentValue = map.get("2");
                    var paValue = this.el.getRowData(parseInt(y))[2];
                    if (planningUnitValue == value && programValue == proValue && procurementAgentValue == paValue && y != i && i > y) {
                        var col = ("A").concat(parseInt(y) + 1);
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.ppupaAlreadyExists'));
                        var col = ("B").concat(parseInt(y) + 1);
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.ppupaAlreadyExists'));
                        var col = ("C").concat(parseInt(y) + 1);
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.ppupaAlreadyExists'));
                        i = -1;
                        valid = false;
                    }
                }
                var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
                var countOfNotNullValue = 0;
                for (var i = 3; i < 15; i++) {
                    var col = (colArr[i]).concat(parseInt(y) + 1);
                    var value = this.el.getValue(col, true).toString().replaceAll(",", "");
                    var reg = JEXCEL_DECIMAL_NO_REGEX;
                    if (i == 14) {
                        reg = JEXCEL_DECIMAL_CATELOG_PRICE;
                    }
                    if (value == "") {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    } else {
                        countOfNotNullValue += 1;
                        if (!(reg.test(value))) {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setStyle(col, "background-color", "yellow");
                            this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                            valid = false;
                        } else {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setComments(col, "");
                        }
                    }
                }
                if (countOfNotNullValue == 0) {
                    for (var i = 3; i < 15; i++) {
                        var col = (colArr[i]).concat(parseInt(y) + 1);
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t("static.updatePPUPA.atleastOneValue"));
                    }
                    valid = false;
                } else {
                    if (valid) {
                        for (var i = 3; i < 15; i++) {
                            var col = (colArr[i]).concat(parseInt(y) + 1);
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setComments(col, "");
                        }
                    }
                }
            }
        }
        return valid;
    }
    /**
     * Handles the change event for program selection.
     * @param {array} programIds - The array of selected program IDs.
     */
    handleChangeProgram = (programIds) => {
        var cont = false;
        if (this.state.changed == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {
            }
        } else {
            cont = true;
        }
        if (cont == true) {
            if (programIds.length > 0) {
                programIds = programIds.sort(function (a, b) {
                    return parseInt(a.value) - parseInt(b.value);
                })
                this.setState({
                    programValues: programIds.map(ele => ele),
                    programLabels: programIds.map(ele => ele.label),
                    changed: false
                }, () => {
                    this.getPlanningUnitList();
                })
            } else {
                this.setState({
                    programValues: [],
                    programLabels: [],
                    planningUnitList: [],
                    planningUnitListJexcel: [],
                    planningUnitValues: [],
                    planningUnitLabels: [],
                    changed: false
                }, () => {
                    this.filterData();
                })
            }
        }
    }
    /**
     * Handles the change event for planning unit selection.
     * @param {array} programIds - The array of selected planning unit IDs.
     */
    handleChangePlanningUnit = (planningUnitIds) => {
        var cont = false;
        if (this.state.changed == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {
            }
        } else {
            cont = true;
        }
        if (cont == true) {
            if (planningUnitIds.length > 0) {
                planningUnitIds = planningUnitIds.sort(function (a, b) {
                    return parseInt(a.value) - parseInt(b.value);
                })
                this.setState({
                    planningUnitValues: planningUnitIds.map(ele => ele),
                    planningUnitLabels: planningUnitIds.map(ele => ele.label),
                    changed: false
                }, () => {
                    this.filterData();
                })
            } else {
                this.setState({
                    planningUnitValues: [],
                    planningUnitLabels: [],
                    changed: false
                }, () => {
                    this.filterData();
                })
            }
        }
    }
    /**
     * Exports the data to a CSV file.
     */
    exportCSV() {
        var csvRow = [];
        this.state.programLabels.map(ele =>
            csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + (ele.toString())).replaceAll(' ', '%20') + '"'))
        csvRow.push('')
        this.state.planningUnitLabels.map(ele =>
            csvRow.push('"' + (i18n.t('static.procurementUnit.planningUnit') + ' : ' + (ele.toString())).replaceAll(' ', '%20') + '"'))
        csvRow.push('')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        var A = [];
        let tableHeadTemp = [];
        tableHeadTemp.push(i18n.t('static.program.programMaster').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.product.product').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.report.procurementAgentName').replaceAll(' ', '%20'));
        tableHeadTemp.push((i18n.t('static.program.airfreightperc') + "(%)").replaceAll('%', '%25').replaceAll(' ', '%20'));
        tableHeadTemp.push((i18n.t('static.realmcountry.seaFreightPercentage') + "(%)").replaceAll('%', '%25').replaceAll(' ', '%20'));
        tableHeadTemp.push((i18n.t('static.program.roadfreightperc') + "(%)").replaceAll('%', '%25').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.program.planleadtime').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.program.submittoapproveleadtime').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.program.approvetoshipleadtime').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.realmcountry.shippedToArrivedAirLeadTime').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.realmcountry.shippedToArrivedSeaLeadTime').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.realmcountry.shippedToArrivedRoadLeadTime').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.realmcountry.arrivedToDeliveredLeadTime').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.product.localProcurementAgentLeadTime').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.forecastReport.unitPrice').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.common.active').replaceAll(' ', '%20'));
        A[0] = addDoubleQuoteToRowContent(tableHeadTemp);
        this.el.getJson(null, true).map(ele => A.push(addDoubleQuoteToRowContent([
            ele[0].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''),
            ele[1].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''),
            ele[2].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''),
            ele[3].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''),
            ele[4].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''),
            ele[5].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''),
            ele[6].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''),
            ele[7].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''),
            ele[8].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''),
            ele[9].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''),
            ele[10].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''),
            ele[11].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''),
            ele[12].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''),
            ele[13].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''),
            ele[14].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''),
            ele[15].toString() == "true" ? i18n.t('static.common.active') : i18n.t('static.common.disabled')])));
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        // }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.countrySpecificPrices.countrySpecificPrices') + ".csv";
        document.body.appendChild(a)
        a.click()
    }
    /**
     * Exports the data to a PDF file.
     * @param {array} columns - The columns to be exported.
     */
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
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.countrySpecificPrices.countrySpecificPrices'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    var programText = doc.splitTextToSize((i18n.t('static.program.program') + ' : ' + this.state.programLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 90, programText)
                    var planningUnitText = doc.splitTextToSize((i18n.t('static.procurementUnit.planningUnit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 110, planningUnitText)
                }
            }
        }
        const unit = "pt";
        const size = "A4";
        const orientation = "landscape";
        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);
        doc.setFontSize(8);
        // var canvas = document.getElementById("cool-canvas");
        // var canvasImg = canvas.toDataURL("image/png", 1.0);
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        // doc.addImage(canvasImg, 'png', 50, 200, 750, 260, 'CANVAS');
        const headers = [];
        headers.push(i18n.t('static.program.programMaster'));
        headers.push(i18n.t('static.product.product'));
        headers.push(i18n.t('static.report.procurementAgentName'));
        headers.push((i18n.t('static.program.airfreightperc') + "(%)"));
        headers.push((i18n.t('static.realmcountry.seaFreightPercentage') + "(%)"));
        headers.push((i18n.t('static.program.roadfreightperc') + "(%)"));
        headers.push(i18n.t('static.program.planleadtime'));
        headers.push(i18n.t('static.program.submittoapproveleadtime'));
        headers.push(i18n.t('static.program.approvetoshipleadtime'));
        headers.push(i18n.t('static.realmcountry.shippedToArrivedAirLeadTime'));
        headers.push(i18n.t('static.realmcountry.shippedToArrivedSeaLeadTime'));
        headers.push(i18n.t('static.realmcountry.shippedToArrivedRoadLeadTime'));
        headers.push(i18n.t('static.realmcountry.arrivedToDeliveredLeadTime'));
        headers.push(i18n.t('static.product.localProcurementAgentLeadTime'));
        headers.push(i18n.t('static.forecastReport.unitPrice'));
        headers.push(i18n.t('static.common.active'));
        const data = this.el.getJson(null, true).map(ele => [
            ele[0], ele[1], ele[2], formatter(ele[3]), formatter(ele[4]), formatter(ele[5]), formatter(ele[6]), formatter(ele[7]), formatter(ele[8]), formatter(ele[9]), formatter(ele[10]), formatter(ele[11]), formatter(ele[12]), formatter(ele[13]), formatter(ele[14]), ele[15].toString() == "true" ? i18n.t('static.common.active') : i18n.t('static.common.disabled')
        ]);
        let content = {
            margin: { top: 70, bottom: 50 },
            startY: height,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center', cellWidth: 50 },
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.countrySpecificPrices.countrySpecificPrices') + ".pdf")
    }
    /**
   * Toggles the visibility of guidance.
   */
    toggleShowGuidance() {
        this.setState({
            showGuidance: !this.state.showGuidance
        })
    }
    /**
     * Renders the country specific price list.
     * @returns {JSX.Element} - Country specific price list.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        const { programs } = this.state;
        let programList = programs.length > 0
            && programs.map((item, i) => {
                return (
                    { label: (item.programCode), value: item.programId }
                )
            }, this);
            console.log("Programs",programs);
        const { planningUnitList } = this.state;
        let planningUnits = planningUnitList.length > 0
            && planningUnitList.map((item, i) => {
                return (
                    { label: (getLabelText(item.label, this.state.lang) + " | " + item.planningUnitId), value: item.planningUnitId, programId: item.programId }
                )
            }, this);
        return (
            <div className="animated fadeIn">
                <Prompt
                    when={this.state.changed == 1}
                    message={i18n.t("static.dataentry.confirmmsg")}
                />
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.props.match.params.colour} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className={this.state.color} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <div>
                    <Card>
                        <CardBody className="p-0">
                            <Col xs="12" sm="12" md="12">
                                <div className="card-header-actions">
                                    <a className="card-header-action">
                                        <span style={{ cursor: 'pointer' }} onClick={() => { this.toggleShowGuidance() }}><small className="supplyplanformulas">{i18n.t('static.common.showGuidance')}</small></span>
                                    </a>
                                    {this.state.rows != undefined && this.state.rows != "" && this.state.rows.length > 0 && <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />}
                                    {this.state.rows != undefined && this.state.rows != "" && this.state.rows.length > 0 && <img className='float-right mr-1' style={{ height: '25px', width: '25px', cursor: 'Pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />}
                                </div>
                                <Row>
                                    <FormGroup className="col-md-4">
                                        <Label htmlFor="programIds">{i18n.t('static.program.program')}</Label>
                                        <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                        <div className="controls ">
                                            <MultiSelect
                                                filterOptions={filterOptions}
                                                bsSize="sm"
                                                name="programIds"
                                                id="programIds"
                                                value={this.state.programValues}
                                                onChange={(e) => { this.handleChangeProgram(e) }}
                                                options={programList && programList.length > 0 ? programList : []}
                                                disabled={this.state.loading}
                                            />
                                        </div>
                                    </FormGroup>
                                    <FormGroup className="col-md-4">
                                        <Label htmlFor="programIds">{i18n.t('static.procurementUnit.planningUnit')}</Label>
                                        <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                        <div className="controls ">
                                            <MultiSelect
                                                filterOptions={filterOptions}
                                                bsSize="sm"
                                                name="planningUnitIds"
                                                id="planningUnitIds"
                                                value={this.state.planningUnitValues}
                                                onChange={(e) => { this.handleChangePlanningUnit(e) }}
                                                options={planningUnits && planningUnits.length > 0 ? planningUnits : []}
                                                disabled={this.state.loading}
                                            />
                                        </div>
                                    </FormGroup>
                                    <FormGroup className="col-md-2">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.common.status')}</Label>
                                        <div className="controls SelectGo">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="active"
                                                    id="active"
                                                    bsSize="sm"
                                                    onChange={(e) => { this.setStatus(e) }}
                                                    value={this.state.active}
                                                >
                                                    <option value="-1">{i18n.t('static.common.all')}</option>
                                                    <option value="1">{i18n.t('static.common.active')}</option>
                                                    <option value="0">{i18n.t('static.common.disabled')}</option>
                                                </Input>
                                            </InputGroup>
                                        </div>
                                    </FormGroup>
                                </Row>
                                <h5>{i18n.t('static.updatePPUPA.noteText1')} <a href="/#/programProduct/addProgramProduct">{i18n.t('static.Update.PlanningUnits')}</a> {i18n.t("static.updatePPUPA.noteText2")}</h5>
                                <div id="paputableDiv" className="consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
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
                            </Col>
                        </CardBody>
                        <CardFooter>
                            <FormGroup>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                {this.state.changed && <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>}
                                {AuthenticationService.checkUserACL(this.state.programValues.map(c=>c.value.toString()),'ROLE_BF_MAP_COUNTRY_SPECIFIC_PRICES') && <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>}
                                &nbsp;
                            </FormGroup>
                        </CardFooter>
                    </Card>
                    <Modal isOpen={this.state.showGuidance}
                        className={'modal-lg ' + this.props.className} >
                        <ModalHeader toggle={() => this.toggleShowGuidance()} className="ModalHead modal-info-Headher">
                            <strong className="TextWhite">{i18n.t('static.common.showGuidance')}</strong>
                        </ModalHeader>
                        <div>
                            {/* <ModalBody> */}
                                <ModalBody className="ModalBodyPadding">
                                    <div dangerouslySetInnerHTML={{
                                        __html: localStorage.getItem('lang') == 'en' ?
                                            AddCountrySpecificPriceEn :
                                            localStorage.getItem('lang') == 'fr' ?
                                                AddCountrySpecificPriceFr :
                                                localStorage.getItem('lang') == 'sp' ?
                                                    AddCountrySpecificPriceSp :
                                                    AddCountrySpecificPricePr
                                    }} />
                                </ModalBody>
                            {/* </ModalBody> */}
                        </div>
                    </Modal>
                </div>
            </div>
        )
    }
    /**
     * Redirects to the add program planning unit screen when cancel button is clicked.
     */
    cancelClicked() {
        var cont = false;
        if (this.state.changed == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {
            }
        } else {
            cont = true;
        }
        if (cont == true) {
            let programId = this.props.match.params.programId;
            if (programId != undefined && programId != "" && programId > 0) {
                this.props.history.push(`/programProduct/addProgramProduct/${programId}/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
            } else {
                this.setState({
                    changed: false,
                    message: i18n.t("static.actionCancelled"),
                    color: "red",
                    loading: true
                }, () => {
                    this.buildJexcel()
                })
            }
        }
    }
}
export default CountrySpecificPrices
