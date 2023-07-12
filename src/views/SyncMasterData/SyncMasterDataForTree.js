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
import { SECRET_KEY, TOTAL_NO_OF_MASTERS_IN_SYNC, INDEXED_DB_VERSION, INDEXED_DB_NAME, SHIPMENT_MODIFIED, DELIVERED_SHIPMENT_STATUS, BATCH_PREFIX, PLANNED_SHIPMENT_STATUS } from '../../Constants.js'
import CryptoJS from 'crypto-js'
import UserService from '../../api/UserService';
import { qatProblemActions } from '../../CommonComponent/QatProblemActions'
import { calculateSupplyPlan } from '../SupplyPlan/SupplyPlanCalculations';
import QatProblemActions from '../../CommonComponent/QatProblemActions';
import QatProblemActionNew from '../../CommonComponent/QatProblemActionNew'
// import GetLatestProgramVersion from '../../CommonComponent/GetLatestProgramVersion'
import { generateRandomAplhaNumericCode, isSiteOnline, paddingZero } from '../../CommonComponent/JavascriptCommonFunctions';
import { calculateModelingData } from '../DataSet/ModelingDataCalculations.js';
import ProgramService from '../../api/ProgramService';
// import ChangeInLocalProgramVersion from '../../CommonComponent/ChangeInLocalProgramVersion'

export default class SyncMasterDataForTree extends Component {

    constructor(props) {
        super(props);
        this.state = {
            totalMasters: 14,
            syncedMasters: 0,
            syncedPercentage: 0,
            message: "",
            loading: true,
            programSynced: []
        }
        this.syncMasters = this.syncMasters.bind(this);
        this.retryClicked = this.retryClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
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
        // console.log("this.props @@@@ Test@@@123",this.props)
        document.getElementById("retryButtonDiv").style.display = "none";
        this.syncMasters();
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

    fetchData(hasPrograms, programId) {
        // console.log("In fetch data+++", this.state.syncedMasters)
        // console.log("In fetch data @@@", this.state.syncedMasters)
        // console.log("HasPrograms@@@", hasPrograms);
        var realmId = AuthenticationService.getRealmId();
        // console.log("ProgramId###", programId);
        // console.log("hasPrograms###", hasPrograms);
        if (this.state.syncedMasters === this.state.totalMasters) {
            // console.log("M sync final success updated---", this.state.syncedMasters)
            document.getElementById("retryButtonDiv").style.display = "none";
            let id = AuthenticationService.displayDashboardBasedOnRole();
            if (this.props.location.state != undefined && this.props.location.state.treeId != "") {
                this.props.history.push(`/dataSet/buildTree/treeServer/` + `${this.props.location.state.treeId}` + '/' + `${this.props.location.state.programIds}` + `/2`)//2 for server version
            } else {
                // this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/green/' + i18n.t('static.masterDataSync.success'))
                if (this.props.location.state != undefined && this.props.location.state.programIds != undefined && this.props.location.state.programIds.length > 0) {
                    this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/green/' + i18n.t('static.programLoadedAndmasterDataSync.success'))
                } else {
                    this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/green/' + i18n.t('static.masterDataSync.success'))
                }
            }
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
                var tm = this.state.totalMasters;
                var pIds = [];
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                // var transaction = db1.transaction(['lastSyncDate'], 'readwrite');
                // var lastSyncDateTransaction = transaction.objectStore('lastSyncDate');
                var updatedSyncDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");

                var datasetDataServerTransaction1 = db1.transaction(['datasetDataServer'], 'readwrite');
                var ddatasetDataServerOs = datasetDataServerTransaction1.objectStore('datasetDataServer');
                var ddatasetDataServerRequest = ddatasetDataServerOs.getAll();
                ddatasetDataServerRequest.onsuccess = function (e) {
                    // var datasetDataServerDetailsList = ddatasetDataServerRequest.result.filter(c => c.readonly == 1);
                    // var readonlyDatasetDataServerIds = [];
                    // for (var rp = 0; rp < datasetDataServerDetailsList.length; rp++) {
                    //     readonlyDatasetDataServerIds.push(datasetDataServerDetailsList[rp].programId);
                    // }
                    var datasetDataServerList = ddatasetDataServerRequest.result;
                    // console.log("###datasetDataServerList+++", datasetDataServerList)
                    var datasetDataServerListFiltered = [];
                    if (this.props.location.state != undefined && this.props.location.state.programIds != undefined) {
                        datasetDataServerListFiltered = datasetDataServerList.filter(c => (this.props.location.state.programIds).includes(c.id));
                    }
                    datasetDataServerList.filter(c => c.userId == userId).map(program => {
                        pIds.push(program.programId);
                    });

                    // console.log("Updated sync date Test@@@123",updatedSyncDate)
                    AuthenticationService.setupAxiosInterceptors();
                    // console.log("isSiteOnline() Test@@@123",isSiteOnline());
                    // console.log("Rety button Test@@@123",window.getComputedStyle(document.getElementById("retryButtonDiv")).display == "none")
                    if (isSiteOnline() && window.getComputedStyle(document.getElementById("retryButtonDiv")).display == "none") {

                        // console.log("Updated sync date Test@@@123",updatedSyncDate)
                        MasterSyncService.getSyncAllMastersForProgram(updatedSyncDate, pIds)


                            .then(response => {
                                // console.log("Response data Test@@@123",response.data)
                                if (response.status == 200) {
                                    // console.log("M sync Response", response.data)
                                    var response = response.data;

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
                                                                                                                            // console.log("****response.equivalencyUnitMappingList", response.equivalencyUnitMappingList)
                                                                                                                            var json = (response.equivalencyUnitMappingList);
                                                                                                                            // console.log("****Json", json);
                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                // console.log("**** in for loop")
                                                                                                                                equivalencyUnitObjectStore.put(json[i]);
                                                                                                                            }
                                                                                                                            // console.log("after equivalencyUnit set statue 1", this.state.syncedMasters);
                                                                                                                            equivalencyUnitTransaction.oncomplete = function (event) {
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
                                }

                            }).catch(
                                error => {
                                    // console.log("Error Test@@@123",error)
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
                        // console.log("in else@@@123")
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
            totalMasters: 14,
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