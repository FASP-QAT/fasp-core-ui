import React from "react";
import {
    Card, CardBody,
    Label, FormGroup,
    CardFooter, Button, Col, Form, Modal, ModalHeader, ModalFooter, ModalBody
} from 'reactstrap';
import { Formik } from 'formik';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME } from '../../Constants.js'
import getLabelText from '../../CommonComponent/getLabelText'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import ShipmentsInSupplyPlanComponent from "../SupplyPlan/ShipmentsInSupplyPlan";
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import AuthenticationService from "../Common/AuthenticationService.js";

const entityname = i18n.t('static.dashboard.shipmentdetails');

export default class ShipmentDetails extends React.Component {

    constructor(props) {
        super(props);
        this.options = props.options;
        this.state = {
            loading: true,
            message: '',
            lang: localStorage.getItem("lang"),
            programList: [],
            categoryList: [],
            productList: [],
            consumptionDataList: [],
            changedFlag: 0,
            planningUnitList: [],
            productCategoryId: '',
            shipmentsEl: '',
            timeout: 0,
            showShipments: 0,
            shipmentChangedFlag: 0,
            shipmentModalTitle: ""
        }
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this)
        this.formSubmit = this.formSubmit.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.toggleLarge = this.toggleLarge.bind(this);
        this.updateState = this.updateState.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.hideThirdComponent = this.hideThirdComponent.bind(this);
        this.hideFourthComponent = this.hideFourthComponent.bind(this);
        this.hideFifthComponent = this.hideFifthComponent.bind(this);
    }

    hideFirstComponent() {
        document.getElementById('div1').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }

    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    hideThirdComponent() {
        document.getElementById('div3').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div3').style.display = 'none';
        }, 8000);
    }

    hideFourthComponent() {
        document.getElementById('div4').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div4').style.display = 'none';
        }, 8000);
    }

    hideFifthComponent(){
        document.getElementById('div5').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div5').style.display = 'none';
        }, 8000);
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    componentDidMount = function () {
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
            var transaction = db1.transaction(['programData'], 'readwrite');
            var program = transaction.objectStore('programData');
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
                            label: programJson1.programCode + "~v" + myResult[i].version,
                            value: myResult[i].id
                        }
                        proList.push(programJson)
                    }
                }
                this.setState({
                    programList: proList,
                    loading: false
                })

                var programIdd = this.props.match.params.programId;
                console.log("programIdd", programIdd);
                if (programIdd != '' && programIdd != undefined) {
                    var programSelect = { value: programIdd, label: proList.filter(c => c.value == programIdd)[0].label };
                    this.setState({
                        programSelect: programSelect,
                        programId: programIdd
                    })
                    this.getPlanningUnitList(programSelect);
                }
            }.bind(this);
        }.bind(this)
    };

    getPlanningUnitList(value) {
        document.getElementById("planningUnitId").value = 0;
        document.getElementById("planningUnit").value = "";
        document.getElementById("shipmentsDetailsTable").style.display = "none";
        this.setState({
            programSelect: value,
            programId: value != "" && value != undefined ? value != "" && value != undefined ? value.value : 0 : 0,
            planningUnit: "",
            planningUnitId: "",
            loading: true
        })
        var programId = value != "" && value != undefined ? value.value : 0;
        if (programId != 0) {
            var db1;
            var storeOS;
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
                var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                var planningunitRequest = planningunitOs.getAll();
                var planningList = []
                planningunitRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext'),
                        color: 'red'
                    })
                    this.hideFirstComponent()
                }.bind(this);
                planningunitRequest.onsuccess = function (e) {
                    var myResult = [];
                    myResult = planningunitRequest.result;
                    console.log("myResult", myResult);
                    var programId = (value != "" && value != undefined ? value.value : 0).split("_")[0];
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
                        loading: false
                    })
                    var planningUnitIdProp = this.props.match.params.planningUnitId;
                    console.log("planningUnitIdProp===>", planningUnitIdProp);
                    if (planningUnitIdProp != '' && planningUnitIdProp != undefined) {
                        var planningUnit = { value: planningUnitIdProp, label: proList.filter(c => c.value == planningUnitIdProp)[0].label };
                        this.setState({
                            planningUnit: planningUnit,
                            planningUnitId: planningUnitIdProp
                        })
                        this.formSubmit(planningUnit);
                    }
                }.bind(this);
            }.bind(this)
        } else {
            this.setState({
                loading: false,
                planningUnitList: []
            })
        }
    }

    formSubmit(value) {
        this.setState({ loading: true })
        var programId = document.getElementById('programId').value;
        this.setState({ programId: programId, planningUnitId: value != "" && value != undefined ? value.value : 0, planningUnit: value });
        var planningUnitId = value != "" && value != undefined ? value.value : 0;
        var programId = document.getElementById("programId").value;
        if (planningUnitId != 0) {
            document.getElementById("shipmentsDetailsTable").style.display = "block";
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
                var transaction = db1.transaction(['programData'], 'readwrite');
                var programTransaction = transaction.objectStore('programData');
                var programRequest = programTransaction.get(programId);
                programRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext'),
                        color: 'red'
                    })
                    this.hideFirstComponent()
                }.bind(this);
                programRequest.onsuccess = function (event) {
                    var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);

                    console.log("this.state.planningUnitListAll", this.state.planningUnitListAll);
                    var programPlanningUnit = ((this.state.planningUnitListAll).filter(p => p.planningUnit.id == planningUnitId))[0];
                    var shipmentListUnFiltered = programJson.shipmentList;
                    this.setState({
                        shipmentListUnFiltered: shipmentListUnFiltered
                    })
                    var shipmentList = programJson.shipmentList.filter(c => c.planningUnit.id == (value != "" && value != undefined ? value.value : 0));
                    console.log("Shipment list", shipmentList);
                    this.setState({
                        shelfLife: programPlanningUnit.shelfLife,
                        programJson: programJson,
                        shipmentListUnFiltered: shipmentListUnFiltered,
                        shipmentList: shipmentList,
                        showShipments: 1,
                    })
                    this.refs.shipmentChild.showShipmentData();
                }.bind(this)
            }.bind(this)
        } else {
            document.getElementById("shipmentsDetailsTable").style.display = "none";
            this.setState({ loading: false });
        }
    }

    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    toggleLarge() {
        this.setState({
            shipmentBatchInfoChangedFlag: 0,
            shipmentBatchInfoDuplicateError: '',
            shipmentValidationBatchError: '',
            qtyCalculatorValidationError: "",
            shipmentDatesError: "",

        })
        this.setState({
            batchInfo: !this.state.batchInfo,
        });
    }

    actionCanceled() {
        this.setState({
            message: i18n.t('static.message.cancelled'),
            color: 'red',
        })
        this.hideFirstComponent()
        this.toggleLarge();
    }

    updateState(parameterName, value) {
        console.log("in update state")
        this.setState({
            [parameterName]: value
        })

    }

    render() {
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} loading={(loading) => {
                    this.setState({ loading: loading })
                }} />
                <h5 className={this.state.color} id="div1">{i18n.t(this.state.message, { entityname }) || this.state.supplyPlanError}</h5>
                <h5 className="red" id="div2">{this.state.noFundsBudgetError || this.state.shipmentBatchError || this.state.shipmentError}</h5>
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <CardBody className="pb-lg-4 pt-lg-2">
                        <Formik
                            render={
                                ({
                                }) => (
                                        <Form name='simpleForm'>
                                            <Col md="10 pl-0">
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
                                                    <input type="hidden" id="planningUnitId" name="planningUnitId" value={this.state.planningUnitId} />
                                                    <input type="hidden" id="programId" name="programId" value={this.state.programId} />
                                                </div>
                                            </Col>
                                        </Form>
                                    )} />
                         
                        <div className="shipmentconsumptionSearchMarginTop">
                            {this.state.showShipments == 1 && <ShipmentsInSupplyPlanComponent ref="shipmentChild" items={this.state} updateState={this.updateState} toggleLarge={this.toggleLarge} formSubmit={this.formSubmit} hideSecondComponent={this.hideSecondComponent} hideFirstComponent={this.hideFirstComponent} hideThirdComponent={this.hideThirdComponent} hideFourthComponent={this.hideFourthComponent} hideFifthComponent={this.hideFifthComponent} shipmentPage="shipmentDataEntry" />}
                            <div className="table-responsive">
                                <div id="shipmentsDetailsTable" />
                            </div>
                        </div>
                       
                    </CardBody>
                    <CardFooter>
                        <FormGroup>
                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            {this.state.shipmentChangedFlag == 1 && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipments()}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}
                            &nbsp;
                        </FormGroup>
                    </CardFooter>
                </Card>

                <Modal isOpen={this.state.batchInfo}
                    className={'modal-lg ' + this.props.className, "modalWidth"}>
                    <ModalHeader toggle={() => this.toggleLarge()} className="modalHeaderSupplyPlan">
                        <strong>{this.state.shipmentModalTitle}</strong>
                    </ModalHeader>
                    <ModalBody>
                        <h6 className="red" id="div3">{this.state.qtyCalculatorValidationError}</h6>
                        <div className="table-responsive">
                            <div id="qtyCalculatorTable"></div>
                        </div>

                        <div className="table-responsive">
                            <div id="qtyCalculatorTable1"></div>
                        </div>
                        <h6 className="red" id="div4">{this.state.shipmentDatesError}</h6>
                        <div className="table-responsive">
                            <div id="shipmentDatesTable"></div>
                        </div>
                        <h6 className="red" id="div5">{this.state.shipmentBatchInfoDuplicateError || this.state.shipmentValidationBatchError}</h6>
                        <div className="table-responsive">
                            <div id="shipmentBatchInfoTable" className="AddListbatchtrHeight"></div>
                        </div>

                    </ModalBody>
                    <ModalFooter>
                        <div id="showShipmentBatchInfoButtonsDiv" style={{ display: 'none' }}>
                            {this.state.shipmentBatchInfoChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipmentBatchInfo()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveBatchInfo')}</Button>}
                        </div>
                        <div id="showSaveShipmentsDatesButtonsDiv" style={{ display: 'none' }}>
                            {this.state.shipmentDatesChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipmentsDate()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveShipmentDates')}</Button>}
                        </div>
                        <div id="showSaveQtyButtonDiv" style={{ display: 'none' }}>
                            {this.state.shipmentQtyChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipmentQty()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveShipmentQty')}</Button>}
                        </div>
                        <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                    </ModalFooter>
                </Modal>
                {/* Shipments modal */}
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>Loading...</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
