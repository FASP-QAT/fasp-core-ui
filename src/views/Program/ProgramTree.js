import CryptoJS from 'crypto-js';
import moment from "moment";
import React, { Component } from 'react';
import Picker from 'react-month-picker';
import MonthBox from '../../CommonComponent/MonthBox.js';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    Col,
    FormGroup,
    Input,
    InputGroup,
    Label,
    Row
} from 'reactstrap';
import { getDatabase } from '../../CommonComponent/IndexedDbFunctions';
import { decompressJson, hideFirstComponent } from '../../CommonComponent/JavascriptCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, DATE_FORMAT_CAP, INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY } from '../../Constants.js';
import ProgramService from "../../api/ProgramService";
import RealmCountryService from "../../api/RealmCountryService";
import RealmService from '../../api/RealmService';
import cleanUp from '../../assets/img/cleanUp.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
// Localized entity name
const entityname = i18n.t('static.dashboard.downloadprogram')
/**
 * Component used for downloading the programs on local system
 */
class Program extends Component {
    constructor(props) {
        super(props);
        this.downloadClicked = this.downloadClicked.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.getTree = this.getTree.bind(this);
        this.state = {
            loading: true,
            dropdownOpen: false,
            radioSelected: 2,
            countryList: [],
            healthAreaList: [],
            prgList: [],
            realmList: [],
            message: '',
            color: '',
            lang: localStorage.getItem('lang'),
            realmId: AuthenticationService.getRealmId(),
            loading: true,
            programList: [],
            minDate: { year: new Date().getFullYear() - 20, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() - 2, month: new Date().getMonth() + 1 },
            startDate: { year: new Date().getFullYear() - 3, month: new Date().getMonth() + 1 },
            isMonthSelected: false
        };
        this.pickRange = React.createRef();
        this.getPrograms = this.getPrograms.bind(this);
        this.checkNewerVersions = this.checkNewerVersions.bind(this);
        this.getMoreVersions = this.getMoreVersions.bind(this);
        this.getLocalPrograms = this.getLocalPrograms.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this);
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    }
    /**
     * Show Supply Planning date range picker
     * @param {Event} e -  The click event.
     */
    _handleClickRangeBox(e) {
        this.pickRange.current.show()
    }
    /**
     * Handle date range change
     * @param {*} value 
     * @param {*} text 
     * @param {*} listIndex 
     */
    handleRangeChange(value, text, listIndex) {
    }
    /**
     * This function is used to update the date filter value
     * @param {*} value This is the value that user has selected
     */
    handleRangeDissmis(value) {
        this.setState({ startDate: value });
    }
    /**
     * Sets the state to control the visibility of data in terms planning units.
     * @param {Object} e Event object containing the checkbox state.
     */
    changeIsMonthSelected(e) {
        this.setState({
            isMonthSelected: e.target.checked
        })
    }
    /**
     * Fetches more versions of a program from the server.
     * @param {string} programId - The ID of the program for which more versions are to be fetched.
     * @param {number} pageNo - The page number of the versions to be fetched.
     */
    getMoreVersions(programId, pageNo) {
        ProgramService.loadMoreProgramList(programId, pageNo)
            .then(response => {
                if (response.status == 200) {
                    var prgList = this.state.prgList;
                    var index = prgList.findIndex(c => c.program.id == programId);
                    prgList[index].versionList = prgList[index].versionList.concat(response.data.versionList);
                    prgList[index].currentPage = response.data.currentPage;
                    this.setState({
                        prgList,
                        loading: false
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode,
                        loading: false,
                        color: "red"
                    }, () => {
                        hideFirstComponent()
                    })
                }
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loading: false,
                            color: "red"
                        }, () => {
                            hideFirstComponent()
                        })
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
                                    color: "red"
                                }, () => {
                                    hideFirstComponent()
                                })
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false,
                                    color: "red"
                                }, () => {
                                    hideFirstComponent()
                                })
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false,
                                    color: "red"
                                }, () => {
                                    hideFirstComponent()
                                })
                                break;
                        }
                    }
                }
            );
    }
    /**
     * Checks for newer versions of programs.
     * @param {Array} programs - An array of programs to check for newer versions.
     */
    checkNewerVersions(programs) {
        if (localStorage.getItem("sessionType") === 'Online') {
            ProgramService.checkNewerVersions(programs)
                .then(response => {
                    localStorage.removeItem("sesLatestProgram");
                    localStorage.setItem("sesLatestProgram", response.data);
                })
        }
    }
    /**
     * Calls getLocalPrograms and getPrograms function and load the realm list on component mount
     */
    componentDidMount() {
        this.getLocalPrograms();
        this.getPrograms();
        if (AuthenticationService.getRealmId() == -1) {
            document.getElementById("realmDiv").style.display = "block"
            RealmService.getRealmListAll()
                .then(response => {
                    if (response.status == 200) {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                            var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            realmList: listArray,
                            loading: false
                        })
                    } else {
                        this.setState({
                            message: response.data.messageCode, loading: false, color: "red"
                        }, () => {
                            hideFirstComponent()
                        })
                    }
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                loading: false,
                                color: "red"
                            }, () => {
                                hideFirstComponent()
                            })
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
                                        color: "red"
                                    }, () => {
                                        hideFirstComponent()
                                    })
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false,
                                        color: "red"
                                    }, () => {
                                        hideFirstComponent()
                                    })
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false,
                                        color: "red"
                                    }, () => {
                                        hideFirstComponent()
                                    })
                                    break;
                            }
                        }
                    }
                );
        } else {
            document.getElementById("realmDiv").style.display = "none"
            this.setState({
                realmId: AuthenticationService.getRealmId(), loading: false
            })
            this.getTree();
        }
    }
    /**
     * Retrieves local programs from IndexedDB.
     */
    getLocalPrograms() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext'),
                loading: false,
                color: "red"
            }, () => {
                hideFirstComponent()
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programQPLDetails'], 'readwrite');
            var program = transaction.objectStore('programQPLDetails');
            var getRequest = program.getAll();
            var proList = []
            getRequest.onerror = function (event) {
                this.setState({
                })
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        var programJson = {
                            programId: myResult[i].programId,
                            versionId: myResult[i].version
                        }
                        proList.push(programJson);
                    }
                }
                this.setState({
                    programList: proList,
                })
            }.bind(this)
        }.bind(this)
    }
    /**
     * Reterives realm country, load program from server
     */
    getTree() {
        this.setState({ loading: true })
        document.getElementById("treeDiv").style.display = "block";
        if (this.state.realmId != "" && this.state.realmId > 0) {
            this.setState({
                message: ""
            })
            RealmCountryService.getRealmCountryForProgram(this.state.realmId)
                .then(response => {
                    if (response.status == 200) {
                        var lang = this.state.lang;
                        this.setState({
                            countryList: (response.data).sort(function (a, b) {
                                a = getLabelText(a.realmCountry.label, lang).toLowerCase();
                                b = getLabelText(b.realmCountry.label, lang).toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            })
                        })
                        ProgramService.loadProgramList()
                            .then(response => {
                                if (response.status == 200) {
                                    this.setState({
                                        prgList: response.data.programList,
                                        loading: false
                                    })
                                } else {
                                    this.setState({
                                        message: response.data.messageCode,
                                        loading: false,
                                        color: "red"
                                    }, () => {
                                        hideFirstComponent()
                                    })
                                }
                            }).catch(
                                error => {
                                    if (error.message === "Network Error") {
                                        this.setState({
                                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                            loading: false,
                                            color: "red"
                                        }, () => {
                                            hideFirstComponent()
                                        })
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
                                                    color: "red"
                                                }, () => {
                                                    hideFirstComponent()
                                                })
                                                break;
                                            case 412:
                                                this.setState({
                                                    message: error.response.data.messageCode,
                                                    loading: false,
                                                    color: "red"
                                                }, () => {
                                                    hideFirstComponent()
                                                })
                                                break;
                                            default:
                                                this.setState({
                                                    message: 'static.unkownError',
                                                    loading: false,
                                                    color: "red"
                                                }, () => {
                                                    hideFirstComponent()
                                                })
                                                break;
                                        }
                                    }
                                }
                            );
                    } else {
                        this.setState({
                            message: response.data.messageCode,
                            loading: false, color: "red"
                        }, () => {
                            hideFirstComponent()
                        })
                    }
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                loading: false,
                                color: "red"
                            }, () => {
                                hideFirstComponent()
                            })
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
                                        color: "red"
                                    }, () => {
                                        hideFirstComponent()
                                    })
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false,
                                        color: "red"
                                    }, () => {
                                        hideFirstComponent()
                                    })
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false,
                                        color: "red"
                                    }, () => {
                                        hideFirstComponent()
                                    })
                                    break;
                            }
                        }
                    }
                );
        } else {
            document.getElementById("treeDiv").style.display = "none";
            this.setState({
                message: i18n.t('static.common.realmtext'),
                color: "red"
            }, () => {
                hideFirstComponent()
            })
            this.setState({ loading: false });
        }
    }
    /**
     * Handles data change events triggered by form inputs.
     * @param {Event} event - The change event.
     */
    dataChange(event) {
        if (event.target.name === "realmId") {
            this.state.realmId = event.target.value;
        }
        this.getTree();
    };
    /**
     * Retrieves programs from the indexedDB.
     */
    getPrograms() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                message: i18n.t('static.program.errortext'),
                color: 'red'
            }, () => {
                hideFirstComponent()
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programQPLDetails'], 'readwrite');
            var program = transaction.objectStore('programQPLDetails');
            var getRequest = program.getAll();
            var proList = []
            getRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: 'red',
                    loading: false
                }, () => {
                    hideFirstComponent()
                })
            }.bind(this);
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        var programJson = {
                            programId: myResult[i].programId,
                            versionId: myResult[i].version
                        }
                        proList.push(programJson)
                    }
                }
                this.checkNewerVersions(proList);
            }.bind(this);
        }.bind(this)
    }
    /**
     * Displays a loading indicator while data is being loaded.
     */
    loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>
    /**
     * Prompts the user to confirm the deletion of a local version of a program.
     * If confirmed, deletes the local version from indexedDB and updates the state accordingly.
     * @param {string} programId - The ID of the program.
     * @param {string} versionId - The ID of the version.
     * @param {number} changed - Indicates whether changes are unsaved (1) or not (0).
     */
    deleteLocalVersion(programId, versionId, changed) {
        confirmAlert({
            title: i18n.t('static.program.confirm'),
            message: changed == 1 ? i18n.t('static.loadDelDataset.changesNotSaved') : i18n.t('static.loadDelDataset.deleteThisLocalVersion'),
            buttons: [
                {
                    label: i18n.t('static.program.yes'),
                    onClick: () => {
                        this.setState({
                            loading: true
                        })
                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                        var userId = userBytes.toString(CryptoJS.enc.Utf8);
                        var id = programId + "_v" + versionId + "_uId_" + userId;
                        var db1;
                        getDatabase();
                        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                        openRequest.onerror = function (event) {
                        }.bind(this);
                        openRequest.onsuccess = function (e) {
                            db1 = e.target.result;
                            var transaction = db1.transaction(['programData'], 'readwrite');
                            var programTransaction = transaction.objectStore('programData');
                            var deleteRequest = programTransaction.delete(id);
                            deleteRequest.onsuccess = function (event) {
                                var transaction1 = db1.transaction(['downloadedProgramData'], 'readwrite');
                                var programTransaction1 = transaction1.objectStore('downloadedProgramData');
                                var deleteRequest1 = programTransaction1.delete(id);
                                deleteRequest1.onsuccess = function (event) {
                                    var transaction2 = db1.transaction(['programQPLDetails'], 'readwrite');
                                    var programTransaction2 = transaction2.objectStore('programQPLDetails');
                                    var deleteRequest2 = programTransaction2.delete(id);
                                    deleteRequest2.onsuccess = function (event) {
                                        this.setState({
                                            loading: false,
                                            message: "Program delete succesfully.",
                                            color: 'green'
                                        }, () => {
                                            hideFirstComponent()
                                        })
                                        this.getPrograms();
                                        this.getLocalPrograms();
                                    }.bind(this)
                                }.bind(this)
                            }.bind(this)
                        }.bind(this)
                    }
                }, {
                    label: i18n.t('static.program.no'),
                    onClick: () => {
                        this.setState({
                            message: i18n.t('static.actionCancelled'), loading: false, color: "red"
                        })
                        this.setState({ loading: false, color: "red" }, () => {
                            hideFirstComponent()
                        })
                        this.props.history.push(`/program/downloadProgram`)
                    }
                }
            ]
        })
    }
    /**
     * Renders the load program screen.
     * @returns {JSX.Element} - Load Program screen.
     */
    render() {
        const pickerLang = {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            from: 'From', to: 'To',
        }
        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }
        const { realmList } = this.state;
        let realms = realmList.length > 0
            && realmList.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 >{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className={this.state.color} id="div1">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardBody className="pb-lg-2 pt-lg-2">
                                <FormGroup className="tab-ml-0 mb-md-3 ml-3">
                                    <Col md="12" >
                                        <Input className="form-check-input" type="checkbox" id="checkbox1" name="checkbox1" value={this.state.isMonthSelected} onChange={(e) => this.changeIsMonthSelected(e)} />
                                        <Label check className="form-check-label" htmlFor="checkbox1">{i18n.t('static.program.dateRange')}</Label>
                                    </Col>
                                </FormGroup>
                                {this.state.isMonthSelected && <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.supplyPlan.startMonth')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                    <div className="controls edit">
                                        <Picker
                                            years={{ min: this.state.minDate, max: this.state.maxDate }}
                                            ref={this.pickRange}
                                            value={this.state.startDate}
                                            lang={pickerLang}
                                            onChange={this.handleRangeChange}
                                            onDismiss={this.handleRangeDissmis}
                                        >
                                            <MonthBox value={makeText(this.state.startDate)} onClick={this._handleClickRangeBox} />
                                        </Picker>
                                    </div>
                                </FormGroup>}
                                <div>
                                    <ul className="legendcommitversion pl-0" style={{ display: 'inline-flex' }}>
                                        <li><span className="redlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.loadProgram.oldVersion')}</span></li>
                                        <li><span className="greenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.loadProgram.latestVersion')} </span></li>
                                        <li><span className=" blacklegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.loadProgram.notDownloaded')} </span></li>
                                        <li><span><img width="18" title="Clean up" src={cleanUp} className="CleanUpIcon"></img></span> <span className="legendDeleteCleanupText">{i18n.t('static.loadDelDataset.keepLatestVersionDeleteOldVersion')}</span></li>
                                        <li><span className=""><i title="Delete" className="fa fa-trash DeleteIcon"></i></span> <span className="legendDeleteCleanupText">{i18n.t('static.loadDelDataset.deleteVersion')}</span></li>
                                    </ul>
                                </div>
                                <Col md="3 pl-0" id="realmDiv">
                                    <FormGroup>
                                        <Label htmlFor="select">{i18n.t('static.program.realm')}</Label>
                                        <div className="controls ">
                                            <InputGroup>
                                                <Input
                                                    bsSize="sm"
                                                    onChange={(e) => { this.dataChange(e) }}
                                                    type="select" name="realmId" id="realmId">
                                                    <option value="">{i18n.t('static.common.select')}</option>
                                                    {realms}
                                                </Input>
                                            </InputGroup>
                                        </div>
                                    </FormGroup>
                                </Col>
                                <div style={{ display: this.state.loading ? "none" : "block" }}>
                                    <div className="table-responsive loadProgramHeight" id="treeDiv" style={{ display: "none" }}>
                                        <ul className="tree">
                                            <li>
                                                <input type="checkbox" id="c1" />
                                                <label className="tree_label" htmlFor="c1">{i18n.t('static.program.program')}</label>
                                                <ul>
                                                    {
                                                        this.state.countryList.map(item => (
                                                            <li>
                                                                <input type="checkbox" id={"c1-".concat(item.realmCountry.id)} />
                                                                <label htmlFor={"c1-".concat(item.realmCountry.id)} className="tree_label">{getLabelText(item.realmCountry.label, this.state.lang)}</label>
                                                                <ul>
                                                                    {
                                                                        this.state.prgList.filter(c => c.realmCountry.id == item.realmCountry.id).sort(function (a, b) {
                                                                            a = getLabelText(a.program.label, this.state.lang).toLowerCase();
                                                                            b = getLabelText(b.program.label, this.state.lang).toLowerCase();
                                                                            return a < b ? -1 : a > b ? 1 : 0;
                                                                        }.bind(this))
                                                                            .map(item2 => (
                                                                                <li>
                                                                                    <span className="tree_label">
                                                                                        <span className="">
                                                                                            <div className="checkbox m-0">
                                                                                                <input type="checkbox" name="programCheckBox" value={item2.program.id} id={"checkbox_".concat(item.realmCountry.id).concat(item2.program.id).concat(".0")} />
                                                                                                <label className={this.state.programList.filter(c => c.programId == item2.program.id && c.versionId == Math.max.apply(Math, item2.versionList.map(function (o) { return o.versionId; }))).length > 0 ? "greenColor" : this.state.programList.filter(c => c.programId == item2.program.id).length > 0 ? "redColor" : ""} htmlFor={"checkbox_".concat(item.realmCountry.id).concat(item2.program.id).concat(".0")}>{getLabelText(item2.program.label, this.state.lang) + ' - (' + item2.program.code + ')'}</label>
                                                                                            </div>
                                                                                        </span>
                                                                                    </span>
                                                                                    <input type="checkbox" defaultChecked id={"fpm".concat(item.realmCountry.id).concat(item2.program.id)} />
                                                                                    <label className="arrow_label" htmlFor={"fpm".concat(item.realmCountry.id).concat(item2.program.id)}></label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                                                    {this.state.programList.filter(c => c.programId == item2.program.id).length > 1 ? <img onClick={() => this.deleteCleanUpIcon(item2.program.id)} src={cleanUp} className="DeleteIcontree CleanUpSize ml-1" width="16" title="Clean Up" /> : ""}
                                                                                    <ul>
                                                                                        {
                                                                                            this.state.prgList.filter(c => c.program.id == item2.program.id).map(item3 => (
                                                                                                (item3.versionList).map((item4, count) => (
                                                                                                    <>
                                                                                                        <li><span className="tree_label">
                                                                                                            <span className="">
                                                                                                                <div className="checkbox m-0">
                                                                                                                    <input type="checkbox" data-program-id={item2.program.id} value={item4.versionId} className="versionCheckBox" name={"versionCheckBox".concat(item2.program.id)} id={"kf-v".concat(item.realmCountry.id).concat(item2.program.id).concat(item4.versionId)} />
                                                                                                                    <label title={item4.notes} className={this.state.programList.filter(c => c.programId == item2.program.id && c.versionId == item4.versionId && Math.max.apply(Math, item2.versionList.map(function (o) { return o.versionId; })) == item4.versionId).length > 0 ? "greenColor" : this.state.programList.filter(c => c.programId == item2.program.id && c.versionId == item4.versionId).length > 0 ? "redColor" : ""}
                                                                                                                        htmlFor={"kf-v".concat(item.realmCountry.id).concat(item2.program.id).concat(item4.versionId)}>{i18n.t('static.program.version').concat(" ")}<b>{(item4.versionId)}</b>{(" ").concat(i18n.t('static.program.savedOn')).concat(" ")}<b>{(moment(item4.createdDate).format(DATE_FORMAT_CAP))}</b>{(" ").concat(i18n.t("static.program.savedBy")).concat(" ")}<b>{(item4.createdBy.username)}</b>{(" ").concat(i18n.t("static.program.as")).concat(" ")}<b>{getLabelText(item4.versionType.label)}</b></label>
                                                                                                                    {this.state.programList.filter(c => c.programId == item2.program.id && c.versionId == item4.versionId).length > 0 && <i title="Delete" onClick={() => this.deleteLocalVersion(item2.program.id, parseInt(item4.versionId), this.state.programList.filter(c => c.programId == item2.program.id && c.versionId == item4.versionId)[0].changed)} className="ml-1 fa fa-trash DeleteIcontree"></i>}
                                                                                                                </div>
                                                                                                            </span>
                                                                                                        </span>
                                                                                                        </li>
                                                                                                        {count == item3.versionList.length - 1 && item3.maxPages != item3.currentPage && <div style={{ color: '#205493', cursor: 'pointer' }} onClick={() => this.getMoreVersions(item2.program.id, parseInt(item3.versionList.length / 5))}>{i18n.t('static.program.seemoreprogram')}</div>}
                                                                                                    </>
                                                                                                ))
                                                                                            ))
                                                                                        }
                                                                                    </ul>
                                                                                </li>
                                                                            ))}
                                                                </ul>
                                                            </li>
                                                        ))}
                                                </ul>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div style={{ display: this.state.loading ? "block" : "none" }}>
                                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                        <div class="align-items-center">
                                            <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>
                                            <div class="spinner-border blue ml-4" role="status">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                            <CardFooter>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                <Button type="button" size="md" color="success" className="float-right mr-1" onClick={() => this.downloadClicked()}><i className="fa fa-check"></i>{i18n.t('static.common.download')}</Button>
                            </CardFooter>
                        </Card>
                        <span align="right">{i18n.t("static.loadProgram.loadProgramNotePart1")}{" '"}<a href="/#/report/supplyPlanVersionAndReview" target="_blank">{i18n.t('static.report.supplyplanversionandreviewReport')}</a>{"' "}{i18n.t('static.loadProgram.loadProgramNotePart2')}</span>
                    </Col>
                </Row>
            </div>
        );
    }
    /**
     * Redirects to the application dashboard screen when cancel button is clicked.
     */
    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    /**
     * Deletes a program from indexedDB based on its ID.
     * @param {string} id - The ID of the program to delete.
     * @param {number} i - The index of the program being deleted.
     * @param {number} length - The total number of programs to delete.
     */
    deleteProgramById(id, i, length) {
        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var programTransaction = transaction.objectStore('programData');
            var deleteRequest = programTransaction.delete(id);
            deleteRequest.onsuccess = function (event) {
                var transaction1 = db1.transaction(['downloadedProgramData'], 'readwrite');
                var programTransaction1 = transaction1.objectStore('downloadedProgramData');
                var deleteRequest1 = programTransaction1.delete(id);
                deleteRequest1.onsuccess = function (event) {
                    var transaction2 = db1.transaction(['programQPLDetails'], 'readwrite');
                    var programTransaction2 = transaction2.objectStore('programQPLDetails');
                    var deleteRequest2 = programTransaction2.delete(id);
                    deleteRequest2.onsuccess = function (event) {
                        if (i == length - 1) {
                            this.setState({
                                loading: false,
                                message: "Program delete succesfully.",
                                color: 'green'
                            }, () => {
                                hideFirstComponent()
                            })
                            this.getPrograms();
                            this.getLocalPrograms();
                        }
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }
    /**
     * Deletes older versions of a program except for the latest one based on the program ID.
     * @param {string} programId - The ID of the program for which older versions will be deleted.
     */
    deleteCleanUpIcon(programId) {
        let versionListForSelectedProgram = this.state.prgList.filter(c => c.program.id == programId)[0].versionList;
        let versionListRemoveMaxVersionId = versionListForSelectedProgram.filter(c => c.versionId != Math.max.apply(Math, versionListForSelectedProgram.map(a => a.versionId)));
        confirmAlert({
            title: i18n.t('static.program.confirmsubmit'),
            message: i18n.t('static.program.cleanUpConfirmation'),
            buttons: [
                {
                    label: i18n.t('static.program.yes'),
                    onClick: () => {
                        this.setState({
                            loading: true
                        })
                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                        var userId = userBytes.toString(CryptoJS.enc.Utf8);
                        for (var i = 0; i < versionListRemoveMaxVersionId.length; i++) {
                            var id = programId + "_v" + (versionListRemoveMaxVersionId[i].versionId).toString().replace(/^0+/, '') + "_uId_" + userId;
                            this.deleteProgramById(id, i, versionListRemoveMaxVersionId.length);
                        }
                    }
                }, {
                    label: i18n.t('static.program.no'),
                    onClick: () => {
                        this.setState({
                            message: i18n.t('static.actionCancelled'), color: "red", loading: false
                        })
                        this.setState({ loading: false, color: "red" }, () => {
                            hideFirstComponent()
                        })
                        this.props.history.push(`/program/downloadProgram`)
                    }
                }
            ]
        })
    }
    /**
     * Initiates the download process for selected programs and versions and Saves downloaded program data to indexedDB for offline access.
     */
    downloadClicked() {
        this.setState({ loading: true })
        var programCheckboxes = document.getElementsByName("programCheckBox");
        var versionCheckBox = document.getElementsByClassName("versionCheckBox");
        var checkboxesChecked = [];
        var programCheckedCount = 0;
        var programInvalidCheckedCount = 0;
        var count = 0;
        for (var i = 0; i < versionCheckBox.length; i++) {
            if (versionCheckBox[i].checked) {
                programCheckedCount = programCheckedCount + 1;
                count = count + 1;
                var json = {
                    programId: versionCheckBox[i].dataset.programId,
                    versionId: versionCheckBox[i].value
                }
                checkboxesChecked = checkboxesChecked.concat([json]);
            }
        }
        for (var i = 0; i < programCheckboxes.length; i++) {
            if (programCheckboxes[i].checked) {
                programCheckedCount = programCheckedCount + 1;
                var versionCheckboxes = document.getElementsByName("versionCheckBox".concat(programCheckboxes[i].value));
                if (versionCheckboxes.length > 0) {
                    var count1 = 0;
                    for (var j = 0; j < versionCheckboxes.length; j++) {
                        if (versionCheckboxes[j].checked) {
                            count = count + 1;
                            count1 = count1 + 1;
                            var json = {
                                programId: programCheckboxes[i].value,
                                versionId: versionCheckboxes[j].value
                            }
                        }
                    }
                    if (count1 == 0) {
                        var json = {
                            programId: programCheckboxes[i].value,
                            versionId: -1
                        }
                        checkboxesChecked = checkboxesChecked.concat([json]);
                    }
                }
            } else {
                var versionCheckboxes = document.getElementsByName("versionCheckBox".concat(programCheckboxes[i].value));
                if (versionCheckboxes.length > 0) {
                    for (var j = 0; j < versionCheckboxes.length; j++) {
                        if (versionCheckboxes[j].checked) {
                            count = count + 1;
                        }
                    }
                    if (count > 0) {
                        programInvalidCheckedCount = programInvalidCheckedCount + 1;
                    }
                }
            }
        }
        if (programCheckedCount == 0) {
            this.setState({
                message: i18n.t('static.program.errorSelectAtleastOneProgram'),
                loading: false, color: "red"
            },
                () => {
                    hideFirstComponent();
                })
        }
        else {
            if (localStorage.getItem("sessionType") === 'Online') {
                var inputJson = {
                    'cutOffDate': this.state.isMonthSelected ? this.state.startDate.year + "-" + this.state.startDate.month + "-01" : "",
                    'programVersionList': checkboxesChecked
                }
                ProgramService.getAllProgramData(inputJson)
                    .then(response => {
                        response.data = decompressJson(response.data);
                        var json = response.data;
                        var updatedJson = [];
                        for (var r = 0; r < json.length; r++) {
                            var planningUnitList = json[r].planningUnitList;
                            var consumptionList = json[r].consumptionList;
                            var inventoryList = json[r].inventoryList;
                            var shipmentList = json[r].shipmentList;
                            var batchInfoList = json[r].batchInfoList;
                            var supplyPlan = json[r].supplyPlan;
                            var generalData = json[r];
                            delete generalData.consumptionList;
                            delete generalData.inventoryList;
                            delete generalData.shipmentList;
                            delete generalData.batchInfoList;
                            delete generalData.supplyPlan;
                            delete generalData.planningUnitList;
                            generalData.actionList = [];
                            var generalEncryptedData = CryptoJS.AES.encrypt(JSON.stringify(generalData), SECRET_KEY).toString();
                            var planningUnitDataList = [];
                            for (var pu = 0; pu < planningUnitList.length; pu++) {
                                var planningUnitDataJson = {
                                    consumptionList: consumptionList.filter(c => c.planningUnit.id == planningUnitList[pu].id),
                                    inventoryList: inventoryList.filter(c => c.planningUnit.id == planningUnitList[pu].id),
                                    shipmentList: shipmentList.filter(c => c.planningUnit.id == planningUnitList[pu].id),
                                    batchInfoList: batchInfoList.filter(c => c.planningUnitId == planningUnitList[pu].id),
                                    supplyPlan: supplyPlan.filter(c => c.planningUnitId == planningUnitList[pu].id)
                                }
                                var encryptedPlanningUnitDataText = CryptoJS.AES.encrypt(JSON.stringify(planningUnitDataJson), SECRET_KEY).toString();
                                planningUnitDataList.push({ planningUnitId: planningUnitList[pu].id, planningUnitData: encryptedPlanningUnitDataText })
                            }
                            var programDataJson = {
                                generalData: generalEncryptedData,
                                planningUnitDataList: planningUnitDataList
                            };
                            updatedJson.push(programDataJson);
                        }
                        var programAndVersionList = [];
                        for (var r = 0; r < json.length; r++) {
                            var version = json[r].requestedProgramVersion;
                            if (version == -1) {
                                version = json[r].currentVersion.versionId
                            }
                            programAndVersionList.push({ programId: json[r].programId, version: version })
                        }
                        var db1;
                        getDatabase();
                        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                        openRequest.onsuccess = function (e) {
                            db1 = e.target.result;
                            var transaction = db1.transaction(['programQPLDetails'], 'readwrite');
                            var program = transaction.objectStore('programQPLDetails');
                            var getRequest = program.getAll();
                            getRequest.onerror = function (event) {
                            };
                            getRequest.onsuccess = function (event) {
                                var myResult = [];
                                myResult = getRequest.result;
                                var programAndVersionListLocal = [];
                                for (var i = 0; i < myResult.length; i++) {
                                    var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                    var userId = userBytes.toString(CryptoJS.enc.Utf8);
                                    if (myResult[i].userId == userId) {
                                        programAndVersionListLocal.push({ programId: myResult[i].programId, version: myResult[i].version })
                                    }
                                }
                                var isExists = 0;
                                var downloadProgram = false;
                                for (var r = 0; r < programAndVersionList.length; r++) {
                                    var filterList = programAndVersionListLocal.filter(c => c.programId == programAndVersionList[r].programId && c.version == programAndVersionList[r].version);
                                    if (filterList.length > 0) {
                                        isExists += 1;
                                    }
                                }
                                if (isExists > 0) {
                                    confirmAlert({
                                        title: i18n.t('static.program.confirm'),
                                        message: i18n.t('static.program.programwithsameversion'),
                                        buttons: [
                                            {
                                                label: i18n.t('static.program.yes'),
                                                onClick: () => {
                                                    var transactionForSavingData = db1.transaction(['programData'], 'readwrite');
                                                    var programSaveData = transactionForSavingData.objectStore('programData');
                                                    for (var r = 0; r < json.length; r++) {
                                                        json[r].actionList = [];
                                                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                                        var userId = userBytes.toString(CryptoJS.enc.Utf8);
                                                        var version = json[r].requestedProgramVersion;
                                                        if (version == -1) {
                                                            version = json[r].currentVersion.versionId
                                                        }
                                                        var item = {
                                                            id: json[r].programId + "_v" + version + "_uId_" + userId,
                                                            programId: json[r].programId,
                                                            version: version,
                                                            programName: (CryptoJS.AES.encrypt(JSON.stringify((json[r].label)), SECRET_KEY)).toString(),
                                                            programData: updatedJson[r],
                                                            userId: userId,
                                                            programCode: json[r].programCode,
                                                        };
                                                        programSaveData.put(item);
                                                    }
                                                    transactionForSavingData.oncomplete = function (event) {
                                                        var transactionForSavingDownloadedProgramData = db1.transaction(['downloadedProgramData'], 'readwrite');
                                                        var downloadedProgramSaveData = transactionForSavingDownloadedProgramData.objectStore('downloadedProgramData');
                                                        for (var r = 0; r < json.length; r++) {
                                                            var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                                            var userId = userBytes.toString(CryptoJS.enc.Utf8);
                                                            var version = json[r].requestedProgramVersion;
                                                            if (version == -1) {
                                                                version = json[r].currentVersion.versionId
                                                            }
                                                            var item = {
                                                                id: json[r].programId + "_v" + version + "_uId_" + userId,
                                                                programId: json[r].programId,
                                                                version: version,
                                                                programName: (CryptoJS.AES.encrypt(JSON.stringify((json[r].label)), SECRET_KEY)).toString(),
                                                                programData: updatedJson[r],
                                                                userId: userId
                                                            };
                                                            downloadedProgramSaveData.put(item);
                                                        }
                                                        transactionForSavingDownloadedProgramData.oncomplete = function (event) {
                                                            var programQPLDetailsTransaction = db1.transaction(['programQPLDetails'], 'readwrite');
                                                            var programQPLDetailsOs = programQPLDetailsTransaction.objectStore('programQPLDetails');
                                                            var programIds = []
                                                            for (var r = 0; r < json.length; r++) {
                                                                var programQPLDetailsJson = {
                                                                    id: json[r].programId + "_v" + json[r].currentVersion.versionId + "_uId_" + userId,
                                                                    programId: json[r].programId,
                                                                    version: json[r].currentVersion.versionId,
                                                                    userId: userId,
                                                                    programCode: json[r].programCode,
                                                                    openCount: 0,
                                                                    addressedCount: 0,
                                                                    programModified: 0,
                                                                    readonly: 0
                                                                };
                                                                programIds.push(json[r].programId + "_v" + json[r].currentVersion.versionId + "_uId_" + userId);
                                                                programQPLDetailsOs.put(programQPLDetailsJson);
                                                            }
                                                            programQPLDetailsTransaction.oncomplete = function (event) {
                                                                this.setState({
                                                                    message: 'static.program.downloadsuccess',
                                                                    color: 'green',
                                                                    loading: false
                                                                }, () => {
                                                                    hideFirstComponent()
                                                                })
                                                                this.setState({ loading: false })
                                                                this.getPrograms();
                                                                this.getLocalPrograms();
                                                                this.props.history.push({ pathname: `/syncProgram/green/` + i18n.t('static.program.downloadsuccess'), state: { "programIds": programIds } })
                                                            }.bind(this)
                                                        }.bind(this)
                                                    }.bind(this)
                                                }
                                            }, {
                                                label: i18n.t('static.program.no'),
                                                onClick: () => {
                                                    this.setState({
                                                        message: i18n.t('static.program.actioncancelled'), loading: false, color: "red"
                                                    })
                                                    this.setState({ loading: false, color: "red" }, () => {
                                                        hideFirstComponent()
                                                    })
                                                    this.props.history.push(`/program/downloadProgram/` + i18n.t('static.program.actioncancelled'))
                                                }
                                            }
                                        ]
                                    })
                                } else {
                                    downloadProgram = true;
                                }
                                if (downloadProgram) {
                                    var transactionForSavingData = db1.transaction(['programData'], 'readwrite');
                                    var programSaveData = transactionForSavingData.objectStore('programData');
                                    for (var r = 0; r < json.length; r++) {
                                        json[r].actionList = [];
                                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                        var userId = userBytes.toString(CryptoJS.enc.Utf8);
                                        var version = json[r].requestedProgramVersion;
                                        if (version == -1) {
                                            version = json[r].currentVersion.versionId
                                        }
                                        var item = {
                                            id: json[r].programId + "_v" + version + "_uId_" + userId,
                                            programId: json[r].programId,
                                            version: version,
                                            programName: (CryptoJS.AES.encrypt(JSON.stringify((json[r].label)), SECRET_KEY)).toString(),
                                            programData: updatedJson[r],
                                            userId: userId,
                                            programCode: json[r].programCode,
                                        };
                                        programSaveData.put(item);
                                    }
                                    transactionForSavingData.oncomplete = function (event) {
                                        var transactionForSavingDownloadedProgramData = db1.transaction(['downloadedProgramData'], 'readwrite');
                                        var downloadedProgramSaveData = transactionForSavingDownloadedProgramData.objectStore('downloadedProgramData');
                                        for (var r = 0; r < json.length; r++) {
                                            var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                            var userId = userBytes.toString(CryptoJS.enc.Utf8);
                                            var version = json[r].requestedProgramVersion;
                                            if (version == -1) {
                                                version = json[r].currentVersion.versionId
                                            }
                                            var item = {
                                                id: json[r].programId + "_v" + version + "_uId_" + userId,
                                                programId: json[r].programId,
                                                version: version,
                                                programName: (CryptoJS.AES.encrypt(JSON.stringify((json[r].label)), SECRET_KEY)).toString(),
                                                programData: updatedJson[r],
                                                userId: userId
                                            };
                                            downloadedProgramSaveData.put(item);
                                        }
                                        transactionForSavingDownloadedProgramData.oncomplete = function (event) {
                                            var programQPLDetailsTransaction = db1.transaction(['programQPLDetails'], 'readwrite');
                                            var programQPLDetailsOs = programQPLDetailsTransaction.objectStore('programQPLDetails');
                                            var programIds = []
                                            for (var r = 0; r < json.length; r++) {
                                                var programQPLDetailsJson = {
                                                    id: json[r].programId + "_v" + json[r].currentVersion.versionId + "_uId_" + userId,
                                                    programId: json[r].programId,
                                                    version: json[r].currentVersion.versionId,
                                                    userId: userId,
                                                    programCode: json[r].programCode,
                                                    openCount: 0,
                                                    addressedCount: 0,
                                                    programModified: 0,
                                                    readonly: 0
                                                };
                                                programIds.push(json[r].programId + "_v" + json[r].currentVersion.versionId + "_uId_" + userId);
                                                programQPLDetailsOs.put(programQPLDetailsJson);
                                            }
                                            programQPLDetailsTransaction.oncomplete = function (event) {
                                                this.setState({
                                                    message: 'static.program.downloadsuccess',
                                                    color: 'green',
                                                    loading: false
                                                })
                                                hideFirstComponent();
                                                this.setState({ loading: false })
                                                this.getPrograms();
                                                this.getLocalPrograms();
                                                this.props.history.push({ pathname: `/syncProgram/green/` + i18n.t('static.program.downloadsuccess'), state: { "programIds": programIds } })
                                            }.bind(this)
                                        }.bind(this)
                                    }.bind(this)
                                }
                            }.bind(this)
                        }.bind(this)
                    })
                    .catch(
                        error => {
                            if (error.message === "Network Error") {
                                this.setState({
                                    message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                    loading: false,
                                    color: "red"
                                }, () => {
                                    hideFirstComponent()
                                })
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
                                            color: "red"
                                        }, () => {
                                            hideFirstComponent()
                                        })
                                        break;
                                    case 412:
                                        this.setState({
                                            message: error.response.data.messageCode,
                                            loading: false,
                                            color: "red"
                                        }, () => {
                                            hideFirstComponent()
                                        })
                                        break;
                                    default:
                                        this.setState({
                                            message: 'static.unkownError',
                                            loading: false,
                                            color: "red"
                                        }, () => {
                                            hideFirstComponent()
                                        })
                                        break;
                                }
                            }
                        }
                    );
            } else {
                this.setState({ loading: false, color: "red" }, () => {
                    hideFirstComponent()
                })
                alert(i18n.t('static.common.online'))
            }
        }
    }
}
export default Program;