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
let mastersSynced = 0
export default class SyncMasterData extends Component {

    constructor() {
        super();
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
        this.updateState = this.updateState.bind(this);
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }
    updateCurrency = (currencyList, db1) => {
        // currency
        console.log("M sync update currency called")
        var currencyTransaction = db1.transaction(['currency'], 'readwrite');
        var currencyObjectStore = currencyTransaction.objectStore('currency');
        var json = (currencyList)
        var putCurrency = "";
        for (var i = 0; i < json.length; i++) {
            putCurrency = currencyObjectStore.put(json[i]);
        }

        // updateLastSyncDate.onsuccess = function (event) {
        console.log("M sync going to put currency on success")
        // mastersSynced = this.state.syncedMasters + 1;
        // this.setState({
        //     syncedMasters: this.state.syncedMasters + 1,
        //     syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
        // }, () => {
        //     console.log("M sync going to put currency on success state updated")
        // })
        // }.bind(this);

        this.setState((state, props) => {
            return {
                syncedMasters: state.syncedMasters + 1,
                syncedPercentage: Math.floor(((state.syncedMasters + 1) / state.totalMasters) * 100)
            };
        });
        console.log("M sync going to update currency state")
        console.log("after currency set statue ", this.state.syncedMasters);
        // this.setState({
        //     syncedMasters: this.state.syncedMasters + 1,
        //     syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
        // })
    }
    componentDidUpdate() {
        console.log("M sync component did update called---", this.state);
        // this.setState({
        //     syncedMasters: this.state.syncedMasters,
        //     syncedPercentage: this.state.syncedMasters
        // })
    }
    componentDidMount() {
        console.log("M sync component did mount")
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
                console.log("M sync going to call sync master function")
                this.syncMasters();
            }.bind(this), 5)

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

    render() {
        console.log("M sync render method called---", this.state.syncedMasters);
        const { syncedMasters } = this.state;
        console.log("M sync render method syncedMasters---", syncedMasters);
        return (
            <div className="animated fadeIn">
                ------------------------------>{syncedMasters}
                -------------------------------->>-{mastersSynced}
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
            // AuthenticationService.setupAxiosInterceptors();
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
                            programJson.shipmentList = shipmentDataList;
                            programJson.batchInfoList = batchInfoList;
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
                                    calculateSupplyPlan(prog.id, 0, 'programData', 'masterDataSync', '', planningUnitList, minDate);
                                }
                            }
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
        if (valid) {
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

    updateState() {

    }


    syncMasters() {
        console.log("M sync inside sync masters function")
        this.setState({ loading: false })
        if (navigator.onLine) {
            console.log("M sync user is online")
            var db1;
            var storeOS;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onsuccess = function (e) {
                console.log("M sync open request on success called")
                var realmId = AuthenticationService.getRealmId();
                db1 = e.target.result;
                var transaction = db1.transaction(['lastSyncDate'], 'readwrite');
                var lastSyncDateTransaction = transaction.objectStore('lastSyncDate');
                var updatedSyncDate = ((moment(Date.now()).utcOffset('-0500').format('YYYY-MM-DD HH:mm:ss')));
                var lastSyncDateRequest = lastSyncDateTransaction.getAll();
                console.log("M sync last sync date request")
                lastSyncDateRequest.onsuccess = function (event) {
                    console.log("M sync last sync date request success")
                    var lastSyncDate = lastSyncDateRequest.result[0];
                    console.log("lastsyncDate", lastSyncDate);
                    var result = lastSyncDateRequest.result;
                    console.log("Result", result)
                    console.log("RealmId", realmId)
                    for (var i = 0; i < result.length; i++) {
                        console.log("M sync inside for loop")
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
                        console.log("M sync last sync date undefined if")
                        lastSyncDate = "2020-01-01 00:00:00";
                    } else {
                        console.log("M sync last sync date undefined else")
                        lastSyncDate = lastSyncDate.lastSyncDate;
                    }
                    if (lastSyncDateRealm == undefined) {
                        console.log("M sync last sync date realm undefined if")
                        lastSyncDateRealm = "2020-01-01 00:00:00";
                    } else {
                        console.log("M sync last sync date realm undefined else")
                        lastSyncDateRealm = lastSyncDateRealm.lastSyncDate;
                    }
                    console.log("Last sync date above", lastSyncDateRealm);
                    var transaction = db1.transaction(['programData'], 'readwrite');
                    var program = transaction.objectStore('programData');
                    var pGetRequest = program.getAll();
                    var proList = []
                    pGetRequest.onerror = function (event) {
                        console.log("M sync put get request ")
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext')
                        }, () => {
                            console.log("M sync put get request state updated")
                        })
                    };
                    pGetRequest.onsuccess = function (event) {
                        var myResult = [];
                        console.log("M sync p get request success")
                        myResult = pGetRequest.result;
                        // var validation = this.syncProgramData(lastSyncDate, myResult);
                        // console.log("Validation", validation);
                        // if (validation) {
                        // AuthenticationService.setupAxiosInterceptors();
                        if (navigator.onLine && window.getComputedStyle(document.getElementById("retryButtonDiv")).display == "none") {
                            //Code to Sync Language list
                            console.log("M sync going to get all the masters")
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
                                        console.log("M sync country json---")
                                        for (var i = 0; i < json.length; i++) {
                                            console.log("M sync country for loop")
                                            countryObjectStore.put(json[i]);
                                        }
                                        console.log("after country set statue ", this.state.syncedMasters);
                                        console.log("M sync going to update state")
                                        setTimeout(function () {

                                        }, 3000);
                                        this.setState({
                                            syncedMasters: this.state.syncedMasters + 1,
                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                        }, () => {
                                            console.log("M sync state updated sync percentage---", this.state.syncedMasters)
                                            this.updateCurrency(response.currencyList, db1);
                                            // currency
                                            var currencyTransaction = db1.transaction(['currency'], 'readwrite');
                                            var currencyObjectStore = currencyTransaction.objectStore('currency');
                                            json = (response.currencyList)
                                            var putCurrency = "";
                                            for (var i = 0; i < json.length; i++) {
                                                putCurrency = currencyObjectStore.put(json[i]);
                                            }

                                            // updateLastSyncDate.onsuccess = function (event) {
                                            console.log("M sync going to put currency on success")
                                            this.setState({
                                                syncedMasters: this.state.syncedMasters + 1,
                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                            }, () => {
                                                console.log("M sync going to put currency on success state updated")
                                            })
                                            // }.bind(this);
                                            console.log("M sync going to update currency state")
                                            console.log("after currency set statue ", this.state.syncedMasters);
                                            this.setState({
                                                syncedMasters: this.state.syncedMasters + 1,
                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                            }, () => {
                                                console.log("M sync after country state updated---", this.state.syncedMasters)
                                                // dimension
                                                var dimensionTransaction = db1.transaction(['dimension'], 'readwrite');
                                                var dimensionObjectStore = dimensionTransaction.objectStore('dimension');
                                                json = (response.dimensionList)
                                                for (var i = 0; i < json.length; i++) {
                                                    dimensionObjectStore.put(json[i]);
                                                }
                                                this.setState({
                                                    syncedMasters: this.state.syncedMasters + 1,
                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                }, () => {
                                                    console.log("M sync after dimention state updated---", this.state.syncedMasters)
                                                    // language
                                                    var languageTransaction = db1.transaction(['language'], 'readwrite');
                                                    var languageObjectStore = languageTransaction.objectStore('language');
                                                    json = (response.languageList);
                                                    for (var i = 0; i < json.length; i++) {
                                                        languageObjectStore.put(json[i]);
                                                    }
                                                    this.setState({
                                                        syncedMasters: this.state.syncedMasters + 1,
                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                    }, () => {
                                                        console.log("M sync after language state updated---", this.state.syncedMasters)
                                                        // shipmentStatus
                                                        var shipmentStatusTransaction = db1.transaction(['shipmentStatus'], 'readwrite');
                                                        var shipmentStatusObjectStore = shipmentStatusTransaction.objectStore('shipmentStatus');
                                                        json = (response.shipmentStatusList);
                                                        for (var i = 0; i < json.length; i++) {
                                                            shipmentStatusObjectStore.put(json[i]);
                                                        }
                                                        this.setState({
                                                            syncedMasters: this.state.syncedMasters + 1,
                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                        }, () => {
                                                            console.log("M sync after shipment status state updated---", this.state.syncedMasters)
                                                            // unit
                                                            var unitTransaction = db1.transaction(['unit'], 'readwrite');
                                                            var unitObjectStore = unitTransaction.objectStore('unit');
                                                            json = (response.unitList)
                                                            for (var i = 0; i < json.length; i++) {
                                                                unitObjectStore.put(json[i]);
                                                            }
                                                            this.setState({
                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                            }, () => {
                                                                console.log("M sync after unit state updated---", this.state.syncedMasters)
                                                                // dataSourceType
                                                                var dataSourceTypeTransaction = db1.transaction(['dataSourceType'], 'readwrite');
                                                                var dataSourceTypeObjectStore = dataSourceTypeTransaction.objectStore('dataSourceType');
                                                                json = (response.dataSourceTypeList)
                                                                for (var i = 0; i < json.length; i++) {
                                                                    dataSourceTypeObjectStore.put(json[i]);
                                                                }
                                                                this.setState({
                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                }, () => {
                                                                    console.log("M sync after data source type state updated---", this.state.syncedMasters)
                                                                    // dataSource
                                                                    var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
                                                                    var dataSourceObjectStore = dataSourceTransaction.objectStore('dataSource');
                                                                    json = (response.dataSourceList);
                                                                    for (var i = 0; i < json.length; i++) {
                                                                        dataSourceObjectStore.put(json[i]);
                                                                    }
                                                                    this.setState({
                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                    }, () => {
                                                                        console.log("M sync after data source state updated---", this.state.syncedMasters)
                                                                        // tracerCategory
                                                                        var tracerCategoryTransaction = db1.transaction(['tracerCategory'], 'readwrite');
                                                                        var tracerCategoryObjectStore = tracerCategoryTransaction.objectStore('tracerCategory');
                                                                        json = (response.tracerCategoryList);
                                                                        for (var i = 0; i < json.length; i++) {
                                                                            tracerCategoryObjectStore.put(json[i]);
                                                                        }
                                                                        this.setState({
                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                        }, () => {
                                                                            console.log("M sync after tracer category state updated---", this.state.syncedMasters)
                                                                            // productCategory
                                                                            var productCategoryTransaction = db1.transaction(['productCategory'], 'readwrite');
                                                                            var productCategoryObjectStore = productCategoryTransaction.objectStore('productCategory');
                                                                            json = (response.productCategoryList)
                                                                            for (var i = 0; i < json.length; i++) {
                                                                                productCategoryObjectStore.put(json[i]);
                                                                            }
                                                                            this.setState({
                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                            }, () => {
                                                                                console.log("M sync after product category state updated---", this.state.syncedMasters)
                                                                                // realm
                                                                                var realmTransaction = db1.transaction(['realm'], 'readwrite');
                                                                                var realmObjectStore = realmTransaction.objectStore('realm');
                                                                                json = (response.realmList);
                                                                                for (var i = 0; i < json.length; i++) {
                                                                                    realmObjectStore.put(json[i]);
                                                                                }
                                                                                this.setState({
                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                }, () => {
                                                                                    console.log("M sync after realm state updated---", this.state.syncedMasters)
                                                                                    // healthArea
                                                                                    var healthAreaTransaction = db1.transaction(['healthArea'], 'readwrite');
                                                                                    var healthAreaObjectStore = healthAreaTransaction.objectStore('healthArea');
                                                                                    json = (response.healthAreaList)
                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                        healthAreaObjectStore.put(json[i]);
                                                                                    }
                                                                                    this.setState({
                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                    }, () => {
                                                                                        console.log("M sync after health area state updated---", this.state.syncedMasters)
                                                                                        // organisation
                                                                                        var organisationTransaction = db1.transaction(['organisation'], 'readwrite');
                                                                                        var organisationObjectStore = organisationTransaction.objectStore('organisation');
                                                                                        json = (response.organisationList);
                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                            organisationObjectStore.put(json[i]);
                                                                                        }
                                                                                        this.setState({
                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                        }, () => {
                                                                                            console.log("M sync after organisation state updated---", this.state.syncedMasters)
                                                                                            // fundingSource
                                                                                            var fundingSourceTransaction = db1.transaction(['fundingSource'], 'readwrite');
                                                                                            var fundingSourceObjectStore = fundingSourceTransaction.objectStore('fundingSource');
                                                                                            json = (response.fundingSourceList)
                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                fundingSourceObjectStore.put(json[i]);
                                                                                            }
                                                                                            this.setState({
                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                            }, () => {
                                                                                                console.log("M sync after funding source state updated---", this.state.syncedMasters)
                                                                                                // procurementAgent
                                                                                                var procurementAgentTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                                                                                                var procurementAgentObjectStore = procurementAgentTransaction.objectStore('procurementAgent');
                                                                                                json = (response.procurementAgentList)
                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                    procurementAgentObjectStore.put(json[i]);
                                                                                                }
                                                                                                this.setState({
                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                }, () => {
                                                                                                    console.log("M sync after procurement agent state updated---", this.state.syncedMasters)
                                                                                                    // supplier
                                                                                                    var supplierTransaction = db1.transaction(['supplier'], 'readwrite');
                                                                                                    var supplierObjectStore = supplierTransaction.objectStore('supplier');
                                                                                                    json = (response.supplierList);
                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                        supplierObjectStore.put(json[i]);
                                                                                                    }
                                                                                                    this.setState({
                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                    }, () => {
                                                                                                        console.log("M sync after supplier state updated---", this.state.syncedMasters)
                                                                                                        // forecastingUnit
                                                                                                        var forecastingUnitTransaction = db1.transaction(['forecastingUnit'], 'readwrite');
                                                                                                        var forecastingUnitObjectStore = forecastingUnitTransaction.objectStore('forecastingUnit');
                                                                                                        json = (response.forecastingUnitList);
                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                            forecastingUnitObjectStore.put(json[i]);
                                                                                                        }
                                                                                                        this.setState({
                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                        }, () => {
                                                                                                            console.log("M sync after forcasting unit state updated---", this.state.syncedMasters)
                                                                                                            // planningUnit
                                                                                                            var planningUnitTransaction = db1.transaction(['planningUnit'], 'readwrite');
                                                                                                            var planningUnitObjectStore = planningUnitTransaction.objectStore('planningUnit');
                                                                                                            json = (response.planningUnitList);
                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                planningUnitObjectStore.put(json[i]);
                                                                                                            }
                                                                                                            this.setState({
                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                            }, () => {
                                                                                                                console.log("M sync after planning unit state updated---", this.state.syncedMasters)
                                                                                                                // procurementUnit
                                                                                                                var procurementUnitTransaction = db1.transaction(['procurementUnit'], 'readwrite');
                                                                                                                var procurementUnitObjectStore = procurementUnitTransaction.objectStore('procurementUnit');
                                                                                                                json = (response.procurementUnitList);
                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                    procurementUnitObjectStore.put(json[i]);
                                                                                                                }
                                                                                                                this.setState({
                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                }, () => {
                                                                                                                    console.log("M sync after procurement unit state updated---", this.state.syncedMasters)
                                                                                                                    // realmCountry
                                                                                                                    var realmCountryTransaction = db1.transaction(['realmCountry'], 'readwrite');
                                                                                                                    var realmCountryObjectStore = realmCountryTransaction.objectStore('realmCountry');
                                                                                                                    json = (response.realmCountryList);
                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                        realmCountryObjectStore.put(json[i]);
                                                                                                                    }
                                                                                                                    this.setState({
                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                    }, () => {
                                                                                                                        console.log("M sync after realm country state updated---", this.state.syncedMasters)
                                                                                                                        // realmCountryPlanningUnit
                                                                                                                        var realmCountryPlanningUnitTransaction = db1.transaction(['realmCountryPlanningUnit'], 'readwrite');
                                                                                                                        var realmCountryPlanningUnitObjectStore = realmCountryPlanningUnitTransaction.objectStore('realmCountryPlanningUnit');
                                                                                                                        json = (response.realmCountryPlanningUnitList);
                                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                                            realmCountryPlanningUnitObjectStore.put(json[i]);
                                                                                                                        }
                                                                                                                        this.setState({
                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                        }, () => {
                                                                                                                            console.log("M sync after realm country planning unit state updated---", this.state.syncedMasters)
                                                                                                                            // procurementAgentPlanningUnit
                                                                                                                            var procurementAgentPlanningUnitTransaction = db1.transaction(['procurementAgentPlanningUnit'], 'readwrite');
                                                                                                                            var procurementAgentPlanningUnitObjectStore = procurementAgentPlanningUnitTransaction.objectStore('procurementAgentPlanningUnit');
                                                                                                                            json = (response.procurementAgentPlanningUnitList)
                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                procurementAgentPlanningUnitObjectStore.put(json[i]);
                                                                                                                            }
                                                                                                                            this.setState({
                                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                            }, () => {
                                                                                                                                console.log("M sync after procurement agent planning unit state updated---", this.state.syncedMasters)
                                                                                                                                // procurementAgentProcurementUnit
                                                                                                                                var procurementAgentProcurementUnitTransaction = db1.transaction(['procurementAgentProcurementUnit'], 'readwrite');
                                                                                                                                var procurementAgentProcurementUnitObjectStore = procurementAgentProcurementUnitTransaction.objectStore('procurementAgentProcurementUnit');
                                                                                                                                json = (response.procurementAgentProcurementUnitList);
                                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                                    procurementAgentProcurementUnitObjectStore.put(json[i]);
                                                                                                                                }
                                                                                                                                this.setState({
                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                }, () => {
                                                                                                                                    console.log("M sync after procurement agent procurement unit state updated---", this.state.syncedMasters)
                                                                                                                                    // program
                                                                                                                                    var programTransaction = db1.transaction(['program'], 'readwrite');
                                                                                                                                    var programObjectStore = programTransaction.objectStore('program');
                                                                                                                                    json = (response.programList);
                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                        programObjectStore.put(json[i]);
                                                                                                                                    }
                                                                                                                                    this.setState({
                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                    }, () => {
                                                                                                                                        console.log("M sync after program state updated---", this.state.syncedMasters)
                                                                                                                                        // programPlanningUnit
                                                                                                                                        var programPlanningUnitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                                                                                                                                        var programPlanningUnitObjectStore = programPlanningUnitTransaction.objectStore('programPlanningUnit');
                                                                                                                                        json = (response.programPlanningUnitList);
                                                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                                                            programPlanningUnitObjectStore.put(json[i]);
                                                                                                                                        }
                                                                                                                                        this.setState({
                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                        }, () => {
                                                                                                                                            console.log("M sync after program planning unit state updated---", this.state.syncedMasters)
                                                                                                                                            // region
                                                                                                                                            var regionTransaction = db1.transaction(['region'], 'readwrite');
                                                                                                                                            var regionObjectStore = regionTransaction.objectStore('region');
                                                                                                                                            json = (response.regionList)
                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                regionObjectStore.put(json[i]);
                                                                                                                                            }
                                                                                                                                            this.setState({
                                                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                            }, () => {
                                                                                                                                                console.log("M sync after reagion state updated---", this.state.syncedMasters)
                                                                                                                                                // budget
                                                                                                                                                var budgetTransaction = db1.transaction(['budget'], 'readwrite');
                                                                                                                                                var budgetObjectStore = budgetTransaction.objectStore('budget');
                                                                                                                                                json = (response.budgetList);
                                                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                                                    budgetObjectStore.put(json[i]);
                                                                                                                                                }
                                                                                                                                                this.setState({
                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                }, () => {
                                                                                                                                                    console.log("M sync after bugdet state updated---", this.state.syncedMasters)
                                                                                                                                                    // problemStatus
                                                                                                                                                    var problemStatusTransaction = db1.transaction(['problemStatus'], 'readwrite');
                                                                                                                                                    var problemStatusObjectStore = problemStatusTransaction.objectStore('problemStatus');
                                                                                                                                                    json = (response.problemStatusList);
                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                        problemStatusObjectStore.put(json[i]);
                                                                                                                                                    }
                                                                                                                                                    this.setState({
                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                    }, () => {
                                                                                                                                                        console.log("M sync after problem status state updated---", this.state.syncedMasters)
                                                                                                                                                        // problemCriticality
                                                                                                                                                        var problemCriticalityTransaction = db1.transaction(['problemCriticality'], 'readwrite');
                                                                                                                                                        var problemCriticalityObjectStore = problemCriticalityTransaction.objectStore('problemCriticality');
                                                                                                                                                        json = (response.problemCriticalityList);
                                                                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                                                                            problemCriticalityObjectStore.put(json[i]);
                                                                                                                                                        }
                                                                                                                                                        this.setState({
                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                        }, () => {
                                                                                                                                                            console.log("M sync after problem criticality state updated---", this.state.syncedMasters)
                                                                                                                                                            // problem
                                                                                                                                                            var problemTransaction = db1.transaction(['problem'], 'readwrite');
                                                                                                                                                            var problemObjectStore = problemTransaction.objectStore('problem');
                                                                                                                                                            json = (response.realmProblemList)
                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                problemObjectStore.put(json[i]);
                                                                                                                                                            }
                                                                                                                                                            this.setState({
                                                                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                            }
                                                                                                                                                                , () => {
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
                                                                                                                                                                            // this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/green/' + i18n.t('static.masterDataSync.success'))
                                                                                                                                                                        }.bind(this)
                                                                                                                                                                    } else {
                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                        this.setState({
                                                                                                                                                                            message: '',
                                                                                                                                                                            message: `static.masterDataSync.syncFailed`
                                                                                                                                                                        },
                                                                                                                                                                            () => {
                                                                                                                                                                                this.hideSecondComponent();
                                                                                                                                                                            })
                                                                                                                                                                    }
                                                                                                                                                                }
                                                                                                                                                            )
                                                                                                                                                        })
                                                                                                                                                    })
                                                                                                                                                })
                                                                                                                                            })
                                                                                                                                        })
                                                                                                                                    })
                                                                                                                                })
                                                                                                                            })
                                                                                                                        })
                                                                                                                    })
                                                                                                                })
                                                                                                            })
                                                                                                        })
                                                                                                    })
                                                                                                })
                                                                                            })
                                                                                        })
                                                                                    })
                                                                                })
                                                                            })
                                                                        })
                                                                    })
                                                                })
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    } else {
                                        this.setState({
                                            message: response.data.messageCode
                                        },
                                            () => {
                                                this.hideSecondComponent();
                                            })
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
                                });
                        } else {
                            this.setState({
                                message: 'static.common.onlinealerttext'
                            },
                                () => {
                                    this.hideSecondComponent();
                                })
                        }
                        // }

                    }.bind(this)
                }.bind(this)
            }.bind(this)
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