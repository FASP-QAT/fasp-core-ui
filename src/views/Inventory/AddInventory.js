import CryptoJS from 'crypto-js';

import { Formik } from 'formik';
import React, { Component } from 'react';
import {
    Button, Card, CardBody, CardFooter, Col, Form, FormGroup,
    Label, Modal, ModalBody, ModalFooter, ModalHeader, Input
} from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME } from '../../Constants.js';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import InventoryInSupplyPlanComponent from "../SupplyPlan/InventoryInSupplyPlan";
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import AuthenticationService from '../Common/AuthenticationService';
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import moment from "moment"

const entityname = i18n.t('static.inventory.inventorydetils')
export default class AddInventory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            programList: [],
            programId: '',
            changedFlag: 0,
            message: '',
            lang: localStorage.getItem('lang'),
            timeout: 0,
            inventoryType: 1,
            showInventory: 0,
            inventoryChangedFlag: 0,
            inventoryDataType: { value: 1, label: i18n.t('static.inventory.inventory') },
            rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 2 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
        }
        this.options = props.options;
        this.formSubmit = this.formSubmit.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this)
        this.updateState = this.updateState.bind(this);
        this.toggleLarge = this.toggleLarge.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.hideThirdComponent = this.hideThirdComponent.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.pickRange = React.createRef();
    }

    show() {
    }
    handleRangeChange(value, text, listIndex) {
        //
    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value })
        this.formSubmit(this.state.planningUnit, value);
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

    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    toggleLarge() {
        this.setState({
            inventoryBatchInfoChangedFlag: 0,
            inventoryBatchInfoDuplicateError: '',
            inventoryBatchInfoNoStockError: '',
            inventoryBatchError: ""
        })
        this.setState({
            inventoryBatchInfo: !this.state.inventoryBatchInfo,
        });
    }

    componentDidMount() {
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
                    programList: proList, loading: false
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

    }

    getPlanningUnitList(value) {
        document.getElementById("planningUnitId").value = 0;
        document.getElementById("planningUnit").value = "";
        document.getElementById("adjustmentsTableDiv").style.display = "none";
        this.setState({
            programSelect: value,
            programId: value != "" && value != undefined ? value.value : 0,
            loading: true,
            planningUnit: "",
            planningUnitId: 0
        })
        var programId = value != "" && value != undefined ? value.value : 0;
        if (programId != 0) {
            var db1;
            var storeOS;
            var regionList = [];
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
                var programDataTransaction = db1.transaction(['programData'], 'readwrite');
                var programDataOs = programDataTransaction.objectStore('programData');
                var programRequest = programDataOs.get(value != "" && value != undefined ? value.value : 0);
                programRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext'),
                        color: 'red'
                    })
                    this.hideFirstComponent()
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
                            regionList: regionList,
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
                            this.formSubmit(planningUnit, this.state.rangeValue);
                        }
                    }.bind(this);
                }.bind(this)
            }.bind(this)
        } else {
            this.setState({
                loading: false,
                planningUnitList: []
            })
        }
    }

    formSubmit(value, rangeValue) {
        let startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
        let stopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
        console.log("In form submit");
        this.setState({ loading: true })
        var programId = document.getElementById('programId').value;
        this.setState({ programId: programId, planningUnitId: value != "" && value != undefined ? value.value : 0, planningUnit: value });
        var planningUnitId = value != "" && value != undefined ? value.value : 0;
        var programId = document.getElementById("programId").value;
        if (planningUnitId != 0) {
            document.getElementById("adjustmentsTableDiv").style.display = "block";
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
                    var batchList = []
                    var batchInfoList = programJson.batchInfoList;
                    console.log("Batch info list from program json", batchInfoList);
                    var inventoryListUnFiltered = (programJson.inventoryList);
                    var inventoryList = (programJson.inventoryList).filter(c =>
                        c.planningUnit.id == planningUnitId &&
                        c.region != null && c.region.id != 0);
                    if (this.state.inventoryType == 1) {
                        inventoryList = inventoryList.filter(c => c.actualQty != "" && c.actualQty != 0 && c.actualQty != null);
                    } else {
                        inventoryList = inventoryList.filter(c => c.adjustmentQty != "" && c.adjustmentQty != 0 && c.adjustmentQty != null);
                    }
                    inventoryList = inventoryList.filter(c => moment(c.inventoryDate).format("YYYY-MM-DD") >= moment(startDate).format("YYYY-MM-DD") && moment(c.inventoryDate).format("YYYY-MM-DD") <= moment(stopDate).format("YYYY-MM-DD"))
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
        } else {
            document.getElementById("adjustmentsTableDiv").style.display = "none";
            this.setState({ loading: false });
        }
    }

    updateState(parameterName, value) {
        console.log("in update state")
        this.setState({
            [parameterName]: value
        })

    }

    updateDataType(value) {
        this.setState({
            inventoryType: value != "" && value != undefined ? value.value : 0,
            inventoryDataType: value
        })
        document.getElementById("adjustmentsTableDiv").style.display = "none";
        if (this.state.planningUnit != 0 && (value != "" && value != undefined ? value.value : 0) != 0) {
            this.formSubmit(this.state.planningUnit, this.state.rangeValue);
        }
    }

    render() {
        const pickerLang = {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            from: 'From', to: 'To',
        }
        const { rangeValue } = this.state

        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} loading={(loading) => {
                    this.setState({ loading: loading })
                }} />
                <h5 className={this.state.color} id="div1">{i18n.t(this.state.message, { entityname }) || this.state.supplyPlanError}</h5>
                <h5 className="red" id="div2">{this.state.inventoryDuplicateError || this.state.inventoryNoStockError || this.state.inventoryError}</h5>
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <CardBody className="pb-lg-2 pt-lg-2" >
                        <Formik
                            render={
                                ({
                                }) => (
                                        <Form name='simpleForm'>
                                            <div className="pl-0">
                                                <div className="row">
                                                    <FormGroup className="col-md-3">
                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                                        <div className="controls edit">

                                                            <Picker
                                                                years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                                ref={this.pickRange}
                                                                value={rangeValue}
                                                                lang={pickerLang}
                                                                //theme="light"
                                                                onChange={this.handleRangeChange}
                                                                onDismiss={this.handleRangeDissmis}
                                                            >
                                                                <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                                            </Picker>
                                                        </div>

                                                    </FormGroup>
                                                    <FormGroup className="col-md-3">
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
                                                    <FormGroup className="col-md-3 ">
                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.supplyPlan.qatProduct')}</Label>
                                                        <div className="controls ">
                                                            <Select
                                                                name="planningUnit"
                                                                id="planningUnit"
                                                                bsSize="sm"
                                                                options={this.state.planningUnitList}
                                                                value={this.state.planningUnit}
                                                                onChange={(e) => { this.formSubmit(e, this.state.rangeValue); }}
                                                            />
                                                        </div>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-3 ">
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
                                                    {/* {this.state.inventoryChangedFlag == 1 && <FormGroup check inline>
                                                        <Input className="form-check-input removeMarginLeftCheckbox" type="checkbox" id="showErrors" name="showErrors" value="true" onClick={this.refs.inventoryChild.showOnlyErrors} />
                                                        <Label className="form-check-label" check htmlFor="inline-checkbox1">{i18n.t("static.dataEntry.showOnlyErrors")}</Label>
                                                    </FormGroup>} */}
                                                    <input type="hidden" id="planningUnitId" name="planningUnitId" value={this.state.planningUnitId} />
                                                    <input type="hidden" id="programId" name="programId" value={this.state.programId} />
                                                </div>
                                            </div>
                                        </Form>
                                    )} />

                        <div>
                            {this.state.showInventory == 1 && <InventoryInSupplyPlanComponent ref="inventoryChild" items={this.state} toggleLarge={this.toggleLarge} updateState={this.updateState} formSubmit={this.formSubmit} hideSecondComponent={this.hideSecondComponent} hideFirstComponent={this.hideFirstComponent} hideThirdComponent={this.hideThirdComponent} inventoryPage="inventoryDataEntry" />}
                            <div className="table-responsive" id="adjustmentsTableDiv">
                                <div id="adjustmentsTable" />
                            </div>
                        </div>
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
                        <h6 className="red" id="div3">{this.state.inventoryBatchInfoDuplicateError || this.state.inventoryBatchInfoNoStockError || this.state.inventoryBatchError}</h6>
                        <div className="table-responsive">
                            <div id="inventoryBatchInfoTable" className="AddListbatchtrHeight"></div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <div id="showInventoryBatchInfoButtonsDiv" style={{ display: 'none' }}>
                            {this.state.inventoryBatchInfoChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.inventoryChild.saveInventoryBatchInfo()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveBatchInfo')}</Button>}
                        </div>
                        <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                    </ModalFooter>
                </Modal>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>Loading...</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
            </div >
        );
    }

    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    actionCanceled() {
        this.setState({
            message: i18n.t('static.actionCancelled'),
            color: "red"
        })
        this.hideFirstComponent();
        this.toggleLarge();
    }

    _handleClickRangeBox(e) {
        console.log("Thuis.refs", this);
        this.pickRange.current.show()
    }
}

