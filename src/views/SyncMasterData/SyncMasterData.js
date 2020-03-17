import React, { Component } from 'react';
import {
    Card, CardBody, CardHeader,
    CardFooter, Button, Col, Progress,FormGroup
} from 'reactstrap';
import '../Forms/ValidationForms/ValidationForms.css';
import 'react-select/dist/react-select.min.css';
import * as JsStoreFunction from "../../CommonComponent/JsStoreFunctions.js"
import * as JsStoreFunctionCore from "../../CommonComponent/JsStoreFunctionsCore"
import moment from 'moment';
import MasterSyncService from '../../api/MasterSyncService.js';
import AuthenticationService from '../common/AuthenticationService.js';

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
                            <FormGroup>
                                <Button type="button" size="sm" color="warning" className="float-right mr-1" onClick={() => this.retryClicked()}><i className="fa fa-refresh"></i> Retry</Button>
                                &nbsp;
                            </FormGroup>
                        </CardFooter>
                    </Card>
                </Col>
            </>
        )

    }


    syncMasters() {
        if (navigator.onLine) {
            var db1;
            var storeOS;
            var openRequest = indexedDB.open('fasp', 1);
            openRequest.onsuccess = function (e) {
                var realmId = AuthenticationService.getRealmId();
                db1 = e.target.result;
                var transaction = db1.transaction(['lastSyncDate'], 'readwrite');
                var lastSyncDateTransaction = transaction.objectStore('lastSyncDate');
                var updatedSyncDate = ((moment(Date.now()).utcOffset('-0500').format('YYYY-MM-DD HH:mm')));
                var lastSyncDateRequest = lastSyncDateTransaction.getAll();
                lastSyncDateRequest.onsuccess = function (event) {
                    var lastSyncDate = lastSyncDateRequest.result[0];
                    var result = lastSyncDateRequest.result;
                    for (var i = 0; i < result.length; i++) {
                        if (result[i] = realmId) {
                            var lastSyncDateRealm = lastSyncDateRequest.result[i];
                        }
                    }

                    if (lastSyncDate == undefined) {
                        lastSyncDate = null;
                    }
                    if (lastSyncDateRealm == undefined) {
                        lastSyncDateRealm = null;
                    }
                    AuthenticationService.setupAxiosInterceptors();
                    if (navigator.onLine) {
                        //Code to Sync Country list
                        MasterSyncService.getCountryListForSync(lastSyncDate)
                            .then(response => {
                                var json = response.data;
                                var countryTransaction = db1.transaction(['country'], 'readwrite');
                                var countryObjectStore = countryTransaction.objectStore('country');
                                for (var i = 0; i < json.length; i++) {
                                    countryObjectStore.put(json[i]);
                                }
                                this.setState({
                                    syncedMasters: this.state.syncedMasters + 1,
                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                })
                                if (navigator.onLine) {
                                    // Code to Sync Currency list
                                    MasterSyncService.getCurrencyListForSync(lastSyncDate)
                                        .then(response => {
                                            var json = response.data;
                                            var currencyTransaction = db1.transaction(['currency'], 'readwrite');
                                            var currencyObjectStore = currencyTransaction.objectStore('currency');
                                            for (var i = 0; i < json.length; i++) {
                                                currencyObjectStore.put(json[i]);
                                            }
                                            this.setState({
                                                syncedMasters: this.state.syncedMasters + 1,
                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                            })
                                            if (navigator.onLine) {
                                                // Code to sync unit list
                                                MasterSyncService.getUnitListForSync(lastSyncDate)
                                                    .then(response => {
                                                        var json = response.data;
                                                        var unitTransaction = db1.transaction(['unit'], 'readwrite');
                                                        var unitObjectStore = unitTransaction.objectStore('unit');
                                                        for (var i = 0; i < json.length; i++) {
                                                            unitObjectStore.put(json[i]);
                                                        }
                                                        this.setState({
                                                            syncedMasters: this.state.syncedMasters + 1,
                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                        })
                                                        if (navigator.onLine) {
                                                            //Code to Sync UnitType list
                                                            MasterSyncService.getUnitTypeList()
                                                                .then(response => {
                                                                    var json = response.data;
                                                                    var unitTypeTransaction = db1.transaction(['unitType'], 'readwrite');
                                                                    var unitTypeObjectStore = unitTypeTransaction.objectStore('unitType');
                                                                    for (var i = 0; i < json.length; i++) {
                                                                        unitTypeObjectStore.put(json[i]);
                                                                    }
                                                                    this.setState({
                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                    })
                                                                    if (navigator.onLine) {
                                                                        //Code to Sync Organisation list
                                                                        MasterSyncService.getOrganisationListForSync(lastSyncDateRealm, realmId)
                                                                            .then(response => {
                                                                                var json = response.data;
                                                                                var organisationTransaction = db1.transaction(['organisation'], 'readwrite');
                                                                                var organisationObjectStore = organisationTransaction.objectStore('organisation');
                                                                                for (var i = 0; i < json.length; i++) {
                                                                                    organisationObjectStore.put(json[i]);
                                                                                }
                                                                                this.setState({
                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                })
                                                                                if (navigator.onLine) {
                                                                                    //Code to Sync HealthArea list
                                                                                    MasterSyncService.getHealthAreaListForSync(lastSyncDateRealm, realmId)
                                                                                        .then(response => {
                                                                                            var json = response.data;
                                                                                            var healthAreaTransaction = db1.transaction(['healthArea'], 'readwrite');
                                                                                            var healthAreaObjectStore = healthAreaTransaction.objectStore('healthArea');
                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                healthAreaObjectStore.put(json[i]);
                                                                                            }
                                                                                            this.setState({
                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                            })
                                                                                            if (navigator.onLine) {
                                                                                                //Code to Sync Region list
                                                                                                MasterSyncService.getRegionListForSync(lastSyncDateRealm, realmId)
                                                                                                    .then(response => {
                                                                                                        var json = response.data;
                                                                                                        var regionTransaction = db1.transaction(['region'], 'readwrite');
                                                                                                        var regionObjectStore = regionTransaction.objectStore('region');
                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                            regionObjectStore.put(json[i]);
                                                                                                        }
                                                                                                        this.setState({
                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                        })
                                                                                                        if (navigator.onLine) {
                                                                                                            //Code to Sync FundingSource list
                                                                                                            MasterSyncService.getFundingSourceListForSync(lastSyncDateRealm, realmId)
                                                                                                                .then(response => {
                                                                                                                    var json = response.data;
                                                                                                                    var fundingSourceTransaction = db1.transaction(['fundingSource'], 'readwrite');
                                                                                                                    var fundingSourceObjectStore = fundingSourceTransaction.objectStore('fundingSource');
                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                        fundingSourceObjectStore.put(json[i]);
                                                                                                                    }
                                                                                                                    this.setState({
                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                    })
                                                                                                                    if (navigator.onLine) {
                                                                                                                        //Code to Sync SubFundingSource list
                                                                                                                        MasterSyncService.getSubFundingSourceListForSync(lastSyncDateRealm, realmId)
                                                                                                                            .then(response => {
                                                                                                                                var json = response.data;
                                                                                                                                var subFundingSourceTransaction = db1.transaction(['subFundingSource'], 'readwrite');
                                                                                                                                var subFundingSourceObjectStore = subFundingSourceTransaction.objectStore('subFundingSource');
                                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                                    subFundingSourceObjectStore.put(json[i]);
                                                                                                                                }
                                                                                                                                this.setState({
                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                })
                                                                                                                                if (navigator.onLine) {
                                                                                                                                    //Code to Sync Product list
                                                                                                                                    MasterSyncService.getProductListForSync(lastSyncDateRealm, realmId)
                                                                                                                                        .then(response => {
                                                                                                                                            var json = response.data;
                                                                                                                                            var productTransaction = db1.transaction(['product'], 'readwrite');
                                                                                                                                            var productObjectStore = productTransaction.objectStore('product');
                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                productObjectStore.put(json[i]);
                                                                                                                                            }
                                                                                                                                            this.setState({
                                                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                            })
                                                                                                                                            if (navigator.onLine) {
                                                                                                                                                //Code to Sync ProductCategory list
                                                                                                                                                MasterSyncService.getProductCategoryListForSync(lastSyncDate)
                                                                                                                                                    .then(response => {
                                                                                                                                                        var json = response.data;
                                                                                                                                                        var productCategoryTransaction = db1.transaction(['productCategory'], 'readwrite');
                                                                                                                                                        var productCategoryObjectStore = productCategoryTransaction.objectStore('productCategory');
                                                                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                                                                            productCategoryObjectStore.put(json[i]);
                                                                                                                                                        }
                                                                                                                                                        this.setState({
                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                        })
                                                                                                                                                        if (navigator.onLine) {
                                                                                                                                                            //Code to Sync DataSource list
                                                                                                                                                            MasterSyncService.getDataSourceListForSync(lastSyncDate)
                                                                                                                                                                .then(response => {
                                                                                                                                                                    var json = response.data;
                                                                                                                                                                    var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
                                                                                                                                                                    var dataSourceObjectStore = dataSourceTransaction.objectStore('dataSource');
                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                        dataSourceObjectStore.put(json[i]);
                                                                                                                                                                    }
                                                                                                                                                                    this.setState({
                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                    })
                                                                                                                                                                    if (navigator.onLine) {
                                                                                                                                                                        //Code to Sync DataSourceType list
                                                                                                                                                                        MasterSyncService.getDataSourceTypeListForSync(lastSyncDate)
                                                                                                                                                                            .then(response => {
                                                                                                                                                                                var json = response.data;
                                                                                                                                                                                var dataSourceTypeTransaction = db1.transaction(['dataSourceType'], 'readwrite');
                                                                                                                                                                                var dataSourceTypeObjectStore = dataSourceTypeTransaction.objectStore('dataSourceType');
                                                                                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                    dataSourceTypeObjectStore.put(json[i]);
                                                                                                                                                                                }
                                                                                                                                                                                this.setState({
                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                })
                                                                                                                                                                                if (navigator.onLine) {
                                                                                                                                                                                    //Code to Sync ShipmentStatus list
                                                                                                                                                                                    MasterSyncService.getShipmentStatusListForSync(lastSyncDate)
                                                                                                                                                                                        .then(response => {
                                                                                                                                                                                            var json = response.data;
                                                                                                                                                                                            var shipmentStatusTransaction = db1.transaction(['shipmentStatus'], 'readwrite');
                                                                                                                                                                                            var shipmentStatusObjectStore = shipmentStatusTransaction.objectStore('shipmentStatus');
                                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                shipmentStatusObjectStore.put(json[i]);
                                                                                                                                                                                            }
                                                                                                                                                                                            this.setState({
                                                                                                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                            })
                                                                                                                                                                                            if (navigator.onLine) {
                                                                                                                                                                                                //Code to Sync ShipmentStatusAllowed list
                                                                                                                                                                                                MasterSyncService.getShipmentStatusAllowedListForSync(lastSyncDate)
                                                                                                                                                                                                    .then(response => {
                                                                                                                                                                                                        var json = response.data;
                                                                                                                                                                                                        var shipmentStatusAllowedTransaction = db1.transaction(['shipmentStatusAllowed'], 'readwrite');
                                                                                                                                                                                                        var shipmentStatusAllowedObjectStore = shipmentStatusAllowedTransaction.objectStore('shipmentStatusAllowed');
                                                                                                                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                            shipmentStatusAllowedObjectStore.put(json[i]);
                                                                                                                                                                                                        }
                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                        })
                                                                                                                                                                                                        if (navigator.onLine) {
                                                                                                                                                                                                            //Code to Sync LogisticsUnit list
                                                                                                                                                                                                            MasterSyncService.getLogisticsUnitListForSync(lastSyncDateRealm, realmId)
                                                                                                                                                                                                                .then(response => {
                                                                                                                                                                                                                    var json = response.data;
                                                                                                                                                                                                                    var logisticsUnitTransaction = db1.transaction(['logisticsUnit'], 'readwrite');
                                                                                                                                                                                                                    var logisticsUnitObjectStore = logisticsUnitTransaction.objectStore('logisticsUnit');
                                                                                                                                                                                                                    for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                        logisticsUnitObjectStore.put(json[i]);
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                        syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                        syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                    })
                                                                                                                                                                                                                    if (navigator.onLine) {
                                                                                                                                                                                                                        //Code to Sync PlanningUnit list
                                                                                                                                                                                                                        MasterSyncService.getPlanningUnitListForSync(lastSyncDateRealm, realmId)
                                                                                                                                                                                                                            .then(response => {
                                                                                                                                                                                                                                var json = response.data;
                                                                                                                                                                                                                                var planningUnitTransaction = db1.transaction(['planningUnit'], 'readwrite');
                                                                                                                                                                                                                                var planningUnitObjectStore = planningUnitTransaction.objectStore('planningUnit');
                                                                                                                                                                                                                                for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                    planningUnitObjectStore.put(json[i]);
                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                                                    syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                    syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                })
                                                                                                                                                                                                                                if (navigator.onLine) {
                                                                                                                                                                                                                                    //Code to Sync Manufacturer list
                                                                                                                                                                                                                                    MasterSyncService.getManufacturerListForSync(lastSyncDateRealm, realmId)
                                                                                                                                                                                                                                        .then(response => {
                                                                                                                                                                                                                                            var json = response.data;
                                                                                                                                                                                                                                            var manufacturerTransaction = db1.transaction(['manufacturer'], 'readwrite');
                                                                                                                                                                                                                                            var manufacturerObjectStore = manufacturerTransaction.objectStore('manufacturer');
                                                                                                                                                                                                                                            for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                manufacturerObjectStore.put(json[i]);
                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                            this.setState({
                                                                                                                                                                                                                                                syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                            })
                                                                                                                                                                                                                                            if (navigator.onLine) {
                                                                                                                                                                                                                                                MasterSyncService.getLanguageListForSync(lastSyncDate)
                                                                                                                                                                                                                                                    .then(response => {
                                                                                                                                                                                                                                                        var json = response.data;
                                                                                                                                                                                                                                                        var languageTransaction = db1.transaction(['language'], 'readwrite');
                                                                                                                                                                                                                                                        var languageObjectStore = languageTransaction.objectStore('language');
                                                                                                                                                                                                                                                        for (var i = 0; i < json.length; i++) {
                                                                                                                                                                                                                                                            languageObjectStore.put(json[i]);
                                                                                                                                                                                                                                                        }


                                                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                                                            syncedMasters: this.state.syncedMasters + 1,
                                                                                                                                                                                                                                                            syncedPercentage: Math.floor(((this.state.syncedMasters + 1) / this.state.totalMasters) * 100)
                                                                                                                                                                                                                                                        })

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
                                                                                                                                                                                                                                                                document.getElementById("retryButtonDiv").style.display = "none";
                                                                                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                                                                                    message: `Master data synced successfully.`
                                                                                                                                                                                                                                                                })
                                                                                                                                                                                                                                                                this.props.history.push(`/dashboard/` + "Master data synced successfully.")
                                                                                                                                                                                                                                                            }.bind(this)
                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                            document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                            this.setState({
                                                                                                                                                                                                                                                                message: `Sync failed`
                                                                                                                                                                                                                                                            })
                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                    .catch(
                                                                                                                                                                                                                                                        error => {
                                                                                                                                                                                                                                                            document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                            this.setState({
                                                                                                                                                                                                                                                                message: `Sync failed`
                                                                                                                                                                                                                                                            })
                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                    );
                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                                                                    message: `You must be online`
                                                                                                                                                                                                                                                })
                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                        .catch(
                                                                                                                                                                                                                                            error => {
                                                                                                                                                                                                                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                                                                    message: `Sync failed`
                                                                                                                                                                                                                                                })
                                                                                                                                                                                                                                            });
                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                    document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                        message: `You must be online`
                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                }
                                                                                                                                                                                                                            })
                                                                                                                                                                                                                            .catch(
                                                                                                                                                                                                                                error => {
                                                                                                                                                                                                                                    document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                                    this.setState({
                                                                                                                                                                                                                                        message: `Sync failed`
                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                });
                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                            message: `You must be online`
                                                                                                                                                                                                                        })
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                })
                                                                                                                                                                                                                .catch(
                                                                                                                                                                                                                    error => {
                                                                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                                        this.setState({
                                                                                                                                                                                                                            message: `Sync failed`
                                                                                                                                                                                                                        })
                                                                                                                                                                                                                    });
                                                                                                                                                                                                        } else {
                                                                                                                                                                                                            document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                            this.setState({
                                                                                                                                                                                                                message: `You must be online`
                                                                                                                                                                                                            })
                                                                                                                                                                                                        }
                                                                                                                                                                                                    })
                                                                                                                                                                                                    .catch(
                                                                                                                                                                                                        error => {
                                                                                                                                                                                                            document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                            this.setState({
                                                                                                                                                                                                                message: `Sync failed`
                                                                                                                                                                                                            })
                                                                                                                                                                                                        });
                                                                                                                                                                                            } else {
                                                                                                                                                                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                    message: `You must be online`
                                                                                                                                                                                                })
                                                                                                                                                                                            }
                                                                                                                                                                                        })
                                                                                                                                                                                        .catch(
                                                                                                                                                                                            error => {
                                                                                                                                                                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                                this.setState({
                                                                                                                                                                                                    message: `Sync failed`
                                                                                                                                                                                                })
                                                                                                                                                                                            });
                                                                                                                                                                                } else {
                                                                                                                                                                                    document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                    this.setState({
                                                                                                                                                                                        message: `You must be online`
                                                                                                                                                                                    })
                                                                                                                                                                                }
                                                                                                                                                                            })
                                                                                                                                                                            .catch(
                                                                                                                                                                                error => {
                                                                                                                                                                                    document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                                    this.setState({
                                                                                                                                                                                        message: `Sync failed`
                                                                                                                                                                                    })
                                                                                                                                                                                });
                                                                                                                                                                    } else {
                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                        this.setState({
                                                                                                                                                                            message: `You must be online`
                                                                                                                                                                        })
                                                                                                                                                                    }
                                                                                                                                                                })
                                                                                                                                                                .catch(
                                                                                                                                                                    error => {
                                                                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                                        this.setState({
                                                                                                                                                                            message: `Sync failed`
                                                                                                                                                                        })
                                                                                                                                                                    });
                                                                                                                                                        } else {
                                                                                                                                                            document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                            this.setState({
                                                                                                                                                                message: `You must be online`
                                                                                                                                                            })
                                                                                                                                                        }
                                                                                                                                                    })
                                                                                                                                                    .catch(
                                                                                                                                                        error => {
                                                                                                                                                            document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                            this.setState({
                                                                                                                                                                message: `Sync failed`
                                                                                                                                                            })
                                                                                                                                                        });
                                                                                                                                            } else {
                                                                                                                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                this.setState({
                                                                                                                                                    message: `You must be online`
                                                                                                                                                })
                                                                                                                                            }
                                                                                                                                        })
                                                                                                                                        .catch(
                                                                                                                                            error => {
                                                                                                                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                                this.setState({
                                                                                                                                                    message: `Sync failed`
                                                                                                                                                })
                                                                                                                                            });
                                                                                                                                } else {
                                                                                                                                    document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                    this.setState({
                                                                                                                                        message: `You must be online`
                                                                                                                                    })
                                                                                                                                }
                                                                                                                            })
                                                                                                                            .catch(
                                                                                                                                error => {
                                                                                                                                    document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                                    this.setState({
                                                                                                                                        message: `Sync failed`
                                                                                                                                    })
                                                                                                                                });
                                                                                                                    } else {
                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                        this.setState({
                                                                                                                            message: `You must be online`
                                                                                                                        })
                                                                                                                    }
                                                                                                                })
                                                                                                                .catch(
                                                                                                                    error => {
                                                                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                                        this.setState({
                                                                                                                            message: `Sync failed`
                                                                                                                        })
                                                                                                                    });
                                                                                                        } else {
                                                                                                            document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                            this.setState({
                                                                                                                message: `You must be online`
                                                                                                            })
                                                                                                        }
                                                                                                    })
                                                                                                    .catch(
                                                                                                        error => {
                                                                                                            document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                            this.setState({
                                                                                                                message: `Sync failed`
                                                                                                            })
                                                                                                        });
                                                                                            } else {
                                                                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                this.setState({
                                                                                                    message: `You must be online`
                                                                                                })
                                                                                            }
                                                                                        })
                                                                                        .catch(
                                                                                            error => {
                                                                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                                                                this.setState({
                                                                                                    message: `Sync failed`
                                                                                                })
                                                                                            });
                                                                                } else {
                                                                                    document.getElementById("retryButtonDiv").style.display = "block";
                                                                                    this.setState({
                                                                                        message: `You must be online`
                                                                                    })
                                                                                }
                                                                            })
                                                                            .catch(
                                                                                error => {
                                                                                    document.getElementById("retryButtonDiv").style.display = "block";
                                                                                    this.setState({
                                                                                        message: `Sync failed`
                                                                                    })
                                                                                });
                                                                    } else {
                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                        this.setState({
                                                                            message: `You must be online`
                                                                        })
                                                                    }
                                                                })
                                                                .catch(
                                                                    error => {
                                                                        document.getElementById("retryButtonDiv").style.display = "block";
                                                                        this.setState({
                                                                            message: `Sync failed`
                                                                        })
                                                                    });
                                                        } else {
                                                            document.getElementById("retryButtonDiv").style.display = "block";
                                                            this.setState({
                                                                message: `You must be online`
                                                            })
                                                        }
                                                    })
                                                    .catch(
                                                        error => {
                                                            document.getElementById("retryButtonDiv").style.display = "block";
                                                            this.setState({
                                                                message: `Sync failed`
                                                            })
                                                        });
                                            } else {
                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                this.setState({
                                                    message: `You must be online`
                                                })
                                            }
                                        })
                                        .catch(
                                            error => {
                                                document.getElementById("retryButtonDiv").style.display = "block";
                                                this.setState({
                                                    message: `Sync failed`
                                                })
                                            });
                                } else {
                                    document.getElementById("retryButtonDiv").style.display = "block";
                                    this.setState({
                                        message: `You must be online`
                                    })
                                }
                            })
                            .catch(
                                error => {
                                    document.getElementById("retryButtonDiv").style.display = "block";
                                    this.setState({
                                        message: `Sync failed`
                                    })
                                });
                    } else {
                        document.getElementById("retryButtonDiv").style.display = "block";
                        this.setState({
                            message: `You must be online`
                        })
                    }
                }.bind(this)
            }.bind(this)
        } else {
            alert(`You must be online`);
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