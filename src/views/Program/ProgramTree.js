import React, { Component, lazy, Suspense } from 'react';
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Col,
    Row,
    FormGroup,
    Label,
    InputGroup,
    Input,
    InputGroupAddon
} from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService.js';
import RealmCountryService from "../../api/RealmCountryService"
import HealthAreaService from "../../api/HealthAreaService"
import ProgramService from "../../api/ProgramService"
import getLabelText from '../../CommonComponent/getLabelText'
import CryptoJS from 'crypto-js'
import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME, DATE_FORMAT_CAP } from '../../Constants.js'
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import i18n from '../../i18n';
import { getDatabase } from '../../CommonComponent/IndexedDbFunctions';
import RealmService from '../../api/RealmService';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import moment from "moment";
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions.js';
import cleanUp from '../../assets/img/cleanUp.png';
// import GetLatestProgramVersion from '../../CommonComponent/GetLatestProgramVersion'

const entityname = i18n.t('static.dashboard.downloadprogram')
class Program extends Component {

    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.onRadioBtnClick = this.onRadioBtnClick.bind(this);
        this.downloadClicked = this.downloadClicked.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.getTree = this.getTree.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
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
            programList: []
        };
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.getPrograms = this.getPrograms.bind(this);
        this.checkNewerVersions = this.checkNewerVersions.bind(this);
        this.getMoreVersions = this.getMoreVersions.bind(this);
        this.getLocalPrograms = this.getLocalPrograms.bind(this);
    }
    getMoreVersions(programId, pageNo) {
        // console.log("val---", val);
        // console.log("programId---", programId);
        // console.log("pageNo---", pageNo);
        ProgramService.loadMoreProgramList(programId, pageNo)
            .then(response => {
                if (response.status == 200) {
                    var prgList = this.state.prgList;
                    var index = prgList.findIndex(c => c.program.id == programId);
                    prgList[index].versionList = prgList[index].versionList.concat(response.data.versionList);
                    prgList[index].currentPage = response.data.currentPage;
                    // console.log("Program List more", response.data);
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
                        this.hideFirstComponent()
                    })
                }
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.common.networkError',
                            loading: false,
                            color: "#BA0C2F"
                        }, () => {
                            this.hideFirstComponent()
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
                                    color: "#BA0C2F"
                                }, () => {
                                    this.hideFirstComponent()
                                })
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false,
                                    color: "#BA0C2F"
                                }, () => {
                                    this.hideFirstComponent()
                                })
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false,
                                    color: "#BA0C2F"
                                }, () => {
                                    this.hideFirstComponent()
                                })
                                break;
                        }
                    }
                }
            );
    }
    checkNewerVersions(programs) {
        // console.log("T***going to call check newer versions")
        if (isSiteOnline()) {
            // AuthenticationService.setupAxiosInterceptors()
            ProgramService.checkNewerVersions(programs)
                .then(response => {
                    localStorage.removeItem("sesLatestProgram");
                    localStorage.setItem("sesLatestProgram", response.data);
                })
        }
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }

    hideFirstComponent() {
        document.getElementById('div1').style.display = 'block';
        clearTimeout(this.state.timeout);
        this.state.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 30000);

    }

    componentDidMount() {
        this.getLocalPrograms();
        this.getPrograms();
        if (AuthenticationService.getRealmId() == -1) {
            document.getElementById("realmDiv").style.display = "block"
            // AuthenticationService.setupAxiosInterceptors();
            RealmService.getRealmListAll()
                .then(response => {
                    if (response.status == 200) {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
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
                            this.hideFirstComponent()
                        })
                    }
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.common.networkError',
                                loading: false,
                                color: "#BA0C2F"
                            }, () => {
                                this.hideFirstComponent()
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
                                        color: "#BA0C2F"
                                    }, () => {
                                        this.hideFirstComponent()
                                    })
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false,
                                        color: "#BA0C2F"
                                    }, () => {
                                        this.hideFirstComponent()
                                    })
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false,
                                        color: "#BA0C2F"
                                    }, () => {
                                        this.hideFirstComponent()
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
                this.hideFirstComponent()
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
                    // supplyPlanError: i18n.t('static.program.errortext'),
                    // loading: false,
                    // color: "red"
                })
                // this.hideFirstComponent()
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        // var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        // var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        // var programDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        // var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        // var programJson1 = JSON.parse(programData);
                        var programJson = {
                            programId: myResult[i].programId,
                            versionId: myResult[i].version
                        }
                        proList.push(programJson);
                    }
                }
                console.log("D--------------->ProList", proList);
                this.setState({
                    programList: proList,
                    // loading: false
                })
            }.bind(this)
        }.bind(this)
    }

    getTree() {
        this.setState({ loading: true })
        // console.log(this.state.realmId)
        document.getElementById("treeDiv").style.display = "block";
        // AuthenticationService.setupAxiosInterceptors();
        // console.log("This.state.realmId", this.state.realmId)
        if (this.state.realmId != "" && this.state.realmId > 0) {
            this.setState({
                message: ""
            })
            RealmCountryService.getRealmCountryForProgram(this.state.realmId)
                .then(response => {
                    if (response.status == 200) {
                        // console.log("response.data------------>", response.data)
                        var lang = this.state.lang;
                        this.setState({
                            countryList: (response.data).sort(function (a, b) {
                                a = getLabelText(a.realmCountry.label, lang).toLowerCase();
                                b = getLabelText(b.realmCountry.label, lang).toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            })
                        })
                        // HealthAreaService.getHealthAreaListForProgram(this.state.realmId)
                        //     .then(response => {
                        //         if (response.status == 200) {
                        //             console.log("Response.data", response.data);
                        //             this.setState({
                        //                 healthAreaList: response.data
                        //             })
                        ProgramService.loadProgramList()
                            // getProgramList()
                            .then(response => {
                                if (response.status == 200) {
                                    console.log("Program List", response.data);
                                    this.setState({
                                        prgList: response.data.programList,
                                        loading: false
                                    })
                                } else {
                                    this.setState({
                                        message: response.data.messageCode,
                                        loading: false,
                                        color: "#BA0C2F"
                                    }, () => {
                                        this.hideFirstComponent()
                                    })
                                }
                            }).catch(
                                error => {
                                    if (error.message === "Network Error") {
                                        this.setState({
                                            message: 'static.common.networkError',
                                            loading: false,
                                            color: "#BA0C2F"
                                        }, () => {
                                            this.hideFirstComponent()
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
                                                    color: "#BA0C2F"
                                                }, () => {
                                                    this.hideFirstComponent()
                                                })
                                                break;
                                            case 412:
                                                this.setState({
                                                    message: error.response.data.messageCode,
                                                    loading: false,
                                                    color: "#BA0C2F"
                                                }, () => {
                                                    this.hideFirstComponent()
                                                })
                                                break;
                                            default:
                                                this.setState({
                                                    message: 'static.unkownError',
                                                    loading: false,
                                                    color: "#BA0C2F"
                                                }, () => {
                                                    this.hideFirstComponent()
                                                })
                                                break;
                                        }
                                    }
                                }
                            );
                        //     } else {
                        //         this.setState({
                        //             message: response.data.messageCode,
                        //             loading: false, color: "red"
                        //         })
                        //         this.hideFirstComponent()
                        //     }
                        // }).catch(
                        //     error => {
                        //         if (error.message === "Network Error") {
                        //             this.setState({ message: error.message, loading: false, color: "red" });
                        //             this.hideFirstComponent()
                        //         } else {
                        //             switch (error.response ? error.response.status : "") {
                        //                 case 500:
                        //                 case 401:
                        //                 case 404:
                        //                 case 406:
                        //                 case 412:
                        //                     this.setState({ message: error.response.data.messageCode, color: "red" });
                        //                     this.hideFirstComponent()
                        //                     break;
                        //                 default:
                        //                     this.setState({ message: 'static.unkownError', color: "red" });
                        //                     this.hideFirstComponent()
                        //                     console.log("Error code unkown");
                        //                     break;
                        //             }
                        //             this.setState({ loading: false })
                        //         }
                        //     }
                        // );
                    } else {
                        this.setState({
                            message: response.data.messageCode,
                            loading: false, color: "#BA0C2F"
                        }, () => {
                            this.hideFirstComponent()
                        })
                    }
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.common.networkError',
                                loading: false,
                                color: "#BA0C2F"
                            }, () => {
                                this.hideFirstComponent()
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
                                        color: "#BA0C2F"
                                    }, () => {
                                        this.hideFirstComponent()
                                    })
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false,
                                        color: "#BA0C2F"
                                    }, () => {
                                        this.hideFirstComponent()
                                    })
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false,
                                        color: "#BA0C2F"
                                    }, () => {
                                        this.hideFirstComponent()
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
                this.hideFirstComponent()
            })
            this.setState({ loading: false });
        }
    }

    toggle() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen,
        });
    }

    dataChange(event) {
        if (event.target.name === "realmId") {
            this.state.realmId = event.target.value;
        }
        this.getTree();
    };

    onRadioBtnClick(radioSelected) {
        this.setState({
            radioSelected: radioSelected,
        });
    }

    getPrograms() {
        // console.log("T***get programs called");
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                message: i18n.t('static.program.errortext'),
                color: '#BA0C2F'
            }, () => {
                this.hideFirstComponent()
            })
            // if (this.props.updateState != undefined) {
            //     this.props.updateState(false);
            // }
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
                    color: '#BA0C2F',
                    loading: false
                }, () => {
                    this.hideFirstComponent()
                })
                // if (this.props.updateState != undefined) {
                //     this.props.updateState(false);
                // }
            }.bind(this);
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        // var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        // var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        // var programDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        // var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        // var programJson1 = JSON.parse(programData);
                        // console.log("programData---", programData);
                        var programJson = {
                            programId: myResult[i].programId,
                            versionId: myResult[i].version
                        }
                        proList.push(programJson)
                    }
                }
                // this.setState({
                //     programs: proList
                // })
                this.checkNewerVersions(proList);
                // if (this.props.updateState != undefined) {
                //     this.props.updateState(false);
                //     this.props.fetchData();
                // }
            }.bind(this);
        }.bind(this)

    }

    loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>

    deleteLocalVersion(programId, versionId, changed) {
        console.log(">>>", changed);
        confirmAlert({
            title: i18n.t('static.program.confirmsubmit'),
            message: changed == 1 ? "Changes are not saved still do you want to delete this version." : "Delete this version",
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
                                            this.hideFirstComponent()
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
                            this.hideFirstComponent()
                        })
                        this.props.history.push(`/program/downloadProgram`)
                    }
                }
            ]
        })

    }

    render() {
        console.log("++++", this.state.prgList);
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
                {/* <GetLatestProgramVersion ref="programListChild"></GetLatestProgramVersion> */}
                {/* <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5> */}
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 >{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className={this.state.color} id="div1">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                        <Card>
                            {/* <CardHeader>
                                <strong>{i18n.t('static.program.download')}</strong>
                            </CardHeader> */}
                            <CardBody className="pb-lg-2 pt-lg-2">
                                <ul className="legendcommitversion pl-0" style={{ display: 'inline-flex' }}>
                                    <li><span className="redlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.loadProgram.oldVersion')}</span></li>
                                    <li><span className="greenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.loadProgram.latestVersion')} </span></li>
                                    <li><span className=" blacklegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.loadProgram.notDownloaded')} </span></li>
                                    <li><span className=""><i title="Delete" className="fa fa-trash DeleteIcon"></i></span> <span className="legendDeleteCleanupText">Delete the version</span></li>
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
                                                {/* <InputGroupAddon addonType="append">
                                                    <Button color="secondary Gobtn btn-sm" onClick={this.getTree}>{i18n.t('static.common.go')}</Button>
                                                </InputGroupAddon> */}
                                            </InputGroup>
                                        </div>
                                    </FormGroup>
                                </Col>
                                {/* </CardBody>
                        </Card>
                    </Col>
                </Row>
                <Row id="treeDiv" style={{ display: "none" }}>
                    <Col sm={12} md={10} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardBody> */}
                                <div style={{ display: this.state.loading ? "none" : "block" }}>
                                    <div className="table-responsive" id="treeDiv" style={{ display: "none" }}>
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
                                                                {/* <ul>
                                                                    {
                                                                        item.healthAreaList.sort(function (a, b) {
                                                                            a = getLabelText(a.label, this.state.lang).toLowerCase();
                                                                            b = getLabelText(b.label, this.state.lang).toLowerCase();
                                                                            return a < b ? -1 : a > b ? 1 : 0;
                                                                        }.bind(this)).map(item1 => (
                                                                            <li>
                                                                                <input type="checkbox" id={"c1-".concat(item.realmCountry.id).concat(item1.id)} />
                                                                                <label htmlFor={"c1-".concat(item.realmCountry.id).concat(item1.id)} className="tree_label">{getLabelText(item1.label, this.state.lang)}</label> */}
                                                                <ul>
                                                                    {
                                                                        this.state.prgList.filter(c => c.realmCountry.id == item.realmCountry.id).sort(function (a, b) {
                                                                            a = getLabelText(a.program.label, this.state.lang).toLowerCase();
                                                                            b = getLabelText(b.program.label, this.state.lang).toLowerCase();
                                                                            return a < b ? -1 : a > b ? 1 : 0;
                                                                        }.bind(this))
                                                                            .map(item2 => (

                                                                                <li>
                                                                                    {/* {item2} */}
                                                                                    <span className="tree_label">
                                                                                        <span className="">
                                                                                            <div className="checkbox m-0">
                                                                                                <input type="checkbox" name="programCheckBox" value={item2.program.id} id={"checkbox_".concat(item.realmCountry.id).concat(item2.program.id).concat(".0")} />
                                                                                                {console.log("D------------>this.state.programList", this.state.programList, "Condition------->", this.state.programList.filter(c => c.programId == item2.program.id && c.versionId == Math.max.apply(Math, item2.versionList.map(function (o) { return o.versionId; }))).length)}
                                                                                                {/* <label className={this.state.programList.filter(c => c.programId == item2.program.id && c.versionId == Math.max.apply(Math, item2.versionList.map(function (o) { return o.versionId; }))).length > 0 ? "greenColor" : this.state.programList.filter(c => c.programId == item2.program.id).length > 0 ? "redColor" : ""} htmlFor={"checkbox_".concat(item.realmCountry.id).concat(item2.program.id).concat(".0")}>{getLabelText(item2.program.label, this.state.lang)}<i className="ml-1 fa fa-eye"></i></label> */}
                                                                                                {/* <label className={this.state.programList.filter(c => c.programId == item2.program.id && c.versionId == Math.max.apply(Math, item2.versionList.map(function (o) { return o.versionId; }))).length > 0 ? "greenColor" : this.state.programList.filter(c => c.programId == item2.program.id).length > 0 ? "redColor" : ""} htmlFor={"checkbox_".concat(item.realmCountry.id).concat(item2.program.id).concat(".0")}>{getLabelText(item2.program.label, this.state.lang) + ' - (' + item2.program.code +')'}<i className="ml-1 fa fa-eye"></i></label> */}
                                                                                                <label className={this.state.programList.filter(c => c.programId == item2.program.id && c.versionId == Math.max.apply(Math, item2.versionList.map(function (o) { return o.versionId; }))).length > 0 ? "greenColor" : this.state.programList.filter(c => c.programId == item2.program.id).length > 0 ? "redColor" : ""} htmlFor={"checkbox_".concat(item.realmCountry.id).concat(item2.program.id).concat(".0")}>{getLabelText(item2.program.label, this.state.lang) + ' - (' + item2.program.code + ')'}</label>
                                                                                            </div>
                                                                                        </span>
                                                                                    </span>
                                                                                    {/* {console.log("Item1------------>", item1), console.log("Item1------------>", item.realmCountry.id, "---------", "fpm".concat(item.realmCountry.id).concat(item1.id))} */}
                                                                                    <input type="checkbox" defaultChecked id={"fpm".concat(item.realmCountry.id).concat(item2.program.id)} />
                                                                                    <label className="arrow_label" htmlFor={"fpm".concat(item.realmCountry.id).concat(item2.program.id)}></label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                                                    {this.state.programList.filter(c => c.programId == item2.program.id).length > 1 ? <i title="Clean Up" className="" onClick={() => this.deleteCleanUpIcon(item2.program.id)}><img src={cleanUp} className="DeleteIcontree CleanUpSize"/></i> : ""}
                                                                                    <ul>
                                                                                        {
                                                                                            this.state.prgList.filter(c => c.program.id == item2.program.id).map(item3 => (
                                                                                                (item3.versionList).map((item4, count) => (
                                                                                                    <>
                                                                                                        <li><span className="tree_label">
                                                                                                            <span className="">
                                                                                                                <div className="checkbox m-0">
                                                                                                                    <input type="checkbox" data-program-id={item2.program.id} value={item4.versionId} className="versionCheckBox" name={"versionCheckBox".concat(item2.program.id)} id={"kf-v".concat(item.realmCountry.id).concat(item2.program.id).concat(item4.versionId)} />
                                                                                                                    <label className={this.state.programList.filter(c => c.programId == item2.program.id && c.versionId == item4.versionId && Math.max.apply(Math, item2.versionList.map(function (o) { return o.versionId; })) == item4.versionId).length > 0 ? "greenColor" : this.state.programList.filter(c => c.programId == item2.program.id && c.versionId == item4.versionId).length > 0 ? "redColor" : ""}
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
                                                                                    {/* <ul>

                                                                                                {
                                                                                                    this.state.prgList.filter(c => c.programId == item2.programId).map(item3 => (
                                                                                                        (item3.versionList).map(item4 => (
                                                                                                            <label onClick={this.getMoreVersions(item2.programId, 1)}><a>See More</a></label>
                                                                                                        ))
                                                                                                    ))}
                                                                                            </ul> */}
                                                                                </li>

                                                                            ))}
                                                                </ul>
                                                            </li>

                                                        ))}
                                                    {/* </ul>
                                                            </li>
                                                        ))} */}
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
                    </Col>
                </Row>


            </div>
        );
    }

    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
    }


    deleteProgramById(id, i, length) {
        console.log("deleteC---------->4 ", id);
        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        // var id = programId + "_v" + versionId + "_uId_" + userId;
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
                                this.hideFirstComponent()
                            })
                            this.getPrograms();
                            this.getLocalPrograms();
                        }

                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }.bind(this)











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
                var transaction1 = db1.transaction(['downloadedDatasetData'], 'readwrite');
                var programTransaction1 = transaction1.objectStore('downloadedDatasetData');
                var deleteRequest1 = programTransaction1.delete(id);
                deleteRequest1.onsuccess = function (event) {
                    var transaction2 = db1.transaction(['datasetDetails'], 'readwrite');
                    var programTransaction2 = transaction2.objectStore('datasetDetails');
                    var deleteRequest2 = programTransaction2.delete(id);
                    deleteRequest2.onsuccess = function (event) {
                        // alert("Delete successfully");
                        if (i == length - 1) {
                            this.setState({
                                loading: false,
                                message: "Dataset delete succesfully.",
                                color: 'green'
                            }, () => {
                                this.hideFirstComponent()
                            })
                            this.getPrograms();
                            this.getLocalPrograms();
                        }


                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }

    deleteCleanUpIcon(programId) {

        console.log("deleteC---------->1 ", this.state.prgList.filter(c => c.program.id == programId));
        console.log("deleteC---------->2 ", this.state.programList.filter(c => c.programId == programId));

        let versionListForSelectedProgram = this.state.prgList.filter(c => c.program.id == programId)[0].versionList;

        let versionListRemoveMaxVersionId = versionListForSelectedProgram.filter(c => c.versionId != Math.max.apply(Math, versionListForSelectedProgram.map(a => a.versionId)));

        console.log("deleteC---------->3 ", versionListRemoveMaxVersionId);

        confirmAlert({
            title: i18n.t('static.program.confirmsubmit'),
            // message: changed == 1 ? "Changes are not saved still do you want to delete this version." : "Delete this version",
            message: "Do you want to clean up this program?",
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
                            //------------------------------------------------
                            var id = programId + "_v" + (versionListRemoveMaxVersionId[i].versionId).toString().replace(/^0+/, '') + "_uId_" + userId;
                            this.deleteProgramById(id, i, versionListRemoveMaxVersionId.length);
                            //--------------------------
                        }

                        // this.setState({
                        //     loading: false,
                        //     message: "Dataset delete succesfully.",
                        //     color: 'green'
                        // }, () => {
                        //     this.hideFirstComponent()
                        // })
                        // this.getPrograms();
                        // this.getLocalPrograms();


                    }
                }, {
                    label: i18n.t('static.program.no'),
                    onClick: () => {
                        this.setState({
                            message: i18n.t('static.actionCancelled'), loading: false, color: "#BA0C2F"
                        })
                        this.setState({ loading: false, color: "#BA0C2F" }, () => {
                            this.hideFirstComponent()
                        })
                        this.props.history.push(`/dataSet/loadDeleteDataSet`)
                    }
                }
            ]
        })
    }

    downloadClicked() {
        this.setState({ loading: true })
        var programCheckboxes = document.getElementsByName("programCheckBox");
        var versionCheckBox = document.getElementsByClassName("versionCheckBox");
        var checkboxesChecked = [];
        var programCheckedCount = 0;
        var programInvalidCheckedCount = 0;
        var count = 0;

        // console.log("versionCheckBox-------------", versionCheckBox);
        for (var i = 0; i < versionCheckBox.length; i++) {
            if (versionCheckBox[i].checked) {
                programCheckedCount = programCheckedCount + 1;
                // console.log("parent program--------", versionCheckBox[i].dataset.programId);
                count = count + 1;
                var json = {
                    programId: versionCheckBox[i].dataset.programId,
                    versionId: versionCheckBox[i].value
                }
                checkboxesChecked = checkboxesChecked.concat([json]);
            }
        }
        // console.log("checkboxesChecked--------", checkboxesChecked);
        // loop over them all
        // console.log("programCheckboxes.length---", programCheckboxes.length)
        for (var i = 0; i < programCheckboxes.length; i++) {
            // And stick the checked ones onto an array...
            if (programCheckboxes[i].checked) {
                // console.log("program checked")
                programCheckedCount = programCheckedCount + 1;
                var versionCheckboxes = document.getElementsByName("versionCheckBox".concat(programCheckboxes[i].value));
                // loop over them all
                if (versionCheckboxes.length > 0) {
                    var count1 = 0;
                    // console.log("versionCheckboxes length > 0")
                    for (var j = 0; j < versionCheckboxes.length; j++) {
                        // And stick the checked ones onto an array...
                        // console.log("inside for loop")
                        if (versionCheckboxes[j].checked) {
                            // console.log("versionCheckboxes[j].checked---")
                            count = count + 1;
                            count1 = count1 + 1;
                            // console.log("count ---", count)
                            var json = {
                                programId: programCheckboxes[i].value,
                                versionId: versionCheckboxes[j].value
                            }
                            // checkboxesChecked = checkboxesChecked.concat([json]);
                            // console.log("checkboxesChecked inside loop---", checkboxesChecked);
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
                // loop over them all
                if (versionCheckboxes.length > 0) {
                    // var count = 0;
                    for (var j = 0; j < versionCheckboxes.length; j++) {
                        // And stick the checked ones onto an array...
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
                loading: false, color: "#BA0C2F"
            },
                () => {
                    this.hideFirstComponent();
                })
            // this.props.history.push(`/program/downloadProgram/` + i18n.t('static.program.errorSelectAtleastOneProgram'))
        }
        // else if (programInvalidCheckedCount > 0) {
        //     this.setState({ loading: false })
        //     this.props.history.push(`/program/downloadProgram/` + i18n.t('static.program.errorSelectProgramIfYouSelectVersion'))
        // }
        else {
            console.log("Checl boxes checked array", checkboxesChecked)
            var programThenCount = 0;
            // for (var i = 0; i < checkboxesChecked.length; i++) {
            // var version = (checkboxesChecked[i]).versionId;
            if (isSiteOnline()) {
                // AuthenticationService.setupAxiosInterceptors();
                ProgramService.getAllProgramData(checkboxesChecked)
                    .then(response => {
                        // console.log("ProgramThenCount", programThenCount)
                        // console.log("Response data", response.data)
                        var json = response.data;
                        var updatedJson = [];
                        for (var r = 0; r < json.length; r++) {
                            var planningUnitList = json[r].planningUnitList;
                            var consumptionList = json[r].consumptionList;
                            var inventoryList = json[r].inventoryList;
                            var shipmentList = json[r].shipmentList;
                            var batchInfoList = json[r].batchInfoList;
                            var problemReportList = json[r].problemReportList;
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
                                // console.log("json[r].consumptionList.filter(c => c.planningUnit.id == planningUnitList[pu].id)+++",programDataJson);
                                // console.log("json[r].consumptionList.filter(c => c.planningUnit.id == planningUnitList[pu].id)+++",programDataJson.consumptionList);
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
                        // console.log("Json-------->", json);
                        // console("version befor -1 check",version)

                        // console.log("Version", version)
                        var db1;
                        getDatabase();
                        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                        openRequest.onsuccess = function (e) {
                            db1 = e.target.result;
                            var transaction = db1.transaction(['programQPLDetails'], 'readwrite');
                            var program = transaction.objectStore('programQPLDetails');
                            var count = 0;
                            var getRequest = program.getAll();
                            getRequest.onerror = function (event) {
                                // Handle errors!
                            };
                            getRequest.onsuccess = function (event) {
                                var myResult = [];
                                myResult = getRequest.result;
                                console.log("myResult---", myResult)
                                var programAndVersionListLocal = [];
                                for (var i = 0; i < myResult.length; i++) {
                                    // for (var j = 0; j < json.length; j++) {
                                    var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                    var userId = userBytes.toString(CryptoJS.enc.Utf8);
                                    if (myResult[i].userId == userId) {
                                        programAndVersionListLocal.push({ programId: myResult[i].programId, version: myResult[i].version })
                                    }
                                }
                                var isExists = 0;
                                var downloadProgram = false;
                                console.log("D------------------>", programAndVersionListLocal);
                                console.log("D------------------>", programAndVersionList);
                                for (var r = 0; r < programAndVersionList.length; r++) {
                                    var filterList = programAndVersionListLocal.filter(c => c.programId == programAndVersionList[r].programId && c.version == programAndVersionList[r].version);
                                    console.log("D---------------->filterList", filterList)
                                    if (filterList.length > 0) {
                                        isExists += 1;
                                    }

                                }
                                if (isExists > 0) {
                                    confirmAlert({
                                        title: i18n.t('static.program.confirmsubmit'),
                                        message: i18n.t('static.program.programwithsameversion'),
                                        buttons: [
                                            {
                                                label: i18n.t('static.program.yes'),
                                                onClick: () => {
                                                    console.log("D-------------------->Yes clicked");
                                                    console.log("D--------------> in download program")
                                                    var transactionForSavingData = db1.transaction(['programData'], 'readwrite');
                                                    var programSaveData = transactionForSavingData.objectStore('programData');
                                                    for (var r = 0; r < json.length; r++) {
                                                        json[r].actionList = [];
                                                        // json[r].openCount = 0;
                                                        // json[r].addressedCount = 0;
                                                        // json[r].programCode = json[r].programCode;
                                                        // var encryptedText = CryptoJS.AES.encrypt(JSON.stringify(json[r]), SECRET_KEY);
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
                                                            // openCount: 0,
                                                            // addressedCount: 0
                                                        };
                                                        // console.log("Item------------>", item);
                                                        var putRequest = programSaveData.put(item);

                                                    }
                                                    transactionForSavingData.oncomplete = function (event) {
                                                        var transactionForSavingDownloadedProgramData = db1.transaction(['downloadedProgramData'], 'readwrite');
                                                        var downloadedProgramSaveData = transactionForSavingDownloadedProgramData.objectStore('downloadedProgramData');
                                                        for (var r = 0; r < json.length; r++) {
                                                            // var encryptedText = CryptoJS.AES.encrypt(JSON.stringify(json[r]), SECRET_KEY);
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
                                                            // console.log("Item------------>", item);
                                                            var putRequest = downloadedProgramSaveData.put(item);

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
                                                                var programQPLDetailsRequest = programQPLDetailsOs.put(programQPLDetailsJson);
                                                            }
                                                            programQPLDetailsTransaction.oncomplete = function (event) {
                                                                this.setState({
                                                                    message: 'static.program.downloadsuccess',
                                                                    color: 'green',
                                                                    loading: false
                                                                }, () => {
                                                                    this.hideFirstComponent()
                                                                })
                                                                // this.props.history.push(`/dashboard/`+'green/' + i18n.t('static.program.downloadsuccess'))
                                                                this.setState({ loading: false })
                                                                // this.refs.programListChild.checkNewerVersions();
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
                                                        message: i18n.t('static.program.actioncancelled'), loading: false, color: "#BA0C2F"
                                                    })
                                                    this.setState({ loading: false, color: "#BA0C2F" }, () => {
                                                        this.hideFirstComponent()
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
                                    console.log("D--------------> in download program")
                                    var transactionForSavingData = db1.transaction(['programData'], 'readwrite');
                                    var programSaveData = transactionForSavingData.objectStore('programData');
                                    for (var r = 0; r < json.length; r++) {
                                        json[r].actionList = [];
                                        // json[r].openCount = 0;
                                        // json[r].addressedCount = 0;
                                        // json[r].programCode = json[r].programCode;
                                        // var encryptedText = CryptoJS.AES.encrypt(JSON.stringify(json[r]), SECRET_KEY);
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
                                            // openCount: 0,
                                            // addressedCount: 0
                                        };
                                        // console.log("Item------------>", item);
                                        var putRequest = programSaveData.put(item);

                                    }
                                    transactionForSavingData.oncomplete = function (event) {
                                        var transactionForSavingDownloadedProgramData = db1.transaction(['downloadedProgramData'], 'readwrite');
                                        var downloadedProgramSaveData = transactionForSavingDownloadedProgramData.objectStore('downloadedProgramData');
                                        for (var r = 0; r < json.length; r++) {
                                            // var encryptedText = CryptoJS.AES.encrypt(JSON.stringify(json[r]), SECRET_KEY);
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
                                            // console.log("Item------------>", item);
                                            var putRequest = downloadedProgramSaveData.put(item);

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
                                                var programQPLDetailsRequest = programQPLDetailsOs.put(programQPLDetailsJson);
                                            }
                                            programQPLDetailsTransaction.oncomplete = function (event) {
                                                this.setState({
                                                    message: 'static.program.downloadsuccess',
                                                    color: 'green',
                                                    loading: false
                                                })
                                                this.hideFirstComponent();
                                                // this.props.history.push(`/dashboard/`+'green/' + i18n.t('static.program.downloadsuccess'))
                                                this.setState({ loading: false })
                                                // this.refs.programListChild.checkNewerVersions();
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
                                    message: 'static.common.networkError',
                                    loading: false,
                                    color: "#BA0C2F"
                                }, () => {
                                    this.hideFirstComponent()
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
                                            color: "#BA0C2F"
                                        }, () => {
                                            this.hideFirstComponent()
                                        })
                                        break;
                                    case 412:
                                        this.setState({
                                            message: error.response.data.messageCode,
                                            loading: false,
                                            color: "#BA0C2F"
                                        }, () => {
                                            this.hideFirstComponent()
                                        })
                                        break;
                                    default:
                                        this.setState({
                                            message: 'static.unkownError',
                                            loading: false,
                                            color: "#BA0C2F"
                                        }, () => {
                                            this.hideFirstComponent()
                                        })
                                        break;
                                }
                            }
                        }
                    );

            } else {
                this.setState({ loading: false, color: "#BA0C2F" }, () => {
                    this.hideFirstComponent()
                })
                alert(i18n.t('static.common.online'))
            }
            // }

        }

    }
}

export default Program;