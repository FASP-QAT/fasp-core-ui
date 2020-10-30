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
import { SECRET_KEY, TOTAL_NO_OF_MASTERS_IN_SYNC, INDEXED_DB_VERSION, INDEXED_DB_NAME } from '../../Constants.js'
import CryptoJS from 'crypto-js'
import UserService from '../../api/UserService';
import { qatProblemActions } from '../../CommonComponent/QatProblemActions'
import { calculateSupplyPlan } from '../SupplyPlan/SupplyPlanCalculations';
import QatProblemActions from '../../CommonComponent/QatProblemActions'
import GetLatestProgramVersion from '../../CommonComponent/GetLatestProgramVersion'
// import ChangeInLocalProgramVersion from '../../CommonComponent/ChangeInLocalProgramVersion'

export default class SyncMasterData extends Component {

    constructor(props) {
        super(props);
        this.state = {
            totalMasters: TOTAL_NO_OF_MASTERS_IN_SYNC,
            syncedMasters: 0,
            syncedPercentage: 0,
            message: "",
            loading: true
        }
        this.syncMasters = this.syncMasters.bind(this);
        this.retryClicked = this.retryClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.syncProgramData = this.syncProgramData.bind(this);
    }
    hideSecondComponent() {
        // setTimeout(function () {
        //     document.getElementById('div2').style.display = 'none';
        // }, 8000);
    }

