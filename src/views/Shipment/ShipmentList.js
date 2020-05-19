import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import jexcel from 'jexcel';
// import "./style.css";
import "../../../node_modules/jexcel/dist/jexcel.css";
import * as JsStoreFunctions from "../../CommonComponent/JsStoreFunctions.js";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Col, Form, InputGroup, InputGroupAddon
    , FormFeedback, Row
} from 'reactstrap';
import { Formik } from 'formik';
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../Constants.js'
import getLabelText from '../../CommonComponent/getLabelText'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import i18n from '../../i18n';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'

// import { HashRouter, Route, Switch } from 'react-router-dom';
const entityname = i18n.t('static.shipment.shipment');
export default class LanguageListComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            // programId: '',
            programList: [],
            categoryList: [],
            productList: [],
            consumptionDataList: [],
            changedFlag: 0,
            planningUnitList: [],
            shipmentList: [],
            procurementUnitList: [],
            supplierList: [],
            allowShipmentStatusList: [],
            message: '',
            langaugeList: [],
            selSource: [],
            rangeValue: { from: { year: new Date().getFullYear(), month: new Date().getMonth() }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
        }
        this.editShipment = this.editShipment.bind(this);
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);

    }

    editShipment(jsonForShipment) {

        this.props.history.push({
            pathname: `/shipment/editShipment/${jsonForShipment.shipmentStatusId}/${jsonForShipment.programId}`,
            // state: { jsonForShipment }

        });
    }

    handleRangeChange(value, text, listIndex) {
        //
    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value })

    }

    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }

    getPlanningUnitList(event) {
        // console.log("-------------in planning list-------------")
        const lan = 'en';
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
            var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
            var planningunitRequest = planningunitOs.getAll();
            var planningList = []
            planningunitRequest.onerror = function (event) {
                // Handle errors!
            };
            planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                // console.log("myResult", myResult);
                var programId = (document.getElementById("programId").value).split("_")[0];
                // console.log('programId----->>>', programId)
                console.log(myResult);
                var proList = []
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].program.id == programId) {
                        var productJson = {
                            name: getLabelText(myResult[i].planningUnit.label, lan),
                            id: myResult[i].planningUnit.id
                        }
                        proList[i] = productJson
                    }
                }
                this.setState({
                    planningUnitList: proList
                })
            }.bind(this);
        }.bind(this)
    }

    componentDidMount() {
        document.getElementById("TableCust").style.display = "none";

        const lan = 'en';
        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var program = transaction.objectStore('programData');
            var getRequest = program.getAll();
            var proList = [];
            var shipStatusList = []
            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var programJson = {
                            name: getLabelText(JSON.parse(programNameLabel), lan) + "~v" + myResult[i].version,
                            id: myResult[i].id
                        }
                        proList[i] = programJson
                    }
                }
                this.setState({
                    programList: proList
                })


            }.bind(this);
        }.bind(this)

    }

    formSubmit = function () {
        // var tempShipmentList = [];
        // var sel = document.getElementById("planningUnitId");
        // var planningUnitText = sel.options[sel.selectedIndex].text;
        // var programIdEncrypt = document.getElementById("programId").value;
        // var programId = (document.getElementById("programId").value).split("_")[0];
        // var jsonForShipment = {
        //     qatOrderNo: 1,
        //     shipmentStatus: 'Suggested',
        //     planningUnit: planningUnitText,
        //     programIdEncrypt: programIdEncrypt,
        //     programId: programId,
        //     shipmentStatusId: 1,

        // }
        // tempShipmentList.push(jsonForShipment);

        // jsonForShipment = {
        //     qatOrderNo: 2,
        //     shipmentStatus: 'planned',
        //     planningUnit: planningUnitText,
        //     programId: programId,
        //     shipmentStatusId: 2,

        // }
        // tempShipmentList.push(jsonForShipment);

        // jsonForShipment = {
        //     qatOrderNo: 3,
        //     shipmentStatus: 'cancelled',
        //     planningUnit: planningUnitText,
        //     programId: programId,
        //     shipmentStatusId: 3,

        // }
        // tempShipmentList.push(jsonForShipment);

        // jsonForShipment = {
        //     qatOrderNo: 4,
        //     shipmentStatus: 'submitted',
        //     planningUnit: planningUnitText,
        //     programId: programId,
        //     shipmentStatusId: 4,

        // }
        // tempShipmentList.push(jsonForShipment);

        // this.setState({
        //     shipmentList: tempShipmentList
        // })
        // this.setState({
        //     selSource: tempShipmentList
        // })

        // document.getElementById("TableCust").style.display = "block";

        //Shipment Data Actual
        let programId = document.getElementById('programId').value;
        let planningUnitId = document.getElementById('planningUnitId').value;
        let filterBy = document.getElementById('filterBy').value;
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();

        this.setState({ programId: programId });
        this.setState({ planningUnitId: planningUnitId });
        this.setState({ filterBy: filterBy });
        this.setState({ startDate: startDate });
        this.setState({ endDate: endDate });

        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;

            var transaction = db1.transaction(['programData'], 'readwrite');
            var programTransaction = transaction.objectStore('programData');
            var programRequest = programTransaction.get(programId);

            programRequest.onsuccess = function (event) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);

                let shipmentListWithoutFilter = (programJson.shipmentList);

                for (var i = 0; i < shipmentListWithoutFilter.length; i++) {
                    console.log("------> ", shipmentListWithoutFilter[i]);
                }

                // const programFilterList = shipmentListWithoutFilter.filter(c => c.program.id == programId);

                const planningUnitFilterList = shipmentListWithoutFilter.filter(c => c.planningUnit.id == planningUnitId);

                let dateFilterList = '';
                if (filterBy == 1) {
                    //Order Date Filter
                    dateFilterList = planningUnitFilterList.filter(c => moment(c.orderedDate).isBetween(startDate, endDate, null, '[)'))
                } else {
                    //Expected Delivery Date
                    dateFilterList = planningUnitFilterList.filter(c => moment(c.expectedDeliveryDate).isBetween(startDate, endDate, null, '[)'))
                }

                this.setState({
                    shipmentList: dateFilterList,
                    selSource: dateFilterList
                });

                document.getElementById("TableCust").style.display = "block";

            }.bind(this);
        }.bind(this);
    }.bind(this);


    render() {

        const lan = 'en';
        const { programList } = this.state;
        let programs = programList.length > 0
            && programList.map((item, i) => {
                return (
                    //             // {this.getText(dataSource.label,lan)}
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);

        const { planningUnitList } = this.state;
        let planningUnits = planningUnitList.length > 0
            && planningUnitList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);

        const pickerLang = {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            from: 'From', to: 'To',
        }
        const { rangeValue } = this.state

        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }

        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        const columns = [{
            dataField: 'qatOrderNo',
            text: 'QAT No',
            sort: true,
            align: 'center',
            headerAlign: 'center'
        }, {
            dataField: 'shipmentStatus',
            text: 'Shipment Status',
            sort: true,
            align: 'center',
            headerAlign: 'center'
        }, {
            dataField: 'planningUnit',
            text: 'Planning Unit',
            sort: true,
            align: 'center',
            headerAlign: 'center'
        }
        ];
        const options = {
            hidePageListOnlyOnePage: true,
            firstPageText: i18n.t('static.common.first'),
            prePageText: i18n.t('static.common.back'),
            nextPageText: i18n.t('static.common.next'),
            lastPageText: i18n.t('static.common.last'),
            nextPageTitle: i18n.t('static.common.firstPage'),
            prePageTitle: i18n.t('static.common.prevPage'),
            firstPageTitle: i18n.t('static.common.nextPage'),
            lastPageTitle: i18n.t('static.common.lastPage'),
            showTotal: true,
            paginationTotalRenderer: customTotal,
            disablePageTitle: true,
            sizePerPageList: [{
                text: '10', value: 10
            }, {
                text: '30', value: 30
            }
                ,
            {
                text: '50', value: 50
            },
            {
                text: 'All', value: this.state.selSource.length
            }]
        }
        return (
            <div className="animated">
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <CardHeader className="mb-md-3 pb-lg-1">
                        <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong>{' '}
                    </CardHeader>
                    <CardBody className="pb-lg-0">

                        <Col md="12 pl-0">
                            <div className="d-md-flex">
                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">Program</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input type="select"
                                                bsSize="sm"
                                                value={this.state.programId}
                                                name="programId" id="programId"
                                                onChange={this.getPlanningUnitList}
                                            >
                                                <option value="0">Please select</option>
                                                {programs}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">Planning Unit</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="planningUnitId"
                                                id="planningUnitId"
                                                bsSize="sm"
                                                value={this.state.planningUnitId}
                                            >
                                                <option value="0">Please Select</option>
                                                {planningUnits}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">Filter By</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input type="select"
                                                bsSize="sm"
                                                value={this.state.filterBy}
                                                name="filterBy" id="filterBy"
                                            // onChange={this.displayInsertRowButton}
                                            >
                                                {/* <option value="0">Please select</option> */}
                                                <option value="1">Ordered Date</option>
                                                <option value="2">Expected Delivery Date</option>

                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">Select Period</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Picker
                                                ref="pickRange"
                                                // years={{ min: 2013 }}
                                                years={{ min: new Date().getFullYear() - 1 }, { max: new Date().getFullYear() + 1 }}
                                                value={rangeValue}
                                                lang={pickerLang}
                                                //theme="light"
                                                onChange={this.handleRangeChange}
                                                onDismiss={this.handleRangeDissmis}
                                            >
                                                <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                            </Picker>
                                            <InputGroupAddon addonType="append">
                                                <Button color="secondary Gobtn btn-sm" onClick={this.formSubmit}>{i18n.t('static.common.go')}</Button>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>
                        <ToolkitProvider
                            keyField="qatOrderNo"
                            data={this.state.selSource}
                            columns={columns}
                            search={{ searchFormatted: true }}
                            hover
                            filter={filterFactory()}

                        >
                            {
                                props => (

                                    <div className="TableCust" id="TableCust">
                                        <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
                                            <SearchBar {...props.searchProps} />
                                            <ClearSearchButton {...props.searchProps} />
                                        </div>
                                        <BootstrapTable striped hover noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                            pagination={paginationFactory(options)}
                                            rowEvents={{
                                                onClick: (e, row, rowIndex) => {
                                                    this.editShipment(row);
                                                }
                                            }}
                                            {...props.baseProps}
                                        />
                                    </div>
                                )
                            }
                        </ToolkitProvider>
                    </CardBody>
                </Card>

            </div>
        );
    }
}