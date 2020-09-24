import React from "react";
import ReactDOM from 'react-dom';
import {
    Card, CardBody,
    Label, Input, FormGroup,
    CardFooter, Button, Col, Form, InputGroup, Modal, ModalHeader, ModalFooter, ModalBody
} from 'reactstrap';
import { Formik } from 'formik';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME } from '../../Constants.js'
import getLabelText from '../../CommonComponent/getLabelText'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import ConsumptionInSupplyPlanComponent from "../SupplyPlan/ConsumptionInSupplyPlan";
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import AuthenticationService from "../Common/AuthenticationService.js";
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import moment from "moment"

const entityname = i18n.t('static.dashboard.consumptiondetails');

export default class ConsumptionDetails extends React.Component {

    constructor(props) {
        super(props);
        this.options = props.options;
        this.state = {
            loading: true,
            programList: [],
            programId: '',
            changedFlag: 0,
            message: '',
            lang: localStorage.getItem("lang"),
            timeout: 0,
            showConsumption: 0,
            consumptionChangedFlag: 0,
            rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 2 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
        }

        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.hideThirdComponent = this.hideThirdComponent.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this)
        this.updateState = this.updateState.bind(this);
        this.toggleLarge = this.toggleLarge.bind(this);
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
            consumptionBatchInfoChangedFlag: 0,
            consumptionBatchInfoDuplicateError: '',
            consumptionBatchInfoNoStockError: '',
            consumptionBatchError: ""
        })
        this.setState({
            consumptionBatchInfo: !this.state.consumptionBatchInfo,
        });
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
                    programList: proList, loading: false
                })

                var programIdd = this.props.match.params.programId;
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
        this.setState({
            loading: true
        })
        var programId = value != "" && value != undefined ? value.value : 0;
        document.getElementById("planningUnitId").value = 0;
        document.getElementById("planningUnit").value = "";
        document.getElementById("consumptionTableDiv").style.display = "none";
        this.setState({
            programSelect: value,
            programId: value != "" && value != undefined ? value.value : 0,
            planningUnit: "",
        })
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
                        var programId = (value != "" && value != undefined ? value.value : 0).split("_")[0];
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
                        this.setState({
                            planningUnitList: proList,
                            planningUnitListAll: myResult,
                            regionList: regionList, loading: false
                        })

                        var planningUnitIdProp = this.props.match.params.planningUnitId;
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
                planningUnitList: [],
                loading: false
            })
        }
    }

    formSubmit(value, rangeValue) {
        this.setState({ loading: true })
        let startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
        let stopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
        console.log("startDate", startDate);
        console.log("Stop Date", stopDate);
        var programId = document.getElementById('programId').value;
        this.setState({ programId: programId, planningUnitId: value != "" && value != undefined ? value.value : 0, planningUnit: value });
        var planningUnitId = value != "" && value != undefined ? value.value : 0;
        var programId = document.getElementById("programId").value;
        if (planningUnitId != 0) {
            document.getElementById("consumptionTableDiv").style.display = "block";
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
                    var batchInfoList = programJson.batchInfoList;
                    var consumptionListUnFiltered = (programJson.consumptionList);
                    var consumptionList = (programJson.consumptionList).filter(c =>
                        c.planningUnit.id == planningUnitId &&
                        c.region != null && c.region.id != 0 &&
                        moment(c.consumptionDate).format("YYYY-MM-DD") >= moment(startDate).format("YYYY-MM-DD") && moment(c.consumptionDate).format("YYYY-MM-DD") <= moment(stopDate).format("YYYY-MM-DD"));
                    this.setState({
                        batchInfoList: batchInfoList,
                        programJson: programJson,
                        consumptionListUnFiltered: consumptionListUnFiltered,
                        consumptionList: consumptionList,
                        showConsumption: 1,
                        consumptionMonth: "",
                        consumptionStartDate: "",
                        consumptionRegion: ""
                    })
                    this.refs.consumptionChild.showConsumptionData();
                }.bind(this)
            }.bind(this)
        } else {
            document.getElementById("consumptionTableDiv").style.display = "none";
            this.setState({ loading: false });
        }
    }

    updateState(parameterName, value) {
        this.setState({
            [parameterName]: value
        })

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
                <h5 id="div2" className="red">{this.state.consumptionDuplicateError || this.state.consumptionNoStockError || this.state.consumptionError}</h5>
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <CardBody className="pb-lg-5 pt-lg-2">
                        <Formik
                            render={
                                ({
                                }) => (
                                        <Form name='simpleForm'>
                                            <div className=" pl-0">
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
                                                    {/* {this.state.consumptionChangedFlag == 1 && <FormGroup check inline>
                                                        <Input className="form-check-input removeMarginLeftCheckbox" type="checkbox" id="showErrors" name="showErrors" value="true" onClick={this.refs.consumptionChild.showOnlyErrors} />
                                                        <Label className="form-check-label" check htmlFor="inline-checkbox1">{i18n.t("static.dataEntry.showOnlyErrors")}</Label>
                                                    </FormGroup>} */}
                                                    <input type="hidden" id="planningUnitId" name="planningUnitId" value={this.state.planningUnitId} />
                                                    <input type="hidden" id="programId" name="programId" value={this.state.programId} />
                                                </div>
                                            </div>
                                        </Form>
                                    )} />

                        <div className="shipmentconsumptionSearchMarginTop">
                            <ConsumptionInSupplyPlanComponent ref="consumptionChild" items={this.state} toggleLarge={this.toggleLarge} updateState={this.updateState} formSubmit={this.formSubmit} hideSecondComponent={this.hideSecondComponent} hideFirstComponent={this.hideFirstComponent} hideThirdComponent={this.hideThirdComponent} consumptionPage="consumptionDataEntry" />
                            <div className="table-responsive" id="consumptionTableDiv">
                                <div id="consumptionTable" />
                            </div>
                        </div>
                    </CardBody>
                    <CardFooter>
                        <FormGroup>
                            <FormGroup>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                {this.state.consumptionChangedFlag == 1 && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.refs.consumptionChild.saveConsumption}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}
                                &nbsp;
                                {this.refs.consumptionChild != undefined && <Button color="info" size="md" className="float-right mr-1" type="button" onClick={this.refs.consumptionChild.addRowInJexcel}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>}&nbsp;
                        </FormGroup>
                        </FormGroup>
                    </CardFooter>
                </Card>

                <Modal isOpen={this.state.consumptionBatchInfo}
                    className={'modal-lg ' + this.props.className, "modalWidth"}>
                    <ModalHeader toggle={() => this.toggleLarge()} className="modalHeaderSupplyPlan">
                        <strong>{i18n.t('static.dataEntry.batchDetails')}</strong>
                    </ModalHeader>
                    <ModalBody>
                        <h6 className="red" id="div3">{this.state.consumptionBatchInfoDuplicateError || this.state.consumptionBatchInfoNoStockError || this.state.consumptionBatchError}</h6>
                        <div className="table-responsive">
                            <div id="consumptionBatchInfoTable" className="AddListbatchtrHeight"></div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <div id="showConsumptionBatchInfoButtonsDiv" style={{ display: 'none' }}>
                            {this.state.consumptionBatchInfoChangedFlag == 1 && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.refs.consumptionChild.saveConsumptionBatchInfo}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}
                            {this.refs.consumptionChild != undefined && <Button color="info" size="md" className="float-right mr-1" type="button" onClick={this.refs.consumptionChild.addBatchRowInJexcel}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>}
                        </div>
                        <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                    </ModalFooter>
                </Modal>
                {/* Consumption modal */}
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

    _handleClickRangeBox(e) {
        console.log("Thuis.refs", this);
        this.pickRange.current.show()
    }
}
