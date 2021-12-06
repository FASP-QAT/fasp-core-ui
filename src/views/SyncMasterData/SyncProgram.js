import React, { Component } from 'react';
import {
    Card, CardBody, CardHeader,
    CardFooter, Button, Col, Progress, FormGroup, Row, Container
} from 'reactstrap';
import '../Forms/ValidationForms/ValidationForms.css';
import 'react-select/dist/react-select.min.css';
import moment from 'moment';
import MasterSyncService from '../../api/MasterSyncService.js';
import AuthenticationService from '../Common/AuthenticationService.js';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import i18n from '../../i18n';
import i18next from 'i18next';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import InnerBgImg from '../../../src/assets/img/bg-image/bg-login.jpg';
import image1 from '../../assets/img/QAT-logo.png';
import { SECRET_KEY, TOTAL_NO_OF_MASTERS_IN_SYNC, INDEXED_DB_VERSION, INDEXED_DB_NAME, SHIPMENT_MODIFIED } from '../../Constants.js'
import CryptoJS from 'crypto-js'
import UserService from '../../api/UserService';
import { qatProblemActions } from '../../CommonComponent/QatProblemActions'
import { calculateSupplyPlan } from '../SupplyPlan/SupplyPlanCalculations';
import QatProblemActions from '../../CommonComponent/QatProblemActions';
import QatProblemActionNew from '../../CommonComponent/QatProblemActionNew'
import GetLatestProgramVersion from '../../CommonComponent/GetLatestProgramVersion'
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
import ProgramService from '../../api/ProgramService';
// import ChangeInLocalProgramVersion from '../../CommonComponent/ChangeInLocalProgramVersion'

export default class SyncProgram extends Component {

