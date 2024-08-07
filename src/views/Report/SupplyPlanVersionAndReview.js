import jsPDF from "jspdf";
import "jspdf-autotable";
import jexcel from 'jspreadsheet';
import moment from "moment";
import React, { Component } from 'react';
import Picker from 'react-month-picker';
import {
    Button,
    Card, CardBody,
    Form,
    FormGroup, Input, InputGroup,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { LOGO } from '../../CommonComponent/Logo.js';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, DATE_FORMAT_CAP, DATE_FORMAT_CAP_FOUR_DIGITS, FINAL_VERSION_TYPE, JEXCEL_DATE_FORMAT_SM, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, PROGRAM_TYPE_SUPPLY_PLAN, SPV_REPORT_DATEPICKER_START_MONTH } from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
import ProgramService from '../../api/ProgramService';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { addDoubleQuoteToRowContent, hideFirstComponent, hideSecondComponent, makeText } from '../../CommonComponent/JavascriptCommonFunctions';
import { MultiSelect } from "react-multi-select-component";
import { jExcelLoadedFunction, loadedForNonEditableTables } from '../../CommonComponent/JExcelCommonFunctions';
const entityname = ""
/**
 * Component for Supply Plan Version and Review Report.
 */
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
            color: '',
            programLst: [],
            rangeValue: localStorage.getItem("sesReportRangeSPVR") != "" && localStorage.getItem("sesReportRangeSPVR") != null && localStorage.getItem("sesReportRangeSPVR") != undefined ? JSON.parse(localStorage.getItem("sesReportRangeSPVR")) : { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 3, month: new Date().getMonth() + 1 },
            programId: localStorage.getItem("sesProgramIdSPVR") != "" && localStorage.getItem("sesProgramIdSPVR") != null && localStorage.getItem("sesProgramIdSPVR") != undefined ? localStorage.getItem("sesProgramIdSPVR") : -1,
            realmCountryId: localStorage.getItem("sesCountryIdSPVR") != "" && localStorage.getItem("sesCountryIdSPVR") != null && localStorage.getItem("sesCountryIdSPVR") != undefined ? localStorage.getItem("sesCountryIdSPVR") : -1,
            versionStatusId: this.props.match.params.statusId != "" && this.props.match.params.statusId != undefined ? this.props.match.params.statusId : localStorage.getItem("sesVersionStatusSPVR") != "" && localStorage.getItem("sesVersionStatusSPVR") != null && localStorage.getItem("sesVersionStatusSPVR") != undefined ? localStorage.getItem("sesVersionStatusSPVR") : -1,
            versionTypeId: localStorage.getItem("sesVersionTypeSPVR") != "" && localStorage.getItem("sesVersionTypeSPVR") != null && localStorage.getItem("sesVersionTypeSPVR") != undefined ? localStorage.getItem("sesVersionTypeSPVR") : -1,
            lang: localStorage.getItem('lang'),
            versionStatusIdResetQPL: [],
            versionStatusIdResetQPLString: "",
            programIdsResetQPL: [],
            resetQPLModal: false,
            programIdsList: [],
            loadingResetQPL: false,
            loadingForNotes:false
        };
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.getCountrylist = this.getCountrylist.bind(this);
        this.getStatusList = this.getStatusList.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.getPrograms = this.getPrograms.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.setProgramId = this.setProgramId.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.toggleResetQPL = this.toggleResetQPL.bind(this);
        this.getProgramListForResetQPL = this.getProgramListForResetQPL.bind(this);
        this.resetQPL = this.resetQPL.bind(this);
        this.toggleLarge=this.toggleLarge.bind(this);
        this.actionCanceled=this.actionCanceled.bind(this);
    }
    /**
     * Handles the change event for the data.
     * @param {object} event - The event object containing the target value.
     */
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
    /**
     * Sets the program id in the component state on change and fetches data accordingly.
     * @param {object} event - The event object containing the target value.
     */
    setProgramId(event) {
        localStorage.setItem("sesProgramIdSPVR", event.target.value);
        this.setState({
            programId: event.target.value
        }, () => {
            this.fetchData();
        })
    }
    /**
     * Clears the timeout when the component unmounts.
     */
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }
    /**
     * Builds the Jexcel table with the fetched data.
     */
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
            data[6] = matricsList[j].versionStatus.id == 2 || matricsList[j].versionStatus.id == 3 || matricsList[j].versionStatus.id == 4 ? (matricsList[j].lastModifiedBy.username) : ''
            data[7] = matricsList[j].versionStatus.id == 2 || matricsList[j].versionStatus.id == 3 || matricsList[j].versionStatus.id == 4 ? (matricsList[j].lastModifiedDate ? moment(matricsList[j].lastModifiedDate).format(`YYYY-MM-DD HH:mm:ss`) : '') : ''
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
            onload: loadedForNonEditableTables,
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
                var items = [];
                if (y != null) {
                    var rowData = obj.getRowData(y);
                    // if (rowData[2] != 2 && rowData[0] != "" && rowData[1] != "" && rowData[4] != "") {
                        items.push({
                            title: i18n.t('static.problemContext.viewTrans'),
                            onclick: function () {
                                this.getNotes(rowData[11]);
                            }.bind(this)
                        });
                    // }
                }
                return items;
            }.bind(this),
        };
        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false
        })
    }
    getNotes(programId){
        this.toggleLarge();
        this.setState({
            loadingForNotes:true
        })
        ProgramService.getNotesHistory(programId)
        .then(response => {
            var data = response.data;
            const listArray = [];
            const grouped = data.reduce((acc, item) => {
                acc[item.versionId] = acc[item.versionId] || [];
                acc[item.versionId].push(item);
                return acc;
            }, {});
        
            Object.values(grouped).forEach(entries => {
                const pendingEntries = entries.filter(e => e.versionStatus.id === 1);
                if (pendingEntries.length) {
                    listArray.push(pendingEntries[0]);
                    if (pendingEntries.length > 1) {
                        listArray.push(pendingEntries[pendingEntries.length - 1]);
                    }
                }
                listArray.push(...entries.filter(e => e.versionStatus.id !== 1));
            });            

            if (this.state.notesTransTableEl != "" && this.state.notesTransTableEl != undefined) {
                jexcel.destroy(document.getElementById("notesTransTable"), true);
            }
            var json=[];
            for (var sb = listArray.length-1; sb >= 0; sb--) {
                var data = [];
                data[0] = listArray[sb].versionId; 
                data[1] = getLabelText(listArray[sb].versionType.label, this.state.lang);
                data[2] = listArray[sb].versionType.id==1?"":getLabelText(listArray[sb].versionStatus.label, this.state.lang);
                data[3] = listArray[sb].notes;
                data[4] = listArray[sb].lastModifiedBy.username;
                data[5] = moment(listArray[sb].lastModifiedDate).format("YYYY-MM-DD HH:mm:ss");
                json.push(data);
            }
        var options = {
            data: json,
            columnDrag: false,
            columns: [
                { title: i18n.t('static.report.version'), type: 'text', width: 50 },
                { title: i18n.t('static.report.versiontype'), type: 'text', width: 80 },
                { title: i18n.t('static.report.issupplyplanapprove'), type: 'text', width: 80 },
                { title: i18n.t('static.program.notes'), type: 'text', width: 250 },
                {
                    title: i18n.t("static.common.lastModifiedBy"),
                    type: "text",
                  },
                  {
                    title: i18n.t("static.common.lastModifiedDate"),
                    type: "calendar",
                    options: { isTime: 1, format: "DD-Mon-YY HH24:MI" },
                  },
            ],
            editable: false,
            onload: function (instance, cell) {
                jExcelLoadedFunction(instance,1);
            }.bind(this),
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            // onselection: this.selected,
            oneditionend: this.onedit,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: "top",
            filters: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this),
        };
        var elVar = jexcel(document.getElementById("notesTransTable"), options);
        this.el = elVar;
        this.setState({ notesTransTableEl: elVar,loadingForNotes:false });
            
        }).catch(
            error => {
                this.setState({
                    loadingForNotes:false
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
    /**
     * Redirects to the edit supply plan status screen on row click.
     */
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
    /**
     * This function is used to call either function for country list and version type list on page load
     */
    componentDidMount() {
        if (this.props.match.params.statusId != "" && this.props.match.params.statusId != undefined) {
            document.getElementById("versionStatusId").value = this.props.match.params.statusId;
        }
        hideFirstComponent();
        this.getCountrylist();
        this.getPrograms();
        this.getVersionTypeList()
    }
    /**
     * Handles the dismiss of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => { localStorage.setItem("sesReportRangeSPVR", JSON.stringify(value)); this.fetchData(); })
    }
    /**
     * Handles the click event on the range picker box.
     * Shows the range picker component.
     * @param {object} e - The event object containing information about the click event.
     */
    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }
    /**
     * Retrieves the list of countries.
     */
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
                            loading: false,
                            color: "red",
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
                                    loading: false,
                                    color: "red",
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
                                    loading: false,
                                    color: "red",
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false,
                                    color: "red",
                                });
                                break;
                        }
                    }
                }
            );
    }
    /**
     * Retrieves the list of programs.
     */
    getPrograms() {
        let CountryIds = document.getElementById("countryId").value;
        this.setState({
            programs: [],
        }, () => {
            if (CountryIds.length != 0) {
                var newCountryList = [];
                if (CountryIds == -1) {
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
                                    hideSecondComponent();
                                })
                            if (error.message === "Network Error") {
                                this.setState({
                                    message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                    loading: false,
                                    color: "red",
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
                                            loading: false,
                                            color: "red",
                                        });
                                        break;
                                    case 412:
                                        this.setState({
                                            message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                                            loading: false,
                                            color: "red",
                                        });
                                        break;
                                    default:
                                        this.setState({
                                            message: 'static.unkownError',
                                            loading: false,
                                            color: "red",
                                        });
                                        break;
                                }
                            }
                        }
                    );
            }
        })
    }
    /**
     * Retrieves the list of version types.
     */
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
                        loading: false,
                        color: "red",
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
                                color: "red",
                            });
                            break;
                        case 412:
                            this.setState({
                                message: error.response.data.messageCode,
                                loading: false,
                                color: "red",
                            });
                            break;
                        default:
                            this.setState({
                                message: 'static.unkownError',
                                loading: false,
                                color: "red",
                            });
                            break;
                    }
                }
            }
        );
    }
    /**
     * Retrieves the list of version statuses.
     */
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
                        loading: false,
                        color: "red",
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
                                color: "red",
                            });
                            break;
                        case 412:
                            this.setState({
                                message: error.response.data.messageCode,
                                loading: false,
                                color: "red",
                            });
                            break;
                        default:
                            this.setState({
                                message: 'static.unkownError',
                                loading: false,
                                color: "red",
                            });
                            break;
                    }
                }
            }
        );
    }
    /**
     * Fetches data based on selected parameters.
     */
    fetchData() {
        this.setState({
            loading: true
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
                        message: '',
                        color: "",
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
                                loading: false,
                                color: "red",
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
                                        loading: false,
                                        color: "red",
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                                        loading: false,
                                        color: "red",
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false,
                                        color: "red",
                                    });
                                    break;
                            }
                        }
                    }
                );
        }
        else if (countryId == 0) {
            this.setState({ matricsList: [], message: i18n.t('static.program.validcountrytext'), color: "red", },
                () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                })
        }
        else {
            this.setState({ matricsList: [], message: i18n.t('static.common.selectProgram'), color: "red", },
                () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                })
        }
    }
    /**
     * Exports the data to a CSV file.
     * @param {array} columns - The columns to be exported.
     */
    exportCSV(columns) {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
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
        var A = [addDoubleQuoteToRowContent(headers)]
        this.state.matricsList.map(elt => A.push(addDoubleQuoteToRowContent([(elt.program.label.label_en.replaceAll(',', '%20')).replaceAll(' ', '%20'), elt.versionId, (elt.versionType.label.label_en.replaceAll(',', '%20')).replaceAll(' ', '%20'), (moment(elt.createdDate).format(`${DATE_FORMAT_CAP_FOUR_DIGITS}`)).replaceAll(' ', '%20'), elt.createdBy.username, elt.versionStatus.label.label_en.replaceAll(' ', '%20'), elt.versionStatus.id == 2 || elt.versionStatus.id == 3 ? elt.lastModifiedBy.username : '', elt.versionStatus.id == 2 || elt.versionStatus.id == 3 ? (elt.lastModifiedDate ? moment(elt.lastModifiedDate).format(`${DATE_FORMAT_CAP} HH:mm`).replaceAll(' ', '%20') : '') : '', elt.notes != null ? (elt.notes.replaceAll(',', '%20')).replaceAll(' ', '%20') : ''
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
    /**
     * Exports the data to PDF format.
     * @param {array} columns - The columns to be included in the PDF.
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
                    doc.text(i18n.t('static.report.dateRange') + ' : ' + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
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
    /**
     * Function to toogle reset QPL
     */
    toggleResetQPL() {
        this.setState({
            resetQPLModal: !this.state.resetQPLModal,
            versionStatusIdResetQPL: [],
            versionStatusIdResetQPLString: "",
            programIdsResetQPL: [],
            programIdsList: []
        })

    }
    /**
     * This function is used to set the program Ids that are selected for reset
     * @param {*} e This is value of the event
     */
    setProgramIdsResetQPL(e) {
        this.setState({
            programIdsResetQPL: e,
        })
    }
    /**
     * This function is used to set the version status Ids that are selected for reset
     * @param {*} e This is value of the event
     */
    dataChangeVersionStatus(e) {
        this.setState({
            versionStatusIdResetQPL: e,
            versionStatusIdResetQPLString: e.map(ele => ele.value).toString()
        }, () => {
            this.getProgramListForResetQPL()
        })
    }
    /**
     * This funtion is used to get the list of programs based on version status
     */
    getProgramListForResetQPL() {
        if(this.state.versionStatusIdResetQPL.length>0){
        this.setState({
            loadingResetQPL: true
        })
        DropdownService.getProgramListBasedOnVersionStatusAndVersionType(this.state.versionStatusIdResetQPLString, FINAL_VERSION_TYPE)
            .then(response => {
                var listArray = response.data;
                var proList = [];
                for (var i = 0; i < listArray.length; i++) {
                    var productJson = {
                        label: listArray[i].code,
                        value: listArray[i].id
                    }
                    proList.push(productJson);
                }
                this.setState({
                    programIdsList: proList.sort(function (a, b) {
                        a = a.label.toLowerCase();
                        b = b.label.toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                    }), loadingResetQPL: false,
                    programIdsResetQPL: proList.sort(function (a, b) {
                        a = a.label.toLowerCase();
                        b = b.label.toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                    })
                });
            }).catch(
                error => {
                    this.setState({
                        programIdsList: [],programIdsResetQPL:[], loadingResetQPL: false
                    })
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loadingResetQPL: false,
                            color: "red",
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
                                    loadingResetQPL: false,
                                    color: "red",
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
                                    loadingResetQPL: false,
                                    color: "red",
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loadingResetQPL: false,
                                    color: "red",
                                });
                                break;
                        }
                    }
                }
            );
        }else{
            this.setState({
                programIdsList: [],programIdsResetQPL:[], loadingResetQPL: false
            })
        }
    }
    resetQPL() {
        this.setState({
            loadingResetQPL: true
        })
        let programIds = this.state.programIdsResetQPL.map((ele) =>
            ele.value.toString()
        );
        ProgramService.resetQPL(programIds)
            .then(response => {
                this.setState({
                    message: i18n.t("static.compareAndSelect.dataSaved"),
                    color: "green",
                    loadingResetQPL: false,
                    resetQPLModal: !this.state.resetQPLModal
                })
            }).catch(
                error => {
                    this.setState({
                        loadingResetQPL: false,
                        toggleResetQPL: !this.state.toggleResetQPL
                    })
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loadingResetQPL: false,
                            color: "red",
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
                                    loadingResetQPL: false,
                                    color: "red",
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
                                    loadingResetQPL: false,
                                    color: "red",
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loadingResetQPL: false,
                                    color: "red",
                                });
                                break;
                        }
                    }
                }
            );
    }
    /**
     * Filters the options based on the provided filter string.
     * @param {Array} options - The array of options to filter.
     * @param {string} filter - The filter string used to match option labels.
     * @returns {Promise<Array>} - A promise that resolves to the filtered options.
     */
    filterOptions = async (options, filter) => {
        if (filter) {
            return options.filter((i) =>
                i.label.toLowerCase().includes(filter.toLowerCase())
            );
        } else {
            return options;
        }
    };
    /**
     * Renders the Supply Plan version and review report table.
     * @returns {JSX.Element} - Supply Plan version and review report table.
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
        var statusMultiselect = [];
        statuses.length > 0 && statuses.map((item, i) => {
            statusMultiselect.push({ label: getLabelText(item.label, this.state.lang), value: item.id })
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
                <h5 className={this.state.color} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <div className="Card-header-reporticon">
                        {
                            this.state.matricsList.length > 0 &&
                            <div className="card-header-actions">
                                <a className="card-header-action">
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer', marginTop: '5px' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF(columns)} />
                                </a>
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer', marginTop: '5px' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_RESET_BULK_QPL') &&  
                                <Button
                                    color="info"
                                    size="md"
                                    className="float-right mr-1"
                                    type="button"
                                    onClick={this.toggleResetQPL}
                                >
                                    {i18n.t("static.spvr.resetQPL")}
                                </Button>}
                                &nbsp;&nbsp;
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
                        <span>{i18n.t("static.spvr.rightClickNote")}</span>
                        <div className="ReportSearchMarginTopSPVR consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
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
                <Modal isOpen={this.state.resetQPLModal}
                    className={'modal-md'}>
                    <ModalHeader toggle={() => this.toggleResetQPL()} className="modalHeaderSupplyPlan" id="shipmentModalHeader">
                        <strong>{i18n.t('static.spvr.resetQPL')}</strong>
                    </ModalHeader>
                    <ModalBody>
                        <div style={{ display: this.state.loadingResetQPL ? "none" : "block" }}>
                            <FormGroup className="col-md-12">
                                <Label htmlFor="appendedInputButton">{i18n.t('static.common.status')}</Label>
                                <div className="controls">
                                    {/* <InputGroup>
                                        <Input
                                            type="select"
                                            name="versionStatusIdResetQPL"
                                            id="versionStatusIdResetQPL"
                                            bsSize="sm"
                                            value={this.state.versionStatusIdResetQPL}
                                            onChange={(e) => { this.dataChange(e) }}
                                        >
                                            <option value="">{i18n.t("static.common.select")}</option>
                                            {statusList}
                                        </Input>
                                    </InputGroup> */}
                                    <MultiSelect
                                        name="versionStatusIdResetQPL"
                                        id="versionStatusIdResetQPL"
                                        filterOptions={this.filterOptions}
                                        options={statusMultiselect && statusMultiselect.length > 0 ? statusMultiselect : []}
                                        value={this.state.versionStatusIdResetQPL}
                                        onChange={(e) => { this.dataChangeVersionStatus(e) }}
                                        labelledBy={i18n.t('static.common.select')}
                                    />
                                </div>
                            </FormGroup>
                            <FormGroup className="col-md-12">
                                <Label htmlFor="appendedInputButton">{i18n.t('static.program.programMaster')}
                                    <span className="reportdown-box-icon  fa fa-sort-desc"></span>
                                </Label>
                                <div className="controls ">
                                    <MultiSelect
                                        name="programIdsResetQPL"
                                        id="programIdsResetQPL"
                                        options={this.state.programIdsList && this.state.programIdsList.length > 0 ? this.state.programIdsList : []}
                                        filterOptions={this.filterOptions}
                                        value={this.state.programIdsResetQPL}
                                        onChange={(e) => { this.setProgramIdsResetQPL(e) }}
                                        labelledBy={i18n.t('static.common.select')}
                                    />
                                </div>
                            </FormGroup>
                        </div>
                        <div style={{ display: this.state.loadingResetQPL ? "block" : "none" }}>
                        <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                <div class="align-items-center">
                                    <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                                    <div class="spinner-border blue ml-4" role="status">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.resetQPL()} ><i className="fa fa-check"></i>{i18n.t("static.common.submit")}</Button>
                        </ModalFooter>
                </Modal>
                <Modal isOpen={this.state.notesPopup}
                    className={'modal-lg modalWidth ' + this.props.className}>
                    <ModalHeader toggle={() => this.toggleLarge()} className="modalHeaderSupplyPlan">
                        <strong>{i18n.t('static.problemContext.transDetails')}</strong>
                    </ModalHeader>
                    <ModalBody>
                        <div className="" style={{ display: this.state.loadingForNotes ? "none" : "block" }}>
                            <div id="notesTransTable" className="AddListbatchtrHeight"></div>
                        </div>
                        <div style={{ display: this.state.loadingForNotes ? "block" : "none" }}>
                            <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                <div class="align-items-center">
                                    <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                                    <div class="spinner-border blue ml-4" role="status">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
    /**
     * This function is used to toggle the notes history model
     */
    toggleLarge() {
        this.setState({
            notesPopup: !this.state.notesPopup,
        });
    }
    /**
     * This function is called when cancel button for notes modal popup is clicked
     */
    actionCanceled() {
        this.setState({
            message: i18n.t('static.actionCancelled'),
            color: "#BA0C2F",
        }, () => {
            hideSecondComponent();
            this.toggleLarge();
        })
    }
}
export default SupplyPlanVersionAndReview
