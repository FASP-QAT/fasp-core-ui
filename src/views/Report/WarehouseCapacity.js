import CryptoJS from 'crypto-js';
import jsPDF from "jspdf";
import "jspdf-autotable";
import jexcel from 'jspreadsheet';
import React, { Component } from 'react';
import { MultiSelect } from 'react-multi-select-component';
import {
    Card,
    CardBody,
    Form,
    FormGroup, Input, InputGroup,
    Label
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { LOGO } from '../../CommonComponent/Logo.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, PROGRAM_TYPE_SUPPLY_PLAN, SECRET_KEY } from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { addDoubleQuoteToRowContent, filterOptions } from '../../CommonComponent/JavascriptCommonFunctions';
import { loadedForNonEditableTables } from '../../CommonComponent/JExcelCommonFunctions';
/**
 * Component for Warehouse Capacity Report.
 */
class warehouseCapacity extends Component {
    constructor(props) {
        super(props);
        this.state = {
            countries: [],
            message: '',
            programLst: [],
            data: [],
            offlinePrograms: [],
            lang: localStorage.getItem('lang'),
            programValues: [],
            programLabels: [],
            countryValues: [],
            countryLabels: [],
            loading: true,
            programId: '',
            programs: []
        };
        this.getCountrylist = this.getCountrylist.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.getPrograms = this.getPrograms.bind(this);
        this.handleChangeProgram = this.handleChangeProgram.bind(this);
        this.setProgramId = this.setProgramId.bind(this);
    }
    /**
     * Sets the program id in the component state on change and fetches data accordingly.
     * @param {object} event - The event object containing the target value.
     */
    setProgramId(event) {
        this.setState({
            programId: event.target.value
        }, () => {
            this.fetchData();
        })
    }
    /**
     * This function is used to call either function for country list or program list based on online and offline status
     */
    componentDidMount() {
        if (localStorage.getItem("sessionType") === 'Online') {
            this.getCountrylist();
        } else {
            this.getPrograms();
        }
    }
    /**
     * Exports the data to CSV format.
     */
    exportCSV() {
        var csvRow = [];
        if (localStorage.getItem("sessionType") === 'Online') {
            this.state.countryLabels.map(ele =>
                csvRow.push('"' + (i18n.t('static.dashboard.country') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))
            csvRow.push('')
            this.state.programLabels.map(ele =>
                csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))
        } else {
            csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("programIdOffline").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        }
        csvRow.push('')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        var re;
        var A = [addDoubleQuoteToRowContent([(i18n.t('static.region.country')).replaceAll(' ', '%20'), (i18n.t('static.region.region')).replaceAll(' ', '%20'), (i18n.t('static.program.program')).replaceAll(' ', '%20'), (i18n.t('static.region.gln')).replaceAll(' ', '%20'), (i18n.t('static.region.capacitycbm')).replaceAll(' ', '%20')])]
        re = this.state.data;
        for (var item = 0; item < re.length; item++) {
            A.push(addDoubleQuoteToRowContent([(getLabelText(re[item].realmCountry.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (getLabelText(re[item].region.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (re[item].programList.map(ele => { return getLabelText(ele.label, this.state.lang) })).join('\n').replaceAll(' ', '%20'), re[item].gln == null ? '' : re[item].gln, re[item].capacityCbm]))
        }
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.report.warehouseCapacity') + ".csv"
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
                doc.text('Page ' + String(i) + ' of ' + String(pageCount), doc.internal.pageSize.width / 9, doc.internal.pageSize.height - 20, {
                    align: 'center'
                })
                doc.text('Copyright © 2020 ' + i18n.t('static.footer'), doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 20, {
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
                doc.text(i18n.t('static.report.warehouseCapacity'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    if (localStorage.getItem("sessionType") === 'Online') {
                        var y = 90
                        var planningText = doc.splitTextToSize(i18n.t('static.dashboard.country') + ' : ' + this.state.countryLabels.join('; '), doc.internal.pageSize.width * 3 / 4);
                        doc.text(doc.internal.pageSize.width / 8, y, planningText)
                        for (var i = 0; i < planningText.length; i++) {
                            if (y > doc.internal.pageSize.height - 100) {
                                doc.addPage();
                                y = 80;
                            } else {
                                y = y + 10
                            }
                        }
                        var programText = doc.splitTextToSize((i18n.t('static.program.program') + ' : ' + this.state.programLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                        doc.text(doc.internal.pageSize.width / 8, y, programText)
                    } else {
                        doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programIdOffline").selectedOptions[0].text, doc.internal.pageSize.width / 8, 90, {
                            align: 'left'
                        })
                    }
                }
            }
        }
        const unit = "pt";
        const size = "A4";
        const orientation = "landscape";
        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size);
        doc.setFontSize(8);
        let headers = [
            i18n.t('static.region.country'),
            i18n.t('static.region.region'),
            i18n.t('static.program.program'),
            i18n.t('static.region.gln'),
            i18n.t('static.region.capacitycbm')
        ]
        let data = this.state.data.map(elt => [getLabelText(elt.realmCountry.label, this.state.lang), getLabelText(elt.region.label, this.state.lang), (elt.programList.map(ele => { return getLabelText(ele.label, this.state.lang) })).join('\n'), elt.gln == null ? '' : elt.gln, elt.capacityCbm])
        let content = {
            margin: { top: 80, bottom: 120, left: 100 },
            startY: 90 + doc.splitTextToSize(i18n.t('static.dashboard.country') + ' : ' + this.state.countryLabels.join('; '), doc.internal.pageSize.width * 3 / 4).length * 10 + doc.splitTextToSize((i18n.t('static.program.program') + ' : ' + this.state.programLabels.join('; ')), doc.internal.pageSize.width * 3 / 4).length * 10 + 20,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, cellWidth: 80, halign: 'center' },
            columnStyles: {
                0: { cellWidth: 113 },
                1: { cellWidth: 113 },
                2: { cellWidth: 249.89 },
                3: { cellWidth: 113 },
                4: { cellWidth: 113 },
            },
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.report.warehouseCapacity') + ".pdf")
    }
    /**
     * Retrieves the list of countries.
     */
    getCountrylist() {
        let realmId = AuthenticationService.getRealmId();
        // Implementation for getting country list
        DropdownService.getRealmCountryDropdownList(realmId)
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        countries: listArray, loading: false
                    })
                } else {
                    this.setState({ message: response.data.messageCode, loading: false })
                }
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
    /**
     * Handles the change event for country selection.
     * @param {array} countrysId - The array of selected country IDs.
     */
    handleChange(countrysId) {
        countrysId = countrysId.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            countryValues: countrysId.map(ele => ele),
            countryLabels: countrysId.map(ele => ele.label)
        }, () => {
            this.getPrograms();
        })
    }
    /**
     * Handles the change event for program selection.
     * @param {array} programIds - The array of selected program IDs.
     */
    handleChangeProgram(programIds) {
        programIds = programIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            programValues: programIds.map(ele => ele),
            programLabels: programIds.map(ele => ele.label)
        }, () => {
            this.fetchData();
        })
    }
    /**
     * Retrieves the list of programs.
     */
    getPrograms() {
        if (localStorage.getItem("sessionType") === 'Online') {
            let countryIds = this.state.countryValues.map(ele => ele.value);
            if (countryIds != "") {
                let newCountryList = [... new Set(countryIds)];
                DropdownService.getSPProgramWithFilterForMultipleRealmCountryForDropdown(newCountryList)
                    .then(response => {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = a.code.toUpperCase();
                            var itemLabelB = b.code.toUpperCase();
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            programs: listArray, loading: false
                        }, () => {
                            this.fetchData()
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
                    programs: [], loading: false, programValues: []
                }, () => {
                    this.fetchData()
                })
            }
        } else {
            this.setState({ loading: false })
            this.consolidatedProgramList()
        }
    }
    /**
     * Consolidates the list of programs obtained from Server and local programs.
     */
    consolidatedProgramList = () => {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var program = transaction.objectStore('programData');
            var getRequest = program.getAll();
            var proList = []
            getRequest.onerror = function (event) {
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        var bytes1 = CryptoJS.AES.decrypt(myResult[i].programData.generalData, SECRET_KEY);
                        var programData = bytes1.toString(CryptoJS.enc.Utf8);
                        var programJson1 = JSON.parse(programData);
                        var programJson = {
                            name: (programJson1.programCode) + "~v" + myResult[i].version,
                            id: myResult[i].id
                        }
                        proList[i] = programJson
                    }
                }
                if (localStorage.getItem("sesProgramId") != '' && localStorage.getItem("sesProgramId") != undefined) {
                    this.setState({
                        offlinePrograms: proList.sort(function (a, b) {
                            a = a.name.toLowerCase();
                            b = b.name.toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        }),
                        programId: localStorage.getItem("sesProgramId")
                    }, () => {
                        this.fetchData();
                    })
                } else {
                    this.setState({
                        offlinePrograms: proList.sort(function (a, b) {
                            a = a.name.toLowerCase();
                            b = b.name.toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        })
                    })
                }
            }.bind(this);
        }.bind(this);
    }
    /**
     * Fetches report data based on the selected program and country.
     */
    fetchData(e) {
        if (localStorage.getItem("sessionType") === 'Online') {
            let programId = this.state.programValues.length == this.state.programs.length ? [] : this.state.programValues.map(ele => (ele.value).toString());
            let CountryIds = this.state.countryValues.length == this.state.countries.length ? [] : this.state.countryValues.map(ele => (ele.value).toString());
            if (this.state.programValues.length > 0 && this.state.countryValues.length > 0) {
                this.setState({ loading: true })
                let inputjson = {
                    realmCountryIds: CountryIds,
                    programIds: programId
                }
                ReportService.wareHouseCapacityExporttList(inputjson)
                    .then(response => {
                        this.setState({
                            data: response.data,
                            message: '', loading: false
                        }, () => {
                            this.buildJexcel()
                        })
                    }).catch(
                        error => {
                            this.setState({
                                data: [], loading: false
                            }, () => {
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
            } else if (this.state.countryValues.length == 0) {
                this.setState({ message: i18n.t('static.healtharea.countrytext'), data: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                });
            } else if (this.state.programValues.length == 0) {
                this.setState({ message: i18n.t('static.common.selectProgram'), data: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                });
            }
        } else {
            let programId = this.state.programId;
            if (programId != 0) {
                localStorage.setItem("sesProgramId", programId);
                this.setState({ loading: true })
                var db1;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onerror = function (event) {
                    this.setState({
                        loading: false
                    })
                }.bind(this);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;
                    var transaction = db1.transaction(['programData'], 'readwrite');
                    var programTransaction = transaction.objectStore('programData');
                    var programRequest = programTransaction.get(programId);
                    programRequest.onerror = function (event) {
                        this.setState({
                            loading: false
                        }, () => {
                            this.el = jexcel(document.getElementById("tableDiv"), '');
                            jexcel.destroy(document.getElementById("tableDiv"), true);
                        })
                    }.bind(this);
                    programRequest.onsuccess = function (event) {
                        var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData.generalData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson = JSON.parse(programData);
                        var regionList = (programJson.regionList);
                        var realmCountry = (programJson.realmCountry);
                        var programName = (document.getElementById("programIdOffline").selectedOptions[0].text);
                        let offlineData = [];
                        for (var i = 0; i < regionList.length; i++) {
                            let json = {
                                "realmCountry": realmCountry.country,
                                "programList": [
                                    {
                                        "id": programJson.programId,
                                        "label": programJson.label,
                                        "code": programJson.programCode
                                    },
                                ],
                                "region": regionList[i],
                                "gln": regionList[i].gln,
                                "capacityCbm": regionList[i].capacityCbm,
                            }
                            offlineData.push(json);
                        }
                        this.setState({
                            data: offlineData, loading: false
                        }, () => {
                            this.buildJexcel()
                        });
                    }.bind(this)
                }.bind(this)
            } else {
                this.setState({
                    data: [],
                    loading: false
                }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                });
            }
        }
    }
    /**
     * Builds the Jexcel table with the fetched data.
     */
    buildJexcel = () => {
        let regionList = this.state.data;
        let regionListArray = [];
        let count = 0;
        for (var j = 0; j < regionList.length; j++) {
            data = [];
            data[0] = getLabelText(regionList[j].realmCountry.label, this.state.lang)
            data[1] = getLabelText(regionList[j].region.label, this.state.lang)
            data[2] = (regionList[j].programList.map((item, idx1) => { return ((regionList[j].programList[idx1].code)) })).join(' \n')
            data[3] = regionList[j].gln
            data[4] = (regionList[j].capacityCbm);
            regionListArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var data = regionListArray;
        var options = {
            data: data,
            columnDrag: false,
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.region.country'),
                    type: 'text',
                }
                ,
                {
                    title: i18n.t('static.region.region'),
                    type: 'text',
                }
                , {
                    title: i18n.t('static.program.program'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.region.gln'),
                    type: 'text',
                }, {
                    title: i18n.t('static.region.capacitycbm'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                }
            ],
            editable: false,
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
                return false;
            }.bind(this),
        };
        var regionEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = regionEl;
        this.setState({
            regionEl: regionEl, loading: false
        })
    }
    /**
     * Renders the warehouse capacity report table.
     * @returns {JSX.Element} - Warehouse capacity report table.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        const checkOnline = localStorage.getItem('sessionType');
        const { programs } = this.state;
        let programList = [];
        programList = programs.length > 0
            && programs.map((item, i) => {
                return (
                    { label: (item.code), value: item.id }
                )
            }, this);
        const { offlinePrograms } = this.state;
        const { countries } = this.state;
        let countryList = countries.length > 0 && countries.map((item, i) => {
            return ({ label: getLabelText(item.label, this.state.lang), value: item.id })
        }, this);
        return (
            <div className="animated fadeIn" >
                <AuthenticationServiceComponent history={this.props.history} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <Card>
                    <div className="Card-header-reporticon">
                        {
                            this.state.data.length > 0 &&
                            <div className="card-header-actions">
                                <a className="card-header-action">
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />
                                </a>
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                            </div>
                        }
                    </div>
                    <CardBody className="pb-lg-5 pt-lg-2 ">
                        <div className="" >
                            <div>
                                <Form >
                                    <div className="pl-0">
                                        <div className="row">
                                            {checkOnline === 'Online' &&
                                                <FormGroup className="col-md-3 ZindexFeild">
                                                    <Label htmlFor="countrysId">{i18n.t('static.program.realmcountry')}</Label>
                                                    <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                                    <div className="controls edit">
                                                        <MultiSelect
                                                            bsSize="sm"
                                                            name="countrysId"
                                                            id="countrysId"
                                                            filterOptions={filterOptions}
                                                            value={this.state.countryValues}
                                                            onChange={(e) => { this.handleChange(e) }}
                                                            options={countryList && countryList.length > 0 ? countryList : []}
                                                        />
                                                        {!!this.props.error &&
                                                            this.props.touched && (
                                                                <div style={{ color: '#BA0C2F', marginTop: '.5rem' }}>{this.props.error}</div>
                                                            )}
                                                    </div>
                                                </FormGroup>
                                            }
                                            {checkOnline === 'Online' &&
                                                <FormGroup className="col-md-3 ZindexFeild">
                                                    <Label htmlFor="programIds">{i18n.t('static.program.program')}</Label>
                                                    <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                                    <MultiSelect
                                                        bsSize="sm"
                                                        name="programId"
                                                        id="programId"
                                                        filterOptions={filterOptions}
                                                        value={this.state.programValues}
                                                        onChange={(e) => { this.handleChangeProgram(e) }}
                                                        options={programList && programList.length > 0 ? programList : []}
                                                        disabled={this.state.loading}
                                                    />
                                                    {!!this.props.error &&
                                                        this.props.touched && (
                                                            <div style={{ color: '#BA0C2F', marginTop: '.5rem' }}>{this.props.error}</div>
                                                        )}
                                                </FormGroup>
                                            }
                                            {checkOnline === 'Offline' &&
                                                <FormGroup className="col-md-3 ZindexFeild">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                                    <div className="controls ">
                                                        <InputGroup>
                                                            <Input
                                                                type="select"
                                                                name="programIdOffline"
                                                                id="programIdOffline"
                                                                bsSize="sm"
                                                                onChange={(e) => { this.setProgramId(e) }}
                                                                value={this.state.programId}
                                                            >
                                                                <option value="0">{i18n.t('static.common.select')}</option>
                                                                {offlinePrograms.length > 0
                                                                    && offlinePrograms.map((item, i) => {
                                                                        return (
                                                                            <option key={i} value={item.id}>
                                                                                {item.name}
                                                                            </option>
                                                                        )
                                                                    }, this)}
                                                            </Input>
                                                        </InputGroup>
                                                    </div>
                                                </FormGroup>
                                            }
                                        </div>
                                    </div>
                                </Form>
                                <div className="werehousecapacitySearchposition">
                                    <div id="tableDiv" className="jexcelremoveReadonlybackground consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
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
                        </div>
                    </CardBody>
                </Card>
            </div >
        );
    }
}
export default warehouseCapacity;