    constructor(props) {
        super(props);
        this.state = {
            totalMasters: 0,
            syncedMasters: 0,
            syncedPercentage: 0,
            message: "",
            loading: true,
            programIdsToLoad: []
        }
        this.syncPrograms = this.syncPrograms.bind(this)
    }

    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    componentDidMount() {
        console.log("In sync Program+++");
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                message: i18n.t('static.program.errortext'),
                color: 'red'
            })
            this.hideFirstComponent()
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
                    color: 'red'
                })
                this.hideFirstComponent()
            }.bind(this);
            getRequest.onsuccess = function (event) {
                var myResult = [];
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                myResult = getRequest.result.filter(c => c.userId == userId);
                var programList = myResult;
                // var readonlyProgramList = myResult.filter(c => c.readonly);
                console.log("MyResult+++", myResult);
                this.setState({
                    totalMasters: myResult.length + 1,
                    loading: false,
                    programList: programList
                }, () => {
                    if (programList.length > 0) {
                        this.syncPrograms(programList);
                    } else {
                        this.props.history.push(`/masterDataSync/green/` + i18n.t('static.masterDataSync.success'))
                    }
                })
            }.bind(this)
        }.bind(this)
    }

    syncPrograms(programList) {
        var programIdsToLoad = this.state.programIdsToLoad;
        var pIds = [];
        var uniqueProgramList = []
        for (var i = 0; i < programList.length; i++) {
            var index = uniqueProgramList.findIndex(c => c == programList[i].programId);
            if (index == -1) {
                uniqueProgramList.push(programList[i].programId);
            }
            pIds.push(programList[i].programId);
        }
        // for (var i = 0; i < readonlyProgramList.length; i++) {
        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getLatestVersionsForPrograms(pIds).then(response1 => {
            if (response1.status == 200) {
                var list = response1.data;
                var readonlyProgramToBeDeleted = [];
                console.log("List+++", list);
                for (var i = 0; i < programList.length; i++) {
                    console.log("In i+++", i)
                    var latestVersion = list.filter(c => c.programId == programList[i].programId)[0].versionId;
                    console.log("LatestVersion+++", latestVersion);
                    var checkIfLatestVersionExists = []
                    checkIfLatestVersionExists = programList.filter(c => c.programId == programList[i].programId && c.version == latestVersion);
                    // Means user ke pass latest version nhi hai
                    if (checkIfLatestVersionExists.length == 0) {
                        if (programList[i].readonly) {
                            var index = readonlyProgramToBeDeleted.findIndex(c => c.id == programList[i].id);
                            if (index == -1) {
                                readonlyProgramToBeDeleted.push(programList[i]);
                            }
                            programIdsToLoad.push(programList[i].programId);
                            var syncedMasters = this.state.syncedMasters;
                            this.setState({
                                syncedMasters: syncedMasters + 1,
                                syncedPercentage: Math.floor(((syncedMasters + 1) / this.state.totalMasters) * 100)
                            })
                        } else {
                            if (programList[i].programModified) {
                                var programCode = programList[i].programCode + "~v" + programList[i].version;
                                var cf = window.confirm(i18n.t('static.syncProgram.loadAndDeleteWithUncommittedChanges', { programCode }));
                                if (cf == true) {
                                    var index = readonlyProgramToBeDeleted.findIndex(c => c.id == programList[i].id);
                                    if (index == -1) {
                                        readonlyProgramToBeDeleted.push(programList[i]);
                                    }
                                    programIdsToLoad.push(programList[i].programId);
                                    var syncedMasters = this.state.syncedMasters;
                                    this.setState({
                                        syncedMasters: syncedMasters + 1,
                                        syncedPercentage: Math.floor(((syncedMasters + 1) / this.state.totalMasters) * 100)
                                    })
                                } else {
                                    var syncedMasters = this.state.syncedMasters;
                                    this.setState({
                                        syncedMasters: syncedMasters + 1,
                                        syncedPercentage: Math.floor(((syncedMasters + 1) / this.state.totalMasters) * 100)
                                    })
                                }
                            } else {
                                var programCode = programList[i].programCode + "~v" + programList[i].version;
                                var cf = window.confirm(i18n.t('static.syncProgram.loadAndDeleteWithoutUncommittedChanges', { programCode }));
                                if (cf == true) {
                                    var index = readonlyProgramToBeDeleted.findIndex(c => c.id == programList[i].id);
                                    if (index == -1) {
                                        readonlyProgramToBeDeleted.push(programList[i]);
                                    }
                                    programIdsToLoad.push(programList[i].programId);
                                    var syncedMasters = this.state.syncedMasters;
                                    this.setState({
                                        syncedMasters: syncedMasters + 1,
                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                    })
                                } else {
                                    var syncedMasters = this.state.syncedMasters;
                                    this.setState({
                                        syncedMasters: syncedMasters + 1,
                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                    })
                                }
                            }
                        }
                    } else {
                        // User ka pass latest version hai
                        // Readonly version ki list lao
                        var readonlyProgramList = programList.filter(c => c.programId == programList[i].programId && c.readonly && c.version != latestVersion);
                        // Sare readonly versions ko delete karo
                        for (var j = 0; j < readonlyProgramList.length; j++) {
                            var index = readonlyProgramToBeDeleted.findIndex(c => c.id == readonlyProgramList[j].id);
                            if (index == -1) {
                                readonlyProgramToBeDeleted.push(readonlyProgramList[j]);
                            }
                        }
                        var syncedMasters = this.state.syncedMasters;
                        this.setState({
                            syncedMasters: syncedMasters + 1,
                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                        })
                    }
                }
                console.log("outside for+++");
                if (this.state.syncedMasters == this.state.totalMasters - 1) {
                    this.loadLatestVersion(programIdsToLoad, readonlyProgramToBeDeleted)
                }
            } else {
            }
        }).catch(error => {
            // var syncedMasters = this.state.syncedMasters;
            // this.setState({
            //     syncedMasters: syncedMasters + 1
            // })
        })
    }

    loadLatestVersion(programIds, readonlyProgramToBeDeleted) {
        console.log("In load latest version+++", programIds.length);
        if (programIds.length > 0) {
            console.log("In if===")
            var checkboxesChecked = [];
            for (var i = 0; i < programIds.length; i++) {
                console.log("In for", programIds[i])
                var program = this.state.programList.filter(c => c.programId == programIds[i])[0];
                console.log("Program+++", program)
                checkboxesChecked.push({ programId: program.programId, versionId: -1 })
            }
            console.log("checkbozes checked+++", checkboxesChecked)
            ProgramService.getAllProgramData(checkboxesChecked)
                .then(response => {
                    console.log(")))) After calling get notification api")
                    console.log("Resposne+++", response);
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
                        console.log("Supply plan+++", supplyPlan)
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
                            console.log("Supply plan Filtered+++", supplyPlan.filter(c => c.planningUnitId == planningUnitList[pu].id));
                            var encryptedPlanningUnitDataText = CryptoJS.AES.encrypt(JSON.stringify(planningUnitDataJson), SECRET_KEY).toString();
                            planningUnitDataList.push({ planningUnitId: planningUnitList[pu].id, planningUnitData: encryptedPlanningUnitDataText })
                        }
                        var programDataJson = {
                            generalData: generalEncryptedData,
                            planningUnitDataList: planningUnitDataList
                        };
                        updatedJson.push(programDataJson);
                    }
                    var db1;
                    getDatabase();
                    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                    openRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext'),
                            color: 'red'
                        })
                        this.hideFirstComponent()
                    }.bind(this);
                    openRequest.onsuccess = function (e) {
                        db1 = e.target.result;
                        var transaction = db1.transaction(['programQPLDetails'], 'readwrite');
                        var program = transaction.objectStore('programQPLDetails');
                        var getRequest = program.getAll();
                        getRequest.onerror = function (event) {
                            this.setState({
                                message: i18n.t('static.program.errortext'),
                                color: 'red'
                            })
                            this.hideFirstComponent()
                        }.bind(this);
                        getRequest.onsuccess = function (event) {
                            var myResult = [];
                            myResult = getRequest.result;
                            var userId = AuthenticationService.getLoggedInUserId();
                            console.log("Myresult+++", myResult);

                            var programDataTransaction1 = db1.transaction(['programData'], 'readwrite');
                            var programDataOs1 = programDataTransaction1.objectStore('programData');
                            for (var dpd = 0; dpd < readonlyProgramToBeDeleted.length; dpd++) {
                                var programRequest1 = programDataOs1.delete(readonlyProgramToBeDeleted[dpd].id);
                            }
                            programDataTransaction1.oncomplete = function (event) {
                                var programDataTransaction3 = db1.transaction(['programQPLDetails'], 'readwrite');
                                var programDataOs3 = programDataTransaction3.objectStore('programQPLDetails');

                                for (var dpd = 0; dpd < readonlyProgramToBeDeleted.length; dpd++) {
                                    var programRequest3 = programDataOs3.delete(readonlyProgramToBeDeleted[dpd].id);
                                }
                                programDataTransaction3.oncomplete = function (event) {
                                    var programDataTransaction2 = db1.transaction(['downloadedProgramData'], 'readwrite');
                                    var programDataOs2 = programDataTransaction2.objectStore('downloadedProgramData');

                                    for (var dpd = 0; dpd < readonlyProgramToBeDeleted.length; dpd++) {
                                        var programRequest2 = programDataOs2.delete(readonlyProgramToBeDeleted[dpd].id);
                                    }
                                    programDataTransaction2.oncomplete = function (event) {

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
                                            // programIdsToSyncArray.push(json[r].programId + "_v" + version + "_uId_" + userId)
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
                                                    console.log(")))) Data saved successfully")
                                                    var syncedMasters = this.state.syncedMasters;
                                                    this.setState({
                                                        syncedMasters: syncedMasters + 1,
                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                    })
                                                    this.props.history.push(`/masterDataSync/green/` + i18n.t('static.masterDataSync.success'))
                                                }.bind(this)
                                            }.bind(this)
                                        }.bind(this)
                                    }.bind(this)
                                }.bind(this)
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)

                })
        } else {
            var db1;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: 'red'
                })
                this.hideFirstComponent()
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['programQPLDetails'], 'readwrite');
                var program = transaction.objectStore('programQPLDetails');
                var getRequest = program.getAll();
                getRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext'),
                        color: 'red'
                    })
                    this.hideFirstComponent()
                }.bind(this);
                getRequest.onsuccess = function (event) {
                    var myResult = [];
                    myResult = getRequest.result;
                    var userId = AuthenticationService.getLoggedInUserId();
                    console.log("Myresult+++", myResult);

                    var programDataTransaction1 = db1.transaction(['programData'], 'readwrite');
                    var programDataOs1 = programDataTransaction1.objectStore('programData');
                    for (var dpd = 0; dpd < readonlyProgramToBeDeleted.length; dpd++) {
                        var checkIfProgramExists = myResult.filter(c => c.programId == readonlyProgramToBeDeleted[dpd].programId && c.version == readonlyProgramToBeDeleted[dpd].version && c.readonly == 1 && c.userId == userId);
                        console.log("checkIfProgramExists+++", checkIfProgramExists);
                        var programIdToDelete = 0;
                        if (checkIfProgramExists.length > 0) {
                            programIdToDelete = checkIfProgramExists[0].id;
                        }
                        var programRequest1 = programDataOs1.delete(checkIfProgramExists[0].id);
                    }
                    programDataTransaction1.oncomplete = function (event) {
                        var programDataTransaction3 = db1.transaction(['programQPLDetails'], 'readwrite');
                        var programDataOs3 = programDataTransaction3.objectStore('programQPLDetails');

                        for (var dpd = 0; dpd < readonlyProgramToBeDeleted.length; dpd++) {
                            var checkIfProgramExists = myResult.filter(c => c.programId == readonlyProgramToBeDeleted[dpd].programId && c.version == readonlyProgramToBeDeleted[dpd].version && c.readonly == 1 && c.userId == userId);
                            console.log("checkIfProgramExists+++", checkIfProgramExists);
                            var programIdToDelete = 0;
                            if (checkIfProgramExists.length > 0) {
                                programIdToDelete = checkIfProgramExists[0].id;
                            }
                            var programRequest3 = programDataOs3.delete(checkIfProgramExists[0].id);
                        }
                        programDataTransaction3.oncomplete = function (event) {
                            var programDataTransaction2 = db1.transaction(['downloadedProgramData'], 'readwrite');
                            var programDataOs2 = programDataTransaction2.objectStore('downloadedProgramData');

                            for (var dpd = 0; dpd < readonlyProgramToBeDeleted.length; dpd++) {
                                var checkIfProgramExists = myResult.filter(c => c.programId == readonlyProgramToBeDeleted[dpd].programId && c.version == readonlyProgramToBeDeleted[dpd].version && c.readonly == 1 && c.userId == userId);
                                console.log("checkIfProgramExists+++", checkIfProgramExists);
                                var programIdToDelete = 0;
                                if (checkIfProgramExists.length > 0) {
                                    programIdToDelete = checkIfProgramExists[0].id;
                                }
                                var programRequest2 = programDataOs2.delete(checkIfProgramExists[0].id);
                            }
                            programDataTransaction2.oncomplete = function (event) {
                                this.props.history.push(`/masterDataSync/green/` + i18n.t('static.masterDataSync.success'))
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }
    }

    render() {
        return (
            <div className="animated fadeIn" >
                <h6 className="mt-success" style={{ color: this.props.match.params.color }} id="div1">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="pl-md-5" style={{ color: "red" }} id="div2">{this.state.message != "" && i18n.t('static.masterDataSync.masterDataSyncFailed')}</h5>
                <div className="col-md-12" style={{ display: this.state.loading ? "none" : "block" }}>
                    <Col xs="12" sm="12">
                        <Card>
                            <CardHeader>
                                <strong>{i18n.t('static.program.programSync')}</strong>
                            </CardHeader>
                            <CardBody>
                                <div className="text-center">{this.state.syncedPercentage}% ({i18next.t('static.masterDataSync.synced')} {this.state.syncedMasters} {i18next.t('static.masterDataSync.of')} {this.state.totalMasters} {i18next.t('static.masterDataSync.masters')})</div>
                                <Progress value={this.state.syncedMasters} max={this.state.totalMasters} />
                            </CardBody>

                            {/* <CardFooter id="retryButtonDiv">
                                <FormGroup>
                                    <Button type="button" size="md" color="success" className="float-right mr-1" onClick={() => this.retryClicked()}><i className="fa fa-refresh"></i> {i18n.t('static.common.retry')}</Button>
                                    &nbsp;
                                </FormGroup>
                            </CardFooter> */}
                        </Card>
                    </Col>
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
                {/* </Container>
                </div> */}
            </div>
        )

    }


}