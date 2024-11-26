import React, { Component } from 'react';
import {
    Card, CardBody, CardHeader,
    CardFooter, Button, Col, Progress, FormGroup
} from 'reactstrap';
import 'react-select/dist/react-select.min.css';
import moment from 'moment';
import MasterSyncService from '../../api/MasterSyncService.js';
import AuthenticationService from '../Common/AuthenticationService.js';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import i18n from '../../i18n';
import i18next from 'i18next';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { SECRET_KEY, TOTAL_NO_OF_MASTERS_IN_SYNC, INDEXED_DB_VERSION, INDEXED_DB_NAME, SHIPMENT_MODIFIED, DELIVERED_SHIPMENT_STATUS, BATCH_PREFIX, PLANNED_SHIPMENT_STATUS, CANCELLED_SHIPMENT_STATUS } from '../../Constants.js'
import CryptoJS from 'crypto-js'
import UserService from '../../api/UserService';
import { calculateSupplyPlan } from '../SupplyPlan/SupplyPlanCalculations';
import QatProblemActionNew from '../../CommonComponent/QatProblemActionNew'
import { generateRandomAplhaNumericCode, paddingZero, decompressJson } from '../../CommonComponent/JavascriptCommonFunctions';
import { calculateModelingData } from '../DataSet/ModelingDataCalculations.js';
import ProgramService from '../../api/ProgramService';
/**
 * This component is used to sync the master data into QAT
 */