    componentDidMount() {
        console.log("Start date", Date.now());
        AuthenticationService.setupAxiosInterceptors();
        document.getElementById("retryButtonDiv").style.display = "none";
        let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
        console.log("decryptedCurUser sync data---", decryptedCurUser)
        UserService.getUserByUserId(decryptedCurUser).then(response => {
            console.log("user----------------------", response.data);
            localStorage.setItem('user-' + decryptedCurUser, CryptoJS.AES.encrypt(JSON.stringify(response.data).toString(), `${SECRET_KEY}`));
            // this.syncMasters();
            setTimeout(function () { //Start the timer
                // this.setState({render: true}) //After 1 second, set render to true
                this.syncMasters();
            }.bind(this), 500)

        })


        // confirmAlert({
        //     // title: i18n.t('static.masterDataSync.masterDataSync'),
        //     message: i18n.t('static.masterDataSync.confirmSyncMessage'),
        //     buttons: [
        //         {
        //             label: i18n.t('static.program.yes'),
        //             onClick: () => {
        // this.syncMasters();
        //             }
        //         },
        //         {
        //             label: i18n.t('static.program.no'),
        //             onClick: () => {
        //                 document.getElementById("retryButtonDiv").style.display = "block";
        //                 this.setState({
        //                     message: i18n.t('static.actionCancelled')
        //                 })
        //             }
        //         }
        //     ]
        // });
    }
    // checkClick=(e,programDataLastModifiedDate,downloadedProgramDataLastModifiedDate)=>{
    //     // e.preventDefault();
    //      console.log("this.state.programDataLastModifiedDate---", programDataLastModifiedDate);
    //      console.log("downloadedProgramDataLastModifiedDate  ", downloadedProgramDataLastModifiedDate);
    //      console.log("result local version---", moment(programDataLastModifiedDate).format("YYYY-MM-DD HH:mm:ss") > moment(downloadedProgramDataLastModifiedDate).format("YYYY-MM-DD HH:mm:ss"))
    //      localStorage.removeItem("sesLocalVersionChange");
    //      if (moment(programDataLastModifiedDate).format("YYYY-MM-DD HH:mm:ss") > moment(downloadedProgramDataLastModifiedDate).format("YYYY-MM-DD HH:mm:ss")) {
    //          console.log("hurrey local version changed-------------------------------------------------------------");
    //          localStorage.setItem("sesLocalVersionChange", true);
    //      } else {
    //          localStorage.setItem("sesLocalVersionChange", false);
    //      }
    //  }
    render() {
        return (
            <div className="animated fadeIn">
                <QatProblemActions ref="problemListChild" updateState={undefined} fetchData={undefined} objectStore="programData"></QatProblemActions>
                {/* <GetLatestProgramVersion ref="programListChild"></GetLatestProgramVersion> */}
                {/* <ChangeInLocalProgramVersion ref="programChangeChild" ></ChangeInLocalProgramVersion> */}
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="pl-md-5" style={{ color: "red" }} id="div2">{this.state.message != "" && i18n.t('static.masterDataSync.masterDataSyncFailed')}</h5>
                <div className="col-md-12" style={{ display: this.state.loading ? "none" : "block" }}>
                    <Col xs="12" sm="12">
                        <Card>
                            {/* // <div className="app flex-row align-items-center">
            //     <div className="Login-component" style={{ backgroundImage: "url(" + InnerBgImg +")" }}>
            //         <Container className="container-login">
            //             <Row className="justify-content-center ">
            //                 <Col md="12">
            //                     <div className="upper-logo mt-1">
            //                         <img src={image1} className="img-fluid " />
            //                     </div>
            //                 </Col>
            //                 <Col md="9" lg="7" xl="6" className="mt-4">
            //                     <h5 className="mx-4">{i18n.t(this.state.message)}</h5>
            //                     <Card className="mx-4 "> */}
                            <CardHeader>
                                <strong>{i18n.t('static.masterDataSync.masterDataSync')}</strong>
                            </CardHeader>
                            <CardBody>
                                <div className="text-center">{this.state.syncedPercentage}% ({i18next.t('static.masterDataSync.synced')} {this.state.syncedMasters} {i18next.t('static.masterDataSync.of')} {this.state.totalMasters} {i18next.t('static.masterDataSync.masters')})</div>
                                <Progress value={this.state.syncedMasters} max={this.state.totalMasters} />
                            </CardBody>

                            <CardFooter id="retryButtonDiv">
                                <FormGroup>
                                    <Button type="button" size="md" color="success" className="float-right mr-1" onClick={() => this.retryClicked()}><i className="fa fa-refresh"></i> {i18n.t('static.common.retry')}</Button>
                                    &nbsp;
                            </FormGroup>
                            </CardFooter>
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

    syncProgramData(date, programList) {
        console.log("Date", date);
        console.log('Program List', programList);
        var valid = true;
        for (var i = 0; i < programList.length; i++) {
            AuthenticationService.setupAxiosInterceptors();
            // this.refs.problemListChild.qatProblemActions(programList[i].id);
            if (navigator.onLine) {
                //Code to Sync Country list
                MasterSyncService.syncProgram(programList[i].programId, programList[i].version, date)
                    .then(response => {
                        console.log("Response", response);
                        if (response.status == 200) {
                            console.log("Response=========================>", response.data);
                            console.log("i", i);
                            var prog = programList.filter(c => c.programId == response.data.programId)[0];
                            console.log("Prog=====================>", prog)
                            var programDataBytes = CryptoJS.AES.decrypt((prog).programData, SECRET_KEY);
                            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                            var programJson = JSON.parse(programData);
                            var shipmentDataList = (programJson.shipmentList);
                            var batchInfoList = (programJson.batchInfoList);
                            var problemReportList = programJson.problemReportList;
                            console.log("Shipment data list", shipmentDataList);
                            console.log("Batch Info list", batchInfoList);
                            var shipArray = response.data.shipmentList;
                            console.log("Min Date shiparray", shipArray);
                            var minDate = moment.min(shipArray.map(d => moment(d.expectedDeliveryDate)))
                            console.log("Min Date in sync", minDate);
                            var batchArray = response.data.batchInfoList;
                            var planningUnitList = [];
                            for (var j = 0; j < shipArray.length; j++) {
                                console.log("In planning unit list", shipArray[j].planningUnit.id);
                                if (!planningUnitList.includes(shipArray[j].planningUnit.id)) {
                                    planningUnitList.push(shipArray[j].planningUnit.id);
                                }
                                var index = shipmentDataList.findIndex(c => c.shipmentId == shipArray[j].shipmentId)
                                if (index == -1) {
                                    shipmentDataList.push(shipArray[j]);
                                } else {
                                    shipmentDataList[index] = shipArray[j];
                                }
                            }
                            console.log("Shipment data updated", shipmentDataList);

                            for (var j = 0; j < batchArray.length; j++) {
                                var index = batchInfoList.findIndex(c => c.batchNo == batchArray[j].batchNo)
                                if (index == -1) {
                                    batchInfoList.push(batchArray[j]);
                                } else {
                                    batchInfoList[index] = batchArray[j];
                                }
                            }
                            console.log("Batch Info updated", batchInfoList);

                            var problemReportArray = response.data.problemReportList;
                            console.log("Problem report array", problemReportArray);
                            for (var pr = 0; pr < problemReportArray.length; pr++) {
                                console.log("problemReportArray[pr].problemReportId---------->", problemReportArray[pr].problemReportId);
                                var index = problemReportList.findIndex(c => c.problemReportId == problemReportArray[pr].problemReportId)
                                console.log("Index----------->", index);
                                if (index == -1) {
                                    problemReportList.push(problemReportArray[pr]);
                                } else {
                                    console.log("In else");
                                    problemReportList[index].reviewed = problemReportArray[pr].reviewed;
                                    console.log("problemReportList[index]", problemReportList[index]);
                                    var problemReportTransList = problemReportList[index].problemTransList;
                                    console.log("Problem report trans list", problemReportTransList)
                                    var curProblemReportTransList = problemReportArray[pr].problemTransList;
                                    console.log("Cur problem report trans list", curProblemReportTransList)
                                    for (var cpr = 0; cpr < curProblemReportTransList.length; cpr++) {
                                        var index1 = problemReportTransList.findIndex(c => c.problemReportTransId == curProblemReportTransList[cpr].problemReportTransId);
                                        console.log("index1", index1)
                                        if (index1 == -1) {
                                            problemReportTransList.push(curProblemReportTransList[cpr]);
                                        } else {
                                            problemReportTransList[index1] = curProblemReportTransList[cpr];
                                        }
                                    }
                                    problemReportList[index].problemReportTransList = problemReportTransList;
                                }
                            }

                            programJson.shipmentList = shipmentDataList;
                            programJson.batchInfoList = batchInfoList;
                            programJson.problemReportList = problemReportList;
                            prog.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                            var db1;
                            var storeOS;
                            getDatabase();
                            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                            openRequest.onerror = function (event) {
                                this.setState({
                                    message: i18n.t('static.program.errortext')
                                },
                                    () => {
                                        this.hideSecondComponent();
                                    })
                            }.bind(this);
                            openRequest.onsuccess = function (e) {
                                db1 = e.target.result;
                                var transaction = db1.transaction(['programData'], 'readwrite');
                                var programTransaction = transaction.objectStore('programData');
                                var putRequest = programTransaction.put(prog);

                                putRequest.onerror = function (event) {
                                    this.setState({
                                        supplyPlanError: i18n.t('static.program.errortext')
                                    })
                                }.bind(this);
                                putRequest.onsuccess = function (event) {
                                    console.log("Planning unit list", planningUnitList);
                                    calculateSupplyPlan(prog.id, 0, 'programData', 'masterDataSync', this, planningUnitList, minDate, this.refs.problemListChild, date);
                                }.bind(this)
                            }.bind(this)
                        } else {
                            this.setState({
                                message: response.data.messageCode
                            },
                                () => {
                                    this.hideSecondComponent();
                                })
                            document.getElementById("retryButtonDiv").style.display = "block";
                            valid = false;
                        }
                    }).catch(error => {
                        if (error.message === "Network Error") {
                            this.setState({ message: error.message },
                                () => {
                                    this.hideSecondComponent();
                                });
                        } else {
                            switch (error.response ? error.response.status : "") {
                                case 500:
                                case 401:
                                case 404:
                                case 406:
                                case 412:
                                    this.setState({ message: error.response.data.messageCode },
                                        () => {
                                            this.hideSecondComponent();
                                        });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError' },
                                        () => {
                                            this.hideSecondComponent();
                                        });
                                    break;
                            }
                        }
                        document.getElementById("retryButtonDiv").style.display = "block";
                        valid = false;
                    });
            } else {
                document.getElementById("retryButtonDiv").style.display = "block";
                this.setState({
                    message: 'static.common.onlinealerttext'
                },
                    () => {
                        this.hideSecondComponent();
                    })
                valid = false;
            }
        }

        // this.refs.programListChild.checkNewerVersions();
        // this.refs.programChangeChild.checkIfLocalProgramVersionChanged();

        if (valid) {
            console.log("D------------> in valid for master data")
            this.setState({
                syncedMasters: this.state.syncedMasters + 1,
                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
            })
        } else {
            document.getElementById("retryButtonDiv").style.display = "block";
            this.setState({
                message: 'static.common.onlinealerttext'
            },
                () => {
                    this.hideSecondComponent();
                })
        }
        console.log("Valid", valid);
        return valid;
    }


    syncMasters() {
        this.setState({ loading: false })
        if (navigator.onLine) {
            var db1;
            var storeOS;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onsuccess = function (e) {
                var realmId = AuthenticationService.getRealmId();
                db1 = e.target.result;
                var transaction = db1.transaction(['lastSyncDate'], 'readwrite');
                var lastSyncDateTransaction = transaction.objectStore('lastSyncDate');
                var updatedSyncDate = ((moment(Date.now()).utcOffset('-0500').format('YYYY-MM-DD HH:mm:ss')));
                var lastSyncDateRequest = lastSyncDateTransaction.getAll();
                lastSyncDateRequest.onsuccess = function (event) {
                    var lastSyncDate = lastSyncDateRequest.result[0];
                    console.log("lastsyncDate", lastSyncDate);
                    var result = lastSyncDateRequest.result;
                    console.log("Result", result)
                    console.log("RealmId", realmId)
                    for (var i = 0; i < result.length; i++) {
                        if (result[i].id == realmId) {
                            console.log("in if")
                            var lastSyncDateRealm = lastSyncDateRequest.result[i];
                            console.log("last sync date in realm", lastSyncDateRealm)
                        }
                        if (result[i].id == 0) {
                            var lastSyncDate = lastSyncDateRequest.result[i];
                            console.log("last sync date", lastSyncDate)
                        }
                    }
                    if (lastSyncDate == undefined) {
                        lastSyncDate = "2020-01-01 00:00:00";
                    } else {
                        lastSyncDate = lastSyncDate.lastSyncDate;
                    }
                    if (lastSyncDateRealm == undefined) {
                        lastSyncDateRealm = "2020-01-01 00:00:00";
                    } else {
                        lastSyncDateRealm = lastSyncDateRealm.lastSyncDate;
                    }
                    console.log("Last sync date above", lastSyncDateRealm);
                    var transaction = db1.transaction(['programData'], 'readwrite');
                    var program = transaction.objectStore('programData');
                    var pGetRequest = program.getAll();
                    var proList = []
                    pGetRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext')
                        })
                    };
                    pGetRequest.onsuccess = function (event) {
                        var myResult = [];
                        myResult = pGetRequest.result;
                        var validation = this.syncProgramData(lastSyncDate, myResult);
                        console.log("Validation", validation);
                        if (validation) {
                            AuthenticationService.setupAxiosInterceptors();
                            if (navigator.onLine && window.getComputedStyle(document.getElementById("retryButtonDiv")).display == "none") {
                                MasterSyncService.getSyncAllMasters(lastSyncDateRealm)
                                    .then(response => {
                                        if (response.status == 200) {
                                            console.log("M sync Response", response.data)
                                            var response = response.data;

                                            // country
                                            var countryTransaction = db1.transaction(['country'], 'readwrite');
                                            console.log("M sync country transaction start")
                                            var countryObjectStore = countryTransaction.objectStore('country');
                                            var json = (response.countryList);
                                            for (var i = 0; i < json.length; i++) {
                                                console.log("M sync in for", i)
                                                countryObjectStore.put(json[i]);
                                            }
                                            console.log("M sync after country set statue 1", this.state.syncedMasters);
                                            countryTransaction.oncomplete = function (event) {
                                                console.log("M sync In abort------>")
                                                this.setState({
                                                    syncedMasters: this.state.syncedMasters + 1,
                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                }, () => {
                                                    // currency
                                                    var currencyTransaction = db1.transaction(['currency'], 'readwrite');
                                                    console.log("M sync currency transaction start")
                                                    var currencyObjectStore = currencyTransaction.objectStore('currency');
                                                    var json = (response.currencyList);
                                                    for (var i = 0; i < json.length; i++) {
                                                        currencyObjectStore.put(json[i]);
                                                    }
                                                    console.log("after currency set statue 1", this.state.syncedMasters);
                                                    currencyTransaction.oncomplete = function (event) {
                                                        this.setState({
                                                            syncedMasters: this.state.syncedMasters + 1,
                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                        }, () => {
                                                            // dimension
                                                            var dimensionTransaction = db1.transaction(['dimension'], 'readwrite');
                                                            console.log("M sync dimension transaction start")
                                                            var dimensionObjectStore = dimensionTransaction.objectStore('dimension');
                                                            var json = (response.dimensionList);
                                                            for (var i = 0; i < json.length; i++) {
                                                                dimensionObjectStore.put(json[i]);
                                                            }
                                                            console.log("after dimension set statue 1", this.state.syncedMasters);
                                                            dimensionTransaction.oncomplete = function (event) {
                                                                this.setState({
                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                }, () => {
                                                                    // language
                                                                    var languageTransaction = db1.transaction(['language'], 'readwrite');
                                                                    console.log("M sync language transaction start")
                                                                    var languageObjectStore = languageTransaction.objectStore('language');
                                                                    var json = (response.languageList);
                                                                    for (var i = 0; i < json.length; i++) {
                                                                        languageObjectStore.put(json[i]);
                                                                    }
                                                                    console.log("after language set statue 1", this.state.syncedMasters);
                                                                    languageTransaction.oncomplete = function (event) {
                                                                        this.setState({
                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                        }, () => {
                                                                            // shipmentStatus
                                                                            var shipmentStatusTransaction = db1.transaction(['shipmentStatus'], 'readwrite');
                                                                            console.log("M sync shipmentStatus transaction start")
                                                                            var shipmentStatusObjectStore = shipmentStatusTransaction.objectStore('shipmentStatus');
                                                                            var json = (response.shipmentStatusList);
                                                                            for (var i = 0; i < json.length; i++) {
                                                                                shipmentStatusObjectStore.put(json[i]);
                                                                            }
                                                                            console.log("after shipmentStatus set statue 1", this.state.syncedMasters);
                                                                            shipmentStatusTransaction.oncomplete = function (event) {
                                                                                this.setState({
                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                }, () => {
                                                                                    // unit
                                                                                    var unitTransaction = db1.transaction(['unit'], 'readwrite');
                                                                                    console.log("M sync unit transaction start")
                                                                                    var unitObjectStore = unitTransaction.objectStore('unit');
                                                                                    var json = (response.unitList);
                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                        unitObjectStore.put(json[i]);
                                                                                    }
                                                                                    console.log("after unit set statue 1", this.state.syncedMasters);
                                                                                    unitTransaction.oncomplete = function (event) {
                                                                                        this.setState({
                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                        }, () => {
                                                                                            // dataSourceType
                                                                                            var dataSourceTypeTransaction = db1.transaction(['dataSourceType'], 'readwrite');
                                                                                            console.log("M sync dataSourceType transaction start")
                                                                                            var dataSourceTypeObjectStore = dataSourceTypeTransaction.objectStore('dataSourceType');
                                                                                            var json = (response.dataSourceTypeList);
                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                dataSourceTypeObjectStore.put(json[i]);
                                                                                            }
                                                                                            console.log("after dataSourceType set statue 1", this.state.syncedMasters);
                                                                                            dataSourceTypeTransaction.oncomplete = function (event) {
                                                                                                this.setState({
                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                }, () => {
                                                                                                    // dataSource
                                                                                                    var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
                                                                                                    console.log("M sync dataSource transaction start")
                                                                                                    var dataSourceObjectStore = dataSourceTransaction.objectStore('dataSource');
                                                                                                    var json = (response.dataSourceList);
                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                        dataSourceObjectStore.put(json[i]);
                                                                                                    }
                                                                                                    console.log("after dataSource set statue 1", this.state.syncedMasters);
                                                                                                    dataSourceTransaction.oncomplete = function (event) {
                                                                                                        this.setState({
                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                        }, () => {
                                                                                                            // tracerCategory
                                                                                                            var tracerCategoryTransaction = db1.transaction(['tracerCategory'], 'readwrite');
                                                                                                            console.log("M sync tracerCategory transaction start")
                                                                                                            var tracerCategoryObjectStore = tracerCategoryTransaction.objectStore('tracerCategory');
                                                                                                            var json = (response.tracerCategoryList);
                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                tracerCategoryObjectStore.put(json[i]);
                                                                                                            }
                                                                                                            console.log("after tracerCategory set statue 1", this.state.syncedMasters);
                                                                                                            tracerCategoryTransaction.oncomplete = function (event) {
                                                                                                                this.setState({
                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                }, () => {
                                                                                                                    // productCategory
                                                                                                                    var productCategoryTransaction = db1.transaction(['productCategory'], 'readwrite');
                                                                                                                    console.log("M sync productCategory transaction start")
                                                                                                                    var productCategoryObjectStore = productCategoryTransaction.objectStore('productCategory');
                                                                                                                    var json = (response.productCategoryList);
                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                        productCategoryObjectStore.put(json[i]);
                                                                                                                    }
                                                                                                                    console.log("after productCategory set statue 1", this.state.syncedMasters);
                                                                                                                    productCategoryTransaction.oncomplete = function (event) {
                                                                                                                        this.setState({
                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                        }, () => {
                                                                                                                            // realm
                                                                                                                            var realmTransaction = db1.transaction(['realm'], 'readwrite');
                                                                                                                            console.log("M sync realm transaction start")
                                                                                                                            var realmObjectStore = realmTransaction.objectStore('realm');
                                                                                                                            var json = (response.realmList);
                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                realmObjectStore.put(json[i]);
                                                                                                                            }
                                                                                                                            console.log("after realm set statue 1", this.state.syncedMasters);
                                                                                                                            realmTransaction.oncomplete = function (event) {
                                                                                                                                this.setState({
                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                }, () => {
                                                                                                                                    // healthArea
                                                                                                                                    var healthAreaTransaction = db1.transaction(['healthArea'], 'readwrite');
                                                                                                                                    console.log("M sync healthArea transaction start")
                                                                                                                                    var healthAreaObjectStore = healthAreaTransaction.objectStore('healthArea');
                                                                                                                                    var json = (response.healthAreaList);
                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                        healthAreaObjectStore.put(json[i]);
                                                                                                                                    }
                                                                                                                                    console.log("after healthArea set statue 1", this.state.syncedMasters);
                                                                                                                                    healthAreaTransaction.oncomplete = function (event) {
                                                                                                                                        this.setState({
                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                        }, () => {
                                                                                                                                            // organisation
                                                                                                                                            var organisationTransaction = db1.transaction(['organisation'], 'readwrite');
                                                                                                                                            console.log("M sync organisation transaction start")
                                                                                                                                            var organisationObjectStore = organisationTransaction.objectStore('organisation');
                                                                                                                                            var json = (response.organisationList);
                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                organisationObjectStore.put(json[i]);
                                                                                                                                            }
                                                                                                                                            console.log("after organisation set statue 1", this.state.syncedMasters);
                                                                                                                                            organisationTransaction.oncomplete = function (event) {
                                                                                                                                                this.setState({
                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                }, () => {
                                                                                                                                                    // fundingSource
                                                                                                                                                    var fundingSourceTransaction = db1.transaction(['fundingSource'], 'readwrite');
                                                                                                                                                    console.log("M sync fundingSource transaction start")
                                                                                                                                                    var fundingSourceObjectStore = fundingSourceTransaction.objectStore('fundingSource');
                                                                                                                                                    var json = (response.fundingSourceList);
                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                        fundingSourceObjectStore.put(json[i]);
                                                                                                                                                    }
                                                                                                                                                    console.log("after fundingSource set statue 1", this.state.syncedMasters);
                                                                                                                                                    fundingSourceTransaction.oncomplete = function (event) {
                                                                                                                                                        this.setState({
                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                        }, () => {
                                                                                                                                                            // procurementAgent
                                                                                                                                                            var procurementAgentTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                                                                                                                                                            console.log("M sync procurementAgent transaction start")
                                                                                                                                                            var procurementAgentObjectStore = procurementAgentTransaction.objectStore('procurementAgent');
                                                                                                                                                            var json = (response.procurementAgentList);
                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                procurementAgentObjectStore.put(json[i]);
                                                                                                                                                            }
                                                                                                                                                            console.log("after procurementAgent set statue 1", this.state.syncedMasters);
                                                                                                                                                            procurementAgentTransaction.oncomplete = function (event) {
                                                                                                                                                                this.setState({
                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                }, () => {
                                                                                                                                                                    // supplier
                                                                                                                                                                    var supplierTransaction = db1.transaction(['supplier'], 'readwrite');
                                                                                                                                                                    console.log("M sync supplier transaction start")
                                                                                                                                                                    var supplierObjectStore = supplierTransaction.objectStore('supplier');
                                                                                                                                                                    var json = (response.supplierList);
                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                        supplierObjectStore.put(json[i]);
                                                                                                                                                                    }
                                                                                                                                                                    console.log("after supplier set statue 1", this.state.syncedMasters);
                                                                                                                                                                    supplierTransaction.oncomplete = function (event) {
                                                                                                                                                                        this.setState({
                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                        }, () => {
                                                                                                                                                                            // forecastingUnit
                                                                                                                                                                            var forecastingUnitTransaction = db1.transaction(['forecastingUnit'], 'readwrite');
                                                                                                                                                                            console.log("M sync forecastingUnit transaction start")
                                                                                                                                                                            var forecastingUnitObjectStore = forecastingUnitTransaction.objectStore('forecastingUnit');
                                                                                                                                                                            var json = (response.forecastingUnitList);
                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                forecastingUnitObjectStore.put(json[i]);
                                                                                                                                                                            }
                                                                                                                                                                            console.log("after forecastingUnit set statue 1", this.state.syncedMasters);
                                                                                                                                                                            forecastingUnitTransaction.oncomplete = function (event) {
                                                                                                                                                                                this.setState({
                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                }, () => {
                                                                                                                                                                                    // planningUnit
                                                                                                                                                                                    var planningUnitTransaction = db1.transaction(['planningUnit'], 'readwrite');
                                                                                                                                                                                    console.log("M sync planningUnit transaction start")
                                                                                                                                                                                    var planningUnitObjectStore = planningUnitTransaction.objectStore('planningUnit');
                                                                                                                                                                                    var json = (response.planningUnitList);
                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                        planningUnitObjectStore.put(json[i]);
                                                                                                                                                                                    }
                                                                                                                                                                                    console.log("after planningUnit set statue 1", this.state.syncedMasters);
                                                                                                                                                                                    planningUnitTransaction.oncomplete = function (event) {
                                                                                                                                                                                        this.setState({
                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                        }, () => {
                                                                                                                                                                                            // procurementUnit
                                                                                                                                                                                            var procurementUnitTransaction = db1.transaction(['procurementUnit'], 'readwrite');
                                                                                                                                                                                            console.log("M sync procurementUnit transaction start")
                                                                                                                                                                                            var procurementUnitObjectStore = procurementUnitTransaction.objectStore('procurementUnit');
                                                                                                                                                                                            var json = (response.procurementUnitList);
                                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                procurementUnitObjectStore.put(json[i]);
                                                                                                                                                                                            }
                                                                                                                                                                                            console.log("after procurementUnit set statue 1", this.state.syncedMasters);
                                                                                                                                                                                            procurementUnitTransaction.oncomplete = function (event) {
                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                }, () => {
                                                                                                                                                                                                    // realmCountry
                                                                                                                                                                                                    var realmCountryTransaction = db1.transaction(['realmCountry'], 'readwrite');
                                                                                                                                                                                                    console.log("M sync realmCountry transaction start")
                                                                                                                                                                                                    var realmCountryObjectStore = realmCountryTransaction.objectStore('realmCountry');
                                                                                                                                                                                                    var json = (response.realmCountryList);
                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                        realmCountryObjectStore.put(json[i]);
                                                                                                                                                                                                    }
                                                                                                                                                                                                    console.log("after realmCountry set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                    realmCountryTransaction.oncomplete = function (event) {
                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                        }, () => {
                                                                                                                                                                                                            // realmCountryPlanningUnit
                                                                                                                                                                                                            var realmCountryPlanningUnitTransaction = db1.transaction(['realmCountryPlanningUnit'], 'readwrite');
                                                                                                                                                                                                            console.log("M sync realmCountryPlanningUnit transaction start")
                                                                                                                                                                                                            var realmCountryPlanningUnitObjectStore = realmCountryPlanningUnitTransaction.objectStore('realmCountryPlanningUnit');
                                                                                                                                                                                                            var json = (response.realmCountryPlanningUnitList);
                                                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                realmCountryPlanningUnitObjectStore.put(json[i]);
                                                                                                                                                                                                            }
                                                                                                                                                                                                            console.log("after realmCountryPlanningUnit set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                            realmCountryPlanningUnitTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                }, () => {
                                                                                                                                                                                                                    // procurementAgentPlanningUnit
                                                                                                                                                                                                                    var procurementAgentPlanningUnitTransaction = db1.transaction(['procurementAgentPlanningUnit'], 'readwrite');
                                                                                                                                                                                                                    console.log("M sync procurementAgentPlanningUnit transaction start")
                                                                                                                                                                                                                    var procurementAgentPlanningUnitObjectStore = procurementAgentPlanningUnitTransaction.objectStore('procurementAgentPlanningUnit');
                                                                                                                                                                                                                    var json = (response.procurementAgentPlanningUnitList);
                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                        procurementAgentPlanningUnitObjectStore.put(json[i]);
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                    console.log("after procurementAgentPlanningUnit set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                    procurementAgentPlanningUnitTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                        }, () => {
                                                                                                                                                                                                                            // procurementAgentProcurementUnit
                                                                                                                                                                                                                            var procurementAgentProcurementUnitTransaction = db1.transaction(['procurementAgentProcurementUnit'], 'readwrite');
                                                                                                                                                                                                                            console.log("M sync procurementAgentProcurementUnit transaction start")
                                                                                                                                                                                                                            var procurementAgentProcurementUnitObjectStore = procurementAgentProcurementUnitTransaction.objectStore('procurementAgentProcurementUnit');
                                                                                                                                                                                                                            var json = (response.procurementAgentProcurementUnitList);
                                                                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                procurementAgentProcurementUnitObjectStore.put(json[i]);
                                                                                                                                                                                                                            }
                                                                                                                                                                                                                            console.log("after procurementAgentProcurementUnit set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                            procurementAgentProcurementUnitTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                }, () => {
                                                                                                                                                                                                                                    // program
                                                                                                                                                                                                                                    var programTransaction = db1.transaction(['program'], 'readwrite');
                                                                                                                                                                                                                                    console.log("M sync program transaction start")
                                                                                                                                                                                                                                    var programObjectStore = programTransaction.objectStore('program');
                                                                                                                                                                                                                                    var json = (response.programList);
                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                        programObjectStore.put(json[i]);
                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                    console.log("after program set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                    programTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                        }, () => {
                                                                                                                                                                                                                                            // programPlanningUnit
                                                                                                                                                                                                                                            var programPlanningUnitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                                                                                                                                                                                                                                            console.log("M sync programPlanningUnit transaction start")
                                                                                                                                                                                                                                            var programPlanningUnitObjectStore = programPlanningUnitTransaction.objectStore('programPlanningUnit');
                                                                                                                                                                                                                                            var json = (response.programPlanningUnitList);
                                                                                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                programPlanningUnitObjectStore.put(json[i]);
                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                            console.log("after programPlanningUnit set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                            programPlanningUnitTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                }, () => {
                                                                                                                                                                                                                                                    // region
                                                                                                                                                                                                                                                    var regionTransaction = db1.transaction(['region'], 'readwrite');
                                                                                                                                                                                                                                                    console.log("M sync region transaction start")
                                                                                                                                                                                                                                                    var regionObjectStore = regionTransaction.objectStore('region');
                                                                                                                                                                                                                                                    var json = (response.regionList);
                                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                        regionObjectStore.put(json[i]);
                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                    console.log("after region set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                    regionTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                        }, () => {
                                                                                                                                                                                                                                                            // budget
                                                                                                                                                                                                                                                            var budgetTransaction = db1.transaction(['budget'], 'readwrite');
                                                                                                                                                                                                                                                            console.log("M sync budget transaction start")
                                                                                                                                                                                                                                                            var budgetObjectStore = budgetTransaction.objectStore('budget');
                                                                                                                                                                                                                                                            var json = (response.budgetList);
                                                                                                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                budgetObjectStore.put(json[i]);
                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                            console.log("after budget set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                            budgetTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                }, () => {
                                                                                                                                                                                                                                                                    // problemStatus
                                                                                                                                                                                                                                                                    var problemStatusTransaction = db1.transaction(['problemStatus'], 'readwrite');
                                                                                                                                                                                                                                                                    console.log("M sync problemStatus transaction start")
                                                                                                                                                                                                                                                                    var problemStatusObjectStore = problemStatusTransaction.objectStore('problemStatus');
                                                                                                                                                                                                                                                                    var json = (response.problemStatusList);
                                                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                        problemStatusObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                    console.log("after problemStatus set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                    problemStatusTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                        }, () => {
                                                                                                                                                                                                                                                                            // problemCriticality
                                                                                                                                                                                                                                                                            var problemCriticalityTransaction = db1.transaction(['problemCriticality'], 'readwrite');
                                                                                                                                                                                                                                                                            console.log("M sync problemCriticality transaction start")
                                                                                                                                                                                                                                                                            var problemCriticalityObjectStore = problemCriticalityTransaction.objectStore('problemCriticality');
                                                                                                                                                                                                                                                                            var json = (response.problemCriticalityList);
                                                                                                                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                problemCriticalityObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                            console.log("after problemCriticality set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                            problemCriticalityTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                }, () => {
                                                                                                                                                                                                                                                                                    // problemCategory
                                                                                                                                                                                                                                                                                    var problemCategoryTransaction = db1.transaction(['problemCategory'], 'readwrite');
                                                                                                                                                                                                                                                                                    console.log("M sync problemCategory transaction start")
                                                                                                                                                                                                                                                                                    var problemCategoryObjectStore = problemCategoryTransaction.objectStore('problemCategory');
                                                                                                                                                                                                                                                                                    var json = (response.problemCategoryList);
                                                                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                        problemCategoryObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                    console.log("after problemCategory set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                                    problemCategoryTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                        }, () => {
                                                                                                                                                                                                                                                                                            // realmProblem
                                                                                                                                                                                                                                                                                            var realmProblemTransaction = db1.transaction(['problem'], 'readwrite');
                                                                                                                                                                                                                                                                                            console.log("M sync realmProblem transaction start")
                                                                                                                                                                                                                                                                                            var realmProblemObjectStore = realmProblemTransaction.objectStore('problem');
                                                                                                                                                                                                                                                                                            var json = (response.realmProblemList);
                                                                                                                                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                realmProblemObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                            console.log("after realmProblem set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                                            realmProblemTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                }, () => {
                                                                                                                                                                                                                                                                                                    console.log("M sync after problem state updated---", this.state.syncedMasters)
                                                                                                                                                                                                                                                                                                    if (this.state.syncedMasters === this.state.totalMasters) {
                                                                                                                                                                                                                                                                                                        var transaction = db1.transaction(['lastSyncDate'], 'readwrite');
                                                                                                                                                                                                                                                                                                        var lastSyncDateTransaction = transaction.objectStore('lastSyncDate');
                                                                                                                                                                                                                                                                                                        var updatedLastSyncDateJson = {
                                                                                                                                                                                                                                                                                                            lastSyncDate: updatedSyncDate,
                                                                                                                                                                                                                                                                                                            id: 0
                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                        var updateLastSyncDate = lastSyncDateTransaction.put(updatedLastSyncDateJson)
                                                                                                                                                                                                                                                                                                        var updatedLastSyncDateJson1 = {
                                                                                                                                                                                                                                                                                                            lastSyncDate: updatedSyncDate,
                                                                                                                                                                                                                                                                                                            id: realmId
                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                        var updateLastSyncDate = lastSyncDateTransaction.put(updatedLastSyncDateJson1)
                                                                                                                                                                                                                                                                                                        updateLastSyncDate.onsuccess = function (event) {
                                                                                                                                                                                                                                                                                                            console.log("M sync final success updated---", this.state.syncedMasters)
                                                                                                                                                                                                                                                                                                            document.getElementById("retryButtonDiv").style.display = "none";
                                                                                                                                                                                                                                                                                                            let id = AuthenticationService.displayDashboardBasedOnRole();
                                                                                                                                                                                                                                                                                                            console.log("M sync role based dashboard done");
                                                                                                                                                                                                                                                                                                            console.log("End date", Date.now());
                                                                                                                                                                                                                                                                                                            this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/green/' + i18n.t('static.masterDataSync.success'))
                                                                                                                                                                                                                                                                                                        }.bind(this)
                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                })
                                                                                                                                                                                                                                                                                            }.bind(this);
                                                                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                                                                    }.bind(this);
                                                                                                                                                                                                                                                                                })
                                                                                                                                                                                                                                                                            }.bind(this);
                                                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                                                    }.bind(this);

                                                                                                                                                                                                                                                                })
                                                                                                                                                                                                                                                            }.bind(this);
                                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                                    }.bind(this);
                                                                                                                                                                                                                                                })
                                                                                                                                                                                                                                            }.bind(this);
                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                    }.bind(this);
                                                                                                                                                                                                                                })
                                                                                                                                                                                                                            }.bind(this);
                                                                                                                                                                                                                        })
                                                                                                                                                                                                                    }.bind(this);
                                                                                                                                                                                                                })
                                                                                                                                                                                                            }.bind(this);
                                                                                                                                                                                                        })
                                                                                                                                                                                                    }.bind(this);
                                                                                                                                                                                                })
                                                                                                                                                                                            }.bind(this);
                                                                                                                                                                                        })
                                                                                                                                                                                    }.bind(this);
                                                                                                                                                                                })
                                                                                                                                                                            }.bind(this);
                                                                                                                                                                        })
                                                                                                                                                                    }.bind(this);
                                                                                                                                                                })
                                                                                                                                                            }.bind(this);
                                                                                                                                                        })
                                                                                                                                                    }.bind(this);
                                                                                                                                                })
                                                                                                                                            }.bind(this);
                                                                                                                                        })
                                                                                                                                    }.bind(this);
                                                                                                                                })
                                                                                                                            }.bind(this);
                                                                                                                        })
                                                                                                                    }.bind(this);
                                                                                                                })
                                                                                                            }.bind(this);
                                                                                                        })
                                                                                                    }.bind(this);
                                                                                                })
                                                                                            }.bind(this);
                                                                                        })
                                                                                    }.bind(this);
                                                                                })
                                                                            }.bind(this);
                                                                        })
                                                                    }.bind(this);
                                                                })
                                                            }.bind(this);
                                                        })
                                                    }.bind(this);
                                                })
                                            }.bind(this);
                                        }
                                    })
                            } else {
                                document.getElementById("retryButtonDiv").style.display = "block";
                                this.setState({
                                    message: 'static.common.onlinealerttext'
                                },
                                    () => {
                                        this.hideSecondComponent();
                                    })
                            }

                        }
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        } else {
            this.setState({
                message: 'static.common.onlinealerttext'
            },
                () => {
                    this.hideSecondComponent();
                })
        }
    }


    retryClicked() {
        this.setState({
            totalMasters: TOTAL_NO_OF_MASTERS_IN_SYNC,
            syncedMasters: 0,
            syncedPercentage: 0,
            errorMessage: "",
            successMessage: ""
        })
        document.getElementById("retryButtonDiv").style.display = "none";
        this.syncMasters();
        // confirmAlert({
        //     // title: i18n.t('static.masterDataSync.masterDataSync'),
        //     message: i18n.t('static.masterDataSync.confirmRetrySyncMessage'),
        //     buttons: [
        //         {
        //             label: i18n.t('static.program.yes'),
        //             onClick: () => {
        //                 this.setState({
        //                     totalMasters: 27,
        //                     syncedMasters: 0,
        //                     syncedPercentage: 0,
        //                     errorMessage: "",
        //                     successMessage: ""
        //                 })
        //                 this.syncMasters();
        //             }
        //         },
        //         {
        //             label: i18n.t('static.program.no'),
        //             onClick: () => {
        //                 // document.getElementById("retryButtonDiv").style.display = "block";
        //                 this.setState({
        //                     message: i18n.t('static.actionCancelled')
        //                 })
        //             }
        //         }
        //     ]
        // });



    }
}