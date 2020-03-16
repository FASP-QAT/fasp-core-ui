import React, { Component } from 'react';
import {
    Card, CardBody, CardHeader,
    CardFooter, Button, Col, Progress
} from 'reactstrap';
import '../Forms/ValidationForms/ValidationForms.css';
import 'react-select/dist/react-select.min.css';
import * as JsStoreFunction from "../../CommonComponent/JsStoreFunctions.js"
import * as JsStoreFunctionCore from "../../CommonComponent/JsStoreFunctionsCore"
import moment from 'moment';
import MasterSyncService from '../../api/MasterSyncService.js';

export default class SyncMasterData extends Component {

    constructor() {
        super();
        this.state = {
            totalMasters: 19,
            syncedMasters: 0,
            syncedPercentage: 0
        }
        this.syncMasters = this.syncMasters.bind(this);
        this.retryClicked = this.retryClicked.bind(this);
    }

    componentDidMount() {
        document.getElementById("retryButtonDiv").style.display = "none";
        this.syncMasters();
    }

    render() {
        return (
            <>
                <Col xs="12" sm="12">
                    <span>{this.state.errorMessage}</span>
                    <span>{this.state.successMessage}</span>
                    <Card>
                        <CardHeader>
                            <strong>Master Data Sync</strong>
                        </CardHeader>
                        <CardBody>
                            <div className="text-center">{this.state.syncedPercentage}% (Synced {this.state.syncedMasters} of {this.state.totalMasters} masters)</div>
                            <Progress value={this.state.syncedMasters} max={this.state.totalMasters} />
                        </CardBody>

                        <CardFooter id="retryButtonDiv">
                            <Button type="button" onClick={() => this.retryClicked()} size="sm" color="danger"><i className="fa fa-dot-circle-o"></i>Retry</Button>
                        </CardFooter>
                    </Card>
                </Col>
            </>
        )

    }


