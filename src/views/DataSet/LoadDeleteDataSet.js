import CryptoJS from 'crypto-js';
import moment from "moment";
import React, { Component } from 'react';
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
import { decompressJson, encryptFCData, hideFirstComponent, hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, DATE_FORMAT_CAP, DATE_FORMAT_CAP_WITHOUT_DATE, INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY } from '../../Constants.js';
import DatasetService from "../../api/DatasetService";
import ProgramService from "../../api/ProgramService";
import RealmService from '../../api/RealmService';
import cleanUp from '../../assets/img/cleanUp.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
// Localized entity name
const entityname = i18n.t('static.dashboard.downloadprogram')
/**
 * Component used for downloading the forecast programs on local system
 */
class LoadDeleteDataSet extends Component {
    constructor(props) {
        super(props);
        this.toggletooltip = this.toggletooltip.bind(this);
        this.downloadClicked = this.downloadClicked.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.getTree = this.getTree.bind(this);
        this.state = {
            popoverOpen: false,
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
            programList: []
        };
        this.getPrograms = this.getPrograms.bind(this);
        // this.checkNewerVersions = this.checkNewerVersions.bind(this);
        this.getMoreVersions = this.getMoreVersions.bind(this);
        this.getLocalPrograms = this.getLocalPrograms.bind(this);
        this.programCheckboxChecked = this.programCheckboxChecked.bind(this);
    }
    /**
     * Handles the checkbox state changes for a specific program.
     * Disables or enables checkboxes associated with the given program ID based on the main checkbox state.
     * @param {string} programId - The ID of the program whose checkboxes need to be handled.
     */
    programCheckboxChecked(programId) {
        var checkBoxValue = document.getElementById('checkbox_442557.0');
        var txtpid = document.getElementsByName("versionCheckBox" + programId);
        if (checkBoxValue.checked) {
            for (var i = 0; i < txtpid.length; i++) {
                txtpid[i].disabled = true;
                txtpid[i].checked = false;
            }
        } else {
            for (var i = 0; i < txtpid.length; i++) {
                txtpid[i].disabled = false;
            }
        }
    }
    /**
     * Fetches more versions of a program from the server.
     * @param {string} programId - The ID of the program for which more versions are to be fetched.
     * @param {number} pageNo - The page number of the versions to be fetched.
     */
    getMoreVersions(programId, pageNo) {
        DatasetService.loadMoreDatasetList(programId, pageNo)
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
                        color: "#BA0C2F"
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
                            color: "#BA0C2F"
                        }, () => {
                            hideFirstComponent()
                        })
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
                                    color: "#BA0C2F"
                                }, () => {
                                    hideFirstComponent()
                                })
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false,
                                    color: "#BA0C2F"
                                }, () => {
                                    hideFirstComponent()
                                })
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false,
                                    color: "#BA0C2F"
                                }, () => {
                                    hideFirstComponent()
                                })
                                break;
                        }
                    }
                }
            );
    }
    // /**
    //  * Checks for newer versions of programs.
    //  * @param {Array} programs - An array of programs to check for newer versions.
    //  */
    // checkNewerVersions(programs) {
    //     if (localStorage.getItem("sessionType") === 'Online') {
    //         AuthenticationService.setupAxiosInterceptors()
    //         ProgramService.checkNewerVersions(programs)
    //             .then(response => {
    //                 localStorage.removeItem("sesLatestDataset");
    //                 localStorage.setItem("sesLatestDataset", response.data);
    //             })
    //     }
    // }
    /**
     * Calls getLocalPrograms and getPrograms function and load the realm list on component mount
     */
    componentDidMount() {
        hideSecondComponent()
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
                            message: response.data.messageCode, loading: false, color: "#BA0C2F"
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
                                color: "#BA0C2F"
                            }, () => {
                                hideFirstComponent()
                            })
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
                                        color: "#BA0C2F"
                                    }, () => {
                                        hideFirstComponent()
                                    })
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false,
                                        color: "#BA0C2F"
                                    }, () => {
                                        hideFirstComponent()
                                    })
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false,
                                        color: "#BA0C2F"
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
                color: "#BA0C2F"
            }, () => {
                hideFirstComponent()
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['datasetDetails'], 'readwrite');
            var program = transaction.objectStore('datasetDetails');
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
                            versionId: myResult[i].version,
                            changed: myResult[i].changed
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
            DatasetService.loadDataset()
                .then(response => {
                    if (response.status == 200) {
                        var lang = this.state.lang;
                        this.setState({
                            countryList: (response.data.realmCountryList).sort(function (a, b) {
                                a = getLabelText(a.realmCountry.label, lang).toLowerCase();
                                b = getLabelText(b.realmCountry.label, lang).toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            }),
                            prgList: response.data.programList,
                            loading: false
                        })
                    } else {
                        this.setState({
                            message: response.data.messageCode,
                            loading: false,
                            color: "#BA0C2F"
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
                                color: "#BA0C2F"
                            }, () => {
                                hideFirstComponent()
                            })
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
                                        color: "#BA0C2F"
                                    }, () => {
                                        hideFirstComponent()
                                    })
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false,
                                        color: "#BA0C2F"
                                    }, () => {
                                        hideFirstComponent()
                                    })
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false,
                                        color: "#BA0C2F"
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
                color: "#BA0C2F"
            }, () => {
                hideFirstComponent()
            })
            this.setState({ loading: false });
        }
    }
    /**
     * Toggle tooltips
     */
    toggletooltip() {
        this.setState({
            popoverOpen: !this.state.popoverOpen,
        });
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
                color: '#BA0C2F'
            }, () => {
                hideFirstComponent()
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['datasetDetails'], 'readwrite');
            var program = transaction.objectStore('datasetDetails');
            var getRequest = program.getAll();
            var proList = []
            getRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: '#BA0C2F',
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
                            versionId: myResult[i].version,
                            changed: myResult[i].changed
                        }
                        proList.push(programJson)
                    }
                }
                // this.checkNewerVersions(proList);
            }.bind(this);
        }.bind(this)
    }
    /**
     * Displays a loading indicator while data is being loaded.
     */
    loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>
    /**
     * Renders the load forecast program screen.
     * @returns {JSX.Element} - Load forecast Program screen.
     */
    render() {
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
                <h5 className="green" id="div2">{i18n.t(this.props.match.params.message)}</h5>
                <h5 className={this.state.color} id="div1">{i18n.t(this.state.message, { entityname })}</h5>
                <Row style={{ display: this.state.loading ? "none" : "block" }}>
                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardBody className="pb-lg-2 pt-lg-2">
                                <ul className="legendcommitversion pl-0" style={{ display: 'inline-flex' }}>
                                    <li><span className="redlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.loadProgram.oldVersion')}</span></li>
                                    <li><span className="greenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.loadProgram.latestVersion')} </span></li>
                                    <li><span className=" blacklegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.loadDelDataset.versionNotLoaded')}</span></li>
                                    <li><span><img width="18" title="Clean up" src={cleanUp} className="CleanUpIcon"></img></span> <span className="legendDeleteCleanupText">{i18n.t('static.loadDelDataset.keepLatestVersionDeleteOldVersion')}</span></li>
                                    <li><span className=""><i title="Delete" className="fa fa-trash DeleteIcon"></i></span> <span className="legendDeleteCleanupText">{i18n.t('static.loadDelDataset.deleteVersion')}</span></li>
                                </ul>
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
                                <div className="table-responsive loadProgramHeight" id="treeDiv" style={{ display: "none" }}>
                                    <ul className="tree">
                                        <li>
                                            <input type="checkbox" id="c1" />
                                            <label className="tree_label" htmlFor="c1">{AuthenticationService.getLoggedInUserRealm().label.label_en}</label>
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
                                                                                            <input type="checkbox" name="programCheckBox" value={item2.program.id} id={"checkbox_".concat(item.realmCountry.id).concat(item2.program.id).concat(".0")} onChange={() => this.programCheckboxChecked(item2.program.id)} />
                                                                                            <label className={this.state.programList.filter(c => c.programId == item2.program.id && c.versionId == Math.max.apply(Math, item2.versionList.map(function (o) { return o.versionId; }))).length > 0 ? "greenColor" : this.state.programList.filter(c => c.programId == item2.program.id).length > 0 ? "redColor" : ""} htmlFor={"checkbox_".concat(item.realmCountry.id).concat(item2.program.id).concat(".0")}>{getLabelText(item2.program.label, this.state.lang) + ' - ('}{item2.program.code + ')'}</label>
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
                                                                                                                <label id="Popover1" title={item4.notes} onClick={this.toggletooltip} className={this.state.programList.filter(c => c.programId == item2.program.id && c.versionId == item4.versionId && Math.max.apply(Math, item2.versionList.map(function (o) { return o.versionId; })) == item4.versionId).length > 0 ? "greenColor" : this.state.programList.filter(c => c.programId == item2.program.id && c.versionId == item4.versionId).length > 0 ? "redColor" : ""} htmlFor={"kf-v".concat(item.realmCountry.id).concat(item2.program.id).concat(item4.versionId)}>{i18n.t('static.program.version').concat(" ")}<b>{(item4.versionId)}</b>{(" ").concat(i18n.t('static.program.savedOn')).concat(" ")}<b>{(moment(item4.createdDate).format(DATE_FORMAT_CAP))}</b>{i18n.t('static.loadDelDataset.forForecastPeriod')}<b>{(moment(item4.forecastStartDate).format(DATE_FORMAT_CAP_WITHOUT_DATE))}</b>{" to "}<b>{(moment(item4.forecastStopDate).format(DATE_FORMAT_CAP_WITHOUT_DATE))}</b>{(" ").concat(i18n.t("static.program.savedBy")).concat(" ")}<b>{(item4.createdBy.username)}</b>{(" ").concat(i18n.t("static.program.as")).concat(" ")}<b>{getLabelText(item4.versionType.label)}</b></label>
                                                                                                                {this.state.programList.filter(c => c.programId == item2.program.id && c.versionId == item4.versionId).length > 0 && <i title="Delete" onClick={() => this.deleteLocalVersion(item2.program.id, parseInt(item4.versionId), this.state.programList.filter(c => c.programId == item2.program.id && c.versionId == item4.versionId)[0].changed)} className="ml-1 fa fa-trash DeleteIcontree"></i>}
                                                                                                            </div>
                                                                                                        </span>
                                                                                                    </span>
                                                                                                    </li>
                                                                                                    {count == item3.versionList.length - 1 && item3.maxPages != item3.currentPage && <div className='a_textLink' style={{cursor: 'pointer' }} onClick={() => this.getMoreVersions(item2.program.id, parseInt(item3.versionList.length / 5))}>{i18n.t('static.program.seemoreprogram')}</div>}
                                                                                                </>
                                                                                            ))
                                                                                        ))
                                                                                    }
                                                                                </ul>
                                                                                <div>
                                                                                </div>
                                                                            </li>
                                                                        ))}
                                                            </ul>
                                                        </li>
                                                    ))}
                                            </ul>
                                        </li>
                                    </ul>
                                </div>
                            </CardBody>
                            <CardFooter>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                <Button type="button" size="md" color="success" className="float-right mr-1" onClick={() => this.downloadClicked()}><i className="fa fa-check"></i>{i18n.t('static.common.download')}</Button>
                            </CardFooter>
                        </Card>
                    </Col>
                </Row>
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
    /**
     * Redirects to the application dashboard screen when cancel button is clicked.
     */
    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.loadDelDataset.loadDeleteDatasetSctionCancell'));
    }
    /**
     * Deletes a program from indexedDB based on its ID.
     * @param {string} id - The ID of the program to delete.
     * @param {number} i - The index of the program being deleted.
     * @param {number} length - The total number of programs to delete.
     */
    deleteProgramById(id, i, length) {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['datasetData'], 'readwrite');
            var programTransaction = transaction.objectStore('datasetData');
            var deleteRequest = programTransaction.delete(id);
            deleteRequest.onsuccess = function (event) {
                var transaction2 = db1.transaction(['datasetDetails'], 'readwrite');
                var programTransaction2 = transaction2.objectStore('datasetDetails');
                var deleteRequest2 = programTransaction2.delete(id);
                deleteRequest2.onsuccess = function (event) {
                    if (i == length - 1) {
                        this.setState({
                            loading: false,
                            message: "Dataset delete succesfully.",
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
                            message: i18n.t('static.actionCancelled'), loading: false, color: "#BA0C2F"
                        })
                        this.setState({ loading: false, color: "#BA0C2F" }, () => {
                            hideFirstComponent()
                        })
                        this.props.history.push(`/dataSet/loadDeleteDataSet`)
                    }
                }
            ]
        })
    }
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
                            var transaction = db1.transaction(['datasetData'], 'readwrite');
                            var programTransaction = transaction.objectStore('datasetData');
                            var deleteRequest = programTransaction.delete(id);
                            deleteRequest.onsuccess = function (event) {
                                var transaction2 = db1.transaction(['datasetDetails'], 'readwrite');
                                var programTransaction2 = transaction2.objectStore('datasetDetails');
                                var deleteRequest2 = programTransaction2.delete(id);
                                deleteRequest2.onsuccess = function (event) {
                                    this.setState({
                                        loading: false,
                                        message: "Dataset delete succesfully.",
                                        color: 'green'
                                    }, () => {
                                        hideFirstComponent()
                                    })
                                    this.getPrograms();
                                    this.getLocalPrograms();
                                }.bind(this)
                            }.bind(this)
                        }.bind(this)
                    }
                }, {
                    label: i18n.t('static.program.no'),
                    onClick: () => {
                        this.setState({
                            message: i18n.t('static.actionCancelled'), loading: false, color: "#BA0C2F"
                        })
                        this.setState({ loading: false, color: "#BA0C2F" }, () => {
                            hideFirstComponent()
                        })
                        this.props.history.push(`/dataSet/loadDeleteDataSet`)
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
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['datasetData'], 'readwrite');
            var program = transaction.objectStore('datasetData');
            var getRequest = program.getAll();
            getRequest.onerror = function (event) {
            }.bind(this);
            getRequest.onsuccess = function (event) {
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                var datasetList = getRequest.result.filter(c => c.userId == userId);
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
                        message: i18n.t('static.loadDelDataset.selectAtleastOneDataset'),
                        loading: false, color: "#BA0C2F"
                    },
                        () => {
                            hideFirstComponent();
                        })
                } else {
                    var continueToLoad = 0;
                    if (localStorage.getItem("sessionType") === 'Online') {
                        var checkboxesCheckedProgram = checkboxesChecked.filter(c => c.versionId == -1);
                        var checkboxesCheckedVersion = checkboxesChecked.filter(c => c.versionId != -1);
                        var versionsThatNeedsToBeDeleted = [];
                        var isExists1 = 0;
                        for (var ccv = 0; ccv < checkboxesChecked.length; ccv++) {
                            var datasetListForProgramExists = datasetList.filter(c => c.programId == checkboxesChecked[ccv].programId);
                            if (datasetListForProgramExists.length > 0) {
                                isExists1 = 1;
                                break;
                            }
                        }
                        if (checkboxesCheckedProgram.length > 0 && isExists1 == 1) {
                            var cf = window.confirm(i18n.t('static.loadDelDataset.allOlderModifiedVersion'))
                            if (cf == true) {
                                for (var cbcp = 0; cbcp < checkboxesCheckedProgram.length; cbcp++) {
                                    var datasetListFiltered = datasetList.filter(c => c.programId == checkboxesCheckedProgram[cbcp].programId);
                                    for (var dlf = 0; dlf < datasetListFiltered.length; dlf++) {
                                        versionsThatNeedsToBeDeleted.push(datasetListFiltered[dlf].id);
                                    }
                                }
                                continueToLoad = 1;
                            } else {
                                continueToLoad = 0;
                            }
                        }
                        else {
                            continueToLoad = 1;
                        }
                        if (checkboxesCheckedVersion.length > 0 && continueToLoad == 1) {
                            var isExists = 0;
                            for (var ccv = 0; ccv < checkboxesCheckedVersion.length; ccv++) {
                                var datasetListForVersionExists = datasetList.filter(c => c.programId == checkboxesCheckedVersion[ccv].programId && c.version == checkboxesCheckedVersion[ccv].versionId);
                                if (datasetListForVersionExists.length > 0) {
                                    isExists = 1;
                                    break;
                                }
                            }
                            if (isExists) {
                                var cf1 = window.confirm(i18n.t('static.loadDelDataset.programWithSameVersion'))
                                if (cf1 == true) {
                                    continueToLoad = 1;
                                } else {
                                    continueToLoad = 0;
                                }
                            }
                        } else {
                        }
                        if (continueToLoad == 1) {
                            DatasetService.getAllDatasetData(checkboxesChecked)
                                .then(response => {
                                    response.data = decompressJson(response.data);
                                    var json = response.data;
                                    var deleteDatasetTransaction = db1.transaction(['datasetData'], 'readwrite');
                                    var deleteDatasetOs = deleteDatasetTransaction.objectStore('datasetData');
                                    for (var i = 0; i < versionsThatNeedsToBeDeleted.length; i++) {
                                        var id = versionsThatNeedsToBeDeleted[i];
                                        deleteDatasetOs.delete(id);
                                    }
                                    deleteDatasetTransaction.oncomplete = function (event) {
                                        var transaction2 = db1.transaction(['datasetDetails'], 'readwrite');
                                        var programTransaction2 = transaction2.objectStore('datasetDetails');
                                        for (var i = 0; i < versionsThatNeedsToBeDeleted.length; i++) {
                                            var id = versionsThatNeedsToBeDeleted[i];
                                            programTransaction2.delete(id);
                                        }
                                        transaction2.oncomplete = function (event) {
                                            var transactionForSavingData = db1.transaction(['datasetData'], 'readwrite');
                                            var programSaveData = transactionForSavingData.objectStore('datasetData');
                                            for (var r = 0; r < json.length; r++) {
                                                json[r].actionList = [];
                                                var encryptedText = encryptFCData(json[r]);
                                                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                                                var version = json[r].currentVersion.versionId;
                                                if (version == -1) {
                                                    version = json[r].currentVersion.versionId
                                                }
                                                var item = {
                                                    id: json[r].programId + "_v" + version + "_uId_" + userId,
                                                    programId: json[r].programId,
                                                    version: version,
                                                    programName: (CryptoJS.AES.encrypt(JSON.stringify((json[r].label)), SECRET_KEY)).toString(),
                                                    programData: encryptedText,
                                                    userId: userId,
                                                    programCode: json[r].programCode,
                                                };
                                                programSaveData.put(item);
                                            }
                                            transactionForSavingData.oncomplete = function (event) {
                                                var programQPLDetailsTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                                                var programQPLDetailsOs = programQPLDetailsTransaction.objectStore('datasetDetails');
                                                var programIds = []
                                                for (var r = 0; r < json.length; r++) {
                                                    var programQPLDetailsJson = {
                                                        id: json[r].programId + "_v" + json[r].currentVersion.versionId + "_uId_" + userId,
                                                        programId: json[r].programId,
                                                        version: json[r].currentVersion.versionId,
                                                        userId: userId,
                                                        programCode: json[r].programCode,
                                                        changed: 0,
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
                                                    this.props.history.push({ pathname: `/syncProgram/green/` + i18n.t('static.loadDelDataset.datasetLoadedSussfully'), state: { "programIds": programIds } })
                                                }.bind(this)
                                            }.bind(this)
                                        }.bind(this)
                                    }.bind(this)
                                }).catch(error => {
                                    this.setState({
                                        loading: false,
                                        message: i18n.t("static.program.errortext"),
                                        color: "red"
                                    }, () => {
                                        hideFirstComponent()
                                    })
                                })
                        } else {
                            this.setState({ loading: false })
                        }
                    } else {
                        this.setState({ loading: false, color: "#BA0C2F" }, () => {
                            hideFirstComponent()
                        })
                        alert(i18n.t('static.common.online'))
                    }
                }
            }.bind(this)
        }.bind(this)
    }
}
export default LoadDeleteDataSet;