export default class SyncMasterData extends Component {
    constructor(props) {
        super(props);
        this.state = {
            totalMasters: TOTAL_NO_OF_MASTERS_IN_SYNC,
            syncedMasters: 0,
            syncedPercentage: 0,
            message: "",
            loading: true,
            programSynced: []
        }
        this.syncMasters = this.syncMasters.bind(this);
        this.retryClicked = this.retryClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.syncProgramData = this.syncProgramData.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.fetchData = this.fetchData.bind(this);
    }
    /**
     * This function is used to hide the messages that are there in div1 after 30 seconds
     */
    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is used to hide the messages that are there in div2 after 30 seconds
     */
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is used to get user details by user Id on page load
     */
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        document.getElementById("retryButtonDiv").style.display = "none";
        let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
        // UserService.getUserByUserId(decryptedCurUser).then(response => {
        UserService.getUserDetails(decryptedCurUser).then(response => {
            // console.log("Response.data Test@123",response.data);
            var userObj = response.data;
            var user = response.data.user;
            var aclList = []
            user.userAclList.map(item => {
                var acl = item;
                acl.businessFunctionList = userObj.bfAndProgramIdMap[item.roleId].businessFunctionList;
                acl.programList = userObj.bfAndProgramIdMap[item.roleId].programIdList;
                aclList.push(acl);
            });
            user.userAclList = aclList;
            console.log("User Test@123", user);
            localStorage.setItem('user-' + decryptedCurUser, CryptoJS.AES.encrypt(JSON.stringify(response.data.user).toString(), `${SECRET_KEY}`));
            // console.log("Test UserACL",AuthenticationService.checkUserACL(["2008","100"],'ROLE_BF_MANUAL_TAGGING'));
            // console.log("Test UserACL",AuthenticationService.checkUserACL(["2008","2007"],'ROLE_BF_MANUAL_TAGGING'));
            setTimeout(function () {
                this.syncMasters();
            }.bind(this), 500)
        })
        this.hideFirstComponent();
    }
    /**
     * This is used to display the content
     * @returns This returns a progress bar to show progress of the sync
     */
    render() {
        return (
            <div className="animated fadeIn">
                <QatProblemActionNew ref="problemListChild" updateState={undefined} fetchData={this.fetchData} objectStore="programData" page="syncMasterData"></QatProblemActionNew>
                <h6 className="mt-success" style={{ color: this.props.match.params.color }} id="div1">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="pl-md-5" style={{ color: "#BA0C2F" }} id="div2">{this.state.message != "" && i18n.t('static.masterDataSync.masterDataSyncFailed')}</h5>
                <div className="col-md-12" style={{ display: this.state.loading ? "none" : "block" }}>
                    <Col xs="12" sm="12">
                        <Card>
                            <CardHeader>
                                <strong>{i18n.t('static.masterDataSync.masterDataSync')}</strong>
                            </CardHeader>
                            <CardBody>
                                <div className="text-center DarkThColr">{this.state.syncedPercentage}% ({i18next.t('static.masterDataSync.synced')} {this.state.syncedMasters} {i18next.t('static.masterDataSync.of')} {this.state.totalMasters} {i18next.t('static.masterDataSync.masters')})</div>
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
            </div>
        )
    }
    /**
     * This function is used to check pending commit requests for forecast programs and update the readonly flag
     * @param {*} datasetList This is the list of all the forecast programs that user has loaded with their details
     * @param {*} datasetDetailsList This is the list of all the forecast programs with that user has loaded with very less details like readonly flag, id etc
     * @param {*} readonlyProgramIds This is the list of program Ids that are readonly because commit was in progress
     */
    syncDatasetData(datasetList, datasetDetailsList, readonlyProgramIds) {
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            let startDate = '2021-01-01';
            let stopDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD");
            var programIds = readonlyProgramIds;
            var json = {
                startDate: startDate,
                stopDate: stopDate,
                programIds: programIds
            }
            ProgramService.getCommitRequests(json, 3)
                .then(commitRequestResponse => {
                    if (commitRequestResponse.status == 200) {
                        var commitRequestResponseData = commitRequestResponse.data;
                        for (var cr = 0; cr < commitRequestResponseData.length; cr++) {
                            var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                            var userId = userBytes.toString(CryptoJS.enc.Utf8);
                            var prgQPLDetails = datasetDetailsList.filter(c => c.programId == commitRequestResponseData[cr].program.id && c.version == commitRequestResponseData[cr].committedVersionId && c.userId == userId)[0];
                            if (prgQPLDetails != undefined) {
                                var checkIfReadonly = commitRequestResponseData.filter(c => c.program.id == prgQPLDetails.programId && c.committedVersionId == prgQPLDetails.version);
                                var readonly = checkIfReadonly.length > 0 ? 0 : prgQPLDetails.readonly;
                                prgQPLDetails.readonly = readonly;
                                var programQPLDetailsTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                                var programQPLDetailsOs = programQPLDetailsTransaction.objectStore('datasetDetails');
                                programQPLDetailsOs.put(prgQPLDetails);
                            }
                        }
                        for (var i = 0; i < datasetList.length; i++) {
                            calculateModelingData(datasetList[i], this, "syncPage");
                        }
                    }
                })
        }.bind(this)
    }
    /**
     * This function is used to check pending commit requests for supply planning programs and update the readonly flag. This function is also used to sync erp 
     * @param {*} date This is the last sync date
     * @param {*} programList This is the list of all the supply planning programs that user has loaded with their details
     * @param {*} programQPLDetailsList This is the list of all the supply plan programs with that user has loaded with very less details like readonly flag, id etc
     * @param {*} readonlyProgramIds This is the list of program Ids that are readonly because commit was in progress 
     * @param {*} programPlanningUnitList This is the list of program planning unit mapping for all the loaded programs to update the catalog price for planned shipments
     * @param {*} procurementAgentPlanningUnitList This is the list of procurement agent planning unit mapping for all the loaded programs to update the catalog price for planned shipments 
     * @param {*} programMasterList This is the list of program master
     */
    syncProgramData(date, programList, programQPLDetailsList, readonlyProgramIds, programPlanningUnitList, procurementAgentPlanningUnitList, programMasterList) {
        var valid = true;
        var jsonForNewShipmentSync = [];
        for (var pl = 0; pl < programList.length; pl++) {
            var generalDataBytes = CryptoJS.AES.decrypt(programList[pl].programData.generalData, SECRET_KEY);
            var generalData = generalDataBytes.toString(CryptoJS.enc.Utf8);
            var generalJson = JSON.parse(generalData);
            var linkedShipmentsList = generalJson.shipmentLinkingList != null ? generalJson.shipmentLinkingList : [];
            var listOfRoNoAndRoPrimeLineNo = [];
            for (var lsl = 0; lsl < linkedShipmentsList.length; lsl++) {
                if (listOfRoNoAndRoPrimeLineNo.findIndex(c => c.roNo == linkedShipmentsList[lsl].roNo && c.roPrimeLineNo == linkedShipmentsList[lsl].roPrimeLineNo) == -1) {
                    listOfRoNoAndRoPrimeLineNo.push({
                        roNo: linkedShipmentsList[lsl].roNo,
                        roPrimeLineNo: linkedShipmentsList[lsl].roPrimeLineNo
                    })
                }
            }
            var lastSyncDate = date;
            lastSyncDate = moment(generalJson.currentVersion.createdDate).format("YYYY-MM-DD HH:mm:ss")
            if(this.props.location.state != undefined && this.props.location.state.programIds != undefined && this.props.location.state.programIds.includes(programList[pl].programId)){
                lastSyncDate=moment(generalJson.currentVersion.createdDate).subtract(3,'years').format("YYYY-MM-DD HH:mm:ss")
            }
            jsonForNewShipmentSync.push({
                roAndRoPrimeLineNoList: listOfRoNoAndRoPrimeLineNo,
                programId: programList[pl].programId,
                lastSyncDate: moment(lastSyncDate).format("YYYY-MM-DD HH:mm:ss")
            })
        }
        let startDate = '2021-01-01';
        let stopDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD");
        var programIds = readonlyProgramIds;
        var json = {
            startDate: startDate,
            stopDate: stopDate,
            programIds: programIds
        }
        ProgramService.getCommitRequests(json, 3)
            .then(commitRequestResponse => {
                if (commitRequestResponse.status == 200) {
                    var commitRequestResponseData = commitRequestResponse.data;
                    MasterSyncService.getNewShipmentSyncApi(jsonForNewShipmentSync).then(shipmentSyncResponse => {
                        for (var i = 0; i < programList.length; i++) {
                            AuthenticationService.setupAxiosInterceptors();
                            if (localStorage.getItem("sessionType") === 'Online') {
                                MasterSyncService.syncProgram(programList[i].programId, programList[i].version, programList[i].userId, date)
                                    .then(response => {
                                        if (response.status == 200) {
                                            var curUser = AuthenticationService.getLoggedInUserId();
                                            var prog = programList.filter(c => parseInt(c.programId) == parseInt(response.data.programId) && parseInt(c.version) == parseInt(response.data.versionId) && parseInt(c.userId) == parseInt(response.data.userId))[0];
                                            var prgQPLDetails = programQPLDetailsList.filter(c => c.id == prog.id)[0];
                                            var checkIfReadonly = commitRequestResponseData.filter(c => c.program.id == prgQPLDetails.programId && c.committedVersionId == prgQPLDetails.version);
                                            var readonly = checkIfReadonly.length > 0 ? 0 : prgQPLDetails.readonly;
                                            var generalDataBytes = CryptoJS.AES.decrypt((prog).programData.generalData, SECRET_KEY);
                                            var generalData = generalDataBytes.toString(CryptoJS.enc.Utf8);
                                            var generalJson = JSON.parse(generalData);
                                            var planningUnitDataList = (prog).programData.planningUnitDataList;
                                            var actionList = generalJson.actionList;
                                            if (actionList == undefined) {
                                                actionList = []
                                            }
                                            var shipmentBudgetList = generalJson.shipmentBudgetList;
                                            if (shipmentBudgetList == undefined) {
                                                shipmentBudgetList = []
                                            }
                                            if (generalJson.currentVersionNotes == undefined) {
                                                generalJson.currentVersionNotes = response.data.versionNotes;
                                            }
                                            var problemReportList = generalJson.problemReportList;
                                            var shipArray = shipmentSyncResponse.data[response.data.programId].filter(c => c.shipmentActive == true && c.orderActive == true);
                                            var minDateForPPLModify = this.props.location.state != undefined && this.props.location.state.programIds != undefined && this.props.location.state.programIds.includes(prog.id) ? moment(generalJson.currentVersion.createdDate).subtract(3, 'years').format("YYYY-MM-DD HH:mm:ss") : date;
                                            var pplModified = programPlanningUnitList.filter(c => moment(c.lastModifiedDate).format("YYYY-MM-DD HH:mm:ss") >= moment(minDateForPPLModify).format("YYYY-MM-DD HH:mm:ss") && c.program.id == response.data.programId);
                                            var rebuild = false;
                                            if (shipArray.length > 0 || pplModified.length > 0) {
                                                rebuild = true;
                                            }
                                            var minDate = moment.min(shipArray.map(d => moment(d.expectedDeliveryDate)));
                                            var roNoAndRoPrimeLineNoSetFromAPI = [...new Set(shipArray.map(ele => ele.roNo + "|" + ele.roPrimeLineNo))];
                                            var planningUnitList = [];
                                            var linkedShipmentsList = generalJson.shipmentLinkingList != null ? generalJson.shipmentLinkingList.filter(c => c.active == true) : [];
                                            var inactiveLinkedShipmentsList = generalJson.shipmentLinkingList != null ? generalJson.shipmentLinkingList.filter(c => c.active.toString() == "false") : [];
                                            var linkedShipmentsListFilter = linkedShipmentsList.filter(c => roNoAndRoPrimeLineNoSetFromAPI.includes(c.roNo + "|" + c.roPrimeLineNo));
                                            planningUnitList = [...new Set(linkedShipmentsListFilter).map(ele => ele.qatPlanningUnitId)];
                                            for (var ppl = 0; ppl < pplModified.length; ppl++) {
                                                if (!planningUnitList.includes(pplModified[ppl].planningUnit.id)) {
                                                    planningUnitList.push(pplModified[ppl].planningUnit.id);
                                                }
                                            }
                                            for (var pu = 0; pu < planningUnitList.length; pu++) {
                                                var ppuObject = programPlanningUnitList.filter(c => c.planningUnit.id == planningUnitList[pu] && c.program.id == response.data.programId)[0];
                                                var planningUnitDataIndex = (planningUnitDataList).findIndex(c => c.planningUnitId == planningUnitList[pu]);
                                                var programJson = {}
                                                if (planningUnitDataIndex != -1) {
                                                    var planningUnitData = ((planningUnitDataList).filter(c => c.planningUnitId == planningUnitList[pu]))[0];
                                                    var programDataBytes = CryptoJS.AES.decrypt(planningUnitData.planningUnitData, SECRET_KEY);
                                                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                                                    programJson = JSON.parse(programData);
                                                } else {
                                                    programJson = {
                                                        consumptionList: [],
                                                        inventoryList: [],
                                                        shipmentList: [],
                                                        batchInfoList: [],
                                                        supplyPlan: []
                                                    }
                                                }
                                                var shipmentDataList = programJson.shipmentList;
                                                var batchInfoList = programJson.batchInfoList;
                                                var shipArrayForPlanningUnit = linkedShipmentsListFilter.filter(c => c.qatPlanningUnitId == planningUnitList[pu]);
                                                var uniqueRoNoAndRoPrimeLineNoBasedOnPlanningUnitId = [...new Set(shipArrayForPlanningUnit).map(ele => ele.roNo + "|" + ele.roPrimeLineNo)];
                                                for (var j = 0; j < uniqueRoNoAndRoPrimeLineNoBasedOnPlanningUnitId.length; j++) {
                                                    var uniqueKnShipmentNo = [...new Set(shipArray.filter(c => c.roNo + "|" + c.roPrimeLineNo == uniqueRoNoAndRoPrimeLineNoBasedOnPlanningUnitId[j])).map(ele => ele.orderNo + "|" + ele.primeLineNo + "|" + ele.knShipmentNo)];
                                                    var knShipmentNoThatExistsInLinkedShipmentsList = linkedShipmentsListFilter.filter(x => x.roNo + "|" + x.roPrimeLineNo == uniqueRoNoAndRoPrimeLineNoBasedOnPlanningUnitId[j] && !uniqueKnShipmentNo.includes(x.orderNo + "|" + x.primeLineNo + "|" + x.knShipmentNo));
                                                    for (var u = 0; u < uniqueKnShipmentNo.length; u++) {
                                                        var checkIfAlreadyExists = linkedShipmentsList.findIndex(c => c.roNo + "|" + c.roPrimeLineNo == uniqueRoNoAndRoPrimeLineNoBasedOnPlanningUnitId[j] && c.orderNo + "|" + c.primeLineNo + "|" + c.knShipmentNo == uniqueKnShipmentNo[u]);
                                                        if (checkIfAlreadyExists == -1) {
                                                            var linkedShipmentsListBasedOnRoNoAndRoPrimeLineNo = linkedShipmentsList.filter(c => c.roNo + "|" + c.roPrimeLineNo == uniqueRoNoAndRoPrimeLineNoBasedOnPlanningUnitId[j]);
                                                            var index = shipmentDataList.findIndex(c => linkedShipmentsListBasedOnRoNoAndRoPrimeLineNo[0].childShipmentId > 0 ? linkedShipmentsListBasedOnRoNoAndRoPrimeLineNo[0].childShipmentId == c.shipmentId : linkedShipmentsListBasedOnRoNoAndRoPrimeLineNo[0].tempChildShipmentId == c.tempShipmentId);
                                                            var shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo = shipArray.filter(c => c.roNo + "|" + c.roPrimeLineNo == uniqueRoNoAndRoPrimeLineNoBasedOnPlanningUnitId[j] && c.orderNo + "|" + c.primeLineNo + "|" + c.knShipmentNo == uniqueKnShipmentNo[u])
                                                            if (shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].erpShipmentStatus != "Cancelled") {
                                                                var shipmentQty = 0;
                                                                var shipmentARUQty = 0;
                                                                var batchInfo = [];
                                                                var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                                                                var curUser = AuthenticationService.getLoggedInUserId();
                                                                var username = AuthenticationService.getLoggedInUsername();
                                                                shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo.map(item => {
                                                                    shipmentQty += Number(item.erpQty) * Number(linkedShipmentsListBasedOnRoNoAndRoPrimeLineNo[0].conversionFactor) * shipmentDataList[index].realmCountryPlanningUnit.multiplier;
                                                                    shipmentARUQty += Number(item.erpQty) * Number(linkedShipmentsListBasedOnRoNoAndRoPrimeLineNo[0].conversionFactor);
                                                                    var batchNo = item.batchNo;
                                                                    var expiryDate = item.expiryDate;
                                                                    var autoGenerated = false;
                                                                    var shelfLife = ppuObject.shelfLife;
                                                                    var programId1 = paddingZero(response.data.programId, 0, 6);
                                                                    var planningUnitId1 = paddingZero(planningUnitList[pu], 0, 8);
                                                                    autoGenerated = (batchNo == null || batchNo.toString() == "-99" || batchNo == "") ? true : autoGenerated;
                                                                    batchNo = (batchNo == null || batchNo.toString() == "-99" || batchNo == "") ? (BATCH_PREFIX).concat(programId1).concat(planningUnitId1).concat(moment(Date.now()).format("YYMMDD")).concat(generateRandomAplhaNumericCode(3)) : batchNo;
                                                                    expiryDate = expiryDate == "" || expiryDate == null ? moment(item.expectedDeliveryDate).add(shelfLife, 'months').startOf('month').format("YYYY-MM-DD") : expiryDate;
                                                                    batchInfo.push({
                                                                        shipmentTransBatchInfoId: 0,
                                                                        batch: {
                                                                            batchNo: batchNo,
                                                                            expiryDate: moment(expiryDate).endOf('month').format("YYYY-MM-DD"),
                                                                            batchId: 0,
                                                                            autoGenerated: autoGenerated,
                                                                            createdDate: moment(item.expectedDeliveryDate).startOf('month').format("YYYY-MM-DD")
                                                                        },
                                                                        shipmentQty: Number(item.erpQty) * Number(linkedShipmentsListBasedOnRoNoAndRoPrimeLineNo[0].conversionFactor)
                                                                    })
                                                                })
                                                                var tempShipmentId = ppuObject.planningUnit.id.toString().concat(shipmentDataList.length);
                                                                shipmentDataList.push({
                                                                    accountFlag: true,
                                                                    active: true,
                                                                    dataSource: shipmentDataList[index].dataSource,
                                                                    erpFlag: true,
                                                                    localProcurement: false,
                                                                    freightCost: shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].shippingCost,
                                                                    notes: "",
                                                                    planningUnit: shipmentDataList[index].planningUnit,
                                                                    realmCountryPlanningUnit: shipmentDataList[index].realmCountryPlanningUnit,
                                                                    procurementAgent: shipmentDataList[index].procurementAgent,
                                                                    productCost: Number(shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].price / shipmentDataList[index].realmCountryPlanningUnit.multiplier).toFixed(6) * shipmentQty,
                                                                    shipmentQty: (shipmentQty),
                                                                    shipmentRcpuQty: Math.round(shipmentARUQty),
                                                                    rate: Number(Number(shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].price / shipmentDataList[index].realmCountryPlanningUnit).toFixed(6)),
                                                                    shipmentId: 0,
                                                                    shipmentMode: (shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].shipBy == "Land" ? "Road" : shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0] == "Air" ? "Air" : "Sea"),
                                                                    shipmentStatus: shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].qatEquivalentShipmentStatus,
                                                                    suggestedQty: 0,
                                                                    budget: shipmentDataList[index].budget,
                                                                    emergencyOrder: false,
                                                                    currency: shipmentDataList[index].currency,
                                                                    fundingSource: shipmentDataList[index].fundingSource,
                                                                    plannedDate: null,
                                                                    submittedDate: null,
                                                                    approvedDate: null,
                                                                    shippedDate: null,
                                                                    arrivedDate: null,
                                                                    expectedDeliveryDate: shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].expectedDeliveryDate,
                                                                    receivedDate: shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].qatEquivalentShipmentStatus.id == DELIVERED_SHIPMENT_STATUS ? shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].expectedDeliveryDate : null,
                                                                    index: shipmentDataList.length,
                                                                    batchInfoList: batchInfo,
                                                                    orderNo: shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].orderNo,
                                                                    primeLineNo: shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].primeLineNo,
                                                                    parentShipmentId: shipmentDataList[index].parentShipmentId,
                                                                    createdBy: {
                                                                        userId: curUser,
                                                                        username: username
                                                                    },
                                                                    createdDate: curDate,
                                                                    lastModifiedBy: {
                                                                        userId: curUser,
                                                                        username: username
                                                                    },
                                                                    lastModifiedDate: curDate,
                                                                    tempShipmentId: tempShipmentId,
                                                                    tempParentShipmentId: shipmentDataList[index].tempParentShipmentId,
                                                                    parentLinkedShipmentId: null,
                                                                    tempParentLinkedShipmentId: null
                                                                })
                                                                if (shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].qatEquivalentShipmentStatus.id != CANCELLED_SHIPMENT_STATUS) {
                                                                    shipmentBudgetList.push({
                                                                        shipmentAmt: Number(Number(shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].price / shipmentDataList[index].realmCountryPlanningUnit.multiplier).toFixed(6) * shipmentQty) + Number(shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].shippingCost),
                                                                        budgetId: shipmentDataList[index].budget.id,
                                                                        conversionRateToUsd: shipmentDataList[index].currency.conversionRateToUsd,
                                                                        shipmentId: 0,
                                                                        tempShipmentId: tempShipmentId,
                                                                        currencyId: shipmentDataList[index].currency.currencyId
                                                                    })
                                                                }
                                                                if (moment(shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].expectedDeliveryDate).format("YYYY-MM") < moment(minDate).format("YYYY-MM")) {
                                                                    minDate = shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].expectedDeliveryDate;
                                                                }
                                                                for (var bi = 0; bi < batchInfo.length; bi++) {
                                                                    var index1 = batchInfoList.findIndex(c => c.batchNo == batchInfo[bi].batch.batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(batchInfo[bi].batch.expiryDate).format("YYYY-MM") && c.planningUnitId == planningUnitList[pu]);
                                                                    if (index1 == -1) {
                                                                        var batchDetails = {
                                                                            batchId: batchInfo[bi].batch.batchId,
                                                                            batchNo: batchInfo[bi].batch.batchNo,
                                                                            planningUnitId: planningUnitList[pu],
                                                                            expiryDate: batchInfo[bi].batch.expiryDate,
                                                                            createdDate: batchInfo[bi].batch.createdDate,
                                                                            autoGenerated: batchInfo[bi].batch.autoGenerated
                                                                        }
                                                                        batchInfoList.push(batchDetails);
                                                                    } else {
                                                                        batchInfoList[index1].expiryDate = batchInfo[bi].batch.expiryDate;
                                                                        batchInfoList[index1].createdDate = batchInfo[bi].batch.createdDate;
                                                                        batchInfoList[index1].autoGenerated = batchInfo[bi].batch.autoGenerated;
                                                                    }
                                                                }
                                                                linkedShipmentsList.push({
                                                                    shipmentLinkingId: 0,
                                                                    versionId: response.data.versionId,
                                                                    programId: response.data.programId,
                                                                    procurementAgent: shipmentDataList[index].procurementAgent,
                                                                    parentShipmentId: shipmentDataList[index].parentShipmentId,
                                                                    tempParentShipmentId: shipmentDataList[index].tempParentShipmentId,
                                                                    childShipmentId: 0,
                                                                    tempChildShipmentId: shipmentDataList[index].planningUnit.id.toString().concat(shipmentDataList.length - 1),
                                                                    erpPlanningUnit: shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].erpPlanningUnit,
                                                                    roNo: shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].roNo,
                                                                    roPrimeLineNo: shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].roPrimeLineNo,
                                                                    knShipmentNo: shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].knShipmentNo,
                                                                    erpShipmentStatus: shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].erpShipmentStatus,
                                                                    orderNo: shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].orderNo,
                                                                    primeLineNo: shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].primeLineNo,
                                                                    conversionFactor: Number(linkedShipmentsListBasedOnRoNoAndRoPrimeLineNo[0].conversionFactor),
                                                                    qatPlanningUnitId: ppuObject.planningUnit.id,
                                                                    active: true,
                                                                    createdBy: {
                                                                        userId: curUser,
                                                                        username: username
                                                                    },
                                                                    createdDate: curDate,
                                                                    lastModifiedBy: {
                                                                        userId: curUser,
                                                                        username: username
                                                                    },
                                                                    lastModifiedDate: curDate,
                                                                })
                                                            }
                                                        } else {
                                                            var index = shipmentDataList.findIndex(c => linkedShipmentsList[checkIfAlreadyExists].childShipmentId > 0 ? linkedShipmentsList[checkIfAlreadyExists].childShipmentId == c.shipmentId : linkedShipmentsList[checkIfAlreadyExists].tempChildShipmentId == c.tempShipmentId);
                                                            var shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo = shipArray.filter(c => c.roNo + "|" + c.roPrimeLineNo == uniqueRoNoAndRoPrimeLineNoBasedOnPlanningUnitId[j] && c.orderNo + "|" + c.primeLineNo + "|" + c.knShipmentNo == uniqueKnShipmentNo[u])
                                                            var linkedShipmentsListIndex = linkedShipmentsList.findIndex(c => c.roNo + "|" + c.roPrimeLineNo == uniqueRoNoAndRoPrimeLineNoBasedOnPlanningUnitId[j] && c.orderNo + "|" + c.primeLineNo + "|" + c.knShipmentNo == uniqueKnShipmentNo[u]);
                                                            var shipmentQty = 0;
                                                            var shipmentARUQty = 0;
                                                            var batchInfo = [];
                                                            var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                                                            var curUser = AuthenticationService.getLoggedInUserId();
                                                            var username = AuthenticationService.getLoggedInUsername();
                                                            shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo.map(item => {
                                                                shipmentQty += Number(item.erpQty) * Number(linkedShipmentsList[checkIfAlreadyExists].conversionFactor) * Number(shipmentDataList[index].realmCountryPlanningUnit.multiplier);
                                                                shipmentARUQty += Number(item.erpQty) * Number(linkedShipmentsList[checkIfAlreadyExists].conversionFactor);
                                                                var batchNo = item.batchNo;
                                                                var expiryDate = item.expiryDate;
                                                                var autoGenerated = false;
                                                                var shelfLife = ppuObject.shelfLife;
                                                                var programId1 = paddingZero(response.data.programId, 0, 6);
                                                                var planningUnitId1 = paddingZero(planningUnitList[pu], 0, 8);
                                                                autoGenerated = (batchNo == null || batchNo.toString() == "-99" || batchNo == "") ? true : autoGenerated;
                                                                batchNo = (batchNo == null || batchNo.toString() == "-99" || batchNo == "") ? (BATCH_PREFIX).concat(programId1).concat(planningUnitId1).concat(moment(Date.now()).format("YYMMDD")).concat(generateRandomAplhaNumericCode(3)) : batchNo;
                                                                expiryDate = expiryDate == "" || expiryDate == null ? moment(item.expectedDeliveryDate).add(shelfLife, 'months').startOf('month').format("YYYY-MM-DD") : expiryDate;
                                                                batchInfo.push({
                                                                    shipmentTransBatchInfoId: 0,
                                                                    batch: {
                                                                        batchNo: batchNo,
                                                                        expiryDate: moment(expiryDate).endOf('month').format("YYYY-MM-DD"),
                                                                        batchId: 0,
                                                                        autoGenerated: autoGenerated,
                                                                        createdDate: moment(item.expectedDeliveryDate).startOf('month').format("YYYY-MM-DD")
                                                                    },
                                                                    shipmentQty: Number(item.erpQty) * Number(linkedShipmentsList[checkIfAlreadyExists].conversionFactor)
                                                                })
                                                            })
                                                            linkedShipmentsList[linkedShipmentsListIndex].erpShipmentStatus = shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].erpShipmentStatus;
                                                            linkedShipmentsList[linkedShipmentsListIndex].lastModifiedBy.userId = curUser;
                                                            linkedShipmentsList[linkedShipmentsListIndex].lastModifiedBy.username = username;
                                                            linkedShipmentsList[linkedShipmentsListIndex].lastModifiedDate = curDate;
                                                            shipmentDataList[index].shipmentQty = Math.round(shipmentQty);
                                                            shipmentDataList[index].shipmentRcpuQty = (shipmentARUQty);
                                                            shipmentDataList[index].freightCost = shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].shippingCost;
                                                            shipmentDataList[index].productCost = Number(shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].price / shipmentDataList[index].realmCountryPlanningUnit.multiplier).toFixed(6) * shipmentQty;
                                                            shipmentDataList[index].rate = Number(Number(shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].price / shipmentDataList[index].realmCountryPlanningUnit.multiplier).toFixed(6));
                                                            shipmentDataList[index].shipmentMode = (shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].shipBy == "Land" ? "Road" : shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0] == "Air" ? "Air" : "Sea");
                                                            shipmentDataList[index].shipmentStatus = shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].qatEquivalentShipmentStatus;
                                                            shipmentDataList[index].expectedDeliveryDate = shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].expectedDeliveryDate;
                                                            shipmentDataList[index].receivedDate = shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].qatEquivalentShipmentStatus.id == DELIVERED_SHIPMENT_STATUS ? shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].expectedDeliveryDate : null
                                                            shipmentDataList[index].batchInfoList = batchInfo;
                                                            shipmentDataList[index].orderNo = shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].orderNo;
                                                            shipmentDataList[index].primeLineNo = shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].primeLineNo;
                                                            shipmentDataList[index].lastModifiedBy.userId = curUser;
                                                            shipmentDataList[index].lastModifiedBy.username = username;
                                                            shipmentDataList[index].lastModifiedDate = curDate;
                                                            var sblIndex = shipmentBudgetList.findIndex(c => (shipmentDataList[index].shipmentId == 0 ? (c.tempShipmentId == shipmentDataList[index].tempShipmentId) : (c.shipmentId == shipmentDataList[index].shipmentId)));
                                                            if (sblIndex != -1) {
                                                                var productCost = Number(shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].price / shipmentDataList[index].realmCountryPlanningUnit.multiplier).toFixed(6) * shipmentQty;
                                                                var freightCost = shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].shippingCost;
                                                                shipmentBudgetList[sblIndex].shipmentAmt = Number(productCost) + Number(freightCost);
                                                            }
                                                            if (moment(shipmentDataList[index].expectedDeliveryDate).format("YYYY-MM") < moment(minDate).format("YYYY-MM")) {
                                                                minDate = shipmentDataList[index].expectedDeliveryDate;
                                                            }
                                                            if (shipmentDataList[index].receivedDate != null && shipmentDataList[index].receivedDate != "" && shipmentDataList[index].receivedDate != "" && shipmentDataList[index].receivedDate != undefined && moment(shipmentDataList[index].receivedDate).format("YYYY-MM") < moment(minDate).format("YYYY-MM")) {
                                                                minDate = shipmentDataList[index].receivedDate;
                                                            }
                                                            if (moment(shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].expectedDeliveryDate).format("YYYY-MM") < moment(minDate).format("YYYY-MM")) {
                                                                minDate = shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].expectedDeliveryDate;
                                                            }
                                                            for (var bi = 0; bi < batchInfo.length; bi++) {
                                                                var index = batchInfoList.findIndex(c => c.batchNo == batchInfo[bi].batch.batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(batchInfo[bi].batch.expiryDate).format("YYYY-MM") && c.planningUnitId == planningUnitList[pu]);
                                                                if (index == -1) {
                                                                    var batchDetails = {
                                                                        batchId: batchInfo[bi].batch.batchId,
                                                                        batchNo: batchInfo[bi].batch.batchNo,
                                                                        planningUnitId: planningUnitList[pu],
                                                                        expiryDate: batchInfo[bi].batch.expiryDate,
                                                                        createdDate: batchInfo[bi].batch.createdDate,
                                                                        autoGenerated: batchInfo[bi].batch.autoGenerated
                                                                    }
                                                                    batchInfoList.push(batchDetails);
                                                                } else {
                                                                    batchInfoList[index].expiryDate = batchInfo[bi].batch.expiryDate;
                                                                    batchInfoList[index].createdDate = batchInfo[bi].batch.createdDate;
                                                                    batchInfoList[index].autoGenerated = batchInfo[bi].batch.autoGenerated;
                                                                }
                                                            }
                                                        }
                                                    }
                                                    for (var u = 0; u < knShipmentNoThatExistsInLinkedShipmentsList.length; u++) {
                                                        var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                                                        var linkedShipmentsListIndex = linkedShipmentsList.findIndex(c => c.roNo + "|" + c.roPrimeLineNo == uniqueRoNoAndRoPrimeLineNoBasedOnPlanningUnitId[j] && c.knShipmentNo == knShipmentNoThatExistsInLinkedShipmentsList[u].knShipmentNo && c.orderNo == knShipmentNoThatExistsInLinkedShipmentsList[u].orderNo && c.primeLineNo == knShipmentNoThatExistsInLinkedShipmentsList[u].primeLineNo);
                                                        var linkedShipmentsListFilter1 = linkedShipmentsList.filter(c => c.roNo + "|" + c.roPrimeLineNo == uniqueRoNoAndRoPrimeLineNoBasedOnPlanningUnitId[j] && c.knShipmentNo == knShipmentNoThatExistsInLinkedShipmentsList[u].knShipmentNo && c.orderNo == knShipmentNoThatExistsInLinkedShipmentsList[u].orderNo && c.primeLineNo == knShipmentNoThatExistsInLinkedShipmentsList[u].primeLineNo);
                                                        linkedShipmentsList[linkedShipmentsListIndex].active = false;
                                                        linkedShipmentsList[linkedShipmentsListIndex].lastModifiedBy.userId = curUser;
                                                        linkedShipmentsList[linkedShipmentsListIndex].lastModifiedBy.username = username;
                                                        linkedShipmentsList[linkedShipmentsListIndex].lastModifiedDate = curDate;
                                                        var checkIfThereIsOnlyOneChildShipmentOrNot = linkedShipmentsList.filter(c => (linkedShipmentsListFilter1[0].parentShipmentId > 0 ? c.parentShipmentId == linkedShipmentsListFilter1[0].parentShipmentId : c.tempParentShipmentId == linkedShipmentsListFilter1[0].tempParentShipmentId) && c.active == true);
                                                        var activateParentShipment = false;
                                                        if (checkIfThereIsOnlyOneChildShipmentOrNot.length == 0 && linkedShipmentsList[linkedShipmentsListIndex].shipmentLinkingId==0) {
                                                            activateParentShipment = true;
                                                        }
                                                        var shipmentIndex = shipmentDataList.findIndex(c => linkedShipmentsList[linkedShipmentsListIndex].childShipmentId > 0 ? c.shipmentId == linkedShipmentsList[linkedShipmentsListIndex].childShipmentId : c.tempShipmentId == linkedShipmentsList[linkedShipmentsListIndex].tempChildShipmentId);
                                                        if(linkedShipmentsList[linkedShipmentsListIndex].shipmentLinkingId==0){
                                                        shipmentDataList[shipmentIndex].active = false;
                                                        }else{
                                                            shipmentDataList[shipmentIndex].erpFlag = false;
                                                        }
                                                        shipmentBudgetList=shipmentBudgetList.filter(c=>(shipmentDataList[shipmentIndex].shipmentId>0?(c.shipmentId!=shipmentDataList[shipmentIndex].shipmentId):(c.tempShipmentId!=shipmentDataList[shipmentIndex].tempShipmentId)));
                                                        shipmentDataList[shipmentIndex].lastModifiedBy.userId = curUser;
                                                        shipmentDataList[shipmentIndex].lastModifiedBy.username = username;
                                                        shipmentDataList[shipmentIndex].lastModifiedDate = curDate;
                                                        if (moment(minDate).format("YYYY-MM-DD") > moment(shipmentDataList[shipmentIndex].expectedDeliveryDate).format("YYYY-MM-DD")) {
                                                            minDate = moment(shipmentDataList[shipmentIndex].expectedDeliveryDate).format("YYYY-MM-DD");
                                                        }
                                                        if (shipmentDataList[shipmentIndex].receivedDate != null && shipmentDataList[shipmentIndex].receivedDate != "" && shipmentDataList[shipmentIndex].receivedDate != undefined && moment(minDate).format("YYYY-MM-DD") > moment(shipmentDataList[shipmentIndex].receivedDate).format("YYYY-MM-DD")) {
                                                            minDate = moment(shipmentDataList[shipmentIndex].receivedDate).format("YYYY-MM-DD");
                                                        }
                                                        if (activateParentShipment) {
                                                            var parentShipmentIndex = shipmentDataList.findIndex(c => linkedShipmentsListFilter1[0].parentShipmentId > 0 ? c.shipmentId == linkedShipmentsListFilter1[0].parentShipmentId : c.tempShipmentId == linkedShipmentsListFilter1[0].tempParentShipmentId);
                                                            shipmentDataList[parentShipmentIndex].active = true;
                                                            shipmentDataList[parentShipmentIndex].erpFlag = false;
                                                            shipmentDataList[parentShipmentIndex].lastModifiedBy.userId = curUser;
                                                            shipmentDataList[parentShipmentIndex].lastModifiedBy.username = username;
                                                            shipmentDataList[parentShipmentIndex].lastModifiedDate = curDate;
                                                            var sblIndex = shipmentBudgetList.findIndex(c => (shipmentDataList[parentShipmentIndex].shipmentId == 0 ? (c.tempShipmentId == shipmentDataList[parentShipmentIndex].tempShipmentId) : (c.shipmentId == shipmentDataList[parentShipmentIndex].shipmentId)));
                                                            if (sblIndex == -1) {
                                                                shipmentBudgetList.push({
                                                                    shipmentAmt: Number(shipmentDataList[parentShipmentIndex].productCost) + Number(shipmentDataList[parentShipmentIndex].freightCost),
                                                                    budgetId: shipmentDataList[parentShipmentIndex].budget.id,
                                                                    conversionRateToUsd: shipmentDataList[parentShipmentIndex].currency.conversionRateToUsd,
                                                                    shipmentId: shipmentDataList[parentShipmentIndex].shipmentId,
                                                                    tempShipmentId: shipmentDataList[parentShipmentIndex].tempShipmentId,
                                                                    currencyId: shipmentDataList[parentShipmentIndex].currency.currencyId
                                                                })
                                                            } else {
                                                                shipmentBudgetList[sblIndex].shipmentAmt = Number(shipmentDataList[parentShipmentIndex].productCost) + Number(shipmentDataList[parentShipmentIndex].freightCost);
                                                                shipmentBudgetList[sblIndex].budgetId = shipmentDataList[parentShipmentIndex].budget.id;
                                                                shipmentBudgetList[sblIndex].conversionRateToUsd = shipmentDataList[parentShipmentIndex].currency.conversionRateToUsd;
                                                                shipmentBudgetList[sblIndex].currencyId = shipmentDataList[parentShipmentIndex].currency.currencyId;
                                                            }
                                                            if (moment(minDate).format("YYYY-MM-DD") > moment(shipmentDataList[parentShipmentIndex].expectedDeliveryDate).format("YYYY-MM-DD")) {
                                                                minDate = moment(shipmentDataList[parentShipmentIndex].expectedDeliveryDate).format("YYYY-MM-DD");
                                                            }
                                                            if (shipmentDataList[parentShipmentIndex].receivedDate != null && shipmentDataList[parentShipmentIndex].receivedDate != "" && shipmentDataList[parentShipmentIndex].receivedDate != undefined && moment(minDate).format("YYYY-MM-DD") > moment(shipmentDataList[parentShipmentIndex].receivedDate).format("YYYY-MM-DD")) {
                                                                minDate = moment(shipmentDataList[parentShipmentIndex].receivedDate).format("YYYY-MM-DD");
                                                            }
                                                            var linkedParentShipmentIdList = shipmentDataList.filter(c => linkedShipmentsListFilter1[0].parentShipmentId > 0 ? (c.parentLinkedShipmentId == linkedShipmentsListFilter1[0].parentShipmentId) : (c.tempParentLinkedShipmentId == linkedShipmentsListFilter1[0].tempParentShipmentId));
                                                            for (var l = 0; l < linkedParentShipmentIdList.length; l++) {
                                                                var parentShipmentIndex1 = shipmentDataList.findIndex(c => linkedParentShipmentIdList[l].shipmentId > 0 ? c.shipmentId == linkedParentShipmentIdList[l].shipmentId : c.tempShipmentId == linkedParentShipmentIdList[l].tempShipmentId);
                                                                shipmentDataList[parentShipmentIndex1].active = true;
                                                                var sblIndex = shipmentBudgetList.findIndex(c => (shipmentDataList[parentShipmentIndex1].shipmentId == 0 ? (c.tempShipmentId == shipmentDataList[parentShipmentIndex1].tempShipmentId) : (c.shipmentId == shipmentDataList[parentShipmentIndex1].shipmentId)));
                                                                if (sblIndex == -1) {
                                                                    shipmentBudgetList.push({
                                                                        shipmentAmt: Number(shipmentDataList[parentShipmentIndex1].productCost) + Number(shipmentDataList[parentShipmentIndex1].freightCost),
                                                                        budgetId: shipmentDataList[parentShipmentIndex1].budget.id,
                                                                        conversionRateToUsd: shipmentDataList[parentShipmentIndex1].currency.conversionRateToUsd,
                                                                        shipmentId: shipmentDataList[parentShipmentIndex1].shipmentId,
                                                                        tempShipmentId: shipmentDataList[parentShipmentIndex1].tempShipmentId,
                                                                        currencyId: shipmentDataList[parentShipmentIndex1].currency.currencyId
                                                                    })
                                                                } else {
                                                                    shipmentBudgetList[sblIndex].shipmentAmt = Number(shipmentDataList[parentShipmentIndex1].productCost) + Number(shipmentDataList[parentShipmentIndex1].freightCost);
                                                                    shipmentBudgetList[sblIndex].budgetId = shipmentDataList[parentShipmentIndex1].budget.id;
                                                                    shipmentBudgetList[sblIndex].conversionRateToUsd = shipmentDataList[parentShipmentIndex1].currency.conversionRateToUsd;
                                                                    shipmentBudgetList[sblIndex].currencyId = shipmentDataList[parentShipmentIndex1].currency.currencyId;
                                                                }
                                                                shipmentDataList[parentShipmentIndex1].erpFlag = false;
                                                                shipmentDataList[parentShipmentIndex1].lastModifiedBy.userId = curUser;
                                                                shipmentDataList[parentShipmentIndex1].lastModifiedBy.username = username;
                                                                shipmentDataList[parentShipmentIndex1].lastModifiedDate = curDate;
                                                                shipmentDataList[parentShipmentIndex1].parentLinkedShipmentId = null;
                                                                shipmentDataList[parentShipmentIndex1].tempParentLinkedShipmentId = null;
                                                                if (moment(minDate).format("YYYY-MM-DD") > moment(shipmentDataList[parentShipmentIndex1].expectedDeliveryDate).format("YYYY-MM-DD")) {
                                                                    minDate = moment(shipmentDataList[parentShipmentIndex1].expectedDeliveryDate).format("YYYY-MM-DD");
                                                                }
                                                                if (shipmentDataList[parentShipmentIndex1].receivedDate != null && shipmentDataList[parentShipmentIndex1].receivedDate != "" && shipmentDataList[parentShipmentIndex1].receivedDate != undefined && moment(minDate).format("YYYY-MM-DD") > moment(shipmentDataList[parentShipmentIndex1].receivedDate).format("YYYY-MM-DD")) {
                                                                    minDate = moment(shipmentDataList[parentShipmentIndex1].receivedDate).format("YYYY-MM-DD");
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                programJson.shipmentList = shipmentDataList;
                                                programJson.batchInfoList = batchInfoList;
                                                if (planningUnitDataIndex != -1) {
                                                    planningUnitDataList[planningUnitDataIndex].planningUnitData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                                                } else {
                                                    planningUnitDataList.push({ planningUnitId: planningUnitList[pu], planningUnitData: (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString() });
                                                }
                                            }
                                            // var changedPlanningUnits = [];
                                            // var minDateForModify = this.props.location.state != undefined && this.props.location.state.programIds != undefined && this.props.location.state.programIds.includes(prog.id) ? moment(generalJson.currentVersion.createdDate).subtract(3,'years').format("YYYY-MM-DD HH:mm:ss") : moment(date).subtract(3,'years').format("YYYY-MM-DD HH:mm:ss");
                                            // programPlanningUnitList.map(c => {
                                            //     var programPlanningUnitProcurementAgentPrices = c.programPlanningUnitProcurementAgentPrices.filter(c => moment(c.lastModifiedDate).format("YYYY-MM-DD") >= moment(minDateForModify).format("YYYY-MM-DD"));
                                            //     if (programPlanningUnitProcurementAgentPrices.length > 0) {
                                            //         changedPlanningUnits.push(c.planningUnit.id)
                                            //     }
                                            // });
                                            // var planningUnitListsFromProcurementAgentPlanningUnit = [...new Set(procurementAgentPlanningUnitList.filter(c => moment(c.lastModifiedDate).format("YYYY-MM-DD") >= moment(minDateForModify).format("YYYY-MM-DD")).map(ele => ele.planningUnit.id))];
                                            // var programPlanningUnitUpdated = [...new Set(programPlanningUnitList.filter(c => moment(c.lastModifiedDate).format("YYYY-MM-DD") >= moment(minDateForModify).format("YYYY-MM-DD")).map(ele => ele.planningUnit.id))];
                                            // var overallList = [...new Set(changedPlanningUnits.concat(planningUnitListsFromProcurementAgentPlanningUnit).concat(programPlanningUnitUpdated)).map(ele => ele)]
                                            var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                                            var curUser = AuthenticationService.getLoggedInUserId();
                                            var username = AuthenticationService.getLoggedInUsername();
                                            for (var ol = 0; ol < planningUnitDataList.length; ol++) {
                                                // var planningUnitDataIndex = (planningUnitDataList).findIndex(c => c.planningUnitId == planningUnitDataList[ol].planningUnitId);
                                                var programJson = {}
                                                // if (planningUnitDataIndex != -1) {
                                                var planningUnitData = planningUnitDataList[ol];
                                                var programDataBytes = CryptoJS.AES.decrypt(planningUnitData.planningUnitData, SECRET_KEY);
                                                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                                                programJson = JSON.parse(programData);
                                                // } else {
                                                // programJson = {
                                                // consumptionList: [],
                                                // inventoryList: [],
                                                // shipmentList: [],
                                                // batchInfoList: [],
                                                // supplyPlan: []
                                                // }
                                                // }
                                                var shipmentDataList = programJson.shipmentList;
                                                var getPlannedShipments = shipmentDataList.filter(c => c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS);

                                                for (var pss = 0; pss < getPlannedShipments.length; pss++) {
                                                    var pricePerUnit = 0;
                                                    var lastModifiedDateForShipment="";
                                                    var ppu = programPlanningUnitList.filter(c => c.program.id == generalJson.programId && c.planningUnit.id == getPlannedShipments[pss].planningUnit.id);
                                                    var programPriceList = ppu[0].programPlanningUnitProcurementAgentPrices.filter(c => c.program.id == generalJson.programId && c.procurementAgent.id == getPlannedShipments[pss].procurementAgent.id && c.planningUnit.id == getPlannedShipments[pss].planningUnit.id && c.active);
                                                    if (programPriceList.length > 0) {
                                                        pricePerUnit = Number(programPriceList[0].price);
                                                        lastModifiedDateForShipment=programPriceList[0].lastModifiedDate;
                                                    } else {
                                                        var procurementAgentPlanningUnit = procurementAgentPlanningUnitList.filter(c => c.procurementAgent.id == getPlannedShipments[pss].procurementAgent.id && c.planningUnit.id == getPlannedShipments[pss].planningUnit.id && c.active);
                                                        if (procurementAgentPlanningUnit.length > 0) {
                                                            pricePerUnit = Number(procurementAgentPlanningUnit[0].catalogPrice);
                                                            lastModifiedDateForShipment=procurementAgentPlanningUnit[0].lastModifiedDate;
                                                        } else {
                                                            pricePerUnit = ppu[0].catalogPrice
                                                            lastModifiedDateForShipment=ppu[0].lastModifiedDate;
                                                        }
                                                    }
                                                    var lastSyncDateForShipments = date;
                                                    if(this.props.location.state != undefined && this.props.location.state.programIds != undefined && this.props.location.state.programIds.includes(generalJson.programId)){
                                                        lastSyncDateForShipments=moment(generalJson.currentVersion.createdDate).format("YYYY-MM-DD HH:mm:ss");
                                                    }
                                                    if(moment(lastModifiedDateForShipment).format("YYYY-MM-DD HH:mm:ss")>moment(lastSyncDateForShipments).format("YYYY-MM-DD HH:mm:ss")){
                                                    var shipmentIndex = shipmentDataList.findIndex(c => c.shipmentId > 0 ? c.shipmentId == getPlannedShipments[pss].shipmentId : c.tempShipmentId == getPlannedShipments[pss].tempShipmentId)
                                                    shipmentDataList[shipmentIndex].rate = Number(pricePerUnit / shipmentDataList[shipmentIndex].currency.conversionRateToUsd).toFixed(2)
                                                    var productCost = Math.round(Number(pricePerUnit / shipmentDataList[shipmentIndex].currency.conversionRateToUsd).toFixed(2) * shipmentDataList[shipmentIndex].shipmentQty)
                                                    shipmentDataList[shipmentIndex].productCost = productCost;
                                                    if (getPlannedShipments[pss].autoGeneratedFreight != undefined && getPlannedShipments[pss].autoGeneratedFreight.toString() != "false") {
                                                        var programPriceList = ppu[0].programPlanningUnitProcurementAgentPrices.filter(c => c.program.id == generalJson.programId && c.procurementAgent.id == getPlannedShipments[pss].procurementAgent.id && c.active);
                                                        var programFilter = programMasterList.filter(c => c.programId == generalJson.programId);
                                                        var freightPercentage = 0;
                                                        if (shipmentDataList[shipmentIndex].shipmentMode == "Air") {
                                                            var freightPercentage = programFilter[0].airFreightPerc;
                                                            if (programPriceList.length > 0) {
                                                                var programPAPU = programPriceList.filter(c => c.planningUnit.id == getPlannedShipments[pss].planningUnit.id);
                                                                if (programPAPU.length > 0 && programPAPU[0].airFreightPerc > 0) {
                                                                    freightPercentage = programPAPU[0].airFreightPerc;
                                                                } else {
                                                                    var programPA = programPriceList.filter(c => c.planningUnit.id == -1);
                                                                    if (programPA.length > 0 && programPA[0].airFreightPerc) {
                                                                        freightPercentage = programPAPU[0].airFreightPerc;
                                                                    }
                                                                }
                                                            }
                                                        } else if (shipmentDataList[shipmentIndex].shipmentMode == "Road") {
                                                            var freightPercentage = programFilter[0].roadFreightPerc;
                                                            if (programPriceList.length > 0) {
                                                                var programPAPU = programPriceList.filter(c => c.planningUnit.id == getPlannedShipments[pss].planningUnit.id);
                                                                if (programPAPU.length > 0 && programPAPU[0].roadFreightPerc > 0) {
                                                                    freightPercentage = programPAPU[0].roadFreightPerc;
                                                                } else {
                                                                    var programPA = programPriceList.filter(c => c.planningUnit.id == -1);
                                                                    if (programPA.length > 0 && programPA[0].roadFreightPerc) {
                                                                        freightPercentage = programPAPU[0].roadFreightPerc;
                                                                    }
                                                                }
                                                            }
                                                        } else {
                                                            var freightPercentage = programFilter[0].seaFreightPerc;
                                                            if (programPriceList.length > 0) {
                                                                var programPAPU = programPriceList.filter(c => c.planningUnit.id == getPlannedShipments[pss].planningUnit.id);
                                                                if (programPAPU.length > 0 && programPAPU[0].seaFreightPerc > 0) {
                                                                    freightPercentage = programPAPU[0].seaFreightPerc;
                                                                } else {
                                                                    var programPA = programPriceList.filter(c => c.planningUnit.id == -1);
                                                                    if (programPA.length > 0 && programPA[0].seaFreightPerc) {
                                                                        freightPercentage = programPAPU[0].seaFreightPerc;
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        shipmentDataList[shipmentIndex].freightCost = Number(Number(productCost) * (Number(Number(freightPercentage) / 100))).toFixed(2);
                                                    }
                                                    var sblIndex = shipmentBudgetList.findIndex(c => (shipmentDataList[shipmentIndex].shipmentId == 0 ? (c.tempShipmentId == shipmentDataList[shipmentIndex].tempShipmentId) : (c.shipmentId == shipmentDataList[shipmentIndex].shipmentId)));
                                                    if (sblIndex == -1) {
                                                        if (shipmentDataList[shipmentIndex].active.toString() == "true" && shipmentDataList[shipmentIndex].accountFlag.toString() == "true" && shipmentDataList[shipmentIndex].shipmentStatus.id != CANCELLED_SHIPMENT_STATUS) {
                                                            shipmentBudgetList.push({
                                                                shipmentAmt: Number(shipmentDataList[shipmentIndex].productCost) + Number(shipmentDataList[shipmentIndex].freightCost),
                                                                budgetId: shipmentDataList[shipmentIndex].budget.id,
                                                                conversionRateToUsd: shipmentDataList[shipmentIndex].currency.conversionRateToUsd,
                                                                shipmentId: shipmentDataList[shipmentIndex].shipmentId,
                                                                tempShipmentId: shipmentDataList[shipmentIndex].tempShipmentId,
                                                                currencyId: shipmentDataList[shipmentIndex].currency.currencyId
                                                            })
                                                        }
                                                    } else {
                                                        shipmentBudgetList[sblIndex].shipmentAmt = Number(shipmentDataList[shipmentIndex].productCost) + Number(shipmentDataList[shipmentIndex].freightCost);
                                                        shipmentBudgetList[sblIndex].budgetId = shipmentDataList[shipmentIndex].budget.id;
                                                        shipmentBudgetList[sblIndex].conversionRateToUsd = shipmentDataList[shipmentIndex].currency.conversionRateToUsd;
                                                        shipmentBudgetList[sblIndex].currencyId = shipmentDataList[shipmentIndex].currency.currencyId;
                                                    }
                                                    shipmentDataList[shipmentIndex].lastModifiedBy.userId = curUser;
                                                    shipmentDataList[shipmentIndex].lastModifiedBy.username = username;
                                                    shipmentDataList[shipmentIndex].lastModifiedDate = curDate;
                                                }
                                                }
                                                programJson.shipmentList = shipmentDataList;
                                                // if (planningUnitDataIndex != -1) {
                                                planningUnitDataList[ol].planningUnitData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                                                // } else {
                                                // planningUnitDataList.push({ planningUnitId: planningUnitList[pu], planningUnitData: (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString() });
                                                // }
                                            }
                                            if (pplModified.length > 0) {
                                                minDate = null;
                                            }
                                            var problemReportArray = response.data.problemReportList;
                                            for (var pr = 0; pr < problemReportArray.length; pr++) {
                                                var index = problemReportList.findIndex(c => c.problemReportId == problemReportArray[pr].problemReportId)
                                                if (index == -1) {
                                                    problemReportList.push(problemReportArray[pr]);
                                                } else {
                                                    problemReportList[index].reviewed = problemReportArray[pr].reviewed;
                                                    problemReportList[index].problemStatus = problemReportArray[pr].problemStatus;
                                                    problemReportList[index].reviewNotes = problemReportArray[pr].reviewNotes;
                                                    problemReportList[index].reviewedDate = (problemReportArray[pr].reviewedDate);
                                                    var problemReportTransList = problemReportList[index].problemTransList;
                                                    var curProblemReportTransList = problemReportArray[pr].problemTransList;
                                                    for (var cpr = 0; cpr < curProblemReportTransList.length; cpr++) {
                                                        var index1 = problemReportTransList.findIndex(c => c.problemReportTransId == curProblemReportTransList[cpr].problemReportTransId);
                                                        if (index1 == -1) {
                                                            problemReportTransList.push(curProblemReportTransList[cpr]);
                                                        } else {
                                                            problemReportTransList[index1] = curProblemReportTransList[cpr];
                                                        }
                                                    }
                                                    problemReportList[index].problemReportTransList = problemReportTransList;
                                                }
                                            }
                                            for (var p = 0; p < planningUnitList.length; p++) {
                                                actionList.push({
                                                    planningUnitId: planningUnitList[p],
                                                    type: SHIPMENT_MODIFIED,
                                                    date: minDate != null ? moment(minDate).startOf('month').format("YYYY-MM-DD") : moment(Date.now()).startOf('month').format("YYYY-MM-DD")
                                                })
                                            }
                                            generalJson.actionList = actionList;
                                            generalJson.lastModifiedDate=moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                                            generalJson.shipmentBudgetList = shipmentBudgetList;
                                            generalJson.shipmentLinkingList = linkedShipmentsList.concat(inactiveLinkedShipmentsList);
                                            generalJson.problemReportList = problemReportList;
                                            prgQPLDetails.openCount = (problemReportList.filter(c => c.problemStatus.id == 1 && c.planningUnitActive != false && c.regionActive != false)).length;
                                            prgQPLDetails.addressedCount = (problemReportList.filter(c => c.problemStatus.id == 3 && c.planningUnitActive != false && c.regionActive != false)).length;
                                            prgQPLDetails.readonly = readonly;
                                            prog.programData.planningUnitDataList = planningUnitDataList;
                                            prog.programData.generalData = (CryptoJS.AES.encrypt(JSON.stringify(generalJson), SECRET_KEY)).toString();
                                            var db1;
                                            getDatabase();
                                            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                                            openRequest.onerror = function (event) {
                                                if (document.getElementById('div1') != null) {
                                                    document.getElementById('div1').style.display = 'none';
                                                }
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
                                                    var programQPLDetailsTransaction = db1.transaction(['programQPLDetails'], 'readwrite');
                                                    var programQPLDetailsOs = programQPLDetailsTransaction.objectStore('programQPLDetails');
                                                    var programQPLDetailsRequest = programQPLDetailsOs.put(prgQPLDetails);
                                                    programQPLDetailsRequest.onsuccess = function (event) {
                                                        var rebuildQPL = false;
                                                        if (this.props.location.state != undefined && this.props.location.state.programIds != undefined) {
                                                            if (this.props.location.state.programIds.includes(prog.id)) {
                                                                rebuildQPL = true;
                                                            }
                                                        }
                                                        calculateSupplyPlan(prog.id, 0, 'programData', 'masterDataSync', this, planningUnitList, minDate, this.refs.problemListChild, rebuild, rebuildQPL);
                                                    }.bind(this)
                                                }.bind(this)
                                            }.bind(this)
                                        } else {
                                            valid = false;
                                            this.fetchData(1, programList[i].id);
                                        }
                                    }).catch(error => {
                                        this.fetchData(1, 1);
                                        if (error.message === "Network Error") {
                                        } else {
                                            switch (error.response ? error.response.status : "") {
                                                case 500:
                                                case 401:
                                                case 404:
                                                case 406:
                                                case 412:
                                                    break;
                                                default:
                                                    break;
                                            }
                                        }
                                    });
                            } else {
                                valid = false;
                            }
                        }
                    })
                }
            })
        // return valid;
    }
    /**
     * This function is used to update the count of progress bar
     * @param {*} hasPrograms This is true if the progress bar count should be updated for program. False if the progress bar count should be updated for masters
     * @param {*} programId This is the program Id for which the progress bar count should be updated
     */
    fetchData(hasPrograms, programId) {
        var realmId = AuthenticationService.getRealmId();
        if (hasPrograms != 0) {
            var programSynced = this.state.programSynced;
            var indexForProgram = -1;
            if (programId != 1) {
                indexForProgram = programSynced.findIndex(c => c == programId);
            }
            var syncCount = TOTAL_NO_OF_MASTERS_IN_SYNC;
            if (indexForProgram == -1) {
                programSynced.push(programId);
                syncCount = syncCount + programSynced.length;
            }
            this.setState({
                syncedMasters: syncCount,
                syncedPercentage: Math.floor(((syncCount) / this.state.totalMasters) * 100)
            })
        }
        if (this.state.syncedMasters === this.state.totalMasters) {
            var db1;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['lastSyncDate'], 'readwrite');
                var lastSyncDateTransaction = transaction.objectStore('lastSyncDate');
                var updatedLastSyncDateJson = {
                    lastSyncDate: this.state.updatedSyncDate,
                    id: 0
                }
                var updateLastSyncDate = lastSyncDateTransaction.put(updatedLastSyncDateJson)
                var updatedLastSyncDateJson1 = {
                    lastSyncDate: this.state.updatedSyncDate,
                    id: realmId
                }
                var updateLastSyncDate = lastSyncDateTransaction.put(updatedLastSyncDateJson1)
                updateLastSyncDate.onsuccess = function (event) {
                    document.getElementById("retryButtonDiv").style.display = "none";
                    let id = AuthenticationService.displayDashboardBasedOnRole();
                    if (this.props.location.state != undefined && this.props.location.state.treeId != "") {
                        this.props.history.push(`/dataSet/buildTree/treeServer/` + `${this.props.location.state.treeId}` + '/' + `${this.props.location.state.programIds}` + `/2`)
                    } else {
                        if (this.props.location.state != undefined && this.props.location.state.programIds != undefined && this.props.location.state.programIds.length > 0) {
                            this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/green/' + i18n.t('static.programLoadedAndmasterDataSync.success'))
                        } else {
                            this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/green/' + i18n.t('static.masterDataSync.success'))
                        }
                    }
                }.bind(this)
            }.bind(this)
        }
    }
    /**
     * This function is used to sync all the masters on page load
     */
    syncMasters() {
        this.setState({ loading: false })
        if (localStorage.getItem("sessionType") === 'Online') {
            var db1;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onsuccess = function (e) {
                var realmId = AuthenticationService.getRealmId();
                db1 = e.target.result;
                var transaction = db1.transaction(['lastSyncDate'], 'readwrite');
                var lastSyncDateTransaction = transaction.objectStore('lastSyncDate');
                var updatedSyncDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                this.setState({
                    updatedSyncDate: updatedSyncDate
                })
                var lastSyncDateRequest = lastSyncDateTransaction.getAll();
                lastSyncDateRequest.onsuccess = function (event) {
                    var lastSyncDate = lastSyncDateRequest.result[0];
                    var result = lastSyncDateRequest.result;
                    for (var i = 0; i < result.length; i++) {
                        if (result[i].id == realmId) {
                            var lastSyncDateRealm = lastSyncDateRequest.result[i];
                        }
                        if (result[i].id === 0) {
                            var lastSyncDate = lastSyncDateRequest.result[i];
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
                    if (this.props.location.state != undefined && this.props.location.state.isFullSync != undefined && this.props.location.state.isFullSync == true) {
                        lastSyncDateRealm = '2020-01-01 00:00:00'
                    }
                    lastSyncDateRealm = moment(lastSyncDateRealm).subtract('1', 'days').format("YYYY-MM-DD HH:mm:ss")
                    var transaction = db1.transaction(['programData'], 'readwrite');
                    var program = transaction.objectStore('programData');
                    var pGetRequest = program.getAll();
                    pGetRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext')
                        })
                    };
                    pGetRequest.onsuccess = function (event) {
                        var myResult = [];
                        myResult = pGetRequest.result;
                        var validation = true;
                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                        var userId = userBytes.toString(CryptoJS.enc.Utf8);
                        var pIds = [];
                        var tm = this.state.totalMasters;

                        myResult.filter(c => c.userId == userId).map(program => {
                            pIds.push(program.programId);
                        });
                        var programQPLDetailsTransaction = db1.transaction(['programQPLDetails'], 'readwrite');
                        var programQPLDetailsOs = programQPLDetailsTransaction.objectStore('programQPLDetails');
                        var programQPLDetailsJsonRequest = programQPLDetailsOs.getAll();
                        programQPLDetailsJsonRequest.onsuccess = function (e) {
                            var programQPLDetailsJson = programQPLDetailsJsonRequest.result;
                            var readonlyProgramJson = programQPLDetailsJson.filter(c => c.readonly);
                            var readonlyProgramIds = [];
                            for (var rp = 0; rp < readonlyProgramJson.length; rp++) {
                                readonlyProgramIds.push(readonlyProgramJson[rp].programId);
                            }
                            var datasetTransaction = db1.transaction(['datasetData'], 'readwrite');
                            var datasetOs = datasetTransaction.objectStore('datasetData');
                            var datasetRequest = datasetOs.getAll();
                            datasetRequest.onsuccess = function (e) {
                                var ddatasetTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                                var ddatasetOs = ddatasetTransaction.objectStore('datasetDetails');
                                var ddatasetRequest = ddatasetOs.getAll();
                                ddatasetRequest.onsuccess = function (e) {
                                    var datasetDetailsList = ddatasetRequest.result.filter(c => c.readonly == 1);
                                    var readonlyDatasetIds = [];
                                    for (var rp = 0; rp < datasetDetailsList.length; rp++) {
                                        readonlyDatasetIds.push(datasetDetailsList[rp].programId);
                                    }
                                    var datasetList = datasetRequest.result;
                                    var datasetListFiltered = [];
                                    if (this.props.location.state != undefined && this.props.location.state.programIds != undefined) {
                                        datasetListFiltered = datasetList.filter(c => (this.props.location.state.programIds).includes(c.id));
                                    }
                                    datasetList.filter(c => c.userId == userId).map(program => {
                                        pIds.push(program.programId);
                                    });
                                    this.setState({
                                        totalMasters: tm + myResult.length + datasetListFiltered.length
                                    })

                                    if (validation) {
                                        AuthenticationService.setupAxiosInterceptors();
                                        if (localStorage.getItem("sessionType") === 'Online' && window.getComputedStyle(document.getElementById("retryButtonDiv")).display == "none") {
                                            MasterSyncService.getSyncAllMastersForProgram(lastSyncDateRealm, pIds)
                                                .then(response => {
                                                    if (response.status == 200) {
                                                        response.data = decompressJson(response.data);
                                                        var response = response.data;
                                                        var cC = db1.transaction(['country'], 'readwrite');
                                                        var cCObjectStore = cC.objectStore('country');
                                                        var cRequest = cCObjectStore.clear();
                                                        cRequest.onsuccess = function (event) {
                                                            var fuC = db1.transaction(['forecastingUnit'], 'readwrite');
                                                            var fuCObjectStore = fuC.objectStore('forecastingUnit');
                                                            var fuRequest = fuCObjectStore.clear();
                                                            fuRequest.onsuccess = function (event) {
                                                                var puC = db1.transaction(['planningUnit'], 'readwrite');
                                                                var puCObjectStore = puC.objectStore('planningUnit');
                                                                var puRequest = puCObjectStore.clear();
                                                                puRequest.onsuccess = function (event) {
                                                                    var pruC = db1.transaction(['procurementUnit'], 'readwrite');
                                                                    var pruCObjectStore = pruC.objectStore('procurementUnit');
                                                                    var pruRequest = pruCObjectStore.clear();
                                                                    pruRequest.onsuccess = function (event) {
                                                                        var rcC = db1.transaction(['realmCountry'], 'readwrite');
                                                                        var rcCObjectStore = rcC.objectStore('realmCountry');
                                                                        var rcRequest = rcCObjectStore.clear();
                                                                        rcRequest.onsuccess = function (event) {
                                                                            var rcpuC = db1.transaction(['realmCountryPlanningUnit'], 'readwrite');
                                                                            var rcpuCObjectStore = rcpuC.objectStore('realmCountryPlanningUnit');
                                                                            var rcpuRequest = rcpuCObjectStore.clear();
                                                                            rcpuRequest.onsuccess = function (event) {
                                                                                var papuC = db1.transaction(['procurementAgentPlanningUnit'], 'readwrite');
                                                                                var papuCObjectStore = papuC.objectStore('procurementAgentPlanningUnit');
                                                                                var papuRequest = papuCObjectStore.clear();
                                                                                papuRequest.onsuccess = function (event) {
                                                                                    var paprouC = db1.transaction(['procurementAgentProcurementUnit'], 'readwrite');
                                                                                    var paprouCObjectStore = paprouC.objectStore('procurementAgentProcurementUnit');
                                                                                    var paprouRequest = paprouCObjectStore.clear();
                                                                                    paprouRequest.onsuccess = function (event) {
                                                                                        var pC = db1.transaction(['program'], 'readwrite');
                                                                                        var pCObjectStore = pC.objectStore('program');
                                                                                        var pRequest = pCObjectStore.clear();
                                                                                        pRequest.onsuccess = function (event) {
                                                                                            var ppuC = db1.transaction(['programPlanningUnit'], 'readwrite');
                                                                                            var ppuCObjectStore = ppuC.objectStore('programPlanningUnit');
                                                                                            var ppuRequest = ppuCObjectStore.clear();
                                                                                            ppuRequest.onsuccess = function (event) {
                                                                                                var rC = db1.transaction(['region'], 'readwrite');
                                                                                                var rCObjectStore = rC.objectStore('region');
                                                                                                var rRequest = rCObjectStore.clear();
                                                                                                rRequest.onsuccess = function (event) {
                                                                                                    var budC = db1.transaction(['budget'], 'readwrite');
                                                                                                    var budCObjectStore = budC.objectStore('budget');
                                                                                                    var budRequest = budCObjectStore.clear();
                                                                                                    budRequest.onsuccess = function (event) {
                                                                                                        var euC = db1.transaction(['equivalencyUnit'], 'readwrite');
                                                                                                        var euCObjectStore = euC.objectStore('equivalencyUnit');
                                                                                                        var euCRequest = euCObjectStore.clear();
                                                                                                        euCRequest.onsuccess = function (event) {
                                                                                                            var countryTransaction = db1.transaction(['country'], 'readwrite');
                                                                                                            var countryObjectStore = countryTransaction.objectStore('country');
                                                                                                            var json = (response.countryList);
                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                countryObjectStore.put(json[i]);
                                                                                                            }
                                                                                                            countryTransaction.oncomplete = function (event) {
                                                                                                                this.setState({
                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                }, () => {
                                                                                                                    var forecastingUnitTransaction = db1.transaction(['forecastingUnit'], 'readwrite');
                                                                                                                    var forecastingUnitObjectStore = forecastingUnitTransaction.objectStore('forecastingUnit');
                                                                                                                    var json = (response.forecastingUnitList);
                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                        forecastingUnitObjectStore.put(json[i]);
                                                                                                                    }
                                                                                                                    forecastingUnitTransaction.oncomplete = function (event) {
                                                                                                                        this.setState({
                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                        }, () => {
                                                                                                                            var planningUnitTransaction = db1.transaction(['planningUnit'], 'readwrite');
                                                                                                                            var planningUnitObjectStore = planningUnitTransaction.objectStore('planningUnit');
                                                                                                                            var json = (response.planningUnitList);
                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                planningUnitObjectStore.put(json[i]);
                                                                                                                            }
                                                                                                                            planningUnitTransaction.oncomplete = function (event) {
                                                                                                                                this.setState({
                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                }, () => {
                                                                                                                                    var datasetDataTransaction = db1.transaction(['datasetData'], 'readwrite');
                                                                                                                                    var datasetDataObjectStore = datasetDataTransaction.objectStore('datasetData');
                                                                                                                                    for (var dl = 0; dl < datasetList.length; dl++) {
                                                                                                                                        if (datasetList[dl].userId == userId) {
                                                                                                                                            var databytes = CryptoJS.AES.decrypt(datasetList[dl].programData, SECRET_KEY);
                                                                                                                                            var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
                                                                                                                                            var datasetPlanningUnitList = programData.planningUnitList;
                                                                                                                                            datasetPlanningUnitList.map(item => {
                                                                                                                                                var planningUnitObj = response.planningUnitList.filter(c => c.planningUnitId == item.planningUnit.id);
                                                                                                                                                if (planningUnitObj.length > 0) {
                                                                                                                                                    item.planningUnit.label = planningUnitObj[0].label;
                                                                                                                                                    item.planningUnit.unit = planningUnitObj[0].unit;
                                                                                                                                                    item.planningUnit.multiplier = planningUnitObj[0].multiplier;
                                                                                                                                                    item.planningUnit.forecastingUnit.label = planningUnitObj[0].forecastingUnit.label;
                                                                                                                                                    item.planningUnit.forecastingUnit.unit = planningUnitObj[0].forecastingUnit.unit;
                                                                                                                                                    item.planningUnit.forecastingUnit.productCategory = planningUnitObj[0].forecastingUnit.productCategory;
                                                                                                                                                    item.planningUnit.forecastingUnit.tracerCategory = planningUnitObj[0].forecastingUnit.tracerCategory;
                                                                                                                                                }
                                                                                                                                            })
                                                                                                                                            programData.planningUnitList = datasetPlanningUnitList;
                                                                                                                                            datasetList[dl].programData = (CryptoJS.AES.encrypt(JSON.stringify(programData), SECRET_KEY)).toString();
                                                                                                                                            datasetDataObjectStore.put(datasetList[dl]);
                                                                                                                                        }
                                                                                                                                    }
                                                                                                                                    datasetDataTransaction.oncomplete = function (event) {
                                                                                                                                        this.setState({
                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                        }, () => {
                                                                                                                                            var procurementUnitTransaction = db1.transaction(['procurementUnit'], 'readwrite');
                                                                                                                                            var procurementUnitObjectStore = procurementUnitTransaction.objectStore('procurementUnit');
                                                                                                                                            var json = (response.procurementUnitList);
                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                procurementUnitObjectStore.put(json[i]);
                                                                                                                                            }
                                                                                                                                            procurementUnitTransaction.oncomplete = function (event) {
                                                                                                                                                this.setState({
                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                }, () => {
                                                                                                                                                    var realmCountryTransaction = db1.transaction(['realmCountry'], 'readwrite');
                                                                                                                                                    var realmCountryObjectStore = realmCountryTransaction.objectStore('realmCountry');
                                                                                                                                                    var json = (response.realmCountryList);
                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                        realmCountryObjectStore.put(json[i]);
                                                                                                                                                    }
                                                                                                                                                    realmCountryTransaction.oncomplete = function (event) {
                                                                                                                                                        this.setState({
                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                        }, () => {
                                                                                                                                                            var realmCountryPlanningUnitTransaction = db1.transaction(['realmCountryPlanningUnit'], 'readwrite');
                                                                                                                                                            var realmCountryPlanningUnitObjectStore = realmCountryPlanningUnitTransaction.objectStore('realmCountryPlanningUnit');
                                                                                                                                                            var json = (response.realmCountryPlanningUnitList);
                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                realmCountryPlanningUnitObjectStore.put(json[i]);
                                                                                                                                                            }
                                                                                                                                                            realmCountryPlanningUnitTransaction.oncomplete = function (event) {
                                                                                                                                                                this.setState({
                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                }, () => {
                                                                                                                                                                    var procurementAgentPlanningUnitTransaction = db1.transaction(['procurementAgentPlanningUnit'], 'readwrite');
                                                                                                                                                                    var procurementAgentPlanningUnitObjectStore = procurementAgentPlanningUnitTransaction.objectStore('procurementAgentPlanningUnit');
                                                                                                                                                                    var json = (response.procurementAgentPlanningUnitList);
                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                        procurementAgentPlanningUnitObjectStore.put(json[i]);
                                                                                                                                                                    }
                                                                                                                                                                    procurementAgentPlanningUnitTransaction.oncomplete = function (event) {
                                                                                                                                                                        this.setState({
                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                        }, () => {
                                                                                                                                                                            var procurementAgentProcurementUnitTransaction = db1.transaction(['procurementAgentProcurementUnit'], 'readwrite');
                                                                                                                                                                            var procurementAgentProcurementUnitObjectStore = procurementAgentProcurementUnitTransaction.objectStore('procurementAgentProcurementUnit');
                                                                                                                                                                            var json = (response.procurementAgentProcurementUnitList);
                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                procurementAgentProcurementUnitObjectStore.put(json[i]);
                                                                                                                                                                            }
                                                                                                                                                                            procurementAgentProcurementUnitTransaction.oncomplete = function (event) {
                                                                                                                                                                                this.setState({
                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                }, () => {
                                                                                                                                                                                    var programTransaction = db1.transaction(['program'], 'readwrite');
                                                                                                                                                                                    var programObjectStore = programTransaction.objectStore('program');
                                                                                                                                                                                    var json = (response.programList);
                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                        programObjectStore.put(json[i]);
                                                                                                                                                                                    }
                                                                                                                                                                                    programTransaction.oncomplete = function (event) {
                                                                                                                                                                                        this.setState({
                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                        }, () => {
                                                                                                                                                                                            var programPlanningUnitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                                                                                                                                                                                            var programPlanningUnitObjectStore = programPlanningUnitTransaction.objectStore('programPlanningUnit');
                                                                                                                                                                                            var json = (response.programPlanningUnitList);
                                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                programPlanningUnitObjectStore.put(json[i]);
                                                                                                                                                                                            }
                                                                                                                                                                                            programPlanningUnitTransaction.oncomplete = function (event) {
                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                }, () => {
                                                                                                                                                                                                    var regionTransaction = db1.transaction(['region'], 'readwrite');
                                                                                                                                                                                                    var regionObjectStore = regionTransaction.objectStore('region');
                                                                                                                                                                                                    var json = (response.regionList);
                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                        regionObjectStore.put(json[i]);
                                                                                                                                                                                                    }
                                                                                                                                                                                                    regionTransaction.oncomplete = function (event) {
                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                        }, () => {
                                                                                                                                                                                                            var equivalencyUnitTransaction = db1.transaction(['equivalencyUnit'], 'readwrite');
                                                                                                                                                                                                            var equivalencyUnitObjectStore = equivalencyUnitTransaction.objectStore('equivalencyUnit');
                                                                                                                                                                                                            var json = (response.equivalencyUnitMappingList);
                                                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                equivalencyUnitObjectStore.put(json[i]);
                                                                                                                                                                                                            }
                                                                                                                                                                                                            equivalencyUnitTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                }, () => {
                                                                                                                                                                                                                    var extrapolationMethodTransaction = db1.transaction(['extrapolationMethod'], 'readwrite');
                                                                                                                                                                                                                    var extrapolationMethodObjectStore = extrapolationMethodTransaction.objectStore('extrapolationMethod');
                                                                                                                                                                                                                    var json = (response.extrapolationMethodList);
                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                        extrapolationMethodObjectStore.put(json[i]);
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                    extrapolationMethodTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                        }, () => {
                                                                                                                                                                                                                            var budgetTransaction = db1.transaction(['budget'], 'readwrite');
                                                                                                                                                                                                                            var budgetObjectStore = budgetTransaction.objectStore('budget');
                                                                                                                                                                                                                            var json = (response.budgetList);
                                                                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                budgetObjectStore.put(json[i]);
                                                                                                                                                                                                                            }
                                                                                                                                                                                                                            budgetTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                }, () => {
                                                                                                                                                                                                                                    this.syncProgramData(lastSyncDate, myResult, programQPLDetailsJson, readonlyProgramIds, response.programPlanningUnitList, response.procurementAgentPlanningUnitList, response.programList);
                                                                                                                                                                                                                                    this.syncDatasetData(datasetListFiltered, datasetDetailsList, readonlyDatasetIds);
                                                                                                                                                                                                                                    var currencyTransaction = db1.transaction(['currency'], 'readwrite');
                                                                                                                                                                                                                                    var currencyObjectStore = currencyTransaction.objectStore('currency');
                                                                                                                                                                                                                                    var json = (response.currencyList);
                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                        currencyObjectStore.put(json[i]);
                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                    currencyTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                        }, () => {
                                                                                                                                                                                                                                            var dimensionTransaction = db1.transaction(['dimension'], 'readwrite');
                                                                                                                                                                                                                                            var dimensionObjectStore = dimensionTransaction.objectStore('dimension');
                                                                                                                                                                                                                                            var json = (response.dimensionList);
                                                                                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                dimensionObjectStore.put(json[i]);
                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                            dimensionTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                }, () => {
                                                                                                                                                                                                                                                    var languageTransaction = db1.transaction(['language'], 'readwrite');
                                                                                                                                                                                                                                                    var languageObjectStore = languageTransaction.objectStore('language');
                                                                                                                                                                                                                                                    var json = (response.languageList);
                                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                        languageObjectStore.put(json[i]);
                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                    languageTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                        }, () => {
                                                                                                                                                                                                                                                            var shipmentStatusTransaction = db1.transaction(['shipmentStatus'], 'readwrite');
                                                                                                                                                                                                                                                            var shipmentStatusObjectStore = shipmentStatusTransaction.objectStore('shipmentStatus');
                                                                                                                                                                                                                                                            var json = (response.shipmentStatusList);
                                                                                                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                shipmentStatusObjectStore.put(json[i]);
                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                            shipmentStatusTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                }, () => {
                                                                                                                                                                                                                                                                    var unitTransaction = db1.transaction(['unit'], 'readwrite');
                                                                                                                                                                                                                                                                    var unitObjectStore = unitTransaction.objectStore('unit');
                                                                                                                                                                                                                                                                    var json = (response.unitList);
                                                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                        unitObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                    unitTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                        }, () => {
                                                                                                                                                                                                                                                                            var dataSourceTypeTransaction = db1.transaction(['dataSourceType'], 'readwrite');
                                                                                                                                                                                                                                                                            var dataSourceTypeObjectStore = dataSourceTypeTransaction.objectStore('dataSourceType');
                                                                                                                                                                                                                                                                            var json = (response.dataSourceTypeList);
                                                                                                                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                dataSourceTypeObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                            dataSourceTypeTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                }, () => {
                                                                                                                                                                                                                                                                                    var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
                                                                                                                                                                                                                                                                                    var dataSourceObjectStore = dataSourceTransaction.objectStore('dataSource');
                                                                                                                                                                                                                                                                                    var json = (response.dataSourceList);
                                                                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                        dataSourceObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                    dataSourceTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                        }, () => {
                                                                                                                                                                                                                                                                                            var tracerCategoryTransaction = db1.transaction(['tracerCategory'], 'readwrite');
                                                                                                                                                                                                                                                                                            var tracerCategoryObjectStore = tracerCategoryTransaction.objectStore('tracerCategory');
                                                                                                                                                                                                                                                                                            var json = (response.tracerCategoryList);
                                                                                                                                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                tracerCategoryObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                            tracerCategoryTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                }, () => {
                                                                                                                                                                                                                                                                                                    var productCategoryTransaction = db1.transaction(['productCategory'], 'readwrite');
                                                                                                                                                                                                                                                                                                    var productCategoryObjectStore = productCategoryTransaction.objectStore('productCategory');
                                                                                                                                                                                                                                                                                                    var json = (response.productCategoryList);
                                                                                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                        productCategoryObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                    productCategoryTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                        }, () => {
                                                                                                                                                                                                                                                                                                            var realmTransaction = db1.transaction(['realm'], 'readwrite');
                                                                                                                                                                                                                                                                                                            var realmObjectStore = realmTransaction.objectStore('realm');
                                                                                                                                                                                                                                                                                                            var json = (response.realmList);
                                                                                                                                                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                realmObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                            realmTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                }, () => {
                                                                                                                                                                                                                                                                                                                    var healthAreaTransaction = db1.transaction(['healthArea'], 'readwrite');
                                                                                                                                                                                                                                                                                                                    var healthAreaObjectStore = healthAreaTransaction.objectStore('healthArea');
                                                                                                                                                                                                                                                                                                                    var json = (response.healthAreaList);
                                                                                                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                        healthAreaObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                    healthAreaTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                        }, () => {
                                                                                                                                                                                                                                                                                                                            var organisationTypeTransaction = db1.transaction(['organisationType'], 'readwrite');
                                                                                                                                                                                                                                                                                                                            var organisationTypeObjectStore = organisationTypeTransaction.objectStore('organisationType');
                                                                                                                                                                                                                                                                                                                            var json = (response.organisationTypeList);
                                                                                                                                                                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                organisationTypeObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                            organisationTypeTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                }, () => {
                                                                                                                                                                                                                                                                                                                                    var organisationTransaction = db1.transaction(['organisation'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                    var organisationObjectStore = organisationTransaction.objectStore('organisation');
                                                                                                                                                                                                                                                                                                                                    var json = (response.organisationList);
                                                                                                                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                        organisationObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                    organisationTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                        }, () => {
                                                                                                                                                                                                                                                                                                                                            var fundingSourceTransaction = db1.transaction(['fundingSource'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                            var fundingSourceObjectStore = fundingSourceTransaction.objectStore('fundingSource');
                                                                                                                                                                                                                                                                                                                                            var json = (response.fundingSourceList);
                                                                                                                                                                                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                fundingSourceObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                            fundingSourceTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                }, () => {
                                                                                                                                                                                                                                                                                                                                                    var procurementAgentTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                    var procurementAgentObjectStore = procurementAgentTransaction.objectStore('procurementAgent');
                                                                                                                                                                                                                                                                                                                                                    var json = (response.procurementAgentList);
                                                                                                                                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                        procurementAgentObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                    procurementAgentTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                        }, () => {
                                                                                                                                                                                                                                                                                                                                                            var supplierTransaction = db1.transaction(['supplier'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                            var supplierObjectStore = supplierTransaction.objectStore('supplier');
                                                                                                                                                                                                                                                                                                                                                            var json = [];
                                                                                                                                                                                                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                supplierObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                            supplierTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                }, () => {
                                                                                                                                                                                                                                                                                                                                                                    var problemStatusTransaction = db1.transaction(['problemStatus'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                    var problemStatusObjectStore = problemStatusTransaction.objectStore('problemStatus');
                                                                                                                                                                                                                                                                                                                                                                    var json = (response.problemStatusList);
                                                                                                                                                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                        problemStatusObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                    problemStatusTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                        }, () => {
                                                                                                                                                                                                                                                                                                                                                                            var problemCriticalityTransaction = db1.transaction(['problemCriticality'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                            var problemCriticalityObjectStore = problemCriticalityTransaction.objectStore('problemCriticality');
                                                                                                                                                                                                                                                                                                                                                                            var json = (response.problemCriticalityList);
                                                                                                                                                                                                                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                                problemCriticalityObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                            problemCriticalityTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                                }, () => {
                                                                                                                                                                                                                                                                                                                                                                                    var usageTypeTransaction = db1.transaction(['usageType'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                                    var usageTypeObjectStore = usageTypeTransaction.objectStore('usageType');
                                                                                                                                                                                                                                                                                                                                                                                    var json = (response.usageTypeList);
                                                                                                                                                                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                                        usageTypeObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                    usageTypeTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                                        }, () => {
                                                                                                                                                                                                                                                                                                                                                                                            var nodeTypeTransaction = db1.transaction(['nodeType'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                                            var nodeTypeObjectStore = nodeTypeTransaction.objectStore('nodeType');
                                                                                                                                                                                                                                                                                                                                                                                            var json = (response.nodeTypeList);
                                                                                                                                                                                                                                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                                                nodeTypeObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                            nodeTypeTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                                                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                                                }, () => {
                                                                                                                                                                                                                                                                                                                                                                                                    var forecastMethodTypeTransaction = db1.transaction(['forecastMethodType'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                                                    var forecastMethodTypeObjectStore = forecastMethodTypeTransaction.objectStore('forecastMethodType');
                                                                                                                                                                                                                                                                                                                                                                                                    var json = (response.forecastMethodTypeList);
                                                                                                                                                                                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                                                        forecastMethodTypeObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                    forecastMethodTypeTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                                                        }, () => {
                                                                                                                                                                                                                                                                                                                                                                                                            var usagePeriodTransaction = db1.transaction(['usagePeriod'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                                                            var usagePeriodObjectStore = usagePeriodTransaction.objectStore('usagePeriod');
                                                                                                                                                                                                                                                                                                                                                                                                            var json = (response.usagePeriodList);
                                                                                                                                                                                                                                                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                                                                usagePeriodObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                            usagePeriodTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                                                                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                                                                }, () => {
                                                                                                                                                                                                                                                                                                                                                                                                                    var usageTemplateTransaction = db1.transaction(['usageTemplate'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                                                                    var usageTemplateObjectStore = usageTemplateTransaction.objectStore('usageTemplate');
                                                                                                                                                                                                                                                                                                                                                                                                                    var json = (response.usageTemplateList);
                                                                                                                                                                                                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                                                                        usageTemplateObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                    usageTemplateTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                                                                        }, () => {
                                                                                                                                                                                                                                                                                                                                                                                                                            var versionTypeTransaction = db1.transaction(['versionType'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                                                                            var versionTypeObjectStore = versionTypeTransaction.objectStore('versionType');
                                                                                                                                                                                                                                                                                                                                                                                                                            var json = (response.versionTypeList);
                                                                                                                                                                                                                                                                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                                                                                versionTypeObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                            versionTypeTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                                                                                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                                                                                }, () => {
                                                                                                                                                                                                                                                                                                                                                                                                                                    var versionStatusTransaction = db1.transaction(['versionStatus'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                                                                                    var versionStatusObjectStore = versionStatusTransaction.objectStore('versionStatus');
                                                                                                                                                                                                                                                                                                                                                                                                                                    var json = (response.versionStatusList);
                                                                                                                                                                                                                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                                                                                        versionStatusObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                    versionStatusTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                                                                                        }, () => {
                                                                                                                                                                                                                                                                                                                                                                                                                                            var treeTemplateTransaction = db1.transaction(['treeTemplate'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                                                                                            var treeTemplateObjectStore = treeTemplateTransaction.objectStore('treeTemplate');
                                                                                                                                                                                                                                                                                                                                                                                                                                            var json = (response.treeTemplateList);
                                                                                                                                                                                                                                                                                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                treeTemplateObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                                            treeTemplateTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                                                                                                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                                                                                                }, () => {
                                                                                                                                                                                                                                                                                                                                                                                                                                                    var modelingTypeTransaction = db1.transaction(['modelingType'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                                                                                                    var modelingTypeObjectStore = modelingTypeTransaction.objectStore('modelingType');
                                                                                                                                                                                                                                                                                                                                                                                                                                                    var json = (response.modelingTypeList);
                                                                                                                                                                                                                                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                        modelingTypeObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                    modelingTypeTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                                                                                                        }, () => {
                                                                                                                                                                                                                                                                                                                                                                                                                                                            var forecastMethodTransaction = db1.transaction(['forecastMethod'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                                                                                                            var forecastMethodObjectStore = forecastMethodTransaction.objectStore('forecastMethod');
                                                                                                                                                                                                                                                                                                                                                                                                                                                            var json = (response.forecastMethodList);
                                                                                                                                                                                                                                                                                                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                forecastMethodObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                                                            forecastMethodTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                }, () => {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    var problemCategoryTransaction = db1.transaction(['problemCategory'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    var problemCategoryObjectStore = problemCategoryTransaction.objectStore('problemCategory');
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    var json = (response.problemCategoryList);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                        problemCategoryObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    problemCategoryTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }, () => {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            var realmProblemTransaction = db1.transaction(['problem'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            var realmProblemObjectStore = realmProblemTransaction.objectStore('problem');
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            var json = (response.realmProblemList);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                realmProblemObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            realmProblemTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                }, () => {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    var fundingSourceTypeTransaction = db1.transaction(['fundingSourceType'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    var fundingSourceTypeObjectStore = fundingSourceTypeTransaction.objectStore('fundingSourceType');
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    var json = (response.fundingSourceType);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        fundingSourceTypeObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    fundingSourceTypeTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }, () => {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            this.fetchData(0, 0);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            //fetch new table here

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
                                                                                                        }.bind(this);
                                                                                                    }.bind(this);
                                                                                                }.bind(this);
                                                                                            }.bind(this);
                                                                                        }.bind(this);
                                                                                    }.bind(this);
                                                                                }.bind(this);
                                                                            }.bind(this);
                                                                        }.bind(this);
                                                                    }.bind(this);
                                                                }.bind(this);
                                                            }.bind(this);
                                                        }.bind(this);
                                                    }
                                                }).catch(
                                                    error => {
                                                        console.log("realmId===>===", error)

                                                        if (document.getElementById('div1') != null) {
                                                            document.getElementById('div1').style.display = 'none';
                                                        }
                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                        this.setState({
                                                            message: 'static.program.errortext'
                                                        },
                                                            () => {
                                                                this.hideSecondComponent();
                                                            })
                                                    }
                                                )
                                        } else {
                                            if (document.getElementById('div1') != null) {
                                                document.getElementById('div1').style.display = 'none';
                                            }
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
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        } else {
            if (document.getElementById('div1') != null) {
                document.getElementById('div1').style.display = 'none';
            }
            this.setState({
                message: 'static.common.onlinealerttext'
            },
                () => {
                    this.hideSecondComponent();
                })
        }
    }
    /**
     * This function is called when sync fails and user wants to retry the sync
     */
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
    }
}