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
import { SECRET_KEY, TOTAL_NO_OF_MASTERS_IN_SYNC, INDEXED_DB_VERSION, INDEXED_DB_NAME, SHIPMENT_MODIFIED, DELIVERED_SHIPMENT_STATUS, BATCH_PREFIX } from '../../Constants.js'
import CryptoJS from 'crypto-js'
import UserService from '../../api/UserService';
import { qatProblemActions } from '../../CommonComponent/QatProblemActions'
import { calculateSupplyPlan } from '../SupplyPlan/SupplyPlanCalculations';
import QatProblemActions from '../../CommonComponent/QatProblemActions';
import QatProblemActionNew from '../../CommonComponent/QatProblemActionNew'
import GetLatestProgramVersion from '../../CommonComponent/GetLatestProgramVersion'
import { generateRandomAplhaNumericCode, isSiteOnline, paddingZero } from '../../CommonComponent/JavascriptCommonFunctions';
import { calculateModelingData } from '../DataSet/ModelingDataCalculations.js';
import ProgramService from '../../api/ProgramService';
// import ChangeInLocalProgramVersion from '../../CommonComponent/ChangeInLocalProgramVersion'

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

    componentDidMount() {
        // console.log("Start date", Date.now());
        AuthenticationService.setupAxiosInterceptors();
        document.getElementById("retryButtonDiv").style.display = "none";
        let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
        // console.log("decryptedCurUser sync data---", decryptedCurUser)
        UserService.getUserByUserId(decryptedCurUser).then(response => {
            // console.log("user----------------------", response.data);
            localStorage.setItem('user-' + decryptedCurUser, CryptoJS.AES.encrypt(JSON.stringify(response.data).toString(), `${SECRET_KEY}`));
            // this.syncMasters();
            setTimeout(function () { //Start the timer
                // this.setState({render: true}) //After 1 second, set render to true
                this.syncMasters();
            }.bind(this), 500)

        })
        this.hideFirstComponent();


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
                <QatProblemActionNew ref="problemListChild" updateState={undefined} fetchData={this.fetchData} objectStore="programData" page="syncMasterData"></QatProblemActionNew>
                {/* <QatProblemActions ref="problemListChild" updateState={undefined} fetchData={undefined} objectStore="programData"></QatProblemActions> */}
                {/* <GetLatestProgramVersion ref="programListChild"></GetLatestProgramVersion> */}
                {/* <ChangeInLocalProgramVersion ref="programChangeChild" ></ChangeInLocalProgramVersion> */}
                <h6 className="mt-success" style={{ color: this.props.match.params.color }} id="div1">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="pl-md-5" style={{ color: "#BA0C2F" }} id="div2">{this.state.message != "" && i18n.t('static.masterDataSync.masterDataSyncFailed')}</h5>
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
                        console.log("commitRequestResponseData=++", commitRequestResponseData)
                        console.log("commitRequestData=++", datasetDetailsList)
                        for (var cr = 0; cr < commitRequestResponseData.length; cr++) {
                            var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                            var userId = userBytes.toString(CryptoJS.enc.Utf8);
                            var prgQPLDetails = datasetDetailsList.filter(c => c.programId == commitRequestResponseData[cr].program.id && c.version == commitRequestResponseData[cr].committedVersionId && c.userId == userId)[0];
                            console.log("prgQPLDetails=++", prgQPLDetails)
                            if (prgQPLDetails != undefined) {
                                var checkIfReadonly = commitRequestResponseData.filter(c => c.program.id == prgQPLDetails.programId && c.committedVersionId == prgQPLDetails.version);
                                console.log("checkIfReadonly=++", checkIfReadonly);
                                var readonly = checkIfReadonly.length > 0 ? 0 : prgQPLDetails.readonly;
                                prgQPLDetails.readonly = readonly;
                                console.log("readonly=++", readonly);
                                var programQPLDetailsTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                                var programQPLDetailsOs = programQPLDetailsTransaction.objectStore('datasetDetails');
                                var programQPLDetailsRequest = programQPLDetailsOs.put(prgQPLDetails);
                            }
                            // console.log("Planning unit list", planningUnitList);
                        }

                        for (var i = 0; i < datasetList.length; i++) {
                            calculateModelingData(datasetList[i], this, "syncPage");
                        }
                    }
                })
        }.bind(this)
    }

    syncProgramData(date, programList, programQPLDetailsList, readonlyProgramIds, programPlanningUnitList) {
        // console.log("Date", date);
        // console.log('Program List', programList);
        var valid = true;
        var jsonForNewShipmentSync = [];
        for (var pl = 0; pl < programList.length; pl++) {
            var generalDataBytes = CryptoJS.AES.decrypt(programList[pl].programData.generalData, SECRET_KEY);
            var generalData = generalDataBytes.toString(CryptoJS.enc.Utf8);
            var generalJson = JSON.parse(generalData);
            console.log("GeneralJson@@@@@@@@@@@@@@", generalJson)
            var programQPLListFilter=programQPLDetailsList.filter(c=>c.id==programList[pl].id);
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
            var lastSyncDate=date;
            if (this.props.location.state != undefined) {
            if (this.props.location.state.programIds.includes(programList[pl].programId)) {
                lastSyncDate=moment(generalJson.currentVersion.createdDate).format("YYYY-MM-DD HH:mm:ss")
            }
        }
            jsonForNewShipmentSync.push({
                roAndRoPrimeLineNoList: listOfRoNoAndRoPrimeLineNo,
                programId: programList[pl].programId,
                lastSyncDate:moment(lastSyncDate).format("YYYY-MM-DD HH:mm:ss")
            })
        }
        console.log("jsonForNewShipmentSync@@@@@@@@@@@@@@@@", jsonForNewShipmentSync)

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
                        console.log("Shipment sync reponse=========================>",shipmentSyncResponse)
                    for (var i = 0; i < programList.length; i++) {
                        AuthenticationService.setupAxiosInterceptors();
                        // this.refs.problemListChild.qatProblemActions(programList[i].id);
                        if (isSiteOnline) {
                            //Code to Sync Country list
                            MasterSyncService.syncProgram(programList[i].programId, programList[i].version, programList[i].userId, date)
                                .then(response => {
                                    // console.log("Response", response);
                                    if (response.status == 200) {
                                        // console.log("Response=========================>", response.data);
                                        // console.log("i", i);
                                        var curUser = AuthenticationService.getLoggedInUserId();
                                        var prog = programList.filter(c => parseInt(c.programId) == parseInt(response.data.programId) && parseInt(c.version) == parseInt(response.data.versionId) && parseInt(c.userId) == parseInt(response.data.userId))[0];
                                        var prgQPLDetails = programQPLDetailsList.filter(c => c.id == prog.id)[0];
                                        // console.log("Prog=====================>", prog)
                                        // Iss prgQPLDetails ke liye mujhe check karna hai ki commit request me uska id hai kya agar hai to usko unreadonly karo
                                        var checkIfReadonly = commitRequestResponseData.filter(c => c.program.id == prgQPLDetails.programId && c.committedVersionId == prgQPLDetails.version);
                                        var readonly = checkIfReadonly.length > 0 ? 0 : prgQPLDetails.readonly;
                                        var generalDataBytes = CryptoJS.AES.decrypt((prog).programData.generalData, SECRET_KEY);
                                        var generalData = generalDataBytes.toString(CryptoJS.enc.Utf8);
                                        var generalJson = JSON.parse(generalData);

                                        var planningUnitDataList = (prog).programData.planningUnitDataList;
                                        // var shipmentDataList = (programJson.shipmentList);
                                        // var batchInfoList = (programJson.batchInfoList);
                                        var actionList = generalJson.actionList;
                                        if (actionList == undefined) {
                                            actionList = []
                                        }
                                        var problemReportList = generalJson.problemReportList;
                                        // console.log("Shipment data list", shipmentDataList);
                                        // console.log("Batch Info list", batchInfoList);
                                        var shipArray = shipmentSyncResponse.data[response.data.programId].filter(c=>c.shipmentActive==true);
                                        var pplModified = programPlanningUnitList.filter(c => moment(c.lastModifiedDate).format("YYYY-MM-DD HH:mm:ss") >= moment(date).format("YYYY-MM-DD HH:mm:ss") && c.program.id == response.data.programId);

                                        var rebuild = false;
                                        if (shipArray.length > 0 || pplModified.length > 0) {
                                            rebuild = true;
                                        }
                                        // var shipArray1 = response.data.shipmentList.filter(c => c.receivedDate != null && c.receivedDate != "" && c.receivedDate != "Invalid date" && c.receivedDate != undefined);
                                        // console.log("Min Date shiparray", shipArray);
                                        var minDate = moment.min(shipArray.map(d => moment(d.expectedDeliveryDate)));
                                        // var minDate1 = moment.min(shipArray1.map(d => moment(d.receivedDate)));
                                        // if (moment(minDate1).format("YYYY-MM") < moment(minDate).format("YYYY-MM")) {
                                            // minDate = minDate1;
                                        // }
                                        // console.log("Min Date in sync", minDate);
                                        var batchArray = [];
                                        var roNoAndRoPrimeLineNoSetFromAPI=[...new Set(shipArray.map(ele => ele.roNo+"|"+ele.roPrimeLineNo))];

                                        var planningUnitList = [];
                                        // for (var j = 0; j < shipArray.length; j++) {
                                        //     if (!planningUnitList.includes(shipArray[j].planningUnit.id)) {
                                        //         planningUnitList.push(shipArray[j].planningUnit.id);
                                        //     }
                                        // }
                                        var linkedShipmentsList=generalJson.shipmentLinkingList!=null?generalJson.shipmentLinkingList.filter(c=>c.active==true):[];
                                        console.log("LinkedShipmentsList=========================>",linkedShipmentsList)
                                        var linkedShipmentsListFilter=linkedShipmentsList.filter(c=>roNoAndRoPrimeLineNoSetFromAPI.includes(c.roNo+"|"+c.roPrimeLineNo));
                                        planningUnitList=[...new Set(linkedShipmentsListFilter).map(ele => ele.qatPlanningUnitId)];
                                        for (var ppl = 0; ppl < pplModified.length; ppl++) {
                                            if (!planningUnitList.includes(pplModified[ppl].planningUnit.id)) {
                                                planningUnitList.push(pplModified[ppl].planningUnit.id);
                                            }
                                        }
                                        console.log("planningUnitList=========================>",planningUnitList);
                                        for (var pu = 0; pu < planningUnitList.length; pu++) {
                                            var ppuObject=programPlanningUnitList.filter(c => c.planningUnit.id==planningUnitList[pu] && c.program.id == response.data.programId)[0];
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
                                            var uniqueRoNoAndRoPrimeLineNoBasedOnPlanningUnitId=[...new Set(shipArrayForPlanningUnit).map(ele => ele.roNo+"|"+ele.roPrimeLineNo)];
                                            for (var j = 0; j < uniqueRoNoAndRoPrimeLineNoBasedOnPlanningUnitId.length; j++) {
                                                console.log("Ship Array filter=========================>",shipArray.filter(c=>c.roNo+"|"+c.roPrimeLineNo==uniqueRoNoAndRoPrimeLineNoBasedOnPlanningUnitId[j]))
                                                var uniqueKnShipmentNo=[...new Set(shipArray.filter(c=>c.roNo+"|"+c.roPrimeLineNo==uniqueRoNoAndRoPrimeLineNoBasedOnPlanningUnitId[j])).map(ele => ele.orderNo+"|"+ele.primeLineNo+"|"+ele.knShipmentNo)];
                                                var knShipmentNoThatExistsInLinkedShipmentsList=linkedShipmentsListFilter.filter(x => x.roNo+"|"+x.roPrimeLineNo==uniqueRoNoAndRoPrimeLineNoBasedOnPlanningUnitId[j] && !uniqueKnShipmentNo.includes(x.orderNo+"|"+x.primeLineNo+"|"+x.knShipmentNo));

                                                console.log("knShipmentNoThatExistsInLinkedShipmentsList=========================>",knShipmentNoThatExistsInLinkedShipmentsList);
                                                console.log("uniqueRoNoAndRoPrimeLineNoBasedOnPlanningUnitId=========================>",uniqueRoNoAndRoPrimeLineNoBasedOnPlanningUnitId[j]);
                                                console.log("UniqueKnShipmentNo=========================>",uniqueKnShipmentNo);
                                                for(var u=0;u<uniqueKnShipmentNo.length;u++){
                                                    var checkIfAlreadyExists=linkedShipmentsList.findIndex(c=>c.roNo+"|"+c.roPrimeLineNo==uniqueRoNoAndRoPrimeLineNoBasedOnPlanningUnitId[j] && c.orderNo+"|"+c.primeLineNo+"|"+c.knShipmentNo==uniqueKnShipmentNo[u]);
                                                    console.log("checkIfAlreadyExists=========================>",checkIfAlreadyExists)
                                                    if(checkIfAlreadyExists==-1){
                                                        var linkedShipmentsListBasedOnRoNoAndRoPrimeLineNo=linkedShipmentsList.filter(c=>c.roNo+"|"+c.roPrimeLineNo==uniqueRoNoAndRoPrimeLineNoBasedOnPlanningUnitId[j]);
                                                        var index=shipmentDataList.findIndex(c=>linkedShipmentsListBasedOnRoNoAndRoPrimeLineNo[0].childShipmentId>0?linkedShipmentsListBasedOnRoNoAndRoPrimeLineNo[0].childShipmentId==c.shipmentId:linkedShipmentsListBasedOnRoNoAndRoPrimeLineNo[0].tempChildShipmentId==c.tempShipmentId);

                                                        var shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo=shipArray.filter(c=>c.roNo+"|"+c.roPrimeLineNo==uniqueRoNoAndRoPrimeLineNoBasedOnPlanningUnitId[j] && c.orderNo+"|"+c.primeLineNo+"|"+c.knShipmentNo==uniqueKnShipmentNo[u])
                                                        if(shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].erpShipmentStatus!="Cancelled"){
                                                        var shipmentQty = 0;
                                                        var batchInfo = [];
                                                        var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                                                        var curUser = AuthenticationService.getLoggedInUserId();
                                                        var username = AuthenticationService.getLoggedInUsername();
                                                        shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo.map(item => {
                                                            console.log("Item@@@@@@@@@@@@@@@@", item)
                                                        shipmentQty += Number(item.erpQty) * Number(linkedShipmentsListBasedOnRoNoAndRoPrimeLineNo[0].conversionFactor);
                                                        var batchNo = item.batchNo;
                                                        var expiryDate = item.expiryDate;
                                                        var autoGenerated = false;
                                                        var shelfLife = ppuObject.shelfLife;
                                                        // if (batchNo.toString() == "-99" || batchNo=="") {
                                                        var programId1 = paddingZero(response.data.programId, 0, 6);
                                                        var planningUnitId1 = paddingZero(planningUnitList[pu], 0, 8);
                                                        autoGenerated = (batchNo.toString() == "-99" || batchNo == "") ? true : autoGenerated;
                                                        batchNo = (batchNo.toString() == "-99" || batchNo == "") ? (BATCH_PREFIX).concat(programId1).concat(planningUnitId1).concat(moment(Date.now()).format("YYMMDD")).concat(generateRandomAplhaNumericCode(3)) : batchNo;
                                                        expiryDate = expiryDate == "" ? moment(item.expectedDeliveryDate).add(shelfLife, 'months').startOf('month').format("YYYY-MM-DD") : expiryDate;

                                                        // }
                                                        batchInfo.push({
                                                            shipmentTransBatchInfoId: 0,
                                                            batch: {
                                                                batchNo: batchNo,
                                                                expiryDate: moment(expiryDate).endOf('month').format("YYYY-MM-DD"),
                                                                batchId: 0,
                                                                autoGenerated: autoGenerated,
                                                                createdDate: curDate
                                                            },
                                                            shipmentQty: Number(item.erpQty) * Number(linkedShipmentsListBasedOnRoNoAndRoPrimeLineNo[0].conversionFactor)
                                                        })
                                                        })
                                                        shipmentDataList.push({
                                                            accountFlag: true,
                                                            active: true,
                                                            dataSource: shipmentDataList[index].dataSource,
                                                            erpFlag: true,
                                                            localProcurement: false,
                                                            freightCost: shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].shippingCost,//Yeh
                                                            notes: "",
                                                            planningUnit: shipmentDataList[index].planningUnit,
                                                            procurementAgent: shipmentDataList[index].procurementAgent,
                                                            productCost: shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].price * shipmentQty,//Final cost
                                                            shipmentQty: shipmentQty,
                                                            rate: shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].price,//Price per planning unit
                                                            shipmentId: 0,
                                                            shipmentMode: (shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].shipBy == "Land" || shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].shipBy == "Ship" ? "Sea" : shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0] == "Air" ? "Air" : "Sea"),//Yeh
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
                                                            tempShipmentId: ppuObject.planningUnit.id.toString().concat(shipmentDataList.length),
                                                            tempParentShipmentId: shipmentDataList[index].tempParentShipmentId,
                                                        })
                                                        if(moment(shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].expectedDeliveryDate).format("YYYY-MM")<moment(minDate).format("YYYY-MM")){
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
                                                            programId:response.data.programId,
                                                            procurementAgent: shipmentDataList[index].procurementAgent,
                                                            parentShipmentId: shipmentDataList[index].parentShipmentId,
                                                            tempParentShipmentId: shipmentDataList[index].tempParentShipmentId,
                                                            childShipmentId: 0,
                                                            tempChildShipmentId: shipmentDataList[index].planningUnit.id.toString().concat(shipmentDataList.length-1),
                                                            erpPlanningUnit: shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].erpPlanningUnit,
                                                            roNo: shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].roNo,
                                                            roPrimeLineNo: shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].roPrimeLineNo,
                                                            knShipmentNo: shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].knShipmentNo,
                                                            erpShipmentStatus: shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].erpShipmentStatus,
                                                            orderNo: shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].orderNo,
                                                            primeLineNo: shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].primeLineNo,
                                                            conversionFactor: Number(linkedShipmentsListBasedOnRoNoAndRoPrimeLineNo[0].conversionFactor),
                                                            qatPlanningUnitId:ppuObject.planningUnit.id,
                                                            active:true,
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
                                                        //Insert
                                                        // var childShipmentId=linkedShipmentsList[checkIfAlreadyExists].childShipmentId>0?linkedShipmentsList[checkIfAlreadyExists].childShipmentId:linkedShipmentsList[checkIfAlreadyExists].tempChildShipmentId;
                                                    }else{
                                                        var index=shipmentDataList.findIndex(c=>linkedShipmentsList[checkIfAlreadyExists].childShipmentId>0?linkedShipmentsList[checkIfAlreadyExists].childShipmentId==c.shipmentId:linkedShipmentsList[checkIfAlreadyExists].tempChildShipmentId==c.tempShipmentId);
                                                        var shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo=shipArray.filter(c=>c.roNo+"|"+c.roPrimeLineNo==uniqueRoNoAndRoPrimeLineNoBasedOnPlanningUnitId[j] && c.orderNo+"|"+c.primeLineNo+"|"+c.knShipmentNo==uniqueKnShipmentNo[u])
                                                        var linkedShipmentsListIndex=linkedShipmentsList.findIndex(c=>c.roNo+"|"+c.roPrimeLineNo==uniqueRoNoAndRoPrimeLineNoBasedOnPlanningUnitId[j] && c.orderNo+"|"+c.primeLineNo+"|"+c.knShipmentNo==uniqueKnShipmentNo[u]);
                                                        var shipmentQty = 0;
                                                        var batchInfo = [];
                                                        var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                                                        var curUser = AuthenticationService.getLoggedInUserId();
                                                        shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo.map(item => {
                                                            console.log("Item@@@@@@@@@@@@@@@@", item)
                                                        shipmentQty += Number(item.erpQty) * Number(linkedShipmentsList[checkIfAlreadyExists].conversionFactor);
                                                        var batchNo = item.batchNo;
                                                        var expiryDate = item.expiryDate;
                                                        var autoGenerated = false;
                                                        var shelfLife = ppuObject.shelfLife;
                                                        // if (batchNo.toString() == "-99" || batchNo=="") {
                                                        var programId1 = paddingZero(response.data.programId, 0, 6);
                                                        var planningUnitId1 = paddingZero(planningUnitList[pu], 0, 8);
                                                        autoGenerated = (batchNo.toString() == "-99" || batchNo == "") ? true : autoGenerated;
                                                        batchNo = (batchNo.toString() == "-99" || batchNo == "") ? (BATCH_PREFIX).concat(programId1).concat(planningUnitId1).concat(moment(Date.now()).format("YYMMDD")).concat(generateRandomAplhaNumericCode(3)) : batchNo;
                                                        expiryDate = expiryDate == "" ? moment(item.expectedDeliveryDate).add(shelfLife, 'months').startOf('month').format("YYYY-MM-DD") : expiryDate;

                                                        // }
                                                        batchInfo.push({
                                                            shipmentTransBatchInfoId: 0,
                                                            batch: {
                                                                batchNo: batchNo,
                                                                expiryDate: moment(expiryDate).endOf('month').format("YYYY-MM-DD"),
                                                                batchId: 0,
                                                                autoGenerated: autoGenerated,
                                                                createdDate: curDate
                                                            },
                                                            shipmentQty: Number(item.erpQty) * Number(linkedShipmentsList[checkIfAlreadyExists].conversionFactor)
                                                        })
                                                        })
                                                        linkedShipmentsList[linkedShipmentsListIndex].erpShipmentStatus=shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].erpShipmentStatus;
                                                        linkedShipmentsList[linkedShipmentsListIndex].lastModifiedBy.userId=curUser;
                                                        linkedShipmentsList[linkedShipmentsListIndex].lastModifiedBy.username=username;
                                                        linkedShipmentsList[linkedShipmentsListIndex].lastModifiedDate=curDate;
                                                        shipmentDataList[index].shipmentQty = shipmentQty;
                                                        shipmentDataList[index].freightCost = shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].shippingCost;
                                                        shipmentDataList[index].productCost = shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].price * shipmentQty;
                                                        shipmentDataList[index].rate = shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].price;
                                                        shipmentDataList[index].shipmentMode = (shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].shipBy == "Land" || shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].shipBy == "Ship" ? "Sea" : shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0] == "Air" ? "Air" : "Sea");
                                                        shipmentDataList[index].shipmentStatus = shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].qatEquivalentShipmentStatus;
                                                        shipmentDataList[index].expectedDeliveryDate = shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].expectedDeliveryDate;
                                                        shipmentDataList[index].receivedDate = shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].qatEquivalentShipmentStatus.id == DELIVERED_SHIPMENT_STATUS ? shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].expectedDeliveryDate : null
                                                        shipmentDataList[index].batchInfoList = batchInfo;
                                                        shipmentDataList[index].orderNo = shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].orderNo;
                                                        shipmentDataList[index].primeLineNo = shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].primeLineNo;
                                                        shipmentDataList[index].lastModifiedBy.userId=curUser;
                                                        shipmentDataList[index].lastModifiedBy.username=username;
                                                        shipmentDataList[index].lastModifiedDate=curDate;
                                                        if (moment(shipmentDataList[index].expectedDeliveryDate).format("YYYY-MM") < moment(minDate).format("YYYY-MM")) {
                                                            minDate = shipmentDataList[index].expectedDeliveryDate;
                                                        }
                                                        if (shipmentDataList[index].receivedDate != null && shipmentDataList[index].receivedDate != "" && shipmentDataList[index].receivedDate != "" && shipmentDataList[index].receivedDate != undefined && moment(shipmentDataList[index].receivedDate).format("YYYY-MM") < moment(minDate).format("YYYY-MM")) {
                                                            minDate = shipmentDataList[index].receivedDate;
                                                        }
                                                        if(moment(shipArrayBasedOnRoNoRoPrimeLineNoAndKnShipmentNo[0].expectedDeliveryDate).format("YYYY-MM")<moment(minDate).format("YYYY-MM")){
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
                                                        //Update
                                                    }
                                                }
                                                for(var u=0;u<knShipmentNoThatExistsInLinkedShipmentsList.length;u++){
                                                    var linkedShipmentsListIndex = linkedShipmentsList.findIndex(c=>c.roNo+"|"+c.roPrimeLineNo==uniqueRoNoAndRoPrimeLineNoBasedOnPlanningUnitId[j] && c.knShipmentNo==knShipmentNoThatExistsInLinkedShipmentsList[u].knShipmentNo && c.orderNo==knShipmentNoThatExistsInLinkedShipmentsList[u].orderNo && c.primeLineNo==knShipmentNoThatExistsInLinkedShipmentsList[u].primeLineNo);
                                                    var linkedShipmentsListFilter = linkedShipmentsList.filter(c=>c.roNo+"|"+c.roPrimeLineNo==uniqueRoNoAndRoPrimeLineNoBasedOnPlanningUnitId[j] && c.knShipmentNo==knShipmentNoThatExistsInLinkedShipmentsList[u].knShipmentNo && c.orderNo==knShipmentNoThatExistsInLinkedShipmentsList[u].orderNo && c.primeLineNo==knShipmentNoThatExistsInLinkedShipmentsList[u].primeLineNo);
                                                    linkedShipmentsList[linkedShipmentsListIndex].active=false;
                                                    linkedShipmentsList[linkedShipmentsListIndex].lastModifiedBy.userId=curUser;
                                                    linkedShipmentsList[linkedShipmentsListIndex].lastModifiedBy.username=username;
                                                    linkedShipmentsList[linkedShipmentsListIndex].lastModifiedDate=curDate;
                                                    var checkIfThereIsOnlyOneChildShipmentOrNot = linkedShipmentsList.filter(c => (linkedShipmentsListFilter[0].parentShipmentId > 0 ? c.parentShipmentId == linkedShipmentsListFilter[0].parentShipmentId : c.tempParentShipmentId == linkedShipmentsListFilter[0].tempParentShipmentId) && c.active==true);
                                                    var activateParentShipment = false;
                                                    if (checkIfThereIsOnlyOneChildShipmentOrNot.length == 0) {
                                                        activateParentShipment = true;
                                                    }
                                                    var shipmentIndex = shipmentDataList.findIndex(c => linkedShipmentsList[linkedShipmentsListIndex].childShipmentId > 0 ? c.shipmentId == linkedShipmentsList[linkedShipmentsListIndex].childShipmentId : c.tempShipmentId == linkedShipmentsList[linkedShipmentsListIndex].tempChildShipmentId);
                                                    shipmentDataList[shipmentIndex].active = false;
                                                    shipmentDataList[shipmentIndex].lastModifiedBy.userId=curUser;
                                                    shipmentDataList[shipmentIndex].lastModifiedBy.username=username;
                                                    shipmentDataList[shipmentIndex].lastModifiedDate=curDate;
                                                    if (moment(minDate).format("YYYY-MM-DD") > moment(shipmentDataList[shipmentIndex].expectedDeliveryDate).format("YYYY-MM-DD")) {
                                                        minDate = moment(shipmentDataList[shipmentIndex].expectedDeliveryDate).format("YYYY-MM-DD");
                                                    }
                                                    if (shipmentDataList[shipmentIndex].receivedDate != null && shipmentDataList[shipmentIndex].receivedDate != "" && shipmentDataList[shipmentIndex].receivedDate != undefined && moment(minDate).format("YYYY-MM-DD") > moment(shipmentDataList[shipmentIndex].receivedDate).format("YYYY-MM-DD")) {
                                                        minDate = moment(shipmentDataList[shipmentIndex].receivedDate).format("YYYY-MM-DD");
                                                    }
                                                    if (activateParentShipment) {
                                                        var parentShipmentIndex = shipmentDataList.findIndex(c => linkedShipmentsListFilter[0].parentShipmentId > 0 ? c.shipmentId == linkedShipmentsListFilter[0].parentShipmentId : c.tempShipmentId == linkedShipmentsListFilter[0].tempParentShipmentId);
                                                        shipmentDataList[parentShipmentIndex].active = true;
                                                        shipmentDataList[parentShipmentIndex].erpFlag = false;
                                                        shipmentDataList[parentShipmentIndex].lastModifiedBy.userId=curUser;
                                                        shipmentDataList[parentShipmentIndex].lastModifiedBy.username=username;
                                                        shipmentDataList[parentShipmentIndex].lastModifiedDate=curDate;

                                                        if (moment(minDate).format("YYYY-MM-DD") > moment(shipmentDataList[parentShipmentIndex].expectedDeliveryDate).format("YYYY-MM-DD")) {
                                                            minDate = moment(shipmentDataList[shipmentIndex].expectedDeliveryDate).format("YYYY-MM-DD");
                                                        }
                                                        if (shipmentDataList[parentShipmentIndex].receivedDate != null && shipmentDataList[parentShipmentIndex].receivedDate != "" && shipmentDataList[parentShipmentIndex].receivedDate != undefined && moment(minDate).format("YYYY-MM-DD") > moment(shipmentDataList[parentShipmentIndex].receivedDate).format("YYYY-MM-DD")) {
                                                            minDate = moment(shipmentDataList[shipmentIndex].receivedDate).format("YYYY-MM-DD");
                                                        }
                                                    }
                                                }
                                                // console.log("In planning unit list", shipArray[j].planningUnit.id);
                                                // var index = shipmentDataList.findIndex(c => c.shipmentId == shipArrayForPlanningUnit[j].shipmentId)
                                                // if (index == -1) {
                                                //     shipmentDataList.push(shipArrayForPlanningUnit[j]);
                                                // } else {
                                                //     if (moment(shipmentDataList[index].expectedDeliveryDate).format("YYYY-MM") < moment(minDate).format("YYYY-MM")) {
                                                //         minDate = shipmentDataList[index].expectedDeliveryDate;
                                                //     }
                                                //     if (shipmentDataList[index].receivedDate != null && shipmentDataList[index].receivedDate != "" && shipmentDataList[index].receivedDate != "" && shipmentDataList[index].receivedDate != undefined && moment(shipmentDataList[index].receivedDate).format("YYYY-MM") < moment(minDate).format("YYYY-MM")) {
                                                //         minDate = shipmentDataList[index].receivedDate;
                                                //     }
                                                //     shipmentDataList[index] = shipArrayForPlanningUnit[j];
                                                // }
                                            }
                                            // console.log("Shipment data updated", shipmentDataList);
                                            // var batchArrayForPlanningUnit = batchArray.filter(c => c.planningUnitId && planningUnitList[pu]);
                                            // for (var j = 0; j < batchArrayForPlanningUnit.length; j++) {
                                            //     var index = batchInfoList.findIndex(c => c.batchNo == batchArrayForPlanningUnit[j].batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(batchArrayForPlanningUnit[j].expiryDate).format("YYYY-MM"));
                                            //     if (index == -1) {
                                            //         batchInfoList.push(batchArrayForPlanningUnit[j]);
                                            //     } else {
                                            //         batchInfoList[index] = batchArrayForPlanningUnit[j];
                                            //     }
                                            // }
                                            programJson.shipmentList=shipmentDataList;
                                            programJson.batchInfoList=batchInfoList;
                                            if (planningUnitDataIndex != -1) {
                                                planningUnitDataList[planningUnitDataIndex].planningUnitData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                                            } else {
                                                planningUnitDataList.push({ planningUnitId: planningUnitList[pu], planningUnitData: (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString() });
                                            }

                                        }
                                        if (pplModified.length > 0) {
                                            minDate = null;
                                        }
                                        // console.log("Batch Info updated", batchInfoList);

                                        var problemReportArray = response.data.problemReportList;
                                        // console.log("Problem report array", problemReportArray);
                                        for (var pr = 0; pr < problemReportArray.length; pr++) {
                                            // console.log("problemReportArray[pr].problemReportId---------->", problemReportArray[pr].problemReportId);
                                            var index = problemReportList.findIndex(c => c.problemReportId == problemReportArray[pr].problemReportId)
                                            // console.log("D------------->Index----------->", index, "D------------>", problemReportArray[pr].problemStatus.id);
                                            if (index == -1) {
                                                problemReportList.push(problemReportArray[pr]);
                                            } else {
                                                // console.log("In else");
                                                problemReportList[index].reviewed = problemReportArray[pr].reviewed;
                                                problemReportList[index].problemStatus = problemReportArray[pr].problemStatus;
                                                problemReportList[index].reviewNotes = problemReportArray[pr].reviewNotes;
                                                problemReportList[index].reviewedDate = (problemReportArray[pr].reviewedDate);

                                                // console.log("problemReportList[index]", problemReportList[index]);
                                                var problemReportTransList = problemReportList[index].problemTransList;
                                                // console.log("Problem report trans list", problemReportTransList)
                                                var curProblemReportTransList = problemReportArray[pr].problemTransList;
                                                // console.log("Cur problem report trans list", curProblemReportTransList)
                                                for (var cpr = 0; cpr < curProblemReportTransList.length; cpr++) {
                                                    var index1 = problemReportTransList.findIndex(c => c.problemReportTransId == curProblemReportTransList[cpr].problemReportTransId);
                                                    // console.log("index1", index1)
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
                                        // programJson.shipmentList = shipmentDataList;
                                        // programJson.batchInfoList = batchInfoList;
                                        generalJson.actionList = actionList;
                                        generalJson.shipmentLinkingList = linkedShipmentsList;
                                        generalJson.problemReportList = problemReportList;
                                        prgQPLDetails.openCount = (problemReportList.filter(c => c.problemStatus.id == 1 && c.planningUnitActive != false && c.regionActive != false)).length;
                                        prgQPLDetails.addressedCount = (problemReportList.filter(c => c.problemStatus.id == 3 && c.planningUnitActive != false && c.regionActive != false)).length;
                                        prgQPLDetails.readonly = readonly;
                                        prog.programData.planningUnitDataList = planningUnitDataList;
                                        prog.programData.generalData = (CryptoJS.AES.encrypt(JSON.stringify(generalJson), SECRET_KEY)).toString();
                                        var db1;
                                        var storeOS;
                                        getDatabase();
                                        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                                        openRequest.onerror = function (event) {
                                            // console.log("D--------------------------->in 1")
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
                                                // console.log("Planning unit list", planningUnitList);
                                                programQPLDetailsRequest.onsuccess = function (event) {
                                                    // var dt = date;
                                                    // if (this.props.match.params.message != "" && this.props.match.params.message != undefined && this.props.match.params.message != null) {
                                                    //     dt = "2020-01-01 00:00:00";
                                                    // }
                                                    // console.log("M------------------------>", dt);
                                                    // console.log("program id in master data sync***", prog.id);
                                                    var rebuildQPL = false;
                                                    if (this.props.location.state != undefined) {
                                                        if (this.props.location.state.programIds.includes(prog.id)) {
                                                            rebuildQPL = true;
                                                        }
                                                    }
                                                    calculateSupplyPlan(prog.id, 0, 'programData', 'masterDataSync', this, planningUnitList, minDate, this.refs.problemListChild, rebuild, rebuildQPL);
                                                }.bind(this)
                                            }.bind(this)
                                        }.bind(this)
                                    } else {
                                        // console.log("D--------------------------->in 2")
                                        // this.setState({
                                        //     message: response.data.messageCode
                                        // },
                                        //     () => {
                                        //         this.hideSecondComponent();
                                        //     })
                                        // document.getElementById("retryButtonDiv").style.display = "block";
                                        valid = false;
                                        this.fetchData(1, programList[i].id);
                                    }
                                }).catch(error => {
                                    this.fetchData(1, 1);
                                    // console.log("D------------------------> 3 error", error);
                                    if (error.message === "Network Error") {
                                        // console.log("D--------------------------->in 3")
                                        // this.setState({ message: error.message },
                                        //     () => {
                                        //         this.hideSecondComponent();
                                        //     });
                                    } else {
                                        switch (error.response ? error.response.status : "") {
                                            case 500:
                                            case 401:
                                            case 404:
                                            case 406:
                                            case 412:
                                                // console.log("D--------------------------->in 4")
                                                // this.setState({ message: error.response.data.messageCode },
                                                //     () => {
                                                //         this.hideSecondComponent();
                                                //     });
                                                break;
                                            default:
                                                // console.log("D--------------------------->in 5")
                                                // this.setState({ message: 'static.unkownError' },
                                                //     () => {
                                                //         this.hideSecondComponent();
                                                //     });
                                                break;
                                        }
                                    }
                                    // document.getElementById("retryButtonDiv").style.display = "block";
                                    // valid = false;
                                });
                        } else {
                            // console.log("D--------------------------->in 6")
                            // document.getElementById("retryButtonDiv").style.display = "block";
                            // this.setState({
                            //     message: 'static.common.onlinealerttext'
                            // },
                            //     () => {
                            //         this.hideSecondComponent();
                            //     })
                            valid = false;
                        }
                    } 
            })
        }
        })

        // this.refs.programListChild.checkNewerVersions();
        // this.refs.programChangeChild.checkIfLocalProgramVersionChanged();

        // if (valid) {
        //     this.setState({
        //         syncedMasters: this.state.syncedMasters + 1,
        //         syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
        //     })
        // } else {
        //     console.log("D--------------------------->in 7")
        //     if (document.getElementById('div1') != null) {
        //         document.getElementById('div1').style.display = 'none';
        //     }
        //     document.getElementById("retryButtonDiv").style.display = "block";
        //     this.setState({
        //         message: 'static.common.onlinealerttext'
        //     },
        //         () => {
        //             this.hideSecondComponent();
        //         })
        // }
        // console.log("Valid", valid);
        return valid;
    }

    fetchData(hasPrograms, programId) {
        console.log("In fetch data+++", this.state.syncedMasters)
        // console.log("In fetch data @@@", this.state.syncedMasters)
        // console.log("HasPrograms@@@", hasPrograms);
        var realmId = AuthenticationService.getRealmId();
        console.log("ProgramId###", programId);
        console.log("hasPrograms###", hasPrograms);
        if (hasPrograms != 0) {
            var programSynced = this.state.programSynced;
            console.log("ProgramSYnced###", programSynced);
            var indexForProgram = -1;
            if (programId != 1) {
                indexForProgram = programSynced.findIndex(c => c == programId);
            }
            var syncCount = TOTAL_NO_OF_MASTERS_IN_SYNC;
            if (indexForProgram == -1) {
                programSynced.push(programId);
                console.log("####programSynced.length", programSynced.length);
                syncCount = syncCount + programSynced.length;
            }
            this.setState({
                syncedMasters: syncCount,
                syncedPercentage: Math.floor(((syncCount) / this.state.totalMasters) * 100)
            })
        }
        if (this.state.syncedMasters === this.state.totalMasters) {
            var db1;
            var storeOS;
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
                    // console.log("M sync final success updated---", this.state.syncedMasters)
                    document.getElementById("retryButtonDiv").style.display = "none";
                    let id = AuthenticationService.displayDashboardBasedOnRole();
                    // console.log("M sync role based dashboard done");
                    // console.log("End date", Date.now());
                    this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/green/' + i18n.t('static.masterDataSync.success'))
                }.bind(this)
            }.bind(this)
        }
    }


    syncMasters() {
        this.setState({ loading: false })
        if (isSiteOnline()) {
            var db1;
            var storeOS;
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
                    // console.log("lastsyncDate", lastSyncDate);
                    var result = lastSyncDateRequest.result;
                    // console.log("Result", result)
                    // console.log("RealmId", realmId)
                    for (var i = 0; i < result.length; i++) {
                        if (result[i].id == realmId) {
                            // console.log("in if")
                            var lastSyncDateRealm = lastSyncDateRequest.result[i];
                            // console.log("last sync date in realm", lastSyncDateRealm)
                        }
                        if (result[i].id == 0) {
                            var lastSyncDate = lastSyncDateRequest.result[i];
                            // console.log("last sync date", lastSyncDate)
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
                    // console.log("Last sync date above", lastSyncDateRealm);
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
                        var validation = true;
                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                        var userId = userBytes.toString(CryptoJS.enc.Utf8);
                        var pIds = [];
                        var tm = this.state.totalMasters;

                        var programIds = myResult.filter(c => c.userId == userId).map(program => {
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
                                    console.log("###DatasetList+++", datasetList)
                                    var datasetListFiltered = [];
                                    if (this.props.location.state != undefined) {
                                        datasetListFiltered = datasetList.filter(c => (this.props.location.state.programIds).includes(c.id));
                                    }
                                    datasetList.filter(c => c.userId == userId).map(program => {
                                        pIds.push(program.programId);
                                    });
                                    // var datasetListFiltered=datasetList;
                                    this.setState({
                                        totalMasters: tm + myResult.length + datasetListFiltered.length
                                    })
                                    // console.log("Validation", validation);
                                    if (validation) {
                                        AuthenticationService.setupAxiosInterceptors();
                                        if (isSiteOnline() && window.getComputedStyle(document.getElementById("retryButtonDiv")).display == "none") {


                                            MasterSyncService.getSyncAllMastersForProgram(lastSyncDateRealm, pIds)


                                                .then(response => {
                                                    if (response.status == 200) {
                                                        console.log("M sync Response", response.data)
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

                                                                                                        // country
                                                                                                        var countryTransaction = db1.transaction(['country'], 'readwrite');
                                                                                                        // console.log("M sync country transaction start")
                                                                                                        var countryObjectStore = countryTransaction.objectStore('country');
                                                                                                        var json = (response.countryList);
                                                                                                        // countryObjectStore.clear();
                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                            // console.log("M sync in for", i)
                                                                                                            countryObjectStore.put(json[i]);
                                                                                                        }
                                                                                                        // console.log("M sync after country set statue 1", this.state.syncedMasters);
                                                                                                        countryTransaction.oncomplete = function (event) {
                                                                                                            // console.log("M sync In abort------>")
                                                                                                            this.setState({
                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                            }, () => {
                                                                                                                // forecastingUnit
                                                                                                                var forecastingUnitTransaction = db1.transaction(['forecastingUnit'], 'readwrite');
                                                                                                                // console.log("M sync forecastingUnit transaction start")
                                                                                                                var forecastingUnitObjectStore = forecastingUnitTransaction.objectStore('forecastingUnit');
                                                                                                                var json = (response.forecastingUnitList);
                                                                                                                // forecastingUnitObjectStore.clear();
                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                    forecastingUnitObjectStore.put(json[i]);
                                                                                                                }
                                                                                                                // console.log("after forecastingUnit set statue 1", this.state.syncedMasters);
                                                                                                                forecastingUnitTransaction.oncomplete = function (event) {
                                                                                                                    this.setState({
                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                    }, () => {

                                                                                                                        // planningUnit
                                                                                                                        var planningUnitTransaction = db1.transaction(['planningUnit'], 'readwrite');
                                                                                                                        // console.log("M sync planningUnit transaction start")
                                                                                                                        var planningUnitObjectStore = planningUnitTransaction.objectStore('planningUnit');
                                                                                                                        var json = (response.planningUnitList);
                                                                                                                        // planningUnitObjectStore.clear();
                                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                                            planningUnitObjectStore.put(json[i]);
                                                                                                                        }
                                                                                                                        // console.log("after planningUnit set statue 1", this.state.syncedMasters);
                                                                                                                        planningUnitTransaction.oncomplete = function (event) {
                                                                                                                            this.setState({
                                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                            }, () => {
                                                                                                                                // procurementUnit
                                                                                                                                var procurementUnitTransaction = db1.transaction(['procurementUnit'], 'readwrite');
                                                                                                                                // console.log("M sync procurementUnit transaction start")
                                                                                                                                var procurementUnitObjectStore = procurementUnitTransaction.objectStore('procurementUnit');
                                                                                                                                var json = (response.procurementUnitList);
                                                                                                                                // procurementUnitObjectStore.clear();
                                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                                    procurementUnitObjectStore.put(json[i]);
                                                                                                                                }
                                                                                                                                // console.log("after procurementUnit set statue 1", this.state.syncedMasters);
                                                                                                                                procurementUnitTransaction.oncomplete = function (event) {
                                                                                                                                    this.setState({
                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                    }, () => {
                                                                                                                                        // realmCountry
                                                                                                                                        var realmCountryTransaction = db1.transaction(['realmCountry'], 'readwrite');
                                                                                                                                        // console.log("M sync realmCountry transaction start")
                                                                                                                                        var realmCountryObjectStore = realmCountryTransaction.objectStore('realmCountry');
                                                                                                                                        var json = (response.realmCountryList);
                                                                                                                                        // realmCountryObjectStore.clear();
                                                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                                                            realmCountryObjectStore.put(json[i]);
                                                                                                                                        }
                                                                                                                                        // console.log("after realmCountry set statue 1", this.state.syncedMasters);
                                                                                                                                        realmCountryTransaction.oncomplete = function (event) {
                                                                                                                                            this.setState({
                                                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                            }, () => {
                                                                                                                                                // realmCountryPlanningUnit
                                                                                                                                                var realmCountryPlanningUnitTransaction = db1.transaction(['realmCountryPlanningUnit'], 'readwrite');
                                                                                                                                                // console.log("M sync realmCountryPlanningUnit transaction start")
                                                                                                                                                var realmCountryPlanningUnitObjectStore = realmCountryPlanningUnitTransaction.objectStore('realmCountryPlanningUnit');
                                                                                                                                                var json = (response.realmCountryPlanningUnitList);
                                                                                                                                                // realmCountryPlanningUnitObjectStore.clear();
                                                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                                                    realmCountryPlanningUnitObjectStore.put(json[i]);
                                                                                                                                                }
                                                                                                                                                // console.log("after realmCountryPlanningUnit set statue 1", this.state.syncedMasters);
                                                                                                                                                realmCountryPlanningUnitTransaction.oncomplete = function (event) {
                                                                                                                                                    this.setState({
                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                    }, () => {
                                                                                                                                                        // procurementAgentPlanningUnit
                                                                                                                                                        var procurementAgentPlanningUnitTransaction = db1.transaction(['procurementAgentPlanningUnit'], 'readwrite');
                                                                                                                                                        // console.log("M sync procurementAgentPlanningUnit transaction start")
                                                                                                                                                        var procurementAgentPlanningUnitObjectStore = procurementAgentPlanningUnitTransaction.objectStore('procurementAgentPlanningUnit');
                                                                                                                                                        var json = (response.procurementAgentPlanningUnitList);
                                                                                                                                                        // procurementAgentPlanningUnitObjectStore.clear();
                                                                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                                                                            procurementAgentPlanningUnitObjectStore.put(json[i]);
                                                                                                                                                        }
                                                                                                                                                        // console.log("after procurementAgentPlanningUnit set statue 1", this.state.syncedMasters);
                                                                                                                                                        procurementAgentPlanningUnitTransaction.oncomplete = function (event) {
                                                                                                                                                            this.setState({
                                                                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                            }, () => {
                                                                                                                                                                // procurementAgentProcurementUnit
                                                                                                                                                                var procurementAgentProcurementUnitTransaction = db1.transaction(['procurementAgentProcurementUnit'], 'readwrite');
                                                                                                                                                                // console.log("M sync procurementAgentProcurementUnit transaction start")
                                                                                                                                                                var procurementAgentProcurementUnitObjectStore = procurementAgentProcurementUnitTransaction.objectStore('procurementAgentProcurementUnit');
                                                                                                                                                                var json = (response.procurementAgentProcurementUnitList);
                                                                                                                                                                // procurementAgentProcurementUnitObjectStore.clear();
                                                                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                                                                    procurementAgentProcurementUnitObjectStore.put(json[i]);
                                                                                                                                                                }
                                                                                                                                                                // console.log("after procurementAgentProcurementUnit set statue 1", this.state.syncedMasters);
                                                                                                                                                                procurementAgentProcurementUnitTransaction.oncomplete = function (event) {
                                                                                                                                                                    this.setState({
                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                    }, () => {
                                                                                                                                                                        // program
                                                                                                                                                                        var programTransaction = db1.transaction(['program'], 'readwrite');
                                                                                                                                                                        // console.log("M sync program transaction start")
                                                                                                                                                                        var programObjectStore = programTransaction.objectStore('program');
                                                                                                                                                                        var json = (response.programList);
                                                                                                                                                                        // programObjectStore.clear();
                                                                                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                                                                                            programObjectStore.put(json[i]);
                                                                                                                                                                        }
                                                                                                                                                                        // console.log("after program set statue 1", this.state.syncedMasters);
                                                                                                                                                                        programTransaction.oncomplete = function (event) {
                                                                                                                                                                            this.setState({
                                                                                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                            }, () => {
                                                                                                                                                                                // programPlanningUnit
                                                                                                                                                                                var programPlanningUnitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                                                                                                                                                                                // console.log("M sync programPlanningUnit transaction start")
                                                                                                                                                                                var programPlanningUnitObjectStore = programPlanningUnitTransaction.objectStore('programPlanningUnit');
                                                                                                                                                                                var json = (response.programPlanningUnitList);
                                                                                                                                                                                // programPlanningUnitObjectStore.clear();
                                                                                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                    programPlanningUnitObjectStore.put(json[i]);
                                                                                                                                                                                }
                                                                                                                                                                                // console.log("after programPlanningUnit set statue 1", this.state.syncedMasters);
                                                                                                                                                                                programPlanningUnitTransaction.oncomplete = function (event) {
                                                                                                                                                                                    this.setState({
                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                    }, () => {
                                                                                                                                                                                        // region
                                                                                                                                                                                        var regionTransaction = db1.transaction(['region'], 'readwrite');
                                                                                                                                                                                        // console.log("M sync region transaction start")
                                                                                                                                                                                        var regionObjectStore = regionTransaction.objectStore('region');
                                                                                                                                                                                        var json = (response.regionList);
                                                                                                                                                                                        // regionObjectStore.clear();
                                                                                                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                            regionObjectStore.put(json[i]);
                                                                                                                                                                                        }
                                                                                                                                                                                        // console.log("after region set statue 1", this.state.syncedMasters);
                                                                                                                                                                                        regionTransaction.oncomplete = function (event) {
                                                                                                                                                                                            this.setState({
                                                                                                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                            }, () => {
                                                                                                                                                                                                // equivalencyUnit
                                                                                                                                                                                                var equivalencyUnitTransaction = db1.transaction(['equivalencyUnit'], 'readwrite');
                                                                                                                                                                                                // console.log("M sync equivalencyUnit transaction start")
                                                                                                                                                                                                var equivalencyUnitObjectStore = equivalencyUnitTransaction.objectStore('equivalencyUnit');
                                                                                                                                                                                                console.log("****response.equivalencyUnitMappingList", response.equivalencyUnitMappingList)
                                                                                                                                                                                                var json = (response.equivalencyUnitMappingList);
                                                                                                                                                                                                console.log("****Json", json);
                                                                                                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                    console.log("**** in for loop")
                                                                                                                                                                                                    equivalencyUnitObjectStore.put(json[i]);
                                                                                                                                                                                                }
                                                                                                                                                                                                // console.log("after equivalencyUnit set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                equivalencyUnitTransaction.oncomplete = function (event) {
                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                    }, () => {

                                                                                                                                                                                                        // extrapolationMethod
                                                                                                                                                                                                        var extrapolationMethodTransaction = db1.transaction(['extrapolationMethod'], 'readwrite');
                                                                                                                                                                                                        // console.log("M sync extrapolationMethod transaction start")
                                                                                                                                                                                                        var extrapolationMethodObjectStore = extrapolationMethodTransaction.objectStore('extrapolationMethod');
                                                                                                                                                                                                        console.log("****response.extrapolationMethodMappingList", response.extrapolationMethodMappingList)
                                                                                                                                                                                                        var json = (response.extrapolationMethodList);
                                                                                                                                                                                                        console.log("****Json", json);
                                                                                                                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                            console.log("**** in for loop")
                                                                                                                                                                                                            extrapolationMethodObjectStore.put(json[i]);
                                                                                                                                                                                                        }
                                                                                                                                                                                                        // console.log("after extrapolationMethod set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                        extrapolationMethodTransaction.oncomplete = function (event) {
                                                                                                                                                                                                            this.setState({
                                                                                                                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                            }, () => {
                                                                                                                                                                                                                // budget
                                                                                                                                                                                                                var budgetTransaction = db1.transaction(['budget'], 'readwrite');
                                                                                                                                                                                                                // console.log("M sync budget transaction start")
                                                                                                                                                                                                                var budgetObjectStore = budgetTransaction.objectStore('budget');
                                                                                                                                                                                                                var json = (response.budgetList);
                                                                                                                                                                                                                // budgetObjectStore.clear();
                                                                                                                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                    budgetObjectStore.put(json[i]);
                                                                                                                                                                                                                }
                                                                                                                                                                                                                // console.log("after budget set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                budgetTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                    }, () => {
                                                                                                                                                                                                                        this.syncProgramData(lastSyncDate, myResult, programQPLDetailsJson, readonlyProgramIds, response.programPlanningUnitList);

                                                                                                                                                                                                                        this.syncDatasetData(datasetListFiltered, datasetDetailsList, readonlyDatasetIds);
                                                                                                                                                                                                                        // currency
                                                                                                                                                                                                                        var currencyTransaction = db1.transaction(['currency'], 'readwrite');
                                                                                                                                                                                                                        // console.log("M sync currency transaction start")
                                                                                                                                                                                                                        var currencyObjectStore = currencyTransaction.objectStore('currency');
                                                                                                                                                                                                                        var json = (response.currencyList);
                                                                                                                                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                            currencyObjectStore.put(json[i]);
                                                                                                                                                                                                                        }
                                                                                                                                                                                                                        // console.log("after currency set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                        currencyTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                            this.setState({
                                                                                                                                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                            }, () => {
                                                                                                                                                                                                                                // dimension
                                                                                                                                                                                                                                var dimensionTransaction = db1.transaction(['dimension'], 'readwrite');
                                                                                                                                                                                                                                // console.log("M sync dimension transaction start")
                                                                                                                                                                                                                                var dimensionObjectStore = dimensionTransaction.objectStore('dimension');
                                                                                                                                                                                                                                var json = (response.dimensionList);
                                                                                                                                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                    dimensionObjectStore.put(json[i]);
                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                // console.log("after dimension set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                dimensionTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                    }, () => {
                                                                                                                                                                                                                                        // language
                                                                                                                                                                                                                                        var languageTransaction = db1.transaction(['language'], 'readwrite');
                                                                                                                                                                                                                                        // console.log("M sync language transaction start")
                                                                                                                                                                                                                                        var languageObjectStore = languageTransaction.objectStore('language');
                                                                                                                                                                                                                                        var json = (response.languageList);
                                                                                                                                                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                            languageObjectStore.put(json[i]);
                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                        // console.log("after language set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                        languageTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                            this.setState({
                                                                                                                                                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                            }, () => {
                                                                                                                                                                                                                                                // shipmentStatus
                                                                                                                                                                                                                                                var shipmentStatusTransaction = db1.transaction(['shipmentStatus'], 'readwrite');
                                                                                                                                                                                                                                                // console.log("M sync shipmentStatus transaction start")
                                                                                                                                                                                                                                                var shipmentStatusObjectStore = shipmentStatusTransaction.objectStore('shipmentStatus');
                                                                                                                                                                                                                                                var json = (response.shipmentStatusList);
                                                                                                                                                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                    shipmentStatusObjectStore.put(json[i]);
                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                // console.log("after shipmentStatus set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                shipmentStatusTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                    }, () => {
                                                                                                                                                                                                                                                        // unit
                                                                                                                                                                                                                                                        var unitTransaction = db1.transaction(['unit'], 'readwrite');
                                                                                                                                                                                                                                                        // console.log("M sync unit transaction start")
                                                                                                                                                                                                                                                        var unitObjectStore = unitTransaction.objectStore('unit');
                                                                                                                                                                                                                                                        var json = (response.unitList);
                                                                                                                                                                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                            unitObjectStore.put(json[i]);
                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                        // console.log("after unit set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                        unitTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                            this.setState({
                                                                                                                                                                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                            }, () => {
                                                                                                                                                                                                                                                                // dataSourceType
                                                                                                                                                                                                                                                                var dataSourceTypeTransaction = db1.transaction(['dataSourceType'], 'readwrite');
                                                                                                                                                                                                                                                                // console.log("M sync dataSourceType transaction start")
                                                                                                                                                                                                                                                                var dataSourceTypeObjectStore = dataSourceTypeTransaction.objectStore('dataSourceType');
                                                                                                                                                                                                                                                                var json = (response.dataSourceTypeList);
                                                                                                                                                                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                    dataSourceTypeObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                // console.log("after dataSourceType set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                dataSourceTypeTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                    }, () => {
                                                                                                                                                                                                                                                                        // dataSource
                                                                                                                                                                                                                                                                        var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
                                                                                                                                                                                                                                                                        // console.log("M sync dataSource transaction start")
                                                                                                                                                                                                                                                                        var dataSourceObjectStore = dataSourceTransaction.objectStore('dataSource');
                                                                                                                                                                                                                                                                        var json = (response.dataSourceList);
                                                                                                                                                                                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                            dataSourceObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                        // console.log("after dataSource set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                        dataSourceTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                            this.setState({
                                                                                                                                                                                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                            }, () => {
                                                                                                                                                                                                                                                                                // tracerCategory
                                                                                                                                                                                                                                                                                var tracerCategoryTransaction = db1.transaction(['tracerCategory'], 'readwrite');
                                                                                                                                                                                                                                                                                // console.log("M sync tracerCategory transaction start")
                                                                                                                                                                                                                                                                                var tracerCategoryObjectStore = tracerCategoryTransaction.objectStore('tracerCategory');
                                                                                                                                                                                                                                                                                var json = (response.tracerCategoryList);
                                                                                                                                                                                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                    tracerCategoryObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                // console.log("after tracerCategory set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                                tracerCategoryTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                    }, () => {
                                                                                                                                                                                                                                                                                        // productCategory
                                                                                                                                                                                                                                                                                        var productCategoryTransaction = db1.transaction(['productCategory'], 'readwrite');
                                                                                                                                                                                                                                                                                        // console.log("M sync productCategory transaction start")
                                                                                                                                                                                                                                                                                        var productCategoryObjectStore = productCategoryTransaction.objectStore('productCategory');
                                                                                                                                                                                                                                                                                        var json = (response.productCategoryList);
                                                                                                                                                                                                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                            productCategoryObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                        // console.log("after productCategory set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                                        productCategoryTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                            this.setState({
                                                                                                                                                                                                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                            }, () => {
                                                                                                                                                                                                                                                                                                // realm
                                                                                                                                                                                                                                                                                                var realmTransaction = db1.transaction(['realm'], 'readwrite');
                                                                                                                                                                                                                                                                                                // console.log("M sync realm transaction start")
                                                                                                                                                                                                                                                                                                var realmObjectStore = realmTransaction.objectStore('realm');
                                                                                                                                                                                                                                                                                                var json = (response.realmList);
                                                                                                                                                                                                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                    realmObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                // console.log("after realm set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                                                realmTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                    }, () => {
                                                                                                                                                                                                                                                                                                        // healthArea
                                                                                                                                                                                                                                                                                                        var healthAreaTransaction = db1.transaction(['healthArea'], 'readwrite');
                                                                                                                                                                                                                                                                                                        // console.log("M sync healthArea transaction start")
                                                                                                                                                                                                                                                                                                        var healthAreaObjectStore = healthAreaTransaction.objectStore('healthArea');
                                                                                                                                                                                                                                                                                                        var json = (response.healthAreaList);
                                                                                                                                                                                                                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                            healthAreaObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                        // console.log("after healthArea set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                                                        healthAreaTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                            this.setState({
                                                                                                                                                                                                                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                            }, () => {

                                                                                                                                                                                                                                                                                                                // organisationType
                                                                                                                                                                                                                                                                                                                var organisationTypeTransaction = db1.transaction(['organisationType'], 'readwrite');
                                                                                                                                                                                                                                                                                                                // console.log("M sync organisationType transaction start")
                                                                                                                                                                                                                                                                                                                var organisationTypeObjectStore = organisationTypeTransaction.objectStore('organisationType');
                                                                                                                                                                                                                                                                                                                var json = (response.organisationTypeList);
                                                                                                                                                                                                                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                    organisationTypeObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                }


                                                                                                                                                                                                                                                                                                                // console.log("after organisationType set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                                                                organisationTypeTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                    }, () => {

                                                                                                                                                                                                                                                                                                                        // organisation
                                                                                                                                                                                                                                                                                                                        var organisationTransaction = db1.transaction(['organisation'], 'readwrite');
                                                                                                                                                                                                                                                                                                                        // console.log("M sync organisation transaction start")
                                                                                                                                                                                                                                                                                                                        var organisationObjectStore = organisationTransaction.objectStore('organisation');
                                                                                                                                                                                                                                                                                                                        var json = (response.organisationList);
                                                                                                                                                                                                                                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                            organisationObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                        }

                                                                                                                                                                                                                                                                                                                        // console.log("after organisation set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                                                                        organisationTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                            this.setState({
                                                                                                                                                                                                                                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                            }, () => {
                                                                                                                                                                                                                                                                                                                                // fundingSource
                                                                                                                                                                                                                                                                                                                                var fundingSourceTransaction = db1.transaction(['fundingSource'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                // console.log("M sync fundingSource transaction start")
                                                                                                                                                                                                                                                                                                                                var fundingSourceObjectStore = fundingSourceTransaction.objectStore('fundingSource');
                                                                                                                                                                                                                                                                                                                                var json = (response.fundingSourceList);
                                                                                                                                                                                                                                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                    fundingSourceObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                // console.log("after fundingSource set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                                                                                fundingSourceTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                    }, () => {
                                                                                                                                                                                                                                                                                                                                        // procurementAgent
                                                                                                                                                                                                                                                                                                                                        var procurementAgentTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                        // console.log("M sync procurementAgent transaction start")
                                                                                                                                                                                                                                                                                                                                        var procurementAgentObjectStore = procurementAgentTransaction.objectStore('procurementAgent');
                                                                                                                                                                                                                                                                                                                                        var json = (response.procurementAgentList);
                                                                                                                                                                                                                                                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                            procurementAgentObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                        // console.log("after procurementAgent set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                                                                                        procurementAgentTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                            this.setState({
                                                                                                                                                                                                                                                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                            }, () => {
                                                                                                                                                                                                                                                                                                                                                // supplier
                                                                                                                                                                                                                                                                                                                                                var supplierTransaction = db1.transaction(['supplier'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                // console.log("M sync supplier transaction start")
                                                                                                                                                                                                                                                                                                                                                var supplierObjectStore = supplierTransaction.objectStore('supplier');
                                                                                                                                                                                                                                                                                                                                                var json = [];
                                                                                                                                                                                                                                                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                    supplierObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                // console.log("after supplier set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                                                                                                supplierTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                    }, () => {
                                                                                                                                                                                                                                                                                                                                                        // problemStatus
                                                                                                                                                                                                                                                                                                                                                        var problemStatusTransaction = db1.transaction(['problemStatus'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                        // console.log("M sync problemStatus transaction start")
                                                                                                                                                                                                                                                                                                                                                        var problemStatusObjectStore = problemStatusTransaction.objectStore('problemStatus');
                                                                                                                                                                                                                                                                                                                                                        var json = (response.problemStatusList);
                                                                                                                                                                                                                                                                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                            problemStatusObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                        // console.log("after problemStatus set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                                                                                                        problemStatusTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                            this.setState({
                                                                                                                                                                                                                                                                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                            }, () => {
                                                                                                                                                                                                                                                                                                                                                                // problemCriticality
                                                                                                                                                                                                                                                                                                                                                                var problemCriticalityTransaction = db1.transaction(['problemCriticality'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                // console.log("M sync problemCriticality transaction start")
                                                                                                                                                                                                                                                                                                                                                                var problemCriticalityObjectStore = problemCriticalityTransaction.objectStore('problemCriticality');
                                                                                                                                                                                                                                                                                                                                                                var json = (response.problemCriticalityList);
                                                                                                                                                                                                                                                                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                    problemCriticalityObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                // console.log("after problemCriticality set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                                                                                                                problemCriticalityTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                    }, () => {
                                                                                                                                                                                                                                                                                                                                                                        // usageType
                                                                                                                                                                                                                                                                                                                                                                        var usageTypeTransaction = db1.transaction(['usageType'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                        // console.log("M sync usageType transaction start")
                                                                                                                                                                                                                                                                                                                                                                        var usageTypeObjectStore = usageTypeTransaction.objectStore('usageType');
                                                                                                                                                                                                                                                                                                                                                                        var json = (response.usageTypeList);
                                                                                                                                                                                                                                                                                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                            usageTypeObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                        // console.log("after usageType set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                                                                                                                        usageTypeTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                            this.setState({
                                                                                                                                                                                                                                                                                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                            }, () => {

                                                                                                                                                                                                                                                                                                                                                                                // nodeType
                                                                                                                                                                                                                                                                                                                                                                                var nodeTypeTransaction = db1.transaction(['nodeType'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                                // console.log("M sync nodeType transaction start")
                                                                                                                                                                                                                                                                                                                                                                                var nodeTypeObjectStore = nodeTypeTransaction.objectStore('nodeType');
                                                                                                                                                                                                                                                                                                                                                                                var json = (response.nodeTypeList);
                                                                                                                                                                                                                                                                                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                                    nodeTypeObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                // console.log("after nodeType set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                                                                                                                                nodeTypeTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                                    }, () => {

                                                                                                                                                                                                                                                                                                                                                                                        // forecastMethodType
                                                                                                                                                                                                                                                                                                                                                                                        var forecastMethodTypeTransaction = db1.transaction(['forecastMethodType'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                                        // console.log("M sync forecastMethodType transaction start")
                                                                                                                                                                                                                                                                                                                                                                                        var forecastMethodTypeObjectStore = forecastMethodTypeTransaction.objectStore('forecastMethodType');
                                                                                                                                                                                                                                                                                                                                                                                        var json = (response.forecastMethodTypeList);
                                                                                                                                                                                                                                                                                                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                                            forecastMethodTypeObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                        // console.log("after forecastMethodType set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                                                                                                                                        forecastMethodTypeTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                                            console.log("****in forecast method complete");
                                                                                                                                                                                                                                                                                                                                                                                            this.setState({
                                                                                                                                                                                                                                                                                                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                                            }, () => {
                                                                                                                                                                                                                                                                                                                                                                                                // usagePeriod
                                                                                                                                                                                                                                                                                                                                                                                                var usagePeriodTransaction = db1.transaction(['usagePeriod'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                                                // console.log("M sync usagePeriod transaction start")
                                                                                                                                                                                                                                                                                                                                                                                                var usagePeriodObjectStore = usagePeriodTransaction.objectStore('usagePeriod');
                                                                                                                                                                                                                                                                                                                                                                                                console.log("Usp****")
                                                                                                                                                                                                                                                                                                                                                                                                var json = (response.usagePeriodList);
                                                                                                                                                                                                                                                                                                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                                                    usagePeriodObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                // console.log("after usagePeriod set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                                                                                                                                                usagePeriodTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                                                    }, () => {
                                                                                                                                                                                                                                                                                                                                                                                                        // usageTemplate
                                                                                                                                                                                                                                                                                                                                                                                                        var usageTemplateTransaction = db1.transaction(['usageTemplate'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                                                        // console.log("M sync usageTemplate transaction start")
                                                                                                                                                                                                                                                                                                                                                                                                        var usageTemplateObjectStore = usageTemplateTransaction.objectStore('usageTemplate');
                                                                                                                                                                                                                                                                                                                                                                                                        var json = (response.usageTemplateList);
                                                                                                                                                                                                                                                                                                                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                                                            usageTemplateObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                        // console.log("after usageTemplate set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                                                                                                                                                        usageTemplateTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                                                            this.setState({
                                                                                                                                                                                                                                                                                                                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                                                            }, () => {
                                                                                                                                                                                                                                                                                                                                                                                                                // versionType
                                                                                                                                                                                                                                                                                                                                                                                                                var versionTypeTransaction = db1.transaction(['versionType'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                                                                // console.log("M sync versionType transaction start")
                                                                                                                                                                                                                                                                                                                                                                                                                var versionTypeObjectStore = versionTypeTransaction.objectStore('versionType');
                                                                                                                                                                                                                                                                                                                                                                                                                var json = (response.versionTypeList);
                                                                                                                                                                                                                                                                                                                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                                                                    versionTypeObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                // console.log("after versionType set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                                                                                                                                                                versionTypeTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                                                                    }, () => {
                                                                                                                                                                                                                                                                                                                                                                                                                        // versionStatus
                                                                                                                                                                                                                                                                                                                                                                                                                        var versionStatusTransaction = db1.transaction(['versionStatus'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                                                                        // console.log("M sync versionStatus transaction start")
                                                                                                                                                                                                                                                                                                                                                                                                                        var versionStatusObjectStore = versionStatusTransaction.objectStore('versionStatus');
                                                                                                                                                                                                                                                                                                                                                                                                                        var json = (response.versionStatusList);
                                                                                                                                                                                                                                                                                                                                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                                                                            versionStatusObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                        // console.log("after versionStatus set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                                                                                                                                                                        versionStatusTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                                                                            this.setState({
                                                                                                                                                                                                                                                                                                                                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                                                                            }, () => {
                                                                                                                                                                                                                                                                                                                                                                                                                                // treeTemplate
                                                                                                                                                                                                                                                                                                                                                                                                                                var treeTemplateTransaction = db1.transaction(['treeTemplate'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                                                                                // console.log("M sync treeTemplate transaction start")
                                                                                                                                                                                                                                                                                                                                                                                                                                var treeTemplateObjectStore = treeTemplateTransaction.objectStore('treeTemplate');
                                                                                                                                                                                                                                                                                                                                                                                                                                var json = (response.treeTemplateList);
                                                                                                                                                                                                                                                                                                                                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                                                                                    treeTemplateObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                                // console.log("after treeTemplate set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                                                                                                                                                                                treeTemplateTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                                                                                    }, () => {

                                                                                                                                                                                                                                                                                                                                                                                                                                        // modelingType
                                                                                                                                                                                                                                                                                                                                                                                                                                        var modelingTypeTransaction = db1.transaction(['modelingType'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                                                                                        // console.log("M sync modelingType transaction start")
                                                                                                                                                                                                                                                                                                                                                                                                                                        var modelingTypeObjectStore = modelingTypeTransaction.objectStore('modelingType');
                                                                                                                                                                                                                                                                                                                                                                                                                                        var json = (response.modelingTypeList);
                                                                                                                                                                                                                                                                                                                                                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                                                                                            modelingTypeObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                                        // console.log("after modelingType set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                                                                                                                                                                                        modelingTypeTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                                                                                            this.setState({
                                                                                                                                                                                                                                                                                                                                                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                                                                                            }, () => {

                                                                                                                                                                                                                                                                                                                                                                                                                                                // forecastMethod
                                                                                                                                                                                                                                                                                                                                                                                                                                                var forecastMethodTransaction = db1.transaction(['forecastMethod'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                                                                                                // console.log("M sync forecastMethod transaction start")
                                                                                                                                                                                                                                                                                                                                                                                                                                                var forecastMethodObjectStore = forecastMethodTransaction.objectStore('forecastMethod');
                                                                                                                                                                                                                                                                                                                                                                                                                                                var json = (response.forecastMethodList);
                                                                                                                                                                                                                                                                                                                                                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                    forecastMethodObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                                                // console.log("after forecastMethod set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                                                                                                                                                                                                forecastMethodTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                                                                                                    }, () => {
                                                                                                                                                                                                                                                                                                                                                                                                                                                        // problemCategory
                                                                                                                                                                                                                                                                                                                                                                                                                                                        var problemCategoryTransaction = db1.transaction(['problemCategory'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                                                                                                        // console.log("M sync problemCategory transaction start")
                                                                                                                                                                                                                                                                                                                                                                                                                                                        var problemCategoryObjectStore = problemCategoryTransaction.objectStore('problemCategory');
                                                                                                                                                                                                                                                                                                                                                                                                                                                        var json = (response.problemCategoryList);
                                                                                                                                                                                                                                                                                                                                                                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                            problemCategoryObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                                                        // console.log("after problemCategory set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                                                                                                                                                                                                        problemCategoryTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                            this.setState({
                                                                                                                                                                                                                                                                                                                                                                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                                                                                                            }, () => {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                // realmProblem
                                                                                                                                                                                                                                                                                                                                                                                                                                                                var realmProblemTransaction = db1.transaction(['problem'], 'readwrite');
                                                                                                                                                                                                                                                                                                                                                                                                                                                                // console.log("M sync realmProblem transaction start")
                                                                                                                                                                                                                                                                                                                                                                                                                                                                var realmProblemObjectStore = realmProblemTransaction.objectStore('problem');
                                                                                                                                                                                                                                                                                                                                                                                                                                                                var json = (response.realmProblemList);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    realmProblemObjectStore.put(json[i]);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                // console.log("after realmProblem set statue 1", this.state.syncedMasters);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                realmProblemTransaction.oncomplete = function (event) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }, () => {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                        // console.log("M sync after problem state updated---", this.state.syncedMasters)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                        this.fetchData(0, 0);
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

                                                })
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