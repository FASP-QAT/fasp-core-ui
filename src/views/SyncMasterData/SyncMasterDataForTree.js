import CryptoJS from 'crypto-js';
import i18next from 'i18next';
import moment from 'moment';
import React, { Component } from 'react';
import 'react-confirm-alert/src/react-confirm-alert.css'; 
import 'react-select/dist/react-select.min.css';
import {
    Button,
    Card, CardBody,
    CardFooter,
    CardHeader,
    Col,
    FormGroup,
    Progress
} from 'reactstrap';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import QatProblemActionNew from '../../CommonComponent/QatProblemActionNew';
import { INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY } from '../../Constants.js';
import MasterSyncService from '../../api/MasterSyncService.js';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import { decompressJson } from '../../CommonComponent/JavascriptCommonFunctions';
/**
 * This component is used to sync the master data into QAT when user wants to view a tree for the program that is not loaded on user's machine
 */
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
        this.fetchData = this.fetchData.bind(this);
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
     * This function is used to call sync masters function on page load
     */
    componentDidMount() {
        document.getElementById("retryButtonDiv").style.display = "none";
        this.syncMasters();
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
     * This function is used to update the count of progress bar
     * @param {*} hasPrograms This is true if the progress bar count should be updated for program. False if the progress bar count should be updated for masters
     * @param {*} programId This is the program Id for which the progress bar count should be updated
     */
    fetchData(hasPrograms, programId) {
        var realmId = AuthenticationService.getRealmId();
        if (this.state.syncedMasters === this.state.totalMasters) {
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
        }
    }
    /**
     * This function is used to sync all the masters on page load
     */
    syncMasters() {
        this.setState({ loading: false })
        if (localStorage.getItem("sessionType") === 'Online') {
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
                var updatedSyncDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                var datasetDataServerTransaction1 = db1.transaction(['datasetDataServer'], 'readwrite');
                var ddatasetDataServerOs = datasetDataServerTransaction1.objectStore('datasetDataServer');
                var ddatasetDataServerRequest = ddatasetDataServerOs.getAll();
                ddatasetDataServerRequest.onsuccess = function (e) {
                    var datasetDataServerList = ddatasetDataServerRequest.result;
                    var datasetDataServerListFiltered = [];
                    if (this.props.location.state != undefined && this.props.location.state.programIds != undefined) {
                        datasetDataServerListFiltered = datasetDataServerList.filter(c => (this.props.location.state.programIds).includes(c.id));
                    }
                    datasetDataServerList.filter(c => c.userId == userId).map(program => {
                        pIds.push(program.programId);
                    });
                    AuthenticationService.setupAxiosInterceptors();
                    if (localStorage.getItem("sessionType") === 'Online' && window.getComputedStyle(document.getElementById("retryButtonDiv")).display == "none") {
                        MasterSyncService.getSyncAllMastersForProgram(updatedSyncDate, pIds)
                            .then(response => {
                                if (response.status == 200) {
                                    response.data = decompressJson(response.data);
                                    var response = response.data;
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
            totalMasters: 14,
            syncedMasters: 0,
            syncedPercentage: 0,
            errorMessage: "",
            successMessage: ""
        })
        document.getElementById("retryButtonDiv").style.display = "none";
        this.syncMasters();
    }
}