    syncMasters() {
        if (navigator.onLine) {
            const realmId = 1;
            var updatedSyncDate = ((moment(Date.now()).utcOffset('-0500').format('YYYY-MM-DD HH:mm')));
            var lastSyncDateVar = "";
            var lastSyncDateRealmVar = "";
            JsStoreFunction.getLastSyncDateForApplicationMaster().then(response => {
                if (response.length > 0) {
                    lastSyncDateVar = response[0];
                } else {
                    lastSyncDateVar = null;
                }
                JsStoreFunction.getLastSyncDateForRealm(realmId).then(response => {
                    if (response.length > 0) {
                        lastSyncDateRealmVar = response[0];
                    } else {
                        lastSyncDateRealmVar = null;
                    }
                    if (navigator.onLine) {
                        MasterSyncService.getCurrencyListForSync(lastSyncDateVar)
                            .then(response => {
                                JsStoreFunction.syncCurrency(response.data).then(response => {
                                    this.setState({
                                        syncedMasters: this.state.syncedMasters + 1,
                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                    })
                                    if (navigator.onLine) {
                                        //Code to Sync DataSource list
                                        MasterSyncService.getDataSourceListForSync(lastSyncDateVar)
                                            .then(response => {
                                                JsStoreFunction.syncDataSource(response.data).then(response => {
                                                    this.setState({
                                                        syncedMasters: this.state.syncedMasters + 1,
                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                    })
                                                    if (navigator.onLine) {
                                                        //Code to Sync DataSourceType list
                                                        MasterSyncService.getDataSourceTypeListForSync(lastSyncDateVar)
                                                            .then(response => {
                                                                JsStoreFunction.syncDataSourceType(response.data).then(response => {
                                                                    this.setState({
                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                    })
                                                                    if (navigator.onLine) {
                                                                        //Code to Sync Funding source list
                                                                        MasterSyncService.getFundingSourceListForSync(lastSyncDateRealmVar, realmId)
                                                                            .then(response => {
                                                                                JsStoreFunction.syncFundingSource(response.data).then(response => {
                                                                                    this.setState({
                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                    })
                                                                                    if (navigator.onLine) {
                                                                                        //Code to Sync Health area list
                                                                                        MasterSyncService.getHealthAreaListForSync(lastSyncDateRealmVar, realmId)
                                                                                            .then(response => {
                                                                                                JsStoreFunction.syncHealthArea(response.data).then(response => {
                                                                                                    this.setState({
                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                    })
                                                                                                    if (navigator.onLine) {
                                                                                                        //Code to Sync Lu list
                                                                                                        MasterSyncService.getLogisticsUnitListForSync(lastSyncDateRealmVar, realmId)
                                                                                                            .then(response => {
                                                                                                                JsStoreFunction.syncLogisticsUnit(response.data).then(response => {
                                                                                                                    this.setState({
                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                    })
                                                                                                                    if (navigator.onLine) {
                                                                                                                        //Code to Sync Manufacturer list
                                                                                                                        MasterSyncService.getManufacturerListForSync(lastSyncDateRealmVar, realmId)
                                                                                                                            .then(response => {
                                                                                                                                JsStoreFunction.syncManufacturer(response.data).then(response => {
                                                                                                                                    this.setState({
                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                    })
                                                                                                                                    if (navigator.onLine) {
                                                                                                                                        //Code to Sync Organisation list
                                                                                                                                        MasterSyncService.getOrganisationListForSync(lastSyncDateRealmVar, realmId)
                                                                                                                                            .then(response => {
                                                                                                                                                JsStoreFunction.syncOrganisation(response.data).then(response => {
                                                                                                                                                    this.setState({
                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                    })
                                                                                                                                                    if (navigator.onLine) {
                                                                                                                                                        //Code to Sync Pu list
                                                                                                                                                        MasterSyncService.getPlanningUnitListForSync(lastSyncDateRealmVar, realmId)
                                                                                                                                                            .then(response => {
                                                                                                                                                                JsStoreFunction.syncPlanningUnit(response.data).then(response => {
                                                                                                                                                                    this.setState({
                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                    })
                                                                                                                                                                    if (navigator.onLine) {
                                                                                                                                                                        //Code to Sync Product list
                                                                                                                                                                        MasterSyncService.getProductListForSync(lastSyncDateRealmVar, realmId)
                                                                                                                                                                            .then(response => {
                                                                                                                                                                                JsStoreFunction.syncProduct(response.data).then(response => {
                                                                                                                                                                                    this.setState({
                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                    })
                                                                                                                                                                                    if (navigator.onLine) {
                                                                                                                                                                                        //Code to Sync Product category list
                                                                                                                                                                                        MasterSyncService.getProductCategoryListForSync(lastSyncDateVar)
                                                                                                                                                                                            .then(response => {
                                                                                                                                                                                                JsStoreFunction.syncProductCategory(response.data).then(response => {
                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                    })
                                                                                                                                                                                                    if (navigator.onLine) {
                                                                                                                                                                                                        // Code to Sync Region list
                                                                                                                                                                                                        MasterSyncService.getRegionListForSync(lastSyncDateRealmVar, realmId)
                                                                                                                                                                                                            .then(response => {
                                                                                                                                                                                                                JsStoreFunction.syncRegion(response.data).then(response => {
                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                    })
                                                                                                                                                                                                                    if (navigator.onLine) {
                                                                                                                                                                                                                        // Code to Sync Shipment status list
                                                                                                                                                                                                                        MasterSyncService.getShipmentStatusListForSync(lastSyncDateVar)
                                                                                                                                                                                                                            .then(response => {
                                                                                                                                                                                                                                JsStoreFunction.syncShipmentStatus(response.data).then(response => {
                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                    if (navigator.onLine) {
                                                                                                                                                                                                                                        // Code to Sync Shipment status allowed list
                                                                                                                                                                                                                                        MasterSyncService.getShipmentStatusAllowedListForSync(lastSyncDateVar)
                                                                                                                                                                                                                                            .then(response => {
                                                                                                                                                                                                                                                JsStoreFunction.syncShipmentStatusAllowed(response.data).then(response => {
                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                    if (navigator.onLine) {
                                                                                                                                                                                                                                                        // Code to Sync Unit list
                                                                                                                                                                                                                                                        MasterSyncService.getUnitListForSync(lastSyncDateVar)
                                                                                                                                                                                                                                                            .then(response => {
                                                                                                                                                                                                                                                                JsStoreFunction.syncUnit(response.data).then(response => {
                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                    if (navigator.onLine) {
                                                                                                                                                                                                                                                                        // Code to Sync unit type list
                                                                                                                                                                                                                                                                        MasterSyncService.getUnitTypeList()
                                                                                                                                                                                                                                                                            .then(response => {
                                                                                                                                                                                                                                                                                JsStoreFunction.syncUnitType(response.data).then(response => {
                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                                    if (navigator.onLine) {
                                                                                                                                                                                                                                                                                        // Code to Sync sub funding source list
                                                                                                                                                                                                                                                                                        MasterSyncService.getSubFundingSourceListForSync(lastSyncDateRealmVar, realmId)
                                                                                                                                                                                                                                                                                            .then(response => {
                                                                                                                                                                                                                                                                                                JsStoreFunction.syncSubFundingSource(response.data).then(response => {
                                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                                                    if (navigator.onLine) {
                                                                                                                                                                                                                                                                                                        // Code to Sync country list
                                                                                                                                                                                                                                                                                                        MasterSyncService.getCountryListForSync(lastSyncDateVar)
                                                                                                                                                                                                                                                                                                            .then(response => {
                                                                                                                                                                                                                                                                                                                JsStoreFunction.syncCountry(response.data).then(response => {
                                                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                                                                    if (navigator.onLine) {
                                                                                                                                                                                                                                                                                                                        // Code to Sync language list
                                                                                                                                                                                                                                                                                                                        MasterSyncService.getLanguageListForSync(lastSyncDateVar)
                                                                                                                                                                                                                                                                                                                            .then(response => {
                                                                                                                                                                                                                                                                                                                                JsStoreFunction.syncLanguage(response.data).then(response => {
                                                                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                                                                                    JsStoreFunction.updateLastSyncDate(updatedSyncDate, realmId).then(response => {
                                                                                                                                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "none";
                                                                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                                                                            successMessage: "Master data synced success."
                                                                                                                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                                                                                                                    }).catch(error => {
                                                                                                                                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                                                                            errorMessage: `Sync failed(${error.message})`
                                                                                                                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                                                                                                                    });

                                                                                                                                                                                                                                                                                                                                }).catch(
                                                                                                                                                                                                                                                                                                                                    error => {
                                                                                                                                                                                                                                                                                                                                        console.log("In catch")
                                                                                                                                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                                                                            errorMessage: `Sync failed(${error.message})`
                                                                                                                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                                                                                                                    });
                                                                                                                                                                                                                                                                                                                            }).catch(
                                                                                                                                                                                                                                                                                                                                error => {
                                                                                                                                                                                                                                                                                                                                    document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                                                                        errorMessage: `Sync failed(${error.message})`
                                                                                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                                                                                });
                                                                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                                                            errorMessage: "Sync failed(Connection lost)"
                                                                                                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                                                                                                }).catch(
                                                                                                                                                                                                                                                                                                                    error => {
                                                                                                                                                                                                                                                                                                                        console.log("In catch")
                                                                                                                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                                                            errorMessage: `Sync failed(${error.message})`
                                                                                                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                                                                                                    });
                                                                                                                                                                                                                                                                                                            }).catch(
                                                                                                                                                                                                                                                                                                                error => {
                                                                                                                                                                                                                                                                                                                    document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                                                        errorMessage: `Sync failed(${error.message})`
                                                                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                                                                });
                                                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                                            errorMessage: "Sync failed(Connection lost)"
                                                                                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                                                                                }).catch(
                                                                                                                                                                                                                                                                                                    error => {
                                                                                                                                                                                                                                                                                                        console.log("In catch")
                                                                                                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                                            errorMessage: `Sync failed(${error.message})`
                                                                                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                                                                                    });
                                                                                                                                                                                                                                                                                            }).catch(
                                                                                                                                                                                                                                                                                                error => {
                                                                                                                                                                                                                                                                                                    document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                                        errorMessage: `Sync failed(${error.message})`
                                                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                                                });
                                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                            errorMessage: "Sync failed(Connection lost)"
                                                                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                                                                    }


                                                                                                                                                                                                                                                                                }).catch(
                                                                                                                                                                                                                                                                                    error => {
                                                                                                                                                                                                                                                                                        console.log("In catch")
                                                                                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                                            errorMessage: `Sync failed(${error.message})`
                                                                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                                                                    });
                                                                                                                                                                                                                                                                            }).catch(
                                                                                                                                                                                                                                                                                error => {
                                                                                                                                                                                                                                                                                    console.log("In catch")
                                                                                                                                                                                                                                                                                    document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                                        errorMessage: `Sync failed(${error.message})`
                                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                                });
                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                            errorMessage: "Sync failed(Connection lost)"
                                                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                                                }).catch(
                                                                                                                                                                                                                                                                    error => {
                                                                                                                                                                                                                                                                        console.log("In catch")
                                                                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                                            errorMessage: `Sync failed(${error.message})`
                                                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                                                    });
                                                                                                                                                                                                                                                            }).catch(
                                                                                                                                                                                                                                                                error => {
                                                                                                                                                                                                                                                                    document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                                        errorMessage: `Sync failed(${error.message})`
                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                });
                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                            errorMessage: "Sync failed(Connection lost)"
                                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                                }).catch(
                                                                                                                                                                                                                                                    error => {
                                                                                                                                                                                                                                                        console.log("In catch")
                                                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                            errorMessage: `Sync failed(${error.message})`
                                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                                    });
                                                                                                                                                                                                                                            }).catch(
                                                                                                                                                                                                                                                error => {
                                                                                                                                                                                                                                                    document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                                        errorMessage: `Sync failed(${error.message})`
                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                });
                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                            errorMessage: "Sync failed(Connection lost)"
                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                }).catch(
                                                                                                                                                                                                                                    error => {
                                                                                                                                                                                                                                        console.log("In catch")
                                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                            errorMessage: `Sync failed(${error.message})`
                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                    });
                                                                                                                                                                                                                            }).catch(
                                                                                                                                                                                                                                error => {
                                                                                                                                                                                                                                    document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                        errorMessage: `Sync failed(${error.message})`
                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                });
                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                            errorMessage: "Sync failed(Connection lost)"
                                                                                                                                                                                                                        })
                                                                                                                                                                                                                    }

                                                                                                                                                                                                                }).catch(
                                                                                                                                                                                                                    error => {
                                                                                                                                                                                                                        console.log("In catch")
                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                            errorMessage: `Sync failed(${error.message})`
                                                                                                                                                                                                                        })
                                                                                                                                                                                                                    });
                                                                                                                                                                                                            }).catch(
                                                                                                                                                                                                                error => {
                                                                                                                                                                                                                    document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                        errorMessage: `Sync failed(${error.message})`
                                                                                                                                                                                                                    })
                                                                                                                                                                                                                });
                                                                                                                                                                                                    } else {
                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                            errorMessage: "Sync failed(Connection lost)"
                                                                                                                                                                                                        })
                                                                                                                                                                                                    }


                                                                                                                                                                                                }).catch(
                                                                                                                                                                                                    error => {
                                                                                                                                                                                                        console.log("In catch")
                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                            errorMessage: `Sync failed(${error.message})`
                                                                                                                                                                                                        })
                                                                                                                                                                                                    });
                                                                                                                                                                                            }).catch(
                                                                                                                                                                                                error => {
                                                                                                                                                                                                    document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                        errorMessage: `Sync failed(${error.message})`
                                                                                                                                                                                                    })
                                                                                                                                                                                                });
                                                                                                                                                                                    } else {
                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                        this.setState({
                                                                                                                                                                                            errorMessage: "Sync failed(Connection lost)"
                                                                                                                                                                                        })
                                                                                                                                                                                    }

                                                                                                                                                                                }).catch(
                                                                                                                                                                                    error => {
                                                                                                                                                                                        console.log("In catch")
                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                        this.setState({
                                                                                                                                                                                            errorMessage: `Sync failed(${error.message})`
                                                                                                                                                                                        })
                                                                                                                                                                                    });
                                                                                                                                                                            }).catch(
                                                                                                                                                                                error => {
                                                                                                                                                                                    document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                    this.setState({
                                                                                                                                                                                        errorMessage: `Sync failed(${error.message})`
                                                                                                                                                                                    })
                                                                                                                                                                                });
                                                                                                                                                                    } else {
                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                        this.setState({
                                                                                                                                                                            errorMessage: "Sync failed(Connection lost)"
                                                                                                                                                                        })
                                                                                                                                                                    }

                                                                                                                                                                });
                                                                                                                                                            }).catch(
                                                                                                                                                                error => {
                                                                                                                                                                    document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                    this.setState({
                                                                                                                                                                        errorMessage: `Sync failed(${error.message})`
                                                                                                                                                                    })
                                                                                                                                                                }).catch(
                                                                                                                                                                    error => {
                                                                                                                                                                        console.log("In catch")
                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                        this.setState({
                                                                                                                                                                            errorMessage: `Sync failed(${error.message})`
                                                                                                                                                                        })
                                                                                                                                                                    });
                                                                                                                                                    } else {
                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                        this.setState({
                                                                                                                                                            errorMessage: "Sync failed(Connection lost)"
                                                                                                                                                        })
                                                                                                                                                    }

                                                                                                                                                }).catch(
                                                                                                                                                    error => {
                                                                                                                                                        console.log("In catch")
                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                        this.setState({
                                                                                                                                                            errorMessage: `Sync failed(${error.message})`
                                                                                                                                                        })
                                                                                                                                                    });
                                                                                                                                            }).catch(
                                                                                                                                                error => {
                                                                                                                                                    document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                    this.setState({
                                                                                                                                                        errorMessage: `Sync failed(${error.message})`
                                                                                                                                                    })
                                                                                                                                                });
                                                                                                                                    } else {
                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                        this.setState({
                                                                                                                                            errorMessage: "Sync failed(Connection lost)"
                                                                                                                                        })
                                                                                                                                    }

                                                                                                                                }).catch(
                                                                                                                                    error => {
                                                                                                                                        console.log("In catch")
                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                        this.setState({
                                                                                                                                            errorMessage: `Sync failed(${error.message})`
                                                                                                                                        })
                                                                                                                                    });
                                                                                                                            }).catch(
                                                                                                                                error => {
                                                                                                                                    document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                    this.setState({
                                                                                                                                        errorMessage: `Sync failed(${error.message})`
                                                                                                                                    })
                                                                                                                                });
                                                                                                                    } else {
                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                        this.setState({
                                                                                                                            errorMessage: "Sync failed(Connection lost)"
                                                                                                                        })
                                                                                                                    }
                                                                                                                }).catch(
                                                                                                                    error => {
                                                                                                                        console.log("In catch")
                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                        this.setState({
                                                                                                                            errorMessage: `Sync failed(${error.message})`
                                                                                                                        })
                                                                                                                    });
                                                                                                            }).catch(
                                                                                                                error => {
                                                                                                                    document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                    this.setState({
                                                                                                                        errorMessage: `Sync failed(${error.message})`
                                                                                                                    })
                                                                                                                });
                                                                                                    } else {
                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                        this.setState({
                                                                                                            errorMessage: "Sync failed(Connection lost)"
                                                                                                        })
                                                                                                    }
                                                                                                }).catch(
                                                                                                    error => {
                                                                                                        console.log("In catch")
                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                        this.setState({
                                                                                                            errorMessage: `Sync failed(${error.message})`
                                                                                                        })
                                                                                                    });
                                                                                            }).catch(
                                                                                                error => {
                                                                                                    document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                    this.setState({
                                                                                                        errorMessage: `Sync failed(${error.message})`
                                                                                                    })
                                                                                                });
                                                                                    } else {
                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                        this.setState({
                                                                                            errorMessage: "Sync failed(Connection lost)"
                                                                                        })
                                                                                    }
                                                                                }).catch(
                                                                                    error => {
                                                                                        console.log("In catch")
                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                        this.setState({
                                                                                            errorMessage: `Sync failed(${error.message})`
                                                                                        })
                                                                                    });
                                                                            }).catch(
                                                                                error => {
                                                                                    document.getElementById("retryButtonDiv").style.display = "block";
                                                                                    this.setState({
                                                                                        errorMessage: `Sync failed(${error.message})`
                                                                                    })
                                                                                });
                                                                    } else {
                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                        this.setState({
                                                                            errorMessage: "Sync failed(Connection lost)"
                                                                        })
                                                                    }
                                                                }).catch(
                                                                    error => {
                                                                        console.log("In catch")
                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                        this.setState({
                                                                            errorMessage: `Sync failed(${error.message})`
                                                                        })
                                                                    });
                                                            }).catch(
                                                                error => {
                                                                    document.getElementById("retryButtonDiv").style.display = "block";
                                                                    this.setState({
                                                                        errorMessage: `Sync failed(${error.message})`
                                                                    })
                                                                });
                                                    } else {
                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                        this.setState({
                                                            errorMessage: "Sync failed(Connection lost)"
                                                        })
                                                    }
                                                }).catch(
                                                    error => {
                                                        console.log("In catch")
                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                        this.setState({
                                                            errorMessage: `Sync failed(${error.message})`
                                                        })
                                                    });
                                            }).catch(
                                                error => {
                                                    document.getElementById("retryButtonDiv").style.display = "block";
                                                    this.setState({
                                                        errorMessage: `Sync failed(${error.message})`
                                                    })
                                                });
                                    } else {
                                        document.getElementById("retryButtonDiv").style.display = "block";
                                        this.setState({
                                            errorMessage: "Sync failed(Connection lost)"
                                        })
                                    }

                                }).catch(
                                    error => {
                                        console.log("In catch")
                                        document.getElementById("retryButtonDiv").style.display = "block";
                                        this.setState({
                                            errorMessage: `Sync failed(${error.message})`
                                        })
                                    });
                            }).catch(
                                error => {
                                    document.getElementById("retryButtonDiv").style.display = "block";
                                    this.setState({
                                        errorMessage: `Sync failed(${error.message})`
                                    })
                                });
                    } else {
                        document.getElementById("retryButtonDiv").style.display = "block";
                        this.setState({
                            errorMessage: "Sync failed(Connection lost)"
                        })
                    }
                }).catch(
                    error => {
                        lastSyncDateRealmVar = null;
                        document.getElementById("retryButtonDiv").style.display = "block";
                        this.setState({
                            errorMessage: `Sync failed(${error.message})`
                        })
                    })
            }).catch(
                error => {
                    lastSyncDateVar = null;
                    document.getElementById("retryButtonDiv").style.display = "block";
                    this.setState({
                        errorMessage: `Sync failed(${error.message})`
                    })
                });
        } else {
            document.getElementById("retryButtonDiv").style.display = "block";
            this.setState({
                errorMessage: "Sync failed"
            })
        }
    }


    retryClicked() {
        this.setState({
            totalMasters: 19,
            syncedMasters: 0,
            syncedPercentage: 0,
            errorMessage: "",
            successMessage: ""
        })
        this.syncMasters();
    }
}