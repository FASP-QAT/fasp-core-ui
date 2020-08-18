import CryptoJS from 'crypto-js';
import { Formik } from 'formik';
import React, { Component } from 'react';
import {
    Button, Card, CardBody, CardFooter, Col, Form, FormGroup,
    Label, Modal, ModalBody, ModalFooter, ModalHeader
} from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { SECRET_KEY } from '../../Constants.js';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import InventoryInSupplyPlanComponent from "../SupplyPlan/InventoryInSupplyPlan";
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';

const entityname = i18n.t('static.inventory.inventorydetils')
export default class AddInventory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            programList: [],
            programId: '',
            changedFlag: 0,
            countrySKUList: [],
            message: '',
            lang: localStorage.getItem('lang'),
            timeout: 0,
            inventoryType: 1,
            showInventory: 0,
            inventoryChangedFlag: 0,
            inventoryDataType: { value: 1, label: i18n.t('static.inventory.inventory') }

        }
        this.options = props.options;
        this.formSubmit = this.formSubmit.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this)
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.updateState = this.updateState.bind(this);
        this.toggleLarge = this.toggleLarge.bind(this);
    }

    toggleLarge() {
        this.setState({
            inventoryBatchInfoChangedFlag: 0,
            inventoryBatchInfoDuplicateError: '',
            inventoryBatchInfoNoStockError: ''
        })
        this.setState({
            inventoryBatchInfo: !this.state.inventoryBatchInfo,
        });
    }

    hideFirstComponent() {
        document.getElementById('div1').style.display = 'block';
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    // hideFirstComponent() {
    //     document.getElementById('div1').style.display = 'block';
    //     clearTimeout(this.state.timeout);
    //     this.state.timeout = setTimeout(function () {
    //         document.getElementById('div1').style.display = 'none';
    //     }, 8000);

    // }

    componentDidMount() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onerror = function (event) {
            this.setState({
                message: i18n.t('static.program.errortext'),
                color: 'red'
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var program = transaction.objectStore('programData');
            var getRequest = program.getAll();
            var proList = []
            getRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: 'red'
                })
            }.bind(this);
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var programDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson1 = JSON.parse(programData);
                        var programJson = {
                            label: getLabelText(JSON.parse(programNameLabel), this.state.lang) + " - " + programJson1.programCode + "~v" + myResult[i].version,
                            value: myResult[i].id
                        }
                        proList.push(programJson)
                    }
                }
                this.setState({
                    programList: proList
                })

            }.bind(this);
        }.bind(this)

    }

    getPlanningUnitList(value) {
        this.setState({
            programSelect: value,
            programId: value.value
        })
        var db1;
        var storeOS;
        var regionList = [];
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onerror = function (event) {
            this.setState({
                message: i18n.t('static.program.errortext'),
                color: 'red'
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var programDataTransaction = db1.transaction(['programData'], 'readwrite');
            var programDataOs = programDataTransaction.objectStore('programData');
            var programRequest = programDataOs.get(value.value);
            programRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            }.bind(this);
            programRequest.onsuccess = function (e) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                for (var i = 0; i < programJson.regionList.length; i++) {
                    var regionJson = {
                        name: getLabelText(programJson.regionList[i].label, this.state.lang),
                        id: programJson.regionList[i].regionId
                    }
                    regionList.push(regionJson)

                }

                var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                var planningunitRequest = planningunitOs.getAll();
                var planningList = []
                planningunitRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext'),
                        color: 'red'
                    })
                }.bind(this);
                planningunitRequest.onsuccess = function (e) {
                    var myResult = [];
                    myResult = planningunitRequest.result;
                    console.log("myResult", myResult);
                    var programId = (value.value).split("_")[0];
                    console.log('programId----->>>', programId)
                    console.log(myResult);
                    var proList = []
                    for (var i = 0; i < myResult.length; i++) {
                        if (myResult[i].program.id == programId && myResult[i].active == true) {
                            var productJson = {
                                label: getLabelText(myResult[i].planningUnit.label, this.state.lang),
                                value: myResult[i].planningUnit.id
                            }
                            proList.push(productJson)
                        }
                    }
                    console.log("proList---" + proList);
                    this.setState({
                        planningUnitList: proList,
                        planningUnitListAll: myResult,
                        regionList: regionList
                    })
                }.bind(this);
            }.bind(this)
        }.bind(this)
    }

    formSubmit(value) {
        var programId = document.getElementById('programId').value;
        this.setState({ programId: programId, planningUnitId: value.value, planningUnit: value });
        var planningUnitId = value.value;
        var programId = document.getElementById("programId").value;
        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onerror = function (event) {
            this.setState({
                message: i18n.t('static.program.errortext'),
                color: 'red'
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var programTransaction = transaction.objectStore('programData');
            var programRequest = programTransaction.get(programId);
            programRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: 'red'
                })
            }.bind(this);
            programRequest.onsuccess = function (event) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                var batchList = []
                var batchInfoList = programJson.batchInfoList;
                var inventoryListUnFiltered = (programJson.inventoryList);
                var inventoryList = (programJson.inventoryList).filter(c =>
                    c.planningUnit.id == planningUnitId &&
                    c.region != null);
                if (this.state.inventoryType == 1) {
                    inventoryList = inventoryList.filter(c => c.actualQty != "" && c.actualQty != 0 && c.actualQty != null);
                } else {
                    inventoryList = inventoryList.filter(c => c.adjustmentQty != "" && c.adjustmentQty != 0 && c.adjustmentQty != null);
                }
                this.setState({
                    batchInfoList: batchInfoList,
                    programJson: programJson,
                    inventoryListUnFiltered: inventoryListUnFiltered,
                    inventoryList: inventoryList,
                    showInventory: 1,
                    inventoryType: this.state.inventoryType,
                    inventoryMonth: "",
                    inventoryEndDate: "",
                    inventoryRegion: ""
                })
                this.refs.inventoryChild.showInventoryData();
            }.bind(this)
        }.bind(this)
    }

    updateState(parameterName, value) {
        console.log("in update state")
        this.setState({
            [parameterName]: value
        })

    }

    updateDataType(value) {
        this.setState({
            inventoryType: value.value,
            inventoryDataType: value
        })
        this.formSubmit(this.state.planningUnit);
    }

    render() {
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className={this.state.color} id="div1">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <CardBody >
                        <Formik
                            render={
                                ({
                                }) => (
                                        <Form name='simpleForm'>
                                            <Col md="12 pl-0">
                                                <div className="row">
                                                    <FormGroup className="col-md-4">
                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                                        <div className="controls ">
                                                            <Select
                                                                name="programSelect"
                                                                id="programSelect"
                                                                bsSize="sm"
                                                                options={this.state.programList}
                                                                value={this.state.programSelect}
                                                                onChange={(e) => { this.getPlanningUnitList(e); }}
                                                            />
                                                        </div>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-4 ">
                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.supplyPlan.qatProduct')}</Label>
                                                        <div className="controls ">
                                                            <Select
                                                                name="planningUnit"
                                                                id="planningUnit"
                                                                bsSize="sm"
                                                                options={this.state.planningUnitList}
                                                                value={this.state.planningUnit}
                                                                onChange={(e) => { this.formSubmit(e); }}
                                                            />
                                                        </div>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-4 ">
                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.supplyPlan.inventoryType')}</Label>
                                                        <div className="controls ">
                                                            <Select
                                                                name="inventoryDataType"
                                                                id="inventoryDataType"
                                                                bsSize="sm"
                                                                options={[{ value: 1, label: i18n.t('static.inventory.inventory') }, { value: 2, label: i18n.t('static.inventoryType.adjustment') }]}
                                                                value={this.state.inventoryDataType}
                                                                onChange={(e) => { this.updateDataType(e); }}
                                                            />
                                                        </div>
                                                    </FormGroup>
                                                    <input type="hidden" id="planningUnitId" name="planningUnitId" value={this.state.planningUnitId} />
                                                    <input type="hidden" id="programId" name="programId" value={this.state.programId} />
                                                </div>
                                            </Col>
                                        </Form>
                                    )} />

                        <Col xs="12" sm="12" className="p-0">
                            {this.state.showInventory == 1 && <InventoryInSupplyPlanComponent ref="inventoryChild" items={this.state} toggleLarge={this.toggleLarge} updateState={this.updateState} inventoryPage="inventoryDataEntry" />}
                            <h6 className="red">{this.state.inventoryDuplicateError || this.state.inventoryNoStockError || this.state.inventoryError}</h6>
                            <div className="table-responsive">
                                <div id="adjustmentsTable" className="table-responsive" />
                            </div>
                        </Col>
                    </CardBody>
                    <CardFooter>
                        <FormGroup>
                            <FormGroup>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                {this.state.inventoryChangedFlag == 1 && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.refs.inventoryChild.saveInventory}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}
                                &nbsp;
                        </FormGroup>
                        </FormGroup>
                    </CardFooter>
                </Card>

                <Modal isOpen={this.state.inventoryBatchInfo}
                    className={'modal-lg ' + this.props.className, "modalWidth"}>
                    <ModalHeader toggle={() => this.toggleLarge()} className="modalHeaderSupplyPlan">
                        <strong>{i18n.t('static.dataEntry.batchDetails')}</strong>
                    </ModalHeader>
                    <ModalBody>
                        <h6 className="red">{this.state.inventoryBatchInfoDuplicateError || this.state.inventoryBatchInfoNoStockError || this.state.inventoryBatchError}</h6>
                        <div className="table-responsive">
                            <div id="inventoryBatchInfoTable"></div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <div id="showInventoryBatchInfoButtonsDiv" style={{ display: 'none' }}>
                            {this.state.inventoryBatchInfoChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.inventoryChild.saveInventoryBatchInfo()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveBatchInfo')}</Button>}
                        </div>
                        <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                    </ModalFooter>
                </Modal>
            </div >
        );
    }

    cancelClicked() {
        this.props.history.push(`/ApplicationDashboard/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    actionCanceled() {
        this.toggleLarge();
    }
}

