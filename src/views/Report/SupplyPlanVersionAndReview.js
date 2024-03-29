import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import jsPDF from "jspdf";
import "jspdf-autotable";
import jexcel from 'jspreadsheet';
import moment from "moment";
import React, { Component } from 'react';
import Picker from 'react-month-picker';
import {
    Card, CardBody,
    Form,
    FormGroup, Input, InputGroup,
    Label
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { LOGO } from '../../CommonComponent/Logo.js';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, DATE_FORMAT_CAP, DATE_FORMAT_CAP_FOUR_DIGITS, JEXCEL_DATE_FORMAT_SM, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, PROGRAM_TYPE_SUPPLY_PLAN, SPV_REPORT_DATEPICKER_START_MONTH } from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
import ProgramService from '../../api/ProgramService';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
const entityname = ""
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
class SupplyPlanVersionAndReview extends Component {
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - SPV_REPORT_DATEPICKER_START_MONTH);
        var dt1 = new Date();
        dt1.setMonth(dt1.getMonth());
        this.state = {
            loading: true,
            matricsList: [],
            dropdownOpen: false,
            radioSelected: 2,
            versionTypeList: [],
            statuses: [],
            programs: [],
            countries: [],
            message: '',
            programLst: [],
            rangeValue: localStorage.getItem("sesReportRangeSPVR") != "" && localStorage.getItem("sesReportRangeSPVR") != null && localStorage.getItem("sesReportRangeSPVR") != undefined ? JSON.parse(localStorage.getItem("sesReportRangeSPVR")) : { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 3, month: new Date().getMonth() + 1 },
            programId: localStorage.getItem("sesProgramIdSPVR") != "" && localStorage.getItem("sesProgramIdSPVR") != null && localStorage.getItem("sesProgramIdSPVR") != undefined ? localStorage.getItem("sesProgramIdSPVR") : -1,
            realmCountryId: localStorage.getItem("sesCountryIdSPVR") != "" && localStorage.getItem("sesCountryIdSPVR") != null && localStorage.getItem("sesCountryIdSPVR") != undefined ? localStorage.getItem("sesCountryIdSPVR") : -1,
            versionStatusId: this.props.match.params.statusId != "" && this.props.match.params.statusId != undefined ? this.props.match.params.statusId : localStorage.getItem("sesVersionStatusSPVR") != "" && localStorage.getItem("sesVersionStatusSPVR") != null && localStorage.getItem("sesVersionStatusSPVR") != undefined ? localStorage.getItem("sesVersionStatusSPVR") : -1,
            versionTypeId: localStorage.getItem("sesVersionTypeSPVR") != "" && localStorage.getItem("sesVersionTypeSPVR") != null && localStorage.getItem("sesVersionTypeSPVR") != undefined ? localStorage.getItem("sesVersionTypeSPVR") : -1,
            lang: localStorage.getItem('lang')
        };
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.getCountrylist = this.getCountrylist.bind(this);
        this.getStatusList = this.getStatusList.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.getPrograms = this.getPrograms.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.setProgramId = this.setProgramId.bind(this);
        this.dataChange = this.dataChange.bind(this);
    }
    dataChange(event) {
        if (event.target.name == "countryId") {
            localStorage.setItem("sesCountryIdSPVR", event.target.value);
            this.setState({
                realmCountryId: event.target.value
            }, () => {
                this.fetchData();
            })
        }
        if (event.target.name == "versionTypeId") {
            localStorage.setItem("sesVersionTypeSPVR", event.target.value);
            this.setState({
                versionTypeId: event.target.value
            }, () => {
                this.fetchData();
            })
        }
        if (event.target.name == "versionStatusId") {
            localStorage.setItem("sesVersionStatusSPVR", event.target.value);
            this.setState({
                versionStatusId: event.target.value
            }, () => {
                this.fetchData();
            })
        }
    }
    setProgramId(event) {
        localStorage.setItem("sesProgramIdSPVR", event.target.value);
        this.setState({
            programId: event.target.value
        }, () => {
            this.fetchData();
        })
    }
    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 30000);
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }
    buildJexcel() {
        let matricsList = this.state.matricsList;
        let matricsArray = [];
        let count = 0;
        for (var j = 0; j < matricsList.length; j++) {
            data = [];
            data[0] = matricsList[j].program.code
            data[1] = matricsList[j].versionId
            data[2] = getLabelText(matricsList[j].versionType.label, this.state.lang)
            data[3] = (matricsList[j].createdDate ? moment(matricsList[j].createdDate).format(`YYYY-MM-DD`) : null)
            data[4] = matricsList[j].createdBy.username
            data[5] = matricsList[j].versionStatus.id == 1 ? "" : getLabelText(matricsList[j].versionStatus.label, this.state.lang);
            data[6] = matricsList[j].versionStatus.id == 2 || matricsList[j].versionStatus.id == 3 ? (matricsList[j].lastModifiedBy.username) : ''
            data[7] = matricsList[j].versionStatus.id == 2 || matricsList[j].versionStatus.id == 3 ? (matricsList[j].lastModifiedDate ? moment(matricsList[j].lastModifiedDate).format(`YYYY-MM-DD HH:mm:ss`) : null) : null
            data[8] = matricsList[j].notes
            data[9] = matricsList[j].versionType.id
            data[10] = matricsList[j].versionStatus.id
            data[11] = matricsList[j].program.id
            matricsArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var json = [];
        var data = matricsArray;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [100, 70, 100, 100, 120, 100, 100, 120, 180],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.program.program'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.version'),
                    type: 'numeric', mask: '#,##',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.versiontype'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.veruploaddate'),
                    type: 'calendar',
                    options: { format: JEXCEL_DATE_FORMAT_SM },
                    readOnly: true
                }, {
                    title: i18n.t('static.report.veruploaduser'),
                    type: 'text',
                    readOnly: true
                }, {
                    title: i18n.t('static.report.issupplyplanapprove'),
                    type: 'text',
                    readOnly: true
                }, {
                    title: i18n.t('static.report.reviewer'),
                    type: 'text',
                    readOnly: true
                }, {
                    title: i18n.t('static.report.approvedRevieweddate'),
                    options: { isTime: 1, format: "DD-Mon-YY HH24:MI" },
                    readOnly: true,
                    type: 'calendar'
                }, {
                    title: i18n.t('static.report.comment'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: 'versionTypeId',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: 'versionStatusId',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: 'programId',
                    type: 'hidden',
                    readOnly: true
                }
            ],
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
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
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this),
        };
        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false
        })
    }
    selected = function (instance, cell, x, y, value, e) {
        if (e.buttons == 1) {
            if ((x == 0 && value != 0) || (y == 0)) {
            } else {
                var hasRole = true;
                if (hasRole) {
                    var elInstance = instance;
                    var rowData = elInstance.getRowData(x);
                    let programId = rowData[11];
                    let versionStatusId = rowData[10];
                    let versionTypeId = rowData[9];
                    this.props.history.push({
                        pathname: `/report/editStatus/${programId}/${this.el.getValueFromCoords(1, x)}`,
                    });
                }
            }
        }
    }.bind(this);
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }
    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }
    componentDidMount() {
        if (this.props.match.params.statusId != "" && this.props.match.params.statusId != undefined) {
            document.getElementById("versionStatusId").value = this.props.match.params.statusId;
        }
        this.hideFirstComponent();
        this.getCountrylist();
        this.getPrograms();
        this.getVersionTypeList()
    }
    show() {
    }
    handleRangeChange(value, text, listIndex) {
    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => { localStorage.setItem("sesReportRangeSPVR", JSON.stringify(value)); this.fetchData(); })
    }
    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }
    getCountrylist() {
        this.setState({
            loading: true
        });
        let realmId = AuthenticationService.getRealmId();
        DropdownService.getRealmCountryDropdownList(realmId)
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    countries: listArray, loading: false
                });
            }).catch(
                error => {
                    this.setState({
                        countries: [], loading: false
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
                            case 403:
                                this.props.history.push(`/accessDenied`)
                                break;
                            case 500:
                            case 404:
                            case 406:
                                this.setState({
                                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
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
    getPrograms() {
        let CountryIds = document.getElementById("countryId").value;
        this.setState({
            programs: [],
        }, () => {
            if (CountryIds.length != 0) {
                var newCountryList = [];
                if(CountryIds == -1){
                    newCountryList = this.state.countries.map(c => c.id);
                } else {
                    newCountryList = [CountryIds];
                }
                DropdownService.getProgramWithFilterForMultipleRealmCountryForDropdown(PROGRAM_TYPE_SUPPLY_PLAN, newCountryList)
                    .then(response => {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = a.code.toUpperCase();
                            var itemLabelB = b.code.toUpperCase();
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            programs: listArray, programLst: listArray
                        });
                    }).catch(
                        error => {
                            this.setState({
                                programs: [], loading: false
                            },
                                () => {
                                    this.hideSecondComponent();
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
            }
        })
    }
    getVersionTypeList() {
        ProgramService.getVersionTypeList().then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
                versionTypeList: listArray
            }, () => {
                this.getStatusList();
            })
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
    getStatusList() {
        ProgramService.getVersionStatusList().then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
                statuses: listArray
            }, () => {
                this.fetchData()
            })
        }).catch(
            error => {
                this.setState({
                    statuses: [], loading: false
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
    fetchData() {
        this.setState({
            loading:true
        })
        let programId = document.getElementById("programId").value;
        let countryId = document.getElementById("countryId").value;
        // if (this.props.match.params.statusId != "" && this.props.match.params.statusId != undefined) {
        //     document.getElementById("versionStatusId").value = this.props.match.params.statusId;
        // }
        let versionStatusId = document.getElementById("versionStatusId").value;
        let versionTypeId = document.getElementById("versionTypeId").value;
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
        if (programId != 0 && countryId != 0) {
            ReportService.getProgramVersionList(programId, countryId, versionStatusId, versionTypeId, startDate, endDate)
                .then(response => {
                    var result = response.data;
                    if (versionStatusId == 1) {
                        result = result.filter(c => c.versionType.id != 1);
                    }
                    result.sort((a, b) => {
                        var itemLabelA = a.lastModifiedDate;
                        var itemLabelB = b.lastModifiedDate
                        return itemLabelA < itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        matricsList: result,
                        message: ''
                    }, () => { this.buildJexcel() })
                }).catch(
                    error => {
                        this.setState({
                            matricsList: [], loading: false
                        },
                            () => {
                                this.el = jexcel(document.getElementById("tableDiv"), '');
                                jexcel.destroy(document.getElementById("tableDiv"), true);
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
        }
        else if (countryId == 0) {
            this.setState({ matricsList: [], message: i18n.t('static.program.validcountrytext') },
                () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                })
        }
        else {
            this.setState({ matricsList: [], message: i18n.t('static.common.selectProgram') },
                () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                })
        }
    }
    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }
    exportCSV(columns) {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.dashboard.country') + ' : ' + document.getElementById("countryId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.status') + ' : ' + document.getElementById("versionStatusId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        const headers = [];
        columns.map((item, idx) => { headers[idx] = item.text.replaceAll(' ', '%20') });
        var A = [this.addDoubleQuoteToRowContent(headers)]
        this.state.matricsList.map(elt => A.push(this.addDoubleQuoteToRowContent([(elt.program.label.label_en.replaceAll(',', '%20')).replaceAll(' ', '%20'), elt.versionId, (elt.versionType.label.label_en.replaceAll(',', '%20')).replaceAll(' ', '%20'), (moment(elt.createdDate).format(`${DATE_FORMAT_CAP_FOUR_DIGITS}`)).replaceAll(' ', '%20'), elt.createdBy.username, elt.versionStatus.label.label_en.replaceAll(' ', '%20'), elt.versionStatus.id == 2 || elt.versionStatus.id == 3 ? elt.lastModifiedBy.username : '', elt.versionStatus.id == 2 || elt.versionStatus.id == 3 ? (elt.lastModifiedDate ? moment(elt.lastModifiedDate).format(`${DATE_FORMAT_CAP} HH:mm`).replaceAll(' ', '%20') : '') : '', elt.notes != null ? (elt.notes.replaceAll(',', '%20')).replaceAll(' ', '%20') : ''
        ])));
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(','))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = "SupplyPlanVersionAndReview.csv"
        document.body.appendChild(a)
        a.click()
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
            doc.setFont('helvetica', 'bold')
            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(12)
                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.report.supplyplanversionandreviewReport'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFont('helvetica', 'normal')
                    doc.setFontSize(8)
                    doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.dashboard.country') + ' : ' + document.getElementById("countryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.common.status') + ' : ' + document.getElementById("versionStatusId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
                        align: 'left'
                    })
                }
            }
        }
        const unit = "pt";
        const size = "A4";
        const orientation = "landscape";
        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);
        doc.setFontSize(8);
        const headers = [];
        columns.map((item, idx) => { headers[idx] = item.text });
        const header = [headers];
        const data = this.state.matricsList.map(elt => [elt.program.label.label_en, elt.versionId, elt.versionType.label.label_en, new moment(elt.createdDate).format(`${DATE_FORMAT_CAP}`), elt.createdBy.username, elt.versionStatus.label.label_en, elt.versionStatus.id == 2 || elt.versionStatus.id == 3 ? elt.lastModifiedBy.username : '', elt.versionStatus.id == 2 || elt.versionStatus.id == 3 ? (elt.lastModifiedDate ? moment(elt.lastModifiedDate).format(`${DATE_FORMAT_CAP} HH:mm`) : '') : '', elt.notes]);
        let content = {
            margin: { top: 80, bottom: 50 },
            startY: 200,
            head: header,
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center', cellWidth: 75 },
            columnStyles: {
                0: { cellWidth: 131.89 },
                8: { cellWidth: 105 },
            }
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save("SupplyPlanVersionAndReview.pdf")
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
        const { countries } = this.state;
        let countryList = countries.length > 0 && countries.map((item, i) => {
            return (
                <option key={i} value={item.id}>
                    {getLabelText(item.label, this.state.lang)}
                </option>
            )
        }, this);
        const { versionTypeList } = this.state;
        let versionTypes = versionTypeList.length > 0
            && versionTypeList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>{getLabelText(item.label, this.state.lang)}</option>
                )
            }, this);
        const { statuses } = this.state;
        let statusList = statuses.length > 0
            && statuses.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const columns = [
            {
                text: i18n.t('static.program.program'),
            },
            {
                text: i18n.t('static.report.version'),
            },
            {
                text: i18n.t('static.report.versiontype'),
            },
            {
                text: i18n.t('static.report.veruploaddate'),
            }
            , {
                text: i18n.t('static.report.veruploaduser'),
            }, {
                text: i18n.t('static.report.issupplyplanapprove'),
            }
            , {
                text: i18n.t('static.report.reviewer'),
            }, {
                text: i18n.t('static.report.approvedRevieweddate'),
            }, {
                text: i18n.t('static.report.comment'),
            }];
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
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <div className="Card-header-reporticon">
                        {
                            this.state.matricsList.length > 0 &&
                            <div className="card-header-actions">
                                <a className="card-header-action">
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF(columns)} />
                                </a>
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
                            </div>
                        }
                    </div>
                    <CardBody className="pb-lg-5 pt-lg-1">
                        <div>
                            <Form >
                                <div className="pl-0">
                                    <div className="row">
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
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
                                            <Label htmlFor="countryId">{i18n.t('static.program.realmcountry')}</Label>
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    bsSize="sm"
                                                    name="countryId"
                                                    id="countryId"
                                                    value={this.state.realmCountryId}
                                                    onChange={(e) => { this.getPrograms(); this.dataChange(e); }}
                                                >  <option value="-1">{i18n.t('static.common.all')}</option>
                                                    {countryList}</Input>
                                                {!!this.props.error &&
                                                    this.props.touched && (
                                                        <div style={{ color: '#BA0C2F', marginTop: '.5rem' }}>{this.props.error}</div>
                                                    )}</InputGroup></FormGroup>
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="programId"
                                                        id="programId"
                                                        bsSize="sm"
                                                        value={this.state.programId}
                                                        onChange={(e) => { this.setProgramId(e) }}
                                                    >
                                                        <option value="-1">{i18n.t('static.common.all')}</option>
                                                        {programList}
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.versiontype')}</Label>
                                            <div className="controls">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="versionTypeId"
                                                        id="versionTypeId"
                                                        bsSize="sm"
                                                        onChange={(e) => { this.dataChange(e) }}
                                                        value={this.state.versionTypeId}
                                                    >  <option value="-1">{i18n.t('static.common.all')}</option>
                                                        {versionTypes}</Input>
                                                </InputGroup>    </div></FormGroup>
                                        <FormGroup className="col-md-3" style={{ zIndex: '1' }}>
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.common.status')}</Label>
                                            <div className="controls">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="versionStatusId"
                                                        id="versionStatusId"
                                                        bsSize="sm"
                                                        value={this.state.versionStatusId}
                                                        onChange={(e) => { this.dataChange(e) }}
                                                    >  <option value="-1">{i18n.t('static.common.all')}</option>
                                                        {statusList}</Input>
                                                </InputGroup>    </div></FormGroup>
                                    </div>
                                </div>
                            </Form>
                        </div>
                        <div className="ReportSearchMarginTop consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
                            <div id="tableDiv" className="jexcelremoveReadonlybackground RowClickable TableWidth100">
                            </div>
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
                    </CardBody>
                </Card>
            </div>
        );
    }
}
export default SupplyPlanVersionAndReview
